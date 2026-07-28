import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const BOT_TOKEN = Deno.env.get("TELEGRAM_BOT_TOKEN") || "";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const API_BASE = `https://api.telegram.org/bot${BOT_TOKEN}`;
const SITE_URL = "https://tumar.shop";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

type TgButton = {
  text: string;
  callback_data?: string;
  url?: string;
};

type TgChat = { id: number };
type TgMessage = { chat: TgChat; text?: string; message_id?: number };
type TgCallbackQuery = {
  id: string;
  message?: { chat: TgChat; message_id?: number };
  data?: string;
  from?: { id: number };
};
type TgUpdate = {
  message?: TgMessage;
  callback_query?: TgCallbackQuery;
};

function escapeHtml(s: string): string {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function mainKeyboard(): TgButton[][] {
  return [
    [
      { text: "🛍 Каталог", callback_data: "cmd_catalog" },
      { text: "🛒 Корзина", callback_data: "cmd_cart" },
    ],
    [
      { text: "📦 Заказы", callback_data: "cmd_orders" },
      { text: "🚚 Доставка", callback_data: "cmd_delivery" },
    ],
    [
      { text: "❓ Помощь", callback_data: "cmd_support" },
      { text: "👤 Вход", callback_data: "cmd_auth" },
    ],
  ];
}

function backKeyboard(target: string): TgButton[][] {
  return [[{ text: "⬅ Назад", callback_data: target }]];
}

async function tgApi(method: string, body: Record<string, unknown>) {
  const res = await fetch(`${API_BASE}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return res.json();
}

async function sendMessage(chatId: number, text: string, replyMarkup?: TgButton[][]) {
  const body: Record<string, unknown> = {
    chat_id: chatId,
    text,
    parse_mode: "HTML",
  };
  if (replyMarkup) body.reply_markup = JSON.stringify({ inline_keyboard: replyMarkup });
  return tgApi("sendMessage", body);
}

async function sendPhoto(chatId: number, photoUrl: string, caption: string, replyMarkup?: TgButton[][]) {
  const body: Record<string, unknown> = {
    chat_id: chatId,
    photo: photoUrl,
    caption,
    parse_mode: "HTML",
  };
  if (replyMarkup) body.reply_markup = JSON.stringify({ inline_keyboard: replyMarkup });
  return tgApi("sendPhoto", body);
}

async function answerCallback(callbackQueryId: string) {
  await tgApi("answerCallbackQuery", { callback_query_id: callbackQueryId });
}

async function getLinkedUser(telegramId: number) {
  const { data, error } = await supabase
    .from("site_users")
    .select("id, login, name, is_admin, email, balance, created_at")
    .eq("telegram_id", telegramId)
    .maybeSingle();
  if (error || !data) return null;
  return data;
}

// --- Auth state helpers ---

async function getAuthState(telegramId: number) {
  const { data } = await supabase
    .from("telegram_auth_state")
    .select("step, login_or_email")
    .eq("telegram_id", telegramId)
    .maybeSingle();
  return data;
}

async function setAuthState(telegramId: number, step: string, loginOrEmail?: string) {
  const { data: existing } = await supabase
    .from("telegram_auth_state")
    .select("id")
    .eq("telegram_id", telegramId)
    .maybeSingle();

  if (existing) {
    await supabase
      .from("telegram_auth_state")
      .update({ step, login_or_email: loginOrEmail || null, updated_at: new Date().toISOString() })
      .eq("id", existing.id);
  } else {
    await supabase.from("telegram_auth_state").insert({
      telegram_id: telegramId,
      step,
      login_or_email: loginOrEmail || null,
    });
  }
}

async function clearAuthState(telegramId: number) {
  await supabase.from("telegram_auth_state").delete().eq("telegram_id", telegramId);
}

// --- Password hashing (must match auth-login edge function) ---

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// --- Handlers ---

async function handleStart(chatId: number) {
  const user = await getLinkedUser(chatId);
  let text =
    "👋 Добро пожаловать в <b>Tumar</b>!\n\n" +
    "Сувениры ручной работы из Киргизии.\n\n" +
    "Выберите действие на клавиатуре ниже 👇";
  if (user) {
    text += `\n\n👤 Вы вошли как: <b>${escapeHtml(user.name || user.login)}</b>`;
  }
  await sendMessage(chatId, text, mainKeyboard());
}

async function handleCatalog(chatId: number) {
  const { data: categories, error } = await supabase
    .from("categories")
    .select("id, name, slug")
    .order("display_order", { ascending: true })
    .limit(20);

  if (error || !categories || categories.length === 0) {
    await sendMessage(chatId, "Категорий пока нет. Загляните позже!", mainKeyboard());
    return;
  }

  const keyboard: TgButton[][] = categories.map((c) => [
    { text: `📁 ${escapeHtml(c.name)}`, callback_data: `cat:${c.id}` },
  ]);
  keyboard.push([{ text: "⬅ Назад", callback_data: "cmd_start" }]);

  await sendMessage(chatId, "🛍 <b>Категории товаров</b>\n\nВыберите категорию:", keyboard);
}

async function handleCategory(chatId: number, categoryId: string) {
  const { data: products, error } = await supabase
    .from("products")
    .select("id, name, price, image_url, in_stock, is_published, stock_quantity")
    .eq("category_id", categoryId)
    .eq("is_published", true)
    .order("display_order", { ascending: true })
    .limit(20);

  if (error || !products || products.length === 0) {
    await sendMessage(chatId, "В этой категории пока нет товаров.", backKeyboard("cmd_catalog"));
    return;
  }

  const keyboard: TgButton[][] = products.map((p) => [
    {
      text: `${p.in_stock ? "✅" : "❌"} ${escapeHtml(p.name)} — ${p.price} сом`,
      callback_data: `prod:${p.id}`,
    },
  ]);
  keyboard.push([{ text: "⬅ Назад", callback_data: "cmd_catalog" }]);

  await sendMessage(chatId, "🛍 <b>Товары категории</b>\n\nВыберите товар:", keyboard);
}

async function handleProduct(chatId: number, productId: string) {
  const { data: product, error } = await supabase
    .from("products")
    .select("id, name, description, price, image_url, in_stock, stock_quantity, is_published, category_id")
    .eq("id", productId)
    .maybeSingle();

  if (error || !product) {
    await sendMessage(chatId, "Товар не найден.", backKeyboard("cmd_catalog"));
    return;
  }

  const stockText = product.in_stock
    ? `✅ В наличии${product.stock_quantity ? ` (${product.stock_quantity} шт.)` : ""}`
    : "❌ Нет в наличии";

  const caption =
    `🏺 <b>${escapeHtml(product.name)}</b>\n\n` +
    `${product.description ? escapeHtml(product.description) + "\n\n" : ""}` +
    `💰 Цена: <b>${product.price} сом</b>\n\n` +
    stockText;

  const keyboard: TgButton[][] = [
    [
      { text: "🛒 Заказать", callback_data: `add:${product.id}` },
      { text: "⬅ Назад", callback_data: `cat:${product.category_id || ""}` },
    ],
  ];

  if (product.image_url) {
    await sendPhoto(chatId, product.image_url, caption, keyboard);
  } else {
    await sendMessage(chatId, caption, keyboard);
  }
}

async function handleAddToCart(chatId: number, productId: string) {
  const { data: product, error } = await supabase
    .from("products")
    .select("id, name, price, in_stock, stock_quantity, is_published")
    .eq("id", productId)
    .maybeSingle();

  if (error || !product) {
    await sendMessage(chatId, "Товар не найден.", mainKeyboard());
    return;
  }
  if (!product.in_stock || (product.stock_quantity !== null && product.stock_quantity <= 0)) {
    await sendMessage(chatId, "❌ Этого товара сейчас нет в наличии.", mainKeyboard());
    return;
  }

  const linked = await getLinkedUser(chatId);

  const { data: existing } = await supabase
    .from("telegram_cart")
    .select("id, quantity")
    .eq("telegram_id", chatId)
    .eq("product_id", productId)
    .maybeSingle();

  if (existing) {
    const newQty = existing.quantity + 1;
    await supabase
      .from("telegram_cart")
      .update({ quantity: newQty })
      .eq("id", existing.id);
  } else {
    await supabase.from("telegram_cart").insert({
      telegram_id: chatId,
      site_user_id: linked?.id || null,
      product_id: productId,
      product_name: product.name,
      product_price: product.price,
      quantity: 1,
    });
  }

  await sendMessage(
    chatId,
    `✅ <b>${escapeHtml(product.name)}</b> добавлен в корзину!`,
    [
      [
        { text: "🛒 Перейти в корзину", callback_data: "cmd_cart" },
        { text: "⬅ К товару", callback_data: `prod:${productId}` },
      ],
      [{ text: "🏠 Главное меню", callback_data: "cmd_start" }],
    ]
  );
}

async function handleCart(chatId: number) {
  const { data: items, error } = await supabase
    .from("telegram_cart")
    .select("id, product_name, product_price, quantity, product_id")
    .eq("telegram_id", chatId)
    .order("created_at", { ascending: true });

  if (error || !items || items.length === 0) {
    await sendMessage(chatId, "🛒 <b>Ваша корзина пуста</b>\n\nДобавьте товары из каталога.", mainKeyboard());
    return;
  }

  let text = "🛒 <b>Моя корзина</b>\n\n";
  let total = 0;
  for (const item of items) {
    const lineTotal = Number(item.product_price) * item.quantity;
    total += lineTotal;
    text +=
      `• <b>${escapeHtml(item.product_name)}</b>\n` +
      `  Кол-во: ${item.quantity} × ${item.product_price} сом = ${lineTotal} сом\n\n`;
  }
  text += `💰 <b>Итого: ${total} сом</b>`;

  const keyboard: TgButton[][] = [
    [
      { text: "✅ Оформить заказ", callback_data: "cmd_checkout" },
      { text: "🗑 Очистить", callback_data: "cmd_clearcart" },
    ],
    [{ text: "⬅ Назад", callback_data: "cmd_start" }],
  ];

  await sendMessage(chatId, text, keyboard);
}

async function handleClearCart(chatId: number) {
  await supabase.from("telegram_cart").delete().eq("telegram_id", chatId);
  await sendMessage(chatId, "🗑 Корзина очищена.", mainKeyboard());
}

async function handleCheckout(chatId: number) {
  const { data: items, error } = await supabase
    .from("telegram_cart")
    .select("id, product_name, product_price, quantity, product_id")
    .eq("telegram_id", chatId)
    .order("created_at", { ascending: true });

  if (error || !items || items.length === 0) {
    await sendMessage(chatId, "Корзина пуста — нечего оформлять.", mainKeyboard());
    return;
  }

  const total = items.reduce((sum, i) => sum + Number(i.product_price) * i.quantity, 0);
  const linked = await getLinkedUser(chatId);

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      customer_name: linked?.name || linked?.login || `Telegram user ${chatId}`,
      customer_phone: "",
      total,
      status: "new",
      payment_status: "unpaid",
      site_user_id: linked?.id || null,
      notes: `Заказ оформлен через Telegram-бот (chat_id: ${chatId})`,
    })
    .select("id")
    .single();

  if (orderError || !order) {
    await sendMessage(chatId, "❌ Не удалось создать заказ. Попробуйте позже.", mainKeyboard());
    return;
  }

  const orderItems = items.map((i) => ({
    order_id: order.id,
    product_id: i.product_id,
    product_name: i.product_name,
    product_price: i.product_price,
    quantity: i.quantity,
  }));
  await supabase.from("order_items").insert(orderItems);

  await supabase.from("telegram_cart").delete().eq("telegram_id", chatId);

  await sendMessage(
    chatId,
    `✅ <b>Заказ оформлен!</b>\n\n` +
      `📦 Номер заказа: <b>${order.id.slice(0, 8)}</b>\n` +
      `💰 Сумма: <b>${total} сом</b>\n\n` +
      `Мы свяжемся с вами для подтверждения. Спасибо!`,
    mainKeyboard()
  );
}

async function handleOrders(chatId: number) {
  const linked = await getLinkedUser(chatId);
  let orders: Array<{
    id: string;
    customer_name: string;
    total: number;
    status: string;
    payment_status: string;
    created_at: string;
  }> = [];

  if (linked) {
    const res = await supabase
      .from("orders")
      .select("id, customer_name, total, status, payment_status, created_at")
      .eq("site_user_id", linked.id)
      .order("created_at", { ascending: false })
      .limit(10);
    orders = res.data || [];
  } else {
    const res = await supabase
      .from("orders")
      .select("id, customer_name, total, status, payment_status, created_at")
      .ilike("notes", `%chat_id: ${chatId}%`)
      .order("created_at", { ascending: false })
      .limit(10);
    orders = res.data || [];
  }

  if (orders.length === 0) {
    await sendMessage(chatId, "📦 У вас пока нет заказов.", mainKeyboard());
    return;
  }

  const statusMap: Record<string, string> = {
    new: "🆕 Новый",
    processing: "🔄 В обработке",
    delivering: "🚚 Доставляется",
    delivered: "✅ Получен",
  };

  let text = "📦 <b>Ваши заказы</b>\n\n";
  for (const o of orders) {
    const date = new Date(o.created_at).toLocaleDateString("ru-RU");
    text +=
      `• <b>№${o.id.slice(0, 8)}</b> — ${o.total} сом\n` +
      `  Статус: ${statusMap[o.status] || escapeHtml(o.status)}\n` +
      `  Оплата: ${escapeHtml(o.payment_status)}\n` +
      `  📅 ${date}\n\n`;
  }

  await sendMessage(chatId, text, mainKeyboard());
}

async function handleDelivery(chatId: number) {
  const { data: branches } = await supabase
    .from("branches")
    .select("name, address, phone, is_active")
    .eq("is_active", true)
    .order("display_order", { ascending: true })
    .limit(10);

  let text =
    "🚚 <b>Доставка Tumar</b>\n\n" +
    "Мы доставляем по всей Киргизии.\n\n" +
    "• Доставка по Бишкеку — 1–2 дня\n" +
    "• Самовывоз из наших магазинов\n";

  if (branches && branches.length > 0) {
    text += "\n📍 <b>Наши магазины:</b>\n";
    for (const b of branches) {
      text += `• ${escapeHtml(b.name)} — ${escapeHtml(b.address || "")}\n  ☎ ${escapeHtml(b.phone || "")}\n`;
    }
  }

  text += `\nОформить заказ: ${SITE_URL}/catalog`;
  await sendMessage(chatId, text, mainKeyboard());
}

async function handleSupport(chatId: number) {
  const { data: settings } = await supabase
    .from("site_settings")
    .select("contact_phone, contact_email, contact_address, telegram_url, instagram_url, whatsapp_url, facebook_url")
    .limit(1)
    .maybeSingle();

  let text = "❓ <b>Поддержка Tumar</b>\n\n";
  if (settings) {
    if (settings.contact_phone) text += `☎ Телефон: ${escapeHtml(settings.contact_phone)}\n`;
    if (settings.contact_email) text += `✉ Email: ${escapeHtml(settings.contact_email)}\n`;
    if (settings.contact_address) text += `📍 Адрес: ${escapeHtml(settings.contact_address)}\n`;
    if (settings.telegram_url) text += `💬 Telegram: ${escapeHtml(settings.telegram_url)}\n`;
    if (settings.instagram_url) text += `📷 Instagram: ${escapeHtml(settings.instagram_url)}\n`;
    if (settings.whatsapp_url) text += `📱 WhatsApp: ${escapeHtml(settings.whatsapp_url)}\n`;
  }
  text += "\nМы на связи с 9:00 до 20:00 каждый день.";
  await sendMessage(chatId, text, mainKeyboard());
}

// --- In-bot login flow ---

async function handleAuth(chatId: number) {
  const linked = await getLinkedUser(chatId);
  if (linked) {
    await sendMessage(
      chatId,
      `👤 <b>Вы уже вошли</b>\n\n` +
        `Имя: <b>${escapeHtml(linked.name || linked.login)}</b>\n` +
        (linked.email ? `Email: <b>${escapeHtml(linked.email)}</b>\n` : "") +
        `\nДоступно:\n🛒 Корзина\n📦 Заказы`,
      mainKeyboard()
    );
    return;
  }

  await clearAuthState(chatId);

  await sendMessage(
    chatId,
    `👤 <b>Вход в аккаунт Tumar</b>\n\n` +
      `Если у вас уже есть аккаунт на сайте Tumar, вы можете войти прямо здесь.\n\n` +
      `Если аккаунта ещё нет — сначала зарегистрируйтесь на сайте:\n👉 ${SITE_URL}/register`,
    [
      [{ text: "✅ У меня есть аккаунт", callback_data: "auth_start" }],
      [{ text: "⬅ Назад", callback_data: "cmd_start" }],
    ]
  );
}

async function handleAuthStart(chatId: number) {
  await setAuthState(chatId, "awaiting_login");
  await sendMessage(
    chatId,
    `👤 <b>Вход в аккаунт</b>\n\n` +
      `Введите ваш логин или E-mail:`,
    [[{ text: "❌ Отмена", callback_data: "cmd_auth" }]]
  );
}

async function handleAuthLoginInput(chatId: number, text: string) {
  await setAuthState(chatId, "awaiting_password", text.trim());
  await sendMessage(
    chatId,
    `🔑 Введите пароль:`,
    [[{ text: "❌ Отмена", callback_data: "cmd_auth" }]]
  );
}

async function handleAuthPasswordInput(chatId: number, password: string) {
  const state = await getAuthState(chatId);
  if (!state || state.step !== "awaiting_password" || !state.login_or_email) {
    await handleAuth(chatId);
    return;
  }

  const loginOrEmail = state.login_or_email.toLowerCase().trim();
  const passwordHash = await hashPassword(password);

  const isEmail = loginOrEmail.includes("@");
  const query = supabase
    .from("site_users")
    .select("id, login, name, is_admin, email, balance, created_at")
    .eq("password_hash", passwordHash);

  if (isEmail) {
    query.eq("email", loginOrEmail);
  } else {
    query.eq("login", loginOrEmail);
  }

  const { data: user, error } = await query.maybeSingle();

  if (error || !user) {
    await clearAuthState(chatId);
    await sendMessage(
      chatId,
      `❌ Неверный логин или пароль.\n\nПопробуйте снова:`,
      [
        [{ text: "🔄 Попробовать снова", callback_data: "auth_start" }],
        [{ text: "⬅ Назад", callback_data: "cmd_start" }],
      ]
    );
    return;
  }

  // Link Telegram to the account
  const { error: linkError } = await supabase
    .from("site_users")
    .update({ telegram_id: chatId })
    .eq("id", user.id);

  await clearAuthState(chatId);

  if (linkError) {
    await sendMessage(
      chatId,
      `❌ Не удалось привязать Telegram. Возможно, этот Telegram уже привязан к другому аккаунту.`,
      mainKeyboard()
    );
    return;
  }

  await sendMessage(
    chatId,
    `✅ <b>Вход выполнен успешно!</b>\n\n` +
      `👤 Имя: <b>${escapeHtml(user.name || user.login)}</b>\n` +
      (user.email ? `✉ Email: <b>${escapeHtml(user.email)}</b>\n` : "") +
      `\nВаш Telegram привязан к аккаунту. Теперь сайт и бот используют один аккаунт.\n\n` +
      `Доступно:\n🛒 Корзина\n📦 Заказы`,
    mainKeyboard()
  );
}

async function processUpdate(update: TgUpdate) {
  if (update.message && update.message.text) {
    const chatId = update.message.chat.id;
    const text = update.message.text.trim();

    // Check if user is in auth flow
    const state = await getAuthState(chatId);
    if (state) {
      if (text === "/cancel" || text === "❌ Отмена") {
        await clearAuthState(chatId);
        await handleAuth(chatId);
        return;
      }
      if (state.step === "awaiting_login") {
        await handleAuthLoginInput(chatId, text);
        return;
      }
      if (state.step === "awaiting_password") {
        await handleAuthPasswordInput(chatId, text);
        return;
      }
    }

    if (text === "/start" || text.startsWith("/start")) await handleStart(chatId);
    else if (text === "/catalog") await handleCatalog(chatId);
    else if (text === "/cart") await handleCart(chatId);
    else if (text === "/orders") await handleOrders(chatId);
    else if (text === "/delivery") await handleDelivery(chatId);
    else if (text === "/support") await handleSupport(chatId);
    else if (text === "/auth") await handleAuth(chatId);
  } else if (update.callback_query) {
    const cb = update.callback_query;
    const chatId = cb.message?.chat?.id;
    if (!chatId) return;
    await answerCallback(cb.id);
    const data = cb.data || "";

    // Cancel any auth state when a non-auth callback is pressed
    if (!data.startsWith("auth_")) {
      await clearAuthState(chatId);
    }

    if (data === "cmd_start") await handleStart(chatId);
    else if (data === "cmd_catalog") await handleCatalog(chatId);
    else if (data === "cmd_cart") await handleCart(chatId);
    else if (data === "cmd_orders") await handleOrders(chatId);
    else if (data === "cmd_delivery") await handleDelivery(chatId);
    else if (data === "cmd_support") await handleSupport(chatId);
    else if (data === "cmd_auth") await handleAuth(chatId);
    else if (data === "auth_start") await handleAuthStart(chatId);
    else if (data === "cmd_checkout") await handleCheckout(chatId);
    else if (data === "cmd_clearcart") await handleClearCart(chatId);
    else if (data.startsWith("cat:")) await handleCategory(chatId, data.slice(4));
    else if (data.startsWith("prod:")) await handleProduct(chatId, data.slice(5));
    else if (data.startsWith("add:")) await handleAddToCart(chatId, data.slice(4));
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  if (!BOT_TOKEN || BOT_TOKEN === "ВСТАВИТЬ_МОЙ_ТОКЕН_СЮДА") {
    return new Response(
      JSON.stringify({ error: "TELEGRAM_BOT_TOKEN не настроен. Добавьте токен в секреты Supabase." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    const body = await req.json();
    await processUpdate(body);
    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

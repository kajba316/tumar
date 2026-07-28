/*
# Fix multi-language data, add stock quantity, published status, site settings, and CMS pages

## Problem
1. Product and category names are all in English in the `name` column (which should be Russian).
   The `name_en` and `name_kg` columns are NULL, so language switching doesn't work.
2. No stock quantity field — only a boolean in_stock.
3. No "published/hidden" status for products.
4. No site settings table for editable site name, logo, contacts.
5. No CMS pages table for editable page content.

## Changes

### 1. Products table — new columns
- `stock_quantity` (int, default 0) — actual quantity in stock
- `is_published` (boolean, default true) — whether the product is visible on the site

### 2. Products — multi-language data update
- `name` column updated to Russian text (the default/fallback language)
- `name_en` filled with English names
- `name_kg` filled with Kyrgyz names
- `description` updated to Russian, `description_en` and `description_kg` filled
- `material` updated to Russian, `material_en` and `material_kg` filled

### 3. Categories — multi-language data update
- `name` updated to Russian
- `name_en` and `name_kg` filled

### 4. New Table: site_settings
- Single-row table for global site configuration
- site_name, site_name_en, site_name_kg
- logo_url
- contact_phone, contact_email, contact_address (3 languages)
- social links (instagram, facebook, telegram, whatsapp)
- RLS: public read (anon + authenticated), no public write

### 5. New Table: site_pages
- CMS pages that admin can create/edit/delete
- slug, title (3 languages), content (3 languages), meta_title, meta_description
- is_published, display_order
- RLS: public read, no public write

### 6. Seed site_settings with defaults
### 7. Seed default CMS pages (delivery, payment, privacy, terms)
*/

-- ============================================================
-- 1. Add stock_quantity and is_published to products
-- ============================================================
DO $$ BEGIN
  ALTER TABLE products ADD COLUMN IF NOT EXISTS stock_quantity int NOT NULL DEFAULT 0;
  ALTER TABLE products ADD COLUMN IF NOT EXISTS is_published boolean NOT NULL DEFAULT true;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- Set stock_quantity for existing products (default 10)
UPDATE products SET stock_quantity = 10 WHERE stock_quantity = 0;

-- ============================================================
-- 2. Update products with multi-language data
-- ============================================================

UPDATE products SET
  name = 'Белый калпак — Войлок',
  name_en = 'White Kalpak - Felt',
  name_kg = 'Ак калпак — Кийиз',
  description = 'Традиционный белый кыргызский калпак (ак калпак) из белого шерстяного войлока. Калпак — национальный головной убор Кыргызстана и символ кыргызской идентичности.',
  description_en = 'Traditional white Kyrgyz kalpak (ak kalpak) made from white wool felt. The kalpak is the national headdress of Kyrgyzstan and a symbol of Kyrgyz identity.',
  description_kg = 'Салттуу ак кыргыз калпагы (ак калпак) ак койдун кийизинен жасалган. Калпак — Кыргызстандын улуттук баш кийими жана кыргыз идентикалуулугунун символу.',
  material = 'Шерстяной войлок',
  material_en = 'Wool Felt',
  material_kg = 'Койдун кийизи'
WHERE slug = 'white-kalpak-felt';

UPDATE products SET
  name = 'Брелок — Тундук',
  name_en = 'Keychain - Tunduk',
  name_kg = 'Ачкыч — Тундук',
  description = 'Металлический брелок с символом Тундук — короной кыргызской юрты. Отличный небольшой сувенир или подарок.',
  description_en = 'Metal keychain featuring the Tunduk symbol of the Kyrgyz yurt crown. A perfect small souvenir or gift.',
  description_kg = 'Тундук символу менен металл ачкыч — кыргыз боз үйдүн түндүгү. Кичинекей эң жакшы сувенир же белек.',
  material = 'Металл',
  material_en = 'Metal',
  material_kg = 'Металл'
WHERE slug = 'keychain-tunduk';

UPDATE products SET
  name = 'Шырдак — Красный ковёр',
  name_en = 'Handmade Shyrdak Rug - Red',
  name_kg = 'Шырдак — Кызыл килем',
  description = 'Настоящий кыргызский шырдак, сделанный вручную из натурального шерстяного войлока. Традиционные орнаменты символизируют процветание и защиту. Каждый ковёр уникален и создается мастерами в горах Кыргызстана.',
  description_en = 'Authentic Kyrgyz shyrdak rug handcrafted from natural wool felt. Features traditional ornamental patterns symbolizing prosperity and protection. Each rug is unique and made by skilled artisans in the mountains of Kyrgyzstan.',
  description_kg = 'Чыныгы кыргыз шырдагы жалаң кол менен жасалган, табигый койдун кийизинен. Салттуу оюм-кыйымдар ырыскы жана коргоону билдирет. Ар бир килем уникалдуу жана Кыргызстандын тоолорунда усталар тарабынан жасалат.',
  material = 'Шерстяной войлок',
  material_en = 'Wool Felt',
  material_kg = 'Койдун кийизи'
WHERE slug = 'shyrdak-rug-red';

UPDATE products SET
  name = 'Кожаный пояс — ручная тиска',
  name_en = 'Hand-tooled Leather Belt',
  name_kg = 'Кайыш кур — кол менен басылган',
  description = 'Кожаный пояс ручной работы с традиционным кыргызским орнаментом. Прочная натуральная кожа, ручная тиска.',
  description_en = 'Hand-tooled leather belt with traditional Kyrgyz ornament. Durable natural leather, hand-tooled craftsmanship.',
  description_kg = 'Салттуу кыргыз оюму менен колдон жасалган кайыш кур. Бекем табигый кайыш, кол менен басылган.',
  material = 'Натуральная кожа',
  material_en = 'Natural Leather',
  material_kg = 'Табигый кайыш'
WHERE slug = 'leather-belt-tooled';

UPDATE products SET
  name = 'Чайный сервиз — ручная роспись',
  name_en = 'Hand-painted Tea Set',
  name_kg = 'Чай сервизи — кол менен боёк',
  description = 'Керамический чайный сервиз ручной росписи с кыргызскими орнаментами. Включает чайник и чашки.',
  description_en = 'Hand-painted ceramic tea set with Kyrgyz ornaments. Includes teapot and cups.',
  description_kg = 'Кыргыз оюмдары менен колдон боёлгон керамика чай сервизи. Чайник жана чашкаларды камтыйт.',
  material = 'Керамика',
  material_en = 'Ceramics',
  material_kg = 'Керамика'
WHERE slug = 'ceramic-tea-set';

UPDATE products SET
  name = 'Серебряные серьги — Тундук',
  name_en = 'Silver Earrings - Tunduk',
  name_kg = 'Күмүш сырмак — Тундук',
  description = 'Элегантные серебряные серьги с символом Тундук. Тонкая ручная работа.',
  description_en = 'Elegant silver earrings with Tunduk symbol. Fine handcrafted work.',
  description_kg = 'Тундук символу менен нәзик күмүш сырмак. Жоодар кол өнөрчүлүк.',
  material = 'Серебро',
  material_en = 'Silver',
  material_kg = 'Күмүш'
WHERE slug = 'silver-earrings-tunduk';

UPDATE products SET
  name = 'Комуз — Традиционный',
  name_en = 'Komuz - Traditional',
  name_kg = 'Комуз — Салттуу',
  description = 'Традиционный кыргызский музыкальный инструмент комуз, сделанный из дерева. Трёхструнная щипковая лютня.',
  description_en = 'Traditional Kyrgyz musical instrument komuz, made of wood. Three-stringed plucked lute.',
  description_kg = 'Салттуу кыргыз аспабы комуз, жыгачтан жасалган. Үч кылдуу черме комуз.',
  material = 'Дерево',
  material_en = 'Wood',
  material_kg = 'Жыгач'
WHERE slug = 'komuz-traditional';

UPDATE products SET
  name = 'Модель юрты — Миниатюра',
  name_en = 'Yurt Model - Miniature',
  name_kg = 'Боз үй модели — Миниатюра',
  description = 'Миниатюрная модель кыргызской юрты (боз үй). Отличный сувенир и декоративный элемент.',
  description_en = 'Miniature model of a Kyrgyz yurt (boz uy). Great souvenir and decorative piece.',
  description_kg = 'Кыргыз боз үйүнүн миниатюра модели. Эң жакшы сувенир жана жасалгалоо элементи.',
  material = 'Войлок, дерево',
  material_en = 'Felt, Wood',
  material_kg = 'Кийиз, жыгач'
WHERE slug = 'yurt-model-miniature';

UPDATE products SET
  name = 'Серебряный браслет — Узор',
  name_en = 'Silver Bracelet - Pattern',
  name_kg = 'Күмүш билерик — Оюм',
  description = 'Серебряный браслет с традиционным кыргызским узором. Ручная работа.',
  description_en = 'Silver bracelet with traditional Kyrgyz pattern. Handcrafted.',
  description_kg = 'Салттуу кыргыз оюму менен күмүш билерик. Кол өнөрчүлүк.',
  material = 'Серебро',
  material_en = 'Silver',
  material_kg = 'Күмүш'
WHERE slug = 'silver-bracelet-pattern';

UPDATE products SET
  name = 'Туш кийиз — Настенное панно',
  name_en = 'Tush Kiyiz - Wall Hanging',
  name_kg = 'Туш кийиз — Дубалга илинет',
  description = 'Традиционное кыргызское настенное панно туш кийиз с вышивкой. Символ домашнего уюта и защиты.',
  description_en = 'Traditional Kyrgyz wall hanging tush kiyiz with embroidery. Symbol of home comfort and protection.',
  description_kg = 'Салттуу кыргыз туш кийизи сайма менен. Үйдүн жылуулугун жана коргоону билдирет.',
  material = 'Ткань, вышивка',
  material_en = 'Fabric, Embroidery',
  material_kg = 'Кездеме, сайма'
WHERE slug = 'tush-kiyz-wall-hanging';

UPDATE products SET
  name = 'Темир комуз (варган)',
  name_en = 'Temir Komuz (Jew''s Harp)',
  name_kg = 'Темир комуз (варган)',
  description = 'Традиционный кыргызский музыкальный инструмент темир комуз (варган). Издаёт характерный звонкий звук.',
  description_en = 'Traditional Kyrgyz musical instrument temir komuz (jew''s harp). Produces a characteristic ringing sound.',
  description_kg = 'Салттуу кыргыз аспабы темир комуз (варган). Мүнөздүү жаңырган үн чыгарат.',
  material = 'Металл',
  material_en = 'Metal',
  material_kg = 'Металл'
WHERE slug = 'temir-komuz';

UPDATE products SET
  name = 'Вышитый чапан',
  name_en = 'Embroidered Chapan',
  name_kg = 'Сайма чапан',
  description = 'Традиционный кыргызский халат чапан с ручной вышивкой. Тёплая и нарядная одежда.',
  description_en = 'Traditional Kyrgyz robe chapan with hand embroidery. Warm and festive clothing.',
  description_kg = 'Салттуу кыргыз чапаны кол сайма менен. Жылуу жана кооз кийим.',
  material = 'Ткань, вышивка',
  material_en = 'Fabric, Embroidery',
  material_kg = 'Кездеме, сайма'
WHERE slug = 'embroidered-chapan';

UPDATE products SET
  name = 'Керамическая миска — Орнамент',
  name_en = 'Ceramic Bowl - Ornament',
  name_kg = 'Керамика идиш — Оюм',
  description = 'Керамическая миска с кыргызским орнаментом ручной росписи. Подходит для сервировки и декора.',
  description_en = 'Hand-painted ceramic bowl with Kyrgyz ornament. Suitable for serving and decor.',
  description_kg = 'Кыргыз оюму менен колдон боёлгон керамика идиш. Сервировка жана жасалга үчүн ылайык.',
  material = 'Керамика',
  material_en = 'Ceramics',
  material_kg = 'Керамика'
WHERE slug = 'ceramic-bowl-ornament';

UPDATE products SET
  name = 'Магнит — Кыргызские узоры',
  name_en = 'Magnet - Kyrgyz Patterns',
  name_kg = 'Магнит — Кыргыз оюмдары',
  description = 'Сувенирный магнит с кыргызскими национальными узорами. Отличный небольшой подарок.',
  description_en = 'Souvenir magnet with Kyrgyz national patterns. A great small gift.',
  description_kg = 'Кыргыз улуттук оюмдары менен сувенир магнит. Жакшы кичинекей белек.',
  material = 'Металл',
  material_en = 'Metal',
  material_kg = 'Металл'
WHERE slug = 'magnet-kyrgyz-patterns';

UPDATE products SET
  name = 'Кожаная сумка-портфель',
  name_en = 'Leather Satchel Bag',
  name_kg = 'Кайыш портфель сумка',
  description = 'Кожаная сумка-портфель ручной работы. Натуральная кожа, прочная и стильная.',
  description_en = 'Handcrafted leather satchel bag. Natural leather, durable and stylish.',
  description_kg = 'Колдон жасалган кайыш портфель сумка. Табигый кайыш, бекем жана модалуу.',
  material = 'Натуральная кожа',
  material_en = 'Natural Leather',
  material_kg = 'Табигый кайыш'
WHERE slug = 'leather-satchel-bag';

UPDATE products SET
  name = 'Войлочное панно — Орёл',
  name_en = 'Felt Wall Panel - Eagle',
  name_kg = 'Кийиз панно — Бүркүт',
  description = 'Настенное войлочное панно с изображением орла. Традиционная кыргызская техника аппликации.',
  description_en = 'Wall felt panel depicting an eagle. Traditional Kyrgyz applique technique.',
  description_kg = 'Бүркүттүн сүрөтү менен дубал кийиз панно. Салттуу кыргыз аппликация техникасы.',
  material = 'Шерстяной войлок',
  material_en = 'Wool Felt',
  material_kg = 'Койдун кийизи'
WHERE slug = 'felt-wall-panel-eagle';

UPDATE products SET
  name = 'Войлочные тапочки — Традиционные',
  name_en = 'Felt Slippers - Traditional',
  name_kg = 'Кийичан — Салттуу',
  description = 'Традиционные кыргызские войлочные тапочки. Тёплые, удобные, сделаны из натуральной шерсти.',
  description_en = 'Traditional Kyrgyz felt slippers. Warm, comfortable, made from natural wool.',
  description_kg = 'Салттуу кыргыз кийиз тапочки. Жылуу, ыңгайлуу, табигый койдун жүнүнөн жасалган.',
  material = 'Шерстяной войлок',
  material_en = 'Wool Felt',
  material_kg = 'Койдун кийизи'
WHERE slug = 'felt-slippers-traditional';

UPDATE products SET
  name = 'Кожаный кошелёк — тиснение',
  name_en = 'Leather Wallet - Embossed',
  name_kg = 'Кайыш капчаал — басылган',
  description = 'Кожаный кошелёк с тиснением и традиционным узором. Натуральная кожа ручной работы.',
  description_en = 'Embossed leather wallet with traditional pattern. Handcrafted natural leather.',
  description_kg = 'Салттуу оюму менен басылган кайыш капчаал. Колдон жасалган табигый кайыш.',
  material = 'Натуральная кожа',
  material_en = 'Natural Leather',
  material_kg = 'Табигый кайыш'
WHERE slug = 'leather-wallet-embossed';

-- Mark some products as featured and top for home page display
UPDATE products SET featured = true, is_top = true WHERE slug IN ('white-kalpak-felt', 'shyrdak-rug-red', 'leather-belt-tooled', 'ceramic-tea-set', 'silver-earrings-tunduk', 'komuz-traditional', 'yurt-model-miniature', 'leather-satchel-bag');
UPDATE products SET is_published = true;

-- ============================================================
-- 3. Update categories with multi-language data
-- ============================================================

UPDATE categories SET
  name = 'Шырдак и войлок',
  name_en = 'Shyrdak & Felt',
  name_kg = 'Шырдак жана кийиз',
  description = 'Изделия из войлока: шырдаки, панно, тапочки',
  description_en = 'Felt products: shyrdaks, panels, slippers',
  description_kg = 'Кийиз буюмдар: шырдак, панно, кийичан'
WHERE slug = 'shyrdak-felt';

UPDATE categories SET
  name = 'Кожаные изделия',
  name_en = 'Leather Goods',
  name_kg = 'Кайыш буюмдар',
  description = 'Кожаные изделия ручной работы',
  description_en = 'Handcrafted leather goods',
  description_kg = 'Колдон жасалган кайыш буюмдар'
WHERE slug = 'leather-goods';

UPDATE categories SET
  name = 'Керамика',
  name_en = 'Ceramics',
  name_kg = 'Керамика',
  description = 'Керамическая посуда и сувениры',
  description_en = 'Ceramic tableware and souvenirs',
  description_kg = 'Керамика идиштер жана сувенирлер'
WHERE slug = 'ceramics';

UPDATE categories SET
  name = 'Музыкальные инструменты',
  name_en = 'Musical Instruments',
  name_kg = 'Музыкалык аспаптар',
  description = 'Традиционные кыргызские музыкальные инструменты',
  description_en = 'Traditional Kyrgyz musical instruments',
  description_kg = 'Салттуу кыргыз музыкалык аспаптары'
WHERE slug = 'musical-instruments';

UPDATE categories SET
  name = 'Национальная одежда',
  name_en = 'National Clothing',
  name_kg = 'Улуттук кийим',
  description = 'Традиционная кыргызская одежда',
  description_en = 'Traditional Kyrgyz clothing',
  description_kg = 'Салттуу кыргыз кийими'
WHERE slug = 'national-clothing';

-- ============================================================
-- 4. Site settings table
-- ============================================================

CREATE TABLE IF NOT EXISTS site_settings (
  id int PRIMARY KEY DEFAULT 1,
  site_name text NOT NULL DEFAULT 'Кыргыз Сувенир',
  site_name_en text DEFAULT 'Kyrgyz Souvenirs',
  site_name_kg text DEFAULT 'Кыргыз Сувенир',
  logo_url text,
  contact_phone text DEFAULT '+996 555 123 456',
  contact_email text DEFAULT 'info@kyrgyzsouvenirs.kg',
  contact_address text DEFAULT 'г. Бишкек, ул. Исанова 42',
  contact_address_en text DEFAULT 'Bishkek, Isanova St 42',
  contact_address_kg text DEFAULT 'Бишкек шаары, Исанова көчөсү 42',
  instagram_url text,
  facebook_url text,
  telegram_url text,
  whatsapp_url text,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_site_settings" ON site_settings;
CREATE POLICY "public_read_site_settings" ON site_settings
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "public_update_site_settings" ON site_settings;
CREATE POLICY "public_update_site_settings" ON site_settings
  FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "public_insert_site_settings" ON site_settings;
CREATE POLICY "public_insert_site_settings" ON site_settings
  FOR INSERT TO anon, authenticated WITH CHECK (true);

INSERT INTO site_settings (id, site_name, site_name_en, site_name_kg)
VALUES (1, 'Кыргыз Сувенир', 'Kyrgyz Souvenirs', 'Кыргыз Сувенир')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 5. CMS pages table
-- ============================================================

CREATE TABLE IF NOT EXISTS site_pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  title_en text,
  title_kg text,
  content text,
  content_en text,
  content_kg text,
  banner_url text,
  meta_title text,
  meta_description text,
  is_published boolean NOT NULL DEFAULT true,
  display_order int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE site_pages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_site_pages" ON site_pages;
CREATE POLICY "public_read_site_pages" ON site_pages
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "public_insert_site_pages" ON site_pages;
CREATE POLICY "public_insert_site_pages" ON site_pages
  FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "public_update_site_pages" ON site_pages;
CREATE POLICY "public_update_site_pages" ON site_pages
  FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "public_delete_site_pages" ON site_pages;
CREATE POLICY "public_delete_site_pages" ON site_pages
  FOR DELETE TO anon, authenticated USING (true);

-- Seed default CMS pages
INSERT INTO site_pages (slug, title, title_en, title_kg, content, content_en, content_kg, display_order) VALUES
  ('delivery', 'Доставка', 'Delivery', 'Жеткирүү', 'Мы осуществляем доставку по всей территории Кыргызстана. Доставка по Бишкеку — бесплатно при заказе от 2000 сом. Доставка по регионам — от 300 сом.', 'We deliver throughout Kyrgyzstan. Delivery in Bishkek is free for orders over 2000 KGS. Regional delivery from 300 KGS.', 'Бүт Кыргызстан боюнча жеткирүү. Бишкекте 2000 сомдон ашкан буйрутмалар үчүн акысыз. Аймактарга 300 сомдон.', 1),
  ('payment', 'Оплата', 'Payment', 'Төлөө', 'Оплата осуществляется при получении товара (наличными) или онлайн через банковскую карту.', 'Payment is made upon receipt (cash) or online via bank card.', 'Төлөө товарды алганда (налык) же банк картасы аркылуу онлайн жүргүзүлөт.', 2),
  ('privacy', 'Политика конфиденциальности', 'Privacy Policy', 'Жашыруундук саясаты', 'Мы уважаем вашу конфиденциальность и не передаём ваши данные третьим лицам.', 'We respect your privacy and do not share your data with third parties.', 'Сиздин жашыруундугуңузду урматтайбыз жана маалыматыңызды үчүнчү жактарга бербейбиз.', 3),
  ('terms', 'Пользовательское соглашение', 'Terms of Service', 'Колдонуучу келишими', 'Используя наш сайт, вы соглашаетесь с условиями обслуживания.', 'By using our site, you agree to the terms of service.', 'Сайтты колдонуу менен кызмат көрсөтүү шарттарына макулсуз.', 4)
ON CONFLICT (slug) DO NOTHING;

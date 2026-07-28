export type Category = {
  id: string;
  name: string;
  name_en: string | null;
  name_kg: string | null;
  slug: string;
  description: string | null;
  description_en: string | null;
  description_kg: string | null;
  image_url: string | null;
  icon_url: string | null;
  display_order: number;
  created_at: string;
};

export type Product = {
  id: string;
  category_id: string | null;
  name: string;
  name_en: string | null;
  name_kg: string | null;
  slug: string;
  description: string | null;
  description_en: string | null;
  description_kg: string | null;
  price: number;
  old_price: number | null;
  image_url: string | null;
  images: string[];
  material: string | null;
  material_en: string | null;
  material_kg: string | null;
  in_stock: boolean;
  stock_quantity: number;
  is_published: boolean;
  display_order: number;
  created_at: string;
  category?: Category;
  order_count?: number;
};

export type Branch = {
  id: string;
  name: string;
  name_en: string | null;
  name_kg: string | null;
  address: string;
  address_en: string | null;
  address_kg: string | null;
  phone: string;
  is_active: boolean;
  display_order: number;
  created_at: string;
};

export type Order = {
  id: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  customer_address: string | null;
  branch_id: string | null;
  total: number;
  status: string;
  payment_status: string;
  card_last4: string | null;
  card_expiry: string | null;
  notes: string | null;
  created_at: string;
};

export type OrderItem = {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  product_price: number;
  quantity: number;
  created_at: string;
};

export type CartItem = {
  product: Product;
  quantity: number;
};

export type SiteUser = {
  id: string;
  login: string;
  name: string | null;
  is_admin: boolean;
  email?: string | null;
  balance?: number;
  created_at?: string;
};

export type SiteSettings = {
  id: number;
  site_name: string;
  site_name_en: string | null;
  site_name_kg: string | null;
  logo_url: string | null;
  contact_phone: string | null;
  contact_email: string | null;
  contact_address: string | null;
  contact_address_en: string | null;
  contact_address_kg: string | null;
  instagram_url: string | null;
  facebook_url: string | null;
  telegram_url: string | null;
  whatsapp_url: string | null;
};

export type SitePage = {
  id: string;
  slug: string;
  title: string;
  title_en: string | null;
  title_kg: string | null;
  content: string | null;
  content_en: string | null;
  content_kg: string | null;
  banner_url: string | null;
  meta_title: string | null;
  meta_description: string | null;
  is_published: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
};

export type Language = 'ru' | 'en' | 'kg';

export type MediaFile = {
  id: string;
  file_name: string;
  file_path: string;
  public_url: string;
  file_type: string | null;
  file_size: number | null;
  category: string | null;
  created_at: string;
};

import type { Language } from '@/types';
import type { Product, Category, Branch, SiteSettings, SitePage } from '@/types';

export function getProductName(product: Product, lang: Language): string {
  if (lang === 'en' && product.name_en) return product.name_en;
  if (lang === 'kg' && product.name_kg) return product.name_kg;
  return product.name;
}

export function getProductDesc(product: Product, lang: Language): string {
  if (lang === 'en' && product.description_en) return product.description_en;
  if (lang === 'kg' && product.description_kg) return product.description_kg;
  return product.description || '';
}

export function getProductMaterial(product: Product, lang: Language): string {
  if (lang === 'en' && product.material_en) return product.material_en;
  if (lang === 'kg' && product.material_kg) return product.material_kg;
  return product.material || '';
}

export function getCategoryName(category: Category, lang: Language): string {
  if (lang === 'en' && category.name_en) return category.name_en;
  if (lang === 'kg' && category.name_kg) return category.name_kg;
  return category.name;
}

export function getCategoryDesc(category: Category, lang: Language): string {
  if (lang === 'en' && category.description_en) return category.description_en;
  if (lang === 'kg' && category.description_kg) return category.description_kg;
  return category.description || '';
}

export function getBranchName(branch: Branch, lang: Language): string {
  if (lang === 'en' && branch.name_en) return branch.name_en;
  if (lang === 'kg' && branch.name_kg) return branch.name_kg;
  return branch.name;
}

export function getBranchAddress(branch: Branch, lang: Language): string {
  if (lang === 'en' && branch.address_en) return branch.address_en;
  if (lang === 'kg' && branch.address_kg) return branch.address_kg;
  return branch.address || '';
}

export function getSiteName(settings: SiteSettings, lang: Language): string {
  if (lang === 'en' && settings.site_name_en) return settings.site_name_en;
  if (lang === 'kg' && settings.site_name_kg) return settings.site_name_kg;
  return settings.site_name;
}

export function getSiteAddress(settings: SiteSettings, lang: Language): string {
  if (lang === 'en' && settings.contact_address_en) return settings.contact_address_en;
  if (lang === 'kg' && settings.contact_address_kg) return settings.contact_address_kg;
  return settings.contact_address || '';
}

export function getPageTitle(page: SitePage, lang: Language): string {
  if (lang === 'en' && page.title_en) return page.title_en;
  if (lang === 'kg' && page.title_kg) return page.title_kg;
  return page.title;
}

export function getPageContent(page: SitePage, lang: Language): string {
  if (lang === 'en' && page.content_en) return page.content_en;
  if (lang === 'kg' && page.content_kg) return page.content_kg;
  return page.content || '';
}

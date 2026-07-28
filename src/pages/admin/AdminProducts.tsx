import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { formatPrice } from '@/lib/format';
import { useLanguage } from '@/i18n/LanguageContext';
import type { Product, Category } from '@/types';
import { Plus, Pencil, Trash2, X, Search, Eye, EyeOff } from 'lucide-react';
import ImagePicker from '@/components/ImagePicker';

export default function AdminProducts() {
  const { t } = useLanguage();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<Product | null>(null);
  const [showForm, setShowForm] = useState(false);

  const load = async () => {
    setLoading(true);
    const [prodRes, catRes] = await Promise.all([
      supabase.from('products').select('*').order('created_at', { ascending: false }),
      supabase.from('categories').select('*').order('name'),
    ]);
    setProducts(prodRes.data || []);
    setCategories(catRes.data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = products.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));

  const handleDelete = async (id: string) => {
    if (!confirm(t('admin.deleteConfirm'))) return;
    await supabase.from('products').delete().eq('id', id);
    load();
  };

  const togglePublish = async (product: Product) => {
    const newPublished = !product.is_published;
    const { error } = await supabase
      .from('products')
      .update({ is_published: newPublished })
      .eq('id', product.id);
    if (error) {
      alert('Ошибка: ' + error.message);
      return;
    }
    setProducts((prev) => prev.map((p) => p.id === product.id ? { ...p, is_published: newPublished } : p));
  };

  const handleSave = async (data: Partial<Product>) => {
    if (editing) {
      const { error: updateError } = await supabase.from('products').update(data).eq('id', editing.id);
      if (updateError) {
        alert('Ошибка: ' + updateError.message);
        return;
      }
    } else {
      const baseSlug = (data.name_en || data.name || 'product')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '') || 'product';
      const slug = `${baseSlug}-${Date.now().toString(36)}`;
      const { data: existing } = await supabase.from('products').select('display_order').order('display_order', { ascending: false }).limit(1).maybeSingle();
      const nextOrder = (existing?.display_order ?? 0) + 1;
      const { error: insertError } = await supabase.from('products').insert({
        ...data,
        slug,
        display_order: nextOrder,
        is_published: false,
      });
      if (insertError) {
        alert('Ошибка: ' + insertError.message);
        return;
      }
    }
    setShowForm(false);
    setEditing(null);
    load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-serif font-bold" style={{ color: 'var(--text-primary)' }}>{t('admin.productsTitle')}</h1>
        <button
          onClick={() => { setEditing(null); setShowForm(true); }}
          className="flex items-center gap-2 px-4 py-2.5 font-medium rounded-xl hover:shadow-lg transition-all"
          style={{ background: 'linear-gradient(to right, var(--accent), var(--accent-dark))', color: '#fff' }}
        >
          <Plus className="w-4 h-4" />
          {t('admin.addProduct')}
        </button>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: 'var(--text-muted)' }} />
        <input
          type="text" value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder={t('admin.searchProducts')}
          className="w-full pl-11 pr-4 py-2.5 rounded-xl border focus:outline-none"
          style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)', borderColor: 'var(--border-strong)' }}
        />
      </div>

      <div className="rounded-2xl border overflow-hidden shadow-sm" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-default)' }}>
        {loading ? (
          <div className="p-8 text-center" style={{ color: 'var(--text-muted)' }}>...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b" style={{ backgroundColor: 'var(--bg-sunken)', borderColor: 'var(--border-default)' }}>
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>{t('admin.product')}</th>
                  <th className="px-4 py-3 text-left text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>{t('admin.category')}</th>
                  <th className="px-4 py-3 text-left text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>{t('admin.price')}</th>
                  <th className="px-4 py-3 text-left text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>{t('admin.stock')}</th>
                  <th className="px-4 py-3 text-right text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>{t('admin.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: 'var(--border-default)' }}>
                {filtered.map((product) => {
                  const cat = categories.find((c) => c.id === product.category_id);
                  return (
                    <tr
                      key={product.id}
                      className="transition-colors"
                      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--bg-sunken)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = ''; }}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <img src={product.image_url || ''} alt={product.name} className="w-12 h-12 rounded-lg object-cover flex-shrink-0 border" style={{ borderColor: 'var(--border-strong)' }} />
                          <div>
                            <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{product.name}</span>
                            {!product.is_published && (
                              <span className="ml-2 text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: 'var(--bg-sunken)', color: 'var(--text-muted)' }}>черновик</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm" style={{ color: 'var(--text-secondary)' }}>{cat?.name || '—'}</td>
                      <td className="px-4 py-3 text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{formatPrice(product.price)}</td>
                      <td className="px-4 py-3">
                        <span
                          className="px-2.5 py-1 rounded-full text-xs font-medium"
                          style={product.in_stock && product.stock_quantity > 0
                            ? { backgroundColor: 'rgba(34, 197, 94, 0.1)', color: 'rgb(21, 128, 61)' }
                            : { backgroundColor: 'var(--bg-sunken)', color: 'var(--text-muted)' }}
                        >
                          {product.in_stock && product.stock_quantity > 0
                            ? `${t('admin.inStock')}: ${product.stock_quantity}`
                            : '—'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => togglePublish(product)}
                            className="p-2 rounded-lg transition-colors"
                            title={product.is_published ? 'Снять с публикации' : 'Опубликовать'}
                            style={product.is_published
                              ? { color: 'rgb(21, 128, 61)' }
                              : { color: 'var(--text-muted)' }}
                            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--border-default)'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = ''; }}
                          >
                            {product.is_published ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                          </button>
                          <button
                            onClick={() => { setEditing(product); setShowForm(true); }}
                            className="p-2 rounded-lg transition-colors"
                            style={{ color: 'var(--text-muted)' }}
                            onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.backgroundColor = 'var(--border-default)'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.backgroundColor = ''; }}
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(product.id)}
                            className="p-2 rounded-lg transition-colors"
                            style={{ color: 'var(--text-muted)' }}
                            onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--accent)'; e.currentTarget.style.backgroundColor = 'var(--accent-light)'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.backgroundColor = ''; }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showForm && (
        <ProductForm product={editing} categories={categories} onSave={handleSave} onClose={() => { setShowForm(false); setEditing(null); }} />
      )}
    </div>
  );
}

function ProductForm({ product, categories, onSave, onClose }: {
  product: Product | null;
  categories: Category[];
  onSave: (data: Partial<Product>) => void;
  onClose: () => void;
}) {
  const { t } = useLanguage();
  const [name, setName] = useState(product?.name || '');
  const [nameEn, setNameEn] = useState(product?.name_en || '');
  const [nameKg, setNameKg] = useState(product?.name_kg || '');
  const [price, setPrice] = useState(product?.price?.toString() || '');
  const [oldPrice, setOldPrice] = useState(product?.old_price?.toString() || '');
  const [categoryId, setCategoryId] = useState(product?.category_id || '');
  const [imageUrl, setImageUrl] = useState(product?.image_url || '');
  const [images, setImages] = useState<string[]>(product?.images || []);
  const [description, setDescription] = useState(product?.description || '');
  const [descriptionEn, setDescriptionEn] = useState(product?.description_en || '');
  const [descriptionKg, setDescriptionKg] = useState(product?.description_kg || '');
  const [material, setMaterial] = useState(product?.material || '');
  const [materialEn, setMaterialEn] = useState(product?.material_en || '');
  const [materialKg, setMaterialKg] = useState(product?.material_kg || '');
  const [inStock, setInStock] = useState(product?.in_stock ?? true);
  const [stockQuantity, setStockQuantity] = useState(product?.stock_quantity?.toString() || '0');
  const [isPublished, setIsPublished] = useState(product?.is_published ?? false);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [categoryList, setCategoryList] = useState<Category[]>(categories);
  const [newCatName, setNewCatName] = useState('');
  const [newCatNameEn, setNewCatNameEn] = useState('');
  const [newCatNameKg, setNewCatNameKg] = useState('');
  const [newCatImage, setNewCatImage] = useState('');
  const [newCatIcon, setNewCatIcon] = useState('');
  const [savingCat, setSavingCat] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name,
      name_en: nameEn || null,
      name_kg: nameKg || null,
      price: parseFloat(price),
      old_price: oldPrice ? parseFloat(oldPrice) : null,
      category_id: categoryId || null,
      image_url: imageUrl || null,
      images,
      description: description || null,
      description_en: descriptionEn || null,
      description_kg: descriptionKg || null,
      material: material || null,
      material_en: materialEn || null,
      material_kg: materialKg || null,
      in_stock: inStock,
      stock_quantity: parseInt(stockQuantity) || 0,
      is_published: isPublished,
    });
  };

  const handleCreateCategory = async () => {
    if (!newCatName.trim()) return;
    setSavingCat(true);
    const baseSlug = newCatName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'category';
    const slug = `${baseSlug}-${Date.now().toString(36)}`;
    const { data: existing } = await supabase.from('categories').select('display_order').order('display_order', { ascending: false }).limit(1).maybeSingle();
    const nextOrder = (existing?.display_order ?? 0) + 1;
    const { data, error } = await supabase.from('categories').insert({
      name: newCatName,
      name_en: newCatNameEn || null,
      name_kg: newCatNameKg || null,
      slug,
      image_url: newCatImage || null,
      icon_url: newCatIcon || null,
      display_order: nextOrder,
    }).select().single();
    setSavingCat(false);
    if (error) { alert('Ошибка: ' + error.message); return; }
    if (data) {
      setCategoryList([...categoryList, data]);
      setCategoryId(data.id);
    }
    setNewCatName(''); setNewCatNameEn(''); setNewCatNameKg(''); setNewCatImage(''); setNewCatIcon('');
    setShowCategoryForm(false);
  };

  const inputStyle = {
    backgroundColor: 'var(--bg-card)',
    color: 'var(--text-primary)',
    borderColor: 'var(--border-strong)',
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4 backdrop-blur-sm" style={{ backgroundColor: 'rgba(28, 25, 23, 0.6)' }}>
      <div className="rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl" style={{ backgroundColor: 'var(--bg-card)' }}>
        <div className="flex items-center justify-between px-6 py-4 border-b sticky top-0 z-10" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-default)' }}>
          <h2 className="font-serif font-semibold" style={{ color: 'var(--text-primary)' }}>{product ? t('admin.editProduct') : t('admin.newProduct')}</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg transition-colors"
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--border-default)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = ''; }}
          >
            <X className="w-5 h-5" style={{ color: 'var(--text-muted)' }} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>{t('admin.productName')} *</label>
              <input required value={name} onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border focus:outline-none"
                style={inputStyle} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>{t('admin.productNameEn')}</label>
              <input value={nameEn} onChange={(e) => setNameEn(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border focus:outline-none"
                style={inputStyle} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>{t('admin.productNameKg')}</label>
              <input value={nameKg} onChange={(e) => setNameKg(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border focus:outline-none"
                style={inputStyle} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Количество товара</label>
              <input type="number" min="0" value={stockQuantity} onChange={(e) => setStockQuantity(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border focus:outline-none"
                style={inputStyle} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Категория</label>
              <div className="flex gap-2">
                <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}
                  className="flex-1 px-4 py-2.5 rounded-xl border focus:outline-none"
                  style={inputStyle}>
                  <option value="">—</option>
                  {categoryList.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <button
                  type="button"
                  onClick={() => setShowCategoryForm(true)}
                  className="px-3 rounded-xl border transition-colors flex items-center justify-center"
                  style={{ borderColor: 'var(--border-strong)', color: 'var(--text-secondary)' }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--bg-sunken)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = ''; }}
                  title="Добавить категорию"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>{t('admin.productImage')}</label>
            <ImagePicker value={imageUrl} onChange={setImageUrl} category="product" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>{t('admin.productMaterial')}</label>
              <input value={material} onChange={(e) => setMaterial(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border focus:outline-none"
                style={inputStyle} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>{t('admin.productMaterialEn')}</label>
              <input value={materialEn} onChange={(e) => setMaterialEn(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border focus:outline-none"
                style={inputStyle} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>{t('admin.productMaterialKg')}</label>
              <input value={materialKg} onChange={(e) => setMaterialKg(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border focus:outline-none"
                style={inputStyle} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>{t('admin.productDesc')}</label>
            <textarea rows={2} value={description} onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border focus:outline-none resize-none"
              style={inputStyle} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>{t('admin.productDescEn')}</label>
            <textarea rows={2} value={descriptionEn} onChange={(e) => setDescriptionEn(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border focus:outline-none resize-none"
              style={inputStyle} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>{t('admin.productDescKg')}</label>
            <textarea rows={2} value={descriptionKg} onChange={(e) => setDescriptionKg(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border focus:outline-none resize-none"
              style={inputStyle} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>{t('admin.productPrice')} *</label>
              <input required type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border focus:outline-none"
                style={inputStyle} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Старая цена</label>
              <input type="number" step="0.01" value={oldPrice} onChange={(e) => setOldPrice(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border focus:outline-none"
                style={inputStyle} />
            </div>
          </div>

          <div className="flex flex-wrap gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={inStock} onChange={(e) => setInStock(e.target.checked)} className="w-4 h-4 rounded" />
              <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{t('admin.inStock')}</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={isPublished} onChange={(e) => setIsPublished(e.target.checked)} className="w-4 h-4 rounded" />
              <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Опубликован</span>
            </label>
          </div>

          {!product && (
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Новый товар создаётся со статусом «черновик». Нажмите на иконку глаза в списке, чтобы опубликовать.
            </p>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 border font-medium rounded-xl transition-colors"
              style={{ borderColor: 'var(--border-strong)', color: 'var(--text-secondary)' }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--bg-sunken)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = ''; }}
            >
              {t('admin.cancel')}
            </button>
            <button
              type="submit"
              className="flex-1 py-3 font-medium rounded-xl hover:shadow-lg transition-all"
              style={{ background: 'linear-gradient(to right, var(--accent), var(--accent-dark))', color: '#fff' }}
            >
              {t('admin.save')}
            </button>
          </div>
        </form>

        {showCategoryForm && (
          <div className="fixed inset-0 flex items-center justify-center z-[60] p-4 backdrop-blur-sm" style={{ backgroundColor: 'rgba(42, 20, 16, 0.6)' }}>
            <div className="rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl" style={{ backgroundColor: 'var(--bg-card)' }}>
              <div className="flex items-center justify-between px-6 py-4 border-b sticky top-0" style={{ borderColor: 'var(--border-default)', backgroundColor: 'var(--bg-card)' }}>
                <h2 className="font-serif font-semibold" style={{ color: 'var(--text-primary)' }}>Новая категория</h2>
                <button onClick={() => setShowCategoryForm(false)} className="p-2 rounded-lg transition-colors hover:bg-sunken">
                  <X className="w-5 h-5" style={{ color: 'var(--text-muted)' }} />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Название (рус) *</label>
                  <input required value={newCatName} onChange={(e) => setNewCatName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border" style={inputStyle} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Название (англ)</label>
                    <input value={newCatNameEn} onChange={(e) => setNewCatNameEn(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border" style={inputStyle} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Название (кырг)</label>
                    <input value={newCatNameKg} onChange={(e) => setNewCatNameKg(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border" style={inputStyle} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Изображение</label>
                  <ImagePicker value={newCatImage} onChange={setNewCatImage} category="category" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Иконка</label>
                  <ImagePicker value={newCatIcon} onChange={setNewCatIcon} category="category-icon" />
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowCategoryForm(false)}
                    className="flex-1 py-3 border font-medium rounded-xl transition-colors"
                    style={{ borderColor: 'var(--border-strong)', color: 'var(--text-secondary)' }}>
                    {t('admin.cancel')}
                  </button>
                  <button type="button" onClick={handleCreateCategory} disabled={savingCat}
                    className="flex-1 py-3 font-medium rounded-xl hover:shadow-lg transition-all disabled:opacity-50"
                    style={{ background: 'linear-gradient(to right, var(--accent), var(--accent-dark, #4a1d0a))', color: 'var(--bg-card)' }}>
                    {savingCat ? '...' : t('admin.save')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

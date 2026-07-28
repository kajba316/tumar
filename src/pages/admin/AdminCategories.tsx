import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useLanguage } from '@/i18n/LanguageContext';
import type { Category } from '@/types';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import ImagePicker from '@/components/ImagePicker';

export default function AdminCategories() {
  const { t } = useLanguage();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Category | null>(null);
  const [showForm, setShowForm] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from('categories').select('*').order('display_order');
    setCategories(data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id: string) => {
    if (!confirm(t('admin.deleteConfirm'))) return;
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) { alert('Ошибка: ' + error.message); return; }
    load();
  };

  const handleSave = async (data: Partial<Category>) => {
    if (editing) {
      const { error } = await supabase.from('categories').update(data).eq('id', editing.id);
      if (error) { alert('Ошибка: ' + error.message); return; }
    } else {
      const baseSlug = (data.slug || data.name_en || data.name || 'category')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '') || 'category';
      const slug = `${baseSlug}-${Date.now().toString(36)}`;
      const { data: existing } = await supabase.from('categories').select('display_order').order('display_order', { ascending: false }).limit(1).maybeSingle();
      const nextOrder = (existing?.display_order ?? 0) + 1;
      const { error } = await supabase.from('categories').insert({ ...data, slug, display_order: nextOrder });
      if (error) { alert('Ошибка: ' + error.message); return; }
    }
    setShowForm(false);
    setEditing(null);
    load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-serif font-bold" style={{ color: 'var(--text-primary)' }}>{t('admin.categoriesTitle')}</h1>
        <button
          onClick={() => { setEditing(null); setShowForm(true); }}
          className="flex items-center gap-2 px-4 py-2.5 font-medium rounded-xl hover:shadow-lg transition-all"
          style={{ background: 'linear-gradient(to right, var(--accent), var(--accent-dark, #4a1d0a))', color: 'var(--bg-card)' }}
        >
          <Plus className="w-4 h-4" />
          {t('admin.addCategory')}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full p-8 text-center" style={{ color: 'var(--text-muted)' }}>...</div>
        ) : (
          categories.map((cat) => (
            <div key={cat.id} className="rounded-2xl border p-5 shadow-sm hover:shadow-md transition-shadow" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-default)' }}>
              <div className="flex items-start justify-between mb-3">
                <div className="w-12 h-12 flex items-center justify-center ring-2 flex-shrink-0 overflow-hidden" style={{ boxShadow: '0 0 0 2px var(--border-strong)' }}>
                  {cat.icon_url ? (
                    <img src={cat.icon_url} alt={cat.name} className="max-w-full max-h-full object-contain" />
                  ) : cat.image_url ? (
                    <img src={cat.image_url} alt={cat.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xl font-serif font-bold" style={{ color: 'var(--bg-card)' }}>{cat.name.charAt(0)}</span>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--bg-sunken)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}
                    onClick={() => { setEditing(cat); setShowForm(true); }}
                    className="p-2 rounded-lg transition-colors"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--accent-light)'; e.currentTarget.style.color = 'var(--accent)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}
                    onClick={() => handleDelete(cat.id)}
                    className="p-2 rounded-lg transition-colors"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <h3 className="font-serif font-semibold" style={{ color: 'var(--text-primary)' }}>{cat.name}</h3>
              {cat.name_en && <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{cat.name_en}</p>}
              {cat.name_kg && <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{cat.name_kg}</p>}
              {cat.description && <p className="text-sm mt-2 line-clamp-2" style={{ color: 'var(--text-secondary)' }}>{cat.description}</p>}
              <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>/{cat.slug}</p>
            </div>
          ))
        )}
      </div>

      {showForm && (
        <CategoryForm category={editing} onSave={handleSave} onClose={() => { setShowForm(false); setEditing(null); }} />
      )}
    </div>
  );
}

function CategoryForm({ category, onSave, onClose }: {
  category: Category | null;
  onSave: (data: Partial<Category>) => void;
  onClose: () => void;
}) {
  const { t } = useLanguage();
  const [name, setName] = useState(category?.name || '');
  const [nameEn, setNameEn] = useState(category?.name_en || '');
  const [nameKg, setNameKg] = useState(category?.name_kg || '');
  const [slug, setSlug] = useState(category?.slug || '');
  const [description, setDescription] = useState(category?.description || '');
  const [descriptionEn, setDescriptionEn] = useState(category?.description_en || '');
  const [descriptionKg, setDescriptionKg] = useState(category?.description_kg || '');
  const [imageUrl, setImageUrl] = useState(category?.image_url || '');
  const [iconUrl, setIconUrl] = useState(category?.icon_url || '');
  const [displayOrder, setDisplayOrder] = useState(category?.display_order?.toString() || '0');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name,
      name_en: nameEn || null,
      name_kg: nameKg || null,
      slug,
      description: description || null,
      description_en: descriptionEn || null,
      description_kg: descriptionKg || null,
      image_url: imageUrl || null,
      icon_url: iconUrl || null,
      display_order: parseInt(displayOrder) || 0,
    });
  };

  const inputStyle = {
    borderColor: 'var(--border-strong)',
    backgroundColor: 'var(--bg-card)',
    color: 'var(--text-primary)',
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4 backdrop-blur-sm" style={{ backgroundColor: 'rgba(42, 20, 16, 0.6)' }}>
      <div className="rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl" style={{ backgroundColor: 'var(--bg-card)' }}>
        <div className="flex items-center justify-between px-6 py-4 border-b sticky top-0 z-10" style={{ borderColor: 'var(--border-default)', backgroundColor: 'var(--bg-card)' }}>
          <h2 className="font-serif font-semibold" style={{ color: 'var(--text-primary)' }}>{category ? t('admin.editCategory') : t('admin.newCategory')}</h2>
          <button onClick={onClose} className="p-2 rounded-lg transition-colors hover:bg-sunken">
            <X className="w-5 h-5" style={{ color: 'var(--text-muted)' }} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>{t('admin.categoryName')} *</label>
              <input required value={name} onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border" style={inputStyle} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>{t('admin.categoryNameEn')}</label>
              <input value={nameEn} onChange={(e) => setNameEn(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border" style={inputStyle} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>{t('admin.categoryNameKg')}</label>
              <input value={nameKg} onChange={(e) => setNameKg(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border" style={inputStyle} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>{t('admin.categorySlug')}</label>
              <input value={slug} onChange={(e) => setSlug(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border" style={inputStyle} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Порядок</label>
              <input type="number" value={displayOrder} onChange={(e) => setDisplayOrder(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border" style={inputStyle} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Изображение категории</label>
            <ImagePicker value={imageUrl} onChange={setImageUrl} category="category" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Иконка категории</label>
            <ImagePicker value={iconUrl} onChange={setIconUrl} category="category-icon" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>{t('admin.categoryDesc')}</label>
            <textarea rows={2} value={description} onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border resize-none" style={inputStyle} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>{t('admin.categoryDescEn')}</label>
            <textarea rows={2} value={descriptionEn} onChange={(e) => setDescriptionEn(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border resize-none" style={inputStyle} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>{t('admin.categoryDescKg')}</label>
            <textarea rows={2} value={descriptionKg} onChange={(e) => setDescriptionKg(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border resize-none" style={inputStyle} />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-3 border font-medium rounded-xl transition-colors"
              style={{ borderColor: 'var(--border-strong)', color: 'var(--text-secondary)' }}>
              {t('admin.cancel')}
            </button>
            <button type="submit"
              className="flex-1 py-3 font-medium rounded-xl hover:shadow-lg transition-all"
              style={{ background: 'linear-gradient(to right, var(--accent), var(--accent-dark, #4a1d0a))', color: 'var(--bg-card)' }}>
              {t('admin.save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

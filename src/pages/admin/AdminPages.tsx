import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Plus, Pencil, Trash2, X, Eye, EyeOff } from 'lucide-react';
import ImagePicker from '@/components/ImagePicker';
import type { SitePage } from '@/types';

export default function AdminPages() {
  const [pages, setPages] = useState<SitePage[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<SitePage | null>(null);
  const [showForm, setShowForm] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from('site_pages').select('*').order('display_order');
    setPages(data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Удалить страницу?')) return;
    await supabase.from('site_pages').delete().eq('id', id);
    load();
  };

  const handleSave = async (data: Partial<SitePage>) => {
    if (editing) {
      await supabase.from('site_pages').update({ ...data, updated_at: new Date().toISOString() }).eq('id', editing.id);
    } else {
      const slug = (data.slug || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      await supabase.from('site_pages').insert({ ...data, slug });
    }
    setShowForm(false);
    setEditing(null);
    load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-serif font-bold text-primary">Страницы сайта</h1>
        <button
          onClick={() => { setEditing(null); setShowForm(true); }}
          className="flex items-center gap-2 px-4 py-2.5 font-medium rounded-xl hover:shadow-lg transition-all"
          style={{ background: 'linear-gradient(to right, var(--accent), var(--accent-dark))', color: '#fff' }}
        >
          <Plus className="w-4 h-4" /> Добавить страницу
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading ? (
          <div className="col-span-full p-8 text-center text-muted">...</div>
        ) : (
          pages.map((page) => (
            <div key={page.id} className="rounded-2xl border p-5 shadow-sm" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-default)' }}>
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-serif font-semibold text-primary">{page.title}</h3>
                  <p className="text-xs text-muted">/{page.slug}</p>
                </div>
                <div className="flex gap-2">
                  {page.is_published ? (
                    <Eye className="w-4 h-4 text-muted" />
                  ) : (
                    <EyeOff className="w-4 h-4 text-muted" />
                  )}
                  <button onClick={() => { setEditing(page); setShowForm(true); }} className="text-muted hover:text-primary transition-colors">
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(page.id)} className="text-muted hover:text-accent transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              {page.content && <p className="text-sm text-muted line-clamp-2">{page.content}</p>}
            </div>
          ))
        )}
      </div>

      {showForm && (
        <PageForm page={editing} onSave={handleSave} onClose={() => { setShowForm(false); setEditing(null); }} />
      )}
    </div>
  );
}

function PageForm({ page, onSave, onClose }: {
  page: SitePage | null;
  onSave: (data: Partial<SitePage>) => void;
  onClose: () => void;
}) {
  const [title, setTitle] = useState(page?.title || '');
  const [titleEn, setTitleEn] = useState(page?.title_en || '');
  const [titleKg, setTitleKg] = useState(page?.title_kg || '');
  const [slug, setSlug] = useState(page?.slug || '');
  const [content, setContent] = useState(page?.content || '');
  const [contentEn, setContentEn] = useState(page?.content_en || '');
  const [contentKg, setContentKg] = useState(page?.content_kg || '');
  const [bannerUrl, setBannerUrl] = useState(page?.banner_url || '');
  const [metaTitle, setMetaTitle] = useState(page?.meta_title || '');
  const [metaDescription, setMetaDescription] = useState(page?.meta_description || '');
  const [isPublished, setIsPublished] = useState(page?.is_published ?? true);
  const [displayOrder, setDisplayOrder] = useState(page?.display_order?.toString() || '0');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      title,
      title_en: titleEn || null,
      title_kg: titleKg || null,
      slug,
      content: content || null,
      content_en: contentEn || null,
      content_kg: contentKg || null,
      banner_url: bannerUrl || null,
      meta_title: metaTitle || null,
      meta_description: metaDescription || null,
      is_published: isPublished,
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
      <div className="rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl" style={{ backgroundColor: 'var(--bg-card)' }}>
        <div className="flex items-center justify-between px-6 py-4 border-b sticky top-0 z-10" style={{ borderColor: 'var(--border-default)', backgroundColor: 'var(--bg-card)' }}>
          <h2 className="font-serif font-semibold text-primary">{page ? 'Редактировать страницу' : 'Новая страница'}</h2>
          <button onClick={onClose} className="p-2 rounded-lg transition-colors hover:bg-sunken">
            <X className="w-5 h-5 text-muted" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-secondary">URL (slug) *</label>
            <input required value={slug} onChange={(e) => setSlug(e.target.value)}
              placeholder="delivery, payment, etc."
              className="w-full px-4 py-2.5 rounded-xl border" style={inputStyle} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-secondary">Заголовок (RU) *</label>
              <input required value={title} onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border" style={inputStyle} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-secondary">Заголовок (EN)</label>
              <input value={titleEn} onChange={(e) => setTitleEn(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border" style={inputStyle} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-secondary">Заголовок (KG)</label>
              <input value={titleKg} onChange={(e) => setTitleKg(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border" style={inputStyle} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-secondary">Текст (RU)</label>
            <textarea rows={4} value={content} onChange={(e) => setContent(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border resize-none" style={inputStyle} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-secondary">Текст (EN)</label>
            <textarea rows={4} value={contentEn} onChange={(e) => setContentEn(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border resize-none" style={inputStyle} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-secondary">Текст (KG)</label>
            <textarea rows={4} value={contentKg} onChange={(e) => setContentKg(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border resize-none" style={inputStyle} />
          </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-secondary">Баннер</label>
              <ImagePicker value={bannerUrl} onChange={setBannerUrl} category="page-banner" />
            </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-secondary">SEO Title</label>
              <input value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border" style={inputStyle} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-secondary">Порядок</label>
              <input type="number" value={displayOrder} onChange={(e) => setDisplayOrder(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border" style={inputStyle} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-secondary">SEO Description</label>
            <textarea rows={2} value={metaDescription} onChange={(e) => setMetaDescription(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border resize-none" style={inputStyle} />
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={isPublished} onChange={(e) => setIsPublished(e.target.checked)} className="w-4 h-4 rounded" />
            <span className="text-sm text-secondary">Опубликована</span>
          </label>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-3 border font-medium rounded-xl transition-colors"
              style={{ borderColor: 'var(--border-strong)', color: 'var(--text-secondary)' }}>
              Отмена
            </button>
            <button type="submit"
              className="flex-1 py-3 font-medium rounded-xl hover:shadow-lg transition-all"
              style={{ background: 'linear-gradient(to right, var(--accent), var(--accent-dark))', color: '#fff' }}>
              Сохранить
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useLanguage } from '@/i18n/LanguageContext';
import type { Branch } from '@/types';
import { Plus, Pencil, Trash2, X, MapPin, Phone } from 'lucide-react';

export default function AdminBranches() {
  const { t } = useLanguage();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Branch | null>(null);
  const [showForm, setShowForm] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from('branches').select('*').order('display_order');
    setBranches(data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id: string) => {
    if (!confirm(t('admin.deleteConfirm'))) return;
    await supabase.from('branches').delete().eq('id', id);
    load();
  };

  const handleSave = async (data: Partial<Branch>) => {
    if (editing) {
      await supabase.from('branches').update(data).eq('id', editing.id);
    } else {
      await supabase.from('branches').insert(data);
    }
    setShowForm(false);
    setEditing(null);
    load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-serif font-bold" style={{ color: 'var(--text-primary)' }}>{t('admin.branchesTitle')}</h1>
        <button
          onClick={() => { setEditing(null); setShowForm(true); }}
          className="flex items-center gap-2 px-4 py-2.5 font-medium rounded-xl hover:shadow-lg transition-all"
          style={{ background: 'linear-gradient(to right, var(--accent), var(--accent-dark, #4a1d0a))', color: 'var(--bg-card)' }}
        >
          <Plus className="w-4 h-4" />
          {t('admin.addBranch')}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full p-8 text-center" style={{ color: 'var(--text-muted)' }}>...</div>
        ) : (
          branches.map((branch) => (
            <div key={branch.id} className="rounded-2xl border p-5 shadow-sm hover:shadow-md transition-shadow" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-default)' }}>
              <div className="flex items-start justify-between mb-3">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center ring-2" style={{ background: 'linear-gradient(to bottom right, var(--accent), var(--accent-dark, #4a1d0a))', color: 'var(--bg-card)', boxShadow: '0 0 0 2px var(--border-strong)' }}>
                  <MapPin className="w-6 h-6" />
                </div>
                <div className="flex gap-2">
                  <button
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--bg-sunken)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}
                    onClick={() => { setEditing(branch); setShowForm(true); }}
                    className="p-2 rounded-lg transition-colors"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--accent-light)'; e.currentTarget.style.color = 'var(--accent)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}
                    onClick={() => handleDelete(branch.id)}
                    className="p-2 rounded-lg transition-colors"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <h3 className="font-serif font-semibold" style={{ color: 'var(--text-primary)' }}>{branch.name}</h3>
              {branch.name_en && <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{branch.name_en}</p>}
              {branch.name_kg && <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{branch.name_kg}</p>}
              {branch.address && <p className="text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>{branch.address}</p>}
              {branch.phone && (
                <p className="text-sm mt-1 flex items-center gap-1.5" style={{ color: 'var(--text-secondary)' }}>
                  <Phone className="w-3.5 h-3.5" />
                  {branch.phone}
                </p>
              )}
              <span
                className="inline-block mt-3 px-2.5 py-1 rounded-full text-xs font-medium"
                style={branch.is_active
                  ? { backgroundColor: 'var(--accent-light)', color: 'var(--accent)' }
                  : { backgroundColor: 'var(--bg-sunken)', color: 'var(--text-muted)' }}
              >
                {branch.is_active ? t('admin.branchActive') : '—'}
              </span>
            </div>
          ))
        )}
      </div>

      {showForm && (
        <BranchForm branch={editing} onSave={handleSave} onClose={() => { setShowForm(false); setEditing(null); }} />
      )}
    </div>
  );
}

function BranchForm({ branch, onSave, onClose }: {
  branch: Branch | null;
  onSave: (data: Partial<Branch>) => void;
  onClose: () => void;
}) {
  const { t } = useLanguage();
  const [name, setName] = useState(branch?.name || '');
  const [nameEn, setNameEn] = useState(branch?.name_en || '');
  const [nameKg, setNameKg] = useState(branch?.name_kg || '');
  const [address, setAddress] = useState(branch?.address || '');
  const [addressEn, setAddressEn] = useState(branch?.address_en || '');
  const [addressKg, setAddressKg] = useState(branch?.address_kg || '');
  const [phone, setPhone] = useState(branch?.phone || '');
  const [isActive, setIsActive] = useState(branch?.is_active ?? true);
  const [displayOrder, setDisplayOrder] = useState(branch?.display_order?.toString() || '0');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name,
      name_en: nameEn || null,
      name_kg: nameKg || null,
      address: address || '',
      address_en: addressEn || null,
      address_kg: addressKg || null,
      phone: phone || '',
      is_active: isActive,
      display_order: parseInt(displayOrder) || 0,
    });
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4 backdrop-blur-sm" style={{ backgroundColor: 'rgba(42, 20, 16, 0.6)' }}>
      <div className="rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl" style={{ backgroundColor: 'var(--bg-card)' }}>
        <div className="flex items-center justify-between px-6 py-4 border-b sticky top-0 z-10" style={{ borderColor: 'var(--border-default)', backgroundColor: 'var(--bg-card)' }}>
          <h2 className="font-serif font-semibold" style={{ color: 'var(--text-primary)' }}>{branch ? t('admin.editBranch') : t('admin.newBranch')}</h2>
          <button
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--bg-sunken)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
            onClick={onClose}
            className="p-2 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" style={{ color: 'var(--text-muted)' }} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>{t('admin.branchName')} *</label>
              <input required value={name} onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border focus:outline-none focus:ring-2"
                style={{ borderColor: 'var(--border-strong)', backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)' }} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>{t('admin.branchNameEn')}</label>
              <input value={nameEn} onChange={(e) => setNameEn(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border focus:outline-none focus:ring-2"
                style={{ borderColor: 'var(--border-strong)', backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)' }} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>{t('admin.branchNameKg')}</label>
              <input value={nameKg} onChange={(e) => setNameKg(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border focus:outline-none focus:ring-2"
                style={{ borderColor: 'var(--border-strong)', backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)' }} />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>{t('admin.branchAddress')}</label>
              <input value={address} onChange={(e) => setAddress(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border focus:outline-none focus:ring-2"
                style={{ borderColor: 'var(--border-strong)', backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)' }} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>{t('admin.branchAddressEn')}</label>
              <input value={addressEn} onChange={(e) => setAddressEn(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border focus:outline-none focus:ring-2"
                style={{ borderColor: 'var(--border-strong)', backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)' }} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>{t('admin.branchAddressKg')}</label>
              <input value={addressKg} onChange={(e) => setAddressKg(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border focus:outline-none focus:ring-2"
                style={{ borderColor: 'var(--border-strong)', backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)' }} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>{t('admin.branchPhone')}</label>
              <input value={phone} onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border focus:outline-none focus:ring-2"
                style={{ borderColor: 'var(--border-strong)', backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)' }} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Порядок</label>
              <input type="number" value={displayOrder} onChange={(e) => setDisplayOrder(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border focus:outline-none focus:ring-2"
                style={{ borderColor: 'var(--border-strong)', backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)' }} />
            </div>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="w-4 h-4 rounded" />
            <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{t('admin.branchActive')}</span>
          </label>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--bg-sunken)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
              onClick={onClose}
              className="flex-1 py-3 border font-medium rounded-xl transition-colors"
              style={{ borderColor: 'var(--border-strong)', color: 'var(--text-secondary)' }}
            >
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

import { useState, useEffect, useRef } from 'react';
import { Upload, Link2, FolderOpen, X, Check, ImageIcon, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { MediaFile } from '@/types';

type ImagePickerProps = {
  value: string;
  onChange: (url: string) => void;
  category?: string;
  label?: string;
};

type Tab = 'url' | 'upload' | 'library';

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const MAX_DIMENSION = 1200;
const QUALITY = 0.82;

async function compressImage(file: File): Promise<File> {
  if (!file.type.startsWith('image/')) return file;
  if (file.type === 'image/gif') return file;
  if (file.size <= 300 * 1024) return file;

  try {
    const img = await loadImage(file);
    let { width, height } = img;

    if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
      const ratio = Math.min(MAX_DIMENSION / width, MAX_DIMENSION / height);
      width = Math.round(width * ratio);
      height = Math.round(height * ratio);
    }

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return file;
    ctx.drawImage(img, 0, 0, width, height);

    const outputType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, outputType, QUALITY)
    );
    if (!blob) return file;

    const ext = outputType === 'image/png' ? 'png' : 'jpg';
    const baseName = file.name.replace(/\.[^.]+$/, '');
    return new File([blob], `${baseName}.${ext}`, { type: outputType });
  } catch {
    return file;
  }
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Не удалось загрузить изображение'));
    };
    img.src = url;
  });
}

export default function ImagePicker({ value, onChange, category = 'general', label }: ImagePickerProps) {
  const [tab, setTab] = useState<Tab>('url');
  const [urlInput, setUrlInput] = useState(value || '');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [loadingLibrary, setLoadingLibrary] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setUrlInput(value || '');
  }, [value]);

  const loadLibrary = async () => {
    setLoadingLibrary(true);
    const { data } = await supabase
      .from('media_files')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(60);
    setMediaFiles(data || []);
    setLoadingLibrary(false);
  };

  useEffect(() => {
    if (tab === 'library') loadLibrary();
  }, [tab]);

  const handleUrlConfirm = () => {
    if (urlInput.trim()) {
      onChange(urlInput.trim());
    }
  };

  const handleUpload = async (file: File) => {
    if (file.size > MAX_FILE_SIZE) {
      setUploadError('Файл слишком большой (макс. 10 МБ)');
      return;
    }

    setUploading(true);
    setUploadError('');
    try {
      const processed = await compressImage(file);
      const ext = processed.name.split('.').pop() || 'jpg';
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const filePath = `${category}/${fileName}`;

      const { error: storageError } = await supabase.storage
        .from('media')
        .upload(filePath, processed, { cacheControl: '3600', upsert: false });

      if (storageError) throw storageError;

      const { data: urlData } = supabase.storage.from('media').getPublicUrl(filePath);
      const publicUrl = urlData.publicUrl;

      const { error: dbError } = await supabase.from('media_files').insert({
        file_name: processed.name,
        file_path: filePath,
        public_url: publicUrl,
        file_type: processed.type,
        file_size: processed.size,
        category,
      });

      if (dbError) throw dbError;

      onChange(publicUrl);
      setUrlInput(publicUrl);
    } catch (err: any) {
      setUploadError(err.message || 'Ошибка загрузки');
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleUpload(file);
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleUpload(file);
  };

  const handleLibrarySelect = (file: MediaFile) => {
    onChange(file.public_url);
    setUrlInput(file.public_url);
  };

  const inputStyle = {
    borderColor: 'var(--border-strong)',
    backgroundColor: 'var(--bg-card)',
    color: 'var(--text-primary)',
  };

  return (
    <div>
      {label && (
        <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>{label}</label>
      )}

      {value && (
        <div className="mb-3 relative inline-block">
          <img src={value} alt="preview" className="w-24 h-24 rounded-xl object-contain border" style={{ borderColor: 'var(--border-default)' }} />
          <button
            type="button"
            onClick={() => { onChange(''); setUrlInput(''); }}
            className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center shadow-md"
            style={{ backgroundColor: 'var(--accent)', color: '#fff' }}
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      <div className="flex gap-1 mb-3 rounded-xl p-1" style={{ backgroundColor: 'var(--bg-sunken)' }}>
        {[
          { id: 'url' as Tab, label: 'URL', icon: Link2 },
          { id: 'upload' as Tab, label: 'Загрузить', icon: Upload },
          { id: 'library' as Tab, label: 'Медиатека', icon: FolderOpen },
        ].map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-medium transition-all"
            style={tab === t.id
              ? { backgroundColor: 'var(--bg-card)', color: 'var(--accent)', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }
              : { color: 'var(--text-muted)' }
            }
          >
            <t.icon className="w-3.5 h-3.5" />
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'url' && (
        <div className="flex gap-2">
          <input
            type="text"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="https://..."
            className="flex-1 px-4 py-2.5 rounded-xl border text-sm"
            style={inputStyle}
          />
          <button
            type="button"
            onClick={handleUrlConfirm}
            className="px-4 py-2.5 rounded-xl text-sm font-medium"
            style={{ background: 'linear-gradient(to right, var(--accent), var(--accent-dark))', color: '#fff' }}
          >
            <Check className="w-4 h-4" />
          </button>
        </div>
      )}

      {tab === 'upload' && (
        <div>
          <div
            onClick={() => !uploading && fileInputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            className="border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors hover:opacity-80"
            style={{ borderColor: 'var(--border-strong)', backgroundColor: 'var(--bg-sunken)', cursor: uploading ? 'wait' : 'pointer' }}
          >
            {uploading ? (
              <div className="flex flex-col items-center gap-2">
                <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }} />
                <div className="text-sm" style={{ color: 'var(--text-muted)' }}>Загрузка и сжатие...</div>
              </div>
            ) : (
              <>
                <Upload className="w-8 h-8 mx-auto mb-2" style={{ color: 'var(--text-muted)' }} />
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Нажмите или перетащите файл</p>
                <p className="text-xs mt-1" style={{ color: 'var(--text-faint)' }}>JPG, PNG, WebP до 10 МБ (сжатие автоматически)</p>
              </>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
          {uploadError && (
            <div className="flex items-center gap-2 mt-2 text-xs" style={{ color: 'var(--accent)' }}>
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
              {uploadError}
            </div>
          )}
        </div>
      )}

      {tab === 'library' && (
        <div>
          {loadingLibrary ? (
            <div className="text-center py-8 text-sm" style={{ color: 'var(--text-muted)' }}>Загрузка...</div>
          ) : mediaFiles.length === 0 ? (
            <div className="text-center py-8">
              <ImageIcon className="w-8 h-8 mx-auto mb-2" style={{ color: 'var(--text-faint)' }} />
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Медиатека пуста</p>
            </div>
          ) : (
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-48 overflow-y-auto p-1 rounded-xl border" style={{ borderColor: 'var(--border-default)' }}>
              {mediaFiles.map((file) => (
                <button
                  key={file.id}
                  type="button"
                  onClick={() => handleLibrarySelect(file)}
                  className="aspect-square rounded-lg overflow-hidden border-2 transition-all hover:scale-105"
                  style={value === file.public_url
                    ? { borderColor: 'var(--accent)' }
                    : { borderColor: 'transparent' }
                  }
                >
                  <img src={file.public_url} alt={file.file_name} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

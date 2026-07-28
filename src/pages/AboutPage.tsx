import { useLanguage } from '@/i18n/LanguageContext';
import { Heart, Users, Globe } from 'lucide-react';
import { ArkharMuyuz, HornMotif, ShyrdakPattern } from '@/components/Ornaments';

type AboutPageProps = {
  onNavigate: (path: string) => void;
};

export default function AboutPage({ onNavigate }: AboutPageProps) {
  const { t } = useLanguage();

  return (
    <div>
      <div className="relative overflow-hidden" style={{ background: 'linear-gradient(135deg, var(--bg-elevated), var(--bg-sunken))' }}>
        <div className="kyrgyz-pattern-rich absolute inset-0" />
        <div className="absolute top-0 left-0 right-0 h-1.5" style={{ background: 'linear-gradient(to right, var(--accent-dark), var(--gold), var(--accent-dark))' }} />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-3xl lg:text-4xl font-serif font-bold text-primary">{t('about.title')}</h1>
          <p className="mt-2 text-secondary">{t('about.subtitle')}</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <p className="text-lg leading-relaxed mb-8 text-secondary">{t('about.p1')}</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-12">
          {[
            { icon: Heart, title: t('about.loveTitle'), desc: t('about.loveDesc') },
            { icon: Users, title: t('about.mastersTitle'), desc: t('about.mastersDesc') },
            { icon: Globe, title: t('about.worldTitle'), desc: t('about.worldDesc') },
          ].map((item, i) => (
            <div key={i} className="rounded-2xl p-6 border transition-all hover:shadow-lg" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-default)' }}>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: 'var(--accent-light)' }}>
                <item.icon className="w-6 h-6" style={{ color: 'var(--accent)' }} />
              </div>
              <h3 className="font-serif font-semibold mb-2 text-primary">{item.title}</h3>
              <p className="text-sm text-muted">{item.desc}</p>
            </div>
          ))}
        </div>

        <div className="flex justify-center my-8" style={{ color: 'var(--ornament-color)' }}>
          <ArkharMuyuz className="w-64 h-40" />
        </div>

        <h2 className="text-2xl font-serif font-bold mb-4 text-primary">{t('about.missionTitle')}</h2>
        <p className="leading-relaxed mb-8 text-secondary">{t('about.missionDesc')}</p>

        <h2 className="text-2xl font-serif font-bold mb-4 text-primary">{t('about.whyTitle')}</h2>
        <ul className="space-y-3 text-secondary">
          {[t('about.why1'), t('about.why2'), t('about.why3'), t('about.why4')].map((text, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 border" style={{ backgroundColor: 'color-mix(in srgb, var(--gold) 15%, transparent)', borderColor: 'color-mix(in srgb, var(--gold) 30%, transparent)' }}>
                <span className="text-sm font-bold text-gold">✓</span>
              </span>
              <span>{text}</span>
            </li>
          ))}
        </ul>

        <div className="mt-12 text-center">
          <button
            onClick={() => onNavigate('/catalog')}
            className="px-8 py-3.5 font-semibold rounded-xl transition-all hover:shadow-lg"
            style={{ background: 'linear-gradient(to right, var(--accent), var(--accent-dark))', color: '#fff' }}
          >
            {t('about.cta')}
          </button>
        </div>
      </div>
    </div>
  );
}

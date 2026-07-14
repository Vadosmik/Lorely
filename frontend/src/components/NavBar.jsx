import { useLanguage } from '../context/LanguageContext';
import { useTranslation } from '../utils/useTranslation';

const langOptions = {
  "en": "English",
  "pl": "Polski",
  "by": "Беларуская",
  "ru": "Русский"
};

export function NavBar({ user, onLogout }) {
  const { currentLang, changeLang } = useLanguage();
  const { t } = useTranslation('navbar');

  return (
    <>
    <div style={ styles.space }></div>
    <nav style={ styles.navbar }>
      <div className="navbar-brand">
        <a href="/" style={styles.brand}>Lorely</a>
      </div>

      <div style={styles.links}>
        <a href="/catalog" style={styles.link}>{t('catalog')}</a>

        {user && (
          <>
            <a href="/studio" style={styles.link}>{t('studio')}</a>
            <a href="/admin" style={styles.link}>{t('admin')}</a>
            <a href={`/${user.username}`} style={ {...styles.link, ...styles.username }}>
              {user.username}
            </a>
          </>
        )}

        <a style={styles.link}>
          <select 
            value={currentLang} 
            onChange={(e) => changeLang(e.target.value)}
            style={{ background: 'transparent', color: 'inherit', border: '1px solid var(--color-border)', padding: '2px 5px', borderRadius: '4px' }}
          >
            {Object.entries(langOptions).map(([code, name]) => (
              <option key={code} value={code}>
                {name}
              </option>
            ))}
          </select>
        </a>
      </div>

      <div className="navbar-auth">
        {user ? (
          <button onClick={onLogout} style={{ ...styles.link, ...styles.button }}>{t('logout')}</button>
        ) : (
          <a href="/login" style={{ ...styles.link, ...styles.button }}>{t('login')}</a>
        )}
      </div>
    </nav>
    </>
  );
}

const styles = {
  space: {
    height: 20,
  },
  navbar: {
    display: 'flex',
    position: 'sticky',
    top: 0,
    zIndex: 100,
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.75rem 2rem',
    backgroundColor: 'var(--color-surface)',
    color: 'var(--color-text)',
    gap: '1.5rem',

    boxShadow: '0 4px 6px color-mix(in srgb, var(--color-border) 30%, transparent)',
  },
  brand: {
    color: 'var(--color-text)',
    textDecoration: 'none',
    fontSize: '1.5rem',
    fontWeight: '800',
    letterSpacing: '-0.05em'
  },
  links: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.5rem',
    marginLeft: 'auto'
  },
  link: {
    color: 'var(--color-text)',
    textDecoration: 'none',
    fontSize: '0.95rem',
    fontWeight: '500',
    cursor: 'pointer',
    opacity: 0.9
  },
  username: {
    color: 'var(--color-primary)',
  },
  button: {
    backgroundColor: 'var(--color-bg)',
    padding: '0.5rem 1.2rem',
    borderRadius: '20px',
    border: '1px solid var(--color-border)',
    color: 'var(--color-text)',
    transition: 'all 0.2s ease'
  }
};
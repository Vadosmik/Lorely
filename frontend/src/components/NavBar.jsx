import { useLanguage } from '../context/LanguageContext';
import { useTranslation } from '../utils/useTranslation';
import { useState, useEffect } from 'preact/hooks';
import { useLocation } from 'preact-iso';

const langOptions = {
  "en": "English",
  "pl": "Polski",
  "by": "Беларуская",
  "ru": "Русский"
};

const Icons = {
  Catalog: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
    </svg>
  ),
  Search: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  ),
  Studio: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
    </svg>
  ),
  Admin: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  ),
  Notifications: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  ),
  Login: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
      <polyline points="10 17 15 12 10 7" />
      <line x1="15" y1="12" x2="3" y2="12" />
    </svg>
  ),
  Logout: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  )
};

function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= breakpoint);
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= breakpoint);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [breakpoint]);
  return isMobile;
}

export function NavBar({ user, onLogout }) {
  const { currentLang, changeLang } = useLanguage();
  const { t } = useTranslation('navbar');
  const { path } = useLocation();

  const isMobile = useIsMobile(768);

  const isCanvasPage = /^\/studio\/[^/]+\/canvas\/?$/.test(path);

  if (isMobile && isCanvasPage) {
    return null;
  }
  
  if (isMobile) {
    return (
      <>
        <div style={styles.mobileTopBar}>
          <select
            value={currentLang}
            onChange={(e) => changeLang(e.target.value)}
            style={styles.mobileSelect}
          >
            {Object.entries(langOptions).map(([code, name]) => (
              <option key={code} value={code}>
                {name}
              </option>
            ))}
          </select>

          {user && (
            <>
              <a href="/admin" style={styles.link}>{t('admin')}</a>
              <a href={`/${user.username}`} style={{ ...styles.link, ...styles.username }}>
                {user.username}
              </a>
            </>
          )}
        </div>
        <div style={styles.mobileDockContainer}>
          <div style={styles.mobileDock}>
            <a href="/catalog" style={styles.dockItem} title={t('catalog')}>
              <Icons.Catalog />
            </a>

            <a href="/" style={styles.dockItem} title="Search">
              <Icons.Search />
            </a>

            {user ? (
              <>
                <a href="/studio" style={{ ...styles.dockItem, ...styles.dockItemActive }} title={t('studio')}>
                  <Icons.Studio />
                </a>
                <a href="/studio" style={styles.dockItem} title={t('admin')}>
                  <Icons.Admin />
                </a>
                <button onClick={onLogout} style={{ ...styles.dockItem, ...styles.buttonReset }} title={t('logout')}>
                  <Icons.Logout />
                </button>
              </>
            ) : (
              <a href="/login" style={styles.dockItem} title={t('login')}>
                <Icons.Login />
              </a>
            )}
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div style={styles.space}></div>
      <nav style={styles.navbar}>
        <div className="navbar-brand">
          <a href="/" style={styles.brand}>Lorely</a>
        </div>

        <div style={styles.links}>
          <a href="/catalog" style={styles.link}>{t('catalog')}</a>

          {user && (
            <>
              <a href="/studio" style={styles.link}>{t('studio')}</a>
              <a href="/admin" style={styles.link}>{t('admin')}</a>
              <a href={`/${user.username}`} style={{ ...styles.link, ...styles.username }}>
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
  mobileTopBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 20px',
    backgroundColor: 'var(--color-surface)',
    borderBottom: '1px solid var(--color-border)',
  },
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
  },

  // ====
  mobileDockContainer: {
    position: 'fixed',
    bottom: '24px',
    left: '0',
    right: '0',
    display: 'flex',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '0 20px',
    pointerEvents: 'none' // Nie blokuje kliknięć poza samym dokiem
  },
  mobileDock: {
    pointerEvents: 'auto', // Przywraca klikalność na samym doku
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: '#666666', // Ciemnoszary tył ze zdjęcia
    padding: '10px 20px',
    borderRadius: '40px', // Bardzo zaokrąglone brzegi
    width: '100%',
    maxWidth: '360px',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)',
    gap: '10px'
  },
  dockItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '48px',
    height: '48px',
    color: '#ffffff', // Białe ikony
    textDecoration: 'none',
    borderRadius: '50%',
    transition: 'all 0.2s ease',
  },
  dockItemActive: {
    backgroundColor: '#000000', // Aktywna ikona (pióro z kółkiem) ma czarne tło
    color: '#ffffff',
  },
  buttonReset: {
    background: 'none',
    border: 'none',
    outline: 'none',
    padding: 0,
    cursor: 'pointer'
  }
};
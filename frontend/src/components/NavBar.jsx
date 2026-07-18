import { useLocation } from 'preact-iso';
import { useState, useEffect } from 'preact/hooks';
import { useLanguage } from '../context/LanguageContext';



import { useTranslation } from '../utils/useTranslation';
import { useMobile } from '../hooks/useMobile';
import { Background } from 'reactflow';

import CachedImage from './common/CachedImage';
import Icon from './common/Icon';
import { DEFAULT_AVATAR } from '../utils/imageCache';

const langOptions = {
  "en": "English",
  "pl": "Polski",
  "by": "Беларуская",
  "ru": "Русский"
};

export function NavBar({ user, onLogout }) {
  const { currentLang, changeLang } = useLanguage();
  const { t } = useTranslation('navbar');
  const { path } = useLocation();

  const [activeItem, setActiveStatus] = useState(null);

  const isMobile = useMobile();

  const isCanvasPage = /^\/studio\/[^/]+\/canvas\/?$/.test(path);
  const isReaderDetails = /^\/catalog\/[^/]+\/details\/?$/.test(path);
  const isReaderPage = /^\/catalog\/[^/]+\/read\/?$/.test(path);

  const getDockStyle = (targetPath) => {
    const isActive = targetPath === '/'
      ? path === '/'
      : path.startsWith(targetPath);

    return {
      ...styles.dockItem,
      ...(isActive ? styles.dockItemActive : {})
    };
  };

  if ((isMobile && (isCanvasPage || isReaderDetails)) || isReaderPage) {
    return null;
  }

  if (isMobile) {
    return (
      <>
        <div style={styles.mobileTopBar}>
          <div style={styles.navbarBrand}>
            <a href="/" style={styles.brand}>Lorely</a>
          </div>

          {/* element na czas testów do puki nie bede wiedział gdzie go wrzuce dla tego bez stylu */}
          <select value={currentLang} onChange={(e) => changeLang(e.target.value)} >
            {Object.entries(langOptions).map(([code, name]) => (
              <option key={code} value={code}> {name} </option>
            ))}
          </select>

          <a href="/admin" style={styles.topBarItem} title="admin">
            <Icon name="notification" alt="Notification" />
          </a>
        </div>

        <div style={styles.mobileDockContainer}>
          <div style={styles.mobileDock}>

            <a href="/" style={getDockStyle('/')} title={t('catalog')}>
              <Icon name="home" alt="Home" />
            </a>
            <a href="/catalog" style={getDockStyle('/catalog')} title="Search">
              <Icon name="catalog" alt="Catalog" />
            </a>
            <a href="/studio" style={getDockStyle('/studio')} title={t('studio')}>
              <Icon name="studio" alt="Studio" />
            </a>
            <a href="/library" style={getDockStyle('/library')} title={t('librari')}>
              <Icon name="library" alt="Library" />
            </a>

            {user ? (
              <a href={`/${user.username}`} style={getDockStyle(`/${user.username}`)} title="user">
                {user.ava_pic_path ? (
                  <CachedImage
                    path={user.ava_pic_path}
                    fallback={DEFAULT_AVATAR}
                    alt="User Avatar"
                    style={styles.avatarImg}
                  />
                ) : (
                  <Icon name="user" alt="User" />
                )}
              </a>
            ) : (
              <a href={`/login`} style={getDockStyle('/login')} title="login">
                <Icon name="user" alt="User" />
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
        <div style={styles.navbarBrand}>
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
            <button onClick={() => console.log('go')} style={{ ...styles.link, ...styles.button }}>{t('logout')}</button>
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
  navbarBrand: {
    backgroundColor: 'var(--color-surface)',
    padding: '8px 15px',
    borderRadius: 12,
  },
  brand: {
    color: 'var(--color-text)',
    textDecoration: 'none',
    fontSize: '1.3rem',
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
  mobileTopBar: {
    display: 'flex',
    position: 'sticky',
    top: 0,
    zIndex: 100,
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 20px',
  },

  mobileDockContainer: {
    position: 'fixed',
    bottom: 5,
    left: '0',
    right: '0',
    display: 'flex',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '0 20px',
    pointerEvents: 'none'
  },
  topBarItem: {
    backgroundColor: 'var(--color-surface)',
    width: 'clamp(32px, 9vw, 42px)',
    height: 'clamp(32px, 9vw, 42px)',
    borderRadius: 12,
    padding: '8px 10px',

    color: 'var(--color-text)',

    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  mobileDock: {
    pointerEvents: 'auto',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: '#666666',
    color: 'var(--color-surface)',
    padding: '10px 20px',
    borderRadius: '40px',
    width: '100%',
    maxWidth: '360px',
    boxShadow: '0 1px 8px rgba(0, 0, 0, 0.3)',
    gap: '10px'
  },
  dockItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 'clamp(34px, 9vw, 42px)',
    height: 'clamp(34px, 9vw, 42px)',
    color: '#ffffff',
    textDecoration: 'none',
    borderRadius: '50%',
    transition: 'all 0.2s ease',
    padding: '8px',
  },
  avatarImg: {
    width: '150%',
    height: '150%',
    borderRadius: '50%',
    objectFit: 'cover',
    display: 'block'
  },
  dockItemActive: {
    backgroundColor: '#000000',
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
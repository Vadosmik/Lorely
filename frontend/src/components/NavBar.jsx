import { useLocation } from 'preact-iso';
import { useTranslation } from '../utils/useTranslation';
import { useMobile } from '../hooks/useMobile';

import CachedImage from './common/CachedImage';
import Icon from './common/Icon';
import { DEFAULT_AVATAR } from '../utils/imageCache';

export function NavBar({ user }) {
  const { t } = useTranslation('navbar');
  const { path } = useLocation();
  const isMobile = useMobile();

  const navItems = [
    { href: '/', icon: 'home', title: t('home') },
    { href: '/catalog', icon: 'catalog', title: t('catalog') },
    {
      href: user ? '/studio' : '/login',
      icon: 'studio',
      title: t('studio')
    },
    {
      href: user ? '/library' : '/login',
      icon: 'library',
      title: t('library')
    },
    {
      href: user ? `/${user.username}` : '/login',
      icon: 'user',
      title: user ? 'user' : 'login',
      isProfile: true
    },
  ];

  const isCanvasPage = /^\/studio\/[^/]+\/canvas\/?$/.test(path);
  const isReaderDetails = /^\/catalog\/[^/]+\/details\/?$/.test(path);
  const isReaderPage = /^\/catalog\/[^/]+\/read\/?$/.test(path);

  if ((isMobile && (isCanvasPage || isReaderDetails)) || isReaderPage) {
    return null;
  }

  const isItemActive = (targetPath) => {
    return targetPath === '/' ? path === '/' : path.startsWith(targetPath);
  };

  const dynamicNavbarStyle = {
    ...styles.navbar,
    ...(isMobile ? styles.navbarMobile : styles.navbarDesktop)
  };


  return (
    <>
      <div style={styles.topBar}>
        <div style={styles.navbarBrand}>
          <a href="/" style={styles.brand}>Lorely</a>
        </div>

        <a href="/admin" style={styles.topBarItem} title="admin">
          admin
        </a>
      </div>

      <nav style={dynamicNavbarStyle}>
        {navItems.map((item) => {
          const isActive = isItemActive(item.href);

          return (
            <a key={item.href} href={item.href} style={{ ...styles.navItem, ...(isActive ? styles.navItemActive : {}) }} title={item.title}>
              <Icon name={item.icon} alt={item.title} style={styles.navIcon} />
            </a>
          )
        })}
      </nav>
    </>
  )
}

const styles = {
  topBar: {
    display: 'flex',
    position: 'sticky',
    top: 0,
    zIndex: 100,
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 20px',
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
  topBarItem: {
    color: 'var(--color-text)',
    textDecoration: 'none',
  },

  // ===

  navbar: {
    display: 'flex',
    backgroundColor: '#000000',
    borderRadius: 33,
    padding: '15px',
    gap: 15,
    position: 'fixed',
    zIndex: 1000,
    alignItems: 'center',
    justifyContent: 'center',
  },

  navbarMobile: {
    flexDirection: 'row',
    bottom: 20,
    left: '50%',
    transform: 'translateX(-50%)',
    width: 'calc(100% - 40px)',
    maxWidth: 360,
    justifyContent: 'space-around',
  },
  navbarDesktop: {
    flexDirection: 'column',
    left: 20,
    top: '50%',
    transform: 'translateY(-50%)',
  },


  navItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 48,
    height: 48,
    borderRadius: '50%',
    cursor: 'pointer',
    transition: 'background 0.2s ease',
  },
  navItemActive: {
    backgroundColor: '#ffffff22', 
  },
  navIcon: {
    width: 30,
    height: 30,
    backgroundColor: '#ffffff',
  },
};
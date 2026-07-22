import { useLocation } from 'preact-iso';
import { useRef, useState, useEffect } from 'preact/hooks';
import { useTranslation } from '../utils/useTranslation';
import { useMobile } from '../hooks/useMobile';

import CachedImage from './common/CachedImage';
import Icon from './common/Icon';
import { DEFAULT_AVATAR } from '../utils/imageCache';

export function NavBar({ user }) {
  const { t } = useTranslation('navbar');
  const { path } = useLocation();
  const isMobile = useMobile();

  const itemRefs = useRef([]);
  const [indicatorStyle, setIndicatorStyle] = useState({ opacity: 1 });

  const navItems = [
    { href: '/', icon: 'home', title: t('home') },
    { href: '/catalog', icon: 'catalog', title: t('catalog') },
    {
      href: user ? '/studio' : '#login',
      icon: 'studio',
      title: t('studio')
    },
    {
      href: user ? '/library' : '#login',
      icon: 'library',
      title: t('library')
    },
    {
      href: user ? `/${user.username}` : '#login',
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

  useEffect(() => {
    const updateIndicator = () => {
      const activeIndex = navItems.findIndex((item) => isItemActive(item.href));
      const activeEl = itemRefs.current[activeIndex];

      if (activeIndex !== -1 && activeEl) {
        setIndicatorStyle({
          transform: `translate(${activeEl.offsetLeft}px, ${activeEl.offsetTop}px)`,
          width: `${activeEl.offsetWidth}px`,
          height: `${activeEl.offsetHeight}px`,
          opacity: 1
        });
      } else {
        setIndicatorStyle({ opacity: 0 });
      }
    };

    updateIndicator();
    window.addEventListener('resize', updateIndicator);
    return () => window.removeEventListener('resize', updateIndicator);
  }, [isMobile, path])

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
        <div style={{ ...styles.indicator, ...indicatorStyle }} />

        {navItems.map((item, index) => {
          const isActive = isItemActive(item.href);

          return (
            <a
              key={item.icon}
              ref={(el) => (itemRefs.current[index] = el)}
              href={item.href}
              style={{ ...styles.navItem, ...(isActive ? styles.navItemActive : {}) }}
              title={item.title}
            >
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

  indicator: {
    position: 'absolute',
    top: 0,
    left: 0,
    backgroundColor: '#ffffff22',
    borderRadius: '45%',
    pointerEvents: 'none',
    zIndex: 1,

    transition: 'transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1), width 0.3s ease, height 0.3s ease, opacity 0.2s ease',
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
    zIndex: 2,
  },
  navIcon: {
    width: 30,
    height: 30,
    backgroundColor: '#ffffff',
  },
};
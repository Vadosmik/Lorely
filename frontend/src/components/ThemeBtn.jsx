import { useState, useEffect } from 'preact/hooks';

export function ThemeBtn() {
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  const isLight = theme === 'light';

  return (
    <button style={styles.btn} onClick={toggleTheme} aria-label="Toggle theme">
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        style={{
          ...styles.icon,
          opacity: isLight ? 1 : 0,
          transform: isLight ? 'rotate(0deg) scale(1)' : 'rotate(-90deg) scale(0.5)',
        }}
      >
        <path d="M21.75 15a9.6 9.6 0 0 1-10.5-10.5 9 9 0 1 0 10.5 10.5Z" />
      </svg>

      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2.5"
        stroke-linecap="round"
        style={{
          ...styles.icon,
          opacity: isLight ? 0 : 1,
          transform: isLight ? 'rotate(90deg) scale(0.5)' : 'rotate(0deg) scale(1)',
        }}
      >
        <circle cx="12" cy="12" r="5" fill="currentColor" />
        <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
      </svg>
    </button>
  );
}

const styles = {
  btn: {
    position: 'absolute',
    bottom: '20px',
    right: '20px',

    width: '48px',
    height: '48px',
    borderRadius: '16px',

    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: 'none',
    cursor: 'pointer',

    background: 'var(--color-surface)',
    color: 'var(--color-text)',

    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    transition: 'background-color 0.4s cubic-bezier(0.4, 0, 0.2, 1), color 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    zIndex: 9999,
  },
  icon: {
    position: 'absolute',
    width: '22px',
    height: '22px',

    transition: 'opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1), transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  }
};
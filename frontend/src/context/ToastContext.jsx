import { createContext } from 'preact';
import { useState, useContext, useRef } from 'preact/hooks';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);
  const timerRef = useRef(null);

  /**
  * Displays a global notification (toast) on the screen.
  * Automatically resets the timer if called again while active.
  *
  * @param {string} message - The text content to be displayed.
  * @param {'success' | 'error' | 'info'} [type='info'] - The toast type, which determines its color scheme.
  */
  const showToast = (message, type = 'info') => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    setToast({ message, type });

    setTimeout(() => {
      setToast(null);
      timerRef.current = null;
    }, 3000);
  };

  const closeToast = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setToast(null);
  }

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {toast && (
        <div
          onClick={closeToast}
          style={{
            ...styles.toast,
            ...styles[toast.type]
          }}
        >
          {toast.message}
        </div>
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

const styles = {
  toast: {
    position: 'fixed',
    top: 40,
    right: 24,
    padding: '12px 24px',
    borderRadius: '12px',
    fontSize: '0.95rem',
    fontWeight: '600',
    color: 'var(--raw-black)',
    boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
    zIndex: 9999,
    cursor: 'pointer',
    animation: 'slideIn 0.2s ease-out',
    border: '1px solid var(--color-border)',
    transition: 'all 0.3s ease',
  },
  // Style w zależności od typu komunikatu
  success: {
    backgroundColor: 'var(--color-ok)',
    color: '#000',
  },
  error: {
    backgroundColor: 'var(--color-error)',
    color: '#fff',
  },
  info: {
    backgroundColor: 'var(--color-surface)',
    color: 'var(--color-text)',
  }
};


// How Use \\

// on top
// import { useToast } from '../../context/ToastContext';

// in function
// const { showToast } = useToast(); 

// showToast('Updating profile...', 'info');  ---  { message, type: 'success' | 'error' | 'info' }
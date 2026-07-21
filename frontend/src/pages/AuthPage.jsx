import { useState, useEffect } from 'preact/hooks';
import { authService } from '../services/AuthService';
import { useToast } from '../context/ToastContext';
import { useTranslation } from '../utils/useTranslation';

export default function AuthPage({ onClose, onLoginSuccess }) {
  const [activeTab, setActiveTab] = useState('login');

  const [loginForm, setLoginForm] = useState({
    usernameOrEmail: '',
    password: ''
  });
  const [registerForm, setRegisterForm] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    tos_accepted: false
  });

  const { t } = useTranslation('auth');
  const { showToast } = useToast();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && onClose) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleLoginInput = (e) => {
    const { name, value } = e.target;
    setLoginForm(prev => ({ ...prev, [name]: value }));
  };

  const handleRegisterInput = (e) => {
    const { name, value, type, checked } = e.target;
    setRegisterForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmitLogin = async (e) => {
    e.preventDefault();
    try {
      showToast('Signing in...', 'info');
      const data = await authService.login(loginForm.usernameOrEmail, loginForm.password);
      localStorage.setItem('token', data.access_token);

      showToast('Successfully logged in!', 'success');

      if (onLoginSuccess) {
        await onLoginSuccess();
      } else if (onClose) {
        onClose();
      }
    } catch (err) {
      showToast(err.message || 'Failed to login.', 'error');
    }
  };

  const handleSubmitRegister = async (e) => {
    e.preventDefault();

    if (registerForm.password !== registerForm.confirmPassword) {
      showToast('Passwords do not match!', 'error');
      return;
    }

    if (!registerForm.tos_accepted) {
      showToast('You must accept the Terms of Service.', 'error');
      return;
    }

    try {
      showToast('Registering...', 'info');
      await authService.register(
        registerForm.username,
        registerForm.email,
        registerForm.password,
        registerForm.tos_accepted
      );

      showToast('Account registered successfully! You can now log in.', 'success');
      setRegisterForm({ username: '', email: '', password: '', confirmPassword: '', tos_accepted: false });
      setActiveTab('login');
    } catch (err) {
      showToast(err.message || 'Registration failed.', 'error');
    }
  };

  return (
    <>
      <div style={styles.overlay} onClick={onClose}>
        <div style={styles.modalCard} onClick={(e) => e.stopPropagation()}>
          <button onClick={onClose}>✕</button>

          {activeTab === 'login' && (
            <>
              <h2>{t('loginHeader')}</h2>
              <form onSubmit={handleSubmitLogin}>
                <div style={{ marginBottom: '10px' }}>
                  <label htmlFor="login_ioe" style={{ display: 'block' }}>{t('usernameOrEmail')}:</label>
                  <input
                    type="text"
                    id="login_ioe"
                    name="usernameOrEmail"
                    value={loginForm.usernameOrEmail}
                    onInput={handleLoginInput}
                    required
                  />
                </div>
                <div style={{ marginBottom: '10px' }}>
                  <label htmlFor="login_pass" style={{ display: 'block' }}>{t('password')}:</label>
                  <input
                    type="password"
                    id="login_pass"
                    name="password"
                    minLength={8}
                    pattern="^[-a-zA-Z0-9+*=_!?@#$%&~.]+$"
                    value={loginForm.password}
                    onInput={handleLoginInput}
                    required
                  />
                </div>
                <button type="submit">{t('loginBtn')}</button>
              </form>
            </>
          )}

          {activeTab === 'register' && (
            <>
              <h2>{t('registerHeader')}</h2>
              <form onSubmit={handleSubmitRegister}>
                <div style={{ marginBottom: '10px' }}>
                  <label htmlFor="reg_user" style={{ display: 'block' }}>{t('username')}:</label>
                  <input
                    type="text"
                    id="reg_user"
                    name="username"
                    value={registerForm.username}
                    onInput={handleRegisterInput}
                    required
                  />
                </div>

                <div style={{ marginBottom: '10px' }}>
                  <label htmlFor="reg_email" style={{ display: 'block' }}>{t('email')}:</label>
                  <input
                    type="email"
                    id="reg_email"
                    name="email"
                    value={registerForm.email}
                    onInput={handleRegisterInput}
                    required
                  />
                </div>

                <div style={{ marginBottom: '10px' }}>
                  <label htmlFor="reg_pass" style={{ display: 'block' }}>{t('password')}:</label>
                  <input
                    type="password"
                    id="reg_pass"
                    name="password"
                    minLength={8}
                    pattern="^[-a-zA-Z0-9+*=_!?@#$%&~.]+$"
                    value={registerForm.password}
                    onInput={handleRegisterInput}
                    required
                  />
                </div>

                <div style={{ marginBottom: '10px' }}>
                  <label htmlFor="reg_confirm" style={{ display: 'block' }}>{t('confirmPassword')}:</label>
                  <input
                    type="password"
                    id="reg_confirm"
                    name="confirmPassword"
                    minLength={8}
                    pattern="^[-a-zA-Z0-9+*=_!?@#$%&~.]+$"
                    value={registerForm.confirmPassword}
                    onInput={handleRegisterInput}
                    required
                  />
                </div>

                <div style={{ marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <input
                    type="checkbox"
                    id="reg_tos"
                    name="tos_accepted"
                    checked={registerForm.tos_accepted}
                    onChange={handleRegisterInput}
                    required
                  />
                  <label htmlFor="reg_tos" style={{ fontSize: '14px', cursor: 'pointer' }}>
                    {t('acceptTos')}
                  </label>
                </div>

                <button type="submit">{t('registerBtn')}</button>
              </form>
            </>
          )}


          <div style={styles.tabsContainer}>
            <button type="button" onClick={() => setActiveTab('login')} >
              {t('loginHeader') || 'Logowanie'}
            </button>
            <button type="button" onClick={() => setActiveTab('register')} >
              {t('registerHeader') || 'Rejestracja'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    backdropFilter: 'blur(5px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2000,
    padding: '20px',
    boxSizing: 'border-box'
  },
  modalCard: {
    backgroundColor: 'var(--color-surface, #1e1e24)',
    color: 'var(--color-text, #ffffff)',
    borderRadius: '20px',
    padding: '30px 25px',
    maxWidth: '420px',
    width: '100%',
    maxHeight: '90vh',
    overflowY: 'auto',
    position: 'relative',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
  },
  hr: { borderColor: '#333', margin: '30px 0' }
};
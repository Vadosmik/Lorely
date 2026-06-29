import { useLocation } from 'preact-iso';
import { useState } from 'preact/hooks';
import { authService } from '../services/authService';

export default function AuthPage({ onLoginSuccess }) {
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

  const [status, setStatus] = useState('');
  const { route } = useLocation();

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
    setStatus('Logging in...');
    try {
      const data = await authService.login(loginForm.usernameOrEmail, loginForm.password);
      localStorage.setItem('token', data.access_token);
      setStatus('Successfully logged in!');
      if (onLoginSuccess) await onLoginSuccess();
      route('/');
    } catch (err) {
      setStatus(`Error: ${err.message}`);
    }
  };

  const handleSubmitRegister = async (e) => {
    e.preventDefault();
    setStatus('Registering...');

    if (registerForm.password !== registerForm.confirmPassword) {
      setStatus('Error: Passwords do not match!');
      return;
    }

    if (!registerForm.tos_accepted) {
      setStatus('Error: You must accept the Terms of Service!');
      return;
    }

    try {
      await authService.register(
        registerForm.username,
        registerForm.email,
        registerForm.password,
        registerForm.tos_accepted
      );

      setStatus('Successfully registered! You can now log in.');
      setRegisterForm({ username: '', email: '', password: '', confirmPassword: '', tos_accepted: false });
    } catch (err) {
      setStatus(`Error: ${err.message}`);
    }
  };

  return (
    <div className="auth-container">
      <h2>Logowanie</h2>
      <form onSubmit={handleSubmitLogin}>
        <div style={{ marginBottom: '10px' }}>
          <label htmlFor="login_ioe" style={{ display: 'block' }}>Username or email:</label>
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
          <label htmlFor="login_pass" style={{ display: 'block' }}>Password:</label>
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
        <button type="submit">Zaloguj się</button>
      </form>

      <hr style={styles.hr} />

      <h2>Rejestracja</h2>
      <form onSubmit={handleSubmitRegister}>
        <div style={{ marginBottom: '10px' }}>
          <label htmlFor="reg_user" style={{ display: 'block' }}>Username:</label>
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
          <label htmlFor="reg_email" style={{ display: 'block' }}>Email:</label>
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
          <label htmlFor="reg_pass" style={{ display: 'block' }}>Password:</label>
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
          <label htmlFor="reg_confirm" style={{ display: 'block' }}>Confirm Password:</label>
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
            I accept the Terms of Service
          </label>
        </div>

        <button type="submit">Zarejestruj się</button>
      </form>

      {status && <p style={{ marginTop: '10px', fontWeight: 'bold' }}>{status}</p>}
    </div>
  );
}

const styles = {
  hr: { borderColor: '#333', margin: '30px 0' }
};
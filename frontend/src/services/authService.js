const API_BASE = 'http://localhost:80/auth';

export const authService = {

  async register(username, email, password, tos_accepted) {
    const res = await fetch(`${API_BASE}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password, tos_accepted })
    });
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.detail || 'Registration error');
    }
    return res.json();
  },
  
  async login(usernameOrEmail, password) {
    const res = await fetch(`${API_BASE}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        username_or_email: usernameOrEmail,
        password: password 
      })
    });
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.detail || 'Incorrect username/email or password');
    }
    return res.json(); // Zwróci {"access_token": "...", "token_type": "bearer"}
  },
}
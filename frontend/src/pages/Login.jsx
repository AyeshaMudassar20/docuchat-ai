import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Login.css';
import { API_URL } from '../config';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.detail || 'Login failed');
        return;
      }

      localStorage.setItem('token', data.access_token);
      navigate('/dashboard');
      console.log('Login successful! Token saved:', data.access_token);
    } catch (err) {
      setError('Could not connect to server');
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-branding">
        <div className="auth-branding-icon">📄</div>
        <div className="auth-branding-title">DocuChat AI</div>
        <p className="auth-branding-subtitle">
          Upload your documents and chat with them using AI. Get instant, accurate answers grounded in your own files.
        </p>
        <div className="auth-feature-list">
          <div className="auth-feature">
            <span className="auth-feature-icon">📎</span>
            <span>Upload PDFs and extract knowledge instantly</span>
          </div>
          <div className="auth-feature">
            <span className="auth-feature-icon">🤖</span>
            <span>Powered by Google Gemini AI</span>
          </div>
          <div className="auth-feature">
            <span className="auth-feature-icon">🔒</span>
            <span>Your conversations stay private and secure</span>
          </div>
        </div>
      </div>

      <div className="auth-form-side">
        <form className="auth-card" onSubmit={handleSubmit}>
          <h2 className="auth-title">Welcome Back</h2>

          {error && <p className="auth-error">{error}</p>}

          <input
            className="auth-input"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            className="auth-input"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button className="auth-button" type="submit">Login</button>

          <p className="auth-link">
            Don't have an account? <Link to="/signup">Sign up</Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Login;
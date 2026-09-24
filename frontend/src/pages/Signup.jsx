import { useState } from 'react';
import { Link } from 'react-router-dom';
import './Login.css';

function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      const response = await fetch('http://localhost:8000/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.detail || 'Signup failed');
        return;
      }

      setSuccess(true);
      console.log('Signup successful:', data);
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
          Create your account and start chatting with your documents in seconds.
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
          <h2 className="auth-title">Create Account</h2>

          {error && <p className="auth-error">{error}</p>}
          {success && <p className="auth-success">Account created! You can now log in.</p>}

          <input
            className="auth-input"
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

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

          <input
            className="auth-input"
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />

          <button className="auth-button" type="submit">Signup</button>

          <p className="auth-link">
            Already have an account? <Link to="/login">Login</Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Signup;
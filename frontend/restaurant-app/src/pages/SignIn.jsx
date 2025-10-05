// src/pages/SignIn.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function SignIn() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 1500)); // fake API
      localStorage.setItem('restaurant_token', 'dummy-token');
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  /* ----------  inline styles  ---------- */
  const styles = {
    page: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      backgroundColor: '#f5f7fa',
      margin: 0,
      padding: 16,
      boxSizing: 'border-box',
    },
    card: {
      width: '100%',
      maxWidth: 400,
      backgroundColor: '#fff',
      padding: '32px 40px',
      borderRadius: 8,
      boxShadow: '0 4px 12px rgba(0,0,0,.15)',
    },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 8, color: '#333' },
    subtitle: { fontSize: 14, color: '#666', marginBottom: 24 },
    input: {
      width: '100%',
      padding: '10px 12px',
      marginBottom: 16,
      border: '1px solid #ccc',
      borderRadius: 4,
      fontSize: 14,
    },
    button: {
      width: '100%',
      padding: '12px 0',
      backgroundColor: loading ? '#90cdf4' : '#3182ce',
      color: '#fff',
      border: 'none',
      borderRadius: 4,
      fontSize: 16,
      cursor: loading ? 'not-allowed' : 'pointer',
    },
    link: { color: '#3182ce', textDecoration: 'none' },
  };

  /* ----------  JSX  ---------- */
  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h2 style={styles.title}>Sign In to TableTreats Partner</h2>
        <p style={styles.subtitle}>Welcome back! Sign in to your account.</p>

        {error && <p style={{ color: 'red', marginBottom: 12 }}>{error}</p>}

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            name="email"
            placeholder="Email Address *"
            required
            value={form.email}
            onChange={handleChange}
            style={styles.input}
          />
          <input
            type="password"
            name="password"
            placeholder="Password *"
            required
            value={form.password}
            onChange={handleChange}
            style={styles.input}
          />
          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 16, fontSize: 13 }}>
          Don't have an account?{' '}
          <Link to="/signup" style={styles.link}>
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
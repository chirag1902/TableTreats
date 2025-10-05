// src/pages/SignUp.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function SignUp() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    restaurant_name: '',
    email: '',
    password: '',
    phone_number: '',
    address: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      // fake API call --------------------------------------------------
      await new Promise((r) => setTimeout(r, 1500));
      localStorage.setItem('restaurant_token', 'dummy-token');
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  /* ----------  tiny inline styles  ---------- */
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
        <h2 style={styles.title}>Create Account</h2>
        <p style={styles.subtitle}>Sign up to get started</p>

        {error && <p style={{ color: 'red', marginBottom: 12 }}>{error}</p>}

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="restaurant_name"
            placeholder="Restaurant Name *"
            required
            value={form.restaurant_name}
            onChange={handleChange}
            style={styles.input}
          />
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
          <input
            type="text"
            name="phone_number"
            placeholder="Phone (optional)"
            value={form.phone_number}
            onChange={handleChange}
            style={styles.input}
          />
          <input
            type="text"
            name="address"
            placeholder="Address (optional)"
            value={form.address}
            onChange={handleChange}
            style={styles.input}
          />

          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? 'Creating account…' : 'Sign Up'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 16, fontSize: 13 }}>
          Already have an account?{' '}
          <Link to="/" style={styles.link}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
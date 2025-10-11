// src/pages/Landing.jsx
import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Landing() {
  const nav = useNavigate();
  const featuresRef = useRef(null);
  const howItWorksRef = useRef(null);
  const pricingRef = useRef(null);

  const scrollTo = (ref) => {
    ref.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const styles = {
    page: {
      fontFamily: "'Poppins', sans-serif",
      color: '#222',
      backgroundColor: '#fff',
      margin: 0,
      padding: 0,
      overflowX: 'hidden',
      width: '100vw',
      boxSizing: 'border-box',
    },
    hero: {
      background: "linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url('/src/assets/auth-side.png')",
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      color: '#fff',
      textAlign: 'center',
      padding: '80px 20px',
      height: '100dvh',
      width: '100vw',
      position: 'relative',
      left: 0,
      top: 0,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      boxSizing: 'border-box',
      overflow: 'hidden',
      margin: 0,
    },
    heroTitle: {
      fontSize: 'clamp(2rem, 6vw, 3.5rem)',
      fontWeight: 700,
      marginBottom: 16,
      lineHeight: 1.2,
    },
    heroText: {
      maxWidth: 700,
      fontSize: 'clamp(0.9rem, 1.2vw, 1.1rem)',
      opacity: 0.9,
      marginBottom: 32,
      lineHeight: 1.6,
    },
    heroButtons: {
      display: 'flex',
      gap: 16,
      flexWrap: 'wrap',
      justifyContent: 'center',
    },
    buttonPrimary: {
      backgroundColor: '#fff',
      color: '#6d28d9',
      border: 'none',
      borderRadius: 8,
      padding: '14px 28px',
      fontSize: 16,
      fontWeight: 600,
      cursor: 'pointer',
      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
      boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
    },
    buttonSecondary: {
      backgroundColor: 'transparent',
      color: '#fff',
      border: '2px solid #fff',
      borderRadius: 8,
      padding: '14px 28px',
      fontSize: 16,
      fontWeight: 600,
      cursor: 'pointer',
      transition: 'transform 0.2s ease, background-color 0.3s ease',
    },
    section: {
      padding: '80px 24px',
      maxWidth: 1100,
      margin: '0 auto',
      textAlign: 'center',
      width: '100%',
      boxSizing: 'border-box',
    },
    sectionHeading: {
      fontSize: 28,
      fontWeight: 700,
      marginBottom: 24,
      color: '#4c1d95',
    },
    sectionText: {
      maxWidth: 800,
      margin: '0 auto 40px',
      fontSize: 16,
      color: '#555',
      lineHeight: 1.7,
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
      gap: 32,
      marginTop: 20,
      width: '100%',
      boxSizing: 'border-box',
    },
    card: {
      backgroundColor: '#f9f8ff',
      padding: 24,
      borderRadius: 12,
      boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
      textAlign: 'left',
    },
    cardTitle: {
      fontSize: 18,
      fontWeight: 600,
      marginBottom: 8,
      color: '#6d28d9',
    },
    cardText: { fontSize: 15, color: '#444', lineHeight: 1.6 },
    pricing: {
      backgroundColor: '#f3e8ff',
      padding: '100px 24px',
      textAlign: 'center',
      width: '100%',
      boxSizing: 'border-box',
    },
    priceTag: {
      fontSize: 36,
      fontWeight: 700,
      margin: '8px 0',
      color: '#4c1d95',
    },
    footer: {
      backgroundColor: '#2e1065',
      color: '#fff',
      textAlign: 'center',
      padding: '32px 16px',
      fontSize: 14,
      width: '100%',
    },
  };

  return (
    <div style={styles.page}>
      {/* ---------- HERO ---------- */}
      <section style={styles.hero}>
        <h1 style={styles.heroTitle}>Bring More Guests to Your Tables </h1>
        <p style={styles.heroText}>
          TableTreats Partner helps restaurants grow dine-in traffic through
          real-time reservations, local discovery, and smart deals  all without
          commissions or hidden costs. Boost your visibility and fill every seat.
        </p>
        <div style={styles.heroButtons}>
          <button
            style={styles.buttonPrimary}
            onMouseEnter={(e) => (e.target.style.transform = 'scale(1.05)')}
            onMouseLeave={(e) => (e.target.style.transform = 'scale(1)')}
            onClick={() => nav('/signin')}
          >
             Get Started Free
          </button>
          <button
            style={styles.buttonSecondary}
            onMouseEnter={(e) => (e.target.style.backgroundColor = 'rgba(255,255,255,0.2)')}
            onMouseLeave={(e) => (e.target.style.backgroundColor = 'transparent')}
            onClick={() => scrollTo(featuresRef)}
          >
            Learn More ↓
          </button>
        </div>
      </section>

      {/* ---------- WHY JOIN ---------- */}
      <section ref={featuresRef} style={styles.section}>
        <h2 style={styles.sectionHeading}>Why Restaurants Choose TableTreats </h2>
        <p style={styles.sectionText}>
          In a delivery-dominated world, dine-in often gets left behind.
          TableTreats brings people back to the table helping restaurants
          attract guests, manage tables, and promote offers in real time.
        </p>

        <div style={styles.grid}>
          <div style={styles.card}>
            <h4 style={styles.cardTitle}>💰 Zero Commission Model</h4>
            <p style={styles.cardText}>
              Keep 100% of your revenue. We only charge a flat fee no hidden
              cuts or surprise costs.
            </p>
          </div>
          <div style={styles.card}>
            <h4 style={styles.cardTitle}>📈 Boost Visibility</h4>
            <p style={styles.cardText}>
              Get discovered by local diners searching by cuisine, vibe, or
              deals. Perfect for independent restaurants.
            </p>
          </div>
          <div style={styles.card}>
            <h4 style={styles.cardTitle}>⚡ Smart Deals & Flash Offers</h4>
            <p style={styles.cardText}>
              Launch happy-hour or off-peak promos instantly to keep your tables
              full every day.
            </p>
          </div>
        </div>
      </section>

      {/* ---------- HOW IT WORKS ---------- */}
      <section ref={howItWorksRef} style={styles.section}>
        <h2 style={styles.sectionHeading}>How It Works 🪄</h2>
        <p style={styles.sectionText}>
          Simple to set up, powerful in impact. Get started in minutes.
        </p>
        <div style={styles.grid}>
          <div style={styles.card}>
            <h4 style={styles.cardTitle}>📝 Create Your Profile</h4>
            <p style={styles.cardText}>
              Add your restaurant info, menu, and hours. No tech skills needed!
            </p>
          </div>
          <div style={styles.card}>
            <h4 style={styles.cardTitle}>🎯 Set Deals & Availability</h4>
            <p style={styles.cardText}>
              Control reservations and run exclusive offers anytime.
            </p>
          </div>
          <div style={styles.card}>
            <h4 style={styles.cardTitle}>👀 Get Discovered</h4>
            <p style={styles.cardText}>
              Appear in local search results for diners near you.
            </p>
          </div>
          <div style={styles.card}>
            <h4 style={styles.cardTitle}>📊 Track & Grow</h4>
            <p style={styles.cardText}>
              Monitor occupancy, reservations, and deal performance in real time.
            </p>
          </div>
        </div>
      </section>

      {/* ---------- PRICING ---------- */}
      <section ref={pricingRef} style={styles.pricing}>
        <h2 style={styles.sectionHeading}>Simple Pricing, Big Results </h2>
        <p style={styles.sectionText}>
          No commissions. No surprises. Just more guests and steady growth.
        </p>
        <p style={styles.priceTag}>$49 / month</p>
        <p style={styles.sectionText}>
          Unlimited reservations, promos, and analytics cancel anytime.
        </p>
        <button
          style={styles.buttonPrimary}
          onClick={() => nav('/signin')}
        >
          Start Free Trial
        </button>
      </section>

      {/* ---------- CTA ---------- */}
      <section style={styles.section}>
        <h2 style={styles.sectionHeading}>Ready to Bring More Guests to Your Tables? 🍷</h2>
        <p style={styles.sectionText}>
          Join TableTreats Partner the dine-in growth platform built for modern
          restaurants. Quick setup, instant results.
        </p>
        <button style={styles.buttonPrimary} onClick={() => nav('/signin')}>
           Become a Partner
        </button>
      </section>

      {/* ---------- FOOTER ---------- */}
      <footer style={styles.footer}>
        © 2025 TableTreats | partner@tabletreats.com | Terms • Privacy
      </footer>
    </div>
  );
}

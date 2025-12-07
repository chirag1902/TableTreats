import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { restaurantLogin } from "../api/restaurant";
import sideImg from "../assets/auth-side.png";

export default function SignIn() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [hover, setHover] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    console.log("🔐 Attempting login with:", {
      email: form.email,
      passwordLength: form.password.length,
    });

    try {
      const data = await restaurantLogin(form);
      console.log("✅ Login response:", data);

      // Backend returns "msg" not "message"
      setSuccess(data.msg || data.message || "Login successful!");

      // Check if user is onboarded
      if (data.is_onboarded) {
        console.log("✅ User is onboarded, redirecting to dashboard");
        setTimeout(() => navigate("/dashboard"), 1500);
      } else {
        console.log("⚠️ User not onboarded, redirecting to onboarding");
        setTimeout(() => navigate("/onboarding"), 1500);
      }
    } catch (err) {
      console.error("❌ Login error:", err);
      console.error("❌ Error response:", err.response?.data);
      setError(
        err.response?.data?.detail || "Invalid credentials. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // ---------- styles ----------
  const container = {
    height: "100vh",
    width: "100vw",
    backgroundImage: `url(${sideImg})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    overflow: "hidden",
    fontFamily: "'Poppins', sans-serif",
  };

  const overlay = {
    position: "absolute",
    inset: 0,
    background: "rgba(0, 0, 0, 0.55)",
    backdropFilter: "blur(4px)",
  };

  const card = {
    position: "relative",
    zIndex: 2,
    width: "100%",
    maxWidth: 420,
    background: "rgba(255, 255, 255, 0.15)",
    borderRadius: 16,
    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
    backdropFilter: "blur(15px)",
    padding: 40,
    textAlign: "center",
    color: "#fff",
  };

  const title = {
    fontSize: 28,
    fontWeight: 600,
    marginBottom: 10,
  };

  const subtitle = {
    fontSize: 14,
    color: "#eee",
    marginBottom: 30,
  };

  const input = {
    width: "100%",
    padding: "12px 14px",
    marginBottom: 18,
    border: "none",
    borderRadius: 8,
    fontSize: 15,
    background: "rgba(255,255,255,0.85)",
    outline: "none",
    color: "#333",
  };

  const passwordContainer = {
    position: "relative",
    width: "100%",
    marginBottom: 18,
  };

  const passwordInput = {
    width: "100%",
    padding: "12px 40px 12px 14px",
    border: "none",
    borderRadius: 8,
    fontSize: 15,
    background: "rgba(255,255,255,0.85)",
    outline: "none",
    color: "#333",
  };

  const eyeButton = {
    position: "absolute",
    right: 12,
    top: "50%",
    transform: "translateY(-50%)",
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: 4,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#666",
  };

  const button = {
    width: "100%",
    padding: "12px 0",
    border: "none",
    borderRadius: 8,
    fontSize: 16,
    fontWeight: 600,
    color: "#fff",
    backgroundColor: hover ? "#2c5282" : "#3182ce",
    cursor: loading ? "not-allowed" : "pointer",
    transition: "0.3s ease",
  };

  const link = {
    color: "#90cdf4",
    textDecoration: "none",
    fontWeight: 500,
  };

  return (
    <div style={container}>
      <div style={overlay}></div>

      <div style={card}>
        <h2 style={title}>Sign In to TableTreats Partner</h2>
        <p style={subtitle}>Welcome back! Sign in to your account.</p>

        {error && (
          <p style={{ color: "#ff6b6b", marginBottom: 12, fontSize: 14 }}>
            {error}
          </p>
        )}
        {success && (
          <p style={{ color: "#51cf66", marginBottom: 12, fontSize: 14 }}>
            {success}
          </p>
        )}

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            name="email"
            placeholder="Email Address *"
            required
            value={form.email}
            onChange={handleChange}
            style={input}
            autoComplete="email"
          />

          <div style={passwordContainer}>
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password *"
              required
              value={form.password}
              onChange={handleChange}
              style={passwordInput}
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={eyeButton}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
              ) : (
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          </div>

          <button
            type="submit"
            style={button}
            disabled={loading}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
          >
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>

        <p style={{ marginTop: 20, fontSize: 14 }}>
          Don't have an account?{" "}
          <Link to="/signup" style={link}>
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}

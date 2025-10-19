import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { restaurantLogin } from "../api/restaurant"; // ✅ connect to backend
import sideImg from "../assets/auth-side.png"; // background image

export default function SignIn() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [hover, setHover] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      const data = await restaurantLogin(form);

      // backend should return something like { message: "Login successful" }
      setSuccess(data.message || "Login successful!");
      // Redirect to dashboard
      setTimeout(() => navigate("/dashboard"), 1500);
    } catch (err) {
      console.error("Login error:", err);
      setError(err.response?.data?.detail || "Invalid credentials");
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
    color: "#333"
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

        {error && <p style={{ color: "salmon", marginBottom: 12 }}>{error}</p>}
        {success && <p style={{ color: "#90ee90", marginBottom: 12 }}>{success}</p>}

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            name="email"
            placeholder="Email Address *"
            required
            value={form.email}
            onChange={handleChange}
            style={input}
          />
          <input
            type="password"
            name="password"
            placeholder="Password *"
            required
            value={form.password}
            onChange={handleChange}
            style={input}
          />
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
          Don’t have an account?{" "}
          <Link to="/signup" style={link}>
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}

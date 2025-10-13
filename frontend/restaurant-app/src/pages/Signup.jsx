import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { restaurantSignup } from "../api/restaurant"; // your backend API call
import sideImg from "../assets/auth-side.png"; // background image

export default function SignUp() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    restaurant_name: "",
    email: "",
    password: "",
    phone_number: "",
    address: "",
  });
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
      const data = await restaurantSignup(form);
      setSuccess(data.message || "Restaurant registered successfully!");
      // Redirect after a short delay
      setTimeout(() => navigate("/signin"), 2000);
    } catch (err) {
      console.error("Signup error:", err);
      setError(
        err.response?.data?.detail || "Signup failed. Please try again."
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
    backdropFilter: "blur(5px)",
  };

  const card = {
    position: "relative",
    zIndex: 2,
    width: "100%",
    maxWidth: 450,
    background: "rgba(255, 255, 255, 0.15)",
    borderRadius: 16,
    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
    backdropFilter: "blur(15px)",
    padding: "40px 36px",
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
    marginBottom: 28,
  };

  const input = {
    width: "100%",
    padding: "12px 14px",
    marginBottom: 16,
    border: "none",
    borderRadius: 8,
    fontSize: 15,
    background: "rgba(255,255,255,0.85)",
    outline: "none",
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
        <h2 style={title}>Create Account</h2>
        <p style={subtitle}>Sign up to get started</p>

        {error && <p style={{ color: "salmon", marginBottom: 12 }}>{error}</p>}
        {success && <p style={{ color: "#90ee90", marginBottom: 12 }}>{success}</p>}

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="restaurant_name"
            placeholder="Restaurant Name *"
            required
            value={form.restaurant_name}
            onChange={handleChange}
            style={input}
          />
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
          <input
            type="text"
            name="phone_number"
            placeholder="Phone (optional)"
            value={form.phone_number}
            onChange={handleChange}
            style={input}
          />
          <input
            type="text"
            name="address"
            placeholder="Address (optional)"
            value={form.address}
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
            {loading ? "Creating account…" : "Sign Up"}
          </button>
        </form>

        <p style={{ marginTop: 20, fontSize: 14 }}>
          Already have an account?{" "}
          <Link to="/signin" style={link}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

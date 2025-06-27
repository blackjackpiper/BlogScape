import { useState } from "react";
import axios from "axios";

export default function AuthForm({ setToken }) {
  const [mode, setMode] = useState("signup");
  const [form, setForm] = useState({ username: "", email: "", password: "" });

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = `${import.meta.env.VITE_API_URL}/${mode}`;
    const data = new FormData();

    if (mode === "signup") data.append("username", form.username);
    data.append("email", form.email);
    data.append("password", form.password);

    try {
      const res = await axios.post(url, data);
      if (mode === "login") {
        setToken(res.data.token);
        localStorage.setItem("token", res.data.token);
      } else {
        alert("Signup successful. Please login.");
        setMode("login");
      }
    } catch (err) {
      alert(err.response?.data?.detail || "Error occurred");
    }
  };

  return (
    <>
    <nav className="navbar">
        <div className="navbar-title">BlogScape</div>
      </nav>
      
    <div className="container">
    
      {/* Rest of the form content */}
      <h2 >
        {mode === "signup" ? "Sign Up" : "Login"}
      </h2>
      <form onSubmit={handleSubmit}>
        {mode === "signup" && (
          <input
            name="username"
            placeholder="Username"
            value={form.username}
            onChange={handleChange}
            required
          />
        )}
        <input
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          required
        />
        <button type="submit">{mode === "signup" ? "Sign Up" : "Login"}</button>
        <button type="button" onClick={() => setMode(mode === "signup" ? "login" : "signup")}>
          Switch to {mode === "signup" ? "Login" : "Sign Up"}
        </button>
      </form>
    </div>
    </>
  );
}

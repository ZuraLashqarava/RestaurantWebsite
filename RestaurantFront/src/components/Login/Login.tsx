import { useState } from "react";
import "./Login.scss";
import cityBg from "./City.avif";
import { useAuth } from "./Authcontext";

type Mode = "login" | "register";

interface AuthResponse {
  token: string;
  user: {
    id: number;
    name: string;
    lastName: string;
    email: string;
  };
}

const Login = () => {
  const { login } = useAuth();

  const [mode, setMode]         = useState<Mode>("login");
  const [name, setName]         = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  const resetFields = () => {
    setName("");
    setLastName("");
    setEmail("");
    setPassword("");
    setError("");
  };

  const handleModeSwitch = (newMode: Mode) => {
    setMode(newMode);
    resetFields();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const url =
        mode === "login"
          ? "https://localhost:7035/api/auth/login"
          : "https://localhost:7035/api/auth/register";

      const body =
        mode === "login"
          ? { email, password }
          : { name, lastName, email, password };

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const message = await response.text();
        setError(message || "Something went wrong.");
        return;
      }

      const data: AuthResponse = await response.json();
      login(data.token, data.user);
      window.location.href = "/";
    } catch {
      setError("Could not connect to server. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="auth-page"
      style={{
        backgroundImage: `url(${cityBg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="auth-card">
        <div className="auth-card__tabs">
          <button
            className={`auth-card__tab ${mode === "register" ? "auth-card__tab--active" : ""}`}
            onClick={() => handleModeSwitch("register")}
          >
            Register
          </button>

          <button
            className={`auth-card__tab ${mode === "login" ? "auth-card__tab--active" : ""}`}
            onClick={() => handleModeSwitch("login")}
          >
            Login
          </button>

          <span
            className="auth-card__tab-indicator"
            style={{
              transform: mode === "login" ? "translateX(100%)" : "translateX(0%)",
            }}
          />
        </div>

        <div className="auth-card__header">
          <h2 className="auth-card__title">
            {mode === "login" ? "Welcome back" : "Create account"}
          </h2>
          <p className="auth-card__subtitle">
            {mode === "login"
              ? "Sign in to your GeorgianCuisine account"
              : "Join us and explore Georgian flavours"}
          </p>
        </div>

        <form className="auth-card__form" onSubmit={handleSubmit}>
          {mode === "register" && (
            <>
              <div className="auth-field">
                <label className="auth-field__label">Name</label>
                <input
                  className="auth-field__input"
                  type="text"
                  placeholder="e.g. Giorgi"
                  autoComplete="given-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="auth-field">
                <label className="auth-field__label">Last Name</label>
                <input
                  className="auth-field__input"
                  type="text"
                  placeholder="e.g. Beridze"
                  autoComplete="family-name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </div>
            </>
          )}

          <div className="auth-field">
            <label className="auth-field__label">Email</label>
            <input
              className="auth-field__input"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="auth-field">
            <label className="auth-field__label">Password</label>
            <input
              className="auth-field__input"
              type="password"
              placeholder="••••••••"
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <p className="auth-card__error">{error}</p>}

          <button type="submit" className="auth-card__submit" disabled={loading}>
            {loading ? "Please wait..." : mode === "login" ? "Sign In" : "Create Account"}
          </button>
        </form>

        <p className="auth-card__switch">
          {mode === "login" ? "Don't have an account?" : "Already have an account?"}

          <button
            className="auth-card__switch-btn"
            onClick={() => handleModeSwitch(mode === "login" ? "register" : "login")}
          >
            {mode === "login" ? "Register" : "Log in"}
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;
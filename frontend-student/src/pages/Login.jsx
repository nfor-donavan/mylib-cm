import { useState } from "react";
import { useTranslation } from "react-i18next";
import api from "../api";

export default function Login({ onLogin }) {
  const { t } = useTranslation();
  const [subdomain, setSubdomain] = useState("");
  const [matricule, setMatricule] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { data } = await api.post("/auth/login", { subdomain, matricule, password });
      onLogin(data.token);
    } catch (err) {
      setError(err.response?.data?.error || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.iconWrap}>
          <img src="/icon.png" alt="" style={styles.icon} />
        </div>
        <h1 style={styles.title}>MyLib CM</h1>
        <p style={styles.subtitle}>{t("login.title")}</p>

        <form onSubmit={handleSubmit} style={{ marginTop: 10 }}>
          {error && <div className="banner warn">{error}</div>}

          <label style={styles.label}>{t("login.subdomain")}</label>
          <input value={subdomain} onChange={(e) => setSubdomain(e.target.value)} placeholder="e.g. sevic" required style={{ marginBottom: 14 }} />

          <label style={styles.label}>{t("login.matricule")}</label>
          <input value={matricule} onChange={(e) => setMatricule(e.target.value)} required style={{ marginBottom: 14 }} />

          <label style={styles.label}>{t("login.password")}</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ marginBottom: 22 }} />

          <button className="primary" type="submit" disabled={loading} style={{ width: "100%", padding: "12px 0" }}>
            {loading ? "Signing in…" : t("login.submit")}
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "radial-gradient(circle at top, #1c3a7a, #0b1f4d 70%)",
    padding: 20,
  },
  card: {
    width: "100%",
    maxWidth: 380,
    background: "#fff",
    borderRadius: 18,
    padding: "36px 30px",
    boxShadow: "0 30px 60px rgba(11, 31, 77, 0.35)",
    textAlign: "center",
  },
  iconWrap: { display: "flex", justifyContent: "center", marginBottom: 14 },
  icon: { width: 56, height: 56, borderRadius: 13 },
  title: { margin: "0 0 4px", fontSize: 20, color: "#1a1f36" },
  subtitle: { margin: "0 0 18px", fontSize: 13, color: "#626b85" },
  label: { fontSize: 13, color: "#626b85", display: "block", marginBottom: 6, textAlign: "left" },
};

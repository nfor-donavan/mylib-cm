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
      <div style={styles.panelWrap}>
        <div style={styles.brandPanel}>
          <img src="/icon.png" alt="" style={styles.brandIcon} />
          <h1 style={styles.brandTitle}>MyLib CM</h1>
          <p style={styles.brandTagline}>
            Catalog, checkout, and inventory — built for school librarians across Cameroon.
          </p>
          <ul style={styles.featureList}>
            <li>Barcode scanner checkout</li>
            <li>Works offline through power cuts</li>
            <li>English / Français</li>
          </ul>
        </div>

        <form onSubmit={handleSubmit} style={styles.formPanel}>
          <h2 style={styles.formTitle}>{t("login.title")}</h2>
          <p style={styles.formSubtitle}>Sign in with your school's credentials</p>

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
    background: "linear-gradient(135deg, #0b1f4d 0%, #142b63 60%, #1c3a7a 100%)",
    padding: 20,
  },
  panelWrap: {
    display: "flex",
    width: "100%",
    maxWidth: 860,
    borderRadius: 16,
    overflow: "hidden",
    boxShadow: "0 30px 60px rgba(11, 31, 77, 0.35)",
  },
  brandPanel: {
    flex: "0 0 42%",
    background: "linear-gradient(160deg, #0b1f4d, #1f9d6b)",
    color: "#fff",
    padding: "44px 34px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
  },
  brandIcon: { width: 52, height: 52, borderRadius: 12, marginBottom: 18 },
  brandTitle: { fontSize: 26, margin: "0 0 8px" },
  brandTagline: { fontSize: 14, lineHeight: 1.5, opacity: 0.9, margin: "0 0 22px" },
  featureList: { listStyle: "none", padding: 0, margin: 0, fontSize: 13, opacity: 0.85, lineHeight: 2.2 },
  formPanel: { flex: 1, background: "#fff", padding: "44px 38px" },
  formTitle: { margin: "0 0 4px", fontSize: 20, color: "#1a1f36" },
  formSubtitle: { margin: "0 0 22px", fontSize: 13, color: "#626b85" },
  label: { fontSize: 13, color: "#626b85", display: "block", marginBottom: 6 },
};

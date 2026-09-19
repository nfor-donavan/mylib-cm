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
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--navy)", padding: 20 }}>
      <form onSubmit={handleSubmit} className="card" style={{ width: "100%", maxWidth: 340 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
          <img src="/icon.png" alt="" style={{ width: 40, height: 40, borderRadius: 9 }} />
          <h2 style={{ margin: 0, fontSize: 18 }}>{t("login.title")}</h2>
        </div>

        {error && <div className="banner warn">{error}</div>}

        <label>{t("login.subdomain")}</label>
        <input value={subdomain} onChange={(e) => setSubdomain(e.target.value)} placeholder="ghsbuea" required style={{ marginBottom: 12 }} />

        <label>{t("login.matricule")}</label>
        <input value={matricule} onChange={(e) => setMatricule(e.target.value)} required style={{ marginBottom: 12 }} />

        <label>{t("login.password")}</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ marginBottom: 18 }} />

        <button className="primary" type="submit" disabled={loading} style={{ width: "100%" }}>
          {loading ? "..." : t("login.submit")}
        </button>
      </form>
    </div>
  );
}

import { useState } from "react";
import { Routes, Route, NavLink, Navigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { setLanguage } from "./i18n";
import Login from "./pages/Login";
import MyBooks from "./pages/MyBooks";
import Catalog from "./pages/Catalog";
import Downloads from "./pages/Downloads";

export default function App() {
  const { t, i18n } = useTranslation();
  const [token, setToken] = useState(() => localStorage.getItem("student_token"));

  if (!token) {
    return <Login onLogin={(tok) => { localStorage.setItem("student_token", tok); setToken(tok); }} />;
  }

  function logout() {
    localStorage.removeItem("student_token");
    setToken(null);
  }

  return (
    <div className="mobile-shell">
      <div className="topbar">
        <div className="brand">
          <img src="/icon.png" alt="" />
          <span>{t("appName")}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div className="lang-switch">
            <button className={i18n.language === "en" ? "active" : ""} onClick={() => setLanguage("en")}>EN</button>
            {" / "}
            <button className={i18n.language === "fr" ? "active" : ""} onClick={() => setLanguage("fr")}>FR</button>
          </div>
          <button onClick={logout} style={{ background: "none", border: "none", color: "#c7d0ea", fontSize: 12, cursor: "pointer" }}>
            {t("nav.logout")}
          </button>
        </div>
      </div>

      <div className="content">
        <Routes>
          <Route path="/" element={<MyBooks />} />
          <Route path="/catalog" element={<Catalog />} />
          <Route path="/downloads" element={<Downloads />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>

      <nav className="tabbar">
        <NavLink to="/" end>{t("nav.home")}</NavLink>
        <NavLink to="/catalog">{t("nav.catalog")}</NavLink>
        <NavLink to="/downloads">{t("nav.downloads")}</NavLink>
      </nav>
    </div>
  );
}

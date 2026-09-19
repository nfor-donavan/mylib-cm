import { useEffect, useState } from "react";
import { Routes, Route, NavLink, Navigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { setLanguage } from "./i18n";
import { registerAutoSync } from "./offline/sync";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Checkout from "./pages/Checkout";
import Catalog from "./pages/Catalog";
import Students from "./pages/Students";
import Reservations from "./pages/Reservations";
import Fines from "./pages/Fines";
import Schools from "./pages/Schools";

export default function App() {
  const { t, i18n } = useTranslation();
  const [token, setToken] = useState(() => localStorage.getItem("librarian_token"));
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem("librarian_user");
    return raw ? JSON.parse(raw) : null;
  });
  const [syncBanner, setSyncBanner] = useState(null);

  useEffect(() => {
    if (!token || user?.role === "SuperAdmin") return;
    const unregister = registerAutoSync((result) => {
      if (result.synced > 0) {
        setSyncBanner(`Synced ${result.synced} offline checkout(s)`);
        setTimeout(() => setSyncBanner(null), 4000);
      }
    });
    return unregister;
  }, [token, user]);

  function handleLogin(tok, userData) {
    localStorage.setItem("librarian_token", tok);
    localStorage.setItem("librarian_user", JSON.stringify(userData));
    setToken(tok);
    setUser(userData);
  }

  if (!token || !user) {
    return <Login onLogin={handleLogin} />;
  }

  function logout() {
    localStorage.removeItem("librarian_token");
    localStorage.removeItem("librarian_user");
    setToken(null);
    setUser(null);
  }

  const isSuperAdmin = user.role === "SuperAdmin";

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <img src="/icon.png" alt="MyLib CM" />
          <span>{t("appName")}</span>
        </div>
        <nav>
          {isSuperAdmin ? (
            <NavLink to="/" end>{t("nav.schools")}</NavLink>
          ) : (
            <>
              <NavLink to="/" end>{t("nav.dashboard")}</NavLink>
              <NavLink to="/checkout">{t("nav.checkout")}</NavLink>
              <NavLink to="/catalog">{t("nav.catalog")}</NavLink>
              <NavLink to="/students">{t("nav.students")}</NavLink>
              <NavLink to="/reservations">{t("nav.reservations")}</NavLink>
              <NavLink to="/fines">{t("nav.fines")}</NavLink>
            </>
          )}
        </nav>
        <div style={{ marginTop: "auto" }}>
          <div className="lang-switch">
            <button className={i18n.language === "en" ? "active" : ""} onClick={() => setLanguage("en")}>EN</button>
            {" / "}
            <button className={i18n.language === "fr" ? "active" : ""} onClick={() => setLanguage("fr")}>FR</button>
          </div>
          <div style={{ color: "#8f9ac2", fontSize: 12, marginTop: 10 }}>{user.fullName} · {user.role}</div>
          <button className="ghost" style={{ width: "100%", marginTop: 10 }} onClick={logout}>
            {t("nav.logout")}
          </button>
        </div>
      </aside>

      <main className="main">
        {syncBanner && <div className="banner success">{syncBanner}</div>}
        <Routes>
          {isSuperAdmin ? (
            <>
              <Route path="/" element={<Schools />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </>
          ) : (
            <>
              <Route path="/" element={<Dashboard />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/catalog" element={<Catalog />} />
              <Route path="/students" element={<Students />} />
              <Route path="/reservations" element={<Reservations />} />
              <Route path="/fines" element={<Fines />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </>
          )}
        </Routes>
      </main>
    </div>
  );
}

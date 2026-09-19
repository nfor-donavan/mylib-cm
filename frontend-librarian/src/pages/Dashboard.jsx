import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import api from "../api";
import { getPendingCheckouts } from "../offline/db";

export default function Dashboard() {
  const { t } = useTranslation();
  const [activeLoans, setActiveLoans] = useState(null);
  const [pendingOffline, setPendingOffline] = useState(0);

  useEffect(() => {
    api.get("/borrowing/active").then((res) => setActiveLoans(res.data.logs)).catch(() => setActiveLoans([]));
    getPendingCheckouts().then((rows) => setPendingOffline(rows.length));
  }, []);

  const overdueCount = activeLoans?.filter((l) => l.status === "Overdue").length ?? 0;

  return (
    <div>
      <div className="page-title">{t("nav.dashboard")}</div>

      {pendingOffline > 0 && (
        <div className="banner warn">
          {pendingOffline} checkout(s) recorded offline, waiting to sync.
        </div>
      )}

      <div style={{ display: "flex", gap: 16 }}>
        <div className="card" style={{ flex: 1 }}>
          <div style={{ color: "var(--text-muted)", fontSize: 13 }}>Active loans</div>
          <div style={{ fontSize: 28, fontWeight: 700 }}>{activeLoans === null ? "…" : activeLoans.length}</div>
        </div>
        <div className="card" style={{ flex: 1 }}>
          <div style={{ color: "var(--text-muted)", fontSize: 13 }}>Overdue</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: "var(--danger)" }}>{overdueCount}</div>
        </div>
        <div className="card" style={{ flex: 1 }}>
          <div style={{ color: "var(--text-muted)", fontSize: 13 }}>Pending offline sync</div>
          <div style={{ fontSize: 28, fontWeight: 700 }}>{pendingOffline}</div>
        </div>
      </div>

      <div className="card">
        <h3 style={{ marginTop: 0 }}>Loans due soonest</h3>
        <table>
          <thead>
            <tr><th>Book</th><th>Borrower</th><th>Due</th><th>Status</th></tr>
          </thead>
          <tbody>
            {(activeLoans || []).slice(0, 8).map((log) => (
              <tr key={log._id}>
                <td>{log.itemId?.bookId?.title || "—"}</td>
                <td>{log.userId?.fullName || log.userId}</td>
                <td>{new Date(log.expectedReturnDate).toLocaleDateString()}</td>
                <td><span className={`badge ${log.status === "Overdue" ? "overdue" : "borrowed"}`}>{log.status}</span></td>
              </tr>
            ))}
            {activeLoans?.length === 0 && (
              <tr><td colSpan={4} style={{ color: "var(--text-muted)" }}>No active loans</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

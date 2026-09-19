import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import api from "../api";

export default function MyBooks() {
  const { t } = useTranslation();
  const [loans, setLoans] = useState(null);
  const [reservations, setReservations] = useState(null);

  useEffect(() => {
    api.get("/borrowing/active").then((res) => setLoans(res.data.logs)).catch(() => setLoans([]));
    api.get("/reservations").then((res) => setReservations(res.data.reservations)).catch(() => setReservations([]));
  }, []);

  async function handleCancelReservation(id) {
    await api.patch(`/reservations/${id}/cancel`);
    setReservations((prev) => prev.filter((r) => r._id !== id));
  }

  return (
    <div>
      <h2 style={{ fontSize: 18 }}>{t("home.title")}</h2>

      {loans === null && <div className="card">Loading…</div>}
      {loans?.length === 0 && <div className="card">{t("home.noLoans")}</div>}

      <div className="cards-grid">
        {loans?.map((log) => (
          <div className="card" key={log._id}>
            <div style={{ fontWeight: 600 }}>{log.itemId?.bookId?.title}</div>
            <div style={{ fontSize: 13, color: "var(--text-muted)" }}>{log.itemId?.bookId?.author}</div>
            <div style={{ marginTop: 8 }}>
              {log.status === "Overdue" ? (
                <span className="badge overdue">
                  {t("home.overdue", { date: new Date(log.expectedReturnDate).toLocaleDateString() })}
                </span>
              ) : (
                <span className="badge borrowed">
                  {t("home.due", { date: new Date(log.expectedReturnDate).toLocaleDateString() })}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {reservations && reservations.length > 0 && (
        <>
          <h2 style={{ fontSize: 16, marginTop: 22 }}>{t("home.myReservations")}</h2>
          <div className="cards-grid">
            {reservations.map((r) => (
              <div className="card" key={r._id}>
                <div style={{ fontWeight: 600 }}>{r.bookId?.title}</div>
                <div style={{ fontSize: 13, color: "var(--text-muted)" }}>{r.bookId?.author}</div>
                <button className="ghost" style={{ marginTop: 10, width: "100%" }} onClick={() => handleCancelReservation(r._id)}>
                  {t("home.cancelReservation")}
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

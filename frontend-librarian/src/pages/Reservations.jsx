import { useEffect, useState } from "react";
import api from "../api";

export default function Reservations() {
  const [reservations, setReservations] = useState(null);
  const [message, setMessage] = useState(null);

  async function load() {
    const { data } = await api.get("/reservations");
    setReservations(data.reservations);
  }

  useEffect(() => { load(); }, []);

  async function handleFulfill(id) {
    try {
      await api.patch(`/reservations/${id}/fulfill`);
      setMessage({ type: "success", text: "Marked fulfilled — hand the copy to the student, then use Checkout to scan it out." });
      load();
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.error || "Failed to update reservation" });
    }
  }

  async function handleCancel(id) {
    try {
      await api.patch(`/reservations/${id}/cancel`);
      load();
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.error || "Failed to cancel reservation" });
    }
  }

  return (
    <div>
      <div className="page-title">Reservation queue</div>

      {message && <div className={`banner ${message.type === "success" ? "success" : "warn"}`}>{message.text}</div>}

      <div className="card">
        <table>
          <thead>
            <tr><th>Book</th><th>Student</th><th>Requested</th><th></th></tr>
          </thead>
          <tbody>
            {reservations?.map((r) => (
              <tr key={r._id}>
                <td>{r.bookId?.title}</td>
                <td>{r.userId?.fullName} ({r.userId?.matricule})</td>
                <td>{new Date(r.createdAt).toLocaleDateString()}</td>
                <td style={{ display: "flex", gap: 8 }}>
                  <button className="primary" onClick={() => handleFulfill(r._id)}>Mark fulfilled</button>
                  <button className="ghost" onClick={() => handleCancel(r._id)}>Cancel</button>
                </td>
              </tr>
            ))}
            {reservations?.length === 0 && (
              <tr><td colSpan={4} style={{ color: "var(--text-muted)" }}>No active reservations</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";
import api from "../api";

export default function Fines() {
  const [logs, setLogs] = useState(null);

  async function load() {
    const { data } = await api.get("/borrowing/fines");
    setLogs(data.logs);
  }

  useEffect(() => { load(); }, []);

  async function handlePay(id) {
    await api.patch(`/borrowing/${id}/pay-fine`);
    load();
  }

  const unpaidTotal = logs?.filter((l) => !l.finePaid).reduce((sum, l) => sum + l.fineAmountXAF, 0) ?? 0;

  return (
    <div>
      <div className="page-title">Fines</div>

      <div className="card">
        <div style={{ color: "var(--text-muted)", fontSize: 13 }}>Outstanding total</div>
        <div style={{ fontSize: 26, fontWeight: 700 }}>{unpaidTotal.toLocaleString()} XAF</div>
      </div>

      <div className="card">
        <table>
          <thead>
            <tr><th>Book</th><th>Borrower</th><th>Amount</th><th>Status</th><th></th></tr>
          </thead>
          <tbody>
            {logs?.map((log) => (
              <tr key={log._id}>
                <td>{log.itemId?.bookId?.title || "—"}</td>
                <td>{log.userId?.fullName} ({log.userId?.matricule})</td>
                <td>{log.fineAmountXAF.toLocaleString()} XAF</td>
                <td>
                  <span className={`badge ${log.finePaid ? "available" : "overdue"}`}>
                    {log.finePaid ? "Paid" : "Unpaid"}
                  </span>
                </td>
                <td>
                  {!log.finePaid && (
                    <button className="primary" onClick={() => handlePay(log._id)}>Mark paid</button>
                  )}
                </td>
              </tr>
            ))}
            {logs?.length === 0 && (
              <tr><td colSpan={5} style={{ color: "var(--text-muted)" }}>No fines on record</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

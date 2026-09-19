import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import api from "../api";

const emptyForm = { matricule: "", fullName: "", phoneNumber: "", currentClass: "", password: "" };

export default function Students() {
  const { t } = useTranslation();
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState(null);
  const [students, setStudents] = useState([]);
  const [resettingId, setResettingId] = useState(null);
  const [newPassword, setNewPassword] = useState("");

  async function loadStudents() {
    const { data } = await api.get("/users", { params: { role: "Student" } });
    setStudents(data.users);
  }

  useEffect(() => { loadStudents(); }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      await api.post("/auth/register-student", form);
      setMessage({ type: "success", text: `${form.fullName} added` });
      setForm(emptyForm);
      setShowForm(false);
      loadStudents();
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.error || "Failed to add student" });
    }
  }

  async function handleResetPassword(studentId) {
    if (!newPassword || newPassword.length < 4) {
      setMessage({ type: "error", text: "Password must be at least 4 characters" });
      return;
    }
    try {
      await api.patch(`/users/${studentId}/reset-password`, { newPassword });
      setMessage({ type: "success", text: "Password reset" });
      setResettingId(null);
      setNewPassword("");
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.error || "Failed to reset password" });
    }
  }

  return (
    <div>
      <div className="page-title">{t("students.title")}</div>

      {message && <div className={`banner ${message.type === "success" ? "success" : "warn"}`}>{message.text}</div>}

      <div className="card">
        <button className="primary" onClick={() => setShowForm((s) => !s)}>{t("students.addStudent")}</button>

        {showForm && (
          <form onSubmit={handleSubmit} className="card" style={{ background: "var(--bg)", marginTop: 14 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <input placeholder={t("students.matricule")} required value={form.matricule} onChange={(e) => setForm({ ...form, matricule: e.target.value })} />
              <input placeholder={t("students.fullName")} required value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
              <input placeholder={t("students.phone")} required value={form.phoneNumber} onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })} />
              <input placeholder={t("students.class")} value={form.currentClass} onChange={(e) => setForm({ ...form, currentClass: e.target.value })} />
              <input placeholder="Temporary password" type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
            </div>
            <button className="primary" type="submit" style={{ marginTop: 12 }}>Save</button>
          </form>
        )}
      </div>

      <div className="card">
        <table>
          <thead>
            <tr>
              <th>{t("students.matricule")}</th>
              <th>{t("students.fullName")}</th>
              <th>{t("students.class")}</th>
              <th>{t("students.phone")}</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {students.map((s) => (
              <tr key={s._id}>
                <td>{s.matricule}</td>
                <td>{s.fullName}</td>
                <td>{s.currentClass || "—"}</td>
                <td>{s.phoneNumber}</td>
                <td>
                  {resettingId === s._id ? (
                    <div style={{ display: "flex", gap: 6 }}>
                      <input
                        type="password"
                        placeholder="New password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        style={{ width: 140 }}
                        autoFocus
                      />
                      <button className="primary" onClick={() => handleResetPassword(s._id)}>Save</button>
                      <button className="ghost" onClick={() => { setResettingId(null); setNewPassword(""); }}>Cancel</button>
                    </div>
                  ) : (
                    <button className="ghost" onClick={() => setResettingId(s._id)}>Reset password</button>
                  )}
                </td>
              </tr>
            ))}
            {students.length === 0 && (
              <tr><td colSpan={5} style={{ color: "var(--text-muted)" }}>No students yet</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

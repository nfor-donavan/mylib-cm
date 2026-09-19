import { useState } from "react";
import { useTranslation } from "react-i18next";
import api from "../api";

const emptyForm = { matricule: "", fullName: "", phoneNumber: "", currentClass: "", password: "" };

export default function Students() {
  const { t } = useTranslation();
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      await api.post("/auth/register-student", form);
      setMessage({ type: "success", text: `${form.fullName} added` });
      setForm(emptyForm);
      setShowForm(false);
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.error || "Failed to add student" });
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
    </div>
  );
}

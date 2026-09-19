import { useEffect, useState } from "react";
import api from "../api";

const emptyTenant = { schoolName: "", subdomain: "", educationSystem: "Anglophone" };
const emptyLibrarian = { matricule: "", fullName: "", phoneNumber: "", email: "", password: "" };

export default function Schools() {
  const [tenants, setTenants] = useState([]);
  const [showAddSchool, setShowAddSchool] = useState(false);
  const [tenantForm, setTenantForm] = useState(emptyTenant);
  const [librarianTargetId, setLibrarianTargetId] = useState(null);
  const [librarianForm, setLibrarianForm] = useState(emptyLibrarian);
  const [message, setMessage] = useState(null);

  async function loadTenants() {
    const { data } = await api.get("/tenants");
    setTenants(data.tenants);
  }

  useEffect(() => { loadTenants(); }, []);

  async function handleCreateSchool(e) {
    e.preventDefault();
    try {
      await api.post("/tenants", tenantForm);
      setMessage({ type: "success", text: `${tenantForm.schoolName} onboarded` });
      setTenantForm(emptyTenant);
      setShowAddSchool(false);
      loadTenants();
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.error || "Failed to create school" });
    }
  }

  async function handleToggleActive(tenant) {
    await api.patch(`/tenants/${tenant._id}`, { isActive: !tenant.isActive });
    loadTenants();
  }

  async function handleCreateLibrarian(e, tenantId) {
    e.preventDefault();
    try {
      await api.post("/auth/register-librarian", { ...librarianForm, tenantId });
      setMessage({ type: "success", text: `Librarian ${librarianForm.fullName} added` });
      setLibrarianForm(emptyLibrarian);
      setLibrarianTargetId(null);
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.error || "Failed to create librarian" });
    }
  }

  return (
    <div>
      <div className="page-title">Schools on the platform</div>

      {message && <div className={`banner ${message.type === "success" ? "success" : "warn"}`}>{message.text}</div>}

      <div className="card">
        <button className="primary" onClick={() => setShowAddSchool((s) => !s)}>Onboard a school</button>

        {showAddSchool && (
          <form onSubmit={handleCreateSchool} className="card" style={{ background: "var(--bg)", marginTop: 14 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <input placeholder="School name" required value={tenantForm.schoolName} onChange={(e) => setTenantForm({ ...tenantForm, schoolName: e.target.value })} />
              <input placeholder="Subdomain (e.g. sevic)" required value={tenantForm.subdomain} onChange={(e) => setTenantForm({ ...tenantForm, subdomain: e.target.value })} />
              <select value={tenantForm.educationSystem} onChange={(e) => setTenantForm({ ...tenantForm, educationSystem: e.target.value })}>
                <option value="Anglophone">Anglophone</option>
                <option value="Francophone">Francophone</option>
                <option value="Bilingual">Bilingual</option>
                <option value="Higher_Ed">Higher Ed</option>
              </select>
            </div>
            <button className="primary" type="submit" style={{ marginTop: 12 }}>Create school</button>
          </form>
        )}
      </div>

      {tenants.map((tenant) => (
        <div className="card" key={tenant._id}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontWeight: 600 }}>{tenant.schoolName}</div>
              <div style={{ fontSize: 13, color: "var(--text-muted)" }}>
                {tenant.subdomain}.mylib.cm · {tenant.educationSystem} · {tenant.subscriptionTier}
              </div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <span className={`badge ${tenant.isActive ? "available" : "overdue"}`}>
                {tenant.isActive ? "Active" : "Suspended"}
              </span>
              <button className="ghost" onClick={() => handleToggleActive(tenant)}>
                {tenant.isActive ? "Suspend" : "Reactivate"}
              </button>
              <button
                className="ghost"
                onClick={() => setLibrarianTargetId(librarianTargetId === tenant._id ? null : tenant._id)}
              >
                Add librarian
              </button>
            </div>
          </div>

          {librarianTargetId === tenant._id && (
            <form onSubmit={(e) => handleCreateLibrarian(e, tenant._id)} className="card" style={{ background: "var(--bg)", marginTop: 12 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <input placeholder="Matricule / staff ID" required value={librarianForm.matricule} onChange={(e) => setLibrarianForm({ ...librarianForm, matricule: e.target.value })} />
                <input placeholder="Full name" required value={librarianForm.fullName} onChange={(e) => setLibrarianForm({ ...librarianForm, fullName: e.target.value })} />
                <input placeholder="Phone number" required value={librarianForm.phoneNumber} onChange={(e) => setLibrarianForm({ ...librarianForm, phoneNumber: e.target.value })} />
                <input placeholder="Email (optional)" value={librarianForm.email} onChange={(e) => setLibrarianForm({ ...librarianForm, email: e.target.value })} />
                <input placeholder="Password" type="password" required value={librarianForm.password} onChange={(e) => setLibrarianForm({ ...librarianForm, password: e.target.value })} />
              </div>
              <button className="primary" type="submit" style={{ marginTop: 12 }}>Save librarian</button>
            </form>
          )}
        </div>
      ))}

      {tenants.length === 0 && <div className="card" style={{ color: "var(--text-muted)" }}>No schools yet</div>}
    </div>
  );
}

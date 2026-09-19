import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import api from "../api";

const CATEGORIES = [
  "Curriculum_Textbook", "Past_Paper", "Fiction_Novel", "Reference",
  "Periodical", "Religious", "Career_Guidance", "Biography", "Childrens_Book", "Other",
];

const emptyForm = { title: "", author: "", category: "Curriculum_Textbook", language: "English", targetClass: "" };

export default function Catalog() {
  const { t } = useTranslation();
  const [books, setBooks] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);

  async function load() {
    const { data } = await api.get("/books", { params: { search: search || undefined, category: category || undefined } });
    setBooks(data.books);
  }

  useEffect(() => { load(); }, [search, category]);

  async function handleAddBook(e) {
    e.preventDefault();
    await api.post("/books", form);
    setForm(emptyForm);
    setShowForm(false);
    load();
  }

  return (
    <div>
      <div className="page-title">{t("catalog.title")}</div>

      <div className="card">
        <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
          <input
            placeholder={t("catalog.searchPlaceholder")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select value={category} onChange={(e) => setCategory(e.target.value)} style={{ maxWidth: 220 }}>
            <option value="">{t("catalog.category")}</option>
            {CATEGORIES.map((c) => <option key={c} value={c}>{t(`categories.${c}`)}</option>)}
          </select>
          <button className="primary" onClick={() => setShowForm((s) => !s)}>{t("catalog.addBook")}</button>
        </div>

        {showForm && (
          <form onSubmit={handleAddBook} className="card" style={{ background: "var(--bg)" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <input placeholder="Title" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              <input placeholder="Author" required value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} />
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                {CATEGORIES.map((c) => <option key={c} value={c}>{t(`categories.${c}`)}</option>)}
              </select>
              <select value={form.language} onChange={(e) => setForm({ ...form, language: e.target.value })}>
                <option>English</option><option>French</option><option>Bilingual</option><option>Other</option>
              </select>
              <input placeholder="Target class (optional)" value={form.targetClass} onChange={(e) => setForm({ ...form, targetClass: e.target.value })} />
            </div>
            <button className="primary" type="submit" style={{ marginTop: 12 }}>Save</button>
          </form>
        )}
      </div>

      <div className="card">
        <table>
          <thead>
            <tr><th>Title</th><th>Author</th><th>{t("catalog.category")}</th><th>{t("catalog.language")}</th></tr>
          </thead>
          <tbody>
            {books.map((b) => (
              <tr key={b._id}>
                <td>{b.title}</td>
                <td>{b.author}</td>
                <td>{t(`categories.${b.category}`)}</td>
                <td>{b.language}</td>
              </tr>
            ))}
            {books.length === 0 && <tr><td colSpan={4} style={{ color: "var(--text-muted)" }}>No books found</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

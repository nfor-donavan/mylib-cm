import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import api from "../api";

export default function Catalog() {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const [books, setBooks] = useState([]);

  useEffect(() => {
    const handle = setTimeout(() => {
      api.get("/books", { params: { search: search || undefined } }).then((res) => setBooks(res.data.books));
    }, 300);
    return () => clearTimeout(handle);
  }, [search]);

  return (
    <div>
      <h2 style={{ fontSize: 18 }}>{t("catalog.title")}</h2>
      <input
        placeholder={t("catalog.searchPlaceholder")}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ marginBottom: 12 }}
      />

      <div className="cards-grid">
        {books.map((b) => (
          <div className="card" key={b._id}>
            <div style={{ fontWeight: 600 }}>{b.title}</div>
            <div style={{ fontSize: 13, color: "var(--text-muted)" }}>{b.author}</div>
            <div style={{ marginTop: 8, display: "flex", gap: 6, flexWrap: "wrap" }}>
              <span className="badge available">{t(`categories.${b.category}`)}</span>
              {b.bookType === "Digital_PDF" && <span className="badge borrowed">{t("catalog.digital")}</span>}
            </div>
          </div>
        ))}
      </div>

      {books.length === 0 && <div className="card" style={{ color: "var(--text-muted)" }}>No books found</div>}
    </div>
  );
}

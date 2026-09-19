import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import api from "../api";

export default function Catalog() {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const [books, setBooks] = useState([]);
  const [reservedBookIds, setReservedBookIds] = useState(new Set());
  const [message, setMessage] = useState(null);

  useEffect(() => {
    const handle = setTimeout(() => {
      api.get("/books", { params: { search: search || undefined } }).then((res) => setBooks(res.data.books));
    }, 300);
    return () => clearTimeout(handle);
  }, [search]);

  useEffect(() => {
    api.get("/reservations").then((res) => {
      setReservedBookIds(new Set(res.data.reservations.map((r) => r.bookId?._id)));
    });
  }, []);

  async function handleReserve(bookId) {
    try {
      await api.post("/reservations", { bookId });
      setReservedBookIds((prev) => new Set(prev).add(bookId));
      setMessage({ type: "success", text: t("catalog.reserveSuccess") });
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.error || "Could not reserve this title" });
    }
  }

  return (
    <div>
      <h2 style={{ fontSize: 18 }}>{t("catalog.title")}</h2>
      <input
        placeholder={t("catalog.searchPlaceholder")}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ marginBottom: 12 }}
      />

      {message && <div className={`banner ${message.type === "success" ? "success" : "warn"}`}>{message.text}</div>}

      <div className="cards-grid">
        {books.map((b) => {
          const isReserved = reservedBookIds.has(b._id);
          return (
            <div className="card" key={b._id}>
              <div style={{ fontWeight: 600 }}>{b.title}</div>
              <div style={{ fontSize: 13, color: "var(--text-muted)" }}>{b.author}</div>
              <div style={{ marginTop: 8, display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
                <span className="badge available">{t(`categories.${b.category}`)}</span>
                {b.bookType === "Digital_PDF" && <span className="badge borrowed">{t("catalog.digital")}</span>}
              </div>
              {b.bookType === "Physical" && (
                <button
                  className={isReserved ? "ghost" : "primary"}
                  disabled={isReserved}
                  style={{ marginTop: 10, width: "100%" }}
                  onClick={() => handleReserve(b._id)}
                >
                  {isReserved ? t("catalog.reserved") : t("catalog.reserve")}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {books.length === 0 && <div className="card" style={{ color: "var(--text-muted)" }}>No books found</div>}
    </div>
  );
}

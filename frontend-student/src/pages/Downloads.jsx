import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import api from "../api";

export default function Downloads() {
  const { t } = useTranslation();
  const [books, setBooks] = useState([]);

  useEffect(() => {
    api.get("/books", { params: { bookType: "Digital_PDF" } }).then((res) => setBooks(res.data.books));
  }, []);

  return (
    <div>
      <h2 style={{ fontSize: 18, marginBottom: 2 }}>{t("downloads.title")}</h2>
      <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 0 }}>{t("downloads.subtitle")}</p>

      <div className="cards-grid">
        {books.map((b) => (
          <div className="card" key={b._id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontWeight: 600 }}>{b.title}</div>
              <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{t(`categories.${b.category}`)}</div>
            </div>
            {b.pdfUrl && (
              <a href={b.pdfUrl} target="_blank" rel="noreferrer">
                <button className="primary">{t("downloads.open")}</button>
              </a>
            )}
          </div>
        ))}
      </div>

      {books.length === 0 && <div className="card" style={{ color: "var(--text-muted)" }}>No digital resources yet</div>}
    </div>
  );
}

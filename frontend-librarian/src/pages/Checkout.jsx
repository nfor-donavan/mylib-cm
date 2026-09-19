import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { useBarcodeScanner } from "../hooks/useBarcodeScanner";
import api from "../api";
import { queueOfflineCheckout, findCachedItemByBarcode, findCachedStudent } from "../offline/db";

export default function Checkout() {
  const { t } = useTranslation();
  const [matricule, setMatricule] = useState("");
  const [mode, setMode] = useState("checkout"); // "checkout" | "return"
  const [feedback, setFeedback] = useState(null);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  window.addEventListener("online", () => setIsOffline(false));
  window.addEventListener("offline", () => setIsOffline(true));

  const handleScan = useCallback(
    async (barcode) => {
      setFeedback(null);

      if (mode === "return") {
        try {
          await api.post("/borrowing/return", { barcodeSerial: barcode });
          setFeedback({ type: "success", text: t("checkout.returnSuccess") });
        } catch (err) {
          setFeedback({ type: "error", text: err.response?.data?.error || "Return failed" });
        }
        return;
      }

      if (!matricule) {
        setFeedback({ type: "error", text: "Enter the student/teacher matricule first" });
        return;
      }

      if (navigator.onLine) {
        try {
          const { data } = await api.post("/borrowing/checkout", { barcodeSerial: barcode, userMatricule: matricule });
          setFeedback({
            type: "success",
            text: t("checkout.checkoutSuccess", {
              name: data.borrower,
              date: new Date(data.expectedReturnDate).toLocaleDateString(),
            }),
          });
        } catch (err) {
          setFeedback({ type: "error", text: err.response?.data?.error || "Checkout failed" });
        }
      } else {
        // Offline fallback: validate against the cached student/catalog data
        // synced earlier, then queue the checkout for later sync.
        const [cachedItem, cachedStudent] = await Promise.all([
          findCachedItemByBarcode(barcode),
          findCachedStudent(matricule),
        ]);

        if (!cachedItem) {
          setFeedback({ type: "error", text: "Unknown barcode (not in offline cache)" });
          return;
        }
        if (!cachedStudent) {
          setFeedback({ type: "error", text: "Unknown matricule (not in offline cache)" });
          return;
        }

        await queueOfflineCheckout({ barcodeSerial: barcode, userMatricule: matricule });
        setFeedback({ type: "success", text: `Saved offline — will sync when back online (${cachedStudent.fullName})` });
      }
    },
    [mode, matricule, t]
  );

  useBarcodeScanner(handleScan, { alwaysActive: false });

  return (
    <div>
      <div className="page-title">{t("checkout.title")}</div>

      {isOffline && <div className="banner warn">{t("checkout.offlineBanner")}</div>}

      <div className="card">
        <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
          <button className={mode === "checkout" ? "primary" : "ghost"} onClick={() => setMode("checkout")}>Checkout</button>
          <button className={mode === "return" ? "primary" : "ghost"} onClick={() => setMode("return")}>Return</button>
        </div>

        {mode === "checkout" && (
          <>
            <label>{t("checkout.matriculeLabel")}</label>
            <input
              value={matricule}
              onChange={(e) => setMatricule(e.target.value)}
              placeholder="e.g. N623/26"
              style={{ marginBottom: 16, maxWidth: 300 }}
              autoFocus
            />
          </>
        )}

        <div
          style={{
            border: "2px dashed var(--border)",
            borderRadius: 10,
            padding: 40,
            textAlign: "center",
            color: "var(--text-muted)",
          }}
        >
          {t("checkout.scanPrompt")}
        </div>

        {feedback && (
          <div className={`banner ${feedback.type === "success" ? "success" : "warn"}`} style={{ marginTop: 16 }}>
            {feedback.text}
          </div>
        )}
      </div>
    </div>
  );
}

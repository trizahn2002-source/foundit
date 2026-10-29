
import { useEffect, useRef, useState } from "react";
import { CheckCircle2, Clock3, XCircle } from "lucide-react";
import { sendTip, getTipStatus } from "../utils/api";

const POLL_INTERVAL = 5000;
const MAX_CHECKS = 12;

function TipFinder({ itemId }) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState(50);
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const timerRef = useRef(null);
  const checkVersion = useRef(0);

  function stopChecking() {
    checkVersion.current += 1;
    clearTimeout(timerRef.current);
    timerRef.current = null;
  }

  useEffect(() => {
    return () => {
      checkVersion.current += 1;
      clearTimeout(timerRef.current);
    };
  }, []);

  function closeForm() {
    stopChecking();
    setOpen(false);
    setStatus("");
    setMessage("");
    setSubmitting(false);
  }

  async function checkStatus(tipId, version, attempt = 1) {
    if (version !== checkVersion.current) return;

    try {
      const tip = await getTipStatus(tipId);

      if (version !== checkVersion.current) return;

      if (tip.status === "paid") {
        setStatus("paid");
        setMessage(
          `Payment received! Your KES ${amount} tip was successful. Thank you for appreciating the finder!`
        );
        return;
      }

      if (tip.status === "failed") {
        setStatus("failed");
        setMessage(
          "The payment was not completed. Please check your M-Pesa messages before trying again."
        );
        return;
      }
    } catch {
      if (version !== checkVersion.current) return;
    }

    if (attempt >= MAX_CHECKS) {
      setStatus("unconfirmed");
      setMessage(
        "We haven't confirmed your payment yet. Please check your M-Pesa messages before attempting another tip."
      );
      return;
    }

    timerRef.current = setTimeout(
      () => checkStatus(tipId, version, attempt + 1),
      POLL_INTERVAL
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (submitting || status === "waiting") return;

    stopChecking();
    const version = checkVersion.current;

    setSubmitting(true);
    setStatus("");
    setMessage("");

    try {
      const data = await sendTip(itemId, Number(amount), phone);

      if (version !== checkVersion.current) return;

      setStatus("waiting");
      setMessage(
        data.message ||
        "STK Push requested. Complete the payment on your phone."
      );

      timerRef.current = setTimeout(
        () => checkStatus(data.tip.id, version),
        POLL_INTERVAL
      );
    } catch (err) {
      if (version !== checkVersion.current) return;
      setStatus("error");
      setMessage(err.message || "Could not initiate the payment.");
    } finally {
      if (version === checkVersion.current) {
        setSubmitting(false);
      }
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        className="btn"
        onClick={() => setOpen(true)}
      >
        💚 Tip the finder
      </button>
    );
  }

  const isBusy = submitting || status === "waiting";

  return (
    <div className="tip-finder">
      {status === "paid" ? (
        <div
          role="status"
          style={{ textAlign: "center", padding: "1rem" }}
        >
          <CheckCircle2
            size={42}
            color="#23865c"
            aria-hidden="true"
          />
          <h3>Payment received!</h3>
          <p>{message}</p>
          <button type="button" className="btn" onClick={closeForm}>
            Done
          </button>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          style={{ display: "grid", gap: "0.75rem", maxWidth: 360 }}
        >
          <h3>Say thank you with an M-Pesa tip</h3>

          <label>
            Amount (KSh)
            <input
              className="input"
              type="number"
              min="1"
              step="1"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              disabled={isBusy}
              required
            />
          </label>

          <label>
            Your M-Pesa number
            <input
              className="input"
              type="tel"
              placeholder="0712345678"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={isBusy}
              required
            />
          </label>

          <button type="submit" className="btn" disabled={isBusy}>
            {submitting
              ? "Sending request..."
              : status === "waiting"
                ? "Checking payment..."
                : "Send tip"}
          </button>

          {status === "waiting" && (
            <p role="status">
              <Clock3 size={17} aria-hidden="true" />{" "}
              Complete the M-Pesa prompt on your phone.
              We're checking for confirmation.
            </p>
          )}

          {status === "failed" && (
            <p role="alert">
              <XCircle size={17} aria-hidden="true" />{" "}
              {message}
            </p>
          )}

          {status !== "failed" && status !== "waiting" && message && (
            <p role="status">{message}</p>
          )}

          <button type="button" onClick={closeForm} disabled={submitting}>
            Close
          </button>
        </form>
      )}
    </div>
  );
}

export default TipFinder;

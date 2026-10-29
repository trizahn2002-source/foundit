import { ArrowRight, CheckCircle2, Info, ShieldCheck, X } from "lucide-react";
import { useState } from "react";
import "./ClaimForm.css";
import { request } from "../utils/api";


function ClaimForm({ itemId, onClaimed }) {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!message.trim()) {
      setError("Please describe a detail that can help verify ownership.");
      return;
    }

    setSubmitting(true);
    try {
      
    const data = await request(
      `/items/${itemId}/claims`,
      {
        method: "POST",
        body: { message },
      },
      "We couldn't submit your claim. Please try again."
    );

      setMessage("");
      setIsOpen(false);
      // The parent refreshes claims, then displays the pending-status message.
      if (onClaimed) onClaimed(data);
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!isOpen) {
    return (
      <section className="claim-section claim-section--closed">
        <div className="claim-prompt">
          <div className="claim-prompt-icon">
            <ShieldCheck size={23} strokeWidth={1.8} />
          </div>

          <div className="claim-prompt-copy">
            <h2>Think this item belongs to you?</h2>
            <p>
              Tell the finder something unique about it so they can review
              your claim and help verify ownership.
            </p>
          </div>
        </div>

        <button
          type="button"
          className="claim-open-btn"
          onClick={() => {
            setError("");
            setIsOpen(true);
          }}
        >
          <span>Claim this item</span>
          <ArrowRight size={19} />
        </button>
      </section>
    );
  }

  return (
    <section className="claim-section claim-section--open">
      <div className="claim-header">
        <div className="claim-header-icon">
          <ShieldCheck size={23} strokeWidth={1.8} />
        </div>

        <div className="claim-header-copy">
          <h2>Let's verify it's yours</h2>
          <p>
            Share a detail only the owner is likely to know. The finder will
            review your claim before deciding whether to approve it.
          </p>
        </div>
      </div>

      <div className="claim-privacy-note">
        <Info size={19} strokeWidth={1.8} />
        <p>
          Your verification details won't be displayed publicly. Don't include
          passwords, identification numbers or other sensitive information.
        </p>
      </div>

      <form className="claim-form" onSubmit={handleSubmit}>
        <div className="claim-field">
          <label htmlFor="verification">What helps prove this item is yours?</label>
          <textarea
            id="verification"
            name="verification"
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="For example, describe a unique mark, accessory or detail not mentioned in the report."
            required
            disabled={submitting}
          />
          <p className="claim-field-hint">
            Once submitted, you can track the review status under My Claims on
            your Dashboard.
          </p>
        </div>

        {error && (
          <p className="claim-form-error" role="alert">
            {error}
          </p>
        )}

        <div className="claim-form-actions">
          <button type="submit" className="claim-submit-btn" disabled={submitting}>
            <CheckCircle2 size={19} />
            <span>{submitting ? "Submitting your claim..." : "Submit claim for review"}</span>
          </button>

          <button
            type="button"
            className="claim-cancel-btn"
            onClick={() => {
              setIsOpen(false);
              setError("");
            }}
            disabled={submitting}
          >
            <X size={18} />
            <span>Cancel</span>
          </button>
        </div>
      </form>
    </section>
  );
}

export default ClaimForm;

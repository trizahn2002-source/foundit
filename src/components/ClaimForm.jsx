import { useState } from "react";
import "./ClaimForm.css";

function ClaimForm() {
  const [isOpen, setIsOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event) {
    event.preventDefault();
    setSubmitted(true);
  }
  //if form is closed , show claim button
    if(!isOpen){
        return (
            <section className="claim-section">
                <button onClick={() => setIsOpen(true)}>
                    Claim This Item
                </button>
            </section>
        )
    }
    //if claim is submitted show this message
    if (submitted) {
        return (
            <section className="claim-section claim-success">
            <h2>Claim Submitted</h2>
            <p>
                Your claim has been submitted for review by the person
                who reported the item.
            </p>
            </section>
        );
    }

        return (
        <section className="claim-section">
            <h2>Claim This Item</h2>

            <p>
            Provide information that can help the finder verify that
            this item belongs to you. These details will not be displayed
            publicly.
            </p>

            <form className="claim-form" onSubmit={handleSubmit}>
            <div className="claim-field">
                <label htmlFor="claimantName">Your Name</label>
                <input
                type="text"
                id="claimantName"
                name="claimantName"
                required
                />
            </div>

            <div className="claim-field">
                <label htmlFor="contact">Contact Information</label>
                <input
                type="text"
                id="contact"
                name="contact"
                placeholder="Email or phone number"
                required
                />
            </div>

            <div className="claim-field">
                <label htmlFor="verification">
                Ownership Verification Details
                </label>
                <textarea
                id="verification"
                name="verification"
                placeholder="Describe something about the item that was not included in the public report."
                required
                />
            </div>
            <div className="claim-actions">
            <button type="submit">Submit Claim</button>

            <button
                type="button"
                onClick={() => setIsOpen(false)}
            >
                Cancel
            </button>
            </div>
            </form>
        </section>
        );
    }
export default ClaimForm;
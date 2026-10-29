
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import TipFinder from "../components/TipFinder";
import {
  ArrowLeft,
  CalendarDays,
  Check,
  ImageOff,
  MapPin,
  Share2,
  Tag,
  UserRound,
  Phone,
  Mail,
  MessageCircle,
  ShieldCheck,
  Clock3,
  Info,
  PackageCheck,
  X,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import ClaimForm from "../components/ClaimForm";
import PossibleMatches from "../components/PossibleMatches";
import { getItem, request } from "../utils/api";
import "./ItemDetails.css";


function ItemDetails() {
  const { id } = useParams();
  const { user, loading: authLoading } = useAuth();

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadedId, setLoadedId] = useState(null);
  const [error, setError] = useState("");

  const [claims, setClaims] = useState([]);
  const [ownerFromApi, setIsOwner] = useState(false);
  const [claimError, setClaimError] = useState("");

  const [shareMessage, setShareMessage] = useState("");

  // Contact sharing during claim approval
  const [approvingClaimId, setApprovingClaimId] = useState(null);
  const [contactMethod, setContactMethod] = useState("whatsapp");
  const [contactDetail, setContactDetail] = useState("");
  const [savingApproval, setSavingApproval] = useState(false);

  // -----------------------------------------
  // LOAD ITEM DETAILS
  // -----------------------------------------

  useEffect(() => {
    let ignore = false;

    setLoading(true);
    setShareMessage("");
    setApprovingClaimId(null);
    setClaimError("");

    getItem(id)
      .then((loadedItem) => {
        if (!ignore) {
          setItem(loadedItem);
          setError("");
          setLoadedId(id);
        }
      })
      .catch((err) => {
        if (!ignore) {
          setItem(null);
          setError(err.message);
          setLoadedId(id);
        }
      })
      .finally(() => {
        if (!ignore) {
          setLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [id]);

  // -----------------------------------------
  // LOAD CLAIMS
  // -----------------------------------------


  async function loadClaims() {
    if (!user) {
      setClaims([]);
      setIsOwner(false);
      return;
    }

    try {
      const data = await request(
        `/items/${id}/claims`,
        {},
        "Could not load claims."
      );

      setClaims(
        Array.isArray(data)
          ? data
          : data.claims ?? []
      );

      setIsOwner(data.is_owner ?? false);
    } catch (err) {
      setClaimError(err.message);
    }
  }
    // Load claims when the item or signed-in user changes.
    useEffect(() => {
      if (!user) {
        setClaims([]);
        setIsOwner(false);
        return;
      }

      loadClaims();
    }, [id, user?.id]);
  // -----------------------------------------
  // APPROVE OR REJECT A CLAIM
  // -----------------------------------------

  async function decide(claimId, status) {
    setClaimError("");

    if (status === "approved" && !contactDetail.trim()) {
      setClaimError("Please enter your contact details.");
      return;
    }

    setSavingApproval(true);

    try {
      const payload = { status };

      if (status === "approved") {
        payload.contact_method = contactMethod;
        payload.contact_detail = contactDetail.trim();
      }

      
      const data = await request(
        `/claims/${claimId}`,
        {
          method: "PATCH",
          body: payload,
        },
        "Could not update claim."
      );


      setItem(data.item);
      await loadClaims();

      setApprovingClaimId(null);
      setContactDetail("");
      setContactMethod("whatsapp");
    } catch (err) {
      setClaimError(err.message);
    } finally {
      setSavingApproval(false);
    }
  }

  // -----------------------------------------
  // SHARE ITEM
  // -----------------------------------------

  async function handleShare() {
    if (!item) return;

    setShareMessage("");

    const reportType = (
      item.reportType ?? item.type ?? ""
    ).toLowerCase();

    const title =
      item.itemName ?? item.title ?? "Item";

    const location =
      typeof item.location === "string"
        ? item.location
        : item.location?.name || "Location not specified";

    const url = window.location.href;

    const intro =
      reportType === "found"
        ? "Does this belong to someone you know?"
        : "Have you seen this item?";

    const text =
      `${intro}\n${title}\n` +
      `Location: ${location}\n` +
      "View this report on FoundIt.";

    if (navigator.share) {
      try {
        await navigator.share({
          title: `FoundIt - ${title}`,
          text,
          url,
        });

        return;
      } catch (err) {
        if (err?.name === "AbortError") return;
      }
    }

    try {
      await navigator.clipboard.writeText(url);

      setShareMessage(
        "Link copied! You can now share it."
      );
    } catch {
      window.prompt("Copy this item link:", url);
    }
  }

  // -----------------------------------------
  // LOADING AND ERROR STATES
  // -----------------------------------------

  if (loading || authLoading || loadedId !== id) {
    return (
      <p className="item-details-notfound">
        Loading item...
      </p>
    );
  }

  if (error || !item) {
    return (
      <section className="item-details-notfound">
        <h1>Could not load item</h1>

        <p>
          {error || `There is no item with ID ${id}.`}
        </p>

        <Link to="/">Back to all items</Link>
      </section>
    );
  }

  // -----------------------------------------
  // ITEM AND CLAIM INFORMATION
  // -----------------------------------------

  const reportType = (
    item.reportType ?? item.type ?? ""
  ).toLowerCase();

  const itemName =
    item.itemName ?? item.title ?? "Item details";

  const itemPhoto =
    item.photo ?? item.image_url;

  const itemLocation =
    typeof item.location === "string"
      ? item.location
      : item.location?.name || "Not specified";

  const isOwner =
    ownerFromApi ||
    (user &&
      (item.reportedBy ?? item.user_id) === user.id);

  const myClaim = (claims ?? []).find(
    (c) => c.user_id === user?.id
  );
  const canClaim =
    user &&
    !isOwner &&
    item.status === "active" &&
    reportType === "found" &&
    !myClaim;

  const reporterLabel =
    item.reporterUsername ??
    item.reporter_username ??
    `User #${item.reportedBy ?? item.user_id}`;

  const statusLabel =
    item.status === "active"
      ? "Active report"
      : item.status === "claimed"
        ? "Claimed"
        : item.status === "resolved"
          ? "Returned"
          : item.status;

  // -----------------------------------------
  // PAGE
  // -----------------------------------------

  return (
    <section className="item-details">

      {/* BACK NAVIGATION */}

      <Link to="/" className="item-details-back">
        <ArrowLeft size={18} strokeWidth={2} />
        <span>Back to all items</span>
      </Link>

      {/* MAIN ITEM CARD */}

      <div className="item-details-layout">

        <div className="item-details-visual">
          {itemPhoto ? (
            <img
              className="item-details-photo"
              src={itemPhoto}
              alt={itemName}
            />
          ) : (
            <div className="item-details-photo item-details-photo--empty">
              <ImageOff size={42} strokeWidth={1.5} />
              <span>No photo provided</span>
            </div>
          )}
        </div>

        <div className="item-details-info">

          <div className="item-details-badges">
            <span
              className={`item-badge item-badge--${reportType}`}
            >
              {reportType}
            </span>

            <span
              className={`item-badge item-badge--${item.status}`}
            >
              {statusLabel}
            </span>
          </div>

          <h1>{itemName}</h1>

          <p className="item-details-description">
            {item.description ||
              "No description provided."}
          </p>

          <div className="item-details-divider" />

          {/* ITEM INFORMATION */}

          <dl className="item-details-meta">

            <div className="item-details-meta-row">
              <dt>
                <Tag size={19} />
                <span>Category</span>
              </dt>

              <dd>
                {typeof item.category === "string"
                  ? item.category
                  : item.category?.name || "Not specified"}
              </dd>
            </div>

            <div className="item-details-meta-row">
              <dt>
                <MapPin size={19} />
                <span>Location</span>
              </dt>

              <dd>{itemLocation}</dd>
            </div>

            <div className="item-details-meta-row">
              <dt>
                <CalendarDays size={19} />
                <span>Date</span>
              </dt>

              <dd>{item.date || "Not specified"}</dd>
            </div>

            <div className="item-details-meta-row">
              <dt>
                <UserRound size={19} />
                <span>Reported by</span>
              </dt>

              <dd>{reporterLabel}</dd>
            </div>

          </dl>

          {/* SHARE BUTTON */}

          <div className="item-details-share-area">

            <button
              type="button"
              className="item-details-share"
              onClick={handleShare}
            >
              <Share2 size={19} />
              <span>Share this item</span>
            </button>

            <p className="item-details-share-hint">
              Help this item reach its owner.
            </p>

            {shareMessage && (
              <p
                className="item-details-share-feedback"
                role="status"
              >
                <Check size={16} />
                {shareMessage}
              </p>
            )}

          </div>

        </div>
      </div>

      {/* POSSIBLE MATCHES */}

      {reportType === "lost" &&
        item.status === "active" && (
          <div className="item-details-matches">
            <PossibleMatches itemId={item.id} />
          </div>
        )}

      {/* CLAIM SECTION */}

      <div id="claims" className="claims-section item-details-claims">

        {claimError && (
          <p className="error" role="alert">
            {claimError}
          </p>
        )}

        {/* LOGIN PROMPT */}

        {!user && reportType === "found" && (
          <Link to="/login" className="btn item-details-claim-btn">
            Claim This Item
          </Link>
        )}

        {/* CLAIM FORM */}

        {canClaim && (
          <ClaimForm
            itemId={item.id}
            onClaimed={loadClaims}
          />
        )}
        {myClaim && myClaim.status === "approved" && (
            <div style={{ margin: "1.5rem 0" }}>
              <TipFinder itemId={item.id} />
            </div>
          )}
        {/* CLAIMANT'S STATUS — helpful next steps */}

        {myClaim && (() => {
          const wasReturned = item.status === "resolved";
          const claimState = wasReturned && myClaim.status === "approved"
            ? "returned"
            : myClaim.status;

          const messages = {
            pending: {
              heading: "Your claim is awaiting review",
              description:
                "Your ownership details have been submitted. The finder can now review them.",
              next: "What happens next?",
              guidance:
                "The finder will review the information you provided. You can track the status of your claim from your Dashboard.",
            },
            approved: {
              heading: "Good news! Your claim was approved.",
              description:
                "The finder has approved your claim. You're one step closer to getting your item back.",
              next: "Next step: arrange collection",
              guidance:
                "Use the contact details below to agree on a safe time and place to meet.",
            },
            rejected: {
              heading: "Your claim wasn't approved",
              description:
                "The finder didn't approve this claim based on the details provided.",
              next: "You can keep looking",
              guidance:
                "Other found-item reports may match what you're searching for.",
            },
            returned: {
              heading: "This item has been marked as returned",
              description:
                "The reporter has marked the handover as complete.",
              next: "Thank you for using FoundIt",
              guidance:
                "We hope the item is safely back with its owner.",
            },
          };
          const content = messages[claimState];
          const StatusIcon = claimState === "pending"
            ? Clock3
            : claimState === "rejected"
              ? Info
              : claimState === "returned"
                ? PackageCheck
                : ShieldCheck;

          return (
            <>
              {content && (
                <section
                  className={`claim-message claim-message--${claimState}`}
                  aria-label="Your claim status"
                >
                  <div className="claim-message-heading">
                    <span className="claim-message-icon" aria-hidden="true">
                      <StatusIcon size={23} strokeWidth={2} />
                    </span>
                    <div>
                      <span className="claim-message-eyebrow">Claim update</span>
                      <h2>{content.heading}</h2>
                      <p>{content.description}</p>
                    </div>
                  </div>
                  <div className="claim-message-next">
                    <strong>{content.next}</strong>
                    <p>{content.guidance}</p>
                    {claimState === "rejected" && (
                      <Link to="/">Browse found items →</Link>
                    )}
                  </div>
                </section>
              )}

              {myClaim.status === "approved" &&
                myClaim.contact_method &&
                myClaim.contact_detail && (
                  <section className="collection-card">
                    <div className="collection-card-heading">
                      <ShieldCheck size={25} />
                      <div>
                        <h2>Contact the finder</h2>
                        <p>
                          Here's the contact method the finder chose to share with you.
                        </p>
                      </div>
                    </div>

                    <div className="collection-contact">
                      {myClaim.contact_method === "email" ? (
                        <Mail size={21} />
                      ) : myClaim.contact_method === "whatsapp" ? (
                        <MessageCircle size={21} />
                      ) : (
                        <Phone size={21} />
                      )}
                      <div>
                        <span>
                          {myClaim.contact_method === "whatsapp"
                            ? "WhatsApp"
                            : myClaim.contact_method === "phone"
                              ? "Phone"
                              : "Email"}
                        </span>
                        <strong>{myClaim.contact_detail}</strong>
                      </div>
                    </div>

                    <p className="collection-safety">
                      Arrange to meet in a safe public location and verify
                      the item before collection.
                    </p>
                  </section>
                )}
            </>
          );
        })()}

        {/* REPORTER'S CLAIM MANAGEMENT */}

        {isOwner && (
          <>
            <h2>Claims ({claims.length})</h2>

            {claims.length === 0 && (
              <p className="item-details-claims-empty">
                No claims have been submitted for this item yet. New requests will appear here for your review.
              </p>
            )}

            {claims.map((c) => (
              <div
                key={c.id}
                className="claim-card"
              >

                <p>
                  <strong>{c.claimant}</strong>{" "}

                  <span
                    className={`claim-status claim-status--${c.status}`}
                  >
                    {c.status}
                  </span>
                </p>

                <p>{c.message}</p>

                {/* APPROVE / REJECT BUTTONS */}

                {c.status === "pending" && (
                  <>
                    <div className="claim-actions">

                      <button
                        type="button"
                        disabled={savingApproval}
                        onClick={() => {
                          setClaimError("");
                          setApprovingClaimId(c.id);
                          setContactMethod("whatsapp");
                          setContactDetail("");
                        }}
                      >
                        Approve
                      </button>

                      <button
                        type="button"
                        disabled={savingApproval}
                        onClick={() =>
                          decide(c.id, "rejected")
                        }
                      >
                        Reject
                      </button>

                    </div>

                    {/* CONTACT SHARING FORM */}

                    {approvingClaimId === c.id && (

                      <form
                        className="contact-approval-form"
                        onSubmit={(e) => {
                          e.preventDefault();
                          decide(c.id, "approved");
                        }}
                      >

                        <div className="contact-approval-header">
                          <ShieldCheck size={22} />

                          <div>
                            <h3>
                              Approve & arrange collection
                            </h3>

                            <p>
                              Choose how this claimant
                              can contact you after approval.
                            </p>
                          </div>
                        </div>

                        <label
                          htmlFor={`contact-method-${c.id}`}
                        >
                          Preferred contact method
                        </label>

                        <select
                          id={`contact-method-${c.id}`}
                          value={contactMethod}
                          disabled={savingApproval}
                          onChange={(e) => {
                            setContactMethod(e.target.value);
                            setContactDetail("");
                          }}
                        >
                          <option value="whatsapp">
                            WhatsApp
                          </option>

                          <option value="phone">
                            Phone call
                          </option>

                          <option value="email">
                            Email
                          </option>
                        </select>

                        <label
                          htmlFor={`contact-detail-${c.id}`}
                        >
                          {contactMethod === "email"
                            ? "Email address"
                            : "Contact number"}
                        </label>

                        <input
                          id={`contact-detail-${c.id}`}
                          type={
                            contactMethod === "email"
                              ? "email"
                              : "tel"
                          }
                          value={contactDetail}
                          onChange={(e) =>
                            setContactDetail(e.target.value)
                          }
                          placeholder={
                            contactMethod === "email"
                              ? "name@example.com"
                              : "+254712345678"
                          }
                          maxLength={255}
                          required
                          disabled={savingApproval}
                        />

                        <p className="contact-approval-privacy">
                          <ShieldCheck size={17} />

                          Only this approved claimant
                          will be able to access the
                          contact information you share.
                        </p>

                        <div className="contact-approval-actions">

                          <button
                            type="submit"
                            disabled={savingApproval}
                          >
                            {savingApproval
                              ? "Approving..."
                              : "Approve & share contact"}
                          </button>

                          <button
                            type="button"
                            className="contact-approval-cancel"
                            disabled={savingApproval}
                            onClick={() => {
                              setApprovingClaimId(null);
                              setClaimError("");
                            }}
                          >
                            <X size={17} />
                            Cancel
                          </button>

                        </div>

                      </form>
                    )}

                  </>
                )}

              </div>
            ))}

          </>
        )}

      </div>

    </section>
  );
}
//final export
export default ItemDetails;

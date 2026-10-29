import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AccountSettings from "../components/AccountSettings";
import { BellRing, ClipboardCheck, Package, MapPin, CalendarDays, PackageOpen, ArrowUpRight, PlusCircle } from "lucide-react";
import {
  checkSession,
  getMyItems,
  getMyClaims,
  getItem,
  updateItem,
  deleteItem,
  request,
} from "../utils/api";

const STATUS_LABELS = {
  active: "Active",
  claimed: "Claimed",
  resolved: "Returned",
};

function formatDate(iso) {
  if (!iso) return "";

  const date = new Date(`${iso}T00:00:00`);

  if (Number.isNaN(date.getTime())) return iso;

  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function Dashboard() {
  const [user, setUser] = useState(undefined);
  const [reports, setReports] = useState(null);
  const [claims, setClaims] = useState([]);
  const [claimPhotos, setClaimPhotos] = useState({});
  const [actionClaims, setActionClaims] = useState([]);
  const [pendingError, setPendingError] = useState("");
  const [activeSection, setActiveSection] = useState("action");
  const [loadError, setLoadError] = useState("");
  const [actionError, setActionError] = useState("");
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    title: "",
    location: "",
  });

  useEffect(() => {
    let ignore = false;

    async function load() {
      const session = await checkSession();

      if (ignore) return;

      if (!session.logged_in || !session.user) {
        setUser(null);
        return;
      }

      setUser(session.user);

      const [items, claimsData] = await Promise.all([
        getMyItems(session.user.id),
        getMyClaims(session.user.id),
      ]);
      if (!ignore) {
        setReports(items);
        setClaims(claimsData.claims || []);
      }

      // One server-side query for claims requiring review or handover.
      // Does not fetch claims for each individual item.
      try {
        const payload = await request(
          "/claims/action-required",
          {},
          "Could not load required actions"
        );

        if (!ignore) {
          setActionClaims(payload.claims || []);
        }
      } catch (err) {
        if (!ignore) {
          setPendingError(err.message);
        }
      }
      const claimList = claimsData.claims || [];

      const uniqueItemIds = [
        ...new Set(claimList.map((claim) => claim.item_id)),
      ];

      const results = await Promise.allSettled(
        uniqueItemIds.map((id) => getItem(id))
      );

      const photos = {};

      results.forEach((result, index) => {
        if (result.status === "fulfilled" && result.value.photo) {
          photos[uniqueItemIds[index]] = result.value.photo;
        }
      });

      if (!ignore) {
        setClaimPhotos(photos);
      }    }

      load().catch((err) => {
        if (!ignore) setLoadError(err.message);
      });

      return () => {
        ignore = true;
      };
    }, []); 


  // Runs one request, shows the server's message if it fails.
  async function run(action) {
    setSaving(true);
    setActionError("");
    try {
      await action();
    } catch (err) {
      setActionError(err.message);
    } finally {
      setSaving(false);
    }
  }

  const startEditing = (report) => {
    setEditingId(report.id);
    setEditForm({ title: report.itemName, location: report.location.name });
    setActionError("");
  };

  const saveEdit = (report) => {
    const title = editForm.title.trim();
    const place = editForm.location.trim();
    if (!title) {
      setActionError("The item name cannot be empty.");
      return;
    }
    const changes = { itemName: title };
    // a new place name means the saved map coordinates no longer match, so clear them
    if (place !== report.location.name) changes.location = { name: place, lat: null, lon: null };

    run(async () => {
      const updated = await updateItem(report.id, changes);
      setReports((list) => list.map((r) => (r.id === report.id ? updated : r)));
      setEditingId(null);
    });
  };

  const closeReport = (report) =>
    run(async () => {
      const updated = await updateItem(report.id, { status: "resolved" });
      setReports((list) => list.map((r) => (r.id === report.id ? updated : r)));
      setActionClaims((list) => list.filter((claim) => Number(claim.item_id) !== Number(report.id)));
    });

  const deleteReport = (report) => {
    if (!window.confirm(`Delete "${report.itemName}"? Any claims on it will be deleted too.`)) return;
    run(async () => {
      await deleteItem(report.id);
      setReports((list) => list.filter((r) => r.id !== report.id));
      setActionClaims((list) => list.filter((claim) => Number(claim.item_id) !== Number(report.id)));
    });
  };

  if (user === null) {
    return (
      <section className="dashboard-page">
        <h1>Your dashboard</h1>
        <p>Please log in to see and manage your reports. <Link to="/login">Log in</Link></p>
      </section>
    );
  }

  if (loadError) {
    return (
      <section className="dashboard-page">
        <p className="empty">{loadError}</p>
      </section>
    );
  }

  if (user === undefined || reports === null) {
    return (
      <section className="dashboard-page">
        <p className="empty">Loading your dashboard...</p>
      </section>
    );
  }

  const lostItems = reports.filter(
    (report) => report.reportType === "lost"
  ).length;

  const foundItems = reports.filter(
    (report) => report.reportType === "found"
  ).length;

  const returnedItems = reports.filter(
    (report) => report.status === "resolved"
  ).length;

  return (
    <section className="dashboard-page">
        {/* Welcome banner */}
      <div className="dashboard-header">
        <div className="dashboard-welcome-content">
          <p className="dashboard-label">MY ACCOUNT</p>

          <h1>
            Welcome back,{" "}
            <span className="dashboard-username">
              {user.display_name || user.username}!
            </span>
          </h1>

          <p className="dashboard-subtitle">
            Manage your lost and found items and claims in one place.
          </p>
        </div>

        <Link to="/report" className="btn dashboard-report-btn">
          <PlusCircle size={19} aria-hidden="true" />
          Report an item
        </Link>
      </div>

      {/* Clickable dashboard views; content below changes without navigation. */}
      <div className="dashboard-stats dashboard-navigation" role="group" aria-label="Dashboard sections">
        {[
          { id: "reports", title: "My Reports", count: reports.length, Icon: Package },
          { id: "claims", title: "My Claims", count: claims.length, Icon: ClipboardCheck },
          { id: "action", title: "Needs Action", count: actionClaims.length, Icon: BellRing },
        ].map(({ id: sectionId, title, count, Icon }) => (
          <button
            key={sectionId}
            type="button"
            className={`stat-card dashboard-nav-card ${activeSection === sectionId ? "is-selected" : ""}`}
            aria-pressed={activeSection === sectionId}
            onClick={() => setActiveSection(sectionId)}
          >
            <span className="stat-icon" aria-hidden="true"><Icon size={26} /></span>
            <span className="stat-content">
              <span className="stat-number">{count}</span>
              <span className="stat-label">{title}</span>
            </span>
          </button>
        ))}
      </div>

      <div className="dashboard-view-tools">
        <span>Choose a card to view that section.</span>
        <button type="button" className="dashboard-account-toggle" onClick={() => setActiveSection("account")}>
          {activeSection === "account" ? "Viewing account" : "Account information"}
        </button>
      </div>

      {activeSection === "action" && (
        <div className="dashboard-section dashboard-current-view">
          <div className="section-heading">
            <div>
              <h2>Needs Your Attention</h2>
              <p>Review new claims and complete handovers for approved claims.</p>
            </div>
          </div>
          {actionError && <p className="field-error" role="alert">{actionError}</p>}
          {pendingError && (
            <p className="field-error" role="alert">
              Could not load actions: {pendingError}. Confirm the new backend route is running.
            </p>
          )}
          {!pendingError && actionClaims.length === 0 && (
            <div className="dashboard-action-empty">
              <ClipboardCheck size={28} />
              <div>
                <h3>You're all caught up</h3>
                <p>New claims and handovers awaiting completion will appear here.</p>
              </div>
            </div>
          )}
          <div className="dashboard-items">
            {actionClaims.map((claim) => (
              <article className="dashboard-item dashboard-action-item" key={claim.id}>
                <div className="dashboard-action-icon">
                  {claim.status === "approved" ? <PackageOpen size={24} /> : <BellRing size={24} />}
                </div>
                <div className="dashboard-action-content">
                  <h3>
                    {claim.status === "approved" ? "Awaiting handover" : "New claim"}
                    {" — "}{claim.item_title || `Item #${claim.item_id}`}
                  </h3>
                  <p>
                    {claim.status === "approved"
                      ? `Claim approved for ${claim.claimant || "a claimant"}. Mark the report as returned only after the actual handover.`
                      : <><strong>{claim.claimant || "A user"}</strong> submitted ownership details for review.</>}
                  </p>
                  {claim.created_at && <p className="dashboard-action-date">Claim submitted {new Date(claim.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</p>}
                </div>
                <div className="dashboard-action-controls">
                  <Link to={`/items/${claim.item_id}#claims`} className="secondary-button dashboard-review-link">
                    {claim.status === "approved" ? "View item" : "Review claim"} <ArrowUpRight size={17} />
                  </Link>
                  {claim.status === "approved" && (
                    <button
                      type="button"
                      className="btn dashboard-handover-button"
                      disabled={saving}
                      onClick={() => {
                        const report = reports.find((r) => Number(r.id) === Number(claim.item_id));
                        if (!report) {
                          setActionError("Report not found. Refresh the dashboard and try again.");
                          return;
                        }
                        if (window.confirm("Has this item actually been handed over to its owner?")) {
                          closeReport(report);
                        }
                      }}
                    >
                      Mark as returned
                    </button>
                  )}
                </div>
              </article>
            ))}
          </div>
        </div>
      )}

      {/* My reported items */}
      {activeSection === "reports" && <div className="dashboard-section dashboard-current-view">
        <div className="section-heading">
          <div>
            <h2>My reported items</h2>
            <p>
              View, edit, close or delete the items you have reported.
            </p>
          </div>
        </div>

        {actionError && <p className="field-error" role="alert">{actionError}</p>}

        <div className="dashboard-items">
          {reports.length === 0 && (
            <p>You have not reported anything yet. <Link to="/report">Report an item</Link></p>
          )}

          {reports.map((report) => (
            <article className="dashboard-item" key={report.id}>
              {editingId === report.id ? (
                <div className="edit-report-form">
                  <h3>Edit report</h3>

                  <div className="form-group">
                    <label htmlFor={`title-${report.id}`}>
                      Item name
                    </label>
                    <input
                      id={`title-${report.id}`}
                      type="text"
                      value={editForm.title}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          title: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor={`location-${report.id}`}>
                      Location
                    </label>
                    <input
                      id={`location-${report.id}`}
                      type="text"
                      value={editForm.location}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          location: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="report-actions">
                    <button
                      type="button"
                      className="btn"
                      disabled={saving}
                      onClick={() => saveEdit(report)}
                    >
                      Save changes
                    </button>

                    <button
                      type="button"
                      className="secondary-button"
                      onClick={() => setEditingId(null)}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>

                  <div className="dashboard-report-content">
                    <div className="dashboard-report-thumbnail">
                      {report.photo ? (
                        <img
                          src={report.photo}
                          alt={report.itemName}
                          loading="lazy"
                        />
                      ) : (
                        <PackageOpen size={30} aria-label="No photo available" />
                      )}
                    </div>

                    <div className="item-info">
                      <span
                        className={`badge ${
                          report.reportType === "lost"
                            ? "badge-lost"
                            : "badge-found"
                        }`}
                      >
                        {report.reportType === "lost" ? "Lost" : "Found"}
                      </span>

                      <h3>{report.itemName}</h3>

                      <p>
                        <MapPin size={16} aria-hidden="true" />{" "}
                        {report.location?.name || "Location not specified"}
                      </p>

                      <p className="item-date">
                        <CalendarDays size={16} aria-hidden="true" />{" "}
                        {formatDate(report.date)}
                      </p>

                      {report.category && (
                        <span className="dashboard-category">
                          {report.category}
                        </span>
                      )}

                      {report.status === "resolved" && (
                        <span className="closed-text">
                          This report has been closed.
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="report-right">
                    <span
                      className={`status-badge ${
                        report.status === "resolved"
                          ? "status-returned"
                          : "status-active"
                      }`}
                    >
                      {STATUS_LABELS[report.status] || report.status}
                    </span>

                    <div className="report-actions">
                      {report.status !== "resolved" && (
                        <>
                          <button
                            type="button"
                            className="secondary-button"
                            onClick={() => startEditing(report)}
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            className="close-button"
                            disabled={saving}
                            onClick={() => closeReport(report)}
                          >
                            {report.status === "claimed" ? "Mark as returned" : "Close report"}
                          </button>
                        </>
                      )}

                      <button
                        type="button"
                        className="close-button"
                        disabled={saving}
                        onClick={() => deleteReport(report)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </>
              )}
            </article>
          ))}
        </div>
      </div>}

      {/* My claims */}
      {activeSection === "claims" && <div className="dashboard-section dashboard-current-view">
        <div className="section-heading">
          <div>
            <h2>My claims</h2>
            <p>View the claims you have submitted for found items.</p>
          </div>
        </div>

        <div className="dashboard-items">
          {claims.length === 0 && (
          <p>You have not submitted any claims yet.</p>)}
          {claims.map((claim) => (
            <article className="dashboard-item" key={claim.id}>

              <div className="dashboard-claim-content">

                <div className="dashboard-claim-icon">
                  {claimPhotos[claim.item_id] ? (
                    <img
                      src={claimPhotos[claim.item_id]}
                      alt={claim.item_title || "Claimed item"}
                      loading="lazy"
                      className="dashboard-claim-photo"
                    />
                  ) : (
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M5 8 12 4l7 4v9l-7 4-7-4V8Z" />
                      <path d="m5 8 7 4 7-4" />
                      <path d="M12 12v9" />
                    </svg>
                  )}
                </div>

                <div className="item-info">
                  <h3>{claim.item_title || `Item #${claim.item_id}`}</h3>

                  <p className="dashboard-claim-date">
                    <CalendarDays size={16} aria-hidden="true" />
                    Claim submitted on{" "}
                    {claim.created_at
                      ? new Date(claim.created_at).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })
                      : "Unknown date"}
                  </p>
                </div>
              </div>
              <div className="claim-card-actions">
                <span className={`status-badge claim-status-${claim.status}`}>
                  {claim.status
                    ? claim.status.charAt(0).toUpperCase() + claim.status.slice(1)
                    : "Unknown"}
                </span>

                <Link
                  to={`/items/${claim.item_id}`}
                  className="secondary-button claim-view-link"
                >
                  View item <span aria-hidden="true">↗</span>
                </Link>
              </div>            
            </article>
          ))}
        </div>
      </div>}

      {/* Account information */}
      {activeSection === "account" && <div className="dashboard-section dashboard-current-view">
        <div className="section-heading">
          <div>
            <h2>Account information</h2>
            <p>Your account details will appear here.</p>
          </div>
        </div>


      <AccountSettings user={user} onUserChanged={setUser} />
      </div>}
    </section>
  );
}
export default Dashboard;
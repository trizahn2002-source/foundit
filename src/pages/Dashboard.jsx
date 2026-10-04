import { useState } from "react";

function Dashboard() {
  const [reports, setReports] = useState([
    {
      id: 1,
      type: "Lost",
      title: "Black Backpack",
      location: "Sarit Centre, Westlands",
      date: "28 September 2026",
      status: "Active",
    },
    {
      id: 2,
      type: "Found",
      title: "Phone in Blue Case",
      location: "Archives Stage, Nairobi CBD",
      date: "26 September 2026",
      status: "Returned",
    },
    {
      id: 3,
      type: "Lost",
      title: "Student ID Card",
      location: "University campus",
      date: "24 September 2026",
      status: "Active",
    },
  ]);

  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    title: "",
    location: "",
  });

  const claims = [
    {
      id: 1,
      item: "Phone in Blue Case",
      status: "Pending",
      date: "29 September 2026",
    },
    {
      id: 2,
      item: "Black Backpack",
      status: "Approved",
      date: "28 September 2026",
    },
  ];

  const startEditing = (report) => {
    setEditingId(report.id);
    setEditForm({
      title: report.title,
      location: report.location,
    });
  };

  const saveEdit = (id) => {
    setReports(
      reports.map((report) =>
        report.id === id
          ? {
              ...report,
              title: editForm.title,
              location: editForm.location,
            }
          : report
      )
    );

    setEditingId(null);
  };

  const closeReport = (id) => {
    setReports(
      reports.map((report) =>
        report.id === id
          ? { ...report, status: "Returned" }
          : report
      )
    );
  };

  const lostItems = reports.filter((report) => report.type === "Lost").length;
  const foundItems = reports.filter((report) => report.type === "Found").length;
  const returnedItems = reports.filter(
    (report) => report.status === "Returned"
  ).length;

  return (
    <section className="dashboard-page">
      <div className="dashboard-header">
        <div>
          <p className="dashboard-label">MY ACCOUNT</p>
          <h1>Welcome to your dashboard</h1>
          <p className="dashboard-subtitle">
            Manage your lost and found items and claims in one place.
          </p>
        </div>

        <button type="button" className="btn">
          Report an item
        </button>
      </div>

      {/* Dashboard statistics */}
      <div className="dashboard-stats">
        <div className="stat-card">
          <span className="stat-number">{lostItems}</span>
          <span className="stat-label">Lost items</span>
        </div>

        <div className="stat-card">
          <span className="stat-number">{foundItems}</span>
          <span className="stat-label">Found items</span>
        </div>

        <div className="stat-card">
          <span className="stat-number">{returnedItems}</span>
          <span className="stat-label">Items returned</span>
        </div>
      </div>

      {/* My reported items */}
      <div className="dashboard-section">
        <div className="section-heading">
          <div>
            <h2>My reported items</h2>
            <p>
              View, edit and close the items you have reported.
            </p>
          </div>
        </div>

        <div className="dashboard-items">
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
                      onClick={() => saveEdit(report.id)}
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
                  <div className="item-info">
                    <span
                      className={`badge ${
                        report.type === "Lost"
                          ? "badge-lost"
                          : "badge-found"
                      }`}
                    >
                      {report.type}
                    </span>

                    <h3>{report.title}</h3>

                    <p>Reported from {report.location}</p>

                    <span className="item-date">
                      {report.date}
                    </span>

                    {report.status === "Returned" && (
                      <span className="closed-text">
                        This report has been closed.
                      </span>
                    )}
                  </div>

                  <div className="report-right">
                    <span
                      className={`status-badge ${
                        report.status === "Returned"
                          ? "status-returned"
                          : "status-active"
                      }`}
                    >
                      {report.status}
                    </span>

                    {report.status !== "Returned" && (
                      <div className="report-actions">
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
                          onClick={() => closeReport(report.id)}
                        >
                          Close report
                        </button>
                      </div>
                    )}
                  </div>
                </>
              )}
            </article>
          ))}
        </div>
      </div>

      {/* My claims */}
      <div className="dashboard-section">
        <div className="section-heading">
          <div>
            <h2>My claims</h2>
            <p>View the claims you have submitted for found items.</p>
          </div>
        </div>

        <div className="dashboard-items">
          {claims.map((claim) => (
            <article className="dashboard-item" key={claim.id}>
              <div className="item-info">
                <h3>{claim.item}</h3>

                <p>Claim submitted on {claim.date}</p>
              </div>

              <span
                className={`status-badge ${
                  claim.status === "Approved"
                    ? "status-returned"
                    : "status-active"
                }`}
              >
                {claim.status}
              </span>
            </article>
          ))}
        </div>
      </div>

      {/* Account information */}
      <div className="dashboard-section">
        <div className="section-heading">
          <div>
            <h2>Account information</h2>
            <p>Your account details will appear here.</p>
          </div>
        </div>

        <div className="account-card">
          <div>
            <span className="account-label">Name</span>
            <strong>FoundIt User</strong>
          </div>

          <div>
            <span className="account-label">Email</span>
            <strong>user@example.com</strong>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Dashboard;
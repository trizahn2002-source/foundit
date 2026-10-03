function Dashboard() {
  return (
    <section className="dashboard-page">
      <div className="dashboard-header">
        <div>
          <p className="dashboard-label">MY ACCOUNT</p>
          <h1>Welcome to your dashboard</h1>
          <p className="dashboard-subtitle">
            Manage your lost and found items in one place.
          </p>
        </div>

        <button type="button" className="btn">
          Report an item
        </button>
      </div>

      <div className="dashboard-stats">
        <div className="stat-card">
          <span className="stat-number">2</span>
          <span className="stat-label">Lost items</span>
        </div>

        <div className="stat-card">
          <span className="stat-number">1</span>
          <span className="stat-label">Found items</span>
        </div>

        <div className="stat-card">
          <span className="stat-number">1</span>
          <span className="stat-label">Items returned</span>
        </div>
      </div>

      <div className="dashboard-section">
        <div className="section-heading">
          <div>
            <h2>My reported items</h2>
            <p>Items you have reported as lost or found.</p>
          </div>
        </div>

        <div className="dashboard-items">
          <article className="dashboard-item">
            <div className="item-info">
              <span className="badge badge-lost">Lost</span>
              <h3>Black Backpack</h3>
              <p>Reported from Sarit Centre, Westlands</p>
              <span className="item-date">28 September 2026</span>
            </div>

            <span className="status-badge status-active">Active</span>
          </article>

          <article className="dashboard-item">
            <div className="item-info">
              <span className="badge badge-found">Found</span>
              <h3>Phone in Blue Case</h3>
              <p>Reported from Archives Stage, Nairobi CBD</p>
              <span className="item-date">26 September 2026</span>
            </div>

            <span className="status-badge status-returned">Returned</span>
          </article>

          <article className="dashboard-item">
            <div className="item-info">
              <span className="badge badge-lost">Lost</span>
              <h3>Student ID Card</h3>
              <p>Reported from the university campus</p>
              <span className="item-date">24 September 2026</span>
            </div>

            <span className="status-badge status-active">Active</span>
          </article>
        </div>
      </div>

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
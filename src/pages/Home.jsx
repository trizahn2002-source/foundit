import Hero from "../components/Hero";
import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Search, MapPin, CalendarDays, ImageOff } from "lucide-react";
import { getItemsPage, getCategories } from "../utils/api";
import "./Home.css";

function isReturnedItem(item) {
  const status = String(item.status || "").toLowerCase();
  const reportType = String(item.reportType || "").toLowerCase();

  return (
    status === "returned" ||
    status === "resolved" ||
    reportType === "returned"
  );
}

function Home() {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState(null);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [slowLoad, setSlowLoad] = useState(false);
  const previousPage = useRef(page);

  // Go back to page 1 whenever the search or filters change
  useEffect(() => {
    setPage(1);
  }, [search, filter, categoryId]);

  // After pressing Next / Previous, bring the top of the list back into view
  useEffect(() => {
    if (previousPage.current === page) return;
    previousPage.current = page;

    const reduceMotion =
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    document.querySelector(".home-controls")?.scrollIntoView({
      behavior: reduceMotion ? "auto" : "smooth",
      block: "start",
    });
  }, [page]);

  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch(() => {});
  }, []);

  useEffect(() => {
    let ignore = false;

    const timer = setTimeout(() => {
      // "Returned" items are the ones with status "resolved". The server
      // filters them, so every page and page count is correct.
      const isReturnedTab = filter === "returned";

      getItemsPage({
        search,
        type: isReturnedTab ? "all" : filter,
        status: isReturnedTab ? "resolved" : undefined,
        categoryId,
        page,
        status: filter === "returned" ? "resolved" : undefined,
      })
        .then((data) => {
          if (!ignore) {
            const pageItems = Array.isArray(data.items) ? data.items : [];

            setItems(pageItems);

            setPagination(data.pagination);
            setError("");
          }
        })
        .catch((err) => {
          if (!ignore) {
            setError(err.message || "Unable to load items.");
            setItems([]);
          }
        });
    }, 300);

    return () => {
      ignore = true;
      clearTimeout(timer);
    };
  }, [search, filter, categoryId, page, reloadKey]);

  // If the first load is slow (for example the server is waking up), say so.
  useEffect(() => {
    if (items !== null || error) {
      setSlowLoad(false);
      return;
    }

    const timer = setTimeout(() => setSlowLoad(true), 4000);
    return () => clearTimeout(timer);
  }, [items, error]);

  const allItems = items || [];

  const shownItems = allItems;

  const hasActiveFilters =
    Boolean(search.trim()) || Boolean(categoryId) || filter !== "all";

  function clearFilters() {
    setSearch("");
    setCategoryId("");
    setFilter("all");
  }

  function retryLoading() {
    setError("");
    setItems(null);
    setReloadKey((k) => k + 1);
  }

  return (
    <div className="container home-page">
      <Hero />

      <div className="home-controls">
        <div className="home-search">
          <Search
            className="home-search-icon"
            size={20}
            strokeWidth={2}
            aria-hidden="true"
          />
          <input
            className="input home-search-input"
            type="search"
            aria-label="Search reported items"
            placeholder="Search for a phone, backpack, keys..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          className="input"
          aria-label="Filter by category"
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
        >
          <option value="">All categories</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>

        <div className="filter-buttons">
          {["all", "lost", "found", "returned"].map((type) => (
            <button
              key={type}
              type="button"
              className={filter === type ? "btn" : "btn btn-outline"}
              aria-pressed={filter === type}
              onClick={() => setFilter(type)}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {error ? (
        <div className="empty home-empty" role="alert">
          <p>{error}</p>
          <button type="button" className="btn" onClick={retryLoading}>
            Try again
          </button>
        </div>
      ) : items === null ? (
        <div aria-busy="true">
          <p className="empty home-loading" role="status">
            {slowLoad
              ? "Still loading... the server can take a few seconds to wake up."
              : "Loading items..."}
          </p>

          <div className="items-grid" aria-hidden="true">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="card item-card item-card-skeleton">
                <div className="item-card-image" />
                <div className="skeleton-line skeleton-line--badge" />
                <div className="skeleton-line" />
                <div className="skeleton-line skeleton-line--short" />
              </div>
            ))}
          </div>
        </div>
      ) : shownItems.length === 0 ? (
        <div className="empty home-empty">
          <h3>
            {filter === "returned"
              ? "No returned items found."
              : hasActiveFilters
                ? "No items match your search."
                : "No reports yet."}
          </h3>

          <p>
            {hasActiveFilters
              ? "Try a different word, or clear the filters."
              : "Be the first to post one."}
          </p>

          <div className="home-empty-actions">
            {hasActiveFilters && (
              <button type="button" className="btn" onClick={clearFilters}>
                Clear filters
              </button>
            )}

            <Link to="/report?type=lost" className="btn btn-outline">
              I lost something
            </Link>
            <Link to="/report?type=found" className="btn btn-outline">
              I found something
            </Link>
          </div>
        </div>
      ) : (
        <div className="items-grid">
          {shownItems.map((item) => {
            const returned = isReturnedItem(item);

            return (
              <Link
                to={`/items/${item.id}`}
                key={item.id}
                className="card item-card"
              >
                <div className="item-card-image">
                  {item.photo ? (
                    <img
                      className="item-card-photo"
                      src={item.photo}
                      alt={item.itemName || "Reported item"}
                    />
                  ) : (
                    <div className="item-card-placeholder">
                      <ImageOff
                        size={30}
                        strokeWidth={1.7}
                        aria-hidden="true"
                      />
                      <span>No photo available</span>
                    </div>
                  )}
                </div>

                <div className="item-card-details">
                  <div className="item-card-badges">
                    <span
                    className={`badge badge-${
                      returned ? "returned" : item.reportType
                    }`}
                  >
                    {returned
                      ? "Returned"
                      : item.reportType || "Item"}
                  </span>

                    {!returned && item.status === "claimed" && (
                      <span className="badge badge-claimed">
                        Claim in progress
                      </span>
                    )}
                  </div>

                  <h3>{item.itemName}</h3>

                  <p className="item-card-meta">
                    <MapPin
                      size={16}
                      strokeWidth={2}
                      aria-hidden="true"
                    />
                    <span>
                      {item.location?.name || "Location not specified"}
                    </span>
                  </p>

                  <p className="item-card-meta">
                    <CalendarDays
                      size={16}
                      strokeWidth={2}
                      aria-hidden="true"
                    />
                    <span>
                      {item.date
                        ? new Date(`${item.date}T00:00:00`).toLocaleDateString(
                            "en-GB",
                            {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            }
                          )
                        : "Date not specified"}
                    </span>
                  </p>

                  <span className="item-card-category">
                    {item.category}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    {pagination && pagination.pages > 1 && (
        <nav className="home-pagination" aria-label="Pagination">
          <button
            type="button"
            className="btn"
            disabled={!pagination.has_prev}
            onClick={() => setPage(page - 1)}
          >
            ← Previous
          </button>

          <span aria-live="polite">
            Page {pagination.page} of {pagination.pages}
          </span>

          <button
            type="button"
            className="btn"
            disabled={!pagination.has_next}
            onClick={() => setPage(page + 1)}
          >
            Next →
          </button>
        </nav>
      )}
    </div>
  );
}

export default Home;
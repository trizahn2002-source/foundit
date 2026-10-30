import Hero from "../components/Hero";
import { useState, useEffect } from "react";
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

  // Go back to page 1 whenever the search or filters change
  useEffect(() => {
    setPage(1);
  }, [search, filter, categoryId]);

  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch(() => {});
  }, []);

  useEffect(() => {
    let ignore = false;

    const timer = setTimeout(() => {
      // Request all report types when showing returned items.
      // Keep pagination from the latest main branch.
      const requestedType = filter === "returned" ? "all" : filter;

      getItemsPage({
        search,
        type: requestedType,
        categoryId,
        page,
        status: filter === "returned" ? "resolved" : undefined,
      })
        .then((data) => {
          if (!ignore) {
            const pageItems = Array.isArray(data.items) ? data.items : [];

            setItems(
              filter === "returned"
                ? pageItems.filter(isReturnedItem)
                : pageItems
            );

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
  }, [search, filter, categoryId, page]);

  const allItems = items || [];

  const shownItems =
    filter === "returned"
      ? allItems.filter(isReturnedItem)
      : allItems;

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
        <p className="empty">{error}</p>
      ) : items === null ? (
        <p className="empty">Loading items...</p>
      ) : shownItems.length === 0 ? (
        <p className="empty">
          {filter === "returned"
            ? "No returned items found."
            : "No items match your search."}
        </p>
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
                  <span
                    className={`badge badge-${
                      returned ? "returned" : item.reportType
                    }`}
                  >
                    {returned
                      ? "Returned"
                      : item.reportType || "Item"}
                  </span>

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
        <div style={{ display: "flex", gap: "1rem", justifyContent: "center", alignItems: "center", margin: "2rem 0" }}>
          <button className="btn" disabled={!pagination.has_prev} onClick={() => setPage(page - 1)}>
            ← Previous
          </button>
          <span>Page {pagination.page} of {pagination.pages}</span>
          <button className="btn" disabled={!pagination.has_next} onClick={() => setPage(page + 1)}>
            Next →
          </button>
        </div>
      )}
    </div>
  );
}

export default Home;

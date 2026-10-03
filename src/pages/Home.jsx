import Hero from "../components/Hero";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getItems } from "../utils/api";
import "./Home.css";

function Home() {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [items, setItems] = useState(null); // null = still loading
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;
    getItems()
      .then((data) => { if (!ignore) setItems(data); })
      .catch((err) => { if (!ignore) setError(err.message); });
    return () => { ignore = true; };
  }, []);

  // newest reports first
  const shownItems = [...(items || [])].sort((a, b) => b.id - a.id).filter((item) => {
    const matchesType = filter === "all" || item.reportType === filter;
    const matchesSearch = item.itemName.toLowerCase().includes(search.toLowerCase());
    return matchesType && matchesSearch;
  });

  return (
    <div className="container">
        <Hero />

      <div className="home-controls">
        <input
          className="input"
          type="text"
          placeholder="Search items..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="filter-buttons">
          {["all", "lost", "found"].map((type) => (
            <button
              key={type}
              className={filter === type ? "btn" : "btn btn-outline"}
              onClick={() => setFilter(type)}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {error ? (
        <p className="empty">{error}</p>
      ) : items === null ? (
        <p className="empty">Loading items...</p>
      ) : shownItems.length === 0 ? (
        <p className="empty">No items match your search.</p>
      ) : (
        <div className="items-grid">
          {shownItems.map((item) => (
            <Link to={`/items/${item.id}`} key={item.id} className="card item-card">
              {item.photo && <img className="item-card-photo" src={item.photo} alt={item.itemName} />}
              <span className={`badge badge-${item.reportType}`}>{item.reportType}</span>
              <h3>{item.itemName}</h3>
              <p>{item.location.name}</p>
              <small>{item.category} · {item.date}</small>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default Home;
import Hero from "../components/Hero";
import { useState } from "react";
import { Link } from "react-router-dom";
import { items } from "../data/mockData";
import "./Home.css";

function Home() {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const shownItems = items.filter((item) => {
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

      {shownItems.length === 0 ? (
        <p className="empty">No items match your search.</p>
      ) : (
        <div className="items-grid">
          {shownItems.map((item) => (
            <Link to={`/items/${item.id}`} key={item.id} className="card item-card">
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
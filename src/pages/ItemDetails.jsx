import { useEffect, useState } from "react";
import ClaimForm from "../components/ClaimForm";
import PossibleMatches from "../components/PossibleMatches";
import { useParams, Link } from "react-router-dom";
import { users } from "../data/mockData";
import { getItems } from "../utils/api";
import "./ItemDetails.css";

function ItemDetails() {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadedId, setLoadedId] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;
    getItems()
      .then((loadedItems) => {
        if (!ignore) {
          setItems(loadedItems);
          setItem(loadedItems.find((entry) => String(entry.id) === id) || null);
          setError("");
          setLoadedId(id);
        }
      })
      .catch((err) => {
        if (!ignore) {
          setError(err.message);
          setLoadedId(id);
        }
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });
    return () => { ignore = true; };
  }, [id]);

  if (loading || loadedId !== id) {
    return <p className="item-details-notfound">Loading item...</p>;
  }

  if (error) {
    return (
      <section className="item-details-notfound">
        <h1>Could not load item</h1>
        <p>{error}</p>
        <Link to="/">Back to all items</Link>
      </section>
    );
  }

  if (!item) {
    return (
      <section className="item-details-notfound">
        <h1>Item not found</h1>
        <p>There is no item with ID {id}.</p>
        <Link to="/">Back to all items</Link>
      </section>
    );
  }

  const reporter = users.find((u) => u.id === item.reportedBy);

  return (
    <section className="item-details">
      <Link to="/" className="item-details-back">← Back to all items</Link>

      <div className="item-details-layout">
        {item.photo ? (
          <img className="item-details-photo" src={item.photo} alt={item.itemName} />
        ) : (
          <div className="item-details-photo item-details-photo--empty">
            No photo provided
          </div>
        )}

        <div className="item-details-info">
          <div className="item-details-badges">
            <span className={`item-badge item-badge--${item.reportType}`}>
              {item.reportType}
            </span>
            <span className={`item-badge item-badge--${item.status}`}>
              {item.status}
            </span>
          </div>

          <h1>{item.itemName}</h1>
          <p className="item-details-description">{item.description}</p>

          <dl className="item-details-meta">
            <dt>Category</dt>
            <dd>{item.category}</dd>
            <dt>Location</dt>
            <dd>{item.location.name}</dd>
            <dt>Date</dt>
            <dd>{item.date}</dd>
            <dt>Reported by</dt>
            <dd>{reporter ? reporter.name : "Unknown"}</dd>
          </dl>
        </div>
      </div>

    {item.reportType === "lost" && item.status === "active" && (
      <PossibleMatches currentItem={item} allItems={items} />
    )}

    {item.reportType === "found" && item.status === "active" && (
      <ClaimForm />
    )}
    </section>
  );
}

export default ItemDetails;

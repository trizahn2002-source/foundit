import { useParams, Link } from "react-router-dom";
import { items, users } from "../data/mockData";
import "./ItemDetails.css";

function ItemDetails() {
  const { id } = useParams();
  const item = items.find((i) => i.id === Number(id));

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

      {/*Task 5: matches and claim form go here for easier work */}
    </section>
  );
}

export default ItemDetails;

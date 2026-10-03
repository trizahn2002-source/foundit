import { Link } from "react-router-dom";
import "./PossibleMatches.css";

const MAX_DATE_DIFFERENCE =7;
function isDateClose(date1, date2){
    const firstDate = new Date(date1);
    const secondDate = new Date(date2);

    const differenceInMilliseconds = Math.abs(firstDate - secondDate)
    const differenceInDays = differenceInMilliseconds / (1000 * 60 * 60 * 24);
    return differenceInDays <= MAX_DATE_DIFFERENCE;
}
function getDistance(location1, location2) {
  const lat1 = location1.lat;
  const lon1 = location1.lon;
  const lat2 = location2.lat;
  const lon2 = location2.lon;

  const toRadians = (degrees) => degrees * (Math.PI / 180);

  const earthRadius = 6371;

  const latitudeDifference = toRadians(lat2 - lat1);
  const longitudeDifference = toRadians(lon2 - lon1);

  const a =
    Math.sin(latitudeDifference / 2) ** 2 +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(longitudeDifference / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return earthRadius * c;
}

function getKeywords(item) {
  const text = `${item.itemName} ${item.description}`.toLowerCase();

  const commonWords = [
    "a",
    "an",
    "the",
    "in",
    "on",
    "at",
    "with",
    "and",
    "of",
    "near",
    "found",
    "lost",
  ];

  return text
    .replace(/[^\w\s]/g, "")
    .split(/\s+/)
    .filter((word) => word && !commonWords.includes(word));
}
function getTextMatchScore(item1, item2) {
  const keywords1 = getKeywords(item1);
  const keywords2 = getKeywords(item2);

  const matchingWords = keywords1.filter((word) =>
    keywords2.includes(word)
  );

  const uniqueMatchingWords = [...new Set(matchingWords)];

  return uniqueMatchingWords.length;
}

function getMatchScore(currentItem, candidate) {
  let score = 0;

  const distance = getDistance(
    currentItem.location,
    candidate.location
  );

  const textScore = getTextMatchScore(
    currentItem,
    candidate
  );

  if (distance <= 2) {
    score += 3;
  } else if (distance <= 5) {
    score += 2;
  } else if (distance <= 10) {
    score += 1;
  }

  if (textScore >= 4) {
    score += 3;
  } else if (textScore >= 2) {
    score += 2;
  } else if (textScore === 1) {
    score += 1;
  }

  return score;
}

function PossibleMatches({ currentItem, allItems }){
    const possibleMatches = allItems
    .filter((item) => {
        return (
        item.reportType !== currentItem.reportType &&
        item.category === currentItem.category &&
        item.status === "active" &&
        isDateClose(item.date, currentItem.date)
        );
    })
    .filter((item) => getTextMatchScore(currentItem, item) >= 2)
    .sort(
        (a, b) =>
        getMatchScore(currentItem, b) -
        getMatchScore(currentItem, a)
  );   
return (
  <section className="matches-section">
    <h2>Possible Matches</h2>

    {possibleMatches.length === 0 && (
      <p>No possible matches found yet.</p>
    )}

    <div className="matches-list">
      {possibleMatches.map((match) => (
        <div className="match-card" key={match.id}>
          <h3>{match.itemName}</h3>

          <div className="match-details">
            <p>
              <strong>Category:</strong> {match.category}
            </p>

            <p>
              <strong>Location:</strong> {match.location.name}
            </p>

            <p>
              <strong>Date:</strong> {match.date}
            </p>
          </div>

          <Link
            className="match-link"
            to={`/items/${match.id}`}
          >
            View Item
          </Link>
        </div>
      ))}
    </div>
  </section>
);
}
export default PossibleMatches;
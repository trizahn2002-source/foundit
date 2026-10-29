import { useState, useEffect, useRef } from "react";
import { searchPlaces } from "../utils/geoapify";
import { Link, useSearchParams } from "react-router-dom";
import { getCategories, addItem } from "../utils/api";
import { fileToDataUrl } from "../utils/image";
import "./ReportItem.css";
import { ClipboardList } from "lucide-react";

function ReportItem() {
  const [searchParams] = useSearchParams();
  const requestedType = searchParams.get("type") === "found" ? "found" : "lost";
  const photoInputRef = useRef(null);
  const [form, setForm] = useState({
    reportType: requestedType, itemName: "", category: "", description: "", date: "",
  });
  const [photo, setPhoto] = useState("");
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState(null); // { name, lat, lon }
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [photoError, setPhotoError] = useState("");
  const [isDraggingPhoto, setIsDraggingPhoto] = useState(false);
  const [categories, setCategories] = useState([]); // [{ id, name }] from the backend
  const [categoriesError, setCategoriesError] = useState("");
  const [needsLogin, setNeedsLogin] = useState(false);

  // Keep the selected option in sync when navigating between hero links.
  // Preserve all other entered form fields.
  useEffect(() => {
    setForm((current) => ({ ...current, reportType: requestedType }));
  }, [requestedType]);

  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch((err) => setCategoriesError(err.message));
  }, []);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function processPhoto(file) {
    setPhotoError("");
    setErrors((current) => ({ ...current, photo: "" }));
    if (!file) {
      return;
    }
    if (!file.type.startsWith("image/")) {
      setPhotoError("Choose an image file.");
      return;
    }
    try {
      setPhoto(await fileToDataUrl(file));
    } catch (err) {
      setPhotoError(err.message);
    }
  }

  function handlePhotoChange(e) {
    const file = e.target.files[0];
    e.target.value = "";
    processPhoto(file);
  }

  function handlePhotoDrop(e) {
    e.preventDefault();
    setIsDraggingPhoto(false);
    processPhoto(e.dataTransfer.files[0]);
  }

  useEffect(() => {
    if (query.length < 3 || location?.name === query) {
      return;
    }
    const timer = setTimeout(async () => {
      setLoading(true);
      setApiError("");
      try {
        setSuggestions(await searchPlaces(query));
      } catch (err) {
        setApiError(err.message);
      } finally {
        setLoading(false);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [query, location]);

  function pickPlace(place) {
    setLocation(place);
    setQuery(place.name);
    setSuggestions([]);
  }

  function validate() {
    const e = {};
    if (!form.itemName.trim()) e.itemName = "Item name is required";
    if (!form.category) e.category = "Choose a category";
    if (form.description.trim().length < 10) e.description = "Add at least 10 characters";
    if (!form.date) e.date = "Pick a date";
    if (!location) e.location = "Pick a location from the list";
    if (!photo) e.photo = "Upload a photo of the item";
    return e;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setSaving(true);
    setSubmitError("");
    setNeedsLogin(false);
    try {
      // form.category holds the category id chosen in the dropdown
      await addItem({ ...form, categoryId: form.category, location, photo, status: "active" });
      setSubmitted(true);
    } catch (err) {
      if (err.status === 401) {
        setNeedsLogin(true);
        setSubmitError("Please log in to submit a report.");
      } else {
        setSubmitError(err.message);
      }
    } finally {
      setSaving(false);
    }
  }

  if (submitted) {
    return (
      <section className="report-page">
        <div style={{ textAlign: "center", padding: "3rem 1rem" }}>
            <p className="field-ok" style={{ fontSize: "1.2rem", marginBottom: "1.5rem" }}>
              ✅ Your report was submitted. Thank you!
            </p>
            <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
              <Link to="/" className="btn">Back to all items</Link>
              <Link to="/dashboard" className="view-reports-btn"><ClipboardList size={17} aria-hidden="true" />
              View my reports</Link>
            </div>
          </div>
      </section>
    );
  }

return (
  <section className="report-page">

<div className="report-card">
  <div className="report-card-header">
    <div className="report-card-header-content">
      <span className="report-card-eyebrow">
        LOST & FOUND
      </span>

      <h1>Report an item</h1>

      <p className="report-intro">
        Share a few details to help reunite an item with its owner.
      </p>
    </div>

    <svg
      className="report-card-header-icon"
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden="true"
    >
      <circle
        cx="20"
        cy="20"
        r="12"
        stroke="currentColor"
        strokeWidth="3"
      />
      <path
        d="M29 29L40 40"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M15 20L19 24L25 17"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  </div>

  <form className="report-form" onSubmit={handleSubmit}>
        <div className="type-toggle" role="radiogroup" aria-label="Report type">
          <label className={`type-option type-lost${form.reportType === "lost" ? " selected" : ""}`}>
            <input type="radio" name="reportType" value="lost"
              checked={form.reportType === "lost"} onChange={handleChange} /> Lost
          </label>
          <label className={`type-option type-found${form.reportType === "found" ? " selected" : ""}`}>
            <input type="radio" name="reportType" value="found"
              checked={form.reportType === "found"} onChange={handleChange} /> Found
          </label>
        </div>

        <div className="field">
          <label htmlFor="itemName">Item name</label>
          <input className="input" id="itemName" name="itemName" value={form.itemName} onChange={handleChange} />
          {errors.itemName && <p className="field-error">{errors.itemName}</p>}
        </div>

        <div className="field">
          <label htmlFor="category">Category</label>
          <select className="input" id="category" name="category" value={form.category} onChange={handleChange}>
            <option value="">Select...</option>
            {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
          </select>
          {categoriesError && <p className="field-error">{categoriesError}</p>}
          {errors.category && <p className="field-error">{errors.category}</p>}
        </div>

        <div className="field">
          <label htmlFor="description">Description</label>
          <textarea className="input" id="description" name="description" value={form.description} onChange={handleChange} />
          {errors.description && <p className="field-error">{errors.description}</p>}
        </div>

        <div className="field">
          <label htmlFor="date">Date</label>
          <input className="input" id="date" type="date" name="date" value={form.date} onChange={handleChange} />
          {errors.date && <p className="field-error">{errors.date}</p>}
        </div>

        <div className="field">
          <label htmlFor="location">Location</label>
          <input className="input" id="location" value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setLocation(null);
              setSuggestions([]);
            }}
            placeholder="Start typing a place..." aria-expanded={suggestions.length > 0}
            aria-controls="location-suggestions" aria-autocomplete="list" />
          {loading && <p className="field-hint">Searching...</p>}
          {apiError && <p className="field-error">{apiError}</p>}
          {suggestions.length > 0 && (
            <ul className="suggestions" id="location-suggestions">
              {suggestions.map((suggestion) => (
                <li key={suggestion.name}>
                  <button type="button" onClick={() => pickPlace(suggestion)}>{suggestion.name}</button>
                </li>
              ))}
            </ul>
          )}
          {errors.location && <p className="field-error">{errors.location}</p>}
        </div>

        <div
          className={`field photo-field${isDraggingPhoto ? " is-dragging" : ""}`}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDraggingPhoto(true);
          }}
          onDragLeave={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget)) setIsDraggingPhoto(false);
          }}
          onDrop={handlePhotoDrop}
        >
          <label htmlFor="photo">Photo (required)</label>
          <input className="photo-input" id="photo" type="file" accept="image/*"
            ref={photoInputRef} required={!photo} onChange={handlePhotoChange} />
          <p className="field-hint">
            {isDraggingPhoto ? "Drop to use this photo" : "Drag an image here or choose a file."}
          </p>
          {photoError && <p className="field-error">{photoError}</p>}
          {errors.photo && <p className="field-error">{errors.photo}</p>}
          {photo && <img className="photo-preview" src={photo} alt="Preview of the selected item" />}
          {photo && (
            <button className="photo-replace-btn" type="button" onClick={() => {
              photoInputRef.current.value = "";
              photoInputRef.current.click();
            }}>
              Replace photo
            </button>
          )}
        </div>

        {submitError && (
          <p className="field-error submit-error" role="alert">
            {submitError} {needsLogin && <Link to="/login">Log in</Link>}
          </p>
        )}
        <button className="submit-btn" type="submit" disabled={saving}>
          {saving ? "Saving..." : "Submit report"}
      </button>
    </form>
    </div>
  </section>
);}

export default ReportItem;
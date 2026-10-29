// FoundIt API helper: talks to the Flask backend (python app.py, port 5555).
//
// Flask and the pages use different field names, so this file translates both ways:
//   Flask:  title / type / category_id / location + latitude + longitude / image_url / user_id
//   Pages:  itemName / reportType / category + categoryId / location {name, lat, lon} / photo / reportedBy
// Keep the translation here so no page has to know about the backend's names.

const API_BASE = (
  import.meta.env.VITE_API_URL || "http://localhost:5555"
).replace(/\/+$/, "");

const API_URL = `${API_BASE}/api`;

const OFFLINE_MSG =
  "Can't reach the server. Open a second terminal and run: python app.py";

// Sends the request with the login cookie and returns the parsed JSON (null for 204).
// On an error response it throws an Error with the server's message and a .status.

async function getCsrfToken() {
  const response = await fetch(`${API_URL}/csrf-token`, {
    credentials: "include",
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(
      "Unable to initialize your security session."
    );
  }

  const data = await response.json();

  if (!data.csrf_token) {
    throw new Error(
      "The server did not provide a security token."
    );
  }

  return data.csrf_token;
}

// Sends the request with the login cookie and returns the parsed JSON (null for 204).
// On an error response it throws an Error with the server's message and a .status.
// State-changing requests also include the CSRF security token.
  export async function request(
    path,
    { body, ...options } = {},
    fallbackMessage = "Something went wrong."
  ) {
    const method = (options.method || "GET").toUpperCase();

    const isWrite = !["GET", "HEAD", "OPTIONS"].includes(method);

    let res;

    try {
      const headers = new Headers(options.headers || {});

      if (body !== undefined) {
        headers.set("Content-Type", "application/json");
      }

      if (isWrite) {
        const csrfToken = await getCsrfToken();
        headers.set("X-CSRF-Token", csrfToken);
      }

      res = await fetch(`${API_URL}${path}`, {
        ...options,
        method,
        credentials: "include",
        headers,
        body:
          body === undefined
            ? undefined
            : JSON.stringify(body),
      });
    } catch (err) {
      throw new Error(
        err.message?.includes("security token") ||
        err.message?.includes("security session")
          ? err.message
          : OFFLINE_MSG
      );
    }

    if (!res.ok) {
      let details = {};
      try { details = await res.json(); } catch { /* Non-JSON error response */ }
      const err = new Error(details.error || details.message || fallbackMessage);
      err.status = res.status;
      err.details = details;
      throw err;
    }
    return res.status === 204 ? null : res.json();
  }

// Flask item -> the shape the pages use
function toFrontendItem(item) {
  return {
    id: item.id,
    itemName: item.title,
    reportType: item.type,
    category: item.category, // category name, e.g. "Bags"
    categoryId: item.category_id,
    description: item.description || "",
    date: item.date || "",
    location: { name: item.location || "", lat: item.latitude, lon: item.longitude },
    photo: item.image_url || "",
    status: item.status,
    reportedBy: item.user_id,
    reporterUsername: item.reporter_username,
    createdAt: item.created_at,
  };
}

// Page fields -> Flask item. Only the fields that are present are sent,
// so the same function works for creating and for editing.
function toBackendItem(item) {
  const body = {};
  if (item.itemName !== undefined) body.title = item.itemName;
  if (item.reportType !== undefined) body.type = item.reportType;
  if (item.categoryId !== undefined) body.category_id = Number(item.categoryId);
  if (item.description !== undefined) body.description = item.description;
  if (item.date !== undefined) body.date = item.date || null;
  if (item.status !== undefined) body.status = item.status;
  if (item.photo !== undefined) body.image_url = item.photo || null;
  if (item.location !== undefined) {
    body.location = item.location ? item.location.name.slice(0, 200) : null; // column holds 200 characters
    body.latitude = item.location?.lat ?? null;
    body.longitude = item.location?.lon ?? null;
  }
  return body;
}

// Categories for dropdowns: [{ id, name }]. Always use these ids; never hardcode them.
export function getCategories() {
  return request("/categories", {}, "Could not load categories.");
}

// Category management. All three need a logged-in user.
export function createCategory(name) {
  return request("/categories", { method: "POST", body: { name } }, "Could not add the category.");
}

export function updateCategory(id, name) {
  return request(`/categories/${id}`, { method: "PATCH", body: { name } }, "Could not rename the category.");
}

// The server refuses (409) while any item still uses the category.
export function deleteCategory(id) {
  return request(`/categories/${id}`, { method: "DELETE" }, "Could not delete the category.");
}

// Newest first. Filters are optional: { search, type: "lost" | "found" | "all", categoryId }
export async function getItems({ search, type, categoryId } = {}) {
  const params = new URLSearchParams();
  if (search && search.trim()) params.set("q", search.trim());
  if (type && type !== "all") params.set("type", type);
  if (categoryId) params.set("category", categoryId);
  const query = params.toString();

  const items = await request(`/items${query ? `?${query}` : ""}`, {}, "Could not load items.");
  return items.map(toFrontendItem);
}

// One page of items for the Home page (12 per page by default)
export async function getItemsPage({ search, type, categoryId, page = 1, perPage = 12 } = {}) {
  const params = new URLSearchParams();
  if (search && search.trim()) params.set("q", search.trim());
  if (type && type !== "all") params.set("type", type);
  if (categoryId) params.set("category", categoryId);
  params.set("page", page);
  params.set("per_page", perPage);

  const data = await request(`/items?${params.toString()}`, {}, "Could not load items.");
  return { items: data.items.map(toFrontendItem), pagination: data.pagination };
}

export async function getItem(id) {
  const item = await request(
    `/items/${id}`,
    {},
    "Could not load the item."
  );

  return toFrontendItem(item);
}
export async function getMatches(itemId) {
  const data = await request(
    `/items/${itemId}/matches`,
    {},
    "Could not load possible matches."
  );

  return data;
}
// Needs a logged-in user. Send categoryId (a number from getCategories), not the category name.
export async function addItem(item) {
  const created = await request(
    "/items",
    { method: "POST", body: toBackendItem(item) },
    "Could not save your report. Try again."
  );
  return toFrontendItem(created);
}

// Owner only. Pass just the fields that changed, e.g. { itemName: "New name" }.
export async function updateItem(id, changes) {
  const updated = await request(
    `/items/${id}`,
    { method: "PATCH", body: toBackendItem(changes) },
    "Could not update the report. Try again."
  );
  return toFrontendItem(updated);
}

// Owner only.
export function deleteItem(id) {
  return request(
    `/items/${id}`,
    { method: "DELETE" },
    "Could not delete the report. Try again."
  );
}

// Every report made by one user (newest first), for the Dashboard.
export async function getMyItems(userId) {
  const data = await request(`/users/${userId}/items`, {}, "Could not load your reports.");
  return data.items.map(toFrontendItem);
 }

// ---------- Dashboard ----------


export function getMyClaims(userId) {
  return request(
    `/users/${userId}/claims`,
    {},
    "Could not load your claims."
  );
}

// ---------- Accounts (Wesley's auth endpoints) ----------

export function register(username, email, password) {
  return request(
    "/register",
    { method: "POST", body: { username, email, password } },
    "Could not create your account."
  );
}

// identifier can be a username or an email
export function login(identifier, password) {
  return request(
    "/login",
    { method: "POST", body: { identifier, password } },
    "Could not log you in."
  );
}

export function logout() {
  return request(
    "/logout",
    { method: "POST" },
    "Could not log out."
  );
}

// Returns { logged_in, user }. Never throws, so pages can call it on load.
// Returns { logged_in, user }.
// A failed request is not the same as a logged-out session.
export function checkSession() {
  return request(
    "/check_session",
    {},
    "Could not check your session."
  );
}

// ---------- M-Pesa tipping ----------

export function sendTip(itemId, amount, phone) {
  return request(
    `/items/${itemId}/tips`,
    { method: "POST", body: { amount, phone } },
    "Could not send the tip."
  );
}

export function getTipStatus(tipId) {
  return request(
    `/tips/${tipId}/status`,
    {},
    "Could not check the tip."
  );
}
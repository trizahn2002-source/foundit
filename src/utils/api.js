// Temporary storage: a json-server instance serving db.json (run: npm run server)
const API_URL = "http://localhost:3001";

const OFFLINE_MSG =
  "Can't reach the data server. Open a second terminal and run: npm run server";

async function request(path, options) {
  let res;
  try {
    res = await fetch(`${API_URL}${path}`, options);
  } catch {
    throw new Error(OFFLINE_MSG);
  }
  return res;
}

export async function getItems() {
  const res = await request("/items");
  if (!res.ok) throw new Error("Could not load items.");
  return res.json();
}

export async function addItem(item) {
  const res = await request("/items", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(item),
  });
  if (!res.ok) throw new Error("Could not save your report. Try again.");
  return res.json();
}
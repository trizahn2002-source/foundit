// Returns a safe internal path ("/items/5#claims") or null.
// Accepts a string or a router location object ({ pathname, search, hash }).
export function getSafeRedirect(from) {
  let target = null;

  if (typeof from === "string") {
    target = from;
  } else if (from && typeof from.pathname === "string") {
    target = `${from.pathname}${from.search || ""}${from.hash || ""}`;
  }

  if (!target) return null;
  if (!target.startsWith("/")) return null;          // no external URLs
  if (target.startsWith("//")) return null;          // protocol-relative
  if (target.includes("\\")) return null;
  if (/[\u0000-\u001f]/.test(target)) return null;   // control characters
  if (target === "/login" || target.startsWith("/login/")) return null; // avoid loops

  return target;
}
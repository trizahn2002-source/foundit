const KEY = import.meta.env.VITE_GEOAPIFY_KEY;

export async function searchPlaces(text) {
  if (!KEY || KEY === "your_geoapify_key_here") {
    throw new Error("Geoapify key is missing. Add VITE_GEOAPIFY_KEY to .env and restart npm run dev.");
  }

  const url =
    "https://api.geoapify.com/v1/geocode/autocomplete" +
    `?text=${encodeURIComponent(text)}` +
    "&filter=countrycode:ke" +
    "&bias=proximity:36.8219,-1.2921" +
    "&limit=5" +
    `&apiKey=${KEY}`;

  let res;
  try {
    res = await fetch(url);
  } catch {
    throw new Error("Could not reach Geoapify. Check your internet connection.");
  }

  if (res.status === 401 || res.status === 403) {
    console.error("Geoapify rejected the key. Status:", res.status);
    throw new Error("Geoapify rejected the key. Check .env and the key's allowed origins.");
  }
  if (res.status === 429) {
    throw new Error("Too many searches. Wait a moment and try again.");
  }
  if (!res.ok) {
    console.error("Geoapify error. Status:", res.status);
    throw new Error(`Location search failed (error ${res.status}).`);
  }

  const data = await res.json();
  return data.features.map((f) => ({
    name: f.properties.formatted,
    lat: f.properties.lat,
    lon: f.properties.lon,
  }));
}
const API_PATH = "travel_recommendation_api.json";

const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const clearBtn = document.getElementById("clearBtn");
const resultsEl = document.getElementById("results");
const statusTextEl = document.getElementById("statusText"); // optional

let apiData = null;

function norm(s) {
  return (s || "").trim().toLowerCase();
}

function isKeyword(q, base) {
  const n = norm(q);
  return n === base || n === `${base}s`;
}

function setStatus(msg) {
  if (statusTextEl) statusTextEl.textContent = msg;
}

function renderCards(items) {
  if (!items || items.length === 0) {
    resultsEl.innerHTML = "";
    setStatus("No matches found. Try: beach, temple, country, Japan, Brazil...");
    return;
  }

  resultsEl.innerHTML = items.map((item) => `
    <div class="recCard">
      <img src="${item.imageUrl}" alt="${item.name}">
      <div class="recBody">
        <h3>${item.name}</h3>
        <p>${item.description}</p>
        <button onclick="alert('Visit demo: Pack your bags 🧳')">Visit</button>
      </div>
    </div>
  `).join("");

  setStatus(`Showing ${items.length} recommendation(s).`);
}

async function loadApiData() {
  const res = await fetch(API_PATH);
  if (!res.ok) throw new Error(`Failed to load ${API_PATH} (${res.status})`);
  return await res.json();
}

function searchRecommendations(query) {
  const q = norm(query);

  if (isKeyword(q, "beach")) {
    return apiData.beaches || [];
  }
  if (isKeyword(q, "temple")) {
    return apiData.temples || [];
  }
  if (isKeyword(q, "country")) {
    // show ALL cities from ALL countries
    const cities = [];
    (apiData.countries || []).forEach(c => {
      (c.cities || []).forEach(city => {
        cities.push({
          name: city.name,
          imageUrl: city.imageUrl,
          description: city.description
        });
      });
    });
    return cities;
  }

  // Bonus: match country/city/description
  const matches = [];
  (apiData.countries || []).forEach(c => {
    const countryMatch = norm(c.name) === q;
    (c.cities || []).forEach(city => {
      if (
        countryMatch ||
        norm(city.name).includes(q) ||
        norm(city.description).includes(q)
      ) {
        matches.push({
          name: city.name,
          imageUrl: city.imageUrl,
          description: city.description
        });
      }
    });
  });

  (apiData.temples || []).forEach(t => {
    if (norm(t.name).includes(q) || norm(t.description).includes(q)) matches.push(t);
  });

  (apiData.beaches || []).forEach(b => {
    if (norm(b.name).includes(q) || norm(b.description).includes(q)) matches.push(b);
  });

  return matches;
}

function clearAll() {
  resultsEl.innerHTML = "";
  searchInput.value = "";
  setStatus("Cleared. Enter a keyword and click Search.");
  searchInput.focus();
}

async function init() {
  try {
    setStatus("Loading recommendations…");
    apiData = await loadApiData();
    console.log("Loaded API:", apiData);
    setStatus("Ready. Try: beach / temple / country.");
  } catch (e) {
    console.error(e);
    setStatus("Could not load API data. Check file path + Live Server.");
  }
}

searchBtn.addEventListener("click", () => {
  if (!apiData) return;
  const items = searchRecommendations(searchInput.value);
  renderCards(items);
});

clearBtn.addEventListener("click", clearAll);

init();

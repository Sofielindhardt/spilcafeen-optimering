"use strict";

// ===== APP INITIALISERING =====
// Start app når DOM er loaded (hele HTML siden er færdig med at indlæse)
document.addEventListener("DOMContentLoaded", initApp);

// Global variabel til alle film - tilgængelig for alle funktioner
let allGames = [];

// #1: Initialize the app - sæt event listeners og hent data
function initApp() {
  getGames(); // Hent film data fra JSON fil

  document
    .querySelector("#search-input")
    .addEventListener("input", filterGames);

  document
    .querySelector("#genre-select1")
    .addEventListener("change", filterGames);

  document
    .querySelector("#genre-select2")
    .addEventListener("change", filterGames);

  document
    .querySelector("#players-select")
    .addEventListener("change", filterGames);

  document
    .querySelector("#clear-filters")
    .addEventListener("click", clearAllFilters);
}

async function getGames() {
  // Hent data fra URL - await venter på svar før vi går videre
  let response = await fetch(
    "https://raw.githubusercontent.com/cederdorff/race/refs/heads/master/data/games.json",
  );

  allGames = await response.json();

  // Optimerede lokale billeder
  const localImages = {
    Catan: "img/catan.webp",
    Monopoly: "img/monopoly.webp",
    Yatzy: "img/yatzy.webp",
    Skak: "img/skak.webp",
    Cluedo: "img/cluedo.webp",
    Stratego: "img/stratego.webp",
    Risk: "img/risk.webp",
    Sequence: "img/sequence.webp",
    Uno: "img/uno.webp",
    Ludo: "img/ludo.webp",
    Matador: "img/matador.webp",
    Backgammon: "img/backgammon.webp",
    Partners: "img/partners.webp",
  };

  // Erstat kun billeder jeg har optimeret
  for (const game of allGames) {
    if (localImages[game.title]) {
      game.image = localImages[game.title];
    }
  }

  populateGenreDropdown();
  displayGames(allGames);
}

// Loop gennem alle film og vis hver enkelt
for (const game of allGames) {
  displayGame(game);
}

// #4: Render a single game card and add event listeners - lav et spil kort
function displayGame(game) {
  const gameList = document.querySelector("#game-list");

  const gameHTML = `
  <button class="game-card" type="button">
    <img src = "${game.image}"
      alt = "Spillet ${game.title}"
      class= "game-poster"
      loading="${gameList.children.length < 4 ? "eager" : "lazy"}"
      />
      
      <div class= "game-info">
      <h3>${game.title}</h3>
      
      <p class= "game-rating">⭐ ${game.rating}</p>
      <p class= "game-playtime">Ca. ${game.playtime} min.</p>
      <p class= "game-players">${game.players.min} - ${game.players.max} spillere</p>
      <p class= "game-genre">${game.genre}</p>
      </div>
  </button>`;

  gameList.insertAdjacentHTML("beforeend", gameHTML);

  const newCard = gameList.lastElementChild;

  newCard.addEventListener("click", function () {
    showGameModal(game);
  });

  newCard.addEventListener("keydown", function (event) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      showGameModal(game);
    }
  });
}

// ===== DROPDOWN OG MODAL FUNKTIONER =====
function populateGenreDropdown() {
  // Players dropdown
  const playersSelect = document.querySelector("#players-select");
  const playerCounts = new Set();

  for (const game of allGames) {
    if (
      game.players &&
      typeof game.players.min === "number" &&
      typeof game.players.max === "number"
    ) {
      for (let i = game.players.min; i <= game.players.max; i++) {
        playerCounts.add(i);
      }
    }
  }

  const sortedPlayers = Array.from(playerCounts).sort((a, b) => a - b);

  playersSelect.innerHTML = '<option value="all">Antal spillere</option>';

  sortedPlayers.forEach((num) => {
    playersSelect.innerHTML += `<option value="${num}">${num} spillere</option>`;
  });

  // Genre dropdown
  const genreSelect = document.querySelector("#genre-select1");
  const genres = new Set();

  for (const game of allGames) {
    if (game.genre) genres.add(game.genre);
  }

  genreSelect.innerHTML = '<option value="all">Kategori</option>';

  genres.forEach((genre) => {
    genreSelect.innerHTML += `<option value="${genre}">${genre}</option>`;
  });

  // Playtime dropdown
  const playtimeSelect = document.querySelector("#genre-select2");
  const playtimes = new Set();

  for (const game of allGames) {
    if (game.playtime) playtimes.add(game.playtime);
  }

  const sortedPlaytimes = Array.from(playtimes).sort((a, b) => a - b);

  playtimeSelect.innerHTML = '<option value="all">Varighed</option>';

  sortedPlaytimes.forEach((time) => {
    playtimeSelect.innerHTML += `<option value="${time}">${time} min.</option>`;
  });
}

// #6: Vis game i modal dialog
function showGameModal(game) {
  document.querySelector("#dialog-content").innerHTML = /*html*/ `
    <img src="${game.image}" alt="Poster af ${game.title}" class="game-poster">

    <div class="dialog-details">
      <h3>${game.title} 

      <p class="game-genre">${
        Array.isArray(game.genre) ? game.genre.join(", ") : game.genre || ""
      }</p>

      <p class="game-rating">⭐ ${game.rating}</p>

      <p class="game-description">
        ${game.description}
      </p>
    </div>
  `;

  document.querySelector("#game-dialog").showModal();
}

// ===== FILTER FUNKTIONER =====

function normalizeText(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ")
    .replace(/\bseven\b/g, "7");
}

function clearAllFilters() {
  document.querySelector("#search-input").value = "";
  document.querySelector("#players-select").value = "all";
  document.querySelector("#genre-select2").value = "all";
  document.querySelector("#genre-select1").value = "all";

  filterGames();
}

function filterGames() {
  const searchValue = normalizeText(
    document.querySelector("#search-input").value,
  );

  const genre1Value = document.querySelector("#genre-select1").value;

  const genre2Value = document.querySelector("#genre-select2").value;

  const playersValue = document.querySelector("#players-select").value;

  let filteredGames = allGames;

  // Søgning
  if (searchValue) {
    filteredGames = filteredGames.filter((game) =>
      normalizeText(game.title).includes(searchValue),
    );
  }

  // Kategori
  if (genre1Value !== "all") {
    filteredGames = filteredGames.filter((game) => game.genre === genre1Value);
  }

  // Varighed
  if (genre2Value !== "all") {
    filteredGames = filteredGames.filter(
      (game) => String(game.playtime) === genre2Value,
    );
  }

  // Antal spillere
  if (playersValue !== "all") {
    const num = Number(playersValue);

    filteredGames = filteredGames.filter(
      (game) =>
        game.players && num >= game.players.min && num <= game.players.max,
    );
  }

  displayGames(filteredGames);
}

function displayGames(games) {
  const gameList = document.querySelector("#game-list");

  gameList.innerHTML = "";

  if (!games || games.length === 0) {
    gameList.innerHTML =
      '<p class="no-results">Ingen spil matchede dine filtre </p>';

    return;
  }

  for (const game of games) {
    displayGame(game);
  }
}

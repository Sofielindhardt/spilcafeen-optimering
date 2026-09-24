"use strict";

document.addEventListener("DOMContentLoaded", initApp);

let allGames = [];
let scrollPosition = 0;

function initApp() {
  getGames();

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

  document.querySelector("#close-dialog").addEventListener("click", () => {
    document.querySelector("#game-dialog").close();
  });

  document.querySelector("#game-dialog").addEventListener("close", () => {
    window.scrollTo(0, scrollPosition);
  });
}

// =====================
// HENT SPIL
// =====================

async function getGames() {
  const response = await fetch(
    "https://raw.githubusercontent.com/cederdorff/race/refs/heads/master/data/games.json",
  );

  allGames = await response.json();

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

  for (const game of allGames) {
    if (localImages[game.title]) {
      game.image = localImages[game.title];
    }
  }

  populateDropdowns();
  displayGames(allGames);
}

// =====================
// VIS SPIL
// =====================

function displayGames(games) {
  const gameList = document.querySelector("#game-list");

  gameList.innerHTML = "";

  if (games.length === 0) {
    gameList.innerHTML =
      '<p class="no-results">Ingen spil matchede dine filtre.</p>';

    return;
  }

  for (const game of games) {
    displayGame(game);
  }
}

function displayGame(game) {
  const gameList = document.querySelector("#game-list");

  const gameHTML = `
    <button class="game-card" type="button">
      <img
        src="${game.image}"
        alt="Spillet ${game.title}"
        class="game-poster"
        loading="${gameList.children.length < 4 ? "eager" : "lazy"}"
      >

      <div class="game-info">
        <h2>${game.title}</h2>

        <p class="game-meta">
          Ca. ${game.playtime} min., 
          ${game.players.min} - ${game.players.max} spillere
        </p>

        <p class="game-genre">${game.genre}</p>

        <p class="game-rating">
          ★ ${game.rating}
        </p>
      </div>
    </button>
  `;

  gameList.insertAdjacentHTML("beforeend", gameHTML);

  const newCard = gameList.lastElementChild;

  newCard.addEventListener("click", () => {
    showGameModal(game);
  });
}

// =====================
// DROPDOWNS
// =====================

function populateDropdowns() {
  populatePlayers();
  populateGenres();
  populatePlaytimes();
}

function populatePlayers() {
  const playersSelect = document.querySelector("#players-select");
  const playerCounts = new Set();

  for (const game of allGames) {
    for (let i = game.players.min; i <= game.players.max; i++) {
      playerCounts.add(i);
    }
  }

  const sortedPlayers = [...playerCounts].sort((a, b) => a - b);

  playersSelect.innerHTML = '<option value="all">Antal spillere</option>';

  for (const number of sortedPlayers) {
    playersSelect.innerHTML += `
      <option value="${number}">
        ${number} spillere
      </option>
    `;
  }
}

function populateGenres() {
  const genreSelect = document.querySelector("#genre-select1");

  const genres = [...new Set(allGames.map((game) => game.genre))];

  genreSelect.innerHTML = '<option value="all">Kategori</option>';

  for (const genre of genres) {
    genreSelect.innerHTML += `
      <option value="${genre}">
        ${genre}
      </option>
    `;
  }
}

function populatePlaytimes() {
  const playtimeSelect = document.querySelector("#genre-select2");

  const playtimes = [...new Set(allGames.map((game) => game.playtime))].sort(
    (a, b) => a - b,
  );

  playtimeSelect.innerHTML = '<option value="all">Varighed</option>';

  for (const time of playtimes) {
    playtimeSelect.innerHTML += `
      <option value="${time}">
        ${time} min.
      </option>
    `;
  }
}

// =====================
// MODAL
// =====================

function showGameModal(game) {
  const dialog = document.querySelector("#game-dialog");

  scrollPosition = window.scrollY;

  document.querySelector("#dialog-content").innerHTML = `
    <img
      src="${game.image}"
      alt="Spillet ${game.title}"
      class="game-poster"
    >

    <div class="dialog-details">
      <h2>${game.title}</h2>

      <p class="game-genre">${game.genre}</p>

      <p class="game-rating">
        ★ ${game.rating}
      </p>

      <p class="game-description">
        ${game.description}
      </p>
    </div>
  `;

  dialog.showModal();
}

// =====================
// SØGNING OG FILTRE
// =====================

function normalizeText(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ")
    .replace(/\bseven\b/g, "7");
}

function filterGames() {
  const searchValue = normalizeText(
    document.querySelector("#search-input").value,
  );

  const genreValue = document.querySelector("#genre-select1").value;

  const playtimeValue = document.querySelector("#genre-select2").value;

  const playersValue = document.querySelector("#players-select").value;

  let filteredGames = allGames;

  if (searchValue) {
    filteredGames = filteredGames.filter((game) =>
      normalizeText(game.title).includes(searchValue),
    );
  }

  if (genreValue !== "all") {
    filteredGames = filteredGames.filter((game) => game.genre === genreValue);
  }

  if (playtimeValue !== "all") {
    filteredGames = filteredGames.filter(
      (game) => String(game.playtime) === playtimeValue,
    );
  }

  if (playersValue !== "all") {
    const players = Number(playersValue);

    filteredGames = filteredGames.filter(
      (game) => players >= game.players.min && players <= game.players.max,
    );
  }

  displayGames(filteredGames);
}

function clearAllFilters() {
  document.querySelector("#search-input").value = "";
  document.querySelector("#players-select").value = "all";
  document.querySelector("#genre-select2").value = "all";
  document.querySelector("#genre-select1").value = "all";

  filterGames();
}

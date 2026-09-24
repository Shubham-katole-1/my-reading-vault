let mediaList = [];
let currentCategory = "All";
let currentGenre = "All";
let searchQuery = "";

const categories = ['All', 'Manhwa', 'Manga', 'Manhua', 'Novel', 'Web-Novel', 'Book', 'Movie'];

async function loadMediaData() {
  try {
    const response = await fetch('./data.json');
    mediaList = await response.json();
    renderUI();
  } catch (err) {
    console.error("Error loading data.json:", err);
  }
}

function renderCategories() {
  const container = document.getElementById("categoryContainer");
  container.innerHTML = categories.map(cat => `
    <button 
      onclick="setCategory('${cat}')" 
      class="px-4 py-2 rounded-md font-semibold text-xs whitespace-nowrap transition ${
        currentCategory === cat 
          ? 'bg-blue-600 text-white' 
          : 'bg-[#161b26] border border-[#20293a] text-slate-400 hover:bg-[#1e293b] hover:text-white'
      }"
    >
      ${cat}
    </button>
  `).join('');
}

function renderGenres() {
  const container = document.getElementById("genreContainer");
  const filteredCategoryItems = currentCategory === "All" 
    ? mediaList 
    : mediaList.filter(item => item.category === currentCategory);

  const genres = ["All", ...new Set(filteredCategoryItems.map(item => item.genre))];

  container.innerHTML = genres.map(g => `
    <button 
      onclick="setGenre('${g}')" 
      class="px-3 py-1 rounded-full text-xs transition ${
        currentGenre === g
          ? 'bg-blue-700 text-white border border-blue-600'
          : 'bg-[#111722] border border-[#273549] text-slate-400 hover:border-blue-500'
      }"
    >
      ${g}
    </button>
  `).join('');
}

function renderCards() {
  const grid = document.getElementById("mediaGrid");
  grid.innerHTML = "";

  const filtered = mediaList.filter(item => {
    const matchesCategory = currentCategory === "All" || item.category === currentCategory;
    const matchesGenre = currentGenre === "All" || item.genre === currentGenre;
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesGenre && matchesSearch;
  });

  if (filtered.length === 0) {
    grid.innerHTML = `<p class="col-span-full text-slate-500 text-sm">No items found.</p>`;
    return;
  }

  filtered.forEach(item => {
    grid.innerHTML += `
      <div class="bg-[#161b26] border border-[#1e293b] rounded-lg overflow-hidden flex flex-col hover:-translate-y-1 hover:border-blue-500 transition duration-200">
        <div class="relative h-60 w-full">
          <span class="absolute top-2 left-2 bg-[#0f1115]/85 text-blue-400 font-bold text-[10px] px-2 py-0.5 rounded border border-blue-600 uppercase">
            ${item.category}
          </span>
          <img src="${item.img}" alt="${item.title}" loading="lazy" class="w-full h-full object-cover">
        </div>
        <div class="p-3 flex flex-col flex-grow">
          <h3 class="font-bold text-slate-100 text-sm line-clamp-2 h-10 mb-1" title="${item.title}">${item.title}</h3>
          <p class="text-xs text-slate-400 mb-1">Progress: ${item.progress}</p>
          <p class="text-amber-500 text-xs font-semibold mb-3">★ ${item.rating}</p>
          <button class="mt-auto w-full bg-blue-600 hover:bg-blue-700 text-white py-1.5 rounded text-xs font-semibold">
            See More
          </button>
        </div>
      </div>
    `;
  });
}

function setCategory(cat) { currentCategory = cat; currentGenre = "All"; renderUI(); }
function setGenre(g) { currentGenre = g; renderUI(); }

document.getElementById("searchInput").addEventListener("input", (e) => {
  searchQuery = e.target.value;
  renderCards();
});

function renderUI() {
  renderCategories();
  renderGenres();
  renderCards();
}

loadMediaData();

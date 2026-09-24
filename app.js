// =============================================================================
// GLOBAL STATE VARIABLES
// Stores the data fetched from data.json and current user selections
// =============================================================================
let mediaList = [];          // Holds the full list of items from data.json
let currentCategory = "All"; // Active category filter (All, Manhwa, Manga, etc.)
let currentGenre = "All";    // Active genre filter
let currentStatus = "All";   // Active status filter (All, Ongoing, Completed)
let currentSort = "default"; // Active sort method (default, rating-desc, title-asc)
let searchQuery = "";       // Text typed in the search bar

// Available categories shown as pills/buttons at the top
const categories = ['All', 'Manhwa', 'Manga', 'Manhua', 'Novel', 'Web-Novel', 'Book', 'Movie'];

// Full master list of genres as requested
const genresList = [
  "All",
  "Action",
  "Adventure",
  "Sci-Fi",
  "Comedy",
  "Crazy MC",
  "Dark Fantasy",
  "Demon",
  "Drama",
  "Dungeons",
  "Fantasy",
  "Games",
  "Genius MC",
  "Isekai",
  "Magic",
  "Martial Arts",
  "Murim",
  "Mystery",
  "Overpowered"
];


// =============================================================================
// 1. INITIALIZATION & DATA FETCHING
// =============================================================================

// Fetch data from data.json file as soon as the page loads
async function loadMediaData() {
  try {
    const response = await fetch('./data.json');
    mediaList = await response.json();
    
    // Initialize UI components after data is loaded successfully
    populateGenreDropdown();
    renderCategories();
    renderCards();
  } catch (error) {
    console.error("Error loading data.json file:", error);
  }
}


// =============================================================================
// 2. UI RENDER FUNCTIONS
// =============================================================================

// Populate the <select> element for genres with options from genresList
function populateGenreDropdown() {
  const genreSelect = document.getElementById("genreSelect");
  
  genreSelect.innerHTML = genresList.map(genre => `
    <option value="${genre}">
      ${genre === "All" ? "All Genres" : genre}
    </option>
  `).join('');
}

// Render category filter buttons (All, Manhwa, Manga, etc.)
function renderCategories() {
  const categoryContainer = document.getElementById("categoryContainer");
  
  categoryContainer.innerHTML = categories.map(cat => {
    const isActive = currentCategory === cat;
    
    // Apply highlight colors if category is currently selected
    const activeStyle = "bg-blue-600 text-white shadow-lg shadow-blue-500/30 font-bold border-blue-500";
    const inactiveStyle = "bg-[#0b0e14] border-slate-700/80 text-slate-400 hover:bg-slate-800 hover:text-white";

    return `
      <button 
        onclick="selectCategory('${cat}')" 
        class="px-4 py-2 rounded-xl text-xs whitespace-nowrap border transition duration-200 ${isActive ? activeStyle : inactiveStyle}"
      >
        ${cat}
      </button>
    `;
  }).join('');
}

// Filter, sort, and display cards inside the media grid
function renderCards() {
  const grid = document.getElementById("mediaGrid");
  grid.innerHTML = ""; // Clear existing cards before rendering filtered results

  // Step A: Filter data based on active category, genre, status, and search query
  let filteredItems = mediaList.filter(item => {
    const matchesCategory = currentCategory === "All" || item.category === currentCategory;
    const matchesGenre = currentGenre === "All" || item.genre.toLowerCase() === currentGenre.toLowerCase();
    const matchesStatus = currentStatus === "All" || (item.status && item.status.toLowerCase() === currentStatus.toLowerCase());
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase().trim());

    return matchesCategory && matchesGenre && matchesStatus && matchesSearch;
  });

  // Step B: Apply sorting if selected
  if (currentSort === "rating-desc") {
    filteredItems.sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating));
  } else if (currentSort === "title-asc") {
    filteredItems.sort((a, b) => a.title.localeCompare(b.title));
  }

  // Step C: Handle empty results case
  if (filteredItems.length === 0) {
    grid.innerHTML = `
      <div class="col-span-full py-16 text-center text-slate-500">
        <p class="text-base font-semibold">No titles found.</p>
        <p class="text-xs mt-1">Try resetting your filters or search keywords.</p>
      </div>
    `;
    return;
  }

  // Step D: Render individual cards into the HTML grid
  filteredItems.forEach(item => {
    // Dynamic status badge styling (Green for Completed, Yellow for Ongoing)
    const isCompleted = item.status && item.status.toLowerCase() === "completed";
    const statusBadgeClass = isCompleted 
      ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40" 
      : "bg-amber-500/20 text-amber-400 border-amber-500/40";

    grid.innerHTML += `
      <div class="group bg-[#121721] border border-slate-800 rounded-2xl overflow-hidden flex flex-col hover:-translate-y-1.5 hover:border-blue-500/50 hover:shadow-2xl hover:shadow-blue-500/10 transition duration-300">
        
        <!-- Image Cover Area -->
        <div class="relative h-64 sm:h-72 w-full overflow-hidden bg-slate-900">
          
          <!-- Category Badge -->
          <span class="absolute top-2.5 left-2.5 z-10 bg-[#0b0e14]/90 text-blue-400 font-extrabold text-[10px] px-2.5 py-0.5 rounded-lg border border-blue-500/40 uppercase tracking-wide">
            ${item.category}
          </span>

          <!-- Status Badge -->
          ${item.status ? `
            <span class="absolute top-2.5 right-2.5 z-10 ${statusBadgeClass} font-bold text-[10px] px-2.5 py-0.5 rounded-lg border uppercase tracking-wide backdrop-blur-sm">
              ${item.status}
            </span>
          ` : ''}

          <!-- Cover Image -->
          <img 
            src="${item.img}" 
            alt="${item.title}" 
            loading="lazy" 
            class="w-full h-full object-cover group-hover:scale-105 transition duration-500"
          >
          
          <!-- Dark Overlay Gradient -->
          <div class="absolute inset-0 bg-gradient-to-t from-[#121721] via-transparent to-transparent opacity-80"></div>
        </div>

        <!-- Card Details Content -->
        <div class="p-4 flex flex-col flex-grow justify-between">
          <div>
            <!-- Title -->
            <h3 class="font-bold text-white text-sm line-clamp-2 leading-snug mb-2 group-hover:text-blue-400 transition" title="${item.title}">
              ${item.title}
            </h3>

            <!-- Genre & Rating Row -->
            <div class="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span class="bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700/50 text-[11px]">
                ${item.genre}
              </span>
              <span class="text-amber-400 font-bold flex items-center gap-1">
                ★ ${item.rating}
              </span>
            </div>
          </div>

          <!-- Progress & Action Button -->
          <div class="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between">
            <span class="text-xs font-medium text-slate-500">
              ${item.progress}
            </span>
            <button class="bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white px-3 py-1 rounded-lg text-xs font-semibold transition border border-blue-500/30">
              Read
            </button>
          </div>

        </div>

      </div>
    `;
  });
}


// =============================================================================
// 3. EVENT HANDLERS & LISTENERS
// =============================================================================

// Category selection handler (called from button click)
function selectCategory(cat) {
  currentCategory = cat;
  renderCategories();
  renderCards();
}

// Genre dropdown change listener
document.getElementById("genreSelect").addEventListener("change", (e) => {
  currentGenre = e.target.value;
  renderCards();
});

// Status dropdown change listener
document.getElementById("statusSelect").addEventListener("change", (e) => {
  currentStatus = e.target.value;
  renderCards();
});

// Sort dropdown change listener
document.getElementById("sortSelect").addEventListener("change", (e) => {
  currentSort = e.target.value;
  renderCards();
});

// Search input field listener
document.getElementById("searchInput").addEventListener("input", (e) => {
  searchQuery = e.target.value;
  renderCards();
});


// =============================================================================
// 4. START APP
// =============================================================================
loadMediaData();

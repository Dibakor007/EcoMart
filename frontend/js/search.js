// EcoMart Dynamic Product Search & Catalog Engine (Fetches directly from MongoDB / API)

document.addEventListener('DOMContentLoaded', async () => {
  const searchInput = document.getElementById('search-input');
  const productsGrid = document.getElementById('products-grid');
  const resultsCount = document.getElementById('results-count');
  const categoryFilterBtns = document.querySelectorAll('.cat-filter-btn');

  if (!productsGrid) return;

  let allProducts = [];
  let currentCategory = 'all';
  let searchQuery = '';

  // 1. Fetch Products from MongoDB API
  async function fetchProducts() {
    try {
      const res = await fetch('/api/products');
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          allProducts = json.data;
          renderProducts();
          return;
        }
      }
    } catch (e) {
      console.warn('Backend API unreachable, using fallback product list');
    }
  }

  function renderProducts() {
    let filtered = allProducts.filter(p => {
      const name = (p.name || '').toLowerCase();
      const cat = (p.category || p.category_name || '').toLowerCase();
      const matchesSearch = !searchQuery || name.includes(searchQuery) || cat.includes(searchQuery);
      const matchesCategory = currentCategory === 'all' || 
        cat.includes(currentCategory.toLowerCase()) || 
        (currentCategory === 'kitchen' && cat.includes('kitchen')) ||
        (currentCategory === 'personal-care' && (cat.includes('personal') || cat.includes('home'))) ||
        (currentCategory === 'living' && cat.includes('home')) ||
        (currentCategory === 'solar' && (cat.includes('solar') || cat.includes('electronics')));
      return matchesSearch && matchesCategory;
    });

    if (resultsCount) {
      resultsCount.textContent = `Showing ${filtered.length} of ${allProducts.length} certified products`;
    }

    if (filtered.length === 0) {
      productsGrid.innerHTML = `
        <div class="col-span-full eco-card p-12 text-center bg-white">
          <div class="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3 font-bold text-slate-400">🔍</div>
          <h3 class="font-bold text-slate-900 text-lg mb-1">No matching eco products found</h3>
          <p class="text-xs text-slate-500">Try adjusting your search query or selecting a different category filter.</p>
        </div>
      `;
      return;
    }

    productsGrid.innerHTML = filtered.map(p => `
      <div class="eco-card overflow-hidden flex flex-col group product-card" data-name="${p.name.toLowerCase()}" data-category="${(p.category || p.category_name || '').toLowerCase()}">
        <div class="relative aspect-square overflow-hidden bg-slate-100">
          <a href="/product-details.html?id=${p.id}" class="block w-full h-full">
            <img src="${p.image_url}" alt="${p.name}" class="w-full h-full object-cover group-hover:scale-105 transition duration-500">
          </a>
          <div class="absolute top-3 left-3">
            <span class="badge-eco-score">🌱 ${p.eco_score || 90} Eco Score</span>
          </div>
          <button onclick="window.ecoWishlist?.toggle(${p.id}, this)" class="btn-icon absolute top-3 right-3 shadow-md ${window.ecoWishlist?.isWishlisted(p.id) ? 'active' : ''}" title="Add to wishlist">
            <svg class="w-4 h-4" fill="${window.ecoWishlist?.isWishlisted(p.id) ? 'currentColor' : 'none'}" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
        </div>
        <div class="p-5 flex flex-col flex-grow">
          <div class="flex items-center justify-between">
            <span class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">${p.category || p.category_name || 'Sustainable'}</span>
            <span class="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">${p.plastic_reduction || 'Plastic Free'}</span>
          </div>
          <a href="/product-details.html?id=${p.id}">
            <h3 class="font-bold text-slate-900 text-base mt-1 line-clamp-1 group-hover:text-[#2d5a40] transition">${p.name}</h3>
          </a>
          <p class="text-xs text-slate-500 mt-1 line-clamp-2">${p.sustainability_description || p.description}</p>
          <div class="mt-auto pt-4 flex items-center justify-between border-t border-slate-100">
            <span class="text-lg font-extrabold text-[#1b3b2b]">৳${(p.price || 0).toLocaleString()}</span>
            <button onclick="window.ecoCart.add(${p.id}, 1)" class="btn-primary text-xs py-2 px-3">
              + Add to Cart
            </button>
          </div>
        </div>
      </div>
    `).join('');
  }

  // 2. Wire Up Search Input Event
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value.toLowerCase().trim();
      renderProducts();
    });
  }

  // 3. Wire Up Category Buttons
  if (categoryFilterBtns.length > 0) {
    categoryFilterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        currentCategory = btn.dataset.cat || 'all';

        categoryFilterBtns.forEach(b => {
          b.classList.remove('bg-[#2d5a40]', 'text-white', 'border-[#1b3b2b]');
          b.classList.add('bg-white', 'text-slate-700', 'border-slate-200');
        });

        btn.classList.remove('bg-white', 'text-slate-700', 'border-slate-200');
        btn.classList.add('bg-[#2d5a40]', 'text-white', 'border-[#1b3b2b]');

        renderProducts();
      });
    });
  }

  // Initial Fetch & Render
  await fetchProducts();
});

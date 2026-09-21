// EcoMart Wishlist Engine (API + Local Storage sync)

(function () {
  const WISHLIST_STORAGE_KEY = 'ecomart_wishlist_ids';

  function getLocalWishlist() {
    try {
      const stored = localStorage.getItem(WISHLIST_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  }

  function saveLocalWishlist(ids) {
    try {
      localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(ids));
    } catch (e) {}
  }

  async function fetchBackendWishlist() {
    const token = localStorage.getItem('ecomart_token');
    if (!token) return getLocalWishlist();

    try {
      const res = await fetch('/api/wishlist', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        const ids = (data.wishlist || []).map(item => item.product_id);
        saveLocalWishlist(ids);
        return ids;
      }
    } catch (e) {}
    return getLocalWishlist();
  }

  async function toggleWishlist(productId, btnEl = null) {
    const token = localStorage.getItem('ecomart_token');
    let current = getLocalWishlist();
    const pid = Number(productId);
    const exists = current.includes(pid);

    if (exists) {
      current = current.filter(id => id !== pid);
    } else {
      current.push(pid);
    }
    saveLocalWishlist(current);
    updateWishlistBadges();

    if (btnEl) {
      if (!exists) {
        btnEl.classList.add('active');
        btnEl.querySelector('svg')?.setAttribute('fill', 'currentColor');
      } else {
        btnEl.classList.remove('active');
        btnEl.querySelector('svg')?.setAttribute('fill', 'none');
      }
    }

    if (window.ecoCart?.toast) {
      window.ecoCart.toast(
        !exists ? 'Added to your wishlist!' : 'Removed from wishlist.',
        !exists ? 'success' : 'info',
        !exists ? 'View Wishlist' : null,
        !exists ? '/wishlist.html' : null
      );
    }

    // Sync to backend if logged in
    if (token) {
      try {
        if (!exists) {
          await fetch('/api/wishlist', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ product_id: pid })
          });
        } else {
          await fetch(`/api/wishlist/${pid}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
          });
        }
      } catch (e) {}
    }
  }

  function updateWishlistBadges() {
    const current = getLocalWishlist();
    const badges = document.querySelectorAll('.wishlist-badge');
    badges.forEach(b => {
      b.textContent = current.length;
      if (current.length > 0) {
        b.classList.remove('hidden');
      } else {
        b.classList.add('hidden');
      }
    });
  }

  function isInWishlist(productId) {
    return getLocalWishlist().includes(Number(productId));
  }

  // Initialize on load
  document.addEventListener('DOMContentLoaded', () => {
    fetchBackendWishlist().then(() => updateWishlistBadges());
  });

  window.ecoWishlist = {
    toggle: toggleWishlist,
    get: getLocalWishlist,
    isWishlisted: isInWishlist,
    updateBadges: updateWishlistBadges,
    sync: fetchBackendWishlist
  };
})();

// EcoMart Universal Cart Engine (Works seamlessly for guests & logged-in users)

(function () {
  const GUEST_CART_KEY = 'ecomart_guest_cart';

  // In-memory fallback product details for quick client-side hydration
  const fallbackProductMap = {
    1: { id: 1, name: 'Bamboo Utensil Set', price: 850, image_url: '/images/products/product-1.jpg', stock: 50, eco_score: 98, material: 'Bamboo + Organic Cotton', reusable: 'Yes', recyclable: 'Yes', packaging: 'Recyclable Paper Pouch', plastic_reduction: '~2.5 kg/year', sustainability_description: 'Handcrafted from fast-growing organic Moso bamboo with zero synthetic pesticides.' },
    2: { id: 2, name: 'Solar Power Bank', price: 2400, image_url: '/images/products/product-2.jpg', stock: 25, eco_score: 92, material: 'Monocrystalline Silicon + Recycled ABS', reusable: 'Yes', recyclable: 'Yes', packaging: 'FSC Cardboard', plastic_reduction: '~3.2 kg/year', sustainability_description: 'Harnesses clean solar energy to eliminate disposable battery waste.' },
    3: { id: 3, name: 'Recycled Glass Bottle', price: 550, image_url: '/images/products/product-3.jpg', stock: 80, eco_score: 89, material: 'Post-Consumer Recycled Glass + Cork Lid', reusable: 'Yes', recyclable: 'Yes', packaging: 'Biodegradable Craft Box', plastic_reduction: '~4.1 kg/year', sustainability_description: 'Made from 100% recycled glass bottles to keep ocean plastic at zero.' },
    4: { id: 4, name: 'Organic Hemp Tote', price: 650, image_url: '/images/products/product-4.jpg', stock: 120, eco_score: 96, material: '100% Raw Organic Hemp Fiber', reusable: 'Yes', recyclable: 'Yes', packaging: 'Zero Packaging', plastic_reduction: '~5.0 kg/year', sustainability_description: 'Hemp uses 80% less water than conventional cotton and produces zero toxic runoff.' },
    5: { id: 5, name: 'Compostable Phone Case', price: 900, image_url: '/images/products/product-5.jpg', stock: 45, eco_score: 88, material: 'Flax Straw Shive + Plant Biopolymer', reusable: 'Yes', recyclable: 'Home Compostable', packaging: 'Soy-Ink Printed Cardboard', plastic_reduction: '~1.2 kg/year', sustainability_description: 'Breaks down into organic humus in backyard compost within 6 months.' },
    6: { id: 6, name: 'Beeswax Food Wraps', price: 1200, image_url: '/images/products/product-6.jpg', stock: 60, eco_score: 95, material: 'GOTS Organic Cotton + Beeswax', reusable: 'Yes', recyclable: 'Yes', packaging: 'Recyclable Envelope', plastic_reduction: '~3.8 kg/year', sustainability_description: 'Replaces plastic cling wrap for over 1 year of daily food storage.' },
    7: { id: 7, name: 'Silicone Storage Bags', price: 1500, image_url: '/images/products/product-7.jpg', stock: 35, eco_score: 90, material: '100% Pure Platinum Food-Grade Silicone', reusable: 'Yes', recyclable: 'Yes', packaging: 'Recyclable Craft Paper', plastic_reduction: '~4.5 kg/year', sustainability_description: 'One reusable silicone bag replaces over 500 single-use Ziploc plastic bags.' },
    8: { id: 8, name: 'Detergent Strips', price: 1100, image_url: '/images/products/product-8.jpg', stock: 90, eco_score: 94, material: 'Plant-Derived Surfactants + Coconut Extracts', reusable: 'No (Dissolvable)', recyclable: 'Fully Biodegradable', packaging: 'Zero-Plastic Cardboard Sleeve', plastic_reduction: '~6.0 kg/year', sustainability_description: 'Eliminates heavy plastic detergent jugs and reduces shipping emissions by 94%.' },
    9: { id: 9, name: 'Biodegradable Bamboo Toothbrush (4-Pack)', price: 420, image_url: '/images/products/product-9.jpg', stock: 150, eco_score: 99, material: 'Wild-Harvested Moso Bamboo + Castor Oil Bristles', reusable: 'Yes', recyclable: 'Compostable Handle', packaging: '100% Recycled Kraft Paper', plastic_reduction: '~1.8 kg/year', sustainability_description: '100% plastic-free handle degrades naturally in soil within 90 days.' },
    10: { id: 10, name: 'Stainless Steel Bento Lunchbox', price: 1850, image_url: '/images/products/product-10.jpg', stock: 40, eco_score: 95, material: '304 Food-Grade Stainless Steel', reusable: 'Yes', recyclable: 'Yes', packaging: 'Recyclable Box', plastic_reduction: '~3.5 kg/year', sustainability_description: 'Lifetime durability steel construction completely eliminates disposable plastic containers.' },
    11: { id: 11, name: 'Natural Coconut Fiber Scrubber Sponges (6-Pack)', price: 380, image_url: '/images/products/product-11.jpg', stock: 110, eco_score: 97, material: 'Upcycled Coconut Fiber + Wood Cellulose', reusable: 'Yes', recyclable: '100% Home Compostable', packaging: 'Paper Sleeve', plastic_reduction: '~2.0 kg/year', sustainability_description: 'Replaces synthetic yellow plastic sponges that shed microplastics into waterways.' },
    12: { id: 12, name: 'Portable Solar Camping Lantern', price: 1950, image_url: '/images/products/product-12.jpg', stock: 30, eco_score: 93, material: 'Recycled TPU + High-Efficiency Solar Cells', reusable: 'Yes', recyclable: 'Yes', packaging: 'Recyclable Box', plastic_reduction: '~2.8 kg/year', sustainability_description: 'Solar charged emergency illumination eliminating toxic chemical batteries.' },
    13: { id: 13, name: 'Organic Solid Shampoo & Conditioner Bar', price: 780, image_url: '/images/products/product-13.jpg', stock: 85, eco_score: 95, material: 'Cold-Pressed Argan Oil + Cocoa Butter', reusable: 'No (Bar)', recyclable: 'Compostable Box', packaging: 'Paperboard Box', plastic_reduction: '~3.6 kg/year', sustainability_description: 'Water-free formulation saves 3 liquid shampoo bottles per bar.' },
    14: { id: 14, name: 'Handcrafted Recycled Wool Blanket', price: 2900, image_url: '/images/products/product-14.jpg', stock: 20, eco_score: 91, material: '100% Upcycled Recycled Wool', reusable: 'Yes', recyclable: 'Yes', packaging: 'Jute Bag', plastic_reduction: '~2.2 kg/year', sustainability_description: 'Woven from textile offcuts to eliminate landfill fabric waste.' },
    15: { id: 15, name: 'Organic Cotton Mesh Produce Bags (Set of 6)', price: 720, image_url: '/images/products/product-15.jpg', stock: 95, eco_score: 97, material: 'GOTS Certified Unbleached Organic Cotton', reusable: 'Yes', recyclable: 'Yes', packaging: 'Cotton String Wrap', plastic_reduction: '~5.5 kg/year', sustainability_description: 'Replaces over 300 single-use thin plastic produce bags per year.' },
    16: { id: 16, name: 'Handcrafted Upcycled Cork Slim Wallet', price: 1350, image_url: '/images/products/product-16.jpg', stock: 55, eco_score: 94, material: 'Ethically Harvested Oak Cork Bark', reusable: 'Yes', recyclable: 'Yes', packaging: 'Recycled Paper Envelope', plastic_reduction: '~1.5 kg/year', sustainability_description: 'Cork harvesting protects living oak trees and absorbs 3x more CO2.' },
  };


  function getGuestCart() {
    try {
      const stored = localStorage.getItem(GUEST_CART_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  }

  function saveGuestCart(cart) {
    try {
      localStorage.setItem(GUEST_CART_KEY, JSON.stringify(cart));
    } catch (e) {}
  }

  // Visual Toast Notifications (Non-blocking replacement for browser alert)
  function showToast(message, type = 'success', actionText = null, actionUrl = null) {
    let container = document.getElementById('ecomart-toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'ecomart-toast-container';
      container.className = 'fixed bottom-5 right-5 z-[9999] flex flex-col gap-2.5 max-w-sm pointer-events-none';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `pointer-events-auto flex items-center justify-between gap-3 p-4 rounded shadow-lg border text-sm transition-all duration-300 transform translate-y-3 opacity-0 ${
      type === 'success'
        ? 'bg-slate-900 text-white border-eco-500'
        : 'bg-red-900 text-white border-red-500'
    }`;

    let actionBtnHtml = '';
    if (actionText && actionUrl) {
      actionBtnHtml = `<a href="${actionUrl}" class="ml-2 px-2.5 py-1 bg-eco-500 hover:bg-eco-600 text-slate-950 font-bold text-xs rounded transition uppercase tracking-wider whitespace-nowrap">${actionText}</a>`;
    }

    toast.innerHTML = `
      <div class="flex items-center gap-2">
        <span class="text-eco-400 font-bold">${type === 'success' ? '✓' : '✕'}</span>
        <span class="leading-tight">${message}</span>
      </div>
      <div class="flex items-center gap-2">
        ${actionBtnHtml}
        <button type="button" class="text-slate-400 hover:text-white text-base leading-none px-1" aria-label="Close">&times;</button>
      </div>
    `;

    container.appendChild(toast);

    // Fade in
    requestAnimationFrame(() => {
      toast.classList.remove('translate-y-3', 'opacity-0');
    });

    const closeBtn = toast.querySelector('button');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        removeToast(toast);
      });
    }

    // Auto remove after 3.5 seconds
    setTimeout(() => {
      removeToast(toast);
    }, 3500);

    function removeToast(t) {
      t.classList.add('opacity-0', 'translate-y-3');
      setTimeout(() => {
        if (t.parentElement) t.parentElement.removeChild(t);
      }, 300);
    }
  }

  // Update cart badge counters across the DOM
  function updateCartBadges(count) {
    const badges = document.querySelectorAll('#cart-badge');
    badges.forEach((b) => {
      b.textContent = count;
      if (count > 0) {
        b.classList.remove('hidden');
        b.classList.add('flex');
      }
    });
  }

  // Cart API Object
  window.ecoCart = {
    async getItems() {
      const token = localStorage.getItem('ecomart_token');
      if (token) {
        try {
          const res = await fetch('/api/cart', {
            headers: { Authorization: `Bearer ${token}` },
          });
          const json = await res.json();
          if (json.success) {
            return json.data;
          }
        } catch (e) {
          console.warn('API cart failed, using guest cart fallback:', e);
        }
      }
      return getGuestCart();
    },

    async getCount() {
      const items = await this.getItems();
      return items.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
    },

    async add(productId, quantity = 1, metadata = {}) {
      const pid = Number(productId);
      const qty = Math.max(1, Number(quantity) || 1);
      const token = localStorage.getItem('ecomart_token');

      if (token) {
        try {
          const res = await fetch('/api/cart/items', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ product_id: pid, quantity: qty }),
          });
          const json = await res.json();
          if (json.success) {
            const count = await this.getCount();
            updateCartBadges(count);
            return { success: true, count };
          }
        } catch (e) {
          console.warn('Could not post to server cart, storing locally:', e);
        }
      }

      // Guest Cart fallback
      const guestCart = getGuestCart();
      const productInfo = metadata.name
        ? metadata
        : fallbackProductMap[pid] || {
            name: `Product #${pid}`,
            price: 800,
            image_url: '/images/products/product-1.jpg',
            stock: 50,
          };

      const existing = guestCart.find((item) => item.product_id === pid);
      if (existing) {
        existing.quantity += qty;
      } else {
        guestCart.push({
          cart_item_id: Date.now() + Math.floor(Math.random() * 1000),
          product_id: pid,
          quantity: qty,
          name: productInfo.name,
          price: productInfo.price,
          image_url: productInfo.image_url,
          stock: productInfo.stock || 50,
        });
      }

      saveGuestCart(guestCart);
      const totalCount = guestCart.reduce((sum, i) => sum + i.quantity, 0);
      updateCartBadges(totalCount);
      return { success: true, count: totalCount };
    },

    async updateQuantity(cartItemId, quantity) {
      const cid = Number(cartItemId);
      const qty = Number(quantity);
      const token = localStorage.getItem('ecomart_token');

      if (token) {
        try {
          const res = await fetch(`/api/cart/items/${cid}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ quantity: qty }),
          });
          const json = await res.json();
          if (json.success) {
            const count = await this.getCount();
            updateCartBadges(count);
            return json;
          }
        } catch (e) {}
      }

      let guestCart = getGuestCart();
      if (qty <= 0) {
        guestCart = guestCart.filter((item) => item.cart_item_id !== cid && item.product_id !== cid);
      } else {
        const item = guestCart.find((i) => i.cart_item_id === cid || i.product_id === cid);
        if (item) {
          item.quantity = qty;
        }
      }
      saveGuestCart(guestCart);
      const totalCount = guestCart.reduce((sum, i) => sum + i.quantity, 0);
      updateCartBadges(totalCount);
      return { success: true, count: totalCount };
    },

    async remove(cartItemId) {
      return this.updateQuantity(cartItemId, 0);
    },

    async clear() {
      localStorage.removeItem(GUEST_CART_KEY);
      updateCartBadges(0);
    },

    async syncGuestCartToServer() {
      const token = localStorage.getItem('ecomart_token');
      if (!token) return;

      const guestItems = getGuestCart();
      if (guestItems.length === 0) return;

      for (const item of guestItems) {
        try {
          await fetch('/api/cart/items', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ product_id: item.product_id, quantity: item.quantity }),
          });
        } catch (e) {}
      }
      localStorage.removeItem(GUEST_CART_KEY);
    },

    refreshBadge() {
      this.getCount().then(updateCartBadges);
    },

    toast: showToast,
  };

  // Expose global loadCartCount for compatibility
  window.loadCartCount = function () {
    window.ecoCart.refreshBadge();
  };

  // DOM Event Listeners
  document.addEventListener('DOMContentLoaded', () => {
    // Initial badge update
    window.ecoCart.refreshBadge();

    // Event delegation on all .add-to-cart-btn buttons
    document.addEventListener('click', async (e) => {
      const button = e.target.closest('.add-to-cart-btn');
      if (!button) return;

      e.preventDefault();
      e.stopPropagation();

      const productId = button.dataset.productId;
      if (!productId) return;

      // Extract quantity from neighbor input if exists
      let quantity = 1;
      const qtyInput = document.getElementById('product-quantity-input') ||
        button.parentElement?.querySelector('input[type="number"]') ||
        button.closest('.flex')?.querySelector('input[type="number"]');

      if (qtyInput) {
        quantity = parseInt(qtyInput.value, 10) || 1;
      }

      // Check for product metadata on button attributes
      const metadata = {
        name: button.dataset.productName,
        price: button.dataset.productPrice ? Number(button.dataset.productPrice) : undefined,
        image_url: button.dataset.productImage,
      };

      const originalHtml = button.innerHTML;
      button.disabled = true;
      button.innerHTML = `
        <span class="inline-flex items-center gap-1.5 justify-center">
          <svg class="animate-spin h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Adding...
        </span>
      `;

      try {
        const res = await window.ecoCart.add(productId, quantity, metadata);
        if (res.success) {
          button.innerHTML = `
            <span class="inline-flex items-center gap-1.5 justify-center text-eco-700">
              <svg class="w-4 h-4 text-eco-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              Added!
            </span>
          `;
          button.classList.add('bg-eco-100', 'border-eco-400');

          const prodName = metadata.name || fallbackProductMap[productId]?.name || 'Item';
          showToast(`Added ${quantity > 1 ? `${quantity}x ` : ''}"${prodName}" to your cart!`, 'success', 'View Cart', '/checkout.html');

          setTimeout(() => {
            button.innerHTML = originalHtml;
            button.classList.remove('bg-eco-100', 'border-eco-400');
            button.disabled = false;
          }, 1800);
        } else {
          showToast('Could not add item to cart.', 'error');
          button.innerHTML = originalHtml;
          button.disabled = false;
        }
      } catch (err) {
        showToast('Error updating cart.', 'error');
        button.innerHTML = originalHtml;
        button.disabled = false;
      }
    });
  });
})();

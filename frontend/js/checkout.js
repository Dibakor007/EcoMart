// EcoMart Interactive Checkout & Cart Manager

document.addEventListener('DOMContentLoaded', async () => {
  const cartContainer = document.getElementById('cart-items-container');
  const subtotalEl = document.getElementById('summary-subtotal');
  const totalEl = document.getElementById('summary-total');
  const form = document.getElementById('checkout-form');
  const errorEl = document.getElementById('checkout-error');
  const submitBtn = document.getElementById('submit-order-btn');

  const SHIPPING_FEE = 50;
  let currentItems = [];

  // Check auth and user info
  const token = localStorage.getItem('ecomart_token');
  const userJson = localStorage.getItem('ecomart_user');
  let currentUser = null;
  if (userJson) {
    try { currentUser = JSON.parse(userJson); } catch (e) {}
  }

  // Pre-fill user information if available
  if (currentUser) {
    const nameField = document.getElementById('shipping_name');
    if (nameField && !nameField.value) {
      nameField.value = currentUser.name || '';
    }
  }

  // Wire up Autofill Demo Details button
  const demoFillBtn = document.getElementById('demo-fill-btn');
  if (demoFillBtn) {
    demoFillBtn.addEventListener('click', () => {
      const nameEl = document.getElementById('shipping_name');
      const phoneEl = document.getElementById('shipping_phone');
      const addrEl = document.getElementById('shipping_address');
      const cityEl = document.getElementById('shipping_city');
      
      if (nameEl) nameEl.value = 'Tanvir Ahmed';
      if (phoneEl) phoneEl.value = '+880 1711-223344';
      if (addrEl) addrEl.value = 'House 42, Road 11, Banani Block C';
      if (cityEl) cityEl.value = 'Dhaka';
      
      if (window.ecoCart?.toast) {
        window.ecoCart.toast('Autofilled verified demo shipping details!', 'success');
      }
    });
  }

  async function renderCart() {
    if (!cartContainer) return;

    cartContainer.innerHTML = `
      <div class="py-8 text-center text-slate-400">
        <svg class="animate-spin h-6 w-6 mx-auto mb-2 text-eco-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span class="text-xs font-medium">Loading your sustainable items...</span>
      </div>
    `;

    currentItems = await window.ecoCart.getItems();

    if (!currentItems || currentItems.length === 0) {
      cartContainer.innerHTML = `
        <div class="py-8 text-center px-4">
          <div class="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <p class="text-sm font-bold text-slate-700 mb-1">Your cart is currently empty</p>
          <p class="text-xs text-slate-500 mb-4">Discover verified eco-conscious products and start reducing your footprint.</p>
          <a href="/products.html" class="inline-block bg-eco-600 hover:bg-eco-700 text-white font-bold text-xs uppercase tracking-wider px-4 py-2.5 rounded-sm transition shadow-sm">
            Browse Sustainable Products
          </a>
        </div>
      `;
      if (subtotalEl) subtotalEl.textContent = '0';
      if (totalEl) totalEl.textContent = '0';
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.classList.add('opacity-50', 'cursor-not-allowed');
      }
      return;
    }

    let subtotal = 0;
    let html = '<div class="divide-y divide-slate-100">';

    currentItems.forEach((item) => {
      const itemPrice = Number(item.price) || 0;
      const itemQty = Number(item.quantity) || 1;
      const itemTotal = itemPrice * itemQty;
      subtotal += itemTotal;
      const itemId = item.cart_item_id || item.product_id;

      html += `
        <div class="py-3.5 flex items-center justify-between gap-3" data-cart-id="${itemId}">
          <div class="w-12 h-12 rounded overflow-hidden flex-shrink-0 bg-slate-100 border border-slate-200">
            <img src="${item.image_url || '/images/products/product-1.jpg'}" alt="${item.name}" class="w-full h-full object-cover" />
          </div>
          <div class="flex-1 min-w-0">
            <h4 class="text-sm font-bold text-slate-800 truncate">${item.name}</h4>
            <div class="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
              <span>৳ ${itemPrice} each</span>
            </div>
            
            <!-- Quantity adjustment buttons -->
            <div class="flex items-center gap-1.5 mt-2">
              <button type="button" class="qty-btn-minus w-6 h-6 rounded border border-slate-200 bg-slate-50 hover:bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs transition" data-id="${itemId}" data-qty="${itemQty - 1}">-</button>
              <span class="text-xs font-bold text-slate-800 w-6 text-center">${itemQty}</span>
              <button type="button" class="qty-btn-plus w-6 h-6 rounded border border-slate-200 bg-slate-50 hover:bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs transition" data-id="${itemId}" data-qty="${itemQty + 1}">+</button>
              <button type="button" class="remove-item-btn ml-3 text-[11px] text-red-500 hover:text-red-700 font-medium transition" data-id="${itemId}">Remove</button>
            </div>
          </div>
          <div class="text-right flex-shrink-0">
            <div class="text-sm font-bold text-slate-800">৳ ${itemTotal}</div>
          </div>
        </div>
      `;
    });

    html += '</div>';
    cartContainer.innerHTML = html;

    if (subtotalEl) subtotalEl.textContent = subtotal;
    if (totalEl) totalEl.textContent = subtotal + SHIPPING_FEE;

    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.classList.remove('opacity-50', 'cursor-not-allowed');
    }

    // Attach listeners to minus, plus and remove buttons
    cartContainer.querySelectorAll('.qty-btn-minus').forEach((b) => {
      b.addEventListener('click', async (e) => {
        const id = b.dataset.id;
        const newQty = parseInt(b.dataset.qty, 10);
        await window.ecoCart.updateQuantity(id, newQty);
        renderCart();
      });
    });

    cartContainer.querySelectorAll('.qty-btn-plus').forEach((b) => {
      b.addEventListener('click', async (e) => {
        const id = b.dataset.id;
        const newQty = parseInt(b.dataset.qty, 10);
        await window.ecoCart.updateQuantity(id, newQty);
        renderCart();
      });
    });

    cartContainer.querySelectorAll('.remove-item-btn').forEach((b) => {
      b.addEventListener('click', async (e) => {
        const id = b.dataset.id;
        await window.ecoCart.remove(id);
        renderCart();
      });
    });
  }

  function showError(message) {
    if (!errorEl) return;
    const errorTextEl = document.getElementById('checkout-error-text');
    if (errorTextEl) {
      errorTextEl.textContent = message;
    } else {
      errorEl.textContent = message;
    }
    errorEl.classList.remove('hidden');
    if (window.lucide) lucide.createIcons();
  }

  // Handle Order Placement
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (errorEl) errorEl.classList.add('hidden');

      if (currentItems.length === 0) {
        if (window.ecoCart?.toast) {
          window.ecoCart.toast('Your cart is empty. Please add items before checking out.', 'error');
        }
        return;
      }

      const shipping_name = document.getElementById('shipping_name')?.value;
      const shipping_phone = document.getElementById('shipping_phone')?.value;
      const shipping_address = document.getElementById('shipping_address')?.value;
      const shipping_city = document.getElementById('shipping_city')?.value;
      const payment_method = document.getElementById('payment_method')?.value || 'Cash on Delivery (COD)';

      if (!shipping_name || !shipping_phone || !shipping_address || !shipping_city) {
        showError('Please provide complete shipping details.');
        return;
      }

      const originalBtnText = submitBtn.innerHTML;
      submitBtn.innerHTML = `
        <span class="inline-flex items-center gap-2">
          <svg class="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Confirming Order...
        </span>
      `;
      submitBtn.disabled = true;

      const payload = {
        shipping_name,
        shipping_phone,
        shipping_address,
        shipping_city,
        payment_method,
        guest_items: currentItems.map((i) => ({
          product_id: i.product_id,
          quantity: i.quantity,
        })),
      };

      const headers = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      try {
        const res = await fetch('/api/orders/checkout', {
          method: 'POST',
          headers,
          body: JSON.stringify(payload),
        });

        const data = await res.json();

        if (data.success) {
          await window.ecoCart.clear();
          if (window.ecoCart?.toast) {
            window.ecoCart.toast('Order confirmed successfully!', 'success');
          }
          setTimeout(() => {
            window.location.href = '/orders.html';
          }, 600);
        } else {
          showError(data.message || 'Checkout failed. Please review your details.');
          submitBtn.innerHTML = originalBtnText;
          submitBtn.disabled = false;
        }
      } catch (err) {
        showError('Network communication error. Please try again.');
        submitBtn.innerHTML = originalBtnText;
        submitBtn.disabled = false;
      }
    });
  }

  // Initial render
  renderCart();
});

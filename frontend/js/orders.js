// EcoMart Order History & Real-Time Tracking

document.addEventListener('DOMContentLoaded', () => {
  const ordersContainer = document.getElementById('orders-container');
  const token = localStorage.getItem('ecomart_token');

  // Handle unauthenticated view gracefully
  if (!token) {
    if (ordersContainer) {
      ordersContainer.innerHTML = `
        <div class="bg-white border border-slate-200 rounded-sm p-8 text-center max-w-lg mx-auto shadow-sm">
          <div class="w-14 h-14 bg-eco-100 rounded-full flex items-center justify-center mx-auto mb-4 text-eco-700">
            <svg class="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <h2 class="text-xl font-bold text-slate-800 mb-2">Track Your EcoMart Orders</h2>
          <p class="text-sm text-slate-500 mb-6 leading-relaxed">
            Sign in to your account to view your past orders, active carbon-neutral deliveries, and environmental impact certificates.
          </p>
          <div class="flex flex-col sm:flex-row items-center justify-center gap-3">
            <a href="/login.html" class="w-full sm:w-auto bg-eco-700 hover:bg-eco-800 text-white font-bold text-xs uppercase tracking-wider px-6 py-3 rounded-sm transition">
              Sign In
            </a>
            <button type="button" id="order-demo-login-btn" class="w-full sm:w-auto bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs uppercase tracking-wider px-6 py-3 rounded-sm transition flex items-center justify-center gap-1.5">
              <span>⚡ 1-Click Demo Login</span>
            </button>
          </div>
        </div>
      `;

      document.getElementById('order-demo-login-btn')?.addEventListener('click', async () => {
        try {
          const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'demo@ecomart.org', password: 'password123' }),
          });
          const json = await res.json();
          if (json.success) {
            localStorage.setItem('ecomart_token', json.data.token);
            localStorage.setItem('ecomart_user', JSON.stringify(json.data));
            if (window.ecoCart?.toast) {
              window.ecoCart.toast('Logged in as Demo User!', 'success');
            }
            setTimeout(() => {
              window.location.reload();
            }, 300);
          }
        } catch (e) {
          alert('Demo login failed. Please try again.');
        }
      });
    }
    return;
  }

  async function loadOrders() {
    try {
      const res = await fetch('/api/orders', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (data.success) {
        if (!data.data || data.data.length === 0) {
          ordersContainer.innerHTML = `
            <div class="text-center py-12 px-4 bg-white border border-slate-200 rounded-sm shadow-sm">
              <div class="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-400">
                <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <h3 class="text-base font-bold text-slate-800 mb-1">No orders placed yet</h3>
              <p class="text-xs text-slate-500 mb-5 max-w-sm mx-auto">You haven't made any purchases yet. Your zero-waste journey starts with your first order!</p>
              <a href="/products.html" class="inline-block bg-eco-600 hover:bg-eco-700 text-white font-bold text-xs uppercase tracking-wider px-5 py-2.5 rounded-sm transition shadow-sm">
                Explore Sustainable Products
              </a>
            </div>
          `;
          return;
        }

        let html = '';
        data.data.forEach((order) => {
          html += generateOrderHTML(order);
        });
        ordersContainer.innerHTML = html;

        if (window.lucide) {
          window.lucide.createIcons();
        }

        // Attach listeners to "Buy Again" buttons
        ordersContainer.querySelectorAll('.buy-again-btn').forEach((btn) => {
          btn.addEventListener('click', async () => {
            const pid = btn.dataset.productId;
            const originalText = btn.innerHTML;
            btn.innerHTML = 'Added! ✓';
            btn.disabled = true;
            await window.ecoCart.add(pid, 1);
            if (window.ecoCart?.toast) {
              window.ecoCart.toast('Item added to cart!', 'success', 'View Cart', '/checkout.html');
            }
            setTimeout(() => {
              btn.innerHTML = originalText;
              btn.disabled = false;
            }, 1800);
          });
        });
      } else {
        ordersContainer.innerHTML = `
          <div class="text-orange-600 text-sm italic py-8 text-center border border-dashed border-orange-200 bg-orange-50 rounded-sm">
            Could not retrieve orders: ${data.message || 'Unknown error'}
          </div>
        `;
      }
    } catch (err) {
      ordersContainer.innerHTML = `
        <div class="text-orange-600 text-sm italic py-8 text-center border border-dashed border-orange-200 bg-orange-50 rounded-sm">
          Communication error. Please ensure the backend is active.
        </div>
      `;
    }
  }

  function generateOrderHTML(order) {
    const statuses = ['confirmed', 'processing', 'shipped', 'delivered'];
    let currentStatusIndex = statuses.indexOf(order.status);
    if (currentStatusIndex === -1 && order.status !== 'cancelled') currentStatusIndex = 0;

    let statusTrackerHTML = '';

    if (order.status === 'cancelled') {
      statusTrackerHTML = `
        <div class="mt-4 p-3 bg-red-50 border border-red-200 rounded-sm flex items-center justify-center gap-2 text-red-700 font-bold uppercase tracking-wider text-xs">
          Order Cancelled
        </div>
      `;
    } else {
      statusTrackerHTML = `
        <div class="mt-6 pt-4 border-t border-slate-100">
          <div class="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">Delivery Progress</div>
          <div class="relative py-2">
            <div class="absolute top-1/2 left-0 w-full h-1 bg-slate-200 -translate-y-1/2 z-0 rounded-full"></div>
            <div class="absolute top-1/2 left-0 h-1 bg-eco-500 -translate-y-1/2 z-0 rounded-full transition-all duration-500" style="width: ${(currentStatusIndex / (statuses.length - 1)) * 100}%"></div>
            
            <div class="relative z-10 flex justify-between">
              ${statuses.map((status, index) => {
                const isCompleted = index <= currentStatusIndex;
                const isActive = index === currentStatusIndex;
                const iconBg = isCompleted ? 'bg-eco-600 text-white border-eco-600' : 'bg-white text-slate-300 border-slate-200';
                const textStyle = isActive ? 'text-eco-800 font-bold' : (isCompleted ? 'text-slate-700' : 'text-slate-400');
                const displayStatus = status.charAt(0).toUpperCase() + status.slice(1);

                return `
                  <div class="flex flex-col items-center gap-1.5">
                    <div class="w-6 h-6 rounded-full border-2 flex items-center justify-center text-[10px] ${iconBg}">
                      ${isCompleted ? '✓' : ''}
                    </div>
                    <span class="text-[10px] uppercase tracking-wider ${textStyle}">${displayStatus}</span>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        </div>
      `;
    }

    const date = new Date(order.created_at).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });

    let itemsHtml = '';
    if (order.items && order.items.length > 0) {
      itemsHtml = `
        <div class="mt-4 pt-4 border-t border-slate-100">
          <div class="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">Items in this Order</div>
          <div class="divide-y divide-slate-100">
            ${order.items.map((it) => `
              <div class="py-2 flex items-center justify-between gap-3 text-xs">
                <div class="flex-1">
                  <span class="font-bold text-slate-800">${it.product_name}</span>
                  <span class="text-slate-500 ml-2">× ${it.quantity}</span>
                </div>
                <div class="flex items-center gap-3">
                  <span class="font-bold text-slate-700">৳ ${it.subtotal || it.unit_price * it.quantity}</span>
                  <button type="button" class="buy-again-btn text-[11px] font-bold text-eco-700 hover:text-eco-800 bg-eco-50 hover:bg-eco-100 border border-eco-200 px-2 py-0.5 rounded transition" data-product-id="${it.product_id}">
                    Buy Again
                  </button>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }

    return `
      <div class="bg-white border border-slate-200 rounded-sm p-6 shadow-sm">
        <div class="flex flex-col sm:flex-row justify-between sm:items-center gap-2 mb-4 pb-4 border-b border-slate-100">
          <div>
            <div class="flex items-center gap-2">
              <span class="text-xs font-extrabold text-eco-800 uppercase tracking-wider">Order #${order.order_number}</span>
              <span class="px-2 py-0.5 text-[10px] font-bold uppercase rounded-sm ${
                order.status === 'delivered' ? 'bg-eco-100 text-eco-800' : 'bg-slate-100 text-slate-700'
              }">${order.status}</span>
            </div>
            <div class="text-xs text-slate-500 mt-1">Placed on ${date} • ${order.payment_method || 'Cash on Delivery'}</div>
          </div>
          <div class="text-left sm:text-right">
            <div class="text-lg font-bold text-slate-900">৳ ${order.total_amount}</div>
            <div class="text-[11px] text-eco-700 font-medium">Includes ৳ 50 Carbon-Neutral Shipping</div>
          </div>
        </div>

        <!-- Shipping Destination -->
        <div class="text-xs text-slate-600 bg-slate-50 p-3 rounded-sm border border-slate-100 flex flex-wrap gap-y-1 gap-x-4">
          <div><strong class="text-slate-700">Recipient:</strong> ${order.shipping_name} (${order.shipping_phone})</div>
          <div><strong class="text-slate-700">Address:</strong> ${order.shipping_address}, ${order.shipping_city}</div>
        </div>

        ${itemsHtml}
        ${statusTrackerHTML}
      </div>
    `;
  }

  loadOrders();
});

// EcoMart Admin Control Dashboard Engine

document.addEventListener('DOMContentLoaded', async () => {
  const token = localStorage.getItem('ecomart_token');
  const userJson = localStorage.getItem('ecomart_user');
  let user = null;
  if (userJson) {
    try { user = JSON.parse(userJson); } catch (e) {}
  }

  // Ensure admin user authorization
  if (!token || (user?.role !== 'admin' && user?.email !== 'admin@ecomart.org')) {
    const adminContainer = document.getElementById('admin-dashboard-container');
    if (adminContainer) {
      adminContainer.innerHTML = `
        <div class="max-w-md mx-auto my-16 p-8 bg-white border border-red-200 rounded-2xl shadow-sm text-center">
          <div class="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4 font-bold text-xl">🔒</div>
          <h2 class="text-xl font-bold text-slate-900 mb-2">Admin Access Required</h2>
          <p class="text-sm text-slate-600 mb-6">You must be logged in as an administrator to access this control panel.</p>
          <a href="/login.html" class="btn-primary w-full inline-block">Login as Admin</a>
        </div>
      `;
    }
    return;
  }

  // Load Admin Statistics
  loadAdminStats(token);
  loadAdminOrders(token);
  loadAdminUsers(token);
  loadAdminProducts(token);
  loadAdminReviews(token);
});

async function loadAdminStats(token) {
  try {
    const res = await fetch('/api/admin/stats', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) {
      const data = await res.json();
      const stats = data.data || {};
      
      const revEl = document.getElementById('stat-total-revenue');
      const ordEl = document.getElementById('stat-total-orders');
      const usrEl = document.getElementById('stat-total-users');
      const prdEl = document.getElementById('stat-total-products');

      if (revEl) revEl.textContent = `৳${(stats.totalRevenue || 0).toLocaleString()}`;
      if (ordEl) ordEl.textContent = stats.totalOrders || 0;
      if (usrEl) usrEl.textContent = stats.totalUsers || 0;
      if (prdEl) prdEl.textContent = stats.totalProducts || 0;
    }
  } catch (e) {}
}

async function loadAdminOrders(token) {
  const container = document.getElementById('admin-orders-table-body');
  if (!container) return;

  try {
    const res = await fetch('/api/admin/orders', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) {
      const data = await res.json();
      const orders = data.data || [];
      window.adminOrdersCache = orders;

      if (orders.length === 0) {
        container.innerHTML = `<tr><td colspan="6" class="p-6 text-center text-slate-500">No customer orders recorded yet.</td></tr>`;
        return;
      }

      container.innerHTML = orders.map(order => {
        const orderIdStr = String(order.id || order._id);
        return `
        <tr class="border-b border-slate-100 hover:bg-slate-50/80 transition">
          <td class="p-4 font-bold text-slate-900">#ORD-${order.id || String(order._id).substring(0, 6)}</td>
          <td class="p-4 text-xs font-medium text-slate-600">${new Date(order.created_at || Date.now()).toLocaleDateString()}</td>
          <td class="p-4 text-sm text-slate-800 font-semibold">${order.shipping_address?.name || 'Customer'}</td>
          <td class="p-4 font-bold text-[#1b3b2b]">৳${(order.total_amount || 0).toLocaleString()}</td>
          <td class="p-4">
            <span class="px-2.5 py-1 rounded-full text-xs font-bold ${
              order.status === 'delivered' ? 'bg-emerald-100 text-emerald-800' :
              order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
              order.status === 'processing' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-800'
            }">
              ${(order.status || 'pending').toUpperCase()}
            </span>
          </td>
          <td class="p-4 flex items-center gap-2">
            <button onclick="viewOrderDetails('${orderIdStr}')" class="px-3 py-1 bg-brand-50 hover:bg-brand-100 text-brand-800 font-bold text-xs rounded border border-brand-200 transition">
              🔍 View Details
            </button>
            <select onchange="updateOrderStatus('${orderIdStr}', this.value)" class="text-xs bg-white border border-slate-200 rounded-md px-2 py-1 font-semibold text-slate-700 cursor-pointer hover:border-slate-400">
              <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>Pending</option>
              <option value="processing" ${order.status === 'processing' ? 'selected' : ''}>Processing</option>
              <option value="shipped" ${order.status === 'shipped' ? 'selected' : ''}>Shipped</option>
              <option value="delivered" ${order.status === 'delivered' ? 'selected' : ''}>Delivered</option>
            </select>
          </td>
        </tr>
      `;
      }).join('');
    }
  } catch (e) {
    container.innerHTML = `<tr><td colspan="6" class="p-6 text-center text-red-500">Failed to load orders.</td></tr>`;
  }
}

async function updateOrderStatus(orderId, newStatus) {
  const token = localStorage.getItem('ecomart_token');
  try {
    const res = await fetch(`/api/admin/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ status: newStatus })
    });
    if (res.ok) {
      if (window.ecoCart?.toast) window.ecoCart.toast(`Order #${orderId} status updated to ${newStatus}.`);
      loadAdminOrders(token);
    }
  } catch (e) {}
}

async function loadAdminUsers(token) {
  const container = document.getElementById('admin-users-table-body');
  if (!container) return;

  try {
    const res = await fetch('/api/admin/users', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) {
      const data = await res.json();
      const users = data.data || [];
      window.adminUsersCache = users;

      if (users.length === 0) {
        container.innerHTML = `<tr><td colspan="5" class="p-6 text-center text-slate-500">No registered users found.</td></tr>`;
        return;
      }

      container.innerHTML = users.map(u => `
        <tr class="border-b border-slate-100 hover:bg-slate-50/80 transition">
          <td class="p-4 flex items-center gap-2">
            <div class="w-8 h-8 rounded-full bg-[#2d5a40] text-white flex items-center justify-center text-xs font-bold">
              ${(u.name || 'U').charAt(0).toUpperCase()}
            </div>
            <div>
              <span class="font-bold text-slate-900 text-sm block">${u.name || 'Unnamed User'}</span>
              <span class="text-[10px] text-slate-400">ID: ${u.id || u._id || 'N/A'}</span>
            </div>
          </td>
          <td class="p-4 text-xs font-semibold text-slate-700">${u.email || ''}</td>
          <td class="p-4 text-xs font-bold ${u.role === 'admin' ? 'text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full' : 'text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full'}">${(u.role || 'customer').toUpperCase()}</td>
          <td class="p-4 font-bold text-emerald-700 text-xs">🌱 ${u.eco_points || 0} pts</td>
          <td class="p-4 text-right">
            <button onclick="viewUserProfile('${u.email}')" class="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded border border-slate-200 transition">
              👤 View Profile
            </button>
          </td>
        </tr>
      `).join('');
    }
  } catch (e) {
    container.innerHTML = `<tr><td colspan="5" class="p-6 text-center text-red-500">Failed to load users.</td></tr>`;
  }
}

function viewOrderDetails(orderIdStr) {
  const order = (window.adminOrdersCache || []).find(o => String(o.id || o._id) === String(orderIdStr));
  if (!order) return;

  const modal = document.getElementById('order-modal');
  if (!modal) return;

  document.getElementById('order-modal-title').textContent = `Order Details #${order.id || String(order._id).substring(0, 8)}`;
  document.getElementById('order-modal-subtitle').textContent = `Placed on ${new Date(order.created_at || Date.now()).toLocaleString()}`;

  const addr = order.shipping_address || {};
  const items = order.items || [];

  const bodyEl = document.getElementById('order-modal-body');
  bodyEl.innerHTML = `
    <!-- Customer & Shipping Card -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
      <div>
        <h4 class="font-bold text-slate-900 uppercase text-[11px] tracking-wider mb-2">Customer Info</h4>
        <p class="font-semibold text-slate-800 text-sm">${addr.name || 'Customer'}</p>
        <p class="text-slate-600 mt-1">📧 ${addr.email || 'N/A'}</p>
        <p class="text-slate-600">📞 ${addr.phone || 'N/A'}</p>
      </div>
      <div>
        <h4 class="font-bold text-slate-900 uppercase text-[11px] tracking-wider mb-2">Shipping Address</h4>
        <p class="text-slate-800 font-medium">${addr.address || 'N/A'}</p>
        <p class="text-slate-600">${addr.city || ''}, ${addr.postal_code || ''}</p>
        <p class="text-slate-500 mt-1">Payment: <span class="font-bold text-slate-800 uppercase">${order.payment_method || 'Cash on Delivery'}</span></p>
      </div>
    </div>

    <!-- Order Items List -->
    <div>
      <h4 class="font-extrabold text-[#1b3b2b] text-sm mb-3">Purchased Items (${items.length})</h4>
      <div class="space-y-3">
        ${items.map(it => `
          <div class="flex items-center justify-between bg-white p-3 rounded-xl border border-slate-200 text-xs">
            <div class="flex items-center gap-3">
              <img src="${it.image_url || '/images/products/product-1.jpg'}" class="w-12 h-12 rounded-lg object-cover bg-slate-100" />
              <div>
                <p class="font-bold text-slate-900 text-sm">${it.name || 'Eco Product'}</p>
                <p class="text-slate-500">Qty: ${it.quantity} × ৳${(it.price || 0).toLocaleString()}</p>
              </div>
            </div>
            <div class="text-right">
              <p class="font-bold text-[#1b3b2b] text-sm">৳${((it.price || 0) * (it.quantity || 1)).toLocaleString()}</p>
            </div>
          </div>
        `).join('')}
      </div>
    </div>

    <!-- Order Total Summary -->
    <div class="flex justify-between items-center bg-brand-50 p-4 rounded-xl border border-brand-200">
      <div>
        <span class="text-xs font-bold text-brand-900 block">Total Amount</span>
        <span class="text-xs text-brand-700 font-semibold">🌱 Eco-Friendly Verified</span>
      </div>
      <span class="text-2xl font-black text-[#1b3b2b]">৳${(order.total_amount || 0).toLocaleString()}</span>
    </div>
  `;

  const updaterEl = document.getElementById('order-modal-status-updater');
  updaterEl.innerHTML = `
    <span class="text-xs font-bold text-slate-600">Update Order Status:</span>
    <select onchange="updateOrderStatus('${orderIdStr}', this.value)" class="text-xs bg-white border border-slate-300 rounded-lg px-3 py-1.5 font-bold text-slate-800 cursor-pointer">
      <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>Pending</option>
      <option value="processing" ${order.status === 'processing' ? 'selected' : ''}>Processing</option>
      <option value="shipped" ${order.status === 'shipped' ? 'selected' : ''}>Shipped</option>
      <option value="delivered" ${order.status === 'delivered' ? 'selected' : ''}>Delivered</option>
    </select>
  `;

  modal.classList.remove('hidden');
}

function closeOrderModal() {
  document.getElementById('order-modal').classList.add('hidden');
}

function viewUserProfile(email) {
  const user = (window.adminUsersCache || []).find(u => (u.email || '').toLowerCase() === email.toLowerCase());
  if (!user) return;

  const modal = document.getElementById('user-modal');
  if (!modal) return;

  const bodyEl = document.getElementById('user-modal-body');
  bodyEl.innerHTML = `
    <div class="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
      <div class="w-14 h-14 rounded-2xl bg-[#2d5a40] text-white flex items-center justify-center text-xl font-extrabold shadow-md">
        ${(user.name || 'U').charAt(0).toUpperCase()}
      </div>
      <div>
        <h4 class="font-extrabold text-lg text-slate-900">${user.name || 'User Profile'}</h4>
        <span class="px-2.5 py-0.5 rounded-full text-[11px] font-bold ${user.role === 'admin' ? 'bg-amber-100 text-amber-800' : 'bg-brand-100 text-brand-800'}">
          ${(user.role || 'customer').toUpperCase()}
        </span>
      </div>
    </div>

    <div class="space-y-3 text-xs pt-2">
      <div class="flex justify-between p-3 bg-white border border-slate-100 rounded-xl">
        <span class="text-slate-500 font-semibold">User ID</span>
        <span class="font-bold text-slate-800">#USR-${user.id || user._id || 'N/A'}</span>
      </div>
      <div class="flex justify-between p-3 bg-white border border-slate-100 rounded-xl">
        <span class="text-slate-500 font-semibold">Email Address</span>
        <span class="font-bold text-slate-800">${user.email}</span>
      </div>
      <div class="flex justify-between p-3 bg-white border border-slate-100 rounded-xl">
        <span class="text-slate-500 font-semibold">Account Status</span>
        <span class="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">ACTIVE</span>
      </div>
      <div class="flex justify-between p-3 bg-white border border-slate-100 rounded-xl">
        <span class="text-slate-500 font-semibold">Eco Reward Points</span>
        <span class="font-extrabold text-emerald-700">🌱 ${user.eco_points || 0} pts</span>
      </div>
      <div class="flex justify-between p-3 bg-white border border-slate-100 rounded-xl">
        <span class="text-slate-500 font-semibold">Joined Date</span>
        <span class="font-bold text-slate-700">${new Date(user.created_at || Date.now()).toLocaleDateString()}</span>
      </div>
    </div>
  `;

  modal.classList.remove('hidden');
}

function closeUserModal() {
  document.getElementById('user-modal').classList.add('hidden');
}

window.updateOrderStatus = updateOrderStatus;
window.viewOrderDetails = viewOrderDetails;
window.closeOrderModal = closeOrderModal;
window.viewUserProfile = viewUserProfile;
window.closeUserModal = closeUserModal;

// Product Management
async function loadAdminProducts(token) {
  const container = document.getElementById('admin-products-table-body');
  if (!container) return;

  try {
    const res = await fetch('/api/products');
    if (res.ok) {
      const data = await res.json();
      const products = data.data || [];

      if (products.length === 0) {
        container.innerHTML = `<tr><td colspan="6" class="p-6 text-center text-slate-500">No products found.</td></tr>`;
        return;
      }

      window.adminProductsCache = products;

      container.innerHTML = products.map(p => `
        <tr class="border-b border-slate-100 hover:bg-slate-50/80 transition">
          <td class="p-4 flex items-center gap-3">
            <img src="${p.image_url}" class="w-10 h-10 rounded-lg object-cover bg-slate-100" />
            <span class="font-bold text-slate-900 text-sm">${p.name}</span>
          </td>
          <td class="p-4 text-xs font-semibold text-slate-600">${p.category || p.category_name || 'N/A'}</td>
          <td class="p-4 font-bold text-[#1b3b2b] text-sm">৳${(p.price || 0).toLocaleString()}</td>
          <td class="p-4 text-sm font-semibold ${p.stock < 10 ? 'text-red-600' : 'text-slate-800'}">${p.stock || 0}</td>
          <td class="p-4">
            <span class="px-2 py-1 bg-emerald-100 text-emerald-800 rounded font-bold text-xs">
              ${p.eco_score || 85}
            </span>
          </td>
          <td class="p-4 text-right">
            <button onclick="editProduct(${p.id})" class="text-blue-600 hover:text-blue-800 font-bold text-xs mr-3">Edit</button>
            <button onclick="deleteProduct(${p.id})" class="text-red-600 hover:text-red-800 font-bold text-xs">Delete</button>
          </td>
        </tr>
      `).join('');
    }
  } catch (e) {
    container.innerHTML = `<tr><td colspan="6" class="p-6 text-center text-red-500">Failed to load products.</td></tr>`;
  }
}

function openProductModal() {
  document.getElementById('product-modal').classList.remove('hidden');
  document.getElementById('product-form').reset();
  document.getElementById('product-id').value = '';
  document.getElementById('product-modal-title').textContent = 'Add New Product';
}

function closeProductModal() {
  document.getElementById('product-modal').classList.add('hidden');
}

function editProduct(id) {
  const product = (window.adminProductsCache || []).find(p => p.id === id);
  if (!product) return;
  
  openProductModal();
  document.getElementById('product-modal-title').textContent = 'Edit Product';
  document.getElementById('product-id').value = product.id;
  
  document.getElementById('product-name').value = product.name || '';
  document.getElementById('product-price').value = product.price || '';
  document.getElementById('product-stock').value = product.stock || '';
  document.getElementById('product-category').value = product.category || product.category_name || '';
  document.getElementById('product-image').value = product.image_url || '';
  document.getElementById('product-description').value = product.description || '';
  
  document.getElementById('product-eco-score').value = product.eco_score || 85;
  document.getElementById('product-plastic-saved').value = product.plastic_saved_grams || 0;
  document.getElementById('product-material').value = product.material || '';
  document.getElementById('product-reusable').value = product.reusable || '';
  document.getElementById('product-recyclable').value = product.recyclable || '';
  document.getElementById('product-packaging').value = product.packaging || '';
  document.getElementById('product-plastic-reduction').value = product.plastic_reduction || '';
  document.getElementById('product-sustainability').value = product.sustainability_description || '';
}

async function submitProductForm() {
  const form = document.getElementById('product-form');
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }
  
  const id = document.getElementById('product-id').value;
  const isEdit = !!id;
  
  const payload = {
    name: document.getElementById('product-name').value,
    price: Number(document.getElementById('product-price').value),
    stock: Number(document.getElementById('product-stock').value),
    category: document.getElementById('product-category').value,
    category_name: document.getElementById('product-category').value,
    image_url: document.getElementById('product-image').value,
    description: document.getElementById('product-description').value,
    
    eco_score: Number(document.getElementById('product-eco-score').value),
    plastic_saved_grams: Number(document.getElementById('product-plastic-saved').value),
    material: document.getElementById('product-material').value,
    reusable: document.getElementById('product-reusable').value,
    recyclable: document.getElementById('product-recyclable').value,
    packaging: document.getElementById('product-packaging').value,
    plastic_reduction: document.getElementById('product-plastic-reduction').value,
    sustainability_description: document.getElementById('product-sustainability').value,
  };
  
  const token = localStorage.getItem('ecomart_token');
  const method = isEdit ? 'PATCH' : 'POST';
  const url = isEdit ? `/api/admin/products/${id}` : `/api/admin/products`;
  
  try {
    const res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });
    
    if (res.ok) {
      if (window.ecoCart?.toast) window.ecoCart.toast(isEdit ? 'Product updated.' : 'Product created.');
      closeProductModal();
      loadAdminProducts(token);
      loadAdminStats(token);
    } else {
      const data = await res.json();
      alert(data.message || 'Failed to save product');
    }
  } catch (e) {
    console.error(e);
  }
}

async function deleteProduct(id) {
  if (!confirm('Are you sure you want to delete this product?')) return;
  const token = localStorage.getItem('ecomart_token');
  try {
    const res = await fetch(`/api/admin/products/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) {
      if (window.ecoCart?.toast) window.ecoCart.toast('Product deleted.');
      loadAdminProducts(token);
      loadAdminStats(token);
    }
  } catch (e) {}
}

// Review Management
async function loadAdminReviews(token) {
  const container = document.getElementById('admin-reviews-table-body');
  if (!container) return;

  try {
    const res = await fetch('/api/admin/reviews', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) {
      const data = await res.json();
      const reviews = data.data || [];

      if (reviews.length === 0) {
        container.innerHTML = `<tr><td colspan="5" class="p-6 text-center text-slate-500">No reviews found.</td></tr>`;
        return;
      }

      container.innerHTML = reviews.map(r => `
        <tr class="border-b border-slate-100 hover:bg-slate-50/80 transition">
          <td class="p-4 text-xs font-medium text-slate-600">${new Date(r.created_at || Date.now()).toLocaleDateString()}</td>
          <td class="p-4 text-sm font-bold text-slate-800">${r.user_name || 'Customer'}</td>
          <td class="p-4 text-amber-500 text-xs">${'★'.repeat(r.rating || 5)}${'☆'.repeat(5 - (r.rating || 5))}</td>
          <td class="p-4 text-xs text-slate-700 max-w-xs truncate">${r.comment || ''}</td>
          <td class="p-4 text-right">
            <button onclick="deleteReview(${r.id})" class="text-red-600 hover:text-red-800 font-bold text-xs">Delete</button>
          </td>
        </tr>
      `).join('');
    }
  } catch (e) {}
}

async function deleteReview(id) {
  if (!confirm('Are you sure you want to delete this review?')) return;
  const token = localStorage.getItem('ecomart_token');
  try {
    const res = await fetch(`/api/admin/reviews/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) {
      if (window.ecoCart?.toast) window.ecoCart.toast('Review deleted.');
      loadAdminReviews(token);
    }
  } catch (e) {}
}

window.openProductModal = openProductModal;
window.closeProductModal = closeProductModal;
window.editProduct = editProduct;
window.deleteProduct = deleteProduct;
window.submitProductForm = submitProductForm;
window.deleteReview = deleteReview;

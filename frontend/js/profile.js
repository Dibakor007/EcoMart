document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('ecomart_token');
    
    if (!token) {
        window.location.href = '/login.html';
        return;
    }

    // DOM Elements
    const userNameEl = document.getElementById('user-name');
    const userEmailEl = document.getElementById('user-email');
    const userAvatarEl = document.getElementById('user-avatar');
    
    const ecoPointsEl = document.getElementById('eco-points');
    const plasticSavedEl = document.getElementById('plastic-saved');
    const wasteReducedEl = document.getElementById('waste-reduced');
    const co2ReducedEl = document.getElementById('co2-reduced');
    
    const badgesContainer = document.getElementById('badges-container');
    const recentOrdersContainer = document.getElementById('recent-orders-container');
    const logoutBtn = document.getElementById('logout-btn');

    // Handle Logout
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('ecomart_token');
            localStorage.removeItem('ecomart_user');
            window.location.href = '/login.html';
        });
    }

    async function loadProfile() {
        try {
            // Fetch User Details
            const authRes = await fetch('/api/auth/me', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const authData = await authRes.json();
            
            if (authData.success) {
                const user = authData.data;
                userNameEl.textContent = user.name;
                userEmailEl.textContent = user.email;
                userAvatarEl.textContent = user.name.charAt(0).toUpperCase();
            } else {
                // Token invalid
                localStorage.removeItem('ecomart_token');
                window.location.href = '/login.html';
                return;
            }

            // Fetch Eco Profile (Stats & Badges)
            const ecoRes = await fetch('/api/eco/profile', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const ecoData = await ecoRes.json();

            if (ecoData.success) {
                const profile = ecoData.data.profile;
                if (profile) {
                    ecoPointsEl.textContent = profile.eco_points || 0;
                    plasticSavedEl.textContent = Number(profile.total_plastic_saved_grams || 0).toFixed(0);
                    wasteReducedEl.textContent = Number(profile.total_waste_reduced_grams || 0).toFixed(0);
                    co2ReducedEl.textContent = Number(profile.total_co2_reduced_grams || 0).toFixed(0);
                }

                // Render Badges
                const badges = ecoData.data.badges;
                if (badges && badges.length > 0) {
                    let badgesHtml = '';
                    badges.forEach(badge => {
                        const earnedDate = new Date(badge.earned_at).toLocaleDateString();
                        badgesHtml += `
                            <div class="border border-eco-200 bg-eco-50 rounded-sm p-4 text-center flex flex-col items-center justify-center">
                                <div class="text-3xl mb-2">${badge.icon || '🏆'}</div>
                                <div class="font-bold text-eco-800 text-sm mb-1">${badge.name}</div>
                                <div class="text-[10px] text-eco-600 uppercase tracking-wider font-bold">${earnedDate}</div>
                            </div>
                        `;
                    });
                    badgesContainer.innerHTML = badgesHtml;
                } else {
                    badgesContainer.innerHTML = `<div class="text-slate-500 text-sm italic col-span-full">You haven't earned any badges yet. Start shopping sustainably!</div>`;
                }
            }

            // Fetch Recent Orders
            const ordersRes = await fetch('/api/orders', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const ordersData = await ordersRes.json();

            if (ordersData.success) {
                const orders = ordersData.data.slice(0, 3); // Get top 3
                if (orders.length > 0) {
                    let ordersHtml = '';
                    orders.forEach(order => {
                        const date = new Date(order.created_at).toLocaleDateString();
                        let statusColor = 'text-slate-500 bg-slate-100 border-slate-200';
                        
                        if (order.status === 'delivered') statusColor = 'text-eco-700 bg-eco-100 border-eco-200';
                        if (order.status === 'processing' || order.status === 'shipped') statusColor = 'text-teal-700 bg-teal-100 border-teal-200';
                        if (order.status === 'cancelled') statusColor = 'text-orange-700 bg-orange-100 border-orange-200';

                        ordersHtml += `
                            <div class="border border-slate-100 rounded-sm p-4 flex justify-between items-center bg-slate-50">
                                <div>
                                    <div class="font-bold text-slate-800 text-sm mb-1">Order #${order.order_number}</div>
                                    <div class="text-xs text-slate-500">${date} • ৳ ${order.total_amount}</div>
                                </div>
                                <span class="text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded-sm border ${statusColor}">
                                    ${order.status}
                                </span>
                            </div>
                        `;
                    });
                    recentOrdersContainer.innerHTML = ordersHtml;
                } else {
                    recentOrdersContainer.innerHTML = `<div class="text-slate-500 text-sm italic py-4">No recent orders found.</div>`;
                }
            }

        } catch (err) {
            console.error('Profile Load Error:', err);
        }
    }

    loadProfile();
});

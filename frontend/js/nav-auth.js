// Universal Navbar & Global Interactivity Handler

document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('ecomart_token');
  const userJson = localStorage.getItem('ecomart_user');
  let user = null;
  if (userJson) {
    try { user = JSON.parse(userJson); } catch (e) {}
  }

  // 1. Highlight Active Nav Link based on current pathname
  const currentPath = window.location.pathname;
  document.querySelectorAll('nav a').forEach(link => {
    const href = link.getAttribute('href');
    if (href && (href === currentPath || (currentPath === '/' && href === '/index.html'))) {
      link.classList.add('text-[#2d5a40]', 'font-bold');
    }
  });

  // 2. Update Auth Container in Navbars
  const navAuthContainer = document.getElementById('nav-auth-container');
  if (navAuthContainer) {
    if (token) {
      const displayName = user?.name ? user.name.split(' ')[0] : 'Account';
      const isAdmin = user?.role === 'admin' || user?.email === 'admin@ecomart.org';

      navAuthContainer.innerHTML = `
        <div class="relative flex items-center gap-2">
          ${isAdmin ? `
            <a href="/admin.html" class="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-md text-xs font-bold transition flex items-center gap-1" title="Admin Control Panel">
              <span>⚡ Admin</span>
            </a>
          ` : ''}
          <a href="/profile.html" class="flex items-center gap-2 px-3 py-1.5 bg-[#eef4f0] hover:bg-[#bcdbca]/40 text-[#1b3b2b] rounded-lg text-xs font-bold transition border border-[#bcdbca]" title="View Eco Profile">
            <span class="w-5 h-5 rounded-full bg-[#2d5a40] text-white flex items-center justify-center text-[10px] uppercase font-extrabold">
              ${user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </span>
            <span class="hidden sm:inline">${displayName}</span>
          </a>
          <button type="button" id="global-logout-btn" class="text-slate-500 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 text-xs font-semibold transition flex items-center gap-1" title="Sign Out">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span class="hidden md:inline">Exit</span>
          </button>
        </div>
      `;

      const logoutBtn = document.getElementById('global-logout-btn');
      if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
          localStorage.removeItem('ecomart_token');
          localStorage.removeItem('ecomart_user');
          if (window.ecoCart?.toast) {
            window.ecoCart.toast('Logged out successfully.', 'info');
          }
          setTimeout(() => {
            window.location.href = '/login.html';
          }, 400);
        });
      }
    } else {
      navAuthContainer.innerHTML = `
        <a href="/login.html" id="nav-login-btn" class="text-slate-700 hover:text-[#2d5a40] font-bold text-xs uppercase tracking-wider px-3 py-2 transition">Login</a>
        <a href="/register.html" id="nav-register-btn" class="bg-[#2d5a40] text-white px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-wider hover:bg-[#1b3b2b] transition shadow-sm">Sign Up</a>
      `;
    }
  }

  // 3. Mobile Menu Toggle
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      mobileMenu.classList.toggle('hidden');
    });

    const mobileLinks = mobileMenu.querySelectorAll('a, button');
    mobileLinks.forEach((link) => {
      link.addEventListener('click', () => {
        mobileMenu.classList.add('hidden');
      });
    });

    document.addEventListener('click', (e) => {
      if (!mobileMenu.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
        mobileMenu.classList.add('hidden');
      }
    });
  }

  // 4. Newsletter forms
  document.querySelectorAll('#newsletter-form, .newsletter-form').forEach((form) => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = form.querySelector('input[type="email"]');
      const email = input?.value || '';
      if (input) input.value = '';
      if (window.ecoCart?.toast) {
        window.ecoCart.toast(`🌿 Thank you for subscribing, ${email || 'Eco Friend'}! Welcome to EcoMart.`);
      }
    });
  });
});

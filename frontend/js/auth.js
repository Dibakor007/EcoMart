document.addEventListener('DOMContentLoaded', async () => {
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');
  const errorMessage = document.getElementById('error-message');
  const googleAuthBtn = document.getElementById('google-auth-btn');
  const googleBtnText = document.getElementById('google-btn-text');
  const gsiContainer = document.getElementById('gsi-container');

  const isRegister = !!registerForm;
  let googleClientId = '';
  let tokenClient = null;

  // 1. Fetch Auth Configuration (Google Client ID if configured in environment)
  try {
    const configRes = await fetch('/api/auth/config');
    if (configRes.ok) {
      const configData = await configRes.json();
      if (configData.success && configData.data?.googleClientId) {
        googleClientId = configData.data.googleClientId;
      }
    }
  } catch (err) {
    console.warn('Could not fetch auth config:', err);
  }

  // 2. Initialize Google Identity Services (GSI)
  function initGoogleServices() {
    if (!window.google?.accounts || !googleClientId) return;

    try {
      // Initialize ID Token credential receiver
      window.google.accounts.id.initialize({
        client_id: googleClientId,
        callback: async (response) => {
          if (response.credential) {
            await submitGoogleToken(response.credential);
          }
        },
        auto_select: false,
        cancel_on_tap_outside: true
      });

      // Also render official Google One-Tap/button container if available
      if (gsiContainer) {
        window.google.accounts.id.renderButton(gsiContainer, {
          theme: 'outline',
          size: 'large',
          text: isRegister ? 'signup_with' : 'signin_with',
          shape: 'rectangular',
          logo_alignment: 'left',
          width: 384
        });
      }

      // Initialize OAuth 2.0 Token Client for direct popup flow on custom button click
      if (window.google.accounts.oauth2) {
        tokenClient = window.google.accounts.oauth2.initTokenClient({
          client_id: googleClientId,
          scope: 'email profile openid',
          callback: async (tokenResponse) => {
            if (tokenResponse.error) {
              showError('Google authentication error: ' + (tokenResponse.error_description || tokenResponse.error));
              resetGoogleBtn();
              return;
            }
            if (tokenResponse.access_token) {
              await submitGoogleToken(tokenResponse.access_token);
            }
          }
        });
      }
    } catch (e) {
      console.warn('Error initializing Google Identity Services:', e);
    }
  }

  // Poll briefly for Google GSI script loading
  let gsiAttempts = 0;
  const checkGsi = setInterval(() => {
    gsiAttempts++;
    if (window.google?.accounts) {
      clearInterval(checkGsi);
      initGoogleServices();
    } else if (gsiAttempts > 25) {
      clearInterval(checkGsi);
    }
  }, 150);

  // 3. Handle Google Button Click
  if (googleAuthBtn) {
    googleAuthBtn.addEventListener('click', async () => {
      clearError();

      if (!googleClientId) {
        // Guide configuration when GOOGLE_CLIENT_ID is not configured in environment
        showNotice(
          'Google Sign-Up is ready! To connect real Google accounts, configure GOOGLE_CLIENT_ID in your environment settings. You can also sign up with email and password below.'
        );
        return;
      }

      if (tokenClient) {
        setGoogleBtnLoading(true);
        tokenClient.requestAccessToken({ prompt: 'select_account' });
      } else if (window.google?.accounts?.id) {
        setGoogleBtnLoading(true);
        window.google.accounts.id.prompt((notification) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            resetGoogleBtn();
            showNotice('Google prompt dismissed or blocked. Please ensure popups are allowed or sign up with email.');
          }
        });
      } else {
        showError('Google authentication library is loading. Please try again in a moment.');
      }
    });
  }

  // 4. Submit Google Token to Backend
  async function submitGoogleToken(token) {
    setGoogleBtnLoading(true);
    try {
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ token })
      });

      const data = await res.json();

      if (data.success) {
        localStorage.setItem('ecomart_token', data.data.token);
        localStorage.setItem('ecomart_user', JSON.stringify(data.data));

        if (googleBtnText) {
          googleBtnText.textContent = `Welcome, ${data.data.name}!`;
        }

        setTimeout(() => {
          window.location.href = '/';
        }, 600);
      } else {
        showError(data.message || 'Google authentication failed. Please try again.');
        resetGoogleBtn();
      }
    } catch (err) {
      showError('Network error connecting to authentication service. Please try again.');
      resetGoogleBtn();
    }
  }

  function setGoogleBtnLoading(loading) {
    if (!googleAuthBtn || !googleBtnText) return;
    if (loading) {
      googleAuthBtn.disabled = true;
      googleAuthBtn.classList.add('opacity-75', 'cursor-not-allowed');
      googleBtnText.textContent = isRegister ? 'Signing up with Google...' : 'Signing in with Google...';
    } else {
      resetGoogleBtn();
    }
  }

  function resetGoogleBtn() {
    if (!googleAuthBtn || !googleBtnText) return;
    googleAuthBtn.disabled = false;
    googleAuthBtn.classList.remove('opacity-75', 'cursor-not-allowed');
    googleBtnText.textContent = isRegister ? 'Sign up with Google' : 'Sign in with Google';
  }

  // 5. Traditional Login Form
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      clearError();

      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value;

      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });

        const data = await res.json();

        if (data.success) {
          localStorage.setItem('ecomart_token', data.data.token);
          localStorage.setItem('ecomart_user', JSON.stringify(data.data));
          window.location.href = '/';
        } else {
          showError(data.message || 'Login failed');
        }
      } catch (err) {
        showError('Network error, please try again.');
      }
    });
  }

  // 6. Traditional Registration Form
  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      clearError();

      const name = document.getElementById('name').value.trim();
      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value;

      try {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password })
        });

        const data = await res.json();

        if (data.success) {
          localStorage.setItem('ecomart_token', data.data.token);
          localStorage.setItem('ecomart_user', JSON.stringify(data.data));
          window.location.href = '/';
        } else {
          showError(data.message || 'Registration failed');
        }
      } catch (err) {
        showError('Network error, please try again.');
      }
    });
  }

  // 7. 1-Click Demo Login Handler
  const demoLoginBtn = document.getElementById('demo-login-btn');
  if (demoLoginBtn) {
    demoLoginBtn.addEventListener('click', async () => {
      clearError();
      const originalText = demoLoginBtn.innerHTML;
      demoLoginBtn.innerHTML = '<span>⚡ Signing in to demo account...</span>';
      demoLoginBtn.disabled = true;

      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: 'demo@ecomart.org', password: 'password123' })
        });
        const data = await res.json();
        if (data.success) {
          localStorage.setItem('ecomart_token', data.data.token);
          localStorage.setItem('ecomart_user', JSON.stringify(data.data));
          
          // Sync any guest cart items if available
          if (window.ecoCart?.syncGuestCartToServer) {
            await window.ecoCart.syncGuestCartToServer();
          }

          showNotice('Signed in as Demo User (Tanvir Ahmed). Redirecting...');
          setTimeout(() => {
            window.location.href = '/';
          }, 400);
        } else {
          showError(data.message || 'Demo login failed');
          demoLoginBtn.innerHTML = originalText;
          demoLoginBtn.disabled = false;
        }
      } catch (err) {
        showError('Could not connect to server.');
        demoLoginBtn.innerHTML = originalText;
        demoLoginBtn.disabled = false;
      }
    });
  }

  function showError(message) {
    if (errorMessage) {
      errorMessage.textContent = message;
      errorMessage.className = 'mb-4 p-3 bg-orange-100 text-orange-700 text-sm font-semibold rounded-sm border border-orange-200 block';
    } else {
      alert(message);
    }
  }

  function showNotice(message) {
    if (errorMessage) {
      errorMessage.textContent = message;
      errorMessage.className = 'mb-4 p-3 bg-eco-100 text-eco-800 text-xs font-medium rounded-sm border border-eco-200 block leading-relaxed';
    } else {
      alert(message);
    }
  }

  function clearError() {
    if (errorMessage) {
      errorMessage.textContent = '';
      errorMessage.classList.add('hidden');
    }
  }
});

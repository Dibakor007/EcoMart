document.addEventListener('DOMContentLoaded', () => {
  const reviewForm = document.getElementById('review-form');
  const reviewMessage = document.getElementById('review-message');
  const reviewsList = document.getElementById('reviews-list');
  const productIdInput = document.getElementById('product_id');

  // Load Existing Reviews
  async function loadReviews() {
    if (!reviewsList || !productIdInput) return;
    
    const productId = productIdInput.value;
    
    try {
      const res = await fetch(`/api/reviews/product/${productId}`);
      const data = await res.json();
      
      if (data.success) {
        if (data.data.length === 0) {
          reviewsList.innerHTML = `<div class="text-slate-500 text-sm italic py-8 text-center border border-dashed border-slate-200 bg-slate-50/50">No reviews yet. Be the first to review this product!</div>`;
          return;
        }

        let html = '';
        data.data.forEach(review => {
          // Generate stars HTML
          let starsHtml = '';
          for (let i = 1; i <= 5; i++) {
            if (i <= review.rating) {
              starsHtml += `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-eco-500 w-4 h-4"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>`;
            } else {
              starsHtml += `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-slate-300 w-4 h-4"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>`;
            }
          }

          const date = new Date(review.created_at).toLocaleDateString();

          html += `
            <div class="bg-white p-6 border border-slate-200 rounded-sm shadow-sm">
                <div class="flex justify-between items-start mb-3">
                    <div>
                        <span class="font-bold text-slate-800 block">${review.user_name}</span>
                        <div class="flex items-center gap-1 mt-1">
                            ${starsHtml}
                        </div>
                    </div>
                    <span class="text-xs text-slate-400 font-bold uppercase tracking-wider">${date}</span>
                </div>
                <p class="text-slate-600 text-sm leading-relaxed">${review.comment || ''}</p>
            </div>
          `;
        });
        reviewsList.innerHTML = html;
      }
    } catch (err) {
      reviewsList.innerHTML = `<div class="text-orange-500 text-sm italic py-8 text-center border border-dashed border-orange-200 bg-orange-50">Could not load reviews. Backend may be offline.</div>`;
    }
  }

  // Handle Form Submission
  if (reviewForm) {
    reviewForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const productId = productIdInput.value;
      const ratingInput = document.querySelector('input[name="rating"]:checked');
      const comment = document.getElementById('comment').value;
      
      if (!ratingInput) {
        showMessage('Please select a star rating.', 'error');
        return;
      }

      const rating = parseInt(ratingInput.value);
      const token = localStorage.getItem('ecomart_token');

      if (!token) {
        showMessage(`
          <div class="flex items-center justify-between gap-2">
            <span>You must be signed in to leave a review.</span>
            <button type="button" id="review-quick-login-btn" class="bg-eco-700 hover:bg-eco-800 text-white font-bold px-2.5 py-1 rounded text-[11px] uppercase transition cursor-pointer">
              ⚡ Quick Login
            </button>
          </div>
        `, 'error', true);

        document.getElementById('review-quick-login-btn')?.addEventListener('click', async () => {
          try {
            const loginRes = await fetch('/api/auth/login', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email: 'demo@ecomart.org', password: 'password123' })
            });
            const loginData = await loginRes.json();
            if (loginData.success) {
              localStorage.setItem('ecomart_token', loginData.data.token);
              localStorage.setItem('ecomart_user', JSON.stringify(loginData.data));
              showMessage('Logged in as Demo User. You can now submit your review!', 'success', false);
            }
          } catch (e) {
            window.location.href = '/login.html';
          }
        });
        return;
      }

      try {
        const res = await fetch('/api/reviews', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ product_id: productId, rating, comment })
        });
        
        const data = await res.json();
        
        if (data.success) {
          showMessage('Review submitted successfully!', 'success');
          reviewForm.reset();
          
          // Reset visual stars
          const starIcons = document.querySelectorAll('#star-rating i');
          starIcons.forEach(icon => {
              icon.classList.remove('text-eco-500', 'fill-eco-500');
              icon.classList.add('text-slate-300');
          });

          // Reload reviews
          loadReviews();
        } else {
          showMessage(data.message || 'Failed to submit review', 'error');
        }
      } catch (err) {
        showMessage('Network error. Is the backend running locally?', 'error');
      }
    });
  }

  function showMessage(message, type, isHtml = false) {
    if (reviewMessage) {
      if (isHtml) {
        reviewMessage.innerHTML = message;
      } else {
        reviewMessage.textContent = message;
      }
      reviewMessage.classList.remove('hidden', 'bg-orange-100', 'text-orange-700', 'border-orange-200', 'bg-eco-100', 'text-eco-700', 'border-eco-200');
      
      if (type === 'error') {
        reviewMessage.classList.add('bg-orange-100', 'text-orange-700', 'border-orange-200');
      } else {
        reviewMessage.classList.add('bg-eco-100', 'text-eco-700', 'border-eco-200');
      }
    } else {
      alert(message);
    }
  }

  // Initial load
  loadReviews();
});

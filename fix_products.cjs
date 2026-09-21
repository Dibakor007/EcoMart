const fs = require('fs');
let html = fs.readFileSync('products.html', 'utf8');

const products = [
  { name: 'Bamboo Utensil Set', cat: 'Kitchen', score: '98', color: 'bg-eco-100 text-eco-700', desc: 'A reusable bamboo utensil set perfect for zero-waste travel and dining.', price: '850', id: 1, img: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80' },
  { name: 'Solar Power Bank', cat: 'Electronics', score: '91', color: 'bg-eco-100 text-eco-700', desc: 'Charge your devices on the go using 100% renewable solar energy.', price: '2,400', id: 2, img: 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?auto=format&fit=crop&w=800&q=80' },
  { name: 'Recycled Glass Bottle', cat: 'Home', score: '74', color: 'bg-orange-100 text-orange-600', desc: 'Durable water bottle made entirely from post-consumer recycled glass.', price: '550', id: 3, img: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=800&q=80' },
  { name: 'Organic Hemp Tote', cat: 'Fashion', score: '96', color: 'bg-eco-100 text-eco-700', desc: 'A strong, sustainable alternative to plastic bags. Ethically sourced.', price: '650', id: 4, img: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80' },
  { name: 'Compostable Phone Case', cat: 'Accessories', score: '85', color: 'bg-eco-100 text-eco-700', desc: 'Protect your phone and the planet with this 100% compostable case.', price: '900', id: 5, img: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?auto=format&fit=crop&w=800&q=80' },
  { name: 'Beeswax Food Wraps', cat: 'Kitchen', score: '92', color: 'bg-eco-100 text-eco-700', desc: 'Washable, reusable, and fully biodegradable wrap to replace cling film.', price: '1,200', id: 6, img: 'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?auto=format&fit=crop&w=800&q=80' },
  { name: 'Silicone Storage Bags', cat: 'Kitchen', score: '88', color: 'bg-eco-100 text-eco-700', desc: 'Food-grade silicone bags for storing snacks, freezing, and sous-vide.', price: '1,500', id: 7, img: 'https://images.unsplash.com/photo-1588854337221-4cf9fa96059c?auto=format&fit=crop&w=800&q=80' },
  { name: 'Detergent Strips', cat: 'Home', score: '94', color: 'bg-eco-100 text-eco-700', desc: 'Zero-waste laundry detergent strips that dissolve completely in water.', price: '1,100', id: 8, img: 'https://images.unsplash.com/photo-1585421514738-01798e348b17?auto=format&fit=crop&w=800&q=80' }
];

let newProductsHtml = products.map(p => `
        <div class="bg-white border border-slate-200 rounded-sm overflow-hidden shadow-sm flex flex-col hover:border-eco-400 transition group product-card" data-name="${p.name.toLowerCase()}" data-category="${p.cat.toLowerCase()}">
          <div class="h-48 bg-slate-100 overflow-hidden relative">
            <img src="${p.img}" alt="${p.name}" referrerpolicy="no-referrer" loading="lazy" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
          </div>
          <div class="p-4 flex flex-col flex-1">
            <div class="flex justify-between items-start mb-2">
              <h3 class="font-bold text-eco-700">${p.name}</h3>
              <span class="${p.color} px-2 py-1 rounded text-xs font-bold">${p.score} Eco Score</span>
            </div>
            <div class="text-xs text-slate-400 font-bold uppercase tracking-wider mb-2">${p.cat}</div>
            <p class="text-slate-500 text-sm mb-4 line-clamp-2">${p.desc}</p>
            <div class="mt-auto flex justify-between items-center">
              <span class="font-bold text-lg text-slate-800">৳ ${p.price}</span>
              <button data-product-id="${p.id}" class="add-to-cart-btn text-eco-600 font-bold uppercase tracking-wider text-xs hover:text-eco-800">Add to Cart</button>
            </div>
          </div>
        </div>`).join('');

// We need to replace the content inside <div id="products-grid" ...> ... </div>
const gridRegex = /(<div id="products-grid"[^>]*>)([\s\S]*?)(<\/main>)/;
html = html.replace(gridRegex, `$1${newProductsHtml}\n      </div>\n    </main>`);

fs.writeFileSync('products.html', html);

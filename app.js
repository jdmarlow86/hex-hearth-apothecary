// Hex & Hearth Apothecary • app.js

const state = {
  products: [
    // Essential Oils
    { id: 'eo-lavender', name: 'Lavender Essential Oil', category: 'essential-oils', price: 14.00, note: 'Calming, floral, steam-distilled', badge: '🪻' },
    { id: 'eo-eucalyptus', name: 'Eucalyptus Essential Oil', category: 'essential-oils', price: 12.00, note: 'Clearing, herbaceous', badge: '🌿' },
    // Candles
    { id: 'cn-moonmilk', name: 'Moonmilk Soy Candle', category: 'candles', price: 22.00, note: 'Almond, tonka, midnight vanilla', badge: '🕯️' },
    { id: 'cn-ember', name: 'Ember & Myrrh Candle', category: 'candles', price: 24.00, note: 'Smoky myrrh, cedar, clove', badge: '🔥' },
    // Melts
    { id: 'mw-orchard', name: 'Autumn Orchard Melts', category: 'melts', price: 9.00, note: 'Cider, pear, cinnamon', badge: '🍐' },
    { id: 'mw-moonflower', name: 'Moonflower Wax Melts', category: 'melts', price: 9.00, note: 'Night-blooming jasmine', badge: '🌙' },
    // Altar Oils
    { id: 'ao-protection', name: 'Protection Altar Oil', category: 'altar-oils', price: 16.00, note: 'Clove, rosemary, obsidian chips', badge: '🜃' },
    { id: 'ao-abundance', name: 'Abundance Altar Oil', category: 'altar-oils', price: 16.00, note: 'Orange, patchouli, pyrite dust', badge: '🜔' },
    // Spell Jars
    { id: 'sj-serenity', name: 'Serenity Spell Jar', category: 'spell-jars', price: 18.00, note: 'Lavender, amethyst, sea salt', badge: '🫙' },
    { id: 'sj-focus', name: 'Focus Spell Jar', category: 'spell-jars', price: 18.00, note: 'Peppermint, quartz, bay leaf', badge: '✨' },
    // Soap
    { id: 'sp-charcoal', name: 'Charcoal & Tea Tree Soap', category: 'soap', price: 8.00, note: 'Clarifying bar', badge: '🧼' },
    { id: 'sp-oatmilk', name: 'Oatmilk Honey Soap', category: 'soap', price: 8.00, note: 'Gentle, unscented bar', badge: '🍯' },
  ],
  cart: [],
  theme: localStorage.getItem('hexTheme') || 'dark',
};

// Init
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('year').textContent = new Date().getFullYear();

  // Theme
  setTheme(state.theme);
  document.getElementById('themeToggle').addEventListener('click', toggleTheme);

  // Render products
  renderProducts();

  // Filters
  document.getElementById('searchInput').addEventListener('input', renderProducts);
  document.getElementById('categorySelect').addEventListener('change', renderProducts);
  document.getElementById('sortSelect').addEventListener('change', renderProducts);

  // Cart events
  document.getElementById('cartBtn').addEventListener('click', openCart);
  document.getElementById('closeCart').addEventListener('click', closeCart);
  document.getElementById('checkoutBtn').addEventListener('click', checkout);

  // Contact form
  document.getElementById('contactForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const data = Object.fromEntries(fd.entries());
    // Demo only
    document.getElementById('contactStatus').textContent = "Thanks! We'll be in touch within 24–48 hours.";
    e.currentTarget.reset();
  });

  // Load cart
  try {
    const saved = JSON.parse(localStorage.getItem('hexCart') || '[]');
    if (Array.isArray(saved)) state.cart = saved;
  } catch {}
  updateCartUI();
});

// Theme helpers
function setTheme(next){
  state.theme = next;
  if(next === 'light'){
    document.documentElement.classList.add('light');
  }else{
    document.documentElement.classList.remove('light');
  }
  localStorage.setItem('hexTheme', next);
}
function toggleTheme(){
  setTheme(state.theme === 'light' ? 'dark' : 'light');
}

// Product rendering
function renderProducts(){
  const grid = document.getElementById('productGrid');
  const q = document.getElementById('searchInput').value.trim().toLowerCase();
  const cat = document.getElementById('categorySelect').value;
  const sort = document.getElementById('sortSelect').value;

  let items = [...state.products].filter(p => {
    const matchesQ = !q || p.name.toLowerCase().includes(q) || p.note.toLowerCase().includes(q);
    const matchesC = cat === 'all' || p.category === cat;
    return matchesQ && matchesC;
  });

  switch(sort){
    case 'price-asc': items.sort((a,b)=>a.price-b.price); break;
    case 'price-desc': items.sort((a,b)=>b.price-a.price); break;
    case 'name-asc': items.sort((a,b)=>a.name.localeCompare(b.name)); break;
    case 'name-desc': items.sort((a,b)=>b.name.localeCompare(a.name)); break;
    default: /* featured */ break;
  }

  grid.innerHTML = items.map(p => ProductCard(p)).join('');
  grid.querySelectorAll('.add-to-cart').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      const prod = state.products.find(x => x.id === id);
      addToCart(prod);
    });
  });
}

function ProductCard(p){
  return `
  <article class="card product">
    <div class="thumb"><span>${p.badge}</span></div>
    <div class="body">
      <h3>${p.name}</h3>
      <p>${titleCase(p.category.replace('-', ' '))} • ${p.note}</p>
    </div>
    <div class="foot">
      <span class="price">$${p.price.toFixed(2)}</span>
      <button class="btn primary add-to-cart" data-id="${p.id}">Add</button>
    </div>
  </article>
  `;
}

function titleCase(s){ return s.replace(/\b\w/g, c => c.toUpperCase()); }

// Cart
function addToCart(p){
  const existing = state.cart.find(x => x.id === p.id);
  if(existing){ existing.qty += 1; }
  else { state.cart.push({ id: p.id, name: p.name, price: p.price, badge: p.badge, qty: 1 }); }
  persistCart(); updateCartUI(); openCart();
}

function removeFromCart(id){
  state.cart = state.cart.filter(x => x.id !== id);
  persistCart(); updateCartUI();
}

function changeQty(id, delta){
  const item = state.cart.find(x => x.id === id);
  if(!item) return;
  item.qty = Math.max(1, item.qty + delta);
  persistCart(); updateCartUI();
}

function persistCart(){ localStorage.setItem('hexCart', JSON.stringify(state.cart)); }

function openCart(){ document.getElementById('cartDrawer').classList.add('open'); document.getElementById('cartDrawer').setAttribute('aria-hidden','false'); }
function closeCart(){ document.getElementById('cartDrawer').classList.remove('open'); document.getElementById('cartDrawer').setAttribute('aria-hidden','true'); }

function updateCartUI(){
  const list = document.getElementById('cartItems');
  if(state.cart.length === 0){
    list.innerHTML = `<p class="card" style="padding:12px;">Your cart is empty.</p>`;
  }else{
    list.innerHTML = state.cart.map(it => `
      <div class="cart-item">
        <div class="thumb">${it.badge}</div>
        <div>
          <div class="name">${it.name}</div>
          <div class="meta">$${it.price.toFixed(2)} • Qty: ${it.qty}</div>
          <div class="qty">
            <button class="btn icon" aria-label="Decrease quantity" onclick="changeQty('${it.id}', -1)">−</button>
            <button class="btn icon" aria-label="Increase quantity" onclick="changeQty('${it.id}', 1)">+</button>
            <button class="btn" onclick="removeFromCart('${it.id}')">Remove</button>
          </div>
        </div>
        <div><strong>$${(it.price * it.qty).toFixed(2)}</strong></div>
      </div>
    `).join('');
  }

  const subtotal = state.cart.reduce((s, x) => s + x.price * x.qty, 0);
  document.getElementById('cartSubtotal').textContent = `$${subtotal.toFixed(2)}`;
  document.getElementById('cartCount').textContent = state.cart.reduce((s, x)=>s + x.qty, 0);
}

function checkout(){
  alert('Demo checkout—connect Stripe, Lemon Squeezy, or Shopify here.');
}

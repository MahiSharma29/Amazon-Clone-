const $=s=>document.querySelector(s);
const ld=(k,d)=>{try{const v=localStorage.getItem(k);return v?JSON.parse(v):d}catch(e){return d}};
const sv=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}};
const inr=n=>'₹'+n.toLocaleString('en-IN');
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const CATS=['All','Electronics','Fashion','Home & Kitchen','Books','Beauty','Sports'];
let P=[],wish=[],token=ld('sz_token',''),coupon=null,pend=null;
const SL=[
['Festive sale: up to 70% off electronics','Headphones, phones and laptops with free delivery.','Electronics','linear-gradient(120deg,#232f3e,#37475a 60%,#146eb4)','📱'],
['Fresh looks for every season','Fashion and accessories starting at ₹299.','Fashion','linear-gradient(120deg,#6a1b4d,#c2185b 60%,#ff7043)','👟'],
['Books that change how you think','Bestsellers from ₹249, delivered in 2 days.','Books','linear-gradient(120deg,#0b3d2e,#1b7a5a 60%,#8bc34a)','📚']];
let S={view:'home',cat:'All',q:'',sort:'rel',pr:0,rt:0};
let cart=ld('sz_cart',{}),user=ld('sz_user',null),slide=0;
const PR=[['Any price',0,1e9],['Under ₹500',0,500],['₹500 – ₹2,000',500,2000],['₹2,000 – ₹10,000',2000,10000],['Over ₹10,000',10000,1e9]];
const stars=r=>'★'.repeat(Math.round(r))+'☆'.repeat(5-Math.round(r));
const bg=p=>`background:linear-gradient(135deg,hsl(${p.h} 70% 92%),hsl(${p.h} 65% 80%))`;
const disc=p=>Math.round((1-p.price/p.mrp)*100);
function toast(m){const t=$('#toast');t.textContent=m;t.classList.add('on');clearTimeout(toast.t);toast.t=setTimeout(()=>t.classList.remove('on'),1800)}
function go(v,o){S={...S,view:v,...(o||{})};if(o&&o.cat!==undefined)S.pr=S.rt=0;closeM();render();scrollTo(0,0)}
function filtered(){
 let l=P.filter(p=>(S.cat==='All'||p.cat===S.cat)&&p.r>=S.rt&&p.price>=PR[S.pr][1]&&p.price<=PR[S.pr][2]&&(!S.q||(p.name+p.cat).toLowerCase().includes(S.q.toLowerCase())));
 const s={lo:(a,b)=>a.price-b.price,hi:(a,b)=>b.price-a.price,rt:(a,b)=>b.r-a.r,rel:(a,b)=>b.rv-a.rv}[S.sort];return l.sort(s)}
function card(p){return `<div class="card p" tabindex="0" onclick="openP(${p.id})" onkeydown="if(event.key==='Enter')openP(${p.id})">
 <div class="img" style="${bg(p)}">${im(p)}<button class="heart" onclick="event.stopPropagation();wishT(${p.id})" aria-label="Wish list">${wish.includes(p.id)?'♥':'♡'}</button></div><h3>${p.name}</h3>
 <div class="st">${stars(p.r)}<small>${p.rv.toLocaleString('en-IN')}</small></div>
 <div class="pr"><sup>₹</sup>${p.price.toLocaleString('en-IN')}</div>
 <div class="mrp"><s>${inr(p.mrp)}</s><span class="off">(${disc(p)}% off)</span></div>
 <div class="del">FREE delivery by <b>${eta()}</b></div>
 <button class="btn w" onclick="event.stopPropagation();add(${p.id})">Add to Cart</button></div>`}
function eta(){const d=new Date();d.setDate(d.getDate()+3);return d.toLocaleDateString('en-IN',{weekday:'short',day:'numeric',month:'short'})}
function hero(){return `<div class="hero">${SL.map((s,i)=>`<div class="slide${i===slide?' on':''}" style="background:${s[3]}"><div><h2>${s[0]}</h2><p>${s[1]}</p><button class="btn" onclick="go('home',{cat:'${s[2]}'})">Shop ${s[2]}</button></div><div class="em">${s[4]}</div></div>`).join('')}<div class="dots">${SL.map((_,i)=>`<i class="${i===slide?'on':''}" onclick="slide=${i};setSlide()"></i>`).join('')}</div></div>`}
function setSlide(){document.querySelectorAll('.slide').forEach((e,i)=>e.classList.toggle('on',i===slide));document.querySelectorAll('.dots i').forEach((e,i)=>e.classList.toggle('on',i===slide))}
setInterval(()=>{if(S.view==='home'&&document.querySelector('.hero')){slide=(slide+1)%SL.length;setSlide()}},4500);
function tiles(){const t=[['Electronics','Gadgets that make life easier'],['Fashion','Up to 60% off'],['Home & Kitchen','Upgrade your space'],['Sports','Stay active']];
 return `<div class="tiles">${t.map(([c,s])=>{const ps=P.filter(p=>p.cat===c).slice(0,4);return `<div class="card tile"><h3>${c}</h3><div class="em">${ps.map(p=>`<span style="${bg(p)}">${im(p)}</span>`).join('')}</div><a onclick="go('home',{cat:'${c}'})">${s} – see more</a></div>`}).join('')}</div>`}
function home(){
 const l=filtered(),landing=S.cat==='All'&&!S.q;
 $('#app').innerHTML=(landing?hero()+tiles():'')+`<div class="wrap shop"><aside class="card side">
 <h4>Department</h4>${CATS.map(c=>`<a class="c${c===S.cat?' on':''}" onclick="go('home',{cat:'${c}'})">${c}</a>`).join('')}
 <h4>Price</h4>${PR.map((x,i)=>`<label><input type="radio" name="pr" ${i===S.pr?'checked':''} onchange="S.pr=${i};render()"> ${x[0]}</label>`).join('')}
 <h4>Customer review</h4><label><input type="checkbox" ${S.rt?'checked':''} onchange="S.rt=this.checked?4:0;render()"> <span class="st">★★★★</span> &amp; up</label>
 </aside><section><div class="bar"><span><b>${l.length}</b> results${S.q?` for "<b>${esc(S.q)}</b>"`:''}${S.cat!=='All'?` in ${S.cat}`:''}</span>
 <label>Sort by <select onchange="S.sort=this.value;render()" style="padding:5px;background:var(--card);border:1px solid var(--line);border-radius:6px">${[['rel','Featured'],['lo','Price: low to high'],['hi','Price: high to low'],['rt','Avg. customer review']].map(o=>`<option value="${o[0]}"${S.sort===o[0]?' selected':''}>${o[1]}</option>`).join('')}</select></label></div>
 <div class="grid">${l.map(card).join('')||'<div class="card pad">No products match your filters. Clear the filters or try a different search.</div>'}</div></section></div>`}
const items=()=>Object.entries(cart).map(([id,q])=>({p:P.find(x=>x.id==id),q})).filter(x=>x.p);
const sum=()=>items().reduce((a,x)=>a+x.p.price*x.q,0);
const ship=s=>s===0||s>=499?0:40;
function render(){
 $('#nav').innerHTML=CATS.map(c=>`<button class="${c===S.cat&&S.view==='home'?'on':''}" onclick="go('home',{cat:'${c}',q:''})">${c==='All'?'☰ All':c}</button>`).join('');
 $('#cn').textContent=Object.values(cart).reduce((a,b)=>a+b,0);
 $('#acct').innerHTML=`<small>Hello, ${user?esc(user.name):'sign in'}</small><b>Account &amp; Lists</b>`;
 ({home,cart:cartView,orders:ordersView,wish:wishView})[S.view]()}
function add(id,q=1){cart[id]=(cart[id]||0)+q;sv('sz_cart',cart);render();toast('Added to cart ✔')}
function setQ(id,q){if(q<=0)delete cart[id];else cart[id]=Math.min(q,10);sv('sz_cart',cart);if(!sum())coupon=null;else if(coupon)applyC(coupon.code,true);render()}
function modal(h){closeM();const m=document.createElement('div');m.className='mask';m.id='mk';m.onclick=e=>{if(e.target===m)closeM()};m.innerHTML=`<div class="modal" role="dialog" aria-modal="true"><button class="x" onclick="closeM()" aria-label="Close">×</button>${h}</div>`;document.body.appendChild(m)}
function closeM(){const m=$('#mk');if(m)m.remove()}
function pq(d){const e=$('#pqv');e.textContent=Math.max(1,Math.min(10,+e.textContent+d))}
$('#sc').innerHTML=CATS.map(c=>`<option value="${c}">${c==='All'?'All':c}</option>`).join('');
addEventListener('keydown',e=>{if(e.key==='Escape')closeM()});

/* ---------- API + helpers ---------- */
async function api(u, o = {}) {
  const r = await fetch('/api' + u, {
    method: o.method || 'GET',
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: 'Bearer ' + token } : {}) },
    body: o.body ? JSON.stringify(o.body) : undefined
  });
  const d = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(d.error || 'Something went wrong');
  return d;
}
const im = p => `<i class="e">${p.em}</i>${p.img ? `<img src="${p.img}" alt="${esc(p.name)}" loading="lazy" onerror="this.remove()">` : ''}`;
function need(f) { if (user) return true; pend = f; signIn(); return false; }
const tot = () => { const s = sum(); return { s, d: coupon ? coupon.discount : 0, sh: coupon && coupon.freeShip ? 0 : ship(s) }; };

/* ---------- Auth ---------- */
function signIn(mode) {
  if (user) { modal(`<h2>Hello, ${esc(user.name)}</h2><p>${esc(user.email)}</p><button class="btn" onclick="logout()">Sign out</button> <button class="btn g" onclick="go('orders')">Your orders</button> <button class="btn g" onclick="go('wish')">Wish list</button>`); return; }
  const reg = mode === 'register';
  modal(`<div style="max-width:340px;margin:auto"><h2>${reg ? 'Create account' : 'Sign in'}</h2>
  ${reg ? '<label class="fld"><span>Your name</span><input id="an"></label>' : ''}
  <label class="fld"><span>Email</span><input id="ae" type="email"></label>
  <label class="fld"><span>Password (min 6 characters)</span><input id="ap" type="password"></label>
  <p id="er" style="color:#cc0c39;margin:6px 0"></p><button class="btn o w" onclick="doAuth(${reg})">${reg ? 'Create account' : 'Sign in'}</button>
  <p class="del">${reg ? `Already have an account? <a onclick="signIn()">Sign in</a>` : `New here? <a onclick="signIn('register')">Create your account</a>`}</p></div>`);
}
async function doAuth(reg) {
  try {
    const d = await api(reg ? '/register' : '/login', { method: 'POST', body: { name: $('#an') ? $('#an').value.trim() : '', email: $('#ae').value, password: $('#ap').value } });
    token = d.token; user = d.user; sv('sz_token', token); sv('sz_user', user);
    wish = (await api('/wishlist')).ids; closeM(); render(); toast('Welcome, ' + user.name + '!');
    if (pend) { const f = pend; pend = null; f(); }
  } catch (e) { $('#er').textContent = e.message; }
}
function logout(q) { token = ''; user = null; wish = []; coupon = null; sv('sz_token', ''); sv('sz_user', null); if (!q) { closeM(); toast('Signed out'); } render(); }

/* ---------- Wish list ---------- */
async function wishT(id) {
  if (!need(() => wishT(id))) return;
  try { wish = (await api('/wishlist/' + id, { method: 'POST' })).ids; render(); toast(wish.includes(id) ? 'Added to wish list ♥' : 'Removed from wish list'); }
  catch (e) { toast(e.message); }
}
function wishView() {
  const l = P.filter(p => wish.includes(p.id));
  $('#app').innerHTML = `<div class="wrap" style="margin-top:16px"><div class="card" style="margin-bottom:14px"><h2 style="margin:0">Your Wish List</h2></div><div class="grid">${l.map(card).join('') || '<div class="card pad">Your wish list is empty. Tap the ♡ on any product to save it here.</div>'}</div></div>`;
}

/* ---------- Product popup + reviews ---------- */
function openP(id) {
  const p = P.find(x => x.id === id);
  modal(`<div class="det"><div class="img" style="${bg(p)}">${im(p)}</div><div><h2 style="margin:0 0 6px">${p.name}</h2><div class="st">${p.r} ${stars(p.r)}<small>${p.rv.toLocaleString('en-IN')} ratings</small></div><hr style="border:0;border-top:1px solid var(--line)">
 <div><span class="off" style="font-size:22px">-${disc(p)}%</span> <span class="pr"><sup>₹</sup>${p.price.toLocaleString('en-IN')}</span></div><div class="mrp">M.R.P.: <s>${inr(p.mrp)}</s></div><p>${p.d}</p>
 <p class="del">FREE delivery by <b>${eta()}</b>. Pay on delivery available.</p><p style="color:#067d62;font-size:18px;margin:6px 0">In stock</p>
 <div style="margin-bottom:12px"><span class="qty"><button onclick="pq(-1)">−</button><span id="pqv">1</span><button onclick="pq(1)">+</button></span></div>
 <button class="btn w" onclick="add(${p.id},+$('#pqv').textContent);closeM()">Add to Cart</button><br><br>
 <button class="btn o w" onclick="add(${p.id},+$('#pqv').textContent);go('cart');checkout()">Buy Now</button>
 <button class="btn g w" style="margin-top:8px" onclick="wishT(${p.id})">${wish.includes(p.id) ? '♥ Saved in wish list' : '♡ Add to wish list'}</button></div></div>
 <div id="rv" style="margin-top:20px;border-top:1px solid var(--line);padding-top:12px">Loading reviews…</div>`);
  loadRv(id);
}
async function loadRv(id) {
  const el = $('#rv'); if (!el) return;
  try {
    const { reviews: r } = await api('/products/' + id + '/reviews');
    el.innerHTML = `<h3 style="margin-top:0">Customer reviews (${r.length})</h3>${r.map(x => `<div style="border-bottom:1px solid var(--line);padding:8px 0"><b>${esc(x.name)}</b> <span class="st">${stars(x.rating)}</span><div>${esc(x.text)}</div><small class="del">${new Date(x.date).toLocaleDateString('en-IN')}</small></div>`).join('') || '<p class="del">No reviews yet. Be the first to review this product.</p>'}
    <div style="margin-top:12px"><b>Write a review</b><br><select id="rr" style="padding:6px;margin:6px 0;background:var(--card);border:1px solid var(--line);border-radius:6px">${[5, 4, 3, 2, 1].map(n => `<option value="${n}">${n} ★</option>`).join('')}</select>
    <input id="rt" maxlength="500" placeholder="Share your experience" style="width:100%;padding:9px;border:1px solid #888;border-radius:4px;background:var(--card);margin-bottom:8px"><button class="btn" onclick="postRv(${id})">Submit review</button></div>`;
  } catch (e) { el.textContent = 'Reviews could not be loaded.'; }
}
async function postRv(id) {
  if (!need(() => openP(id))) return;
  const text = $('#rt').value.trim(); if (!text) return toast('Write something first');
  try { await api('/products/' + id + '/reviews', { method: 'POST', body: { rating: +$('#rr').value, text } }); toast('Review posted ✔'); loadRv(id); }
  catch (e) { toast(e.message); }
}

/* ---------- Cart + coupons ---------- */
async function applyC(code, quiet) {
  code = (code || '').trim(); if (!code) return;
  try { const d = await api('/coupon', { method: 'POST', body: { code, subtotal: sum() } }); coupon = { code: d.code, discount: d.discount, freeShip: d.freeShip }; if (!quiet) toast(d.message); }
  catch (e) { coupon = null; if (!quiet) toast(e.message); }
  if (S.view === 'cart') render();
}
function cartView() {
  const it = items(), { s, d, sh } = tot();
  $('#app').innerHTML = `<div class="wrap cartl"><div class="card"><h2 style="margin:0">Shopping Cart</h2>${it.length ? it.map(({ p, q }) => `<div class="row"><div class="img" style="${bg(p)}">${im(p)}</div><div><a onclick="openP(${p.id})" style="font-size:16px">${p.name}</a><div style="color:#067d62;font-size:12px;margin:4px 0">In stock</div><div class="del">Eligible for FREE delivery</div><div style="margin-top:10px"><span class="qty"><button onclick="setQ(${p.id},${q - 1})" aria-label="Decrease">−</button><span>${q}</span><button onclick="setQ(${p.id},${q + 1})" aria-label="Increase">+</button></span><a onclick="setQ(${p.id},0)">Delete</a></div></div><b style="font-size:18px">${inr(p.price * q)}</b></div>`).join('') : `<div class="pad"><p>Your cart is empty. Add something you like.</p><button class="btn" onclick="go('home',{cat:'All',q:''})">Continue shopping</button></div>`}</div>
 ${it.length ? `<div class="card"><p style="color:#067d62;margin-top:0">${s >= 499 || sh === 0 ? '✔ Your order qualifies for FREE delivery.' : 'Add ' + inr(499 - s) + ' more for FREE delivery.'}</p>
 <div>Subtotal: ${inr(s)}</div>${d ? `<div style="color:#067d62">Coupon ${coupon.code}: −${inr(d)} <a onclick="coupon=null;render()">remove</a></div>` : ''}${coupon && coupon.freeShip ? `<div style="color:#067d62">Coupon ${coupon.code}: free delivery <a onclick="coupon=null;render()">remove</a></div>` : ''}<div>Delivery: ${sh ? inr(sh) : 'FREE'}</div>
 <div class="tot" style="margin:6px 0">Total: <b>${inr(s - d + sh)}</b></div>
 <div style="display:flex;gap:6px;margin:10px 0 4px"><input id="cc" placeholder="Coupon code" style="flex:1;min-width:0;padding:8px;border:1px solid #888;border-radius:4px;background:var(--card)"><button class="btn g" onclick="applyC($('#cc').value)">Apply</button></div><div class="del" style="margin-bottom:12px">Try SAVE10, WELCOME200 (over ₹999) or FREESHIP</div>
 <button class="btn o w" onclick="checkout()">Proceed to Buy</button></div>` : ''}</div>`;
}
function checkout() {
  if (!sum()) return; if (!need(checkout)) return;
  const { s, d, sh } = tot();
  modal(`<h2 style="margin-top:0">Checkout</h2><div class="det"><div><label class="fld"><span>Full name</span><input id="cn1" value="${esc(user.name)}"></label><label class="fld"><span>Mobile number</span><input id="cp" inputmode="numeric" maxlength="10"></label><label class="fld"><span>Address</span><input id="ca" placeholder="House no., street, city"></label><label class="fld"><span>Pincode</span><input id="cz" inputmode="numeric" maxlength="6"></label>
 <b>Payment method</b><label style="display:block;margin:6px 0"><input type="radio" name="pm" value="COD" checked> Cash / Pay on Delivery</label><label style="display:block"><input type="radio" name="pm" value="UPI"> UPI (demo)</label><label style="display:block"><input type="radio" name="pm" value="Card"> Credit / Debit card (demo)</label><p id="er" style="color:#cc0c39;margin:8px 0 0"></p></div>
 <div class="card" style="background:var(--bg)"><h3 style="margin-top:0">Order Summary</h3><p>Items: ${inr(s)}${d ? `<br>Coupon ${coupon.code}: −${inr(d)}` : ''}<br>Delivery: ${sh ? inr(sh) : 'FREE'}</p><div class="tot">Order Total: <b>${inr(s - d + sh)}</b></div><button class="btn o w" style="margin-top:12px" onclick="place()">Place your order</button></div></div>`);
}
async function place() {
  const er = $('#er');
  try {
    const o = await api('/orders', { method: 'POST', body: { items: items().map(({ p, q }) => ({ id: p.id, q })), coupon: coupon && coupon.code, name: $('#cn1').value, phone: $('#cp').value.trim(), addr: $('#ca').value, pin: $('#cz').value.trim(), pay: document.querySelector('[name=pm]:checked').value } });
    cart = {}; coupon = null; sv('sz_cart', cart); render();
    modal(`<div style="text-align:center;padding:20px"><div style="font-size:64px">✅</div><h2>Order placed, thank you!</h2><p>Order <b>${o.id}</b> · Total ${inr(o.total)}<br>Arriving ${eta()}</p><button class="btn" onclick="go('orders')">View your orders</button> <button class="btn g" onclick="go('home',{cat:'All'})">Keep shopping</button></div>`);
  } catch (e) { er.textContent = e.message; }
}
async function ordersView() {
  const box = h => $('#app').innerHTML = `<div class="wrap" style="margin-top:16px"><div class="card"><h2 style="margin:0 0 8px">Your Orders</h2>${h}</div></div>`;
  if (!user) return box(`<p>Sign in to see your orders.</p><button class="btn" onclick="signIn()">Sign in</button>`);
  box('<p>Loading…</p>');
  try {
    const { orders } = await api('/orders');
    box(orders.length ? orders.map(o => `<div class="row" style="grid-template-columns:1fr auto"><div><b>Order ${o.id}</b> · ${new Date(o.date).toLocaleDateString('en-IN')} · ${o.pay}<br>${o.items.map(i => i.em + ' ' + i.n + ' × ' + i.q).join('<br>')}<div class="del">Ship to: ${esc(o.name)}, ${esc(o.addr)} - ${esc(o.pin)}</div>${o.discount ? `<div style="color:#067d62">Saved ${inr(o.discount)} with ${o.coupon}</div>` : ''}</div><b>${inr(o.total)}</b></div>`).join('') : '<p>You have no orders yet.</p>');
  } catch (e) { box('<p>Orders could not be loaded.</p>'); }
}

/* ---------- Start ---------- */
async function init() {
  try { P = await api('/products'); }
  catch (e) { $('#app').innerHTML = '<div class="wrap" style="margin-top:20px"><div class="card pad"><h2>Cannot reach the server</h2><p>Open a terminal in the project folder, run <b>npm start</b>, then visit <b>http://localhost:3000</b>.</p></div></div>'; return; }
  if (token) { try { user = (await api('/me')).user; wish = (await api('/wishlist')).ids; } catch (e) { logout(true); } }
  render();
}

init();

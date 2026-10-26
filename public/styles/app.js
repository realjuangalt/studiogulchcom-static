(() => {
const $ = id => document.getElementById(id);
const b64d = s => Uint8Array.from(atob(s), c => c.charCodeAt(0));
const b64e = u => btoa(String.fromCharCode(...new Uint8Array(u)));
let key, cfg, M, cur = null, idx = 0;
const urls = new Map(), pending = new Map();

async function derive(pw) {
  const base = await crypto.subtle.importKey('raw', new TextEncoder().encode(pw), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({name:'PBKDF2', hash:'SHA-256', salt:b64d(cfg.salt), iterations:cfg.iter}, base, 256);
  return new Uint8Array(bits);
}
async function importKey(raw) { return crypto.subtle.importKey('raw', raw, 'AES-GCM', false, ['decrypt']); }
async function dec(buf) {
  const u = new Uint8Array(buf);
  return crypto.subtle.decrypt({name:'AES-GCM', iv:u.slice(0,12)}, key, u.slice(12));
}
async function blobUrl(name, type) {
  if (urls.has(name)) return urls.get(name);
  if (!pending.has(name)) pending.set(name, (async () => {
    const r = await fetch('d/' + name); if (!r.ok) throw new Error('fetch ' + name);
    const u = URL.createObjectURL(new Blob([await dec(await r.arrayBuffer())], {type}));
    urls.set(name, u); return u;
  })());
  return pending.get(name);
}
async function unlock(raw) {
  key = await importKey(raw);
  const r = await fetch('m.bin', {cache:'no-store'});
  M = JSON.parse(new TextDecoder().decode(await dec(await r.arrayBuffer())));
}
async function boot() {
  cfg = await (await fetch('config.json', {cache:'no-store'})).json();
  const saved = sessionStorage.getItem('sk:' + cfg.salt);
  if (saved) { try { await unlock(b64d(saved)); return show(); } catch { sessionStorage.removeItem('sk:' + cfg.salt); } }
  $('gf').onsubmit = async e => {
    e.preventDefault(); $('err').textContent = 'Unlocking…';
    try {
      const raw = await derive($('pw').value);
      await unlock(raw);
      sessionStorage.setItem('sk:' + cfg.salt, b64e(raw));
      $('pw').value = ''; show();
    } catch { $('err').textContent = 'Wrong password'; }
  };
}
const el = (t, c, h) => { const e = document.createElement(t); if (c) e.className = c; if (h != null) e.textContent = h; return e; };
function tagsEl(tags) { const d = el('div', 'tags'); (tags||[]).slice(0, 8).forEach(t => d.append(el('span', '', t))); return d; }

// lazy decrypt thumbnails as they enter viewport
const io = new IntersectionObserver(es => es.forEach(async e => {
  if (!e.isIntersecting) return; io.unobserve(e.target);
  const u = await blobUrl(e.target.dataset.b, 'image/webp');
  if (e.target.tagName === 'IMG') e.target.src = u; else e.target.style.backgroundImage = `url(${u})`;
}), {rootMargin: '400px'});

function show() {
  $('gate').hidden = true; $('hdr').hidden = false;
  $('h1').textContent = `Styles · ${M.styles.length}`;
  const g = $('grid'); g.innerHTML = '';
  M.styles.forEach((s, i) => {
    const c = el('div', 'card'); c.dataset.q = [s.title, s.source, ...(s.tags||[])].join(' ').toLowerCase();
    const im = el('div', 'im'); im.dataset.b = s.items[0].t; io.observe(im);
    const tx = el('div', 'tx'); const h = el('h2', '', s.title);
    tx.append(el('span', 'cnt', s.count + (s.count === 1 ? ' item' : ' items')), h, el('div', 'src', s.source || ''), tagsEl(s.tags));
    c.append(im, tx); c.onclick = () => { location.hash = s.id; }; g.append(c);
  });
  $('q').oninput = () => { const q = $('q').value.toLowerCase(); [...g.children].forEach(c => c.hidden = q && !c.dataset.q.includes(q)); };
  $('lock').onclick = () => { sessionStorage.removeItem('sk:' + cfg.salt); location.hash = ''; location.reload(); };
  route();
}
function route() {
  if (!M) return;
  const s = M.styles.find(x => x.id === location.hash.slice(1));
  closeLb();
  if (!s) { $('set').hidden = true; $('grid').hidden = false; $('hdr').hidden = false; return; }
  cur = s; $('grid').hidden = true; $('set').hidden = false; window.scrollTo(0, 0);
  const info = $('setinfo'); info.innerHTML = '';
  info.append(el('h2', '', s.title), el('div', 'src', (s.source || '') + ` · ${s.count} items`), tagsEl(s.tags));
  const sg = $('setgrid'); sg.innerHTML = '';
  s.items.forEach((it, i) => {
    const d = el('div', 'th'); const img = el('img'); img.alt = ''; img.dataset.b = it.t; io.observe(img);
    if (it.w) img.style.aspectRatio = `${it.w}/${it.h}`;
    d.append(img); if (it.k === 'vid') d.append(el('div', 'play', '▶'));
    d.onclick = () => openLb(i); sg.append(d);
  });
}
async function openLb(i) {
  idx = (i + cur.items.length) % cur.items.length; const it = cur.items[idx];
  $('lb').hidden = false; $('lbi').textContent = `${idx + 1} / ${cur.items.length}`;
  const c = $('lbc'); c.innerHTML = '';
  const tu = await blobUrl(it.t, 'image/webp');
  if (it.k === 'vid') {
    const v = el('video'); v.controls = true; v.autoplay = true; v.playsInline = true; v.poster = tu; c.append(v);
    v.src = await blobUrl(it.f, 'video/mp4');
  } else {
    const im = el('img'); im.src = tu; c.append(im);
    const fu = await blobUrl(it.f, 'image/webp'); if (cur.items[idx] === it) im.src = fu;
    [1, -1].forEach(d => { const n = cur.items[(idx + d + cur.items.length) % cur.items.length]; if (n.k === 'img') blobUrl(n.f, 'image/webp'); });
  }
}
function closeLb() { $('lb').hidden = true; const v = $('lbc').querySelector('video'); if (v) v.pause(); $('lbc').innerHTML = ''; }
$('lbx').onclick = closeLb; $('lbp').onclick = () => openLb(idx - 1); $('lbn').onclick = () => openLb(idx + 1);
$('lb').onclick = e => { if (e.target.id === 'lb') closeLb(); };
$('back').onclick = () => { location.hash = ''; };
document.onkeydown = e => { if ($('lb').hidden) { if (e.key === 'Escape' && cur) location.hash = ''; return; }
  if (e.key === 'Escape') closeLb(); if (e.key === 'ArrowRight') openLb(idx + 1); if (e.key === 'ArrowLeft') openLb(idx - 1); };
window.onhashchange = route;
boot();
})();

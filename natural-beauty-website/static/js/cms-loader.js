/**
 * Natural Beauty Clinic & Academy — CMS Loader v3
 * Fetches content JSON files saved by Decap CMS and
 * injects them into the page via data-cms="" attributes.
 * This is what makes every CMS publish show on the live website.
 */
const CMS = {

  async get(path) {
    try {
      const r = await fetch(path + '?v=' + Date.now());
      if (!r.ok) return null;
      return await r.json();
    } catch(e) { return null; }
  },

  text(key, val) {
    if (!val && val !== 0) return;
    document.querySelectorAll('[data-cms="' + key + '"]')
      .forEach(el => el.textContent = val);
  },

  html(key, val) {
    if (!val) return;
    document.querySelectorAll('[data-cms="' + key + '"]')
      .forEach(el => el.innerHTML = val);
  },

  href(key, val) {
    if (!val) return;
    document.querySelectorAll('[data-cms="' + key + '"]')
      .forEach(el => el.href = val);
  },

  meta(name, val) {
    if (!val) return;
    const el = document.querySelector('meta[name="' + name + '"]') ||
               document.querySelector('meta[property="' + name + '"]');
    if (el) el.setAttribute('content', val);
  },

  stars(n) {
    const f = Math.round(n || 5);
    return '★'.repeat(f) + '☆'.repeat(5 - f);
  },

  async folder(name) {
    const m = await this.get('/content/' + name + '/_manifest.json');
    if (!m || !m.files || !m.files.length) return [];
    const items = await Promise.all(m.files.map(f => this.get('/content/' + name + '/' + f)));
    return items.filter(Boolean);
  },

  reObserve() {
    if (!window._revealObserver) return;
    document.querySelectorAll('.reveal:not(.visible)')
      .forEach(el => window._revealObserver.observe(el));
  },

  async init() {
    await Promise.all([
      this.loadSettings(),
      this.loadContact(),
      this.loadFooter(),
      this.loadHero(),
      this.loadPromo(),
      this.loadAbout(),
      this.loadServices(),
      this.loadPrices(),
      this.loadCourses(),
      this.loadGallery(),
      this.loadTeam(),
      this.loadTestimonials(),
      this.loadBlog(),
      this.loadBridal(),
      this.loadFAQ(),
    ]);
    console.log('[CMS] ✅ All content loaded from JSON files');
  },

  // ── SETTINGS ──────────────────────────────────────────────
  async loadSettings() {
    const g = await this.get('/content/settings/general.json');
    if (!g) return;
    if (g.seo?.meta_title) document.title = g.seo.meta_title;
    this.meta('description',    g.seo?.meta_description);
    this.meta('keywords',       g.seo?.meta_keywords);
    this.meta('og:title',       g.seo?.meta_title);
    this.meta('og:description', g.seo?.meta_description);
    this.meta('og:image',       g.seo?.og_image);
    const short = g.site_name ? g.site_name.split(' ').slice(0,2).join(' ') : '';
    this.text('site-name-nav',    short || g.site_name);
    this.text('site-name-footer', short || g.site_name);
    if (g.logo) document.querySelectorAll('.site-logo-img').forEach(el => el.src = g.logo);
  },

  // ── CONTACT ───────────────────────────────────────────────
  async loadContact() {
    const c = await this.get('/content/settings/contact.json');
    if (!c) return;
    const addr = [c.address1, c.address2].filter(Boolean).join(', ');
    this.text('contact-address', addr);
    this.text('contact-hours',   (c.days || '') + ': ' + (c.hours || ''));
    this.text('contact-phone',   [c.phone1, c.phone2].filter(Boolean).join(' / '));
    if (c.email) {
      document.querySelectorAll('[data-cms="contact-email"]').forEach(el => {
        if (el.tagName === 'A') { el.href = 'mailto:' + c.email; el.textContent = c.email; }
        else el.innerHTML = '<a href="mailto:' + c.email + '">' + c.email + '</a>';
      });
    }
    if (c.whatsapp) {
      const msg = encodeURIComponent('Hello Natural Beauty Clinic! I would like to book an appointment.');
      const url = 'https://wa.me/' + c.whatsapp + '?text=' + msg;
      document.querySelectorAll('[data-cms="whatsapp-link"]').forEach(el => el.href = url);
    }
    if (c.social) {
      this.href('social-facebook',  c.social.facebook);
      this.href('social-instagram', c.social.instagram);
      this.href('social-tiktok',    c.social.tiktok);
    }
    if (c.google_biz_url)  this.href('google-business-link', c.google_biz_url);
    if (c.google_map_url) {
      const map = document.querySelector('[data-cms="google-map"]');
      if (map) map.src = c.google_map_url;
    }
  },

  // ── FOOTER ────────────────────────────────────────────────
  async loadFooter() {
    const f = await this.get('/content/settings/footer.json');
    if (!f) return;
    this.text('footer-description', f.description);
    this.text('footer-copyright',   f.copyright);
    if (f.links_col1) this.html('footer-links-col1', f.links_col1.map(l => '<li><a href="' + l.url + '">' + l.label + '</a></li>').join(''));
    if (f.links_col2) this.html('footer-links-col2', f.links_col2.map(l => '<li><a href="' + l.url + '">' + l.label + '</a></li>').join(''));
  },

  // ── HERO ──────────────────────────────────────────────────
  async loadHero() {
    const h = await this.get('/content/homepage/hero.json');
    if (!h) return;
    this.text('hero-badge',    h.badge);
    this.text('hero-heading1', h.heading1);
    this.text('hero-heading2', h.heading2);
    this.text('hero-heading3', h.heading3);
    this.text('hero-tagline',  h.tagline);
    document.querySelectorAll('[data-cms="hero-cta1"]').forEach(el => { el.textContent = h.cta1_text; el.href = h.cta1_url; });
    document.querySelectorAll('[data-cms="hero-cta2"]').forEach(el => { el.textContent = h.cta2_text; el.href = h.cta2_url; });
    if (h.stats && h.stats.length) {
      const c = document.querySelector('[data-cms="hero-stats"]');
      if (c) c.innerHTML = h.stats.map(s => '<div class="hstat"><div class="n">' + s.number + '</div><div class="l">' + s.label + '</div></div>').join('');
    }
  },

  // ── PROMO TICKER ──────────────────────────────────────────
  async loadPromo() {
    const p = await this.get('/content/homepage/promo_banner.json');
    if (!p || !p.items) return;
    const c = document.querySelector('[data-cms="promo-ticker"]');
    if (!c) return;
    const all = [...p.items, ...p.items];
    c.innerHTML = all.map(i => '<span class="ticker-item">✦ ' + i.text + ' <span class="dot">◆</span></span>').join('');
  },

  // ── ABOUT ─────────────────────────────────────────────────
  async loadAbout() {
    const a = await this.get('/content/homepage/about.json');
    if (!a) return;
    this.text('about-label',        a.label);
    this.text('about-heading',      a.heading);
    this.text('about-para1',        a.para1);
    this.text('about-para2',        a.para2);
    this.text('about-years',        a.years);
    this.text('about-years-label',  a.years_label);
    this.text('about-rating-label', a.rating_label);
    this.text('owner-name',         a.owner_name);
    this.text('owner-title',        a.owner_title);
    if (a.features && a.features.length) {
      const c = document.querySelector('[data-cms="about-features"]');
      if (c) c.innerHTML = a.features.map(f =>
        '<div class="af"><div class="af-icon">' + f.icon + '</div><h4>' + f.title + '</h4><p>' + f.desc + '</p></div>'
      ).join('');
    }
  },

  // ── SERVICES ──────────────────────────────────────────────
  async loadServices() {
    const files = await this.folder('services');
    if (!files.length) return;
    const active = files.filter(s => s.active !== false).sort((a, b) => (a.order||0) - (b.order||0));
    const c = document.querySelector('[data-cms="services-grid"]');
    if (!c) return;
    c.innerHTML = active.map(s =>
      '<div class="srv-card reveal">' +
        '<div class="srv-icon">' + (s.icon||'✨') + '</div>' +
        '<div class="srv-name">' + s.title + '</div>' +
        '<p class="srv-desc">' + s.description + '</p>' +
        (s.price_from ? '<div class="srv-price">From ' + s.price_from + '</div>' : '') +
        '<a href="#appointment" class="srv-link">Book Now →</a>' +
      '</div>'
    ).join('');
    this.reObserve();
  },

  // ── PRICE LIST ────────────────────────────────────────────
  async loadPrices() {
    const cats = [
      { key:'skin',           label:'Skin Treatments',     emoji:'🌸' },
      { key:'hair',           label:'Hair Services',        emoji:'💇‍♀️' },
      { key:'hair_treatment', label:'Hair Treatment',       emoji:'✨' },
      { key:'makeup',         label:'Makeup',               emoji:'💄' },
      { key:'mani_pedi',      label:'Manicure / Pedicure', emoji:'🤲' },
      { key:'nails',          label:'Nail Services',        emoji:'💅' },
      { key:'offers',         label:'Offer Prices',         emoji:'🎁' },
    ];
    const c = document.querySelector('[data-cms="pricelist-grid"]');
    if (!c) return;
    const data = await Promise.all(cats.map(cat => this.get('/content/pricelist/' + cat.key + '.json')));
    c.innerHTML = cats.map((cat, i) => {
      const d = data[i];
      if (!d || !d.items) return '';
      return '<div class="price-card reveal">' +
        '<div class="price-head"><span class="pe">' + cat.emoji + '</span>' +
        '<div><h3>' + cat.label + '</h3><div class="ph-line"></div></div></div>' +
        '<div class="price-rows">' +
        d.items.map(item =>
          '<div class="price-row">' +
            '<span class="pr-name">' + item.name + (item.sub ? '<small>' + item.sub + '</small>' : '') + '</span>' +
            '<span class="pr-price' + (item.highlight ? ' gold' : '') + '">' + item.price + '</span>' +
          '</div>'
        ).join('') +
        '</div></div>';
    }).join('');
    this.reObserve();
  },

  // ── COURSES ───────────────────────────────────────────────
  async loadCourses() {
    const files = await this.folder('courses');
    if (!files.length) return;
    const active = files.filter(c => c.active !== false).sort((a, b) => (a.order||0) - (b.order||0));
    const c = document.querySelector('[data-cms="courses-list"]');
    if (!c) return;
    c.innerHTML = active.map(course =>
      '<div class="cc reveal">' +
        '<div class="cc-head"><div class="cc-icon">' + (course.icon||'🎓') + '</div>' +
        '<div><div class="cc-title">' + course.title + '</div>' +
        '<div class="cc-dur">' + course.duration + '</div></div></div>' +
        '<p>' + course.description + '</p>' +
        (course.curriculum && course.curriculum.length
          ? '<ul style="list-style:none;margin-top:.5rem">' + course.curriculum.map(t => '<li style="font-size:.73rem;color:rgba(255,255,255,.45);padding:.15rem 0">✦ ' + t + '</li>').join('') + '</ul>'
          : '') +
        '<span class="cert-badge">🏆 ' + course.certificate + '</span>' +
      '</div>'
    ).join('');
    this.reObserve();
  },

  // ── GALLERY ───────────────────────────────────────────────
  async loadGallery() {
    const files = await this.folder('gallery');
    if (!files.length) return;
    const sorted = files.sort((a, b) => new Date(b.date) - new Date(a.date));
    const c = document.querySelector('[data-cms="gallery-masonry"]');
    if (!c) return;
    const bgs = ['gt1','gt2','gt3','gt4','gt5','gt6','gt7','gt8'];
    c.innerHTML = sorted.map((item, i) =>
      '<div class="gitem" data-cat="' + (item.category||'').toLowerCase() + '">' +
        (item.image
          ? '<img src="' + item.image + '" alt="' + item.title + '" class="gallery-real-img" loading="lazy">'
          : '<div class="gthumb ' + bgs[i % bgs.length] + '"><span>📸</span></div>') +
        '<div class="govl"><h4>' + item.title + '</h4>' +
        (item.description ? '<p>' + item.description + '</p>' : '') +
        '</div></div>'
    ).join('');
  },

  // ── TEAM ──────────────────────────────────────────────────
  async loadTeam() {
    const files = await this.folder('team');
    if (!files.length) return;
    const active = files.filter(t => t.active !== false).sort((a, b) => (a.order||0) - (b.order||0));
    const c = document.querySelector('[data-cms="team-grid"]');
    if (!c) return;
    c.innerHTML = active.map(m =>
      '<div class="tm-card reveal">' +
        '<div class="tm-photo">' +
          (m.photo
            ? '<img src="' + m.photo + '" alt="' + m.name + '">'
            : '<span>👩</span>') +
        '</div>' +
        '<div class="tm-body"><div class="tm-name">' + m.name + '</div><div class="tm-role">' + m.role + '</div></div>' +
      '</div>'
    ).join('');
    this.reObserve();
  },

  // ── TESTIMONIALS ──────────────────────────────────────────
  async loadTestimonials() {
    const files = await this.folder('testimonials');
    if (!files.length) return;
    const shown = files.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 6);
    const c = document.querySelector('[data-cms="testimonials-grid"]');
    if (!c) return;
    c.innerHTML = shown.map(t =>
      '<div class="tc reveal">' +
        '<div class="tc-stars">' + this.stars(t.rating) + '</div>' +
        '<p class="tc-text">"' + t.review + '"</p>' +
        '<div class="tc-auth">' +
          '<div class="tc-avatar">' +
            (t.photo ? '<img src="' + t.photo + '" alt="' + t.name + '">' : t.name.charAt(0).toUpperCase()) +
          '</div>' +
          '<div><div class="tc-name">' + t.name + '</div>' +
          '<div class="tc-loc">' + (t.service ? t.service + ' · ' : '') + t.location + '</div></div>' +
        '</div></div>'
    ).join('');
    this.reObserve();
  },

  // ── BLOG ──────────────────────────────────────────────────
  async loadBlog() {
    const files = await this.folder('blog');
    if (!files.length) return;
    const recent = files.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 3);
    const c = document.querySelector('[data-cms="blog-grid"]');
    if (!c) return;
    const bgs = ['bct1','bct2','bct3'];
    c.innerHTML = recent.map((post, i) => {
      const date = new Date(post.date).toLocaleDateString('en-US', { month:'long', year:'numeric' });
      return '<div class="bc reveal' + (i > 0 ? ' rd' + i : '') + '">' +
        '<div class="bc-thumb ' + bgs[i % bgs.length] + '" ' +
          (post.cover_image ? 'style="background-image:url(\'' + post.cover_image + '\');background-size:cover;background-position:center"' : '') + '>' +
          (!post.cover_image ? '<span>📝</span>' : '') +
          '<span class="bc-cat">' + post.category + '</span>' +
        '</div>' +
        '<div class="bc-body">' +
          '<p class="bc-date">📅 ' + date + '</p>' +
          '<h3 class="bc-title">' + post.title + '</h3>' +
          '<p class="bc-excerpt">' + post.excerpt + '</p>' +
          '<a href="#blog" class="bc-more">Read Article →</a>' +
        '</div></div>';
    }).join('');
    this.reObserve();
  },

  // ── BRIDAL ────────────────────────────────────────────────
  async loadBridal() {
    const files = await this.folder('bridal');
    if (!files.length) return;
    const active = files.filter(b => b.active !== false).sort((a, b) => (a.order||0) - (b.order||0));
    const c = document.querySelector('[data-cms="bridal-packages"]');
    if (!c) return;
    c.innerHTML = active.map(pkg =>
      '<div class="bpkg">' +
        '<div class="bpkg-left"><span class="bpkg-icon">' + (pkg.icon||'👰') + '</span>' +
        '<div><div class="bpkg-name">' + pkg.title + '</div>' +
        '<div class="bpkg-detail">' + pkg.description + '</div></div></div>' +
        '<div class="bpkg-price">' + (pkg.price||'On Request') + '</div>' +
      '</div>'
    ).join('');
  },

  // ── FAQ ───────────────────────────────────────────────────
  async loadFAQ() {
    const files = await this.folder('faq');
    if (!files.length) return;
    const active = files.filter(f => f.active !== false).sort((a, b) => (a.order||0) - (b.order||0));
    const c = document.querySelector('[data-cms="faq-list"]');
    if (!c) return;
    c.innerHTML = active.map(f =>
      '<div class="faq-item">' +
        '<button class="faq-q" onclick="toggleFAQ(this)">' + f.question + '<span class="arr">+</span></button>' +
        '<div class="faq-a"><div class="faq-a-inner">' + f.answer + '</div></div>' +
      '</div>'
    ).join('');
  },
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => CMS.init());
} else {
  CMS.init();
}

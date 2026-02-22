---
layout: default
title: Hack Lab
excerpt: "Hands-on XSS challenges in a safe sandbox."
---

<div class="hack-hero">
  <div class="hack-hero-badge">⚡ Interactive Lab</div>
  <h1 class="hack-hero-title">The <span>Hack</span> Lab</h1>
  <p class="hack-hero-sub">Hands-on XSS challenges in a safe sandbox. Read the guide, exploit the vulnerability, earn your flag.</p>
  <div class="hack-stats">
    <div class="hack-stat"><span class="hack-stat-num" id="solvedCount">0</span><span class="hack-stat-label">Solved</span></div>
    <div class="hack-stat"><span class="hack-stat-num">4</span><span class="hack-stat-label">Challenges</span></div>
    <div class="hack-stat"><span class="hack-stat-num">3</span><span class="hack-stat-label">Categories</span></div>
  </div>
</div>

<div class="hack-guide">
  <div class="hack-guide-title">// How to use this lab</div>
  <ul class="hack-guide-steps">
    <li class="hack-guide-step">
      <span class="hack-guide-step-num">01</span>
      <p>Read the <strong>briefing</strong> on the challenge page to understand what vulnerability is present.</p>
    </li>
    <li class="hack-guide-step">
      <span class="hack-guide-step-num">02</span>
      <p>Study the <strong>vulnerable code</strong> shown in the viewer — find the sink and the entry point.</p>
    </li>
    <li class="hack-guide-step">
      <span class="hack-guide-step-num">03</span>
      <p>Craft a payload in the <strong>playground</strong> and submit it. An <code>alert()</code> = success.</p>
    </li>
    <li class="hack-guide-step">
      <span class="hack-guide-step-num">04</span>
      <p>Stuck? Use the <strong>progressive hints</strong> — try to use as few as possible!</p>
    </li>
  </ul>
</div>

<div class="hack-grid">

  <a href="/hack/reflected-xss-one.html" class="hack-card" id="card-xss1">
    <div class="hack-card-header">
      <span class="hack-card-icon">💉</span>
      <span class="hack-badge hack-badge-easy">Easy</span>
    </div>
    <h3 class="hack-card-title">Reflected XSS — innerHTML</h3>
    <p class="hack-card-desc">Your input is reflected directly into <code>innerHTML</code>. Angle brackets are stripped — find another way in.</p>
    <div class="hack-card-meta">
      <span>🏷 Reflected XSS</span>
      <span class="hack-card-solved-badge">✓ SOLVED</span>
    </div>
  </a>

  <a href="/hack/reflected-xss-two.html" class="hack-card" id="card-xss2">
    <div class="hack-card-header">
      <span class="hack-card-icon">🔗</span>
      <span class="hack-badge hack-badge-easy">Easy</span>
    </div>
    <h3 class="hack-card-title">Reflected XSS — href Attribute</h3>
    <p class="hack-card-desc">Your input becomes a URL in an anchor's <code>href</code>. Angle brackets are stripped — think about other protocols.</p>
    <div class="hack-card-meta">
      <span>🏷 Reflected XSS</span>
      <span class="hack-card-solved-badge">✓ SOLVED</span>
    </div>
  </a>

  <a href="/hack/dom-xss.html" class="hack-card" id="card-xss3">
    <div class="hack-card-header">
      <span class="hack-card-icon">🌐</span>
      <span class="hack-badge hack-badge-medium">Medium</span>
    </div>
    <h3 class="hack-card-title">DOM-Based XSS — URL Hash</h3>
    <p class="hack-card-desc">No server involved. The page reads <code>window.location.hash</code> and injects it into the DOM without sanitisation.</p>
    <div class="hack-card-meta">
      <span>🏷 DOM XSS</span>
      <span class="hack-card-solved-badge">✓ SOLVED</span>
    </div>
  </a>

  <a href="/hack/stored-xss.html" class="hack-card" id="card-xss4">
    <div class="hack-card-header">
      <span class="hack-card-icon">💾</span>
      <span class="hack-badge hack-badge-hard">Hard</span>
    </div>
    <h3 class="hack-card-title">Stored XSS — Comment Board</h3>
    <p class="hack-card-desc">Comments are saved to <code>localStorage</code> and rendered unescaped on page load. Persist your payload.</p>
    <div class="hack-card-meta">
      <span>🏷 Stored XSS</span>
      <span class="hack-card-solved-badge">✓ SOLVED</span>
    </div>
  </a>

</div>

<script>
(function() {
    var keys = ['hack-solved-xss1','hack-solved-xss2','hack-solved-xss3','hack-solved-xss4'];
    var ids  = ['card-xss1','card-xss2','card-xss3','card-xss4'];
    var solved = 0;
    keys.forEach(function(k, i) {
        if (localStorage.getItem(k) === 'true') {
            solved++;
            var card = document.getElementById(ids[i]);
            if (card) card.classList.add('solved');
        }
    });
    var el = document.getElementById('solvedCount');
    if (el) el.textContent = solved;
})();
</script>

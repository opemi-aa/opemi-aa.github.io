---
layout: default
title: "Challenge 3 — DOM-Based XSS (URL Hash)"
back_url: /hack/
back_label: "← Hack Lab"
---

<div class="challenge-wrap">

  <!-- Header -->
  <div class="challenge-header">
    <span class="hack-badge hack-badge-medium">Medium</span>
    <h1 class="challenge-title">Challenge 3 — DOM-Based XSS (URL Hash)</h1>
  </div>

  <!-- Briefing -->
  <div class="challenge-briefing">
    <h3>// Mission Briefing</h3>
    <p>
      DOM-based XSS never touches the server. The page itself reads data from an attacker-controlled
      source — in this case <code>window.location.hash</code> — and writes it into the DOM with no
      sanitisation. There is no server-side filter to bypass; the vulnerability lives entirely in
      client-side JavaScript.
    </p>
    <p class="challenge-objective">Objective: trigger <code>alert(1)</code> using only the URL bar (the fragment / hash portion).</p>
  </div>

  <!-- Vulnerable code viewer -->
  <div class="challenge-code-viewer">
    <div class="code-viewer-bar">
      <span class="code-viewer-dot cvd-red"></span>
      <span class="code-viewer-dot cvd-yellow"></span>
      <span class="code-viewer-dot cvd-green"></span>
      <span>// vulnerable snippet</span>
    </div>
    <pre><code>window.addEventListener('DOMContentLoaded', function() {
    // source: window.location.hash — fully attacker-controlled
    var fragment = window.location.hash.slice(1); // remove leading '#'

    if (fragment) {
        // 🔴 sink: innerHTML with no sanitisation
        document.getElementById('hashOutput').innerHTML =
            '&lt;p&gt;Page context: ' + decodeURIComponent(fragment) + '&lt;/p&gt;';
    }
});</code></pre>
  </div>

  <!-- Success banner -->
  <div class="challenge-success" id="successBanner">
    <span class="challenge-success-icon">🎉</span>
    <h3>Challenge Solved!</h3>
    <p>You injected JavaScript entirely via the URL — no form, no server interaction, just a crafted fragment.</p>
  </div>

  <!-- Playground -->
  <div class="challenge-playground">
    <span class="playground-label">// Playground — the hash drives the injection</span>
    <div class="playground-row">
      <input type="text" class="playground-input" id="hashSimInput" placeholder="Paste a hash payload, e.g. &lt;img src=x onerror=alert(1)&gt;">
      <button class="playground-btn" id="hashSimBtn">Inject</button>
    </div>
    <div class="playground-output-area" id="hashOutput">
      <p style="color:rgba(201,209,217,0.35);font-size:0.82rem;">Output will appear here…</p>
    </div>
    <p style="font-size:0.75rem;color:var(--text-secondary);margin-top:0.6rem;">
      In a real attack, the payload would be in the URL itself:<br>
      <code style="color:var(--primary);font-size:0.72rem;">/hack/dom-xss.html#&lt;img src=x onerror=alert(1)&gt;</code>
    </p>
  </div>

  <!-- Hints -->
  <div class="challenge-hints">
    <div class="hints-header">
      <span class="hints-header-title">// Progressive Hints</span>
      <button class="hint-btn" id="hint1Btn">Hint 1</button>
    </div>
    <div class="hint-block" id="hint1">
      <span class="hint-label">hint 1 / 3</span>
      <p>The vulnerable code reads the hash and injects it into <code>innerHTML</code> with zero filtering. You can use <em>any</em> HTML tag — there's nothing to bypass this time. What HTML tag can run JavaScript without a separate <code>&lt;script&gt;</code> block?</p>
      <button class="hint-btn" style="margin-top:0.6rem" id="hint2Btn">Hint 2</button>
    </div>
    <div class="hint-block" id="hint2">
      <span class="hint-label">hint 2 / 3</span>
      <p>Tags with event handlers work perfectly here. An <code>&lt;img&gt;</code> with a broken <code>src</code> fires its <code>onerror</code> handler immediately — no user click required.</p>
      <button class="hint-btn" style="margin-top:0.6rem" id="hint3Btn">Reveal Answer</button>
    </div>
    <div class="hint-block" id="hint3">
      <span class="hint-label">answer</span>
      <p>Paste this into the simulator (or append it to the URL as a hash):<br>
      <code>&lt;img src=x onerror=alert(1)&gt;</code><br><br>
      For a real DOM-XSS attack, share:<br>
      <code>/hack/dom-xss.html#%3Cimg%20src%3Dx%20onerror%3Dalert(1)%3E</code></p>
    </div>
  </div>

  <!-- Nav -->
  <div class="challenge-nav">
    <a href="/hack/reflected-xss-two.html">← Previous Challenge</a>
    <a href="/hack/stored-xss.html" class="next-challenge">Next Challenge →</a>
  </div>

</div>

<script>
(function() {
    var _alert = window.alert;
    window.alert = function(msg) {
        _alert.call(window, msg);
        localStorage.setItem('hack-solved-xss3', 'true');
        document.getElementById('successBanner').classList.add('visible');
    };

    // Simulate the DOM-XSS via the playground input
    document.getElementById('hashSimBtn').addEventListener('click', function() {
        var payload = document.getElementById('hashSimInput').value;
        var output  = document.getElementById('hashOutput');
        // Mirrors the vulnerable code (no sanitisation — intentional)
        output.innerHTML = '<p>Page context: ' + payload + '</p>';
    });

    // Also fire on real hash (for URL-based demo)
    var fragment = window.location.hash.slice(1);
    if (fragment) {
        var decoded = decodeURIComponent(fragment);
        document.getElementById('hashOutput').innerHTML =
            '<p>Page context: ' + decoded + '</p>';
    }

    var hints = {
        hint1Btn: 'hint1',
        hint2Btn: 'hint2',
        hint3Btn: 'hint3'
    };
    Object.keys(hints).forEach(function(btnId) {
        var btn = document.getElementById(btnId);
        if (btn) {
            btn.addEventListener('click', function() {
                document.getElementById(hints[btnId]).classList.add('visible');
                btn.style.display = 'none';
            });
        }
    });

    if (localStorage.getItem('hack-solved-xss3') === 'true') {
        document.getElementById('successBanner').classList.add('visible');
    }
})();
</script>

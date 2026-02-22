---
layout: default
title: "Challenge 2 — Reflected XSS (href Attribute)"
back_url: /hack/
back_label: "← Hack Lab"
---

<div class="challenge-wrap">

  <!-- Header -->
  <div class="challenge-header">
    <span class="hack-badge hack-badge-easy">Easy</span>
    <h1 class="challenge-title">Challenge 2 — Reflected XSS (href Attribute)</h1>
  </div>

  <!-- Briefing -->
  <div class="challenge-briefing">
    <h3>// Mission Briefing</h3>
    <p>
      Your input is taken verbatim and placed inside an anchor tag's <code>href</code> attribute.
      The filter strips <code>&lt;</code>, <code>&gt;</code>, and <code>"</code> — so you cannot break
      out of the attribute with HTML. But there's more than one way to execute JavaScript from a URL.
    </p>
    <p class="challenge-objective">Objective: make <code>alert(1)</code> fire when the link is clicked.</p>
  </div>

  <!-- Vulnerable code viewer -->
  <div class="challenge-code-viewer">
    <div class="code-viewer-bar">
      <span class="code-viewer-dot cvd-red"></span>
      <span class="code-viewer-dot cvd-yellow"></span>
      <span class="code-viewer-dot cvd-green"></span>
      <span>// vulnerable snippet</span>
    </div>
    <pre><code>submitButton.addEventListener('click', function() {
    let url = urlInput.value;

    // "sanitisation" — strips &lt;, &gt;, and "
    url = url.replaceAll("&lt;","").replaceAll("&gt;","").replaceAll('"',"");

    // 🔴 sink: user-controlled string set as href
    outputLink.href = url;
});</code></pre>
  </div>

  <!-- Success banner -->
  <div class="challenge-success" id="successBanner">
    <span class="challenge-success-icon">🎉</span>
    <h3>Challenge Solved!</h3>
    <p>You used the <code>javascript:</code> protocol to execute code directly from an href. Classic and effective.</p>
  </div>

  <!-- Playground -->
  <div class="challenge-playground">
    <span class="playground-label">// Playground — craft your URL payload</span>
    <div class="playground-row">
      <input type="text" class="playground-input" id="urlInput" placeholder="https://example.com">
      <button class="playground-btn" id="submitUrl">Set URL</button>
    </div>
    <div class="playground-output-area">
      <h1>Welcome Everyone!</h1>
      <a id="outputLink" href="#">Click here to go to your website!</a>
    </div>
  </div>

  <!-- Hints -->
  <div class="challenge-hints">
    <div class="hints-header">
      <span class="hints-header-title">// Progressive Hints</span>
      <button class="hint-btn" id="hint1Btn">Hint 1</button>
    </div>
    <div class="hint-block" id="hint1">
      <span class="hint-label">hint 1 / 3</span>
      <p>The filter blocks HTML tag injection, but the <code>href</code> attribute accepts more than just <code>https://</code> URLs. Browsers support multiple URI schemes — one of them executes JavaScript directly.</p>
      <button class="hint-btn" style="margin-top:0.6rem" id="hint2Btn">Hint 2</button>
    </div>
    <div class="hint-block" id="hint2">
      <span class="hint-label">hint 2 / 3</span>
      <p>The scheme you're looking for starts with <code>javascript:</code>. Anything after the colon is evaluated as JavaScript when the link is clicked. No angle brackets needed.</p>
      <button class="hint-btn" style="margin-top:0.6rem" id="hint3Btn">Reveal Answer</button>
    </div>
    <div class="hint-block" id="hint3">
      <span class="hint-label">answer</span>
      <p>Enter the following as your URL, then click the link:<br>
      <code>javascript:alert(1)</code><br><br>
      The browser will execute the expression after <code>javascript:</code> in the page context, bypassing all HTML-based filters.</p>
    </div>
  </div>

  <!-- Nav -->
  <div class="challenge-nav">
    <a href="/hack/reflected-xss-one.html">← Previous Challenge</a>
    <a href="/hack/dom-xss.html" class="next-challenge">Next Challenge →</a>
  </div>

</div>

<script>
(function() {
    var _alert = window.alert;
    window.alert = function(msg) {
        _alert.call(window, msg);
        localStorage.setItem('hack-solved-xss2', 'true');
        document.getElementById('successBanner').classList.add('visible');
    };

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

    document.getElementById('submitUrl').addEventListener('click', function() {
        var url = document.getElementById('urlInput').value;
        url = url.replaceAll('<','').replaceAll('>','').replaceAll('"','');
        document.getElementById('outputLink').href = url;
    });

    if (localStorage.getItem('hack-solved-xss2') === 'true') {
        document.getElementById('successBanner').classList.add('visible');
    }
})();
</script>

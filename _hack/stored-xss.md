---
layout: default
title: "Challenge 4 — Stored XSS (Comment Board)"
back_url: /hack/
back_label: "← Hack Lab"
---

<div class="challenge-wrap">

  <!-- Header -->
  <div class="challenge-header">
    <span class="hack-badge hack-badge-hard">Hard</span>
    <h1 class="challenge-title">Challenge 4 — Stored XSS (Comment Board)</h1>
  </div>

  <!-- Briefing -->
  <div class="challenge-briefing">
    <h3>// Mission Briefing</h3>
    <p>
      Stored XSS is the most dangerous variant. Your payload is <em>persisted</em> — in this case to
      <code>localStorage</code> — and rendered unescaped every time the page loads. Any visitor (or
      future page load) will trigger your code automatically, with no further interaction required.
    </p>
    <p>
      The comment board below accepts a username and message. Both are stored raw and rendered via
      <code>innerHTML</code> on page load. There is no sanitisation on either field.
    </p>
    <p class="challenge-objective">Objective: post a comment containing a payload that triggers <code>alert(1)</code> on page load.</p>
  </div>

  <!-- Vulnerable code viewer -->
  <div class="challenge-code-viewer">
    <div class="code-viewer-bar">
      <span class="code-viewer-dot cvd-red"></span>
      <span class="code-viewer-dot cvd-yellow"></span>
      <span class="code-viewer-dot cvd-green"></span>
      <span>// vulnerable snippet</span>
    </div>
    <pre><code>// On page load — render stored comments
var stored = JSON.parse(localStorage.getItem('xss4-comments') || '[]');
stored.forEach(function(c) {
    var div = document.createElement('div');
    div.className = 'comment-entry';
    // 🔴 sink: raw innerHTML from localStorage — no escaping
    div.innerHTML = '&lt;span class="comment-user"&gt;' + c.user
                  + ':&lt;/span&gt; ' + c.msg;
    board.appendChild(div);
});

// On post
function postComment() {
    var user = userInput.value;
    var msg  = msgInput.value;
    stored.push({ user: user, msg: msg }); // stored raw — no sanitisation
    localStorage.setItem('xss4-comments', JSON.stringify(stored));
    location.reload();
}</code></pre>
  </div>

  <!-- Success banner -->
  <div class="challenge-success" id="successBanner">
    <span class="challenge-success-icon">🎉</span>
    <h3>Challenge Solved!</h3>
    <p>Your payload survived a page reload and fired automatically — that's Stored XSS in action. The most persistent and dangerous form.</p>
  </div>

  <!-- Playground -->
  <div class="challenge-playground">
    <span class="playground-label">// Comment Board</span>
    <div class="comment-board" id="commentBoard">
      <p class="comment-empty" id="emptyMsg">No comments yet. Be the first!</p>
    </div>
    <div class="playground-row" style="margin-top:0.8rem">
      <input type="text" class="playground-input" id="userInput" placeholder="Username" style="max-width:180px">
      <input type="text" class="playground-input" id="msgInput" placeholder="Your message (or payload)...">
      <button class="playground-btn" id="postBtn">Post</button>
    </div>
    <button class="playground-btn" id="clearBtn" style="background:transparent;border:1px solid rgba(239,68,68,0.4);color:#ef4444;margin-top:0.5rem;font-size:0.7rem;">
      Clear All Comments
    </button>
  </div>

  <!-- Hints -->
  <div class="challenge-hints">
    <div class="hints-header">
      <span class="hints-header-title">// Progressive Hints</span>
      <button class="hint-btn" id="hint1Btn">Hint 1</button>
    </div>
    <div class="hint-block" id="hint1">
      <span class="hint-label">hint 1 / 3</span>
      <p>Unlike the previous challenges, this payload must survive being serialised to JSON and back. Special HTML characters are not escaped by <code>JSON.stringify</code>, so any HTML you inject will be preserved in storage and re-injected into <code>innerHTML</code> on the next load.</p>
      <button class="hint-btn" style="margin-top:0.6rem" id="hint2Btn">Hint 2</button>
    </div>
    <div class="hint-block" id="hint2">
      <span class="hint-label">hint 2 / 3</span>
      <p>You can inject into either the <strong>username</strong> or the <strong>message</strong> field — or both. A tag that executes JavaScript without requiring user interaction (e.g. an <code>&lt;img&gt;</code> with <code>onerror</code>) will fire immediately when the page renders the board.</p>
      <button class="hint-btn" style="margin-top:0.6rem" id="hint3Btn">Reveal Answer</button>
    </div>
    <div class="hint-block" id="hint3">
      <span class="hint-label">answer</span>
      <p>Post a comment with any username and this as the message:<br>
      <code>&lt;img src=x onerror=alert(1)&gt;</code><br><br>
      On the next load (or after posting), the payload is pulled from <code>localStorage</code> and injected raw. The <code>onerror</code> fires instantly. Use the "Clear All Comments" button to reset the board once you're done.</p>
    </div>
  </div>

  <!-- Nav -->
  <div class="challenge-nav">
    <a href="/hack/dom-xss.html">← Previous Challenge</a>
    <a href="/hack/" class="next-challenge">Back to Lab ↩</a>
  </div>

</div>

<script>
(function() {
    var STORAGE_KEY = 'xss4-comments';
    var board = document.getElementById('commentBoard');
    var emptyMsg = document.getElementById('emptyMsg');

    var _alert = window.alert;
    window.alert = function(msg) {
        _alert.call(window, msg);
        localStorage.setItem('hack-solved-xss4', 'true');
        document.getElementById('successBanner').classList.add('visible');
    };

    function renderComments() {
        var stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        // Remove all existing comment entries
        var existing = board.querySelectorAll('.comment-entry');
        existing.forEach(function(el) { el.remove(); });

        if (stored.length === 0) {
            emptyMsg.style.display = '';
            return;
        }
        emptyMsg.style.display = 'none';

        stored.forEach(function(c) {
            var div = document.createElement('div');
            div.className = 'comment-entry';
            // Intentionally vulnerable — no sanitisation
            div.innerHTML = '<span class="comment-user">' + c.user + ':</span> ' + c.msg;
            board.appendChild(div);
        });
    }

    renderComments();

    document.getElementById('postBtn').addEventListener('click', function() {
        var user = document.getElementById('userInput').value || 'Anonymous';
        var msg  = document.getElementById('msgInput').value;
        if (!msg.trim()) return;
        var stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        stored.push({ user: user, msg: msg });
        localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
        document.getElementById('userInput').value = '';
        document.getElementById('msgInput').value  = '';
        renderComments();
    });

    document.getElementById('clearBtn').addEventListener('click', function() {
        localStorage.removeItem(STORAGE_KEY);
        renderComments();
    });

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

    if (localStorage.getItem('hack-solved-xss4') === 'true') {
        document.getElementById('successBanner').classList.add('visible');
    }
})();
</script>

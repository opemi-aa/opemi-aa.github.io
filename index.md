---
layout: default
title: Home
---

<!-- ═══════════════════════════════════════════
     HERO
════════════════════════════════════════════ -->
<section class="hero animate-on-scroll">
  <div class="hero-content">
    <div class="hero-badge">// CYBERSECURITY BLOG</div>
    <h1 class="hero-name">Opeyemi Ariyo</h1>
    <div class="hero-alias">&lt;the.opemi.aa&gt;</div>
    <div class="role-pills">
      <span class="role-pill">Red Teamer</span>
      <span class="role-pill pill-secondary">Bug Bounty</span>
      <span class="role-pill">CTF Player</span>
    </div>
    <div class="hero-cta">
      <a href="/posts/VulnHub/" class="hp-btn hp-btn-primary">View Writeups ↗</a>
      <a href="#about"         class="hp-btn hp-btn-outline">About Me ↓</a>
    </div>
  </div>
</section>

<!-- ═══════════════════════════════════════════
     STATS BAR
════════════════════════════════════════════ -->
<section class="stats-bar animate-on-scroll">
  <div class="stat-item">
    <span class="stat-num">{{ site.posts | size }}</span>
    <span class="stat-label">Blog Posts</span>
  </div>
  <div class="stat-divider"></div>
  <div class="stat-item">
    <span class="stat-num">5+</span>
    <span class="stat-label">CTF Writeups</span>
  </div>
  <div class="stat-divider"></div>
  <div class="stat-item">
    <span class="stat-num">1</span>
    <span class="stat-label">Certification</span>
  </div>
  <div class="stat-divider"></div>
  <div class="stat-item">
    <span class="stat-num">4</span>
    <span class="stat-label">Games Built</span>
  </div>
</section>

<!-- ═══════════════════════════════════════════
     ABOUT / PROFILE
════════════════════════════════════════════ -->
<section id="about" class="profile-section animate-on-scroll">
  <div class="section-label">// ABOUT</div>
  <div class="profile-card">
    <div class="profile-avatar-wrap">
      <img src="images/avatar.jpg" alt="Opeyemi Ariyo" class="profile-avatar">
    </div>
    <div class="profile-info">
      <h2 class="profile-name">Opeyemi Ariyo</h2>
      <div class="profile-alias">the.opemi.aa</div>
      <p class="profile-bio">
        Cybersecurity professional focused on Red Teaming, Bug Bounty hunting, and CTF
        competitions. On a mission to uncover vulnerabilities, build knowledge, and
        document the journey — one writeup at a time.
      </p>
      <div class="profile-rows">
        <div class="profile-row">
          <span class="profile-key">Speciality</span>
          <span class="profile-val">Red Teaming · Bug Bounty · CTFs</span>
        </div>
        <div class="profile-row">
          <span class="profile-key">Certification</span>
          <span class="profile-val">
            <a href="/assets/opeyemi%20ariyo%20red%20team%20analyst.pdf" target="_blank" class="cert-badge">
              ★ CRTA
            </a>
          </span>
        </div>
      </div>
      <div class="social-links">
        <a href="https://github.com/opemi-aa/" target="_blank" class="social-btn">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/></svg>
          GitHub
        </a>
        <a href="https://x.com/opemi_aa" target="_blank" class="social-btn">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M12.6.75h2.454l-5.36 6.142L16 15.25h-4.937l-3.867-5.07-4.425 5.07H.316l5.733-6.57L0 .75h5.063l3.495 4.633L12.601.75Zm-.86 13.028h1.36L4.323 2.145H2.865z"/></svg>
          Twitter / X
        </a>
      </div>
    </div>
  </div>
</section>

<!-- ═══════════════════════════════════════════
     FOCUS AREAS
════════════════════════════════════════════ -->
<section class="focus-section animate-on-scroll">
  <div class="section-label">// WHAT I WRITE ABOUT</div>
  <div class="focus-grid">

    <a href="/posts/awscloud/" class="focus-card">
      <div class="focus-icon">☁️</div>
      <div class="focus-title">AWS Cloud</div>
      <div class="focus-desc">Cloud security, IAM abuse, and AWS attack/defend scenarios.</div>
      <div class="focus-arrow">→</div>
    </a>

    <a href="/posts/VulnHub/" class="focus-card">
      <div class="focus-icon">💻</div>
      <div class="focus-title">VulnHub</div>
      <div class="focus-desc">Step-by-step machine writeups covering enumeration to root.</div>
      <div class="focus-arrow">→</div>
    </a>

    <a href="/posts/pwnedlabs/" class="focus-card">
      <div class="focus-icon">🔓</div>
      <div class="focus-title">PwnedLabs</div>
      <div class="focus-desc">Cloud-focused attack labs and walkthroughs.</div>
      <div class="focus-arrow">→</div>
    </a>

    <a href="/posts/picoCTF/" class="focus-card">
      <div class="focus-icon">🚩</div>
      <div class="focus-title">picoCTF</div>
      <div class="focus-desc">Challenge solutions covering web, binary, crypto, and forensics.</div>
      <div class="focus-arrow">→</div>
    </a>

    <a href="/posts/Articles/" class="focus-card">
      <div class="focus-icon">📝</div>
      <div class="focus-title">Articles</div>
      <div class="focus-desc">Security research, tool reviews, and learning notes.</div>
      <div class="focus-arrow">→</div>
    </a>

    <a href="/hack/" class="focus-card focus-card-accent">
      <div class="focus-icon">⚡</div>
      <div class="focus-title">Hack Lab</div>
      <div class="focus-desc">Live XSS demos and interactive exploit playground.</div>
      <div class="focus-arrow">→</div>
    </a>

  </div>
</section>

<!-- ═══════════════════════════════════════════
     RECENT POSTS
════════════════════════════════════════════ -->
<section class="recent-section animate-on-scroll">
  <div class="section-label">// RECENT POSTS</div>
  <div class="post-card-grid">
    {% for post in site.posts limit:4 %}
    <a href="{{ post.url }}" class="post-card">
      <div class="post-card-meta">
        {% if post.categories[0] %}
        <span class="post-cat-badge">{{ post.categories[0] }}</span>
        {% endif %}
        <span class="post-date">{{ post.date | date: "%b %d, %Y" }}</span>
      </div>
      <div class="post-card-title">{{ post.title }}</div>
      <div class="post-card-arrow">→</div>
    </a>
    {% endfor %}
  </div>
  <div class="view-all-wrap">
    <a href="/posts/Articles/" class="hp-btn hp-btn-outline">View All Posts →</a>
  </div>
</section>

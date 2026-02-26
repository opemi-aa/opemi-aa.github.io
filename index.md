---
layout: default
title: Home
---

<!-- ═══════════════════════════════════════════
     HERO
════════════════════════════════════════════ -->
<section class="hero animate-on-scroll">
  <div class="hero-photo-wrap">
    <img src="/professional.jpg" alt="Opeyemi Ariyo" class="hero-photo">
  </div>
  <div class="hero-content">
    <div class="hero-badge">// CYBERSECURITY BLOG</div>
    <h1 class="hero-name">Opeyemi Ariyo</h1>
    <div class="hero-alias">&lt;the.opemi.aa&gt;</div>
    <div class="role-pills">
      <span class="role-pill">Red Teamer</span>
      <span class="role-pill pill-secondary">Bug Bounty</span>
      <span class="role-pill">CTF Player</span>
      <span class="role-pill pill-ai">AI Automation Engineer</span>
    </div>
    <div class="hero-cta">
      <a href="/writeups/" class="hp-btn hp-btn-primary">View Writeups ↗</a>
      <a href="/ai-portfolio.html" class="hp-btn hp-btn-ai">🤖 AI Portfolio ↗</a>
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
    <span class="stat-num">5</span>
    <span class="stat-label">Certifications</span>
  </div>
  <div class="stat-divider"></div>
  <div class="stat-item">
    <span class="stat-num">4</span>
    <span class="stat-label">Games Built</span>
  </div>
  <div class="stat-divider"></div>
  <div class="stat-item">
    <span class="stat-num">3+</span>
    <span class="stat-label">Labs</span>
  </div>
</section>

<!-- ═══════════════════════════════════════════
     SECTIONS HUB
════════════════════════════════════════════ -->
<section class="hub-section animate-on-scroll">
  <div class="section-label">// EXPLORE</div>
  <div class="hub-grid">

    <a href="/writeups/" class="hub-card hub-card-writeups">
      <div class="hub-card-top">
        <span class="hub-card-badge">[ WR ] Writeups</span>
        <span class="hub-card-dot"></span>
      </div>
      <div class="hub-card-icon">📄</div>
      <div class="hub-card-title">Writeups</div>
      <div class="hub-card-desc">CTF challenge solutions, machine walkthroughs, and security research across VulnHub, picoCTF, AWS Cloud, and PwnedLabs — documented step by step.</div>
      <div class="hub-card-footer">
        <span class="hub-card-tag">{{ site.posts | size }} posts</span>
        <span class="hub-card-enter">Enter →</span>
      </div>
    </a>

    <a href="/soc-lab/" class="hub-card hub-card-soc">
      <div class="hub-card-top">
        <span class="hub-card-badge">[ SOC ] Lab</span>
        <span class="hub-card-dot"></span>
      </div>
      <div class="hub-card-icon">🛡️</div>
      <div class="hub-card-title">SOC Lab</div>
      <div class="hub-card-desc">Live defensive environments — Splunk, Wazuh, OPNsense firewall, and GoPhish phishing simulation.</div>
      <div class="hub-card-footer">
        <span class="hub-card-tag">4 environments</span>
        <span class="hub-card-enter">Enter →</span>
      </div>
    </a>

    <a href="/tools-methodology.html" class="hub-card hub-card-tools">
      <div class="hub-card-top">
        <span class="hub-card-badge">[ TM ] Reference</span>
        <span class="hub-card-dot"></span>
      </div>
      <div class="hub-card-icon">⚡</div>
      <div class="hub-card-title">Tools &amp; Methods</div>
      <div class="hub-card-desc">Full pentest arsenal — web app, cloud, Active Directory, network attacks, cheat sheets and methodology.</div>
      <div class="hub-card-footer">
        <span class="hub-card-tag">6 sections · 50+ tools</span>
        <span class="hub-card-enter">Enter →</span>
      </div>
    </a>

    <a href="/hack/" class="hub-card hub-card-hack">
      <div class="hub-card-top">
        <span class="hub-card-badge">[ HL ] Offensive</span>
        <span class="hub-card-dot"></span>
      </div>
      <div class="hub-card-icon">💀</div>
      <div class="hub-card-title">Hack Lab</div>
      <div class="hub-card-desc">Hands-on exploitation labs, attack scenarios, and red team walkthroughs in a controlled environment.</div>
      <div class="hub-card-footer">
        <span class="hub-card-tag">Active</span>
        <span class="hub-card-enter">Enter →</span>
      </div>
    </a>

    <a href="/games/" class="hub-card hub-card-games">
      <div class="hub-card-top">
        <span class="hub-card-badge">[ GM ] Games</span>
        <span class="hub-card-dot"></span>
      </div>
      <div class="hub-card-icon">🎮</div>
      <div class="hub-card-title">Games</div>
      <div class="hub-card-desc">Canvas-based games built from scratch — Space War, Car Racing, Snake, Ping Pong. A creative break from hacking.</div>
      <div class="hub-card-footer">
        <span class="hub-card-tag">4 games</span>
        <span class="hub-card-enter">Enter →</span>
      </div>
    </a>

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
          <span class="profile-key">Certifications</span>
          <span class="profile-val">
            <a href="#certs" class="cert-badge">★ 5 Certs — view below</a>
          </span>
        </div>
      </div>
      <div class="social-links">
        <a href="https://github.com/opemi-aa/" target="_blank" class="social-btn">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/></svg>
          GitHub
        </a>
        <a href="https://www.linkedin.com/in/opeyemi-ariyo-73037924b/" target="_blank" class="social-btn">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M0 1.146C0 .513.526 0 1.175 0h13.65C15.474 0 16 .513 16 1.146v13.708c0 .633-.526 1.146-1.175 1.146H1.175C.526 16 0 15.487 0 14.854zm4.943 12.248V6.169H2.542v7.225zm-1.2-8.212c.837 0 1.358-.554 1.358-1.248-.015-.709-.52-1.248-1.342-1.248S2.4 3.226 2.4 3.934c0 .694.521 1.248 1.327 1.248zm4.908 8.212V9.359c0-.216.016-.432.08-.586.173-.431.568-.878 1.232-.878.869 0 1.216.662 1.216 1.634v3.865h2.401V9.25c0-2.22-1.184-3.252-2.764-3.252-1.274 0-1.845.7-2.165 1.193v.025h-.016l.016-.025V6.169h-2.4c.03.678 0 7.225 0 7.225z"/></svg>
          LinkedIn
        </a>
        <a href="https://x.com/opemi_aa" target="_blank" class="social-btn">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M12.6.75h2.454l-5.36 6.142L16 15.25h-4.937l-3.867-5.07-4.425 5.07H.316l5.733-6.57L0 .75h5.063l3.495 4.633L12.601.75Zm-.86 13.028h1.36L4.323 2.145H2.865z"/></svg>
          Twitter / X
        </a>
        <a href="https://www.youtube.com/@the.opemi_aa" target="_blank" class="social-btn">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M8.051 1.999h.089c.822.003 4.987.033 6.11.335a2.01 2.01 0 0 1 1.415 1.42c.101.38.172.883.22 1.402l.01.104.022.26.008.104c.065.914.073 1.77.074 1.957v.075c-.001.194-.01 1.108-.082 2.06l-.008.105-.009.104c-.05.572-.124 1.14-.235 1.558a2.007 2.007 0 0 1-1.415 1.42c-1.16.312-5.569.334-6.18.335h-.142c-.309 0-1.587-.006-2.927-.052l-.17-.006-.087-.004-.171-.007-.171-.007c-1.11-.049-2.167-.128-2.654-.26a2.007 2.007 0 0 1-1.415-1.419c-.111-.417-.185-.986-.235-1.558L.09 9.82l-.008-.104A31.4 31.4 0 0 1 0 7.68v-.123c.002-.215.01-.958.064-1.778l.007-.103.003-.052.008-.104.022-.26.01-.104c.048-.519.119-1.023.22-1.402a2.007 2.007 0 0 1 1.415-1.42c.487-.13 1.544-.21 2.654-.26l.17-.007.172-.006.086-.003.171-.007A99.788 99.788 0 0 1 7.858 2h.193zM6.4 5.209v4.818l4.157-2.408z"/></svg>
          YouTube
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

    <a href="/writeups/" class="focus-card">
      <div class="focus-icon">☁️</div>
      <div class="focus-title">AWS Cloud</div>
      <div class="focus-desc">Cloud security, IAM abuse, and AWS attack/defend scenarios.</div>
      <div class="focus-arrow">→</div>
    </a>

    <a href="/writeups/" class="focus-card">
      <div class="focus-icon">💻</div>
      <div class="focus-title">VulnHub</div>
      <div class="focus-desc">Step-by-step machine writeups covering enumeration to root.</div>
      <div class="focus-arrow">→</div>
    </a>

    <a href="/writeups/" class="focus-card">
      <div class="focus-icon">🔓</div>
      <div class="focus-title">PwnedLabs</div>
      <div class="focus-desc">Cloud-focused attack labs and walkthroughs.</div>
      <div class="focus-arrow">→</div>
    </a>

    <a href="/writeups/" class="focus-card">
      <div class="focus-icon">🚩</div>
      <div class="focus-title">picoCTF</div>
      <div class="focus-desc">Challenge solutions covering web, binary, crypto, and forensics.</div>
      <div class="focus-arrow">→</div>
    </a>

    <a href="/writeups/" class="focus-card">
      <div class="focus-icon">📝</div>
      <div class="focus-title">Articles</div>
      <div class="focus-desc">Security research, tool reviews, and learning notes.</div>
      <div class="focus-arrow">→</div>
    </a>

  </div>
</section>

<!-- ═══════════════════════════════════════════
     CERTIFICATIONS
════════════════════════════════════════════ -->
<section class="certs-section" id="certs">
  <div class="section-label">// CERTIFICATIONS</div>
  <div class="certs-grid">

    <a href="/assets/opeyemi%20ariyo%20red%20team%20analyst.pdf" target="_blank" class="cert-card">
      <span class="cert-card-issuer-badge cert-issuer-alteredsec">Cyberwarfare Labs</span>
      <div class="cert-card-name">CRTA</div>
      <div class="cert-card-full">Certified Red Team Analyst</div>
      <div class="cert-card-year">2025</div>
    </a>

    <a href="/au%20certs/ASCPExam20251020-31-1zfjiz.pdf" target="_blank" class="cert-card">
      <span class="cert-card-issuer-badge cert-issuer-apisec">APIsec University</span>
      <div class="cert-card-name">ASCP</div>
      <div class="cert-card-full">API Security Certified Professional</div>
      <div class="cert-card-year">2025</div>
    </a>

    <a href="/au%20certs/ACPExam20250827-6-ke8wqb.pdf" target="_blank" class="cert-card">
      <span class="cert-card-issuer-badge cert-issuer-apisec">APIsec University</span>
      <div class="cert-card-name">ACP</div>
      <div class="cert-card-full">API Certified Professional</div>
      <div class="cert-card-year">2025</div>
    </a>

    <a href="/au%20certs/CASAExam20250827-7-fgdmo9.pdf" target="_blank" class="cert-card">
      <span class="cert-card-issuer-badge cert-issuer-apisec">APIsec University</span>
      <div class="cert-card-name">CASA</div>
      <div class="cert-card-full">Certified API Security Analyst</div>
      <div class="cert-card-year">2025</div>
    </a>

    <a href="/au%20certs/APIsecUniversityAmbassador_Badge20250827-32-9lkhsk.pdf" target="_blank" class="cert-card">
      <span class="cert-card-issuer-badge cert-issuer-apisec">APIsec University</span>
      <div class="cert-card-name">Ambassador</div>
      <div class="cert-card-full">APIsec University Ambassador</div>
      <div class="cert-card-year">2025</div>
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
    <a href="/writeups/" class="hp-btn hp-btn-outline">View All Posts →</a>
  </div>
</section>

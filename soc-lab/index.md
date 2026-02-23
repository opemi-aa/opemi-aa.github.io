---
layout: default
title: SOC Lab
---

<section class="soc-hero animate-on-scroll">
  <div class="section-label">// SOC LAB</div>
  <h1 class="soc-title">Home Security Operations Centre</h1>
  <p class="soc-subtitle">
    A personal lab environment built to simulate real-world threat detection, incident response,
    and network security monitoring. Four environments, each with a distinct focus.
  </p>
</section>

<!-- ═══════════════════════════════════════════
     LAB ENVIRONMENTS
════════════════════════════════════════════ -->
<section class="soc-section animate-on-scroll">
  <div class="section-label">// ENVIRONMENTS</div>
  <div class="soc-lab-grid">

    <div class="soc-lab-card">
      <div class="soc-lab-header">
        <span class="soc-lab-icon">📊</span>
        <div>
          <div class="soc-lab-name">Splunk</div>
          <span class="soc-cat-badge soc-badge-siem">SIEM</span>
        </div>
      </div>
      <p class="soc-lab-desc">
        Splunk Enterprise deployed for centralised log ingestion, search, and dashboarding.
        Used to build detection rules, investigate alerts, and monitor endpoint/network telemetry.
      </p>
      <div class="soc-lab-status">
        <span class="soc-status-dot soc-status-active"></span>
        <span class="soc-status-label">Active</span>
        <span class="soc-detail-badge">Details coming soon</span>
      </div>
    </div>

    <div class="soc-lab-card">
      <div class="soc-lab-header">
        <span class="soc-lab-icon">🛡️</span>
        <div>
          <div class="soc-lab-name">Wazuh</div>
          <span class="soc-cat-badge soc-badge-xdr">XDR / SIEM</span>
        </div>
      </div>
      <p class="soc-lab-desc">
        Open-source XDR and SIEM platform providing host-based intrusion detection, file integrity
        monitoring, vulnerability assessment, and compliance reporting across lab endpoints.
      </p>
      <div class="soc-lab-status">
        <span class="soc-status-dot soc-status-active"></span>
        <span class="soc-status-label">Active</span>
        <span class="soc-detail-badge">Details coming soon</span>
      </div>
    </div>

    <div class="soc-lab-card">
      <div class="soc-lab-header">
        <span class="soc-lab-icon">🔥</span>
        <div>
          <div class="soc-lab-name">OPNsense</div>
          <span class="soc-cat-badge soc-badge-fw">Firewall</span>
        </div>
      </div>
      <p class="soc-lab-desc">
        OPNsense firewall and network security platform managing traffic segmentation, IDS/IPS
        rules, and perimeter controls across the lab network. Gateway for all lab traffic analysis.
      </p>
      <div class="soc-lab-status">
        <span class="soc-status-dot soc-status-active"></span>
        <span class="soc-status-label">Active</span>
        <span class="soc-detail-badge">Details coming soon</span>
      </div>
    </div>

    <div class="soc-lab-card">
      <div class="soc-lab-header">
        <span class="soc-lab-icon">🎣</span>
        <div>
          <div class="soc-lab-name">GoPhish</div>
          <span class="soc-cat-badge soc-badge-red">Red Team</span>
        </div>
      </div>
      <p class="soc-lab-desc">
        Phishing simulation campaign framework used to test awareness, track click rates, harvest
        credentials in a controlled environment, and feed results back into the SIEM for detection tuning.
      </p>
      <div class="soc-lab-status">
        <span class="soc-status-dot soc-status-done"></span>
        <span class="soc-status-label">Campaign complete</span>
        <span class="soc-detail-badge">Details coming soon</span>
      </div>
    </div>

  </div>
</section>

<!-- ═══════════════════════════════════════════
     NETWORK TOPOLOGY
════════════════════════════════════════════ -->
<section class="soc-section animate-on-scroll">
  <div class="section-label">// NETWORK TOPOLOGY</div>
  <div class="soc-topology-placeholder">
    <div class="soc-topology-icon">🗺️</div>
    <div class="soc-topology-label">Network diagram coming soon</div>
    <p class="soc-topology-hint">A visual map of the lab — VMs, network segments, traffic flows, and tool placement.</p>
  </div>
</section>

<!-- ═══════════════════════════════════════════
     RELATED WRITEUPS
════════════════════════════════════════════ -->
<section class="soc-section animate-on-scroll">
  <div class="section-label">// RELATED WRITEUPS</div>
  {% assign has_soc = false %}
  {% for post in site.posts %}
    {% if post.categories contains 'soc' or post.categories contains 'SOC' or post.categories contains 'splunk' or post.categories contains 'wazuh' %}
      {% assign has_soc = true %}
    {% endif %}
  {% endfor %}
  {% if has_soc %}
  <div class="post-card-grid">
    {% for post in site.posts %}
      {% if post.categories contains 'soc' or post.categories contains 'SOC' or post.categories contains 'splunk' or post.categories contains 'wazuh' %}
      <a href="{{ post.url }}" class="post-card">
        <div class="post-card-meta">
          {% if post.categories[0] %}<span class="post-cat-badge">{{ post.categories[0] }}</span>{% endif %}
          <span class="post-date">{{ post.date | date: "%b %d, %Y" }}</span>
        </div>
        <div class="post-card-title">{{ post.title }}</div>
        <div class="post-card-arrow">→</div>
      </a>
      {% endif %}
    {% endfor %}
  </div>
  {% else %}
  <p class="writeup-empty" style="text-align:center; padding: 2rem 0;">
    SOC Lab writeups are on the way — documenting the setups and detections built here.
  </p>
  {% endif %}
</section>

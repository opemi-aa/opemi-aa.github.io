---
layout: default
title: Home
---

<h2 class="mume-header" id="mainindexhtml-nbspnbsp-contactcontacthtml"><a href="/index.html">Main</a>&#xA0;&#xA0;&#xA0;<a href="/posts/awscloud/index.html">awscloud</a>&#xA0;&#xA0;&#xA0;<a href="/posts/VulnHub/index.html">VulnHub</a>&#xA0;&#xA0;&#xA0;<a href="/posts/pwnedlabs/index.html">PwnedLabs</a>&#xA0;&#xA0;&#xA0;<a href="/posts/picoCTF/index.html">picoCTF</a>&#xA0;&#xA0;&#xA0;<a href="/posts/Articles/index.html">Articles</a></h2>

* * *
### Welcome To My Cyber Security Blog, 093m1
* * *

"Hey there 👋, and welcome to my little corner of the web! I’m the.opemi.aa — a cybersecurity enthusiast on a mission to uncover the fascinating world of hacking. Here, you’ll find tips, tricks, write-ups, and insights into everything I’m learning about ethical hacking and cybersecurity. Stick around, and let’s explore the art of securing the digital world together. 😉  

<hr>
<br>
<img style="padding-right: 30px;" align="left"  width="500" height="300" src="images/avatar.jpg">
<br>
<p><strong>Name :</strong> <a href="#">Opeyemi Ariyo</a></p>
<p><strong>Known as :</strong> <a href="#">the.opemi.aa</a></p>
<p><strong>What Do I Do :</strong> <a href="#">Red teaming, Bug Bounty and CTFs</a></p>
<p><strong>GitHub :</strong> <a href="https://github.com/opemi-aa/">github.com/opemi-aa</a></p>
<p><strong>Twitter :</strong> <a href="https://x.com/opemi_aa">twitter.com/opemi_aa</a></p>
<p><strong>Certifications :</strong></p>
<ul>
  <li><a href="/assets/opeyemi%20ariyo%20red%20team%20analyst.pdf">Certified Red Team Analyst (CRTA)</a></li>
</ul>
<br clear="left">
<br clear="left">


* * *
### **Posts**
* * *

<ul>
  {% for post in site.posts %}
    <li>
      <a href="{{ post.url }}">{{ post.title }}</a> - {{ post.date | date: "%B %d, %Y" }}
    </li>
  {% endfor %}
</ul>
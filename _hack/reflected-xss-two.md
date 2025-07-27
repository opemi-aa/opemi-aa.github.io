---
layout: default
title: Reflected XSS Challenge Two
---

<div class="course-frame">

# Reflected XSS Challenge Two

This challenge involves XSS in an `href` attribute. Your input will be used as a URL. Can you break out of the attribute and execute JavaScript?

## Challenge:

Try to execute JavaScript when the link is clicked.

<div class="xss-demo-container">
    <label for="urlInput">Enter a URL:</label>
    <input type="text" id="urlInput" placeholder="https://example.com">
    <button id="submitUrl">Go to URL</button>
</div>

<div class="xss-output-container">
    <h1>Welcome Everyone!</h1>
    <a id="outputLink" href="#">Click here to go to your website!!</a>
</div>

<script>
    document.addEventListener('DOMContentLoaded', function() {
        const urlInput = document.getElementById('urlInput');
        const submitButton = document.getElementById('submitUrl');
        const outputLink = document.getElementById('outputLink');

        submitButton.addEventListener('click', function() {
            let url = urlInput.value; // Get user input

            // Simulate server-side sanitization (as in your original demo.js)
            // This is where the vulnerability lies if bypassable
            url = url.replaceAll("<","").replaceAll(">","").replaceAll('"\\',"");

            // Reflect the input directly into the DOM's href attribute
            outputLink.href = url;
        });
    });
</script>

</div>
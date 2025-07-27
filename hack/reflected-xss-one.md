---
layout: default
title: Reflected XSS Challenge One
---

<div class="course-frame">

# Reflected XSS Challenge One

This challenge demonstrates a basic reflected XSS vulnerability. Your input will be directly reflected on the page. Can you execute JavaScript?

## Challenge:

Try to make an `alert()` box pop up.

<div class="xss-demo-container">
    <label for="nameInput">Enter your name:</label>
    <input type="text" id="nameInput" placeholder="Your name here...">
    <button id="submitName">Submit</button>
</div>

<div class="xss-output-container">
    <h2>Welcome <span id="outputName"></span></h2>
</div>

<script>
    document.addEventListener('DOMContentLoaded', function() {
        const nameInput = document.getElementById('nameInput');
        const submitButton = document.getElementById('submitName');
        const outputSpan = document.getElementById('outputName');

        submitButton.addEventListener('click', function() {
            let name = nameInput.value; // Get user input

            // Simulate server-side sanitization (as in your original demo.js)
            // This is where the vulnerability lies if bypassable
            name = name.replaceAll("<","").replaceAll(">","");

            // Reflect the input directly into the DOM
            outputSpan.innerHTML = name;
        });
    });
</script>

</div>
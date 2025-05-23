// This script is loaded from same origin and will work with basic CSP
let timerCount = 60;
const timerElement = document.getElementById('timer');

function updateTimer() {
    timerCount--;
    timerElement.textContent = `Timer: ${timerCount}`;
    if (timerCount <= 0) {
        timerCount = 60;
    }
}

setInterval(updateTimer, 1000);

// Add event listeners properly (not using inline handlers)
document.getElementById('commentForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const username = document.getElementById('username').value;
    const comment = document.getElementById('comment').value;
    const commentsDiv = document.getElementById('comments');
    
    // Note: This still has XSS vulnerability in the innerHTML, but CSP will prevent script execution
    const commentHTML = `<div class="comment-item">
        <strong>${username}:</strong> ${comment}
    </div>`;
    
    commentsDiv.innerHTML += commentHTML;
    this.reset();
});

document.getElementById('crossOriginForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const data = document.getElementById('sensitiveData').value;
    
    fetch('/malicious/steal-data', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sensitiveData: data })
    })
    .then(response => response.json())
    .then(result => {
        document.getElementById('crossOriginResult').innerHTML = 
            `<div class="result-success">
                ⚠️ Data successfully sent to malicious domain: ${result.message}
            </div>`;
    })
    .catch(error => {
        document.getElementById('crossOriginResult').innerHTML = 
            `<div class="result-error">
                ❌ Cross-origin request failed: ${error.message}
            </div>`;
    });
});

// These functions will demonstrate CSP blocking
document.getElementById('externalScriptBtn').addEventListener('click', function() {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jquery/3.6.0/jquery.min.js';
    script.onload = () => alert('External script loaded successfully!');
    script.onerror = () => console.log('External script blocked by CSP');
    document.head.appendChild(script);
});

document.getElementById('imageXSSBtn').addEventListener('click', function() {
    // This will be blocked because inline event handlers are not allowed
    const img = document.createElement('img');
    img.src = 'nonexistent.jpg';
    // The onerror handler won't work due to CSP
    img.setAttribute('onerror', "alert('Image XSS executed!')");
    document.body.appendChild(img);
    
    setTimeout(() => {
        console.log('Image XSS attempt blocked by CSP');
    }, 1000);
});
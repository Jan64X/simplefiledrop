const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const fileLink = document.getElementById('fileLink');

// Update drop zone text to indicate paste support
dropZone.querySelector('p').textContent = 'Drag and drop files here, click to select, or paste (Ctrl+V)';

dropZone.addEventListener('click', () => fileInput.click());

dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('dragover');
});

dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('dragover');
});

dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('dragover');
    const files = e.dataTransfer.files;
    if (files.length) handleFile(files[0]);
});

fileInput.addEventListener('change', (e) => {
    if (e.target.files.length) handleFile(e.target.files[0]);
});

// Add paste event listener to the document
document.addEventListener('paste', (e) => {
    e.preventDefault();
    
    // Handle files from clipboard
    if (e.clipboardData.files.length > 0) {
        handleFile(e.clipboardData.files[0]);
        return;
    }

    // Handle images from clipboard (like screenshots)
    const items = e.clipboardData.items;
    for (const item of items) {
        if (item.type.startsWith('image/')) {
            const blob = item.getAsFile();
            const filename = `clipboard_image_${new Date().toISOString()}.png`;
            const file = new File([blob], filename, { type: 'image/png' });
            handleFile(file);
            return;
        }
    }
});

function copyToClipboard(text) {
    // Create a temporary input element
    const input = document.createElement('input');
    input.style.position = 'fixed';
    input.style.opacity = 0;
    input.value = text;
    document.body.appendChild(input);
    input.select();
    
    try {
        // Try to copy using the new async clipboard API first
        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(text).then(() => {
                showCopiedMessage();
            });
        } else {
            // Fallback to the old execCommand method
            document.execCommand('copy');
            showCopiedMessage();
        }
    } catch (err) {
        console.error('Failed to copy:', err);
    }
    
    document.body.removeChild(input);
}

function showCopiedMessage() {
    const message = document.createElement('div');
    message.textContent = 'Link copied to clipboard!';
    message.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: #333;
        color: white;
        padding: 10px 20px;
        border-radius: 5px;
        z-index: 1000;
        animation: fadeOut 2s forwards;
    `;
    
    document.body.appendChild(message);
    setTimeout(() => {
        document.body.removeChild(message);
    }, 2000);
}

// Add CSS animation for the copy message
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeOut {
        0% { opacity: 1; }
        70% { opacity: 1; }
        100% { opacity: 0; }
    }
`;
document.head.appendChild(style);

function handleFile(file) {
    const formData = new FormData();
    formData.append('file', file);

    fetch('/upload', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.url) {
            fileLink.style.display = 'block';
            fileLink.innerHTML = `File uploaded! URL: <a href="${data.url}">${data.url}</a>`;
            // Automatically copy the URL to clipboard
            copyToClipboard(data.url);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Upload failed. Please try again.');
    });
}

// DOM Elements
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const browseBtn = document.getElementById('browseBtn');
const previewSection = document.getElementById('previewSection');
const originalPreview = document.getElementById('originalPreview');
const convertedPreview = document.getElementById('convertedPreview');
const convertedPlaceholder = document.getElementById('convertedPlaceholder');
const originalInfo = document.getElementById('originalInfo');
const convertedInfo = document.getElementById('convertedInfo');
const originalDimensions = document.getElementById('originalDimensions');
const convertedDimensions = document.getElementById('convertedDimensions');
const formatSelect = document.getElementById('formatSelect');
const qualitySlider = document.getElementById('qualitySlider');
const qualityValue = document.getElementById('qualityValue');
const qualityControl = document.getElementById('qualityControl');
const convertBtn = document.getElementById('convertBtn');
const downloadBtn = document.getElementById('downloadBtn');
const resetBtn = document.getElementById('resetBtn');
const themeToggle = document.getElementById('themeToggle');
const loadingOverlay = document.getElementById('loadingOverlay');
const errorMessage = document.getElementById('errorMessage');

let currentFile = null;
let convertedBlob = null;

// Theme Management
function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
}

themeToggle.addEventListener('click', toggleTheme);
initTheme();

// Event Listeners
browseBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    fileInput.click();
});
fileInput.addEventListener('change', handleFileSelect);
uploadArea.addEventListener('click', (e) => {
    if (e.target !== browseBtn && !browseBtn.contains(e.target)) {
        fileInput.click();
    }
});

// Drag and Drop
uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.classList.add('dragover');
});

uploadArea.addEventListener('dragleave', () => {
    uploadArea.classList.remove('dragover');
});

uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        handleFile(files[0]);
    }
});

// Format change handler
formatSelect.addEventListener('change', () => {
    const selectedFormat = formatSelect.value;
    // Show quality control for JPEG and WebP
    if (selectedFormat === 'image/jpeg' || selectedFormat === 'image/webp') {
        qualityControl.style.display = 'flex';
    } else {
        qualityControl.style.display = 'none';
    }
    // Reset converted preview only if there was a converted image
    if (convertedBlob || convertedPreview.src) {
        convertedPreview.src = '';
        convertedPreview.style.display = 'none';
        if (convertedPlaceholder) {
            convertedPlaceholder.style.display = 'flex';
        }
        convertedInfo.textContent = '';
        convertedDimensions.textContent = '';
        downloadBtn.style.display = 'none';
        convertedBlob = null;
        // Reset button text
        if (convertBtn.querySelector('.btn-text')) {
            convertBtn.querySelector('.btn-text').textContent = 'Convert';
        }
    }
});

// Quality slider
qualitySlider.addEventListener('input', (e) => {
    qualityValue.textContent = e.target.value;
});

// Convert button
convertBtn.addEventListener('click', convertImage);

// Download button
downloadBtn.addEventListener('click', downloadImage);

// Reset button
resetBtn.addEventListener('click', resetConverter);

// File handling
function handleFileSelect(e) {
    const file = e.target.files[0];
    if (file) {
        handleFile(file);
    }
}

function showError(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
    setTimeout(() => {
        errorMessage.style.display = 'none';
    }, 5000);
}

function handleFile(file) {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/bmp', 'image/tiff'];
    const isValidType = file.type.startsWith('image/') || validTypes.includes(file.type);
    
    if (!isValidType) {
        showError('Please select a valid image file (JPG, PNG, WebP, GIF, BMP, or TIFF).');
        return;
    }

    currentFile = file;
    const reader = new FileReader();

    reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
            originalPreview.onerror = null;
            originalPreview.onload = null;
            originalPreview.src = e.target.result;
            originalInfo.textContent = `${file.name} (${formatFileSize(file.size)})`;
            originalDimensions.textContent = `${img.width} × ${img.height}`;
            previewSection.style.display = 'block';
            
            // Set default format based on file type
            const fileType = file.type;
            if (fileType === 'image/jpeg' || fileType === 'image/jpg') {
                formatSelect.value = 'image/png';
            } else if (fileType === 'image/png') {
                formatSelect.value = 'image/jpeg';
            } else {
                formatSelect.value = 'image/jpeg';
            }
            
            // Show/hide quality control
            formatSelect.dispatchEvent(new Event('change'));
            
            // Reset converted preview
            convertedPreview.src = '';
            convertedPreview.style.display = 'none';
            convertedPlaceholder.style.display = 'flex';
            convertedInfo.textContent = '';
            convertedDimensions.textContent = '';
            downloadBtn.style.display = 'none';
            convertedBlob = null;
        };
        
        img.onerror = () => {
            showError('Failed to load image. The file might be corrupted.');
        };
        
        img.src = e.target.result;
    };
    
    reader.onerror = () => {
        showError('Failed to read file. Please try again.');
    };

    reader.readAsDataURL(file);
}

function convertImage() {
    if (!currentFile) {
        showError('Please select an image first.');
        return;
    }

    if (!originalPreview.src) {
        showError('Please wait for the image to load.');
        return;
    }

    const selectedFormat = formatSelect.value;
    const quality = selectedFormat === 'image/jpeg' || selectedFormat === 'image/webp' 
        ? parseFloat(qualitySlider.value) / 100 
        : 1.0;

    // Show loading state
    loadingOverlay.style.display = 'flex';
    convertBtn.disabled = true;
    convertedPreview.src = '';
    convertedPreview.style.display = 'none';
    convertedPlaceholder.style.display = 'none';
    convertedPreview.onerror = null;
    convertedPreview.onload = null;

    const img = new Image();
    
    img.onload = () => {
        try {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            
            // Fill with white background for formats that don't support transparency
            if (selectedFormat === 'image/jpeg' || selectedFormat === 'image/bmp') {
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            }
            
            // Draw image on canvas
            ctx.drawImage(img, 0, 0);
            
            // Convert to selected format
            canvas.toBlob(
                (blob) => {
                    loadingOverlay.style.display = 'none';
                    convertBtn.disabled = false;
                    
                    if (blob) {
                        convertedBlob = blob;
                        const url = URL.createObjectURL(blob);
                        
                        // Set up error handler for converted image
                        convertedPreview.onerror = () => {
                            showError('Failed to display converted image. Try downloading it.');
                            convertedPlaceholder.style.display = 'flex';
                            convertedPreview.style.display = 'none';
                        };
                        
                        convertedPreview.onload = () => {
                            convertedPreview.style.display = 'block';
                            convertedPlaceholder.style.display = 'none';
                        };
                        
                        convertedPreview.src = url;
                        convertedInfo.textContent = `${formatFileSize(blob.size)}`;
                        convertedDimensions.textContent = `${img.width} × ${img.height}`;
                        downloadBtn.style.display = 'block';
                        
                        // Update button text
                        convertBtn.querySelector('.btn-text').textContent = 'Convert Again';
                    } else {
                        showError('Conversion failed. The format might not be supported. Try a different format.');
                    }
                },
                selectedFormat,
                quality
            );
        } catch (error) {
            loadingOverlay.style.display = 'none';
            convertBtn.disabled = false;
            showError('Conversion error: ' + error.message);
        }
    };

    img.onerror = () => {
        loadingOverlay.style.display = 'none';
        convertBtn.disabled = false;
        showError('Error loading image. Please try selecting the image again.');
    };

    // Use the original preview source
    img.src = originalPreview.src;
    
    // If image is already loaded, trigger onload manually
    if (originalPreview.complete && originalPreview.naturalWidth > 0) {
        img.src = originalPreview.src;
    }
}

function downloadImage() {
    if (!convertedBlob) {
        showError('Please convert the image first.');
        return;
    }

    const selectedFormat = formatSelect.value;
    const extension = getExtensionFromMimeType(selectedFormat);
    const fileName = currentFile.name.replace(/\.[^/.]+$/, '') + '.' + extension;
    
    const url = URL.createObjectURL(convertedBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    // Brief visual feedback
    downloadBtn.style.opacity = '0.6';
    setTimeout(() => {
        downloadBtn.style.opacity = '1';
    }, 200);
}

function resetConverter() {
    currentFile = null;
    convertedBlob = null;
    fileInput.value = '';
    originalPreview.src = '';
    convertedPreview.src = '';
    convertedPreview.style.display = 'none';
    convertedPlaceholder.style.display = 'flex';
    originalInfo.textContent = '';
    convertedInfo.textContent = '';
    originalDimensions.textContent = '';
    convertedDimensions.textContent = '';
    previewSection.style.display = 'none';
    downloadBtn.style.display = 'none';
    loadingOverlay.style.display = 'none';
    errorMessage.style.display = 'none';
    convertBtn.querySelector('.btn-text').textContent = 'Convert';
    convertBtn.disabled = false;
    formatSelect.value = 'image/jpeg';
    qualitySlider.value = 90;
    qualityValue.textContent = '90';
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

function getExtensionFromMimeType(mimeType) {
    const mimeToExt = {
        'image/jpeg': 'jpg',
        'image/jpg': 'jpg',
        'image/png': 'png',
        'image/webp': 'webp',
        'image/gif': 'gif',
        'image/bmp': 'bmp'
    };
    return mimeToExt[mimeType] || 'jpg';
}


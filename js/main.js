import { videos } from './data.js';

// --- DOM Elements ---
const galleryGrid = document.getElementById('gallery-grid');
const filterBtns = document.querySelectorAll('.filter-btn');
const modal = document.getElementById('video-modal');
const closeModalBtn = document.querySelector('.close-modal');
const modalIframe = document.getElementById('modal-iframe');
const modalTitle = document.getElementById('modal-title');
const modalDesc = document.getElementById('modal-desc');
const modalTags = document.getElementById('modal-tags');

// --- Helper Functions ---

/**
 * Extracts the File ID from a Google Drive URL and returns the embed URL.
 * Supports typical formats like /file/d/ID/view or /file/d/ID/preview
 */
/**
 * Extracts the File ID from a Google Drive URL
 */
function getFileId(driveLink) {
    try {
        const idMatch = driveLink.match(/\/d\/([a-zA-Z0-9_-]+)/);
        return (idMatch && idMatch[1]) ? idMatch[1] : null;
    } catch (e) {
        return null;
    }
}

function getEmbedUrl(driveLink) {
    const id = getFileId(driveLink);
    if (id) {
        // Autoplay removed to fix infinite loading/spinner issues on some browsers
        return `https://drive.google.com/file/d/${id}/preview`;
    }
    return driveLink;
}

function getThumbnail(video) {
    const id = getFileId(video.driveLink);
    if (id) {
        // High-res numeric params: w600-h400 (just examples to force larger)
        return `https://drive.google.com/thumbnail?id=${id}&sz=w600-h800`;
    }
    // Fallback
    return `https://source.unsplash.com/800x450/?technology,camera,film&sig=${video.title.length}`;
}

// --- Render Functions ---

function createVideoCard(video) {
    const card = document.createElement('div');
    card.classList.add('video-card');
    card.setAttribute('data-category', video.category);

    const thumbUrl = getThumbnail(video);

    card.innerHTML = `
        <div class="thumbnail-wrapper">
            <img src="${thumbUrl}" alt="${video.title}" class="thumbnail-img">
            <div class="play-icon">
                <svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
            </div>
        </div>
        <div class="card-info">
            <h3 class="card-title">${video.title}</h3>
            <p class="card-category">${video.category} • ${video.duration}</p>
        </div>
    `;

    card.addEventListener('click', () => openModal(video));
    return card;
}

function renderGallery(filter = 'all') {
    galleryGrid.innerHTML = '';

    // Add fade-in animation logic if needed, but simple render first
    const filteredVideos = filter === 'all'
        ? videos
        : videos.filter(v => v.category === filter);

    filteredVideos.forEach(video => {
        const card = createVideoCard(video);
        galleryGrid.appendChild(card);
    });
}

// --- Interaction Logic ---

function handleFilter(e) {
    // Remove active class from all
    filterBtns.forEach(btn => btn.classList.remove('active'));
    // Add to clicked
    e.target.classList.add('active');

    const category = e.target.getAttribute('data-category');
    renderGallery(category);
}

function openModal(video) {
    const embedUrl = getEmbedUrl(video.driveLink);

    modalTitle.textContent = video.title;
    // User requested to remove description and tools from the modal
    modalDesc.textContent = '';
    modalTags.textContent = '';

    // Set iframe src
    modalIframe.src = embedUrl;

    modal.classList.add('active');
    document.body.style.overflow = 'hidden'; // Prevent background scroll
}

function closeModal() {
    modal.classList.remove('active');
    modalIframe.src = ''; // Stop video
    document.body.style.overflow = '';
}

// --- Event Listeners ---
filterBtns.forEach(btn => btn.addEventListener('click', handleFilter));
closeModalBtn.addEventListener('click', closeModal);

// Close on outside click
modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
});

// Escape key to close
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
        closeModal();
    }
});

// --- Scroll Animations ---
const observerOptions = {
    threshold: 0.1
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('fade-in-up');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

document.querySelectorAll('.video-card, .section-title').forEach(el => {
    observer.observe(el);
});

// --- Init ---
renderGallery();

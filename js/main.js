import { videos } from './data.js';

// --- Configuration ---
const ITEMS_PER_PAGE = 12;
let currentFilter = 'all';
let currentPage = 1;

// --- DOM Elements ---
const galleryGrid = document.getElementById('gallery-grid');
const paginationContainer = document.getElementById('pagination-container');
const filterBtns = document.querySelectorAll('.filter-btn');
const modal = document.getElementById('video-modal');
const closeModalBtn = document.querySelector('.close-modal');
const modalIframe = document.getElementById('modal-iframe');
const modalTitle = document.getElementById('modal-title');
const modalWaBtn = document.getElementById('modal-wa-btn');

// --- Helper Functions ---

/**
 * Extracts the Google Drive File ID from URL
 */
function getFileId(driveLink) {
    if (!driveLink) return null;
    try {
        const idMatch = driveLink.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
        if (idMatch && idMatch[1]) return idMatch[1];
        
        const folderMatch = driveLink.match(/\/folders\/([a-zA-Z0-9_-]+)/);
        if (folderMatch && folderMatch[1]) return folderMatch[1];
        
        const queryMatch = driveLink.match(/id=([a-zA-Z0-9_-]+)/);
        if (queryMatch && queryMatch[1]) return queryMatch[1];

        return null;
    } catch (e) {
        return null;
    }
}

/**
 * Generates the embed URL for iframe
 */
function getEmbedUrl(driveLink) {
    const id = getFileId(driveLink);
    if (id && driveLink.includes('/file/d/')) {
        return `https://drive.google.com/file/d/${id}/preview`;
    }
    if (driveLink.includes('/folders/')) {
        return driveLink;
    }
    return driveLink;
}

/**
 * Generates the high-res thumbnail URL or fallback SVG
 */
function getThumbnail(video) {
    const id = getFileId(video.driveLink);
    if (id && video.driveLink.includes('/file/d/')) {
        return `https://drive.google.com/thumbnail?id=${id}&sz=w600-h800`;
    }
    // High aesthetic dark gradient placeholder with video category
    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
        <svg xmlns="http://www.w3.org/2000/svg" width="600" height="338" viewBox="0 0 600 338">
            <defs>
                <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#180a22"/>
                    <stop offset="50%" stop-color="#0a0a0f"/>
                    <stop offset="100%" stop-color="#12051c"/>
                </linearGradient>
            </defs>
            <rect width="600" height="338" fill="url(#g)"/>
            <circle cx="300" cy="150" r="42" fill="#bb00ff" fill-opacity="0.2" stroke="#bb00ff" stroke-width="2"/>
            <polygon points="292,135 318,150 292,165" fill="#ffffff"/>
            <text x="300" y="235" font-family="'Outfit', sans-serif" font-weight="700" font-size="20" fill="#bb00ff" text-anchor="middle" letter-spacing="3">${video.category.toUpperCase()}</text>
            <text x="300" y="265" font-family="'Inter', sans-serif" font-size="14" fill="#888888" text-anchor="middle">${video.title}</text>
        </svg>
    `)}`;
}

/**
 * Interleaves videos from different categories for "Todos" view
 * to ensure high diversity across page 1 and subsequent pages.
 */
function getInterleavedVideos() {
    const categories = {};
    videos.forEach(v => {
        if (!categories[v.category]) {
            categories[v.category] = [];
        }
        categories[v.category].push(v);
    });

    const catKeys = Object.keys(categories);
    const result = [];
    let maxLength = 0;

    catKeys.forEach(k => {
        if (categories[k].length > maxLength) {
            maxLength = categories[k].length;
        }
    });

    for (let i = 0; i < maxLength; i++) {
        catKeys.forEach(k => {
            if (categories[k][i]) {
                result.push(categories[k][i]);
            }
        });
    }

    return result;
}

/**
 * Gets all items matching the current filter
 */
function getFilteredList(filter) {
    if (filter === 'all') {
        return getInterleavedVideos();
    }
    return videos.filter(v => v.category.toLowerCase() === filter.toLowerCase());
}

// --- Render Functions ---

function createVideoCard(video) {
    const card = document.createElement('div');
    card.classList.add('video-card', 'fade-in-up');
    card.setAttribute('data-category', video.category);

    const thumbUrl = getThumbnail(video);

    card.innerHTML = `
        <div class="thumbnail-wrapper">
            <img src="${thumbUrl}" alt="${video.title}" class="thumbnail-img" loading="lazy">
            <div class="play-icon">
                <svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
            </div>
            <span class="video-duration-badge">${video.duration || 'Vídeo'}</span>
        </div>
        <div class="card-info">
            <h3 class="card-title">${video.title}</h3>
            <p class="card-category">${video.category}</p>
        </div>
    `;

    // Handle thumbnail error fallback
    const img = card.querySelector('.thumbnail-img');
    img.onerror = () => {
        img.src = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
            <svg xmlns="http://www.w3.org/2000/svg" width="600" height="338" viewBox="0 0 600 338">
                <rect width="600" height="338" fill="#111116"/>
                <circle cx="300" cy="150" r="38" fill="#bb00ff" fill-opacity="0.2" stroke="#bb00ff" stroke-width="2"/>
                <polygon points="293,137 315,150 293,163" fill="#ffffff"/>
                <text x="300" y="230" font-family="'Outfit', sans-serif" font-weight="700" font-size="18" fill="#bb00ff" text-anchor="middle" letter-spacing="2">${video.category.toUpperCase()}</text>
            </svg>
        `)}`;
    };

    card.addEventListener('click', () => openModal(video));
    return card;
}

function renderPagination(totalItems) {
    if (!paginationContainer) return;
    paginationContainer.innerHTML = '';

    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
    if (totalPages <= 1) return;

    const nav = document.createElement('div');
    nav.classList.add('pagination');

    // Prev Button
    const prevBtn = document.createElement('button');
    prevBtn.classList.add('page-btn', 'prev-btn');
    prevBtn.innerHTML = '&larr; Anterior';
    prevBtn.disabled = currentPage === 1;
    prevBtn.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            updateGallery();
            scrollToGallery();
        }
    });
    nav.appendChild(prevBtn);

    // Page Numbers
    const numContainer = document.createElement('div');
    numContainer.classList.add('page-numbers');

    for (let p = 1; p <= totalPages; p++) {
        const pageBtn = document.createElement('button');
        pageBtn.classList.add('page-num');
        if (p === currentPage) pageBtn.classList.add('active');
        pageBtn.textContent = p;
        pageBtn.addEventListener('click', () => {
            if (currentPage !== p) {
                currentPage = p;
                updateGallery();
                scrollToGallery();
            }
        });
        numContainer.appendChild(pageBtn);
    }
    nav.appendChild(numContainer);

    // Next Button
    const nextBtn = document.createElement('button');
    nextBtn.classList.add('page-btn', 'next-btn');
    nextBtn.innerHTML = 'Próximo &rarr;';
    nextBtn.disabled = currentPage === totalPages;
    nextBtn.addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage++;
            updateGallery();
            scrollToGallery();
        }
    });
    nav.appendChild(nextBtn);

    paginationContainer.appendChild(nav);
}

function updateGallery() {
    galleryGrid.innerHTML = '';
    const fullList = getFilteredList(currentFilter);
    const totalItems = fullList.length;

    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE) || 1;
    if (currentPage > totalPages) currentPage = 1;

    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginatedItems = fullList.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    paginatedItems.forEach(video => {
        const card = createVideoCard(video);
        galleryGrid.appendChild(card);
    });

    renderPagination(totalItems);
}

function scrollToGallery() {
    const workSection = document.getElementById('work');
    if (workSection) {
        const rect = workSection.getBoundingClientRect();
        if (rect.top < 0 || rect.top > window.innerHeight) {
            workSection.scrollIntoView({ behavior: 'smooth' });
        }
    }
}

// --- Interaction Logic ---

function handleFilter(e) {
    const btn = e.target.closest('.filter-btn');
    if (!btn) return;

    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    currentFilter = btn.getAttribute('data-category');
    currentPage = 1;
    updateGallery();
}

function openModal(video) {
    const embedUrl = getEmbedUrl(video.driveLink);

    modalTitle.textContent = video.title;

    // Dynamically update WhatsApp button with the specific video name
    if (modalWaBtn) {
        const customMessage = `Olá, Kelve! Vim pelo seu portfólio e gostei muito do estilo do vídeo "${video.title}" (${video.category}). Gostaria de conversar sobre um projeto semelhante.`;
        modalWaBtn.href = `https://wa.me/557582943899?text=${encodeURIComponent(customMessage)}`;
    }

    modalIframe.src = embedUrl;
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    modal.classList.remove('active');
    modalIframe.src = '';
    document.body.style.overflow = '';
}

// --- Event Listeners ---
filterBtns.forEach(btn => btn.addEventListener('click', handleFilter));
closeModalBtn.addEventListener('click', closeModal);

modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
        closeModal();
    }
});

// --- Init ---
updateGallery();

// --- Video Reel Strip ---
function buildReel() {
    const reelTrack = document.getElementById('reel-track');
    const reelWrapper = document.getElementById('reel-strip-wrapper');
    if (!reelTrack || !reelWrapper) return;

    const reelVideos = videos.filter(v => v.category.toLowerCase() === 'restaurante');
    if (reelVideos.length === 0) return;

    let isHovered = false;
    let isVisible = true;

    function syncPlayState() {
        reelTrack.style.animationPlayState = (!isVisible || isHovered) ? 'paused' : 'running';
    }

    function createReelItem(video) {
        const item = document.createElement('div');
        item.classList.add('reel-item');

        const thumbUrl = getThumbnail(video);
        item.innerHTML = `
            <img src="${thumbUrl}" alt="${video.title}" loading="lazy">
            <div class="reel-play-btn">
                <svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
            </div>
        `;

        const img = item.querySelector('img');
        img.onerror = () => {
            img.src = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
                <svg xmlns="http://www.w3.org/2000/svg" width="175" height="100" viewBox="0 0 175 100">
                    <rect width="175" height="100" fill="#0d0d0d"/>
                    <circle cx="87" cy="46" r="18" fill="#bb00ff" fill-opacity="0.25" stroke="#bb00ff" stroke-width="1.5"/>
                    <polygon points="82,38 96,46 82,54" fill="#fff"/>
                </svg>
            `)}`;
        };

        item.addEventListener('click', () => openModal(video));
        return item;
    }

    // 4× duplicação — animate -25% para loop perfeitamente contínuo
    for (let i = 0; i < 4; i++) {
        reelVideos.forEach(video => reelTrack.appendChild(createReelItem(video)));
    }

    // Velocidade: ~80px por segundo, dinamicamente calculada
    const ITEM_WIDTH = 189; // 175px + 14px gap
    const singleSetPx = reelVideos.length * ITEM_WIDTH;
    const duration = Math.max(15, singleSetPx / 80);
    reelTrack.style.animationDuration = `${duration.toFixed(1)}s`;

    // Hover (desktop): pausa suave
    reelWrapper.addEventListener('mouseenter', () => { isHovered = true; syncPlayState(); });
    reelWrapper.addEventListener('mouseleave', () => { isHovered = false; syncPlayState(); });

    // Touch (mobile): pausa ao segurar, retoma ao soltar
    reelWrapper.addEventListener('touchstart', () => { isHovered = true; syncPlayState(); }, { passive: true });
    reelWrapper.addEventListener('touchend', () => {
        // pequeno delay para o click do openModal ser registrado antes de retomar
        setTimeout(() => { isHovered = false; syncPlayState(); }, 350);
    }, { passive: true });

    // IntersectionObserver: pausa quando fora de vista (economiza CPU/GPU)
    const io = new IntersectionObserver(([entry]) => {
        isVisible = entry.isIntersecting;
        syncPlayState();
    }, { threshold: 0 });
    io.observe(reelWrapper);
}

buildReel();

// --- Filters Scroll Hint (mobile) ---
function initFiltersHint() {
    if (window.innerWidth > 768) return;

    const filtersEl = document.querySelector('.filters');
    const hintWrapper = document.getElementById('filters-scroll-hint');
    if (!filtersEl || !hintWrapper) return;

    // Ativa o gradiente (só mobile)
    hintWrapper.classList.add('show-hint');

    // Some quando chega no fim
    filtersEl.addEventListener('scroll', () => {
        const atEnd = filtersEl.scrollLeft + filtersEl.clientWidth >= filtersEl.scrollWidth - 8;
        hintWrapper.classList.toggle('at-end', atEnd);
    }, { passive: true });

    // Remove hint para sempre na primeira interação do usuário
    filtersEl.addEventListener('touchstart', () => {
        hintWrapper.classList.remove('hint-animate');
    }, { once: true, passive: true });

    // IntersectionObserver: faz o "peek" quando a seção fica visível pela primeira vez
    let peeked = false;
    const io = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting && !peeked) {
            peeked = true;
            io.disconnect();

            // Delay para a animação de entrada da seção terminar
            setTimeout(() => {
                // Pulsa o gradiente para chamar atenção
                hintWrapper.classList.add('hint-animate');

                // Scroll suave para direita (peek) e volta
                filtersEl.scrollTo({ left: 100, behavior: 'smooth' });
                setTimeout(() => {
                    // Só volta se o usuário não arrastou ainda
                    if (filtersEl.scrollLeft <= 110) {
                        filtersEl.scrollTo({ left: 0, behavior: 'smooth' });
                    }
                }, 750);
            }, 600);
        }
    }, { threshold: 0.6 });

    io.observe(hintWrapper);
}

initFiltersHint();

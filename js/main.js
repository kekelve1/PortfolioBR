import { videos } from './data.js';

// --- Configuration ---
const ITEMS_PER_PAGE = 12;
let currentFilter = 'all';
let currentPage = 1;
let activeVideos = [...videos];

// --- Google Drive API Configuration ---
const GOOGLE_API_KEY = 'AIzaSyD8q_zmyrdyLnsrkhAgtbEL_wfSVozisL8';
const PREVIEW_FOLDER_ID = '1fejhjwZu1yeN7ehQfMx5qauLVsAKL1UH';
const RESTAURANTE_FOLDER_ID = '1TSMC5rpArmHGiqdClhMi68Lrfp6Q9KxJ';

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
    if (id && video.driveLink && video.driveLink.includes('/file/d/')) {
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
            <text x="300" y="235" font-family="'Outfit', sans-serif" font-weight="700" font-size="20" fill="#bb00ff" text-anchor="middle" letter-spacing="3">${(video.category || 'VÍDEO').toUpperCase()}</text>
            <text x="300" y="265" font-family="'Inter', sans-serif" font-size="14" fill="#888888" text-anchor="middle">${video.title || ''}</text>
        </svg>
    `)}`;
}

/**
 * Interleaves videos from different categories for "Todos" view
 * to ensure high diversity across page 1 and subsequent pages.
 */
function getInterleavedVideos() {
    const categories = {};
    activeVideos.forEach(v => {
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
    return activeVideos.filter(v => v.category.toLowerCase() === filter.toLowerCase());
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
                <text x="300" y="230" font-family="'Outfit', sans-serif" font-weight="700" font-size="18" fill="#bb00ff" text-anchor="middle" letter-spacing="2">${(video.category || 'VÍDEO').toUpperCase()}</text>
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

function handleFilter(e) {
    const btn = e.target.closest('.filter-btn');
    if (!btn) return;

    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    currentFilter = btn.getAttribute('data-category');
    currentPage = 1;
    updateGallery();

    // Centraliza o botão clicado na esteira horizontal no celular
    const filtersContainer = document.querySelector('.filters');
    if (filtersContainer) {
        const targetScroll = btn.offsetLeft - (filtersContainer.clientWidth / 2) + (btn.clientWidth / 2);
        filtersContainer.scrollTo({
            left: targetScroll,
            behavior: 'smooth'
        });
    }
}

function openModal(video) {
    const embedUrl = getEmbedUrl(video.driveLink);

    modalTitle.textContent = video.title;

    // Dynamically update WhatsApp button with the specific video name
    if (modalWaBtn) {
        const customMessage = `Olá, Kelve! Vim pelo seu portfólio e gostei muito do estilo do vídeo "${video.title}" (${video.category || 'Edição'}). Gostaria de conversar sobre um projeto semelhante.`;
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

// --- Google Drive Fetch Utility with Smart Cache ---
async function fetchFolderVideos(folderId) {
    if (!GOOGLE_API_KEY || !folderId) return [];

    const CACHE_KEY = `drive_folder_${folderId}`;
    const CACHE_TIME_KEY = `drive_folder_${folderId}_time`;
    const CACHE_TTL = 1000 * 60 * 15; // 15 minutos de cache para máxima velocidade e economia

    try {
        const cached = sessionStorage.getItem(CACHE_KEY);
        const cachedTime = sessionStorage.getItem(CACHE_TIME_KEY);
        if (cached && cachedTime && (Date.now() - parseInt(cachedTime, 10) < CACHE_TTL)) {
            return JSON.parse(cached);
        }
    } catch (e) {
        // Ignora erro de storage se indisponível
    }

    try {
        const url = `https://www.googleapis.com/drive/v3/files?q='${folderId}'+in+parents+and+trashed=false&fields=files(id,name,mimeType,thumbnailLink,videoMediaMetadata)&key=${GOOGLE_API_KEY}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const validFiles = (data.files || []).filter(f => f.mimeType && (f.mimeType.startsWith('video/') || f.name.match(/\.(mp4|mov|webm)$/i)));
        
        try {
            sessionStorage.setItem(CACHE_KEY, JSON.stringify(validFiles));
            sessionStorage.setItem(CACHE_TIME_KEY, Date.now().toString());
        } catch (e) {}

        return validFiles;
    } catch (err) {
        console.warn('Drive fetch error:', err);
        return [];
    }
}

// --- Video Reel Strip (Top Previews) ---
async function buildReel() {
    const reelTrack = document.getElementById('reel-track');
    const reelWrapper = document.getElementById('reel-strip-wrapper');
    if (!reelTrack || !reelWrapper) return;

    let isHovered = false;
    let isVisible = true;

    function syncPlayState() {
        reelTrack.style.animationPlayState = (!isVisible || isHovered) ? 'paused' : 'running';
    }

    function createReelItem(video, index) {
        const item = document.createElement('div');
        item.classList.add('reel-item');

        const thumbUrl = video.thumbnailUrl || getThumbnail(video);
        const isPriority = index < 8; // Os 8 primeiros na tela carregam com máxima prioridade

        item.innerHTML = `
            <img src="${thumbUrl}" alt="${video.title}" loading="eager" decoding="async" ${isPriority ? 'fetchpriority="high"' : ''}>
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

    // Nomes prioritários solicitados pelo usuário
    const priorityNames = [
        '250925 Roteiro 19 Trend - Drink que Cai e Volta',
        '251128 Faça seu Evento aqui',
        '251119 Buenas Comp 1',
        '260129 Video Modelo Aline',
        '01 Efeito+Espanhol',
        '250912 Happy Hour Drinks',
        '250917 Marmita Ironberg 2'
    ];

    function normalize(str) {
        return (str || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    }

    // Busca vídeos da pasta de Preview
    const driveFiles = await fetchFolderVideos(PREVIEW_FOLDER_ID);
    let reelVideos = [];

    if (driveFiles.length > 0) {
        const mapped = driveFiles.map(f => {
            // Usa CDN ultra-rápido do Google se disponível
            let thumb = '';
            if (f.thumbnailLink) {
                thumb = f.thumbnailLink.replace(/=s\d+/, '=s400');
            } else {
                thumb = `https://drive.google.com/thumbnail?id=${f.id}&sz=w400-h250`;
            }
            return {
                title: f.name.replace(/\.mp4$/i, '').trim(),
                category: 'Preview',
                driveLink: `https://drive.google.com/file/d/${f.id}/preview`,
                thumbnailUrl: thumb,
                rawName: f.name
            };
        });

        const matchedPriority = [];
        const remaining = [];

        priorityNames.forEach(pName => {
            const pNorm = normalize(pName);
            const foundIdx = mapped.findIndex(f => normalize(f.rawName).includes(pNorm) || pNorm.includes(normalize(f.rawName)));
            if (foundIdx !== -1) {
                matchedPriority.push(mapped[foundIdx]);
            }
        });

        mapped.forEach(f => {
            if (!matchedPriority.some(p => p.driveLink === f.driveLink)) {
                remaining.push(f);
            }
        });

        // Intercala 1 prioritário, 1 outro, 1 prioritário, 1 outro... e depois os restantes
        let rIdx = 0;
        matchedPriority.forEach(p => {
            reelVideos.push(p);
            if (rIdx < remaining.length) {
                reelVideos.push(remaining[rIdx++]);
            }
        });
        while (rIdx < remaining.length) {
            reelVideos.push(remaining[rIdx++]);
        }

        // Preload imediato de todas as thumbnails em background (garante que tudo esteja no cache antes de rolar)
        reelVideos.forEach(v => {
            if (v.thumbnailUrl) {
                const preloadImg = new Image();
                preloadImg.src = v.thumbnailUrl;
            }
        });
    } else {
        // Fallback local se estiver offline
        reelVideos = activeVideos.filter(v => v.category.toLowerCase() === 'restaurante');
    }

    if (reelVideos.length === 0) return;

    reelTrack.innerHTML = '';

    // Duplicação 1:1 para ciclo contínuo sem repetições excedentes por cena
    const fullCycle = [...reelVideos, ...reelVideos];
    fullCycle.forEach((video, idx) => {
        reelTrack.appendChild(createReelItem(video, idx));
    });

    // Velocidade de deslocamento: ~70px por segundo
    const ITEM_WIDTH = 189; // 175px + 14px gap
    const singleSetPx = reelVideos.length * ITEM_WIDTH;
    const duration = Math.max(20, singleSetPx / 70);
    reelTrack.style.animationDuration = `${duration.toFixed(1)}s`;

    // Hover (desktop): pausa suave
    reelWrapper.addEventListener('mouseenter', () => { isHovered = true; syncPlayState(); });
    reelWrapper.addEventListener('mouseleave', () => { isHovered = false; syncPlayState(); });

    // Touch (mobile): pausa ao segurar, retoma ao soltar
    reelWrapper.addEventListener('touchstart', () => { isHovered = true; syncPlayState(); }, { passive: true });
    reelWrapper.addEventListener('touchend', () => {
        setTimeout(() => { isHovered = false; syncPlayState(); }, 350);
    }, { passive: true });

    // IntersectionObserver: pausa quando fora de vista
    const io = new IntersectionObserver(([entry]) => {
        isVisible = entry.isIntersecting;
        syncPlayState();
    }, { threshold: 0 });
    io.observe(reelWrapper);
}

// --- Dynamic Google Drive Category Sync (Restaurante) ---
async function syncDriveCategories() {
    const driveFiles = await fetchFolderVideos(RESTAURANTE_FOLDER_ID);
    if (!driveFiles || driveFiles.length === 0) return;

    const syncedRestaurante = driveFiles.map(f => {
        let dur = '0:30';
        if (f.videoMediaMetadata && f.videoMediaMetadata.durationMillis) {
            const sec = Math.round(f.videoMediaMetadata.durationMillis / 1000);
            const m = Math.floor(sec / 60);
            const s = sec % 60;
            dur = `${m}:${s < 10 ? '0' : ''}${s}`;
        }
        let cleanTitle = f.name.replace(/\.mp4$/i, '').replace(/^\d+\s*/, '').trim();
        return {
            title: cleanTitle || f.name,
            category: 'Restaurante',
            description: 'Edição sensorial e comercial para gastronomia',
            tools: 'Premiere Pro',
            duration: dur,
            driveLink: `https://drive.google.com/file/d/${f.id}/preview`
        };
    });

    // Substitui a categoria Restaurante pelos dados dinâmicos mais recentes
    const otherVideos = activeVideos.filter(v => v.category.toLowerCase() !== 'restaurante');
    activeVideos = [...otherVideos, ...syncedRestaurante];

    // Atualiza a galeria se o usuário estiver vendo 'all' ou 'Restaurante'
    if (currentFilter === 'all' || currentFilter.toLowerCase() === 'restaurante') {
        updateGallery();
    }
}

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

    // Remove hint na primeira interação
    filtersEl.addEventListener('touchstart', () => {
        hintWrapper.classList.remove('hint-animate');
    }, { once: true, passive: true });

    // Peek automático na primeira visualização
    let peeked = false;
    const io = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting && !peeked) {
            peeked = true;
            io.disconnect();

            setTimeout(() => {
                hintWrapper.classList.add('hint-animate');
                filtersEl.scrollTo({ left: 100, behavior: 'smooth' });
                setTimeout(() => {
                    if (filtersEl.scrollLeft <= 110) {
                        filtersEl.scrollTo({ left: 0, behavior: 'smooth' });
                    }
                }, 750);
            }, 600);
        }
    }, { threshold: 0.6 });

    io.observe(hintWrapper);
}

// --- Initialize App ---
updateGallery();
buildReel();
syncDriveCategories();
initFiltersHint();

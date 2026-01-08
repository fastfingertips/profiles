import { initDOMReferences } from './state.js';
import { getUser } from './modules/api.js';
import { displayRecent } from './modules/recent.js';
import { hideJsonModal, copyJson, hideAvatarModal, downloadAvatar, showAboutModal, hideAboutModal } from './modules/modals.js';
import { deleteCard } from './modules/stack.js';
import { debounce } from './utils.js';

import { loadPartials } from './modules/partials.js';

function initEventListeners() {
    modalClose.addEventListener('click', hideJsonModal);
    modalOverlay.addEventListener('click', (e) => { if (e.target === modalOverlay) hideJsonModal(); });
    btnCopy.addEventListener('click', copyJson);
    avatarModalImg.addEventListener('click', hideAvatarModal);
    avatarModal.addEventListener('click', (e) => { if (e.target === avatarModal) hideAvatarModal(); });
    btnDownload.addEventListener('click', downloadAvatar);
    if (btnAbout) btnAbout.addEventListener('click', showAboutModal);
    if (aboutClose) aboutClose.addEventListener('click', hideAboutModal);
    if (aboutModal) aboutModal.addEventListener('click', (e) => { if (e.target === aboutModal) hideAboutModal(); });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (avatarModal?.classList.contains('active')) {
                hideAvatarModal();
            } else if (modalOverlay?.classList.contains('active')) {
                hideJsonModal();
            } else if (aboutModal?.classList.contains('active')) {
                hideAboutModal();
            } else {
                const topCard = cardStack?.querySelector('.profile-card');
                if (topCard) deleteCard(topCard);
            }
        }
    });

    const debouncedSearch = debounce((username) => { if (username.trim()) getUser(username.trim()); }, 500);

    search.addEventListener('input', (e) => {
        const value = e.target.value.trim();
        if (value) debouncedSearch(value);
    });

    search.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); const value = search.value.trim(); if (value) getUser(value); } });

    search.focus();
}

async function init() {
    // 1. Load HTML Partials first
    await loadPartials();

    // 2. Initialize DOM references now that partials are in place
    initDOMReferences();

    // 3. Setup listeners and initial state
    initEventListeners();
    displayRecent();

    // Check for URL parameters
    const urlParams = new URLSearchParams(globalThis.location.search);
    const userParam = urlParams.get('user') || urlParams.get('username');
    if (userParam) { search.value = userParam; getUser(userParam); }
}

// Start the app
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => init());
} else {
    await init();
}

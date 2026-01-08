export const UI = {};

export const State = {
    userCache: new Map(),
    navDots: new Map(),
    activeBg: null,
    currentUser: null,
    currentRepos: null
};

export function initDOMReferences() {
    UI.main = document.getElementById('main');
    UI.search = document.getElementById('search');
    UI.searchLoader = document.getElementById('searchLoader');
    UI.modalOverlay = document.getElementById('modalOverlay');
    UI.modalClose = document.getElementById('modalClose');
    UI.jsonContent = document.getElementById('jsonContent');
    UI.btnCopy = document.getElementById('btnCopy');
    UI.avatarModal = document.getElementById('avatarModal');
    UI.avatarModalImg = document.getElementById('avatarModalImg');
    UI.btnDownload = document.getElementById('btnDownload');
    UI.bg1 = document.getElementById('bg1');
    UI.bg2 = document.getElementById('bg2');
    UI.colorCanvas = document.getElementById('colorCanvas');
    UI.recentSearches = document.getElementById('recentSearches');
    UI.cardStack = document.getElementById('cardStack');
    UI.stackNav = document.getElementById('stackNav');
    UI.btnAbout = document.getElementById('btnAbout');
    UI.aboutModal = document.getElementById('aboutModal');
    UI.aboutClose = document.getElementById('aboutClose');

    State.activeBg = UI.bg1;
}

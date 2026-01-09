import { UI, State } from '../state.js';
import { updateBackgroundColor, resetBackgroundColor } from './ui.js';

export function updateStackNav() {
    const allCards = Array.from(UI.cardStack.querySelectorAll('.profile-card'));
    const userCards = allCards.filter(c => !c.classList.contains('error-card'));

    if (userCards.length === 0) {
        UI.stackNav.style.height = '0';
        UI.stackNav.innerHTML = '';
        State.navDots.clear();
        return;
    }

    const DOT_SIZE = 28;
    const GAP = 12;
    const PADDING = 14;
    const currentLogins = new Set();

    let closeAllBtn = UI.stackNav.querySelector('.nav-dot.close-all');
    if (!closeAllBtn) {
        closeAllBtn = document.createElement('div');
        closeAllBtn.className = 'nav-dot close-all';
        closeAllBtn.title = 'Close All Cards';
        closeAllBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';
        closeAllBtn.addEventListener('click', resetToDefault);
        UI.stackNav.appendChild(closeAllBtn);
    }

    userCards.forEach((card, index) => {
        const userLogin = card.dataset.user || 'User';
        currentLogins.add(userLogin.toLowerCase());

        let dot = State.navDots.get(userLogin.toLowerCase());

        if (!dot) {
            dot = createNavDot(userLogin, index, PADDING, DOT_SIZE, GAP, card);
            UI.stackNav.appendChild(dot);
            State.navDots.set(userLogin.toLowerCase(), dot);
        }

        const isActive = (card === UI.cardStack.firstElementChild);
        dot.classList.toggle('active', isActive);

        const targetY = PADDING + (index * (DOT_SIZE + GAP));
        dot.style.transform = `translateY(${targetY}px)${isActive ? ' scale(1.15)' : ' scale(1)'}`;
    });

    for (const [login, dot] of State.navDots.entries()) {
        if (!currentLogins.has(login)) {
            dot.style.opacity = '0';
            dot.style.transform += ' scale(0.5)';
            setTimeout(() => {
                dot.remove();
                State.navDots.delete(login);
            }, 500);
        }
    }

    const closeBtnY = PADDING + (userCards.length * (DOT_SIZE + GAP));
    closeAllBtn.style.transform = `translateY(${closeBtnY}px)`;

    const totalItems = userCards.length + 1;
    const totalHeight = (totalItems * DOT_SIZE) + ((totalItems - 1) * GAP) + (PADDING * 2) + 2;
    UI.stackNav.style.height = `${totalHeight}px`;
}

function createNavDot(userLogin, index, padding, dotSize, gap, card) {
    const dot = document.createElement('div');
    dot.className = 'nav-dot';
    const avatarImg = card.querySelector('.avatar');
    if (avatarImg) {
        dot.style.backgroundImage = `url(${avatarImg.src})`;
    }
    dot.title = userLogin;
    dot.addEventListener('click', () => {
        if (UI.cardStack.firstElementChild !== card) bringCardToFront(card);
    });

    const startY = padding + (index * (dotSize + gap));
    dot.style.transform = `translateY(${startY}px) scale(0.5)`;
    dot.style.opacity = '0';
    requestAnimationFrame(() => {
        dot.style.opacity = '1';
        dot.style.transform = `translateY(${startY}px) scale(1)`;
    });

    return dot;
}

export function bringCardToFront(card) {
    const existingError = UI.cardStack.querySelector('.error-card');
    if (existingError && existingError !== card) {
        existingError.remove();
    }

    card.classList.remove('new-card-deal', 'restack-promote');
    card.offsetWidth; // Force reflow
    card.classList.add('restack-promote');
    UI.cardStack.prepend(card);

    const userLogin = card.dataset.user;
    if (userLogin) {
        UI.search.value = userLogin;
        const cached = State.userCache.get(userLogin.toLowerCase());
        if (cached) {
            State.currentUser = cached.user;
            State.currentRepos = cached.repos;
        }
        const avatarImg = card.querySelector('.avatar');
        if (avatarImg) updateBackgroundColor(avatarImg.src);
    }

    updateStackNav();
    setTimeout(() => card.classList.remove('restack-promote'), 800);
}

export function deleteCard(card) {
    const userLogin = card.dataset.user;
    if (userLogin) State.userCache.delete(userLogin.toLowerCase());

    card.classList.add('fall-away');

    const nextTopCard = Array.from(UI.cardStack.querySelectorAll('.profile-card'))
        .find(c => c !== card && !c.classList.contains('fall-away'));

    if (nextTopCard) {
        bringCardToFront(nextTopCard);
    }

    setTimeout(() => {
        card.remove();
        updateStackNav();
        if (UI.cardStack.querySelectorAll('.profile-card').length === 0) {
            resetToDefault();
        }
    }, 500);
}

function resetToDefault() {
    document.querySelector('.container').classList.remove('has-result');
    UI.cardStack.innerHTML = `
    <div class="empty-state">
      <div class="empty-icon"><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg></div>
      <p>Start typing to explore profiles</p>
    </div>`;
    resetBackgroundColor();
    UI.search.value = '';
    State.currentUser = null;
    State.currentRepos = null;
    updateStackNav();
}

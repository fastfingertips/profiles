import { UI } from '../state.js';
import { getUser } from './api.js';

export function addToRecent(user) {
    let recent = JSON.parse(localStorage.getItem('recent_profiles') || '[]');
    recent = recent.filter(item => item.login !== user.login);
    recent.unshift({ login: user.login, avatar_url: user.avatar_url });
    recent = recent.slice(0, 4); // Keep last 4

    localStorage.setItem('recent_profiles', JSON.stringify(recent));
    displayRecent();
}

export function displayRecent() {
    const recent = JSON.parse(localStorage.getItem('recent_profiles') || '[]');

    if (recent.length === 0) {
        UI.recentSearches.innerHTML = '';
        return;
    }

    const chips = recent.map(user => `
    <div class="recent-chip" data-login="${user.login}">
      <img src="${user.avatar_url}" alt="${user.login}" class="recent-avatar">
      <span class="recent-name">${user.login}</span>
    </div>`).join('');

    UI.recentSearches.innerHTML = chips + `<button class="btn-clear-history" id="btnClearHistory" title="Clear History"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg></button>`;

    // Re-attach event listeners since innerHTML wiped them out
    document.getElementById('btnClearHistory')?.addEventListener('click', clearHistory);

    // Attach click listeners to chips
    const chipElements = UI.recentSearches.querySelectorAll('.recent-chip');
    chipElements.forEach(chip => {
        chip.addEventListener('click', () => {
            loadFromHistory(chip.dataset.login);
        });
    });
}

function loadFromHistory(login) {
    UI.search.value = login;
    getUser(login);
}

function clearHistory() {
    localStorage.removeItem('recent_profiles');
    displayRecent();
}

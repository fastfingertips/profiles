import { UI, State } from '../state.js';

export function showJsonModal() {
    if (!State.currentUser) return;

    // Using import() for dynamic loading or accessing State directly (we import State, so use it)
    // We already have State imported, no need for dynamic import unless creating circular dependency
    // but modals.js imports state.js, state.js doesn't import modals.js. Safe.

    UI.jsonContent.textContent = JSON.stringify({ user: State.currentUser, repositories: State.currentRepos }, null, 2);
    UI.modalOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
}

export function hideJsonModal() {
    UI.modalOverlay.classList.remove('active');
    document.body.style.overflow = '';
    resetCopyButton();
}

function resetCopyButton() {
    UI.btnCopy.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg><span>Copy JSON</span>`;
    UI.btnCopy.classList.remove('copied');
}

export function copyJson() {
    navigator.clipboard.writeText(UI.jsonContent.textContent).then(() => {
        UI.btnCopy.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg><span>Copied!</span>`;
        UI.btnCopy.classList.add('copied');
        setTimeout(resetCopyButton, 2000);
    });
}

export function showAvatarModal() {
    if (!State.currentUser) return;
    const avatarSrc = State.currentUser.avatar_url;
    UI.avatarModalImg.src = avatarSrc.includes('?') ? avatarSrc + '&s=400' : avatarSrc + '?s=400';
    UI.avatarModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

export function hideAvatarModal() {
    UI.avatarModal.classList.remove('active');
    document.body.style.overflow = '';
}

export async function downloadAvatar() {
    if (!State.currentUser) return;
    try {
        const avatarUrl = State.currentUser.avatar_url;
        const response = await fetch(avatarUrl.includes('?') ? avatarUrl + '&s=400' : avatarUrl + '?s=400');
        const blob = await response.blob();
        const url = globalThis.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `github-${State.currentUser.login}-avatar.png`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        globalThis.URL.revokeObjectURL(url);
    } catch (err) {
        console.warn('Avatar download failed, opening in new tab:', err.message);
        window.open(State.currentUser.avatar_url, '_blank');
    }
}

export function showAboutModal(e) {
    if (e) e.preventDefault();
    UI.aboutModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

export function hideAboutModal() {
    UI.aboutModal.classList.remove('active');
    document.body.style.overflow = '';
}

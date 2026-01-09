import { escapeHtml, formatNumber, getRelativeTime, formatDate, getLangClass } from '../utils.js';
import { State, UI } from '../state.js';
import { updateStackNav, bringCardToFront, deleteCard } from './stack.js';
import { showJsonModal, showAvatarModal } from './modals.js';

export function createUserCard(user, repos, timings = { user: 0, repos: 0, total: 0 }) {
  const existingCard = UI.cardStack.querySelector(`[data-user="${user.login.toLowerCase()}"]`);
  if (existingCard) {
    bringCardToFront(existingCard);
    return;
  }

  const displayName = user.name || user.login;
  const bio = user.bio ? `<p class="bio">${escapeHtml(user.bio)}</p>` : '';
  const githubUrl = `https://github.com/${user.login}`;

  let metaItems = [];
  if (user.location) {
    metaItems.push(`<div class="meta-item"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg><span>${escapeHtml(user.location)}</span></div>`);
  }
  if (user.company) {
    metaItems.push(`<div class="meta-item"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg><span>${escapeHtml(user.company)}</span></div>`);
  }
  if (user.blog) {
    const blogUrl = user.blog.startsWith('http') ? user.blog : `https://${user.blog}`;
    const blogDisplay = user.blog.replace(/^https?:\/\//, '').replace(/\/$/, '');
    metaItems.push(`<div class="meta-item"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg><a href="${blogUrl}" target="_blank" rel="noopener">${escapeHtml(blogDisplay)}</a></div>`);
  }
  metaItems.push(`<div class="meta-item clickable joined-meta" data-created="${user.created_at}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg><span class="joined-date"></span></div>`);

  const generateReposHTML = (r) => {
    if (!r) return `
      <div class="card-repos loading">
        <div class="repos-header">
          <div class="repos-title">
            <svg viewBox="0 0 16 16" fill="currentColor"><path d="M2 2.5A2.5 2.5 0 014.5 0h8.75a.75.75 0 01.75.75v12.5a.75.75 0 01-.75.75h-2.5a.75.75 0 110-1.5h1.75v-2h-8a1 1 0 00-.714 1.7.75.75 0 01-1.072 1.05A2.495 2.495 0 012 11.5v-9zm10.5-1V9h-8c-.356 0-.694.074-1 .208V2.5a1 1 0 011-1h8z"></path></svg>
            <span>Loading Repositories...</span>
          </div>
          <span class="section-timing repo-timing" title="Time taken to fetch repository data"></span>
        </div>
        <div class="repos-list skeleton">
          ${Array(3).fill('<div class="repo-item-skeleton"></div>').join('')}
        </div>
      </div>`;

    if (r.length === 0) return '';

    const repoItems = r.map(repo => `
      <a href="${repo.html_url}" target="_blank" rel="noopener" class="repo-item">
        <div class="repo-info">
          <svg viewBox="0 0 16 16" fill="currentColor"><path d="M2 2.5A2.5 2.5 0 014.5 0h8.75a.75.75 0 01.75.75v12.5a.75.75 0 01-.75.75h-2.5a.75.75 0 110-1.5h1.75v-2h-8a1 1 0 00-.714 1.7.75.75 0 01-1.072 1.05A2.495 2.495 0 012 11.5v-9zm10.5-1V9h-8c-.356 0-.694.074-1 .208V2.5a1 1 0 011-1h8z"></path></svg>
          <span class="repo-name">${escapeHtml(repo.name)}</span>
        </div>
        <div class="repo-meta">
          ${repo.language ? `<span><span class="lang-dot ${getLangClass(repo.language)}"></span>${repo.language}</span>` : ''}
          ${repo.stargazers_count > 0 ? `<span><svg viewBox="0 0 16 16" fill="currentColor"><path d="M8 .25a.75.75 0 01.673.418l1.882 3.815 4.21.612a.75.75 0 01.416 1.279l-3.046 2.97.719 4.192a.75.75 0 01-1.088.791L8 12.347l-3.766 1.98a.75.75 0 01-1.088-.79l.72-4.194L.818 6.374a.75.75 0 01.416-1.28l4.21-.611L7.327.668A.75.75 0 018 .25z"></path></svg>${formatNumber(repo.stargazers_count)}</span>` : ''}
        </div>
      </a>`).join('');

    return `
      <div class="card-repos">
        <div class="repos-header">
          <div class="repos-title">
            <svg viewBox="0 0 16 16" fill="currentColor"><path d="M2 2.5A2.5 2.5 0 014.5 0h8.75a.75.75 0 01.75.75v12.5a.75.75 0 01-.75.75h-2.5a.75.75 0 110-1.5h1.75v-2h-8a1 1 0 00-.714 1.7.75.75 0 01-1.072 1.05A2.495 2.495 0 012 11.5v-9zm10.5-1V9h-8c-.356 0-.694.074-1 .208V2.5a1 1 0 011-1h8z"></path></svg>
            <span>Recent Repositories</span>
          </div>
          <span class="section-timing repo-timing" title="Time taken to fetch repository data">${timings.repos ? timings.repos + 'ms' : ''}</span>
        </div>
        <div class="repos-list">${repoItems}</div>
      </div>`;
  };

  const reposHTML = generateReposHTML(repos);

  const cardHTML = `
    <div class="profile-card" data-user="${user.login.toLowerCase()}">
      <button class="btn-code" aria-label="View Source">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>
      </button>
      <button class="btn-close" aria-label="Close">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
      </button>
      <div class="card-header">
        <img src="${user.avatar_url}" alt="${displayName}" class="avatar" id="profileAvatar">
        <div class="user-details">
          <div class="user-header-row">
            <h1 class="user-name"><a href="${user.html_url}" target="_blank" rel="noopener">${escapeHtml(displayName)}</a></h1>
            <span class="section-timing profile-timing" title="Time taken to fetch profile data">${timings.user}ms</span>
          </div>
          <p class="username">@${user.login}</p>
          ${bio}
          <div class="meta-info">${metaItems.join('')}</div>
        </div>
      </div>
      <div class="card-stats">
        <a href="${githubUrl}?tab=repositories" target="_blank" rel="noopener" class="stat-item"><div class="stat-value">${formatNumber(user.public_repos)}</div><div class="stat-label">Repos</div></a>
        <a href="${githubUrl}?tab=followers" target="_blank" rel="noopener" class="stat-item"><div class="stat-value">${formatNumber(user.followers)}</div><div class="stat-label">Followers</div></a>
        <a href="${githubUrl}?tab=following" target="_blank" rel="noopener" class="stat-item"><div class="stat-value">${formatNumber(user.following)}</div><div class="stat-label">Following</div></a>
        <a href="https://gist.github.com/${user.login}" target="_blank" rel="noopener" class="stat-item"><div class="stat-value">${formatNumber(user.public_gists)}</div><div class="stat-label">Gists</div></a>
      </div>
      <div class="fetch-time" title="Total API response time (Profile + Repos)">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
        <span>Total Fetch: ${timings.total}ms</span>
      </div>
      ${reposHTML}
    </div>`;

  const cardWrapper = document.createElement('div');
  cardWrapper.innerHTML = cardHTML;
  const card = cardWrapper.firstElementChild;
  card.classList.add('new-card-deal');

  const emptyState = UI.cardStack.querySelector('.empty-state');
  if (emptyState) emptyState.remove();

  UI.cardStack.prepend(card);

  // Limit stack to 4 cards (1 front + 3 behind)
  const cards = UI.cardStack.querySelectorAll('.profile-card:not(.error-card)');
  if (cards.length > 4) {
    const oldestCard = cards[cards.length - 1];
    const userLogin = oldestCard.dataset.user;
    if (userLogin) State.userCache.delete(userLogin.toLowerCase());
    oldestCard.remove();
  }

  card.querySelector('.btn-code').addEventListener('click', showJsonModal);
  card.querySelector('#profileAvatar').addEventListener('click', showAvatarModal);
  card.querySelector('.btn-close').addEventListener('click', (e) => { e.stopPropagation(); deleteCard(card); });
  card.addEventListener('click', (e) => { if (UI.cardStack.firstElementChild !== card) { e.stopPropagation(); bringCardToFront(card); } });

  const joinedMeta = card.querySelector('.joined-meta');
  const joinedDate = card.querySelector('.joined-date');
  if (joinedMeta && joinedDate) {
    joinedMeta.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleJoinedDate(joinedDate, user.created_at);
    });
    animateJoinedDate(joinedDate, user.created_at);
  }

  updateStackNav();
  setTimeout(() => card.classList.remove('new-card-deal'), 800);
}

export function updateRepos(username, repos, timings) {
  const card = UI.cardStack.querySelector(`[data-user="${username.toLowerCase()}"]`);
  if (!card) return;

  const repoSection = card.querySelector('.card-repos');
  const fetchTimeSection = card.querySelector('.fetch-time span');

  if (fetchTimeSection) {
    fetchTimeSection.textContent = `Total Fetch: ${timings.total}ms`;
  }

  const profileTiming = card.querySelector('.profile-timing');
  if (profileTiming) {
    profileTiming.textContent = `${timings.user}ms`;
  }

  if (repoSection) {
    if (repos.length === 0) {
      repoSection.remove();
      return;
    }

    const repoItems = repos.map(repo => `
      <a href="${repo.html_url}" target="_blank" rel="noopener" class="repo-item">
        <div class="repo-info">
          <svg viewBox="0 0 16 16" fill="currentColor"><path d="M2 2.5A2.5 2.5 0 014.5 0h8.75a.75.75 0 01.75.75v12.5a.75.75 0 01-.75.75h-2.5a.75.75 0 110-1.5h1.75v-2h-8a1 1 0 00-.714 1.7.75.75 0 01-1.072 1.05A2.495 2.495 0 012 11.5v-9zm10.5-1V9h-8c-.356 0-.694.074-1 .208V2.5a1 1 0 011-1h8z"></path></svg>
          <span class="repo-name">${escapeHtml(repo.name)}</span>
        </div>
        <div class="repo-meta">
          ${repo.language ? `<span><span class="lang-dot ${getLangClass(repo.language)}"></span>${repo.language}</span>` : ''}
          ${repo.stargazers_count > 0 ? `<span><svg viewBox="0 0 16 16" fill="currentColor"><path d="M8 .25a.75.75 0 01.673.418l1.882 3.815 4.21.612a.75.75 0 01.416 1.279l-3.046 2.97.719 4.192a.75.75 0 01-1.088.791L8 12.347l-3.766 1.98a.75.75 0 01-1.088-.79l.72-4.194L.818 6.374a.75.75 0 01.416-1.28l4.21-.611L7.327.668A.75.75 0 018 .25z"></path></svg>${formatNumber(repo.stargazers_count)}</span>` : ''}
        </div>
      </a>`).join('');

    repoSection.classList.remove('loading');
    repoSection.innerHTML = `
      <div class="repos-header">
        <div class="repos-title">
          <svg viewBox="0 0 16 16" fill="currentColor"><path d="M2 2.5A2.5 2.5 0 014.5 0h8.75a.75.75 0 01.75.75v12.5a.75.75 0 01-.75.75h-2.5a.75.75 0 110-1.5h1.75v-2h-8a1 1 0 00-.714 1.7.75.75 0 01-1.072 1.05A2.495 2.495 0 012 11.5v-9zm10.5-1V9h-8c-.356 0-.694.074-1 .208V2.5a1 1 0 011-1h8z"></path></svg>
          <span>Recent Repositories</span>
        </div>
        <span class="section-timing repo-timing" title="Time taken to fetch repository data">${timings.repos}ms</span>
      </div>
      <div class="repos-list">${repoItems}</div>`;
  }
}

export function createErrorCard(title, message) {
  // Remove existing error card if any
  const existingError = UI.cardStack.querySelector('.error-card');
  if (existingError) existingError.remove();

  const errorHTML = `
    <div class="profile-card error-card new-card-deal">
      <button class="btn-close" aria-label="Close">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
      </button>
      <svg class="error-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"></circle><path d="M12 8v4M12 16h.01"></path></svg>
      <h2>${escapeHtml(title)}</h2>
      <p>${message}</p>
    </div>`;

  const emptyState = UI.cardStack.querySelector('.empty-state');
  if (emptyState) emptyState.remove();

  const wrapper = document.createElement('div');
  wrapper.innerHTML = errorHTML;
  const errorCard = wrapper.firstElementChild;
  UI.cardStack.prepend(errorCard);
  updateStackNav();
  errorCard.querySelector('.btn-close').addEventListener('click', () => deleteCard(errorCard));
}

function toggleJoinedDate(joinedEl, createdAt) {
  if (!joinedEl || !createdAt) return;

  const isRelative = joinedEl.dataset.relative === 'true';
  const nextRelative = !isRelative;
  joinedEl.dataset.relative = nextRelative;

  joinedEl.classList.add('fade');

  setTimeout(() => {
    joinedEl.textContent = nextRelative
      ? getRelativeTime(createdAt)
      : 'Joined ' + formatDate(createdAt);
    joinedEl.classList.remove('fade');
  }, 300);
}

function animateJoinedDate(joinedEl, createdAt) {
  if (!joinedEl || !createdAt) return;

  joinedEl.textContent = getRelativeTime(createdAt);
  joinedEl.dataset.relative = 'true';

  setTimeout(() => {
    if (joinedEl.dataset.relative !== 'true') return;
    joinedEl.classList.add('fade');

    setTimeout(() => {
      joinedEl.textContent = 'Joined ' + formatDate(createdAt);
      joinedEl.dataset.relative = 'false';
      joinedEl.classList.remove('fade');
    }, 300);
  }, 2000);
}

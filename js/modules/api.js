import { State, UI } from '../state.js';
import { createUserCard, createErrorCard, updateRepos } from './cards.js';
import { updateBackgroundColor, resetBackgroundColor, showLoading, hideLoading } from './ui.js';
import { addToRecent } from './recent.js';

const APIURL = 'https://api.github.com/users/';

export async function getUser(username) {
    showLoading();
    const totalStart = performance.now();

    try {
        const userStart = performance.now();
        const response = await fetch(APIURL + username);
        if (!response.ok) {
            const error = new Error('API Error');
            error.response = { status: response.status };
            throw error;
        }
        const data = await response.json();
        const userDuration = Math.round(performance.now() - userStart);

        // Remove any existing error cards on successful search
        const existingError = UI.cardStack.querySelector('.error-card');
        if (existingError) existingError.remove();

        document.querySelector('.container').classList.add('has-result');

        // Render card immediately with loading state for repos
        createUserCard(data, null, { user: userDuration, repos: 0, total: userDuration });
        updateBackgroundColor(data.avatar_url);
        addToRecent(data);

        // Fetch repos in background
        const reposStart = performance.now();
        const repos = await getRepos(username);
        const reposDuration = Math.round(performance.now() - reposStart);

        const totalDuration = Math.round(performance.now() - totalStart);

        State.currentUser = data;
        State.currentRepos = repos;
        State.userCache.set(data.login.toLowerCase(), { user: data, repos });

        // Update the existing card with repos
        updateRepos(data.login, repos, { user: userDuration, repos: reposDuration, total: totalDuration });

    } catch (err) {
        State.currentUser = null;
        State.currentRepos = null;
        document.querySelector('.container').classList.add('has-result');
        resetBackgroundColor();

        const endpoint = APIURL + username;
        if (err.response?.status === 404) {
            createErrorCard('User not found', `The username doesn't exist at <code style="font-size: 0.8em; opacity: 0.7;">${endpoint}</code>`);
        } else if (err.response?.status === 403) {
            createErrorCard('Rate limit exceeded', `GitHub API rate limit exceeded at <code style="font-size: 0.8em; opacity: 0.7;">${endpoint}</code>. Please try again in an hour or check the <a href="https://docs.github.com/rest/overview/resources-in-the-rest-api#rate-limiting" target="_blank" style="color: var(--accent-blue);">documentation</a>.`);
        } else {
            createErrorCard('Something went wrong', `Error fetching <code style="font-size: 0.8em; opacity: 0.7;">${endpoint}</code>. Please try again later.`);
        }
    } finally {
        hideLoading();
    }
}

export async function getRepos(username) {
    try {
        const response = await fetch(`${APIURL}${username}/repos?sort=updated&per_page=5`);
        if (!response.ok) throw new Error('Failed to fetch repos');
        return await response.json();
    } catch (err) {
        console.warn('Failed to fetch repositories:', err.message);
        return []; // Return empty array on error
    }
}

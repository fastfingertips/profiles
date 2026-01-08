import { State, UI } from '../state.js';
import { createUserCard, createErrorCard } from './cards.js';
import { updateBackgroundColor, resetBackgroundColor, showLoading, hideLoading } from './ui.js';
import { addToRecent } from './recent.js';

const APIURL = 'https://api.github.com/users/';

export async function getUser(username) {
    showLoading();

    try {
        const response = await fetch(APIURL + username);
        if (!response.ok) {
            const error = new Error('API Error');
            error.response = { status: response.status }; // Mimic axios error structure for compatibility
            throw error;
        }
        const data = await response.json();

        const repos = await getRepos(username);

        State.currentUser = data;
        State.currentRepos = repos;

        State.userCache.set(data.login.toLowerCase(), { user: data, repos });

        // Remove any existing error cards on successful search
        const existingError = UI.cardStack.querySelector('.error-card');
        if (existingError) existingError.remove(); // Direct removal since we don't import deleteCard to avoid cycle

        document.querySelector('.container').classList.add('has-result');
        createUserCard(data, repos);
        updateBackgroundColor(data.avatar_url);
        addToRecent(data);
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

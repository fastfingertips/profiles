export function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
}

export function formatNumber(num) {
    if (num >= 1000000) return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
    return num.toString();
}

export function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

export function getRelativeTime(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffYears = Math.floor(diffDays / 365);
    const diffMonths = Math.floor(diffDays / 30);

    const pluralize = (count, word) => `${count} ${word}${count > 1 ? 's' : ''}`;

    if (diffYears > 0) {
        const remainingMonths = Math.floor((diffDays % 365) / 30);
        const yearStr = pluralize(diffYears, 'year');
        return remainingMonths > 0
            ? `${yearStr}, ${pluralize(remainingMonths, 'month')} ago`
            : `${yearStr} ago`;
    }
    if (diffMonths > 0) return `${pluralize(diffMonths, 'month')} ago`;
    if (diffDays > 0) return `${pluralize(diffDays, 'day')} ago`;
    return 'Today';
}

export function getLangClass(language) {
    if (!language) return '';
    return 'lang-' + language.toLowerCase().replaceAll(/[^a-z]/g, '');
}

export function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

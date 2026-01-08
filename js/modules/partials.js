/**
 * Partials Loader
 * Dynamically loads HTML partials into elements with data-partial attribute
 */

async function loadPartial(element) {
    const partialPath = element.dataset.partial;
    if (!partialPath) return;

    try {
        const response = await fetch(partialPath);
        if (!response.ok) {
            console.warn(`Failed to load partial: ${partialPath}`);
            return;
        }
        const html = await response.text();

        // Replace the placeholder with the partial content
        element.outerHTML = html;
    } catch (err) {
        console.warn(`Error loading partial ${partialPath}:`, err.message);
    }
}

export async function loadPartials() {
    const partialElements = document.querySelectorAll('[data-partial]');

    // Load all partials in parallel
    await Promise.all(
        Array.from(partialElements).map(el => loadPartial(el))
    );
}

import { State, UI } from '../state.js';

export function showLoading() { UI.searchLoader.classList.add('active'); }
export function hideLoading() { UI.searchLoader.classList.remove('active'); }

export function extractDominantColor(imageUrl) {
    return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = 'Anonymous';

        img.onload = () => {
            const ctx = UI.colorCanvas.getContext('2d');
            const size = 100;
            UI.colorCanvas.width = size;
            UI.colorCanvas.height = size;
            ctx.drawImage(img, 0, 0, size, size);

            try {
                const imageData = ctx.getImageData(0, 0, size, size).data;
                const colors = [];

                for (let i = 0; i < imageData.length; i += 4) {
                    const r = imageData[i], g = imageData[i + 1], b = imageData[i + 2], a = imageData[i + 3];
                    if (a < 200) continue;

                    const max = Math.max(r, g, b), min = Math.min(r, g, b);
                    const brightness = (max + min) / 2;
                    const saturation = max === 0 ? 0 : (max - min) / max;

                    if (brightness < 40 || brightness > 220) continue;
                    if (saturation < 0.15) continue;

                    colors.push({ r, g, b, saturation, brightness });
                }

                if (colors.length === 0) {
                    resolve({ r: 88, g: 166, b: 255 });
                    return;
                }

                colors.sort((a, b) => b.saturation - a.saturation);
                const topColors = colors.slice(0, Math.max(10, Math.floor(colors.length * 0.2)));

                let r = 0, g = 0, b = 0;
                topColors.forEach(c => { r += c.r; g += c.g; b += c.b; });

                r = Math.round(r / topColors.length);
                g = Math.round(g / topColors.length);
                b = Math.round(b / topColors.length);

                const maxC = Math.max(r, g, b), minC = Math.min(r, g, b);
                if (maxC > minC) {
                    const factor = 1.3;
                    r = Math.min(255, Math.round(((r - minC) * factor) + minC));
                    g = Math.min(255, Math.round(((g - minC) * factor) + minC));
                    b = Math.min(255, Math.round(((b - minC) * factor) + minC));
                }

                resolve({ r, g, b });
            } catch (e) {
                console.warn('Failed to extract color from image:', e.message);
                resolve({ r: 88, g: 166, b: 255 }); // Default blue
            }
        };
        img.onerror = () => resolve({ r: 88, g: 166, b: 255 });
        img.src = imageUrl;
    });
}

export async function updateBackgroundColor(avatarUrl) {
    const color = await extractDominantColor(avatarUrl);
    const nextBg = State.activeBg === UI.bg1 ? UI.bg2 : UI.bg1;

    const p1 = { x: 50 + (Math.random() * 20 - 10), y: -40 + (Math.random() * 20 - 10) };
    const p2 = { x: 100 + (Math.random() * 10 - 5), y: 10 + (Math.random() * 20 - 10) };
    const p3 = { x: 0 + (Math.random() * 10 - 5), y: 90 + (Math.random() * 10 - 5) };
    const p4 = { x: 90 + (Math.random() * 20 - 10), y: 100 + (Math.random() * 20 - 10) };

    nextBg.style.background = `
    radial-gradient(ellipse 120% 100% at ${p1.x}% ${p1.y}%, rgba(${color.r}, ${color.g}, ${color.b}, 0.35), transparent 65%),
    radial-gradient(ellipse 90% 70% at ${p2.x}% ${p2.y}%, rgba(${color.r}, ${color.g}, ${color.b}, 0.25), transparent 55%),
    radial-gradient(ellipse 80% 60% at ${p3.x}% ${p3.y}%, rgba(${color.r}, ${color.g}, ${color.b}, 0.2), transparent 55%),
    radial-gradient(ellipse 60% 50% at ${p4.x}% ${p4.y}%, rgba(${color.r}, ${color.g}, ${color.b}, 0.15), transparent 50%)
  `;

    State.activeBg.classList.remove('bg-active');
    nextBg.classList.add('bg-active');
    State.activeBg = nextBg;
}

export function resetBackgroundColor() {
    const nextBg = State.activeBg === UI.bg1 ? UI.bg2 : UI.bg1;
    nextBg.style.background = `
    radial-gradient(ellipse 100% 80% at 50% -30%, rgba(88, 166, 255, 0.12), transparent 70%),
    radial-gradient(ellipse 80% 60% at 100% 20%, rgba(163, 113, 247, 0.1), transparent 60%)
  `;

    State.activeBg.classList.remove('bg-active');
    nextBg.classList.add('bg-active');
    State.activeBg = nextBg;
}

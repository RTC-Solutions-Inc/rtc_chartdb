export const colorOptions = [
    '#f43f5e', // Red.
    '#ec4899', // Pink.
    '#e879f9', // Magenta.
    '#a855f7', // Violet.
    '#6366f1', // Indigo.
    '#3b82f6', // Blue.
    '#38bdf8', // Sky.
    '#22d3ee', // Cyan.
    '#2dd4bf', // Teal.
    '#4ade80', // Green.
    '#a3e635', // Lime.
    '#facc15', // Yellow.
    '#fb923c', // Orange.
    '#d97706', // Copper.
    '#78716c', // Stone.
    '#94a3b8', // Slate.
];

export const randomColor = () => {
    return colorOptions[Math.floor(Math.random() * colorOptions.length)];
};

export const viewColor = '#b0b0b0';
export const materializedViewColor = '#7d7d7d';
export const defaultTableColor = '#3b82f6';
export const defaultAreaColor = '#a855f7';

import { createApp } from 'vue';
import Overlay from './Overlay.vue';

export const createOverlay = (onClick: () => void): HTMLElement => {
    const container = document.createElement('div');
    const app = createApp(Overlay, { onClick });
    app.mount(container);
    const el = container.firstElementChild;
    if (!el) throw new Error("Overlay mount failed");
    return el as HTMLElement;
};

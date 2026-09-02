import '@testing-library/jest-dom/vitest';
import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

// Unmount any rendered React trees between tests so state doesn't leak.
afterEach(() => {
  cleanup();
});

// jsdom doesn't implement matchMedia — several components/hooks in this app
// (and libraries like the PWA install hook) probe it defensively.
if (typeof window !== 'undefined' && !window.matchMedia) {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })) as unknown as typeof window.matchMedia;
}

// jsdom doesn't implement scrollTo — some components call it on mount/nav.
if (typeof window !== 'undefined' && !window.scrollTo) {
  window.scrollTo = vi.fn() as unknown as typeof window.scrollTo;
}

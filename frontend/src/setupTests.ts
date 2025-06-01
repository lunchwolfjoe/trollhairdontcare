import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

// Mock matchMedia for components that might use it (like Material UI)
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock environment variables (optional, but good practice)
// You might need to adjust these based on your actual env vars
const MOCK_ENV = {
  VITE_SUPABASE_URL: 'http://mock-supabase.co',
  VITE_SUPABASE_ANON_KEY: 'mock-anon-key',
  // Add other VITE_ variables your app uses
};

vi.stubGlobal('import.meta', { env: MOCK_ENV });

// Optional: Clean up after each test
// import { cleanup } from '@testing-library/react';
// afterEach(() => {
//   cleanup();
// }); 
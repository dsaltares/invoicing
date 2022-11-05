import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';
import React from 'react';

// https://jestjs.io/docs/manual-mocks#mocking-methods-which-are-not-implemented-in-jsdom
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // Deprecated
    removeListener: jest.fn(), // Deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// https://github.com/tailwindlabs/headlessui/blob/main/packages/%40headlessui-vue/src/components/dialog/dialog.test.ts#L37
class FakeInteractionObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
window.IntersectionObserver = FakeInteractionObserver;
global.IntersectionObserver = FakeInteractionObserver;

const originalLink = jest.requireActual('next/link');

jest.mock('next/link', () =>
  React.forwardRef(({ children, ...props }, ref) =>
    React.createElement(originalLink, {
      ...props,
      ref,
      children: React.createElement('a', { children, ...props }),
    })
  )
);

// https://github.com/inrupt/solid-client-authn-js/issues/1676
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

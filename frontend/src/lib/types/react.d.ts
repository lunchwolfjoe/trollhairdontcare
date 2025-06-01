import { ReactNode } from 'react';

declare module 'react' {
  interface ReactNode {
    [Symbol.iterator]?: IterableIterator<ReactNode>;
  }
}

export {}; 
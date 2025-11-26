import { renderToStaticMarkup } from 'react-dom/server';
import React from 'react';

export function renderHook<T>(hook: () => T) {
  let value: T | undefined;

  function TestComponent() {
    value = hook();
    return null;
  }

  // Bruk React.createElement i stedet for JSX
  renderToStaticMarkup(React.createElement(TestComponent));

  if (value === undefined) {
    throw new Error('Hook did not run');
  }

  return { result: { current: value } };
}

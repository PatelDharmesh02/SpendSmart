'use client';

import StyledComponentsRegistry from '../lib/registry';
import { ThemeRegistry } from '../lib/ThemeRegistry';
import { Provider } from 'react-redux';
import { store } from '../redux/store';

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <StyledComponentsRegistry>
        <ThemeRegistry>
          {children}
        </ThemeRegistry>
      </StyledComponentsRegistry>
    </Provider>
  );
}

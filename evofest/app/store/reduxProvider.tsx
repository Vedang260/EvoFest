// app/store/ReduxProvider.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from '../../lib/redux/store/store';
import { PageLoader } from '@/components/ui/loader';
import { TicketLoader } from '@/components/ui/ticketLoader';

export default function ReduxProvider({ children }: { children: React.ReactNode }) {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // Prevent hydration mismatch
    setIsHydrated(true);
  }, []);

  if (!isHydrated) return null;

  return (
    <Provider store={store}>
      <PersistGate loading={<TicketLoader />} persistor={persistor} onBeforeLift={() => new Promise((resolve) => setTimeout(resolve, 3000))}>
        {children}
      </PersistGate>
    </Provider>
  );
}
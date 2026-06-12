import React from 'react';

import ReactDOM from 'react-dom/client';
import { Mail } from 'lucide-react';

import { Button } from '@/components/ui/button';

import './index.css';

// Placeholder Step 1 — sostituito dall'app completa nello Step 3.
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <div className="flex h-screen items-center justify-center">
      <Button>
        <Mail data-testid="lucide-ok" />
        Email Builder
      </Button>
    </div>
  </React.StrictMode>,
);

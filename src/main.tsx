import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import Report from './pages/report';
import { AppSidebar } from './components/sideBar';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
      {/* Sidebar */}
      <AppSidebar />

      {/* Conteúdo Principal */}
      
        <Report />
  </StrictMode>,
);
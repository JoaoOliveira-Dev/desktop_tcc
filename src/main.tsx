import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router';
import './index.css';
import Dashboard from './pages/dashboard';
import Report from './pages/report';
import NotFound from './pages/notFound';
import { AppSidebar } from './components/sideBar';
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";

const App = () => (
  <SidebarProvider>
    <AppSidebar />
    <SidebarInset>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/report" element={<Report />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </SidebarInset>
  </SidebarProvider>
);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);
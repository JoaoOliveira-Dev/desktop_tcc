import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router";
import "./index.css";
import Dashboard from "./pages/dashboard";
import Report from "./pages/report";
import NotFound from "./pages/notFound";
import { AppSidebar } from "./components/sideBar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import ApiTester from "./pages/api";
import MeusProjetos from "./pages/myProjects";
import PayloadGenerator from "./pages/payloadGenerator";
import EncoderDecoder from "./pages/encoderDecorder";
import XSSPage from "./pages/xss";
import CSRFPage from "./pages/csrf";
import ClickJackingPage from "./pages/clickJacking";
import SubdomainTakeoverPage from "./pages/subdomainTakeover";
import PentestNotes from "./pages/notes";
import ForbidenBypassPage from "./pages/forbidenBypass";


const App = () => (
  <SidebarProvider>
    <AppSidebar />
    <SidebarInset>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/my-projects" element={<MeusProjetos />} />
        <Route path="/report" element={<Report />} />

        <Route path="/notes" element={<PentestNotes />} />
        <Route path="/notes/:projectId" element={<PentestNotes />} />

        <Route path="/api" element={<ApiTester />} />
        <Route path="/api/:projectId" element={<ApiTester />} />

        <Route path="/payload-generator" element={<PayloadGenerator />} />
        <Route path="/encoder-decoder" element={<EncoderDecoder />} />
        <Route path="/xss" element={<XSSPage />} />
        <Route path="/csrf" element={<CSRFPage />} />
        <Route path="/clickjacking" element={<ClickJackingPage />} />
        <Route path="/subdomain-takeover" element={<SubdomainTakeoverPage />} />
        <Route path="/forbiden-bypass" element={<ForbidenBypassPage />} />
        
        <Route path="*" element={<NotFound />} />
      </Routes>
    </SidebarInset>
  </SidebarProvider>
);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);

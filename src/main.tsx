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

const App = () => (
  <SidebarProvider>
    <AppSidebar />
    <SidebarInset>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/my-projects" element={<MeusProjetos />} />
        <Route path="/report" element={<Report />} />
        <Route path="/api" element={<ApiTester />} />
        <Route path="*" element={<NotFound />} />
        <Route path="/payload-generator" element={<PayloadGenerator />} />
        <Route path="/encoder-decoder" element={<EncoderDecoder />} />
        <Route path="/xss" element={<XSSPage />} />
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

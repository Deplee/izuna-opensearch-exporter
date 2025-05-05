import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "@/pages/Index";
import NotFound from "@/pages/NotFound";
import MetricsEndpoint from "@/pages/MetricsEndpoint";
import { ConfigProvider } from "@/contexts/ConfigContext";
import MetricsUpdater from './MetricsUpdater';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ConfigProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/metrics" element={<MetricsEndpoint />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
        <MetricsUpdater />
      </TooltipProvider>
    </ConfigProvider>
  </QueryClientProvider>
);

export default App;

import { BrowserRouter, Routes, Route, Navigate, NavLink, useLocation } from "react-router-dom";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";
import { AgentPanel } from "@/components/layout/AgentPanel";
import { NetworkWarningBanner } from "@/components/shared/NetworkWarningBanner";
import { wagmiConfig } from "@/lib/wagmi";

import DashboardPage from "@/pages/Dashboard";
import AllocationsPage from "@/pages/Allocations";
import RunwayPage from "@/pages/Runway";
import PayrollPage from "@/pages/Payroll";
import PoliciesPage from "@/pages/Policies";
import AgentPage from "@/pages/Agent";

const queryClient = new QueryClient();

function AppLayout() {
  const { pathname } = useLocation();
  const isApp = pathname !== "/";

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        {isApp ? (
          <div className="flex min-h-screen">
            <Sidebar />
            <div className="flex-1 flex flex-col min-w-0">
              <TopBar />
              <NetworkWarningBanner />
              <main className="flex-1 overflow-y-auto">
                <Routes>
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route path="/allocations" element={<AllocationsPage />} />
                  <Route path="/runway" element={<RunwayPage />} />
                  <Route path="/payroll" element={<PayrollPage />} />
                  <Route path="/policies" element={<PoliciesPage />} />
                  <Route path="/agent" element={<AgentPage />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
            </div>
            <AgentPanel />
          </div>
        ) : (
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        )}
        <Toaster />
      </QueryClientProvider>
    </WagmiProvider>
  );
}

function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-mono text-7xl text-primary">404</h1>
        <h2 className="mt-4 text-xl font-semibold">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">That route doesn't exist in this treasury.</p>
        <NavLink
          to="/dashboard"
          className="mt-6 inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground"
        >
          
          Back to dashboard
        </NavLink>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  );
}

"use client";

import React, { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Navbar } from "@/components/Navbar";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { FarmProvider } from "@/lib/FarmContext";
import AssistantModal from "@/components/AssistantModal";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <FarmProvider>
      <div className="flex min-h-screen bg-slate-50 font-sans">
        <Sidebar
          mobileOpen={mobileMenuOpen}
          onCloseMobile={() => setMobileMenuOpen(false)}
        />
        <div className="flex-1 flex flex-col min-w-0">
          <Navbar onToggleMobile={() => setMobileMenuOpen(!mobileMenuOpen)} />
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
            <ErrorBoundary>
              {children}
            </ErrorBoundary>
          </main>
        </div>
        <AssistantModal />
      </div>
    </FarmProvider>
  );
}

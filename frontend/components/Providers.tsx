"use client";

import React from "react";
import { AuthProvider } from "@/lib/AuthContext";
import { LocationProvider } from "@/lib/LocationContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <LocationProvider>
        {children}
      </LocationProvider>
    </AuthProvider>
  );
}

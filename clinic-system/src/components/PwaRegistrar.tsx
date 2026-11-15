"use client";

import { useEffect } from "react";

export function PwaRegistrar() {
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator && process.env.NODE_ENV === "production") {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => {
          console.log("Mena Clinic PWA ServiceWorker active:", reg.scope);
        })
        .catch((err) => {
          console.warn("PWA ServiceWorker registration skipped:", err);
        });
    }
  }, []);

  return null;
}


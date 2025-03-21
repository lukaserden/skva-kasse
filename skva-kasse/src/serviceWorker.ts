/// <reference lib="webworker" />


// 👇 Neue Zeile hinzufügen
declare let self: ServiceWorkerGlobalScope & { __WB_MANIFEST: any };


self.addEventListener("install", () => {
  console.log("Service Worker installiert.");
});

self.addEventListener("activate", () => {
  console.log("Service Worker aktiviert.");
});
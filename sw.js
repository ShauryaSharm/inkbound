// Offline cache. Bump VERSION whenever you change any app file so phones pick up the update.
const VERSION='inkbound-v2';
const CORE=['./','index.html','terms.js','words.js','manifest.webmanifest','icons/icon-192.png','icons/apple-touch-icon.png'];

self.addEventListener('install',e=>{e.waitUntil(caches.open(VERSION).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==VERSION).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});

// Network first for the app itself (so updates show up), cache fallback when offline.
// Cache first for Google Fonts.
self.addEventListener('fetch',e=>{
  const req=e.request;if(req.method!=='GET')return;
  const url=new URL(req.url);
  if(url.origin.includes('fonts.g')){
    e.respondWith(caches.open(VERSION).then(c=>c.match(req).then(hit=>hit||fetch(req).then(r=>{c.put(req,r.clone());return r}))));
    return;
  }
  if(url.origin!==location.origin)return;
  e.respondWith(fetch(req).then(r=>{if(r.ok){const cp=r.clone();caches.open(VERSION).then(c=>c.put(req,cp))}return r}).catch(()=>caches.match(req,{ignoreSearch:true}).then(h=>h||caches.match('index.html'))));
});

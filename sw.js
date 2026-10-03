const CACHE_NAME="stumpy-selector-v1";
const ASSETS=[
  "./",
  "./index.html",
  "./manifest.json",
  "./icon-512.png"
];

self.addEventListener("install",event=>{
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache=>cache.addAll(ASSETS)).catch(()=>{})
  );
});

self.addEventListener("activate",event=>{
  event.waitUntil(
    caches.keys().then(keys=>Promise.all(
      keys.filter(k=>k!==CACHE_NAME).map(k=>caches.delete(k))
    )).then(()=>self.clients.claim())
  );
});

self.addEventListener("fetch",event=>{
  const req=event.request;
  // Only handle GET requests from our own origin
  if(req.method!=="GET") return;
  const url=new URL(req.url);
  if(url.origin!==location.origin) return;

  // Network-first, fall back to cache when offline
  event.respondWith(
    fetch(req).then(res=>{
      // Cache a copy of successful responses
      if(res && res.status===200){
        const clone=res.clone();
        caches.open(CACHE_NAME).then(cache=>cache.put(req,clone)).catch(()=>{});
      }
      return res;
    }).catch(()=>caches.match(req).then(cached=>cached||caches.match("./index.html")))
  );
});

/* Miraculous Land PWA: atomic incremental cache updates */
const CACHE_PREFIX = 'miraculous-land-pwa-';
const LEGACY_CACHE = 'miraculous-land-pwa-v1';
const META_CACHE = 'miraculous-land-pwa-meta-v2';
const BASE_URL = self.registration.scope;
const APP_URL = new URL('./', BASE_URL).href;
const INDEX_URL = new URL('index.html', BASE_URL).href;
const MANIFEST_URL = new URL('manifest.json', BASE_URL).href;
const ACTIVE_KEY = new URL('__ml_active_cache_v2__', BASE_URL).href;
const ICON_URLS = ['icons/icon-192.png', 'icons/icon-512.png'].map(path => new URL(path, BASE_URL).href);
const THREE_URL = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
let refreshPromise = null;

async function digestHex(buffer) {
  const digest = await crypto.subtle.digest('SHA-256', buffer);
  return Array.from(new Uint8Array(digest), b => b.toString(16).padStart(2, '0')).join('');
}

function cacheBustedUrl(url) {
  const fresh = new URL(url);
  fresh.searchParams.set('t', String(Date.now()));
  return fresh.href;
}

async function fetchWithTimeout(url, options = {}, timeoutMs = 10000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, {...options, signal: controller.signal});
  } finally {
    clearTimeout(timer);
  }
}

async function notifyClients(type, extra = {}) {
  const clients = await self.clients.matchAll({type: 'window', includeUncontrolled: true});
  for (const client of clients) client.postMessage({type, ...extra});
}

async function activeCacheName() {
  const meta = await caches.open(META_CACHE);
  const response = await meta.match(ACTIVE_KEY);
  return response ? (await response.text()) : null;
}

async function cachedResponse(request) {
  const active = await activeCacheName();
  const names = await caches.keys();
  const ordered = [];
  if (active && names.includes(active)) ordered.push(active);
  for (const name of names) {
    if ((name.startsWith(CACHE_PREFIX) || name === LEGACY_CACHE) && !ordered.includes(name)) ordered.push(name);
  }
  for (const name of ordered) {
    const response = await (await caches.open(name)).match(request);
    if (response) return response;
  }
  return null;
}

async function setActiveCacheName(name) {
  const meta = await caches.open(META_CACHE);
  await meta.put(ACTIVE_KEY, new Response(name, {headers: {'Content-Type': 'text/plain'}}));
}

async function refreshChangedAssets(announce = true) {
  if (refreshPromise) return refreshPromise;
  refreshPromise = (async () => {
    if (announce) await notifyClients('ML_UPDATE_CHECKING');
    let manifestResponse, manifest;
    try {
      manifestResponse = await fetchWithTimeout(cacheBustedUrl(MANIFEST_URL), {cache: 'no-store'}, 4000);
      if (!manifestResponse.ok) throw new Error('Manifest request failed');
      manifest = await manifestResponse.clone().json();
      if (!manifest.files || typeof manifest.files !== 'object') throw new Error('Invalid update manifest');
    } catch (_) {
      if (announce) await notifyClients('ML_UPDATE_OFFLINE');
      return [];
    }

    const currentName = await activeCacheName();
    const oldName = currentName || (await caches.has(LEGACY_CACHE) ? LEGACY_CACHE : null);
    const oldCache = oldName ? await caches.open(oldName) : null;
    const oldManifestResponse = oldCache ? await oldCache.match(MANIFEST_URL) : null;
    const oldManifest = oldManifestResponse ? await oldManifestResponse.json().catch(() => null) : null;
    const entries = Object.entries(manifest.files);
    const missing = [];
    for (const [name, info] of entries) {
      const assetUrl = new URL(info.url || name, BASE_URL).href;
      const oldHash = oldManifest && oldManifest.files && oldManifest.files[name] && oldManifest.files[name].sha256;
      const existing = oldCache ? await oldCache.match(assetUrl) : null;
      if (oldHash !== info.sha256 || !existing) missing.push(name);
    }

    if (!missing.length && oldName) {
      await oldCache.put(MANIFEST_URL, manifestResponse.clone());
      await setActiveCacheName(oldName);
      if (announce) await notifyClients('ML_UPDATE_DONE');
      return [];
    }

    if (announce && missing.length) await notifyClients('ML_UPDATE_DOWNLOADING', {files: missing});
    const fingerprintInput = entries.map(([name, info]) => name + ':' + info.sha256).sort().join('|');
    const fingerprint = (await digestHex(new TextEncoder().encode(fingerprintInput))).slice(0, 20);
    const nextName = CACHE_PREFIX + fingerprint + '-' + Date.now().toString(36);
    
    const nextCache = await caches.open(nextName);

    try {
      if (oldCache) {
        for (const request of await oldCache.keys()) {
          const response = await oldCache.match(request);
          if (response) await nextCache.put(request, response);
        }
      }
      const changedFiles = [];
      for (const [name, info] of entries) {
        const assetUrl = new URL(info.url || name, BASE_URL).href;
        const previousHash = oldManifest && oldManifest.files && oldManifest.files[name] && oldManifest.files[name].sha256;
        const cached = await nextCache.match(assetUrl);
        if (cached && previousHash === info.sha256) continue;
        const response = await fetchWithTimeout(cacheBustedUrl(assetUrl), {cache: 'no-store'}, 15000);
        if (!response.ok) throw new Error('Could not download ' + name);
        const actualHash = await digestHex(await response.clone().arrayBuffer());
        if (actualHash.toLowerCase() !== String(info.sha256).toLowerCase()) throw new Error('SHA-256 mismatch for ' + name);
        await nextCache.put(assetUrl, response.clone());
        if (name === 'index.html') await nextCache.put(APP_URL, response.clone());
        changedFiles.push(name);
      }
      await nextCache.put(MANIFEST_URL, manifestResponse.clone());
      const index = await nextCache.match(INDEX_URL);
      if (index) await nextCache.put(APP_URL, index.clone());
      // Activate only after all changed files are downloaded and verified.
      await setActiveCacheName(nextName);
      if (announce) await notifyClients('ML_UPDATE_READY', {files: changedFiles.length ? changedFiles : missing});
      return changedFiles;
    } catch (_) {
      await caches.delete(nextName);
      if (announce) await notifyClients('ML_UPDATE_FAILED');
      return [];
    }
  })();
  try { return await refreshPromise; }
  finally { refreshPromise = null; }
}

async function cacheStaticResources() {
  const active = await activeCacheName();
  if (!active) return;
  const cache = await caches.open(active);
  for (const url of [...ICON_URLS, THREE_URL]) {
    if (await cache.match(url)) continue;
    try {
      const response = await fetchWithTimeout(url, url === THREE_URL ? {mode: 'no-cors'} : {}, 5000);
      if (response.ok || response.type === 'opaque') await cache.put(url, response);
    } catch (_) {}
  }
}

self.addEventListener('message', event => {
  const data = event.data || {};
  if (data.type === 'ML_CHECK_UPDATES') {
    event.waitUntil(refreshChangedAssets(true).catch(() => []));
  }
});

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    try { await refreshChangedAssets(false); } catch (_) {}
    try { await cacheStaticResources(); } catch (_) {}
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    await self.clients.claim();
    try { await cacheStaticResources(); } catch (_) {}
  })());
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  if (request.mode === 'navigate') {
    event.waitUntil(refreshChangedAssets(true).catch(() => {}));
    event.respondWith((async () => {
      const cached = await cachedResponse(APP_URL) || await cachedResponse(INDEX_URL);
      if (cached) return cached;
      return fetch(request);
    })());
    return;
  }
  event.respondWith((async () => {
    const cached = await cachedResponse(request);
    if (cached) return cached;
    const response = await fetch(request);
    if (response.ok || response.type === 'opaque') {
      const active = await activeCacheName();
      if (active) {
        try { await (await caches.open(active)).put(request, response.clone()); } catch (_) {}
      }
    }
    return response;
  })().catch(async () => (await cachedResponse(request)) || Response.error()));
});

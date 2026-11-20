/* Miraculous Land PWA: incremental offline cache */
const CACHE_NAME = 'miraculous-land-pwa-v1';
const BASE_URL = self.registration.scope;
const APP_URL = new URL('./', BASE_URL).href;
const INDEX_URL = new URL('index.html', BASE_URL).href;
const MANIFEST_URL = new URL('manifest.json', BASE_URL).href;
const META_URL = new URL('__ml_cached_update_manifest__', BASE_URL).href;
const ICON_URLS = ['icons/icon-192.png', 'icons/icon-512.png'].map(path => new URL(path, BASE_URL).href);

async function digestHex(buffer) {
  const digest = await crypto.subtle.digest('SHA-256', buffer);
  return Array.from(new Uint8Array(digest), b => b.toString(16).padStart(2, '0')).join('');
}

async function refreshChangedAssets(notifyClients) {
  const cache = await caches.open(CACHE_NAME);
  const oldMetaResponse = await cache.match(META_URL);
  const oldManifest = oldMetaResponse ? await oldMetaResponse.json() : null;

  let manifest;
  try {
    const response = await fetch(MANIFEST_URL, {cache: 'no-store'});
    if (!response.ok) throw new Error('Update manifest unavailable');
    manifest = await response.clone().json();
    await cache.put(MANIFEST_URL, response.clone());
  } catch (error) {
    if (!oldManifest) throw error;
    return [];
  }

  const changed = [];
  for (const [name, info] of Object.entries(manifest.files || {})) {
    const assetUrl = new URL(info.url || name, BASE_URL).href;
    const previousHash = oldManifest && oldManifest.files &&
      oldManifest.files[name] && oldManifest.files[name].sha256;
    const cached = await cache.match(assetUrl);

    // An unchanged file is copied forward in the existing cache and is not downloaded again.
    if (cached && previousHash === info.sha256) continue;

    const response = await fetch(assetUrl, {cache: 'no-store'});
    if (!response.ok) throw new Error('Could not download ' + name);
    const actualHash = await digestHex(await response.clone().arrayBuffer());
    if (actualHash.toLowerCase() !== String(info.sha256).toLowerCase()) {
      throw new Error('Hash check failed for ' + name);
    }

    await cache.put(assetUrl, response.clone());
    if (name === 'index.html') await cache.put(APP_URL, response.clone());
    changed.push(name);
  }

  await cache.put(META_URL, new Response(JSON.stringify(manifest), {
    headers: {'Content-Type': 'application/json'}
  }));
  if (!(await cache.match(APP_URL))) {
    const index = await cache.match(INDEX_URL);
    if (index) await cache.put(APP_URL, index.clone());
  }

  if (notifyClients && changed.length) {
    const clients = await self.clients.matchAll({type: 'window', includeUncontrolled: true});
    for (const client of clients) client.postMessage({type: 'ML_ASSETS_UPDATED', files: changed});
  }
  return changed;
}

async function cacheIcons() {
  const cache = await caches.open(CACHE_NAME);
  for (const url of ICON_URLS) {
    if (await cache.match(url)) continue;
    const response = await fetch(url);
    if (response.ok) await cache.put(url, response);
  }
}

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    await refreshChangedAssets(false);
    await cacheIcons();
    const cache = await caches.open(CACHE_NAME);
    const index = await cache.match(INDEX_URL);
    if (index) await cache.put(APP_URL, index.clone());
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    await self.clients.claim();
    const cache = await caches.open(CACHE_NAME);
    const index = await cache.match(INDEX_URL);
    if (index) await cache.put(APP_URL, index.clone());
  })());
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) {
    // Cache the Three.js CDN script after its first successful online load.
    event.respondWith((async () => {
      const cache = await caches.open(CACHE_NAME);
      const cached = await cache.match(request);
      if (cached) return cached;
      const response = await fetch(request);
      if (response.ok || response.type === 'opaque') await cache.put(request, response.clone());
      return response;
    })().catch(() => caches.match(request)));
    return;
  }

  if (request.mode === 'navigate') {
    event.waitUntil(refreshChangedAssets(true).catch(() => {}));
    event.respondWith((async () => {
      const cache = await caches.open(CACHE_NAME);
      return (await cache.match(APP_URL)) ||
        (await cache.match(INDEX_URL)) ||
        fetch(request);
    })());
    return;
  }

  if (url.href === MANIFEST_URL) {
    event.respondWith((async () => {
      const cache = await caches.open(CACHE_NAME);
      try {
        const response = await fetch(request, {cache: 'no-store'});
        if (response.ok) await cache.put(MANIFEST_URL, response.clone());
        return response;
      } catch (_) {
        return (await cache.match(MANIFEST_URL)) || Response.error();
      }
    })());
    return;
  }

  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(request);
    if (cached) return cached;
    const response = await fetch(request);
    if (response.ok) await cache.put(request, response.clone());
    return response;
  })());
});

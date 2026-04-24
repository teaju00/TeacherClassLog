// Service Worker for 학생 관찰 일지 PWA
const CACHE_NAME = 'class-log-v2';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/icons/icon-192.svg',
  '/icons/icon-512.svg',
  'https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;600;700&display=swap',
  'https://cdn.tailwindcss.com',
  'https://cdn.jsdelivr.net/npm/chart.js',
];

// Install: 핵심 리소스를 캐시에 저장
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Activate: 이전 버전 캐시 삭제
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch: 네트워크 우선, 실패 시 캐시 폴백 (Network-First 전략)
self.addEventListener('fetch', (event) => {
  // Firebase/Google API 요청은 캐싱하지 않음
  if (event.request.url.includes('firebaseio.com') ||
      event.request.url.includes('googleapis.com/identitytoolkit') ||
      event.request.url.includes('accounts.google.com') ||
      event.request.url.includes('firestore.googleapis.com')) {
    return;
  }

  event.waitUntil(
    (async () => {})()
  );

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // 정상 응답이면 캐시에 저장 후 반환
        if (response && response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // 네트워크 실패 시 캐시에서 반환
        return caches.match(event.request);
      })
  );
});

// Service Worker for 常州图文快印门店报表
// 版本号：每次修改代码后递增此版本号
const CACHE_NAME = 'cz-print-report-v5';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
];

// Install - 预缓存核心文件
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    }).then(() => {
      // 立即激活，不等待旧SW退出
      return self.skipWaiting();
    })
  );
});

// Activate - 清除旧版本缓存
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => {
          console.log('清除旧缓存:', key);
          return caches.delete(key);
        })
      );
    }).then(() => {
      // 立即接管所有客户端页面
      return self.clients.claim();
    })
  );
});

// Fetch - Network First 策略（确保代码更新后立即生效）
self.addEventListener('fetch', (event) => {
  // 跳过非GET请求
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Supabase API 请求：直接走网络，不缓存
  if (url.hostname.includes('supabase.co')) {
    event.respondWith(
      fetch(event.request).catch(() => {
        return new Response('网络不可用', { status: 503 });
      })
    );
    return;
  }

  // 同源请求：Network First
  if (url.origin === location.origin) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // 网络成功，更新缓存
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, clone);
            });
          }
          return response;
        })
        .catch(() => {
          // 网络失败，使用缓存
          return caches.match(event.request).then((cached) => {
            if (cached) return cached;
            // 导航请求返回缓存的index.html
            if (event.request.mode === 'navigate') {
              return caches.match('./index.html');
            }
            return new Response('离线模式', { status: 200 });
          });
        })
    );
    return;
  }

  // 跨域请求（如CDN）
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((response) => {
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, clone);
          });
        }
        return response;
      }).catch(() => {
        return new Response('离线', { status: 200 });
      });
    })
  );
});

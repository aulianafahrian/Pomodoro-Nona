self.addEventListener('install', event => {
    event.waitUntil(
      caches.open('my-cache').then(cache => {
        return cache.addAll([
          '/',
          '/index.html',
          '/styles.css',
          '/assets/images/nona-cute.png',
          '/assets/js/main.js',
        ]);
      })
    );
  });
  
  self.addEventListener('activate', event => {
    console.log('Service Worker is active!');
  });
  
  // Menangani push event untuk menampilkan notifikasi
  self.addEventListener('push', event => {
    const options = {
      body: event.data.text(),
      icon: '/assets/images/nona-cute.png',
      badge: '/assets/images/nona-cute.png',
    };
  
    event.waitUntil(
      self.registration.showNotification('Nona Pomodoro', options)
    );
  });
  
  // Menangani klik pada notifikasi
  self.addEventListener('notificationclick', event => {
    event.notification.close();
  
    event.waitUntil(
      clients.openWindow('/') // Membuka tab aplikasi saat klik notifikasi
    );
  });
  
// web/public/firebase-messaging-sw.js
importScripts('https://www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.13.2/firebase-messaging-compat.js');

// 🔥 Paste your real Firebase config here
const firebaseConfig = {
  apiKey: 'AIzaSyAEkppJ0aIOzt9C26ISw-55RdvbE0p9J_o',
  authDomain: 'spikilishi.firebaseapp.com',
  projectId: 'spikilishi',
  storageBucket: 'spikilishi.firebasestorage.app',
  messagingSenderId: '604468936916',
  appId: '1:604468936916:web:4fda18ec62347d5995bb41',
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

messaging.onBackgroundMessage(function (payload) {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/favicon.png',
  };
  self.registration.showNotification(notificationTitle, notificationOptions);
});

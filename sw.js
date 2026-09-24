const CACHE_NAME = "disiplin-cache-v1";
const urlsToCache = [
    "./",
    "./index.html",
    "./style.css",
    "./script.js"
];

self.addEventListener("install", event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return cache.addAll(urlsToCache);
        })
    );
});

self.addEventListener("fetch", event => {
    event.respondWith(
        caches.match(event.request).then(response => {
            return response || fetch(event.request);
        })
    );
});

/* =========================================================
GÜN TÜRÜNÜ BELİRLE (HAFTA İÇİ / HAFTA SONU)
========================================================= */
function setupTasksForToday() {
    const dayOfWeek = getToday().getDay(); // 0: Pazar, 6: Cumartesi
    const isWeekend = (dayOfWeek === 0 || dayOfWeek === 6);

    /* 1. TÜM KUTULARI (BÖLÜMLERİ) YÖNET */
    const weekendBoxes = document.querySelectorAll(".weekend-box");
    const weekdayBoxes = document.querySelectorAll(".weekday-box");

    // Hafta sonu kutularını ayarla (Hafta sonuysa göster, değilse gizle)
    weekendBoxes.forEach(box => {
        box.style.display = isWeekend ? "" : "none";
    });

    // Hafta içi kutularını ayarla (Hafta sonuysa gizle, değilse göster)
    weekdayBoxes.forEach(box => {
        box.style.display = isWeekend ? "none" : "";
    });

    /* 2. TEKİL GÖREVLERİ YÖNET (Kutu içindeki küçük görev etiketleri için) */
    const allTaskLabels = document.querySelectorAll(".task-check");
    allTaskLabels.forEach(label => {
        if (label.classList.contains("weekend-only")) {
            label.style.display = isWeekend ? "flex" : "none";
        } else if (label.classList.contains("weekday-only")) {
            label.style.display = isWeekend ? "none" : "flex";
        } else {
            // Özel bir class yoksa varsayılan ayarlara dön
            if(label.style.display === "none") label.style.display = "flex"; 
        }
    });

    /* 3. SADECE EKRANDA GÖRÜNEN GÖREVLERİ SAYIMA DAHİL ET (PRO YÖNTEM) */
    checkboxes = Array.from(document.querySelectorAll(".routine-cb")).filter(cb => {
        /* offsetParent === null demek; element CSS ile gizlenmiş demektir. 
           Bu sayede gizli kutuların içindeki checkbox'lar toplam göreve dahil edilmez! */
        return cb.offsetParent !== null; 
    });
    
    totalCount = checkboxes.length;
    if (totalCountElement) {
        totalCountElement.textContent = totalCount;
    }
}
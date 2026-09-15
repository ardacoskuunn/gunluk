/* =========================================
   GÜNLÜK DİSİPLİN PANELİ - GÜNCELLENMİŞ
   ========================================= */

// 1. TARİH VE GÜN ANAHTARI YÖNETİMİ
const currentDateElement = document.getElementById("currentDate");
const today = new Date();

function getDateKey(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

const currentDateKey = getDateKey(today);

if (currentDateElement) {
    const dateText = today.toLocaleDateString("tr-TR", {
        weekday: "long", year: "numeric", month: "long", day: "numeric"
    });
    currentDateElement.textContent = dateText.toUpperCase();
}

// 2. CHECKBOX'LARI BUL
const checkboxes = document.querySelectorAll(".routine-cb");
const totalCount = checkboxes.length;
const totalCountElement = document.getElementById("totalCount");
if (totalCountElement) totalCountElement.textContent = totalCount;

// 3. GECE YARISI HATASI (MIDNIGHT BUG) KONTROLÜ VE VERİ ÇEKME
const savedDate = localStorage.getItem("savedDate");
let savedTasks = [];

if (savedDate !== currentDateKey) {
    // Yeni güne geçilmişse eski görevleri ve değerlendirmeyi sıfırla
    localStorage.removeItem("dailyTasks");
    localStorage.removeItem("dailyEvaluation");
    localStorage.setItem("savedDate", currentDateKey);
    savedTasks = [];
} else {
    // Aynı gün içindeysek kayıtlı görevleri getir
    try {
        savedTasks = JSON.parse(localStorage.getItem("dailyTasks")) || [];
    } catch (error) {
        savedTasks = [];
    }
}

// Daha önce işaretlenen görevleri ekrana yansıt
checkboxes.forEach((box, index) => {
    box.checked = savedTasks[index] === true;
});

// 4. GÜNLÜK SERİ DEĞİŞKENLERİ
let streak = Number(localStorage.getItem("streak")) || 0;
let lastCompletedDate = localStorage.getItem("lastCompletedDate");

function updateStreakDisplay() {
    const streakElement = document.getElementById("streak");
    if (streakElement) streakElement.textContent = streak;
}

// 5. GÖREVLERİ GÜNCELLE VE PUAN HESAPLA
function updateTasks() {
    let completed = 0;

    checkboxes.forEach(box => {
        const content = box.closest(".content");
        if (box.checked) {
            completed++;
            if (content) content.classList.add("completed");
        } else {
            if (content) content.classList.remove("completed");
        }
    });

    // Görev durumunu kaydet
    const taskState = Array.from(checkboxes).map(box => box.checked);
    localStorage.setItem("dailyTasks", JSON.stringify(taskState));
    localStorage.setItem("savedDate", currentDateKey); // Garantiye almak için tarihi tekrar kaydet

    // Puan hesapla
    let percentage = 0;
    if (totalCount > 0) {
        percentage = Math.round((completed / totalCount) * 100);
    }

    // Arayüzü güncelle
    document.getElementById("score").textContent = percentage + "/100";
    document.getElementById("completedCount").textContent = completed;
    document.getElementById("progressFill").style.width = percentage + "%";
    document.getElementById("reportCompleted").textContent = completed;
    document.getElementById("reportRemaining").textContent = totalCount - completed;
    document.getElementById("reportScore").textContent = percentage;

    const progressText = document.getElementById("progressText");
    if (progressText) {
        if (percentage === 0) progressText.textContent = "Güne başlayalım.";
        else if (percentage < 30) progressText.textContent = "Başlangıç yapıldı. Devam et.";
        else if (percentage < 60) progressText.textContent = "İyi gidiyorsun. Planı bırakma.";
        else if (percentage < 90) progressText.textContent = "Günün büyük kısmı tamamlandı.";
        else if (percentage < 100) progressText.textContent = "Son görevler kaldı. Tamamla.";
        else progressText.textContent = "★ BUGÜNÜN TÜM GÖREVLERİ TAMAMLANDI ★";
    }
}

// Event Listener Ekle
checkboxes.forEach(box => {
    box.addEventListener("change", updateTasks);
});

// 6. GÜN SONU DEĞERLENDİRMESİ VE SERİ (STREAK) MANTIĞI
function setEvaluation(answer) {
    const result = document.getElementById("evaluationResult");
    if (!result) return;

    // Tüm görevler yapıldı mı kontrol et
    const allCompleted = Array.from(checkboxes).every(box => box.checked);

    if (answer === "evet") {
        if (!allCompleted) {
            result.textContent = "⚠ Tüm görevleri tamamlamadan günü başarılı kapatamazsın!";
            return;
        }

        result.textContent = "✓ Harika! Bugünkü planına sadık kaldın.";
        localStorage.setItem("dailyEvaluation", "evet");

        // Seri (Streak) Artırma İşlemi - Sadece gün kapandığında artar
        if (lastCompletedDate !== currentDateKey) {
            if (lastCompletedDate) {
                const previousDate = new Date(lastCompletedDate);
                const currentDate = new Date(currentDateKey);
                // Gün farkını hesapla
                const difference = Math.round((currentDate - previousDate) / (1000 * 60 * 60 * 24));

                if (difference === 1) {
                    streak++; // Dün de yapmış, seriyi artır
                } else if (difference > 1) {
                    streak = 1; // Arada gün atlanmış, seriyi sıfırla ve 1'den başla
                }
            } else {
                streak = 1; // İlk defa tamamlanıyor
            }

            lastCompletedDate = currentDateKey;
            localStorage.setItem("streak", streak);
            localStorage.setItem("lastCompletedDate", lastCompletedDate);
            updateStreakDisplay();
        }

    } else {
        result.textContent = "→ Sorun değil. Yarın daha iyi bir plan uygula.";
        localStorage.setItem("dailyEvaluation", "hayir");
    }
}

// Kayıtlı değerlendirme varsa geri yükle
const savedEvaluation = localStorage.getItem("dailyEvaluation");
if (savedEvaluation) {
    // Sadece arayüze yazdırmak için (streak'i tekrar artırmaması için kısa yol)
    const result = document.getElementById("evaluationResult");
    if (savedEvaluation === "evet") {
        result.textContent = "✓ Harika! Bugünkü planına sadık kaldın.";
    } else {
        result.textContent = "→ Sorun değil. Yarın daha iyi bir plan uygula.";
    }
}

// 7. GÜNÜ SIFIRLA BUTONU
function resetDay() {
    const confirmReset = confirm("Bugünkü tüm görevler sıfırlanacak. Emin misin?");
    if (!confirmReset) return;

    checkboxes.forEach(box => box.checked = false);
    localStorage.removeItem("dailyTasks");
    localStorage.removeItem("dailyEvaluation");
    
    const evaluationResult = document.getElementById("evaluationResult");
    if (evaluationResult) evaluationResult.textContent = "";

    updateTasks();
}

// 8. SCROLL ANİMASYONU
const timelineItems = document.querySelectorAll(".timeline-item");

if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("show");
            }
        });
    }, { threshold: 0.15 });

    timelineItems.forEach(item => observer.observe(item));
} else {
    timelineItems.forEach(item => item.classList.add("show"));
}

// Başlangıç değerlerini yükle
updateTasks();
updateStreakDisplay();

// 9. ANALOG + DİJİTAL HİBRİT SAAT
function updateAnalogClock() {
    const hourHand = document.getElementById('hourHand');
    const minuteHand = document.getElementById('minuteHand');
    const secondHand = document.getElementById('secondHand');
    const innerDigital = document.getElementById('innerDigital'); // Dijital ekranı seçtik
    
    if (!hourHand || !minuteHand || !secondHand) return;

    const now = new Date();
    const seconds = now.getSeconds();
    const minutes = now.getMinutes();
    const hours = now.getHours();

    // İbre açıları
    const secondDegrees = (seconds / 60) * 360;
    const minuteDegrees = ((minutes + seconds / 60) / 60) * 360;
    const hourDegrees = ((hours % 12 + minutes / 60) / 12) * 360;

    // CSS transform ile ibreleri döndür
    secondHand.style.transform = `rotate(${secondDegrees}deg)`;
    minuteHand.style.transform = `rotate(${minuteDegrees}deg)`;
    hourHand.style.transform = `rotate(${hourDegrees}deg)`;

    // Dijital ekranı güncelle (Örn: 14:05)
    if (innerDigital) {
        const digitalH = String(hours).padStart(2, '0');
        const digitalM = String(minutes).padStart(2, '0');
        innerDigital.textContent = `${digitalH}:${digitalM}`;
    }
}

// Saati başlat ve saniyede bir güncelle
updateAnalogClock();
setInterval(updateAnalogClock, 1000);
/* =========================================================
GÜNLÜK DİSİPLİN PANELİ
JAVASCRIPT
========================================================= */

/* =========================================================
ELEMENTLER
========================================================= */

const currentDateElement =
document.getElementById("currentDate");

const checkboxes =
document.querySelectorAll(".routine-cb");

const totalCount =
checkboxes.length;

const totalCountElement =
document.getElementById("totalCount");

const scoreElement =
document.getElementById("score");

const completedCountElement =
document.getElementById("completedCount");

const progressFillElement =
document.getElementById("progressFill");

const progressTextElement =
document.getElementById("progressText");

const reportCompletedElement =
document.getElementById("reportCompleted");

const reportRemainingElement =
document.getElementById("reportRemaining");

const reportScoreElement =
document.getElementById("reportScore");

const evaluationResultElement =
document.getElementById("evaluationResult");

const streakElement =
document.getElementById("streak");

const innerDigitalElement =
document.getElementById("innerDigital");

const hourHandElement =
document.getElementById("hourHand");

const minuteHandElement =
document.getElementById("minuteHand");

const secondHandElement =
document.getElementById("secondHand");

/* =========================================================
TARİH
========================================================= */

function getDateKey(date) {

const year =
    date.getFullYear();

const month =
    String(date.getMonth() + 1)
        .padStart(2, "0");

const day =
    String(date.getDate())
        .padStart(2, "0");

return `${year}-${month}-${day}`;

}

function getToday() {
return new Date();
}

let today = getToday();

let currentDateKey =
getDateKey(today);

/* Tarihi ekrana yaz */

function updateDateDisplay() {


if (!currentDateElement) {
    return;
}

const dateText =
    today.toLocaleDateString(
        "tr-TR",
        {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric"
        }
    );

currentDateElement.textContent =
    dateText.toUpperCase();


}

/* =========================================================
GÖREV SAYISI
========================================================= */

if (totalCountElement) {
totalCountElement.textContent = totalCount;
}

/* =========================================================
GÜNLÜK VERİLERİ YÜKLE
========================================================= */

let savedDate =
localStorage.getItem("savedDate");

let savedTasks = [];

/*
Yeni güne geçildiyse:
- Görevleri temizle
- Değerlendirmeyi temizle
Ancak streak bilgisine dokunma.

*/

if (savedDate !== currentDateKey) {

localStorage.removeItem("dailyTasks");

localStorage.removeItem("dailyEvaluation");

localStorage.setItem(
    "savedDate",
    currentDateKey
);

savedTasks = [];


} else {


try {

    savedTasks =
        JSON.parse(
            localStorage.getItem("dailyTasks")
        ) || [];

} catch (error) {

    savedTasks = [];

}


}

/* Kayıtlı görevleri checkbox'lara aktar */

checkboxes.forEach(
(box, index) => {

    box.checked =
    savedTasks[index] === true;

}

);

/* =========================================================
STREAK
========================================================= */

let streak =
Number(
localStorage.getItem("streak")
) || 0;

let lastCompletedDate =
localStorage.getItem(
"lastCompletedDate"
);

function updateStreakDisplay() {


if (!streakElement) {
    return;
}

streakElement.textContent =
    streak;

}

/* =========================================================
GÖREVLERİ GÜNCELLE
========================================================= */

function updateTasks() {

let completed = 0;


/*
    Tamamlanan görevleri say
*/

checkboxes.forEach(
    (box) => {

        const content =
            box.closest(".content");


        if (box.checked) {

            completed++;

            if (content) {
                content.classList.add(
                    "completed"
                );
            }

        } else {

            if (content) {
                content.classList.remove(
                    "completed"
                );
            }

        }

    }
);


/*
    Görevleri kaydet
*/

const taskState =
    Array.from(
        checkboxes
    ).map(
        box => box.checked
    );


localStorage.setItem(
    "dailyTasks",
    JSON.stringify(taskState)
);

localStorage.setItem(
    "savedDate",
    currentDateKey
);


/*
    Yüzde hesapla
*/

let percentage = 0;


if (totalCount > 0) {

    percentage =
        Math.round(
            (completed / totalCount) * 100
        );

}


/*
    Ana puan
*/

if (scoreElement) {

    scoreElement.textContent =
        `${percentage}/100`;

}


/*
    Tamamlanan görev
*/

if (completedCountElement) {

    completedCountElement.textContent =
        completed;

}


/*
    Progress bar
*/

if (progressFillElement) {

    progressFillElement.style.width =
        `${percentage}%`;

}


/*
    Rapor
*/

if (reportCompletedElement) {

    reportCompletedElement.textContent =
        completed;

}


if (reportRemainingElement) {

    reportRemainingElement.textContent =
        totalCount - completed;

}


if (reportScoreElement) {

    reportScoreElement.textContent =
        percentage;

}


/*
    Motivasyon yazısı
*/

if (progressTextElement) {

    if (percentage === 0) {

        progressTextElement.textContent =
            "Güne başlayalım.";

    }

    else if (percentage < 30) {

        progressTextElement.textContent =
            "Başlangıç yapıldı. Devam et.";

    }

    else if (percentage < 60) {

        progressTextElement.textContent =
            "İyi gidiyorsun. Planı bırakma.";

    }

    else if (percentage < 90) {

        progressTextElement.textContent =
            "Günün büyük kısmı tamamlandı.";

    }

    else if (percentage < 100) {

        progressTextElement.textContent =
            "Son görevler kaldı. Tamamla.";

    }

    else {

        progressTextElement.textContent =
            "★ BUGÜNÜN TÜM GÖREVLERİ TAMAMLANDI ★";

    }

}

}

/* =========================================================
CHECKBOX EVENTLERİ
========================================================= */

checkboxes.forEach(
(box) => {


    box.addEventListener(
        "change",
        updateTasks
    );

}


);

/* =========================================================
GÜN SONU DEĞERLENDİRMESİ
========================================================= */

function setEvaluation(answer) {


if (!evaluationResultElement) {
    return;
}


/*
    Bütün görevler tamamlandı mı?
*/

const allCompleted =
    Array.from(
        checkboxes
    ).every(
        box => box.checked
    );


/* EVET */

if (answer === "evet") {

    if (!allCompleted) {

        evaluationResultElement.textContent =
            "⚠ Tüm görevleri tamamlamadan günü başarılı kapatamazsın!";

        return;
    }


    evaluationResultElement.textContent =
        "✓ Harika! Bugünkü planına sadık kaldın.";


    localStorage.setItem(
        "dailyEvaluation",
        "evet"
    );


    /*
        Streak yalnızca
        günü ilk defa kapattığında artar.
    */

    if (
        lastCompletedDate !==
        currentDateKey
    ) {

        if (lastCompletedDate) {

            /*
                YYYY-MM-DD değerlerini
                güvenli şekilde tarihe çevir.
            */

            const previousDate =
                new Date(
                    `${lastCompletedDate}T00:00:00`
                );

            const currentDate =
                new Date(
                    `${currentDateKey}T00:00:00`
                );


            const difference =
                Math.round(
                    (
                        currentDate -
                        previousDate
                    ) /
                    (1000 * 60 * 60 * 24)
                );


            if (difference === 1) {

                streak++;

            }

            else if (difference > 1) {

                streak = 1;

            }

            /*
                Eğer fark 0 veya negatifse
                streak tekrar artırılmaz.
            */

        }

        else {

            streak = 1;

        }


        lastCompletedDate =
            currentDateKey;


        localStorage.setItem(
            "streak",
            streak
        );

        localStorage.setItem(
            "lastCompletedDate",
            lastCompletedDate
        );


        updateStreakDisplay();

    }

}


/* HAYIR */

else if (answer === "hayir") {

    evaluationResultElement.textContent =
        "→ Sorun değil. Yarın daha iyi bir plan uygula.";

    localStorage.setItem(
        "dailyEvaluation",
        "hayir"
    );

}


}

/* =========================================================
KAYITLI DEĞERLENDİRMEYİ YÜKLE
========================================================= */

function loadSavedEvaluation() {


const savedEvaluation =
    localStorage.getItem(
        "dailyEvaluation"
    );


if (
    !savedEvaluation ||
    !evaluationResultElement
) {
    return;
}


if (savedEvaluation === "evet") {

    evaluationResultElement.textContent =
        "✓ Harika! Bugünkü planına sadık kaldın.";

}

else if (savedEvaluation === "hayir") {

    evaluationResultElement.textContent =
        "→ Sorun değil. Yarın daha iyi bir plan uygula.";

}


}

/* =========================================================
GÜNÜ SIFIRLA
========================================================= */

function resetDay() {


const confirmReset =
    window.confirm(
        "Bugünkü tüm görevler sıfırlanacak. Emin misin?"
    );


if (!confirmReset) {
    return;
}


/*
    Checkbox'ları temizle
*/

checkboxes.forEach(
    box => {
        box.checked = false;
    }
);


/*
    Günlük kayıtları temizle
*/

localStorage.removeItem(
    "dailyTasks"
);

localStorage.removeItem(
    "dailyEvaluation"
);


/*
    Değerlendirme yazısını temizle
*/

if (evaluationResultElement) {

    evaluationResultElement.textContent =
        "";

}


/*
    Arayüzü yeniden hesapla
*/

updateTasks();


}

/* =========================================================
TIMELINE SCROLL ANİMASYONU
========================================================= */

const timelineItems =
document.querySelectorAll(
".timeline-item"
);

function initializeTimeline() {


/*
    Kullanıcı hareket azaltmayı
    tercih ettiyse animasyon kullanma.
*/

const reducedMotion =
    window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    ).matches;


if (
    reducedMotion ||
    !("IntersectionObserver" in window)
) {

    timelineItems.forEach(
        item => {
            item.classList.add("show");
        }
    );

    return;
}


const observer =
    new IntersectionObserver(
        (entries) => {

            entries.forEach(
                entry => {

                    if (
                        entry.isIntersecting
                    ) {

                        entry.target.classList.add(
                            "show"
                        );

                        /*
                            Bir kere gösterildikten sonra
                            tekrar gözlemlemeye gerek yok.
                        */

                        observer.unobserve(
                            entry.target
                        );

                    }

                }
            );

        },
        {
            threshold: 0.12
        }
    );


timelineItems.forEach(
    item => observer.observe(item)
);


}

/* =========================================================
ANALOG + DİJİTAL SAAT
========================================================= */

function updateAnalogClock() {


if (
    !hourHandElement ||
    !minuteHandElement ||
    !secondHandElement
) {
    return;
}


const now =
    new Date();


const seconds =
    now.getSeconds();

const milliseconds =
    now.getMilliseconds();

const minutes =
    now.getMinutes();

const hours =
    now.getHours();


/*
    Daha akıcı saniye ibresi
*/

const exactSeconds =
    seconds +
    milliseconds / 1000;


/*
    İbre açıları
*/

const secondDegrees =
    (exactSeconds / 60) * 360;


const minuteDegrees =
    (
        (minutes + exactSeconds / 60) /
        60
    ) * 360;


const hourDegrees =
    (
        (
            (hours % 12) +
            minutes / 60 +
            exactSeconds / 3600
        ) /
        12
    ) * 360;


/*
    İbreleri döndür
*/

secondHandElement.style.transform =
    `rotate(${secondDegrees}deg)`;


minuteHandElement.style.transform =
    `rotate(${minuteDegrees}deg)`;


hourHandElement.style.transform =
    `rotate(${hourDegrees}deg)`;


/*
    Dijital saat
*/

if (innerDigitalElement) {

    const digitalHour =
        String(hours)
            .padStart(2, "0");

    const digitalMinute =
        String(minutes)
            .padStart(2, "0");


    innerDigitalElement.textContent =
        `${digitalHour}:${digitalMinute}`;

}

}

/* =========================================================
TARİH DEĞİŞİMİNİ KONTROL ET
========================================================= */

function checkForNewDay() {

const now =
    getToday();

const newDateKey =
    getDateKey(now);


/*
    Gece 00:00'dan sonra sayfa açık kalırsa
    yeni günü algıla.
*/

if (
    newDateKey !==
    currentDateKey
) {

    location.reload();

}

}

/* =========================================================
BAŞLANGIÇ
========================================================= */

updateDateDisplay();

updateTasks();

updateStreakDisplay();

loadSavedEvaluation();

initializeTimeline();

updateAnalogClock();

/*
Saat güncelleme.
requestAnimationFrame kullanımı sayesinde
saniye ibresi daha akıcı hareket eder.
*/

let lastClockUpdate = 0;

function clockLoop(timestamp) {

if (
    timestamp - lastClockUpdate >= 100
) {

    updateAnalogClock();

    lastClockUpdate =
        timestamp;

}


requestAnimationFrame(
    clockLoop
);

}

requestAnimationFrame(
clockLoop
);

/*
Gece yarısını kontrol et.
*/

setInterval(
checkForNewDay,
30 * 1000
);

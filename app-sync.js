// ============================================================================
// app-sync.js — Синхронизация, годовой график и автообновление при запуске.
// Подключается ко всем языковым версиям (RU/UA/DE).
// Использует глобальные переменные/функции из inline-скрипта страницы:
//   GOOGLE_SCRIPT_URL, isValidScriptUrl(), databaseBookings,
//   renderScheduleBoard(), onLocationOrDateChange(), showToast()
// ============================================================================
(function () {
  'use strict';

  // ----- Локализация (выбирается по <html lang="...">) -----
  var I18N = {
    ru: {
      months: ["Январь","Февраль","Март","Апрель","Май","Июнь","Июль","Август","Сентябрь","Октябрь","Ноябрь","Декабрь"],
      weekdays: ["Пн","Вт","Ср","Чт","Пт","Сб","Вс"],
      statuses: { available:"Служение", closed:"Выходной", event:"Событие", holiday:"Праздник", special:"Особое" },
      dayEditorTitle:"День служения", statusLabel:"Статус", descLabel:"Описание события", noteLabel:"Заметка", trolleyLabel:"Тележка", trolleyPlaceholder:"— выберите —", trolleys:{ru:"Русская",ua:"Украинская",de:"Немецкая"}, noTrolley:"Выберите тележку",
      cart1Name:"Тележка №1 (Стенд 1)", cart2Name:"Тележка №2 (Стенд 2)", cart1Lang:"Язык тележки №1", cart2Lang:"Язык тележки №2",
      preacher1:"Возвещатель 1 (ФИО)", preacher2:"Возвещатель 2 (ФИО)",
      save:"Сохранить", cancel:"Отмена", saving:"Сохранение…", saved:"Данные сохранены", edit:"Редактировать", saveChanges:"Сохранить изменения", saveError:"Ошибка сохранения", saveVerifyFail:"Сервер не сохранил изменения. Пересоздайте Web App (Deploy → New version) с новым кодом google_script.txt.",
      offline:"Нет связи с сервером. Показан последний сохранённый график.",
      updated:"График обновлён", syncError:"Не удалось обновить данные",
      online:"Онлайн", offlineShort:"Офлайн", refresh:"Обновить",
      presets:["Нет литературы","Тележка сломана ⚠️","Постер повреждён","Порван чехол"]
    },
    uk: {
      months: ["Січень","Лютий","Березень","Квітень","Травень","Червень","Липень","Серпень","Вересень","Жовтень","Листопад","Грудень"],
      weekdays: ["Пн","Вт","Ср","Чт","Пт","Сб","Нд"],
      statuses: { available:"Служіння", closed:"Вихідний", event:"Подія", holiday:"Свято", special:"Особливе" },
      dayEditorTitle:"День служіння", statusLabel:"Статус", descLabel:"Опис події", noteLabel:"Примітка", trolleyLabel:"Тележка", trolleyPlaceholder:"— оберіть —", trolleys:{ru:"Російська",ua:"Українська",de:"Німецька"}, noTrolley:"Оберіть тележку",
      cart1Name:"Тележка №1 (Стенд 1)", cart2Name:"Тележка №2 (Стенд 2)", cart1Lang:"Мова тележки №1", cart2Lang:"Мова тележки №2",
      preacher1:"Возвіщувач 1 (ПІБ)", preacher2:"Возвіщувач 2 (ПІБ)",
      save:"Зберегти", cancel:"Скасувати", saving:"Збереження…", saved:"Дані збережено", edit:"Редагувати", saveChanges:"Зберегти зміни", saveError:"Помилка збереження", saveVerifyFail:"Сервер не зберіг зміни. Перевидіть Web App (Deploy → New version) з новим кодом google_script.txt.",
      offline:"Немає звʼязку із сервером. Показано останній збережений графік.",
      updated:"Графік оновлено", syncError:"Не вдалося оновити дані",
      online:"Онлайн", offlineShort:"Офлайн", refresh:"Оновити",
      presets:["Немає літератури","Тележка зламана ⚠️","Постер пошкоджено","Чохол порваний"]
    },
    de: {
      months: ["Januar","Februar","März","April","Mai","Juni","Juli","August","September","Oktober","November","Dezember"],
      weekdays: ["Mo","Di","Mi","Do","Fr","Sa","So"],
      statuses: { available:"Dienst", closed:"Frei", event:"Veranstaltung", holiday:"Feiertag", special:"Besonderes" },
      dayEditorTitle:"Diensttag", statusLabel:"Status", descLabel:"Ereignisbeschreibung", noteLabel:"Notiz", trolleyLabel:"Trolley", trolleyPlaceholder:"— auswählen —", trolleys:{ru:"Russisch",ua:"Ukrainisch",de:"Deutsch"}, noTrolley:"Trolley auswählen",
      save:"Speichern", cancel:"Abbrechen", saving:"Speichern…", saved:"Daten gespeichert", edit:"Bearbeiten", saveChanges:"Änderungen speichern", saveError:"Speicherfehler", saveVerifyFail:"Server hat die Änderungen nicht gespeichert. Erstellen Sie die Web App neu (Deploy → New version) mit dem neuen Code google_script.txt.",
      offline:"Keine Verbindung zum Server. Letzter gespeicherter Plan wird angezeigt.",
      updated:"Plan aktualisiert", syncError:"Daten konnten nicht aktualisiert werden",
      online:"Online", offlineShort:"Offline", refresh:"Aktualisieren",
      presets:["Keine Literatur","Trolley kaputt ⚠️","Plakat beschädigt","Hülle zerrissen"]
    }
  };

  var ALLOWED = ["available", "closed", "event", "holiday", "special"];
  var ALLOWED_LANGS = ["ru", "ua", "de"];
  var TROLLEY_INIT = { ru: "Р", ua: "У", de: "Н" }; // значки тележки в сетке
  var API_KEY = "jw_144000";
  var SYNC_INTERVAL_MS = 60000; // 60 c — минимизируем число запросов

  // ----- Состояние годового графика -----
  var yearSchedule = [];      // массив { date, status, description, note }
  var scheduleIndex = {};      // индекс по date для быстрого доступа
  var lastSyncOnline = false;
  var lastSyncTime   = 0;    // timestamp последней успешной синхронизации (мс)
  var autoTimer = null;
  var editorState = { date: null, status: "available" };
  var yearTrolleyFilter = "all"; // 'all' | 'ru' | 'ua' | 'de' — фильтр тележек на главной

  // ----- Единый источник данных (Global State Manager) -----
  // Все вкладки (Запись / График / Год) читают и пишут сюда.
  // Единый источник данных (Global State Manager). Доступен глобально как
  // window.AppState, чтобы любая вкладка/скрипт читали одно и то же состояние.
  var AppState = window.AppState || { bookings: [], schedule: [] };
  window.AppState = AppState;

  // ----- Утилиты -----
  function getLang() {
    var l = (document.documentElement.lang || "ru").toLowerCase();
    if (l.indexOf("uk") === 0) return "uk";
    if (l.indexOf("de") === 0) return "de";
    return "ru";
  }
  function t(key) {
    var d = I18N[getLang()];
    return (d && d[key] != null) ? d[key] : (I18N.ru[key] != null ? I18N.ru[key] : key);
  }
  function pad(n) { return n < 10 ? "0" + n : "" + n; }
  function isoOf(date) { return date.getFullYear() + "-" + pad(date.getMonth() + 1) + "-" + pad(date.getDate()); }
  function todayIso() { return isoOf(new Date()); }
  function formatDateHuman(iso) {
    var p = (iso || "").split("-");
    if (p.length !== 3) return iso || "";
    var m = I18N[getLang()].months[parseInt(p[1], 10) - 1] || p[1];
    return p[2] + " " + m + " " + p[0];
  }

  function normalizeDateValue(v) {
    if (/^\d{4}-\d{2}-\d{2}$/.test(v || "")) return v;
    if (v instanceof Date && !isNaN(v.getTime())) return isoOf(v);
    var d = new Date(v);
    if (!isNaN(d.getTime())) return isoOf(d);
    return v;
  }
  function setSchedule(sched) {
    yearSchedule = (Array.isArray(sched) ? sched : []).map(function (day) {
      if (!day) return day;
      return Object.assign({}, day, { date: normalizeDateValue(day.date) });
    });
    scheduleIndex = {};
    for (var i = 0; i < yearSchedule.length; i++) {
      var day = yearSchedule[i];
      if (!day || !day.date) continue;
      if (!scheduleIndex[day.date]) scheduleIndex[day.date] = [];
      scheduleIndex[day.date].push(day);
    }
  }
  function currentScheduleYear() {
    if (yearSchedule.length && yearSchedule[0].date) return parseInt(yearSchedule[0].date.split("-")[0], 10);
    return new Date().getFullYear();
  }

  // Генерация всех дней года (по 2 тележки на день, значения по умолчанию)
  function generateYearSchedule(year) {
    year = year || new Date().getFullYear();
    var out = [];
    var d = new Date(year, 0, 1);
    while (d.getFullYear() === year) {
      var iso = isoOf(d);
      out.push({ date: iso, cartNumber: 1, trolley: "", status: "available", description: "", note: "" });
      out.push({ date: iso, cartNumber: 2, trolley: "", status: "available", description: "", note: "" });
      d.setDate(d.getDate() + 1);
    }
    return out;
  }
  // Удаляет дубликаты по дате+номеру тележки (оставляет последний)
  function dedupeSchedule(arr) {
    var seen = {};
    var out = [];
    for (var i = 0; i < arr.length; i++) {
      var day = arr[i];
      if (!day || !day.date) continue;
      var key = day.date + "|" + (parseInt(day.cartNumber, 10) || 1);
      seen[key] = day;
    }
    var keys = Object.keys(seen).sort();
    for (var k = 0; k < keys.length; k++) out.push(seen[keys[k]]);
    return out;
  }
  function upsertDay(day) {
    var found = false;
    for (var i = 0; i < yearSchedule.length; i++) {
      if (yearSchedule[i].date === day.date && (parseInt(yearSchedule[i].cartNumber, 10) || 1) === (parseInt(day.cartNumber, 10) || 1)) {
        yearSchedule[i] = day; found = true; break;
      }
    }
    if (!found) yearSchedule.push(day);
    // Перестраиваем индекс полностью (без накопления дублей при повторных обновлениях)
    scheduleIndex[day.date] = yearSchedule.filter(function (r) { return r.date === day.date; });
  }
  function normalizeBooking(b) {
    var nd = b.date;
    // Если дата уже в формате YYYY-MM-DD — оставляем как есть.
    if (/^\d{4}-\d{2}-\d{2}$/.test(nd || "")) {
      return Object.assign({}, b, { date: nd });
    }
    // Иначе пробуем распарсить (Date-объект / строка с пробелом / ISO с T).
    if (nd && (nd.indexOf(" ") > -1 || nd.indexOf("T") > -1 || nd instanceof Date)) {
      var d = (nd instanceof Date) ? nd : new Date(nd);
      if (!isNaN(d.getTime())) nd = isoOf(d);
    }
    return Object.assign({}, b, { date: nd });
  }

  // ----- Кэш (localStorage) -----
  function cacheKeyBookings() { return "cachedBookings_v2"; }
  function cacheKeySchedule() { return "cachedSchedule_v2"; }
  function saveCachedBookings(arr) {
    try { localStorage.setItem(cacheKeyBookings(), JSON.stringify(arr)); } catch (e) {}
  }
  function getCachedBookings() {
    try { return JSON.parse(localStorage.getItem(cacheKeyBookings())) || []; } catch (e) { return []; }
  }
  function saveCache(arr) {
    try { localStorage.setItem(cacheKeySchedule(), JSON.stringify(arr)); } catch (e) {}
  }
  function loadCache() {
    try { return JSON.parse(localStorage.getItem(cacheKeySchedule())) || []; } catch (e) { return []; }
  }

  // ----- Сетевой слой -----

  // Обёртка fetch с Exponential Backoff:
  // при ошибках 429 / 500 / 503 (перегрузка сервера) или потере сети
  // автоматически повторяет запрос: 1 с → 3 с → 5 с (до maxAttempts попыток).
  function fetchWithRetry(url, opts, maxAttempts, retryDelays) {
    maxAttempts = maxAttempts || 3;
    retryDelays = retryDelays || [1000, 3000, 5000];
    function attempt(n) {
      return fetch(url, opts || {}).then(function (res) {
        // Повторяем при перегрузке сервера (Google Apps Script → 429/500)
        if ((res.status === 429 || res.status === 500 || res.status === 503) && n < maxAttempts) {
          return new Promise(function (resolve) {
            setTimeout(function () { resolve(attempt(n + 1)); }, retryDelays[n - 1] || 5000);
          });
        }
        return res;
      }).catch(function (err) {
        // Пробрасываем оригинальную ошибку (CORS-ошибки исчезнут после удаления Content-Type)
        if (n < maxAttempts) {
          return new Promise(function (resolve) {
            setTimeout(function () { resolve(attempt(n + 1)); }, retryDelays[n - 1] || 5000);
          });
        }
        throw err; // пробрасываем оригинальную ошибку без маскировки
      });
    }
    return attempt(1);
  }

  // Ограничивает время ожидания промиса: если сервер «висит» и не отвечает,
  // запрос не подвешивает интерфейс (модальное окно) навсегда — пробрасываем ошибку.
  function withTimeout(promise, ms, label) {
    ms = ms || 20000;
    return new Promise(function (resolve, reject) {
      var done = false;
      var timer = setTimeout(function () {
        if (!done) { done = true; reject(new Error("TIMEOUT" + (label ? "_" + label : ""))); }
      }, ms);
      Promise.resolve(promise).then(function (v) {
        if (!done) { done = true; clearTimeout(timer); resolve(v); }
      }, function (e) {
        if (!done) { done = true; clearTimeout(timer); reject(e); }
      });
    });
  }

  function fetchCombined() {
    if (!isValidScriptUrl(GOOGLE_SCRIPT_URL)) return Promise.reject(new Error("NO_URL"));
    var url = GOOGLE_SCRIPT_URL + "?key=" + encodeURIComponent(API_KEY);
    return fetchWithRetry(url, { cache: "no-store" }).then(function (res) {
      if (!res.ok) throw new Error("HTTP_" + res.status);
      return res.json();
    }).then(function (data) {
      if (data && data.status === "error") throw new Error(data.message || "SERVER_ERROR");
      return {
        bookings: Array.isArray(data.bookings) ? data.bookings : (Array.isArray(data) ? data : []),
        schedule: Array.isArray(data.schedule) ? data.schedule : []
      };
    });
  }

  // Клиентская валидация перед отправкой в Google Таблицы
  function validateDay(day) {
    if (!day || !/^\d{4}-\d{2}-\d{2}$/.test(day.date || "")) return "bad_date";
    if (ALLOWED.indexOf(day.status) === -1) return "bad_status";
    if (["ru", "ua", "de"].indexOf((day.trolley || "").toLowerCase()) === -1) return "bad_trolley";
    if (typeof day.description !== "string" || day.description.length > 500) return "bad_desc";
    if (typeof day.note !== "string" || day.note.length > 500) return "bad_note";
    return null;
  }

  // ----- Splash screen -----
  function showSplash() { var s = document.getElementById("splashScreen"); if (s) s.classList.remove("hidden"); }
  function hideSplash() { var s = document.getElementById("splashScreen"); if (s) s.classList.add("hidden"); }

  // ----- Запуск приложения: оптимизированный старт под 200+ пользователей -----
  // Шаг 1: мгновенный показ кэша (localStorage) — пользователь сразу видит интерфейс
  // Шаг 2: случайная задержка 0–1500 мс перед сетевым запросом (jitter) →
  //         размываем пиковую нагрузку, если 200+ человек откроют сайт одновременно
  function runAppLaunch() {
    showSplash();

    // — Шаг 1: мгновенно показываем кэшированные данные (если есть) —
    var cb = getCachedBookings();
    var cs = loadCache();
    var hasCachedData = (cb.length > 0 || (cs && cs.length > 0));
    if (hasCachedData) {
      var schedCached = (cs && cs.length) ? cs : generateYearSchedule();
      updateAppState({ bookings: cb, schedule: schedCached });
      hideSplash();     // убираем splash немедленно — пользователь уже видит данные
      updateSyncBadge();
    }

    // — Шаг 2: фоновый запрос со случайной задержкой (jitter) —
    var jitter = Math.floor(Math.random() * 1500);
    return new Promise(function (resolve) {
      setTimeout(function () {
        fetchCombined().then(function (data) {
          var bookings = (data.bookings || []).map(normalizeBooking);
          var sched = (data.schedule && data.schedule.length) ? dedupeSchedule(data.schedule) : generateYearSchedule();
          updateAppState({ bookings: bookings, schedule: sched });
          lastSyncOnline = true;
          lastSyncTime   = Date.now();
          if (typeof renderYearGrid === 'function') renderYearGrid();
        }).catch(function () {
          lastSyncOnline = false;
          if (!hasCachedData) {
            // Нет кэша и нет сети — строим пустой год как заглушку
            var sched = generateYearSchedule();
            updateAppState({ bookings: [], schedule: sched });
            if (typeof renderYearGrid === 'function') renderYearGrid();
          }
          showToast(t("offline"), "error");
        }).then(function () {
          hideSplash();       // убираем splash в любом случае (если ещё виден)
          updateSyncBadge();
          resolve();
        });
      }, jitter);
    });
  }

  // Ручное обновление (кнопка «Обновить данные» / в годовом табе)
  function refreshAll() {
    return fetchCombined().then(function (data) {
      var bookings = (data.bookings || []).map(normalizeBooking);
      var sched = (data.schedule && data.schedule.length) ? dedupeSchedule(data.schedule) : generateYearSchedule();
      updateAppState({ bookings: bookings, schedule: sched });
      lastSyncOnline = true;
      lastSyncTime   = Date.now();
      showToast(t("updated"), "success");
      updateSyncBadge();
      return true;
    }).catch(function () {
      lastSyncOnline = false;
      showToast(t("syncError"), "error");
      updateSyncBadge();
      return false;
    });
  }

  // Фоновое тихое обновление (без лишних уведомлений)
  function refreshSilently() {
    return fetchCombined().then(function (data) {
      var bookings = (data.bookings || []).map(normalizeBooking);
      var sched = (data.schedule && data.schedule.length) ? dedupeSchedule(data.schedule) : generateYearSchedule();
      updateAppState({ bookings: bookings, schedule: sched });
      lastSyncOnline = true;
      lastSyncTime   = Date.now();
      updateSyncBadge();
    }).catch(function () { lastSyncOnline = false; updateSyncBadge(); });
  }

  // Сколько миллисекунд прошло с последней синхронизации (Infinity = синхронизации ещё не было)
  function timeSinceLastSync() {
    return lastSyncTime > 0 ? (Date.now() - lastSyncTime) : Infinity;
  }

  function startAutoSync() {
    if (autoTimer === null) autoTimer = setInterval(refreshSilently, SYNC_INTERVAL_MS);
  }
  function stopAutoSync() {
    if (autoTimer !== null) { clearInterval(autoTimer); autoTimer = null; }
  }

  function updateSyncBadge() {
    var badge = document.getElementById("yearSyncBadge");
    if (!badge) return;
    badge.className = "year-sync-badge";
    badge.classList.remove("online", "offline", "status-offline", "status-online", "bg-red", "text-red", "bg-green", "text-green");
    badge.classList.add(lastSyncOnline ? "online" : "offline");
    if (lastSyncOnline) {
      badge.classList.remove("offline", "status-offline", "bg-red", "text-red");
      badge.classList.add("online", "status-online", "bg-green", "text-green");
    } else {
      badge.classList.remove("online", "status-online", "bg-green", "text-green");
      badge.classList.add("offline", "status-offline", "bg-red", "text-red");
    }
    badge.innerHTML = '<span class="dot"></span>' + (lastSyncOnline ? t("online") : t("offlineShort"));
  }

  // ----- Глобальный менеджер состояния (единственный источник данных) -----
  // Обновляет AppState, сохраняет локальный кэш и перерисовывает все три вкладки.
  function updateAppState(newData) {
    if (!newData) newData = {};
    if (Array.isArray(newData.bookings)) {
      AppState.bookings = newData.bookings;
      try { databaseBookings = AppState.bookings; } catch (e) {}
      saveCachedBookings(AppState.bookings);
      // Диагностика формата дат: логируем уникальные «сырые» форматы дат,
      // приходящие с сервера, чтобы отловить рассинхрон с клиентским YYYY-MM-DD.
      try {
        var fmtSeen = {};
        newData.bookings.slice(0, 50).forEach(function (b) {
          var d = b.date;
          var kind = (d instanceof Date) ? "Date:" + d.toISOString()
            : (typeof d === "string" && /^\d{4}-\d{2}-\d{2}$/.test(d)) ? "ok:" + d
            : "raw:" + JSON.stringify(d);
          fmtSeen[kind] = (fmtSeen[kind] || 0) + 1;
        });
        console.log("[SyncCore] booking date formats from server:", fmtSeen,
          "| total:", newData.bookings.length);
      } catch (logErr) {}
    }
    if (Array.isArray(newData.schedule)) {
      AppState.schedule = newData.schedule;
      setSchedule(AppState.schedule);
      saveCache(AppState.schedule);
    }
    renderAllTabs();
  }

  // Перерисовка всех активных вкладок из единого состояния:
  // renderBookingTab() — доступность слотов (Запись)
  // renderScheduleTab() — списки дежурных (График)
  // renderYearGrid()   — цвета/иконки тележек (Год)
  function renderAllTabs() {
    if (typeof renderBookingTab === "function") renderBookingTab();
    else if (typeof onLocationOrDateChange === "function") onLocationOrDateChange();
    if (typeof renderScheduleTab === "function") renderScheduleTab();
    else if (typeof renderScheduleBoard === "function") renderScheduleBoard();
    if (typeof renderYearGrid === "function") renderYearGrid();
  }

  // Связь «Запись» → «Год»: тележки дня окрашиваются в цвета языков записи.
  // Каждая тележка (№1 и №2) хранится как отдельная строка YearSchedule
  // (колонка CartNumber), поэтому в один день могут быть разные языки.
  function linkBookingToYear(date, cart1Lang, cart2Lang) {
    if (!date) return;
    cart1Lang = (cart1Lang || "").toLowerCase();
    cart2Lang = (cart2Lang || "").toLowerCase();
    setYearCart(date, 1, cart1Lang);
    setYearCart(date, 2, cart2Lang);
    saveCache(yearSchedule);
    updateAppState({ schedule: yearSchedule });
  }

  // Записывает/обновляет язык конкретной тележки (cartNumber=1|2) в YearSchedule.
  function setYearCart(date, cartNumber, lang) {
    var found = -1;
    for (var i = 0; i < yearSchedule.length; i++) {
      var row = yearSchedule[i];
      if (row.date === date && (parseInt(row.cartNumber, 10) || 0) === cartNumber) { found = i; break; }
    }
    if (found === -1) {
      yearSchedule.push({ date: date, cartNumber: cartNumber, trolley: "", status: "available", description: "", note: "" });
      found = yearSchedule.length - 1;
    }
    if (lang) yearSchedule[found].trolley = lang;
  }

  // Связь «График» → «Год» при отмене: пересчитываем языки тележек дня
  // из оставшихся записей (могут совпадать у нескольких слотов/локаций).
  function unlinkBookingFromYear(date) {
    if (!date) return;
    var remaining = (AppState.bookings || []).filter(function (b) {
      return b.date === date && (b.name1 || b.name2 || b.name3 || b.name4);
    });
    var c1 = "", c2 = "";
    remaining.forEach(function (b) {
      if (b.cart1Lang && b.name1) c1 = b.cart1Lang.toLowerCase();
      if (b.cart2Lang && b.name3) c2 = b.cart2Lang.toLowerCase();
    });
    setYearCart(date, 1, c1);
    setYearCart(date, 2, c2);
    saveCache(yearSchedule);
    updateAppState({ schedule: yearSchedule });
  }

  // Локальное удаление/освобождение КОНКРЕТНОЙ тележки слота (мгновенно, до ответа сервера).
  // b = { location, date, time, cartNumber: 1|2 }
  // Очищает только выбранную тележку; вторую не трогает. Если обе пусты — убирает слот.
  function removeBooking(b) {
    var cn = parseInt(b.cartNumber, 10);
    if (!(cn === 1 || cn === 2)) cn = 1; // по умолчанию первая (безопасно)
    AppState.bookings = (AppState.bookings || []).map(function (x) {
      if (x.location === b.location && x.date === b.date && x.time === b.time) {
        if (cn === 1) { x.name1 = ""; x.name2 = ""; }
        else { x.name3 = ""; x.name4 = ""; }
      }
      return x;
    }).filter(function (x) {
      return !!(x.name1 || x.name2 || x.name3 || x.name4);
    });
    try { databaseBookings = AppState.bookings; } catch (e) {}
    saveCachedBookings(AppState.bookings);
    unlinkBookingFromYear(b.date);
  }

  // Безопасное удаление с откатом локального кэша при сетевой ошибке.
  // offline=true -> не трогаем сервер, просто убираем локально (приложение остаётся рабочим).
  function removeBookingSafe(b, serverDeletePromiseFactory) {
    var cn = parseInt(b.cartNumber, 10);
    if (!(cn === 1 || cn === 2)) cn = 1;
    // Сохраняем снимок затронутых слотов до изменения (для отката)
    var snapshot = (AppState.bookings || []).map(function (x) { return Object.assign({}, x); });

    removeBooking(b); // мгновенная перерисовка всех вкладок

    if (typeof serverDeletePromiseFactory !== "function") return Promise.resolve(true);

    var p = serverDeletePromiseFactory();
    if (!p || typeof p.then !== "function") return Promise.resolve(true);

    return p.then(function (result) {
      // Сервер подтвердил удаление (или вернул ошибку поиска — трактуем как уже удалено)
      if (result && result.status === "error") throw new Error(result.message || "SERVER_ERROR");
      return true;
    }).catch(function (err) {
      // Откат: возвращаем кэш в исходное состояние, перерисовываем.
      AppState.bookings = snapshot;
      try { databaseBookings = snapshot; } catch (e) {}
      saveCachedBookings(snapshot);
      unlinkBookingFromYear(b.date);
      renderAllTabs();
      throw err;
    });
  }

  // Локальное добавление записи (мгновенно) — используется для обеих тележек.
  function addBookingRecord(rec) {
    AppState.bookings = AppState.bookings || [];
    // Найти существующий слот, чтобы не плодить дубли-строки (как на сервере)
    var slot = AppState.bookings.find(function (x) {
      return x.location === rec.location && x.date === rec.date && x.time === rec.time;
    });
    if (!slot) {
      slot = { location: rec.location, date: rec.date, time: rec.time,
        cart1Lang: "", name1: "", name2: "", cart2Lang: "", name3: "", name4: "" };
      AppState.bookings.push(slot);
    }
    if (rec.cartNumber === 1) {
      slot.cart1Lang = rec.language; slot.name1 = rec.name1 || ""; slot.name2 = rec.name2 || "";
    } else {
      slot.cart2Lang = rec.language; slot.name3 = rec.name3 || ""; slot.name4 = rec.name4 || "";
    }
    try { databaseBookings = AppState.bookings; } catch (e) {}
    saveCachedBookings(AppState.bookings);
    linkBookingToYear(rec.date, slot.cart1Lang, slot.cart2Lang);
  }

  // Тонкая обёртка для обратной совместимости (демо-режим app.js):
  // из плоского payload делает две пер-картовые записи и добавляет локально.
  function addBooking(payload) {
    var recs = [];
    if ((payload.name1 || payload.name2) && payload.cart1Lang) {
      recs.push({ date: payload.date, time: payload.time, location: payload.location,
        cartNumber: 1, language: payload.cart1Lang, name1: payload.name1, name2: payload.name2 });
    }
    if ((payload.name3 || payload.name4) && payload.cart2Lang) {
      recs.push({ date: payload.date, time: payload.time, location: payload.location,
        cartNumber: 2, language: payload.cart2Lang, name3: payload.name3, name4: payload.name4 });
    }
    recs.forEach(addBookingRecord);
  }

  // ----- Фильтр тележек (переключатель на странице годового графика) -----
  var LS_TROLLEY_FILTER = "yearTrolleyFilter_v1";
  function loadTrolleyFilter() {
    try {
      var v = localStorage.getItem(LS_TROLLEY_FILTER);
      if (v === "all" || v === "ru" || v === "ua" || v === "de") return v;
    } catch (e) {}
    return "all";
  }
  function saveTrolleyFilter(v) {
    try { localStorage.setItem(LS_TROLLEY_FILTER, v); } catch (e) {}
  }
  function initTrolleyFilter() {
    yearTrolleyFilter = loadTrolleyFilter();
    // Заполняем SVG-иконки тележек во всех переключателях через TrolleyUI
    if (window.TrolleyUI) {
      var icons = document.querySelectorAll(".trolley-filter .trolley-filter-icon[data-group]");
      for (var i = 0; i < icons.length; i++) icons[i].innerHTML = window.TrolleyUI.getMiniSVG();
    }
    updateTrolleyFilterUI();
  }
  function updateTrolleyFilterUI() {
    var btns = document.querySelectorAll(".trolley-filter .trolley-filter-btn");
    for (var i = 0; i < btns.length; i++) {
      var active = btns[i].getAttribute("data-group") === yearTrolleyFilter;
      btns[i].classList.toggle("active", active);
      btns[i].setAttribute("aria-pressed", active ? "true" : "false");
    }
  }
  function setTrolleyFilter(group) {
    if (["all", "ru", "ua", "de"].indexOf(group) === -1) group = "all";
    yearTrolleyFilter = group;
    saveTrolleyFilter(group);
    updateTrolleyFilterUI();
    renderYearGrid();
  }

  // По клику на день годовой сетки открываем модальный редактор дня
  // (статус/тележка/язык/описание) с сохранением через action=year_update.
  function goToDateFromYear(dateISO) {
    openDayEditor(dateISO);
  }

  // ----- Эффективный рендеринг годовой сетки -----
  function renderYearGrid() {
    var root = document.getElementById("yearGridRoot");
    if (!root) return;

    var dict = I18N[getLang()];
    var year = currentScheduleYear();
    root.innerHTML = "";

    // Панель: заголовок + индикатор + кнопка обновления
    var toolbar = document.createElement("div");
    toolbar.className = "year-toolbar";
    var title = document.createElement("span");
    title.className = "year-title";
    title.textContent = year;
    toolbar.appendChild(title);

    var badge = document.createElement("span");
    badge.id = "yearSyncBadge";
    toolbar.appendChild(badge);

    var refreshBtn = document.createElement("button");
    refreshBtn.type = "button";
    refreshBtn.className = "btn-refresh";
    refreshBtn.innerHTML = '<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" style="margin-right:4px;"><path d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 8H18" stroke-linecap="round" stroke-linejoin="round"/></svg>' + t("refresh");
    refreshBtn.onclick = function () { refreshAll(); };
    toolbar.appendChild(refreshBtn);
    root.appendChild(toolbar);

    // Легенда
    var legend = document.createElement("div");
    legend.className = "year-legend";
    ALLOWED.forEach(function (st) {
      var item = document.createElement("span");
      item.className = "legend-item";
      item.innerHTML = '<span class="legend-dot status-' + st + '"></span>' + dict.statuses[st];
      legend.appendChild(item);
    });
    root.appendChild(legend);

    // Сетка месяцев (один проход, DocumentFragment — без зависаний)
    var grid = document.createElement("div");
    grid.className = "year-grid";
    var frag = document.createDocumentFragment();
    var tIso = todayIso();

    // Вспомогательная функция добавления языка в накопитель (объявлена ПЕРЕД циклом,
    // чтобы не нарушать правило 'use strict' об объявлениях функций внутри блоков).
    function addLangToSet(set, l) {
      var code = (l || "").toLowerCase();
      if (code === "ru" || code === "ua" || code === "de") set[code] = true;
    }

    for (var m = 0; m < 12; m++) {
      var block = document.createElement("div");
      block.className = "month-block";

      var mTitle = document.createElement("div");
      mTitle.className = "month-title";
      mTitle.textContent = dict.months[m];
      block.appendChild(mTitle);

      var wd = document.createElement("div");
      wd.className = "month-weekdays";
      dict.weekdays.forEach(function (w) {
        var s = document.createElement("span");
        s.textContent = w;
        wd.appendChild(s);
      });
      block.appendChild(wd);

      var days = document.createElement("div");
      days.className = "month-days";

      var first = new Date(year, m, 1);
      var offset = (first.getDay() + 6) % 7; // понедельник = 0
      for (var e = 0; e < offset; e++) {
        var empty = document.createElement("div");
        empty.className = "day-cell empty";
        days.appendChild(empty);
      }

      var dim = new Date(year, m + 1, 0).getDate();
      for (var d = 1; d <= dim; d++) {
          var iso = year + "-" + pad(m + 1) + "-" + pad(d);
          iso = (iso || "").trim();
          var rows = scheduleIndex[iso] || [];
          // Собираем статус (берём «не доступно» приоритетнее) и ВСЕ уникальные языки дня
          var status = "available";
          var dayLangSet = {}; // накопитель уникальных языков (RU/UA/DE) за весь день
          rows.forEach(function (r) {
            if (r.status && r.status !== "available") status = r.status;
            addLangToSet(dayLangSet, r.trolley);
          });
          // Дополняем языки из фактических записей (Запись → Год всегда актуально).
          // Учитываем ВСЕ слоты: одна тележка в разных слотах может быть разных языков.
          (AppState.bookings || []).forEach(function (b) {
            if (b.date !== iso) return;
            if (b.cart1Lang && (b.name1 || b.name2)) addLangToSet(dayLangSet, b.cart1Lang);
            if (b.cart2Lang && (b.name3 || b.name4)) addLangToSet(dayLangSet, b.cart2Lang);
          });
          var langs = { c1: "", c2: "" };
          var keys = Object.keys(dayLangSet);
          if (keys[0]) langs.c1 = keys[0];
          if (keys[1]) langs.c2 = keys[1];

         var cell = document.createElement("div");
         cell.className = "day-cell status-" + status;
         var anyNote = rows.some(function (r) { return r.description || r.note; });
         if (anyNote) cell.classList.add("has-event");
         if (iso === tIso) cell.classList.add("today");
         if (iso < tIso) cell.classList.add("past");
         cell.dataset.date = iso;

          // Уникальные языки дня (все занятые группы за день, до 3)
          var dayLangs = Object.keys(dayLangSet);

         // Явная привязка групп к ячейке (для цветовой подсветки + фильтра)
         dayLangs.forEach(function (lg) {
           cell.classList.add("has-trolley", "has-booking-" + lg);
         });
         if (dayLangs.length) cell.dataset.groups = dayLangs.join(",");

         // Фильтр по тележке: показываем только выбранную группу, остальное — затемняем
         var showTrolley = false;
         if (yearTrolleyFilter === "all") {
           showTrolley = dayLangs.length > 0;
         } else if (dayLangs.indexOf(yearTrolleyFilter) !== -1) {
           showTrolley = true;
         } else {
           cell.classList.add("day-dimmed");
         }

         var title = dict.statuses[status];
         if (dayLangs.length) {
           title += " · " + dayLangs.map(function (lg) { return dict.trolleys[lg]; }).join(" + ");
         }
         var noted = rows.filter(function (r) { return r.description; })[0];
         if (noted) title += ": " + noted.description;
         cell.title = title;

          // Контент: номер дня + цветные маркеры языков (точки/полоски).
          // Цвета строго соответствуют верхнему фильтру: RU=красный, UA=голубой, DE=зелёный.
          var LANG_DOT = { ru: "ru", ua: "ua", de: "de" };
          var inner = '<span class="day-num">' + d + '</span>';
          if (dayLangs.length) {
            // Яркая подсветка фона, если выбрана конкретная группа и она есть в этом дне
            if (yearTrolleyFilter !== "all" && dayLangs.indexOf(yearTrolleyFilter) !== -1) {
              cell.classList.add("day-highlight-" + yearTrolleyFilter);
            }
            inner += '<span class="day-lang-dots">';
            dayLangs.forEach(function (lg) {
              // Маркер: цветная точка + (опционально) мини-иконка тележки
              inner += '<span class="day-lang-dot dot-' + (LANG_DOT[lg] || "none") + '" title="' + (dict.trolleys[lg] || "") + '">';
              if (window.TrolleyUI) {
                inner += '<span class="day-trolley-icon" data-group="' + lg + '" aria-hidden="true">' + TrolleyUI.getMiniSVG() + '</span>';
              }
              inner += '</span>';
            });
            inner += '</span>';
          }
         if (anyNote) inner += '<span class="attention-badge">!</span>';
         cell.innerHTML = inner;
         cell.addEventListener("click", function (ev) { goToDateFromYear(ev.currentTarget.dataset.date); });
        days.appendChild(cell);
      }
      block.appendChild(days);
      frag.appendChild(block);
    }
    grid.appendChild(frag);
    root.appendChild(grid);

    updateSyncBadge();
  }

  // ----- Редактор дня (модальное окно) -----
  function ensureDayEditor() {
    if (document.getElementById("dayEditorModal")) return;
    var dict = I18N[getLang()];
    var modal = document.createElement("div");
    modal.id = "dayEditorModal";
    modal.className = "modal-backdrop";
    modal.style.display = "none";
    modal.innerHTML =
      '<div class="modal-content">' +
        '<div class="modal-header">' +
          '<h3 class="modal-title">' + dict.dayEditorTitle + '</h3>' +
          '<button type="button" class="btn-close-modal" onclick="SyncCore._closeDayEditor()">✖</button>' +
        '</div>' +
        '<div class="editor-date" id="dayEditorDate"></div>' +
        '<div class="editor-field"><label>' + dict.statusLabel + '</label><div class="status-options" id="dayEditorStatus" data-lockable></div></div>' +
        // Пикер тележки №1
        '<div class="editor-field" id="trolleyPickerField1" data-lockable>' +
          '<label style="margin-bottom:8px;display:block;">📦 ' + dict.cart1Name + '</label>' +
        '</div>' +
        // Пикер тележки №2
        '<div class="editor-field" id="trolleyPickerField2" data-lockable>' +
          '<label style="margin-bottom:8px;display:block;">📦 ' + dict.cart2Name + '</label>' +
        '</div>' +
        '<div class="editor-field" data-lockable><label>' + dict.descLabel + '</label><textarea id="dayEditorDesc" maxlength="500"></textarea></div>' +
        '<div class="editor-field" data-lockable>' +
          '<label>' + dict.noteLabel + ' <span id="dayEditorNoteBadge"></span></label>' +
          '<textarea id="dayEditorNote" maxlength="500"></textarea>' +
          '<div class="quick-presets-container" id="dayEditorPresets">' +
            (dict.presets || []).map(function (p) {
              return '<button type="button" class="quick-preset-btn" data-preset="' + p.replace(/"/g, '&quot;') + '">' + p + '</button>';
            }).join('') +
          '</div>' +
        '</div>' +
        '<div class="editor-actions">' +
          '<button type="button" class="btn-editor-cancel" id="dayEditorCancel">' + dict.cancel + '</button>' +
          '<button type="button" class="btn-editor-edit" id="dayEditorEdit">✏️ ' + dict.edit + '</button>' +
          '<button type="button" class="btn-editor-save" id="dayEditorSave">💾 ' + dict.saveChanges + '</button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(modal);

    // Вставляем пикеры тележек (TrolleyUI.createPicker) для обеих тележек
    var f1 = document.getElementById('trolleyPickerField1');
    var f2 = document.getElementById('trolleyPickerField2');
    if (window.TrolleyUI) {
      if (f1) f1.appendChild(TrolleyUI.createPicker(dict.trolleys, null, function (g) { editorState.cart1Lang = g; }));
      if (f2) f2.appendChild(TrolleyUI.createPicker(dict.trolleys, null, function (g) { editorState.cart2Lang = g; }));
    }

    modal.addEventListener("click", function (e) { if (e.target === modal) SyncCore._closeDayEditor(); });
    document.getElementById("dayEditorCancel").addEventListener("click", function () { SyncCore._closeDayEditor(); });
    document.getElementById("dayEditorEdit").addEventListener("click", enterEditMode);
    document.getElementById("dayEditorSave").addEventListener("click", saveDayFromEditor);
  }

  // Блокирует/разблокирует все поля редактирования дня (режим просмотра/редактирования)
  function setEditorLock(locked) {
    var modal = document.getElementById("dayEditorModal");
    if (!modal) return;
    var fields = modal.querySelectorAll("[data-lockable]");
    for (var i = 0; i < fields.length; i++) {
      var el = fields[i];
      // textarea/input
      if (el.tagName === "TEXTAREA" || el.tagName === "INPUT") el.disabled = locked;
      // контейнеры пикеров тележек и статусов — блокируем кнопки внутри
      var inner = el.querySelectorAll("button, .trolley-picker, .status-option");
      for (var j = 0; j < inner.length; j++) {
        if (locked) { inner[j].setAttribute("disabled", "disabled"); inner[j].style.pointerEvents = "none"; }
        else { inner[j].removeAttribute("disabled"); inner[j].style.pointerEvents = ""; }
      }
      if (locked) el.classList.add("is-locked"); else el.classList.remove("is-locked");
    }
    // Кнопки быстрых шаблонов активны ТОЛЬКО в режиме редактирования
    var presets = modal.querySelectorAll("#dayEditorPresets .quick-preset-btn");
    for (var p = 0; p < presets.length; p++) presets[p].disabled = locked;
    // Переключаем видимость кнопок Редактировать / Сохранить
    var editBtn = document.getElementById("dayEditorEdit");
    var saveBtn = document.getElementById("dayEditorSave");
    if (editBtn) editBtn.style.display = locked ? "" : "none";
    if (saveBtn) saveBtn.style.display = locked ? "none" : "";
  }

  function enterEditMode() {
    setEditorLock(false);
  }

  // Добавляет текст шаблона в поле примечания через запятую (только в режиме редактирования)
  function applyQuickPreset(text) {
    var note = document.getElementById("dayEditorNote");
    if (!note || note.disabled) return;
    note.value = (note.value ? note.value + ", " : "") + text;
  }

  function openDayEditor(date) {
    ensureDayEditor();
    var rows = scheduleIndex[date] || [];
    var c1 = rows.filter(function (r) { return (parseInt(r.cartNumber, 10) || 1) === 1; })[0] || { date: date, status: "available", trolley: "", description: "", note: "" };
    var c2 = rows.filter(function (r) { return (parseInt(r.cartNumber, 10) || 1) === 2; })[0] || { date: date, status: "available", trolley: "", description: "", note: "" };
    editorState.date = date;
    editorState.status = c1.status || c2.status || "available";
    editorState.cart1Lang = c1.trolley || "";
    editorState.cart2Lang = c2.trolley || "";

    if (window.TrolleyUI) {
      var p1 = document.querySelector('#trolleyPickerField1 .trolley-picker');
      var p2 = document.querySelector('#trolleyPickerField2 .trolley-picker');
      if (p1) TrolleyUI.setGroupPickerValue(p1, editorState.cart1Lang || null);
      if (p2) TrolleyUI.setGroupPickerValue(p2, editorState.cart2Lang || null);
    }

    document.getElementById("dayEditorDate").textContent = formatDateHuman(date);

    var opts = document.getElementById("dayEditorStatus");
    opts.innerHTML = "";
    var dict = I18N[getLang()];
    ALLOWED.forEach(function (st) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "status-option" + (st === editorState.status ? " active" : "");
      b.textContent = dict.statuses[st];
      b.dataset.status = st;
      b.onclick = function () {
        editorState.status = st;
        var all = opts.querySelectorAll(".status-option");
        for (var i = 0; i < all.length; i++) all[i].classList.toggle("active", all[i].dataset.status === st);
      };
      opts.appendChild(b);
    });

    document.getElementById("dayEditorDesc").value = c1.description || c2.description || "";
    document.getElementById("dayEditorNote").value = c1.note || c2.note || "";
    updateDayEditorNoteBadge();
    // Кнопки быстрых шаблонов: добавляют текст в примечание через запятую
    var dayEditorModalEl = document.getElementById("dayEditorModal");
    if (dayEditorModalEl) {
      var presetBtns = dayEditorModalEl.querySelectorAll("#dayEditorPresets .quick-preset-btn");
      for (var pi = 0; pi < presetBtns.length; pi++) {
        presetBtns[pi].onclick = function () { applyQuickPreset(this.dataset.preset); };
      }
    }
    document.getElementById("dayEditorModal").style.display = "flex";
    // По умолчанию — режим просмотра (все поля заблокированы)
    setEditorLock(true);
  }

  // Пульсирующий значок "!" рядом с заголовком примечания, если есть текст
  function updateDayEditorNoteBadge() {
    var badge = document.getElementById("dayEditorNoteBadge");
    if (!badge) return;
    var noteVal = (document.getElementById("dayEditorNote") || {}).value || "";
    badge.innerHTML = noteVal.trim()
      ? ' <span class="attention-badge" style="position:static;display:inline-flex;">!</span>'
      : '';
  }

  function closeDayEditor() {
    var m = document.getElementById("dayEditorModal");
    if (m) m.style.display = "none";
  }

  function saveDayFromEditor() {
    var day = {
      date: editorState.date,
      cart1Lang: (editorState.cart1Lang || "").trim().toLowerCase(),
      cart2Lang: (editorState.cart2Lang || "").trim().toLowerCase(),
      status: editorState.status,
      description: (document.getElementById("dayEditorDesc").value || "").trim(),
      note: (document.getElementById("dayEditorNote").value || "").trim()
    };
    var err = validateDayForCart(day.cart1Lang, day.cart2Lang, day);
    if (err) {
      showToast(err === "bad_trolley" ? t("noTrolley") : (t("saveError") + ": " + err), "error");
      return;
    }

    var saveBtn = document.getElementById("dayEditorSave");
    saveBtn.disabled = true;

    saveDay(day).then(function () {
      closeDayEditor();
      showToast("Данные дня успешно обновлены!", "success");
    }).catch(function (err) {
      if (err && err.message === "VERIFY_FAILED") {
        showToast(t("saveVerifyFail"), "error");
      } else {
        showToast(t("saveError") + (err && err.message ? ": " + err.message : ""), "error");
      }
    }).then(function () {
      saveBtn.disabled = false;
    });
  }

  // Валидация дня: статус + хотя бы одна тележка с языком
  function validateDayForCart(c1, c2, day) {
    if (!day || !/^\d{4}-\d{2}-\d{2}$/.test(day.date || "")) return "bad_date";
    if (ALLOWED.indexOf(day.status) === -1) return "bad_status";
    if ((c1 && ALLOWED_LANGS.indexOf(c1) === -1) || (c2 && ALLOWED_LANGS.indexOf(c2) === -1)) return "bad_trolley";
    if (typeof day.description !== "string" || day.description.length > 500) return "bad_desc";
    if (typeof day.note !== "string" || day.note.length > 500) return "bad_note";
    return null;
  }

  // Сохранение дня: валидация -> локально -> push на сервер (по тележкам)
  function saveDay(day) {
    var err = validateDayForCart(day.cart1Lang, day.cart2Lang, day);
    if (err) return Promise.reject(new Error(err));

    // Локально обновляем обе тележки
    setYearCart(day.date, 1, day.cart1Lang);
    setYearCart(day.date, 2, day.cart2Lang);
    // Проставляем статус/описание/заметку в обе строки
    [1, 2].forEach(function (cn) {
      var found = false;
      for (var i = 0; i < yearSchedule.length; i++) {
        if (yearSchedule[i].date === day.date && (parseInt(yearSchedule[i].cartNumber, 10) || 1) === cn) {
          yearSchedule[i].status = day.status;
          yearSchedule[i].description = day.description;
          yearSchedule[i].note = day.note;
          found = true; break;
        }
      }
      if (!found) {
        yearSchedule.push({ date: day.date, cartNumber: cn, trolley: cn === 1 ? day.cart1Lang : day.cart2Lang, status: day.status, description: day.description, note: day.note });
      }
    });
    saveCache(yearSchedule);
    renderYearGrid();

    if (!isValidScriptUrl(GOOGLE_SCRIPT_URL)) return Promise.resolve(); // демо/офлайн-режим

    // Отправляем ОБЕ тележки на сервер (year_update по каждой)
    function postCart(cn, lang) {
      var body = JSON.stringify({
        action: "year_update",
        key: API_KEY,
        language: getLang(),
        date: day.date,
        cartNumber: cn,
        trolley: lang,
        status: day.status,
        description: day.description || "",
        note: day.note || ""
      });
      return withTimeout(fetchWithRetry(GOOGLE_SCRIPT_URL, {
        method: "POST",
        mode: "cors",
        // Content-Type НЕ указываем явно: браузер ставит text/plain (простой CORS, без preflight)
        body: body
      }).then(function (res) { return res.json(); }), 20000, "year_update").then(function (resp) {
        if (!resp || resp.status === "error" || resp.status === "conflict") {
          throw new Error((resp && resp.message) || "SERVER_ERROR");
        }
        if (resp.debugUrl) {
          console.log("%c👉 ДАННЫЕ ЗАПИСАНЫ СЮДА: " + resp.debugUrl, "color: #00ff00; font-weight: bold; font-size: 14px;");
        }
        return true;
      });
    }

    // Отправляем на сервер ТОЛЬКО заполненные тележки (с выбранным языком).
    // Пустые тележки не шлём — иначе сервер отвергнет пустой trolley.
    var posts = [];
    if (day.cart1Lang) posts.push(postCart(1, day.cart1Lang));
    if (day.cart2Lang) posts.push(postCart(2, day.cart2Lang));
    if (!posts.length) posts.push(postCart(1, "")); // хотя бы статус дня сохраняем

    return Promise.all(posts)
      .then(function () {
        // Подтверждаем, что сервер действительно записал изменения
        return fetchCombined().then(function (data) {
          var sched = (data.schedule && data.schedule.length) ? dedupeSchedule(data.schedule) : [];
          var ok = true;
          if (day.cart1Lang) {
            var c1 = sched.filter(function (r) { return r.date === day.date && (parseInt(r.cartNumber, 10) || 1) === 1; })[0];
            if (!c1 || c1.status !== day.status || (c1.description || "") !== (day.description || "") || (c1.note || "") !== (day.note || "")) ok = false;
          }
          if (day.cart2Lang) {
            var c2 = sched.filter(function (r) { return r.date === day.date && (parseInt(r.cartNumber, 10) || 1) === 2; })[0];
            if (!c2 || c2.status !== day.status || (c2.description || "") !== (day.description || "") || (c2.note || "") !== (day.note || "")) ok = false;
          }
          if (!day.cart1Lang && !day.cart2Lang) {
            // День без тележки (выходной/праздник): сверяем хотя бы одну строку по статусу
            var any = sched.filter(function (r) { return r.date === day.date; })[0];
            if (!any || any.status !== day.status) ok = false;
          }
          if (!ok) throw new Error("VERIFY_FAILED");
          setSchedule(sched);
          saveCache(yearSchedule);
          renderYearGrid();
          return true;
        });
      })
      .catch(function (err) { throw err; });
  }

  // ----- Экспорт глобального API -----
  window.SyncCore = {
    runAppLaunch: runAppLaunch,
    refreshAll: refreshAll,
    refreshSilently: refreshSilently,
    startAutoSync: startAutoSync,
    stopAutoSync: stopAutoSync,
    renderYearGrid: renderYearGrid,
    renderAllTabs: renderAllTabs,
    updateAppState: updateAppState,
    addBooking: addBooking,
    addBookingRecord: addBookingRecord,
    removeBooking: removeBooking,
    removeBookingSafe: removeBookingSafe,
    saveDay: saveDay,
    setTrolleyFilter: setTrolleyFilter,
    getTrolleyFilter: function () { return yearTrolleyFilter; },
    goToDateFromYear: goToDateFromYear,
    initTrolleyFilter: initTrolleyFilter,
    _closeDayEditor: closeDayEditor,
    // Сетевые утилиты (используются из app.js для повторных попыток)
    fetchWithRetry: fetchWithRetry,
    fetchCombinedSafe: function () {
      return fetchCombined().then(function (data) {
        return { bookings: data.bookings || [], schedule: data.schedule || [] };
      }).catch(function () { return { bookings: [], schedule: [] }; });
    },
    timeSinceLastSync: timeSinceLastSync,
    // вспомогательные (для делегирования из inline-скрипта)
    fetchBookings: refreshAll,
    getApiKey: function () { return API_KEY; },
    getLang: getLang
  };

  // Инициализация переключателя тележек (из localStorage) и заполнение SVG-иконок
  initTrolleyFilter();
})();

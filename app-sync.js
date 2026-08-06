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
      yearMessageLabel:"Объявление на вкладке График (YearSchedule)", yearMessagePlaceholder:"Введите текст объявления...", saveYearMessage:"Отправить объявление", deleteYearMessage:"Удалить объявление",
      cart1Name:"Тележка №1 (Стенд 1)", cart2Name:"Тележка №2 (Стенд 2)", cart1Lang:"Язык тележки №1", cart2Lang:"Язык тележки №2", bookingsTitle:"📋 Записи на этот день:", goToSchedule:"📅 В график", noBookings:"Записей на этот день нет (свободно)",
      preacher1:"Возвещатель 1 (ФИО)", preacher2:"Возвещатель 2 (ФИО)",
      save:"Сохранить", cancel:"Отмена", confirmDeleteYes:"Да, удалить", savedTitle:"Сохранено", errorTitle:"Ошибка", ok:"OK", daySaved:"Данные дня успешно сохранены!", saving:"Сохранение…", saved:"Данные сохранены", edit:"Редактировать", saveChanges:"Сохранить изменения", saveError:"Ошибка сохранения", saveVerifyFail:"Сервер не сохранил изменения. Пересоздайте Web App (Deploy → New version) с новым кодом google_script.txt.",
      offline:"Нет связи с сервером. Показан последний сохранённый график.",
      updated:"График обновлён", syncError:"Не удалось обновить данные",
      online:"Онлайн", offlineShort:"Офлайн", refresh:"Обновить",
      presets:["Нет литературы","Тележка сломана ⚠️","Постер повреждён","Порван чехол"],
      infoTip:"Подсказка",
      infoTips:{
        status:"Что происходит в этот день.\n• Служение — стенд работает.\n• Выходной / Праздник — не служим.\n• Событие / Особое — особый день (например, поломка).",
        cartLang:"Язык литературы на этой тележке: Русская, Украинская или Немецкая. От него зависит цвет ячейки в годовом графике.",
        description:"Опишите событие или особый день (например, «Пасха», «Ярмарок»). Видно в годовом графике.",
        note:"Заметка о проблеме или напоминание: «Порван чехол», «Нет литературы». Нажмите кнопку-шаблон ниже, чтобы добавить быстро.",
        qbDate:"День, на который вы записываете смену.",
        qbTime:"Время начала и окончания смены.",
        qbLocation:"Место (локация), где будет стенд.",
        qbCart:"Номер тележки (1 или 2), которую вы записываете.",
        qbLang:"Язык литературы на тележке: Русская, Украинская или Немецкая.",
        qbNames:"Имена двух участников этой тележки.",
        mainCartLang:"Язык литературы на этой тележке (Русская / Украинская / Немецкая). Цвет помогает найти её в годовом графике."
      }
    },
    uk: {
      months: ["Січень","Лютий","Березень","Квітень","Травень","Червень","Липень","Серпень","Вересень","Жовтень","Листопад","Грудень"],
      weekdays: ["Пн","Вт","Ср","Чт","Пт","Сб","Нд"],
      statuses: { available:"Служіння", closed:"Вихідний", event:"Подія", holiday:"Свято", special:"Особливе" },
      dayEditorTitle:"День служіння", statusLabel:"Статус", descLabel:"Опис події", noteLabel:"Примітка", trolleyLabel:"Візок", trolleyPlaceholder:"— оберіть —", trolleys:{ru:"Російська",ua:"Українська",de:"Німецька"}, noTrolley:"Оберіть візок",
      yearMessageLabel:"Оголошення на вкладці Графік (YearSchedule)", yearMessagePlaceholder:"Введіть текст оголошення...", saveYearMessage:"Надіслати оголошення", deleteYearMessage:"Видалити оголошення",
      cart1Name:"Візок №1 (Стенд 1)", cart2Name:"Візок №2 (Стенд 2)", cart1Lang:"Мова візка №1", cart2Lang:"Мова візка №2", bookingsTitle:"📋 Записи на цей день:", goToSchedule:"📅 До розкладу", noBookings:"Записів на цей день немає (вільно)",
      preacher1:"Возвіщувач 1 (ПІБ)", preacher2:"Возвіщувач 2 (ПІБ)",
      save:"Зберегти", cancel:"Скасувати", confirmDeleteYes:"Так, видалити", savedTitle:"Збережено", errorTitle:"Помилка", ok:"OK", daySaved:"Дані дня успішно збережено!", saving:"Збереження…", saved:"Дані збережено", edit:"Редагувати", saveChanges:"Зберегти зміни", saveError:"Помилка збереження", saveVerifyFail:"Сервер не зберіг зміни. Перевидіть Web App (Deploy → New version) з новим кодом google_script.txt.",
      offline:"Немає звʼязку із сервером. Показано останній збережений графік.",
      updated:"Графік оновлено", syncError:"Не вдалося оновити дані",
      online:"Онлайн", offlineShort:"Офлайн", refresh:"Оновити",
      presets:["Немає літератури","Візок зламаний ⚠️","Постер пошкоджено","Чохол порваний"],
      infoTip:"Підказка",
      infoTips:{
        status:"Що відбувається цього дня.\n• Служіння — стенд працює.\n• Вихідний / Свято — не служимо.\n• Подія / Особливе — особливий день (наприклад, поломка).",
        cartLang:"Мова літератури на цьому візку: Російська, Українська або Німецька. Від неї залежить колір клітинки у річному графіку.",
        description:"Опишіть подію чи особливий день (наприклад, «Великдень», «Ярмарок»). Видно у річному графіку.",
        note:"Примітка про проблему або нагадування: «Порваний чохол», «Немає літератури». Натисніть кнопку-шаблон нижче, щоб додати швидко.",
        qbDate:"День, на який ви записуєте зміну.",
        qbTime:"Час початку і закінчення зміни.",
        qbLocation:"Місце (локація), де буде стенд.",
        qbCart:"Номер візка (1 або 2), який ви записуєте.",
        qbLang:"Мова літератури на візку: Російська, Українська або Німецька.",
        qbNames:"Імена двох учасників цього візка.",
        mainCartLang:"Мова літератури на цьому візку (Російська / Українська / Німецька). Колір допомагає знайти її у річному графіку."
      }
    },
    de: {
      months: ["Januar","Februar","März","April","Mai","Juni","Juli","August","September","Oktober","November","Dezember"],
      weekdays: ["Mo","Di","Mi","Do","Fr","Sa","So"],
      statuses: { available:"Dienst", closed:"Frei", event:"Veranstaltung", holiday:"Feiertag", special:"Besonderes" },
      dayEditorTitle:"Diensttag", statusLabel:"Status", descLabel:"Ereignisbeschreibung", noteLabel:"Notiz", trolleyLabel:"Trolley", trolleyPlaceholder:"— auswählen —", trolleys:{ru:"Russisch",ua:"Ukrainisch",de:"Deutsch"}, noTrolley:"Trolley auswählen",
      yearMessageLabel:"Ankündigung auf der Registerkarte Zeitplan (YearSchedule)", yearMessagePlaceholder:"Geben Sie den Text der Ankündigung ein...", saveYearMessage:"Ankündigung senden", deleteYearMessage:"Ankündigung löschen",
      cart1Name:"Trolley №1 (Stand 1)", cart2Name:"Trolley №2 (Stand 2)", cart1Lang:"Sprache Trolley №1", cart2Lang:"Sprache Trolley №2", bookingsTitle:"📋 Einträge für diesen Tag:", goToSchedule:"📅 Zum Zeitplan", noBookings:"Keine Einträge für diesen Tag (frei)",
      save:"Speichern", cancel:"Abbrechen", confirmDeleteYes:"Ja, löschen", savedTitle:"Gespeichert", errorTitle:"Fehler", ok:"OK", daySaved:"Daten des Tages erfolgreich gespeichert!", saving:"Speichern…", saved:"Daten gespeichert", edit:"Bearbeiten", saveChanges:"Änderungen speichern", saveError:"Speicherfehler", saveVerifyFail:"Server hat die Änderungen nicht gespeichert. Erstellen Sie die Web App neu (Deploy → New version) mit dem neuen Code google_script.txt.",
      offline:"Keine Verbindung zum Server. Letzter gespeicherter Plan wird angezeigt.",
      updated:"Plan aktualisiert", syncError:"Daten konnten nicht aktualisiert werden",
      online:"Online", offlineShort:"Offline", refresh:"Aktualisieren",
      presets:["Keine Literatur","Trolley kaputt ⚠️","Plakat beschädigt","Hülle zerrissen"],
      infoTip:"Hinweis",
      infoTips:{
        status:"Was an diesem Tag passiert.\n• Dienst — Stand arbeitet.\n• Frei / Feiertag — kein Dienst.\n• Veranstaltung / Besonderes — besonderer Tag (z. B. Defekt).",
        cartLang:"Sprache der Literatur auf diesem Trolley: Russisch, Ukrainisch oder Deutsch. Davon hängt die Farbe der Zelle im Jahresplan ab.",
        description:"Beschreiben Sie das Ereignis oder den besonderen Tag (z. B. «Ostern», «Markt»). Sichtbar im Jahresplan.",
        note:"Notiz zu einem Problem oder eine Erinnerung: «Hülle zerrissen», «Keine Literatur». Klicken Sie unten auf die Vorlage, um sie schnell hinzuzufügen.",
        qbDate:"Der Tag, für den Sie die Schicht eintragen.",
        qbTime:"Beginn und Ende der Schicht.",
        qbLocation:"Ort (Standort), an dem der Stand steht.",
        qbCart:"Nummer des Trolleys (1 oder 2), den Sie eintragen.",
        qbLang:"Sprache der Literatur auf dem Trolley: Russisch, Ukrainisch oder Deutsch.",
        qbNames:"Namen der beiden Teilnehmer dieses Trolleys.",
        mainCartLang:"Sprache der Literatur auf diesem Trolley (Russisch / Ukrainisch / Deutsch). Die Farbe hilft, ihn im Jahresplan zu finden."
      }
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
  var isSyncLocked = false;  // Блокировка фонового автообновления при отправке/удалении записи
  var editorState = { date: null, status: "available" };
  var yearTrolleyFilter = "all"; // 'all' | 'ru' | 'ua' | 'de' — фильтр тележек на главной
  var selectedYear = null;
  var selectedStatusFilter = null;

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
  
  var hessenHolidaysCache = {};

  function getEasterSunday(year) {
    var a = year % 19;
    var b = Math.floor(year / 100);
    var c = year % 100;
    var d = Math.floor(b / 4);
    var e = b % 4;
    var f = Math.floor((b + 8) / 25);
    var g = Math.floor((b - f + 1) / 3);
    var h = (19 * a + b - d - g + 15) % 30;
    var i = Math.floor(c / 4);
    var k = c % 4;
    var l = (32 + 2 * e + 2 * i - h - k) % 7;
    var m = Math.floor((a + 11 * h + 22 * l) / 451);
    var month = Math.floor((h + l - 7 * m + 114) / 31);
    var day = ((h + l - 7 * m + 114) % 31) + 1;
    return new Date(year, month - 1, day);
  }

  function calculateHessenHolidays(year) {
    var easter = getEasterSunday(year);
    function addDays(date, days) {
      var res = new Date(date);
      res.setDate(res.getDate() + days);
      return res;
    }
    function formatDate(date) {
      var y = date.getFullYear();
      var m = String(date.getMonth() + 1).padStart(2, '0');
      var d = String(date.getDate()).padStart(2, '0');
      return y + "-" + m + "-" + d;
    }

    var holidays = {};
    holidays[year + "-01-01"] = { de: "Neujahr", ru: "Новый год", uk: "Новий рік", ua: "Новий рік" };
    holidays[year + "-05-01"] = { de: "Tag der Arbeit", ru: "День труда", uk: "День праці", ua: "День праці" };
    holidays[year + "-10-03"] = { de: "Tag der Deutschen Einheit", ru: "День немецкого единства", uk: "День німецької єдності", ua: "День німецької єдності" };
    holidays[year + "-12-25"] = { de: "1. Weihnachtstag", ru: "Рождество (день 1)", uk: "Різдво (день 1)", ua: "Різдво (день 1)" };
    holidays[year + "-12-26"] = { de: "2. Weihnachtstag", ru: "Рождество (день 2)", uk: "Різдво (день 2)", ua: "Різдво (день 2)" };

    var karfreitag = addDays(easter, -2);
    var ostermontag = addDays(easter, 1);
    var christiHimmelfahrt = addDays(easter, 39);
    var pfingstmontag = addDays(easter, 50);
    var fronleichnam = addDays(easter, 60);

    holidays[formatDate(karfreitag)] = { de: "Karfreitag", ru: "Страстная пятница", uk: "Страсна п’ятниця", ua: "Страсна п’ятниця" };
    holidays[formatDate(ostermontag)] = { de: "Ostermontag", ru: "Пасхальный понедельник", uk: "Великодній понеділок", ua: "Великодній понеділок" };
    holidays[formatDate(christiHimmelfahrt)] = { de: "Christi Himmelfahrt", ru: "Вознесение Господне", uk: "Вознесіння Господнє", ua: "Вознесіння Господнє" };
    holidays[formatDate(pfingstmontag)] = { de: "Pfingstmontag", ru: "День Святого Духа", uk: "День Святого Духа", ua: "День Святого Духа" };
    holidays[formatDate(fronleichnam)] = { de: "Fronleichnam", ru: "Праздник Тела и Крови Христовых", uk: "Свято Тіла і Крові Христових", ua: "Свято Тіла і Крові Христових" };

    return holidays;
  }

  function getHolidaysForYear(year) {
    if (!hessenHolidaysCache[year]) {
      hessenHolidaysCache[year] = calculateHessenHolidays(year);
      fetchHolidaysFromAPI(year);
    }
    return hessenHolidaysCache[year];
  }

  function fetchHolidaysFromAPI(year) {
    var url = "https://date.nager.at/api/v3/PublicHolidays/" + year + "/DE";
    fetch(url)
      .then(function (res) {
        if (!res.ok) throw new Error("HTTP_" + res.status);
        return res.json();
      })
      .then(function (data) {
        if (!Array.isArray(data)) return;
        var apiHolidays = {};
        data.forEach(function (h) {
          var isGlobal = h.global || !h.counties;
          var isHessen = h.counties && h.counties.indexOf("DE-HE") !== -1;
          if (isGlobal || isHessen) {
            apiHolidays[h.date] = {
              de: h.localName,
              en: h.name
            };
          }
        });
        
        var calculated = calculateHessenHolidays(year);
        var merged = {};
        var allDates = Object.keys(Object.assign({}, calculated, apiHolidays));
        allDates.forEach(function (date) {
          var calcItem = calculated[date];
          var apiItem = apiHolidays[date];
          if (calcItem) {
            merged[date] = calcItem;
          } else if (apiItem) {
            merged[date] = {
              de: apiItem.de,
              ru: apiItem.de,
              uk: apiItem.de,
              ua: apiItem.de
            };
          }
        });
        hessenHolidaysCache[year] = merged;
        if (typeof renderAllTabs === "function") {
          renderAllTabs();
        }
      })
      .catch(function (err) {
        console.warn("Failed to fetch holidays from API for year " + year + ", using calculated values.", err);
      });
  }
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
    var raw = Array.isArray(sched) ? sched : [];
    if (!raw.length) raw = generateYearSchedule();
    yearSchedule = dedupeSchedule(raw);
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

  // Объединяет дубликаты по дате+номеру тележки, сохраняя заполненный статус, описание и заметку
  function dedupeSchedule(arr) {
    if (!Array.isArray(arr)) return [];
    var seen = {};
    for (var i = 0; i < arr.length; i++) {
      var day = arr[i];
      if (!day || !day.date) continue;
      var dateIso = normalizeDateValue(day.date);
      if (!dateIso) continue;
      var cartNum = parseInt(day.cartNumber, 10) || 1;
      var key = dateIso + "|" + cartNum;

      if (!seen[key]) {
        seen[key] = {
          date: dateIso,
          cartNumber: cartNum,
          trolley: (day.trolley || "").trim().toLowerCase(),
          status: day.status || "available",
          description: (day.description || "").trim(),
          note: (day.note || "").trim()
        };
      } else {
        var existing = seen[key];
        var st = (day.status && day.status !== "available") ? day.status : existing.status;
        var desc = (day.description && day.description.trim()) ? day.description.trim() : existing.description;
        var nt = (day.note && day.note.trim()) ? day.note.trim() : existing.note;
        var tr = (day.trolley && day.trolley.trim()) ? day.trolley.trim().toLowerCase() : existing.trolley;

        seen[key] = {
          date: dateIso,
          cartNumber: cartNum,
          trolley: tr,
          status: st,
          description: desc,
          note: nt
        };
      }
    }
    var keys = Object.keys(seen).sort();
    var out = [];
    for (var k = 0; k < keys.length; k++) {
      out.push(seen[keys[k]]);
    }
    return out;
  }

  function mergeSchedules(serverSched, localSched) {
    var base = generateYearSchedule();
    var local = Array.isArray(localSched) ? localSched : [];
    var server = Array.isArray(serverSched) ? serverSched : [];
    return dedupeSchedule(base.concat(local).concat(server));
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

// Строит URL запроса к Google Apps Script строго на основе GOOGLE_SCRIPT_URL.
// Каждый вызов конструирует URL заново, добавляя ключ и параметр защиты от кэширования.
// Перенаправленные URL (script.googleusercontent.com) НЕ сохраняются и НЕ повторно используются.
function buildApiUrl() {
  var base = GOOGLE_SCRIPT_URL;
  var sep = base.indexOf("?") === -1 ? "?" : "&";
  return base + sep + "key=" + encodeURIComponent(API_KEY) + "&_t=" + Date.now();
}

// Обёртка fetch с Exponential Backoff:
// при ошибках 429 / 500 / 503 (перегрузка сервера) или потере сети
// автоматически повторяет запрос: 1 с → 3 с → 5 с (до maxAttempts попыток).
// Каждая попытка строит URL заново через buildApiUrl(), чтобы никогда
// не повторно использовать перенаправленный URL (script.googleusercontent.com).
  function fetchWithRetry(urlBuilder, opts, maxAttempts) {
    maxAttempts = maxAttempts || 3;
    function attempt(n) {
      var url = (typeof urlBuilder === "function") ? urlBuilder() : urlBuilder;
      var fetchOpts = Object.assign({}, opts, { cache: "no-store" });
      return fetch(url, fetchOpts).then(function (res) {
        if ((res.status === 429 || res.status === 500 || res.status === 503) && n < maxAttempts) {
          var delay = Math.pow(2, n - 1) * 1000 + Math.floor(Math.random() * 1000);
          console.log("[SyncCore] Server error " + res.status + ", retrying attempt " + (n + 1) + " in " + delay + "ms");
          return new Promise(function (resolve) {
            setTimeout(function () { resolve(attempt(n + 1)); }, delay);
          });
        }
        return res;
      }).catch(function (err) {
        if (err && (err.name === 'AbortError' || (opts && opts.signal && opts.signal.aborted))) {
          console.warn("[SyncCore] Fetch request aborted (tab hidden or new request created), skipping retries.");
          var abortErr = new Error("AbortError");
          abortErr.name = "AbortError";
          throw abortErr;
        }
        if (n < maxAttempts) {
          var delay = Math.pow(2, n - 1) * 1000 + Math.floor(Math.random() * 1000);
          console.warn("[SyncCore] Fetch network error, retrying attempt " + (n + 1) + " in " + delay + "ms", err);
          return new Promise(function (resolve) {
            setTimeout(function () { resolve(attempt(n + 1)); }, delay);
          });
        }
        throw err;
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

  // ----- Очередь офлайн-синхронизации (Offline Sync Queue) -----
  var OFFLINE_QUEUE_KEY = "booking_offline_actions_v1";

  function getOfflineQueue() {
    try {
      return JSON.parse(localStorage.getItem(OFFLINE_QUEUE_KEY)) || [];
    } catch (e) {
      return [];
    }
  }

  function saveOfflineQueue(queue) {
    try {
      localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
    } catch (e) {}
  }

  function pushOfflineAction(type, data) {
    var queue = getOfflineQueue();
    queue.push({ id: Date.now() + "_" + Math.random(), type: type, data: data });
    saveOfflineQueue(queue);
    console.log("[SyncCore] Offline action queued:", type, data);
  }

  var isQueueProcessing = false;

  function processOfflineQueue() {
    if (isQueueProcessing) return Promise.resolve(true);
    var queue = getOfflineQueue();
    if (queue.length === 0) return Promise.resolve(true);

    isQueueProcessing = true;
    console.log("[SyncCore] Starting processing offline queue of size:", queue.length);

    function executeAction(action) {
      if (!isValidScriptUrl(GOOGLE_SCRIPT_URL)) return Promise.resolve(true);

      var p;
      if (action.type === "create") {
        var body = JSON.stringify({
          action: "create",
          key: API_KEY,
          language: getLang(),
          bookings: [action.data.record]
        });
        p = fetch(buildApiUrl(), {
          method: "POST",
          mode: "cors",
          body: body
        }).then(function (res) { return res.json(); });
      } else if (action.type === "delete") {
        var params = new URLSearchParams({
          action: "delete",
          location: action.data.booking.location,
          date: action.data.booking.date,
          time: action.data.booking.time,
          cartNumber: String(action.data.booking.cartNumber),
          language: getLang(),
          key: API_KEY
        });
        p = fetch(GOOGLE_SCRIPT_URL + '?' + params.toString(), {
          method: 'POST',
          mode: 'cors'
        }).then(function (res) { return res.json(); });
      } else if (action.type === "year_update") {
        var day = action.data.day;
        var posts = [];
        var postCartFn = function(cn, lang) {
          var userEmail = (window.AppState && AppState.authUser && AppState.authUser.email) || "";
          var body = JSON.stringify({
            action: "year_update",
            email: userEmail,
            key: API_KEY,
            language: getLang(),
            date: day.date,
            cartNumber: cn,
            trolley: lang,
            status: day.status,
            description: day.description || "",
            note: day.note || ""
          });
          return fetch(buildApiUrl(), {
            method: "POST",
            mode: "cors",
            body: body
          }).then(function (res) { return res.json(); });
        };
        if (day.cart1Lang) posts.push(postCartFn(1, day.cart1Lang));
        if (day.cart2Lang) posts.push(postCartFn(2, day.cart2Lang));
        if (!posts.length) posts.push(postCartFn(1, ""));
        p = Promise.all(posts).then(function (results) {
          for (var i = 0; i < results.length; i++) {
            if (results[i] && results[i].status === "error") return results[i];
          }
          return { status: "success" };
        });
      } else {
        return Promise.resolve(true);
      }

      return p.then(function (result) {
        if (result && (result.status === "error" || result.status === "conflict")) {
          console.error("[SyncCore] Offline action rejected by server:", action, result);
          return true; 
        }
        if (action.type === "create") {
          try {
            sendOneSignalNotificationClient(action.data.record);
          } catch (e) {
            console.error("[OneSignal] Error calling client-side push:", e);
          }
        }
        return true;
      }).catch(function (err) {
        console.warn("[SyncCore] Offline action network fail, will retry later:", action, err);
        throw err;
      });
    }

    function processNext(index) {
      if (index >= queue.length) {
        saveOfflineQueue([]);
        isQueueProcessing = false;
        console.log("[SyncCore] Offline queue fully synchronized!");
        return true;
      }

      return executeAction(queue[index]).then(function () {
        var currentQueue = getOfflineQueue();
        currentQueue = currentQueue.filter(function (x) { return x.id !== queue[index].id; });
        saveOfflineQueue(currentQueue);
        return processNext(index + 1);
      }).catch(function (err) {
        isQueueProcessing = false;
        throw err;
      });
    }

    return processNext(0);
  }

  // Автоматическая отправка офлайн-очереди при восстановлении подключения
  window.addEventListener('online', function () {
    console.log("[SyncCore] Connection restored. Flushing offline queue...");
    var queue = getOfflineQueue();
    var count = queue.length;
    if (count > 0) {
      processOfflineQueue().then(function () {
        var lang = (localStorage.getItem("preferredLanguage") || document.documentElement.lang || "ru").toLowerCase();
        var msg = "Офлайн-записи успешно отправлены на сервер!";
        if (lang === "de") msg = "Offline-Buchungen erfolgreich an den Server gesendet!";
        else if (lang === "ua" || lang === "uk") msg = "Офлайн-записи успішно надіслано на сервер!";
        if (typeof showToast === 'function') showToast(msg, "success");
        if (typeof refreshAll === 'function') refreshAll();
      }).catch(function (err) {
        console.warn("[SyncCore] Error flushing offline queue:", err);
      });
    }
  });

  var activeSyncAbortController = null;

  function fetchCombined() {
    if (!isValidScriptUrl(GOOGLE_SCRIPT_URL)) return Promise.reject(new Error("NO_URL"));

    if (activeSyncAbortController) {
      try { activeSyncAbortController.abort(); } catch (e) {}
    }
    activeSyncAbortController = (typeof AbortController !== 'undefined') ? new AbortController() : null;
    var signal = activeSyncAbortController ? activeSyncAbortController.signal : null;

    // Разумный таймаут для отмены висящего запроса (15 секунд)
    var timeoutId = setTimeout(function() {
      if (activeSyncAbortController) {
        try { activeSyncAbortController.abort(); } catch (e) {}
      }
    }, 15000);

    return processOfflineQueue().catch(function() {}).then(function() {
      return fetchWithRetry(buildApiUrl, { cache: "no-store", signal: signal }).then(function (res) {
        clearTimeout(timeoutId);
        if (!res.ok) throw new Error("HTTP_" + res.status);
        return res.json();
      }).then(function (data) {
        clearTimeout(timeoutId);
        if (data && data.status === "error") throw new Error(data.message || "SERVER_ERROR");
        return {
          bookings: Array.isArray(data.bookings) ? data.bookings : (Array.isArray(data) ? data : []),
          schedule: Array.isArray(data.schedule) ? data.schedule : [],
          yearScheduleMessages: data.yearScheduleMessages || {}
        };
      });
    }).catch(function(err) {
      clearTimeout(timeoutId);
      if (err && (err.name === "AbortError" || (err.message && err.message.indexOf("Abort") !== -1))) {
        console.warn("[SyncCore] Combined fetch aborted (tab hidden or superseded).");
        return null;
      }
      throw err;
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
  function isAuthModalVisible() {
    var modal = document.getElementById("authModal");
    return modal && modal.style.display === "flex";
  }

  function showSplash() {
    if (!isUserAuthenticated() || isAuthModalVisible()) {
      hideSplash();
      return;
    }
    var s = document.getElementById("splashScreen");
    if (s) s.classList.remove("hidden");
  }
  function hideSplash() { var s = document.getElementById("splashScreen"); if (s) s.classList.add("hidden"); }

  function isUserAuthenticated() {
    var u = (window.AppState && AppState.authUser) || (typeof getAuthUser === "function" ? getAuthUser() : null);
    if (!u) {
      try {
        u = JSON.parse(localStorage.getItem("authUser"));
      } catch (e) {}
    }
    return (u && u.email) ? true : false;
  }

  // ----- Запуск приложения: оптимизированный старт под 200+ пользователей -----
  function runAppLaunch() {
    if (!isUserAuthenticated() || isAuthModalVisible()) {
      console.log("[SyncCore] User not authenticated or auth modal open. Auto-sync disabled.");
      hideSplash();
      return Promise.resolve();
    }

    showSplash();

    // — Шаг 1: мгновенно показываем кэшированные данные (если есть) —
    var cb = getCachedBookings();
    var cs = loadCache();
    var hasCachedData = (cb.length > 0 || (cs && cs.length > 0));
    if (hasCachedData) {
      var schedCached = (cs && cs.length) ? cs : generateYearSchedule();
      var cachedMessages = {};
      try {
        cachedMessages = JSON.parse(localStorage.getItem("yearScheduleMessages")) || {};
      } catch (e) {}
      updateAppState({ bookings: cb, schedule: schedCached, yearScheduleMessages: cachedMessages });
      hideSplash();     // убираем splash немедленно — пользователь уже видит данные
      updateSyncBadge();
    }

    // — Шаг 2: фоновый запрос со случайной задержкой (jitter) —
    var jitter = Math.floor(Math.random() * 1500);
    return new Promise(function (resolve) {
      setTimeout(function () {
        fetchCombined().then(function (data) {
          if (!data) return;
          var bookings = (data.bookings || []).map(normalizeBooking);
          var sched = mergeSchedules(data.schedule, loadCache());
          updateAppState({ bookings: bookings, schedule: sched, yearScheduleMessages: data.yearScheduleMessages });
          lastSyncOnline = true;
          lastSyncTime   = Date.now();
          if (typeof renderYearGrid === 'function') renderYearGrid();
        }).catch(function (err) {
          if (err && err.name === "AbortError") return;
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
      if (!data) return false;
      var bookings = (data.bookings || []).map(normalizeBooking);
      var sched = mergeSchedules(data.schedule, loadCache());
      updateAppState({ bookings: bookings, schedule: sched, yearScheduleMessages: data.yearScheduleMessages }, true);
      lastSyncOnline = true;
      lastSyncTime   = Date.now();
      showToast(t("updated"), "success");
      updateSyncBadge();
      return true;
    }).catch(function (err) {
      if (err && err.name === "AbortError") return false;
      lastSyncOnline = false;
      showToast(t("syncError"), "error");
      updateSyncBadge();
      return false;
    });
  }

  // Фоновое тихое обновление (без лишних уведомлений)
  function refreshSilently() {
    if (!isUserAuthenticated()) {
      console.log("[SyncCore] User not authenticated. Auto-sync disabled.");
      stopAutoSync();
      return Promise.resolve(false);
    }
    if (isSyncLocked) return Promise.resolve(true);
    return fetchCombined().then(function (data) {
      if (!data) return;
      var bookings = (data.bookings || []).map(normalizeBooking);
      var sched = mergeSchedules(data.schedule, loadCache());
      updateAppState({ bookings: bookings, schedule: sched, yearScheduleMessages: data.yearScheduleMessages });
      lastSyncOnline = true;
      lastSyncTime   = Date.now();
      updateSyncBadge();
    }).catch(function () { lastSyncOnline = false; updateSyncBadge(); });
  }

  // Сколько миллисекунд прошло с последней синхронизации (Infinity = синхронизации ещё не было)
  function timeSinceLastSync() {
    return lastSyncTime > 0 ? (Date.now() - lastSyncTime) : Infinity;
  }

  // ----- Адаптивный опрос (Adaptive Polling) -----
  var isTabVisible = true;
  var lastUserActivityTime = Date.now();
  var IDLE_TIMEOUT_MS = 5 * 60 * 1000; // 5 минут
  var IDLE_SYNC_INTERVAL_MS = 10 * 60 * 1000; // 10 минут
  var currentIntervalMs = SYNC_INTERVAL_MS;

  function updateActivity() {
    var now = Date.now();
    var wasIdle = (now - lastUserActivityTime > IDLE_TIMEOUT_MS);
    lastUserActivityTime = now;
    if (wasIdle) {
      console.log("[SyncCore] User returned from idle, resuming active sync.");
      adjustPollingInterval();
    }
  }

  function adjustPollingInterval() {
    if (!isUserAuthenticated()) {
      if (autoTimer !== null) {
        console.log("[SyncCore] User not authenticated. Stopping auto sync.");
        stopAutoSync();
      }
      return;
    }
    var now = Date.now();
    var isIdle = (now - lastUserActivityTime > IDLE_TIMEOUT_MS);
    var targetInterval = isIdle ? IDLE_SYNC_INTERVAL_MS : SYNC_INTERVAL_MS;

    if (!isTabVisible) {
      if (autoTimer !== null) {
        console.log("[SyncCore] Tab hidden, pausing auto sync.");
        stopAutoSync();
      }
      return;
    }

    if (autoTimer === null || currentIntervalMs !== targetInterval) {
      console.log("[SyncCore] Adjusting auto sync interval to:", targetInterval / 1000, "seconds.");
      stopAutoSync();
      currentIntervalMs = targetInterval;
      autoTimer = setInterval(refreshSilently, currentIntervalMs);
    }
  }

  // Activity listeners
  document.addEventListener("mousemove", updateActivity);
  document.addEventListener("keydown", updateActivity);
  document.addEventListener("click", updateActivity);
  document.addEventListener("touchstart", updateActivity, { passive: true });

  // Tab visibility changes
  document.addEventListener("visibilitychange", function () {
    isTabVisible = (document.visibilityState === "visible");
    if (isTabVisible && isUserAuthenticated()) {
      updateActivity();
      if (timeSinceLastSync() > SYNC_INTERVAL_MS) {
        refreshSilently();
      }
    }
    adjustPollingInterval();
  });

  // Periodically check if idle status changed
  setInterval(adjustPollingInterval, 30000);

  function startAutoSync() {
    if (!isUserAuthenticated()) {
      console.log("[SyncCore] User not authenticated. Auto-sync disabled.");
      stopAutoSync();
      return;
    }
    adjustPollingInterval();
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

  var lastAppDataHash = null;

  function calculateDataHash(data) {
    try {
      var bStr = Array.isArray(data.bookings) ? JSON.stringify(data.bookings) : "";
      var sStr = Array.isArray(data.schedule) ? JSON.stringify(data.schedule) : "";
      var mStr = data.yearScheduleMessages ? JSON.stringify(data.yearScheduleMessages) : "";
      return bStr + "||" + sStr + "||" + mStr;
    } catch (e) {
      return null;
    }
  }

  // ----- Глобальный менеджер состояния (единственный источник данных) -----
  // Обновляет AppState, сохраняет локальный кэш и бесшовно обновляет вкладки.
  function updateAppState(newData, isForce) {
    if (!newData) newData = {};

    var newHash = calculateDataHash(newData);
    if (!isForce && newHash !== null && newHash === lastAppDataHash) {
      console.log("[SyncCore] Background data unchanged. Skipping DOM re-render.");
      return;
    }
    if (newHash !== null) {
      lastAppDataHash = newHash;
    }
    window.currentAppData = newData;

    if (Array.isArray(newData.bookings)) {
      AppState.bookings = newData.bookings;
      try { databaseBookings = AppState.bookings; } catch (e) {}
      saveCachedBookings(AppState.bookings);
    }
    if (Array.isArray(newData.schedule)) {
      AppState.schedule = newData.schedule;
      setSchedule(AppState.schedule);
      saveCache(AppState.schedule);
    }

    renderAllTabs(isForce);
  }

  // Перерисовка всех активных вкладок без мерцания и сброса состояния
  function renderAllTabs(isExplicitUpdate) {
    // Сохраняем положение скролла и фокус пользователя
    var currentScrollY = window.scrollY;
    var activeEl = document.activeElement;
    var activeElId = (activeEl && activeEl.id) ? activeEl.id : null;
    var isInputFocused = activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA' || activeEl.tagName === 'SELECT');

    if (typeof window.updateLocationsFromBookings === "function") {
      window.updateLocationsFromBookings();
    }
    if (typeof renderBookingTab === "function") renderBookingTab();
    else if (typeof onLocationOrDateChange === "function") onLocationOrDateChange();
    if (typeof renderScheduleTab === "function") renderScheduleTab();
    else if (typeof renderScheduleBoard === "function") renderScheduleBoard();
    if (typeof renderYearGrid === "function") renderYearGrid();
    if (typeof renderYearScheduleMessage === "function") renderYearScheduleMessage();

    if (typeof window.syncNotificationButtonState === "function") {
      window.syncNotificationButtonState();
    }

    // Восстанавливаем скролл
    if (window.scrollY !== currentScrollY) {
      window.scrollTo({ top: currentScrollY, behavior: 'instant' });
    }

    // Восстанавливаем фокус на поле ввода при необходимости
    if (isInputFocused && activeElId) {
      var elToFocus = document.getElementById(activeElId);
      if (elToFocus && typeof elToFocus.focus === 'function') {
        try { elToFocus.focus(); } catch (e) {}
      }
    }

    if (isExplicitUpdate) {
      try {
        var activeTab = document.querySelector('.tab-content.active');
        if (activeTab) {
          activeTab.classList.remove('tab-updated-flash');
          void activeTab.offsetWidth;
          activeTab.classList.add('tab-updated-flash');
          setTimeout(function () {
            activeTab.classList.remove('tab-updated-flash');
          }, 500);
        }
      } catch (e) {}
    }
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
      if (b.cart1Lang && (b.name1 || b.name2)) c1 = b.cart1Lang.toLowerCase();
      if (b.cart2Lang && (b.name3 || b.name4)) c2 = b.cart2Lang.toLowerCase();
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
    if (typeof window.isAuthenticated === "function" && !window.isAuthenticated()) {
      return Promise.resolve(false);
    }
    isSyncLocked = true;
    var cn = parseInt(b.cartNumber, 10);
    if (!(cn === 1 || cn === 2)) cn = 1;
    // Сохраняем снимок затронутых слотов до изменения (для отката)
    var snapshot = (AppState.bookings || []).map(function (x) { return Object.assign({}, x); });

    removeBooking(b); // мгновенная перерисовка всех вкладок
    renderAllTabs();

    if (typeof serverDeletePromiseFactory !== "function") {
      isSyncLocked = false;
      return Promise.resolve(true);
    }

    var p = serverDeletePromiseFactory();
    if (!p || typeof p.then !== "function") {
      isSyncLocked = false;
      return Promise.resolve(true);
    }

    return p.then(function (result) {
      isSyncLocked = false;
      if (result && result.status === "error") throw new Error(result.message || "SERVER_ERROR");
      return true;
    }).catch(function (err) {
      isSyncLocked = false;
      var msg = String(err && (err.message || err));
      var isServerLogicError = msg === "SERVER_ERROR" || (msg.indexOf("SERVER_ERROR") !== -1);
      if (isServerLogicError) {
        AppState.bookings = snapshot;
        try { databaseBookings = snapshot; } catch (e) {}
        saveCachedBookings(snapshot);
        unlinkBookingFromYear(b.date);
        renderAllTabs();
        throw err;
      }
      pushOfflineAction("delete", { booking: b });
      return { status: "offline", message: "Удалено локально в режиме офлайн." };
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
      slot.cart1Lang = rec.language;
      slot.name1 = rec.name1 || (rec.names && rec.names[0]) || "";
      slot.name2 = rec.name2 || (rec.names && rec.names[1]) || "";
    } else {
      slot.cart2Lang = rec.language;
      slot.name3 = rec.name3 || (rec.names && rec.names[0]) || "";
      slot.name4 = rec.name4 || (rec.names && rec.names[1]) || "";
    }
    try { databaseBookings = AppState.bookings; } catch (e) {}
    saveCachedBookings(AppState.bookings);
    linkBookingToYear(rec.date, slot.cart1Lang, slot.cart2Lang);
  }

  // Offline-first: applies the booking locally immediately, then tries the server
  // in the background. Network/timeout failures do NOT roll back local data —
  // the record stays in AppState and localStorage so the user sees their booking
  // even without internet. Only hard server logic errors (conflict / server-side
  // validation failure) trigger a rollback and re-render.
  function addBookingRecordSafe(rec, serverCreatePromiseFactory) {
    if (typeof window.isAuthenticated === "function" && !window.isAuthenticated()) {
      return Promise.resolve(false);
    }
    isSyncLocked = true;
    var snapshot = (AppState.bookings || []).map(function (x) { return Object.assign({}, x); });

    addBookingRecord(rec);
    renderAllTabs();

    if (typeof serverCreatePromiseFactory !== "function") {
      isSyncLocked = false;
      try {
        sendOneSignalNotificationClient(rec);
      } catch (e) {
        console.error("[OneSignal] Error calling client-side push:", e);
      }
      return Promise.resolve(true);
    }

    var p = serverCreatePromiseFactory();
    if (!p || typeof p.then !== "function") {
      isSyncLocked = false;
      try {
        sendOneSignalNotificationClient(rec);
      } catch (e) {
        console.error("[OneSignal] Error calling client-side push:", e);
      }
      return Promise.resolve(true);
    }

    return p.then(function (result) {
      isSyncLocked = false;
      if (result && (result.status === "error" || result.status === "conflict")) {
        throw new Error(result.message || "SERVER_ERROR");
      }
      try {
        sendOneSignalNotificationClient(rec);
      } catch (e) {
        console.error("[OneSignal] Error calling client-side push:", e);
      }
      renderAllTabs();
      return result;
    }).catch(function (err) {
      isSyncLocked = false;
      var msg = String(err && (err.message || err));
      var isServerLogicError = msg === "SERVER_ERROR" || /conflict/i.test(msg) || (msg.indexOf("SERVER_ERROR") !== -1);

      if (isServerLogicError) {
        AppState.bookings = snapshot;
        try { databaseBookings = snapshot; } catch (e) {}
        saveCachedBookings(snapshot);
        var originalSlot = snapshot.find(function (x) {
          return x.location === rec.location && x.date === rec.date && x.time === rec.time;
        });
        var c1Lang = originalSlot ? originalSlot.cart1Lang : "";
        var c2Lang = originalSlot ? originalSlot.cart2Lang : "";
        linkBookingToYear(rec.date, c1Lang, c2Lang);
        renderAllTabs();
        throw err;
      }

      pushOfflineAction("create", { record: rec });
      return { status: "offline", message: "Сохранено локально в режиме офлайн." };
    });
  }

  // Тонкая обёртка для обратной совместимости (демо-режим app.js):
  // из плоского payload делает две пер-картовые записи и добавляет локально.
  function addBooking(payload) {
    if (typeof window.isAuthenticated === "function" && !window.isAuthenticated()) {
      return;
    }
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
  function getDayLangSetForDate(iso) {
    var set = {};
    var rows = scheduleIndex[iso] || [];
    rows.forEach(function (r) {
      addLangToSet(set, r.trolley);
    });
    (AppState.bookings || []).forEach(function (b) {
      if (b.date !== iso) return;
      if (b.cart1Lang && (b.name1 || b.name2)) addLangToSet(set, b.cart1Lang);
      if (b.cart2Lang && (b.name3 || b.name4)) addLangToSet(set, b.cart2Lang);
    });
    return set;
  }

  function addLangToSet(set, l) {
    var code = (l || "").toLowerCase();
    if (code === "ru" || code === "ua" || code === "de") set[code] = true;
  }

  function renderYearGrid() {
    if (typeof window.checkAuthGuard === "function" && !window.checkAuthGuard()) return;
    var root = document.getElementById("yearGridRoot");
    if (!root) return;

    var dict = I18N[getLang()];
    var year = selectedYear || currentScheduleYear();

    var existingGrid = root.querySelector(".year-grid");
    var existingYear = root.dataset.renderedYear;
    var existingLang = root.dataset.renderedLang;
    var currentLang = getLang();

    if (existingGrid && existingYear === String(year) && existingLang === currentLang) {
      // Incremental DOM Update: update status classes, trolley badges, and aria-labels of existing cells
      var cells = existingGrid.querySelectorAll(".day-cell");
      var tIso = todayIso();
      for (var i = 0; i < cells.length; i++) {
        var cell = cells[i];
        if (cell.classList.contains("empty")) continue;

        var iso = cell.dataset.date;
        var rows = scheduleIndex[iso] || [];
        
        var status = "available";
        var dayLangSet = {};
        rows.forEach(function (r) {
          if (r.status && r.status !== "available") status = r.status;
          addLangToSet(dayLangSet, r.trolley);
        });
        
        (AppState.bookings || []).forEach(function (b) {
          if (b.date !== iso) return;
          if (b.cart1Lang && (b.name1 || b.name2)) addLangToSet(dayLangSet, b.cart1Lang);
          if (b.cart2Lang && (b.name3 || b.name4)) addLangToSet(dayLangSet, b.cart2Lang);
        });

        var dayLangs = Object.keys(dayLangSet);
        var dayBookings = (AppState.bookings || []).filter(function (b) { return b.date === iso; });
        var hasBookings = dayBookings.length > 0;
        var isServingStatus = (status === "serving" || status === "Служение" || status === "event");
        var isServingDay = hasBookings || isServingStatus || (dayLangs && dayLangs.length > 0);

        // Reset classes
        cell.className = "day-cell status-" + status + (isServingDay ? " has-serving" : " no-serving");
        cell.dataset.status = status;

        var yearNum = parseInt(iso.split("-")[0], 10);
        var yearHolidays = getHolidaysForYear(yearNum);
        var holidayInfo = yearHolidays[iso];
        if (holidayInfo) {
          cell.classList.add("is-hessen-holiday");
        }

        var anyNote = rows.some(function (r) { return r.description || r.note; });
        if (anyNote) cell.classList.add("has-event");
        if (iso === tIso) cell.classList.add("today");
        if (iso < tIso) cell.classList.add("past");

        dayLangs.forEach(function (lg) {
          cell.classList.add("has-trolley", "has-booking-" + lg);
        });
        if (dayLangs.length) cell.dataset.groups = dayLangs.join(",");
        else cell.removeAttribute("data-groups");

        // Dimming/Highlighting Filters
        if (selectedStatusFilter !== null) {
          if (status !== selectedStatusFilter) {
            cell.classList.add("day-status-dimmed");
          }
        }
        if (yearTrolleyFilter !== "all") {
          if (dayLangs.indexOf(yearTrolleyFilter) !== -1) {
            cell.classList.add("day-trolley-highlight", "day-trolley-highlight-" + yearTrolleyFilter);
          } else {
            cell.classList.add("day-trolley-dimmed");
          }
        }

        // Update innerHTML
        var currentDay = iso.split("-")[2].replace(/^0/, "");
        var inner = '<span class="day-number day-num">' + currentDay + '</span>';
        if (dayLangs.length) {
          inner += '<span class="day-lang-dots day-badge">';
          dayLangs.forEach(function (lg) {
            inner += '<span class="day-lang-dot dot-' + lg + ' cart-icon" data-group="' + lg + '" title="' + (dict.trolleys[lg] || "") + '">';
            if (window.TrolleyUI) {
              inner += '<span class="day-trolley-icon status-icon" data-group="' + lg + '" aria-hidden="true">' + TrolleyUI.getMiniSVG() + '</span>';
            }
            inner += '</span>';
          });
          inner += '</span>';
        }
        if (anyNote) inner += '<span class="attention-badge event-alert-badge">!</span>';
        cell.innerHTML = inner;

        // A11y description
        var dObj = new Date(yearNum, parseInt(iso.split("-")[1], 10) - 1, parseInt(iso.split("-")[2], 10));
        var weekdaysFull = {
          ru: ["Воскресенье", "Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота"],
          uk: ["Неділя", "Понеділок", "Вівторок", "Середа", "Четверг", "П'ятниця", "Субота"],
          de: ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"]
        };
        var dayOfWeekLabel = (weekdaysFull[currentLang] || weekdaysFull.ru)[dObj.getDay()];
        var formattedDate = parseInt(iso.split("-")[2], 10) + " " + dict.months[dObj.getMonth()] + ", " + dayOfWeekLabel;
        var statusText = dict.statuses[status];
        cell.setAttribute("aria-label", formattedDate + ". " + statusText + (anyNote ? ", Заметка: " + (rows.find(function (r) { return r.description || r.note; }).description || rows.find(function (r) { return r.description || r.note; }).note) : ""));
      }

      // Update active state of legend and year buttons
      var legendBtns = root.querySelectorAll(".status-filter-btn");
      legendBtns.forEach(function (btn, idx) {
        var st = ALLOWED[idx];
        if (selectedStatusFilter === st) {
          btn.classList.add("active");
        } else {
          btn.classList.remove("active");
        }
      });

      var yearBtns = root.querySelectorAll(".year-btn");
      yearBtns.forEach(function (btn) {
        var y = parseInt(btn.textContent, 10);
        if (year === y) {
          btn.classList.add("active");
        } else {
          btn.classList.remove("active");
        }
      });

      updateSyncBadge();
      return;
    }

    root.dataset.renderedYear = year;
    root.dataset.renderedLang = currentLang;
    root.innerHTML = "";

    // Tooltip initialization
    var yearTooltip = document.getElementById("yearTooltip");
    if (!yearTooltip) {
      yearTooltip = document.createElement("div");
      yearTooltip.id = "yearTooltip";
      yearTooltip.className = "year-tooltip";
      document.body.appendChild(yearTooltip);
    }

    // Тулбар и Управление
    var toolbar = document.createElement("div");
    toolbar.className = "year-toolbar";

    // Переключатель годов
    var yearSelector = document.createElement("div");
    yearSelector.className = "year-selector";
    
    var currentYearNum = new Date().getFullYear();
    var years = [currentYearNum - 1, currentYearNum, currentYearNum + 1];

    years.forEach(function (y) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "year-btn" + (year === y ? " active" : "");
      btn.textContent = y;
      btn.onclick = function () {
        selectedYear = y;
        renderYearGrid();
      };
      yearSelector.appendChild(btn);
    });
    toolbar.appendChild(yearSelector);

    // Sync badge status
    var badge = document.createElement("span");
    badge.id = "yearSyncBadge";
    toolbar.appendChild(badge);

    // Refresh button
    var refreshBtn = document.createElement("button");
    refreshBtn.type = "button";
    refreshBtn.className = "btn-refresh";
    refreshBtn.innerHTML = '<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" style="margin-right:4px;"><path d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 8H18" stroke-linecap="round" stroke-linejoin="round"/></svg>' + t("refresh");
    refreshBtn.onclick = function () { refreshAll(); };
    toolbar.appendChild(refreshBtn);
    root.appendChild(toolbar);

    // Легенда (интерактивные фильтры статусов)
    var legend = document.createElement("div");
    legend.className = "year-legend";
    ALLOWED.forEach(function (st) {
      var item = document.createElement("button");
      item.type = "button";
      item.className = "legend-item status-filter-btn" + (selectedStatusFilter === st ? " active" : "");
      item.innerHTML = '<span class="legend-dot status-' + st + '"></span>' + dict.statuses[st];
      item.onclick = function () {
        if (selectedStatusFilter === st) {
          selectedStatusFilter = null;
        } else {
          selectedStatusFilter = st;
        }
        renderYearGrid();
      };
      legend.appendChild(item);
    });
    root.appendChild(legend);

    // Сетка месяцев (DocumentFragment)
    var grid = document.createElement("div");
    grid.className = "year-grid";
    var frag = document.createDocumentFragment();
    var tIso = todayIso();

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
      var offset = (first.getDay() + 6) % 7; // Понедельник = 0
      for (var e = 0; e < offset; e++) {
        var empty = document.createElement("div");
        empty.className = "day-cell empty";
        days.appendChild(empty);
      }

      var dim = new Date(year, m + 1, 0).getDate();
      for (var d = 1; d <= dim; d++) {
        (function (currentDay) {
          var iso = year + "-" + pad(m + 1) + "-" + pad(currentDay);
          iso = (iso || "").trim();
          var rows = scheduleIndex[iso] || [];
          
          var status = "available";
          var dayLangSet = {};
          rows.forEach(function (r) {
            if (r.status && r.status !== "available") status = r.status;
            addLangToSet(dayLangSet, r.trolley);
          });
          
          (AppState.bookings || []).forEach(function (b) {
            if (b.date !== iso) return;
            if (b.cart1Lang && (b.name1 || b.name2)) addLangToSet(dayLangSet, b.cart1Lang);
            if (b.cart2Lang && (b.name3 || b.name4)) addLangToSet(dayLangSet, b.cart2Lang);
          });

          var dayLangs = Object.keys(dayLangSet);
          var dayBookings = (AppState.bookings || []).filter(function (b) { return b.date === iso; });
          var hasBookings = dayBookings.length > 0;
          var isServingStatus = (status === "serving" || status === "Служение" || status === "event");
          var isServingDay = hasBookings || isServingStatus || (dayLangs && dayLangs.length > 0);

          var cell = document.createElement("div");
          cell.className = "day-cell status-" + status + (isServingDay ? " has-serving" : " no-serving");
          cell.dataset.date = iso;
          cell.dataset.status = status;
          cell.setAttribute("tabindex", "0");
          cell.setAttribute("role", "gridcell");

          var yearNum = parseInt(iso.split("-")[0], 10);
          var yearHolidays = getHolidaysForYear(yearNum);
          var holidayInfo = yearHolidays[iso];
          if (holidayInfo) {
            cell.classList.add("is-hessen-holiday");
          }

          var anyNote = rows.some(function (r) { return r.description || r.note; });
          var noteText = "";
          var eventRow = rows.find(function (r) { return r.description || r.note; });
          if (eventRow) {
            noteText = eventRow.description || eventRow.note;
          }

          if (anyNote) cell.classList.add("has-event");
          if (iso === tIso) cell.classList.add("today");
          if (iso < tIso) cell.classList.add("past");

          // Специфические классы для A11y и фильтрации
          dayLangs.forEach(function (lg) {
            cell.classList.add("has-trolley", "has-booking-" + lg);
          });
          if (dayLangs.length) cell.dataset.groups = dayLangs.join(",");

          // 1. Фильтр статусов легенды
          if (selectedStatusFilter !== null) {
            if (status !== selectedStatusFilter) {
              cell.classList.add("day-status-dimmed");
            }
          }

          // 2. Фильтр языковых групп тележек
          if (yearTrolleyFilter !== "all") {
            if (dayLangs.indexOf(yearTrolleyFilter) !== -1) {
              cell.classList.add("day-trolley-highlight", "day-trolley-highlight-" + yearTrolleyFilter);
            } else {
              cell.classList.add("day-trolley-dimmed");
            }
          }

          // Построение контента ячейки дня
          var inner = '<span class="day-number day-num">' + currentDay + '</span>';
          if (dayLangs.length) {
            inner += '<span class="day-lang-dots day-badge">';
            dayLangs.forEach(function (lg) {
              inner += '<span class="day-lang-dot dot-' + lg + ' cart-icon" data-group="' + lg + '" title="' + (dict.trolleys[lg] || "") + '">';
              if (window.TrolleyUI) {
                inner += '<span class="day-trolley-icon status-icon" data-group="' + lg + '" aria-hidden="true">' + TrolleyUI.getMiniSVG() + '</span>';
              }
              inner += '</span>';
            });
            inner += '</span>';
          }
          if (anyNote) inner += '<span class="attention-badge event-alert-badge">!</span>';
          cell.innerHTML = inner;

          // A11y расшифровка для скринридеров
          var dObj = new Date(year, m, currentDay);
          var weekdaysFull = {
            ru: ["Воскресенье", "Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота"],
            uk: ["Неділя", "Понеділок", "Вівторок", "Середа", "Четверг", "П'ятниця", "Субота"],
            de: ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"]
          };
          var lang = getLang();
          var dayOfWeekLabel = (weekdaysFull[lang] || weekdaysFull.ru)[dObj.getDay()];
          var formattedDate = currentDay + " " + dict.months[m] + ", " + dayOfWeekLabel;
          var statusText = dict.statuses[status];

          var fullAriaLabel = formattedDate + ". " + statusText;
          if (holidayInfo) {
            var holidayName = holidayInfo[lang] || holidayInfo.ua || holidayInfo.uk || holidayInfo.de;
            var holidayWord = lang === 'uk' ? 'Свято' : (lang === 'de' ? 'Feiertag' : 'Праздник');
            fullAriaLabel += ". " + holidayWord + ": " + holidayName;
          }
          if (dayLangs.length) {
            fullAriaLabel += ", " + dayLangs.map(function (lg) { return dict.trolleys[lg]; }).join(" и ");
          }
          if (noteText) {
            fullAriaLabel += ", Заметка: " + noteText;
          }
          cell.setAttribute("aria-label", fullAriaLabel);

          days.appendChild(cell);
        })(d);
      }
      block.appendChild(days);
      frag.appendChild(block);
    }
    grid.appendChild(frag);
    root.appendChild(grid);

    // Event delegation on grid container
    grid.addEventListener("pointerover", function (ev) {
      var cell = ev.target.closest(".day-cell");
      if (!cell || cell.classList.contains("empty")) return;
      var dateISO = cell.dataset.date;
      var status = cell.dataset.status;
      var rows = scheduleIndex[dateISO] || [];
      var dayLangSet = getDayLangSetForDate(dateISO);
      showTooltipForCell(cell, dateISO, status, rows, dayLangSet);
    });

    grid.addEventListener("pointerout", function (ev) {
      var cell = ev.target.closest(".day-cell");
      if (!cell) return;
      var related = ev.relatedTarget;
      if (related && cell.contains(related)) return;
      hideTooltip();
    });

    grid.addEventListener("click", function (ev) {
      var cell = ev.target.closest(".day-cell");
      if (!cell || cell.classList.contains("empty")) return;
      var dateISO = cell.dataset.date;
      openDayEditor(dateISO);
    });

    grid.addEventListener("keydown", function (ev) {
      var cell = ev.target.closest(".day-cell");
      if (!cell || cell.classList.contains("empty")) return;
      
      var dateISO = cell.dataset.date;
      var dateParts = dateISO.split("-");
      var currentD = new Date(parseInt(dateParts[0], 10), parseInt(dateParts[1], 10) - 1, parseInt(dateParts[2], 10));
      var nextD = null;
      
      switch (ev.key) {
        case "ArrowLeft":
          nextD = new Date(currentD.getFullYear(), currentD.getMonth(), currentD.getDate() - 1);
          break;
        case "ArrowRight":
          nextD = new Date(currentD.getFullYear(), currentD.getMonth(), currentD.getDate() + 1);
          break;
        case "ArrowUp":
          nextD = new Date(currentD.getFullYear(), currentD.getMonth(), currentD.getDate() - 7);
          break;
        case "ArrowDown":
          nextD = new Date(currentD.getFullYear(), currentD.getMonth(), currentD.getDate() + 7);
          break;
        case "Enter":
        case " ":
          ev.preventDefault();
          goToDateFromYear(dateISO);
          break;
        default:
          return;
      }
      
      if (nextD) {
        ev.preventDefault();
        var nextIso = nextD.getFullYear() + "-" + pad(nextD.getMonth() + 1) + "-" + pad(nextD.getDate());
        var targetCell = grid.querySelector('.day-cell[data-date="' + nextIso + '"]');
        if (targetCell) {
          targetCell.focus();
          var focusedStatus = targetCell.dataset.status;
          var focusedRows = scheduleIndex[nextIso] || [];
          var focusedLangs = getDayLangSetForDate(nextIso);
          showTooltipForCell(targetCell, nextIso, focusedStatus, focusedRows, focusedLangs);
        }
      }
    });

    // Вспомогательная функция для всплывающей подсказки
    function showTooltipForCell(cellEl, dateISO, status, rows, dayLangSet) {
      if (!yearTooltip) return;
      
      yearTooltip.dataset.activeDate = dateISO;
      
      var dateParts = dateISO.split("-");
      var dObj = new Date(parseInt(dateParts[0], 10), parseInt(dateParts[1], 10) - 1, parseInt(dateParts[2], 10));
      
      var monthName = dict.months[dObj.getMonth()];
      var weekdaysFull = {
        ru: ["Воскресенье", "Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота"],
        uk: ["Неділя", "Понеділок", "Вівторок", "Середа", "Четверг", "П'ятниця", "Субота"],
        de: ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"]
      };
      var lang = getLang();
      var dayOfWeekLabel = (weekdaysFull[lang] || weekdaysFull.ru)[dObj.getDay()];
      var formattedDate = dateParts[2] + " " + monthName + ", " + dayOfWeekLabel;

      var statusText = dict.statuses[status];
      
      var noteText = "";
      var eventRow = rows.find(function (r) { return r.description || r.note; });
      if (eventRow) {
        noteText = eventRow.description || eventRow.note;
      }
      
      var bookingsHTML = "";
      var dayBookings = (AppState.bookings || []).filter(function (b) { return b.date === dateISO; });
      if (dayBookings.length > 0) {
        bookingsHTML += '<div class="year-tooltip-bookings">';
        dayBookings.forEach(function (b) {
          if (b.cart1Lang && (b.name1 || b.name2)) {
            var badgeText = b.cart1Lang.toUpperCase();
            var namesText = [b.name1, b.name2].filter(Boolean).join(" • ");
            bookingsHTML += '<div class="year-tooltip-booking-row">' +
              '<span class="trolley-filter-badge" data-group="' + b.cart1Lang.toLowerCase() + '" style="margin: 0; padding: 2px 6px; font-size: 0.7rem; border-radius: 4px;">' + badgeText + '</span>' +
              '<span>' + namesText + '</span>' +
              '</div>';
          }
          if (b.cart2Lang && (b.name3 || b.name4)) {
            var badgeText = b.cart2Lang.toUpperCase();
            var namesText = [b.name3, b.name4].filter(Boolean).join(" • ");
            bookingsHTML += '<div class="year-tooltip-booking-row">' +
              '<span class="trolley-filter-badge" data-group="' + b.cart2Lang.toLowerCase() + '" style="margin: 0; padding: 2px 6px; font-size: 0.7rem; border-radius: 4px;">' + badgeText + '</span>' +
              '<span>' + namesText + '</span>' +
              '</div>';
          }
        });
        bookingsHTML += '</div>';
      }

      var yearHolidays = getHolidaysForYear(parseInt(dateParts[0], 10));
      var holidayInfo = yearHolidays[dateISO];
      var holidayHTML = "";
      if (holidayInfo) {
        var holidayName = holidayInfo[lang] || holidayInfo.ua || holidayInfo.uk || holidayInfo.de;
        holidayHTML = '<div class="year-tooltip-holiday" style="color:var(--error, #dc2626); font-weight:bold; font-size:0.75rem; margin-bottom:6px;">🎉 ' + holidayName + '</div>';
      }

      var html = '<div class="year-tooltip-date">' + formattedDate + '</div>';
      if (holidayHTML) {
        html += holidayHTML;
      }
      html += '<div class="year-tooltip-status status-' + status + '" style="font-weight:600; padding: 2px 6px; border-radius:4px; display:inline-block; font-size:0.75rem; margin-bottom:6px;">' + statusText + '</div>';
      if (bookingsHTML) {
        html += bookingsHTML;
      }
      if (noteText) {
        html += '<div class="year-tooltip-note">📝 ' + noteText + '</div>';
      }
      
      yearTooltip.innerHTML = html;
      yearTooltip.classList.add("visible");
      
      var cellRect = cellEl.getBoundingClientRect();
      var tooltipRect = yearTooltip.getBoundingClientRect();
      
      var scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      var scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
      
      var top = cellRect.top + scrollTop - tooltipRect.height - 8;
      if (cellRect.top - tooltipRect.height - 8 < 0) {
        top = cellRect.bottom + scrollTop + 8;
      }
      
      var left = cellRect.left + scrollLeft + (cellRect.width / 2) - (tooltipRect.width / 2);
      if (left < 8) left = 8;
      if (left + tooltipRect.width > window.innerWidth - 8) {
        left = window.innerWidth - tooltipRect.width - 8;
      }
      
      yearTooltip.style.top = top + "px";
      yearTooltip.style.left = left + "px";
    }

    function hideTooltip() {
      if (yearTooltip) {
        yearTooltip.classList.remove("visible");
        yearTooltip.removeAttribute("data-active-date");
      }
    }

    updateSyncBadge();
  }

  // ----- Редактор дня (модальное окно) -----
  // ----- Редактор дня (модальное окно) -----
  function ensureDayEditor() {
    if (document.getElementById("dayEditorModal")) return;
    var dict = I18N[getLang()];
    var modal = document.createElement("div");
    modal.id = "dayEditorModal";
    modal.className = "modal-backdrop day-editor-modal";
    modal.style.display = "none";
    modal.innerHTML =
      '<div class="modal-content">' +
        '<div class="modal-header">' +
          '<h3 class="modal-title">' + dict.dayEditorTitle + '</h3>' +
          '<button type="button" class="btn-close-modal" onclick="SyncCore._closeDayEditor()">✖</button>' +
        '</div>' +
        '<div class="editor-date" id="dayEditorDate"></div>' +
        '<div id="dayEditorHolidayNotice" style="display: none; margin-bottom: 12px;"></div>' +
        '<div class="day-editor-info-card" id="dayEditorInfoCard" style="display: none; margin-bottom: 12px;"></div>' +
        '<div class="day-editor-bookings-card" id="dayEditorBookingsCard" style="background: rgba(120,120,120,0.06); border: 1px solid var(--border); border-radius: var(--radius-md); padding: 12px; margin-bottom: 12px;">' +
          '<div style="font-weight: 700; font-size: 0.85rem; margin-bottom: 8px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 6px;">' +
            '<span>' + (dict.bookingsTitle || '📋 Записи на этот день:') + '</span>' +
            '<div style="display: flex; gap: 6px; align-items: center;">' +
              '<button type="button" id="btnBookForDateFromModal" class="btn-book-date" style="background: var(--primary); color: #ffffff; border: none; border-radius: var(--radius-sm); padding: 4px 10px; font-size: 0.75rem; font-weight: 700; cursor: pointer; display: inline-flex; align-items: center; gap: 4px;">➕ Записаться</button>' +
              '<button type="button" id="btnGoToDateFromModal" class="btn-goto-date" style="background: var(--primary-container); color: var(--primary); border: 1px solid var(--primary); border-radius: var(--radius-sm); padding: 4px 8px; font-size: 0.75rem; font-weight: 700; cursor: pointer;">' + (dict.goToSchedule || '📅 В график') + '</button>' +
            '</div>' +
          '</div>' +
          '<div id="dayEditorBookingsList" style="font-size: 0.8rem; display: flex; flex-direction: column; gap: 6px;"></div>' +
        '</div>' +
        '<div id="dayEditorAdminControls">' +
          '<div class="editor-field" id="dayEditorCartLangsField">' +
            '<label id="dayEditorCartLangsLabel" style="font-weight: 700;">📦 ' + (getLang() === "uk" ? "Мови візків (бейджі дня)" : (getLang() === "de" ? "Trolley-Sprachen (Tages-Badges)" : "Языки тележек (бейджи дня)")) + '</label>' +
            '<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 6px;">' +
              '<div>' +
                '<div style="font-size: 0.75rem; font-weight: 700; margin-bottom: 4px; color: var(--text-muted);">' + (dict.cart1Name || "Тележка №1") + '</div>' +
                '<div class="status-options" id="dayEditorCart1LangOptions">' +
                  '<button type="button" class="status-option cart-lang-btn" data-cart="1" data-lang="">—</button>' +
                  '<button type="button" class="status-option cart-lang-btn" data-cart="1" data-lang="ru">RU</button>' +
                  '<button type="button" class="status-option cart-lang-btn" data-cart="1" data-lang="ua">UA</button>' +
                  '<button type="button" class="status-option cart-lang-btn" data-cart="1" data-lang="de">DE</button>' +
                '</div>' +
              '</div>' +
              '<div>' +
                '<div style="font-size: 0.75rem; font-weight: 700; margin-bottom: 4px; color: var(--text-muted);">' + (dict.cart2Name || "Тележка №2") + '</div>' +
                '<div class="status-options" id="dayEditorCart2LangOptions">' +
                  '<button type="button" class="status-option cart-lang-btn" data-cart="2" data-lang="">—</button>' +
                  '<button type="button" class="status-option cart-lang-btn" data-cart="2" data-lang="ru">RU</button>' +
                  '<button type="button" class="status-option cart-lang-btn" data-cart="2" data-lang="ua">UA</button>' +
                  '<button type="button" class="status-option cart-lang-btn" data-cart="2" data-lang="de">DE</button>' +
                '</div>' +
              '</div>' +
            '</div>' +
          '</div>' +
          '<div class="editor-field"><label id="dayEditorStatusLabel">' + dict.statusLabel + '</label><div class="status-options" id="dayEditorStatus" data-lockable></div></div>' +
          '<div class="editor-field" data-lockable><label id="dayEditorDescLabel">' + dict.descLabel + '</label><textarea id="dayEditorDesc" maxlength="500"></textarea></div>' +
          '<div class="editor-field" data-lockable>' +
            '<label id="dayEditorNoteLabel">' + dict.noteLabel + ' <span id="dayEditorNoteBadge"></span></label>' +
            '<textarea id="dayEditorNote" maxlength="500"></textarea>' +
            '<div class="quick-presets-container" id="dayEditorPresets">' +
              (dict.presets || []).map(function (p) {
                return '<button type="button" class="quick-preset-btn" data-preset="' + p.replace(/"/g, '&quot;') + '">' + p + '</button>';
              }).join('') +
            '</div>' +
          '</div>' +
          '<div class="editor-field" id="dayEditorYearMessageField" style="display: none;">' +
            '<label id="dayEditorYearMessageLabel">' + (dict.yearMessageLabel || 'Объявление на вкладке График (YearSchedule)') + '</label>' +
            '<textarea id="dayEditorYearMessage" maxlength="500" placeholder="' + (dict.yearMessagePlaceholder || 'Введите текст объявления...') + '"></textarea>' +
            '<div style="display: flex; gap: 8px; margin-top: 8px;"><button type="button" id="btnSaveYearMessage" class="btn-editor-save" style="flex: 1;">' + (dict.saveYearMessage || 'Отправить объявление') + '</button><button type="button" id="btnDeleteYearMessage" class="btn-editor-delete" style="background: #dc2626; color: #fff; border: none; border-radius: 8px; padding: 8px 12px; cursor: pointer; font-weight: 600; font-size: 0.85rem;">🗑️ ' + (dict.deleteYearMessage || 'Удалить') + '</button></div>' +
          '</div>' +
        '</div>' +
        '<div class="editor-actions">' +
          '<button type="button" class="btn-editor-cancel" id="dayEditorCancel">' + dict.cancel + '</button>' +
          '<button type="button" class="btn-editor-edit" id="dayEditorEdit" style="display:none;">✏️ ' + dict.edit + '</button>' +
          '<button type="button" class="btn-editor-save btn btn-primary" id="dayEditorSave">💾 ' + dict.saveChanges + '</button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(modal);

    modal.addEventListener("click", function (e) { if (e.target === modal) SyncCore._closeDayEditor(); });
    document.getElementById("dayEditorCancel").addEventListener("click", function () { SyncCore._closeDayEditor(); });
    document.getElementById("dayEditorEdit").addEventListener("click", enterEditMode);
    var saveBtnEl = document.getElementById("dayEditorSave") || document.getElementById("saveYearDayBtn");
    if (saveBtnEl) saveBtnEl.addEventListener("click", saveDayFromEditor);
    
    var btnSaveYearMsg = document.getElementById("btnSaveYearMessage");
    if (btnSaveYearMsg) {
      btnSaveYearMsg.addEventListener("click", function() { saveYearMessage(); });
    }
    var btnDeleteYearMsg = document.getElementById("btnDeleteYearMessage");
    if (btnDeleteYearMsg) {
      btnDeleteYearMsg.addEventListener("click", function() {
        var textEl = document.getElementById("dayEditorYearMessage");
        if (textEl) textEl.value = "";
        saveYearMessage("");
      });
    }

    // Подсказки (i в кружке) для полей редактора дня — помощь пожилым пользователям.
    var dayTips = I18N[getLang()].infoTips || {};
    function addDayTip(labelId, key) {
      var lbl = document.getElementById(labelId);
      if (lbl && dayTips[key]) lbl.appendChild(createInfoTip(dayTips[key]));
    }
    addDayTip("dayEditorStatusLabel", "status");
    addDayTip("dayEditorDescLabel", "description");
    addDayTip("dayEditorNoteLabel", "note");
  }

  function isUserAdmin() {
    if (window.currentUser && window.currentUser.role === 'admin') return true;
    if (window.AppState && window.AppState.authUser && window.AppState.authUser.role === 'admin') return true;
    try {
      var stored = JSON.parse(localStorage.getItem("authUser"));
      if (stored && stored.role === 'admin') {
        window.currentUser = stored;
        if (window.AppState && !window.AppState.authUser) window.AppState.authUser = stored;
        return true;
      }
    } catch (e) {}
    return false;
  }
  window.isUserAdmin = isUserAdmin;

  function checkIsAdmin() {
    return isUserAdmin();
  }

  // Блокирует/разблокирует все поля редактирования дня (режим просмотра/редактирования)
  function setEditorLock(locked) {
    var modal = document.getElementById("dayEditorModal");
    if (!modal) return;
    var isAdmin = isUserAdmin();

    var descEl = document.getElementById("dayEditorDesc");
    var noteEl = document.getElementById("dayEditorNote");
    if (descEl) {
      descEl.disabled = locked || !isAdmin;
      descEl.readOnly = locked || !isAdmin;
    }
    if (noteEl) {
      noteEl.disabled = locked || !isAdmin;
      noteEl.readOnly = locked || !isAdmin;
    }

    var statusBox = document.getElementById("dayEditorStatus");
    if (statusBox) {
      var statusBtns = statusBox.querySelectorAll(".status-option");
      var shouldLockStatus = locked || !isAdmin;
      for (var sb = 0; sb < statusBtns.length; sb++) {
        if (shouldLockStatus) {
          statusBtns[sb].setAttribute("disabled", "true");
          statusBtns[sb].style.pointerEvents = "none";
          statusBtns[sb].style.opacity = "0.7";
          statusBtns[sb].style.cursor = "default";
        } else {
          statusBtns[sb].removeAttribute("disabled");
          statusBtns[sb].style.pointerEvents = "";
          statusBtns[sb].style.opacity = "";
          statusBtns[sb].style.cursor = "";
        }
      }
    }

    var editBtn = document.getElementById("dayEditorEdit");
    var saveBtn = document.getElementById("dayEditorSave");
    var adminControls = document.querySelectorAll("#dayEditorAdminControls, .admin-only-control, .admin-only");

    if (editBtn) editBtn.style.display = "none";
    if (saveBtn) saveBtn.style.display = isAdmin ? "inline-block" : "none";

    if (adminControls && adminControls.length > 0) {
      adminControls.forEach(function(el) {
        el.style.display = isAdmin ? "block" : "none";
      });
    }
  }

  function enterEditMode() {
    if (!isUserAdmin()) return;
    setEditorLock(false);
  }

  function applyQuickPreset(text) {
    if (!isUserAdmin()) return;
    var note = document.getElementById("dayEditorNote");
    if (!note) return;
    if (note.disabled) enterEditMode();
    note.value = (note.value ? note.value + ", " : "") + text;

    if (!editorState.cart1Lang && !editorState.cart2Lang) {
      editorState.status = "special";
      var opts = document.getElementById("dayEditorStatus");
      if (opts) {
        var all = opts.querySelectorAll(".status-option");
        for (var i = 0; i < all.length; i++) {
          all[i].classList.toggle("active", all[i].dataset.status === "special");
        }
      }
    }
    updateDayEditorNoteBadge();
  }

  function openDayEditor(date) {
    var tooltip = document.getElementById("yearTooltip");
    if (tooltip) {
      tooltip.classList.remove("visible");
      tooltip.removeAttribute("data-active-date");
    }
    ensureDayEditor();
    const dayEditorDateEl = document.getElementById("dayEditorDate");
    const holidayNoticeEl = document.getElementById("dayEditorHolidayNotice");
    const dayEditorStatusEl = document.getElementById("dayEditorStatus");
    const descInput = document.getElementById("dayEditorDesc");
    const noteInput = document.getElementById("dayEditorNote");
    const saveBtn = document.getElementById("dayEditorSave");
    const editBtn = document.getElementById("dayEditorEdit");
    const cancelBtn = document.getElementById("dayEditorCancel");
    const infoCard = document.getElementById("dayEditorInfoCard");
    const modalEl = document.getElementById("dayEditorModal");
    const bookingsList = document.getElementById("dayEditorBookingsList");
    const gotoBtn = document.getElementById("btnGoToDateFromModal");
    const bookBtn = document.getElementById("btnBookForDateFromModal");
    const adminControls = document.querySelectorAll('#dayEditorAdminControls, .admin-only-control, .admin-only');
    var rows = scheduleIndex[date] || [];
    var cart1Rows = rows.filter(function (r) { return (parseInt(r.cartNumber, 10) || 1) === 1; });
    var cart2Rows = rows.filter(function (r) { return (parseInt(r.cartNumber, 10) || 1) === 2; });

    var c1 = cart1Rows[cart1Rows.length - 1] || { date: date, status: "available", trolley: "", description: "", note: "" };
    var c2 = cart2Rows[cart2Rows.length - 1] || { date: date, status: "available", trolley: "", description: "", note: "" };

    var effectiveStatus = "available";
    for (var ri = 0; ri < rows.length; ri++) {
      if (rows[ri].status && rows[ri].status !== "available") {
        effectiveStatus = rows[ri].status;
        break;
      }
    }
    if (effectiveStatus === "available") {
      effectiveStatus = c1.status || c2.status || "available";
    }

    editorState.date = date;
    editorState.status = effectiveStatus;
    editorState.cart1Lang = c1.trolley || "";
    editorState.cart2Lang = c2.trolley || "";

    var effectiveDesc = c1.description || c2.description || "";
    var effectiveNote = c1.note || c2.note || "";
    for (var rj = 0; rj < rows.length; rj++) {
      if (!effectiveDesc && rows[rj].description) effectiveDesc = rows[rj].description;
      if (!effectiveNote && rows[rj].note) effectiveNote = rows[rj].note;
    }

    if (dayEditorDateEl) dayEditorDateEl.textContent = formatDateHuman(date);

    var yearNum = parseInt(date.split("-")[0], 10);
    var yearHolidays = getHolidaysForYear(yearNum);
    var holidayInfo = yearHolidays[date];
    if (holidayNoticeEl) {
      if (holidayInfo) {
        var lang = getLang();
        var holidayName = holidayInfo[lang] || holidayInfo.ua || holidayInfo.uk || holidayInfo.de;
        var prefix = lang === 'uk' ? '🎉 Свято (Гессен / Марбург): ' : (lang === 'de' ? '🎉 Feiertag (Hessen / Marburg): ' : '🎉 Праздник (Гессен / Марбург): ');
        holidayNoticeEl.innerHTML = '<div class="hessen-holiday-banner" style="' +
          'background-color: var(--error-bg, rgba(239, 68, 68, 0.1));' +
          'color: var(--error, #ef4444);' +
          'border: 1px solid rgba(239, 68, 68, 0.2);' +
          'border-radius: var(--radius-sm, 6px);' +
          'padding: 8px 12px;' +
          'font-size: 0.85rem;' +
          'font-weight: bold;' +
          'text-align: center;' +
          '">' + prefix + holidayName + '</div>';
        holidayNoticeEl.style.display = "block";
      } else {
        holidayNoticeEl.style.display = "none";
        holidayNoticeEl.innerHTML = "";
      }
    }

    if (dayEditorStatusEl) dayEditorStatusEl.innerHTML = "";
    var dict = I18N[getLang()];
    var isAdminStatus = isUserAdmin();
    ALLOWED.forEach(function (st) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "status-option" + (st === editorState.status ? " active" : "");
      b.textContent = dict.statuses[st];
      b.dataset.status = st;
      if (isAdminStatus) {
        b.onclick = function () {
          editorState.status = st;
          var all = dayEditorStatusEl.querySelectorAll(".status-option");
          for (var i = 0; i < all.length; i++) all[i].classList.toggle("active", all[i].dataset.status === st);
        };
      } else {
        // user: статус только для просмотра
        b.setAttribute("disabled", "true");
        b.style.pointerEvents = "none";
        b.style.opacity = "0.75";
        b.style.cursor = "default";
      }
      dayEditorStatusEl.appendChild(b);
    });

    // Обновление и привязка кнопок выбора языковых бейджей для Тележки 1 и Тележки 2
    [1, 2].forEach(function (cn) {
      var optContainer = document.getElementById("dayEditorCart" + cn + "LangOptions");
      if (!optContainer) return;
      var curLang = (cn === 1 ? editorState.cart1Lang : editorState.cart2Lang) || "";
      var btns = optContainer.querySelectorAll(".cart-lang-btn");
      for (var i = 0; i < btns.length; i++) {
        var b = btns[i];
        var langVal = (b.dataset.lang || "").toLowerCase();
        b.classList.toggle("active", langVal === (curLang || "").toLowerCase());
        if (isAdminStatus) {
          b.removeAttribute("disabled");
          b.style.pointerEvents = "";
          b.style.opacity = "";
          b.style.cursor = "pointer";
          b.onclick = (function (cartNum, langSetting) {
            return function () {
              if (cartNum === 1) editorState.cart1Lang = langSetting;
              else editorState.cart2Lang = langSetting;
              var siblings = optContainer.querySelectorAll(".cart-lang-btn");
              for (var k = 0; k < siblings.length; k++) {
                siblings[k].classList.toggle("active", (siblings[k].dataset.lang || "").toLowerCase() === langSetting.toLowerCase());
              }
            };
          })(cn, langVal);
        } else {
          b.setAttribute("disabled", "true");
          b.style.pointerEvents = "none";
          b.style.opacity = "0.75";
          b.style.cursor = "default";
        }
      }
    });

    if (descInput) descInput.value = effectiveDesc;
    if (noteInput) noteInput.value = effectiveNote;
    updateDayEditorNoteBadge();

    // Заполнение подробного списка записей дня
    var dayBookings = (AppState.bookings || []).filter(function (b) { return b.date === date; });
    var isAdminBooking = isUserAdmin();
    var bookingsHTML = "";
    if (dayBookings.length > 0) {
      dayBookings.forEach(function (b) {
        var loc = b.location || "Марбург";
        var time = b.time || "";
        if (b.cart1Lang && (b.name1 || b.name2)) {
          var names1 = [b.name1, b.name2].filter(Boolean).join(" • ");
          var editBtn1 = isAdminBooking
            ? '<button type="button" onclick="SyncCore._closeDayEditor(); if(typeof openQuickBookingModal===\'function\') openQuickBookingModal(\'' + loc.replace(/'/g, "\\'") + '\', \'' + date + '\', \'' + time + '\', 1); else if(typeof goToDate===\'function\') goToDate(\'' + date + '\');" style="background: var(--primary); color: #fff; border: none; border-radius: 6px; padding: 5px 10px; font-size: 0.75rem; font-weight: 700; cursor: pointer; flex-shrink: 0;">✏️ Изменить</button>'
            : '';
          bookingsHTML += '<div style="background: var(--card-bg); padding: 8px 10px; border-radius: var(--radius-sm); border: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center; gap: 8px;">' +
            '<div>' +
              '<div style="font-weight: 700; color: var(--primary);">🕒 ' + time + ' | 📍 ' + loc + ' (📦 ' + (dict.cart1Name || 'Тележка №1') + ' | ' + b.cart1Lang.toUpperCase() + ')</div>' +
              '<div style="color: var(--text); margin-top: 2px;">👥 ' + escapeHtml(names1) + '</div>' +
            '</div>' +
            editBtn1 +
            '</div>';
        }
        if (b.cart2Lang && (b.name3 || b.name4)) {
          var names2 = [b.name3, b.name4].filter(Boolean).join(" • ");
          var editBtn2 = isAdminBooking
            ? '<button type="button" onclick="SyncCore._closeDayEditor(); if(typeof openQuickBookingModal===\'function\') openQuickBookingModal(\'' + loc.replace(/'/g, "\\'") + '\', \'' + date + '\', \'' + time + '\', 2); else if(typeof goToDate===\'function\') goToDate(\'' + date + '\');" style="background: var(--primary); color: #fff; border: none; border-radius: 6px; padding: 5px 10px; font-size: 0.75rem; font-weight: 700; cursor: pointer; flex-shrink: 0;">✏️ Изменить</button>'
            : '';
          bookingsHTML += '<div style="background: var(--card-bg); padding: 8px 10px; border-radius: var(--radius-sm); border: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center; gap: 8px;">' +
            '<div>' +
              '<div style="font-weight: 700; color: var(--primary);">🕒 ' + time + ' | 📍 ' + loc + ' (📦 ' + (dict.cart2Name || 'Тележка №2') + ' | ' + b.cart2Lang.toUpperCase() + ')</div>' +
              '<div style="color: var(--text); margin-top: 2px;">👥 ' + escapeHtml(names2) + '</div>' +
            '</div>' +
            editBtn2 +
            '</div>';
        }
      });
    }
    if (!bookingsHTML) {
      bookingsHTML = '<div style="color: var(--text-muted); font-style: italic; padding: 6px 0; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">' +
        '<span>' + (dict.noBookings || 'Записей на этот день нет (свободно)') + '</span>' +
        '<button type="button" onclick="SyncCore._closeDayEditor(); if(typeof openQuickBookingModal===\'function\') openQuickBookingModal(\'Марбург\', \'' + date + '\', \'09:00 - 11:00\', 1); else if(typeof goToDate===\'function\') goToDate(\'' + date + '\');" style="background: var(--primary); color: #ffffff; border: none; border-radius: 6px; padding: 6px 12px; font-size: 0.78rem; font-weight: 700; cursor: pointer;">➕ Записаться на этот день</button>' +
        '</div>';
    } else {
      bookingsHTML += '<div style="margin-top: 6px; text-align: right;">' +
        '<button type="button" onclick="SyncCore._closeDayEditor(); if(typeof goToDate===\'function\') goToDate(\'' + date + '\');" style="background: rgba(37,99,235,0.1); color: var(--primary); border: 1px solid rgba(37,99,235,0.2); border-radius: 6px; padding: 4px 10px; font-size: 0.75rem; font-weight: 700; cursor: pointer;">📅 В график недели</button>' +
        '</div>';
    }
    if (bookingsList) bookingsList.innerHTML = bookingsHTML;

    if (gotoBtn) {
      gotoBtn.onclick = function () {
        closeDayEditor();
        if (typeof goToDate === "function") goToDate(date);
      };
    }
    if (bookBtn) {
      bookBtn.onclick = function () {
        closeDayEditor();
        if (typeof openQuickBookingModal === "function") {
          openQuickBookingModal('Марбург', date, '09:00 - 11:00', 1);
        } else if (typeof goToDate === "function") {
          goToDate(date);
        }
      };
    }

    if (modalEl) {
      var presetBtns = modalEl.querySelectorAll("#dayEditorPresets .quick-preset-btn");
      for (var pi = 0; pi < presetBtns.length; pi++) {
        presetBtns[pi].onclick = function () { applyQuickPreset(this.dataset.preset); };
      }
    }

    var isAdmin = isUserAdmin();

    if (isAdmin) {
      if (adminControls && adminControls.length > 0) adminControls.forEach(el => { el.style.display = "block"; });
      if (infoCard) { infoCard.style.display = "none"; infoCard.innerHTML = ""; }
      if (saveBtn) saveBtn.style.display = "inline-block";
      if (editBtn) editBtn.style.display = "none";
      if (cancelBtn) cancelBtn.textContent = dict.cancel || "Отмена";
      setEditorLock(false);
      var yearMsgField = document.getElementById("dayEditorYearMessageField");
      if (yearMsgField) {
        yearMsgField.style.display = "block";
        var messages = (AppState && AppState.yearScheduleMessages) || {};
        var val = (lang === "de") ? (messages["de"] || "") : (messages[lang] || messages["ru"] || messages["ua"] || messages["uk"] || "");
        var yearMessageEl = document.getElementById("dayEditorYearMessage");
        if (yearMessageEl) yearMessageEl.value = val;
      }
    } else {
      if (adminControls && adminControls.length > 0) adminControls.forEach(el => { el.style.display = "none"; });
      if (saveBtn) saveBtn.style.display = "none";
      if (editBtn) editBtn.style.display = "none";
      if (cancelBtn) cancelBtn.textContent = (lang === "de" ? "Schließen" : (lang === "uk" || lang === "ua" ? "Закрити" : "Закрыть"));
      setEditorLock(true);

      var infoHTML = "";
      var statusBadges = {
        closed: { icon: "🚫", bg: "rgba(239, 68, 68, 0.1)", fg: "#dc2626", text: dict.statuses.closed },
        event: { icon: "📅", bg: "rgba(245, 158, 11, 0.1)", fg: "#d97706", text: dict.statuses.event },
        holiday: { icon: "🎉", bg: "rgba(16, 185, 129, 0.1)", fg: "#059669", text: dict.statuses.holiday },
        special: { icon: "⭐", bg: "rgba(147, 51, 234, 0.1)", fg: "#7c3aed", text: dict.statuses.special }
      };

      if (effectiveStatus && effectiveStatus !== "available" && statusBadges[effectiveStatus]) {
        var sb = statusBadges[effectiveStatus];
        infoHTML += '<div style="background: ' + sb.bg + '; color: ' + sb.fg + '; border: 1px solid ' + sb.fg + '; border-radius: var(--radius-sm); padding: 8px 12px; font-weight: 700; font-size: 0.85rem; text-align: center; margin-bottom: 8px;">' +
          sb.icon + ' ' + sb.text + '</div>';
      }

      if (effectiveDesc) {
        infoHTML += '<div style="background: rgba(37, 99, 235, 0.06); border: 1px solid rgba(37, 99, 235, 0.2); border-radius: var(--radius-sm); padding: 10px; margin-bottom: 8px;">' +
          '<div style="font-weight: 700; font-size: 0.8rem; color: var(--primary); margin-bottom: 4px;">📝 ' + dict.descLabel + ':</div>' +
          '<div style="font-size: 0.85rem; color: var(--text);">' + escapeHtml(effectiveDesc) + '</div>' +
          '</div>';
      }

      if (effectiveNote) {
        infoHTML += '<div style="background: rgba(245, 158, 11, 0.06); border: 1px solid rgba(245, 158, 11, 0.2); border-radius: var(--radius-sm); padding: 10px; margin-bottom: 8px;">' +
          '<div style="font-weight: 700; font-size: 0.8rem; color: #d97706; margin-bottom: 4px;">📌 ' + dict.noteLabel + ':</div>' +
          '<div style="font-size: 0.85rem; color: var(--text);">' + escapeHtml(effectiveNote) + '</div>' +
          '</div>';
      }

      if (infoCard) {
        infoCard.innerHTML = infoHTML;
        infoCard.style.display = infoHTML ? "block" : "none";
      }
    }

    if (modalEl) modalEl.style.display = "flex";
  }

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

  // ----- Кастомное модальное окно подтверждения удаления -----
  // Заменяет устаревший window.confirm() единым стильным диалогом
  // (кнопка «Отмена» + красная «Да, удалить»). Возвращает Promise<boolean>.
  var confirmDeleteResolver = null;

  function ensureConfirmDeleteModal() {
    if (document.getElementById("confirmDeleteModal")) return;
    var modal = document.createElement("div");
    modal.id = "confirmDeleteModal";
    modal.className = "modal-backdrop";
    modal.style.display = "none";
    modal.setAttribute("role", "alertdialog");
    modal.setAttribute("aria-modal", "true");
    modal.innerHTML =
      '<div class="modal-content confirm-delete-content">' +
        '<div class="modal-header">' +
          '<h3 class="modal-title">🗑️ ' + t("deleteBooking") + '</h3>' +
          '<button type="button" class="btn-close-modal" id="confirmDeleteClose" aria-label="✖">✖</button>' +
        '</div>' +
        '<div class="confirm-delete-body" id="confirmDeleteBody"></div>' +
        '<div class="confirm-delete-actions">' +
          '<button type="button" class="btn-confirm-cancel" id="confirmDeleteCancel">' + t("cancel") + '</button>' +
          '<button type="button" class="btn-confirm-delete" id="confirmDeleteOk">🗑️ ' + t("confirmDeleteYes") + '</button>' +
        '</div>' +
      '</div>';

    document.body.appendChild(modal);

    function resolve(ok) {
      if (confirmDeleteResolver) {
        var r = confirmDeleteResolver;
        confirmDeleteResolver = null;
        modal.style.display = "none";
        r(ok);
      }
    }

    modal.addEventListener("click", function (e) { if (e.target === modal) resolve(false); });
    document.getElementById("confirmDeleteClose").addEventListener("click", function () { resolve(false); });
    document.getElementById("confirmDeleteCancel").addEventListener("click", function () { resolve(false); });
    document.getElementById("confirmDeleteOk").addEventListener("click", function () { resolve(true); });
    document.addEventListener("keydown", function onEsc(e) {
      if (modal.style.display !== "none" && e.key === "Escape") {
        e.preventDefault();
        resolve(false);
      }
    });
  }

  function confirmDelete(message) {
    ensureConfirmDeleteModal();
    var modal = document.getElementById("confirmDeleteModal");
    var body = document.getElementById("confirmDeleteBody");
    if (body) body.textContent = message || "";
    modal.style.display = "flex";
    return new Promise(function (resolve) {
      confirmDeleteResolver = resolve;
    });
  }

  // ----- Информационное модальное окно результата (успех/ошибка) -----
  // Показывает «сохранено» прямо по центру экрана (не зависит от прокрутки
  // длинной страницы Года, где обычный toast внизу не виден). Автозакрытие
  // через 2.6 с + закрытие по OK / Esc / клику по фону.
  var resultResolver = null;
  var resultAutoClose = null;

  function ensureResultModal() {
    if (document.getElementById("resultModal")) return;
    var modal = document.createElement("div");
    modal.id = "resultModal";
    modal.className = "modal-backdrop";
    modal.style.display = "none";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.innerHTML =
      '<div class="modal-content result-content">' +
        '<div class="modal-header">' +
          '<h3 class="modal-title" id="resultTitle"></h3>' +
          '<button type="button" class="btn-close-modal" id="resultClose" aria-label="✖">✖</button>' +
        '</div>' +
        '<div class="confirm-delete-body" id="resultBody"></div>' +
        '<div class="confirm-delete-actions">' +
          '<button type="button" class="btn-result-ok" id="resultOk">' + t("ok") + '</button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(modal);

    function resolve() {
      if (!resultResolver) return;
      var r = resultResolver;
      resultResolver = null;
      if (resultAutoClose) { clearTimeout(resultAutoClose); resultAutoClose = null; }
      modal.style.display = "none";
      r();
    }

    modal.addEventListener("click", function (e) { if (e.target === modal) resolve(); });
    document.getElementById("resultClose").addEventListener("click", resolve);
    document.getElementById("resultOk").addEventListener("click", resolve);
    document.addEventListener("keydown", function onEsc(e) {
      if (modal.style.display !== "none" && e.key === "Escape") {
        e.preventDefault();
        resolve();
      }
    });
  }

  function showResult(kind, message) {
    ensureResultModal();
    var modal = document.getElementById("resultModal");
    var title = document.getElementById("resultTitle");
    var body = document.getElementById("resultBody");
    var okBtn = document.getElementById("resultOk");
    var isError = kind === "error";
    if (title) {
      title.textContent = (isError ? "⚠️ " : "✅ ") + t(isError ? "errorTitle" : "savedTitle");
    }
    if (body) body.textContent = message || "";
    modal.classList.toggle("result-error", isError);
    okBtn.classList.toggle("error", isError);
    modal.style.display = "flex";
    if (resultAutoClose) clearTimeout(resultAutoClose);
    resultAutoClose = setTimeout(function () {
      if (!resultResolver) return;
      var r = resultResolver;
      resultResolver = null;
      resultAutoClose = null;
      modal.style.display = "none";
      r();
    }, 2600);
    return new Promise(function (resolve) { resultResolver = resolve; });
  }

  function saveDayFromEditor() {
    if (!isUserAdmin()) {
      showResult("error", (getLang() === "de" ? "Sie haben keine Berechtigung für diese Aktion" : ((getLang() === "uk" || getLang() === "ua") ? "У вас немає прав для виконання цієї дії" : "У вас нет прав для выполнения этого действия")));
      return;
    }
    var day = {
      date: editorState.date,
      cart1Lang: (editorState.cart1Lang || "").trim().toLowerCase(),
      cart2Lang: (editorState.cart2Lang || "").trim().toLowerCase(),
      status: editorState.status,
      description: ((document.getElementById("dayEditorDesc") || {}).value || "").trim(),
      note: ((document.getElementById("dayEditorNote") || {}).value || "").trim()
    };
    // Гарантия сохранения: сервер отклоняет статус «available» с пустой
    // тележкой, поэтому при наличии заметки/описания и отсутствии языка тележки
    // принудительно ставим статус «Особое» (special) — он сохраняется и без языка.
    if (!day.cart1Lang && !day.cart2Lang && (day.description || day.note)) {
      day.status = "special";
      editorState.status = "special";
    }
    var err = validateDayForCart(day.cart1Lang, day.cart2Lang, day);
    if (err) {
      showResult("error", err === "bad_trolley" ? t("noTrolley") : (t("saveError") + ": " + err));
      return;
    }

    var saveBtn = document.getElementById("dayEditorSave");
    var origSaveText = saveBtn ? saveBtn.textContent : "";
    if (saveBtn) {
      saveBtn.disabled = true;
      saveBtn.textContent = t("saving") || "Сохранение…";
    }

    saveDay(day).then(function () {
      if (saveBtn) {
        saveBtn.textContent = "✅ " + (t("saved") || "Сохранено!");
        saveBtn.classList.add("btn-saved-success");
      }

      // Локализованное всплывающее уведомление (Toast)
      var lang = getLang();
      var toastMsg = (lang === "uk" || lang === "ua") ? "✅ Замітку успішно збережено!"
                   : (lang === "de" ? "✅ Notiz erfolgreich gespeichert!"
                   : "✅ Заметка успешно сохранена!");

      if (typeof window.showToast === "function") {
        window.showToast(toastMsg, "success");
      } else {
        showToastBanner(toastMsg);
      }

      setTimeout(function () {
        closeDayEditor();
        if (saveBtn) {
          saveBtn.disabled = false;
          saveBtn.classList.remove("btn-saved-success");
          saveBtn.textContent = origSaveText;
        }
      }, 1000);
    }).catch(function (err) {
      if (saveBtn) {
        saveBtn.disabled = false;
        saveBtn.textContent = origSaveText;
      }
      if (err && err.message === "VERIFY_FAILED") {
        SyncCore.showResult("error", t("saveVerifyFail"));
      } else {
        SyncCore.showResult("error", t("saveError") + (err && err.message ? ": " + err.message : ""));
      }
    });
  }

  function showToastBanner(msg) {
    var toast = document.getElementById("syncToastBanner");
    if (!toast) {
      toast = document.createElement("div");
      toast.id = "syncToastBanner";
      toast.className = "sync-toast-banner";
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.classList.add("show");
    setTimeout(function () {
      toast.classList.remove("show");
    }, 2500);
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

  // ----- Информационные подсказки (i в кружке -> раскрывающееся меню) -----
  // Самодостаточный поповер: кнопка-«i» переключает всплывающее меню рядом
  // с ней. Закрывается по повторному клику, клику вне или Esc. Текст берётся
  // из локализованного I18N.infoTips и не зависит от статичного HTML.
  function closeAllInfoTips() {
    var open = document.querySelectorAll(".info-tip.open");
    for (var i = 0; i < open.length; i++) {
      open[i].classList.remove("open");
      var b = open[i].querySelector(".info-tip-btn");
      if (b) b.setAttribute("aria-expanded", "false");
    }
  }

  function createInfoTip(text) {
    var wrap = document.createElement("span");
    wrap.className = "info-tip";
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "info-tip-btn";
    btn.setAttribute("aria-label", t("infoTip"));
    btn.setAttribute("aria-expanded", "false");
    btn.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" fill="currentColor"/></svg>';
    var pop = document.createElement("span");
    pop.className = "info-tip-pop";
    pop.setAttribute("role", "tooltip");
    pop.textContent = text || "";
    wrap.appendChild(btn);
    wrap.appendChild(pop);
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      var isOpen = wrap.classList.contains("open");
      closeAllInfoTips();
      if (!isOpen) {
        wrap.classList.add("open");
        btn.setAttribute("aria-expanded", "true");
      }
    });
    return wrap;
  }

  document.addEventListener("click", function (e) {
    if (!(e.target.closest && e.target.closest(".info-tip"))) closeAllInfoTips();
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeAllInfoTips();
  });

  // Сохранение дня: валидация -> локально -> push на сервер (по тележкам)
  function saveDay(day) {
    if (!isUserAdmin()) {
      return Promise.reject(new Error("Access denied: Admin role required"));
    }
    var err = validateDayForCart(day.cart1Lang, day.cart2Lang, day);
    if (err) return Promise.reject(new Error(err));

    // Создаем снимок для возможного отката при сбое сети
    var snapshot = yearSchedule.map(function (x) { return Object.assign({}, x); });

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
    setSchedule(yearSchedule);
    saveCache(yearSchedule);
    // Перерисовываем ВСЕ вкладки (Запись/График/Год) из единого состояния,
    // чтобы правки дня в Годе мгновенно отражались и в Графике («и наоборот»).
    renderAllTabs();

    if (!isValidScriptUrl(GOOGLE_SCRIPT_URL)) return Promise.resolve(); // демо/офлайн-режим

    // Отправка POST на сервер c надежным разбором ответа (HTTP 200/res.ok/JSON/text)
    function postCart(cn, lang) {
      var userEmail = (window.AppState && AppState.authUser && AppState.authUser.email) || "";
      var body = JSON.stringify({
        action: "year_update",
        email: userEmail,
        key: API_KEY,
        language: getLang(),
        date: day.date,
        cartNumber: cn,
        trolley: lang,
        status: day.status,
        description: day.description || "",
        note: day.note || ""
      });
      return withTimeout(fetchWithRetry(buildApiUrl, {
        method: "POST",
        mode: "cors",
        body: body
      }).then(function (res) {
        if (res.ok || res.status === 200) {
          return res.text().then(function (text) {
            if (!text) return { status: "ok", success: true };
            try {
              return JSON.parse(text);
            } catch (e) {
              return { status: "ok", success: true, text: text };
            }
          });
        }
        return res.json().catch(function () {
          return { status: "error", message: "HTTP " + res.status };
        });
      }), 20000, "year_update").then(function (resp) {
        var isSuccess = resp && (
          resp.status === "ok" ||
          resp.result === "success" ||
          resp.success === true ||
          resp.status === "success" ||
          (!resp.status && !resp.error)
        );

        if (!isSuccess && resp && (resp.status === "error" || resp.status === "conflict")) {
          throw new Error((resp && resp.message) || "SERVER_ERROR");
        }
        if (resp && resp.debugUrl) {
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
        setSchedule(yearSchedule);
        saveCache(yearSchedule);
        renderAllTabs();
        if (typeof refreshSilently === "function") refreshSilently();
        return true;
      })
      .catch(function (err) {
        var msg = String(err && (err.message || err));
        var isServerLogicError = msg === "SERVER_ERROR" || /conflict/i.test(msg) || (msg.indexOf("SERVER_ERROR") !== -1);
        if (isServerLogicError) {
          yearSchedule = snapshot;
          setSchedule(yearSchedule);
          saveCache(yearSchedule);
          renderAllTabs();
          throw err;
        }
        pushOfflineAction("year_update", { day: day });
        if (err && (err.message || "").indexOf("Access denied") !== -1) {
          var accessMsg = (getLang() === "de") ? "Sie haben keine Berechtigung für diese Aktion" : ((getLang() === "uk" || getLang() === "ua") ? "У вас немає прав для виконання цієї дії" : "У вас нет прав для выполнения этого действия");
          if (typeof window.showToast === "function") window.showToast(accessMsg, "error");
          if (typeof window.checkAuthGuard === "function") window.checkAuthGuard();
        }
        console.warn('[SyncCore] saveDay: network issue, saved to offline queue.', err);
        return { status: "offline", message: "Сохранено локально в режиме офлайн." };
      });
  }

  function saveYearMessage() {
    if (!isUserAdmin()) {
      showResult("error", (getLang() === "de" ? "Sie haben keine Berechtigung für diese Aktion" : ((getLang() === "uk" || getLang() === "ua") ? "У вас немає прав для виконання цієї дії" : "У вас нет прав для выполнения этого действия")));
      return;
    }
    var textEl = document.getElementById("dayEditorYearMessage");
    if (!textEl) return;
    var msg = textEl.value.trim();
    
    if (typeof window.hapticFeedback === "function") {
      window.hapticFeedback(50);
    } else if (window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate(50);
    }
    
    var saveBtn = document.getElementById("btnSaveYearMessage");
    var origText = saveBtn ? saveBtn.textContent : "";
    if (saveBtn) {
      saveBtn.disabled = true;
      saveBtn.textContent = getLang() === 'de' ? 'Wird gesendet...' : (getLang() === 'uk' || getLang() === 'ua' ? 'Надсилання...' : 'Отправка...');
    }
    
    var email = (window.AppState && AppState.authUser && AppState.authUser.email) || "";
    
    var body = JSON.stringify({
      action: "year_message_update",
      key: API_KEY,
      language: getLang(),
      email: email,
      message: msg
    });
    
    fetchWithRetry(buildApiUrl, {
      method: "POST",
      mode: "cors",
      body: body
    }).then(function (res) {
      if (!res.ok) throw new Error("HTTP_" + res.status);
      return res.json();
    }).then(function (data) {
      if (data && data.status === "success") {
        if (typeof window.hapticFeedback === "function") {
          window.hapticFeedback([50, 50, 50]);
        }
        
        if (saveBtn) {
          saveBtn.textContent = "✅ " + (getLang() === 'de' ? 'Gesendet!' : (getLang() === 'uk' || getLang() === 'ua' ? 'Надіслано!' : 'Отправлено!'));
          saveBtn.classList.add("btn-saved-success");
        }
        
        if (!AppState.yearScheduleMessages) {
          AppState.yearScheduleMessages = {};
        }
        var curLang = getLang();
        AppState.yearScheduleMessages[curLang] = msg;
        if (curLang === "ru" || curLang === "ua" || curLang === "uk") {
          AppState.yearScheduleMessages["ru"] = msg;
          AppState.yearScheduleMessages["ua"] = msg;
          AppState.yearScheduleMessages["uk"] = msg;
        }
        localStorage.setItem("yearScheduleMessages", JSON.stringify(AppState.yearScheduleMessages));
        
        renderAllTabs();
        
        var successMsg = getLang() === 'de' ? 'Ankündigung erfolgreich gesendet!' 
                           : (getLang() === 'uk' || getLang() === 'ua' ? 'Оголошення успішно надіслано!' 
                           : 'Объявление успешно отправлено!');
        if (typeof window.showToast === "function") {
          window.showToast(successMsg, "success");
        } else {
          showToastBanner(successMsg);
        }
        
        setTimeout(function() {
          if (saveBtn) {
            saveBtn.disabled = false;
            saveBtn.classList.remove("btn-saved-success");
            saveBtn.textContent = origText;
          }
        }, 2000);
      } else {
        throw new Error((data && data.message) || "Unknown error");
      }
    }).catch(function (err) {
      if (typeof window.hapticFeedback === "function") {
        window.hapticFeedback([30, 50, 30]);
      }
      if (saveBtn) {
        saveBtn.disabled = false;
        saveBtn.textContent = origText;
      }
      var errorMsg = (getLang() === 'de' ? 'Fehler beim Senden: ' : (getLang() === 'uk' || getLang() === 'ua' ? 'Помилка надсилання: ' : 'Ошибка отправки: ')) + err.message;
      if (typeof window.showToast === "function") {
        window.showToast(errorMsg, "error");
      } else {
        showToastBanner(errorMsg);
      }
    });
  }

  function renderYearScheduleMessage(messageOverride) {
    var container = document.getElementById("yearScheduleMessageContainer") || document.querySelector(".year-message-container");
    if (!container) return;
    
    var messages = (AppState && AppState.yearScheduleMessages) || {};
    var currentLang = getLang();
    var rawMsg = "";
    if (messageOverride !== undefined) {
      rawMsg = messageOverride;
    } else if (currentLang === "de") {
      rawMsg = messages["de"] || "";
    } else {
      rawMsg = messages[currentLang] || messages["ru"] || messages["ua"] || messages["uk"] || "";
    }
    var message = (rawMsg || "").toString().trim();
    
    if (message.length > 0) {
      var titles = {
        ru: "Важное объявление",
        uk: "Важливе оголошення",
        ua: "Важливе оголошення",
        de: "Wichtige Ankündigung"
      };
      var title = titles[currentLang] || titles.ru;
      
      container.innerHTML = 
        '<span class="banner-icon">📢</span>' +
        '<div class="banner-content">' +
          '<h4 class="banner-title">' + title + '</h4>' +
          '<p class="banner-text">' + message + '</p>' +
        '</div>';
      container.style.cssText = "display: flex !important;";
    } else {
      container.innerHTML = "";
      container.style.cssText = "display: none !important;";
    }
  }
  window.updateYearScheduleMessageUI = renderYearScheduleMessage;
  window.renderYearScheduleMessage = renderYearScheduleMessage;

  // ----- Экспорт глобального API -----
  window.SyncCore = {
    runAppLaunch: runAppLaunch,
    showSplash: showSplash,
    hideSplash: hideSplash,
    refreshAll: refreshAll,
    refreshSilently: refreshSilently,
    startAutoSync: startAutoSync,
    stopAutoSync: stopAutoSync,
    renderYearGrid: renderYearGrid,
    renderAllTabs: renderAllTabs,
    updateAppState: updateAppState,
    addBooking: addBooking,
    addBookingRecord: addBookingRecord,
    addBookingRecordSafe: addBookingRecordSafe,
    removeBooking: removeBooking,
    removeBookingSafe: removeBookingSafe,
    confirmDelete: confirmDelete,
    showResult: showResult,
    createInfoTip: createInfoTip,
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

  // OneSignal Web Push Client Integration
  function sendOneSignalNotificationClient(rec) {
    if (!rec) return;

    var chk = document.getElementById('chkSendPush');
    var sendPush = chk ? chk.checked : false;
    if (!sendPush) return;

    var names = [];
    if (rec.names && Array.isArray(rec.names)) {
      names = rec.names;
    } else if (rec.cartNumber === 2) {
      names = [rec.name3, rec.name4];
    } else {
      names = [rec.name1, rec.name2];
    }

    var clean = names.map(function(n) { return (n || "").toString().trim(); });
    var hasName0 = !!clean[0];
    var hasName1 = !!clean[1];
    var isSingle = (hasName0 && !hasName1) || (!hasName0 && hasName1);

    if (!isSingle) return;

    fetch("https://onesignal.com/api/v1/notifications", {
      method: "POST",
      headers: {
        "Authorization": "Basic os_v2_app_qf7kneivx5hjbiqou4io2bjbqrk5d67ekfce225odujaw2oy2u5tfjlbn7yx2guhp2kyqncshe5sd4q2qyy4lckr3nj7g5zadkfnjga",
        "Content-Type": "application/json; charset=utf-8"
      },
      body: JSON.stringify({
        "app_id": "817ea691-15bf-4e90-a20e-a710ed052184",
        "included_segments": ["All"],
        "headings": {
          "en": "Нужен напарник!",
          "de": "Partner gesucht!",
          "uk": "Потрібен партнер!"
        },
        "contents": {
          "en": "Новая одиночная запись на стенд. Нажмите, чтобы записаться напарником!",
          "de": "Ein Verkündiger sucht einen Partner. Klicken zum Anmelden!",
          "uk": "Новий одиночний запис. Натисніть, щоб приєднатися!"
        },
        "url": "https://cw-vitali2.vercel.app"
      })
    }).then(function(res) {
      console.log("[OneSignal] Notification triggered from client, status:", res.status);
    }).catch(function(err) {
      console.warn("[OneSignal] Client-side push failed (likely CORS restriction):", err);
    });
  }

  // OneSignal Subscription Button Management
  function syncNotificationButtonState() {
    var btn = document.getElementById('btnPushNotifications');
    if (!btn) return;

    var lang = (document.documentElement.lang || "ru").toLowerCase();
    if (lang.indexOf("uk") === 0 || lang.indexOf("ua") === 0) lang = "uk";
    else if (lang.indexOf("de") === 0) lang = "de";
    else lang = "ru";

    var titles = {
      ru: {
        enable: "Включить уведомления о напарниках",
        disable: "Отключить уведомления о напарниках"
      },
      de: {
        enable: "Partner-Benachrichtigungen aktivieren",
        disable: "Partner-Benachrichtigungen deaktivieren"
      },
      uk: {
        enable: "Увімкнути сповіщення про напарників",
        disable: "Вимкнути сповіщення про напарників"
      }
    };

    var t = titles[lang] || titles.ru;

    var isGranted = (typeof Notification !== 'undefined' && Notification.permission === 'granted');
    var isActive = false;

    if (isGranted) {
      if (window.oneSignalReady && typeof window.OneSignal !== 'undefined' && window.OneSignal.User && window.OneSignal.User.pushSubscription) {
        var isOptedIn = window.OneSignal.User.pushSubscription.optedIn;
        isActive = isOptedIn;
        localStorage.setItem('pushNotificationsEnabled', isActive ? 'true' : 'false');
      } else {
        var savedState = localStorage.getItem('pushNotificationsEnabled');
        if (savedState !== null) {
          isActive = (savedState === 'true');
        } else {
          isActive = true; // Default fallback if permission is granted but no saved state/SDK yet
        }
      }
    } else {
      isActive = false;
      localStorage.setItem('pushNotificationsEnabled', 'false');
    }

    btn.innerHTML = '🔔';

    if (isActive) {
      btn.title = t.disable;
      btn.classList.add('active');
    } else {
      btn.title = t.enable;
      btn.classList.remove('active');
    }
  }
  window.syncNotificationButtonState = syncNotificationButtonState;

  function initNotificationButton() {
    var btn = document.getElementById('btnPushNotifications');
    if (!btn) return;

    btn.onclick = function() {
      if (typeof window.OneSignal !== 'undefined' && window.OneSignal.User && window.OneSignal.User.pushSubscription) {
        var isOptedIn = window.OneSignal.User.pushSubscription.optedIn;
        var isGranted = (typeof Notification !== 'undefined' && Notification.permission === 'granted');

        if (isOptedIn && isGranted) {
          try {
            window.OneSignal.User.pushSubscription.optOut();
            setTimeout(syncNotificationButtonState, 500);
          } catch (e) {
            console.error("OneSignal optOut failed:", e);
          }
        } else {
          if (!isGranted) {
            requestPermissionAndOptIn();
          } else {
            try {
              window.OneSignal.User.pushSubscription.optIn();
              setTimeout(syncNotificationButtonState, 500);
            } catch (e) {
              console.error("OneSignal optIn failed:", e);
            }
          }
        }
      } else {
        requestNativePermission();
      }
    };

    syncNotificationButtonState();
  }

  function requestPermissionAndOptIn() {
    if (typeof window.OneSignal !== 'undefined' && window.OneSignal.Notifications && typeof window.OneSignal.Notifications.requestPermission === "function") {
      try {
        var res = window.OneSignal.Notifications.requestPermission();
        if (res && typeof res.then === "function") {
          res.then(function() {
            try {
              window.OneSignal.User.pushSubscription.optIn();
            } catch (e) {}
            setTimeout(syncNotificationButtonState, 500);
          }).catch(function(err) {
            console.warn("[OneSignal] requestPermission rejected:", err);
            syncNotificationButtonState();
          });
        } else {
          try {
            window.OneSignal.User.pushSubscription.optIn();
          } catch (e) {}
          setTimeout(syncNotificationButtonState, 1000);
        }
      } catch (e) {
        console.warn("[OneSignal] requestPermission crashed, falling back to native:", e);
        requestNativePermission();
      }
    } else {
      requestNativePermission();
    }
  }

  function requestNativePermission() {
    if (typeof Notification !== 'undefined' && typeof Notification.requestPermission === 'function') {
      try {
        var res = Notification.requestPermission();
        if (res && typeof res.then === "function") {
          res.then(function() {
            syncNotificationButtonState();
          }).catch(function() {
            syncNotificationButtonState();
          });
        } else {
          Notification.requestPermission(function() {
            syncNotificationButtonState();
          });
        }
      } catch (e) {
        console.error("Native requestPermission failed:", e);
      }
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initNotificationButton);
  } else {
    initNotificationButton();
  }

  window.OneSignalDeferred = window.OneSignalDeferred || [];
  window.OneSignalDeferred.push(async function(OneSignal) {
    syncNotificationButtonState();

    if (OneSignal.Notifications && typeof OneSignal.Notifications.addEventListener === "function") {
      OneSignal.Notifications.addEventListener('permissionChange', function(permission) {
        syncNotificationButtonState();
      });
    }

    if (OneSignal.User && OneSignal.User.pushSubscription && typeof OneSignal.User.pushSubscription.addEventListener === "function") {
      OneSignal.User.pushSubscription.addEventListener('change', function() {
        syncNotificationButtonState();
      });
    }
  });

  // Periodically check/sync the notification button state to handle late SDK loading and browser setting changes
  setInterval(syncNotificationButtonState, 1000);

  // Инициализация переключателя тележек (из localStorage) и заполнение SVG-иконок
  initTrolleyFilter();
})();

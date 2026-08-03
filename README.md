# Trolley Dienst / Запись на тележке — Slot Booking System / Schichtbuchungssystem / Система бронирования смен

[English](#english) | [Deutsch](#deutsch) | [Русский](#русский)

---

## English

**Trolley Dienst** is a modern Progressive Web Application (PWA) built with an **Offline-First** architecture. It is designed to manage shift schedules and book slots for public trolley witnessing, optimized for mobile devices, and integrated with a Google Sheets database and OneSignal push notification system.

### 1. Architecture & Tech Stack

The project uses a serverless hybrid architecture (Serverless Client + Sheets DB + PWA SW) for fast load times, offline accessibility, and real-time push notifications.

```mermaid
graph TD
    A[PWA Client: HTML/CSS/JS] <-->|Fetch API / JSON| B(Backend: Google Apps Script API)
    B <-->|SpreadsheetApp API| C[(Database: Google Sheets)]
    A <-->|Local Cache| D[(Browser: LocalStorage & Service Worker v47)]
    A <-->|OneSignal SDK v16| E[Push Notification Service]
```

* **Client-side**: HTML5, CSS3 (variables, transitions, system dark mode support, crisp typography), vanilla ES6+ JS split into interface logic ([app.js](file:///c:/Users/vital/Downloads/booking-Add-main/booking-Add-main/app.js)) and sync logic ([app-sync.js](file:///c:/Users/vital/Downloads/booking-Add-main/booking-Add-main/app-sync.js)).
* **Unified Service Worker**: Single Service Worker ([sw.js](file:///c:/Users/vital/Downloads/booking-Add-main/booking-Add-main/sw.js)) with `Cache-First` strategy, auto `skipWaiting()`, `clients.claim()`, and integrated OneSignal Push SDK via [OneSignalSDKWorker.js](file:///c:/Users/vital/Downloads/booking-Add-main/booking-Add-main/OneSignalSDKWorker.js).
* **Backend**: Google Apps Script (GAS) API handling `GET`/`POST` requests and communicating with the spreadsheet.
* **Multilingualism**: Split into three client files for different congregations:
  * [index.html](file:///c:/Users/vital/Downloads/booking-Add-main/booking-Add-main/index.html) — Russian (RU)
  * [index_ua.html](file:///c:/Users/vital/Downloads/booking-Add-main/booking-Add-main/index_ua.html) — Ukrainian (UA)
  * [index_de.html](file:///c:/Users/vital/Downloads/booking-Add-main/booking-Add-main/index_de.html) — German (DE)

### 2. Infrastructure & Deployment

#### Frontend: Hosting & CI/CD (Vercel + GitHub)
1. Code repository is hosted on **GitHub**.
2. Deployment is managed via **Vercel** with automatic triggers on commits to the `master` branch.

#### Backend: Google Apps Script (GAS)
Backend API code is located in [google_script.txt](file:///c:/Users/vital/Downloads/booking-Add-main/booking-Add-main/google_script.txt).

> [!IMPORTANT]
> When modifying the GAS backend code, always deploy a **New Version**:
> 1. Go to **Deploy** -> **Manage deployments**.
> 2. Edit the active deployment, select **New version** in the dropdown, and click **Deploy**.

### 3. Key Features & Recent Improvements

* **Strict Auth Guard & Multi-Language Authentication**: `checkAuthGuard()` protects all pages (`index.html`, `index_de.html`, `index_ua.html`). Unauthenticated access is completely blocked; protected DOM elements are hidden (`display: none`), and localized login modals (`#authModal`) are displayed with header logout buttons ("Выйти" / "Abmelden" / "Вийти").
* **OneSignal Push Notifications**: Full PWA push notification integration for partner updates with single-worker architecture.
* **Service Worker Update Loop Protection**: Automatic `self.skipWaiting()` on install and `clients.claim()` on activate in `sw.js` to eliminate infinite update toast loops.
* **High-Density Calendar Layout**: Crisp date typography without blurry shadows (`text-shadow: none`), date numbers pinned top-center (`top: 2px; left: 50%`), and trolley/alert badges pinned bottom-center (`bottom: 2px; left: 50%`) to eliminate visual overlap.
* **Offline-First FIFO Queue**: Bookings/deletions made offline are cached in `localStorage` under `offlineActions` and synced automatically when connection returns.
* **Incremental Rendering & Adaptive Polling**: The calendar grid updates classes and text content inline, switching polling intervals automatically based on user activity.

### 4. Admin Guide

#### Managing Users
User data is stored on the **`Users`** sheet. Columns must be structured as follows:

| Column | Field | Description | Format |
| :--- | :--- | :--- | :--- |
| **A (1)** | Email | Unique email address | `user@example.com` (lowercase) |
| **B (2)** | Name | Full name | Text (e.g. `John Doe`) |
| **C (3)** | Status | User status | `active` / `активен` |
| **D (4)** | Role | User role | `admin` / `user` |
| **E (5)** | Password | Account password | Plain text |

---

## Deutsch

**Trolley Dienst** ist eine moderne Progressive Web App (PWA) mit einer **Offline-First-Architektur** zur Schichtplanung und Slot-Buchung für das Trolley-Predigtwerk. Das System ist für Mobilgeräte optimiert und nutzt Google Tabellen als Datenbank sowie OneSignal für Push-Benachrichtigungen.

### 1. Architektur & Technologie-Stack

```mermaid
graph TD
    A[PWA-Client: HTML/CSS/JS] <-->|Fetch API / JSON| B(Backend: Google Apps Script API)
    B <-->|SpreadsheetApp API| C[(Datenbank: Google Tabellen)]
    A <-->|Lokaler Cache| D[(Browser: LocalStorage & Service Worker v47)]
    A <-->|OneSignal SDK v16| E[Push-Benachrichtigungsdienst]
```

* **Frontend**: HTML5, CSS3 (Variablen, Übergänge, System-Dunkelmodus, präzise Typografie), Vanilla ES6+ JS aufgeteilt in Interfacedatei ([app.js](file:///c:/Users/vital/Downloads/booking-Add-main/booking-Add-main/app.js)) und Sync-Logik ([app-sync.js](file:///c:/Users/vital/Downloads/booking-Add-main/booking-Add-main/app-sync.js)).
* **Vereinheitlichter Service Worker**: Einziger Service Worker ([sw.js](file:///c:/Users/vital/Downloads/booking-Add-main/booking-Add-main/sw.js)) mit `Cache-First`-Strategie, automatischem `skipWaiting()`, `clients.claim()` und integriertem OneSignal Push SDK über [OneSignalSDKWorker.js](file:///c:/Users/vital/Downloads/booking-Add-main/booking-Add-main/OneSignalSDKWorker.js).
* **Backend**: Google Apps Script (GAS) API zur Verarbeitung von `GET`/`POST`-Anfragen.
* **Mehrsprachigkeit**: Aufgeteilt in drei Client-Seiten für verschiedene Gemeinden:
  * [index.html](file:///c:/Users/vital/Downloads/booking-Add-main/booking-Add-main/index.html) — Russische Gemeinde (RU)
  * [index_ua.html](file:///c:/Users/vital/Downloads/booking-Add-main/booking-Add-main/index_ua.html) — Ukrainische Gemeinde (UA)
  * [index_de.html](file:///c:/Users/vital/Downloads/booking-Add-main/booking-Add-main/index_de.html) — Deutsche Gemeinde (DE)

### 2. Infrastruktur & Bereitstellung

#### Frontend: Hosting & CI/CD (Vercel + GitHub)
1. Quellcode wird auf **GitHub** verwaltet.
2. Webhosting erfolgt über **Vercel** mit automatischen Produktions-Releases bei jedem Push auf den `master`-Branch.

#### Backend: Google Apps Script (GAS)
Der Backend-API-Code befindet sich in [google_script.txt](file:///c:/Users/vital/Downloads/booking-Add-main/booking-Add-main/google_script.txt).

> [!IMPORTANT]
> Nach Änderungen im GAS-Code muss eine **Neue Version** veröffentlicht werden:
> 1. Klicken Sie auf **Bereitstellen** -> **Bereitstellungen verwalten**.
> 2. Bearbeiten Sie die aktive Bereitstellung, wählen Sie im Dropdown **Neue Version** und klicken Sie auf **Bereitstellen**.

### 3. Hauptmerkmale & Neuerungssätze

* **Strikter Auth Guard & Mehrsprachigkeit**: `checkAuthGuard()` schützt alle Seiten (`index.html`, `index_de.html`, `index_ua.html`). Unangemeldete Zugriffe werden vollständig blockiert; geschützte Elemente werden verborgen (`display: none`), und lokalisierte Anmeldedialoge (`#authModal`) sowie Abmelde-Buttons ("Abmelden" / "Выйти" / "Вийти") werden bereitgestellt.
* **OneSignal Push-Benachrichtigungen**: Vollständige PWA-Push-Integration für Partner-Benachrichtigungen.
* **Schutz vor Update-Schleifen**: Automatisches `self.skipWaiting()` bei der Installation und `clients.claim()` bei der Aktivierung in `sw.js` zur Verhinderung endloser Aktualisierungs-Banner.
* **Optimiertes Kalender-Layout**: Gestochen scharfe Datumsanzeige ohne Unschärfe (`text-shadow: none`), Datumszahlen oben zentriert (`top: 2px; left: 50%`) und Trolley-/Warnungs-Badges unten zentriert (`bottom: 2px; left: 50%`) zur Vermeidung von Überlappungen.
* **Offline-First & FIFO-Warteschlange**: Offline getätigte Aktionen werden lokal in der `offlineActions`-Warteschlange gespeichert und bei Netzwerkrückkehr chronologisch synchronisiert.

### 4. Administrator-Handbuch

#### Benutzerverwaltung
Benutzerdaten werden im Tabellenblatt **`Users`** verwaltet. Die Spaltenstruktur muss wie folgt aussehen:

| Spalte | Feld | Beschreibung | Format |
| :--- | :--- | :--- | :--- |
| **A (1)** | Email | E-Mail-Adresse | `user@example.com` (Kleinschreibung) |
| **B (2)** | Name | Vollständiger Name | Text (z.B. `Max Mustermann`) |
| **C (3)** | Status | Status des Benutzers | `active` / `активен` |
| **D (4)** | Role | Rolle | `admin` / `user` |
| **E (5)** | Password | Passwort | Klartext |

---

## Русский

**Запись на тележке** (Trolley Dienst) — это современное PWA-приложение (Progressive Web Application) с архитектурой **Offline-First**, разработанное для управления графиком дежурств и бронирования смен для служения с тележками.

### 1. Архитектура и стек технологий

```mermaid
graph TD
    A[Клиент PWA: HTML/CSS/JS] <-->|Fetch API / JSON| B(Бэкенд: Google Apps Script API)
    B <-->|SpreadsheetApp API| C[(База данных: Google Таблицы)]
    A <-->|Локальный кэш| D[(Браузер: LocalStorage & Service Worker v47)]
    A <-->|OneSignal SDK v16| E[Служба Push-уведомлений]
```

* **Фронтенд**: HTML5, CSS3 (переменные темы, переходы, системный темный режим, чёткая типографика), ванильный ES6+ JS разделен на интерфейс ([app.js](file:///c:/Users/vital/Downloads/booking-Add-main/booking-Add-main/app.js)) и синхронизацию ([app-sync.js](file:///c:/Users/vital/Downloads/booking-Add-main/booking-Add-main/app-sync.js)).
* **Единый Service Worker**: Один файл воркера ([sw.js](file:///c:/Users/vital/Downloads/booking-Add-main/booking-Add-main/sw.js)) с кэшированием `Cache-First`, авто-вызовом `skipWaiting()`, `clients.claim()` и интегрированным OneSignal Push SDK через [OneSignalSDKWorker.js](file:///c:/Users/vital/Downloads/booking-Add-main/booking-Add-main/OneSignalSDKWorker.js).
* **Многоязычность**: Разделено на три страницы для различных языковых групп:
  * [index.html](file:///c:/Users/vital/Downloads/booking-Add-main/booking-Add-main/index.html) — Русскоязычное собрание (RU)
  * [index_ua.html](file:///c:/Users/vital/Downloads/booking-Add-main/booking-Add-main/index_ua.html) — Украинское собрание (UA)
  * [index_de.html](file:///c:/Users/vital/Downloads/booking-Add-main/booking-Add-main/index_de.html) — Немецкое собрание (DE)

### 2. Инфраструктура и развертывание

#### Фронтенд: Хостинг и CI/CD (Vercel + GitHub)
1. Код проекта размещен в репозитории на **GitHub**.
2. Хостинг фронтенда обеспечивается **Vercel** с автоматическим деплоем при пуше в ветку `master`.

#### Бэкенд: Google Apps Script (GAS)
Код API прописан в файле [google_script.txt](file:///c:/Users/vital/Downloads/booking-Add-main/booking-Add-main/google_script.txt).

> [!IMPORTANT]
> При изменении кода GAS необходимо создавать новый релиз ("Новую версию" развертывания веб-приложения):
> 1. В панели GAS выберите **Начать развертывание** -> **Управление развертываниями**.
> 2. Отредактируйте активное развертывание, выберите **Новая версия** и нажмите **Развернуть**.

### 3. Ключевые особенности и оптимизация

* **Строгий Auth Guard и многоязычная авторизация**: Функция `checkAuthGuard()` защищает все страницы (`index.html`, `index_de.html`, `index_ua.html`). Неавторизованный доступ полностью заблокирован; защищенные блоки скрываются (`display: none`), выводится локализованное модальное окно авторизации (`#authModal`) и кнопки выхода («Выйти» / «Abmelden» / «Вийти»).
* **OneSignal Push-уведомления**: Интеграция push-уведомлений для информирования напарников в рамках единого воркера PWA.
* **Защита от бесконечного цикла обновлений**: Автоматический `self.skipWaiting()` при установке и `clients.claim()` при активации в `sw.js` для полного устранения зависания баннеров обновления.
* **Высокоплотный макет ячеек календаря**: Четкие числа дат без размытых теней (`text-shadow: none`), жесткая привязка цифры вверху по центру (`top: 2px; left: 50%`) и бейджей тележек/уведомлений внизу по центру (`bottom: 2px; left: 50%`), исключающая наложение элементов.
* **Offline-First и FIFO очередь**: Оффлайн-действия кэшируются в `localStorage` (`offlineActions`) и отправляются на сервер при восстановлении сети.
* **Инкрементальный DOM-апдейт**: Сетка календаря обновляет классы и текст ячеек напрямую, без полного перерендеривания.

### 4. Руководство администратора

#### Список пользователей
Пользователи хранятся на листе **`Users`** в Google Таблице со следующей структурой колонок:

| Столбец | Поле | Описание | Формат данных |
| :--- | :--- | :--- | :--- |
| **A (1)** | Email | Электронная почта | `user@example.com` (строчные буквы) |
| **B (2)** | Name | Имя и фамилия возвещателя | Текст (например, `Иван Иванов`) |
| **C (3)** | Status | Флаг активности пользователя | `active` / `активен` |
| **D (4)** | Role | Роль пользователя | `admin` / `user` |
| **E (5)** | Password | Пароль пользователя | Обычный текст |

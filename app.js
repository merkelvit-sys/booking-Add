// ============================================================================
// app.js — Основная логика клиента (запись, карта, график, PWA).
// Единый файл для всех языковых версий (RU / UA / DE).
// Язык берётся из <html lang="...">; все пользовательские строки — в I18N.
// Глобальные переменные/функции используются модулем app-sync.js (SyncCore):
//   GOOGLE_SCRIPT_URL, isValidScriptUrl(), databaseBookings,
//   renderScheduleBoard(), onLocationOrDateChange(), showToast()
// ============================================================================

// ----------------------------------------------------------------------------
// Локализация (ru / uk / de). Ключи совпадают во всех языках.
// ----------------------------------------------------------------------------
const I18N = {
  ru: {
    errCritical: "Критическая ошибка JS:\nСообщение: {msg}\nФайл: {file}\nСтрока: {line}",
    errUnhandled: "Необработанная ошибка (Promise):\nОписание: {reason}",

    authTitle: "Доступ к расписанию",
    authDesc: "Введите ваш email для авторизации. Доступ предоставляется только активным пользователям.",
    authPlaceholder: "your@email.com",
    authSubmit: "Войти",
    authError: "Email не найден или не активен.",
    authNetworkError: "Ошибка сети. Попробуйте ещё раз.",
    authLoading: "Проверка...",
    authLogout: "Выйти",
    authWelcome: "Добро пожаловать, {name}!",

    pwaIos: `<div class="pwa-steps">
        <div class="pwa-step"><span class="pwa-step-num">1</span><span>Нажмите кнопку <strong>«Поделиться»</strong> (квадрат со стрелкой вверх) в меню Safari.</span></div>
        <div class="pwa-step"><span class="pwa-step-num">2</span><span>Прокрутите меню вниз и выберите <strong>«На экран «Домой»»</strong>.</span></div>
        <div class="pwa-step"><span class="pwa-step-num">3</span><span>Нажмите <strong>«Добавить»</strong> в верхнем правом углу.</span></div>
    </div>`,
    pwaInstall: "Нажмите кнопку «Установить» ниже, чтобы добавить приложение на рабочий стол вашего телефона или компьютера.",
    pwaAndroid: `<div class="pwa-steps">
        <div class="pwa-step"><span class="pwa-step-num">1</span><span>Нажмите на три точки в правом верхнем углу вашего браузера.</span></div>
        <div class="pwa-step"><span class="pwa-step-num">2</span><span>Выберите пункт <strong>«Добавить на главный экран»</strong> или <strong>«Установить приложение»</strong>.</span></div>
    </div>`,

    weekdayShort: ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"],

    shareTitle: "Служение с тележками в Марбурге",
    shareText: "Удобное приложение для записи на стенды в городе Марбург, Германия.",
    shareCopied: "Ссылка на приложение скопирована в буфер обмена!",
    shareCopyFail: "Не удалось скопировать ссылку автоматически.",

    noLocationsPlaceholder: "📍 Нет добавленных мест.<br>Нажмите кнопку ниже, чтобы добавить первую точку!",
    statusAvailable: "Доступно",
    timePassed: "Время прошло",
    fullyBooked: "Занято полностью",
    oneCartFree: "Свободна 1 тележка",
    twoCartsFree: "Доступно (2 тележки)",
    addTimeBtn: "+ Своё время",
    timeStart: "Начало:",
    timeEnd: "Конец:",
    delTimeTitle: "Удалить это время",
    selectLocation: "Выберите локацию",

    coordsNotSelected: "Координаты не выбраны",
    enterLocationName: "Пожалуйста, введите название или выберите его на карте.",
    existingLocation: 'Выбрано существующее место: "{name}"',
    locationAdded: 'Место "{name}" добавлено!',
    delLocationTitle: "Удалить это место",
    locationRemoved: 'Место "{name}" удалено',

    enterStartEnd: "Пожалуйста, заполните начало и конец времени.",
    timeExists: 'Время "{time}" уже существует.',
    timeAdded: 'Время "{time}" добавлено!',
    timeRemoved: 'Время "{time}" удалено',

    selectLocationFirst: "Сначала выберите локацию",
    mapTitle: "Местоположение: {name}",
    buildRoute: "📍 Построить маршрут",
    noCoords: "Координаты для этого места не заданы",
    selectPointMap: "Выберите точку на карте",
    clickMap: "📍 Кликните на карту, чтобы выбрать точку...",
    leafletError: "Ошибка: библиотека карт Leaflet не загружена",
    loadingAddress: "📍 Загрузка адреса... ({lat}, {lng})",
    coordsOnly: "📍 Координаты: {lat}, {lng}",
    selectPointFirst: "Пожалуйста, выберите точку на карте",
    selectedCoords: "Выбрано: {lat}, {lng}",
    pointAt: "Точка ({lat}, {lng})",

    selectPlaceTime: "Пожалуйста, выберите место и время",
    fillCart1: "Заполните имена для первой тележки",
    fillCart2Both: "Для второй тележки укажите оба имени напарников",
    fillCart2Names: "Укажите оба имени для второй тележки",
    selectCart1Lang: "Выберите язык для Тележки №1",
    selectCart2Lang: "Выберите язык для Тележки №2",
    btnSaving: "Сохранение...",
    shiftSaved: "Смена успешно записана!",
    btnSuccess: "Успешно!",
    btnSubmit: "Записать смену",
    networkSendError: "Ошибка сети при отправке данных",
    savedLocally: "Сохранено локально. Синхронизируется при появлении сети.",
    bookingConflict: "Эта тележка на данное время уже забронирована!",

    confirmDelete: "Вы уверены, что хотите удалить эту запись?",
    deletedDemo: "Запись успешно удалена (демо-режим)",
    deleting: "Удаление записи...",
    deleted: "Запись успешно удалена!",
    networkDeleteError: "Ошибка сети при удалении записи",
    saveVerifyFail: "Сервер не сохранил изменения. Пересоздайте Web App (Deploy → New version) с новым кодом google_script.txt.",

    loadErrorDemo: "Не удалось загрузить данные из Google Sheets. Включен демо-режим.",
    noLocations: "Локации не добавлены.",
    free: "Свободно",
    onMap: "На карте",
    deleteBooking: "Удалить запись",
    cartLabel: "Тележка",
    backToToday: "Возвращено к сегодняшней дате",
    quickBookBtn: "+ Записаться",
    quickBookTitle: "Быстрая запись на смену",
    quickBookDate: "Дата",
    quickBookTime: "Время",
    quickBookPlace: "Место",
    quickBookCart: "Тележка",
    quickBookLang: "Выберите язык тележки",
    quickBookNames: "Участники смены",
    quickBookSave: "Сохранить смену",
    qbSendPush: "🔔 Отправить уведомление о поиске напарника",
    infoTip: "Подсказка",
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
    },
    addLocationBtn: "+ Добавить место",
    addLocationTitle: "Добавить место",
    addLocationName: "Название локации",
    addLocationMarkMap: "Отметить на карте",
    addTimeSlotBtn: "+ Время",
    enterTimePrompt: "Введите время для нового интервала (например, 15:00 - 17:00):",
    addTimeSlotTitle: "Добавить интервал времени",
    atsFromLabel: "С (начало)",
    atsToLabel: "До (конец)",
    atsPresetsLabel: "Быстрый выбор",
    atsBtnText: "Добавить",

    groupLabel_RU: "RU (Русская)",
    groupLabel_UA: "UA (Украинская)",
    groupLabel_DE: "DE (Немецкая)",
    cartTitle_RU_1: "Русская тележка 1",
    cartTitle_RU_2: "Русская тележка 2",
    cartTitle_UA_1: "Украинская тележка 1",
    cartTitle_UA_2: "Украинская тележка 2",
    cartTitle_DE_1: "Немецкая тележка 1",
    cartTitle_DE_2: "Немецкая тележка 2",

    guideSections: [
      {
        icon: "📋",
        title: "1. Цель и подход к людям",
        items: [
          "Проповедь в общественных местах нужна, чтобы донести радостную весть до тех людей, до которых по-другому донести эту весть нет возможности. Для этой цели тележки, стенды, столы или стойки для литературы устанавливаются в местах интенсивного движения пешеходов (<span class='bible-ref'>Прит. 1:20</span>). В первую очередь мы стараемся начать изучение Библии, обратить внимание на наш сайт jw.org, и, не откладывая, развивать уже проявленный интерес, а не просто распространять литературу.",
          "Стоя рядом с тележкой, стендом, столом или стойкой для литературы, старайтесь быть дружелюбными и приветливыми. Лучше всего стоять или сидеть на некотором расстоянии от тележки. Не слишком близко, чтобы прохожий не боялся подойти к тележке, и не слишком далеко, чтобы было понятно, что это тележка — ваша. Не нужно первыми подходить к людям. Однако важно доброжелательно улыбаться и поддерживать зрительный контакт (<span class='bible-ref'>th урок 12</span>). Когда кто-то подходит к столу или стенду, можно самим начать разговор, например, спросив: «Вы когда-нибудь задумывались, что об этом говорится в Библии?» Не пользуйтесь без необходимости мобильными устройствами и избегайте ненужных разговоров с напарником, поскольку это помешает вашему служению.",
          "Если человек хочет узнать больше, вы можете предоставить ему свои контактные данные или предложить заполнить на сайте jw.org заявку «Попросить о посещении». Если человек говорит на другом языке, вы можете обратить его внимание на сайт jw.org, где он может найти публикации на его языке, или связаться с собранием на соответствующем языке. Если это уместно и не нарушает законы о защите персональных данных, вы можете развивать проявленный интерес до тех пор, пока с человеком не свяжется кто-то из возвещателей, говорящий на его языке."
        ]
      },
      {
        icon: "💰",
        title: "2. Финансы и пожертвования",
        items: [
          "В целях личной безопасности и учитывая добровольный характер нашего служения, не ставьте ящиков для пожертвований и не принимайте никакие пожертвования. Бывает, нас спрашивают, как финансируется наше служение. В таком случае скажите, что пожертвования можно сделать на сайте donate.jw.org или направить пожертвование по адресу, указанному в нашей литературе."
        ]
      },
      {
        icon: "📚",
        title: "3. Использование литературы",
        items: [
          "Чтобы литература использовалась по назначению и не портилась, нужно быть рассудительным. Выставляемая литература должна выглядеть аккуратно и достойно. Не следует выкладывать слишком много разных публикаций. Можно выложить выпуски журналов «Сторожевая Башня» и «Пробудитесь!», которые распространяем в этом месяце, брошюру «Радуйтесь жизни сейчас и вечно!» и/или публикации, которые вызовут интерес у людей в вашей местности. Библии выставлять не следует, однако их можно иметь при себе и давать тем, кто попросит или проявит искренний интерес к истине. Также можно иметь несколько экземпляров брошюры «Вернись к Иегове» (но не выставлять её на стенде или столе) на случай, если подойдёт неактивный возвещатель."
        ]
      },
      {
        icon: "🛡️",
        title: "4. Меры безопасности",
        items: [
          "Обычно с тележкой возвещатели служат по двое. Возвещателям следует всегда оставаться начеку, поскольку условия в обычно безопасном районе могут внезапно измениться (<span class='bible-ref'>Прит. 22:3; Эккл. 4:10, 12</span>). В целях безопасности лучше размещать тележки и столы так, чтобы к возвещателям нельзя было подойти сзади. Например, в некоторых местах можно стоять спиной к стене или направить тележки спиной друг к другу, чтобы возвещатели смотрели в противоположные стороны. Возвещатели, служащие неподалёку от тележек, должны наблюдать за тем, что происходит вокруг в районе. Если вы служите вблизи проезжей части, по возможности расположите тележки и столы за бетонным или другим ограждением. Обратите внимание, если полиция просит возвещателей уйти, они должны подчиниться и сообщить об этом одному из старейшин."
        ]
      },
      {
        icon: "⚠️",
        title: "5. Особые ситуации (Нарушители, Исключённые, СМИ)",
        items: [
          "Лица, нарушающие порядок: Не спорьте с тем, кто нарушает порядок. Оставайтесь спокойными и дружелюбными и постарайтесь закончить разговор по-доброму. Если человек продолжает вести себя неподобающе или становится агрессивным, покиньте эту местность. Если человек представляет угрозу, возможно, потребуется уйти, на время оставив оборудование для служения. В экстренных ситуациях прибегайте к помощи местных властей.",
          "Исключённые: Если подойдёт исключённый, желающий вернуться в собрание, вы можете просто показать ему страницу «Найти встречи» на сайте jw.org, чтобы он мог посетить ближайшее к нему собрание.",
          "СМИ: Как правило, вам не следует соглашаться на предложение представителя средств массовой информации о личном интервью. Вместо этого обратите их внимание на разделы «Новости» и «О нас» на сайте jw.org, где они могут получить информацию о деятельности Свидетелей Иеговы. Если представитель СМИ настаивает на своей просьбе, ему можно предложить оставить свои контактные данные и короткое описание своих вопросов, в согласии с законом о защите персональных данных. После этого сразу сообщите одному из старейшин о просьбе представителя СМИ."
        ]
      }
    ]
  },

  uk: {
    errCritical: "Критична помилка JS:\nПовідомлення: {msg}\nФайл: {file}\nРядок: {line}",
    errUnhandled: "Необроблена помилка (Promise):\nОпис: {reason}",

    pwaIos: `<div class="pwa-steps">
        <div class="pwa-step"><span class="pwa-step-num">1</span><span>Натисніть кнопку <strong>«Поділитися»</strong> (квадрат зі стрілкою вгору) в меню Safari.</span></div>
        <div class="pwa-step"><span class="pwa-step-num">2</span><span>Прокрутіть меню вниз та виберіть <strong>«На екран «Додому»»</strong>.</span></div>
        <div class="pwa-step"><span class="pwa-step-num">3</span><span>Натисніть <strong>«Додати»</strong> у правому верхньому кутку.</span></div>
    </div>`,
    pwaInstall: "Натисніть кнопку «Встановити» нижче, щоб додати додаток на робочий стіл вашого телефону або комп'ютера.",
    pwaAndroid: `<div class="pwa-steps">
        <div class="pwa-step"><span class="pwa-step-num">1</span><span>Натисніть на три крапки у правому верхньому кутку вашого браузера.</span></div>
        <div class="pwa-step"><span class="pwa-step-num">2</span><span>Виберіть пункт <strong>«Додати на головний екран»</strong> або <strong>«Встановити додаток»</strong>.</span></div>
    </div>`,

    weekdayShort: ["Нд", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"],

    shareTitle: "Служіння з візками в Марбурзі",
    shareText: "Зручний додаток для запису на стенди в місті Марбург, Німеччина.",
    shareCopied: "Посилання на додаток скопійовано в буфер обміну!",
    shareCopyFail: "Не вдалося скопіювати посилання автоматично.",

    noLocationsPlaceholder: "📍 Немає доданих місць.<br>Натисніть кнопку нижче, щоб додати першу точку!",
    statusAvailable: "Доступно",
    timePassed: "Час минув",
    fullyBooked: "Зайнято повністю",
    oneCartFree: "Вільний 1 стенд",
    twoCartsFree: "Вільно (2 стенди)",
    addTimeBtn: "+ Свій час",
    timeStart: "Початок:",
    timeEnd: "Кінець:",
    delTimeTitle: "Видалити цей час",
    selectLocation: "Виберіть локацію",

    coordsNotSelected: "Координати не вибрані",
    enterLocationName: "Будь ласка, введіть назву або виберіть її на карті.",
    existingLocation: 'Вибрано існуюче місце: "{name}"',
    locationAdded: 'Місце "{name}" додано!',
    delLocationTitle: "Видалити це місце",
    locationRemoved: 'Місце "{name}" вилучено',

    enterStartEnd: "Будь ласка, заповніть початок і кінець часу.",
    timeExists: 'Час "{time}" вже існує.',
    timeAdded: 'Час "{time}" додано!',
    timeRemoved: 'Час "{time}" вилучено',

    selectLocationFirst: "Спочатку виберіть локацію",
    mapTitle: "Місцезнаходження: {name}",
    buildRoute: "📍 Прокласти маршрут",
    noCoords: "Координати для цього місця не задані",
    selectPointMap: "Виберіть точку на карті",
    clickMap: "📍 Клікніть на карту, щоб вибрати точку...",
    leafletError: "Помилка: бібліотека карт Leaflet не завантажена",
    loadingAddress: "📍 Завантаження адреси... ({lat}, {lng})",
    coordsOnly: "📍 Координати: {lat}, {lng}",
    selectPointFirst: "Будь ласка, виберіть точку на карті",
    selectedCoords: "Вибрано: {lat}, {lng}",
    pointAt: "Точка ({lat}, {lng})",

    selectPlaceTime: "Будь ласка, виберіть місце та час",
    fillCart1: "Заповніть імена для першого стенду",
    fillCart2Both: "Для другого стенду вкажіть обидва імені напарників",
    fillCart2Names: "Вкажіть обидва імені для другого стенду",
    selectCart1Lang: "Виберіть мову для Тележки №1",
    selectCart2Lang: "Виберіть мову для Тележки №2",
    btnSaving: "Збереження...",
    shiftSaved: "Зміну успішно записано!",
    btnSuccess: "Успішно!",
    btnSubmit: "Записати зміну",
    networkSendError: "Помилка мережі при надсиланні даних",
    savedLocally: "Збережено локально. Синхронізується при появі мережі.",
    bookingConflict: "Ця теліжка на цей час вже заброньована!",

    confirmDelete: "Ви впевнені, що хочете видалити цей запис?",
    deletedDemo: "Запис успішно видалено (демо-режим)",
    deleting: "Видалення запису...",
    deleted: "Запис успішно видалено!",
    networkDeleteError: "Помилка мережі при видаленні запису",
    saveVerifyFail: "Сервер не зберіг зміни. Перевидіть Web App (Deploy → New version) з новим кодом google_script.txt.",

    loadErrorDemo: "Не вдалося завантажити дані з Google Таблиць. Увімкнено демо-режим.",
    noLocations: "Локації не додані.",
    free: "Вільно",
    onMap: "На карті",
    deleteBooking: "Видалити запис",
    cartLabel: "Тележка",
    backToToday: "Повернуто до сьогоднішньої дати",
    quickBookBtn: "+ Записатися",
    quickBookTitle: "Швидкий запис на зміну",
    quickBookDate: "Дата",
    quickBookTime: "Час",
    quickBookPlace: "Місце",
    quickBookCart: "Тележка",
    quickBookLang: "Виберіть мову тележки",
    quickBookNames: "Учасники зміни",
    quickBookSave: "Зберегти зміну",
    qbSendPush: "🔔 Надіслати сповіщення про пошук партнера",
    infoTip: "Підказка",
    infoTips:{
      status:"Що відбувається цього дня.\n• Служіння — стенд працює.\n• Вихідний / Свято — не служимо.\n• Подія / Особливе — особливий день (наприклад, поломка).",
      cartLang:"Мова літератури на цій тележці: Російська, Українська або Німецька. Від неї залежить колір клітинки у річному графіку.",
      description:"Опишіть подію чи особливий день (наприклад, «Великдень», «Ярмарок»). Видно у річному графіку.",
      note:"Примітка про проблему або нагадування: «Порваний чохол», «Немає літератури». Натисніть кнопку-шаблон нижче, щоб додати швидко.",
      qbDate:"День, на який ви записуєте зміну.",
      qbTime:"Час початку і закінчення зміни.",
      qbLocation:"Місце (локація), де буде стенд.",
      qbCart:"Номер тележки (1 або 2), яку ви записуєте.",
      qbLang:"Мова літератури на тележці: Російська, Українська або Німецька.",
      qbNames:"Імена двох учасників цієї тележки.",
      mainCartLang:"Мова літератури на цій тележці (Російська / Українська / Німецька). Колір допомагає знайти її у річному графіку."
    },
    addLocationBtn: "+ Додати місце",
    addLocationTitle: "Додати місце",
    addLocationName: "Назва локації",
    addLocationMarkMap: "Позначити на карті",
    addTimeSlotBtn: "+ Час",
    enterTimePrompt: "Введіть час для нового інтервалу (наприклад, 15:00 - 17:00):",
    addTimeSlotTitle: "Додати інтервал часу",
    atsFromLabel: "З (початок)",
    atsToLabel: "До (кінець)",
    atsPresetsLabel: "Швидкий вибір",
    atsBtnText: "Додати",

    groupLabel_RU: "RU (Російська)",
    groupLabel_UA: "UA (Українська)",
    groupLabel_DE: "DE (Німецька)",
    cartTitle_RU_1: "Російська тележка 1",
    cartTitle_RU_2: "Російська тележка 2",
    cartTitle_UA_1: "Українська тележка 1",
    cartTitle_UA_2: "Українська тележка 2",
    cartTitle_DE_1: "Німецька тележка 1",
    cartTitle_DE_2: "Німецька тележка 2",

    guideSections: [
      {
        icon: "📋",
        title: "1. Мета та підхід до людей",
        items: [
          "Проповідь у громадських місцях потрібна, щоб донести радісну вістку до тих людей, яким інакше донести цю вістку немає змоги. Для цієї мети візки, стенди, столи або стійки для літератури встановлюються у місцях інтенсивного руху пішоходів (<span class='bible-ref'>Прип. 1:20</span>). Насамперед ми намагаємось розпочати вивчення Біблії, звернути увагу на наш сайт jw.org і, не відкладаючи, розвивати вже виявлений інтерес, а не просто поширювати літературу.",
          "Стоячи поруч із візком, стендом, столом або стійкою для літератури, намагайтеся бути привітними й дружелюбними. Найкраще стояти або сидіти на деякій відстані від візка. Не надто близько, щоб перехожий не боявся підійти до візка, і не надто далеко, щоб було зрозуміло, що цей візок — ваш. Не потрібно самим підходити до людей першими. Проте важливо доброзичливо посміхатися й підтримувати зоровий контакт (<span class='bible-ref'>th урок 12</span>). Коли хтось підходить до столу або стенду, можна самим почати розмову, наприклад запитавши: «Чи замислювалися ви коли-небудь, що про це говориться в Біблії?» Не користуйтеся без потреби мобільними пристроями й уникайте зайвих розмов із напарником, оскільки це заважатиме вашому служінню.",
          "Якщо людина хоче дізнатися більше, ви можете надати їй свої контактні дані або запропонувати заповнити на сайті jw.org заявку «Попросити про відвідання». Якщо людина розмовляє іншою мовою, ви можете звернути її увагу на сайт jw.org, де вона може знайти публікації її мовою, або зв'язатися із зібранням відповідною мовою. Якщо це доречно і не порушує законів про захист персональних даних, ви можете розвивати виявлений інтерес доти, доки з цією людиною не зв'яжеться хтось із проповідників, який розмовляє її мовою."
        ]
      },
      {
        icon: "💰",
        title: "2. Фінанси та пожертви",
        items: [
          "З міркувань особистої безпеки та враховуючи добровільний характер нашого служіння, не ставте скриньок для пожертв і не приймайте жодних пожертв. Буває, нас запитують, як фінансується наше служіння. У такому разі скажіть, що пожертви можна зробити на сайті donate.jw.org або надіслати пожертву за адресою, вказаною в нашій літературі."
        ]
      },
      {
        icon: "📚",
        title: "3. Використання літератури",
        items: [
          "Щоб література використовувалася за призначенням і не псувалася, потрібно бути розсудливим. Література, що виставляється, повинна виглядати охайно й гідно. Не слід викладати забагато різних публікацій. Можна викласти випуски журналів «Вартова Башта» та «Пробудіться!», які поширюємо цього місяця, брошуру «Радійте життям зараз і вічно!» та/або публікації, які викличуть інтерес у людей у вашій місцевості. Біблії виставляти не слід, проте їх можна мати при собі й давати тим, хто попросить або виявить щирий інтерес до істини. Також можна мати кілька примірників брошури «Повернися до Єгови» (але не виставляти її на стенді чи столі) на випадок, якщо підійде неактивний проповідник."
        ]
      },
      {
        icon: "🛡️",
        title: "4. Заходи безпеки",
        items: [
          "Зазвичай із візком проповідники служать удвох. Проповідникам слід завжди бути насторожі, оскільки умови в зазвичай безпечному районі можуть раптово змінитися (<span class='bible-ref'>Прип. 22:3; Еккл. 4:10, 12</span>). З міркувань безпеки краще розміщувати візки та столи так, щоб до проповідників не можна було підійти ззаду. Наприклад, у деяких місцях можна стояти спиною до стіни або направити візки спинами один до одного, щоб проповідники дивилися в протилежні боки. Проповідники, що служать неподалік від візків, повинні стежити за тим, що відбувається довкола в районі. Якщо ви служите поблизу проїжджої частини, за можливості розташуйте візки та столи за бетонним або іншим огородженням. Зверніть увагу: якщо поліція просить проповідників піти, вони повинні підкоритися й повідомити про це одному зі старійшин."
        ]
      },
      {
        icon: "⚠️",
        title: "5. Особливі ситуації (Порушники, Виключені, ЗМІ)",
        items: [
          "Особи, що порушують порядок: Не сперечайтеся з тим, хто порушує порядок. Залишайтеся спокійними й дружелюбними й намагайтеся закінчити розмову доброзичливо. Якщо людина й далі поводиться неподобаюче або стає агресивною, залиште цю місцевість. Якщо людина становить загрозу, можливо, доведеться піти, залишивши на час обладнання для служіння. У надзвичайних ситуаціях звертайтеся по допомогу до місцевої влади.",
          "Виключені: Якщо підійде виключений, який бажає повернутися до зібрання, ви можете просто показати йому сторінку «Знайти зустрічі» на сайті jw.org, щоб він міг відвідати найближче до нього зібрання.",
          "ЗМІ: Як правило, вам не слід погоджуватися на пропозицію представника засобів масової інформації про особисте інтерв'ю. Натомість зверніть їхню увагу на розділи «Новини» та «Про нас» на сайті jw.org, де вони можуть отримати інформацію про діяльність Свідків Єгови. Якщо представник ЗМІ наполягає на своєму проханні, йому можна запропонувати залишити свої контактні дані та короткий опис своїх запитань, згідно із законом про захист персональних даних. Після цього відразу повідомте одному зі старійшин про прохання представника ЗМІ."
        ]
      }
    ]
  },

  de: {
    errCritical: "Kritischer JS-Fehler:\nNachricht: {msg}\nDatei: {file}\nZeile: {line}",
    errUnhandled: "Unbehandelter Fehler (Promise):\nBeschreibung: {reason}",

    pwaIos: `<div class="pwa-steps">
        <div class="pwa-step"><span class="pwa-step-num">1</span><span>Tippen Sie im Safari-Menü auf die Schaltfläche <strong>„Teilen“</strong> (Quadrat mit Pfeil nach oben).</span></div>
        <div class="pwa-step"><span class="pwa-step-num">2</span><span>Scrollen Sie nach unten und wählen Sie <strong>„Zum Home-Bildschirm“</strong>.</span></div>
        <div class="pwa-step"><span class="pwa-step-num">3</span><span>Tippen Sie oben rechts auf <strong>„Hinzufügen“</strong>.</span></div>
    </div>`,
    pwaInstall: "Klicken Sie unten auf „Installieren“, um die App zum Startbildschirm Ihres Telefons oder Computers hinzuzufügen.",
    pwaAndroid: `<div class="pwa-steps">
        <div class="pwa-step"><span class="pwa-step-num">1</span><span>Klicken Sie auf die drei Punkte oben rechts in Ihrem Browser.</span></div>
        <div class="pwa-step"><span class="pwa-step-num">2</span><span>Wählen Sie <strong>„Zum Startbildschirm hinzufügen“</strong> oder <strong>„App installieren“</strong>.</span></div>
    </div>`,

    weekdayShort: ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"],

    shareTitle: "Trolleydienst in Marburg",
    shareText: "Eine bequeme Anwendung für die Buchung von Infoständen in Marburg, Deutschland.",
    shareCopied: "Link zur App in die Zwischenablage kopiert!",
    shareCopyFail: "Link konnte nicht automatisch kopiert werden.",

    noLocationsPlaceholder: "📍 Keine Standorte hinzugefügt.<br>Klicken Sie unten, um Ihren ersten Standort hinzuzufügen!",
    statusAvailable: "Verfügbar",
    timePassed: "Zeit abgelaufen",
    fullyBooked: "Vollständig ausgebucht",
    oneCartFree: "1 Trolley frei",
    twoCartsFree: "Verfügbar (2 Trolleys)",
    addTimeBtn: "+ Eigene Uhrzeit",
    timeStart: "Beginn:",
    timeEnd: "Ende:",
    delTimeTitle: "Diese Uhrzeit löschen",
    selectLocation: "Standort auswählen",

    coordsNotSelected: "Koordinaten nicht ausgewählt",
    enterLocationName: "Bitte geben Sie einen Namen ein oder wählen Sie einen Punkt auf der Karte.",
    existingLocation: 'Bestehender Ort ausgewählt: "{name}"',
    locationAdded: 'Ort "{name}" hinzugefügt!',
    delLocationTitle: "Diesen Ort löschen",
    locationRemoved: 'Ort "{name}" gelöscht',

    enterStartEnd: "Bitte geben Sie Beginn und Ende der Uhrzeit ein.",
    timeExists: 'Uhrzeit "{time}" existiert bereits.',
    timeAdded: 'Uhrzeit "{time}" hinzugefügt!',
    timeRemoved: 'Uhrzeit "{time}" gelöscht',

    selectLocationFirst: "Bitte wählen Sie zuerst einen Standort aus",
    mapTitle: "Standort: {name}",
    buildRoute: "📍 Route planen",
    noCoords: "Koordinaten für diesen Ort sind nicht festgelegt.",
    selectPointMap: "Wählen Sie einen Punkt auf der Karte",
    clickMap: "📍 Klicken Sie auf die Karte, um einen Punkt auszuwählen...",
    leafletError: "Fehler: Kartenbibliothek Leaflet ist nicht geladen.",
    loadingAddress: "📍 Adresse wird geladen... ({lat}, {lng})",
    coordsOnly: "📍 Koordinaten: {lat}, {lng}",
    selectPointFirst: "Bitte wählen Sie einen Punkt auf der Karte",
    selectedCoords: "Ausgewählt: {lat}, {lng}",
    pointAt: "Punkt ({lat}, {lng})",

    selectPlaceTime: "Bitte wählen Sie Ort und Zeit aus.",
    fillCart1: "Geben Sie die Namen für den ersten Trolley ein.",
    fillCart2Both: "Geben Sie für den zweiten Trolley beide Partnernamen an.",
    fillCart2Names: "Geben Sie beide Namen für den zweiten Trolley an.",
    selectCart1Lang: "Wählen Sie die Sprache für Trolley Nr. 1",
    selectCart2Lang: "Wählen Sie die Sprache für Trolley Nr. 2",
    btnSaving: "Speichern...",
    shiftSaved: "Schicht erfolgreich eingetragen!",
    btnSuccess: "Erfolgreich!",
    btnSubmit: "Schicht eintragen",
    networkSendError: "Netzwerkfehler beim Senden der Daten.",
    savedLocally: "Lokal gespeichert. Wird synchronisiert, sobald die Verbindung wiederhergestellt ist.",
    bookingConflict: "Dieser Trolley ist für diese Zeit bereits gebucht!",

    confirmDelete: "Sind Sie sicher, dass Sie diesen Eintrag löschen möchten?",
    deletedDemo: "Eintrag erfolgreich gelöscht (Demo-Modus)",
    deleting: "Eintrag wird gelöscht...",
    deleted: "Eintrag erfolgreich gelöscht!",
    networkDeleteError: "Netzwerkfehler beim Löschen des Eintrags",
    saveVerifyFail: "Server hat die Änderungen nicht gespeichert. Erstellen Sie die Web App neu (Deploy → New version) mit dem neuen Code google_script.txt.",

    loadErrorDemo: "Daten aus Google Sheets konnten nicht geladen werden. Demo-Modus aktiv.",
    noLocations: "Keine Standorte hinzugefügt.",
    free: "Frei",
    onMap: "Auf Karte",
    deleteBooking: "Eintrag löschen",
    cartLabel: "Trolley",
    backToToday: "Zurück zum heutigen Datum",
    quickBookBtn: "+ Buchen",
    quickBookTitle: "Schnelle Schichtbuchung",
    quickBookDate: "Datum",
    quickBookTime: "Uhrzeit",
    quickBookPlace: "Standort",
    quickBookCart: "Trolley",
    quickBookLang: "Sprache des Trolleys wählen",
    quickBookNames: "Teilnehmer der Schicht",
    quickBookSave: "Schicht eintragen",
    qbSendPush: "🔔 Benachrichtigung für Partnersuche senden",
    infoTip: "Hinweis",
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
    },
    addLocationBtn: "+ Ort hinzufügen",
    addLocationTitle: "Ort hinzufügen",
    addLocationName: "Standortname",
    addLocationMarkMap: "Auf Karte markieren",
    addTimeSlotBtn: "+ Uhrzeit",
    enterTimePrompt: "Geben Sie die Uhrzeit für das neue Intervall ein (z.B. 15:00 - 17:00):",
    addTimeSlotTitle: "Zeitintervall hinzufügen",
    atsFromLabel: "Von (Anfang)",
    atsToLabel: "Bis (Ende)",
    atsPresetsLabel: "Schnellauswahl",
    atsBtnText: "Hinzufügen",

    groupLabel_RU: "RU (Russisch)",
    groupLabel_UA: "UA (Ukrainisch)",
    groupLabel_DE: "DE (Deutsch)",
    cartTitle_RU_1: "Russische Trolley 1",
    cartTitle_RU_2: "Russische Trolley 2",
    cartTitle_UA_1: "Ukrainische Trolley 1",
    cartTitle_UA_2: "Ukrainische Trolley 2",
    cartTitle_DE_1: "Deutsche Trolley 1",
    cartTitle_DE_2: "Deutsche Trolley 2",

    guideSections: [
      {
        icon: "📋",
        title: "1. Zweck und Umgang mit Menschen",
        items: [
          "Die Predigt an öffentlichen Orten ist notwendig, um die frohe Botschaft zu jenen Menschen zu tragen, zu denen sie auf andere Weise nicht gelangen kann. Zu diesem Zweck werden Trolleys, Stände, Tische oder Literaturständer an Orten mit starkem Fußgängeraufkommen aufgestellt (<span class='bible-ref'>Spr. 1:20</span>). Vorrangig bemühen wir uns, ein Bibelstudium zu beginnen, auf unsere Website jw.org aufmerksam zu machen und das bereits gezeigte Interesse ohne Verzögerung zu fördern, anstatt einfach nur Literatur zu verteilen.",
          "Wenn du neben dem Trolley, Stand, Tisch oder Literaturständer stehst, sei freundlich und zuvorkommend. Am besten stehst oder sitzt du in einigem Abstand zum Trolley. Nicht zu nah, damit der Passant keine Angst hat, an den Trolley heranzutreten, und nicht zu fern, damit klar ist, dass der Trolley dir gehört. Geh den Menschen nicht als Erster entgegen. Es ist jedoch wichtig, freundlich zu lächeln und Blickkontakt zu halten (<span class='bible-ref'>th Lektion 12</span>). Wenn jemand an den Tisch oder Stand herantritt, kannst du das Gespräch selbst beginnen, indem du zum Beispiel fragst: „Haben Sie sich jemals Gedanken darüber gemacht, was die Bibel dazu sagt?“ Nutze Mobilgeräte nicht unnötig und vermeide unnötige Gespräche mit deinem Partner, da dies deinem Dienst im Weg steht.",
          "Wenn jemand mehr erfahren möchte, kannst du ihm deine Kontaktdaten geben oder ihm vorschlagen, auf jw.org den Antrag „Besuch anfragen“ auszufüllen. Spricht jemand eine andere Sprache, kannst du ihn auf jw.org hinweisen, wo er Veröffentlichungen in seiner Sprache finden oder mit einer Versammlung in der entsprechenden Sprache Kontakt aufnehmen kann. Ist dies angemessen und verstößt es nicht gegen den Datenschutz, kannst du das gezeigte Interesse fördern, bis jemand, der seine Sprache spricht, mit der Person Kontakt aufnimmt."
        ]
      },
      {
        icon: "💰",
        title: "2. Finanzen und Spenden",
        items: [
          "Aus Gründen der persönlichen Sicherheit und im Hinblick auf den freiwilligen Charakter unseres Dienstes stelle keine Spendenkisten auf und nimm keine Spenden an. Manchmal wird gefragt, wie unser Dienst finanziert wird. Sage in diesem Fall, dass Spenden auf donate.jw.org gegeben oder an die in unserer Literatur angegebene Adresse gesendet werden können."
        ]
      },
      {
        icon: "📚",
        title: "3. Verwendung von Literatur",
        items: [
          "Damit die Literatur bestimmungsgemäß genutzt und nicht beschädigt wird, ist Umsicht nötig. Die ausgestellte Literatur sollte ordentlich und würdig aussehen. Stelle nicht zu viele verschiedene Veröffentlichungen aus. Du kannst die Ausgaben der Zeitschriften „Der Wachtturm“ und „Erwachet!“, die in diesem Monat verbreitet werden, die Broschüre „Freue dich am Leben jetzt und für immer!“ und/oder Veröffentlichungen auslegen, die bei den Menschen in deinem Gebiet Interesse wecken. Bibeln sollten nicht ausgestellt werden; man kann sie jedoch bei sich tragen und denen geben, die darum bitten oder echtes Interesse an der Wahrheit zeigen. Auch kann man einige Exemplare der Broschüre „Kehre zu Jehova zurück“ (aber nicht am Stand oder Tisch auslegen) dabei haben, falls ein inaktiver Verkündiger vorbeikommt."
        ]
      },
      {
        icon: "🛡️",
        title: "4. Sicherheitsmaßnahmen",
        items: [
          "Zumeist dienen zwei Verkündiger zusammen an einem Trolley. Verkündiger sollten stets wachsam bleiben, da sich die Verhältnisse in einem sonst sicheren Viertel plötzlich ändern können (<span class='bible-ref'>Spr. 22:3; Pred. 4:10, 12</span>). Aus Sicherheitsgründen sollten Trolleys und Tische so aufgestellt werden, dass man sich den Verkündigern nicht von hinten nähern kann. Man kann sich an einigen Orten zum Beispiel mit dem Rücken zur Wand stellen oder die Trolleys Rücken an Rücken ausrichten, sodass die Verkündiger in entgegengesetzte Richtungen blicken. Verkündiger, die in der Nähe der Trolleys dienen, sollten beobachten, was im Umfeld geschieht. Wenn du in der Nähe einer Fahrbahn dienst, stelle die Trolleys und Tische nach Möglichkeit hinter einer Beton- oder anderen Absperrung auf. Beachte: Wenn die Polizei die Verkündiger auffordert wegzugehen, müssen sie gehorchen und einem der Ältesten davon berichten."
        ]
      },
      {
        icon: "⚠️",
        title: "5. Besondere Situationen (Störer, Ausgeschlossene, Medien)",
        items: [
          "Personen, die die Ordnung stören: Streite nicht mit jemandem, der die Ordnung stört. Bleibe ruhig und freundlich und versuche, das Gespräch freundlich zu beenden. Wenn jemand sich weiter ungebührlich verhält oder aggressiv wird, verlass das Gebiet. Stellt jemand eine Bedrohung dar, ist es vielleicht nötig, sich zurückzuziehen und das Dienstgerät vorübergehend zurückzulassen. In Notfällen such die Hilfe der örtlichen Behörden auf.",
          "Ausgeschlossene: Kommt ein Ausgeschlossener, der in die Versammlung zurückkehren möchte, kannst du ihm einfach die Seite „Versammlungen finden“ auf jw.org zeigen, damit er die ihm nächste Versammlung besuchen kann.",
          "Medien: Im Allgemeinen solltest du dem Angebot eines Medienvertreters auf ein persönliches Interview nicht zustimmen. Weise sie stattdessen auf die Bereiche „Nachrichten“ und „Über uns“ auf jw.org hin, wo sie Informationen über die Tätigkeit der Zeugen Jehovas erhalten können. Besteht der Medienvertreter auf seinem Ersuchen, kann man ihm anbieten, seine Kontaktdaten und eine kurze Beschreibung seiner Fragen zu hinterlassen, im Einklang mit dem Datenschutzgesetz. Teile danach sofort einem der Ältesten das Ersuchen des Medienvertreters mit."
        ]
      }
    ]
  }
};

// ----------------------------------------------------------------------------
// Языкозависимые хелперы
// ----------------------------------------------------------------------------
function getLang() {
  const l = (document.documentElement.lang || "ru").toLowerCase();
  if (l.indexOf("uk") === 0) return "uk";
  if (l.indexOf("de") === 0) return "de";
  return "ru";
}

function getGroup() {
  const l = getLang();
  if (l === "uk") return "UA";
  if (l === "de") return "DE";
  return "RU";
}

// Язык для обратного геокодирования (Nominatim accept-language)
function getAcceptLang() {
  return getLang(); // ru | uk | de
}

function safeGetLocalStorageJSON(key, fallback) {
  try {
    const val = localStorage.getItem(key);
    if (!val) return fallback;
    return JSON.parse(val) || fallback;
  } catch (e) {
    console.error('[Storage Error] Failed to parse localStorage key:', key, e);
    return fallback;
  }
}

// Перевод по ключу с подстановкой {placeholder}
function S(key, vars) {
  const table = I18N[getLang()] || I18N.ru;
  let str = table[key];
  if (str === undefined) str = I18N.ru[key];
  if (str === undefined) return key;
  if (vars && typeof str === "string") {
    for (const k in vars) {
      str = str.replace(new RegExp("\\{" + k + "\\}", "g"), vars[k]);
    }
  }
  return str;
}

// Локализованные подписи языков тележки (для карточек-пикеров RU/UA/DE)
const LANG_LABELS = {
  ru: { ru: "Русская", ua: "Украинская", de: "Немецкая" },
  uk: { ru: "Російська", ua: "Українська", de: "Німецька" },
  de: { ru: "Russisch", ua: "Ukrainisch", de: "Deutsch" }
};

function getTrolleyLabels() {
  return LANG_LABELS[getLang()] || LANG_LABELS.ru;
}
// Группа брони совпадает с текущей (для RU показываем и записи без группы — легаси)
function bookingMatchesGroup(b, g) {
  return b.group === g || (!b.group && g === "RU");
}

// ----------------------------------------------------------------------------
// Константы и состояние
// ----------------------------------------------------------------------------
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwV6YsBIC2XhuugMp_qTd2kHd55MP0ZJAJhXf93YiWqs66k90zeULNhooVXs03o2DaH/exec";
// Вы можете указать прямую постоянную ссылку на ваше приложение ниже, чтобы кнопка «Поделиться» отправляла именно её.
// Если оставить пустым "", ссылка будет определяться автоматически на основе текущего адреса страницы с очисткой preview-адресов.
const SHARE_APP_URL = "";

let selectedDateISO = "";
let justAddedSlot = null;
let previousActiveElement = null;
let selectedQBLang = "";
let databaseBookings = [];
let currentWeekOffset = 0;

// Auth state
let authUser = null;
const AUTH_KEY = "authUser";

function getAuthUser() {
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

function setAuthUser(user) {
  if (user) {
    localStorage.setItem(AUTH_KEY, JSON.stringify(user));
    window.currentUserRole = user.role;
  } else {
    localStorage.removeItem(AUTH_KEY);
    window.currentUserRole = null;
  }
  authUser = user;
  checkAuthGuard();
}

function updateAuthUI() {
  const logoutBtns = document.querySelectorAll("#btnLogout, #logoutBtn, .logout-btn");
  logoutBtns.forEach(function(btn) {
    btn.style.display = authUser ? "inline-flex" : "none";
  });

  if (typeof window.syncNotificationButtonState === 'function') {
    window.syncNotificationButtonState();
  }
}

function isAuthenticated() {
  return authUser !== null && authUser.email !== undefined;
}

function checkAuthGuard() {
  authUser = getAuthUser();
  window.currentUserRole = authUser ? authUser.role : null;
  updateAuthUI();

  const isAuth = isAuthenticated();
  const protectedElements = document.querySelectorAll(
    ".protected-content, #mainSchedule, .app-container, .tabs, .form-section, #yearGridRoot, #scheduleBoard, .board-container, #yearScheduleMessageContainer"
  );

  if (!isAuth) {
    protectedElements.forEach(function(el) {
      el.style.display = "none";
    });
    showAuthModal();
  } else {
    protectedElements.forEach(function(el) {
      el.style.display = "";
    });
  }

  return isAuth;
}
window.checkAuthGuard = checkAuthGuard;

function handleLogout() {
  setAuthUser(null);
  showToast(S("authLogoutSuccess"), "success");
}

function showAuthModal() {
  const modal = document.getElementById("authModal");
  if (modal) {
    modal.style.display = "flex";
    const emailInput = document.getElementById("authEmail");
    const errorEl = document.getElementById("authError");
    const submitBtn = document.getElementById("authSubmitBtn");
    if (emailInput) emailInput.value = "";
    const passwordInput = document.getElementById("authPassword");
    if (passwordInput) passwordInput.value = "";
    if (errorEl) errorEl.textContent = "";
    if (submitBtn) submitBtn.disabled = false;
    const spinner = document.getElementById("authSpinner");
    const btnText = document.getElementById("authBtnText");
    if (spinner) spinner.style.display = "none";
    if (btnText) {
      const currentLang = (document.documentElement.lang || (window.location.pathname.includes("_de") ? "de" : window.location.pathname.includes("_ua") ? "ua" : "ru")).toLowerCase();
      const defaultTexts = { ru: "Войти", de: "Anmelden", ua: "Увійти", uk: "Увійти" };
      btnText.textContent = defaultTexts[currentLang] || S("authSubmit") || "Войти";
    }
    if (emailInput) emailInput.focus();
  }
}

function hideAuthModal() {
  const modal = document.getElementById("authModal");
  if (modal) modal.style.display = "none";
}

async function handleAuthSubmit(event) {
  const currentLang = (document.documentElement.lang || (window.location.pathname.includes("_de") ? "de" : window.location.pathname.includes("_ua") ? "ua" : "ru")).toLowerCase();
  const loadingTexts = { ru: "Проверка...", de: "Wird geprüft...", ua: "Перевірка...", uk: "Перевірка..." };
  const submitTexts = { ru: "Войти", de: "Anmelden", ua: "Увійти", uk: "Увійти" };
  event.preventDefault();
  const emailInput = document.getElementById("authEmail");
  const passwordInput = document.getElementById("authPassword");
  const errorEl = document.getElementById("authError");
  const submitBtn = document.getElementById("authSubmitBtn");
  const spinner = document.getElementById("authSpinner");
  const btnText = document.getElementById("authBtnText");

  const email = emailInput ? emailInput.value.trim().toLowerCase() : "";
  const password = passwordInput ? passwordInput.value.trim() : "";
  
  if (!email) {
    if (errorEl) errorEl.textContent = S("authError");
    return;
  }

  if (submitBtn) submitBtn.disabled = true;
  if (spinner) spinner.style.display = "inline-block";
  if (btnText) btnText.textContent = loadingTexts[currentLang] || S("authLoading") || "Проверка...";
  if (errorEl) errorEl.textContent = "";

  const url = GOOGLE_SCRIPT_URL + "?action=checkAuth&email=" + encodeURIComponent(email) + "&password=" + encodeURIComponent(password) + "&key=jw_144000";

  const doFetch = async () => {
    const fetcher = (window.SyncCore && SyncCore.fetchWithRetry) ? SyncCore.fetchWithRetry : fetch;
    const response = await fetcher(url, { cache: "no-store" });
    if (!response.ok) throw new Error("HTTP_" + response.status);
    return response.json();
  };

  try {
    const data = await withRetry(doFetch, 3, [1000, 3000, 5000]);

    if (data.status === "success" && data.user) {
      setAuthUser(data.user);
      if (passwordInput) passwordInput.value = "";
      hideAuthModal();
      showToast(S("authWelcome", { name: data.user.name || data.user.email }), "success");
      hapticFeedback([50, 50, 50]); // Success login feedback
      if (typeof renderAllTabs === "function") renderAllTabs();
    } else {
      if (passwordInput) passwordInput.value = "";
      if (errorEl) errorEl.textContent = data.message || S("authError");
      hapticFeedback([30, 50, 30]); // Error/failure feedback
      if (submitBtn) submitBtn.disabled = false;
      if (spinner) spinner.style.display = "none";
      if (btnText) {
      const currentLang = (document.documentElement.lang || (window.location.pathname.includes("_de") ? "de" : window.location.pathname.includes("_ua") ? "ua" : "ru")).toLowerCase();
      const defaultTexts = { ru: "Войти", de: "Anmelden", ua: "Увійти", uk: "Увійти" };
      btnText.textContent = defaultTexts[currentLang] || S("authSubmit") || "Войти";
    }
    }
  } catch (err) {
    if (passwordInput) passwordInput.value = "";
    if (errorEl) errorEl.textContent = S("authNetworkError");
    hapticFeedback([30, 50, 30]); // Network error feedback
    if (submitBtn) submitBtn.disabled = false;
    if (spinner) spinner.style.display = "none";
    if (btnText) {
      const currentLang = (document.documentElement.lang || (window.location.pathname.includes("_de") ? "de" : window.location.pathname.includes("_ua") ? "ua" : "ru")).toLowerCase();
      const defaultTexts = { ru: "Войти", de: "Anmelden", ua: "Увійти", uk: "Увійти" };
      btnText.textContent = defaultTexts[currentLang] || S("authSubmit") || "Войти";
    }
  }
}

function withRetry(fn, maxAttempts, retryDelays) {
  maxAttempts = maxAttempts || 3;
  retryDelays = retryDelays || [1000, 3000, 5000];
  function attempt(n) {
    return fn().catch(function (err) {
      if (n < maxAttempts) {
        return new Promise(function (resolve) {
          setTimeout(function () { resolve(attempt(n + 1)); }, retryDelays[n - 1] || 5000);
        });
      }
      throw err;
    });
  }
  return attempt(1);
}

function requireAuth() {
  if (!isAuthenticated()) {
    showAuthModal();
    return false;
  }
  return true;
}

// Единый источник записей графика. app-sync.js (строгий режим IIFE) не может
// писать в глобальную `databaseBookings`, поэтому он хранит данные в
// window.AppState.bookings. Этот геттер читает ИМЕННО оттуда (с фолбэком на
// глобальную переменную и демо-данные) и нормализует дату к формату YYYY-MM-DD,
// чтобы фильтр по выбранному дню совпадал с датами с сервера на 100%.
function getBookings() {
  let src = null;
  try {
    if (window.AppState && Array.isArray(window.AppState.bookings) && window.AppState.bookings.length) {
      src = window.AppState.bookings;
    }
  } catch (e) {}
  if (!src || !src.length) src = databaseBookings;
  return (src || []).map(function (b) {
    let d = b.date;
    if (d && (d.indexOf(' ') > -1 || d.indexOf('T') > -1)) {
      const dt = new Date(d);
      if (!isNaN(dt.getTime())) {
        d = dt.getFullYear() + '-' +
            String(dt.getMonth() + 1).padStart(2, '0') + '-' +
            String(dt.getDate()).padStart(2, '0');
      }
    }
    return Object.assign({}, b, { date: d });
  });
}

const DEFAULT_TIMES = ["09:00 - 11:00", "11:00 - 13:00", "13:00 - 15:00", "15:00 - 17:00", "17:00 - 19:00"];
let timeslotsList = [];

let leafletMap = null;
let mapMarker = null;
let tempSelectedCoords = null;
let currentGeocodedAddress = "";
let mapMode = "view";

const DEFAULT_LOCATIONS = [
  { name: "Hauptbahnhof", lat: 50.8191, lng: 8.7752 },
  { name: "Erlenring", lat: 50.8115, lng: 8.7770 },
  { name: "Schloß", lat: 50.8090, lng: 8.7699 }
];

const state = {
  location: "Hauptbahnhof",
  time: ""
};

// Выбранные языки тележек во вкладке «Запись» (ru/ua/de или "")
let selectedCart1Lang = "";
let selectedCart2Lang = "";

function isValidScriptUrl(url) {
  return url && (url.startsWith("http://") || url.startsWith("https://"));
}

// ----------------------------------------------------------------------------
// PWA Installation logic
// ----------------------------------------------------------------------------
let deferredPrompt = null;

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  const installBtn = document.getElementById('pwaInstallBtn');
  if (installBtn) installBtn.style.display = 'inline-block';
  // Show header install button for Android/Chrome
  const headerInstallBtn = document.getElementById('btnHeaderInstall');
  if (headerInstallBtn) headerInstallBtn.style.display = 'inline-flex';
});

// On iOS and Android — show header install button if not already installed
window.addEventListener('DOMContentLoaded', () => {
  const ua = navigator.userAgent.toLowerCase();
  const isIOS = /ipad|iphone|ipod/.test(ua) && !window.MSStream;
  const isAndroid = /android/.test(ua);
  const isStandalone = window.navigator.standalone || window.matchMedia('(display-mode: standalone)').matches;
  if ((isIOS || isAndroid) && !isStandalone) {
    const headerInstallBtn = document.getElementById('btnHeaderInstall');
    if (headerInstallBtn) headerInstallBtn.style.display = 'inline-flex';
  }
}, { once: true });

function checkPWAInstallation() {
  const isStandalone = window.navigator.standalone || window.matchMedia('(display-mode: standalone)').matches;
  // Clear old permanent-dismiss flag — it was too aggressive
  if (localStorage.getItem('pwaInstallDismissed') === 'true') {
    localStorage.removeItem('pwaInstallDismissed');
  }
  // Dismiss expires after 7 days so users can re-install
  const dismissedAt = parseInt(localStorage.getItem('pwaInstallDismissedAt') || '0', 10);
  const isDismissed = dismissedAt > 0 && (Date.now() - dismissedAt < 7 * 24 * 60 * 60 * 1000);

  if (isStandalone || isDismissed) return;

  const banner = document.getElementById('pwaInstallBanner');
  const bodyText = document.getElementById('pwaBodyText');
  if (!banner || !bodyText) return;

  const userAgent = navigator.userAgent.toLowerCase();
  const isIOS = /ipad|iphone|ipod/.test(userAgent) && !window.MSStream;

  if (isIOS) {
    bodyText.innerHTML = S('pwaIos');
  } else if (deferredPrompt) {
    bodyText.textContent = S('pwaInstall');
    // Show "Install" button for Android
    const installBtn = document.getElementById('pwaInstallBtn');
    if (installBtn) installBtn.style.display = 'inline-block';
  } else {
    // Android: no prompt yet — show manual instructions
    bodyText.innerHTML = S('pwaAndroid');
  }

  banner.style.display = 'flex';
  setTimeout(() => {
    banner.classList.add('show');
  }, 100);
}

async function triggerPWAInstall() {
  if (!deferredPrompt) return;
  deferredPrompt.prompt();
  const { outcome } = await deferredPrompt.userChoice;
  deferredPrompt = null;
  dismissPWAInstall();
}

function dismissPWAInstall() {
  const banner = document.getElementById('pwaInstallBanner');
  if (!banner) return;
  banner.classList.remove('show');
  // Save timestamp so banner can reappear after 7 days
  localStorage.setItem('pwaInstallDismissedAt', String(Date.now()));
  setTimeout(() => {
    banner.style.display = 'none';
  }, 400);
}

// Programmatically show the PWA install banner (called from header button)
function showPWAInstallBanner() {
  // Clear dismissal so banner can show
  localStorage.removeItem('pwaInstallDismissedAt');
  localStorage.removeItem('pwaInstallDismissed');
  checkPWAInstallation();
}

// ----------------------------------------------------------------------------
// Инициализация приложения
// ----------------------------------------------------------------------------
window.addEventListener('DOMContentLoaded', () => {
  // Inject Stats button
  const headerRight = document.querySelector('.header-right');
  if (headerRight) {
    const statsBtn = document.createElement('button');
    statsBtn.type = 'button';
    statsBtn.className = 'btn-refresh';
    statsBtn.id = 'btnStats';
    statsBtn.style.marginLeft = '4px';
    
    const lang = (localStorage.getItem("preferredLanguage") || "ru").toLowerCase();
    let btnText = "📊 Статистика";
    if (lang === "de") btnText = "📊 Statistik";
    else if (lang === "uk" || lang === "ua") btnText = "📊 Статистика";
    
    statsBtn.innerHTML = btnText;
    statsBtn.onclick = function() {
      if (typeof showStatsModal === "function") showStatsModal();
    };
    headerRight.appendChild(statsBtn);
  }
  // Auth check: strict Auth Guard on init across all pages
  checkAuthGuard();

  // ----- PWA Service Worker & Auto-Update Handler -----
  let isRefreshing = false;

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!isRefreshing) {
        isRefreshing = true;
        window.location.reload();
      }
    });
  }

  function onUpdateClick(registration) {
    if (registration && registration.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
  }

  if ('serviceWorker' in navigator && window.location.protocol.startsWith('http')) {
    navigator.serviceWorker.register('sw.js', { scope: '/' })
      .then(reg => {
        function showUpdateToast() {
          if (document.getElementById('pwa-update-banner')) return;
          if (sessionStorage.getItem('pwa_update_dismissed')) return;

          const lang = (localStorage.getItem("preferredLanguage") || "ru").toLowerCase();
          let msg = "Доступно обновление!";
          let btnText = "Обновить";
          if (lang === "de") {
            msg = "Update verfügbar!";
            btnText = "Aktualisieren";
          } else if (lang === "ua" || lang === "uk") {
            msg = "Доступне оновлення!";
            btnText = "Оновити";
          }
          
          const banner = document.createElement('div');
          banner.id = 'pwa-update-banner';
          banner.style.cssText = `
            position: fixed;
            bottom: 24px;
            left: 50%;
            transform: translateX(-50%);
            background: #2563eb;
            color: #fff;
            padding: 12px 18px;
            border-radius: 12px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.25);
            z-index: 100000;
            display: flex;
            align-items: center;
            gap: 12px;
            font-family: system-ui, sans-serif;
            font-size: 0.9rem;
            font-weight: 600;
            animation: slideUpUpdate 0.3s ease-out forwards;
          `;
          
          const textSpan = document.createElement('span');
          textSpan.textContent = msg;
          
          const btn = document.createElement('button');
          btn.textContent = btnText;
          btn.style.cssText = `
            background: #fff;
            color: #2563eb;
            border: none;
            padding: 6px 12px;
            border-radius: 8px;
            font-weight: bold;
            cursor: pointer;
            font-size: 0.8rem;
            transition: opacity 0.2s;
          `;
          btn.addEventListener('click', () => {
            sessionStorage.setItem('pwa_update_dismissed', '1');
            if (banner.parentNode) banner.parentNode.removeChild(banner);
            onUpdateClick(reg);
          });
          
          banner.appendChild(textSpan);
          banner.appendChild(btn);
          document.body.appendChild(banner);
          
          if (!document.getElementById('pwa-update-style')) {
            const style = document.createElement('style');
            style.id = 'pwa-update-style';
            style.textContent = `
              @keyframes slideUpUpdate {
                from { transform: translate(-50%, 20px); opacity: 0; }
                to { transform: translate(-50%, 0); opacity: 1; }
              }
            `;
            document.head.appendChild(style);
          }
        }

        if (reg.waiting && navigator.serviceWorker.controller && !sessionStorage.getItem('pwa_update_dismissed')) {
          showUpdateToast();
        }

        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller && !sessionStorage.getItem('pwa_update_dismissed')) {
                showUpdateToast();
              }
            });
          }
        });

        // Initialize OneSignal ONLY after Service Worker is successfully active and ready
        navigator.serviceWorker.ready.then(() => {
          window.OneSignalDeferred = window.OneSignalDeferred || [];
          window.OneSignalDeferred.push(async function(OneSignal) {
            try {
              await OneSignal.init({
                appId: "817ea691-15bf-4e90-a20e-a710ed052184",
                serviceWorkerPath: "sw.js",
                serviceWorkerParam: { scope: "/" },
                serviceWorkerOverrideForCustomPage: true
              });
              window.oneSignalReady = true;
              if (typeof window.syncNotificationButtonState === 'function') {
                window.syncNotificationButtonState();
              }
            } catch (err) {
              console.warn('[OneSignal] Push init error (non-critical):', err);
            }
          });
        });
      })
      .catch(err => console.log('Service Worker Failed', err));
  }

  // Заполнить сохранённые имена
  const n1 = document.getElementById('name1');
  const n2 = document.getElementById('name2');
  const n3 = document.getElementById('name3');
  const n4 = document.getElementById('name4');
  if (n1) n1.value = localStorage.getItem('pwaName1') || '';
  if (n2) n2.value = localStorage.getItem('pwaName2') || '';
  if (n3) n3.value = localStorage.getItem('pwaName3') || '';
  if (n4) n4.value = localStorage.getItem('pwaName4') || '';

  generateWeekStrip();
  loadCustomLocations();
  renderTimeGrid();
  initCartLangPickers();
  initFontSizeMode();

  const btnTopAddLocation = document.getElementById('btnTopAddLocation');
  if (btnTopAddLocation) {
    btnTopAddLocation.querySelector('span').textContent = S('addLocationBtn');
  }

  // Примечание: запуск SyncCore.runAppLaunch() и startAutoSync() вынесен в
  // ensureAutoSyncStarts() ниже — он срабатывает гарантированно, даже если
  // DOMContentLoaded уже прошёл до загрузки app-sync.js. Здесь НЕ дублируем.
  const bookingFormEl = document.getElementById('bookingForm');
  if (bookingFormEl) {
    bookingFormEl.addEventListener('submit', handleFormSubmit);
  }

  const qbForm = document.getElementById('quickBookingForm');
  if (qbForm) {
    qbForm.addEventListener('submit', submitQuickBooking);
    
    // Auto-save draft of quick booking form as user types
    const name1Input = document.getElementById('qbName1');
    const name2Input = document.getElementById('qbName2');
    if (name1Input && name2Input) {
      const saveDraft = () => {
        if (!name1Input.disabled || !name2Input.disabled) {
          localStorage.setItem('qb_draft', JSON.stringify({
            name1: name1Input.value,
            name2: name2Input.value,
            lang: typeof selectedQBLang !== 'undefined' ? selectedQBLang : ''
          }));
        }
      };
      name1Input.addEventListener('input', saveDraft);
      name2Input.addEventListener('input', saveDraft);
    }
  }
  document.addEventListener('keydown', handleQuickBookingKeydown);

  // Проверить установку PWA через небольшой промежуток времени
  setTimeout(checkPWAInstallation, 1500);
});

// ----------------------------------------------------------------------------
// Запуск автосинхронизации ДО наступления DOMContentLoaded (на случай, если
// событие уже прошло — например, при мгновенном кэше SW или повторном вызове).
// Гарантирует, что календарь обновляется сам, даже если DOMContentLoaded
// сработал раньше, чем загрузился app-sync.js (где создаётся window.SyncCore).
// ----------------------------------------------------------------------------
(function ensureAutoSyncStarts() {
  function tryStart() {
    if (window.SyncCore) {
      if (!window.__appLaunchStarted) {
        window.__appLaunchStarted = true;
        SyncCore.runAppLaunch();
      }
      startAutoSync();
      return true;
    }
    return false;
  }
  if (!tryStart()) {
    // app-sync.js ещё не выполнился — ждём его появления (макс. ~3 сек).
    let waited = 0;
    const iv = setInterval(() => {
      waited += 50;
      if (tryStart() || waited >= 3000) {
        clearInterval(iv);
        // Если за 3 сек SyncCore так и не появился (например, ошибка загрузки
        // app-sync.js) — запускаем устаревший fallback для демо-режима.
        if (!window.SyncCore && typeof fetchDataFromSpreadsheet === 'function') {
          fetchDataFromSpreadsheet();
        }
      }
    }, 50);
  }
})();

// ----------------------------------------------------------------------------
// Неделя / даты
// ----------------------------------------------------------------------------
function switchWeek(weekType) {
  if (weekType === 'prev') {
    currentWeekOffset = -1;
  } else if (weekType === 'this') {
    currentWeekOffset = 0;
  } else if (weekType === 'next') {
    currentWeekOffset = 1;
  } else if (weekType === 'afterNext') {
    currentWeekOffset = 2;
  }
  
  const bPrev = document.getElementById('btnPrevWeek');
  const bThis = document.getElementById('btnThisWeek');
  const bNext = document.getElementById('btnNextWeek');
  const bAfter = document.getElementById('btnWeekAfterNext');
  
  if (bPrev) bPrev.classList.toggle('active', currentWeekOffset === -1);
  if (bThis) bThis.classList.toggle('active', currentWeekOffset === 0);
  if (bNext) bNext.classList.toggle('active', currentWeekOffset === 1);
  if (bAfter) bAfter.classList.toggle('active', currentWeekOffset === 2);
  
  generateWeekStrip();
}

function generateWeekStrip() {
  const scroller = document.getElementById('dateScroller');
  scroller.innerHTML = "";
  const daysNames = S('weekdayShort');

  const today = new Date();
  const todayMidnight = new Date(today);
  todayMidnight.setHours(0, 0, 0, 0);

  const currentDay = today.getDay();

  const daysToMonday = currentDay === 0 ? -6 : 1 - currentDay;
  const monday = new Date(today);
  monday.setDate(today.getDate() + daysToMonday + (currentWeekOffset * 7));

  let defaultSelectedDate = "";
  if (currentWeekOffset === 0) {
    defaultSelectedDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  } else if (currentWeekOffset === -1) {
    defaultSelectedDate = `${monday.getFullYear()}-${String(monday.getMonth() + 1).padStart(2, '0')}-${String(monday.getDate()).padStart(2, '0')}`;
  } else {
    const nextMonday = new Date(monday);
    defaultSelectedDate = `${nextMonday.getFullYear()}-${String(nextMonday.getMonth() + 1).padStart(2, '0')}-${String(nextMonday.getDate()).padStart(2, '0')}`;
  }

  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  for (let i = 0; i < 7; i++) {
    const current = new Date(monday);
    current.setDate(monday.getDate() + i);

    const year = current.getFullYear();
    const month = String(current.getMonth() + 1).padStart(2, '0');
    const day = String(current.getDate()).padStart(2, '0');
    const isoString = `${year}-${month}-${day}`;

    const dayOfWeek = daysNames[current.getDay()];
    const dayOfMonth = current.getDate();

    const currentMidnight = new Date(current);
    currentMidnight.setHours(0, 0, 0, 0);
    const isPast = currentMidnight < todayMidnight;
    const diffDaysPast = Math.round((todayMidnight - currentMidnight) / 86400000);
    const isPastAllowed = true;
    const isTooOld = false; // Разрешаем просмотр всей истории

    const isToday = (isoString === todayStr);
    const card = document.createElement('div');
    const isActive = (isoString === defaultSelectedDate);

    card.className = `date-card ${isActive ? 'active' : ''} ${isToday ? 'is-today' : ''} ${isPast ? 'past-day' : ''} ${isTooOld ? 'past-disabled' : ''}`;
    card.dataset.date = isoString;

    if (!isTooOld) {
      card.onclick = () => selectDate(isoString);
    }

    card.innerHTML = `
      <span class="day-name">${dayOfWeek}</span>
      <span class="day-num">${dayOfMonth}</span>
      ${isToday ? '<span class="today-dot"></span>' : ''}
    `;

    scroller.appendChild(card);
  }
  selectDate(defaultSelectedDate);
}

function selectDate(dateISO) {
  document.querySelectorAll('.date-scroller .date-card').forEach(card => {
    card.classList.toggle('active', card.dataset.date === dateISO);
  });
  selectedDateISO = dateISO;

  renderScheduleBoard();
  onLocationOrDateChange();
  if (typeof updateScheduleWeatherWidget === 'function') {
    updateScheduleWeatherWidget(dateISO);
  }

  if (typeof window.syncNotificationButtonState === 'function') {
    window.syncNotificationButtonState();
  }
}

// ----------------------------------------------------------------------------
// API И КЭШИРОВАНИЕ ПОГОДЫ ДЛЯ МАРБУРГА (Open-Meteo API + 3h localStorage cache)
// ----------------------------------------------------------------------------
const MARBURG_WEATHER_CACHE_KEY = 'marburg_weather_cache';
const MARBURG_WEATHER_CACHE_TTL = 3 * 60 * 60 * 1000; // 3 часа в мс

function getCurrentAppLang() {
  if (window.AppState && AppState.language) {
    const l = String(AppState.language).toLowerCase();
    if (l === 'uk' || l === 'ua') return 'ua';
    if (l === 'de') return 'de';
    if (l === 'ru') return 'ru';
  }
  if (typeof getLang === 'function') {
    const l = getLang();
    if (l === 'uk' || l === 'ua') return 'ua';
    if (l === 'de') return 'de';
    return 'ru';
  }
  const docLang = (document.documentElement.lang || 'ru').toLowerCase();
  if (docLang.indexOf('uk') === 0 || docLang.indexOf('ua') === 0) return 'ua';
  if (docLang.indexOf('de') === 0) return 'de';
  return 'ru';
}

const WEATHER_CODE_MAP = {
  0:  { ru: '☀️ Ясно', de: '☀️ Sonnig', ua: '☀️ Ясно', uk: '☀️ Ясно' },
  1:  { ru: '🌤️ Облачно', de: '🌤️ Bewölkt', ua: '🌤️ Хмарно', uk: '🌤️ Хмарно' },
  2:  { ru: '🌤️ Облачно', de: '🌤️ Bewölkt', ua: '🌤️ Хмарно', uk: '🌤️ Хмарно' },
  3:  { ru: '🌤️ Облачно', de: '🌤️ Bewölkt', ua: '🌤️ Хмарно', uk: '🌤️ Хмарно' },
  45: { ru: '🌫️ Туман', de: '🌫️ Nebel', ua: '🌫️ Туман', uk: '🌫️ Туман' },
  48: { ru: '🌫️ Туман', de: '🌫️ Nebel', ua: '🌫️ Туман', uk: '🌫️ Туман' },
  51: { ru: '🌧️ Дождь', de: '🌧️ Regen', ua: '🌧️ Дощ', uk: '🌧️ Дощ' },
  53: { ru: '🌧️ Дождь', de: '🌧️ Regen', ua: '🌧️ Дощ', uk: '🌧️ Дощ' },
  55: { ru: '🌧️ Дождь', de: '🌧️ Regen', ua: '🌧️ Дощ', uk: '🌧️ Дощ' },
  56: { ru: '🌧️ Дождь', de: '🌧️ Regen', ua: '🌧️ Дощ', uk: '🌧️ Дощ' },
  57: { ru: '🌧️ Дождь', de: '🌧️ Regen', ua: '🌧️ Дощ', uk: '🌧️ Дощ' },
  61: { ru: '🌧️ Дождь', de: '🌧️ Regen', ua: '🌧️ Дощ', uk: '🌧️ Дощ' },
  63: { ru: '🌧️ Дождь', de: '🌧️ Regen', ua: '🌧️ Дощ', uk: '🌧️ Дощ' },
  65: { ru: '🌧️ Дождь', de: '🌧️ Regen', ua: '🌧️ Дощ', uk: '🌧️ Дощ' },
  66: { ru: '🌧️ Дождь', de: '🌧️ Regen', ua: '🌧️ Дощ', uk: '🌧️ Дощ' },
  67: { ru: '🌧️ Дождь', de: '🌧️ Regen', ua: '🌧️ Дощ', uk: '🌧️ Дощ' },
  71: { ru: '❄️ Снег', de: '❄️ Schnee', ua: '❄️ Сніг', uk: '❄️ Сніг' },
  73: { ru: '❄️ Снег', de: '❄️ Schnee', ua: '❄️ Сніг', uk: '❄️ Сніг' },
  75: { ru: '❄️ Снег', de: '❄️ Schnee', ua: '❄️ Сніг', uk: '❄️ Сніг' },
  77: { ru: '❄️ Снег', de: '❄️ Schnee', ua: '❄️ Сніг', uk: '❄️ Сніг' },
  80: { ru: '🌧️ Дождь', de: '🌧️ Regen', ua: '🌧️ Дощ', uk: '🌧️ Дощ' },
  81: { ru: '🌧️ Дождь', de: '🌧️ Regen', ua: '🌧️ Дощ', uk: '🌧️ Дощ' },
  82: { ru: '🌧️ Дождь', de: '🌧️ Regen', ua: '🌧️ Дощ', uk: '🌧️ Дощ' },
  85: { ru: '❄️ Снег', de: '❄️ Schnee', ua: '❄️ Сніг', uk: '❄️ Сніг' },
  86: { ru: '❄️ Снег', de: '❄️ Schnee', ua: '❄️ Сніг', uk: '❄️ Сніг' },
  95: { ru: '🌩️ Гроза', de: '🌩️ Gewitter', ua: '🌩️ Гроза', uk: '🌩️ Гроза' },
  96: { ru: '🌩️ Гроза', de: '🌩️ Gewitter', ua: '🌩️ Гроза', uk: '🌩️ Гроза' },
  99: { ru: '🌩️ Гроза', de: '🌩️ Gewitter', ua: '🌩️ Гроза', uk: '🌩️ Гроза' }
};

function getWeatherDescription(code, lang) {
  const l = (lang || getCurrentAppLang()).toLowerCase();
  const entry = WEATHER_CODE_MAP[code] || { ru: '🌤️ Погода', de: '🌤️ Wetter', ua: '🌤️ Погода', uk: '🌤️ Погода' };
  return entry[l] || entry.ua || entry.uk || entry.ru;
}

async function fetchMarburgWeatherData() {
  try {
    const rawCache = localStorage.getItem(MARBURG_WEATHER_CACHE_KEY);
    if (rawCache) {
      const cache = JSON.parse(rawCache);
      if (cache && cache.timestamp && (Date.now() - cache.timestamp < MARBURG_WEATHER_CACHE_TTL) && cache.data) {
        return cache.data;
      }
    }
  } catch (e) {
    console.warn('[Weather Cache Read Error]', e);
  }

  const url = 'https://api.open-meteo.com/v1/forecast?latitude=50.8108&longitude=8.7711&daily=weathercode,temperature_2m_max,temperature_2m_min&timezone=Europe%2FBerlin';
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Weather API HTTP error ' + response.status);
  }
  const data = await response.json();
  try {
    localStorage.setItem(MARBURG_WEATHER_CACHE_KEY, JSON.stringify({
      timestamp: Date.now(),
      data: data
    }));
  } catch (e) {
    console.warn('[Weather Cache Write Error]', e);
  }
  return data;
}

async function getMarburgWeatherForDate(isoDate) {
  try {
    const data = await fetchMarburgWeatherData();
    if (!data || !data.daily || !Array.isArray(data.daily.time)) return null;
    const idx = data.daily.time.indexOf(isoDate);
    if (idx === -1) return null;
    return {
      maxTemp: Math.round(data.daily.temperature_2m_max[idx]),
      minTemp: Math.round(data.daily.temperature_2m_min[idx]),
      weathercode: data.daily.weathercode[idx]
    };
  } catch (err) {
    console.warn('[Weather Fetch Error]', err);
    return null;
  }
}

async function updateScheduleWeatherWidget(isoDate) {
  let widget = document.getElementById('scheduleWeatherWidget');
  if (!widget) {
    const scheduleTab = document.getElementById('scheduleTabContent');
    if (!scheduleTab) return;
    const refreshRow = scheduleTab.querySelector('.refresh-row');
    widget = document.createElement('div');
    widget.id = 'scheduleWeatherWidget';
    widget.className = 'schedule-weather-widget';
    if (refreshRow) {
      refreshRow.after(widget);
    } else {
      scheduleTab.prepend(widget);
    }
  }

  const targetISO = isoDate || selectedDateISO || new Date().toISOString().slice(0, 10);
  const lang = getCurrentAppLang();

  const todayObj = new Date();
  todayObj.setHours(0, 0, 0, 0);
  const targetObj = new Date(targetISO + 'T00:00:00');
  const diffDays = Math.round((targetObj - todayObj) / 86400000);

  const outOfRangeMsg = {
    ru: '🌡️ Прогноз погоды доступен на ближайшие 7 дней',
    de: '🌡️ Wettervorhersage für die nächsten 7 Tage verfügbar',
    ua: '🌡️ Прогноз погоди доступний на найближчі 7 днів',
    uk: '🌡️ Прогноз погоди доступний на найближчі 7 днів'
  };

  const cityLabels = {
    ru: '🌡️ Марбург',
    de: '🌡️ Marburg',
    ua: '🌡️ Марбург',
    uk: '🌡️ Марбург'
  };

  if (diffDays < 0 || diffDays > 7) {
    const msg = outOfRangeMsg[lang] || outOfRangeMsg.ru;
    widget.innerHTML = `<div class="weather-card weather-card-out-of-range"><span>${msg}</span></div>`;
    return;
  }

  try {
    const weatherInfo = await getMarburgWeatherForDate(targetISO);
    if (!weatherInfo) {
      const msg = outOfRangeMsg[lang] || outOfRangeMsg.ru;
      widget.innerHTML = `<div class="weather-card weather-card-out-of-range"><span>${msg}</span></div>`;
      return;
    }

    const maxTemp = weatherInfo.maxTemp;
    const minTemp = weatherInfo.minTemp;
    const maxStr = (maxTemp >= 0 ? '+' : '') + maxTemp + '°C';
    const minStr = (minTemp >= 0 ? '+' : '') + minTemp + '°C';
    const desc = getWeatherDescription(weatherInfo.weathercode, lang);
    const city = cityLabels[lang] || cityLabels.ru;

    widget.innerHTML = `
      <div class="weather-card">
        <span class="weather-city-temp">${city}: ${maxStr} / ${minStr}</span>
        <span class="weather-desc">${desc}</span>
      </div>
    `;
  } catch (err) {
    console.warn('[Weather Widget Render Error]', err);
    const msg = outOfRangeMsg[lang] || outOfRangeMsg.ru;
    widget.innerHTML = `<div class="weather-card weather-card-out-of-range"><span>${msg}</span></div>`;
  }
}

window.getMarburgWeatherForDate = getMarburgWeatherForDate;
window.updateScheduleWeatherWidget = updateScheduleWeatherWidget;

// Переход к произвольной дате (например, по клику из годового календаря):
// прокручивает ленту недель к нужной неделе, подсвечивает день и открывает «График».
function goToDate(dateISO) {
  if (!dateISO) return;
  // Неделя, содержащая выбранную дату (понедельник = начало).
  const target = new Date(dateISO + "T00:00:00");
  if (isNaN(target.getTime())) return;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const mondayThis = new Date(today);
  const cur = today.getDay();
  mondayThis.setDate(today.getDate() + (cur === 0 ? -6 : 1 - cur));
  const mondayTarget = new Date(target);
  const tc = target.getDay();
  mondayTarget.setDate(target.getDate() + (tc === 0 ? -6 : 1 - tc));

  const diffDays = Math.round((mondayTarget - mondayThis) / 86400000);
  const weekOffset = Math.floor(diffDays / 7);

  currentWeekOffset = weekOffset;
  const pb = document.getElementById('btnPrevWeek');
  const wb = document.getElementById('btnThisWeek');
  const nb = document.getElementById('btnNextWeek');
  const ab = document.getElementById('btnWeekAfterNext');
  if (pb) pb.classList.toggle('active', weekOffset === -1);
  if (wb) wb.classList.toggle('active', weekOffset === 0);
  if (nb) nb.classList.toggle('active', weekOffset === 1);
  if (ab) ab.classList.toggle('active', weekOffset === 2);

  // Перерисовываем ленту с нужной неделей и выбираем дату
  generateWeekStripFor(weekOffset, dateISO);

  switchTab('schedule');
}

// Генерация ленты недель с явным смещением и выбранной датой (для перехода из «Года»).
function generateWeekStripFor(weekOffset, preselectDate) {
  currentWeekOffset = weekOffset;
  const scroller = document.getElementById('dateScroller');
  if (!scroller) { selectedDateISO = preselectDate; return; }
  scroller.innerHTML = "";
  const daysNames = S('weekdayShort');

  const today = new Date();
  const todayMidnight = new Date(today);
  todayMidnight.setHours(0, 0, 0, 0);

  const currentDay = today.getDay();
  const daysToMonday = currentDay === 0 ? -6 : 1 - currentDay;
  const monday = new Date(today);
  monday.setDate(today.getDate() + daysToMonday + (weekOffset * 7));

  for (let i = 0; i < 7; i++) {
    const current = new Date(monday);
    current.setDate(monday.getDate() + i);

    const year = current.getFullYear();
    const month = String(current.getMonth() + 1).padStart(2, '0');
    const day = String(current.getDate()).padStart(2, '0');
    const isoString = `${year}-${month}-${day}`;

    const dayOfWeek = daysNames[current.getDay()];
    const dayOfMonth = current.getDate();

    const currentMidnight = new Date(current);
    currentMidnight.setHours(0, 0, 0, 0);
    const isPast = currentMidnight < todayMidnight;
    const diffDaysPast = Math.round((todayMidnight - currentMidnight) / 86400000);
    const isPastAllowed = true;
    const isTooOld = false; // Разрешаем просмотр всей истории

    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    const isToday = (isoString === todayStr);
    const card = document.createElement('div');
    const isActive = (isoString === preselectDate);

    card.className = `date-card ${isActive ? 'active' : ''} ${isToday ? 'is-today' : ''} ${isPast ? 'past-day' : ''}`;
    card.dataset.date = isoString;

    if (!isTooOld) {
      card.onclick = () => selectDate(isoString);
    }

    card.innerHTML = `
      <span class="day-name">${dayOfWeek}</span>
      <span class="day-num">${dayOfMonth}</span>
      ${isToday ? '<span class="today-dot"></span>' : ''}
    `;

    scroller.appendChild(card);
  }
  selectDate(preselectDate);
}

function switchTab(tabId) {
  if (!checkAuthGuard()) return;
  hapticFeedback(20); // Tab switch feedback
  if (tabId !== 'year') tabId = 'schedule';
  const tabs = ['schedule', 'year'];
  tabs.forEach(t => {
    const btn = document.getElementById('btnTab' + t.charAt(0).toUpperCase() + t.slice(1));
    const content = document.getElementById(t + 'TabContent');
    if (btn) btn.classList.toggle('active', tabId === t);
    if (content) content.classList.toggle('active', tabId === t);
  });
  const dateBlock = document.getElementById('dateSelectBlock');
  if (dateBlock) dateBlock.style.display = (tabId === 'schedule') ? '' : 'none';
  if (tabId === 'schedule') renderScheduleTab();
  if (tabId === 'year' && window.SyncCore) SyncCore.renderYearGrid();

  if (typeof window.syncNotificationButtonState === 'function') {
    window.syncNotificationButtonState();
  }
}

// Канонические имена для единого менеджера состояния (app-sync.js -> renderAllTabs).
// Перерисовывают вкладки строго из window.AppState, без обращения к сети.
function renderBookingTab() { onLocationOrDateChange(); }
function renderScheduleTab() { renderScheduleBoard(); }

function shareApp() {
  let shareUrl = SHARE_APP_URL;
  if (!shareUrl) {
    shareUrl = window.location.origin + window.location.pathname;
    
    // Если это preview-ссылка Vercel (например, project-git-branch.vercel.app),
    // пробуем очистить её до главного продакшн-домена (например, project.vercel.app)
    if (window.location.hostname.endsWith('.vercel.app')) {
      const parts = window.location.hostname.split('.');
      const sub = parts[0];
      const gitIdx = sub.indexOf('-git-');
      if (gitIdx !== -1) {
        shareUrl = 'https://' + sub.substring(0, gitIdx) + '.vercel.app' + window.location.pathname;
      } else {
        const lastDash = sub.lastIndexOf('-');
        if (lastDash !== -1 && sub.substring(lastDash + 1).length >= 8) {
          shareUrl = 'https://' + sub.substring(0, lastDash) + '.vercel.app' + window.location.pathname;
        }
      }
    }
  }

  const shareData = {
    title: S('shareTitle'),
    text: S('shareText'),
    url: shareUrl
  };

  if (navigator.share) {
    navigator.share(shareData)
      .catch(err => {
        console.log('Error sharing:', err);
      });
  } else {
    navigator.clipboard.writeText(shareUrl).then(() => {
      showToast(S('shareCopied'), 'success');
    }).catch(err => {
      showToast(S('shareCopyFail'), 'error');
    });
  }
}

// ----------------------------------------------------------------------------
// Локации (места служения)
// ----------------------------------------------------------------------------
function loadCustomLocations() {
  let savedLocations = safeGetLocalStorageJSON('customLocations', null);

  const hasMarktplatz = savedLocations && savedLocations.some(loc => {
    const name = typeof loc === 'string' ? loc : loc.name;
    return name === "Marktplatz";
  });
  const hasSchloss = savedLocations && savedLocations.some(loc => {
    const name = typeof loc === 'string' ? loc : loc.name;
    return name === "Schloß";
  });

  if (!savedLocations || savedLocations.length === 0 || hasMarktplatz || !hasSchloss) {
    let userAdded = [];
    if (savedLocations) {
      userAdded = savedLocations.filter(loc => {
        const name = typeof loc === 'string' ? loc : loc.name;
        return name !== "Marktplatz" && name !== "Hauptbahnhof" && name !== "Erlenring" && name !== "Schloß";
      });
    }
    savedLocations = [...DEFAULT_LOCATIONS, ...userAdded];
    localStorage.setItem('customLocations', JSON.stringify(savedLocations));
  }

  document.querySelectorAll('.location-card').forEach(el => el.remove());

  savedLocations.forEach(loc => {
    const locName = typeof loc === 'string' ? loc : loc.name;
    insertLocationCardUI(locName);
  });

  const radios = document.querySelectorAll('input[name="location"]');
  if (radios.length > 0) {
    let selectedRadio = Array.from(radios).find(r => r.value === state.location);
    if (!selectedRadio) selectedRadio = radios[0];
    selectedRadio.checked = true;
    state.location = selectedRadio.value;
    toggleNoLocationsPlaceholder(false);
  } else {
    toggleNoLocationsPlaceholder(true);
  }
}

window.updateLocationsFromBookings = function() {
  let bookings = [];
  try {
    bookings = getBookings();
  } catch (e) {
    console.error(e);
  }
  
  let bookingLocations = [];
  bookings.forEach(function (b) {
    if (b.location && b.location.trim()) {
      let name = b.location.trim();
      if (bookingLocations.indexOf(name) === -1) {
        bookingLocations.push(name);
      }
    }
  });
  
  let savedLocations = safeGetLocalStorageJSON('customLocations', []);
  
  function getLocName(loc) {
    return (typeof loc === 'string') ? loc : (loc && loc.name ? loc.name : '');
  }
  
  let defaultNames = ["Hauptbahnhof", "Erlenring", "Schloß"];
  let changed = false;
  
  let merged = [];
  
  DEFAULT_LOCATIONS.forEach(function (dl) {
    merged.push(dl);
  });
  
  savedLocations.forEach(function (loc) {
    let name = getLocName(loc);
    if (name && defaultNames.indexOf(name) === -1) {
      let exists = merged.some(function (m) { return getLocName(m) === name; });
      if (!exists) {
        merged.push(loc);
      }
    }
  });
  
  bookingLocations.forEach(function (name) {
    if (defaultNames.indexOf(name) === -1) {
      let exists = merged.some(function (m) { return getLocName(m) === name; });
      if (!exists) {
        merged.push({ name: name, lat: null, lng: null });
        changed = true;
      }
    }
  });
  
  if (changed) {
    localStorage.setItem('customLocations', JSON.stringify(merged));
    if (typeof loadCustomLocations === 'function') {
      loadCustomLocations();
    }
  }
};

function toggleNoLocationsPlaceholder(show) {
  let placeholder = document.getElementById('noLocationsPlaceholder');
  if (show) {
    if (!placeholder) {
      placeholder = document.createElement('div');
      placeholder.id = 'noLocationsPlaceholder';
      placeholder.style.cssText = "padding: 24px; text-align: center; color: var(--text-muted); font-size: 0.85rem; border: 1px dashed var(--border); border-radius: var(--radius-md); margin-bottom: 8px;";
      placeholder.innerHTML = S('noLocationsPlaceholder');
      // Insert into scheduleBoard (locationGrid is a legacy element no longer in HTML)
      const board = document.getElementById('scheduleBoard');
      if (board) board.prepend(placeholder);
    }
    toggleFormState(true);
  } else {
    if (placeholder) placeholder.remove();
    toggleFormState(false);
  }
}

// ----------------------------------------------------------------------------
// Сетка времени
// ----------------------------------------------------------------------------
function renderTimeGrid() {
  const grid = document.getElementById('timeGrid');
  // timeGrid is a legacy element — in the current UI, time slots
  // are rendered inside the schedule board per-location.
  // Still update timeslotsList so the board can use DEFAULT_TIMES.
  const savedCustomTimes = safeGetLocalStorageJSON('customTimes', []);
  timeslotsList = [...DEFAULT_TIMES, ...savedCustomTimes];
  if (!grid) {
    onLocationOrDateChange();
    return;
  }
  grid.innerHTML = "";


  timeslotsList.forEach((time, index) => {
    const isCustom = !DEFAULT_TIMES.includes(time);

    const label = document.createElement('label');
    label.className = 'time-card';
    label.id = `slot_${index}`;

    const input = document.createElement('input');
    input.type = 'radio';
    input.name = 'time';
    input.value = time;
    if (index === 0) input.checked = true;
    input.onchange = onTimeChange;

    const labelSpan = document.createElement('span');
    labelSpan.className = 'time-label';
    labelSpan.textContent = time;

    const statusSpan = document.createElement('span');
    statusSpan.className = 'time-status';
    statusSpan.id = `status_${index}`;
    statusSpan.textContent = S('statusAvailable');

    label.appendChild(input);
    label.appendChild(labelSpan);
    label.appendChild(statusSpan);

    if (isCustom) {
      const deleteBtn = document.createElement('button');
      deleteBtn.type = 'button';
      deleteBtn.className = 'btn-delete-location';
      deleteBtn.style.right = '6px';
      deleteBtn.innerHTML = '✖';
      deleteBtn.title = S('delTimeTitle');
      deleteBtn.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        removeCustomTime(time);
      };
      label.appendChild(deleteBtn);
      label.style.paddingRight = '28px';
    }

    grid.appendChild(label);
  });

  const addBtn = document.createElement('button');
  addBtn.type = 'button';
  addBtn.className = 'btn-add-location';
  addBtn.id = 'addTimeBtn';
  addBtn.onclick = showAddTimeForm;
  addBtn.innerHTML = '<span>' + S('addTimeBtn') + '</span>';
  grid.appendChild(addBtn);

  const formDiv = document.createElement('div');
  formDiv.className = 'add-location-form';
  formDiv.id = 'addTimeForm';
  formDiv.style.gridColumn = 'span 2';
  formDiv.style.display = 'none';
  formDiv.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 6px; width: 100%;">
      <div style="display: flex; gap: 6px; align-items: center; justify-content: space-between;">
        <span style="font-size: 0.75rem; font-weight: 600; color: var(--text-muted);">${S('timeStart')}</span>
        <input type="time" id="customStartTime" class="add-location-input" style="padding: 4px 6px;">
        <span style="font-size: 0.75rem; font-weight: 600; color: var(--text-muted);">${S('timeEnd')}</span>
        <input type="time" id="customEndTime" class="add-location-input" style="padding: 4px 6px;">
        <button type="button" class="btn-add-confirm" onclick="addNewTime()">ОК</button>
        <button type="button" class="btn-add-cancel" onclick="hideAddTimeForm()">✖</button>
      </div>
    </div>
  `;
  grid.appendChild(formDiv);

  onLocationOrDateChange();
}

function showAddTimeForm() {
  const f = document.getElementById('addTimeForm');
  if (f) { f.style.display = 'block'; }
  const s = document.getElementById('customStartTime');
  if (s) s.focus();
}

function hideAddTimeForm() {
  const f = document.getElementById('addTimeForm');
  if (f) f.style.display = 'none';
  const s = document.getElementById('customStartTime');
  if (s) s.value = '';
  const e = document.getElementById('customEndTime');
  if (e) e.value = '';
}

function addNewTime() {
  const startInput = document.getElementById('customStartTime');
  const endInput = document.getElementById('customEndTime');

  const startVal = startInput.value;
  const endVal = endInput.value;

  if (!startVal || !endVal) {
    showToast(S('enterStartEnd'), "error");
    return;
  }

  const timeFormatted = `${startVal} - ${endVal}`;

  if (timeslotsList.includes(timeFormatted)) {
    showToast(S('timeExists', { time: timeFormatted }), "error");
    hideAddTimeForm();
    return;
  }

  let savedCustomTimes = safeGetLocalStorageJSON('customTimes', []);
  savedCustomTimes.push(timeFormatted);
  savedCustomTimes.sort();

  localStorage.setItem('customTimes', JSON.stringify(savedCustomTimes));

  showToast(S('timeAdded', { time: timeFormatted }), "success");
  hideAddTimeForm();
  renderTimeGrid();
  renderScheduleBoard();
}

function removeCustomTime(time) {
  let savedCustomTimes = safeGetLocalStorageJSON('customTimes', []);
  savedCustomTimes = savedCustomTimes.filter(t => t !== time);
  localStorage.setItem('customTimes', JSON.stringify(savedCustomTimes));

  showToast(S('timeRemoved', { time: time }), "success");
  renderTimeGrid();
  renderScheduleBoard();
}

function toggleFormState(disabled) {
  document.querySelectorAll('#timeGrid .time-card').forEach(card => {
    card.classList.toggle('disabled', disabled);
    const input = card.querySelector('input');
    if (input) {
      input.disabled = disabled;
      if (disabled) input.checked = false;
    }
    const status = card.querySelector('.time-status');
    if (status) status.textContent = disabled ? S('selectLocation') : S('statusAvailable');
  });

  ['name1', 'name2', 'name3', 'name4', 'submitBtn'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.disabled = disabled;
  });
}

// ----------------------------------------------------------------------------
// Добавление / удаление локаций
// ----------------------------------------------------------------------------
function showAddLocationForm() {
  document.body.style.overflow = 'hidden';

  const modal = document.getElementById('addLocationForm');
  if (modal) {
    modal.style.display = 'flex';
    
    const titleEl = document.getElementById('addLocModalTitle');
    const labelEl = document.getElementById('addLocNameLabel');
    const inputEl = document.getElementById('customLocationInput');
    const mapBtnTextEl = document.getElementById('addLocMapBtnText');
    
    if (titleEl) titleEl.textContent = S('addLocationTitle');
    if (labelEl) labelEl.textContent = S('addLocationName');
    if (inputEl) {
      inputEl.placeholder = S('addLocationName');
      inputEl.focus();
    }
    if (mapBtnTextEl) mapBtnTextEl.textContent = S('addLocationMarkMap');
  }

  tempSelectedCoords = null;
  currentGeocodedAddress = "";
  const coordsLabel = document.getElementById('tempCoordsLabel');
  if (coordsLabel) {
    coordsLabel.textContent = S('coordsNotSelected');
    coordsLabel.style.color = "var(--text-muted)";
  }
}

function hideAddLocationForm() {
  document.body.style.overflow = '';

  const modal = document.getElementById('addLocationForm');
  if (modal) {
    modal.style.display = 'none';
  }
  const inputEl = document.getElementById('customLocationInput');
  if (inputEl) inputEl.value = '';
  
  tempSelectedCoords = null;
  currentGeocodedAddress = "";
}

function onAddLocationModalBackdropClick(e) {
  if (e.target.id === 'addLocationForm') {
    hideAddLocationForm();
  }
}

function addNewLocation() {
  const input = document.getElementById('customLocationInput');
  const value = input.value.trim();

  if (!value) {
    showToast(S('enterLocationName'), "error");
    return;
  }

  addNewLocationWithCoords(value, tempSelectedCoords);
}

function addNewLocationWithCoords(name, coords) {
  let isDuplicate = false;
  let savedLocations = safeGetLocalStorageJSON('customLocations', []);
  isDuplicate = savedLocations.some(loc => {
    const n = typeof loc === 'string' ? loc : loc.name;
    return n.toLowerCase() === name.toLowerCase();
  });

  if (isDuplicate) {
    state.location = name;
    onLocationOrDateChange();
    showToast(S('existingLocation', { name: name }), "success");
    hideAddLocationForm();
    
    scrollToLocationCard(name);
    return;
  }

  const newLoc = {
    name: name,
    lat: coords ? coords.lat : null,
    lng: coords ? coords.lng : null
  };

  savedLocations.push(newLoc);
  localStorage.setItem('customLocations', JSON.stringify(savedLocations));

  showToast(S('locationAdded', { name: name }), "success");
  hideAddLocationForm();
  loadCustomLocations();

  state.location = name;
  onLocationOrDateChange();
  renderScheduleBoard();

  scrollToLocationCard(name);
}

function scrollToLocationCard(name) {
  setTimeout(() => {
    const cardId = 'board-card-' + name.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9а-яА-ЯёЁіІїЇєЄґҐ-]/g, '');
    const cardEl = document.getElementById(cardId);
    if (cardEl) {
      cardEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      cardEl.classList.add('location-highlight');
      setTimeout(() => {
        cardEl.classList.remove('location-highlight');
      }, 2000);
    }
  }, 100);
}

function insertLocationCardUI(locName) {
  const grid = document.getElementById('locationGrid');
  const btnAdd = document.getElementById('btnAddLocationBtn');

  // locationGrid is a legacy element — if missing, locations are rendered
  // directly by renderScheduleBoard() so no extra insertion is needed here.
  if (!grid || !btnAdd) return;

  const label = document.createElement('label');
  label.className = 'location-card';

  const input = document.createElement('input');
  input.type = 'radio';
  input.name = 'location';
  input.value = locName;
  input.onchange = (e) => {
    state.location = e.target.value;
    onLocationOrDateChange();
  };

  const nameSpan = document.createElement('span');
  nameSpan.className = 'location-name';
  nameSpan.textContent = locName;

  const deleteBtn = document.createElement('button');
  deleteBtn.type = 'button';
  deleteBtn.className = 'btn-delete-location';
  deleteBtn.innerHTML = '✖';
  deleteBtn.title = S('delLocationTitle');
  deleteBtn.onclick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    removeCustomLocation(locName);
  };

  label.appendChild(input);
  label.appendChild(nameSpan);

  const isDefault = DEFAULT_LOCATIONS.some(l => l.name === locName);
  if (!isDefault) {
    label.appendChild(deleteBtn);
  } else {
    label.style.paddingRight = '8px';
  }

  grid.insertBefore(label, btnAdd);
}

function removeCustomLocation(locName) {
  let savedLocations = safeGetLocalStorageJSON('customLocations', []);
  savedLocations = savedLocations.filter(loc => (typeof loc === 'string' ? loc !== locName : loc.name !== locName));
  localStorage.setItem('customLocations', JSON.stringify(savedLocations));

  showToast(S('locationRemoved', { name: locName }), "success");
  loadCustomLocations();
  renderScheduleBoard();
}

function getSelectedLocation() {
  const radio = document.querySelector('input[name="location"]:checked');
  return radio ? radio.value : "";
}

function getSelectedTime() {
  const radio = document.querySelector('input[name="time"]:checked');
  return radio ? radio.value : "";
}

// ----------------------------------------------------------------------------
// Пикеры языка тележек (карточки RU/UA/DE) во вкладке «Запись»
// Каждая тележка (№1 и №2) выбирает свой язык независимо.
// ----------------------------------------------------------------------------
function initCartLangPickers() {
  const labels = getTrolleyLabels();
  if (!window.TrolleyUI) return;

  const c1 = document.getElementById("cart1LangPicker");
  const c2 = document.getElementById("cart2LangPicker");
  if (c1) {
    c1.innerHTML = "";
    c1.appendChild(window.TrolleyUI.createGroupPicker(labels, null, function (g) {
      selectedCart1Lang = g;
    }));
  }
  if (c2) {
    c2.innerHTML = "";
    c2.appendChild(window.TrolleyUI.createGroupPicker(labels, null, function (g) {
      selectedCart2Lang = g;
    }));
  }
}

// Сброс выбранных языков тележек (при смене слота/очистке)
function resetCartLangPickers() {
  selectedCart1Lang = "";
  selectedCart2Lang = "";
  if (window.TrolleyUI) {
    const c1 = document.getElementById("cart1LangPicker");
    const c2 = document.getElementById("cart2LangPicker");
    if (c1) window.TrolleyUI.setGroupPickerValue(c1, null);
    if (c2) window.TrolleyUI.setGroupPickerValue(c2, null);
  }
}

// Установить язык конкретной тележки в пикере программно
function setCartLangPicker(cartNum, lang) {
  if (cartNum === 1) {
    selectedCart1Lang = lang || "";
    if (window.TrolleyUI) window.TrolleyUI.setGroupPickerValue(document.getElementById("cart1LangPicker"), lang || null);
  } else {
    selectedCart2Lang = lang || "";
    if (window.TrolleyUI) window.TrolleyUI.setGroupPickerValue(document.getElementById("cart2LangPicker"), lang || null);
  }
}

// ----------------------------------------------------------------------------
// Доступность слотов и заполнение тележек
// ----------------------------------------------------------------------------
function onLocationOrDateChange() {
  const selectedLocation = getSelectedLocation();
  const group = getGroup();
  if (!selectedLocation) {
    toggleFormState(true);
    return;
  }

  toggleFormState(false);

  // Все записи этого дня/локации (язык теперь задаётся для каждой тележки отдельно,
  // поэтому фильтр по глобальной группе не применяем).
  const dayBookings = getBookings().filter(b =>
    b.date === selectedDateISO &&
    b.location === selectedLocation
  );

  const timeBookings = {};
  dayBookings.forEach(b => {
    if (!timeBookings[b.time]) {
      timeBookings[b.time] = { name1: "", name2: "", name3: "", name4: "", cart1Lang: "", cart2Lang: "" };
    }
    if (b.name1) timeBookings[b.time].name1 = b.name1;
    if (b.name2) timeBookings[b.time].name2 = b.name2;
    if (b.name3) timeBookings[b.time].name3 = b.name3;
    if (b.name4) timeBookings[b.time].name4 = b.name4;
    if (b.cart1Lang) timeBookings[b.time].cart1Lang = b.cart1Lang;
    if (b.cart2Lang) timeBookings[b.time].cart2Lang = b.cart2Lang;
  });

  const todayISO = new Date().toLocaleDateString('sv');
  const isToday = selectedDateISO === todayISO;
  const currentTime = new Date();
  const currentTotalMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();

  timeslotsList.forEach((time, index) => {
    const card = document.getElementById(`slot_${index}`);
    if (!card) return;

    const input = card.querySelector('input');
    const statusSpan = document.getElementById(`status_${index}`);

    // Проверка прошедшего времени
    const timeParts = time.split(" - ");
    if (timeParts.length === 2) {
      const startStr = timeParts[0];
      const [startHours, startMinutes] = startStr.split(":").map(Number);
      const startTotalMinutes = startHours * 60 + startMinutes;

      if (isToday && currentTotalMinutes >= startTotalMinutes) {
        statusSpan.textContent = S('timePassed');
        card.classList.add('disabled');
        if (input) {
          input.disabled = true;
          if (input.checked) input.checked = false;
        }
        return;
      }
    }

    const booking = timeBookings[time];

    if (booking) {
      const hasCart1 = !!(booking.name1 || booking.name2);
      const hasCart2 = !!(booking.name3 || booking.name4);

      if (hasCart1 && hasCart2) {
        statusSpan.textContent = S('fullyBooked');
        card.classList.add('disabled');
        if (input) {
          input.disabled = true;
          if (input.checked) input.checked = false;
        }
      } else {
        statusSpan.textContent = S('oneCartFree');
        card.classList.remove('disabled');
        if (input) input.disabled = false;
      }
    } else {
      statusSpan.textContent = S('twoCartsFree');
      card.classList.remove('disabled');
      if (input) input.disabled = false;
    }
  });

  const currentSelectedInput = document.querySelector('input[name="time"]:checked');
  if (!currentSelectedInput || currentSelectedInput.disabled) {
    const availableInput = document.querySelector('input[name="time"]:not(:disabled)');
    if (availableInput) {
      availableInput.checked = true;
    }
  }

  onTimeChange();
}

function onTimeChange() {
  const selectedLocation = getSelectedLocation();
  const selectedTime = getSelectedTime();
  const group = getGroup();

  if (!selectedLocation || !selectedTime) {
    return;
  }

  const booking = getBookings().find(b =>
    b.date === selectedDateISO &&
    b.location === selectedLocation &&
    b.time === selectedTime
  );

  const cartBox1 = document.getElementById('cartBox1');
  const cartBox2 = document.getElementById('cartBox2');
  const name1 = document.getElementById('name1');
  const name2 = document.getElementById('name2');
  const name3 = document.getElementById('name3');
  const name4 = document.getElementById('name4');
  if (!cartBox1 || !name1) return;

  // Не перезаписываем поля имён, пока пользователь их редактирует
  // (защита от потери введённых данных при фоновой синхронизации).
  if (document.activeElement === name1 || document.activeElement === name2 ||
      document.activeElement === name3 || document.activeElement === name4) {
    return;
  }

  cartBox1.classList.remove('occupied-by-others');
  cartBox2.classList.remove('occupied-by-others');
  name1.disabled = false;
  name2.disabled = false;
  name3.disabled = false;
  name4.disabled = false;
  name1.value = "";
  name2.value = "";
  name3.value = "";
  name4.value = "";
  name1.required = true;
  name2.required = true;

  if (booking) {
    const hasCart1 = !!(booking.name1 || booking.name2);
    const hasCart2 = !!(booking.name3 || booking.name4);

    if (hasCart1) {
      cartBox1.classList.add('occupied-by-others');
      name1.value = booking.name1 || "";
      name2.value = booking.name2 || "";
      name1.disabled = true;
      name2.disabled = true;
      name1.required = false;
      name2.required = false;
      name3.required = true;
      name4.required = true;
      if (!hasCart2) {
        name3.value = localStorage.getItem('pwaName3') || "";
        name4.value = localStorage.getItem('pwaName4') || "";
      }
    } else {
      name3.required = false;
      name4.required = false;
      name1.value = localStorage.getItem('pwaName1') || "";
      name2.value = localStorage.getItem('pwaName2') || "";
    }

    if (hasCart2) {
      cartBox2.classList.add('occupied-by-others');
      name3.value = booking.name3 || "";
      name4.value = booking.name4 || "";
      name3.disabled = true;
      name4.disabled = true;
      name3.required = false;
      name4.required = false;
      if (!hasCart1) {
        name1.value = localStorage.getItem('pwaName1') || "";
        name2.value = localStorage.getItem('pwaName2') || "";
      }
    }
  } else {
    name3.required = false;
    name4.required = false;
    name1.value = localStorage.getItem('pwaName1') || "";
    name2.value = localStorage.getItem('pwaName2') || "";
    name3.value = localStorage.getItem('pwaName3') || "";
    name4.value = localStorage.getItem('pwaName4') || "";
  }

  // Восстанавливаем выбранные языки тележек из сохранённой брони
  setCartLangPicker(1, booking ? (booking.cart1Lang || "") : "");
  setCartLangPicker(2, booking ? (booking.cart2Lang || "") : "");
}

// ----------------------------------------------------------------------------
// Карта (Leaflet)
// ----------------------------------------------------------------------------
function getCoordsForLocation(locName) {
  const defaultLoc = DEFAULT_LOCATIONS.find(l => l.name === locName);
  if (defaultLoc) return [defaultLoc.lat, defaultLoc.lng];

  const savedLocations = safeGetLocalStorageJSON('customLocations', []);
  const loc = savedLocations.find(l => (typeof l === 'object' && l.name === locName));
  if (loc && loc.lat && loc.lng) {
    return [loc.lat, loc.lng];
  }
  return null;
}

function showCurrentLocationOnMap() {
  const locName = getSelectedLocation();
  if (!locName) {
    showToast(S('selectLocationFirst'), "error");
    return;
  }
  showMapForLocationName(locName);
}

let leafletLoadingPromise = null;
function loadLeafletLibrary() {
  if (typeof L !== 'undefined') {
    return Promise.resolve();
  }
  if (leafletLoadingPromise) {
    return leafletLoadingPromise;
  }
  leafletLoadingPromise = new Promise((resolve, reject) => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
    link.crossOrigin = '';
    document.head.appendChild(link);

    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
    script.crossOrigin = '';
    script.onload = () => resolve();
    script.onerror = (err) => {
      leafletLoadingPromise = null;
      reject(err);
    };
    document.body.appendChild(script);
  });
  return leafletLoadingPromise;
}

async function showMapForLocationName(locName) {
  try { await loadLeafletLibrary(); } catch(e) { showToast(S('leafletError') || 'Error loading map', 'error'); return; }
  const coords = getCoordsForLocation(locName);

  document.body.style.overflow = 'hidden';
  document.getElementById('mapModal').style.display = 'flex';
  document.getElementById('mapModalTitle').textContent = S('mapTitle', { name: locName });
  document.getElementById('mapModalFooter').style.display = 'none';

  mapMode = "view";

  initLeafletMap(coords || [50.8108, 8.7700], 15);

  if (coords) {
    const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${coords[0]},${coords[1]}`;
    const popupContent = `
      <div style="text-align: center; font-family: system-ui, -apple-system, sans-serif;">
        <strong style="display:block; margin-bottom:6px;">${locName}</strong>
        <a href="${googleMapsUrl}" target="_blank" style="display:inline-block; background-color:var(--primary); color:white !important; padding:6px 12px; border-radius:4px; font-size:0.75rem; text-decoration:none; font-weight:bold; margin-top:4px;">
          ${S('buildRoute')}
        </a>
      </div>
    `;
    if (mapMarker) {
      mapMarker.setLatLng(coords).setPopupContent(popupContent).openPopup();
    } else {
      mapMarker = L.marker(coords, { draggable: false }).addTo(leafletMap)
        .bindPopup(popupContent).openPopup();
    }
  } else {
    if (mapMarker) leafletMap.removeLayer(mapMarker);
    mapMarker = null;
    showToast(S('noCoords'), "error");
  }
}

async function openMapInSelectionMode() {
  try { await loadLeafletLibrary(); } catch(e) { showToast(S('leafletError') || 'Error loading map', 'error'); return; }
  document.body.style.overflow = 'hidden';

  // Temporarily hide addLocationForm if visible to avoid modal overlay stacking
  const addLocationForm = document.getElementById('addLocationForm');
  if (addLocationForm && addLocationForm.style.display !== 'none') {
    addLocationForm.dataset.wasVisible = "true";
    addLocationForm.style.display = 'none';
  }

  document.getElementById('mapModal').style.display = 'flex';
  document.getElementById('mapModalTitle').textContent = S('selectPointMap');
  document.getElementById('mapModalFooter').style.display = 'flex';
  document.getElementById('mapModalAddressPreview').textContent = S('clickMap');

  mapMode = "select";
  tempSelectedCoords = null;
  currentGeocodedAddress = "";

  initLeafletMap([50.8090, 8.7699], 14);

  if (mapMarker) {
    leafletMap.removeLayer(mapMarker);
    mapMarker = null;
  }
}

function initLeafletMap(center, zoom) {
  if (typeof L === 'undefined') {
    showToast(S('leafletError'), "error");
    return;
  }
  if (!leafletMap) {
    leafletMap = L.map('mapContainer').setView(center, zoom);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(leafletMap);

    leafletMap.on('click', onMapClick);
  } else {
    leafletMap.setView(center, zoom);
  }

  setTimeout(() => {
    leafletMap.invalidateSize();
  }, 100);
}

function onMapClick(e) {
  if (mapMode !== "select") return;

  const lat = e.latlng.lat;
  const lng = e.latlng.lng;
  tempSelectedCoords = { lat, lng };

  if (mapMarker) {
    mapMarker.setLatLng(e.latlng);
  } else {
    mapMarker = L.marker(e.latlng, { draggable: true }).addTo(leafletMap);
    mapMarker.on('dragend', onMarkerDragEnd);
  }

  updateAddressPreview(lat, lng);
}

function onMarkerDragEnd(e) {
  const position = mapMarker.getLatLng();
  tempSelectedCoords = { lat: position.lat, lng: position.lng };
  updateAddressPreview(position.lat, position.lng);
}

async function updateAddressPreview(lat, lng) {
  const preview = document.getElementById('mapModalAddressPreview');
  preview.textContent = S('loadingAddress', { lat: lat.toFixed(4), lng: lng.toFixed(4) });

  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&accept-language=${getAcceptLang()}`);
    if (!response.ok) throw new Error();
    const data = await response.json();

    if (data.display_name) {
      const address = data.address;
      let shortName = "";
      if (address.road) {
        shortName = address.road + (address.house_number ? ", " + address.house_number : "");
      } else if (address.suburb) {
        shortName = address.suburb;
      } else if (address.amenity) {
        shortName = address.amenity;
      } else {
        shortName = data.name || "Marburg";
      }
      currentGeocodedAddress = shortName;
      preview.textContent = `📍 ${data.display_name}`;
    } else {
      currentGeocodedAddress = S('pointAt', { lat: lat.toFixed(4), lng: lng.toFixed(4) });
      preview.textContent = S('coordsOnly', { lat: lat.toFixed(4), lng: lng.toFixed(4) });
    }
  } catch (err) {
    currentGeocodedAddress = S('pointAt', { lat: lat.toFixed(4), lng: lng.toFixed(4) });
    preview.textContent = S('coordsOnly', { lat: lat.toFixed(4), lng: lng.toFixed(4) });
  }
}

function confirmMapSelection() {
  if (!tempSelectedCoords) {
    showToast(S('selectPointFirst'), "error");
    return;
  }

  const nameInput = document.getElementById('customLocationInput');
  nameInput.value = currentGeocodedAddress || S('pointAt', { lat: tempSelectedCoords.lat.toFixed(4), lng: tempSelectedCoords.lng.toFixed(4) });

  const label = document.getElementById('tempCoordsLabel');
  label.textContent = S('selectedCoords', { lat: tempSelectedCoords.lat.toFixed(4), lng: tempSelectedCoords.lng.toFixed(4) });
  label.style.color = "var(--success)";

  closeMapModal();
}

function closeMapModal() {
  document.getElementById('mapModal').style.display = 'none';

  // Restore Add Location modal if it was hidden
  const addLocationForm = document.getElementById('addLocationForm');
  if (addLocationForm && addLocationForm.dataset.wasVisible === "true") {
    addLocationForm.removeAttribute('data-was-visible');
    addLocationForm.style.display = 'flex';
    // Refocus on input
    const inputEl = document.getElementById('customLocationInput');
    if (inputEl) inputEl.focus();
  } else {
    // Only unlock scroll if we are not returning to another modal
    document.body.style.overflow = '';
  }
}

function onModalBackdropClick(e) {
  if (e.target.id === 'mapModal') {
    closeMapModal();
  }
}

// ----------------------------------------------------------------------------
// Отправка формы и удаление записи
// ----------------------------------------------------------------------------
async function handleFormSubmit(e) {
  e.preventDefault();

  if (!requireAuth()) return;

  const selectedLocation = getSelectedLocation();
  const selectedTime = getSelectedTime();

  if (!selectedLocation || !selectedTime) {
    showToast(S('selectPlaceTime'), "error");
    return;
  }

  const name1El = document.getElementById('name1');
  if (!name1El) return;
  const name1Val = name1El.value.trim();
  const name2Val = (document.getElementById('name2') || {}).value || '';
  const name3Val = (document.getElementById('name3') || {}).value || '';
  const name4Val = (document.getElementById('name4') || {}).value || '';

  const isCart1Enabled = !name1El.disabled;
  const isCart2Enabled = !(document.getElementById('name3') || {}).disabled;

  if (isCart1Enabled && (!name1Val || !name2Val)) {
    showToast(S('fillCart1'), "error");
    return;
  }

  if (isCart2Enabled && ((name3Val && !name4Val) || (!name3Val && name4Val))) {
    showToast(S('fillCart2Both'), "error");
    return;
  }

  if (!isCart1Enabled && isCart2Enabled && (!name3Val || !name4Val)) {
    showToast(S('fillCart2Names'), "error");
    return;
  }

  // Язык обязателен для каждой используемой тележки
  if (isCart1Enabled && name1Val && name2Val && !selectedCart1Lang) {
    showToast(S('selectCart1Lang'), "error");
    return;
  }
  if (isCart2Enabled && name3Val && name4Val && !selectedCart2Lang) {
    showToast(S('selectCart2Lang'), "error");
    return;
  }

  // Сохранение имён в localStorage для автозаполнения
  if (isCart1Enabled && name1Val && name2Val) {
    localStorage.setItem('pwaName1', name1Val);
    localStorage.setItem('pwaName2', name2Val);
  }
  if (isCart2Enabled && name3Val && name4Val) {
    localStorage.setItem('pwaName3', name3Val);
    localStorage.setItem('pwaName4', name4Val);
  }

  const btn = document.getElementById('submitBtn');
  const spinner = document.getElementById('btnSpinner');
  const btnText = document.getElementById('btnText');

  btn.disabled = true;
  spinner.style.display = 'inline-block';
  btnText.textContent = S('btnSaving');

  const payload = {
    location: selectedLocation,
    date: selectedDateISO,
    time: selectedTime,
    cart1Lang: isCart1Enabled ? selectedCart1Lang : "",
    name1: name1Val,
    name2: name2Val,
    cart2Lang: isCart2Enabled ? selectedCart2Lang : "",
    name3: name3Val,
    name4: name4Val
  };

  const isDemo = !isValidScriptUrl(GOOGLE_SCRIPT_URL);

  if (isDemo) {
    setTimeout(() => {
      // Мгновенное локальное обновление единого состояния (Запись -> График -> Год)
      SyncCore.addBooking(payload);
      localStorage.removeItem('qb_draft');
    showToast(S('shiftSaved'), "success");
      btn.classList.add('success');
      spinner.style.display = 'none';
      btnText.textContent = S('btnSuccess');

      setTimeout(() => {
        btn.classList.remove('success');
        btn.disabled = false;
        btnText.textContent = S('btnSubmit');
        document.getElementById('bookingForm').reset();
        resetCartLangPickers();

        switchTab('schedule');
      }, 1500);
    }, 1000);
    return;
  }

  // Собираем независимые записи ПО ТЕЛЕЖКАМ (отправляем только заполненные стенды).
  const bookingRecords = [];
  if (name1Val && name2Val && payload.cart1Lang) {
    bookingRecords.push({
      date: selectedDateISO,
      time: selectedTime,
      location: selectedLocation,
      cartNumber: 1,
      language: payload.cart1Lang,
      names: [name1Val, name2Val]
    });
  }
  if (name3Val && name4Val && payload.cart2Lang) {
    bookingRecords.push({
      date: selectedDateISO,
      time: selectedTime,
      location: selectedLocation,
      cartNumber: 2,
      language: payload.cart2Lang,
      names: [name3Val, name4Val]
    });
  }

  try {
    // Content-Type НЕ указываем явно: браузер ставит text/plain — это «простой» CORS-запрос
    // (без preflight OPTIONS). Тело читается через e.postData.contents и JSON.parse() на сервере.
    const _fetchPost = (window.SyncCore && SyncCore.fetchWithRetry) ? SyncCore.fetchWithRetry : fetch;
    const response = await _fetchPost(GOOGLE_SCRIPT_URL + '?key=jw_144000', {
      method: 'POST',
      mode: 'cors',
      // Content-Type НЕ указываем: браузер ставит text/plain — простой CORS, без preflight.
      // Сервер парсит тело через e.postData.contents + JSON.parse().
      body: JSON.stringify({
        action: 'create',
        key: 'jw_144000',
        language: (window.SyncCore && SyncCore.getLang) ? SyncCore.getLang() : (document.documentElement.lang || 'ru'),
        sendPush: false,
        bookings: bookingRecords
      })
    });
    const result = await response.json().catch(function () { return {}; });
    console.log('create response:', result);
    if (result && result.debugUrl) {
      console.log("%c👉 ДАННЫЕ ЗАПИСАНЫ СЮДА: " + result.debugUrl, "color: #00ff00; font-weight: bold; font-size: 14px;");
    }

    // Жёсткая защита от конфликтов (дубликатов): сервер вернул статус "conflict"
    if (result && result.status === 'conflict') {
      showToast(result.message || S('bookingConflict'), "error");
      btn.disabled = false;
      spinner.style.display = 'none';
      btnText.textContent = S('btnSubmit');
      SyncCore.refreshAll();
      return;
    }
    if (result && result.status === 'error') {
      console.error('Server rejected booking:', result);
      showToast((result.message || S('networkSendError')), "error");
      btn.disabled = false;
      spinner.style.display = 'none';
      btnText.textContent = S('btnSubmit');
      return;
    }

    // СВЕРКА С СЕРВЕРОМ: при статусе 'success' считаем запись успешной ВСЕГДА.
    // Верификация запускается только для логов в консоли и НЕ блокирует UI.
    const serverData = await SyncCore.fetchCombinedSafe();
    const serverBookings = (serverData && serverData.bookings) || [];
    const isVerified = await verifyBookingSaved(bookingRecords, serverBookings);
    if (!isVerified) {
      console.warn("Фоновое предупреждение: структуры данных клиента и сервера имеют мелкие различия, но запись в Google Таблице успешна.");
    }

    // ЖЕЛЕЗНЫЙ СЦЕНАРИЙ УСПЕХА (выполняется ВСЕГДА при success от сервера)
    // Мгновенное локальное обновление единого состояния (Запись -> График -> Год)
    bookingRecords.forEach(function (rec) { SyncCore.addBookingRecord(rec); });
    localStorage.removeItem('qb_draft');
    showToast(S('shiftSaved'), "success");
    btn.classList.add('success');
    spinner.style.display = 'none';
    btnText.textContent = S('btnSuccess');

    setTimeout(() => {
      btn.classList.remove('success');
      btn.disabled = false;
      btnText.textContent = S('btnSubmit');
      document.getElementById('bookingForm').reset();

      switchTab('schedule');
      // Тихая фоновая сверка с Google Таблицей (без уведомлений)
      SyncCore.refreshSilently();
    }, 1500);
  } catch (err) {
    console.error(err);
    showToast(S('networkSendError'), "error");
    btn.disabled = false;
    spinner.style.display = 'none';
    btnText.textContent = S('btnSubmit');
  }
}

// Сверяет, что сохранённые записи реально попали в Google Таблицу.
// Клиент шлёт РАЗДЕЛЬНЫЕ объекты тележек: { date, time, location, cartNumber, language, names:[n1,n2] }
// Сервер хранит ОДНУ плоскую строку на слот (обе тележки вместе):
// { date, time, location, cart1Lang, name1, name2, cart2Lang, name3, name4 }
// Возвращает true, если ВСЕ записи подтверждены сервером.
async function verifyBookingSaved(clientRecords, providedServerBookings) {
  if (!Array.isArray(clientRecords) || !clientRecords.length) return true;

  // 1. Умный нормализатор языков (решает проблему латиницы/кириллицы)
  const normalizeLang = (lang) => {
    const l = String(lang || "").trim().toLowerCase();
    if (l === "ru" || l.indexOf("рус") !== -1 || l.indexOf("rus") !== -1) return "ru";
    if (l === "ua" || l.indexOf("укр") !== -1 || l.indexOf("ukr") !== -1) return "ua";
    if (l === "de" || l.indexOf("нем") !== -1 || l.indexOf("deu") !== -1 || l.indexOf("ger") !== -1) return "de";
    return l;
  };

  // 2. Очистка дат в единый формат YYYY-MM-DD
  const toCleanDateStr = (dateVal) => {
    if (!dateVal) return "";

    // Если это уже строка формата YYYY-MM-DD — возвращаем напрямую БЕЗ парсинга
    // через new Date() (иначе браузер трактует её как UTC и сдвигает день назад
    // в локальном часовом поясе при getDate()/getMonth()).
    if (typeof dateVal === "string") {
      const m = dateVal.trim().match(/^(\d{4})-(\d{2})-(\d{2})/);
      if (m) return m[1] + "-" + m[2] + "-" + m[3];
    }

    // Иначе парсим через Date, но извлекаем компоненты строго из UTC,
    // чтобы исключить сдвиг часового пояса (getUTC* вместо get*).
    try {
      const d = new Date(dateVal);
      if (isNaN(d.getTime())) return String(dateVal).trim();
      const y = d.getUTCFullYear();
      const mo = String(d.getUTCMonth() + 1).padStart(2, '0');
      const da = String(d.getUTCDate()).padStart(2, '0');
      return y + "-" + mo + "-" + da;
    } catch (e) {
      return String(dateVal).trim();
    }
  };

  // 3. Сравнение списков имен без учета регистра, пробелов и порядка ввода
  const compareNamesList = (listA, listB) => {
    const clean = (arr) => (arr || [])
      .map(n => String(n || "").trim().toLowerCase())
      .filter(n => n !== "");
    const a = clean(listA);
    const b = clean(listB);
    if (a.length !== b.length) return false;
    return a.every(name => b.indexOf(name) !== -1);
  };

  // Железобетонный алгоритм сопоставления (независимо от структуры данных).
  function matchRecords(records, serverBookings) {
    console.log("START VERIFICATION. Client records:", records, "Server rows:", serverBookings);

    // Преобразуем плоские строки сервера в независимые объекты тележек
    const flatServerCarts = [];
    serverBookings.forEach(s => {
      const sDate = toCleanDateStr(s.date);
      const sTime = String(s.time || "").trim();
      const sLoc = String(s.location || "").trim();

      // Тележка №1
      if (s.name1 || s.name2) {
        flatServerCarts.push({
          date: sDate,
          time: sTime,
          location: sLoc,
          cartNumber: 1,
          language: normalizeLang(s.cart1Lang),
          names: [s.name1 || "", s.name2 || ""]
        });
      }
      // Тележка №2
      if (s.name3 || s.name4) {
        flatServerCarts.push({
          date: sDate,
          time: sTime,
          location: sLoc,
          cartNumber: 2,
          language: normalizeLang(s.cart2Lang),
          names: [s.name3 || "", s.name4 || ""]
        });
      }
    });

    // Сверяем каждую отправленную клиентом запись
    return records.every(client => {
      const cDate = toCleanDateStr(client.date);
      const cTime = String(client.time || "").trim();
      const cLoc = String(client.location || "").trim();
      const cCartNum = Number(client.cartNumber);
      const cLang = normalizeLang(client.language || client.trolley);
      const cNames = client.names || [];

      const found = flatServerCarts.some(server => {
        const dateMatch = server.date === cDate;
        const timeMatch = server.time === cTime;
        const locMatch = server.location === cLoc;
        const cartMatch = Number(server.cartNumber) === cCartNum;
        const langMatch = server.language === cLang;
        const namesMatch = compareNamesList(server.names, cNames);

        return dateMatch && timeMatch && locMatch && cartMatch && langMatch && namesMatch;
      });

      if (!found) {
        console.warn("Verification failed for client record:", client);
      }
      return found;
    });
  }

  // Apps Script иногда отдаёт GET с задержкой после POST — повторяем сверку до 3 раз.
  for (var attempt = 1; attempt <= 3; attempt++) {
    try {
      const serverBookings = Array.isArray(providedServerBookings)
        ? providedServerBookings
        : ((await SyncCore.fetchCombinedSafe()) || {}).bookings || [];
      if (matchRecords(clientRecords, serverBookings)) return true;
      if (attempt < 3) await new Promise(function (r) { setTimeout(r, 1200); });
    } catch (e) {
      if (attempt < 3) await new Promise(function (r) { setTimeout(r, 1200); });
    }
  }
  return false;
}

async function deleteBooking(location, date, time, cartNumber) {
  const todayObj = new Date();
  const todayStr = `${todayObj.getFullYear()}-${String(todayObj.getMonth() + 1).padStart(2, '0')}-${String(todayObj.getDate()).padStart(2, '0')}`;
  if (date < todayStr) {
    showToast("Нельзя удалять записи за прошлые дни", "error");
    return;
  }

  if (!(await SyncCore.confirmDelete(S('confirmDelete')))) {
    return;
  }

  const bookingObj = { location: location, date: date, time: time, cartNumber: cartNumber };
  const isDemo = !isValidScriptUrl(GOOGLE_SCRIPT_URL);

  if (isDemo) {
    // Офлайн/демо: убираем локально, приложение остаётся рабочим.
    SyncCore.removeBooking(bookingObj);
    showToast(S('deletedDemo'), "success");
    return;
  }

  // Безопасное удаление: мгновенно убираем из кэша и перерисовываем все вкладки.
  // При сетевой ошибке — откат кэша (removeBookingSafe сам вернёт данные и перерисует).
  showToast(S('deleting'), "info");

  try {
    await SyncCore.removeBookingSafe(bookingObj, function () {
      const params = new URLSearchParams({
        action: "delete",
        location: location,
        date: date,
        time: time,
        cartNumber: String(cartNumber),
        language: (window.SyncCore && SyncCore.getLang) ? SyncCore.getLang() : (document.documentElement.lang || 'ru'),
        key: "jw_144000"
      });
      const _fetchDel = (window.SyncCore && SyncCore.fetchWithRetry) ? SyncCore.fetchWithRetry : fetch;
      return _fetchDel(GOOGLE_SCRIPT_URL + '?' + params.toString(), {
        method: 'POST',
        mode: 'cors'
      }).then(function (res) { return res.json().catch(function () { return {}; }); });
    });

    showToast(S('deleted'), "success");
    // Тихая фоновая сверка с Google Таблицей (без уведомлений)
    SyncCore.refreshSilently();
  } catch (err) {
    console.error(err);
    showToast(S('networkDeleteError'), "error");
  }
}

async function fetchDataFromSpreadsheet() {
  const isDemo = !isValidScriptUrl(GOOGLE_SCRIPT_URL);

  if (isDemo) {
    if (databaseBookings.length === 0) {
      const todayStr = new Date().toLocaleDateString('sv');
      databaseBookings = [
        {
          date: todayStr,
          location: "Hauptbahnhof",
          time: "09:00 - 11:00",
          cart1Lang: "ru",
          name1: "Иван Иванов",
          name2: "Петр Петров",
          cart2Lang: "ua",
          name3: "Оксана К.",
          name4: "Андрій П."
        },
        {
          date: todayStr,
          location: "Erlenring",
          time: "11:00 - 13:00",
          cart1Lang: "ru",
          name1: "Алексей Смирнов",
          name2: "Дмитрий Кузнецов",
          cart2Lang: "de",
          name3: "Hans M.",
          name4: "Dieter S."
        },
        {
          date: todayStr,
          location: "Schloß",
          time: "13:00 - 15:00",
          cart1Lang: "ru",
          name1: "Сергей Соколов",
          name2: "Андрей Морозов",
          cart2Lang: "",
          name3: "",
          name4: ""
        }
      ];
    }
    renderScheduleBoard();
    onLocationOrDateChange();
    return;
  }

  try {
    const response = await fetch(GOOGLE_SCRIPT_URL + '?key=jw_144000');
    if (!response.ok) throw new Error();
    const data = await response.json();

    if (Array.isArray(data)) {
      databaseBookings = data.map(b => {
        let normalizedDate = b.date;
        if (normalizedDate && (normalizedDate.includes(" ") || normalizedDate.includes("T"))) {
          const d = new Date(normalizedDate);
          if (!isNaN(d.getTime())) {
            const yyyy = d.getFullYear();
            const mm = String(d.getMonth() + 1).padStart(2, '0');
            const dd = String(d.getDate()).padStart(2, '0');
            normalizedDate = `${yyyy}-${mm}-${dd}`;
          }
        }
        return {
          ...b,
          date: normalizedDate
        };
      });
      renderScheduleBoard();
      onLocationOrDateChange();
    }
  } catch (err) {
    console.error(err);
    showToast(S('loadErrorDemo'), "error");
  }
}

// ----------------------------------------------------------------------------
// График (вкладка «График»)
// В каждом временнОм слоте — ДВЕ независимые карточки:
//   слева  — Тележка №1 (её язык/цвет/иконка/имена)
//   справа — Тележка №2 (её язык/цвет/иконка/имена)
// Цвет и иконка строго соответствуют языку КОНКРЕТНОЙ тележки из базы.
// ----------------------------------------------------------------------------
function getCustomSlotsFor(date, location) {
  const all = safeGetLocalStorageJSON('customEmptySlots', []);
  return all.filter(x => x.date === date && x.location === location).map(x => x.time);
}

function addCustomSlotFor(date, location, time) {
  const all = safeGetLocalStorageJSON('customEmptySlots', []);
  if (!all.some(x => x.date === date && x.location === location && x.time === time)) {
    all.push({ date, location, time });
    localStorage.setItem('customEmptySlots', JSON.stringify(all));
  }
}

function addCustomTimeSlotPrompt(location) {
  openAddTimeSlotModal(location);
}

function openAddTimeSlotModal(locationName) {
  const modal = document.getElementById('addTimeSlotModal');
  if (!modal) return;
  
  modal.dataset.location = locationName;
  
  // Localize text elements
  document.getElementById('atsModalTitle').textContent = S('addTimeSlotTitle', 'Добавить интервал времени');
  document.getElementById('atsFromLabel').textContent = S('atsFromLabel', 'С (начало)');
  document.getElementById('atsToLabel').textContent = S('atsToLabel', 'До (конец)');
  document.getElementById('atsPresetsLabel').textContent = S('atsPresetsLabel', 'Быстрый выбор');
  document.getElementById('atsBtnText').textContent = S('atsBtnText', 'Добавить');
  
  // Populate From and To selects
  const fromSelect = document.getElementById('atsFromTime');
  const toSelect = document.getElementById('atsToTime');
  fromSelect.innerHTML = "";
  toSelect.innerHTML = "";
  
  const timeOptions = [];
  for (let h = 7; h <= 21; h++) {
    const hr = String(h).padStart(2, '0');
    timeOptions.push(`${hr}:00`);
    if (h < 21) {
      timeOptions.push(`${hr}:30`);
    }
  }
  
  timeOptions.forEach(t => {
    const optFrom = document.createElement('option');
    optFrom.value = t;
    optFrom.textContent = t;
    fromSelect.appendChild(optFrom);
    
    const optTo = document.createElement('option');
    optTo.value = t;
    optTo.textContent = t;
    toSelect.appendChild(optTo);
  });
  
  // Set default selection
  fromSelect.value = "10:00";
  toSelect.value = "12:00";
  
  // Generate presets list
  const presetsList = document.getElementById('atsPresetsList');
  presetsList.innerHTML = "";
  
  const presets = [
    "08:00 - 10:00",
    "10:00 - 12:00",
    "12:00 - 14:00",
    "14:00 - 16:00",
    "16:00 - 18:00",
    "18:00 - 20:00"
  ];
  
  presets.forEach(p => {
    const btn = document.createElement('button');
    btn.type = "button";
    btn.className = "week-btn";
    btn.style.padding = "6px 8px";
    btn.style.fontSize = "0.75rem";
    btn.style.width = "100%";
    btn.style.textAlign = "center";
    btn.textContent = p;
    btn.onclick = () => {
      const parts = p.split(" - ");
      fromSelect.value = parts[0];
      toSelect.value = parts[1];
      
      Array.from(presetsList.children).forEach(child => child.classList.remove('active'));
      btn.classList.add('active');
    };
    presetsList.appendChild(btn);
  });
  
  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

function closeAddTimeSlotModal() {
  const modal = document.getElementById('addTimeSlotModal');
  if (!modal) return;
  modal.style.display = 'none';
  modal.removeAttribute('data-location');
  document.body.style.overflow = '';
}

function onAddTimeSlotBackdropClick(e) {
  if (e.target.id === 'addTimeSlotModal') {
    closeAddTimeSlotModal();
  }
}

function submitCustomTimeSlot(e) {
  e.preventDefault();
  const modal = document.getElementById('addTimeSlotModal');
  if (!modal) return;
  
  const location = modal.dataset.location;
  const fromTime = document.getElementById('atsFromTime').value;
  const toTime = document.getElementById('atsToTime').value;
  
  if (!location || !fromTime || !toTime) return;
  
  const parseMin = (s) => {
    const parts = s.split(":");
    return parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
  };
  
  if (parseMin(toTime) <= parseMin(fromTime)) {
    showToast("Время окончания должно быть позже времени начала", "error");
    return;
  }
  
  const timeFormatted = `${fromTime} - ${toTime}`;
  addCustomSlotFor(selectedDateISO, location, timeFormatted);
  renderScheduleBoard();
  closeAddTimeSlotModal();
  showToast(S('shiftSaved', 'Сохранено'), "success");
}

function sortTimes(timeArray) {
  return timeArray.sort((a, b) => {
    const getVal = (str) => {
      const match = str.match(/(\d{1,2})[.:](\d{2})/);
      if (!match) return 0;
      return parseInt(match[1], 10) * 60 + parseInt(match[2], 10);
    };
    return getVal(a) - getVal(b);
  });
}

function getDayScheduleInfo(dateISO) {
  if (!window.AppState || !Array.isArray(window.AppState.schedule)) {
    return null;
  }
  const rows = window.AppState.schedule.filter(r => r.date === dateISO);
  if (rows.length === 0) return null;
  
  let status = "available";
  let description = "";
  let note = "";
  
  for (const r of rows) {
    if (r.status === "closed") {
      status = "closed";
    } else if (status !== "closed" && r.status && r.status !== "available") {
      status = r.status;
    }
    if (r.description && !description) description = r.description.trim();
    if (r.note && !note) note = r.note.trim();
  }
  
  return { status, description, note };
}

function getLocalizedStatusName(status) {
  const lang = getLang();
  const dicts = {
    ru: { closed: "Выходной", event: "Событие", holiday: "Праздник", special: "Особый день", available: "Служение" },
    uk: { closed: "Вихідний", event: "Подія", holiday: "Свято", special: "Особливий день", available: "Служіння" },
    de: { closed: "Ruhetag", event: "Ereignis", holiday: "Feiertag", special: "Besonderer Tag", available: "Dienst" }
  };
  const activeDict = dicts[lang === 'uk' ? 'uk' : (lang === 'de' ? 'de' : 'ru')] || dicts.ru;
  return activeDict[status] || status;
}

function renderScheduleBoard() {
  const board = document.getElementById('scheduleBoard');
  board.innerHTML = "";

  const info = getDayScheduleInfo(selectedDateISO);
  if (info) {
    if (info.status === "closed") {
      const bannerHTML = `
        <div class="day-status-banner closed-banner" style="
          background-color: var(--error-bg, #ffebee);
          color: var(--error, #c62828);
          border: 1px solid rgba(198, 40, 40, 0.2);
          border-radius: var(--radius-md, 8px);
          padding: 24px;
          text-align: center;
          margin-bottom: 20px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.05);
        ">
          <span style="font-size: 3rem; display: block; margin-bottom: 12px;">🚫</span>
          <h3 style="margin: 0 0 8px 0; font-size: 1.3rem; font-weight: bold;">${getLocalizedStatusName('closed')}</h3>
          ${info.description ? `<p style="margin: 0 0 8px 0; font-size: 0.95rem;">${info.description}</p>` : ''}
          ${info.note ? `<p style="margin: 0; font-size: 0.85rem; opacity: 0.85; font-style: italic;">${info.note}</p>` : ''}
        </div>
      `;
      board.innerHTML = bannerHTML;
      // Скрываем кнопку добавления места в шапке при закрытом дне
      const btnTopAddLocation = document.getElementById('btnTopAddLocation');
      if (btnTopAddLocation) btnTopAddLocation.style.display = 'none';
      return;
    }
    
    if (info.status !== "available" || info.description || info.note) {
      let icon = "ℹ️";
      let bg = "var(--primary-container, #e8f0fe)";
      let fg = "var(--primary, #1a73e8)";
      let border = "rgba(26, 115, 232, 0.2)";
      
      if (info.status === "event") {
        icon = "📅";
        bg = "rgba(255, 152, 0, 0.1)";
        fg = "#e65100";
        border = "rgba(230, 81, 0, 0.2)";
      } else if (info.status === "holiday") {
        icon = "🎉";
        bg = "rgba(76, 175, 80, 0.1)";
        fg = "#2e7d32";
        border = "rgba(46, 125, 50, 0.2)";
      } else if (info.status === "special") {
        icon = "⭐";
        bg = "rgba(156, 39, 176, 0.1)";
        fg = "#6a1b9a";
        border = "rgba(106, 27, 154, 0.2)";
      }
      
      const bannerHTML = `
        <div class="day-status-banner event-banner" style="
          background-color: ${bg};
          color: ${fg};
          border: 1px solid ${border};
          border-radius: var(--radius-md, 8px);
          padding: 16px;
          margin-bottom: 20px;
          display: flex;
          align-items: flex-start;
          gap: 12px;
          box-shadow: 0 1px 4px rgba(0,0,0,0.03);
        ">
          <span style="font-size: 1.5rem; line-height: 1;">${icon}</span>
          <div style="flex: 1;">
            <h4 style="margin: 0 0 4px 0; font-size: 1rem; font-weight: bold;">
              ${info.status !== "available" ? getLocalizedStatusName(info.status) : S('infoTitle', 'Информация')}
            </h4>
            ${info.description ? `<p style="margin: 0 0 4px 0; font-size: 0.9rem; color: var(--text-main);">${info.description}</p>` : ''}
            ${info.note ? `<p style="margin: 0; font-size: 0.8rem; opacity: 0.85; font-style: italic;">${info.note}</p>` : ''}
          </div>
        </div>
      `;
      board.innerHTML = bannerHTML;
    }
  }

  const savedLocations = safeGetLocalStorageJSON('customLocations', []);
  if (savedLocations.length === 0) {
    board.innerHTML = `<div style="text-align: center; padding: 20px; color: var(--text-muted);">${S('noLocations')}</div>`;
    return;
  }

  const dayBookings = getBookings().filter(b => b.date === selectedDateISO);

  // Нормализация языка тележки к нижнему коду (ru/ua/de)
  function normLang(g) {
    g = (g || "").toString().trim().toLowerCase();
    if (g === "ru" || g === "ua" || g === "de") return g;
    if (g === "uk") return "ua";
    if (g === "р" || g === "у" || g === "н") return { "р": "ru", "у": "ua", "н": "de" }[g];
    return "";
  }

  function findMatchingTimeSlot(customTime) {
    if (!customTime) return null;
    if (timeslotsList.indexOf(customTime) !== -1) return customTime;
    
    const match = customTime.match(/(\d{1,2})[.:](\d{2})/);
    if (!match) return timeslotsList[0] || "09:00 - 11:00";
    
    const customHour = parseInt(match[1], 10);
    const customMin = parseInt(match[2], 10);
    const customTimeVal = customHour * 60 + customMin;

    let closestSlot = timeslotsList[0] || "09:00 - 11:00";
    let minDiff = Infinity;

    timeslotsList.forEach(slot => {
      const slotMatch = slot.match(/(\d{1,2})[.:](\d{2})/);
      if (slotMatch) {
        const slotHour = parseInt(slotMatch[1], 10);
        const slotMin = parseInt(slotMatch[2], 10);
        const slotTimeVal = slotHour * 60 + slotMin;
        const diff = Math.abs(slotTimeVal - customTimeVal);
        if (diff < minDiff) {
          minDiff = diff;
          closestSlot = slot;
        }
      }
    });

    return closestSlot;
  }

  // Собираем слоты: один слот = локация + время. Объединяем все строки
  // этого слота в одну логическую запись (у каждой тележки свой язык).
  const slotMap = {};
  dayBookings.forEach(b => {
    const matchedSlotTime = findMatchingTimeSlot(b.time);
    if (!matchedSlotTime) return;

    const key = `${b.location}|${matchedSlotTime}`;
    if (!slotMap[key]) {
      slotMap[key] = {
        location: b.location, time: matchedSlotTime,
        cart1Lang: "", name1: "", name2: "", cart1ActualTime: "",
        cart2Lang: "", name3: "", name4: "", cart2ActualTime: ""
      };
    }
    const s = slotMap[key];
    const cNum = parseInt(b.cartNumber, 10);
    const bLang = normLang(b.cart1Lang || b.cart2Lang || b.language || b.group);

    if (cNum === 1) {
      if (bLang) s.cart1Lang = bLang;
      if (b.name1) s.name1 = b.name1;
      if (b.name2) s.name2 = b.name2;
      if (!s.name1 && b.names && b.names[0]) s.name1 = b.names[0];
      if (!s.name2 && b.names && b.names[1]) s.name2 = b.names[1];
      s.cart1ActualTime = b.time;
    } else if (cNum === 2) {
      if (bLang) s.cart2Lang = bLang;
      if (b.name3) s.name3 = b.name3;
      if (b.name4) s.name4 = b.name4;
      if (!s.name3 && b.names && b.names[0]) s.name3 = b.names[0];
      if (!s.name4 && b.names && b.names[1]) s.name4 = b.names[1];
      s.cart2ActualTime = b.time;
    } else {
      if (normLang(b.cart1Lang) || bLang) {
        s.cart1Lang = normLang(b.cart1Lang) || bLang;
        s.name1 = b.name1 || (b.names && b.names[0]) || "";
        s.name2 = b.name2 || (b.names && b.names[1]) || "";
        s.cart1ActualTime = b.time;
      }
      if (normLang(b.cart2Lang) || bLang) {
        s.cart2Lang = normLang(b.cart2Lang) || bLang;
        s.name3 = b.name3 || (b.names && b.names[0]) || "";
        s.name4 = b.name4 || (b.names && b.names[1]) || "";
        s.cart2ActualTime = b.time;
      }
    }
  });

  const LANG_BADGE = { ru: "RU", ua: "UA", de: "DE" };
  const LANG_LABEL = {
    ru: { ru: "Русская", ua: "Украинская", de: "Немецкая" },
    uk: { ru: "Російська", ua: "Українська", de: "Німецька" },
    de: { ru: "Russisch", ua: "Ukrainisch", de: "Deutsch" }
  };
  const langLabelMap = LANG_LABEL[getLang()] || LANG_LABEL.ru;

  const todayObj = new Date();
  const todayStr = `${todayObj.getFullYear()}-${String(todayObj.getMonth() + 1).padStart(2, '0')}-${String(todayObj.getDate()).padStart(2, '0')}`;
  const isPastDate = selectedDateISO < todayStr;

  const btnTopAddLocation = document.getElementById('btnTopAddLocation');
  if (btnTopAddLocation) {
    btnTopAddLocation.style.display = isPastDate ? 'none' : 'flex';
  }

  function cartCardHTML(cartNum, lang, n1, n2, locName, time, hasNames, actualTime) {
    const cls = (lang || "").toLowerCase() || "none";
    const icon = (window.TrolleyUI) ? window.TrolleyUI.getMiniSVG() : '';
    const badgeText = (lang && LANG_BADGE[cls]) ? LANG_BADGE[cls] : "";
    const badgeHTML = badgeText ? `<span class="trolley-lang-badge lang-badge-${cls}">${badgeText}</span>` : "";

    const timeDisplay = (actualTime && actualTime !== time) ? ` (${actualTime})` : "";
    const langName = langLabelMap[cls] ? `${langLabelMap[cls]} ` : "";
    const title = lang ? `${langName}${S('cartLabel', 'тележка')}${timeDisplay}` : `${S('cartLabel', 'Тележка')} №${cartNum}`;

    const isJustAdded = justAddedSlot &&
                        justAddedSlot.location === locName &&
                        justAddedSlot.date === selectedDateISO &&
                        justAddedSlot.time === time &&
                        justAddedSlot.cartNum === cartNum;
    const pulseClass = isJustAdded ? " slot-just-added" : "";
    const pastClass = isPastDate ? " past-readonly-slot" : "";

    const isSingle = hasNames && ((n1 && !n2) || (!n1 && n2));

    if (hasNames) {
      const deleteBtn = isPastDate
        ? `<span class="readonly-badge" style="font-size:0.65rem; color:var(--text-muted); font-weight:600; padding:1px 5px; border:1px solid var(--border); border-radius:4px;">Read-Only</span>`
        : `<button type="button" class="btn-delete-booking" onclick="event.stopPropagation(); deleteBooking('${locName.replace(/'/g, "\\'")}', '${selectedDateISO}', '${(actualTime || time).replace(/'/g, "\\'")}', ${cartNum})" title="${S('deleteBooking')}" aria-label="${S('deleteBooking')}">🗑️</button>`;

      const displayName = n1 || n2;

      if (isSingle && !isPastDate) {
        const partnerLabel = getLang() === 'uk' ? '1/2 (Потрібен напарник)' : (getLang() === 'de' ? '1/2 (Partner gesucht)' : '1/2 (Ищет напарника)');
        const btnPartnerText = getLang() === 'uk' ? 'Напарник' : (getLang() === 'de' ? 'Partner' : 'Напарник');
        return `
          <div class="board-cart-info has-lang-${cls}${pulseClass} slot-has-space" 
               tabindex="0" 
               role="button" 
               aria-label="${title}: ${displayName}. ${partnerLabel}"
               onclick="openQuickBookingModal('${locName.replace(/'/g, "\\'")}', '${selectedDateISO}', '${time}', ${cartNum})"
               onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); openQuickBookingModal('${locName.replace(/'/g, "\\'")}', '${selectedDateISO}', '${time}', ${cartNum});}">
            <div class="cart-info-header">
              <span class="board-cart-title">
                <span class="day-trolley-icon" data-group="${cls}" aria-hidden="true">${icon}</span>
                📦 ${title} ${badgeHTML}
              </span>
              ${deleteBtn}
            </div>
            <span class="board-names" title="${displayName}">${displayName} • <span class="partner-search-badge" style="
              background-color: var(--primary-container, #e8f0fe);
              color: var(--primary, #1a73e8);
              padding: 2px 6px;
              border-radius: 4px;
              font-size: 0.72rem;
              font-weight: 600;
              display: inline-block;
              margin-top: 2px;
            ">+ ${btnPartnerText}</span></span>
          </div>`;
      }

      return `
        <div class="board-cart-info has-lang-${cls}${pulseClass}${pastClass}">
          <div class="cart-info-header">
            <span class="board-cart-title">
              <span class="day-trolley-icon" data-group="${cls}" aria-hidden="true">${icon}</span>
              📦 ${title} ${badgeHTML}
            </span>
            ${deleteBtn}
          </div>
          <span class="board-names" title="${n1}, ${n2}">${n1}${n2 ? ' • ' + n2 : ''}</span>
        </div>`;
    }

    if (isPastDate) {
      return `
        <div class="board-cart-info empty has-lang-${cls} past-readonly-slot" 
             style="opacity: 0.55; cursor: not-allowed;"
             tabindex="-1" 
             aria-label="${S('cartLabel')} №${cartNum}: ${S('free')} (${selectedDateISO})">
          <span class="board-cart-title">
            <span class="day-trolley-icon" data-group="${cls}" aria-hidden="true">${icon}</span>
            📦 ${S('cartLabel')} №${cartNum}
          </span>
          <span class="board-names" style="color: var(--text-muted);">${S('free')}</span>
        </div>`;
    }

    return `
      <div class="board-cart-info empty has-lang-${cls}" 
           tabindex="0" 
           role="button" 
           aria-label="${S('cartLabel')} №${cartNum}: ${S('free')}"
           onclick="openQuickBookingModal('${locName.replace(/'/g, "\\'")}', '${selectedDateISO}', '${time}', ${cartNum})" 
           onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); openQuickBookingModal('${locName.replace(/'/g, "\\'")}', '${selectedDateISO}', '${time}', ${cartNum});}">
        <span class="board-cart-title">
          <span class="day-trolley-icon" data-group="${cls}" aria-hidden="true">${icon}</span>
          📦 ${S('cartLabel')} №${cartNum}
        </span>
        <span class="board-names">${S('quickBookBtn')}</span>
      </div>`;
  }

  savedLocations.forEach(loc => {
    const locName = typeof loc === 'string' ? loc : loc.name;

    const card = document.createElement('div');
    card.className = 'board-card';
    card.id = 'board-card-' + locName.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9а-яА-ЯёЁіІїЇєЄґҐ-]/g, '');

    const titleDiv = document.createElement('div');
    titleDiv.className = 'board-location-title';
    const addTimeBtnHTML = isPastDate ? "" : `
      <button type="button" class="btn-show-map" style="padding: 6px 10px; font-size: 0.75rem; font-weight: bold; background-color: var(--primary-container); color: var(--primary);" onclick="addCustomTimeSlotPrompt('${locName.replace(/'/g, "\\'")}')">
        ➕ ${S('addTimeSlotBtn', '+ Время')}
      </button>
    `;
    titleDiv.innerHTML = `
      <span>${locName}</span>
      <div style="display: flex; gap: 6px; align-items: center;">
        ${addTimeBtnHTML}
        <button type="button" class="btn-show-map" style="padding: 6px 10px; font-size: 0.75rem;" onclick="showMapForLocationName('${locName.replace(/'/g, "\\'")}')">
          🗺 ${S('onMap')}
        </button>
      </div>
    `;
    card.appendChild(titleDiv);

    // Build chronological times array for this location
    let locTimes = [...timeslotsList];
    dayBookings.forEach(b => {
      const matched = findMatchingTimeSlot(b.time);
      if (b.location === locName && matched && locTimes.indexOf(matched) === -1) {
        locTimes.push(matched);
      }
    });
    const addedSlots = getCustomSlotsFor(selectedDateISO, locName);
    addedSlots.forEach(t => {
      if (locTimes.indexOf(t) === -1) {
        locTimes.push(t);
      }
    });
    locTimes = sortTimes(locTimes);

    locTimes.forEach(time => {
      const slotDiv = document.createElement('div');
      slotDiv.className = 'board-slot';

      const timeLabel = document.createElement('div');
      timeLabel.className = 'board-time-label';
      timeLabel.textContent = time;
      slotDiv.appendChild(timeLabel);

      const slot = slotMap[`${locName}|${time}`];

      const cartsWrap = document.createElement('div');
      cartsWrap.className = 'board-carts';

      if (slot) {
        const c1Names = !!(slot.name1 || slot.name2);
        const c2Names = !!(slot.name3 || slot.name4);
        const c1 = document.createElement('div');
        c1.innerHTML = cartCardHTML(1, slot.cart1Lang, slot.name1, slot.name2, locName, time, c1Names, slot.cart1ActualTime);
        const c2 = document.createElement('div');
        c2.innerHTML = cartCardHTML(2, slot.cart2Lang, slot.name3, slot.name4, locName, time, c2Names, slot.cart2ActualTime);
        cartsWrap.appendChild(c1.firstElementChild);
        cartsWrap.appendChild(c2.firstElementChild);
      } else {
        const c1 = document.createElement('div');
        c1.innerHTML = cartCardHTML(1, "", "", "", locName, time, false, "");
        const c2 = document.createElement('div');
        c2.innerHTML = cartCardHTML(2, "", "", "", locName, time, false, "");
        cartsWrap.appendChild(c1.firstElementChild);
        cartsWrap.appendChild(c2.firstElementChild);
      }

      slotDiv.appendChild(cartsWrap);
      card.appendChild(slotDiv);
    });

    board.appendChild(card);
  });
}

// ----------------------------------------------------------------------------
// Прочее UI
// ----------------------------------------------------------------------------
async function onRefreshClick() {
  const icon = document.getElementById('refreshIcon');
  if (icon) icon.style.transform = "rotate(360deg)";

  await SyncCore.refreshAll();

  setTimeout(() => {
    if (icon) icon.style.transform = "rotate(0deg)";
  }, 800);
}

function showToast(msg, type) {
  if (type === 'success') {
    hapticFeedback([40, 40]);
  } else {
    hapticFeedback([30, 50, 30]);
  }
  const toast = document.getElementById('toast');
  toast.className = `toast-container ${type}`;
  toast.innerHTML = `
    <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24" style="margin-right: 6px;">
      ${type === 'success'
        ? '<path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>'
        : '<path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>'}
    </svg>
    <span>${msg}</span>
  `;
  toast.style.display = 'flex';

  setTimeout(() => {
    toast.style.display = 'none';
  }, 3000);
}

function showGlobalTooltip(text) {
  const existing = document.getElementById('globalTooltipBackdrop');
  if (existing) {
    const tooltip = document.getElementById('globalCenterTooltip');
    if (tooltip && tooltip.querySelector('.global-center-tooltip-content').textContent.trim() === text.trim()) {
      removeGlobalTooltip();
      return;
    }
    removeGlobalTooltip();
  }
  const backdrop = document.createElement('div');
  backdrop.id = 'globalTooltipBackdrop';
  backdrop.className = 'global-tooltip-backdrop';
  backdrop.addEventListener('click', removeGlobalTooltip);
  const tooltip = document.createElement('div');
  tooltip.id = 'globalCenterTooltip';
  tooltip.className = 'global-center-tooltip';
  tooltip.innerHTML = '<button type="button" class="global-center-tooltip-close" aria-label="Закрыть">&times;</button><div class="global-center-tooltip-content">' + text + '</div>';
  tooltip.querySelector('.global-center-tooltip-close').addEventListener('click', removeGlobalTooltip);
  document.body.appendChild(backdrop);
  document.body.appendChild(tooltip);
  tooltip.querySelector('.global-center-tooltip-close').addEventListener('click', function(e) {
    e.stopPropagation();
    removeGlobalTooltip();
  });
  backdrop.addEventListener('click', function(e) {
    if (e.target === backdrop) {
      removeGlobalTooltip();
    }
  });
}

function removeGlobalTooltip() {
  const backdrop = document.getElementById('globalTooltipBackdrop');
  const tooltip = document.getElementById('globalCenterTooltip');
  if (backdrop) backdrop.remove();
  if (tooltip) tooltip.remove();
}

function toggleInfo(el) {
  if (!el || !el.getAttribute) return;
  const text = el.getAttribute('data-tooltip');
  if (!text) return;
  const existing = document.getElementById('globalTooltipBackdrop');
  if (existing) {
    const tooltip = document.getElementById('globalCenterTooltip');
    if (tooltip && tooltip.querySelector('.global-center-tooltip-content').textContent.trim() === text.trim()) {
      removeGlobalTooltip();
      return;
    }
    removeGlobalTooltip();
  }
  showGlobalTooltip(text);
}

document.addEventListener('click', function(e) {
  const backdrop = document.getElementById('globalTooltipBackdrop');
  if (backdrop && e.target === backdrop) {
    removeGlobalTooltip();
  }
});

document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    removeGlobalTooltip();
  }
});



function jumpToToday() {
  currentWeekOffset = 0;
  const wb = document.getElementById('btnThisWeek');
  const nb = document.getElementById('btnNextWeek');
  const ab = document.getElementById('btnWeekAfterNext');
  if (wb) wb.classList.add('active');
  if (nb) nb.classList.remove('active');
  if (ab) ab.classList.remove('active');
  generateWeekStrip();
  showToast(S('backToToday'), "success");
}

// ----------------------------------------------------------------------------
// Делегирование фоновой синхронизации SyncCore (app-sync.js)
// ----------------------------------------------------------------------------
function startAutoSync() {
  if (window.SyncCore) SyncCore.startAutoSync();
}

function stopAutoSync() {
  if (window.SyncCore) SyncCore.stopAutoSync();
}

async function fetchSilentlyInBackground() {
  if (window.SyncCore) {
    // Не синхронизировать чаще раза в 30 секунд (защита от лишних запросов
    // при переключении вкладок или возвращении из фона)
    if (SyncCore.timeSinceLastSync() < 30000) return;
    return SyncCore.refreshSilently();
  }
}

// Слушаем активность вкладки. При возврате — сразу тянем свежие данные.
// НЕ останавливаем автосинк при уходе в фон: таймер продолжает работать,
// чтобы календарь обновлялся сам (интервал защищён от дублей в startAutoSync).
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible") {
    fetchSilentlyInBackground();
  }
});

// ----------------------------------------------------------------------------
// Функции для Быстрой Записи (Quick Booking Modal)
// ----------------------------------------------------------------------------
function formatDateReadable(isoString) {
  if (!isoString) return "";
  const parts = isoString.split("-");
  if (parts.length === 3) {
    return `${parts[2]}.${parts[1]}.${parts[0]}`;
  }
  return isoString;
}


function autofillMyNames() {
  const n1 = localStorage.getItem('myPreacherName1') || "";
  const n2 = localStorage.getItem('myPreacherName2') || "";
  const inp1 = document.getElementById('qbName1');
  const inp2 = document.getElementById('qbName2');
  if (inp1 && inp2) {
    if (inp1.disabled && !inp2.disabled) {
      inp2.value = n1 || n2;
    } else if (inp2.disabled && !inp1.disabled) {
      inp1.value = n1 || n2;
    } else {
      inp1.value = n1;
      inp2.value = n2;
    }
  }
}

function openQuickBookingModal(locName, dateISO, timeSlot, cartNum) {
  hapticFeedback(30); // Quick modal open feedback
  const todayObj = new Date();
  const todayStr = `${todayObj.getFullYear()}-${String(todayObj.getMonth() + 1).padStart(2, '0')}-${String(todayObj.getDate()).padStart(2, '0')}`;
  if (dateISO < todayStr) {
    showToast(getLang() === 'uk' ? 'Не можна створювати записи на минулі дні' : (getLang() === 'de' ? 'Buchungen für vergangene Tage sind nicht möglich' : 'Нельзя создавать записи на прошедшие дни'), "error");
    return;
  }

  const modal = document.getElementById('quickBookingModal');
  if (!modal) return;

  modal.dataset.location = locName;
  modal.dataset.date = dateISO;
  modal.dataset.time = timeSlot;
  modal.dataset.cartNum = cartNum;

  document.getElementById('qbDate').value = formatDateReadable(dateISO);
  document.getElementById('qbLocation').value = locName;
  document.getElementById('qbTime').value = timeSlot;

  const qbCartInput = document.getElementById('qbCart');
  if (qbCartInput) qbCartInput.value = `${S('cartLabel')} №${cartNum}`;

  // Находим существующую бронь на этот слот времени
  const booking = getBookings().find(b =>
    b.date === dateISO &&
    b.location === locName &&
    b.time === timeSlot
  );

  const name1Input = document.getElementById('qbName1');
  const name2Input = document.getElementById('qbName2');

  name1Input.placeholder = getLang() === 'uk' ? 'Вісник 1 (ПІБ)' : (getLang() === 'de' ? 'Verkündiger 1 (Name)' : 'Возвещатель 1 (ФИО)');
  name2Input.placeholder = getLang() === 'uk' ? 'Вісник 2 (ПІБ)' : (getLang() === 'de' ? 'Verkündiger 2 (Name)' : 'Возвещатель 2 (ФИО)');

  const activeLang = getLang() === 'uk' ? 'ua' : getLang();
  let prefillLang = activeLang;
  let isOccupied = false;
  let isSingle = false;

  if (booking) {
    if (cartNum === 1 && (booking.name1 || booking.name2)) {
      name1Input.value = booking.name1 || "";
      name2Input.value = booking.name2 || "";
      prefillLang = (booking.cart1Lang || activeLang).toLowerCase();
      if (booking.name1 && booking.name2) {
        isOccupied = true;
      } else {
        isSingle = true;
      }
    } else if (cartNum === 2 && (booking.name3 || booking.name4)) {
      name1Input.value = booking.name3 || "";
      name2Input.value = booking.name4 || "";
      prefillLang = (booking.cart2Lang || activeLang).toLowerCase();
      if (booking.name3 && booking.name4) {
        isOccupied = true;
      } else {
        isSingle = true;
      }
    }
  }

  const autofillBtn = document.getElementById('qbAutofillBtn');
  const rememberCheckbox = document.getElementById('qbRememberMyNames');

  if (isOccupied) {
    name1Input.disabled = true;
    name2Input.disabled = true;
    if (autofillBtn) autofillBtn.style.display = 'none';
  } else if (isSingle) {
    if (name1Input.value) {
      name1Input.disabled = true;
      name2Input.disabled = false;
      name2Input.value = "";
    } else {
      name2Input.disabled = true;
      name1Input.disabled = false;
      name1Input.value = "";
    }
    const savedMyName1 = localStorage.getItem('myPreacherName1') || "";
    const savedMyName2 = localStorage.getItem('myPreacherName2') || "";
    if (savedMyName1 || savedMyName2) {
      if (autofillBtn) autofillBtn.style.display = 'block';
    } else {
      if (autofillBtn) autofillBtn.style.display = 'none';
    }
    if (rememberCheckbox) {
      rememberCheckbox.checked = false;
    }
  } else {
    name1Input.disabled = false;
    name2Input.disabled = false;
    // Prefill names from localStorage (prioritize dedicated myPreacherNames)
    const savedMyName1 = localStorage.getItem('myPreacherName1') || "";
    const savedMyName2 = localStorage.getItem('myPreacherName2') || "";

    if (savedMyName1 || savedMyName2) {
      name1Input.value = savedMyName1;
      name2Input.value = savedMyName2;
      if (autofillBtn) autofillBtn.style.display = 'block';
    } else {
      // Fallback to legacy names
      if (cartNum === 1) {
        name1Input.value = localStorage.getItem('pwaName1') || "";
        name2Input.value = localStorage.getItem('pwaName2') || "";
      } else {
        name1Input.value = localStorage.getItem('pwaName3') || "";
        name2Input.value = localStorage.getItem('pwaName4') || "";
      }
      if (autofillBtn) autofillBtn.style.display = 'none';
    }
    
    if (rememberCheckbox) {
      rememberCheckbox.checked = !savedMyName1 && !savedMyName2;
    }
    const chkSendPush = document.getElementById('chkSendPush');
    if (chkSendPush) {
      chkSendPush.checked = true;
    }
    const chkSendPushLabel = document.getElementById('chkSendPushLabel');
    if (chkSendPushLabel) {
      chkSendPushLabel.textContent = S('qbSendPush');
    }
  }

  // Restore draft if exists and slot is not fully occupied/single
  if (!isOccupied && !isSingle) {
    try {
      const draft = JSON.parse(localStorage.getItem('qb_draft'));
      if (draft) {
        if (draft.name1) name1Input.value = draft.name1;
        if (draft.name2) name2Input.value = draft.name2;
        if (draft.lang) prefillLang = draft.lang.toLowerCase();
      }
    } catch (e) {}
  }

  selectedQBLang = prefillLang;
  const labels = getTrolleyLabels();
  const qbLangPicker = document.getElementById("qbLangPicker");
  if (qbLangPicker && window.TrolleyUI) {
    qbLangPicker.innerHTML = "";
    qbLangPicker.appendChild(window.TrolleyUI.createGroupPicker(labels, selectedQBLang, function (g) {
      selectedQBLang = g;
    }));
    qbLangPicker.style.pointerEvents = (isOccupied || isSingle) ? "none" : "auto";
  }

  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';

  setTimeout(() => {
    if (isSingle) {
      if (!name1Input.disabled) name1Input.focus();
      else if (!name2Input.disabled) name2Input.focus();
    } else if (!isOccupied && name1Input) {
      name1Input.focus();
    }
  }, 100);
}

function closeQuickBookingModal() {
  const modal = document.getElementById('quickBookingModal');
  if (!modal) return;

  modal.style.display = 'none';

  modal.removeAttribute('data-location');
  modal.removeAttribute('data-date');
  modal.removeAttribute('data-time');
  modal.removeAttribute('data-cart-num');

  const form = document.getElementById('quickBookingForm');
  if (form) form.reset();

  const qbLangPicker = document.getElementById("qbLangPicker");
  if (qbLangPicker) qbLangPicker.innerHTML = "";
  selectedQBLang = "";
   removeGlobalTooltip();

  document.body.style.overflow = '';

  if (previousActiveElement && typeof previousActiveElement.focus === 'function') {
    previousActiveElement.focus();
  }
  previousActiveElement = null;
}

function onQuickBookingBackdropClick(e) {
  if (e.target.id === 'quickBookingModal') {
    closeQuickBookingModal();
  }
}

function handleQuickBookingKeydown(e) {
  const modal = document.getElementById('quickBookingModal');
  const addLocModal = document.getElementById('addLocationForm');
  const addTimeModal = document.getElementById('addTimeSlotModal');

  if (e.key === 'Escape') {
    if (modal && modal.style.display !== 'none') {
      closeQuickBookingModal();
      return;
    }
    if (addLocModal && addLocModal.style.display !== 'none') {
      hideAddLocationForm();
      return;
    }
    if (addTimeModal && addTimeModal.style.display !== 'none') {
      closeAddTimeSlotModal();
      return;
    }
  }

  if (modal && modal.style.display !== 'none' && e.key === 'Tab') {
    const focusableSelectors = 'input:not([disabled]), button:not([disabled]), [tabindex="0"]:not([disabled])';
    const focusables = Array.from(modal.querySelectorAll(focusableSelectors));
    if (focusables.length === 0) return;

    const first = focusables[0];
    const last = focusables[focusables.length - 1];

    if (e.shiftKey) {
      if (document.activeElement === first) {
        last.focus();
        e.preventDefault();
      }
    } else {
      if (document.activeElement === last) {
        first.focus();
        e.preventDefault();
      }
    }
  }

  if (addLocModal && addLocModal.style.display !== 'none' && e.key === 'Tab') {
    const focusableSelectors = 'input:not([disabled]), button:not([disabled]), [tabindex="0"]:not([disabled])';
    const focusables = Array.from(addLocModal.querySelectorAll(focusableSelectors));
    if (focusables.length === 0) return;

    const first = focusables[0];
    const last = focusables[focusables.length - 1];

    if (e.shiftKey) {
      if (document.activeElement === first) {
        last.focus();
        e.preventDefault();
      }
    } else {
      if (document.activeElement === last) {
        first.focus();
        e.preventDefault();
      }
    }
  }
}

async function submitQuickBooking(e) {
  e.preventDefault();
  hapticFeedback(40); // Quick booking submit button click feedback

  if (!requireAuth()) return;

  const modal = document.getElementById('quickBookingModal');
  if (!modal) return;

  const locName = modal.dataset.location;
  const dateISO = modal.dataset.date;
  const originalTimeSlot = modal.dataset.time;
  const timeSlot = document.getElementById('qbTime').value.trim();
  const cartNum = parseInt(modal.dataset.cartNum, 10);

  const todayObj = new Date();
  const todayStr = `${todayObj.getFullYear()}-${String(todayObj.getMonth() + 1).padStart(2, '0')}-${String(todayObj.getDate()).padStart(2, '0')}`;
  if (dateISO < todayStr) {
    showToast(getLang() === 'uk' ? 'Не можна створювати записи на минулі дні' : (getLang() === 'de' ? 'Buchungen für vergangene Tage sind nicht möglich' : 'Нельзя создавать записи на прошедшие дни'), "error");
    return;
  }

  if (!locName || !dateISO || !timeSlot || !cartNum) {
    showToast(S('selectPlaceTime'), "error");
    return;
  }

  const name1Input = document.getElementById('qbName1');
  const name2Input = document.getElementById('qbName2');
  const name1 = name1Input.value.trim();
  const name2 = name2Input.value.trim();

  if (name1Input.disabled && !name2) {
    showToast(getLang() === 'uk' ? 'Будь ласка, введіть ім\'я напарника' : (getLang() === 'de' ? 'Bitte geben Sie den Namen des Partners ein' : 'Пожалуйста, введите имя напарника'), "error");
    return;
  }
  if (name2Input.disabled && !name1) {
    showToast(getLang() === 'uk' ? 'Будь ласка, введіть ім\'я напарника' : (getLang() === 'de' ? 'Bitte geben Sie den Namen des Partners ein' : 'Пожалуйста, введите имя напарника'), "error");
    return;
  }
  if (!name1Input.disabled && !name1) {
    showToast(getLang() === 'uk' ? 'Будь ласка, введіть ім\'я першого вісника' : (getLang() === 'de' ? 'Bitte geben Sie den Namen des ersten Verkündigers ein' : 'Пожалуйста, введите имя первого возвещателя'), "error");
    return;
  }

  if (!selectedQBLang) {
    showToast(S(cartNum === 1 ? 'selectCart1Lang' : 'selectCart2Lang'), "error");
    return;
  }

  // Сохраняем введенные имена в localStorage
  const rememberCheckbox = document.getElementById('qbRememberMyNames');
  if (rememberCheckbox && rememberCheckbox.checked) {
    if (name1Input.disabled) {
      localStorage.setItem('myPreacherName1', name2);
    } else if (name2Input.disabled) {
      localStorage.setItem('myPreacherName1', name1);
    } else {
      localStorage.setItem('myPreacherName1', name1);
      localStorage.setItem('myPreacherName2', name2);
    }
  }
  
  if (cartNum === 1) {
    if (!name1Input.disabled) localStorage.setItem('pwaName1', name1);
    if (!name2Input.disabled) localStorage.setItem('pwaName2', name2);
  } else {
    if (!name1Input.disabled) localStorage.setItem('pwaName3', name1);
    if (!name2Input.disabled) localStorage.setItem('pwaName4', name2);
  }

  // Обновляем инпуты в основном приложении (если они отображаются на вкладке "Запись" — легаси)
  const n1 = document.getElementById('name1');
  const n2 = document.getElementById('name2');
  const n3 = document.getElementById('name3');
  const n4 = document.getElementById('name4');
  if (n1) n1.value = localStorage.getItem('pwaName1') || '';
  if (n2) n2.value = localStorage.getItem('pwaName2') || '';
  if (n3) n3.value = localStorage.getItem('pwaName3') || '';
  if (n4) n4.value = localStorage.getItem('pwaName4') || '';

  const btn = document.getElementById('qbSubmitBtn');
  const spinner = document.getElementById('qbBtnSpinner');
  const btnText = document.getElementById('qbBtnText');

  if (btn) btn.disabled = true;
  if (spinner) spinner.style.display = 'inline-block';
  if (btnText) btnText.textContent = S('btnSaving');

  const langUpper = (selectedQBLang || "RU").toUpperCase();
  const record = {
    date: dateISO,
    time: timeSlot,
    location: locName,
    cartNumber: cartNum,
    language: langUpper,
    cart1Lang: cartNum === 1 ? langUpper : "",
    cart2Lang: cartNum === 2 ? langUpper : "",
    names: [name1, name2]
  };

  const isDemo = !isValidScriptUrl(GOOGLE_SCRIPT_URL);

  if (isDemo) {
    setTimeout(() => {
      justAddedSlot = { location: locName, date: dateISO, time: originalTimeSlot, cartNum: cartNum };

      SyncCore.addBookingRecord(record);
      localStorage.removeItem('qb_draft');
    showToast(S('shiftSaved'), "success");

      if (btn) btn.classList.add('success');
      if (spinner) spinner.style.display = 'none';
      if (btnText) btnText.textContent = S('btnSuccess');

      setTimeout(() => {
        if (btn) {
          btn.classList.remove('success');
          btn.disabled = false;
        }
        if (btnText) btnText.textContent = S('quickBookSave');

        closeQuickBookingModal();

        setTimeout(() => {
          justAddedSlot = null;
          // Re-render BOTH tabs so the new booking is visible immediately
          if (window.SyncCore && SyncCore.renderAllTabs) SyncCore.renderAllTabs();
          else renderScheduleBoard();
        }, 300);
      }, 1500);
    }, 1000);
    return;
  }

  const chkSendPush = document.getElementById('chkSendPush');
  const sendPush = chkSendPush ? chkSendPush.checked : false;

  try {
    const promiseFactory = function () {
      const _fetchPost = (window.SyncCore && SyncCore.fetchWithRetry) ? SyncCore.fetchWithRetry : fetch;
      return _fetchPost(GOOGLE_SCRIPT_URL + '?key=jw_144000', {
        method: 'POST',
        mode: 'cors',
        body: JSON.stringify({
          action: 'create',
          key: 'jw_144000',
          language: (window.SyncCore && SyncCore.getLang) ? SyncCore.getLang() : (document.documentElement.lang || 'ru'),
          sendPush: sendPush,
          bookings: [record]
        })
      }).then(res => res.json().catch(() => ({})));
    };

    justAddedSlot = { location: locName, date: dateISO, time: originalTimeSlot, cartNum: cartNum };

    const result = await SyncCore.addBookingRecordSafe(record, promiseFactory);
    console.log('quick create response:', result);

    if (result && result.status === 'conflict') {
      showToast(result.message || S('bookingConflict'), "error");
      
      // Animate conflict cell in Year Grid
      const conflictCell = document.querySelector(`.day-cell[data-date="${dateISO}"]`);
      if (conflictCell) {
        conflictCell.classList.remove('day-conflict-flash');
        void conflictCell.offsetWidth; // trigger reflow
        conflictCell.classList.add('day-conflict-flash');
        setTimeout(() => {
          conflictCell.classList.remove('day-conflict-flash');
        }, 1600);
      }

      justAddedSlot = null;
      if (btn) btn.disabled = false;
      if (spinner) spinner.style.display = 'none';
      if (btnText) btnText.textContent = S('quickBookSave');
      SyncCore.refreshAll();
      return;
    }
    if (result && result.status === 'error') {
      console.error('Server rejected booking:', result);
      showToast((result.message || S('networkSendError')), "error");
      justAddedSlot = null;
      if (btn) btn.disabled = false;
      if (spinner) spinner.style.display = 'none';
      if (btnText) btnText.textContent = S('quickBookSave');
      return;
    }

    localStorage.removeItem('qb_draft');
    showToast(S('shiftSaved'), "success");
    if (btn) btn.classList.add('success');
    if (spinner) spinner.style.display = 'none';
    if (btnText) btnText.textContent = S('btnSuccess');

    setTimeout(() => {
      if (btn) {
        btn.classList.remove('success');
        btn.disabled = false;
      }
      if (btnText) btnText.textContent = S('quickBookSave');

      closeQuickBookingModal();

      // ── Fix: force immediate re-render of ALL tabs (Schedule + Year) ──────
      // addBookingRecordSafe already updated AppState optimistically, but the
      // modal was blocking the view. Re-render now that the modal is gone.
      justAddedSlot = null;
      if (window.SyncCore && SyncCore.renderAllTabs) SyncCore.renderAllTabs();
      else renderScheduleBoard();

      // ── Fix: background re-fetch to sync confirmed server state ──────────
      // Use refreshSilently so the UI stays responsive (no spinner, no toast).
      // This corrects any server-side deduplication or field normalisations
      // that differ from the locally-built optimistic record.
      if (window.SyncCore && SyncCore.refreshSilently) {
        SyncCore.refreshSilently();
      }
    }, 1500);

  } catch (err) {
    // Offline-first: keep local changes, show a soft informational toast.
    // Do NOT roll back the booking — it is already saved in localStorage via
    // addBookingRecord / saveCachedBookings and visible in the UI.
    console.warn('Network error during quick booking (kept locally):', err);
    if (navigator.onLine === false || /fetch|network|timeout/i.test(String(err))) {
      // Network is down — booking stays local, user is informed
      localStorage.removeItem('qb_draft');
      showToast(S('savedLocally'), "info");
      if (btn) btn.classList.add('success');
      if (spinner) spinner.style.display = 'none';
      if (btnText) btnText.textContent = S('btnSuccess');
      setTimeout(function () {
        if (btn) { btn.classList.remove('success'); btn.disabled = false; }
        if (btnText) btnText.textContent = S('quickBookSave');
        closeQuickBookingModal();
        // ── Fix: re-render all tabs so offline booking appears immediately ──
        justAddedSlot = null;
        if (window.SyncCore && SyncCore.renderAllTabs) SyncCore.renderAllTabs();
        else renderScheduleBoard();
      }, 1500);
    } else {
      // Unexpected JS error — revert booking to avoid inconsistent state
      showToast(S('networkSendError'), "error");
      justAddedSlot = null;
      if (btn) btn.disabled = false;
      if (spinner) spinner.style.display = 'none';
      if (btnText) btnText.textContent = S('quickBookSave');
    }
  }
}



// ----------------------------------------------------------------------------
// Глобальная обработка ошибок (Global Error Boundary)
// ----------------------------------------------------------------------------
window.onerror = function (message, source, lineno, colno, error) {
  console.error('[App Error]', message, 'at', source, 'line', lineno, error);
  // Игнорируем ошибки сторонних браузерных расширений
  if (source && (source.includes('extension') || source.includes('chrome-extension'))) return false;
  
  if (typeof showToast === 'function') {
    const lang = (localStorage.getItem("preferredLanguage") || document.documentElement.lang || "ru").toLowerCase();
    let msg = "Произошла временная ошибка интерфейса. Запустите перезагрузку или попробуйте ещё раз.";
    if (lang === "de") msg = "Ein vorübergehender Fehler ist aufgetreten. Bitte laden Sie die Seite neu.";
    else if (lang === "ua" || lang === "uk") msg = "Сталася тимчасова помилка інтерфейсу. Спробуйте оновити сторінку.";
    showToast(msg, "error");
  }
  return false;
};

window.addEventListener('unhandledrejection', function (event) {
  console.error('[Unhandled Promise Rejection]', event.reason);
  const reasonStr = String((event && event.reason) || '');
  if (reasonStr.includes('NO_URL') || reasonStr.includes('OneSignal') || reasonStr.includes('quota') || reasonStr.includes('AbortError')) return;
});


// ----------------------------------------------------------------------------
// Дополнительные возможности: Режим крупного шрифта для слабовидящих
// ----------------------------------------------------------------------------
function toggleFontSize() {
  const isLarge = document.documentElement.classList.toggle('large-font-mode');
  localStorage.setItem('pwaLargeFont', isLarge ? 'true' : 'false');
  updateFontSizeButtonState();
}

function updateFontSizeButtonState() {
  const btn = document.getElementById('btnToggleFontSize');
  if (!btn) return;
  const isLarge = document.documentElement.classList.contains('large-font-mode');
  btn.classList.toggle('active', isLarge);
}

function initFontSizeMode() {
  const isLarge = localStorage.getItem('pwaLargeFont') === 'true';
  if (isLarge) {
    document.documentElement.classList.add('large-font-mode');
  }
  updateFontSizeButtonState();
}

// ----------------------------------------------------------------------------
// Переключение вкладок свайпами на мобильных устройствах
// ----------------------------------------------------------------------------
(function () {
  let touchStartX = 0;
  let touchStartY = 0;
  let touchStartTime = 0;

  function isModalVisible() {
    const backdrops = document.querySelectorAll('.modal-backdrop');
    for (let i = 0; i < backdrops.length; i++) {
      const display = window.getComputedStyle(backdrops[i]).display;
      if (display !== 'none') {
        return true;
      }
    }
    const activeModals = document.querySelectorAll('.modal.active, .modal.open, .day-editor-modal, #dayEditorModal');
    for (let i = 0; i < activeModals.length; i++) {
      if (window.getComputedStyle(activeModals[i]).display !== 'none') {
        return true;
      }
    }
    return false;
  }

  function isHorizontalScrollable(el) {
    let cur = el;
    while (cur && cur !== document.body) {
      if (cur.id === 'dateScroller' || (cur.classList && (cur.classList.contains('date-scroller') || cur.classList.contains('leaflet-container')))) {
        return true;
      }
      const style = window.getComputedStyle(cur);
      if (style.overflowX === 'auto' || style.overflowX === 'scroll') {
        if (cur.scrollWidth > cur.clientWidth) {
          return true;
        }
      }
      cur = cur.parentNode;
    }
    return false;
  }

  document.addEventListener('touchstart', function (e) {
    if (window.innerWidth > 768) return; // Только для мобильных
    if (isModalVisible()) return;

    const targetTagName = e.target.tagName.toLowerCase();
    if (targetTagName === 'input' || targetTagName === 'textarea' || targetTagName === 'select') {
      return;
    }

    if (isHorizontalScrollable(e.target)) return;

    const touch = e.touches[0];
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
    touchStartTime = Date.now();
  }, { passive: true });

  document.addEventListener('touchend', function (e) {
    if (window.innerWidth > 768) return;
    if (!touchStartX || !touchStartY) return;

    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStartX;
    const deltaY = touch.clientY - touchStartY;
    const duration = Date.now() - touchStartTime;

    touchStartX = 0;
    touchStartY = 0;

    if (duration > 400) return; // Свайп должен быть быстрым (не дольше 400мс)

    const threshold = 40; // Минимальная дистанция 40px
    if (Math.abs(deltaX) >= threshold && Math.abs(deltaX) > Math.abs(deltaY)) {
      // Определяем текущую активную вкладку
      const yearContent = document.getElementById('yearTabContent');
      const isYearActive = yearContent && yearContent.classList.contains('active');
      const currentActiveTab = isYearActive ? 'year' : 'schedule';

      if (deltaX < 0) {
        // Свайп влево 👈 -> на следующую вкладку (Schedule -> Year)
        if (currentActiveTab === 'schedule') {
          const btn = document.getElementById('btnTabYear');
          if (btn) btn.click();
        }
      } else {
        // Свайп вправо 👉 -> на предыдущую вкладку (Year -> Schedule)
        if (currentActiveTab === 'year') {
          const btn = document.getElementById('btnTabSchedule');
          if (btn) btn.click();
        }
      }
    }
  }, { passive: true });
})();

// ----------------------------------------------------------------------------
// Умная плавающая кнопка навигации (Smart Scroll to Top / Bottom)
// ----------------------------------------------------------------------------
(function () {
  let isScrollDownDirection = true;

  function isAnyModalOpen() {
    const backdrops = document.querySelectorAll('.modal-backdrop, .lang-confirm-overlay');
    for (let i = 0; i < backdrops.length; i++) {
      const style = window.getComputedStyle(backdrops[i]);
      if (style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0') return true;
    }
    const dayModal = document.getElementById('dayEditorModal');
    if (dayModal && window.getComputedStyle(dayModal).display !== 'none') return true;
    const quickModal = document.getElementById('quickBookingModal');
    if (quickModal && window.getComputedStyle(quickModal).display !== 'none') return true;

    return false;
  }

  const SVG_DOWN = '<svg class="scroll-icon-svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M19 12l-7 7-7-7"/></svg>';
  const SVG_UP = '<svg class="scroll-icon-svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5M5 12l7-7 7 7"/></svg>';

  function initQuickScrollButton() {
    let btn = document.getElementById('quickScrollBtn');
    if (!btn) {
      btn = document.createElement('button');
      btn.id = 'quickScrollBtn';
      btn.className = 'quick-scroll-btn hidden';
      btn.setAttribute('aria-label', 'Scroll navigation');
      btn.innerHTML = SVG_DOWN;
      document.body.appendChild(btn);
    } else if (btn.parentElement !== document.body) {
      document.body.appendChild(btn);
    }

    let isScrollingDown = true;

    function updateScrollButton() {
      if (!btn) return;

      if (isAnyModalOpen()) {
        btn.classList.add('hidden');
        return;
      }

      const scrollTop = window.scrollY || document.documentElement.scrollTop || 0;
      const scrollHeight = document.documentElement.scrollHeight || document.body.scrollHeight || 0;
      const clientHeight = window.innerHeight || document.documentElement.clientHeight || 0;
      const maxScroll = scrollHeight - clientHeight;

      if (maxScroll <= 5) {
        btn.classList.add('hidden');
        return;
      }

      btn.classList.remove('hidden');

      if (scrollTop < 100) {
        isScrollingDown = true;
        btn.innerHTML = SVG_DOWN;
        btn.setAttribute('aria-label', 'Scroll to bottom');
      } else {
        isScrollingDown = false;
        btn.innerHTML = SVG_UP;
        btn.setAttribute('aria-label', 'Scroll to top');
      }
    }

    btn.onclick = function () {
      const scrollHeight = document.documentElement.scrollHeight || document.body.scrollHeight || 0;
      const clientHeight = window.innerHeight || document.documentElement.clientHeight || 0;
      const maxScroll = scrollHeight - clientHeight;
      if (isScrollingDown) {
        window.scrollTo({ top: maxScroll, behavior: 'smooth' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    };

    window.addEventListener('scroll', updateScrollButton, { passive: true });
    window.addEventListener('resize', updateScrollButton, { passive: true });

    if (typeof MutationObserver !== 'undefined') {
      const observer = new MutationObserver(function () {
        updateScrollButton();
      });
      observer.observe(document.body, { attributes: true, attributeFilter: ['style', 'class'] });
    }

    updateScrollButton();
  }

  document.addEventListener('DOMContentLoaded', initQuickScrollButton);
  initQuickScrollButton();
})();

// Принудительное удаление Vercel Toolbar из DOM
(function removeVercelToolbar() {
  function purge() {
    const selectors = [
      '#vercel-toolbar',
      'vercel-live-feedback',
      '[data-vercel-toolbar]',
      'iframe[id*="vercel-toolbar"]',
      'iframe[src*="vercel.live"]',
      'iframe[src*="vercel.com/toolbar"]',
      'div[class*="vercel-toolbar"]',
      'div[id*="vercel-toolbar"]'
    ];
    selectors.forEach(function (sel) {
      document.querySelectorAll(sel).forEach(function (el) {
        try { el.remove(); } catch (e) {}
      });
    });
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', purge);
  } else {
    purge();
  }
  window.addEventListener('load', purge);
  setTimeout(purge, 800);
  setTimeout(purge, 2500);
})();


// ----- Статистика расписания (Statistics Modal) -----
function showStatsModal() {
  let modal = document.getElementById('statsModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'statsModal';
    modal.className = 'modal-backdrop';
    modal.style.cssText = 'display: none; align-items: center; justify-content: center; z-index: 100020;';
    modal.onclick = (e) => { if (e.target === modal) closeStatsModal(); };
    document.body.appendChild(modal);
  }

  const lang = getLang();
  let title = "Статистика расписания";
  let closeBtn = "Закрыть";
  let lblLocs = "Всего точек";
  let lblBookings = "Всего записей";
  let lblLangs = "По языкам литературы";
  let lblTopLoc = "Самое популярное место";

  if (lang === "de") {
    title = "Statistiken";
    closeBtn = "Schließen";
    lblLocs = "Standorte gesamt";
    lblBookings = "Buchungen gesamt";
    lblLangs = "Nach Literatursprachen";
    lblTopLoc = "Beliebtester Standort";
  } else if (lang === "uk" || lang === "ua") {
    title = "Статистика розкладу";
    closeBtn = "Закрити";
    lblLocs = "Всього місць";
    lblBookings = "Всього записів";
    lblLangs = "За мовами літератури";
    lblTopLoc = "Найпопулярніше місце";
  }

  const bookings = getBookings();
  const totalBookings = bookings.length;
  const totalLocations = (safeGetLocalStorageJSON('customLocations', []) || []).length;

  let ruCount = 0;
  let uaCount = 0;
  let deCount = 0;

  bookings.forEach(b => {
    if (b.cart1Lang) {
      const l = b.cart1Lang.toLowerCase();
      if (l === 'ru') ruCount++;
      else if (l === 'ua' || l === 'uk') uaCount++;
      else if (l === 'de') deCount++;
    }
    if (b.cart2Lang) {
      const l = b.cart2Lang.toLowerCase();
      if (l === 'ru') ruCount++;
      else if (l === 'ua' || l === 'uk') uaCount++;
      else if (l === 'de') deCount++;
    }
  });

  const locCounts = {};
  bookings.forEach(b => {
    locCounts[b.location] = (locCounts[b.location] || 0) + 1;
  });
  let topLoc = "—";
  let maxCount = 0;
  for (const loc in locCounts) {
    if (locCounts[loc] > maxCount) {
      maxCount = locCounts[loc];
      topLoc = loc;
    }
  }
  if (topLoc !== "—" && maxCount > 0) {
    topLoc = `${topLoc} (${maxCount})`;
  }

  modal.innerHTML = `
    <div class="modal-content" style="max-width: 400px; padding: 24px; position: relative;">
      <h3 style="margin-top: 0; margin-bottom: 18px; display: flex; align-items: center; gap: 8px;">📊 ${title}</h3>
      
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 20px;">
        <div style="background: rgba(120, 120, 120, 0.05); padding: 12px; border-radius: 8px; text-align: center;">
          <div style="font-size: 0.75rem; color: var(--text-muted); margin-bottom: 4px;">${lblLocs}</div>
          <div style="font-size: 1.5rem; font-weight: 700; color: var(--primary);">${totalLocations}</div>
        </div>
        <div style="background: rgba(120, 120, 120, 0.05); padding: 12px; border-radius: 8px; text-align: center;">
          <div style="font-size: 0.75rem; color: var(--text-muted); margin-bottom: 4px;">${lblBookings}</div>
          <div style="font-size: 1.5rem; font-weight: 700; color: var(--primary);">${totalBookings}</div>
        </div>
      </div>

      <div style="margin-bottom: 20px; background: rgba(120, 120, 120, 0.03); padding: 12px; border-radius: 8px;">
        <div style="font-size: 0.8rem; font-weight: 700; margin-bottom: 8px; border-bottom: 1px solid var(--border); padding-bottom: 4px;">${lblLangs}</div>
        <div style="display: flex; flex-direction: column; gap: 6px;">
          <div style="display: flex; justify-content: space-between; font-size: 0.8rem;">
            <span>🇷🇺 Русский (RU)</span>
            <span style="font-weight: 700;">${ruCount}</span>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 0.8rem;">
            <span>🇺🇦 Українська (UA)</span>
            <span style="font-weight: 700;">${uaCount}</span>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 0.8rem;">
            <span>🇩🇪 Deutsch (DE)</span>
            <span style="font-weight: 700;">${deCount}</span>
          </div>
        </div>
      </div>

      <div style="margin-bottom: 24px; background: rgba(120, 120, 120, 0.03); padding: 12px; border-radius: 8px;">
        <div style="font-size: 0.75rem; color: var(--text-muted); margin-bottom: 4px;">${lblTopLoc}</div>
        <div style="font-size: 0.85rem; font-weight: 700; color: var(--text);">${topLoc}</div>
      </div>

      <button type="button" class="btn-submit" onclick="closeStatsModal()" style="width: 100%; margin-top: 0; padding: 12px;">${closeBtn}</button>
    </div>
  `;

  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

function closeStatsModal() {
  const modal = document.getElementById('statsModal');
  if (modal) {
    modal.style.display = 'none';
  }
  document.body.style.overflow = '';
}

window.showStatsModal = showStatsModal;
window.closeStatsModal = closeStatsModal;


// ----- Глобальная утилита тактильной отдачи (Haptic Feedback) -----
function hapticFeedback(pattern = 40) {
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    try {
      navigator.vibrate(pattern);
    } catch (e) {
      console.warn("Haptic feedback error:", e);
    }
  }
}
window.hapticFeedback = hapticFeedback;

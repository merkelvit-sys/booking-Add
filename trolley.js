// =============================================================================
// trolley.js — SVG-компонент «Стенд-Тележка» для VibeMemories PWA
// Встроенный inline SVG, кэшируется Service Worker, работает офлайн.
// =============================================================================

(function () {
  'use strict';

  // ---------------------------------------------------------------------------
  // Основной SVG тележки (viewBox 80×160, масштабируется через width/height CSS)
  // Структура: рама + колёса + опорная ножка + верхняя панель + 3 полки с книгами
  // ---------------------------------------------------------------------------
  var TROLLEY_SVG_DEF = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 160" class="trolley-svg" aria-label="Стенд-тележка">
  <!-- ===== РАМА: вертикальные трубки ===== -->
  <rect class="trolley-frame" x="14" y="10" width="5" height="120" rx="2.5"/>
  <rect class="trolley-frame" x="61" y="10" width="5" height="120" rx="2.5"/>

  <!-- ===== ПЕРЕКЛАДИНЫ рамы ===== -->
  <rect class="trolley-frame" x="14" y="10" width="52" height="5" rx="2.5"/>
  <rect class="trolley-frame" x="14" y="55" width="52" height="4" rx="2"/>
  <rect class="trolley-frame" x="14" y="82" width="52" height="4" rx="2"/>
  <rect class="trolley-frame" x="14" y="109" width="52" height="4" rx="2"/>
  <rect class="trolley-frame" x="14" y="130" width="52" height="4" rx="2"/>

  <!-- ===== ВЕРХНЯЯ ПАНЕЛЬ (постер/плакат) ===== -->
  <rect class="trolley-poster" x="18" y="14" width="44" height="38" rx="3"/>
  <!-- Деталь: разделитель постера -->
  <rect class="trolley-poster-line" x="18" y="28" width="44" height="2" rx="1"/>
  <!-- Текстовые полосы на постере -->
  <rect class="trolley-poster-text" x="22" y="33" width="36" height="3.5" rx="1.5"/>
  <rect class="trolley-poster-text" x="25" y="39" width="30" height="3" rx="1.5"/>
  <rect class="trolley-poster-text" x="28" y="45" width="24" height="2.5" rx="1.2"/>

  <!-- ===== ПОЛКА 1: журналы и брошюры ===== -->
  <!-- Наклонная спинка -->
  <rect class="trolley-shelf-back" x="18" y="56" width="44" height="22" rx="2"/>
  <!-- Книга 1 (широкая, синяя) -->
  <rect class="trolley-book-1" x="20" y="58" width="10" height="18" rx="1.5"/>
  <!-- Книга 2 (средняя, зеленая) -->
  <rect class="trolley-book-2" x="32" y="59" width="8" height="17" rx="1.5"/>
  <!-- Книга 3 (тонкая, красная) -->
  <rect class="trolley-book-3" x="42" y="60" width="5" height="16" rx="1.2"/>
  <!-- Книга 4 (средняя, оранжевая) -->
  <rect class="trolley-book-4" x="49" y="59" width="7" height="17" rx="1.5"/>
  <!-- Книга 5 (тонкая) -->
  <rect class="trolley-book-1" x="58" y="60" width="4" height="16" rx="1"/>

  <!-- ===== ПОЛКА 2: книги ===== -->
  <rect class="trolley-shelf-back" x="18" y="83" width="44" height="22" rx="2"/>
  <rect class="trolley-book-2" x="20" y="85" width="9" height="17" rx="1.5"/>
  <rect class="trolley-book-3" x="31" y="86" width="6" height="16" rx="1.2"/>
  <rect class="trolley-book-4" x="39" y="85" width="9" height="17" rx="1.5"/>
  <rect class="trolley-book-1" x="50" y="86" width="7" height="16" rx="1.2"/>
  <rect class="trolley-book-3" x="59" y="86" width="3" height="15" rx="1"/>

  <!-- ===== ПОЛКА 3: брошюры ===== -->
  <rect class="trolley-shelf-back" x="18" y="110" width="44" height="17" rx="2"/>
  <rect class="trolley-book-4" x="20" y="112" width="8" height="13" rx="1.5"/>
  <rect class="trolley-book-1" x="30" y="113" width="6" height="12" rx="1.2"/>
  <rect class="trolley-book-2" x="38" y="112" width="8" height="13" rx="1.5"/>
  <rect class="trolley-book-3" x="48" y="113" width="5" height="12" rx="1.2"/>
  <rect class="trolley-book-4" x="55" y="113" width="7" height="12" rx="1.5"/>

  <!-- ===== КОЛЁСА ===== -->
  <!-- Колесо левое -->
  <circle class="trolley-wheel-outer" cx="22" cy="142" r="10"/>
  <circle class="trolley-wheel-inner" cx="22" cy="142" r="5"/>
  <line class="trolley-wheel-spoke" x1="22" y1="132" x2="22" y2="152"/>
  <line class="trolley-wheel-spoke" x1="12" y1="142" x2="32" y2="142"/>
  <line class="trolley-wheel-spoke" x1="15" y1="135" x2="29" y2="149"/>
  <line class="trolley-wheel-spoke" x1="29" y1="135" x2="15" y2="149"/>

  <!-- Колесо правое -->
  <circle class="trolley-wheel-outer" cx="58" cy="142" r="10"/>
  <circle class="trolley-wheel-inner" cx="58" cy="142" r="5"/>
  <line class="trolley-wheel-spoke" x1="58" y1="132" x2="58" y2="152"/>
  <line class="trolley-wheel-spoke" x1="48" y1="142" x2="68" y2="142"/>
  <line class="trolley-wheel-spoke" x1="51" y1="135" x2="65" y2="149"/>
  <line class="trolley-wheel-spoke" x1="65" y1="135" x2="51" y2="149"/>

  <!-- ===== ПЕРЕДНЯЯ ОПОРНАЯ НОЖКА ===== -->
  <rect class="trolley-frame" x="38" y="130" width="4" height="18" rx="2"/>
  <rect class="trolley-frame" x="33" y="146" width="14" height="3.5" rx="1.75"/>
</svg>
`.trim();

  // ---------------------------------------------------------------------------
  // Миниатюрная иконка тележки для ячеек календаря (viewBox 20×32)
  // ---------------------------------------------------------------------------
  var TROLLEY_MINI_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 32" class="trolley-mini-svg" aria-hidden="true">
  <rect class="trolley-frame" x="3" y="2" width="2" height="22" rx="1"/>
  <rect class="trolley-frame" x="15" y="2" width="2" height="22" rx="1"/>
  <rect class="trolley-frame" x="3" y="2" width="14" height="2" rx="1"/>
  <rect class="trolley-poster" x="4" y="4" width="12" height="8" rx="1"/>
  <rect class="trolley-shelf-back" x="4" y="13" width="12" height="5" rx="1"/>
  <rect class="trolley-shelf-back" x="4" y="19" width="12" height="5" rx="1"/>
  <circle class="trolley-wheel-outer" cx="6" cy="28" r="3"/>
  <circle class="trolley-wheel-outer" cx="14" cy="28" r="3"/>
  <rect class="trolley-frame" x="9" y="24" width="2" height="5" rx="1"/>
</svg>
`.trim();

  // ---------------------------------------------------------------------------
  // CSS: переменные цветов тележки (меняются через modifier-классы)
  // ---------------------------------------------------------------------------
  var TROLLEY_CSS = `
/* ===== Trolley SVG — базовые цвета ===== */
.trolley-svg,
.trolley-mini-svg {
  overflow: visible;
}

/* Рама (темно-серая, металлическая) */
.trolley-svg .trolley-frame,
.trolley-mini-svg .trolley-frame {
  fill: #2d3748;
}
/* Постер: синий фон */
.trolley-svg .trolley-poster,
.trolley-mini-svg .trolley-poster {
  fill: #3b82f6;
}
.trolley-svg .trolley-poster-line {
  fill: rgba(255,255,255,0.25);
}
.trolley-svg .trolley-poster-text {
  fill: rgba(255,255,255,0.7);
  rx: 1.5;
}
/* Фон полок */
.trolley-svg .trolley-shelf-back,
.trolley-mini-svg .trolley-shelf-back {
  fill: #e2e8f0;
}
/* Книги — разные цвета */
.trolley-svg .trolley-book-1 { fill: #3b82f6; }  /* синяя */
.trolley-svg .trolley-book-2 { fill: #10b981; }  /* зелёная */
.trolley-svg .trolley-book-3 { fill: #ef4444; }  /* красная */
.trolley-svg .trolley-book-4 { fill: #f59e0b; }  /* оранжевая */

/* Колёса */
.trolley-svg .trolley-wheel-outer,
.trolley-mini-svg .trolley-wheel-outer {
  fill: #1a202c;
  stroke: #4a5568;
  stroke-width: 1;
}
.trolley-svg .trolley-wheel-inner {
  fill: #718096;
}
.trolley-svg .trolley-wheel-spoke {
  stroke: #718096;
  stroke-width: 1;
  stroke-linecap: round;
}

/* ===== Dark mode ===== */
@media (prefers-color-scheme: dark) {
  .trolley-svg .trolley-frame,
  .trolley-mini-svg .trolley-frame { fill: #cbd5e0; }
  .trolley-svg .trolley-shelf-back,
  .trolley-mini-svg .trolley-shelf-back { fill: #4a5568; }
  .trolley-svg .trolley-wheel-outer,
  .trolley-mini-svg .trolley-wheel-outer { fill: #e2e8f0; stroke: #a0aec0; }
  .trolley-svg .trolley-wheel-inner { fill: #a0aec0; }
  .trolley-svg .trolley-wheel-spoke { stroke: #a0aec0; }
}

/* ===== MODIFIER: тележка с акцентом по языковой группе ===== */
.trolley-card[data-group="ru"] .trolley-poster { fill: #dc2626; }   /* красный */
.trolley-card[data-group="ua"] .trolley-poster { fill: #2563eb; }   /* синий */
.trolley-card[data-group="de"] .trolley-poster { fill: #16a34a; }   /* зелёный */

/* ===== Мини-иконка в ячейке календаря ===== */
.trolley-mini-wrap {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.trolley-mini-svg { width: 10px; height: 16px; }

.trolley-mini-wrap[data-group="ru"] .trolley-poster { fill: #dc2626; }
.trolley-mini-wrap[data-group="ua"] .trolley-poster { fill: #2563eb; }
.trolley-mini-wrap[data-group="de"] .trolley-poster { fill: #16a34a; }

/* ===== Splash: тележка на экране загрузки ===== */
.splash-trolley-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  animation: trolleyFloat 2.2s ease-in-out infinite;
}
.splash-trolley-wrap .trolley-svg {
  width: 80px;
  height: 160px;
  filter: drop-shadow(0 8px 24px rgba(37,99,235,0.22));
}
@keyframes trolleyFloat {
  0%, 100% { transform: translateY(0px); }
  50%       { transform: translateY(-8px); }
}

/* ===== Карточки выбора тележки в редакторе дня ===== */
.trolley-picker {
  display: flex;
  gap: 10px;
  margin-bottom: 12px;
}
.trolley-card {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 10px 6px 8px;
  border: 2px solid var(--border, #e2e8f0);
  border-radius: var(--radius-md, 12px);
  background: var(--card-bg, #fff);
  cursor: pointer;
  user-select: none;
  transition: border-color 0.18s ease, box-shadow 0.18s ease, transform 0.14s ease, background 0.18s ease;
  position: relative;
  overflow: hidden;
}
.trolley-card:hover {
  border-color: var(--primary, #2563eb);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(37,99,235,0.12);
}
.trolley-card.active {
  border-color: var(--primary, #2563eb);
  background: var(--primary-container, rgba(37,99,235,0.07));
  box-shadow: 0 0 0 3px rgba(37,99,235,0.18), 0 4px 14px rgba(37,99,235,0.12);
}
.trolley-card.active::after {
  content: '✓';
  position: absolute;
  top: 5px;
  right: 7px;
  font-size: 0.65rem;
  font-weight: 800;
  color: var(--primary, #2563eb);
}
.trolley-card .trolley-svg {
  width: 44px;
  height: 88px;
  flex-shrink: 0;
}
.trolley-card-label {
  font-size: 0.7rem;
  font-weight: 700;
  color: var(--text-muted, #64748b);
  text-align: center;
  line-height: 1.2;
}
.trolley-card.active .trolley-card-label {
  color: var(--primary, #2563eb);
}

/* ===== Компактный пикер языка тележки (блоки Тележка №1 / №2 во вкладке «Запись») ===== */
.trolley-group-picker {
  display: inline-flex;
  gap: 6px;
  margin-left: auto;
  flex-wrap: wrap;
  justify-content: flex-end;
}
.trolley-card--compact {
  flex: 0 0 auto;
  flex-direction: row;
  align-items: center;
  gap: 5px;
  padding: 4px 8px;
  border-width: 2px;
}
.trolley-card--compact .trolley-svg { width: 26px; height: 52px; }
.trolley-card--compact .trolley-mini-svg { width: 13px; height: 20px; }
.trolley-card--compact .trolley-card-label { font-size: 0.62rem; }
.trolley-card--compact:hover { transform: translateY(-1px); }
/* Флаг/бейдж языка */
.trolley-card-badge {
  position: absolute;
  top: 5px;
  left: 6px;
  font-size: 0.56rem;
  font-weight: 800;
  letter-spacing: 0.03em;
  padding: 2px 5px;
  border-radius: 4px;
  color: #fff;
  line-height: 1;
}
.trolley-card[data-group="ru"] .trolley-card-badge { background: #dc2626; }
.trolley-card[data-group="ua"] .trolley-card-badge { background: #2563eb; }
.trolley-card[data-group="de"] .trolley-card-badge { background: #16a34a; }

/* ===== Минитележки в ячейках года ===== */
.day-cell .day-trolley-icon {
  position: absolute;
  bottom: 1px;
  right: 1px;
  width: 11px;
  height: 18px;
  pointer-events: none;
}
.day-cell .day-trolley-icon .trolley-frame { fill: #374151; }
.day-cell .day-trolley-icon .trolley-shelf-back { fill: #d1d5db; }
.day-cell .day-trolley-icon .trolley-wheel-outer { fill: #1f2937; stroke: none; }

/* Цвет постера по группе в мини-иконке ячейки */
.day-cell .day-trolley-icon[data-group="ru"] .trolley-poster { fill: #dc2626; }
.day-cell .day-trolley-icon[data-group="ua"] .trolley-poster { fill: #2563eb; }
.day-cell .day-trolley-icon[data-group="de"] .trolley-poster { fill: #16a34a; }

@media (prefers-color-scheme: dark) {
  .trolley-card { background: var(--card-bg); }
  .trolley-card.active { background: var(--primary-container); }
  .day-cell .day-trolley-icon .trolley-frame { fill: #9ca3af; }
  .day-cell .day-trolley-icon .trolley-wheel-outer { fill: #d1d5db; }
}

/* Убираем устаревший текстовый значок тележки */
.day-cell .day-trolley { display: none; }
`;

  // ---------------------------------------------------------------------------
  // Публичные фабричные функции
  // ---------------------------------------------------------------------------

  /**
   * Возвращает HTML строку с полным SVG тележки.
   * @param {string} [group] — 'ru' | 'ua' | 'de' — цвет постера
   * @returns {string}
   */
  function getTrolleySVG(group) {
    return TROLLEY_SVG_DEF;
  }

  /**
   * Возвращает HTML строку с миниатюрным SVG тележки для ячейки календаря.
   * @returns {string}
   */
  function getMiniSVG() {
    return TROLLEY_MINI_SVG;
  }

  /**
   * Создаёт DOM-элемент карточки тележки (для пикера в редакторе дня).
   * @param {string} group — 'ru' | 'ua' | 'de'
   * @param {string} label — локализованная подпись
   * @param {Function} onClick — callback при выборе
   * @returns {HTMLElement}
   */
  function createTrolleyCard(group, label, onClick) {
    var card = document.createElement('div');
    card.className = 'trolley-card';
    card.dataset.group = group;
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    card.setAttribute('aria-label', label);

    card.innerHTML =
      '<span class="trolley-card-badge">' + group.toUpperCase() + '</span>' +
      getTrolleySVG(group) +
      '<span class="trolley-card-label">' + label + '</span>';

    function activate() {
      // Убираем активный у всех в том же пикере
      var siblings = card.parentNode ? card.parentNode.querySelectorAll('.trolley-card') : [];
      for (var i = 0; i < siblings.length; i++) siblings[i].classList.remove('active');
      card.classList.add('active');
      if (typeof onClick === 'function') onClick(group);
    }

    card.addEventListener('click', activate);
    card.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); activate(); }
    });

    return card;
  }

  /**
   * Создаёт DOM: <div class="trolley-picker"> с тремя карточками.
   * @param {{ ru: string, ua: string, de: string }} labels — локализованные подписи
   * @param {string} [currentValue] — текущее значение ('ru'|'ua'|'de')
   * @param {Function} onChange — вызывается с (group) при выборе
   * @returns {HTMLElement}
   */
  function createTrolleyPicker(labels, currentValue, onChange) {
    var picker = document.createElement('div');
    picker.className = 'trolley-picker';
    createTrolleyPicker._n = (createTrolleyPicker._n || 0) + 1;
    picker.id = 'trolleyPicker' + createTrolleyPicker._n;

    ['ru', 'ua', 'de'].forEach(function (g) {
      var card = createTrolleyCard(g, labels[g] || g.toUpperCase(), onChange);
      if (g === currentValue) card.classList.add('active');
      picker.appendChild(card);
    });

    return picker;
  }

  /**
   * Создаёт мини SVG-тележку для ячейки календаря.
   * @param {string} group — 'ru' | 'ua' | 'de'
   * @returns {HTMLElement} — svg element
   */
  function createMiniTrolleyIcon(group) {
    var wrapper = document.createElement('span');
    wrapper.className = 'day-trolley-icon';
    wrapper.dataset.group = group;
    wrapper.setAttribute('aria-hidden', 'true');
    wrapper.innerHTML = TROLLEY_MINI_SVG;
    return wrapper;
  }

  /**
   * Создаёт компактный пикер выбора языка тележки (3 карточки RU/UA/DE)
   * для блоков «Тележка №1» / «Тележка №2» во вкладке «Запись».
   * Каждый пикер — независимый (имеет свой id-суффикс).
   * @param {{ ru: string, ua: string, de: string }} labels — локализованные подписи
   * @param {string} [currentValue] — 'ru'|'ua'|'de'
   * @param {Function} [onChange] — вызывается с (group) при выборе
   * @returns {HTMLElement}
   */
  function createGroupPicker(labels, currentValue, onChange) {
    var picker = document.createElement('div');
    picker.className = 'trolley-group-picker';

    ['ru', 'ua', 'de'].forEach(function (g) {
      var card = document.createElement('div');
      card.className = 'trolley-card trolley-card--compact';
      card.dataset.group = g;
      card.setAttribute('role', 'button');
      card.setAttribute('tabindex', '0');
      card.setAttribute('aria-label', (labels && labels[g]) ? labels[g] : g.toUpperCase());

      card.innerHTML =
        '<span class="trolley-card-badge">' + g.toUpperCase() + '</span>' +
        getMiniSVG() +
        '<span class="trolley-card-label">' + ((labels && labels[g]) ? labels[g] : g.toUpperCase()) + '</span>';

      function activate() {
        var sibs = card.parentNode ? card.parentNode.querySelectorAll('.trolley-card') : [];
        for (var i = 0; i < sibs.length; i++) sibs[i].classList.remove('active');
        card.classList.add('active');
        if (typeof onChange === 'function') onChange(g);
      }
      card.addEventListener('click', activate);
      card.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); activate(); }
      });

      if (g === currentValue) card.classList.add('active');
      picker.appendChild(card);
    });

    return picker;
  }

  /**
   * Прочитать выбранный язык из пикера, вставленного в контейнер.
   * @param {HTMLElement|string} container — DOM-элемент или id
   * @returns {string|null} 'ru'|'ua'|'de'|null
   */
  function getGroupPickerValue(container) {
    var el = (typeof container === 'string') ? document.getElementById(container) : container;
    if (!el) return null;
    var active = el.querySelector('.trolley-card.active');
    return active ? (active.dataset.group || null) : null;
  }

  /**
   * Установить выбранный язык в пикере программно.
   * @param {HTMLElement|string} container — DOM-элемент или id
   * @param {string|null} group
   */
  function setGroupPickerValue(container, group) {
    var el = (typeof container === 'string') ? document.getElementById(container) : container;
    if (!el) return;
    var cards = el.querySelectorAll('.trolley-card');
    for (var i = 0; i < cards.length; i++) {
      cards[i].classList.toggle('active', cards[i].dataset.group === group);
    }
  }

  /**
   * Полностью пересоздать пикер внутри контейнера (удобно при смене локали).
   * @param {HTMLElement|string} container
   * @param {{ ru: string, ua: string, de: string }} labels
   * @param {string} [currentValue]
   * @param {Function} [onChange]
   */
  function renderGroupPicker(container, labels, currentValue, onChange) {
    var el = (typeof container === 'string') ? document.getElementById(container) : container;
    if (!el) return;
    el.innerHTML = '';
    el.appendChild(createGroupPicker(labels, currentValue, onChange));
  }

  /**
   * Получить текущий выбранный group из пикера.
   * @returns {string|null}
   */
  function getPickerValue() {
    var active = document.querySelector('#trolleyPicker .trolley-card.active');
    return active ? (active.dataset.group || null) : null;
  }

  /**
   * Установить значение в пикере программно (например, при открытии редактора).
   * @param {string|null} group
   */
  function setPickerValue(group) {
    var picker = document.getElementById('trolleyPicker');
    if (!picker) return;
    var cards = picker.querySelectorAll('.trolley-card');
    for (var i = 0; i < cards.length; i++) {
      cards[i].classList.toggle('active', cards[i].dataset.group === group);
    }
  }

  // ---------------------------------------------------------------------------
  // Инъекция CSS в <head> (один раз при загрузке скрипта)
  // ---------------------------------------------------------------------------
  function injectStyles() {
    if (document.getElementById('trolley-styles')) return;
    var style = document.createElement('style');
    style.id = 'trolley-styles';
    style.textContent = TROLLEY_CSS;
    document.head.appendChild(style);
  }

  // Автоматически внедряем стили
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectStyles);
  } else {
    injectStyles();
  }

  // ---------------------------------------------------------------------------
  // Экспорт глобального API
  // ---------------------------------------------------------------------------
  window.TrolleyUI = {
    getSVG: getTrolleySVG,
    getMiniSVG: getMiniSVG,
    createCard: createTrolleyCard,
    createPicker: createTrolleyPicker,
    createMiniIcon: createMiniTrolleyIcon,
    getPickerValue: getPickerValue,
    setPickerValue: setPickerValue,
    createGroupPicker: createGroupPicker,
    getGroupPickerValue: getGroupPickerValue,
    setGroupPickerValue: setGroupPickerValue,
    renderGroupPicker: renderGroupPicker
  };

})();

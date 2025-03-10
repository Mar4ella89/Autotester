// Функция добавления сообщения в отчет
function addToReport(message) {
  // Экранируем теги <noscript> и <iframe>
  const escapedMessage = escapeHTML(message);
  report.push(escapedMessage);
  console.log(message); // Выводим в консоль для отладки
}

// Функция поиска тега в реальном DOM (с учетом исключений)
function checkTag(tag, description) {
  if (tag === "iframe") {
    // Получаем все <iframe>, исключая те, у которых id="admin-frame"
    const iframes = [...document.querySelectorAll("iframe")].filter(
      (iframe) => iframe.id !== "admin-frame"
    );

    if (iframes.length > 0) {
      addToReport(`❌ ${description} найден`);
    }
  } else {
    const element = document.querySelector(tag);
    if (element) {
      addToReport(`❌ ${description} найден`);
    }
  }
}

// Функция поиска rel="preloader" и rel="preconnect"
function checkLinkRel(rel) {
  const link = document.querySelector(`link[rel="${rel}"]`);
  if (link) {
    addToReport(`❌ link[rel="${rel}"] найден`);
  } 
}

// Функция поиска тегов в закомментированном коде
function checkInComments() {
  const comments = [];

  // Рекурсивная функция для поиска комментариев
  function searchComments(node) {
    if (node.nodeType === Node.COMMENT_NODE) {
      comments.push(node.nodeValue);
    } else if (node.childNodes) {
      node.childNodes.forEach(searchComments);
    }
  }

  // Обход всей страницы и сбор комментариев
  searchComments(document);

  // Объединяем все комментарии в одну строку
  const commentContent = comments.join("\n");

  // Проверяем, есть ли внутри комментариев нужные теги
  const checks = [
    { regex: /<link[^>]*rel=["']?preloader["']?[^>]*>/i, name: 'link[rel="preloader"]' },
    { regex: /<link[^>]*rel=["']?preconnect["']?[^>]*>/i, name: 'link[rel="preconnect"]' },
    { regex: /<noscript>/i, name: '<noscript>' },
    { regex: /<iframe>/i, name: '<iframe>' }
  ];

  checks.forEach(({ regex, name }) => {
    if (regex.test(commentContent)) {
      addToReport(`⚠️ ${name} найден в комментариях`);
    } 
  });
}

// Функция проверки {_dmnd} и {_dmndf}
function checkDmndOrder() {
  const bodyContent = document.body.innerHTML;

  // Ищем все вхождения {_dmnd} и {_dmndf}
  const dmndMatches = [...bodyContent.matchAll(/{_dmnd}/g)];
  const dmndfMatches = [...bodyContent.matchAll(/{_dmndf}/g)];

  if (dmndMatches.length !== 1 || dmndfMatches.length !== 1) {
    addToReport("❌ Ошибка: Должно быть ровно 1 {_dmnd} и 1 {_dmndf}");
    return;
  }

  const dmndIndex = dmndMatches[0].index;
  const dmndfIndex = dmndfMatches[0].index;

  // Проверка на то, что {_dmnd} должен быть выше {_dmndf}
  if (dmndIndex > dmndfIndex) {
    addToReport("❌ Ошибка: {_dmnd} должен идти выше {_dmndf} в коде");
    return;
  }

  // Найдем все элементы <div> в документе
  const allDivs = [...document.querySelectorAll("div")];

  let dmndElement = null;
  let dmndfElement = null;

  // Определяем расположение элементов {_dmnd} и {_dmndf}
  allDivs.forEach((div) => {
    if (div.innerHTML.includes("{_dmnd}")) {
      dmndElement = div;
    }
    if (div.innerHTML.includes("{_dmndf}")) {
      dmndfElement = div;
    }
  });

  if (!dmndElement || !dmndfElement) {
    addToReport("❌ Ошибка: Не найдены элементы {_dmnd} или {_dmndf}");
    return;
  }

  // Проверяем, что между {_dmnd} и {_dmndf} есть другие элементы
  let sibling = dmndElement.nextElementSibling;
  let hasValidContentBetween = false;

  while (sibling && sibling !== dmndfElement) {
    if (sibling.tagName !== "DIV" || sibling.textContent.trim().length > 0) {
      hasValidContentBetween = true;
      break;
    }
    sibling = sibling.nextElementSibling;
  }

  if (!hasValidContentBetween) {
    addToReport("❌ Ошибка: {_dmnd} и {_dmndf} не должны идти подряд");
    return;
  }

  addToReport("✅ {_dmnd} и {_dmndf} расположены корректно");
}


// Основная функция запуска тестов
function runTests() {
  addToReport("=== Начало тестов ===");

  checkLinkRel("preloader");
  checkLinkRel("preconnect");
  checkTag("noscript", "<noscript>");
  checkTag("iframe", "<iframe>");
  checkInComments();
  checkDmndOrder(); // Новая проверка на {_dmnd} и {_dmndf}

  addToReport("=== Конец тестов ===");

  // Возвращаем собранный отчет
  return report.join("\n");
}

// Функция создания модального окна
function showModalReport(report) {
  injectStyles(); // Подключаем стили для модального окна

  // Создаем HTML модального окна
  const modalHTML = `
    <div id="autotest-modal" class="modal-overlay">
      <div class="modal-content">
        <span class="close-button">&times;</span>
        <h2>🛠️ Результаты тестирования</h2>
        <pre class="modal-report">${report}</pre>
        <button class="ok-button">ОК</button>
      </div>
    </div>
  `;

  // Добавляем модальное окно в body
  document.body.insertAdjacentHTML("beforeend", modalHTML);

  // Получаем элементы окна
  const modal = document.getElementById("autotest-modal");
  const closeButton = modal.querySelector(".close-button");
  const okButton = modal.querySelector(".ok-button");

  // Функция закрытия окна
  function closeModal() {
    modal.remove();
    removeScriptTag(); // Удаляем тег <script>
  }

  // События закрытия окна
  closeButton.addEventListener("click", closeModal);
  okButton.addEventListener("click", closeModal);
  modal.addEventListener("click", (event) => {
    if (event.target === modal) closeModal();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeModal();
  });
}

// Функция удаления тега <script>
function removeScriptTag() {
  const scriptTag = document.querySelector('script[src="./autotest.js"]');
  if (scriptTag) scriptTag.remove();
}

// Функция инжекта стилей для модального окна
function injectStyles() {
  const style = document.createElement("style");
  style.innerHTML = `
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.6);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
    }
    .modal-content {
      background: white;
      padding: 20px;
      border-radius: 8px;
      width: 400px;
      max-width: 90%;
      text-align: center;
      box-shadow: 0px 5px 15px rgba(0, 0, 0, 0.3);
      position: relative;
    }
    .modal-content h2 {
      margin-bottom: 15px;
      font-size: 18px;
    }
    .close-button {
      position: absolute;
      top: 10px;
      right: 15px;
      font-size: 20px;
      cursor: pointer;
    }
    .modal-report {
      background: #f5f5f5;
      padding: 10px;
      border-radius: 5px;
      font-size: 14px;
      max-height: 200px;
      overflow-y: auto;
      text-align: left;
    }
    .ok-button {
      margin-top: 10px;
      padding: 8px 15px;
      background: #007bff;
      color: white;
      border: none;
      border-radius: 5px;
      cursor: pointer;
    }
    .ok-button:hover {
      background: #0056b3;
    }
  `;
  document.head.appendChild(style);
}

// Запуск после загрузки страницы
document.addEventListener("DOMContentLoaded", () => {
  const report = runTests();
  showModalReport(report);
});

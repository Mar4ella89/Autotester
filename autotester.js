// Функция поиска тега в реальном DOM
function checkTag(tag, description) {
    const element = document.querySelector(tag);
    if (element) {
      console.log(`${description} найден ❌`);
    } 
  }
  
  // Функция поиска rel="preloader" и rel="preconnect"
  function checkLinkRel(rel) {
    const link = document.querySelector(`link[rel="${rel}"]`);
    if (link) {
      console.log(`link[rel="${rel}"] найден ❌`);
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
        console.log(`${name} найден в комментариях ⚠️`);
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
      console.log("❌ Ошибка: Должно быть ровно 1 {_dmnd} и 1 {_dmndf}");
      return;
    }
  
    const dmndIndex = dmndMatches[0].index;
    const dmndfIndex = dmndfMatches[0].index;
  
    if (dmndIndex > dmndfIndex) {
      console.log("❌ Ошибка: {_dmnd} должен идти выше {_dmndf} в коде");
      return;
    }
  
    // Проверка на последовательность (они не должны быть рядом)
    const betweenContent = bodyContent.slice(dmndIndex + 7, dmndfIndex).trim(); // 7 - длина строки "{_dmnd}"
    if (betweenContent.length === 0) {
      console.log("❌ Ошибка: {_dmnd} и {_dmndf} не должны идти подряд");
      return;
    }
  
    console.log("✅ {_dmnd} и {_dmndf} расположены корректно");
  }
  
  // Основная функция запуска тестов
  function runTests() {
    console.log("=== Начало тестов ===");
  
    checkLinkRel("preloader");
    checkLinkRel("preconnect");
    checkTag("noscript", "<noscript>");
    checkTag("iframe", "<iframe>");
    checkInComments();
    checkDmndOrder(); // Новая проверка на {_dmnd} и {_dmndf}
  
    console.log("=== Конец тестов ===");
  }
  
  // Запуск после загрузки страницы
  document.addEventListener("DOMContentLoaded", runTests);
  
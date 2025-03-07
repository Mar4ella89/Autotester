console.log("Autotester is started!")

// Проверка наличия rel="preloader"
function checkPreloader() {
    const preloader = document.querySelector('link[rel="preloader"]');
    if (preloader) {
      console.log('Предзагрузчик найден!');
    } else {
      console.log('Предзагрузчик не найден.');
    }
  }
  
  // Проверка наличия rel="preconnect"
  function checkPreconnect() {
    const preconnect = document.querySelector('link[rel="preconnect"]');
    if (preconnect) {
      console.log('Preconnect найден!');
    } else {
      console.log('Preconnect не найден.');
    }
  }

  // Проверка наличия <noscript>
function checkNoscript() {
    const noscript = document.querySelector('noscript');
    if (noscript) {
      console.log('<noscript> найден!');
    } else {
      console.log('<noscript> не найден.');
    }
  }

  // Проверка наличия <iframe>
function checkIframe() {
    const iframe = document.querySelector('iframe');
    if (iframe) {
      console.log('<iframe> найден!');
    } else {
      console.log('<iframe> не найден.');
    }
  }

  // Вызов всех проверок
function runTests() {
    checkPreloader();
    checkPreconnect();
    checkNoscript();
    checkIframe();
  }
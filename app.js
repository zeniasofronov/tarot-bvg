// === Предсказание BVG ===
// Все тексты карт лежат в cards.json — этот файл их только показывает.

(function () {
  'use strict';

  // Шуточные дисклеймеры — один выбирается случайно при каждом гадании
  var DISCLAIMERS = [
    'Предсказание не одобрено BVG и не имеет юридической силы при опоздании на работу.',
    'BVG не несёт ответственности за пророчества звёзд, равно как и за расписание.',
    'Любые совпадения с реальным движением транспорта случайны и, вероятно, временны.',
    'Карты говорят правду чаще, чем табло на платформе. Но это не гарантия.',
    'Предсказание действительно во всех тарифных зонах A, B и C, но ни к чему вас не обязывает.',
    'BVG оставляет за собой право задержать сбычу пророчества по эксплуатационным причинам.',
    'Звёзды не возвращают деньги за билет в случае неточного предсказания.',
    'При расхождении пророчества с реальностью верным считается расписание. Изредка.',
    'Сбычность предсказания зависит от воли высших сил и состояния путей.',
    'Ни одна карта не пострадала при составлении предсказания. В отличие от вашего расписания.',
    'Данное гадание не заменяет приложение Fahrinfo и здравый смысл.',
    'Предсказание не является официальной коммуникацией BVG, машинистов и духов перрона.'
  ];

  var cards = [];

  // DOM
  var errorBox      = document.getElementById('error-box');
  var errorText     = document.getElementById('error-text');
  var deckStage     = document.getElementById('deck-stage');
  var deck          = document.getElementById('deck');
  var resultStage   = document.getElementById('result-stage');
  var drawnCard     = document.getElementById('drawn-card');
  var cardInner     = drawnCard.querySelector('.card-inner');
  var cardImage     = document.getElementById('card-image');
  var cardEmblem    = drawnCard.querySelector('.card-emblem');
  var cardTitle     = document.getElementById('card-title');
  var prophecy      = document.getElementById('prophecy');
  var prophecyName  = document.getElementById('prophecy-name');
  var prophecyOri   = document.getElementById('prophecy-orientation');
  var prophecyText  = document.getElementById('prophecy-text');
  var disclaimerEl  = document.getElementById('disclaimer');
  var againBtn      = document.getElementById('again-btn');

  var DECK_SIZE = 13; // сколько карт в веере (рубашкой вверх)

  function showError(message) {
    errorText.textContent = message;
    errorBox.hidden = false;
    deckStage.hidden = true;
    resultStage.hidden = true;
  }

  function randInt(n) { return Math.floor(Math.random() * n); }

  // Загрузка колоды
  fetch('cards.json', { cache: 'no-store' })
    .then(function (res) {
      if (!res.ok) {
        throw new Error('Не удалось загрузить cards.json (код ' + res.status + ').');
      }
      return res.text();
    })
    .then(function (raw) {
      var data;
      try {
        data = JSON.parse(raw);
      } catch (e) {
        throw new Error('Файл cards.json содержит ошибку и не читается. Проверь запятые и кавычки.');
      }
      if (!Array.isArray(data) || data.length === 0) {
        throw new Error('В cards.json нет ни одной карты.');
      }
      // Берём только карты с обязательными текстами
      cards = data.filter(function (c) {
        return c && c.name && c.upright && c.reversed;
      });
      if (cards.length === 0) {
        throw new Error('В картах не хватает обязательных полей (name, upright, reversed).');
      }
      buildDeck();
      showDeck();
    })
    .catch(function (err) {
      showError(err.message || 'Звёзды сегодня недоступны. Попробуй обновить страницу.');
    });

  // Построение веера рубашкой вверх
  function buildDeck() {
    deck.innerHTML = '';
    var spread = 14;                 // угол между картами, градусов
    var start  = -((DECK_SIZE - 1) / 2) * spread;

    for (var i = 0; i < DECK_SIZE; i++) {
      var angle = start + i * spread;
      var lift  = -Math.abs(angle) * 1.1; // приподнимаем края веера

      var card = document.createElement('button');
      card.type = 'button';
      card.className = 'deck-card';
      card.setAttribute('aria-label', 'Вытянуть карту');
      card.style.transform = 'rotate(' + angle + 'deg) translateY(' + lift + 'px)';
      card.style.zIndex = i;
      // при наведении карта чуть выезжает вверх, сохраняя свой угол
      card.style.setProperty('--hover-transform',
        'rotate(' + angle + 'deg) translateY(' + (lift - 26) + 'px) scale(1.06)');

      var art = document.createElement('div');
      art.className = 'card-back-art';
      card.appendChild(art);

      card.addEventListener('click', drawCard);
      deck.appendChild(card);
    }
  }

  function showDeck() {
    errorBox.hidden = true;
    resultStage.hidden = true;
    deckStage.hidden = false;
  }

  // Гадание
  function drawCard() {
    var card = cards[randInt(cards.length)];
    var isReversed = Math.random() < 0.5;

    // Заполняем лицо карты
    cardTitle.textContent = card.name;
    cardEmblem.textContent = card.emblem || '☾'; // свой значок карты (☾ — запасной)
    if (card.image) {
      cardImage.src = card.image;
      cardImage.alt = card.name;
      cardImage.hidden = false;
      // если картинки пока нет — прячем тег, остаётся эмблема + название
      cardImage.onerror = function () { cardImage.hidden = true; };
    } else {
      cardImage.hidden = true;
    }

    // Заполняем блок предсказания
    prophecyName.textContent = card.name;
    if (isReversed) {
      prophecyOri.textContent = 'перевёрнутая';
      prophecyOri.classList.add('is-reversed');
      prophecyText.textContent = card.reversed;
    } else {
      prophecyOri.textContent = 'прямая';
      prophecyOri.classList.remove('is-reversed');
      prophecyText.textContent = card.upright;
    }
    disclaimerEl.textContent = DISCLAIMERS[randInt(DISCLAIMERS.length)];

    // Переключаем сцены
    deckStage.hidden = true;
    resultStage.hidden = false;
    prophecy.hidden = true;

    // Сброс состояния карты
    drawnCard.classList.remove('revealed', 'reversed', 'faceup');
    cardInner.style.transition = 'none';
    cardInner.style.transform = 'rotateY(0deg)';
    void drawnCard.offsetWidth; // форсируем reflow для рестарта анимаций

    // Помечаем ориентацию заранее (лицо повернётся в CSS)
    if (isReversed) drawnCard.classList.add('reversed');

    // 1) Карта прилетает в центр рубашкой вверх
    drawnCard.classList.add('revealed');

    // 2) Переворот: ребром (rotateY 90°) -> смена грани -> обратно лицом
    window.setTimeout(function () {
      cardInner.style.transition = '';            // вернуть transition из CSS
      cardInner.style.transform = 'rotateY(90deg)';
    }, 460);

    window.setTimeout(function () {
      drawnCard.classList.add('faceup');           // показать лицо
      cardInner.style.transform = 'rotateY(0deg)';
    }, 800);

    // 3) Текст предсказания — после завершения переворота
    window.setTimeout(function () {
      prophecy.hidden = false;
    }, 1120);
  }

  againBtn.addEventListener('click', function () {
    drawnCard.classList.remove('revealed', 'reversed', 'faceup');
    cardInner.style.transition = 'none';
    cardInner.style.transform = 'rotateY(0deg)';
    prophecy.hidden = true;
    showDeck();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();

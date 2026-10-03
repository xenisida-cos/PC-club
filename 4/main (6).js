// Данные (цены условные, заменить реальными)
const zones = {
  Standard: {
    rank: 'E',
    price: 90,
    gpu: 60,
    hz: 60,
    desc: 'RTX 3060, 144 Гц',
    seats: 24,
    accent: '#3de6ff',
    purpose: 'Для знакомства с клубом и спокойных игровых сессий.',
  },
  Pro: {
    rank: 'C',
    price: 130,
    gpu: 80,
    hz: 100,
    desc: 'RTX 4070, 240 Гц',
    seats: 24,
    accent: '#4f8cff',
    purpose: 'Для соревновательных матчей и точной реакции.',
  },
  'Team Room': {
    rank: 'A',
    price: 600,
    gpu: 80,
    hz: 100,
    desc: 'RTX 4070, 240 Гц, 5 шт',
    seats: 5,
    accent: '#b57bff',
    purpose: 'Отдельное пространство для командных тренировок.',
  },
  VIP: {
    rank: 'S',
    price: 220,
    gpu: 100,
    hz: 100,
    desc: 'RTX 4080, 240 Гц, кресла премиум',
    seats: 12,
    accent: '#ff63bd',
    purpose: 'Максимальная конфигурация и премиальный комфорт.',
  },
};
const reviews = [
  {
    nick: 'Shadow_77',
    lvl: 'Уровень 24',
    stars: 5,
    text: 'Лучший пинг в городе, мониторы огонь. Хожу каждые выходные.',
  },
  {
    nick: 'NeoKat',
    lvl: 'Уровень 12',
    stars: 5,
    text: 'Брали Team Room на тренировку. Тихо, удобно, кофе рядом.',
  },
  {
    nick: 'Mr_Rook',
    lvl: 'Уровень 8',
    stars: 4,
    text: 'После работы захожу на пару часов: тихо, комфортно, а администратор всегда рядом.',
  },
];
const $ = (s) => document.querySelector(s);
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const state = { zone: 'Standard', seat: null, step: 1 };
let languageReady = false;
let calmMode = (() => {
  try {
    return localStorage.getItem('awk-calm') === '1';
  } catch (e) {
    return false;
  }
})();
let consoleMessageKey = 'Система готова. Выберите зону.';
let consoleMessageValue = '';

// Загрузчик
const visited = (() => {
  try {
    return localStorage.getItem('awk');
  } catch (e) {
    return null;
  }
})();
function finishLoad() {
  $('#loader').classList.add('done');
  if (!reduced) {
    $('#h1').classList.add('run');
  }
  try {
    localStorage.setItem('awk', '1');
  } catch (e) {}
}
if (visited || reduced) finishLoad();
else {
  let p = 0;
  const t = setInterval(() => {
    p += 5;
    $('#loadBar').style.width = p + '%';
    if (p >= 100) {
      clearInterval(t);
      setTimeout(finishLoad, 200);
    }
  }, 80);
}

// Шапка, меню, scroll-spy
const header = $('#top'),
  nav = $('#nav');
const scrollProgress = $('#scrollProgress');
let scrollFrame = 0;
function updateScrollProgress() {
  const max = document.documentElement.scrollHeight - innerHeight;
  const value = max > 0 ? Math.round((scrollY / max) * 100) : 0;
  scrollProgress.style.setProperty('--scroll-progress', `${value}%`);
  scrollProgress.setAttribute('aria-valuenow', String(value));
  scrollFrame = 0;
}
addEventListener(
  'scroll',
  () => {
    header.classList.toggle('small', scrollY > 40);
    if (!scrollFrame) scrollFrame = requestAnimationFrame(updateScrollProgress);
  },
  { passive: true },
);
addEventListener('resize', () => {
  if (!scrollFrame) scrollFrame = requestAnimationFrame(updateScrollProgress);
});
updateScrollProgress();
$('#burger').onclick = () =>
  $('#burger').setAttribute('aria-expanded', nav.classList.toggle('open'));
nav.onclick = () => {
  nav.classList.remove('open');
  $('#burger').setAttribute('aria-expanded', 'false');
};
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && nav.classList.contains('open')) {
    nav.classList.remove('open');
    $('#burger').setAttribute('aria-expanded', 'false');
    $('#burger').focus();
  }
});
const hero = $('#hero');
if (!reduced && matchMedia('(pointer: fine)').matches) {
  let pointerFrame = 0,
    pointerX = 0,
    pointerY = 0;
  hero.addEventListener('pointermove', (e) => {
    if (calmMode) return;
    pointerX = (e.clientX / innerWidth - 0.5) * 2;
    pointerY = (e.clientY / innerHeight - 0.5) * 2;
    if (pointerFrame) return;
    pointerFrame = requestAnimationFrame(() => {
      hero.style.setProperty('--hero-grid-x', `${pointerX * -5}px`);
      hero.style.setProperty('--hero-grid-y', `${pointerY * -5}px`);
      hero.style.setProperty('--hero-setup-x', `${pointerX * -7}px`);
      hero.style.setProperty('--hero-setup-y', `${pointerY * -5}px`);
      pointerFrame = 0;
    });
  });
  hero.addEventListener('pointerleave', () => {
    hero.style.setProperty('--hero-grid-x', '0px');
    hero.style.setProperty('--hero-grid-y', '0px');
    hero.style.setProperty('--hero-setup-x', '0px');
    hero.style.setProperty('--hero-setup-y', '0px');
  });
}
const spy = new IntersectionObserver(
  (es) =>
    es.forEach((e) => {
      if (e.isIntersecting)
        document.querySelectorAll('nav a').forEach((a) => {
          const active = a.hash === '#' + e.target.id;
          a.classList.toggle('active', active);
          if (active) a.setAttribute('aria-current', 'location');
          else a.removeAttribute('aria-current');
        });
      if (e.isIntersecting) {
        const messages = {
          hero: 'Система готова. Выберите зону.',
          tariffs: 'Открыт каталог тарифов.',
          zones: 'Открыта схема игровых зон.',
          map: 'Открыта миссия бронирования.',
          adv: 'Просмотр преимуществ AWAKEN.',
          reviews: 'Открыты отзывы игроков.',
          contacts: 'Система готова. Выберите зону.',
        };
        if (messages[e.target.id]) setConsoleMessage(messages[e.target.id]);
      }
    }),
  { rootMargin: '-50% 0px -50% 0px' },
);
document.querySelectorAll('section').forEach((s) => spy.observe(s));

// Появление блоков и счётчики
const io = new IntersectionObserver(
  (es) =>
    es.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add('in');
      io.unobserve(e.target);
      if (e.target.dataset.to) countUp(e.target);
    }),
  { threshold: 0.2 },
);
function countUp(el) {
  const to = +el.dataset.to;
  let n = 0;
  const t = setInterval(() => {
    n += Math.ceil(to / 30);
    if (n >= to) {
      n = to;
      clearInterval(t);
    }
    el.textContent = n;
  }, 40);
}
document.querySelectorAll('.panel, .num').forEach((el, i) => {
  if (!el.classList.contains('num')) el.classList.add('reveal');
  el.style.transitionDelay = (i % 3) * 80 + 'ms';
  io.observe(el);
});

// Увеличенный просмотр карточек и иллюстраций
const expandDialog = document.createElement('dialog');
expandDialog.className = 'expand-dialog';
expandDialog.innerHTML =
  '<div class="expand-title">СТАТУС</div><div class="expand-side expand-side-left" aria-hidden="true"><i class="side-joint-top"></i><i class="side-joint-bottom"></i><b></b></div><div class="expand-side expand-side-right" aria-hidden="true"><i class="side-joint-top"></i><i class="side-joint-bottom"></i><b></b></div><button class="expand-close" type="button" aria-label="Закрыть увеличенный просмотр">×</button><div class="expanded-content"></div>';
document.body.append(expandDialog);
const expandedContent = expandDialog.querySelector('.expanded-content');
const expandClose = expandDialog.querySelector('.expand-close');
let expandedCopyId = 0;
let isClosingExpandedDialog = false;

function closeExpandedDialog() {
  if (!expandDialog.open || isClosingExpandedDialog) return;
  if (reduced) {
    expandDialog.close();
    return;
  }
  isClosingExpandedDialog = true;
  expandDialog.classList.add('closing');
}

function openExpandedCard(card) {
  const copy = card.cloneNode(true);
  copy.classList.remove('reveal', 'in');
  copy.classList.remove('expandable-card');
  copy.classList.add('expanded-panel');
  copy.removeAttribute('role');
  copy.removeAttribute('tabindex');
  copy.removeAttribute('aria-haspopup');
  copy.querySelectorAll('.reveal').forEach((el) => el.classList.remove('reveal', 'in'));

  const idPrefix = `expanded-${++expandedCopyId}-`;
  const idMap = new Map();
  copy.querySelectorAll('[id]').forEach((el) => {
    const oldId = el.id;
    el.id = idPrefix + oldId;
    idMap.set(oldId, el.id);
  });
  [copy, ...copy.querySelectorAll('*')].forEach((el) => {
    for (const attr of el.attributes) {
      let value = attr.value.replace(/url\(#([^)]+)\)/g, (match, id) =>
        idMap.has(id) ? `url(#${idMap.get(id)})` : match,
      );
      if ((attr.name === 'href' || attr.name === 'xlink:href') && value.startsWith('#')) {
        value = `#${idMap.get(value.slice(1)) || value.slice(1)}`;
      }
      if (attr.name === 'aria-labelledby' || attr.name === 'aria-describedby') {
        value = value
          .split(/\s+/)
          .map((id) => idMap.get(id) || id)
          .join(' ');
      }
      el.setAttribute(attr.name, value);
    }
  });

  expandedContent.replaceChildren(copy);
  expandDialog.setAttribute(
    'aria-label',
    card.querySelector('h3')?.textContent.trim() ||
      card.querySelector('.tag')?.textContent.trim() ||
      'Увеличенный просмотр',
  );
  isClosingExpandedDialog = false;
  expandDialog.classList.remove('closing');
  expandDialog.showModal();
  expandClose.focus();
}

document
  .querySelectorAll('#about .photo, #adv .grid3 > .panel, #quests .grid3 > .panel, #contacts .map')
  .forEach((card) => {
    card.classList.add('expandable-card');
    card.tabIndex = 0;
    card.setAttribute('role', 'button');
    card.setAttribute('aria-haspopup', 'dialog');
    card.addEventListener('click', () => openExpandedCard(card));
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openExpandedCard(card);
      }
    });
  });

expandClose.addEventListener('click', closeExpandedDialog);
expandDialog.addEventListener('click', (e) => {
  if (e.target === expandDialog) closeExpandedDialog();
});
expandDialog.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    e.preventDefault();
    closeExpandedDialog();
  }
});
expandDialog.addEventListener('animationend', (e) => {
  if (e.target === expandDialog && e.animationName === 'expand-out' && isClosingExpandedDialog) {
    expandDialog.close();
  }
});
expandDialog.addEventListener('close', () => {
  isClosingExpandedDialog = false;
  expandDialog.classList.remove('closing');
  expandedContent.replaceChildren();
});

// Тарифы
const tg = $('#tariffGrid');
Object.entries(zones).forEach(([name, z]) => {
  const d = document.createElement('div');
  d.className = 'panel tariff reveal' + (z.rank === 'S' ? ' s' : '');
  d.style.setProperty('--zone-accent', z.accent);
  d.innerHTML = `<div class="rank">${z.rank}</div><h3>${name}</h3>
    <div class="price">${name === 'Team Room' ? '600 ₴/час' : z.price + ' ₴/час'}</div>
    <p class="muted">${z.desc}</p>
    <p class="tariff-purpose">${z.purpose}</p>
    <div class="more"><div class="more-content">Включено: игры из библиотеки клуба, вода. Ограничения: 16+ после 22:00.<br><br>
    <button class="btn ${z.rank === 'S' ? 'vip' : ''}" data-zone="${name}">Выбрать</button></div></div>`;
  d.querySelector('[data-zone]').onclick = (e) => {
    e.stopPropagation();
    setZone(name);
    history.replaceState(null, '', '#map');
    $('#map').scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' });
  };
  d.onclick = () => {
    const open = !d.classList.contains('open');
    tg.querySelectorAll('.tariff.open').forEach((tariff) => {
      tariff.classList.remove('open');
    });
    if (open) d.classList.add('open');
  };
  tg.append(d);
  io.observe(d);
});

// Зоны
function drawZone() {
  const z = zones[state.zone];
  const zoneClass = `zone-${state.zone.toLowerCase().replace(/\s+/g, '-')}`;
  $('#zoneCard').classList.remove('zone-standard', 'zone-pro', 'zone-team-room', 'zone-vip');
  $('#zoneCard').classList.add(zoneClass);
  $('#zoneCard').style.setProperty('--zone-accent', z.accent);
  $('#zoneCard').style.setProperty('--k', z.accent);
  $('#zoneCard').innerHTML =
    `<div class="plate mono">СТАТУС</div><div class="lvl"><b>${z.rank}</b><span class="mono">РАНГ</span></div><div class="jt mono"><span>ЗОНА</span><b>${state.zone}</b><span>ЦЕНА</span><b>${z.price} ₴/час</b></div>
    <p class="zone-purpose">${z.purpose}</p>
    <p class="zone-metric-note mono">${languageReady ? tr('Характеристики комплектации, не результаты тестирования') : 'Характеристики комплектации, не результаты тестирования'}</p>
    <div class="stat mono"><span>GPU</span><em>${z.desc.split(',')[0]}</em></div>
    <div class="stat mono"><span>Экран</span><em>${z.desc.split(',')[1] || ''}</em></div>
    <div class="stat mono"><span>Места</span><em>${z.seats} шт</em></div>`;
  document.querySelectorAll('#zoneTabs button').forEach((b) => {
    const selected = b.textContent === state.zone;
    b.classList.toggle('on', selected);
    b.setAttribute('aria-pressed', String(selected));
  });
  document.querySelectorAll('#tariffGrid .tariff').forEach((card) => {
    const selected = card.querySelector('[data-zone]')?.dataset.zone === state.zone;
    card.classList.toggle('zone-selected', selected);
    card.setAttribute('aria-current', String(selected));
  });
}
Object.keys(zones).forEach((n) => {
  const b = document.createElement('button');
  b.textContent = n;
  b.type = 'button';
  b.style.setProperty('--zone-accent', zones[n].accent);
  b.setAttribute('aria-pressed', 'false');
  b.onclick = () => setZone(n);
  $('#zoneTabs').append(b);
  $('#fZone').append(new Option(n, n));
});
function setZone(n) {
  const changed = state.zone !== n;
  state.zone = n;
  state.seat = null;
  $('#fZone').value = n;
  drawZone();
  drawSeats();
  calc();
  if (changed && languageReady) setConsoleMessage(`Выбрана зона: ${n}`);
  if (changed) playUiCue('zone');
}
$('#fZone').onchange = (e) => setZone(e.target.value);

// Бронирование
const times = $('#fTime');
for (let h = 0; h < 24; h++)
  ['00', '30'].forEach((m) => times.append(new Option(`${String(h).padStart(2, '0')}:${m}`)));
times.value = '19:00';
const localISO = (d = new Date()) =>
  new Date(d.getTime() - d.getTimezoneOffset() * 6e4).toISOString().slice(0, 10);
$('#fDate').min = $('#fDate').value = localISO();
$('#fDate').max = localISO(new Date(Date.now() + 30 * 864e5));

function calc() {
  const z = zones[state.zone];
  const sum = z.price * $('#fDur').value * $('#fTariff').value;
  $('#total').textContent = 'ИТОГО: ' + Math.round(sum) + ' ₴';
  refreshBookingSummary();
}
['#fTariff', '#fDur'].forEach((s) => ($(s).onchange = calc));
['#fDate', '#fTime', '#fDur', '#fTariff'].forEach((s) =>
  $(s).addEventListener('change', refreshBookingSummary),
);

const missionTitles = ['Выбор зоны', 'Время и тариф', 'Выбор места', 'Данные игрока'];
const completeDialog = $('#bookingComplete');
let bookingDialogReturnFocus = null;
function refreshBookingSummary() {
  if (!languageReady) return;
  const locale = ['ru', 'uk', 'en'][LI];
  const dateValue = $('#fDate').value;
  const date = dateValue
    ? new Date(`${dateValue}T12:00:00`).toLocaleDateString(locale, {
        day: 'numeric',
        month: 'short',
      })
    : tr('Не выбрано');
  const sum = zones[state.zone].price * $('#fDur').value * $('#fTariff').value;
  $('#missionTitle').textContent = tr(missionTitles[state.step - 1]);
  $('#summaryZone').textContent = state.zone;
  $('#summaryRate').textContent = $('#fTariff').selectedOptions[0]?.textContent || tr('Не выбрано');
  $('#summaryDate').textContent = `${date} · ${$('#fTime').value}`;
  $('#summaryDuration').textContent = tr(`${$('#fDur').value} ч`);
  $('#summarySeat').textContent = state.seat ? `#${state.seat}` : tr('Не выбрано');
  $('#summaryTotal').textContent = `${new Intl.NumberFormat(locale).format(Math.round(sum))} ₴`;
  $('#mobileSummaryZone').textContent = state.zone;
  $('#mobileSummarySeat').textContent = tr('Место') + ' ' + (state.seat ? `#${state.seat}` : '—');
  $('#mobileSummaryTotal').textContent =
    `${new Intl.NumberFormat(locale).format(Math.round(sum))} ₴`;
}

function isBusy(i) {
  // условная занятость, на деле её отдаёт сервер
  const seed = i * 7 + $('#fTime').selectedIndex + state.zone.length;
  return seed % 4 === 0;
}
function drawSeats() {
  const box = $('#seats');
  box.innerHTML = '';
  box.style.setProperty('--zone-accent', zones[state.zone].accent);
  for (let i = 1; i <= zones[state.zone].seats; i++) {
    const b = document.createElement('button');
    b.className = 'seat';
    b.textContent = i;
    if (isBusy(i)) {
      b.classList.add('busy');
      b.disabled = true;
      if (state.seat === i) state.seat = null;
    }
    if (state.seat === i) b.classList.add('sel');
    b.onclick = () => {
      state.seat = i;
      drawSeats();
      $('#seatInfo').textContent = `Место ${i}, ${state.zone}, ${zones[state.zone].desc}`;
      refreshBookingSummary();
      playUiCue('seat');
    };
    box.append(b);
  }
  const free = box.querySelectorAll('.seat:not(.busy)').length,
    k = state.zone + $('#fTime').value;
  if (free && free <= 2 && state.step === 3 && warnKey !== k) {
    warnKey = k;
    toast(`[ ВНИМАНИЕ ] Осталось ${free} своб. места на это время`, true);
  }
  refreshBookingSummary();
}
$('#fTime').onchange = drawSeats;

function showStep() {
  document.querySelectorAll('.step').forEach((s) => (s.hidden = +s.dataset.step !== state.step));
  setConsoleMessage(`Этап бронирования: ${state.step} / 4`);
  $('#stepLabel').textContent = `ШАГ ${state.step} / 4`;
  $('#stepBar').style.width = state.step * 25 + '%';
  $('#back').style.visibility = state.step === 1 ? 'hidden' : 'visible';
  $('#forward').textContent = state.step === 4 ? 'Подтвердить бронь' : 'Далее';
  document.querySelectorAll('[data-mission-step]').forEach((item) => {
    const step = +item.dataset.missionStep;
    item.classList.toggle('current', step === state.step);
    item.classList.toggle('complete', step < state.step);
    if (step === state.step) item.setAttribute('aria-current', 'step');
    else item.removeAttribute('aria-current');
  });
  if (state.step === 3) drawSeats();
  refreshBookingSummary();
}
function valid() {
  const err = $('#err');
  err.textContent = '';
  document.querySelectorAll('.invalid').forEach((x) => x.classList.remove('invalid'));
  if (state.step === 3 && !state.seat) {
    err.textContent = 'Выберите свободное место';
    return false;
  }
  if (state.step === 4) {
    if (!$('#fName').value.trim()) {
      err.textContent = 'Заполните это поле: имя';
      mark('#fName');
      return false;
    }
    if ($('#fPhone').value.replace(/\D/g, '').length < 10) {
      err.textContent = 'Проверьте номер: он должен содержать 10 цифр';
      mark('#fPhone');
      return false;
    }
    if ($('#fEmail').value && !/^\S+@\S+\.\S+$/.test($('#fEmail').value)) {
      err.textContent = 'Проверьте email';
      mark('#fEmail');
      return false;
    }
    if (!$('#fAgree').checked) {
      err.textContent = 'Нужно согласие на обработку данных';
      return false;
    }
  }
  return true;
}
$('#back').onclick = () => {
  state.step--;
  showStep();
};
$('#forward').onclick = () => {
  if (!valid()) return;
  if ($('#hp').value) return; // honeypot, бот
  if (state.step < 4) {
    state.step++;
    showStep();
    return;
  }
  lastBooking = {
    seat: state.seat,
    zone: state.zone,
    date: $('#fDate').value,
    time: $('#fTime').value,
    dur: +$('#fDur').value,
    rate: +$('#fTariff').value,
  };
  saveB(lastBooking);
  setConsoleMessage('Бронирование подтверждено.');
  showBookingComplete(lastBooking);
  playUiCue('complete');
  if (navigator.vibrate) navigator.vibrate(100);
  state.step = 1;
  state.seat = null;
  showStep();
};
$('#back').addEventListener('click', () => {
  if (state.step < 4) playUiCue('back');
});
$('#forward').addEventListener('click', () => {
  if (!$('#err').textContent && state.step > 1 && state.step < 4) playUiCue('step');
});

function formatBookingDate(booking) {
  const locale = ['ru', 'uk', 'en'][LI];
  return new Date(`${booking.date}T12:00:00`).toLocaleDateString(locale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}
function showBookingComplete(booking) {
  const locale = ['ru', 'uk', 'en'][LI];
  $('#completeMessage').textContent = tr('Твоё место уже в системе. Увидимся в игре!');
  $('#completeZone').textContent = booking.zone;
  $('#completeSeat').textContent = `#${booking.seat}`;
  $('#completeDate').textContent = `${formatBookingDate(booking)} · ${booking.time}`;
  $('#completeDuration').textContent = tr(`${booking.dur} ч`);
  $('#completeTotal').textContent = `${new Intl.NumberFormat(locale).format(
    Math.round(zones[booking.zone].price * booking.dur * booking.rate),
  )} ₴`;
  bookingDialogReturnFocus = $('#forward');
  completeDialog.showModal();
  $('#completeNew').focus();
}
function downloadBookingCalendar(booking) {
  const start = new Date(`${booking.date}T${booking.time}`);
  const formatIcsDate = (date) =>
    new Date(date.getTime() - date.getTimezoneOffset() * 60000)
      .toISOString()
      .replace(/[-:]|\.\d+/g, '');
  const ics = `BEGIN:VCALENDAR\nVERSION:2.0\nBEGIN:VEVENT\nDTSTART:${formatIcsDate(start)}\nDTEND:${formatIcsDate(new Date(start.getTime() + booking.dur * 36e5))}\nSUMMARY:AWAKEN: ${booking.zone}, ${tr('Место')} ${booking.seat}\nEND:VEVENT\nEND:VCALENDAR`;
  const url = URL.createObjectURL(new Blob([ics], { type: 'text/calendar' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = 'awaken-booking.ics';
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
$('#completeClose').addEventListener('click', () => completeDialog.close());
$('#completeNew').addEventListener('click', () => {
  completeDialog.close();
  $('#map').scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' });
  $('#fZone').focus({ preventScroll: true });
});
$('#completeCalendar').addEventListener('click', () => {
  if (lastBooking) downloadBookingCalendar(lastBooking);
});
completeDialog.addEventListener('click', (e) => {
  if (e.target === completeDialog) completeDialog.close();
});
completeDialog.addEventListener('close', () => {
  bookingDialogReturnFocus?.focus({ preventScroll: true });
  bookingDialogReturnFocus = null;
});

const mobileBookingSummary = $('#mobileBookingSummary');
const mobileBookingObserver = new IntersectionObserver(
  ([entry]) => {
    mobileBookingSummary.classList.toggle('visible', entry.isIntersecting);
  },
  { threshold: 0.08 },
);
mobileBookingObserver.observe($('#map'));
mobileBookingSummary.addEventListener('click', () => {
  $('#map').scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' });
  $('#fZone').focus({ preventScroll: true });
});

function toast(html, warn, ttl = 5000) {
  const t = document.createElement('div');
  t.className = 'toast' + (warn ? ' warn' : '');
  t.innerHTML = `<div class="thead"><span class="ti">!</span><b class="mono">${warn ? 'ВНИМАНИЕ' : 'УВЕДОМЛЕНИЕ'}</b></div><div class="tbody">${html}</div><button class="tok" aria-label="Закрыть уведомление" onclick="this.closest('.toast').remove()">✓</button>`;
  $('#toasts').append(t);
  setTimeout(() => t.remove(), ttl);
  playUiCue(warn ? 'warning' : 'notice');
}

// Отзывы
let ri = 0;
let reviewTransitionId = 0;
function drawReview(direction = 0) {
  const review = $('#review');
  const r = reviews[ri];
  const content = `<span class="av">${r.nick[0]}</span><b>${r.nick}</b> <span class="mono muted">${r.lvl}</span>
    <div class="stars">${'★'.repeat(r.stars)}${'☆'.repeat(5 - r.stars)}</div><p>${r.text}</p>`;
  const transitionId = ++reviewTransitionId;

  const interruptedTransition = review.querySelector('.review-enter');
  if (interruptedTransition) {
    review.innerHTML = `<div class="review-slide">${interruptedTransition.innerHTML}</div>`;
    review.style.minHeight = '';
  }

  if (!direction || reduced || !review.firstElementChild) {
    review.innerHTML = `<div class="review-slide">${content}</div>`;
    return;
  }

  const height = review.getBoundingClientRect().height;
  const outgoing = document.createElement('div');
  outgoing.className = `review-slide review-exit ${direction > 0 ? 'to-prev' : 'to-next'}`;
  while (review.firstChild) outgoing.append(review.firstChild);

  const incoming = document.createElement('div');
  incoming.className = `review-slide review-enter ${direction > 0 ? 'from-next' : 'from-prev'}`;
  incoming.innerHTML = content;
  review.style.minHeight = `${height}px`;
  review.append(outgoing, incoming);

  requestAnimationFrame(() => {
    if (transitionId !== reviewTransitionId) return;
    outgoing.classList.add('moving');
    incoming.classList.add('moving');
  });
  const finishReviewTransition = () => {
    if (transitionId !== reviewTransitionId || !incoming.isConnected) return;
    review.innerHTML = '';
    incoming.className = 'review-slide';
    review.append(incoming);
    review.style.minHeight = '';
  };
  incoming.addEventListener('transitionend', (e) => {
    if (
      e.target !== incoming ||
      e.propertyName !== 'transform' ||
      transitionId !== reviewTransitionId
    )
      return;
    finishReviewTransition();
  });
  setTimeout(finishReviewTransition, 700);
}
const go = (d) => {
  ri = (ri + d + reviews.length) % reviews.length;
  drawReview(d);
  scheduleReviewAuto();
};
$('#prev').onclick = () => go(-1);
$('#next').onclick = () => go(1);
const reviewAutoDelay = 10000;
let reviewAutoTimer = 0;
let reviewHovered = false;
let reviewFocused = false;
function scheduleReviewAuto() {
  clearTimeout(reviewAutoTimer);
  if (document.hidden || reviewHovered || reviewFocused) return;
  reviewAutoTimer = setTimeout(() => {
    go(1);
    scheduleReviewAuto();
  }, reviewAutoDelay);
}
const reviewCard = $('#review');
reviewCard.addEventListener('pointerenter', () => {
  reviewHovered = true;
  clearTimeout(reviewAutoTimer);
});
reviewCard.addEventListener('pointerleave', () => {
  reviewHovered = false;
  scheduleReviewAuto();
});
reviewCard.addEventListener('focusin', () => {
  reviewFocused = true;
  clearTimeout(reviewAutoTimer);
});
reviewCard.addEventListener('focusout', (e) => {
  if (!reviewCard.contains(e.relatedTarget)) {
    reviewFocused = false;
    scheduleReviewAuto();
  }
});
document.addEventListener('visibilitychange', scheduleReviewAuto);

// Частицы
const cv = $('#particles'),
  ctx = cv.getContext('2d');
let dots = [],
  particleFrame = null;
function initParticles() {
  cv.width = innerWidth;
  cv.height = innerHeight;
  const n = innerWidth < 768 ? 12 : 40;
  dots = Array.from({ length: n }, () => ({
    x: Math.random() * cv.width,
    y: Math.random() * cv.height,
    v: 0.2 + Math.random() * 0.4,
    a: 0.2 + Math.random() * 0.2,
  }));
}
function loop() {
  if (reduced || calmMode) {
    particleFrame = null;
    return;
  }
  ctx.clearRect(0, 0, cv.width, cv.height);
  dots.forEach((d) => {
    d.y -= d.v;
    if (d.y < 0) d.y = cv.height;
    ctx.fillStyle = `rgba(61,230,255,${d.a})`;
    ctx.fillRect(d.x, d.y, 2, 2);
  });
  particleFrame = requestAnimationFrame(loop);
}
if (!reduced && !calmMode) {
  initParticles();
  loop();
}
addEventListener('resize', () => {
  if (!reduced && !calmMode) initParticles();
});

// Старт
$('#fZone').value = 'Standard';
drawZone();
calc();
showStep();
drawReview();
scheduleReviewAuto();

// Доп. функции
let warnKey = '',
  lastBooking = null;
const mark = (s) => $(s).classList.add('invalid');
$('#fPhone').addEventListener('input', (e) => {
  // маска +380 XX XXX XX XX
  let d = e.target.value.replace(/\D/g, '');
  if (d.startsWith('380')) d = d.slice(3);
  else if (d.startsWith('0')) d = d.slice(1);
  d = d.slice(0, 9);
  const p = [d.slice(0, 2), d.slice(2, 5), d.slice(5, 7), d.slice(7, 9)].filter(Boolean);
  e.target.value = d ? '+380 ' + p.join(' ') : '';
});
$('#toasts').addEventListener('click', (e) => {
  const a = e.target.dataset.act;
  if (!a || !lastBooking) return;
  if (a === 'cancel') {
    delB(lastBooking);
    lastBooking = null;
    e.target.closest('.toast').remove();
    toast('[ СИСТЕМА ] Бронь отменена', true);
    return;
  } // TODO: запрос на сервер
  downloadBookingCalendar(lastBooking);
});

// Отзывы: свайп
let sx = 0;
$('#review').addEventListener('touchstart', (e) => (sx = e.touches[0].clientX), { passive: true });
$('#review').addEventListener('touchend', (e) => {
  const d = e.changedTouches[0].clientX - sx;
  if (Math.abs(d) > 40) go(d < 0 ? 1 : -1);
});

// Звук: WebAudio-тики без файлов; состояние сохраняется
let snd = false,
  actx;
try {
  snd = localStorage.getItem('awk-snd') === '1';
} catch (e) {}
const soundCues = {
  toggle: [660],
  zone: [440, 587],
  seat: [740],
  step: [520, 700],
  back: [460],
  notice: [660],
  warning: [330, 294],
  complete: [523, 659, 784],
};
function playUiCue(name) {
  if (!snd) return;
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return;
  actx ||= new AudioContext();
  const play = () => {
    const start = actx.currentTime;
    soundCues[name].forEach((frequency, index) => {
      const oscillator = actx.createOscillator();
      const gain = actx.createGain();
      const noteStart = start + index * 0.075;
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(frequency, noteStart);
      gain.gain.setValueAtTime(0.0001, noteStart);
      gain.gain.exponentialRampToValueAtTime(
        name === 'complete' ? 0.035 : 0.022,
        noteStart + 0.012,
      );
      gain.gain.exponentialRampToValueAtTime(
        0.0001,
        noteStart + (name === 'complete' ? 0.24 : 0.12),
      );
      oscillator.connect(gain);
      gain.connect(actx.destination);
      oscillator.start(noteStart);
      oscillator.stop(noteStart + (name === 'complete' ? 0.25 : 0.13));
    });
  };
  if (actx.state === 'suspended') {
    actx
      .resume()
      .then(play)
      .catch((error) => console.warn('Interface sound could not start.', error));
  } else {
    play();
  }
}
function drawSound() {
  $('#sound').setAttribute('aria-pressed', snd);
  $('#sound').textContent = 'ЗВУК: ' + (snd ? 'ВКЛ' : 'ВЫКЛ');
}
$('#sound').onclick = () => {
  snd = !snd;
  try {
    localStorage.setItem('awk-snd', snd ? '1' : '0');
  } catch (e) {}
  drawSound();
  if (snd) playUiCue('toggle');
};
drawSound();

// The brand remains a normal in-page link; only its reward is session-limited.
let brandAchievementEarned = false;
try {
  brandAchievementEarned = sessionStorage.getItem('awk-brand-achievement') === '1';
} catch (e) {}
$('.logo').addEventListener('click', () => {
  if (brandAchievementEarned) return;
  brandAchievementEarned = true;
  try {
    sessionStorage.setItem('awk-brand-achievement', '1');
  } catch (e) {}
  toast('[ СИСТЕМА ] Скрытый уровень открыт');
});

// ===== i18n: словарь RU¦UA¦EN =====
const D = {};
`Тарифы¦Тарифи¦Pricing
Зоны¦Зони¦Zones
Карта¦Карта¦Map
Акции¦Акції¦Deals
Контакты¦Контакти¦Contacts
Забронировать¦Забронювати¦Book
GAMING NETWORK¦ІГРОВА МЕРЕЖА¦GAMING NETWORK
Язык¦Мова¦Language
Меню¦Меню¦Menu
Прокрутить¦Прокрутити¦Scroll
Схема зала¦Схема зали¦Hall layout
Закрыть увеличенный просмотр¦Закрити збільшений перегляд¦Close expanded view
Закрыть уведомление¦Закрити сповіщення¦Close notification
Бронь подтверждена¦Бронювання підтверджено¦Booking confirmed
Закрыть подтверждение¦Закрити підтвердження¦Close confirmation
Твоё место ждёт тебя. Увидимся в игре!¦Твоє місце чекає на тебе. Побачимося у грі!¦Your seat is waiting for you. See you in game!
Прогресс страницы¦Прогрес сторінки¦Page progress
МИССИЯ¦МІСІЯ¦MISSION
[ МИССИЯ ЗАВЕРШЕНА ]¦[ МІСІЮ ЗАВЕРШЕНО ]¦[ MISSION COMPLETE ]
Твоё место уже в системе. Увидимся в игре!¦Твоє місце вже в системі. Побачимося у грі!¦Your seat is in the system. See you in game!
Новая бронь¦Нове бронювання¦New booking
Сводка миссии и сумма брони¦Зведення місії та сума бронювання¦Booking mission summary and total
Фрагмент 1/6¦Фрагмент 1/6¦Fragment 1/6
Фрагмент 2/6¦Фрагмент 2/6¦Fragment 2/6
Фрагмент 3/6¦Фрагмент 3/6¦Fragment 3/6
Фрагмент 4/6¦Фрагмент 4/6¦Fragment 4/6
Фрагмент 5/6¦Фрагмент 5/6¦Fragment 5/6
Фрагмент 6/6¦Фрагмент 6/6¦Fragment 6/6
Включить полноэкранный режим¦Увімкнути повноекранний режим¦Enter fullscreen
Выйти из полноэкранного режима¦Вийти з повноекранного режиму¦Exit fullscreen
Полноэкранный режим недоступен в этом браузере.¦Повноекранний режим недоступний у цьому браузері.¦Fullscreen is not available in this browser.
Не удалось переключить полноэкранный режим.¦Не вдалося перемкнути повноекранний режим.¦Could not toggle fullscreen mode.
AWAKEN | Компьютерный клуб¦AWAKEN | Комп'ютерний клуб¦AWAKEN | Gaming club
Компьютерный клуб AWAKEN: RTX-железо, 240 Гц, открыто 24/7.¦Комп'ютерний клуб AWAKEN: RTX-залізо, 240 Гц, відкрито 24/7.¦AWAKEN gaming club: RTX hardware, 240 Hz, open 24/7.
ОНЛАЙН 24/7¦У МЕРЕЖІ 24/7¦ONLINE 24/7
ПРОБУЖДЕНИЕ СИСТЕМЫ...¦ПРОБУДЖЕННЯ СИСТЕМИ...¦AWAKENING SYSTEM...
[ СИСТЕМА ] Обнаружен новый игрок¦[ СИСТЕМА ] Виявлено нового гравця¦[ SYSTEM ] New player detected
Пробуди свой уровень¦Пробуди свій рівень¦Awaken your level
Компьютерный клуб AWAKEN: RTX-железо, 240 Гц и кресла, в которых хочется остаться до утра.¦Комп'ютерний клуб AWAKEN: RTX-залізо, 240 Гц і крісла, в яких хочеться залишитись до ранку.¦AWAKEN gaming club: RTX hardware, 240 Hz and chairs you will want to stay in until morning.
ПК: 60 | Пинг: <5 мс | Открыто: 24/7¦ПК: 60 | Пінг: <5 мс | Відкрито: 24/7¦PCs: 60 | Ping: <5 ms | Open: 24/7
Забронировать место¦Забронювати місце¦Book a seat
Смотреть тарифы¦Дивитись тарифи¦View pricing
ПК¦ПК¦PCs
Гц¦Гц¦Hz
работаем¦працюємо¦open
зон¦зон¦zones
О клубе¦Про клуб¦About
Зал на 60 мест с мониторами 240 Гц и видеокартами RTX. Пинг до серверов меньше 5 мс, кресла рассчитаны на долгие катки.¦Зал на 60 місць з моніторами 240 Гц і відеокартами RTX. Пінг до серверів менше 5 мс, крісла розраховані на довгі катки.¦A 60-seat hall with 240 Hz monitors and RTX graphics cards. Server ping under 5 ms, chairs built for long sessions.
Есть кофе-бар, кухня и отдельная комната для команд. Администратор на месте круглосуточно.¦Є кава-бар, кухня і окрема кімната для команд. Адміністратор на місці цілодобово.¦There is a coffee bar, a kitchen and a separate team room. An admin is on site around the clock.
[ ЗАЛ ]¦[ ЗАЛ ]¦[ HALL ]
Место под фото клуба¦Місце під фото клубу¦Club photo goes here
Игровые зоны¦Ігрові зони¦Gaming zones
Преимущества¦Переваги¦Advantages
Отзывы¦Відгуки¦Reviews
Бронирование¦Бронювання¦Booking
[ БРОНИРОВАНИЕ ]¦[ БРОНЮВАННЯ ]¦[ BOOKING ]
Мощные ПК¦Потужні ПК¦Powerful PCs
RTX 4070, процессоры последнего поколения.¦RTX 4070, процесори останнього покоління.¦RTX 4070, latest-gen CPUs.
Быстрый интернет¦Швидкий інтернет¦Fast internet
Оптика, пинг до 5 мс.¦Оптика, пінг до 5 мс.¦Fiber, ping up to 5 ms.
Удобные кресла¦Зручні крісла¦Comfy chairs
Эргономика для долгих сессий.¦Ергономіка для довгих сесій.¦Ergonomics for long sessions.
Кофе-бар и кухня¦Кава-бар і кухня¦Coffee bar & kitchen
Еда и напитки не отрывают от игры.¦Їжа й напої не відривають від гри.¦Food and drinks without leaving the game.
Ночные тарифы¦Нічні тарифи¦Night rates
С 23:00 до 8:00 дешевле.¦З 23:00 до 8:00 дешевше.¦Cheaper from 23:00 to 8:00.
Администратор 24/7¦Адміністратор 24/7¦Admin 24/7
Поможет в любой момент.¦Допоможе будь-коли.¦Helps at any moment.
Ночной рейд¦Нічний рейд¦Night raid
Награда: -30% ночью¦Нагорода: -30% вночі¦Reward: -30% at night
Будни, с 23:00 до 8:00.¦Будні, з 23:00 до 8:00.¦Weekdays, 23:00 to 8:00.
До 31 декабря¦До 31 грудня¦Until December 31
Пати из 5¦Паті з 5¦Party of 5
Награда: +1 час бесплатно¦Нагорода: +1 година безкоштовно¦Reward: +1 free hour
При брони Team Room на 3 часа.¦При броні Team Room на 3 години.¦When booking Team Room for 3 hours.
Постоянно¦Постійно¦Always
Первый вход¦Перший вхід¦First login
Награда: 30 минут в подарок¦Нагорода: 30 хвилин у подарунок¦Reward: 30 free minutes
Для новых игроков.¦Для нових гравців.¦For new players.
Включено: игры из библиотеки клуба, вода. Ограничения: 16+ после 22:00.¦Включено: ігри з бібліотеки клубу, вода. Обмеження: 16+ після 22:00.¦Included: games from the club library, water. Limits: 16+ after 22:00.
Выбрать¦Обрати¦Select
RTX 3060, 144 Гц¦RTX 3060, 144 Гц¦RTX 3060, 144 Hz
RTX 4070, 240 Гц¦RTX 4070, 240 Гц¦RTX 4070, 240 Hz
5 мест, 600 ₴/час за комнату¦5 місць, 600 ₴/год за кімнату¦5 seats, 600 ₴/hr per room
RTX 4070, 240 Гц, 5 шт¦RTX 4070, 240 Гц, 5 шт¦RTX 4070, 240 Hz, 5 pcs
RTX 4080, 240 Гц, кресла премиум¦RTX 4080, 240 Гц, крісла преміум¦RTX 4080, 240 Hz, premium chairs
кресла премиум¦крісла преміум¦premium chairs
СТАТУС¦СТАТУС¦STATUS
РАНГ¦РАНГ¦RANK
Экран¦Екран¦Screen
Места¦Місця¦Seats
УВЕДОМЛЕНИЕ¦СПОВІЩЕННЯ¦NOTIFICATION
ВНИМАНИЕ¦УВАГА¦WARNING
Зона¦Зона¦Zone
Тариф¦Тариф¦Rate
Почасовой¦Погодинний¦Hourly
Пакет 3 часа (-10%)¦Пакет 3 години (-10%)¦3-hour pack (-10%)
Ночной (-30%)¦Нічний (-30%)¦Night (-30%)
Дата¦Дата¦Date
Время¦Час¦Time
Длительность¦Тривалість¦Duration
свободно¦вільно¦free
занято¦зайнято¦taken
выбрано¦обрано¦selected
Выберите место¦Оберіть місце¦Choose a seat
Имя или ник *¦Ім'я або нік *¦Name or nickname *
Телефон *¦Телефон *¦Phone *
Комментарий¦Коментар¦Comment
Согласен на обработку данных *¦Згоден на обробку даних *¦I agree to data processing *
Назад¦Назад¦Back
Далее¦Далі¦Next
Подтвердить бронь¦Підтвердити бронь¦Confirm booking
Выберите свободное место¦Оберіть вільне місце¦Choose a free seat
Заполните это поле: имя¦Заповніть це поле: ім'я¦Fill in this field: name
Проверьте номер: он должен содержать 10 цифр¦Перевірте номер: він має містити 10 цифр¦Check the number: it must contain 10 digits
Проверьте email¦Перевірте email¦Check the email
Нужно согласие на обработку данных¦Потрібна згода на обробку даних¦Data processing consent is required
[ СИСТЕМА ] Бронь подтверждена¦[ СИСТЕМА ] Бронь підтверджено¦[ SYSTEM ] Booking confirmed
[ СИСТЕМА ] Квест принят. Место ждёт вас¦[ СИСТЕМА ] Квест прийнято. Місце чекає на вас¦[ SYSTEM ] Quest accepted. Your seat is waiting
[ СИСТЕМА ] Бронь отменена¦[ СИСТЕМА ] Бронь скасовано¦[ SYSTEM ] Booking cancelled
[ СИСТЕМА ] Скрытый уровень открыт¦[ СИСТЕМА ] Прихований рівень відкрито¦[ SYSTEM ] Hidden level unlocked
В календарь¦У календар¦Add to calendar
Отменить¦Скасувати¦Cancel
Сеул, ул. Итаевон-ро 55-гил¦Сеул, вул. Ітаєвон-ро 55-гіл¦Seoul, Itaewon-ro 55-gil
Сеул, ул. Итаевон-ро 55-гил, 1¦Сеул, вул. Ітаєвон-ро 55-гіл, 1¦Seoul, Itaewon-ro 55-gil, 1
Ежедневно, круглосуточно¦Щодня, цілодобово¦Daily, 24/7
[ КАРТА ]¦[ КАРТА ]¦[ MAP ]
Правила клуба · Политика конфиденциальности¦Правила клубу · Політика конфіденційності¦Club rules · Privacy policy
Собери 6 фрагментов в код¦Збери 6 фрагментів у код¦Collect 6 fragments to form a code
OK¦ГАРАЗД¦OK
СВОДКА МИССИИ¦ЗВЕДЕННЯ МІСІЇ¦MISSION LOADOUT
ТЕКУЩИЙ ЭТАП¦ПОТОЧНИЙ ЕТАП¦CURRENT OBJECTIVE
Конфигурация¦Конфігурація¦Loadout
Время и тариф¦Час і тариф¦Time & rate
Место¦Місце¦Seat
Дата и время¦Дата й час¦Date & time
ИТОГО¦РАЗОМ¦TOTAL
Не выбрано¦Не обрано¦Not selected
Выбор зоны¦Вибір зони¦Select zone
Выбор места¦Вибір місця¦Select a seat
Данные игрока¦Дані гравця¦Player details
[ СИСТЕМА ] Код AWAKEN принят. Скрытый уровень открыт¦[ СИСТЕМА ] Код AWAKEN прийнято. Прихований рівень відкрито¦[ SYSTEM ] AWAKEN code accepted. Secret level unlocked
Shadow_77¦Shadow_77¦Shadow_77
ЗОНА¦ЗОНА¦ZONE
ЦЕНА¦ЦІНА¦PRICE
[ КВЕСТ ]¦[ КВЕСТ ]¦[ QUEST ]
Лучший пинг в городе, мониторы огонь. Хожу каждые выходные.¦Найкращий пінг у місті, монітори вогонь. Ходжу щовихідних.¦Best ping in town, the monitors are fire. I come every weekend.
Брали Team Room на тренировку. Тихо, удобно, кофе рядом.¦Брали Team Room на тренування. Тихо, зручно, кава поруч.¦We booked Team Room for practice. Quiet, comfy, coffee nearby.
После работы захожу на пару часов: тихо, комфортно, а администратор всегда рядом.¦Після роботи заходжу на пару годин: тихо, комфортно, адміністратор завжди поруч.¦I stop by for a couple of hours after work: it's quiet and comfortable, and the staff are always nearby.`
  .split('\n')
  .forEach((l) => {
    const a = l.split('¦');
    D[a[0].replace(/\s+/g, ' ').trim()] = a;
  });
Object.assign(D, {
  'Для знакомства с клубом и спокойных игровых сессий.': [
    'Для знакомства с клубом и спокойных игровых сессий.',
    'Для знайомства з клубом і спокійних ігрових сесій.',
    'For a first visit and relaxed gaming sessions.',
  ],
  'Для соревновательных матчей и точной реакции.': [
    'Для соревновательных матчей и точной реакции.',
    'Для змагальних матчів і швидкої реакції.',
    'For competitive matches and fast reactions.',
  ],
  'Отдельное пространство для командных тренировок.': [
    'Отдельное пространство для командных тренировок.',
    'Окремий простір для командних тренувань.',
    'A private space for team practice.',
  ],
  'Максимальная конфигурация и премиальный комфорт.': [
    'Максимальная конфигурация и премиальный комфорт.',
    'Максимальна конфігурація та преміальний комфорт.',
    'Top-tier setup and premium comfort.',
  ],
  'Standard: Для знакомства с клубом и спокойных игровых сессий.': [
    'Standard: Для знакомства с клубом и спокойных игровых сессий.',
    'Standard: Для знайомства з клубом і спокійних ігрових сесій.',
    'Standard: For a first visit and relaxed gaming sessions.',
  ],
  'Pro: Для соревновательных матчей и точной реакции.': [
    'Pro: Для соревновательных матчей и точной реакции.',
    'Pro: Для змагальних матчів і швидкої реакції.',
    'Pro: For competitive matches and fast reactions.',
  ],
  'Team Room: Отдельное пространство для командных тренировок.': [
    'Team Room: Отдельное пространство для командных тренировок.',
    'Team Room: Окремий простір для командних тренувань.',
    'Team Room: A private space for team practice.',
  ],
  'VIP: Максимальная конфигурация и премиальный комфорт.': [
    'VIP: Максимальная конфигурация и премиальный комфорт.',
    'VIP: Максимальна конфігурація та преміальний комфорт.',
    'VIP: Top-tier setup and premium comfort.',
  ],
  'Спокойный режим': ['Спокойный режим', 'Спокійний режим', 'Calm mode'],
  'Перейти к основному содержимому': [
    'Перейти к основному содержимому',
    'Перейти до основного вмісту',
    'Skip to main content',
  ],
  'Предыдущий отзыв': ['Предыдущий отзыв', 'Попередній відгук', 'Previous review'],
  'Следующий отзыв': ['Следующий отзыв', 'Наступний відгук', 'Next review'],
  'Система готова. Выберите зону.': [
    'Система готова. Выберите зону.',
    'Систему готово. Оберіть зону.',
    'System ready. Choose a zone.',
  ],
  'Открыт каталог тарифов.': [
    'Открыт каталог тарифов.',
    'Відкрито каталог тарифів.',
    'Pricing catalog open.',
  ],
  'Открыта схема игровых зон.': [
    'Открыта схема игровых зон.',
    'Відкрито схему ігрових зон.',
    'Gaming zone map open.',
  ],
  'Открыта миссия бронирования.': [
    'Открыта миссия бронирования.',
    'Відкрито місію бронювання.',
    'Booking mission open.',
  ],
  'Просмотр преимуществ AWAKEN.': [
    'Просмотр преимуществ AWAKEN.',
    'Перегляд переваг AWAKEN.',
    'Viewing AWAKEN features.',
  ],
  'Открыты отзывы игроков.': [
    'Открыты отзывы игроков.',
    'Відкрито відгуки гравців.',
    'Player reviews open.',
  ],
  'Бронирование подтверждено.': [
    'Бронирование подтверждено.',
    'Бронювання підтверджено.',
    'Booking confirmed.',
  ],
  'Сравнить зоны': ['Сравнить зоны', 'Порівняти зони', 'Compare zones'],
  'Сравнение зон': ['Сравнение зон', 'Порівняння зон', 'Zone comparison'],
  '[ СРАВНЕНИЕ КОНФИГУРАЦИЙ ]': [
    '[ СРАВНЕНИЕ КОНФИГУРАЦИЙ ]',
    '[ ПОРІВНЯННЯ КОНФІГУРАЦІЙ ]',
    '[ CONFIGURATION COMPARISON ]',
  ],
  'Закрыть сравнение': ['Закрыть сравнение', 'Закрити порівняння', 'Close comparison'],
  Показатель: ['Показатель', 'Показник', 'Attribute'],
  'Таблица сравнения зон': [
    'Таблица сравнения зон',
    'Порівняльна таблиця зон',
    'Zone comparison table',
  ],
  'Сравнение характеристик игровых зон': [
    'Сравнение характеристик игровых зон',
    'Порівняння характеристик ігрових зон',
    'Gaming zone specifications comparison',
  ],
  Видеокарта: ['Видеокарта', 'Відеокарта', 'Graphics card'],
  'Частота монитора': ['Частота монитора', 'Частота монітора', 'Monitor refresh rate'],
  'Количество мест': ['Количество мест', 'Кількість місць', 'Seats'],
  Ранг: ['Ранг', 'Ранг', 'Rank'],
  'Стоимость за час': ['Стоимость за час', 'Вартість за годину', 'Price per hour'],
  Назначение: ['Назначение', 'Призначення', 'Best for'],
  'Характеристики комплектации, не результаты тестирования': [
    'Характеристики комплектации, не результаты тестирования',
    'Характеристики комплектації, а не результати тестування',
    'PC specifications, not performance test results',
  ],
  'Это характеристики оборудования, а не результаты тестирования производительности.': [
    'Это характеристики оборудования, а не результаты тестирования производительности.',
    'Це характеристики обладнання, а не результати тестування продуктивності.',
    'These are hardware specifications, not performance test results.',
  ],
  'ХАРАКТЕРИСТИКИ КОНФИГУРАЦИИ · НЕ БЕНЧМАРК': [
    'ХАРАКТЕРИСТИКИ КОНФИГУРАЦИИ · НЕ БЕНЧМАРК',
    'ХАРАКТЕРИСТИКИ КОНФІГУРАЦІЇ · НЕ БЕНЧМАРК',
    'CONFIGURATION SPECS · NOT A BENCHMARK',
  ],
  'Сейчас: ': ['Сейчас: ', 'Зараз: ', 'Now viewing: '],
  'Сейчас включён спокойный режим.': [
    'Сейчас включён спокойный режим.',
    'Зараз увімкнено спокійний режим.',
    'Calm mode is on.',
  ],
  'Декоративные эффекты приглушены.': [
    'Декоративные эффекты приглушены.',
    'Декоративні ефекти приглушено.',
    'Decorative effects are reduced.',
  ],
});
const localizedSeo = [
  {
    title: 'AWAKEN | Игровые зоны, тарифы и демо-бронирование',
    description:
      'Учебный демосайт AWAKEN: игровые зоны, условные тарифы и демонстрационная форма бронирования компьютерного клуба.',
    keywords: 'учебный проект, компьютерный клуб, игровые зоны, тарифы, демо-бронирование, AWAKEN',
    locale: 'ru_RU',
  },
  {
    title: 'AWAKEN | Ігрові зони, тарифи та демо-бронювання',
    description:
      "Навчальний демосайт AWAKEN: ігрові зони, умовні тарифи та демонстраційна форма бронювання комп'ютерного клубу.",
    keywords: 'навчальний проєкт, комп’ютерний клуб, ігрові зони, тарифи, демо-бронювання, AWAKEN',
    locale: 'uk_UA',
  },
  {
    title: 'AWAKEN | Gaming zones, pricing and demo booking',
    description:
      'AWAKEN is an educational demo site featuring gaming zones, sample pricing and a demonstration booking form.',
    keywords: 'educational project, gaming club, gaming zones, pricing, demo booking, AWAKEN',
    locale: 'en_US',
  },
];
function updateLocalizedSeo() {
  const seo = localizedSeo[LI];
  document.title = seo.title;
  $('#metaDescription').content = seo.description;
  $('#metaKeywords').content = seo.keywords;
  $('#ogTitle').content = seo.title;
  $('#ogDescription').content = seo.description;
  $('#ogLocale').content = seo.locale;
  $('#twitterTitle').content = seo.title;
  $('#twitterDescription').content = seo.description;
  const websiteSchema = $('#websiteSchema');
  if (websiteSchema) {
    websiteSchema.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'AWAKEN',
      description: seo.description,
      inLanguage: ['ru', 'uk', 'en'][LI],
    });
  }
}
const P = [
  // шаблоны с числами: [regexp, UA, EN]
  [/^ШАГ (\d) \/ 4$/, 'КРОК $1 / 4', 'STEP $1 / 4'],
  [/^ИТОГО: /, 'РАЗОМ: ', 'TOTAL: '],
  [/^Место (\d+), /, 'Місце $1, ', 'Seat $1, '],
  [/кресла премиум/, 'крісла преміум', 'premium chairs'],
  [
    /^Место №(\d+) · (.*)\. Приходите за 10 минут до начала\.$/,
    'Місце №$1 · $2. Приходьте за 10 хвилин до початку.',
    'Seat #$1 · $2. Arrive 10 minutes early.',
  ],
  [
    /^\[ ВНИМАНИЕ \] Осталось (\d+) своб\. места на это время$/,
    '[ УВАГА ] Залишилось вільних місць: $1',
    '[ WARNING ] Free seats left: $1',
  ],
  [/^(\d+) шт$/, '$1 шт', '$1 pcs'],
  [/^(\d+) ч$/, '$1 год', '$1 hr'],
  [/^Уровень (\d+)$/, 'Рівень $1', 'Level $1'],
  [/₴\/час/, '₴/год', '₴/hr'],
  [/ Гц/, ' Гц', ' Hz'],
  [/^ЗВУК: ВКЛ$/, 'ЗВУК: УВІМК', 'SOUND: ON'],
  [/^ЗВУК: ВЫКЛ$/, 'ЗВУК: ВИМК', 'SOUND: OFF'],
  [/^Выбрана зона: (.*)$/, 'Обрано зону: $1', 'Selected zone: $1'],
  [/^(\d+) шт$/, '$1 шт', '$1 seats'],
  [/^Этап бронирования: (\d) \/ 4$/, 'Етап бронювання: $1 / 4', 'Booking step: $1 / 4'],
];
let LI = 0;
function tr(s) {
  if (!LI) return s;
  const k = s.trim();
  if (!k) return s;
  const normalized = k.replace(/\s+/g, ' ');
  let o = normalized;
  if (D[normalized]) o = D[normalized][LI];
  else P.forEach((p) => (o = o.replace(p[0], p[LI])));
  const leading = s.match(/^\s*/)[0],
    trailing = s.match(/\s*$/)[0];
  return leading + o + trailing;
}
function setConsoleMessage(source) {
  consoleMessageKey = source;
  const target = $('#consoleMessage');
  if (target) target.textContent = languageReady ? tr(source) : source;
}
function renderZoneComparison() {
  const content = $('#compareContent');
  if (!content) return;
  const headers = Object.keys(zones);
  const fields = [
    ['Видеокарта', (name) => zones[name].desc.split(',')[0]],
    ['Частота монитора', (name) => zones[name].desc.match(/\d+\s*Гц/)?.[0] || '—'],
    ['Количество мест', (name) => tr(`${zones[name].seats} шт`)],
    ['Стоимость за час', (name) => tr(`${zones[name].price} ₴/час`)],
    ['Назначение', (name) => tr(zones[name].purpose)],
  ];
  content.replaceChildren();
  const tableWrap = document.createElement('div');
  tableWrap.className = 'compare-table-wrap';
  tableWrap.setAttribute('role', 'region');
  tableWrap.setAttribute('aria-label', tr('Порівняльна таблиця зон'));
  tableWrap.tabIndex = 0;
  const table = document.createElement('table');
  table.className = 'compare-table';
  table.setAttribute('aria-label', tr('Порівняння характеристик ігрових зон'));
  const tableHead = document.createElement('thead');
  const headRow = document.createElement('tr');
  const labelHeader = document.createElement('th');
  labelHeader.scope = 'col';
  labelHeader.className = 'compare-label-heading';
  labelHeader.textContent = tr('Показатель');
  headRow.append(labelHeader);
  headers.forEach((name) => {
    const cell = document.createElement('th');
    const selected = name === state.zone;
    cell.scope = 'col';
    cell.className = `compare-zone-heading${selected ? ' is-selected' : ''}`;
    cell.style.setProperty('--zone-accent', zones[name].accent);
    cell.textContent = name;
    if (selected) cell.setAttribute('aria-current', 'true');
    headRow.append(cell);
  });
  tableHead.append(headRow);
  table.append(tableHead);
  const tbody = document.createElement('tbody');
  fields.forEach(([label, value]) => {
    const row = document.createElement('tr');
    const title = document.createElement('th');
    title.scope = 'row';
    title.textContent = tr(label);
    row.append(title);
    headers.forEach((name, index) => {
      const cell = document.createElement('td');
      cell.className = `compare-value compare-column-${index + 1}`;
      if (name === state.zone) cell.classList.add('is-selected');
      if (label === 'Стоимость за час') cell.classList.add('compare-price');
      cell.style.setProperty('--zone-accent', zones[name].accent);
      cell.textContent = value(name);
      row.append(cell);
    });
    tbody.append(row);
  });
  table.append(tbody);
  tableWrap.append(table);
  content.append(tableWrap);
  const note = document.createElement('p');
  note.className = 'compare-note';
  note.textContent = tr(
    'Это характеристики оборудования, а не результаты тестирования производительности.',
  );
  content.append(note);
}
function syncCalmMode() {
  document.body.classList.toggle('calm-mode', calmMode);
  if (calmMode) {
    ['--hero-grid-x', '--hero-grid-y', '--hero-setup-x', '--hero-setup-y'].forEach((property) => {
      $('#hero').style.setProperty(property, '0px');
    });
  }
  const button = $('#calmMode');
  if (button) {
    button.setAttribute('aria-pressed', String(calmMode));
    button.title = tr('Спокойный режим');
    button.setAttribute('aria-label', tr('Спокойный режим'));
  }
  if (!reduced && !calmMode && !particleFrame) {
    initParticles();
    loop();
  } else if ((reduced || calmMode) && particleFrame) {
    cancelAnimationFrame(particleFrame);
    particleFrame = null;
    ctx.clearRect(0, 0, cv.width, cv.height);
  }
}
function tx(x) {
  if (x._t !== x.data) x._r = x.data;
  const v = tr(x._r);
  x._t = v;
  if (v !== x.data) x.data = v;
}
function walk(n) {
  const w = document.createTreeWalker(n, NodeFilter.SHOW_TEXT, {
    acceptNode: (x) =>
      /^(SCRIPT|STYLE|OPTION)$/.test(x.parentNode.nodeName) && x.parentNode.closest('#lang')
        ? 2
        : 1,
  });
  let x;
  while ((x = w.nextNode())) tx(x);
}
const originalAttributes = new WeakMap();
function translateAttributes(root) {
  const elements = root.nodeType === Node.ELEMENT_NODE ? [root, ...root.querySelectorAll('*')] : [];
  elements.forEach((el) => {
    const names = ['aria-label', 'placeholder', 'title', 'alt'];
    if (el.matches('meta[content]')) names.push('content');
    let originals = originalAttributes.get(el);
    if (!originals) {
      originals = new Map();
      originalAttributes.set(el, originals);
    }
    names.forEach((name) => {
      if (!el.hasAttribute(name)) return;
      const current = el.getAttribute(name),
        previous = originals.get(name);
      if (!previous || current !== previous.translated)
        originals.set(name, { source: current, translated: current });
      const entry = originals.get(name),
        translated = tr(entry.source);
      el.setAttribute(name, translated);
      entry.translated = translated;
    });
  });
}
new MutationObserver((ms) =>
  ms.forEach((m) => {
    m.addedNodes.forEach((a) => {
      if (a.nodeType === 3) tx(a);
      else if (a.nodeType === 1) {
        walk(a);
        translateAttributes(a);
      }
    });
    if (m.type === 'characterData') tx(m.target);
  }),
).observe(document.body, { childList: true, subtree: true, characterData: true });
function setLang(l) {
  LI = { RU: 0, UA: 1, EN: 2 }[l] ?? 0;
  document.documentElement.lang = ['ru', 'uk', 'en'][LI];
  $('#lang').value = l;
  walk(document.body);
  translateAttributes(document.head);
  translateAttributes(document.body);
  updateLocalizedSeo();
  drawCal();
  languageReady = true;
  drawZone();
  setConsoleMessage(consoleMessageKey);
  renderZoneComparison();
  syncCalmMode();
  refreshBookingSummary();
  try {
    localStorage.setItem('awk-lang', l);
  } catch (e) {}
}
$('#lang').onchange = (e) => setLang(e.target.value);
$('#calmMode').addEventListener('click', () => {
  calmMode = !calmMode;
  try {
    localStorage.setItem('awk-calm', calmMode ? '1' : '0');
  } catch (e) {}
  syncCalmMode();
  setConsoleMessage(
    calmMode ? 'Декоративные эффекты приглушены.' : 'Система готова. Выберите зону.',
  );
});
$('#compareZones').addEventListener('click', () => {
  renderZoneComparison();
  $('#compareDialog').showModal();
});
$('#compareClose').addEventListener('click', () => $('#compareDialog').close());
$('#compareDialog').addEventListener('click', (e) => {
  if (e.target === $('#compareDialog')) $('#compareDialog').close();
});

let cipherProgress = 0,
  cipherUnlocked = false;
const cipherCode = 'AWAKEN';
document.addEventListener('keydown', (e) => {
  if (
    cipherUnlocked ||
    e.repeat ||
    e.ctrlKey ||
    e.altKey ||
    e.metaKey ||
    e.target.closest('input, textarea, select, [contenteditable="true"]')
  )
    return;
  const key = e.key.toUpperCase();
  cipherProgress =
    key === cipherCode[cipherProgress] ? cipherProgress + 1 : key === cipherCode[0] ? 1 : 0;
  if (cipherProgress === cipherCode.length) {
    cipherUnlocked = true;
    toast('[ СИСТЕМА ] Код AWAKEN принят. Скрытый уровень открыт', false, 9000);
  }
});

const fullscreenButton = $('#fullscreen');
function updateFullscreenButton() {
  const active = Boolean(document.fullscreenElement);
  const label = active ? 'Выйти из полноэкранного режима' : 'Включить полноэкранный режим';
  fullscreenButton.setAttribute('aria-pressed', String(active));
  fullscreenButton.setAttribute('aria-label', label);
  fullscreenButton.title = label;
  translateAttributes(fullscreenButton);
}
fullscreenButton.addEventListener('click', async () => {
  if (!document.fullscreenEnabled) {
    toast('Полноэкранный режим недоступен в этом браузере.', true);
    return;
  }
  try {
    if (document.fullscreenElement) await document.exitFullscreen();
    else await document.documentElement.requestFullscreen();
  } catch (error) {
    console.error('Fullscreen mode could not be toggled.', error);
    toast('Не удалось переключить полноэкранный режим.', true);
  }
});
document.addEventListener('fullscreenchange', updateFullscreenButton);
updateFullscreenButton();

// ===== Свой календарь =====
let cm = new Date();
cm.setDate(1);
$('#fDate').type = 'hidden';
$('#fDate').insertAdjacentHTML('afterend', '<div id="cal" class="cal"></div>');
function drawCal() {
  const loc = ['ru', 'uk', 'en'][LI],
    today = new Date();
  today.setHours(0, 0, 0, 0);
  const max = new Date(today.getTime() + 30 * 864e5),
    first = new Date(cm.getFullYear(), cm.getMonth(), 1);
  const off = (first.getDay() + 6) % 7,
    n = new Date(cm.getFullYear(), cm.getMonth() + 1, 0).getDate();
  let h = `<div class="ch"><button type="button" data-m="-1" aria-label="‹">‹</button><b class="mono">${first.toLocaleDateString(loc, { month: 'long', year: 'numeric' })}</b><button type="button" data-m="1" aria-label="›">›</button></div><div class="cg">`;
  for (let k = 0; k < 7; k++)
    h += `<span class="mono">${new Date(2024, 0, 1 + k).toLocaleDateString(loc, { weekday: 'short' })}</span>`;
  h += '<i></i>'.repeat(off);
  for (let d = 1; d <= n; d++) {
    const dt = new Date(first.getFullYear(), first.getMonth(), d),
      iso = localISO(dt);
    const out = dt < today || dt > max,
      full = !out && iso !== localISO() && (d * 5 + first.getMonth()) % 9 === 0;
    h += `<button type="button" class="${iso === $('#fDate').value ? 'sel' : ''}${full ? ' full' : ''}" data-d="${iso}" ${out || full ? 'disabled' : ''}>${d}</button>`;
  }
  $('#cal').innerHTML = h + '</div>';
}
$('#cal').onclick = (e) => {
  const b = e.target.closest('button');
  if (!b) return;
  if (b.dataset.m) {
    cm.setMonth(cm.getMonth() + +b.dataset.m);
    drawCal();
  } else if (b.dataset.d) {
    $('#fDate').value = b.dataset.d;
    drawCal();
    drawSeats();
  }
};
drawCal();

// ===== Музыка: положите трек в audio/ambient.mp3 =====
const bgm = new Audio('audio/ambient.mp3');
bgm.loop = true;
bgm.volume = 0;
bgm.preload = 'none';
let fade;
function music(on) {
  clearInterval(fade);
  if (on) bgm.play().catch(() => {});
  fade = setInterval(() => {
    bgm.volume = Math.min(0.2, Math.max(0, bgm.volume + (on ? 0.02 : -0.02)));
    if (!on && bgm.volume <= 0) {
      bgm.pause();
      clearInterval(fade);
    }
    if (on && bgm.volume >= 0.2) clearInterval(fade);
  }, 100);
}
$('#sound').addEventListener('click', () => music(snd));
let savedLanguage = '';
try {
  savedLanguage = localStorage.getItem('awk-lang') || '';
} catch (error) {
  console.warn('Saved language preference could not be read.', error);
}
setLang(savedLanguage || $('#lang').value);

// Брони хранятся локально и блокируют места
const booked = () => {
  try {
    return JSON.parse(localStorage.getItem('awk-b') || '[]');
  } catch (e) {
    return [];
  }
};
const saveB = (b) => {
  try {
    localStorage.setItem('awk-b', JSON.stringify([...booked(), b]));
  } catch (e) {}
};
const delB = (b) => {
  try {
    localStorage.setItem(
      'awk-b',
      JSON.stringify(booked().filter((x) => JSON.stringify(x) !== JSON.stringify(b))),
    );
  } catch (e) {}
};
const _busy = isBusy;
isBusy = (i) =>
  _busy(i) ||
  booked().some(
    (b) =>
      b.zone === state.zone &&
      b.date === $('#fDate').value &&
      b.time === $('#fTime').value &&
      b.seat === i,
  );
$('#fDate').onchange = drawSeats;

// Схема зала (SVG): клик по зоне выбирает её
const layout = {
  Standard: [10, 10, 200, 120],
  Pro: [220, 10, 200, 120],
  'Team Room': [10, 140, 120, 90],
  VIP: [140, 140, 280, 90],
};
function drawMap() {
  const hall = $('#hallMap');
  if (!hall.querySelector('svg')) {
    hall.innerHTML =
      '<svg viewBox="0 0 430 240">' +
      Object.entries(layout)
        .map(([n, [x, y, w, h]]) => {
          const cols = Math.floor((w - 20) / 16),
            dots = Array.from(
              { length: zones[n].seats },
              (_, k) =>
                `<rect x="${x + 10 + (k % cols) * 16}" y="${y + 28 + Math.floor(k / cols) * 16}" width="10" height="10"/>`,
            ).join('');
          return `<g class="mz${n === 'VIP' ? ' vip' : ''}" data-z="${n}" style="--zone-accent:${zones[n].accent}" tabindex="0" role="button" aria-label="${n}: ${zones[n].purpose}" aria-pressed="false"><rect class="zr" x="${x}" y="${y}" width="${w}" height="${h}"/><text x="${x + 10}" y="${y + 18}">${n.toUpperCase()}</text>${dots}</g>`;
        })
        .join('') +
      '</svg>';
  }
  hall.querySelectorAll('.mz').forEach((zone) => {
    const selected = zone.dataset.z === state.zone;
    zone.classList.toggle('on', selected);
    zone.setAttribute('aria-pressed', String(selected));
  });
}
$('#hallMap').onclick = (e) => {
  const g = e.target.closest('[data-z]');
  if (g) setZone(g.dataset.z);
};
$('#hallMap').onkeydown = (e) => {
  if (e.key === 'Enter')
    e.target.closest('[data-z]')?.dispatchEvent(new Event('click', { bubbles: true }));
};
function showZoneTooltip(name) {
  const tooltip = $('#zoneTooltip');
  const zone = zones[name];
  if (!tooltip || !zone) return;
  tooltip.replaceChildren();
  const title = document.createElement('b');
  title.textContent = name;
  const detail = document.createElement('span');
  detail.textContent = tr(zone.purpose);
  const price = document.createElement('span');
  price.textContent = `${tr('Стоимость за час')}: ${tr(`${zone.price} ₴/час`)}`;
  tooltip.append(title, detail, price);
  tooltip.hidden = false;
}
$('#hallMap').addEventListener('pointerover', (e) => {
  const group = e.target.closest('.mz');
  if (group && !group.contains(e.relatedTarget)) showZoneTooltip(group.dataset.z);
});
$('#hallMap').addEventListener('pointerout', (e) => {
  const group = e.target.closest('.mz');
  if (group && !group.contains(e.relatedTarget) && !group.matches(':focus'))
    $('#zoneTooltip').hidden = true;
});
$('#hallMap').addEventListener('focusin', (e) => {
  const group = e.target.closest('.mz');
  if (group) showZoneTooltip(group.dataset.z);
});
$('#hallMap').addEventListener('focusout', (e) => {
  if (!e.target.closest('.mz')) return;
  if (!$('#hallMap').matches(':hover')) $('#zoneTooltip').hidden = true;
});
$('#hallMap').addEventListener('click', (e) => {
  const group = e.target.closest('.mz');
  if (group) showZoneTooltip(group.dataset.z);
});
const _sz = setZone;
setZone = (n) => {
  _sz(n);
  drawMap();
};
drawMap();

// Метки секций [ ТАРИФЫ ]
function tagH2() {
  document
    .querySelectorAll('section h2')
    .forEach((h) => (h.dataset.tag = h.textContent.toUpperCase()));
}
$('#lang').addEventListener('change', tagH2);
tagH2();

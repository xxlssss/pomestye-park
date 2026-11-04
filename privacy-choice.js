(() => {
  'use strict';
  const key = 'pomestye-privacy-choice-v1';
  const version = 2;
  const lifetime = 90 * 24 * 60 * 60 * 1000;
  const read = () => {
    try {
      const value = JSON.parse(localStorage.getItem(key));
      return value && value.version === version && ['all', 'required'].includes(value.choice)
        && Number.isFinite(value.savedAt) && value.savedAt <= Date.now()
        && Date.now() - value.savedAt < lifetime ? value : null;
    } catch (_) { return null; }
  };
  let choice = read();
  let manuallyOpened = false;
  let returnFocus = null;
  const banner = document.createElement('section');
  banner.className = 'cookie-notice';
  banner.setAttribute('role', 'region');
  banner.setAttribute('aria-label', 'Настройки cookies');
  banner.hidden = true;
  banner.innerHTML = '<div class="cookie-copy"><strong>Ваш выбор конфиденциальности</strong><p>Сохраняем ваш выбор в браузере. Яндекс Метрика (включая Вебвизор и карту кликов) и Яндекс Карты подключаются только после согласия. Отклонить — оставить только обязательное хранение выбора. <a href="privacy.html#cookies">Подробнее</a> · <a href="consent.html#map">Согласие</a></p></div><div class="cookie-actions"><button type="button" data-choice="all">Принять</button><button type="button" data-choice="required">Отклонить</button></div>';
  document.body.append(banner);
  let analyticsStarted = false;
  function analyticsState() {
    if (choice?.choice !== 'all') {
      if (analyticsStarted) { window.ym?.(114074537, 'destruct'); location.reload(); }
      return;
    }
    if (analyticsStarted) return;
    analyticsStarted = true;
    (function(m,e,t,r,i,k,a){
      m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
      m[i].l=1*new Date();
      for(var j=0;j<document.scripts.length;j++){if(document.scripts[j].src===r)return;}
      k=e.createElement(t);a=e.getElementsByTagName(t)[0];k.async=1;k.src=r;a.parentNode.insertBefore(k,a);
    })(window,document,'script','https://mc.yandex.ru/metrika/tag.js?id=114074537','ym');
    ym(114074537,'init',{ssr:true,webvisor:true,clickmap:true,referrer:document.referrer,url:location.href,accurateTrackBounce:true,trackLinks:true});
  }
  function mapState() {
    analyticsState();
    document.querySelectorAll('[data-map-src]').forEach(frame => {
      if (choice?.choice === 'all') {
        if (!frame.hasAttribute('src')) frame.src = frame.dataset.mapSrc;
        frame.hidden = false;
      } else {
        frame.removeAttribute('src');
        frame.hidden = true;
      }
    });
    document.querySelectorAll('.map-consent-placeholder').forEach(el => { el.hidden = choice?.choice === 'all'; });
  }
  function visibility() {
    // Let the existing welcome dialog finish first; never stack two notices.
    banner.hidden = !!document.querySelector('dialog[open]') || (!manuallyOpened && !!choice);
  }
  document.querySelectorAll('dialog').forEach(dialog => {
    new MutationObserver(visibility).observe(dialog, { attributes: true, attributeFilter: ['open'] });
  });
  document.addEventListener('click', event => {
    const trigger = event.target.closest('[data-cookie-settings]');
    if (!trigger) return;
    returnFocus = trigger;
    manuallyOpened = true;
    visibility();
    banner.querySelector('[data-choice="required"]').focus({ preventScroll: true });
  });
  banner.querySelectorAll('[data-choice]').forEach(button => {
    button.addEventListener('click', () => {
      choice = { version, choice: button.dataset.choice, savedAt: Date.now() };
      try { localStorage.setItem(key, JSON.stringify(choice)); } catch (_) { /* This page still honors the choice when storage is unavailable. */ }
      manuallyOpened = false;
      mapState();
      visibility();
      if (returnFocus?.isConnected && !returnFocus.closest('[hidden]')) returnFocus.focus({ preventScroll: true });
      else document.querySelector('.privacy-footer [data-cookie-settings], .privacy-page-footer [data-cookie-settings]')?.focus({ preventScroll: true });
      returnFocus = null;
    });
  });
  window.addEventListener('storage', event => {
    if (event.key !== key && event.key !== null) return;
    choice = read();
    mapState();
    visibility();
  });
  window.addEventListener('pageshow', () => { choice = read(); mapState(); visibility(); });
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) { choice = read(); mapState(); visibility(); }
  });
  mapState();
  visibility();
})();

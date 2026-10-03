// Inlined in index.html, deliberately independent of the application bundle.
(() => {
  performance.mark('intentra:startup');
  const screen = document.getElementById('startup');
  const root = document.getElementById('root');
  const translations = JSON.parse(
    document.getElementById('startup-copy').textContent,
  );
  let language =
    navigator.languages
      .map(tag => tag.slice(0, 2))
      .find(tag => tag in translations) || 'ru';
  try {
    const stored = JSON.parse(localStorage.getItem('intentra.language'));
    if (Object.hasOwn(translations, stored)) language = stored;
  } catch {
    /* Browser language also works when storage is unavailable. */
  }
  const copy = translations[language];
  document.documentElement.lang = language;
  root.inert = true;
  screen.querySelector('.startup-status').textContent = copy.loading;
  screen
    .querySelector('.startup-track')
    .setAttribute('aria-label', copy.loading);
  screen.querySelector('.startup-recovery p').textContent = copy.slow;
  const retry = screen.querySelector('button');
  retry.textContent = copy.retry;
  retry.addEventListener('click', () => location.reload());
  const slow = setTimeout(() => {
    screen.querySelector('.startup-recovery').hidden = false;
  }, 15000);
  window.addEventListener(
    'intentra:ready',
    () => {
      clearTimeout(slow);
      root.inert = false;
      document.documentElement.removeAttribute('data-starting');
      screen.dataset.leaving = '';
      const hadFocus = screen.contains(document.activeElement);
      setTimeout(
        () => {
          screen.remove();
          document.getElementById('startup-copy').remove();
          if (hadFocus) {
            root.tabIndex = -1;
            root.focus({ preventScroll: true });
          }
        },
        matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 260,
      );
    },
    { once: true },
  );
})();

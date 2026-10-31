/* Echo-Chroniken Android Universal: device mode, controller-only settings and fallback UI. */
(() => {
  'use strict';
  const native = !!(window.EchoAndroid && typeof window.EchoAndroid.getDeviceType === 'function');
  // In the APK, Android dispatches gamepad events. This stops duplicate events from JS polling.
  window.ECHO_NATIVE_INPUT = native;
  const isTelevision = native ? window.EchoAndroid.getDeviceType() === 'tv' :
    !!(window.matchMedia && window.matchMedia('(min-width: 1200px) and (pointer: fine)').matches);
  const detected = isTelevision ? 'TV' : 'Handy';
  const prefKey = 'echo_chroniken_display_mode_v1';
  const swapKey = 'echo_chroniken_face_swap_v1';
  const getSetting = (key, fallback) => { try { return localStorage.getItem(key) || fallback; } catch (_) { return fallback; } };
  const storeSetting = (key, value) => { try { localStorage.setItem(key, value); } catch (_) {} };
  let chosen = getSetting(prefKey, 'auto');
  if (!['auto','phone','tv'].includes(chosen)) chosen = 'auto';
  let swap = getSetting(swapKey, 'no') === 'yes';
  let opened = false;
  let cursor = 0;
  const gameInput = window.tvControllerInput;
  const root = document.documentElement;
  const style = document.createElement('style');
  style.textContent = `
    html.echo-television #touch-controls{display:none!important}
    html.echo-handheld #touch-controls{display:block!important}
    html.echo-handheld #hud-bar{display:none!important}
    html.echo-television #hud-bar{display:none!important}
    #echo-view-icon{position:fixed;top:8px;right:9px;z-index:48;padding:6px 10px;border:1px solid #9dbfa8;border-radius:8px;background:#1b3a34dd;color:#fff7d7;font-weight:bold;font-size:13px;opacity:.65;cursor:pointer}
    #echo-view-icon:focus-visible{opacity:1;outline:4px solid #ffdb7d}
    #echo-mode-panel{display:none;position:fixed;inset:0;z-index:100;align-items:center;justify-content:center;background:#030b14df;box-sizing:border-box;padding:12px;font-family:system-ui,sans-serif;color:#24352f;touch-action:manipulation}
    #echo-mode-panel.open{display:flex}
    #echo-mode-card{width:min(94vw,520px);max-height:95dvh;overflow:auto;border:5px solid #3c6a5d;border-radius:14px;background:#f5eaca;box-shadow:0 0 0 4px #b28d58,0 22px 80px #000a;padding:18px}
    #echo-mode-card h2{font:bold clamp(21px,4.3vw,28px) system-ui;margin:0 0 9px}
    #echo-mode-card p{line-height:1.35;font-size:14px;margin:6px 0 14px}
    #echo-mode-options{display:grid;gap:8px}
    #echo-mode-options button{border:3px solid #698f7c;background:#fff9e5;color:#24372f;min-height:46px;border-radius:8px;padding:9px;text-align:left;font:bold 16px system-ui;cursor:pointer}
    #echo-mode-options button.active{background:#224b40;color:#fff5d8;border-color:#f4bf5b;outline:3px solid #f8cd70;outline-offset:-2px}
    #echo-mode-options button span{font-size:12px;font-weight:normal;display:block}
    #echo-mode-feedback{margin-top:12px;font-size:13px;font-weight:700;color:#466050}
    #echo-mode-tip{margin-top:12px;font-size:12px;color:#4c5c50}
    .echo-touch-setting{font-size:12px!important;padding:0 6px!important}
    @media (orientation: landscape) and (max-height:420px) {
      #echo-mode-card{padding:9px 14px}
      #echo-mode-card h2{font-size:20px}
      #echo-mode-options{grid-template-columns:1fr 1fr;gap:5px}
      #echo-mode-options button{min-height:38px;font-size:13px;padding:6px}
      #echo-mode-card p,#echo-mode-feedback,#echo-mode-tip{margin:4px 0;font-size:11px}
    }
  `;
  document.head.appendChild(style);

  const container = document.createElement('div');
  container.id = 'echo-mode-panel';
  container.setAttribute('role','dialog');
  container.setAttribute('aria-modal','true');
  container.setAttribute('aria-label','Anzeige- und Steuerungseinstellungen');
  container.innerHTML = `
    <div id="echo-mode-card">
      <h2>⚙ Anzeige & Steuerung</h2>
      <p>Gerät erkannt: <strong id="echo-detected">${detected}</strong>. Beide Ansichten funktionieren mit Controller. Deine Wahl bleibt gespeichert.</p>
      <div id="echo-mode-options">
        <button type="button" data-choice="auto">🤖 Automatisch <span>Handy oder TV bei App-Start erkennen</span></button>
        <button type="button" data-choice="phone">📱 Handy-Modus <span>Virtuelles Steuerkreuz + A/B einblenden</span></button>
        <button type="button" data-choice="tv">📺 TV-Modus <span>Vollbild ohne Touch-Tasten</span></button>
        <button type="button" data-choice="swap">🎮 A/B-Belegung wechseln <span>Falls dein Switch-Controller vertauschte Knöpfe hat</span></button>
        <button type="button" data-choice="game-menu">☰ Original-Spielmenü <span>Team, Lexikon und Speichern</span></button>
        <button type="button" data-choice="close">▶ Weiterspielen <span>Mit B oder Start schließen</span></button>
      </div>
      <div id="echo-mode-feedback" aria-live="polite"></div>
      <div id="echo-mode-tip">Steuerkreuz: auswählen · A: bestätigen · B oder Start: schließen</div>
    </div>`;
  document.body.appendChild(container);
  const buttons = [...container.querySelectorAll('#echo-mode-options button')];
  const info = container.querySelector('#echo-mode-feedback');
  const launcher = document.createElement('button');
  launcher.id = 'echo-view-icon';launcher.textContent='⚙ Ansicht';
  launcher.title = 'Ansicht/Controller einstellen';
  launcher.addEventListener('click', () => open());
  document.body.appendChild(launcher);
  const toolbar = document.querySelector('#touch-toolbar');
  if (toolbar) {
    const tool = document.createElement('button');
    tool.type = 'button'; tool.className = 'touch-tool echo-touch-setting'; tool.textContent = '⚙ Modus';
    tool.addEventListener('click', () => open()); toolbar.appendChild(tool);
  }

  function effectiveMode() { return chosen === 'auto' ? (isTelevision ? 'tv' : 'phone') : chosen; }
  function applyMode() {
    const mode = effectiveMode();
    root.classList.toggle('echo-television', mode === 'tv');
    root.classList.toggle('echo-handheld', mode === 'phone');
    root.classList.toggle('tv-app', mode === 'tv');
    root.classList.toggle('force-touch', mode === 'phone');
    root.classList.toggle('no-touch-layout', mode === 'tv');
    info.textContent = `Aktiv: ${mode === 'tv' ? '📺 TV' : '📱 Handy'} · Einstellung: ${chosen === 'auto' ? 'Automatisch' : 'Manuell'} · A/B getauscht: ${swap ? 'Ja' : 'Nein'}`;
    launcher.textContent = `⚙ ${mode === 'tv' ? 'TV' : 'Handy'}`;
  }
  function drawCursor() {
    buttons.forEach((b,i) => {
      b.classList.toggle('active', i === cursor);
      b.setAttribute('aria-selected', i === cursor ? 'true' : 'false');
    });
    if (opened) buttons[cursor].scrollIntoView({block:'nearest'});
  }
  function open() { opened = true; container.classList.add('open'); cursor = 0; applyMode(); drawCursor(); }
  function close() { opened = false; container.classList.remove('open'); launcher.focus({preventScroll:true}); }
  function choose(index) {
    const opt = buttons[index]?.dataset.choice;
    if (['auto','phone','tv'].includes(opt)) { chosen = opt; storeSetting(prefKey, chosen); applyMode(); }
    else if (opt === 'swap') { swap = !swap; storeSetting(swapKey, swap ? 'yes' : 'no'); applyMode(); }
    else if (opt === 'close') close();
    else if (opt === 'game-menu') { close(); if (gameInput) gameInput('START'); }
  }
  buttons.forEach((button,i) => button.addEventListener('click', () => {cursor=i;drawCursor();choose(i);}));
  container.addEventListener('click', (e) => {if(e.target === container)close();});

  function input(raw) {
    if (!raw || typeof raw !== 'string') return;
    let cmd = raw;
    if (raw === 'A_FACE') cmd = swap ? 'B' : 'A';
    if (raw === 'B_FACE') cmd = swap ? 'A' : 'B';
    if (opened) {
      if (cmd === 'UP' || cmd === 'LEFT') {cursor=(cursor+buttons.length-1)%buttons.length;drawCursor();}
      else if (cmd === 'DOWN' || cmd === 'RIGHT') {cursor=(cursor+1)%buttons.length;drawCursor();}
      else if (cmd === 'A') choose(cursor);
      else if (cmd === 'B' || cmd === 'START') close();
      return;
    }
    if (cmd === 'START') {open();return;}
    if (gameInput) gameInput(cmd);
  }
  window.echoAndroidInput = input;
  window.tvControllerInput = input;
  window.EchoModeUI = {open,close,input,getInfo: () => ({device:detected,chosen,active:effectiveMode(),swap,opened,cursor})};
  // Allow testing the controller-only modal using a physical keyboard, too.
  window.addEventListener('keydown', (e) => {
    if (!opened && e.key !== 'F10') return;
    const keys = {ArrowUp:'UP',ArrowDown:'DOWN',ArrowLeft:'LEFT',ArrowRight:'RIGHT',Enter:'A',Escape:'B',Backspace:'B',F10:'START'};
    if (keys[e.key]) {e.preventDefault();e.stopImmediatePropagation();input(keys[e.key]);}
  }, true);
  applyMode();
})();

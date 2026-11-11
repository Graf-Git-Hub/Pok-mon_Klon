
(() => {
  const canvas = document.getElementById('screen');
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  const gbCampaign = window.EchoGBCampaign;

  // --- FARB-PALETTEN (GBA 16-Bit, Geister-Nacht, Klassik DMG) ---
  const PALETTES = [
    { name: 'GBA-Stil', filter: 'none' },
    { name: 'Geister-Nacht', filter: 'hue-rotate(195deg) saturate(1.35) brightness(0.95) contrast(1.1)' },
    { name: 'DMG-Retro', filter: 'sepia(1) hue-rotate(42deg) saturate(1.7) contrast(1.15)' },
    { name: 'Game Boy V14', filter: 'grayscale(1)' }
  ];
  let paletteIdx = gbCampaign ? 3 : 0;
  canvas.style.filter = PALETTES[paletteIdx].filter;
  const PREFS_KEY='echo_chroniken_tv_preferences';
  function storePrefs(){
    try{localStorage.setItem(PREFS_KEY,JSON.stringify({soundEnabled,paletteIdx}));}catch(_){}
  }

  // --- WEB AUDIO 8-BIT SYNTHESIZER ---
  let audioCtx = null;
  let soundEnabled = true;
  try{
    const data=JSON.parse(localStorage.getItem(PREFS_KEY)||'null');
    if(data&&typeof data==='object'){
      if(typeof data.soundEnabled==='boolean')soundEnabled=data.soundEnabled;
      if(Number.isInteger(data.paletteIdx)&&data.paletteIdx>=0&&data.paletteIdx<PALETTES.length){
        paletteIdx=data.paletteIdx;
        canvas.style.filter=PALETTES[paletteIdx].filter;
      }
    }
  }catch(_){}

  function ensureAudio() {
    if (!audioCtx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (AC) audioCtx = new AC();
    }
    if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
  }

  function playTone(freq, dur = 0.08, type = 'square', vol = 0.06, slide = 0) {
    if (!soundEnabled) return;
    ensureAudio();
    if (!audioCtx) return;
    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    if (slide !== 0) osc.frequency.linearRampToValueAtTime(Math.max(40, freq + slide), now + dur);
    gain.gain.setValueAtTime(vol, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + dur);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(now);
    osc.stop(now + dur);
  }

  const sfx = {
    step: () => playTone(170, 0.03, 'triangle', 0.03, -30),
    blip: () => playTone(520, 0.04, 'square', 0.04, 80),
    confirm: () => { playTone(587, 0.06, 'square', 0.06); setTimeout(() => playTone(880, 0.09, 'square', 0.06), 55); },
    cancel: () => playTone(300, 0.08, 'sawtooth', 0.05, -90),
    hit: () => playTone(140, 0.14, 'sawtooth', 0.09, -80),
    heal: () => { [523, 659, 784, 1046].forEach((f, i) => setTimeout(() => playTone(f, 0.09, 'triangle', 0.06), i * 65)); },
    catch: () => { [440, 554, 659, 880].forEach((f, i) => setTimeout(() => playTone(f, 0.11, 'square', 0.06), i * 85)); },
    evolve: () => { [392, 493, 587, 784, 987, 1174].forEach((f, i) => setTimeout(() => playTone(f, 0.14, 'square', 0.07), i * 95)); }
  };

  // Hintergrund-Melodie (sanfter 8-Bit Loop)
  const BGM_NOTES = [330, 392, 494, 440, 392, 330, 294, 330, 392, 523, 494, 440, 392, 349, 330, 294];
  let bgmStep = 0;
  setInterval(() => {
    if (!soundEnabled || !audioCtx || audioCtx.state !== 'running') return;
    const f = gameState.mode === 'BATTLE' ? BGM_NOTES[bgmStep % BGM_NOTES.length] * 1.25 : BGM_NOTES[bgmStep % BGM_NOTES.length];
    playTone(f * 0.5, 0.22, 'triangle', 0.02);
    bgmStep++;
  }, 360);

  // --- PROZEDURALER 150-SEELEN-GENERATOR (Inklusive Miora -> Seelara -> Maternalis) ---
  const TYPES = ['AETHER', 'FLAMME', 'FLUT', 'WURZEL', 'SCHATTEN', 'LICHT'];
  const TYPE_COLORS = {
    AETHER:   ['#e0c3fc', '#9b5de5', '#5a189a', '#240046'],
    FLAMME:   ['#ffd166', '#f77f00', '#d62828', '#540b0e'],
    FLUT:     ['#90e0ef', '#00b4d8', '#0077b6', '#03045e'],
    WURZEL:   ['#b7e4c7', '#52b788', '#2d6a4f', '#081c15'],
    SCHATTEN: ['#c77dff', '#7b2cbf', '#3c096c', '#10002b'],
    LICHT:    ['#fff3b0', '#ffca3a', '#e09f3e', '#5f4311']
  };
  const PREFIXES = ['Mio', 'See', 'Lumi', 'Nox', 'Vex', 'Koro', 'Ael', 'Pyro', 'Aqua', 'Syl', 'Mor', 'Zel', 'Ony', 'Fae', 'sol', 'Umbra', 'Kri', 'Nebu', 'Echo', 'Vela'];
  const SUFFIXES = ['ra', 'lix', 'mon', 'is', 'dor', 'fey', 'gos', 'na', 'vus', 'ria', 'lux', 'mar', 'thos', 'lin', 'zor'];
  const WHISPERS = [
    '„Ich wache über die Wege, die du gehst.“',
    '„Solange du dich erinnerst, bin ich nicht fort.“',
    '„Unter den alten Wurzeln schläft mein altes Lied.“',
    '„Ich trage das Licht eines vergangenen Sommers.“',
    '„Hörst du das leise Läuten im Abendwind?“',
    '„Keine Seele geht verloren, solange sie geliebt wird.“'
  ];

  // 150 originale PNG-Monster aus den drei eingesandten 256px-Boegen.
  // Die Evolutionsketten stammen aus KACHEL_INDEX.csv, nicht mehr aus ID-Modulo.
  const SPECIES = window.ECHO_SPECIES;
  const AFF = window.EchoTypes;
  const SKILLBOOK = window.EchoSkillbook;
  const STATUS = SKILLBOOK.STATUS;
  if(window.EchoEncounters)window.EchoEncounters.initialize(SPECIES,window.ECHO_ENCOUNTER_TABLES);

  // --- SPRITE-RENDERER: 16x16 (Oberwelt/Lexikon) & 32x32 (Kampf) ---
  const spriteCache16 = {};
  const spriteCache32 = {};

  function getMonsterSprite(id, size = 32) {
    const cache = size === 16 ? spriteCache16 : spriteCache32;
    if (cache[id]) return cache[id];

    const sp = SPECIES[id - 1];
    const pal = TYPE_COLORS[sp.type];
    const off = document.createElement('canvas');
    off.width = size;
    off.height = size;
    const c = off.getContext('2d');

    const half = size / 2;
    let seed = id * 9973;
    const rand = () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };

    // Spezielles Design für Miora (1), Seelara (2), Maternalis (3 - Mutter-Geist)
    for (let y = 2; y < size - 2; y++) {
      for (let x = 2; x < half; x++) {
        const dx = (x - half) / half;
        const dy = (y - half) / half;
        const dist = Math.sqrt(dx * dx + dy * dy);
        let fill = null;

        if (id <= 3) {
          // Engels-/Schutzgeist-Silhouette für Mutter-Linie
          const wing = (id >= 2 && y > size * 0.22 && y < size * 0.72 && x < half * 0.65);
          const halo = (id === 3 && y < size * 0.22 && Math.abs(x - half) < half * 0.45);
          if (halo) fill = '#ffffff';
          else if (dist < 0.55 + sp.stage * 0.06 || wing) {
            fill = dist < 0.28 ? pal[0] : (dist < 0.46 ? pal[1] : pal[2]);
          }
        } else {
          const threshold = 0.48 + (sp.stage * 0.07) - Math.abs(dy) * 0.15;
          if (dist < threshold && rand() > 0.18) {
            fill = dist < 0.24 ? pal[0] : (dist < 0.42 ? pal[1] : pal[2]);
          }
        }

        if (fill) {
          c.fillStyle = fill;
          c.fillRect(x, y, 1, 1);
          c.fillRect(size - 1 - x, y, 1, 1);
        }
      }
    }

    // Dunkle GBA-Kontur + leuchtende Geister-Augen
    const img = c.getImageData(0, 0, size, size);
    const d = img.data;
    const out = c.createImageData(size, size);
    const od = out.data;
    for (let y = 1; y < size - 1; y++) {
      for (let x = 1; x < size - 1; x++) {
        const idx = (y * size + x) * 4;
        if (d[idx + 3] > 0) {
          od[idx] = d[idx]; od[idx + 1] = d[idx + 1]; od[idx + 2] = d[idx + 2]; od[idx + 3] = 255;
        } else {
          const n1 = d[((y - 1) * size + x) * 4 + 3];
          const n2 = d[((y + 1) * size + x) * 4 + 3];
          const n3 = d[(y * size + (x - 1)) * 4 + 3];
          const n4 = d[(y * size + (x + 1)) * 4 + 3];
          if (n1 || n2 || n3 || n4) {
            od[idx] = 18; od[idx + 1] = 12; od[idx + 2] = 36; od[idx + 3] = 255;
          }
        }
      }
    }
    c.putImageData(out, 0, 0);

    // Augen
    const eyeY = Math.floor(size * 0.42);
    const eyeX = Math.floor(half - size * 0.16);
    c.fillStyle = id <= 3 ? '#fff' : '#ff4d6d';
    c.fillRect(eyeX, eyeY, size === 32 ? 2 : 1, size === 32 ? 2 : 1);
    c.fillRect(size - 1 - eyeX - (size === 32 ? 1 : 0), eyeY, size === 32 ? 2 : 1, size === 32 ? 2 : 1);

    cache[id] = off;
    return off;
  }

  // --- WELTKARTE (6 ZUSAMMENHÄNGENDE GEBIETE, 16x16 KACHELN) ---
  // 0: Gras, 1: Baum/Fels, 2: Hohes Geister-Gras, 3: Pfad/Boden, 4: Wasser, 5: Hauswand, 6: Heil-Altar, 7: Vater-Relikt-Tisch
  const MAP_W = 36;
  const MAP_H = 28;
  const worldMap = [];
  for (let y = 0; y < MAP_H; y++) {
    const row = [];
    for (let x = 0; x < MAP_W; x++) {
      if (x === 0 || y === 0 || x === MAP_W - 1 || y === MAP_H - 1) {
        row.push(1);
      } else if (x < 12 && y < 10) {
        // Omas Garten & Wurzelheim (oben links)
        if ((x >= 3 && x <= 7 && y >= 2 && y <= 4)) row.push(5); // Omas Haus
        else if (x === 5 && y === 5) row.push(3);
        else row.push(0);
      } else if (x >= 26 && y >= 18) {
        // Geister-Heiligtum (unten rechts)
        if (x >= 29 && x <= 33 && y >= 20 && y <= 24) row.push(3);
        else row.push(2);
      } else if (y === 13 && x > 4 && x < 31) {
        // Hauptpfad Ost-West
        row.push(3);
      } else if (x === 16 && y > 3 && y < 24) {
        // Hauptpfad Nord-Süd
        row.push(3);
      } else if ((x > 18 && x < 24 && y > 4 && y < 9)) {
        // Seelen-See
        row.push(4);
      } else if ((x + y * 3) % 7 === 0 && x > 6) {
        row.push(1);
      } else if ((x * 3 + y * 5) % 4 === 0 && (x > 9 || y > 9)) {
        row.push(2); // Hohes Gras für wilde 150 Geister-Wesen
      } else {
        row.push(0);
      }
    }
    worldMap.push(row);
  }
  // Spezielle Punkte freiräumen & platzieren
  worldMap[4][8] = 0;  // Vaters Kapsel liegt jetzt in Omas Haus
  worldMap[6][4] = 6;  // Omas Heil-Brunnen
  worldMap[13][16] = 6; // Kreuzungs-Heilstein
  worldMap[21][30] = 6; // Heiligtum-Altar
  if(window.EchoVillage){window.EchoVillage.map=worldMap;window.EchoVillage.build(worldMap);}
  window.EchoSOULS?.apply("legacy_wurzeldorf",worldMap);
  if(window.EchoRoute)window.EchoRoute.build(worldMap);
  if(window.EchoRuins)window.EchoRuins.prepareWorld(worldMap);

  // --- NPCS, ARENALEITER, TAGEBUCHSEITEN & NEBENAUFGABEN ---
  const npcs = [
    {
      id: 'oma', name: 'Oma Martha', x: 5, y: 6, color: '#f4a261',
      talk: () => {
        if (!gameState.hasStarter) {
          return [
            'Oma Martha: „Guten Morgen, mein Schatz...“',
            '„Auf Vaters Tisch rechts neben dem Haus liegt noch seine letzte versiegelte Kapsel.“',
            '„Hol sie dir, bevor du ins hohe Geister-Gras hinausgehst!“'
          ];
        }
        if (gameState.foundMusicBox && !gameState.musicBoxDelivered) {
          gameState.musicBoxDelivered = true;
          gameState.potions += 3;
          sfx.heal();
          return [
            'Oma Martha: „Meine alte Spieluhr! Du hast sie am Seelen-See gefunden!“',
            '„Weißt du... diese Melodie hat deine Mutter Elena immer für dich gesungen.“',
            '„Hier, nimm 3 Seelen-Tränke als Dankeschön, mein Kind!“'
          ];
        }
        if (gameState.badges >= 3) {
          return [
            'Oma Martha wischt sich eine Träne ab:',
            '„Jetzt kennst du das Geheimnis unserer Welt...“',
            '„Dein Vater hat die Kapsel geschmiedet, damit deine Mutter Elena als Miora immer bei dir bleiben konnte.“',
            '„Sie hat dich keinen einzigen Tag allein gelassen.“'
          ];
        }
        return [
          'Oma Martha: „Dein Vater hat sein Leben lang die 150 Wesen erforscht.“',
          '„Suche seine 3 verlorenen Tagebuchseiten und besiege die 3 Wächter-Arenen!“',
          '„Ach, und falls du am See im Nordosten meine verlorene Spieluhr findest, bring sie mir bitte.“'
        ];
      }
    },
    {
      id: 'diary1', name: 'Tagebuch S.1', x: 11, y: 12, color: '#ffd166', isObject: true,
      talk: () => {
        if (!gameState.pages[0]) {
          gameState.pages[0] = true;
          sfx.confirm();
        }
        return [
          '📄 VATERS TAGEBUCH – SEITE 1:',
          '„Die Menschen halten die 150 Wesen für bloße Naturkreaturen.“',
          '„Doch meine Messungen zeigen: Jedes Wesen trägt das exakte Echo einer verstorbenen Seele!“'
        ];
      }
    },
    {
      id: 'diary2', name: 'Tagebuch S.2', x: 23, y: 11, color: '#ffd166', isObject: true,
      talk: () => {
        if (!gameState.pages[1]) {
          gameState.pages[1] = true;
          sfx.confirm();
        }
        return [
          '📄 VATERS TAGEBUCH – SEITE 2:',
          '„Als meine geliebte Frau Elena krank wurde, schwor ich mir, dass unser Kind nicht ohne ihren Schutz aufwachsen soll.“',
          '„In der Nacht ihres Abschieds leuchtete die Kapsel Nr. 001 in reinem goldenen Licht...“'
        ];
      }
    },
    {
      id: 'diary3', name: 'Tagebuch S.3', x: 28, y: 20, color: '#ffd166', isObject: true,
      talk: () => {
        if (!gameState.pages[2]) {
          gameState.pages[2] = true;
          sfx.confirm();
        }
        return [
          '📄 VATERS TAGEBUCH – SEITE 3:',
          '„Wenn du das hier liest, bin auch ich fort. Kümmere dich gut um Miora.“',
          '„Wenn euer Band stark genug wird und sie zu Maternalis erwacht, wirst du erkennen: Es ist die Seele deiner Mutter.“'
        ];
      }
    },
    {
      id: 'musicbox', name: 'Omas Spieluhr', x: 24, y: 6, color: '#90e0ef', isObject: true,
      talk: () => {
        if (!gameState.foundMusicBox) {
          gameState.foundMusicBox = true;
          sfx.catch();
          return [
            '🎵 Du findest Omas verlorene Spieluhr am Ufer des Seelen-Sees!',
            'Eine sanfte Melodie erklingt... Dein Starter-Wesen schmiegt sich plötzlich gerührt an deine Schulter.',
            '(Nebenaufgabe: Bring die Spieluhr zurück zu Oma Martha!)'
          ];
        }
        return ['Hier am Ufer glitzert das Wasser ruhig im Licht.'];
      }
    },
    {
      id: 'gym1', name: 'Arenaleiter Kael', x: 16, y: 9, color: '#52b788',
      talk: () => {
        if (!gameState.hasStarter) return ['Kael: „Hole dir erst das Erbe deines Vaters bei Omas Haus!“'];
        if (gameState.gymDefeated[0]) return ['Arenaleiter Kael: „Dein Starter-Wesen kämpft, als würde eine Mutter ihr Kind verteidigen!“'];
        startTrainerBattle(0, 'Arenaleiter Kael', [{ id: 16, lv: 6 }, { id: 29, lv: 8 }]);
        return null;
      }
    },
    {
      id: 'gym2', name: 'Arenaleiterin Lyra', x: 25, y: 13, color: '#00b4d8',
      talk: () => {
        if (!gameState.gymDefeated[0]) return ['Lyra: „Besiege zuerst Wächter Kael im Westen, bevor du mich herausforderst!“'];
        if (gameState.gymDefeated[1]) return ['Arenaleiterin Lyra: „Hörst du es auch? Die 150 Wesen flüstern mit den Stimmen unserer Ahnen.“'];
        startTrainerBattle(1, 'Arenaleiterin Lyra', [{ id: 52, lv: 11 }, { id: 86, lv: 13, runes: ['rune_schutz'] }]);
        return null;
      }
    },
    {
      id: 'gym3', name: 'Meister Vex', x: 31, y: 22, color: '#c77dff',
      talk: () => {
        if (!gameState.gymDefeated[1]) return ['Meister Vex: „Nur wer die ersten beiden Orden trägt, darf das Heiligtum prüfen.“'];
        if (gameState.gymDefeated[2]) {
          return [
            'Meister Vex verneigt sich tief:',
            '„Du hast alle 3 Orden errungen und die Wahrheit enthüllt: Elena lebt in deinem Wesen weiter!“',
            '„Wandere weiter durch das Land und vervollständige das Erbe aller 150 Seelen!“'
          ];
        }
        startTrainerBattle(2, 'Meister Vex', [{ id: 112, lv: 15, runes: ['rune_schutz'] }, { id: 144, lv: 16, runes: ['rune_kraft'] }, { id: 150, lv: 18, runes: ['rune_nebel'] }]);
        return null;
      }
    }
  ];

  // Village characters use the original dialogue and movement system.
  if(window.EchoVillage)npcs.push(...window.EchoVillage.getNpcList());
  // Two real characters on the new woodland path. Accessible via A on touch and gamepad.
  if(window.EchoRoute){
    const route=window.EchoRoute;
    npcs.push({...route.GUIDE,talk:()=>{
      const lines=route.guideTalk(gameState,sfx);
      saveGame(true);
      return lines;
    }});
    npcs.push({...route.KEEPER,talk:()=>{
      const lines=route.keeperTalk(gameState);
      if(lines)return lines;
      startTrainerBattle(null,'Waldhüter Piko',[{id:11,lv:4}]);
      gameState.battle.routeGuardian=true;
      const enemy=gameState.battle.enemy;
      enemy.maxHp=Math.max(12,Math.round(enemy.maxHp*.78));enemy.hp=enemy.maxHp;
      enemy.encounterScale=.68;
      return null;
    }});
  }

  // --- SPIELZUSTAND (GAME STATE) ---

  // Echo V0.6: alle Fähigkeiten bleiben dauerhaft erhalten, auch bei Entwicklungen.
  const ATTACKS = {
    seelenstups:{name:'Seelenstups',type:'NORMAL',power:22,desc:'Ein sicherer, kleiner Stoß.'},
    sternenstaub:{name:'Sternenstaub',type:'NORMAL',power:34,desc:'Sternenstaub wirbelt durch die Luft.'},
    echowelle:{name:'Echowelle',type:'GEIST',power:44,desc:'Ein heller Schall trifft das Ziel.'},
    astralsturm:{name:'Astralsturm',type:'GEIST',power:58,desc:'Ein Sturm aus alten Erinnerungen.'},
    lichtfunke:{name:'Lichtfunke',type:'LICHT',power:26,desc:'Ein warmer Funke.',fx:'#ffe58a'},
    mondschein:{name:'Mondschein',type:'LICHT',power:36,desc:'Ein Lichtstrahl in der Nacht.',fx:'#fff0af'},
    sternenfall:{name:'Sternenfall',type:'LICHT',power:48,desc:'Leuchtende Sterne treffen das Ziel.',fx:'#f4dfaa'},
    sonnenchor:{name:'Sonnenchor',type:'LICHT',power:65,desc:'Eine machtvolle Lichtmelodie.',fx:'#fff5c5'},
    heilflimmern:{name:'Heilflimmern',type:'LICHT',power:0,heal:24,desc:'Stellt eigene HP wieder her.'},
    schattentipp:{name:'Schattentipp',type:'SCHATTEN',power:26,desc:'Eine leise Berührung.',fx:'#aa78d9'},
    nebelbiss:{name:'Nebelbiss',type:'SCHATTEN',power:37,desc:'Geisternebel wird zu Zähnen.',fx:'#8462c2'},
    nachthieb:{name:'Nachthieb',type:'SCHATTEN',power:49,desc:'Ein schneller Hieb im Dunkeln.',fx:'#7653b5'},
    finsternis:{name:'Finsternis',type:'SCHATTEN',power:64,desc:'Ein schwerer Schatten fällt.',fx:'#6451b5'},
    glutfunken:{name:'Glutfunken',type:'FLAMME',power:26,desc:'Kleine, wilde Funken.',fx:'#efaa67'},
    funkenflug:{name:'Funkenflug',type:'FLAMME',power:37,desc:'Ein Schwarm heißer Funken.',fx:'#f19d56'},
    feuerwirbel:{name:'Feuerwirbel',type:'FLAMME',power:49,desc:'Flammen drehen sich im Kreis.',fx:'#dc6953'},
    phönixstoß:{name:'Phönixstoß',type:'FLAMME',power:64,desc:'Ein feuriger Vorstoß.',fx:'#ff9c59'},
    wasserperle:{name:'Wasserperle',type:'FLUT',power:26,desc:'Ein klarer Tropfen.',fx:'#70cddd'},
    wellenschlag:{name:'Wellenschlag',type:'FLUT',power:37,desc:'Die Welle holt Schwung.',fx:'#62bfd5'},
    gezeitenruf:{name:'Gezeitenruf',type:'FLUT',power:49,desc:'Das Wasser antwortet.',fx:'#4e9ed0'},
    sturmflut:{name:'Sturmflut',type:'FLUT',power:64,desc:'Eine mächtige Welle.',fx:'#75dbe8'},
    blattschnips:{name:'Blattschnips',type:'WURZEL',power:26,desc:'Ein raschelndes Blatt.',fx:'#8ccc75'},
    rankengriff:{name:'Rankengriff',type:'WURZEL',power:37,desc:'Grüne Ranken schlagen zu.',fx:'#71bd69'},
    waldsegen:{name:'Waldsegen',type:'WURZEL',power:0,heal:20,desc:'Heilende Kraft des Waldes.'},
    mooshammer:{name:'Mooshammer',type:'WURZEL',power:49,desc:'Ein grüner Aufprall.',fx:'#57ad62'},
    wurzelsturm:{name:'Wurzelsturm',type:'WURZEL',power:64,desc:'Wurzeln wirbeln empor.',fx:'#4b9e5d'}
  };
  Object.assign(ATTACKS,SKILLBOOK.ATTACKS);
  const TYPE_SKILLS = {
    LICHT:['lichtfunke','mondschein','heilflimmern','sternenfall','sonnenchor'],
    SCHATTEN:['schattentipp','nebelbiss','nachthieb','finsternis'],
    FLAMME:['glutfunken','funkenflug','feuerwirbel','phönixstoß'],
    FLUT:['wasserperle','wellenschlag','gezeitenruf','sturmflut'],
    WURZEL:['blattschnips','rankengriff','waldsegen','mooshammer','wurzelsturm'],
    AETHER:['seelenstups','sternenstaub','echowelle','astralsturm']
  };
  Object.assign(TYPE_SKILLS,SKILLBOOK.TYPE_SKILLS);
  const MAX_BATTLE_MOVES=SKILLBOOK.MAX_EQUIPPED;
  const MAX_RUNE_MOVES=SKILLBOOK.MAX_RUNE_LEARNED;
  function learnedFor(specOrType,lv){
    const types=typeof specOrType==='string'?[AFF.normalize(specOrType)]:AFF.typesFor(specOrType);
    const primary=TYPE_SKILLS[types[0]]||TYPE_SKILLS.GEIST;
    const secondary=TYPE_SKILLS[types[1]]||[];
    const levels=[1,7,11,16,24];
    const entries=primary.map((id,i)=>({id,lv:levels[i]||30}));
    entries.push({id:'seelenstups',lv:3},{id:'sternenstaub',lv:9},
      {id:'echowelle',lv:19},{id:'astralsturm',lv:30});
    if(secondary.length){
      entries.push({id:secondary[0],lv:8});
      if(secondary[1])entries.push({id:secondary[1],lv:18});
      if(secondary[2])entries.push({id:secondary[2],lv:28});
    }
    return entries.filter(x=>x.lv<=lv).sort((a,b)=>b.lv-a.lv)
      .map(x=>x.id).filter((id,i,a)=>a.indexOf(id)===i);
  }
  function recommendedLoadout(monster){
    const skills=monster.moves.filter(id=>ATTACKS[id]);
    const attackers=skills.filter(id=>(ATTACKS[id].power||0)>0)
      .sort((a,b)=>ATTACKS[b].power-ATTACKS[a].power).slice(0,3);
    const heal=skills.find(id=>ATTACKS[id].heal);
    if(heal && attackers.length<MAX_BATTLE_MOVES && !attackers.includes(heal))attackers.push(heal);
    for(const id of skills)if(attackers.length<MAX_BATTLE_MOVES&&!attackers.includes(id))attackers.push(id);
    return attackers.slice(0,MAX_BATTLE_MOVES);
  }
  function ensureMonsterMoves(monster){
    const natural=learnedFor(SPECIES[monster.id-1],monster.lv);
    if(!Array.isArray(monster.moves))monster.moves=natural.slice();
    for(const id of natural)if(!monster.moves.includes(id))monster.moves.push(id);
    monster.moves=monster.moves.filter((id,i,a)=>!!ATTACKS[id]&&a.indexOf(id)===i);
    if(!monster.moves.length)monster.moves=['seelenstups'];
    if(!Array.isArray(monster.runeMoves))monster.runeMoves=[];
    monster.runeMoves=monster.runeMoves.filter(id=>SKILLBOOK.RUNE_IDS.includes(id)&&monster.moves.includes(id))
      .slice(0,MAX_RUNE_MOVES);
    if(!Array.isArray(monster.equippedMoves))monster.equippedMoves=recommendedLoadout(monster);
    monster.equippedMoves=monster.equippedMoves
      .filter((id,i,a)=>monster.moves.includes(id)&&a.indexOf(id)===i).slice(0,MAX_BATTLE_MOVES);
    if(!monster.equippedMoves.length)monster.equippedMoves=recommendedLoadout(monster);
    return monster.moves;
  }
  function battleMoves(monster){
    ensureMonsterMoves(monster);
    return monster.equippedMoves;
  }
  function toggleEquipped(monster,id){
    ensureMonsterMoves(monster);
    const active=monster.equippedMoves;
    const index=active.indexOf(id);
    if(index!==-1){
      if(active.length===1)return false;
      active.splice(index,1);
    }else if(monster.moves.includes(id)){
      if(active.length>=MAX_BATTLE_MOVES)active.pop();
      active.unshift(id);
    }else return false;
    monster.manualLoadout=true;
    saveGame(true);
    return true;
  }
  function addLevelMoves(monster,prevLevel,log){
    // Keep the pre-level-up book intact until newly unlocked skills are
    // announced; ensureMonsterMoves() would silently add them too early.
    if(!Array.isArray(monster.moves))
      monster.moves=learnedFor(SPECIES[monster.id-1],Math.max(1,prevLevel));
    const natural=learnedFor(SPECIES[monster.id-1],monster.lv);
    for(const id of natural.slice().reverse()){
      if(!monster.moves.includes(id)){
        monster.moves.unshift(id);
        if(log)log.push('⚡ '+SPECIES[monster.id-1].name+' lernt '+ATTACKS[id].name+'!');
      }
    }
    if(!monster.manualLoadout)monster.equippedMoves=recommendedLoadout(monster);
    ensureMonsterMoves(monster);
  }
  // Shared by both the playable engine and seeded two-million battle audit.
  const PASSIVE_RUNES=Object.freeze({
    rune_kraft:{name:'Kraft-Rune',attack:1.12,defense:1},
    rune_schutz:{name:'Schutz-Rune',attack:1,defense:.88},
    rune_nebel:{name:'Nebel-Rune',attack:1.07,defense:.93},
    rune_ahnen:{name:'Ahnen-Rune',attack:1,defense:1,heal:.03}
  });
  function runeCombatModifiers(m){
    let attack=1,defense=1,heal=0;
    const seen=new Set();
    for(const x of (Array.isArray(m?.equipment)?m.equipment:[])){
      if(!x||seen.has(x.id))continue;
      const rule=PASSIVE_RUNES[x.id];if(!rule)continue;
      seen.add(x.id);
      attack*=rule.attack;defense*=rule.defense;heal+=rule.heal||0;
    }
    return {attack,defense,heal};
  }
  function passiveHitHeal(m){
    if(!m||m.hp<=0)return 0;
    const rate=runeCombatModifiers(m).heal;
    if(rate<=0)return 0;
    const points=Math.min(m.maxHp-m.hp,Math.max(1,Math.ceil(m.maxHp*rate)));
    m.hp+=points;return points;
  }
  function runeReserveXp(xpGain,holderActive,reserveCount){
    if(!reserveCount)return 0;
    return Math.floor(Math.floor(xpGain*(holderActive?1:.4))/reserveCount);
  }
  function skillDamage(user,target,move){
    const us=SPECIES[user.id-1],ts=SPECIES[target.id-1];
    const match=AFF.effectiveness(move.type,ts);
    const same=AFF.stab(move.type,us);
    const raw=move.power*.205+user.lv*.48+us.atk*.17-ts.def*.14;
    const boost=runeCombatModifiers(user).attack*runeCombatModifiers(target).defense;
    return Math.max(2,Math.floor(raw*(.92+Math.random()*.14)*match*same*boost));
  }
  function createMonsterInstance(id,lv){
    const sp=SPECIES[id-1];
    const maxHp=Math.floor(sp.hp+lv*4.5);
    const m={uid:Math.random().toString(36).slice(2),id,lv,xp:0,nextXp:lv*18,
      maxHp,hp:maxHp,moves:learnedFor(sp,lv),runeMoves:[],equippedMoves:[],equipment:[]};
    m.equippedMoves=recommendedLoadout(m);
    return m;
  }
  const GEAR_ITEMS=Object.freeze([
    {id:'heiltrank',name:'Seelen-Trank'},
    {id:'antidot',name:'Gegengift'},
    {id:'schockloeser',name:'Entstoerer'},
    {id:'brandmittel',name:'Brandbalsam'},
    {id:'rucksack',name:'Rucksack'},
    {id:'rune_kraft',name:'Kraft-Rune'},
    {id:'rune_schutz',name:'Schutz-Rune'},
    {id:'rune_nebel',name:'Nebel-Rune'},
    {id:'rune_ahnen',name:'Ahnen-Rune'}
  ]);
  const BAG_CAPACITY=2;
  const gearLimit=m=>Math.max(1,Math.min(3,Number(SPECIES[m.id-1]?.stage)||1));
  const inventoryCount=id=>id==='heiltrank'?(gameState.potions||0):
    (gameState.gearStock?.[id]||0);
  function ensureEquipment(m){
    if(!Array.isArray(m.equipment))m.equipment=[];
    const clean=m.equipment.filter(x=>x&&GEAR_ITEMS.some(item=>item.id===x.id));
    m.equipment.splice(0,m.equipment.length,...clean);
    for(const x of m.equipment){
      if(x.id!=='rucksack')continue;
      if(!Array.isArray(x.contents))x.contents=[];
      x.contents=x.contents.filter(item=>item!=='rucksack'&&GEAR_ITEMS.some(g=>g.id===item))
        .slice(0,BAG_CAPACITY);
    }
    return m.equipment;
  }
  function addInventory(id,count=1){
    if(id==='heiltrank')gameState.potions=(gameState.potions||0)+count;
    else gameState.gearStock[id]=(gameState.gearStock[id]||0)+count;
  }
  function occupiedSlots(m){
    return ensureEquipment(m).length+(m.heldSupportRune==='ep_teiler'?1:0);
  }
  function toggleGear(m,id){
    if(!m||!GEAR_ITEMS.some(item=>item.id===id))return 'Unbekannter Gegenstand.';
    const eq=ensureEquipment(m),index=eq.findIndex(x=>x.id===id);
    if(index>=0){
      const found=eq.splice(index,1)[0];
      if(id==='rucksack')for(const cargo of found.contents||[])addInventory(cargo);
      addInventory(id);saveGame(true);
      return 'Gegenstand ins Inventar zurueckgelegt.';
    }
    for(const bag of eq.filter(x=>x.id==='rucksack')){
      const idx=bag.contents.indexOf(id);
      if(idx>=0){
        bag.contents.splice(idx,1);addInventory(id);saveGame(true);
        return 'Gegenstand aus dem Rucksack zurueckgelegt.';
      }
    }
    if(inventoryCount(id)<=0)return 'Kein Exemplar mehr im Inventar.';
    if(PASSIVE_RUNES[id]&&eq.some(x=>x.id===id))
      return 'Eine Rune derselben Art reicht fuer dieses Wesen.';
    if(occupiedSlots(m)<gearLimit(m)){
      addInventory(id,-1);
      eq.push(id==='rucksack'?{id,contents:[]}:{id});saveGame(true);
      return SPECIES[m.id-1].name+' hat '+GEAR_ITEMS.find(x=>x.id===id).name+' angelegt.';
    }
    if(id==='rucksack'||PASSIVE_RUNES[id])
      return 'Kein freier Ausruestungsplatz fuer diese Rune / Tasche.';
    const bag=eq.find(x=>x.id==='rucksack'&&x.contents.length<BAG_CAPACITY);
    if(!bag)return 'Keine freien Plaetze (auch nicht im Rucksack).';
    addInventory(id,-1);bag.contents.push(id);saveGame(true);
    return SPECIES[m.id-1].name+' hat '+GEAR_ITEMS.find(x=>x.id===id).name+' eingepackt.';
  }
  function consumeEquipped(m,id){
    const eq=ensureEquipment(m);
    const index=eq.findIndex(x=>x.id===id);
    if(index>=0){eq.splice(index,1);return true;}
    for(const bag of eq.filter(x=>x.id==='rucksack')){
      const index=bag.contents.indexOf(id);
      if(index>=0){bag.contents.splice(index,1);return true;}
    }
    return false;
  }
  // Emergency equipment triggers automatically, without consuming a turn.
  // Cures have priority; one healing potion can trigger on each damaging action.
  function autoUseGear(m){
    const b=gameState.battle;
    if(!b||!m||m.hp<=0)return [];
    const fx=STATUS.state(b,m),used=[];
    if(fx.poison>0&&consumeEquipped(m,'antidot')){
      fx.poison=0;used.push('Gegengift hebt Vergiftung auf');
    }
    if((fx.paralysis>0||(fx.weak>0&&['SCHOCK','PARALYSE'].includes(fx.weakLabel)))&&consumeEquipped(m,'schockloeser')){
      fx.paralysis=0;
      if(['SCHOCK','PARALYSE'].includes(fx.weakLabel)){fx.weak=0;fx.weakLabel='';}
      used.push('Entstoerer hebt Laehmung/Schock auf');
    }
    if(fx.burn>0&&consumeEquipped(m,'brandmittel')){
      fx.burn=0;used.push('Brandbalsam loescht Brand');
    }
    if(m.hp>0&&m.hp/Math.max(1,m.maxHp)<=.30&&consumeEquipped(m,'heiltrank')){
      const healed=Math.min(m.maxHp-m.hp,potionHealAmount(m));
      m.hp+=healed;used.push('Seelen-Trank heilt '+healed+' HP');
    }
    if(used.length){
      b.log+=' / '+SPECIES[m.id-1].name+': '+used.join(', ')+' (automatisch)';
      sfx.heal();saveGame(true);
    }
    return used;
  }

  // EP-Teiler is passive equipment, never a learned move or one of four battle skills.
  function availableRunes(){
    const attackRunes=SKILLBOOK.RUNES.filter(x=>(gameState.runes[x.id]||0)>0);
    return gameState.supportRuneUnlocked?
      [{id:'ep_teiler',name:'EP-Teiler',kind:'support'},...attackRunes]:attackRunes;
  }
  function toggleSupportRune(monster){
    if(!monster||!gameState.supportRuneUnlocked)return 'Die EP-Rune wurde noch nicht gefunden.';
    if(monster.heldSupportRune==='ep_teiler'){
      delete monster.heldSupportRune;
      saveGame(true);
      return 'Der EP-Teiler wurde abgelegt.';
    }
    if(occupiedSlots(monster)>=gearLimit(monster))
      return 'Kein freier Ausruestungsplatz fuer die EP-Rune.';
    // Only one copy exists. Moving it from the archive or a teammate cannot duplicate it.
    for(const member of [...gameState.team,...(gameState.archive||[])])
      if(member&&member.heldSupportRune==='ep_teiler')delete member.heldSupportRune;
    monster.heldSupportRune='ep_teiler';
    saveGame(true);
    return SPECIES[monster.id-1].name+' traegt jetzt den EP-Teiler. Im Kampf kurz einsetzen reicht!';
  }

  function teachRune(monster,runeId){
    ensureMonsterMoves(monster);
    const rune=SKILLBOOK.RUNES.find(x=>x.id===runeId);
    if(!rune||!ATTACKS[runeId]||(gameState.runes?.[runeId]||0)<1)
      return 'Diese Rune ist nicht in deinem Beutel.';
    if(monster.moves.includes(runeId))return 'Dieses Wesen kennt die Attacke bereits.';
    if(monster.runeMoves.length>=MAX_RUNE_MOVES)
      return 'Dieses Wesen hat bereits zwei Runenattacken gelernt.';
    if(!AFF.compatible(monster,ATTACKS[runeId].type))
      return 'Diese Rune passt nicht zur Natur dieses Wesens.';
    gameState.runes[runeId]--;
    monster.moves.unshift(runeId);
    monster.runeMoves.push(runeId);
    if(monster.equippedMoves.length<MAX_BATTLE_MOVES)
      monster.equippedMoves.unshift(runeId);
    ensureMonsterMoves(monster);saveGame(true);
    return SPECIES[monster.id-1].name+' lernt '+ATTACKS[runeId].name+
      '! Im Attackenbuch kannst du vier Angriffe vorbereiten.';
  }

    window.EchoMaps?.registerLegacy(worldMap);
    window.EchoChapter3?.register(worldMap);
    window.EchoChapter4?.register();
     window.EchoChapter5?.register();
    window.EchoStoryRegions?.register();
    window.EchoEndgame?.register();
     window.EchoFinale?.register();
    window.EchoPostgame?.register();
    window.EchoSOULS?.applyAll(window.EchoMaps);

    const gameState = {
    mode: 'OVERWORLD', // OVERWORLD, DIALOG, BATTLE, LEXICON, MENU
    player: { x: 7, y: 7, dir: 'down', stepPhase: 0 },
    scene: 'HOUSE',
    saveSchemaVersion: 2,
    currentMapId: 'legacy_wurzeldorf',
    safeSpawnId: 'legacy_current_position',
    introStage: 0, // 0: Oma; 1: Paket; 2: Oma; 3: Ausgang; 4: Wurzelheim
    hasStarter: false,
    team: [],
    archive: [],
    caughtIds: {},
    seenIds: {},
    badges: 0,
    gymDefeated: [false, false, false],
    pages: [false, false, false],
    foundMusicBox: false,
    musicBoxDelivered: false,
    potions: 5,
    orbs: 12,
    coins:75,
    shopBought:{},
    runeFinds:{mist:false,ancestor:false},
    shopCursor:0,
    runes: {},
    runeRewards: {},
    gearStock:{antidot:1,schockloeser:1,brandmittel:1,rucksack:1},
    gearCursor:0,
    supportRuneUnlocked: false,
    runeCursor: 0,
    runeTeamCursor: 0,
    attackBookTeamCursor: 0,
    encounterGrace: 0,
    battleWins: 0,
    routeQuest: {accepted:false,lights:[],rewarded:false,guardianWon:false},
    explorationFound: [],
    indoorProgress: {},
    platformProgress: {cleared:false,bestSeconds:null},
    ruinsProgress: {seals:[],bossWon:false,clueSeen:false},
    chapter3: null,
    chapter4: null,
    chapter5: null,
    chapter6: null,
    chapter7: null,
    chapter8: null,
    chapter9: null,
    chapter10: null,
    chapter11: null,
     chapter12: null,
     chapter13: null,
     chapter14: null,
     postgame: null,
     optional_postgame_completed: false,
     main_story_finished: false,
    railCursor: 0,
    ruinsReturn: null,
    roomId: null,
    returnToVillage: null,
    stepsSinceSave: 0,
    attackOrigin: null,
    dialogQueue: [],
    dialogCallback: null,
    lexiconCursor: 1,
    menuCursor: 0,
    bagCursor: 0,
    teamMenuCursor: 0,
    optionsCursor: 0,
    lexiconOrigin:'OVERWORLD',
    runeOrigin:'MENU',
    equipmentOrigin:'RUNEBOOK',
    battle: null
  };

  // --- SPEICHERN & LADEN (LOCAL STORAGE) ---
  function saveGame(silent=false) {
    if (typeof savedBeforeLab !== "undefined" && savedBeforeLab) return;
    try {
      const saveObj = {
        saveSchemaVersion: 2,
        currentMapId: gameState.currentMapId,
        safeSpawnId: gameState.safeSpawnId,
        player: gameState.player,
        scene: gameState.scene,
        introStage: gameState.introStage,
        hasStarter: gameState.hasStarter,
        team: gameState.team,
        archive: gameState.archive,
        caughtIds: gameState.caughtIds,
        seenIds: gameState.seenIds,
        badges: gameState.badges,
        gymDefeated: gameState.gymDefeated,
        pages: gameState.pages,
        foundMusicBox: gameState.foundMusicBox,
        musicBoxDelivered: gameState.musicBoxDelivered,
        potions: gameState.potions,
        orbs: gameState.orbs,
        coins:gameState.coins,
        shopBought:gameState.shopBought,
        runeFinds:gameState.runeFinds,
        runes: gameState.runes,
        runeRewards: gameState.runeRewards,
        gearStock: gameState.gearStock,
        supportRuneUnlocked: gameState.supportRuneUnlocked,
        encounterGrace: gameState.encounterGrace,
        battleWins: gameState.battleWins,
        routeQuest: gameState.routeQuest,
        explorationFound: gameState.explorationFound,
        indoorProgress: gameState.indoorProgress,
        platformProgress: gameState.platformProgress,
        ruinsProgress: gameState.ruinsProgress,
        chapter3: gameState.chapter3,
        chapter4: gameState.chapter4,
        chapter5: gameState.chapter5,
        chapter6: gameState.chapter6,
        chapter7: gameState.chapter7,
        chapter8: gameState.chapter8,
        chapter9: gameState.chapter9,
        chapter10: gameState.chapter10,
        chapter11: gameState.chapter11,
         chapter12: gameState.chapter12,
         chapter13: gameState.chapter13,
         chapter14: gameState.chapter14,
         postgame: gameState.postgame,
         optional_postgame_completed: gameState.optional_postgame_completed,
         main_story_finished: gameState.main_story_finished,
        ruinsReturn: gameState.ruinsReturn,
        roomId: gameState.roomId,
        returnToVillage: gameState.returnToVillage,
        balanceVersion: 6
      };
      localStorage.setItem('echo_chroniken_tv_save', JSON.stringify(saveObj));
      if(!silent){sfx.heal();showDialog(['💾 Spielstand erfolgreich gespeichert!']);}
    } catch (e) {
      if(!silent)showDialog(['Speichern fehlgeschlagen.']);
    }
  }

  function loadGame() {
    try {
      const raw = localStorage.getItem('echo_chroniken_tv_save');
      if (!raw) return false;
      const d = JSON.parse(raw);
      if (!d || typeof d !== 'object' || Array.isArray(d)) return false;
      // Check upgrade BEFORE mutating a game state; this also rejects future schemas.
      const upgraded = window.EchoMaps?.migrateSave(d) || d;
      window.EchoMaps?.backupLegacy(localStorage, raw, d);
      Object.assign(gameState, upgraded);
      // Migration: bereits begonnene Spielstände behalten ihr Team und ihren Fortschritt.
      if(!d.scene){
        gameState.scene=gameState.hasStarter?'OVERWORLD':'HOUSE';
        gameState.introStage=gameState.hasStarter?4:0;
        if(!gameState.hasStarter)gameState.player={x:7,y:7,dir:'down',stepPhase:0};
      }
      gameState.introStage=Math.max(0,Math.min(4,Number(gameState.introStage)||0));
      if(window.EchoRoute)window.EchoRoute.quest(gameState); // Keep old saves compatible.
      window.EchoExplore?.ensure(gameState);
      window.EchoInteriors?.ensure(gameState);
      window.EchoPlatformer?.ensure(gameState);
      window.EchoRuins?.ensure(gameState);
      window.EchoChapter3?.ensure(gameState);
      window.EchoChapter4?.ensure(gameState);
       window.EchoChapter5?.ensure(gameState);
      window.EchoStoryRegions?.ensure(gameState);
      window.EchoEndgame?.ensure(gameState);
       window.EchoFinale?.ensure(gameState);
      window.EchoPostgame?.ensure(gameState);
      window.EchoArchive?.ensure(gameState);
      if(gameState.scene==='BUILDING'&&!window.EchoInteriors?.ROOMS[gameState.roomId]){
        gameState.scene='OVERWORLD';gameState.player={x:5,y:6,dir:'down',stepPhase:0};
      }
      // Migrate old saved positions that now lie inside one of the new buildings.
      if(gameState.scene==='OVERWORLD'&&gameState.currentMapId==='legacy_wurzeldorf'&&window.EchoVillage&&gameState.player){
        const p=gameState.player;
        if(!worldMap[p.y]||[1,4,5,7].includes(worldMap[p.y][p.x])){
          const h=window.EchoVillage.homes.find(h=>p.x>=h.x&&p.x<h.x+5&&p.y>=h.y&&p.y<h.y+3);
          gameState.player={x:h?h.x+2:5,y:h?h.y+3:6,dir:'down',stepPhase:0};
        }
      }
      if(gameState.scene==='OVERWORLD'&&gameState.currentMapId!=='legacy_wurzeldorf'){
         const m=window.EchoMaps?.get(gameState.currentMapId);
         const p=gameState.player;
         if(!m||!p||!m.tiles[p.y]||[1,4,5,7].includes(m.tiles[p.y][p.x])){
           const safe=m?.spawns[gameState.safeSpawnId]||m?.spawns[Object.keys(m.spawns)[0]];
           gameState.player={x:safe?.x??5,y:safe?.y??6,dir:'down',stepPhase:0};
           if(!m){gameState.currentMapId='legacy_wurzeldorf';gameState.player.x=5;gameState.player.y=6;}
         }
       }
       if(!gameState.runes||typeof gameState.runes!=='object')gameState.runes={};
      if(!gameState.runeRewards||typeof gameState.runeRewards!=='object')gameState.runeRewards={};
      if(!gameState.gearStock||typeof gameState.gearStock!=='object')
        gameState.gearStock={antidot:1,schockloeser:1,brandmittel:1,rucksack:1};
      gameState.coins=Number.isFinite(Number(gameState.coins))?
        Math.max(0,Math.min(9999,Math.floor(Number(gameState.coins)))):75;
      if(!gameState.shopBought||typeof gameState.shopBought!=='object')gameState.shopBought={};
      if(!gameState.runeFinds||typeof gameState.runeFinds!=='object')gameState.runeFinds={mist:false,ancestor:false};
      if(!Array.isArray(gameState.team))gameState.team=[];
      for(const creature of [...gameState.team,...(gameState.archive||[])])
        ensureEquipment(creature);
      // Grant the new passive rune retroactively to existing players who have won before.
      gameState.supportRuneUnlocked=!!gameState.supportRuneUnlocked||
        (Number(gameState.battleWins)||0)>0||(Number(gameState.badges)||0)>0;
      gameState.team.forEach(m=>{ensureMonsterMoves(m);if(!m.nextXp)m.nextXp=m.lv*18;});
      if((d.balanceVersion||0)<6){
        // Einmalige Wiedergutmachung für überharte frühe Kämpfe.
        gameState.team.forEach(m=>m.hp=m.maxHp);
        gameState.potions=Math.max(5,gameState.potions||0);
        gameState.orbs=Math.max(12,gameState.orbs||0);
      }
      return true;
    } catch (e) {
      return false;
    }
  }

  // Kein langer Startdialog: sofort bewegen und Oma selbst ansprechen.
  loadGame();

  function showDialog(lines, onDone = null) {
    gameState.mode = 'DIALOG';
    gameState.dialogQueue = [...lines];
    gameState.dialogCallback = onDone;
    sfx.blip();
  }

  // --- KAMPFSYSTEM (32x32 GBA-MODUS) ---
// Encounter balance must never treat a beginner as a late-game traveler.
  // Keep this logic independent from the map renderer to survive future map changes.
  function wildEncounterLimits(player=gameState.player, badges=gameState.badges, team=gameState.team){
    const x=Number(player?.x)||0, y=Number(player?.y)||0;
    const earned=Math.max(0,Math.min(3,Math.floor(Number(badges)||0)));
    const strongest=Math.max(5,...(Array.isArray(team)?team:[])
      .map(m=>Math.max(1,Math.floor(Number(m?.lv)||1))));
    // First wandering meadows stretch beyond the village; crossing x=13/y=16
    // must NOT silently turn a starter encounter into Lv.13+.
    const beginnerRoute=(x<=32 && y<=21);
    const progressionCaps=[beginnerRoute?4:5,10,15,20];
    const progressionFloors=[beginnerRoute?2:3,5,8,12];
    const cap=Math.min(progressionCaps[earned],strongest+1);
    const low=Math.min(cap,progressionFloors[earned]);
    return {
      low,cap,stageCap:earned===0?1:Math.min(3,earned+1),
      poolCap:earned===0?48:Math.min(150,55+earned*35),
      starterZone:earned===0,
      // Training wheels for the first three victories: fewer HP and softer hits.
      newcomer:earned===0 && (Number(gameState.battleWins)||0)<3
    };
  }
  function startWildBattle(rareEchoTrace=false){
    let limits=wildEncounterLimits();
    if(gameState.currentMapId!=='legacy_wurzeldorf'){
      const strongest=Math.max(5,...gameState.team.map(m=>m.lv||1));
      const late=gameState.currentMapId==='moorglas_bog';
      const postgameZone=!!window.EchoPostgame?.names[gameState.currentMapId];
      const storyChapter=window.EchoFinale?.chapterOf[gameState.currentMapId]||
         window.EchoEndgame?.chapterOf[gameState.currentMapId]||
        window.EchoStoryRegions?.chapterOf[gameState.currentMapId]||0;
      const chapterCap=storyChapter===6?26:storyChapter===7?30:
        storyChapter===8?35:storyChapter===9?39:storyChapter===10?43:
         storyChapter===11?47:storyChapter===12?50:storyChapter===13?55:60;
      const cap=postgameZone?Math.max(8,Math.min(65,strongest+1)):
        storyChapter?Math.max(8,Math.min(chapterCap,strongest+1)):
        late?Math.max(7,Math.min(17,strongest+1)):Math.min(12,strongest+1);
      const low=postgameZone?Math.max(8,Math.min(cap,strongest-2)):
        storyChapter?Math.max(8,Math.min(cap,strongest-2)):
        late?Math.max(7,Math.min(cap,strongest-2)):Math.min(10,Math.max(3,strongest-2));
      limits={...limits,low,cap,poolCap:150,stageCap:1,
        starterZone:strongest<(late?11:9),newcomer:false};
    }
    const wildLv=limits.low+Math.floor(Math.random()*(limits.cap-limits.low+1));
    // Registry is explicit per map. If the current future map has no table,
    // skip the encounter rather than silently pulling Wurzelheim's ghosts.
    let wildId;
    if(window.EchoEncounters){
      wildId=window.EchoEncounters.choose(gameState.currentMapId||'legacy_wurzeldorf',
        {...limits,badges:gameState.badges},wildLv);
      if(wildId===null)return false;
      if(rareEchoTrace&&storyChapter===7)wildId=57; // Trace points to the rare Waldhirsch base form.
    }else{
      // Standalone legacy unit harnesses still run without new modules.
      const choices=SPECIES.filter(sp=>sp.id!==1 && sp.id<=limits.poolCap
        && sp.stage<=limits.stageCap);
      if(!choices.length)throw new Error('No wild species available at this stage');
      wildId=choices[Math.floor(Math.random()*choices.length)].id;
    }
    gameState.seenIds[wildId]=true;
    const enemy=createMonsterInstance(wildId,wildLv);
    if(limits.starterZone){
      const hpScale=limits.newcomer?.70:.84;
      enemy.maxHp=Math.max(12,Math.round(enemy.maxHp*hpScale));
      enemy.hp=enemy.maxHp;
      enemy.encounterScale=limits.newcomer?.60:.78;
    }
    gameState.attackOrigin=null;gameState.mode='BATTLE';
    gameState.battle={isTrainer:false,trainerName:null,gymIndex:null,
      enemyQueue:[enemy],enemy,cursor:0,attackCursor:0,attackTop:0,
      log:`Ein wildes ${SPECIES[wildId-1].name} (Lv.${wildLv}) erscheint!`,
      animTimer:0,busy:false,participants:[getActiveAlly()]};
    autoUseGear(getActiveAlly());
    sfx.confirm();
  }

    function startTrainerBattle(gymIndex, trainerName, roster) {
    const queue = roster.map(r => {
      gameState.seenIds[r.id] = true;
      const monster = createMonsterInstance(r.id, r.lv);
      // Authored trainer runes use ordinary equipment and the exact same
      // battle modifiers as player runes, without touching player inventory.
      const assigned = Array.isArray(r.runes) ? r.runes : [];
      const seen = new Set();
      for (const runeId of assigned) {
        if (!Object.prototype.hasOwnProperty.call(PASSIVE_RUNES, runeId) || seen.has(runeId)) continue;
        if (monster.equipment.length >= gearLimit(monster)) break;
        seen.add(runeId);
        monster.equipment.push({id:runeId});
      }
      return monster;
    });
    sfx.confirm();
    gameState.mode = 'BATTLE';
    gameState.battle = {
      isTrainer: true,
      trainerName,
      gymIndex,
      enemyQueue: queue,
      enemy: queue[0],
      cursor: 0,attackCursor:0,attackTop:0,
      log: `${trainerName} fordert dich heraus!`,
      animTimer: 0,
      busy: false,
      participants: [getActiveAlly()]
    };
    autoUseGear(getActiveAlly());
  }

  function getActiveAlly() {
    return gameState.team.find(m => m.hp > 0) || gameState.team[0];
  }

  function markBattleParticipant(monster){
    const battle=gameState.battle;
    if(!battle||!monster)return;
    if(!Array.isArray(battle.participants))battle.participants=[];
    if(!battle.participants.includes(monster))battle.participants.push(monster);
  }

  // A flat 36 HP potion stops being useful against late-story enemies.
  // Scale its in-battle healing with max HP; it still costs one full turn.
  function potionHealAmount(ally) {
    return Math.max(36, Math.ceil(ally.maxHp * .30));
  }

  function battleTimeout(fn,delay){
    const activeBattle=gameState.battle;
    return setTimeout(()=>{if(activeBattle && gameState.battle===activeBattle)fn();},delay);
  }
function executeBattleAction(choice){
    const b=gameState.battle;
    if(!b||b.busy)return;
    const ally=getActiveAlly();
    if(!ally)return;
    ensureMonsterMoves(ally);
    if(choice===0){gameState.mode='ATTACKS';b.attackCursor=0;b.attackTop=0;sfx.blip();return;}
    if(choice===1){
      const other=gameState.team.find(m=>m!==ally&&m.hp>0);
      if(other){
        gameState.teamCursor=gameState.team.indexOf(other);
        gameState.mode='TEAM_SELECT';sfx.confirm();
      }else b.log='Du hast keinen weiteren kampffähigen Geist.';
    }else if(choice===2){
      if(b.isTrainer){
        if(gameState.potions<=0){b.log='Keine Seelen-Tränke mehr!';sfx.cancel();return;}
        if(ally.hp>=ally.maxHp){b.log='Dein Geist hat bereits volle HP!';sfx.cancel();return;}
        const healed=Math.min(ally.maxHp-ally.hp,potionHealAmount(ally));
        gameState.potions--;ally.hp+=healed;b.log=`${SPECIES[ally.id-1].name} erhält +${healed} HP durch den Seelen-Trank!`;
        b.busy=true;sfx.heal();battleTimeout(enemyCounterAttack,600);
      }else{
        if(gameState.orbs<=0){b.log='Keine Seelen-Sphären mehr!';sfx.cancel();return;}
        gameState.orbs--;b.busy=true;sfx.catch();
        const captureBoost=window.EchoInteriors?.captureBonus(gameState)||0;
        const chance=Math.min(.98,.63+(1-b.enemy.hp/b.enemy.maxHp)*.32+captureBoost);
        b.log=`Eine Seelen-Sphäre fliegt durch die Luft ...`;
        battleTimeout(()=>{
          if(Math.random()<chance){
            const captured=b.enemy; captured.hp=Math.max(1,captured.hp);
            gameState.caughtIds[captured.id]=true;
            gameState.encounterGrace=16;
            const joinedTeam=window.EchoArchive.capture(gameState,captured);
            gameState.mode='OVERWORLD';
            saveGame(true);
            showDialog([`✨ ${SPECIES[captured.id-1].name} hat sich dir angeschlossen!`,joinedTeam?'Willkommen im Team!':'Dein Team ist voll. Das Wesen wartet im Archiv.']);
          }else{b.log='Die Sphäre öffnet sich wieder!';battleTimeout(enemyCounterAttack,550);}
        },600);
      }
    }else if(choice===3){
      if(b.isTrainer)b.log='Aus einer Arena kannst du nicht fliehen!';
      else {gameState.mode='OVERWORLD';gameState.encounterGrace=12;sfx.cancel();saveGame(true);}
    }
  }
  function useSelectedAttack(){
    const b=gameState.battle,ally=getActiveAlly();if(!b||b.busy||!ally)return;
    ensureMonsterMoves(ally);
    const id=battleMoves(ally)[b.attackCursor||0],move=ATTACKS[id];if(!move)return;
    gameState.mode='BATTLE';b.busy=true;
    if(move.heal){
      const healed=Math.min(move.heal,ally.maxHp-ally.hp);
      ally.hp+=healed;b.log=`${SPECIES[ally.id-1].name} nutzt ${move.name}! +${healed} HP`;
      const effect=STATUS.apply(b,ally,b.enemy,id);
      const ongoing=STATUS.endAction(b,ally);
      if(effect)b.log+=' / '+effect;
      if(ongoing)b.log+=' / '+ongoing;
      sfx.heal();
      battleTimeout(enemyCounterAttack,650);return;
    }
    const multiplier=AFF.effectiveness(move.type,b.enemy);
    const damage=STATUS.adjustedDamage(b,ally,b.enemy,skillDamage(ally,b.enemy,move));
    b.enemy.hp=Math.max(0,b.enemy.hp-damage);
    b.animTimer=18;b.fxTarget='enemy';b.lastAttackColor=move.fx||'#ffe3a2';
    b.log=SPECIES[ally.id-1].name+' nutzt '+move.name+'! ('+damage+' Schaden) · '+AFF.label(multiplier);
    const effect=STATUS.apply(b,ally,b.enemy,id);
    const ongoing=STATUS.endAction(b,ally);
    const life=passiveHitHeal(ally);
    if(effect)b.log+=' / '+effect;
    if(ongoing)b.log+=' / '+ongoing;
    if(life)b.log+=' / Ahnen-Rune +'+life+' HP';
    sfx.hit();
    battleTimeout(()=>{if(b.enemy.hp<=0)handleEnemyDefeated();else enemyCounterAttack();},650);
  }
  function attackReorder(dir){
    const menuOnly=['OVERWORLD','MENU'].includes(gameState.attackOrigin);
    const b=menuOnly?null:gameState.battle,ally=b?getActiveAlly():gameState.team[gameState.attackBookTeamCursor||0];
    if(!ally)return;
    ensureMonsterMoves(ally);
    let index=b?b.attackCursor:gameState.freeAttackCursor||0;
    const list=b?battleMoves(ally):ally.moves;
    const next=index+dir;if(next<0||next>=list.length){sfx.cancel();return;}
    [list[index],list[next]]=[list[next],list[index]];
    if(b){b.attackCursor=next; b.attackTop=Math.max(0,Math.min(next,ally.moves.length-6));}
    else gameState.freeAttackCursor=next;
    sfx.confirm();
    saveGame(true);
  }
  
    function enemyCounterAttack() {
    const b = gameState.battle;
    if (!b) return;
    const ally = getActiveAlly();
    const allySp = SPECIES[ally.id - 1];
    const enemy = b.enemy;
    const enemySp = SPECIES[enemy.id - 1];

    ensureMonsterMoves(enemy);
    const prepared=battleMoves(enemy);
    const decision=SKILLBOOK.ENEMY_AI.choose({
      battle:b,enemy,ally,prepared,attacks:ATTACKS,aff:AFF,species:SPECIES
    });
    const selected=decision.id;
    const healing=ATTACKS[selected]?.heal?selected:null;
    // Only one deliberate recovery per enemy, and never phantom damage.
    if(healing){
      const move=ATTACKS[healing];
      const healed=Math.min(move.heal,enemy.maxHp-enemy.hp);
      enemy.hp+=healed;
      const effect=STATUS.apply(b,enemy,enemy,healing);
      const ongoing=STATUS.endAction(b,enemy);
      b.enemyHealUsed=true;
      b.animTimer=18;b.fxTarget='enemy';
      b.log=`${b.enemyDisplayName||enemySp.name} nutzt ${move.name}! (+${healed} HP)`;
      if(effect)b.log+=' / '+effect;
      if(ongoing)b.log+=' / '+ongoing;
      sfx.heal();
      battleTimeout(()=>{b.busy=false;},700);
      return;
    }
    // Evaluate immediate damage together with expected, limited status value.
    // Top move is preferred; near-equal runners-up remain possible for variety.
    const move=ATTACKS[selected]||ATTACKS.seelenstups;
    const dmg=STATUS.adjustedDamage(b,enemy,ally,
      Math.max(2,Math.round(skillDamage(enemy,ally,move)*(enemy.encounterScale||1))));
    b.lastAttackColor=move.fx||'#afbcce';
    ally.hp = Math.max(0, ally.hp - dmg);
    sfx.hit();
    b.animTimer=18;b.fxTarget='ally';
    b.log = `${b.enemyDisplayName||enemySp.name} nutzt ${move.name}! (${dmg} Schaden)`;
    const effect=STATUS.apply(b,enemy,ally,selected);
    const ongoing=STATUS.endAction(b,enemy);
    const life=passiveHitHeal(enemy);
    if(effect)b.log+=' / '+effect;
    if(ongoing)b.log+=' / '+ongoing;
    if(life)b.log+=' / Ahnen-Rune +'+life+' HP';

    autoUseGear(ally);

    battleTimeout(() => {
      if (ally.hp <= 0) {
        const nextAlive = gameState.team.find(m => m.hp > 0);
        if (nextAlive) {
          markBattleParticipant(nextAlive);
          b.log = `${allySp.name} zieht sich zurück! ${SPECIES[nextAlive.id - 1].name} springt ein!`;
          b.busy = false;
        } else {
          // Losing a late-game battle must not erase hours of return travel.
          gameState.team.forEach(m => { m.hp = m.maxHp; });
          const map=window.EchoMaps?.get(gameState.currentMapId);
          const safe=map?.spawns?.[gameState.safeSpawnId]||
            (map?.spawns?Object.values(map.spawns)[0]:null);
          const localRespawn=gameState.scene==='OVERWORLD'&&
            gameState.currentMapId!=='legacy_wurzeldorf'&&safe;
          if(localRespawn){
            gameState.player={x:safe.x,y:safe.y,dir:'down',stepPhase:0};
          }else{
            gameState.scene='HOUSE';
            gameState.currentMapId='legacy_wurzeldorf';
            gameState.safeSpawnId='legacy_current_position';
            gameState.player={x:7,y:9,dir:'up',stepPhase:0};
          }
          gameState.encounterGrace=16;
          gameState.mode = 'OVERWORLD';
          saveGame(true);
          showDialog(localRespawn?[
            'Deine Geister-Wesen waren erschoepft...',
            'Du bist am letzten sicheren Wegpunkt wieder aufgewacht.'
          ]:[
            'Deine Geister-Wesen waren erschöpft...',
            'Oma Martha hat euch zu Hause wieder gesund gepflegt!'
          ]);
        }
      } else {
        b.busy = false;
      }
    }, 850);
  }

  function handleEnemyDefeated() {
    gameState.battleWins=(gameState.battleWins||0)+1;
    gameState.encounterGrace=14;
    const b = gameState.battle;
    const ally = getActiveAlly();
    const enemy = b.enemy;
    const xpGain = enemy.lv * 11 + (b.isTrainer ? 18 : 8);
    sfx.confirm();

    const msgs = [`${b.enemyDisplayName||SPECIES[enemy.id - 1].name} wurde besänftigt! (+${xpGain} EP)`];

    // Participants (including immediate switches) share 100% of the fight's XP.
    // Unused healthy members split the existing 40% bonus reserve pool.
    // A holder who actually entered this fight upgrades that bonus pool to 100%.
    const participants=(Array.isArray(b.participants)?b.participants:[ally])
      .filter((member,index,list)=>member?.hp>0&&gameState.team.includes(member)&&list.indexOf(member)===index);
    if(ally.hp>0&&!participants.includes(ally))participants.push(ally);
    const reserves=gameState.team.filter(member=>member.hp>0&&!participants.includes(member));
    const runeActive=participants.some(member=>member.heldSupportRune==='ep_teiler');
    const reserveXp=runeReserveXp(xpGain,runeActive,reserves.length);
    for(let i=0;i<participants.length+reserves.length;i++){
      const ally=i<participants.length?participants[i]:reserves[i-participants.length];
      const points=i<participants.length?
        Math.floor(xpGain/participants.length)+(i<xpGain%participants.length?1:0):reserveXp;
      if(points<=0)continue;
      if(!Number.isFinite(ally.nextXp)||ally.nextXp<=0)
        ally.nextXp=ally.lv*18;
      ally.xp=Math.max(0,Number(ally.xp)||0)+points;
      // Preserve original level-up, permanent skills and evolution rules.
      while (ally.xp >= ally.nextXp) {
      ensureMonsterMoves(ally);
      ally.lv++;
      ally.xp -= ally.nextXp;
      ally.nextXp = ally.lv * 18;
      ally.maxHp += 6;
      ally.hp = ally.maxHp;
      msgs.push(`🎉 ${SPECIES[ally.id - 1].name} erreicht Level ${ally.lv}!`);
      addLevelMoves(ally,ally.lv-1,msgs);

      const sp = SPECIES[ally.id - 1];
      if (sp.evolvesTo && ally.lv >= sp.evolveLv) {
        const oldName = sp.name;
        ally.id = sp.evolvesTo;
        const newSp = SPECIES[ally.id - 1];
        gameState.seenIds[ally.id] = true;
        gameState.caughtIds[ally.id] = true;
        ally.maxHp += 14;
        ally.hp = ally.maxHp;
        addLevelMoves(ally,ally.lv-1,msgs);
        sfx.evolve();
        msgs.push(`✨ ENTWICKLUNG! ${oldName} leuchtet hell auf und wird zu ${newSp.name}!`);
        if (ally.id === 3) {
          msgs.push('💖 Eine warme Stimme hallt in deinem Herzen wider: „Mein geliebtes Kind... ich bin es, deine Mutter Elena.“');
        }
      }
    }
    }
    if(participants.length>1)
      msgs.push('Kampf-EP werden auf '+participants.length+' eingesetzte Wesen verteilt.');
    if(runeActive&&reserveXp>0)msgs.push('EP-Teiler aktiv: Alle gesunden Begleiter profitieren!');
    if(reserveXp>0)msgs.push(`Deine ${reserves.length} Begleiter erhalten jeweils +${reserveXp} EP.`);

    // A rare, non-purchasable heirloom comes from the ancient keeper quest.
    if(b.ruinBoss&&!gameState.runeFinds?.ancestor){
      gameState.runeFinds.ancestor=true;
      addInventory('rune_ahnen',1);
      msgs.push('✧ Ahnen-Rune: Ein seltenes Relikt des Erinnerungshueters!');
    }
    // Coins are finite and saved. A whole trainer battle pays once, not per enemy.
    if(!b.isTrainer||b.enemyQueue.length===1){
      const reward=b.isTrainer?40+Math.floor(enemy.lv/3):8+Math.floor(enemy.lv/4);
      gameState.coins=Math.min(9999,(gameState.coins||0)+reward);
      msgs.push('+'+reward+' Echo-Muenzen');
    }
    if(b.enemyQueue.length===1 && b.isTrainer){
      const marker=String(b.trainerName||b.enemyDisplayName||'Trainer').slice(0,96);
      if(!gameState.runeRewards[marker]){
        gameState.runeRewards[marker]=true;
        const count=Object.keys(gameState.runeRewards).length;
        const rewardIndex=SKILLBOOK.AWARD_AFTER_UNIQUE_WINS.indexOf(count);
        if(rewardIndex>=0){
          const rune=SKILLBOOK.RUNES[rewardIndex];
          if(rune){
            gameState.runes[rune.id]=(gameState.runes[rune.id]||0)+1;
            msgs.push('✧ Gefunden: '+rune.name+'! Runenlehre im Reisetagebuch.');
          }
        }
      }
    }
    // Win reward is once per enemy, even in multi-phase trainer fights.
    if(!gameState.supportRuneUnlocked){
      gameState.supportRuneUnlocked=true;
      msgs.push('✧ EP-Teiler erhalten! Im Reisetagebuch unter Runenlehre anlegen.');
    }
    b.enemyQueue.shift();
    if (b.enemyQueue.length > 0) {
      b.enemy = b.enemyQueue[0];
      b.participants=[getActiveAlly()];
      b.enemyHealUsed=false;
      b.log = `${b.trainerName} schickt ${SPECIES[b.enemy.id - 1].name} in den Kampf!`;
      b.busy = false;
    } else {
      gameState.mode = 'OVERWORLD';
      if(b.postgameFight&&window.EchoPostgame){
        msgs.push(...window.EchoPostgame.victory(gameState,b.postgameFight));
        saveGame(true);
      }
      if(b.finaleFight&&window.EchoFinale){
         msgs.push(...window.EchoFinale.victory(gameState,b.finaleFight));
         saveGame(true);
       }
       if(b.endgameFight&&window.EchoEndgame){
        msgs.push(...window.EchoEndgame.victory(gameState,b.endgameFight));
        saveGame(true);
      }
      if(b.storyRegionFight&&window.EchoStoryRegions){
        msgs.push(...window.EchoStoryRegions.victory(gameState,b.storyRegionFight));
        saveGame(true);
      }
      if(b.chapter5Fight&&window.EchoChapter5){
        msgs.push(...window.EchoChapter5.victory(gameState,b.chapter5Fight));
        saveGame(true);
      }
      if(b.chapter4Fight&&window.EchoChapter4){
        msgs.push(...window.EchoChapter4.victory(gameState,b.chapter4Fight));
        saveGame(true);
      }
      if(b.chapter3Boss&&window.EchoChapter3){
         msgs.push(...window.EchoChapter3.victory(gameState));
         saveGame(true);
       }
       if(b.ruinBoss && window.EchoRuins){
        msgs.push(...window.EchoRuins.victory(gameState));
        saveGame(true);
      }
      if(b.routeGuardian && window.EchoRoute){
        msgs.push(...window.EchoRoute.keeperWin(gameState,sfx));
        saveGame(true);
      }
      if (b.isTrainer && b.gymIndex !== null) {
        gameState.gymDefeated[b.gymIndex] = true;
        gameState.badges = gameState.gymDefeated.filter(Boolean).length;
        gameState.orbs += 5;
        gameState.potions += 2;
        msgs.push(`🏆 Du hast ${b.trainerName} besiegt und Orden Nr. ${gameState.badges} erhalten! (+5 Sphären, +2 Tränke)`);
        if (gameState.badges === 3) {
          msgs.push('🌟 DAS GEHEIMNIS DER 150 SEELEN IST GELÜFTET:');
          msgs.push('Alle Wesen dieser Welt sind die Seelen Verstorbener – und dein Starter-Wesen trägt die unsterbliche Seele deiner Mutter Elena!');
        }
      }
      saveGame(true);
      showDialog(msgs);
    }
  }

  // --- INTERAKTION & BEWEGUNG IN DER OBERWELT ---
  function movePlayer(dx, dy, dirName) {
    if (gameState.mode !== 'OVERWORLD') return;
    gameState.player.dir = dirName;
    const startX=gameState.player.x,startY=gameState.player.y;
    const registerStep=(grass=false)=>{
      if(gameState.player.x!==startX || gameState.player.y!==startY){
        gbCampaign?.onStep(gameState.currentMapId,gameState.player.x,gameState.player.y,grass,performance.now());
      }
    };
    if(gameState.scene==='RUINS'){
      const result=window.EchoRuins.walk(gameState,dx,dy,dirName,sfx);
      registerStep();
      if(result.exited)saveGame(true);
      return;
    }
    if(gameState.scene==='BUILDING'){
      const result=window.EchoInteriors.walk(gameState,dx,dy,dirName,showDialog,sfx);
      registerStep();
      if(result.exited)saveGame(true);
      return;
    }
    if(gameState.scene==='HOUSE'){
      const previousScene=gameState.scene;
      window.EchoHouse.walk(gameState,dx,dy,dirName,showDialog,sfx.step);
      registerStep();
      if(previousScene!==gameState.scene)saveGame(true);
      return;
    }
    if(gameState.currentMapId!=='legacy_wurzeldorf'){
       const region=window.EchoPostgame?.names[gameState.currentMapId] ? window.EchoPostgame :
          window.EchoFinale?.names[gameState.currentMapId] ? window.EchoFinale :
          window.EchoEndgame?.names[gameState.currentMapId] ? window.EchoEndgame :
         window.EchoStoryRegions?.names[gameState.currentMapId] ? window.EchoStoryRegions :
         window.EchoChapter5?.names[gameState.currentMapId] ? window.EchoChapter5 :
         window.EchoChapter4?.names[gameState.currentMapId] ? window.EchoChapter4 : window.EchoChapter3;
       const origin=gameState.currentMapId;
       const r=region.regionMove(gameState,dx,dy);
       if(r.travel){
         sfx.confirm();saveGame(true);
         if(!gbCampaign?.isOutdoorLink(origin,gameState.currentMapId))showDialog(r.lines);
       }
       else if(r.lines)showDialog(r.lines);
       else if(r.moved){
         registerStep(r.grass);
         sfx.step();
         gameState.stepsSinceSave=(gameState.stepsSinceSave||0)+1;
         if(gameState.stepsSinceSave>=24){gameState.stepsSinceSave=0;saveGame(true);}
         if(gameState.encounterGrace>0)gameState.encounterGrace--;
         else if(r.grass&&gameState.hasStarter&&Math.random()<(r.rare?.18:.07))startWildBattle(!!r.rare);
       }
       return;
     }
     if(gameState.player.x===5 && gameState.player.y===5 && dx===0 && dy===-1){
      enterGrandmaHouse();return;
    }
    const nx = gameState.player.x + dx;
    const ny = gameState.player.y + dy;
    if (nx < 0 || ny < 0 || nx >= MAP_W || ny >= MAP_H) return;

    const portal=window.EchoMaps?.getExitAt('legacy_wurzeldorf',nx,ny);
    if(portal){
      const deny=window.EchoChapter3?.access(gameState,portal.exitId);
      if(deny){showDialog(deny);return;}
      if(window.EchoMaps.travel(gameState,portal.exitId)){
        sfx.confirm();saveGame(true);
        if(!gbCampaign?.isOutdoorLink('legacy_wurzeldorf',gameState.currentMapId)){
          showDialog(['NORDUFER - Der Weg nach Nebelhafen beginnt.']);
        }
        return;
      }
    }
    const tile = worldMap[ny][nx];
    if (tile === 1 || tile === 4 || tile === 5 || tile === 7) return; // Solide Objekte inkl. Relikt-Tisch
    if (npcs.some(n => n.id!=='oma' && n.x === nx && n.y === ny)) return;

    // Nicht ins hohe Gras ohne Starter-Wesen
    if (tile === 2 && !gameState.hasStarter) {
      showDialog(['Du solltest zuerst das Paket in Omas Haus öffnen, bevor du ins hohe Gras gehst.']);
      return;
    }

    gameState.player.x = nx;
    gameState.player.y = ny;
    gameState.player.stepPhase = gameState.player.stepPhase===1 ? 2 : 1;
    registerStep(tile===2);
    sfx.step();
    // Quiet checkpoint on walks, without disrupting controls or dialogue.
    gameState.stepsSinceSave=(gameState.stepsSinceSave||0)+1;
    if(gameState.hasStarter && gameState.stepsSinceSave>=24){
      gameState.stepsSinceSave=0;saveGame(true);
    }

    // Zufallskampf im hohen Geister-Gras
    if(gameState.encounterGrace>0)gameState.encounterGrace--;
    else if(tile===2&&gameState.hasStarter&&Math.random()<0.08)startWildBattle();
  }

  function enterGrandmaHouse(){
    gameState.scene='HOUSE';
    gameState.player={x:7,y:9,dir:'up',stepPhase:0};
    sfx.confirm();
  }
  // Phone users can also tap the visible package itself when standing near the table.
  canvas.addEventListener('pointerdown', ev=>{
    if(gameState.mode!=='OVERWORLD'||gameState.scene!=='HOUSE'||gameState.introStage!==1)return;
    const rect=canvas.getBoundingClientRect();
    const x=(ev.clientX-rect.left)*canvas.width/rect.width;
    const y=(ev.clientY-rect.top)*canvas.height/rect.height;
    if(x>=188&&x<=247&&y>=18&&y<=80&&window.EchoHouse.nearParcel(gameState.player)){
      window.EchoHouse.talk(gameState,showDialog,createMonsterInstance,sfx);
    }
  });

  function bossMultipliers(group,chapter){
    const late=group==='finale'||group==='postgame'||(group==='endgame'&&chapter>=11);
    // A second healthy companion doubles available turns/HP. Late bosses
    // should demand some strategy, not collapse even when no potions remain.
    // Keep solo teams and early chapters at their tested difficulty.
    const supported=late && gameState.team.filter(member=>
      member.hp>=Math.max(2,member.maxHp*.25)).length>=2;
    return {hp:late?(supported?1.26:.90):.78,
      attack:late?(supported?1.33:.95):.8};
  }

  // Major late-story bosses have a brief binding-echo opener, then the main
  // confrontation. The opener is deliberately weaker so solo teams can win.
  // Keep the final opponent last: chapter victory is awarded only after it falls.
  function storyBossRoster(boss,species,level){
    const openerId={varekFirst:89,shaftGuardian:89,varekFinal:62}[boss];
    // Story boss difficulty is balanced separately from optional trainer runes.
    return openerId?[{id:openerId,lv:Math.max(3,level-4)},{id:species,lv:level}]:
      [{id:species,lv:level}];
  }
  function scaleBossRoster(queue,profile){
    queue.forEach((enemy,index)=>{
      const opener=queue.length>1 && index<queue.length-1;
      enemy.maxHp=Math.max(1,Math.round(enemy.maxHp*profile.hp*(opener?.65:1)));
      enemy.hp=enemy.maxHp;
      enemy.encounterScale=profile.attack*(opener?.77:1);
    });
  }

  function interactFront() {
    if(gameState.scene==='OVERWORLD'&&gameState.currentMapId!=='legacy_wurzeldorf'){
      const region=window.EchoPostgame?.names[gameState.currentMapId] ? window.EchoPostgame :
          window.EchoFinale?.names[gameState.currentMapId] ? window.EchoFinale :
          window.EchoEndgame?.names[gameState.currentMapId] ? window.EchoEndgame :
         window.EchoStoryRegions?.names[gameState.currentMapId] ? window.EchoStoryRegions :
         window.EchoChapter5?.names[gameState.currentMapId] ? window.EchoChapter5 :
         window.EchoChapter4?.names[gameState.currentMapId] ? window.EchoChapter4 : window.EchoChapter3;
      const dirs={up:[0,-1],down:[0,1],left:[-1,0],right:[1,0]};
      const [dx,dy]=dirs[gameState.player.dir]||[0,1];
      const r=region.interact(gameState,gameState.player.x+dx,gameState.player.y+dy);
      if(r.changed)saveGame(true);
      if(r.boss){
        showDialog(r.lines,()=>{
          const strongest=Math.max(5,...gameState.team.map(m=>m.lv||1));
          const onRail=region===window.EchoChapter4;
          const onStill=region===window.EchoChapter5;
          const onStory=region===window.EchoStoryRegions;
          const onEndgame=region===window.EchoEndgame;
           const onPostgame=region===window.EchoPostgame;
          const onFinale=region===window.EchoFinale;
          const storyChapter=window.EchoFinale?.chapterOf[gameState.currentMapId]||
         window.EchoEndgame?.chapterOf[gameState.currentMapId]||
        window.EchoStoryRegions?.chapterOf[gameState.currentMapId]||0;
          const level=onPostgame?Math.max(12,Math.min(65,strongest+2)):
           onFinale?Math.max(20,Math.min(storyChapter===13?55:60,strongest+2)):
             onEndgame?Math.max(18,Math.min(storyChapter===9?39:storyChapter===10?43:47,strongest+2)):
            onStory?Math.max(12,Math.min(storyChapter===6?26:storyChapter===7?30:35,strongest+2)):
            onStill?Math.max(17,Math.min(r.boss==='lyra'?22:20,strongest+2)):
            onRail?Math.max(9,Math.min(r.boss==='root'?17:15,strongest+(r.boss==='root'?2:1))):
            Math.max(7,Math.min(10,strongest+1));
          const species=onPostgame?({postgameTrial0:57,postgameTrial1:87,postgameTrial2:112}[r.boss]||57):
           onFinale?({shaftGuardian:112,varekFinal:150}[r.boss]||112):
             onEndgame?({vexFrost:112,ringGuardian:89,varekFirst:62}[r.boss]||112):
            onStory?({smelter:23,core:124,hunter:57,shadow:81,guard:45}[r.boss]||23):
            onStill?(r.boss==='mirror'?81:40):onRail?(r.boss==='root'?67:29):65;
          const title=onPostgame?({postgameTrial0:'Pikos Gartenpruefung',postgameTrial1:'Nalias Gartenpruefung',postgameTrial2:'Vex Gartenpruefung'}[r.boss]||'Gartenpruefung'):
           onFinale?({shaftGuardian:'Schachtwache',varekFinal:'Severin Varek - Finale'}[r.boss]||'Kernwaechter'):
             onEndgame?({vexFrost:'Vex am Frostgrat',ringGuardian:'Ringhueter',varekFirst:'Varek'}[r.boss]||'Resonanzwaechter'):
            onStory?({smelter:'Schmelzmeister',core:'Instabiler Ofenkern',hunter:'Kontinuum-Jaeger',shadow:'Namensschatten',guard:'Archivwaechter'}[r.boss]||'Echo-Waechter'):
            onStill?(r.boss==='mirror'?'Gedaechtnisspiegel':'Lyra'):
            onRail?(r.boss==='root'?'Schattenwurzel':'Kontinuum-Kurier'):'Pumpenwaechter';
          startTrainerBattle(null,title,storyBossRoster(r.boss,species,level));
          if(onPostgame)gameState.battle.postgameFight=r.boss;
          else if(onFinale)gameState.battle.finaleFight=r.boss;
           else if(onEndgame)gameState.battle.endgameFight=r.boss;
          else if(onStory)gameState.battle.storyRegionFight=r.boss;
          else if(onStill)gameState.battle.chapter5Fight=r.boss;
          else if(onRail)gameState.battle.chapter4Fight=r.boss;
          else gameState.battle.chapter3Boss=true;
          // Later bosses need a challenge, without punishing the first chapters.
          // Tested across light, water and shadow teams at different levels.
          const profile=bossMultipliers(onFinale?'finale':onPostgame?'postgame':
            onEndgame?'endgame':'normal',storyChapter);
          scaleBossRoster(gameState.battle.enemyQueue,profile);
        });
      }else if(r.rail){
        gameState.railCursor=0;gameState.mode='RAIL';sfx.confirm();
      }else if(r.lines)showDialog(r.lines);
      return;
    }
    if(gameState.scene==='RUINS'){
      const r=window.EchoRuins.interact(gameState,sfx);
      if(r.heal)gameState.team.forEach(m=>m.hp=m.maxHp);
      if(r.changed||r.heal)saveGame(true);
      if(r.boss){
        showDialog(r.lines,()=>{
          startTrainerBattle(null,'Vergessener Wächter',[{id:7,lv:5}]);
          const b=gameState.battle;b.ruinBoss=true;b.enemyDisplayName='Erinnerungshüter';
          b.log='Der Erinnerungshüter erwacht!';
          b.enemy.maxHp=Math.max(16,Math.round(b.enemy.maxHp*.72));
          b.enemy.hp=b.enemy.maxHp;b.enemy.encounterScale=.65;
        });
      }else if(r.lines)showDialog(r.lines);
      return;
    }
    if(gameState.scene==='OVERWORLD'&&window.EchoRuins?.nearEntrance(gameState)){
      const r=window.EchoRuins.entrance(gameState);
      if(r.entered){sfx.confirm();saveGame(true);}
      showDialog(r.lines);return;
    }
    if(gameState.scene==='OVERWORLD'&&window.EchoPlatformer?.nearPortal(gameState)){
      if(window.EchoPlatformer.enter(gameState)){
        sfx.confirm();saveGame(true);return;
      }
    }
    if(gameState.scene==='BUILDING'){
      const lines=window.EchoInteriors.interact(gameState,showDialog,sfx);
      saveGame(true);
      if(lines)showDialog(lines);
      return;
    }
    if(gameState.scene==='HOUSE'){
      window.EchoHouse.talk(gameState,showDialog,createMonsterInstance,sfx);
      saveGame(true);return;
    }
    if(gameState.player.x===5&&gameState.player.y===5&&gameState.player.dir==='up'){
      enterGrandmaHouse();return;
    }
    const dirOffsets = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
    const [ox, oy] = dirOffsets[gameState.player.dir];
    const tx = gameState.player.x + ox;
    const ty = gameState.player.y + oy;

    if(window.EchoExplore){
      const supply=window.EchoExplore.collect(gameState);
      if(supply){sfx.catch();saveGame(true);showDialog(supply);return;}
    }

    if(window.EchoRoute){
      const found=window.EchoRoute.collectNear(gameState,sfx);
      if(found){saveGame(true);showDialog(found);return;}
    }

    // A shimmering fragment near the village path can be found exactly once.
    if(gameState.scene==='OVERWORLD'&&gameState.currentMapId==='legacy_wurzeldorf'&&
       tx===16&&ty===10&&!gameState.runeFinds.mist){
      gameState.runeFinds.mist=true;
      addInventory('rune_nebel',1);
      saveGame(true);sfx.evolve();
      showDialog(['Ein versteckter Schimmer im Gras!','Du findest die seltene Nebel-Rune (+7% Kraft, -7% Schaden).']);
      return;
    }
    // NPC oder Tagebuchseite vor dem Spieler?
    const door=window.EchoVillage?.doorAt(tx,ty);
    if(door){
      if(window.EchoInteriors && ['kraeuter','werkstatt'].includes(door.id)){
        window.EchoInteriors.enter(gameState,door.id);
        sfx.confirm();saveGame(true);
        return;
      }
      const descriptions={
        kraeuter:['Aus dem Kräuterhaus duftet es nach Salbei und Minze.','„Bin im Garten!“ steht auf dem Schild.'],
        fischer:['Das Haus am See. An den Fenstern hängen kleine Geisterfisch-Bilder.','Die Bewohner sind gerade am Ufer.'],
        werkstatt:['Aus der Werkstatt klingt fröhliches Hämmern.','„Sphären-Reparatur bald geöffnet“ steht auf einer Holztafel.'],
        laden:['Vor dem Dorfladen stehen bunte Toepfe.','Der Laden ist jetzt geoeffnet!']
      };
      if(door.id==='laden'){
        gameState.mode='RUNE_SHOP';gameState.shopCursor=0;sfx.confirm();return;
      }
      showDialog(descriptions[door.id]||[door.name]);return;
    }
    const npc = npcs.find(n => n.id!=='oma' && n.x === tx && n.y === ty);
    if (npc) {
      const lines = npc.talk();
      saveGame(true);
      if (lines) showDialog(lines);
      return;
    }

    const tile = (worldMap[ty] && worldMap[ty][tx]) ?? 0;
    // Vaters Tisch (Starter-Wesen Nr. 001 Miora)
    if (tile === 7) {
      if (!gameState.hasStarter) {
        gameState.hasStarter = true;
        const starter = createMonsterInstance(1, 5);
        gameState.team.push(starter);
        gameState.seenIds[1] = true;
        gameState.caughtIds[1] = true;
        sfx.evolve();
        showDialog([
          'Du öffnest die hinterlassene Relikt-Kapsel deines Vaters...',
          '✨ Ein sanft leuchtendes Wesen erscheint: Nr. 001 MIORA!',
          'Seltsam... sobald Miora dich ansieht, spürst du eine unbeschreibliche, mütterliche Wärme.',
          'Auf einem Zettel steht: „Beschütze unser Kind, Elena. – In ewiger Liebe.“'
        ]);
      } else {
        showDialog(['Vaters Schreibtisch. Hier lag die Kapsel von Miora.']);
      }
      return;
    }

    // Heil-Altar
    if (tile === 6) {
      gameState.team.forEach(m => { m.hp = m.maxHp; });
      gameState.orbs = Math.max(gameState.orbs, 5);
      sfx.heal();
      saveGame(true);
      showDialog(['✨ Am Seelen-Brunnen wurden alle deine Wesen vollständig geheilt und deine Seelen-Sphären aufgefrischt!']);
    }
  }

  const START_MENU=[
    {id:'seelenbuch',label:'Seelenbuch'},
    {id:'team',label:'Team'},
    {id:'bag',label:'Rucksack'},
    {id:'runes',label:'Runen'},
    {id:'archive',label:'Archiv'},
    {id:'save',label:'Speichern'},
    {id:'options',label:'Optionen'},
    {id:'exit',label:'Zurueck'}
  ];
  const BAG_MENU=[
    {id:'heiltrank',label:'Seelen-Trank'},
    {id:'orbs',label:'Seelen-Sphaeren'},
    {id:'rucksack',label:'Rucksack'},
    {id:'antidot',label:'Gegengift'},
    {id:'schockloeser',label:'Entstoerer'},
    {id:'brandmittel',label:'Brandbalsam'},
    {id:'runes',label:'Runen'}
  ];
  const OPTIONS_MENU=['Ton','Farbpalette','Steuerung','Zurueck'];
  const SHOP_ITEMS=[
    {id:'rune_kraft',name:'Kraft-Rune',price:120},
    {id:'rune_schutz',name:'Schutz-Rune',price:120},
    {id:'heiltrank',name:'Seelen-Trank',price:30},
    {id:'antidot',name:'Gegengift',price:25},
    {id:'schockloeser',name:'Entstoerer',price:25},
    {id:'rucksack',name:'Rucksack',price:180},
    {id:'kohlenregen',name:'Kohlenregen-Rune',price:210,unique:true}
  ];
  function purchaseShopItem(id){
    const offer=SHOP_ITEMS.find(x=>x.id===id);
    if(!offer)return 'Unbekanntes Angebot.';
    if(offer.unique&&gameState.shopBought[id])return 'Diese seltene Rune ist ausverkauft.';
    if(gameState.coins<offer.price)return 'Nicht genug Echo-Muenzen.';
    if(!Number.isInteger(gameState.coins)||gameState.coins<0)return 'Ungueltiger Geldbestand.';
    gameState.coins-=offer.price;
    if(SKILLBOOK.RUNES.some(x=>x.id===id))
      gameState.runes[id]=(gameState.runes[id]||0)+1;
    else addInventory(id,1);
    if(offer.unique)gameState.shopBought[id]=true;
    saveGame(true);
    return offer.name+' gekauft! -'+offer.price+' Echo-Muenzen';
  }
  function openEquipment(origin,teamIndex=0,itemId=null){
    gameState.equipmentOrigin=origin;
    gameState.runeTeamCursor=Math.max(0,Math.min(gameState.team.length-1,teamIndex));
    gameState.gearCursor=Math.max(0,GEAR_ITEMS.findIndex(item=>item.id===itemId));
    gameState.mode='AUSRUESTUNG';sfx.confirm();
  }
  function healTeamFromBag(){
    if(!gameState.team.length||gameState.potions<=0){
      sfx.cancel();
      showDialog(['Keine Seelen-Traenke verfuegbar.'],()=>{gameState.mode='BAG';});
      return;
    }
    if(gameState.team.every(m=>m.hp>=m.maxHp)){
      sfx.cancel();
      showDialog(['Dein Team ist bereits vollstaendig gesund!'],()=>{gameState.mode='BAG';});
      return;
    }
    gameState.potions--;
    gameState.team.forEach(m=>{m.hp=m.maxHp;});
    saveGame(true);sfx.heal();
    showDialog(['Dein Team wurde mit einem Seelen-Trank geheilt!'],()=>{gameState.mode='BAG';});
  }
  function chooseBagItem(){
    const selected=BAG_MENU[gameState.bagCursor]?.id;
    if(selected==='heiltrank'){healTeamFromBag();return;}
    if(selected==='orbs'){
      sfx.blip();
      showDialog(['Seelen-Sphaeren nutzt du zum Fangen im wilden Kampf.'],()=>{gameState.mode='BAG';});
      return;
    }
    if(selected==='runes'){gameState.runeOrigin='BAG';gameState.mode='RUNEBOOK';gameState.runeCursor=0;gameState.runeTeamCursor=0;sfx.confirm();return;}
    if(selected&&gameState.team.length){openEquipment('BAG',0,selected);return;}
    sfx.cancel();showDialog(['Erst ein Wesen im Team kann Gegenstaende tragen.'],()=>{gameState.mode='BAG';});
  }

  // --- EINGABE-STEUERUNG (TASTATUR + NINTENDO SWITCH GAMEPAD API) ---
  function handleCommand(cmd) {
    ensureAudio();
    if(gameState.mode==='ARCHIVE'){
      const stored=window.EchoArchive.ensure(gameState);
      if(cmd==='B'||cmd==='START'){gameState.mode='MENU';sfx.cancel();return;}
      if(cmd==='UP'||cmd==='DOWN'){
        if(stored.length)gameState.archiveCursor=(gameState.archiveCursor+(cmd==='UP'?-1:1)+stored.length)%stored.length;
        sfx.blip();return;
      }
      if(cmd==='LEFT'||cmd==='RIGHT'){
        const n=gameState.team.length;
        if(n)gameState.archiveTeamCursor=(gameState.archiveTeamCursor+(cmd==='LEFT'?-1:1)+n)%n;
        sfx.blip();return;
      }
      if(cmd==='A'){
        if(window.EchoArchive.exchange(gameState,gameState.archiveCursor||0,gameState.archiveTeamCursor||0)){
          ensureMonsterMoves(gameState.team[gameState.archiveTeamCursor||0]);
          saveGame(true);sfx.confirm();
        }else sfx.cancel();
      }
      return;
    }
    if(gameState.mode==='RAIL'){
      const options=window.EchoRail.destinations(gameState);
      if(cmd==='B'||cmd==='START'){gameState.mode='OVERWORLD';sfx.cancel();return;}
      if(cmd==='UP'||cmd==='LEFT'){gameState.railCursor=(gameState.railCursor-1+options.length)%Math.max(1,options.length);sfx.blip();return;}
      if(cmd==='DOWN'||cmd==='RIGHT'){gameState.railCursor=(gameState.railCursor+1)%Math.max(1,options.length);sfx.blip();return;}
      if(cmd==='A'){
        const target=options[gameState.railCursor];
        if(target&&window.EchoRail.depart(gameState,target.id)){
          gameState.mode='OVERWORLD';saveGame(true);sfx.confirm();
          showDialog(['Echo-Bahn: Ankunft in '+target.name+'.',
            'Die Fahrt ist kostenlos. Du kannst jederzeit zurueckfahren.']);
        }else{gameState.mode='OVERWORLD';showDialog(['Bahnfahrt nicht moeglich.']);}
      }
      return;
    }
    if(gameState.mode==='OVERWORLD'&&gameState.scene==='RUINS'&&cmd==='B'){
      window.EchoRuins.exit(gameState);saveGame(true);sfx.cancel();
      return;
    }
    if(gameState.mode==='PLATFORM'){
      const wasPlaying=gameState.mode==='PLATFORM';
      window.EchoPlatformer.input(gameState,cmd);
      if(wasPlaying&&gameState.mode==='OVERWORLD'){saveGame(true);sfx.cancel();}
      return;
    }
    if((cmd==='MAP'||cmd==='SELECT')&&gameState.mode==='OVERWORLD'){
      gameState.mode='MAP';sfx.confirm();return;
    }
    if(gameState.mode==='MAP'){
      if(['A','B','START','MAP','SELECT'].includes(cmd)){gameState.mode='OVERWORLD';sfx.cancel();}
      return;
    }

    if(cmd==='MOVES' && ['OVERWORLD','MENU','BATTLE'].includes(gameState.mode)){
      if(!gameState.team.length){showDialog(['Du brauchst zuerst Miora, um dein Attackenbuch zu öffnen.']);return;}
      gameState.attackOrigin=gameState.mode;
      gameState.freeAttackCursor=0;
      gameState.attackBookTeamCursor=0;
      if(gameState.mode==='BATTLE'&&gameState.battle){gameState.battle.attackCursor=0;gameState.battle.attackTop=0;}
      gameState.mode='ATTACKS';sfx.confirm();return;
    }
    if (cmd === 'PALETTE') {
      paletteIdx = (paletteIdx + 1) % PALETTES.length;
      canvas.style.filter = PALETTES[paletteIdx].filter;
      storePrefs();
      document.getElementById('btn-palette').textContent = '🎨 ' + PALETTES[paletteIdx].name;
      sfx.blip();
      return;
    }
    if (cmd === 'FULLSCREEN') {
      if (!document.fullscreenElement) document.documentElement.requestFullscreen().catch(() => {});
      else document.exitFullscreen().catch(() => {});
      return;
    }

    if (gameState.mode === 'TITLE') {
      if (cmd === 'A' || cmd === 'START') { gameState.mode = gameState.dialogQueue.length ? 'DIALOG' : 'OVERWORLD'; sfx.confirm(); }
      return;
    }

    if (gameState.mode === 'DIALOG') {
      if (cmd === 'A' || cmd === 'B') {
        gameState.dialogQueue.shift();
        sfx.blip();
        if (gameState.dialogQueue.length === 0) {
          gameState.mode = 'OVERWORLD';
          if (gameState.dialogCallback) {
            const cb = gameState.dialogCallback;
            gameState.dialogCallback = null;
            cb();
          }
        }
      }
      return;
    }

    if (gameState.mode === 'OVERWORLD') {
      if (cmd === 'UP') movePlayer(0, -1, 'up');
      else if (cmd === 'DOWN') movePlayer(0, 1, 'down');
      else if (cmd === 'LEFT') movePlayer(-1, 0, 'left');
      else if (cmd === 'RIGHT') movePlayer(1, 0, 'right');
      else if (cmd === 'A') interactFront();
      else if (cmd === 'R') { gameState.lexiconOrigin='OVERWORLD';gameState.mode = 'LEXICON'; sfx.confirm(); }
      else if (cmd === 'START') { gameState.mode = 'MENU'; gameState.menuCursor = 0; sfx.blip(); }
      else if (cmd === 'L') {
        if (gameState.team.length > 1) {
          gameState.team.push(gameState.team.shift());
          sfx.blip();
        }
      }
      return;
    }

    if(gameState.mode==='ATTACKS'){
      const b=gameState.battle;
      const menuOnly=gameState.attackOrigin==='OVERWORLD'||gameState.attackOrigin==='MENU';
      const ally=menuOnly?gameState.team[gameState.attackBookTeamCursor||0]:getActiveAlly();
      if(!ally)return;
      ensureMonsterMoves(ally);
      if(menuOnly&&(cmd==='LEFT'||cmd==='RIGHT')){
        const n=gameState.team.length,offset=cmd==='LEFT'?-1:1;
        gameState.attackBookTeamCursor=(gameState.attackBookTeamCursor+offset+n)%n;
        gameState.freeAttackCursor=0;sfx.blip();return;
      }
      let idx=menuOnly?(gameState.freeAttackCursor||0):(b.attackCursor||0);
      if(cmd==='B'||cmd==='START'){
        gameState.mode=menuOnly?gameState.attackOrigin:'BATTLE';gameState.attackOrigin=null;sfx.cancel();return;
      }
      if(cmd==='UP')idx=Math.max(0,idx-1);
      if(cmd==='DOWN')idx=Math.min(ally.moves.length-1,idx+1);
      if(menuOnly)gameState.freeAttackCursor=idx;
      else{b.attackCursor=idx;b.attackTop=Math.max(0,Math.min(b.attackTop||0,idx));if(idx>=b.attackTop+6)b.attackTop=idx-5;}
      if(cmd==='L')attackReorder(-1);
      if(cmd==='R')attackReorder(1);
      if(cmd==='A' && menuOnly){
        const id=ally.moves[idx];
        if(id&&toggleEquipped(ally,id))sfx.confirm();else sfx.cancel();
      }
      if(cmd==='A'&&!menuOnly)useSelectedAttack();
      return;
    }
    if(gameState.mode==='TEAM_SELECT'){
      const b=gameState.battle;if(!b||b.busy)return;
      const size=gameState.team.length;
      if(cmd==='B'||cmd==='START'){gameState.mode='BATTLE';sfx.cancel();return;}
      if(cmd==='UP'||cmd==='LEFT'){gameState.teamCursor=(gameState.teamCursor-1+size)%size;sfx.blip();return;}
      if(cmd==='DOWN'||cmd==='RIGHT'){gameState.teamCursor=(gameState.teamCursor+1)%size;sfx.blip();return;}
      if(cmd==='A'){
        const index=gameState.teamCursor||0,other=gameState.team[index];
        if(!other||other.hp<=0){sfx.cancel();return;}
        if(index===0){gameState.mode='BATTLE';sfx.cancel();return;}
        gameState.team.splice(index,1);gameState.team.unshift(other);
        markBattleParticipant(other);
        autoUseGear(other);
        gameState.mode='BATTLE';
        b.log=SPECIES[other.id-1].name+' kommt heraus!';
        b.busy=true;
        sfx.confirm();
        battleTimeout(enemyCounterAttack,450);
        saveGame(true);
      }
      return;
    }
    if(gameState.mode==='BATTLE'){
      const b=gameState.battle;if(!b||b.busy)return;
      if(cmd==='LEFT'&&b.cursor%2===1){b.cursor--;sfx.blip();}
      else if(cmd==='RIGHT'&&b.cursor%2===0){b.cursor++;sfx.blip();}
      else if(cmd==='UP'&&b.cursor>=2){b.cursor-=2;sfx.blip();}
      else if(cmd==='DOWN'&&b.cursor<2){b.cursor+=2;sfx.blip();}
      else if(cmd==='A')executeBattleAction(b.cursor);
      return;
    }

    
      if (gameState.mode === 'LEXICON') {
      if (cmd === 'B' || cmd === 'R' || cmd === 'START') { gameState.mode = gameState.lexiconOrigin==='MENU'?'MENU':'OVERWORLD'; gameState.lexiconOrigin='OVERWORLD'; sfx.cancel(); }
      else if (cmd === 'UP') { gameState.lexiconCursor = Math.max(1, gameState.lexiconCursor - 1); sfx.blip(); }
      else if (cmd === 'DOWN') { gameState.lexiconCursor = Math.min(150, gameState.lexiconCursor + 1); sfx.blip(); }
      else if (cmd === 'LEFT') { gameState.lexiconCursor = Math.max(1, gameState.lexiconCursor - 10); sfx.blip(); }
      else if (cmd === 'RIGHT') { gameState.lexiconCursor = Math.min(150, gameState.lexiconCursor + 10); sfx.blip(); }
      return;
    }

    if (gameState.mode === 'AUSRUESTUNG') {
      const size=gameState.team.length;
      if(cmd==='B'||cmd==='R'||cmd==='START'){gameState.mode=gameState.equipmentOrigin||'RUNEBOOK';gameState.equipmentOrigin='RUNEBOOK';sfx.cancel();return;}
      if(!size)return;
      if(cmd==='LEFT'){gameState.runeTeamCursor=(gameState.runeTeamCursor-1+size)%size;sfx.blip();return;}
      if(cmd==='RIGHT'){gameState.runeTeamCursor=(gameState.runeTeamCursor+1)%size;sfx.blip();return;}
      if(cmd==='UP'){gameState.gearCursor=(gameState.gearCursor-1+GEAR_ITEMS.length)%GEAR_ITEMS.length;sfx.blip();return;}
      if(cmd==='DOWN'){gameState.gearCursor=(gameState.gearCursor+1)%GEAR_ITEMS.length;sfx.blip();return;}
      if(cmd==='A'){
        const result=toggleGear(gameState.team[gameState.runeTeamCursor],GEAR_ITEMS[gameState.gearCursor].id);
        sfx.confirm();showDialog([result],()=>{gameState.mode='AUSRUESTUNG';});
      }
      return;
    }
    if (gameState.mode === 'RUNEBOOK') {
      if(cmd==='R'){openEquipment('RUNEBOOK',gameState.runeTeamCursor||0);return;}
      const items=availableRunes();
      const n=gameState.team.length;
      if(cmd==='B'||cmd==='START'){gameState.mode=gameState.runeOrigin==='BAG'?'BAG':'MENU';gameState.runeOrigin='MENU';sfx.cancel();return;}
      if(!n)return;
      if(cmd==='LEFT'){gameState.runeTeamCursor=(gameState.runeTeamCursor-1+n)%n;sfx.blip();return;}
      if(cmd==='RIGHT'){gameState.runeTeamCursor=(gameState.runeTeamCursor+1)%n;sfx.blip();return;}
      if(cmd==='UP'&&items.length){gameState.runeCursor=(gameState.runeCursor-1+items.length)%items.length;sfx.blip();return;}
      if(cmd==='DOWN'&&items.length){gameState.runeCursor=(gameState.runeCursor+1)%items.length;sfx.blip();return;}
      if(cmd==='A'&&items.length){
        const item=items[Math.min(gameState.runeCursor,items.length-1)];
        const ally=gameState.team[gameState.runeTeamCursor];
        const result=item.kind==='support'?toggleSupportRune(ally):teachRune(ally,item.id);
        gameState.runeCursor=0;
        sfx.confirm();showDialog([result],()=>{gameState.mode='RUNEBOOK';});
      }
      return;
    }
    if(gameState.mode==='TEAM_OVERVIEW'){
      const n=gameState.team.length;
      if(cmd==='B'||cmd==='START'){gameState.mode='MENU';sfx.cancel();return;}
      if(!n)return;
      if(cmd==='UP'||cmd==='DOWN'){
        gameState.teamMenuCursor=(gameState.teamMenuCursor+(cmd==='UP'?-1:1)+n)%n;sfx.blip();return;
      }
      if(cmd==='A'){openEquipment('TEAM_OVERVIEW',gameState.teamMenuCursor);return;}
      return;
    }
    if(gameState.mode==='BAG'){
      if(cmd==='B'||cmd==='START'){gameState.mode='MENU';sfx.cancel();return;}
      if(cmd==='UP'||cmd==='DOWN'){
        gameState.bagCursor=(gameState.bagCursor+(cmd==='UP'?-1:1)+BAG_MENU.length)%BAG_MENU.length;sfx.blip();return;
      }
      if(cmd==='A'){chooseBagItem();return;}
      return;
    }
    if(gameState.mode==='RUNE_SHOP'){
      if(cmd==='B'||cmd==='START'){gameState.mode='OVERWORLD';sfx.cancel();return;}
      if(cmd==='UP'||cmd==='DOWN'){
        gameState.shopCursor=(gameState.shopCursor+(cmd==='UP'?-1:1)+SHOP_ITEMS.length)%SHOP_ITEMS.length;
        sfx.blip();return;
      }
      if(cmd==='A'){
        const message=purchaseShopItem(SHOP_ITEMS[gameState.shopCursor].id);
        sfx.confirm();showDialog([message],()=>{gameState.mode='RUNE_SHOP';});
      }
      return;
    }
    if(gameState.mode==='OPTIONS'){
      if(cmd==='B'||cmd==='START'){gameState.mode='MENU';sfx.cancel();return;}
      if(cmd==='UP'||cmd==='DOWN'){
        gameState.optionsCursor=(gameState.optionsCursor+(cmd==='UP'?-1:1)+OPTIONS_MENU.length)%OPTIONS_MENU.length;sfx.blip();return;
      }
      if(cmd==='A'||cmd==='LEFT'||cmd==='RIGHT'){
        switch(gameState.optionsCursor){
          case 0:
            soundEnabled=!soundEnabled;
            document.getElementById('touch-sound').textContent=soundEnabled?'🔊 Ton':'🔇 Ton';
            storePrefs();if(soundEnabled)ensureAudio();break;
          case 1:
            paletteIdx=(paletteIdx+PALETTES.length+(cmd==='LEFT'?-1:1))%PALETTES.length;
            canvas.style.filter=PALETTES[paletteIdx].filter;
            document.getElementById('btn-palette').textContent='🎨 '+PALETTES[paletteIdx].name;
            storePrefs();break;
          case 2:
            showDialog(['START: Menue   Steuerkreuz: Auswahl','A: OK   B: Zurueck','Handy: Eintraege direkt antippen.'],()=>{gameState.mode='OPTIONS';});return;
          case 3:gameState.mode='MENU';break;
        }
        sfx.blip();
      }
      return;
    }
    if(gameState.mode==='MENU'){
      if(cmd==='B'||cmd==='START'){gameState.mode='OVERWORLD';sfx.cancel();return;}
      if(cmd==='UP'||cmd==='DOWN'){
        gameState.menuCursor=(gameState.menuCursor+(cmd==='UP'?-1:1)+START_MENU.length)%START_MENU.length;
        sfx.blip();return;
      }
      if(cmd!=='A')return;
      switch(START_MENU[gameState.menuCursor].id){
        case 'seelenbuch':gameState.lexiconOrigin='MENU';gameState.mode='LEXICON';break;
        case 'team':gameState.teamMenuCursor=0;gameState.mode='TEAM_OVERVIEW';break;
        case 'bag':gameState.bagCursor=0;gameState.mode='BAG';break;
        case 'runes':gameState.runeOrigin='MENU';gameState.runeCursor=0;gameState.runeTeamCursor=0;gameState.mode='RUNEBOOK';break;
        case 'archive':
          window.EchoArchive.ensure(gameState);
          gameState.archiveCursor=0;gameState.archiveTeamCursor=0;
          gameState.mode='ARCHIVE';break;
        case 'save':
          saveGame();
          if(gameState.mode==='DIALOG')gameState.dialogCallback=()=>{gameState.mode='MENU';};
          return;
        case 'options':gameState.optionsCursor=0;gameState.mode='OPTIONS';break;
        case 'exit':gameState.mode='OVERWORLD';break;
      }
      sfx.confirm();return;
    }
  }

  window.addEventListener('keydown', (e) => {
    if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' ','Backspace'].includes(e.key)) e.preventDefault();
    const k = e.key.toLowerCase();
    if (['arrowup', 'w'].includes(k)) handleCommand('UP');
    else if (['arrowdown', 's'].includes(k)) handleCommand('DOWN');
    else if (['arrowleft', 'a'].includes(k)) handleCommand('LEFT');
    else if (['arrowright', 'd'].includes(k)) handleCommand('RIGHT');
    else if (['enter', ' ', 'z'].includes(k)) handleCommand('A');
    else if (['backspace', 'x'].includes(k)) handleCommand('B');
    else if (['q'].includes(k)) handleCommand('L');
    else if (['e'].includes(k)) handleCommand('R');
    else if (['i'].includes(k)) handleCommand('MOVES');
    else if (['m', 'escape'].includes(k)) handleCommand('START');
    else if (['tab'].includes(k)) { e.preventDefault(); handleCommand('PALETTE'); }
    else if (['f'].includes(k)) handleCommand('FULLSCREEN');
  });

  // Nintendo Switch Controller Polling
  let lastPadTime = 0;
  const toastEl = document.getElementById('pad-toast');
  window.addEventListener('gamepadconnected', () => {
    toastEl.classList.add('show');
    setTimeout(() => toastEl.classList.remove('show'), 3500);
  });

  let platformButtonA=false,platformButtonB=false,platformButtonStart=false,padStartHeld=false;
  function pollGamepad(now) {
    const pads = navigator.getGamepads ? navigator.getGamepads() : [];
    const gp = pads[0];
    if(gameState.mode==='PLATFORM'){
      if(!gp){platformButtonA=false;platformButtonB=false;platformButtonStart=false;return;}
      const b=(idx)=>!!gp.buttons?.[idx]?.pressed;
      const left=b(14)||(gp.axes[0]||0)<-.45;
      const right=b(15)||(gp.axes[0]||0)>.45;
      const jump=b(1); // Switch A, right face button
      const back=b(0); // Switch B, lower face button
      const pause=b(9);
      // An independent jump edge lets the player hold the stick and jump together.
      if(jump&&!platformButtonA)handleCommand('A');
      if(back&&!platformButtonB)handleCommand('B');
      if(pause&&!platformButtonStart)handleCommand('START');
      platformButtonA=jump;platformButtonB=back;platformButtonStart=pause;
      padStartHeld=pause;
      if(gameState.mode==='PLATFORM'&&now-lastPadTime>=95){
        if(left!==right){handleCommand(left?'LEFT':'RIGHT');lastPadTime=now;}
      }
      return;
    }
    platformButtonA=false;platformButtonB=false;platformButtonStart=false;
    // Only one START action per press. Holding Plus must not open then close
    // the menu again on the controller's 155 ms repeat interval.
    if(!gp?.buttons?.[9]?.pressed)padStartHeld=false;
    if (!gp || now - lastPadTime < 155) return;

    const axX = gp.axes[0] || 0;
    const axY = gp.axes[1] || 0;
    const b = (idx) => gp.buttons[idx] && gp.buttons[idx].pressed;

    let cmd = null;
    if (b(12) || axY < -0.45) cmd = 'UP';
    else if (b(13) || axY > 0.45) cmd = 'DOWN';
    else if (b(14) || axX < -0.45) cmd = 'LEFT';
    else if (b(15) || axX > 0.45) cmd = 'RIGHT';
    else if (b(1) || b(0)) cmd = b(1) ? 'A' : 'B'; // Switch A (rechts) / B (unten)
    else if (b(4)) cmd = 'L';
    else if (b(5)) cmd = 'R';
    else if (b(9) && !padStartHeld) cmd = 'START';   // Plus (+), edge-triggered
    else if (b(8)) cmd = 'PALETTE'; // Minus (-)
    else if (b(6)) cmd = 'MOVES'; // ZL öffnet das Attackenbuch
    else if (b(7)) cmd = 'FULLSCREEN'; // ZR

    if (cmd) {
      lastPadTime = now;
      if(cmd==='START')padStartHeld=true;
      handleCommand(cmd);
    }
  }

  // HUD-Buttons oben rechts
  document.getElementById('moves-desktop').onclick=()=>handleCommand('MOVES');
  document.getElementById('btn-palette').onclick = () => handleCommand('PALETTE');
  document.getElementById('btn-sound').onclick = (e) => {
    soundEnabled = !soundEnabled;
    e.target.textContent = soundEnabled ? '🔊 8-Bit Ton' : '🔇 Ton aus';
  };
  document.getElementById('btn-fs').onclick = () => handleCommand('FULLSCREEN');

  // --- GRAFIK-RENDERING (16x16 OBERWELT & 32x32 KAMPF) ---
  const fireflies = Array.from({ length: 18 }, () => ({
    x: Math.random() * 240,
    y: Math.random() * 160,
    s: 0.2 + Math.random() * 0.4,
    p: Math.random() * 6.28
  }));

  function drawTile16(tile, sx, sy, tick) {
    if (tile === 0) {
      ctx.fillStyle = '#1b3b2b';
      ctx.fillRect(sx, sy, 16, 16);
      ctx.fillStyle = '#26533d';
      ctx.fillRect(sx + 3, sy + 4, 2, 2);
      ctx.fillRect(sx + 11, sy + 11, 2, 2);
    } else if (tile === 1) {
      ctx.fillStyle = '#1b3b2b';
      ctx.fillRect(sx, sy, 16, 16);
      ctx.fillStyle = '#11221c';
      ctx.fillRect(sx + 2, sy + 2, 12, 13);
      ctx.fillStyle = '#2d6a4f';
      ctx.fillRect(sx + 3, sy + 2, 10, 9);
      ctx.fillStyle = '#52b788';
      ctx.fillRect(sx + 5, sy + 3, 6, 4);
    } else if (tile === 2) {
      // Hohes Geister-Gras (leuchtende Spitzen)
      ctx.fillStyle = '#1b3b2b';
      ctx.fillRect(sx, sy, 16, 16);
      const sway = Math.sin(tick * 0.005 + sx) > 0 ? 1 : 0;
      ctx.fillStyle = '#38a3a5';
      for (let i = 2; i < 14; i += 4) {
        ctx.fillRect(sx + i + sway, sy + 5, 2, 9);
        ctx.fillStyle = '#80ed99';
        ctx.fillRect(sx + i + sway, sy + 4, 2, 2);
        ctx.fillStyle = '#38a3a5';
      }
    } else if (tile === 3) {
      ctx.fillStyle = '#5c4d3c';
      ctx.fillRect(sx, sy, 16, 16);
      ctx.fillStyle = '#7f6a53';
      ctx.fillRect(sx + 2, sy + 3, 4, 3);
      ctx.fillRect(sx + 9, sy + 10, 4, 3);
    } else if (tile === 4) {
      ctx.fillStyle = '#023e8a';
      ctx.fillRect(sx, sy, 16, 16);
      ctx.fillStyle = '#48cae4';
      const wOff = Math.floor(tick / 350) % 4;
      ctx.fillRect(sx + 2 + wOff, sy + 5, 6, 2);
      ctx.fillRect(sx + 6 - wOff, sy + 11, 6, 2);
    } else if (tile === 5) {
      ctx.fillStyle = '#6d3b47';
      ctx.fillRect(sx, sy, 16, 16);
      ctx.fillStyle = '#e09f3e';
      ctx.fillRect(sx + 2, sy + 10, 12, 6);
      ctx.fillStyle = '#fff3b0';
      ctx.fillRect(sx + 6, sy + 11, 4, 4);
    } else if (tile === 6) {
      ctx.fillStyle = '#1b3b2b';
      ctx.fillRect(sx, sy, 16, 16);
      ctx.fillStyle = '#48cae4';
      ctx.fillRect(sx + 3, sy + 3, 10, 10);
      ctx.fillStyle = '#caf0f8';
      ctx.fillRect(sx + 5, sy + 5, 6, 6);
    } else if (tile === 7) {
      ctx.fillStyle = '#1b3b2b';
      ctx.fillRect(sx, sy, 16, 16);
      ctx.fillStyle = '#7f4f24';
      ctx.fillRect(sx + 2, sy + 4, 12, 10);
      if (!gameState.hasStarter) {
        ctx.fillStyle = (Math.floor(tick / 250) % 2 === 0) ? '#ffd166' : '#fff';
        ctx.fillRect(sx + 6, sy + 5, 4, 4);
      }
    }
  }

  function drawChar16Legacy(sx, sy, color, step = 0) {
    ctx.fillStyle = 'rgba(0,0,0,0.45)';
    ctx.fillRect(sx + 3, sy + 13, 10, 3);
    ctx.fillStyle = '#10002b';
    ctx.fillRect(sx + 3, sy + 1, 10, 13);
    ctx.fillStyle = '#ffccd5';
    ctx.fillRect(sx + 4, sy + 3, 8, 5);
    ctx.fillStyle = color;
    ctx.fillRect(sx + 4, sy + 2, 8, 2);
    ctx.fillRect(sx + 4, sy + 8, 8, 4);
    ctx.fillStyle = '#1d3557';
    ctx.fillRect(sx + 4, sy + 12 + (step ? 1 : 0), 3, 2);
    ctx.fillRect(sx + 9, sy + 12 + (step ? 0 : 1), 3, 2);
  }

  function renderOverworld(tick) {
    const camX = gameState.player.x * 16 - 112;
    const camY = gameState.player.y * 16 - 72;

    ctx.fillStyle = '#090d16';
    ctx.fillRect(0, 0, 240, 160);

    for (let y = 0; y < MAP_H; y++) {
      for (let x = 0; x < MAP_W; x++) {
        const sx = x * 16 - camX;
        const sy = y * 16 - camY;
        if (sx < -16 || sy < -16 || sx > 240 || sy > 160) continue;
        drawTile16(worldMap[y][x], sx, sy, tick, x, y);
      }
    }

    // NPCs & Objekte
    npcs.forEach(n => {
      const sx = n.x * 16 - camX;
      const sy = n.y * 16 - camY;
      if (sx < -16 || sy < -16 || sx > 240 || sy > 160) return;
      if (n.isObject) {
        ctx.fillStyle = '#10002b';
        ctx.fillRect(sx + 3, sy + 4, 10, 9);
        ctx.fillStyle = n.color;
        ctx.fillRect(sx + 4, sy + 5, 8, 7);
      } else {
        drawChar16(sx, sy, n.color, Math.floor(tick / 500) % 2);
      }
    });

    // Begleiter-Geist (16x16) läuft hinter dem Spieler her
    if (gameState.hasStarter && gameState.team.length > 0) {
      const dirOffsets = { up: [0, 1], down: [0, -1], left: [1, 0], right: [-1, 0] };
      const [bx, by] = dirOffsets[gameState.player.dir];
      const spr16 = getMonsterSprite(gameState.team[0].id, 16);
      const bob = Math.sin(tick * 0.008) * 1.5;
      ctx.drawImage(spr16, 112 + bx * 14, 72 + by * 14 + bob);
    }

    // Spieler (16x16)
    drawChar16(112, 72, '#ef476f', gameState.player.stepPhase);

    // Leuchtende Seelen-Glühwürmchen
    fireflies.forEach(f => {
      f.x = (f.x + Math.sin(tick * 0.002 + f.p) * 0.3 + 240) % 240;
      f.y = (f.y - f.s + 160) % 160;
      ctx.fillStyle = 'rgba(202, 240, 248, 0.75)';
      ctx.fillRect(f.x, f.y, 2, 2);
    });

    // Kompakte Status-Leiste oben links
    ctx.fillStyle = 'rgba(10, 14, 26, 0.82)';
    ctx.fillRect(4, 4, 142, 16);
    ctx.strokeStyle = '#48cae4';
    ctx.strokeRect(4, 4, 142, 16);
    ctx.fillStyle = '#f8f9fa';
    ctx.font = '8px monospace';
    const caughtCount = Object.keys(gameState.caughtIds).length;
    ctx.fillText(`Orden:${gameState.badges}/3 | Seelen:${caughtCount}/150`, 8, 15);
  }

  function renderBattle(tick) {
    const b = gameState.battle;
    if (!b) return;
    const ally = getActiveAlly();
    const allySp = SPECIES[ally.id - 1];
    const enemy = b.enemy;
    const enemySp = SPECIES[enemy.id - 1];

    // GBA-Kampf-Hintergrund
    const grad = ctx.createLinearGradient(0, 0, 0, 112);
    grad.addColorStop(0, '#10002b');
    grad.addColorStop(1, '#240046');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 240, 112);

    // Kampf-Plattformen
    ctx.fillStyle = '#3c096c';
    ctx.fillRect(138, 52, 82, 12);
    ctx.fillRect(18, 96, 88, 12);
    ctx.fillStyle = '#7b2cbf';
    ctx.fillRect(142, 54, 74, 8);
    ctx.fillRect(22, 98, 80, 8);

    // 32x32 Sprites (Skaliert auf 48x48 für klare TV-Sichtbarkeit, aber echte 32x32 Pixel-Basis)
    const shake = b.animTimer > 0 ? ((b.animTimer % 2 === 0) ? 3 : -3) : 0;
    if (b.animTimer > 0) b.animTimer--;

    const enemySpr32 = getMonsterSprite(enemy.id, 32);
    const allySpr32 = getMonsterSprite(ally.id, 32);
    const floatY = Math.sin(tick * 0.007) * 2;

    ctx.drawImage(enemySpr32, 156 + shake, 12 + floatY, 44, 44);
    ctx.drawImage(allySpr32, 36, 56 - floatY, 44, 44);

    // Gegner-HUD (oben links)
    ctx.fillStyle = 'rgba(14, 18, 34, 0.92)';
    ctx.fillRect(8, 8, 116, 30);
    ctx.strokeStyle = '#9b5de5';
    ctx.strokeRect(8, 8, 116, 30);
    ctx.fillStyle = '#fff';
    ctx.font = '8px monospace';
    ctx.fillText(`${enemySp.name} Lv.${enemy.lv}`, 13, 19);
    ctx.fillStyle = '#333';
    ctx.fillRect(13, 24, 102, 6);
    ctx.fillStyle = '#06d6a0';
    ctx.fillRect(13, 24, Math.floor(102 * (enemy.hp / enemy.maxHp)), 6);

    // Spieler-HUD (rechts unten über Textbox)
    ctx.fillStyle = 'rgba(14, 18, 34, 0.92)';
    ctx.fillRect(116, 72, 116, 34);
    ctx.strokeStyle = '#ffd166';
    ctx.strokeRect(116, 72, 116, 34);
    ctx.fillStyle = '#fff';
    ctx.fillText(`${allySp.name} Lv.${ally.lv}`, 121, 83);
    ctx.fillStyle = '#333';
    ctx.fillRect(121, 87, 102, 6);
    ctx.fillStyle = '#ffd166';
    ctx.fillRect(121, 87, Math.floor(102 * (ally.hp / ally.maxHp)), 6);
    ctx.fillStyle = '#adb5bd';
    ctx.fillText(`HP: ${ally.hp}/${ally.maxHp}`, 121, 101);

    // Untere GBA-Kampf-Box
    ctx.fillStyle = '#0b0e1a';
    ctx.fillRect(0, 112, 240, 48);
    ctx.strokeStyle = '#48cae4';
    ctx.strokeRect(2, 114, 236, 44);

    ctx.fillStyle = '#e0fbfc';
    ctx.font = '8px monospace';
    ctx.fillText(b.log.slice(0, 36), 8, 127);

    if (!b.busy) {
      const opts = [
        'Astral-Hieb',
        'Seelen-Echo',
        b.isTrainer ? `Heiltrank(${gameState.potions})` : `Sphäre(${gameState.orbs})`,
        'Flucht'
      ];
      opts.forEach((label, idx) => {
        const ox = (idx % 2 === 0) ? 12 : 126;
        const oy = (idx < 2) ? 140 : 151;
        ctx.fillStyle = b.cursor === idx ? '#ffd166' : '#adb5bd';
        ctx.fillText((b.cursor === idx ? '▶ ' : '  ') + label, ox, oy);
      });
    }
  }

  function renderDialog() {
    ctx.fillStyle = 'rgba(10, 12, 24, 0.95)';
    ctx.fillRect(6, 108, 228, 46);
    ctx.strokeStyle = '#ffd166';
    ctx.strokeRect(6, 108, 228, 46);

    const text = gameState.dialogQueue[0] || '';
    ctx.fillStyle = '#ffffff';
    ctx.font = '8px monospace';

    // Automatischer Zeilenumbruch
    const words = text.split(' ');
    let line = '';
    let y = 122;
    for (let w of words) {
      if ((line + w).length > 34) {
        ctx.fillText(line, 14, y);
        line = w + ' ';
        y += 11;
      } else {
        line += w + ' ';
      }
    }
    ctx.fillText(line, 14, y);
    ctx.fillStyle = '#ffd166';
    ctx.fillText('▼ A', 208, 148);
  }

  function renderLexicon() {
    ctx.fillStyle = '#0c1021';
    ctx.fillRect(0, 0, 240, 160);
    ctx.strokeStyle = '#9b5de5';
    ctx.strokeRect(4, 4, 232, 152);

    const id = gameState.lexiconCursor;
    const sp = SPECIES[id - 1];
    const seen = !!gameState.seenIds[id] || id <= 3;

    ctx.fillStyle = '#ffd166';
    ctx.font = '9px monospace';
    ctx.fillText(`BUCH DER 150 SEELEN (◄/► ±10 | B: Zurück)`, 12, 18);

    // Großes 32x32 Vorschau-Porträt + 16x16 Mini-Sprite
    const spr32 = getMonsterSprite(id, 32);
    const spr16 = getMonsterSprite(id, 16);
    ctx.fillStyle = '#19223c';
    ctx.fillRect(14, 28, 64, 64);
    ctx.strokeStyle = '#48cae4';
    ctx.strokeRect(14, 28, 64, 64);
    ctx.drawImage(spr32, 22, 36, 48, 48);
    ctx.drawImage(spr16, 60, 74, 16, 16);

    ctx.fillStyle = '#fff';
    ctx.font = '9px monospace';
    ctx.fillText(`Nr. ${String(id).padStart(3, '0')}: ${sp.name}`, 88, 40);
    ctx.fillStyle = '#90e0ef';
    ctx.font = '8px monospace';
    ctx.fillText(`Element : ${sp.type}`, 88, 54);
    ctx.fillText(`Stufe   : Entwicklungsstufe ${sp.stage}`, 88, 66);
    ctx.fillText(`Werte   : HP ${sp.hp} | ANG ${sp.atk} | VER ${sp.def}`, 88, 78);
    ctx.fillText(`Status  : ${gameState.caughtIds[id] ? '★ Verbunden' : (seen ? 'Gesehen' : 'Unbekannt')}`, 88, 90);

    ctx.fillStyle = '#e0c3fc';
    ctx.fillText('Seelen-Echo:', 14, 112);
    ctx.fillStyle = '#f8f9fa';
    ctx.fillText(sp.whisper.slice(0, 38), 14, 125);
    ctx.fillText(sp.whisper.slice(38, 76), 14, 137);
  }

  function renderMenu() {
    ctx.fillStyle = 'rgba(10, 14, 28, 0.94)';
    ctx.fillRect(44, 24, 152, 112);
    ctx.strokeStyle = '#ffd166';
    ctx.strokeRect(44, 24, 152, 112);

    ctx.fillStyle = '#ffd166';
    ctx.font = '9px monospace';
    ctx.fillText('START-MENÜ', 88, 38);

    const pagesFound = gameState.pages.filter(Boolean).length;
    ctx.fillStyle = '#90e0ef';
    ctx.font = '8px monospace';
    ctx.fillText(`Vaters Tagebuch: ${pagesFound}/3 Seiten`, 56, 52);

    const items = [
      '150-Seelen-Lexikon',
      `Team heilen (Tränke: ${gameState.potions})`,
      'Spielstand speichern',
      'Weiterspielen'
    ];
    items.forEach((it, i) => {
      ctx.fillStyle = gameState.menuCursor === i ? '#ffffff' : '#adb5bd';
      ctx.fillText((gameState.menuCursor === i ? '▶ ' : '  ') + it, 54, 74 + i * 14);
    });
  }

  // ═════════════════════════════════════════════════════════════════════
  // ECHO CHRONIKEN • DIRECTOR'S PIXEL EDITION
  // 320×180 widescreen / richly illustrated handmade canvas tiles
  // ═════════════════════════════════════════════════════════════════════
  const PW = 320, PH = 180, CX = 152, CY = 82;
  const C = { ink:'#142535', deep:'#142d36', cream:'#fff1c7', gold:'#eabf68',
    wood:'#674635', moss:'#497a53', grass:'#6fac65', leaf:'#36755a', sky:'#a8d8ca',
    sea:'#367d9c', paper:'#ead9ab', red:'#be6460' };
  const pix = (x,y,w,h,col) => { ctx.fillStyle=col; ctx.fillRect(Math.round(x),Math.round(y),w,h); };
  const hash = (x,y,n=0) => {let z=(x*374761393+y*668265263+n*1442695041)|0;z=Math.imul(z^(z>>>13),1274126177);return ((z^(z>>>16))>>>0)/4294967295;};
  const boxArt = (x,y,w,h,fill='#f3e7bd',outline='#233a3c',shine='#fff5d5')=>{
    pix(x+2,y+2,w,h,'#14272c');pix(x,y,w,h,outline);pix(x+2,y+2,w-4,h-4,fill);
    pix(x+3,y+3,w-6,1,shine);pix(x+3,y+3,1,h-6,shine);
    pix(x+3,y+h-4,w-6,1,'#a68a66');
    [[x+3,y+3],[x+w-5,y+3],[x+3,y+h-5],[x+w-5,y+h-5]].forEach(([u,v])=>pix(u,v,2,2,'#b58851'));
  };
  const fText=(s,x,y,size=9,col='#203e46',align='left')=>{ctx.textAlign=align;ctx.textBaseline='alphabetic';ctx.font=`bold ${size}px 'Trebuchet MS', sans-serif`;ctx.fillStyle='#f8f3d6';ctx.fillText(s,x+0.5,y+1);ctx.fillStyle=col;ctx.fillText(s,x,y);ctx.textAlign='left';};
  function wrapped(s,maxW,fontsize=10){
    ctx.font=`bold ${fontsize}px 'Trebuchet MS', sans-serif`;let lines=[''];
    for(const word of String(s).split(/\s+/)){
      const next=lines[lines.length-1]?(lines[lines.length-1]+' '+word):word;
      if(ctx.measureText(next).width<=maxW){lines[lines.length-1]=next;continue;}
      if(lines[lines.length-1])lines.push('');
      if(ctx.measureText(word).width<=maxW){lines[lines.length-1]=word;continue;}
      for(const letter of word){const last=lines.length-1; if(ctx.measureText(lines[last]+letter).width>maxW)lines.push('');lines[lines.length-1]+=letter;}
    }
    return lines;
  }

  // Full-dialog paging prevents plot/story text overflowing beyond TV view.
  function showDialog(lines,onDone=null){
    const pages=[];
    for(const msg of lines){
      const parts=wrapped(msg,278,10);
      for(let i=0;i<parts.length;i+=3)pages.push(parts.slice(i,i+3).join('\n'));
    }
    gameState.mode='DIALOG';gameState.dialogQueue=pages;gameState.dialogCallback=onDone;sfx.blip();
  }

  function drawFlower(x,y,variant=0){
    const c=['#f8ead9','#f8c77a','#d5abd5','#e77776'][variant%4];
    pix(x+1,y,1,1,c);pix(x,y+1,1,1,c);pix(x+2,y+1,1,1,c);pix(x+1,y+2,1,1,c);pix(x+1,y+1,1,1,'#f6e995');
  }

  // V0.6: handgemachte Pixel-Vignetten, statt endlose einfarbige Rechteck-Kacheln.
  function drawBaseGround(sx,sy,x,y){
    const r=hash(x,y,9);pix(sx,sy,16,16,r<.25?'#5c9e65':r<.52?'#6eac6e':'#69a768');
    for(let j=0;j<18;j++){
      const xx=Math.floor(hash(x*17+j,y*3+j,6)*16),yy=Math.floor(hash(x+j*4,y*7+j,8)*16);
      const c=j%4===0?'#91c77b':j%4===1?'#407f57':j%4===2?'#7fb674':'#559765';
      pix(sx+xx,sy+yy,j%3===0?2:1,1,c);
    }
    if(hash(x,y,12)>.78){const xx=sx+3+Math.floor(hash(x,y,23)*7),yy=sy+3+Math.floor(hash(x,y,25)*7);drawFlower(xx,yy,Math.floor(hash(x,y,14)*4));}
    if(hash(x,y,33)>.67){let x1=sx+3,y1=sy+10;pix(x1,y1,1,3,'#386f52');pix(x1+2,y1-2,2,4,'#31754b');pix(x1-1,y1+1,1,1,'#acd48d');}
  }
  function drawCobbles(sx,sy,x,y){
    drawBaseGround(sx,sy,x,y);
    const c=['#cbb38c','#e3cba1','#b89a77','#a8937c','#e8d7a9'];
    pix(sx,sy,16,16,'#9d9277');
    for(let row=0;row<4;row++){
      const shift=(row%2)*3;
      for(let col=-1;col<4;col++){
        const xx=col*6+shift+(Math.floor(hash(x+col,y+row)*2)), yy=row*4;
        const tone=c[Math.floor(hash(x*31+col,y*41+row,3)*c.length)];
        pix(sx+xx+1,sy+yy+1,5,3,tone);
        pix(sx+xx+1,sy+yy+1,4,1,'#f4e1b4');
      }
    }
    if(hash(x,y,27)>.77){pix(sx+8,sy+12,1,2,'#3f7857');pix(sx+9,sy+12,1,1,'#8dba70');}
  }
  function drawPine(sx,sy,v){
    pix(sx+5,sy+13,7,3,'#36544c');pix(sx+7,sy+11,3,5,'#805a3b');
    const colors=v>.4?['#143d42','#226052','#2f7960','#5da578']:['#173b4f','#286452','#47866b','#71ab7e'];
    for(const [y,w,c] of [[10,14,0],[7,12,1],[4,10,1],[1,7,2]]){
      pix(sx+Math.floor((16-w)/2),sy+y,w,6,colors[c]);
      pix(sx+Math.floor((16-w)/2)+2,sy+y+1,w-5,2,colors[3]);
    }
    pix(sx+8,sy,2,2,'#a7d0a0');pix(sx+1,sy+13,3,2,'#2f6d56');
  }
  function drawTile16(tile,sx,sy,tick,x,y){
    if(window.EchoVillage?.paintTile(tile,ctx,sx,sy,x,y,tick,pix))return;
    if(tile===5){drawCobbles(sx,sy,x,y);return;}
    if(tile===3){drawCobbles(sx,sy,x,y);return;}
    if(tile===4){
      pix(sx,sy,16,16,'#286b86');pix(sx+1,sy+1,14,14,'#367fa0');
      for(let i=0;i<4;i++){
        const ww=(i*6+Math.floor(tick/550)+x*3)%15;
        pix(sx+ww,sy+i*4+1,6,1,'#5fb4c3');pix(sx+ww+1,sy+i*4+2,3,1,'#9bd8ce');
      }return;
    }
    drawBaseGround(sx,sy,x,y);
    const v=hash(x,y,3);
    if(tile===1){
      if(v>.91){pix(sx+2,sy+11,13,3,'#455e60');pix(sx+2,sy+7,12,6,'#779498');pix(sx+3,sy+5,10,4,'#b5b8aa');pix(sx+4,sy+6,8,1,'#e5d3ac');pix(sx+8,sy+10,4,2,'#486c6f');}
      else drawPine(sx,sy,v);
    }else if(tile===2){
      for(let i=1;i<16;i+=3){const sway=Math.sin(tick*.003+x+i)>0?1:0;
        pix(sx+i,sy+9,2,7,'#32644d');pix(sx+i+sway,sy+5,1,9,'#468b66');
        pix(sx+i+sway-1,sy+2+i%3,3,4,'#78b98b');pix(sx+i+sway,sy+2+i%3,1,2,'#b0d4a1');
      }
    }else if(tile===6){
      pix(sx+2,sy+12,12,3,'#51636b');pix(sx+4,sy+8,9,6,'#c0b49c');
      pix(sx+6,sy+3,5,9,'#4b94ae');pix(sx+7,sy+4,3,7,'#c9fbde');
      pix(sx+8,sy+1,1,2,tick%700<350?'#ffffd2':'#bdfaf6');
    }else if(tile===7){
      pix(sx+2,sy+11,12,3,'#4f453b');pix(sx+3,sy+6,10,6,'#a47752');
      pix(sx+4,sy+7,8,2,'#eac08d');pix(sx+4,sy+14,2,2,'#483c34');pix(sx+11,sy+14,2,2,'#483c34');
      if(!gameState.hasStarter){pix(sx+6,sy+1,5,7,'#283e52');pix(sx+7,sy+2,3,5,'#b5e5ce');pix(sx+8,sy-1,1,3,'#fff3ad');}
    }
  }
  function drawCottage(sx,sy,tick){
    // Coordinated 80x65 structure with gable, 1px roof tiles, timberwork, garden boxes.
    pix(sx-6,sy+27,94,35,'#435b4d');
    pix(sx-4,sy+23,88,37,'#b68961');
    pix(sx-2,sy+26,84,33,'#e5c89d');
    for(let k=0;k<90;k+=9){pix(sx-2+k,sy+27,1,32,'#c9ae83');}
    for(let k=0;k<50;k+=9){pix(sx,sy+31+k/9*4,80,1,'#d6b58a');}
    // exposed timber frame
    for(const x of [0,17,62,79]){pix(sx+x,sy+26,3,33,'#7d5142');pix(sx+x+1,sy+27,1,32,'#c18b61');}
    pix(sx-3,sy+55,86,5,'#6c6255');pix(sx-2,sy+56,84,2,'#f3d49e');
    // imposing peaked blue-violet roof, layered shingles
    pix(sx-7,sy+19,94,9,'#273d57');pix(sx-5,sy+20,90,7,'#325e75');
    for(let row=0;row<5;row++){
      const py=sy-15+row*8,margin=23-row*5;
      pix(sx+margin-2,py+1,84-margin*2+4,9,'#273951');
      pix(sx+margin,py,80-margin*2,8,row%2?'#3a6c84':'#427e96');
      for(let col=margin;col<80-margin;col+=8){
        const px=sx+col+(row%2?3:0);pix(px,py+2,6,1,'#75aec0');pix(px+2,py+5,5,1,'#214f68');
        pix(px+1,py+7,3,1,'#a3bdba');
      }
    }
    pix(sx+36,sy-20,8,5,'#2c526a');pix(sx+38,sy-19,4,2,'#8dc1c1');
    pix(sx+61,sy-22,11,17,'#715449');pix(sx+62,sy-24,9,4,'#ae7761');pix(sx+65,sy-25,3,1,'#f2d9ba');
    // roof dormer and windows
    pix(sx+30,sy+1,20,21,'#344d65');pix(sx+33,sy+5,14,16,'#e8c590');
    pix(sx+34,sy+8,12,12,'#547f91');pix(sx+35,sy+9,10,10,'#a9d6cb');
    pix(sx+39,sy+8,2,12,'#674b49');pix(sx+34,sy+14,12,2,'#674b49');
    pix(sx+27,sy+2,26,4,'#243d57');
    // entrance door centered exactly on x5,y4; visible steps at player's feet
    pix(sx+30,sy+40,21,21,'#4b3f46');pix(sx+33,sy+42,15,18,'#8d604e');pix(sx+35,sy+44,11,16,'#a16e51');
    pix(sx+44,sy+51,2,2,'#f1da91');pix(sx+30,sy+58,21,2,'#cba073');
    for(const wx of [7,64]){
      pix(sx+wx,sy+35,13,15,'#684e46');pix(sx+wx+2,sy+37,9,11,'#5b8f9a');
      pix(sx+wx+2,sy+37,9,4,'#b9e5ce');pix(sx+wx+6,sy+37,1,11,'#e9dcb7');
      pix(sx+wx+2,sy+43,9,1,'#e9dcb7');pix(sx+wx-1,sy+49,15,3,'#684d3e');
      for(let a=0;a<4;a++){pix(sx+wx+a*3,sy+47-a%2,3,3,a%2?'#d27d91':'#f1c077');}
    }
    // hanging lantern and gentle gold glow
    pix(sx+25,sy+37,5,9,'#4b433e');pix(sx+26,sy+39,3,6,tick%1000<500?'#ffe2a0':'#f7b864');
    pix(sx+24,sy+46,8,1,'#916748');
    // ivy trails and flower boxes around walls
    for(const [dx,dy] of [[1,26],[2,29],[3,33],[78,28],[77,32],[76,37],[72,53],[4,50]]){
      pix(sx+dx,sy+dy,3,3,'#326f5b');pix(sx+dx+1,sy+dy,2,1,'#81ad71');
    }
    pix(sx-6,sy+58,90,3,'#524b43');
  }
  function gardenDecor(camX,camY,tick){
    // Cobble path curves naturally from the front door into the berry garden.
    const stones=[[5,5],[5,6],[5,7],[5,8],[5,9],[6,9],[7,9],[8,9],[7,8],[6,8],[4,8],[4,9],[4,10],[5,10],[6,10]];
    for(const [x,y] of stones){if(worldMap[y]?.[x]!==0)continue;drawCobbles(x*16-camX,y*16-camY,x,y);}
    // short orchard fence with warm posts, visible behind entities
    for(let x=2;x<=9;x++){
      if(x===5||x===6)continue;
      const sx=x*16-camX,sy=8*16-camY;
      pix(sx+1,sy+7,15,2,'#62493c');pix(sx+2,sy+11,15,2,'#c49864');
      pix(sx+1,sy+3,4,12,'#6f533b');pix(sx+2,sy+2,2,13,'#e0b678');
    }
    // clustered herb pots, mushrooms, fallen petals, lanterns
    for(const [x,y] of [[2,5],[8,6],[9,7],[3,10],[7,6],[9,3]]){
      let xx=x*16-camX,yy=y*16-camY; if(worldMap[y]?.[x]!==0)continue;
      pix(xx+1,yy+10,14,3,'#466f4c');pix(xx+3,yy+7,10,5,'#367a54');
      pix(xx+5,yy+3,6,6,'#5a9e62');pix(xx+7,yy+2,3,3,'#9ac86f');
      drawFlower(xx+4,yy+7,(x+y)%4);drawFlower(xx+10,yy+5,(x*2+y)%4);
    }
    for(const [x,y] of [[2,7],[9,8]]){
      const sx=x*16-camX,sy=y*16-camY;
      pix(sx+6,sy+8,3,8,'#665846');pix(sx+4,sy+5,7,4,'#273e45');
      pix(sx+5,sy+6,5,4,'#f4c47a');pix(sx+6,sy+6,3,2,'#fff0aa');
    }
  }

    // 16x22 adventurer with shading, unique NPC costumes, proper two-leg cycle
  // All human characters use the same hand-pixelled 12-frame renderer.
  function drawChar16(sx,sy,color,step=0,role='player',dir='down'){
    if(role==='player' && gbCampaign?.drawPlayer(ctx,sx,sy,dir,step,performance.now()))return;
    if(!window.EchoCharacters)throw Error('Character sprite module missing');
    window.EchoCharacters.draw(ctx,sx,sy,role,dir,step,color);
  }
  function drawObject(n,x,y,tick){
    const bob=Math.sin(tick*.005+n.x)*1;
    if(n.id.startsWith('diary')){
      pix(x+3,y+7,12,7,'#4b473d');pix(x+4,y+6,10,7,'#e1c78b');pix(x+5,y+7,8,5,'#f6e3b1');
      pix(x+7,y+8,5,1,'#906e55');pix(x+7,y+10,4,1,'#906e55');
      pix(x+12,y+4+bob,2,2,'#ffedbb');
    }else if(n.id==='musicbox'){
      pix(x+3,y+8,12,7,'#364c64');pix(x+4,y+7,10,7,'#be8c64');
      pix(x+6,y+9,6,3,'#e4cfa5');pix(x+7,y+4+bob,3,3,'#fff0ad');
      pix(x+11,y+3+bob,1,1,'#fbf5d7');
    }
  }
  // Alle 150 Geisterbilder sind in dieser HTML-Datei eingebettet. Kein Download von Extra-Dateien nötig.
  const monsterAtlas = new Image();
  let monsterAtlasReady = false;
  const monsterCanvasCache = Object.create(null);
  monsterAtlas.onload = () => { monsterAtlasReady = true; Object.keys(monsterCanvasCache).forEach(k=>delete monsterCanvasCache[k]); };
  monsterAtlas.onerror = () => { console.warn('Monster-Atlas konnte nicht geladen werden.'); };
  monsterAtlas.src = window.ECHO_ATLAS_DATA;
  function getMonsterSprite(id,size=32){
    if(!id || id<1 || id>150)return null;
    const sizePx = size===16 ? 32 : 64;
    const key=id+'-'+sizePx;
    if(monsterCanvasCache[key])return monsterCanvasCache[key];
    const canvasSprite=document.createElement('canvas');
    canvasSprite.width=sizePx;canvasSprite.height=sizePx;
    const p=canvasSprite.getContext('2d');
    if(monsterAtlasReady){
      p.imageSmoothingEnabled=true;p.imageSmoothingQuality='high';
      const i=id-1,sx=(i%10)*128,sy=Math.floor(i/10)*128;
      p.drawImage(monsterAtlas,sx,sy,128,128,0,0,sizePx,sizePx);
      monsterCanvasCache[key]=canvasSprite;
    }else{
      // Sofort darstellbarer Platzhalter, nur während das eingebettete Bild geladen wird.
      p.fillStyle='#d5f5f0';p.beginPath();p.arc(sizePx/2,sizePx/2,sizePx*.36,Math.PI,Math.PI*2);p.lineTo(sizePx*.75,sizePx*.85);p.lineTo(sizePx*.55,sizePx*.73);p.lineTo(sizePx*.3,sizePx*.85);p.closePath();p.fill();
      p.fillStyle='#42556e';p.fillRect(sizePx*.38,sizePx*.43,sizePx*.06,sizePx*.08);p.fillRect(sizePx*.58,sizePx*.43,sizePx*.06,sizePx*.08);
    }
    return canvasSprite;
  }


  // Hinteransichten für die drei echten Entwicklungsfamilien (8 Einzelwesen).
  // Für andere Monster ist die Vorderansicht eine offen dokumentierte Übergangslösung.
  const BACK_SPRITE_URLS = window.ECHO_BACK_URLS;
  const backSpriteImages = Object.create(null);
  for (const [id, src] of Object.entries(BACK_SPRITE_URLS)) {
    const img = new Image();
    img.src = src;
    backSpriteImages[id] = img;
  }
  function getMonsterBackSprite(id) {
    const imported = window.EchoBackArt?.getSprite(id);
    if (imported) return imported;
    const back = backSpriteImages[String(id)];
    if(back && back.complete && back.naturalWidth>0) return back;
    return getMonsterSprite(id,32);
  }

  // Canvas is 320×180, world origin at CX/CY, gives true wide-screen playfield.
  function renderRegion(tick){
     const map=window.EchoMaps?.get(gameState.currentMapId);
     if(!map){renderOverworld(tick);return;}
     const px=gameState.player.x,py=gameState.player.y;
     const camX=Math.max(0,Math.min(px*16-CX,map.width*16-PW));
     const camY=Math.max(0,Math.min(py*16-CY,map.height*16-PH));
     const industrial=gameState.currentMapId.startsWith('pumpworks_') ||
       (window.EchoChapter4?.names[gameState.currentMapId] && gameState.currentMapId!=='moorglas_bog');
     const bog=gameState.currentMapId==='moorglas_bog';
     pix(0,0,PW,PH,industrial?'#415d66':'#7aa596');
     for(let y=0;y<map.height;y++)for(let x=0;x<map.width;x++){
       const sx=x*16-camX,sy=y*16-camY;
       if(sx<-17||sy<-17||sx>PW||sy>PH)continue;
       const tile=map.tiles[y][x];
       if(gbCampaign?.drawGrass(ctx,map.mapId,x,y,sx,sy,tick) ||
          gbCampaign?.drawTile(ctx,map,x,y,sx,sy,tick))continue;
       if(window.EchoPostgame?.names[gameState.currentMapId]){
          window.EchoPostgame.drawTile(pix,tile,sx,sy,x,y,tick,gameState.currentMapId);
          continue;
        }
       if(window.EchoFinale?.names[gameState.currentMapId]){
          window.EchoFinale.drawTile(pix,tile,sx,sy,x,y,tick,gameState.currentMapId);
          continue;
        }
        if(window.EchoEndgame?.names[gameState.currentMapId]){
         window.EchoEndgame.drawTile(pix,tile,sx,sy,x,y,tick,gameState.currentMapId);
         continue;
       }
       if(window.EchoStoryRegions?.names[gameState.currentMapId]){
         window.EchoStoryRegions.drawTile(pix,tile,sx,sy,x,y,tick,gameState.currentMapId);
         continue;
       }
       if(window.EchoChapter5?.names[gameState.currentMapId]){
         window.EchoChapter5.drawTile(pix,tile,sx,sy,x,y,tick,gameState.currentMapId);
         continue;
       }
       if(bog){
         if(tile===1||tile===5){
           pix(sx,sy,16,16,'#233f48');
           pix(sx+2,sy+3,12,11,'#416856');
           pix(sx+4,sy,9,9,'#618468');
           pix(sx+6,sy+2,3,5,'#b1bb7e');
         }else if(tile===4){
           pix(sx,sy,16,16,'#286374');
           pix(sx+2,sy+3+Math.sin(tick*.002+x)*2,10,2,'#528f9c');
           pix(sx+5,sy+10,8,1,'#82b8a9');
           if((x*7+y*3)%5===0)pix(sx+8,sy+5,5,3,'#699b83');
         }else{
           pix(sx,sy,16,16,tile===2?'#436f55':tile===3?'#6d8270':'#527a63');
           pix(sx,sy,16,2,'#688f74');
           pix(sx+2+(x%3),sy+5,3,2,'#83a37c');
           pix(sx+9,sy+12,5,1,'#315f56');
           if(tile===2){
             pix(sx+4,sy+2,3,9,'#316f4c');
             pix(sx+9,sy+4,3,8,'#89b47d');
           }
         }
         continue;
       }
       if(!industrial){drawTile16(tile,sx,sy,tick,x,y);continue;}
       if(tile===4){
         pix(sx,sy,16,16,'#3b708b');
         pix(sx+2,sy+3,11,2,'#72b4c1');
         pix(sx+5+Math.sin(tick*.003+x+y)*2,sy+10,8,1,'#a3d1cf');
       }else if(tile===1||tile===5){
         pix(sx,sy,16,16,'#2b4753');
         pix(sx+1,sy+1,14,14,'#506e75');
         pix(sx+2,sy+2,12,4,'#688b91');
         pix(sx+3,sy+9,10,3,'#34515e');
         pix(sx+2,sy+2,2,2,'#cfb87f');
         pix(sx+12,sy+12,2,2,'#cfb87f');
       }else{
         pix(sx,sy,16,16,(x+y)%2?'#829797':'#778d90');
         pix(sx,sy,16,1,'#a1aeaa');
         pix(sx,sy,1,16,'#5b777c');
         pix(sx+13,sy+3,2,2,'#c8c2a7');
         pix(sx+3,sy+13,2,2,'#5a6f74');
       }
     }
     const painter=window.EchoPostgame?.names[gameState.currentMapId] ? window.EchoPostgame :
          window.EchoFinale?.names[gameState.currentMapId] ? window.EchoFinale :
        window.EchoEndgame?.names[gameState.currentMapId] ? window.EchoEndgame :
       window.EchoStoryRegions?.names[gameState.currentMapId] ? window.EchoStoryRegions :
        window.EchoChapter5?.names[gameState.currentMapId] ? window.EchoChapter5 :
        window.EchoChapter4?.names[gameState.currentMapId] ? window.EchoChapter4 : window.EchoChapter3;
     painter.draw(ctx,tick,gameState,camX,camY,pix,fText,drawChar16);
      window.EchoSOULS?.renderProps(gameState.currentMapId,camX,camY,pix);
     // Decorative homes in the newly expanded districts. Drawn from the
     // very same 3x3 impassable tile footprints, so artwork and collision
     // never drift apart, including on mobile and the clean-map exports.
     for(const [i,house] of (map.worldLayout?.houses||[]).entries()){
       const x=house.x*16-camX,y=house.y*16-camY;
       if(x<-60||x>PW+20||y<-60||y>PH+20)continue;
       const roofs=['#a76b60','#5c8090','#7c986b','#a58b72'];
       const roof=roofs[(i+gameState.currentMapId.length)%roofs.length];
       pix(x-3,y+11,54,35,'#b29d81');
       pix(x,y+13,48,30,'#e2cfac');
       pix(x-5,y-3,58,19,'#354a55');
       pix(x-3,y,54,13,roof);
       pix(x+5,y+20,10,10,'#658e98');
       pix(x+33,y+20,10,10,'#658e98');
       pix(x+19,y+29,13,17,'#564a42');
       pix(x+22,y+32,7,14,'#a78764');
       pix(x+26,y+38,2,2,'#f0d9a7');
       pix(x-1,y+44,50,3,'#90785a');
     }
     if(gameState.hasStarter&&gameState.team.length){
       const companion=getMonsterSprite(gameState.team[0].id,16);
       ctx.drawImage(companion,px*16-camX+13,py*16-camY-11+Math.sin(tick*.005)*2,18,18);
     }
     drawChar16(px*16-camX,py*16-camY,'#e06e59',gameState.player.stepPhase,'player',gameState.player.dir);
      if(!gbCampaign?.drawGrassFront(ctx,map.mapId,px,py,px*16-camX,py*16-camY,tick)){
        window.EchoSOULS?.foreground(gameState.currentMapId,map.tiles,px,py,camX,camY,pix);
      }
   }
   function renderOverworld(tick){
    pix(0,0,PW,PH,'#80b985');
    const px=gameState.player.x,py=gameState.player.y;
    const camX=px*16-CX, camY=py*16-CY;
    const map=window.EchoMaps?.get('legacy_wurzeldorf');
    for(let y=0;y<MAP_H;y++)for(let x=0;x<MAP_W;x++){
      let sx=x*16-camX,sy=y*16-camY;
      if(sx<-17||sy<-17||sx>PW||sy>PH)continue;
      if(map && (gbCampaign?.drawGrass(ctx,map.mapId,x,y,sx,sy,tick) ||
         gbCampaign?.drawTile(ctx,map,x,y,sx,sy,tick)))continue;
      drawTile16(worldMap[y][x],sx,sy,tick,x,y);
    }
    // high-resolution handcrafted cottage + paths + village details
    // Original straight fence/path decoration replaced by Wurzelheim 2.0.
    const homeX=3*16-camX,homeY=2*16-camY;
    drawCottage(homeX,homeY,tick);
    if(window.EchoVillage)window.EchoVillage.draw(ctx,camX,camY,tick,pix);
     window.EchoSOULS?.renderProps("legacy_wurzeldorf",camX,camY,pix);
    if(!gameState.runeFinds?.mist){
      const x=16*16-camX,y=10*16-camY;
      if(x>=-10&&x<=PW&&y>=-10&&y<=PH){
        pix(x+6,y+4,5,7,Math.sin(tick*.012)>0?'#fff4b4':'#adccff');
        pix(x+8,y+1,2,3,'#e6fbff');
      }
    }
    if(window.EchoRoute)window.EchoRoute.draw(ctx,tick,gameState,camX,camY,pix);
    if(window.EchoExplore)window.EchoExplore.drawWorld(ctx,tick,gameState,camX,camY,pix);
    if(window.EchoPlatformer)window.EchoPlatformer.drawPortal(ctx,tick,gameState,camX,camY,pix);
    if(window.EchoRuins)window.EchoRuins.drawEntrance(ctx,tick,gameState,camX,camY,pix);
     // New north-shore passage remains visible even while locked.
     const gx=24*16-camX,gy=9*16-camY;
     if(gx>-17&&gx<PW&&gy>-17&&gy<PH){
       pix(gx+2,gy,12,15,'#365969');pix(gx+4,gy+2,8,12,
         gameState.ruinsProgress?.bossWon?'#f2c789':'#82999c');
       pix(gx+6,gy+4,4,5,'#fff4c9');
     }
    
      // Berry bushes around yard, placed at stable coordinate hashes
    for(let x=1;x<11;x++)for(let y=5;y<11;y++){
      if(worldMap[y][x]!==0||hash(x,y,34)<.91)continue;
      let u=x*16-camX,v=y*16-camY;
      if(u<0||u>PW-16||v<0||v>PH)continue;
      pix(u+3,v+9,11,5,'#3c8562');pix(u+6,v+5,7,7,'#5d9d69');
      pix(u+6,v+10,2,2,'#de7770');pix(u+11,v+8,2,2,'#df7f7c');
    }
    npcs.forEach(n=>{
      if(n.id==='oma')return; // Oma wartet im Haus.
      let sx=n.x*16-camX,sy=n.y*16-camY;
      if(sx<-16||sy<-20||sx>PW||sy>PH)return;
      if(n.isObject)drawObject(n,sx,sy,tick);
      else drawChar16(sx,sy,n.color,0,n.id==='oma'?'oma':n.id,n.id==='oma'?'down':'left');
    });
    // a companion hovers immediately behind player, out of overlap
    if(gameState.hasStarter&&gameState.team.length){
      const offset={up:[-16,0],down:[16,-6],left:[10,-14],right:[-11,9]}[gameState.player.dir]||[16,-6];
      const spr=getMonsterSprite(gameState.team[0].id,16),wave=Math.sin(tick*.007)*2;
      ctx.drawImage(spr,CX+offset[0],CY+offset[1]+wave,18,18);
      pix(CX+offset[0]+5,CY+offset[1]+16,8,1,'#529c83');
    }
    drawChar16(CX,CY,'#e06e59',gameState.player.stepPhase,'player',gameState.player.dir);
    if(!gbCampaign?.drawGrassFront(ctx,'legacy_wurzeldorf',px,py,CX,CY,tick)){
      window.EchoSOULS?.foreground('legacy_wurzeldorf',worldMap,px,py,camX,camY,pix);
    }
    if(Math.sin(tick/25000)>0.65){
      pix(0,0,PW,PH,'#243c5240');
      fireflies.forEach((f,i)=>{
        let x=(f.x*1.33+Math.sin(tick*.001+i)*9+PW)%PW,y=(f.y*1.2+Math.sin(tick*.0017+i)*6+PH)%PH;
        pix(x,y,2,2,i%2?'#ffecb5':'#d4fff1');
      });
    }
    // Tiny unobtrusive HUD, leaving the village visible.
    pix(5,5,127,18,'#25484ddc');pix(7,7,123,14,'#f0dca8');
    fText('✦ ECHO-CHRONIKEN',11,18,10,'#2a5253');
    pix(234,5,80,18,'#25484ddc');pix(236,7,76,14,'#f0dca8');
    fText(`${gameState.badges}/3  ✧${Object.keys(gameState.caughtIds).length}/150`,242,18,9,'#355f56');
    if(!gameState.hasStarter){pix(72,157,176,18,'#244d4acc');fText('✦ Geh zu Oma ins Haus',79,170,10,'#fff0c6');}
    if(window.EchoRoute && gameState.hasStarter){
      const route=window.EchoRoute.quest(gameState);
      if(!route.accepted && gameState.introStage>=4){
        pix(65,157,192,18,'#244d4acc');fText('✦ Suche Liora am Südpfad',72,170,9,'#fff0c6');
      }
      if(route.accepted){
        pix(132,5,99,18,'#25484ddc');pix(134,7,95,14,'#e7d7ae');
        const routeLabel=route.guardianWon?'PFAD: GESCHAFFT':route.rewarded?'WALDHÜTER: PIKO':'SEELENLICHT '+route.lights.length+'/3';
        fText(routeLabel,139,18,8,'#355c56');
      }
    }
  }
  
    function hpbar(x,y,w,v,color='#70ad69'){
    pix(x,y,w,8,'#283b45');pix(x+1,y+1,w-2,6,'#8d8272');
    pix(x+2,y+2,Math.max(0,Math.round((w-4)*Math.max(0,Math.min(1,v)))),4,v<=.30?'#d95050':v<=.60?'#dfb23e':color);
    pix(x+3,y+2,Math.max(0,Math.round((w-4)*Math.max(0,Math.min(1,v)))-3),1,'#f1edb8');
  }
  function drawTypeBadges(x,y,creature,size=13){
    const types=AFF.typesFor(creature);
    types.forEach((type,index)=>{
      const info=AFF.INFO[type];
      const px=x+index*(size+2);
      ctx.fillStyle='#26383c';ctx.fillRect(px,y,size+2,size+2);
      ctx.fillStyle=info.color;ctx.fillRect(px+1,y+1,size,size);
      fText(info.symbol,px+size/2+1,y+size-1,Math.max(9,size-2),'#fff8df','center');
    });
  }
  function effectivenessText(user,move,enemy){
    if(!move||move.heal)return 'HEILUNG';
    const e=AFF.effectiveness(move.type,enemy);
    const stab=AFF.stab(move.type,user);
    return (e>1.05?'STARK':e<.95?'SCHWACH':'NEUTRAL')+
      ' x'+(Math.round(e*stab*100)/100).toFixed(2);
  }
  function renderTeamSelect(){
    const b=gameState.battle;if(!b)return;
    pix(0,0,PW,PH,'#213b4299');
    boxArt(8,7,304,168,'#ede0c5','#2b5459','#fdf4de');
    fText('GEISTER WECHSELN',160,25,14,'#294d51','center');
    fText('HP · ELEMENTE · BESTE ATTACKE',160,37,8,'#607967','center');
    const selected=gameState.teamCursor||0;
    for(let i=0;i<Math.min(6,gameState.team.length);i++){
      const m=gameState.team[i],sp=SPECIES[m.id-1],y=55+i*18;
      ensureMonsterMoves(m);
      const chosen=i===selected;
      pix(15,y-12,291,17,chosen?'#8fb6a4':i%2?'#f8efda':'#ebe6d2');
      const label=(chosen?'▶ ':' ')+(i===0?'★ ':'')+sp.name;
      fText(label,20,y,sp.name.length>15?8:9,chosen?'#173f45':'#43645d');
      drawTypeBadges(161,y-11,m,12);
      const best=Math.max(...battleMoves(m).map(id=>AFF.effectiveness(ATTACKS[id]?.type||'NORMAL',b.enemy)));
      fText(m.hp>0?'x'+best.toFixed(1):'K.O.',243,y,8,m.hp>0?'#2d6750':'#a14a4a','right');
      fText(m.hp+'/'+m.maxHp,300,y,8,'#31554f','right');
    }
    fText('A WECHSELN   B ZURUECK   ↑↓',160,169,9,'#365e59','center');
  }
  function renderEquipment(){
    pix(0,0,PW,PH,'#163b4199');
    boxArt(7,6,306,168,'#e9dcbf','#345458','#fff1d4');
    const m=gameState.team[gameState.runeTeamCursor||0];
    fText('AUSRUESTUNG',160,23,15,'#304f52','center');
    if(!m){fText('Kein Wesen im Team.',20,60,10,'#344f4b');return;}
    const eq=ensureEquipment(m);
    const pack=eq.find(x=>x.id==='rucksack');
    const pieces=eq.map(x=>x.id==='rucksack'?'Rucksack['+(x.contents||[]).length+'/'+BAG_CAPACITY+']':
      GEAR_ITEMS.find(g=>g.id===x.id)?.name||x.id);
    if(m.heldSupportRune==='ep_teiler')pieces.unshift('EP-Rune');
    fText(SPECIES[m.id-1].name+' Lv.'+m.lv+'  SLOT '+occupiedSlots(m)+'/'+gearLimit(m),17,39,9,'#315750');
    fText((pieces.join(' / ')||'leer').slice(0,45),17,53,8,'#526956');
    const selected=Math.min(gameState.gearCursor||0,GEAR_ITEMS.length-1);
    const first=Math.max(0,Math.min(selected-4,GEAR_ITEMS.length-5));
    for(let row=0;row<5;row++){
      const i=first+row,item=GEAR_ITEMS[i],y=70+row*18;
      if(i===selected)pix(15,y-11,290,16,'#a6c9b0');
      const worn=eq.some(x=>x.id===item.id)||(pack?.contents||[]).includes(item.id);
      fText((i===selected?'▶ ':' ')+item.name,22,y,10,'#345850');
      fText(worn?'AN':'x'+inventoryCount(item.id),300,y,8,worn?'#256f4b':'#536962','right');
    }
    const info=GEAR_ITEMS[selected]?.id;
    fText(info==='rune_kraft'?'+12% Schaden':
      info==='rune_schutz'?'-12% erhaltener Schaden':
      info==='rune_nebel'?'+7% Kraft & -7% Schaden':
      info==='rune_ahnen'?'Heilt 3% HP nach Treffern':
      '↑↓ ITEM  ←→ WESEN  A AN/AUS  B ZUR.',160,165,8,'#49685e','center');
  }
  function renderRuneShop(){
    pix(0,0,PW,PH,'#193e4099');
    boxArt(9,6,302,168,'#f3e3bc','#345558','#fff0cc');
    fText('DORFLADEN - RUNEN',160,24,14,'#2e4e4e','center');
    fText('Echo-Muenzen: '+(gameState.coins||0),20,40,10,'#365f52');
    for(let i=0;i<SHOP_ITEMS.length;i++){
      const item=SHOP_ITEMS[i],y=54+i*14;
      const selected=i===gameState.shopCursor;
      if(selected){pix(15,y-10,289,14,'#b3d0ab');pix(15,y-10,3,14,'#3c6b55');}
      const sold=item.unique&&gameState.shopBought[item.id];
      fText((selected?'▶ ':' ')+item.name,20,y,9,'#35584d');
      fText(sold?'AUS':item.price+' M',299,y,9,sold?'#996b63':'#566c56','right');
    }
    fText('A KAUFEN   B VERLASSEN',160,165,8,'#426959','center');
  }
  function renderRuneBook(){
    pix(0,0,PW,PH,'#153b4799');
    boxArt(7,6,306,168,'#e9dcbf','#345458','#fff1d4');
    const m=gameState.team[gameState.runeTeamCursor||0];
    fText('RUNENLEHRE',160,23,15,'#304f52','center');
    if(m){
      drawTypeBadges(17,30,m,13);
      fText(SPECIES[m.id-1].name+'  Lv.'+m.lv,65,40,10,'#2c5555');
      fText('Runen '+(m.runeMoves?.length||0)+'/2',297,40,9,'#446d5f','right');
    }
    const items=availableRunes();
    if(!items.length)fText('Gewinne besondere Kämpfe für Runen.',16,81,10,'#556e5e');
    const cursor=Math.min(gameState.runeCursor||0,Math.max(0,items.length-1));
    const first=Math.max(0,Math.min(cursor-3,Math.max(0,items.length-6)));
    for(let row=0;row<6&&first+row<items.length;row++){
      const item=items[first+row],i=first+row,y=60+row*16;
      if(i===cursor)pix(15,y-11,290,16,'#a6c9b0');
      if(item.kind==='support'){
        fText((i===cursor?'▶ ':' ')+'EP-TEILER',23,y,10,'#36564e');
        fText(m?.heldSupportRune==='ep_teiler'?'AKTIV':'ANLEGEN',281,y,8,'#256f4b','right');
        fText('∞',301,y,9,'#536962','right');
        continue;
      }
      drawTypeBadges(19,y-10,{affinities:[AFF.normalize(ATTACKS[item.id].type)]},11);
      fText((i===cursor?'▶ ':' ')+ATTACKS[item.id].name,37,y,10,'#36564e');
      const fits=m && AFF.compatible(m,ATTACKS[item.id].type)&&
        !m.moves.includes(item.id)&&(m.runeMoves?.length||0)<MAX_RUNE_MOVES;
      fText(fits?'LERNSBAR':'GESPERRT',281,y,8,fits?'#256f4b':'#8f6663','right');
      fText('x'+gameState.runes[item.id],301,y,8,'#536962','right');
    }
    fText('R: AUSRUESTUNG  ←→ GEIST  A RUNE  B ZUR.',160,169,7,'#49685e','center');
    fText('R >',285,23,8,'#326656');
  }
  function renderBattle(tick){
    const b=gameState.battle;if(!b)return;
    const ally=getActiveAlly();if(!ally)return;
    const enemy=b.enemy;const allySp=SPECIES[ally.id-1],enemySp=SPECIES[enemy.id-1];
    if(b.ruinBoss){
      pix(0,0,PW,118,'#24262b');
      pix(0,79,PW,39,'#777a7b');
      for(let x=8;x<PW;x+=48){
        pix(x,19,14,59,'#56595c');pix(x+2,21,3,53,'#777a7b');
        pix(x-2,17,18,4,'#777a7b');pix(x-2,76,18,4,'#c7c8c4');
      }
      for(let y=86;y<118;y+=9){
        pix(0,y,PW,1,'#56595c');
        for(let x=(y%2)*12;x<PW;x+=27)pix(x,y,1,8,'#56595c');
      }
    }else{
      pix(0,0,PW,118,'#f4f4ef');
      pix(0,66,PW,52,'#c7c8c4');
      for(let i=0;i<26;i++){
        const x=i*13-6,h=14+Math.floor(hash(i,12)*26);
        const shade=i%3===0?'#777a7b':'#a0a3a0';
        pix(x+4,67-h,5,h,shade);
        pix(x+2,72-h,9,h-4,shade);
        pix(x,77-h,13,h-9,shade);
        pix(x+5,66,3,8,'#777a7b');
      }
      pix(0,85,PW,33,'#dedfda');
      for(let i=0;i<32;i++){
        const x=i*11+Math.floor(hash(i,92)*7),y=87+Math.floor(hash(i,12)*27);
        pix(x,y,1,3,'#777a7b');pix(x+1,y+2,2,1,'#a0a3a0');
      }
    }
    ellipseBattle(245,100,58,12,'#c7c8c4','#777a7b');
    ellipseBattle(79,108,70,14,'#c7c8c4','#777a7b');
    const bounce=Math.sin(tick*.005)*2;
    const hurt=b.animTimer>0;
    if(hurt)b.animTimer--;
    const shake=hurt && b.animTimer%2===0?3:0;
    ctx.save();ctx.imageSmoothingEnabled=true;
    // Enemy: FRONT VIEW, right / Player: TRUE REAR VIEW, left.
    if(b.ruinBoss&&window.EchoRuins)
      window.EchoRuins.drawBoss(ctx,tick,199+(b.fxTarget==='enemy'?shake:0),21,(x,y,w,h,c)=>pix(x,y,w,h,c));
    else ctx.drawImage(getMonsterSprite(enemy.id,32),192+(b.fxTarget==='enemy'?shake:0),12+bounce,109,96);
    ctx.drawImage(getMonsterBackSprite(ally.id),22+(b.fxTarget==='ally'?shake:0),32-bounce,111,90);
    ctx.restore();
    if(hurt && window.EchoCombatFX)window.EchoCombatFX.draw(ctx,b,tick);
    // Gegner-Leiste oben links
    boxArt(5,5,143,35,'#f8efd6','#365456','#fff9e7');
    fText(b.enemyDisplayName||enemySp.name,12,18,10,'#263f43');
    fText('Lv.'+enemy.lv,123,18,9,'#486e60','right');
    drawTypeBadges(9,25,enemy,11);hpbar(41,26,99,enemy.hp/enemy.maxHp,'#69ad68');
    const enemyStatus=STATUS.labels(b,enemy);
    if(enemyStatus){
      pix(143,20,Math.min(90,enemyStatus.length*5+8),13,'#f5e5c8');
      fText(enemyStatus,147,30,7,'#733e37');
    }
    // Eigene Leiste rechts unten; mit genauen HP
    boxArt(176,79,140,38,'#f8efd6','#365456','#fff9e7');
    fText(allySp.name,182,91,9,'#263f43');
    fText('Lv.'+ally.lv,309,91,8,'#456459','right');
    hpbar(184,96,123,ally.hp/ally.maxHp,'#72b477');
    drawTypeBadges(182,105,ally,11);
    const allyStatus=STATUS.labels(b,ally);
    if(allyStatus){
      pix(175,65,Math.min(90,allyStatus.length*5+8),13,'#f5e5c8');
      fText(allyStatus,179,75,7,'#713b44');
    }
    fText(`${ally.hp}/${ally.maxHp} HP`,305,112,8,'#456459','right');
    // Klassische Game-Boy-Kampfleiste: Text links und die 4 Tasten rechts.
    pix(0,117,320,63,'#294346');pix(3,120,314,57,'#fff2ce');
    pix(5,122,155,53,'#304750');pix(8,125,150,47,'#263741');
    const lines=wrapped(b.log,145,9);
    fText(lines[0]||'',12,139,9,'#fff6dd');
    if(lines.length>1)fText(lines[1]||'',12,151,9,'#fff6dd');
    if(b.busy){fText('Bitte warten...',12,164,8,'#c5dcc8');return;}
    const opts=['KAMPF','GEIST', b.isTrainer?'TRANK':'SPHÄRE','FLUCHT'];
    for(let i=0;i<4;i++){
      const x=i%2?243:165, y=i<2?123:150;
      const active=b.cursor===i;
      pix(x,y,73,24,active?'#456b66':'#bbcbb6');
      pix(x+2,y+2,69,20,active?'#dce9bf':'#f8f4df');
      fText((active?'▶ ':'')+opts[i],x+6,y+15,9,active?'#253e3c':'#45615b');
    }
    // Bei Tastatur / Controller: Auswahl mit Steuerkreuz und A. Am Handy direkt antippen.
  }

  function renderAttackBook(tick){
    const menuOnly=gameState.attackOrigin==='OVERWORLD'||gameState.attackOrigin==='MENU';
    const b=gameState.battle,ally=menuOnly?gameState.team[gameState.attackBookTeamCursor||0]:getActiveAlly();
    if(!ally)return;
    ensureMonsterMoves(ally);
    const moves=menuOnly?ally.moves:battleMoves(ally);
    const index=Math.min(moves.length-1,menuOnly?gameState.freeAttackCursor||0:b.attackCursor||0);
    const top=menuOnly?Math.max(0,Math.min(moves.length-6,index-3)):0;
    if(menuOnly)pix(0,0,PW,PH,'#122b3699');
    boxArt(125,5,192,170,'#f8eed5','#2f5558','#fdf4d7');
    pix(129,9,184,33,'#365b5b');
    fText(menuOnly?'ATTACKENBUCH':'KAMPF-ATTACKEN',137,23,12,'#fff0c6');
    fText(menuOnly?('TEAM '+((gameState.attackBookTeamCursor||0)+1)+'/'+gameState.team.length+'  ←→  '+battleMoves(ally).length+'/4 AKTIV'):
      ('4 AKTIVE PLÄTZE  ·  Lv.'+ally.lv),137,37,8,'#d2e7d1');
    for(let row=0;row<6;row++){
      const i=top+row;if(i>=moves.length)break;
      const move=ATTACKS[moves[i]],y=47+row*18,active=i===index;
      pix(132,y,180,17,active?'#4d7676':row%2?'#e8ebd6':'#faf5e3');
      const info=AFF.INFO[AFF.normalize(move.type)];
      pix(135,y+1,3,15,info.color);
      const equipped=menuOnly&&battleMoves(ally).includes(moves[i]);
      fText((active?'▶':equipped?'●':' ')+ ' '+move.name,141,y+12,9,active?'#fff5df':'#304d50');
      fText(move.heal?'HEIL':String(move.power),287,y+12,8,active?'#f9e7b1':'#65756c','right');
      fText(info.symbol,305,y+12,10,active?'#fff6dc':info.color,'right');
    }
    if(moves.length>6)fText((top+1)+'-'+Math.min(top+6,moves.length)+'/'+moves.length,310,168,8,'#55766b','right');
    const current=ATTACKS[moves[index]];
    if(!current)return;
    pix(5,121,117,54,'#24444a');pix(8,124,111,48,'#f5e8c7');
    const info=AFF.INFO[AFF.normalize(current.type)];
    fText(info.symbol+' '+current.name,12,139,9,'#304d48');
    fText(current.heal?'HEILUNG +'+current.heal:
      (menuOnly?info.name+'  KRAFT '+current.power:effectivenessText(ally,current,b.enemy)),
      12,151,8,'#5d7768');
    const special=STATUS.rules[moves[index]];
    fText((menuOnly?'A AUSRUeSTEN':'A ANGRIFF')+(special?' / '+special.label:''),
      12,166,special?7:8,'#587064');
  }

  function ellipseBattle(x,y,rx,ry,fill,edge){
    ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,Math.PI*2);ctx.fillStyle=edge;ctx.fill();
    ctx.beginPath();ctx.ellipse(x,y-3,rx-6,ry-4,0,0,Math.PI*2);ctx.fillStyle=fill;ctx.fill();
    ctx.beginPath();ctx.ellipse(x-6,y-6,rx-20,ry-9,0,0,Math.PI*2);ctx.strokeStyle='#acd39b';ctx.lineWidth=1;ctx.stroke();
  }
  function renderDialog(){
    boxArt(6,118,308,57,'#eaddb8','#304d4e','#fff3c9');
    pix(12,123,3,45,'#a78b5e');
    const lines=(gameState.dialogQueue[0]||'').split('\n');
    for(let i=0;i<Math.min(3,lines.length);i++)fText(lines[i],21,137+i*12,10,'#314e51');
    const blink=Math.floor(performance.now()/420)%2;
    if(blink)fText('▼  A',277,168,9,'#906b4b');
  }
  // The village remains visible under the pause overlay, like classic 16-bit RPGs.
  function renderMenu(){
    pix(0,0,PW,PH,'#14273522');
    // A narrow, high-contrast right-hand panel with hand-drawn pixel borders.
    pix(195,7,120,163,'#263943');
    pix(198,10,114,157,'#ead9ac');
    pix(201,13,108,151,'#fff0c8');
    pix(200,12,2,152,'#a38d63');
    pix(307,12,2,152,'#a38d63');
    fText('ECHO-MENUE',255,27,10,'#2a4c52','center');
    pix(206,31,97,2,'#a99a70');
    for(let i=0;i<START_MENU.length;i++){
      const y=46+i*14.3,selected=i===gameState.menuCursor;
      if(selected){
        pix(205,y-10,102,13,'#afd1a9');
        pix(205,y-10,3,13,'#456f59');
      }
      fText((selected?'▶ ':'  ')+START_MENU[i].label,208,y,10,
        selected?'#244c3c':'#4c594c');
    }
    fText('START/B: ZU',255,162,7,'#587166','center');
  }
  function renderTeamOverview(){
    pix(0,0,PW,PH,'#163b4199');
    boxArt(8,6,304,167,'#f0e3c4','#305454','#fff5d9');
    fText('DEIN TEAM',160,24,15,'#305a53','center');
    fText('A: Ausruesten   B: Zurueck',160,37,8,'#628171','center');
    if(!gameState.team.length){
      fText('Noch kein Wesen im Team.',18,75,11,'#44675d');
      return;
    }
    for(let i=0;i<Math.min(6,gameState.team.length);i++){
      const m=gameState.team[i],y=52+i*18;
      const selected=i===gameState.teamMenuCursor;
      if(selected){pix(15,y-11,291,18,'#a8cbb4');pix(15,y-11,3,18,'#416b5e');}
      fText((selected?'▶ ':' ')+SPECIES[m.id-1].name.slice(0,14),20,y,9,'#345750');
      fText('Lv.'+m.lv,179,y,9,'#4c6b57','right');
      hpbar(186,y-9,112,m.hp/Math.max(1,m.maxHp),'#70ad69');
      fText(m.hp+'/'+m.maxHp+' HP',295,y+4,7,'#476458','right');
    }
    fText('↑↓ WESEN   A AUSRUESTUNG   B ZURUECK',160,167,7,'#56796e','center');
  }
  function renderBag(){
    pix(0,0,PW,PH,'#153d4399');
    boxArt(8,6,304,167,'#f0e3c4','#305454','#fff5d9');
    fText('DEIN RUCKSACK',160,24,14,'#305a53','center');
    fText('A: Benutzen / Anlegen    B: Zurueck',160,37,8,'#628171','center');
    for(let i=0;i<BAG_MENU.length;i++){
      const item=BAG_MENU[i],id=item.id,y=51+i*15;
      const selected=i===gameState.bagCursor;
      if(selected){pix(16,y-11,287,15,'#acd1b2');pix(16,y-11,3,15,'#456c57');}
      const qty=id==='orbs'?gameState.orbs:
        id==='runes'?Object.values(gameState.runes||{}).reduce((n,v)=>n+v,0)+
          (gameState.supportRuneUnlocked?1:0):inventoryCount(id);
      fText((selected?'▶ ':' ')+item.label,21,y,10,selected?'#274e47':'#48645b');
      fText('x'+(id==='runes'?qty+
        ['rune_kraft','rune_schutz','rune_nebel','rune_ahnen'].reduce((n,r)=>n+inventoryCount(r),0):qty),
        293,y,10,'#48645b','right');
    }
    const hints=[
      'Ein Traenk heilt das Team (1 Stueck).',
      'Zum Fangen in wilden Kaempfen.',
      'Bietet 2 Extra-Plaetze fuer Items.',
      'Gegen GIFT. Einem Wesen mitgeben.',
      'Gegen SCHOCK. Einem Wesen mitgeben.',
      'Gegen BRAND. Einem Wesen mitgeben.',
      'Erlernte und passive Runen verwalten.'
    ];
    fText(hints[gameState.bagCursor]||'',160,166,8,'#546f62','center');
  }
  function renderOptions(){
    pix(0,0,PW,PH,'#153d4399');
    boxArt(9,7,302,166,'#f0e3c4','#305454','#fff5d9');
    fText('OPTIONEN',160,26,16,'#305a53','center');
    const values=[soundEnabled?'AN':'AUS',PALETTES[paletteIdx].name,'ANZEIGEN',''];
    for(let i=0;i<OPTIONS_MENU.length;i++){
      const y=57+i*25,selected=i===gameState.optionsCursor;
      if(selected){pix(19,y-13,282,21,'#acd1b2');pix(19,y-13,3,21,'#456c57');}
      fText((selected?'▶ ':' ')+OPTIONS_MENU[i],24,y,12,'#355851');
      if(values[i])fText(values[i],291,y,10,'#416b5f','right');
    }
    fText('A/←→ ANPASSEN   B ZURUECK',160,169,8,'#526f64','center');
  }
  function renderArchive(){
    pix(0,0,PW,PH,'#254c50');
    boxArt(6,6,308,168,'#eadcb7','#244943');
    fText('ECHO-ARCHIV',160,25,17,'#365b56','center');
    const stored=window.EchoArchive.ensure(gameState),n=gameState.team.length;
    const teamIndex=Math.min(gameState.archiveTeamCursor||0,Math.max(0,n-1));
    const ally=gameState.team[teamIndex];
    fText('TEAM '+(teamIndex+1)+'/'+n+'  <  >',18,47,11,'#48675b');
    fText(ally?SPECIES[ally.id-1].name+' Lv.'+ally.lv:'Kein Team',137,47,11,'#345851');
    fText('GELAGERTE ECHOS: '+stored.length,18,68,11,'#48675b');
    if(!stored.length)fText('Noch keine Echos im Archiv.',18,98,11,'#526759');
    else{
      const cursor=Math.min(gameState.archiveCursor||0,stored.length-1);
      const first=Math.max(0,Math.min(cursor-2,Math.max(0,stored.length-5)));
      for(let row=0;row<5&&first+row<stored.length;row++){
        const index=first+row,m=stored[index],y=87+row*15;
        if(index===cursor)pix(16,y-11,288,15,'#a2c4a9');
        const sp=SPECIES[m.id-1];
        fText((index===cursor?'> ':'  ')+(index+1)+'. '+(sp?.name||'Unbekannt')+
          '  Lv.'+m.lv,23,y,10,index===cursor?'#294d43':'#5b7061');
      }
    }
    fText('A: Tauschen  B: Zurueck',160,167,9,'#48675b','center');
  }
  function renderLexicon(){
    pix(0,0,PW,PH,'#315b5b');
    for(let i=0;i<20;i++){pix(i*17,0,3,PH,'#487166');pix(0,i*11,PW,1,'#2a4b4f');}
    boxArt(6,6,308,168,'#eadcb7','#244943');
    fText('✦ BESTIARIUM DER 150 SEELEN',17,24,13,'#365b56');
    const id=gameState.lexiconCursor,sp=SPECIES[id-1],seen=!!gameState.seenIds[id]||id<=3;
    pix(15,33,93,93,'#a7c1a3');pix(18,36,87,87,'#6f9d8b');
    const csp=getMonsterSprite(id,32);
    ctx.drawImage(csp,25,44,72,72);
    fText(`Nr. ${String(id).padStart(3,'0')}`,122,45,10,'#597364');
    fText(seen?sp.name:'???',122,64,sp.name.length>19?10:sp.name.length>14?12:15,'#345851');
    fText('Elemente:',122,82,9,'#5c7363');
    if(seen){
      drawTypeBadges(174,70,sp,12);
      fText(AFF.typesFor(sp).map(t=>AFF.INFO[t].name).join('/'),214,82,8,'#455e5a');
    }
    fText(seen ? `Form ${sp.stage}/${sp.stageCount}   ${sp.evolvesTo ? '→ Nr.'+String(sp.evolvesTo).padStart(3,'0')+' ab Lv.'+sp.evolveLv : '· Endform'}` : 'Form unbekannt',122,96,9,'#5c7363');
    fText(`HP ${seen?sp.hp:'--'}   ANG ${seen?sp.atk:'--'}   VER ${seen?sp.def:'--'}`,122,110,9,'#5c7363');
    fText(gameState.caughtIds[id]?'✦ VERBUNDEN':seen?'◈ GESEHEN':'◇ NICHT ENTDECKT',122,122,9,'#9d7b51');
    pix(17,133,284,1,'#b3986a');
    const whisper=seen?sp.whisper:'Diese Seele wartet noch darauf, gefunden zu werden.';
    wrapped(whisper,276,9).slice(0,2).forEach((ln,i)=>fText(ln,19,145+i*12,9,'#49665c'));
    fText('↑↓: Nr.   ←→: ±10    B: Zurück',19,167,9,'#647c68');
  }
  function renderTitle(tick){
    // Moonlit lake with a shoreline that stays readable behind the title.
    pix(0,0,PW,PH,'#24262b');
    pix(0,68,PW,112,'#777a7b');
    pix(0,81,PW,99,'#56595c');
    for(let i=0;i<24;i++){
      const x=Math.floor(hash(i,4)*PW),y=Math.floor(hash(i,13)*61);
      pix(x,y,i%5===0?2:1,1,i%3===0?'#f4f4ef':'#c7c8c4');
    }
    pix(243,22,31,21,'#c7c8c4');pix(247,17,23,31,'#f4f4ef');
    pix(251,14,15,36,'#f4f4ef');
    pix(253,24,4,3,'#c7c8c4');pix(263,35,5,4,'#c7c8c4');
    for(let i=0;i<38;i++){
      const x=i*9-7,h=8+Math.floor(hash(i,41)*20);
      for(let layer=0;layer<4;layer++){
        const span=3+layer*2;
        pix(x-Math.floor(span/2),79-h+Math.floor(layer*h/4),span,Math.ceil(h/4)+1,'#24262b');
      }
      pix(x-1,76,3,8,'#24262b');
    }
    for(let i=0;i<23;i++){
      const x=Math.floor(hash(i,26)*PW), y=84+Math.floor(hash(i,48)*64);
      const motion=Math.floor(tick/260)%4;
      pix(x+motion,y,5+(i%5)*3,1,i%3?'#777a7b':'#c7c8c4');
    }
    for(let x=0;x<PW;x+=8){
      const y=151+Math.floor(hash(x,3)*11);
      pix(x,y,8,PH-y,'#24262b');
      pix(x+1,y-1,5,1,'#c7c8c4');
      if(x%24===0)pix(x+4,y-6,1,5,'#c7c8c4');
    }
    ctx.drawImage(getMonsterSprite(1,32),22,88+Math.round(Math.sin(tick*.003)*2),48,48);
    ctx.drawImage(getMonsterSprite(2,32),251,96-Math.round(Math.sin(tick*.004)*2),47,47);
    pix(60,34,200,60,'#24262b');
    pix(62,36,196,56,'#c7c8c4');pix(64,38,192,52,'#24262b');
    fText('ECHO',160,59,24,'#f4f4ef','center');
    fText('CHRONIKEN',160,78,18,'#f4f4ef','center');
    boxArt(99,122,122,24,'#f4f4ef','#24262b');
    fText('▶  A  STARTEN',160,138,11,'#24262b','center');
  }

  // --- HANDY: TOUCH-GAMEPAD, WIEDERHOLUNG BEI GEHALTENER RICHTUNG ---
  // pointer events sind gleichzeitig Finger-/Stift-/Maus-kompatibel.
  const touchController = document.getElementById('touch-controls');
  const touchALabel = document.getElementById('touch-a-label');
  const touchSound = document.getElementById('touch-sound');
  let touchHoldDelay = null, touchHoldInterval = null, heldTouchButton = null;
  const DIRECTION_CMDS = new Set(['UP', 'DOWN', 'LEFT', 'RIGHT']);
  if (new URLSearchParams(location.search).has('touch')) {
    document.documentElement.classList.add('force-touch');
  }
  const clearTouchHold = () => {
    if (touchHoldDelay !== null) clearTimeout(touchHoldDelay);
    if (touchHoldInterval !== null) clearInterval(touchHoldInterval);
    touchHoldDelay = null;
    touchHoldInterval = null;
    heldTouchButton?.classList.remove('is-pressed');
    heldTouchButton = null;
  };
  touchController.querySelectorAll('[data-cmd]').forEach((button) => {
    button.addEventListener('pointerdown', (event) => {
      if (event.button !== undefined && event.button !== 0) return;
      event.preventDefault();
      clearTouchHold();
      heldTouchButton = button;
      button.classList.add('is-pressed');
      if (button.setPointerCapture) button.setPointerCapture(event.pointerId);
      const cmd = button.dataset.cmd;
      handleCommand(cmd);
      // Der erste Schritt erfolgt sofort, weitere Schritte nach kurzem Halten.
      if (DIRECTION_CMDS.has(cmd)) {
        touchHoldDelay = setTimeout(() => {
          touchHoldInterval = setInterval(() => handleCommand(cmd), 145);
        }, 245);
      }
    });
    button.addEventListener('pointerup', clearTouchHold);
    button.addEventListener('pointercancel', clearTouchHold);
    button.addEventListener('lostpointercapture', clearTouchHold);
  });
  window.addEventListener('blur', clearTouchHold);
  document.addEventListener('visibilitychange', () => { if (document.hidden) clearTouchHold(); });
  touchSound.addEventListener('click', () => {
    soundEnabled = !soundEnabled;
    touchSound.textContent = soundEnabled ? '🔊 Ton' : '🔇 Ton';
    storePrefs();
    if (soundEnabled) ensureAudio();
  });
  touchSound.textContent=soundEnabled?'🔊 Ton':'🔇 Ton';
  document.getElementById('btn-palette').textContent='🎨 '+PALETTES[paletteIdx].name;
  let lastTouchMode = '';
  function updateTouchLabel() {
    if (lastTouchMode === gameState.mode) return;
    lastTouchMode = gameState.mode;
    touchALabel.textContent = ({TITLE: 'Starten', DIALOG: 'Weiter', OVERWORLD: 'Aktion', PLATFORM:'Springen', BATTLE: 'Wählen', ATTACKS:'Angriff', TEAM_SELECT:'Wechseln', RUNEBOOK:'Lernen', LEXICON: 'Info', ARCHIVE: 'Tauschen', MENU: 'Wählen', TEAM_OVERVIEW:'Team', BAG:'Rucksack', OPTIONS:'Ändern', AUSRUESTUNG:'Anlegen'})[gameState.mode] || 'OK';
  }


  // Der Kampf-Test ist ein Sandbox-Modus. Vorheriger Spielstand bleibt im Arbeitsspeicher erhalten.
  const labPanel=document.getElementById('battle-lab-panel');
  const labAlly=document.getElementById('lab-ally');
  const labEnemy=document.getElementById('lab-enemy');
  let savedBeforeLab=null;
  // All 150 species can be tested in the battle sandbox; original save stays intact.
  const LAB_IDS=SPECIES.map((_,index)=>index+1);
  for(const id of LAB_IDS){
    const s=SPECIES[id-1];
    for(const select of [labAlly,labEnemy]){
      const option=document.createElement('option');option.value=String(id);
      option.textContent=`#${String(id).padStart(3,'0')} ${s.name} · Stufe ${s.stage}`;
      select.appendChild(option);
    }
  }
  labAlly.value='1'; labEnemy.value='7';
  function refreshLabButtons(){
    const s=savedBeforeLab?'⏹ Test beenden':'⚔ Kampf-Test';
    document.getElementById('demo-desktop').textContent=s;
    document.getElementById('demo-mobile').textContent=savedBeforeLab?'⏹ Ende':'⚔ Kampf';
  }
  function closeLabPanel(){labPanel.classList.remove('show');}
  function exitLab(){
    closeLabPanel();
    if(savedBeforeLab){
      Object.assign(gameState,savedBeforeLab);
      savedBeforeLab=null;
      refreshLabButtons();
    }
  }
  function showLab(){if(savedBeforeLab){exitLab();return;}labPanel.classList.add('show');}
  for(const el of [document.getElementById('demo-desktop'),document.getElementById('demo-mobile')])el.addEventListener('click',showLab);
  document.getElementById('lab-cancel').addEventListener('click',closeLabPanel);
  document.getElementById('lab-start').addEventListener('click',()=>{
    if(savedBeforeLab)exitLab();
    savedBeforeLab={...gameState};
    // Lab swaps and battles must not mutate the real archived individuals.
    gameState.archive=JSON.parse(JSON.stringify(gameState.archive));
    gameState.attackOrigin=null;
    gameState.caughtIds={...gameState.caughtIds};
    gameState.seenIds={...gameState.seenIds};
    const id=Number(labAlly.value),eId=Number(labEnemy.value);
    const ally=createMonsterInstance(id, SPECIES[id-1].stage===1?5:SPECIES[id-1].stage===2?11:17);
    const enemy=createMonsterInstance(eId, SPECIES[eId-1].stage===1?3:SPECIES[eId-1].stage===2?10:16);
    gameState.team=[ally];
    if(window.echoBattleLabReserveId){
      const reserveId=window.echoBattleLabReserveId;
      if(SPECIES[reserveId-1])gameState.team.push(createMonsterInstance(reserveId,ally.lv));
      window.echoBattleLabReserveId=null;
    }
    gameState.hasStarter=true;
    gameState.mode='BATTLE';
    gameState.battle={isTrainer:false,trainerName:null,gymIndex:null,
      enemyQueue:[enemy],enemy,cursor:0,log:`Ein wildes ${SPECIES[eId-1].name} erscheint!`,animTimer:0,busy:false,participants:[getActiveAlly()]};
    closeLabPanel();refreshLabButtons();sfx.confirm();
  });
  // Canvas-Buttons direkt antippen, ohne eine virtuelle A-Taste verwenden zu müssen.
  canvas.addEventListener('pointerdown',e=>{
    const r=canvas.getBoundingClientRect();const x=(e.clientX-r.left)/r.width*PW,y=(e.clientY-r.top)/r.height*PH;
    if(gameState.mode==='MENU'){
      if(x>=202&&x<=310&&y>=35&&y<161){
        gameState.menuCursor=Math.max(0,Math.min(START_MENU.length-1,Math.floor((y-36)/14.3)));
        handleCommand('A');
      }
      return;
    }
    if(gameState.mode==='TEAM_OVERVIEW'){
      if(x>=16&&x<=306&&y>=41&&y<41+gameState.team.length*18){
        gameState.teamMenuCursor=Math.min(gameState.team.length-1,Math.floor((y-41)/18));
        handleCommand('A');
      }
      return;
    }
    if(gameState.mode==='BAG'){
      if(x>=16&&x<=304&&y>=40&&y<40+BAG_MENU.length*15){
        gameState.bagCursor=Math.max(0,Math.min(BAG_MENU.length-1,Math.floor((y-40)/15)));
        handleCommand('A');
      }
      return;
    }
    if(gameState.mode==='RUNE_SHOP'){
      if(x>=16&&x<=304&&y>=43&&y<43+SHOP_ITEMS.length*14){
        gameState.shopCursor=Math.max(0,Math.min(SHOP_ITEMS.length-1,Math.floor((y-43)/14)));
        handleCommand('A');
      }
      return;
    }
    if(gameState.mode==='OPTIONS'){
      if(x>=18&&x<=303&&y>=44&&y<148){
        gameState.optionsCursor=Math.max(0,Math.min(OPTIONS_MENU.length-1,Math.floor((y-44)/25)));
        handleCommand('A');
      }
      return;
    }
    if(gameState.mode==='ARCHIVE'){
      if(y>=34&&y<=56){handleCommand(x<120?'LEFT':'RIGHT');return;}
      if(x>=16&&x<304&&y>=76&&y<151){
        const stored=window.EchoArchive.ensure(gameState),cursor=gameState.archiveCursor||0;
        const first=Math.max(0,Math.min(cursor-2,Math.max(0,stored.length-5)));
        const index=first+Math.floor((y-76)/15);
        if(index<stored.length){
          if(index===cursor)handleCommand('A');
          else{gameState.archiveCursor=index;sfx.blip();}
        }
      }
      return;
    }
    if(gameState.mode==='RAIL'){
      const choices=window.EchoRail.destinations(gameState);
      const rowH=Math.min(25,Math.floor(90/Math.max(1,choices.length)));
      if(x>=18&&x<=303&&y>=59&&y<59+rowH*choices.length){
        const index=Math.floor((y-59)/rowH);
        if(index>=0&&index<choices.length){
          gameState.railCursor=index;
          handleCommand('A');
        }
      }
      return;
    }
    if(gameState.mode==='TEAM_SELECT'){
      if(x>=15&&x<=305&&y>=43&&y<43+gameState.team.length*18){
        gameState.teamCursor=Math.floor((y-43)/18);
        handleCommand('A');
      }
      return;
    }
    if(gameState.mode==='AUSRUESTUNG'){
      if(y<45&&x>160){handleCommand(x<230?'LEFT':'RIGHT');return;}
      if(y>=59&&y<149){
        const top=Math.max(0,Math.min(gameState.gearCursor-4,GEAR_ITEMS.length-5));
        gameState.gearCursor=Math.min(GEAR_ITEMS.length-1,top+Math.floor((y-59)/18));
        handleCommand('A');
      }
      return;
    }
    if(gameState.mode==='RUNEBOOK'){
      if(y<27&&x>260){handleCommand('R');return;}
      const items=availableRunes();
      if(y<45&&x>160){handleCommand('RIGHT');return;}
      if(y>=49&&y<156&&items.length){
        const cursor=gameState.runeCursor||0,first=Math.max(0,Math.min(cursor-3,Math.max(0,items.length-6)));
        gameState.runeCursor=Math.min(items.length-1,first+Math.floor((y-49)/16));
        handleCommand('A');
      }
      return;
    }
    if(gameState.mode==='ATTACKS'){
      const menuOnly=gameState.attackOrigin==='OVERWORLD'||gameState.attackOrigin==='MENU';
      const b=gameState.battle,ally=menuOnly?gameState.team[0]:getActiveAlly();
      if(!ally)return;
      ensureMonsterMoves(ally);
      if(menuOnly&&y<46){handleCommand(x<230?'LEFT':'RIGHT');return;}
      if(x<137||x>319||y<46||y>161)return;
      const top=menuOnly?Math.max(0,Math.min(ally.moves.length-6,(gameState.freeAttackCursor||0)-3)):(b.attackTop||0);
      const index=top+Math.floor((y-47)/18);
      if(index<0||index>=ally.moves.length)return;
      if(menuOnly)gameState.freeAttackCursor=index;else b.attackCursor=index;
      if(x>289){attackReorder(1);return;}
      if(x>271){attackReorder(-1);return;}
      if(menuOnly)handleCommand('A');else useSelectedAttack();
      return;
    }
    if(gameState.mode!=='BATTLE'||!gameState.battle||gameState.battle.busy)return;
    if(y<121||x<163)return;
    const col=x>=242?1:0,row=y>=148?1:0;
    gameState.battle.cursor=row*2+col;
    executeBattleAction(gameState.battle.cursor);
  });
  
    window.echoBattleLab={start(allyId=1,enemyId=9,reserveId=null){labAlly.value=String(allyId);labEnemy.value=String(enemyId);window.echoBattleLabReserveId=reserveId;document.getElementById('lab-start').click();}, stop:exitLab, status:()=>({active:!!savedBeforeLab,mode:gameState.mode,ally:gameState.team[0]?.id,enemy:gameState.battle?.enemy?.id})};

  window.tvControllerInput=(cmd)=>handleCommand(cmd);
  // Read-only QA introspection: never changes HP, inventory, AI or story flags.
  window.echoQACombatOptions=()=>{
    if(!gameState.battle||!getActiveAlly())return [];
    const ally=getActiveAlly(),enemy=gameState.battle.enemy;
    return battleMoves(ally).map((id,index)=>{
      const move=ATTACKS[id],factor=AFF.effectiveness(move.type,enemy),stab=AFF.stab(move.type,ally);
      return {id,index,power:move.power||0,heal:move.heal||0,
        factor,stab,score:(move.power||0)*factor*stab};
    });
  };
  window.echoQASnapshot=()=>({mode:gameState.mode,scene:gameState.scene,mapId:gameState.currentMapId,chapter3:gameState.chapter3,chapter4:gameState.chapter4,chapter5:gameState.chapter5,chapter6:gameState.chapter6,chapter7:gameState.chapter7,chapter8:gameState.chapter8,chapter9:gameState.chapter9,chapter10:gameState.chapter10,chapter11:gameState.chapter11,chapter12:gameState.chapter12,chapter13:gameState.chapter13,chapter14:gameState.chapter14,postgame:gameState.postgame,optional_postgame_completed:gameState.optional_postgame_completed,main_story_finished:gameState.main_story_finished,railCursor:gameState.railCursor,ruinsProgress:gameState.ruinsProgress,platformProgress:gameState.platformProgress,platformRun:window.EchoPlatformer?.snapshot(),routeQuest:gameState.routeQuest,explorationFound:gameState.explorationFound,introStage:gameState.introStage,objective:window.EchoHouse.objective(gameState),player:{...gameState.player},starter:gameState.hasStarter,potions:gameState.potions,orbs:gameState.orbs,team:gameState.team.map(m=>({id:m.id,lv:m.lv,hp:m.hp,moves:battleMoves(m),learnedMoves:m.moves,types:AFF.typesFor(m)})),archiveCount:gameState.archive.length,dialogPages:gameState.dialogQueue.length,battle:gameState.battle?{enemy:gameState.battle.enemy?.id,enemyHp:gameState.battle.enemy?.hp,enemyMaxHp:gameState.battle.enemy?.maxHp,busy:gameState.battle.busy,cursor:gameState.battle.cursor,log:gameState.battle.log,teamCursor:gameState.teamCursor,
      allyStatus:STATUS.labels(gameState.battle,getActiveAlly()),
      enemyStatus:STATUS.labels(gameState.battle,gameState.battle.enemy)}:null});
  if(gameState.dialogQueue.length>0 || gameState.mode==='OVERWORLD'){
    // A clean title screen on every launch; continuation stays in existing state.
    gameState.mode='TITLE';
  }

  function renderScene(tick){
    if(gameState.scene==='HOUSE')window.EchoHouse.render(ctx,tick,gameState,drawChar16);
    else if(gameState.scene==='BUILDING')window.EchoInteriors.render(ctx,tick,gameState,drawChar16);
    else if(gameState.scene==='RUINS')window.EchoRuins.render(ctx,tick,gameState,drawChar16);
    else if(gameState.scene==='OVERWORLD'&&gameState.currentMapId!=='legacy_wurzeldorf')renderRegion(tick);
    else renderOverworld(tick);
  }

  // --- HAUPTSCHLEIFE (GAME LOOP) ---
  function loop(tick) {
    pollGamepad(tick);
    if(gameState.mode==='PLATFORM'){
      const event=window.EchoPlatformer.update(gameState,tick);
      if(event?.completed){saveGame(true);sfx.evolve();showDialog(event.lines);}
    }
    updateTouchLabel();

    if (gameState.mode === 'TITLE') {
      renderTitle(tick);
    } else if (gameState.mode === 'OVERWORLD') {
      renderScene(tick);
    } else if (gameState.mode === 'PLATFORM') {
      window.EchoPlatformer.render(ctx,tick,gameState);
    } else if (gameState.mode === 'DIALOG') {
      renderScene(tick);
      renderDialog();
    } else if (['BATTLE','ATTACKS','TEAM_SELECT'].includes(gameState.mode)) {
      if(gameState.mode==='ATTACKS'&&['OVERWORLD','MENU'].includes(gameState.attackOrigin))renderScene(tick);
      else renderBattle(tick);
      if(gameState.mode==='ATTACKS')renderAttackBook(tick);
      if(gameState.mode==='TEAM_SELECT')renderTeamSelect();
    } else if (gameState.mode === 'MAP') {
      if(gameState.currentMapId==='legacy_wurzeldorf')window.EchoExplore.drawMap(ctx,worldMap,gameState);
       else (window.EchoPostgame?.names[gameState.currentMapId] ? window.EchoPostgame :
          window.EchoFinale?.names[gameState.currentMapId] ? window.EchoFinale :
           window.EchoEndgame?.names[gameState.currentMapId] ? window.EchoEndgame :
          window.EchoStoryRegions?.names[gameState.currentMapId] ? window.EchoStoryRegions :
         window.EchoChapter5?.names[gameState.currentMapId] ? window.EchoChapter5 :
         window.EchoChapter4?.names[gameState.currentMapId] ? window.EchoChapter4 : window.EchoChapter3).drawRegionMap(ctx,gameState);
    } else if (gameState.mode === 'RAIL') {
      window.EchoChapter4.drawRailMenu(ctx,gameState,gameState.railCursor);
    } else if (gameState.mode === 'LEXICON') {
      renderLexicon();
    } else if (gameState.mode === 'ARCHIVE') {
      renderArchive();
    } else if (gameState.mode === 'RUNEBOOK') {
      renderRuneBook();
    } else if (gameState.mode === 'AUSRUESTUNG') {
      renderEquipment();
    } else if (gameState.mode === 'TEAM_OVERVIEW') {
      renderScene(tick);renderTeamOverview();
    } else if (gameState.mode === 'BAG') {
      renderScene(tick);renderBag();
    } else if (gameState.mode === 'OPTIONS') {
      renderScene(tick);renderOptions();
    } else if (gameState.mode === 'RUNE_SHOP') {
      renderScene(tick);renderRuneShop();
    } else if (gameState.mode === 'MENU') {
      renderScene(tick);
      renderMenu();
    }

    requestAnimationFrame(loop);
  }

  requestAnimationFrame(loop);
})();

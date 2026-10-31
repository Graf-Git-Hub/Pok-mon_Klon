
(() => {
  const canvas = document.getElementById('screen');
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;

  // --- FARB-PALETTEN (GBA 16-Bit, Geister-Nacht, Klassik DMG) ---
  const PALETTES = [
    { name: 'GBA-Stil', filter: 'none' },
    { name: 'Geister-Nacht', filter: 'hue-rotate(195deg) saturate(1.35) brightness(0.95) contrast(1.1)' },
    { name: 'DMG-Retro', filter: 'sepia(1) hue-rotate(42deg) saturate(1.7) contrast(1.15)' }
  ];
  let paletteIdx = 0;

  // --- WEB AUDIO 8-BIT SYNTHESIZER ---
  let audioCtx = null;
  let soundEnabled = true;

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
  worldMap[4][8] = 7;  // Vaters alter Tisch mit Relikt-Kapsel
  worldMap[6][4] = 6;  // Omas Heil-Brunnen
  worldMap[13][16] = 6; // Kreuzungs-Heilstein
  worldMap[21][30] = 6; // Heiligtum-Altar

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
        startTrainerBattle(1, 'Arenaleiterin Lyra', [{ id: 52, lv: 11 }, { id: 86, lv: 13 }]);
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
        startTrainerBattle(2, 'Meister Vex', [{ id: 112, lv: 15 }, { id: 144, lv: 16 }, { id: 150, lv: 18 }]);
        return null;
      }
    }
  ];

  // --- SPIELZUSTAND (GAME STATE) ---

  // Echo V0.6: alle Fähigkeiten bleiben dauerhaft erhalten, auch bei Entwicklungen.
  const ATTACKS = {
    seelenstups:{name:'Seelenstups',type:'AETHER',power:22,desc:'Ein sicherer, kleiner Stoß.'},
    sternenstaub:{name:'Sternenstaub',type:'AETHER',power:34,desc:'Sternenstaub wirbelt durch die Luft.'},
    echowelle:{name:'Echowelle',type:'AETHER',power:44,desc:'Ein heller Schall trifft das Ziel.'},
    astralsturm:{name:'Astralsturm',type:'AETHER',power:58,desc:'Ein Sturm aus alten Erinnerungen.'},
    lichtfunke:{name:'Lichtfunke',type:'LICHT',power:26,desc:'Ein warmer Funke.',fx:'#ffe58a'},
    mondschein:{name:'Mondschein',type:'LICHT',power:36,desc:'Ein Lichtstrahl in der Nacht.',fx:'#fff0af'},
    sternenfall:{name:'Sternenfall',type:'LICHT',power:48,desc:'Leuchtende Sterne treffen das Ziel.',fx:'#f4dfaa'},
    sonnenchor:{name:'Sonnenchor',type:'LICHT',power:65,desc:'Eine machtvolle Lichtmelodie.',fx:'#fff5c5'},
    heilflimmern:{name:'Heilflimmern',type:'LICHT',power:0,heal:24,desc:'Stellt eigene KP wieder her.'},
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
  const TYPE_SKILLS = {
    LICHT:['lichtfunke','mondschein','heilflimmern','sternenfall','sonnenchor'],
    SCHATTEN:['schattentipp','nebelbiss','nachthieb','finsternis'],
    FLAMME:['glutfunken','funkenflug','feuerwirbel','phönixstoß'],
    FLUT:['wasserperle','wellenschlag','gezeitenruf','sturmflut'],
    WURZEL:['blattschnips','rankengriff','waldsegen','mooshammer','wurzelsturm'],
    AETHER:['seelenstups','sternenstaub','echowelle','astralsturm']
  };
  const SKILL_LEVELS = [1,7,11,16,24];
  function learnedFor(type,lv){
    const tree=TYPE_SKILLS[type]||TYPE_SKILLS.AETHER;
    const entries=[{id:tree[0],lv:1},{id:'seelenstups',lv:3},{id:tree[1],lv:7},{id:'sternenstaub',lv:9}];
    if(tree[2])entries.push({id:tree[2],lv:11});
    if(tree[3])entries.push({id:tree[3],lv:16});
    if(tree[4])entries.push({id:tree[4],lv:24});
    entries.push({id:'echowelle',lv:19},{id:'astralsturm',lv:30});
    return entries.filter(e=>e.lv<=lv).sort((a,b)=>b.lv-a.lv).map(e=>e.id).filter((id,i,a)=>a.indexOf(id)===i);
  }
  function ensureMonsterMoves(monster){
    const natural=learnedFor(SPECIES[monster.id-1].type,monster.lv);
    if(!Array.isArray(monster.moves))monster.moves=natural.slice();
    for(const id of natural){if(!monster.moves.includes(id))monster.moves.push(id);}
    monster.moves=monster.moves.filter(id=>!!ATTACKS[id]);
    if(!monster.moves.length)monster.moves=['seelenstups'];
    return monster.moves;
  }
  function addLevelMoves(monster,prevLevel,log){
    const natural=learnedFor(SPECIES[monster.id-1].type,monster.lv);
    for(const id of natural.slice().reverse()){
      if(!monster.moves.includes(id)){
        monster.moves.unshift(id); // neue Attacken immer oben; alte bleiben erhalten
        if(log)log.push(`⚡ ${SPECIES[monster.id-1].name} lernt ${ATTACKS[id].name}!`);
      }
    }
  }
  function skillDamage(user,target,move){
    const us=SPECIES[user.id-1],ts=SPECIES[target.id-1];
    let advantage=1;
    if((move.type==='FLAMME'&&ts.type==='WURZEL')||(move.type==='WURZEL'&&ts.type==='FLUT')||(move.type==='FLUT'&&ts.type==='FLAMME')||(move.type==='LICHT'&&ts.type==='SCHATTEN')||(move.type==='SCHATTEN'&&ts.type==='LICHT'))advantage=1.18;
    return Math.max(2,Math.floor((move.power*.205+user.lv*.48+us.atk*.17-ts.def*.14)*(0.92+Math.random()*.14)*advantage));
  }
  function createMonsterInstance(id, lv) {
    const sp=SPECIES[id-1];
    const maxHp=Math.floor(sp.hp+lv*4.5);
    const m={uid:Math.random().toString(36).slice(2),id,lv,xp:0,nextXp:lv*18,maxHp,hp:maxHp,moves:[]};
    m.moves=learnedFor(sp.type,lv);
    return m;
  }

    const gameState = {
    mode: 'OVERWORLD', // OVERWORLD, DIALOG, BATTLE, LEXICON, MENU
    player: { x: 5, y: 5, dir: 'down', stepPhase: 0 },
    hasStarter: false,
    team: [],
    caughtIds: {},
    seenIds: {},
    badges: 0,
    gymDefeated: [false, false, false],
    pages: [false, false, false],
    foundMusicBox: false,
    musicBoxDelivered: false,
    potions: 5,
    orbs: 12,
    encounterGrace: 0,
    battleWins: 0,
    attackOrigin: null,
    dialogQueue: [],
    dialogCallback: null,
    lexiconCursor: 1,
    menuCursor: 0,
    battle: null
  };

  // --- SPEICHERN & LADEN (LOCAL STORAGE) ---
  function saveGame() {
    if (typeof savedBeforeLab !== "undefined" && savedBeforeLab) return;
    try {
      const saveObj = {
        player: gameState.player,
        hasStarter: gameState.hasStarter,
        team: gameState.team,
        caughtIds: gameState.caughtIds,
        seenIds: gameState.seenIds,
        badges: gameState.badges,
        gymDefeated: gameState.gymDefeated,
        pages: gameState.pages,
        foundMusicBox: gameState.foundMusicBox,
        musicBoxDelivered: gameState.musicBoxDelivered,
        potions: gameState.potions,
        orbs: gameState.orbs,
        encounterGrace: gameState.encounterGrace,
        battleWins: gameState.battleWins,
        balanceVersion: 6
      };
      localStorage.setItem('echo_chroniken_tv_save', JSON.stringify(saveObj));
      sfx.heal();
      showDialog(['💾 Spielstand erfolgreich gespeichert!']);
    } catch (e) {
      showDialog(['Speichern fehlgeschlagen.']);
    }
  }

  function loadGame() {
    try {
      const raw = localStorage.getItem('echo_chroniken_tv_save');
      if (!raw) return false;
      const d = JSON.parse(raw);
      Object.assign(gameState, d);
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

  if (!loadGame()) {
    showDialog([
      'Willkommen in WURZELHEIM.',
      'Seit dem Tod deines Vaters lebst du hier bei deiner Oma Martha.',
      'Auf Vaters altem Tisch rechts neben dem Haus blinkt eine geheimnisvolle Relikt-Kapsel...',
      '(Steuerung: Switch-Controller, Pfeiltasten/WASD + Enter/Leertaste)'
    ]);
  }

  function showDialog(lines, onDone = null) {
    gameState.mode = 'DIALOG';
    gameState.dialogQueue = [...lines];
    gameState.dialogCallback = onDone;
    sfx.blip();
  }

  // --- KAMPFSYSTEM (32x32 GBA-MODUS) ---
function startWildBattle(){
    const {x,y}=gameState.player;
    const inStart=x<=13 && y<=16;
    const d=Math.max(0,Math.abs(x-5)+Math.abs(y-5)-8);
    const cap=inStart?4:Math.min(20,5+Math.floor(d/4)+gameState.badges*2);
    const low=inStart?2:Math.max(3,cap-2);
    const wildLv=low+Math.floor(Math.random()*(cap-low+1));
    const choices=SPECIES.filter(sp=>sp.id!==1 && sp.id<=Math.min(150,inStart?48:55+gameState.badges*35) && (inStart?sp.stage===1:sp.stage<=Math.min(3,1+gameState.badges)));
    const wildId=choices[Math.floor(Math.random()*choices.length)].id;
    gameState.seenIds[wildId]=true;
    const enemy=createMonsterInstance(wildId,wildLv);
    gameState.attackOrigin=null;gameState.mode='BATTLE';gameState.battle={isTrainer:false,trainerName:null,gymIndex:null,
      enemyQueue:[enemy],enemy,cursor:0,attackCursor:0,attackTop:0,
      log:`Ein wildes ${SPECIES[wildId-1].name} (Lv.${wildLv}) erscheint!`,animTimer:0,busy:false};
    sfx.confirm();
  }
  
    function startTrainerBattle(gymIndex, trainerName, roster) {
    const queue = roster.map(r => {
      gameState.seenIds[r.id] = true;
      return createMonsterInstance(r.id, r.lv);
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
      busy: false
    };
  }

  function getActiveAlly() {
    return gameState.team.find(m => m.hp > 0) || gameState.team[0];
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
      if(other){gameState.team=gameState.team.filter(m=>m!==other);gameState.team.unshift(other);b.log=`${SPECIES[other.id-1].name} kommt heraus!`;battleTimeout(enemyCounterAttack,450);b.busy=true;}
      else b.log='Du hast keinen weiteren kampffähigen Geist.';
    }else if(choice===2){
      if(b.isTrainer){
        if(gameState.potions<=0){b.log='Keine Seelen-Tränke mehr!';sfx.cancel();return;}
        gameState.potions--;ally.hp=Math.min(ally.maxHp,ally.hp+36);b.log=`${SPECIES[ally.id-1].name} erhält heilende Kraft!`;
        b.busy=true;sfx.heal();battleTimeout(enemyCounterAttack,600);
      }else{
        if(gameState.orbs<=0){b.log='Keine Seelen-Sphären mehr!';sfx.cancel();return;}
        gameState.orbs--;b.busy=true;sfx.catch();
        const chance=Math.min(.93,.63+(1-b.enemy.hp/b.enemy.maxHp)*.32);
        b.log=`Eine Seelen-Sphäre fliegt durch die Luft ...`;
        battleTimeout(()=>{
          if(Math.random()<chance){
            const captured=b.enemy; captured.hp=Math.max(1,captured.hp);
            gameState.caughtIds[captured.id]=true;
            gameState.encounterGrace=8;
            if(gameState.team.length<6)gameState.team.push(captured);
            gameState.mode='OVERWORLD';
            showDialog([`✨ ${SPECIES[captured.id-1].name} hat sich dir angeschlossen!`,gameState.team.includes(captured)?'Willkommen im Team!':'Dein Team ist voll. Das Wesen wartet im Archiv.']);
          }else{b.log='Die Sphäre öffnet sich wieder!';battleTimeout(enemyCounterAttack,550);}
        },600);
      }
    }else if(choice===3){
      if(b.isTrainer)b.log='Aus einer Arena kannst du nicht fliehen!';
      else {gameState.mode='OVERWORLD';gameState.encounterGrace=6;sfx.cancel();}
    }
  }
  function useSelectedAttack(){
    const b=gameState.battle,ally=getActiveAlly();if(!b||b.busy||!ally)return;
    ensureMonsterMoves(ally);
    const id=ally.moves[b.attackCursor||0],move=ATTACKS[id];if(!move)return;
    gameState.mode='BATTLE';b.busy=true;
    if(move.heal){
      const healed=Math.min(move.heal,ally.maxHp-ally.hp);
      ally.hp+=healed;b.log=`${SPECIES[ally.id-1].name} nutzt ${move.name}! +${healed} KP`;
      sfx.heal();
      battleTimeout(enemyCounterAttack,650);return;
    }
    const damage=skillDamage(ally,b.enemy,move);
    b.enemy.hp=Math.max(0,b.enemy.hp-damage);
    b.animTimer=16;b.lastAttackColor=move.fx||'#ffe3a2';
    b.log=`${SPECIES[ally.id-1].name} nutzt ${move.name}! (${damage} Schaden)`;
    sfx.hit();
    battleTimeout(()=>{if(b.enemy.hp<=0)handleEnemyDefeated();else enemyCounterAttack();},650);
  }
  function attackReorder(dir){
    const b=gameState.battle,ally=b?getActiveAlly():gameState.team[0];
    if(!ally)return;
    ensureMonsterMoves(ally);
    let index=b?b.attackCursor:gameState.freeAttackCursor||0;
    const next=index+dir;if(next<0||next>=ally.moves.length){sfx.cancel();return;}
    [ally.moves[index],ally.moves[next]]=[ally.moves[next],ally.moves[index]];
    if(b){b.attackCursor=next; b.attackTop=Math.max(0,Math.min(next,ally.moves.length-6));}
    else gameState.freeAttackCursor=next;
    sfx.confirm();
  }
  
    function enemyCounterAttack() {
    const b = gameState.battle;
    if (!b) return;
    const ally = getActiveAlly();
    const allySp = SPECIES[ally.id - 1];
    const enemy = b.enemy;
    const enemySp = SPECIES[enemy.id - 1];

    ensureMonsterMoves(enemy);
    const move=ATTACKS[enemy.moves[Math.floor(Math.random()*Math.min(2,enemy.moves.length))]]||ATTACKS.seelenstups;
    const dmg=skillDamage(enemy,ally,move);
    b.lastAttackColor=move.fx||'#afbcce';
    ally.hp = Math.max(0, ally.hp - dmg);
    sfx.hit();
    b.log = `${enemySp.name} nutzt ${move.name}! (${dmg} Schaden)`;

    battleTimeout(() => {
      if (ally.hp <= 0) {
        const nextAlive = gameState.team.find(m => m.hp > 0);
        if (nextAlive) {
          b.log = `${allySp.name} zieht sich zurück! ${SPECIES[nextAlive.id - 1].name} springt ein!`;
          b.busy = false;
        } else {
          // Ohnmacht -> Zurück zu Oma Martha
          gameState.team.forEach(m => { m.hp = m.maxHp; });
          gameState.player.x = 5;
          gameState.player.y = 5;
          gameState.encounterGrace=12;
          gameState.mode = 'OVERWORLD';
          showDialog([
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
    gameState.encounterGrace=7;
    const b = gameState.battle;
    const ally = getActiveAlly();
    const enemy = b.enemy;
    const xpGain = enemy.lv * 11 + (b.isTrainer ? 18 : 8);
    ally.xp += xpGain;
    sfx.confirm();

    const msgs = [`${SPECIES[enemy.id - 1].name} wurde besänftigt! (+${xpGain} EP)`];

    // Level-Up & Entwicklungs-Check
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

    b.enemyQueue.shift();
    if (b.enemyQueue.length > 0) {
      b.enemy = b.enemyQueue[0];
      b.log = `${b.trainerName} schickt ${SPECIES[b.enemy.id - 1].name} in den Kampf!`;
      b.busy = false;
    } else {
      gameState.mode = 'OVERWORLD';
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
      showDialog(msgs);
    }
  }

  // --- INTERAKTION & BEWEGUNG IN DER OBERWELT ---
  function movePlayer(dx, dy, dirName) {
    if (gameState.mode !== 'OVERWORLD') return;
    gameState.player.dir = dirName;
    const nx = gameState.player.x + dx;
    const ny = gameState.player.y + dy;
    if (nx < 0 || ny < 0 || nx >= MAP_W || ny >= MAP_H) return;

    const tile = worldMap[ny][nx];
    if (tile === 1 || tile === 4 || tile === 5 || tile === 7) return; // Solide Objekte inkl. Relikt-Tisch
    if (npcs.some(n => n.x === nx && n.y === ny)) return;

    // Nicht ins hohe Gras ohne Starter-Wesen
    if (tile === 2 && !gameState.hasStarter) {
      showDialog(['Oma Martha ruft: „Nicht ohne Schutz ins hohe Gras! Hol dir erst Vaters Kapsel rechts neben unserem Haus!“']);
      return;
    }

    gameState.player.x = nx;
    gameState.player.y = ny;
    gameState.player.stepPhase = (gameState.player.stepPhase + 1) % 2;
    sfx.step();

    // Zufallskampf im hohen Geister-Gras
    if(gameState.encounterGrace>0)gameState.encounterGrace--;
    else if(tile===2&&gameState.hasStarter&&Math.random()<0.12)startWildBattle();
  }

  function interactFront() {
    const dirOffsets = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
    const [ox, oy] = dirOffsets[gameState.player.dir];
    const tx = gameState.player.x + ox;
    const ty = gameState.player.y + oy;

    // NPC oder Tagebuchseite vor dem Spieler?
    const npc = npcs.find(n => n.x === tx && n.y === ty);
    if (npc) {
      const lines = npc.talk();
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
      showDialog(['✨ Am Seelen-Brunnen wurden alle deine Wesen vollständig geheilt und deine Seelen-Sphären aufgefrischt!']);
    }
  }

  // --- EINGABE-STEUERUNG (TASTATUR + NINTENDO SWITCH GAMEPAD API) ---
  function handleCommand(cmd) {
    ensureAudio();

    if(cmd==='MOVES' && ['OVERWORLD','MENU','BATTLE'].includes(gameState.mode)){
      if(!gameState.team.length){showDialog(['Du brauchst zuerst Miora, um dein Attackenbuch zu öffnen.']);return;}
      gameState.attackOrigin=gameState.mode;
      gameState.freeAttackCursor=0;
      if(gameState.mode==='BATTLE'&&gameState.battle){gameState.battle.attackCursor=0;gameState.battle.attackTop=0;}
      gameState.mode='ATTACKS';sfx.confirm();return;
    }
    if (cmd === 'PALETTE') {
      paletteIdx = (paletteIdx + 1) % PALETTES.length;
      canvas.style.filter = PALETTES[paletteIdx].filter;
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
      else if (cmd === 'R' || cmd === 'SELECT') { gameState.mode = 'LEXICON'; sfx.confirm(); }
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
      const ally=menuOnly?gameState.team[0]:getActiveAlly();
      if(!ally)return;
      ensureMonsterMoves(ally);
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
      if(cmd==='A'&&!menuOnly)useSelectedAttack();
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
      if (cmd === 'B' || cmd === 'R' || cmd === 'START') { gameState.mode = 'OVERWORLD'; sfx.cancel(); }
      else if (cmd === 'UP') { gameState.lexiconCursor = Math.max(1, gameState.lexiconCursor - 1); sfx.blip(); }
      else if (cmd === 'DOWN') { gameState.lexiconCursor = Math.min(150, gameState.lexiconCursor + 1); sfx.blip(); }
      else if (cmd === 'LEFT') { gameState.lexiconCursor = Math.max(1, gameState.lexiconCursor - 10); sfx.blip(); }
      else if (cmd === 'RIGHT') { gameState.lexiconCursor = Math.min(150, gameState.lexiconCursor + 10); sfx.blip(); }
      return;
    }

    if (gameState.mode === 'MENU') {
      if (cmd === 'B' || cmd === 'START') { gameState.mode = 'OVERWORLD'; sfx.cancel(); }
      else if (cmd === 'UP') { gameState.menuCursor = (gameState.menuCursor + 3) % 4; sfx.blip(); }
      else if (cmd === 'DOWN') { gameState.menuCursor = (gameState.menuCursor + 1) % 4; sfx.blip(); }
      else if (cmd === 'A') {
        if (gameState.menuCursor === 0) { gameState.mode = 'LEXICON'; sfx.confirm(); }
        else if (gameState.menuCursor === 1) {
          if (gameState.potions > 0 && gameState.team.length > 0) {
            gameState.potions--;
            gameState.team.forEach(m => { m.hp = m.maxHp; });
            sfx.heal();
            showDialog(['✨ Dein gesamtes Team wurde mit einem Seelen-Trank geheilt!']);
          } else {
            sfx.cancel();
          }
        }
        else if (gameState.menuCursor === 2) { saveGame(); }
        else if (gameState.menuCursor === 3) { gameState.mode = 'OVERWORLD'; sfx.cancel(); }
      }
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

  function pollGamepad(now) {
    const pads = navigator.getGamepads ? navigator.getGamepads() : [];
    const gp = pads[0];
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
    else if (b(9)) cmd = 'START';   // Plus (+)
    else if (b(8)) cmd = 'PALETTE'; // Minus (-)
    else if (b(6)) cmd = 'MOVES'; // ZL öffnet das Attackenbuch
    else if (b(7)) cmd = 'FULLSCREEN'; // ZR

    if (cmd) {
      lastPadTime = now;
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

  function drawChar16(sx, sy, color, step = 0) {
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
    ctx.fillText(`KP: ${ally.hp}/${ally.maxHp}`, 121, 101);

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
    ctx.fillText(`Werte   : KP ${sp.hp} | ANG ${sp.atk} | VER ${sp.def}`, 88, 78);
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
  function drawChar16(sx,sy,color,step=0,role='player',dir='down'){
    const y=sy-4;let coat=color, hat='#31455c',skin='#e9b893',hair='#77503e';
    if(role==='oma'){coat='#a87e9f';hat='#e6d2c0';skin='#e6b596';hair='#cad1c1';}
    else if(role==='gym1'){coat='#4a9079';hat='#254f50';}
    else if(role==='gym2'){coat='#587b9d';hat='#416281';}
    else if(role==='gym3'){coat='#8c6a9b';hat='#45385b';}
    else if(role==='player'){coat='#d7685a';hat='#386f85';}
    pix(sx+3,y+17,11,2,'#518261');pix(sx+5,y+18,7,1,'#568c69');
    pix(sx+4,y+4,9,11,'#263c42');
    // boots+trousers, animated independent legs
    pix(sx+5,y+13+(step?1:0),3,4,'#485b65');pix(sx+9,y+13+(step?0:1),3,4,'#394c63');
    pix(sx+4,y+16+(step?1:0),4,2,'#292c42');pix(sx+9,y+16+(step?0:1),4,2,'#292c42');
    // coat sleeve + torso + belt
    pix(sx+3,y+9,11,6,'#263c42');pix(sx+4,y+9,9,5,coat);pix(sx+5,y+9,2,3,'#ecb77f');
    pix(sx+10,y+9,2,3,'#d0a177');pix(sx+6,y+12,5,2,role==='oma'?'#e3c797':'#e9d7ac');
    pix(sx+8,y+12,1,2,'#3e5361');
    // hair and facial plane
    pix(sx+5,y+3,8,7,'#3b4650');pix(sx+6,y+4,6,5,skin);
    pix(sx+6,y+7,1,1,'#684940');pix(sx+10,y+7,1,1,'#684940');
    if(dir==='up'){pix(sx+6,y+4,6,5,hair);pix(sx+7,y+6,4,2,'#3a5764');}
    else if(dir==='left'){pix(sx+7,y+7,1,1,'#453942');pix(sx+11,y+7,1,2,skin);}
    else if(dir==='right'){pix(sx+10,y+7,1,1,'#453942');pix(sx+5,y+7,1,2,skin);}
    // hat / hair styling
    pix(sx+5,y+1,9,4,'#273b49');pix(sx+6,y+1,7,3,hat);
    if(role==='oma'){pix(sx+6,y,6,2,'#dad9c4');pix(sx+4,y+3,2,6,'#ded8c7');pix(sx+12,y+4,2,6,'#c6b7bc');}
    else {pix(sx+4,y+4,9,1,hat);pix(sx+8,y+2,2,1,'#92b3ad');}
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
    const back = backSpriteImages[String(id)];
    if(back && back.complete && back.naturalWidth>0) return back;
    return getMonsterSprite(id,32);
  }

  // Canvas is 320×180, world origin at CX/CY, gives true wide-screen playfield.
  function renderOverworld(tick){
    pix(0,0,PW,PH,'#80b985');
    const px=gameState.player.x,py=gameState.player.y;
    const camX=px*16-CX, camY=py*16-CY;
    for(let y=0;y<MAP_H;y++)for(let x=0;x<MAP_W;x++){
      let sx=x*16-camX,sy=y*16-camY;
      if(sx<-17||sy<-17||sx>PW||sy>PH)continue;
      drawTile16(worldMap[y][x],sx,sy,tick,x,y);
    }
    // high-resolution handcrafted cottage + paths + village details
    gardenDecor(camX,camY,tick);
    const homeX=3*16-camX,homeY=2*16-camY;
    drawCottage(homeX,homeY,tick);
    
      // Berry bushes around yard, placed at stable coordinate hashes
    for(let x=1;x<11;x++)for(let y=5;y<11;y++){
      if(worldMap[y][x]!==0||hash(x,y,34)<.91)continue;
      let u=x*16-camX,v=y*16-camY;
      if(u<0||u>PW-16||v<0||v>PH)continue;
      pix(u+3,v+9,11,5,'#3c8562');pix(u+6,v+5,7,7,'#5d9d69');
      pix(u+6,v+10,2,2,'#de7770');pix(u+11,v+8,2,2,'#df7f7c');
    }
    npcs.forEach(n=>{
      let sx=n.x*16-camX,sy=n.y*16-camY;
      if(sx<-16||sy<-20||sx>PW||sy>PH)return;
      if(n.isObject)drawObject(n,sx,sy,tick);
      else drawChar16(sx,sy,n.color,Math.floor(tick/460)%2,n.id==='oma'?'oma':n.id,n.id==='oma'?'down':'left');
    });
    // a companion hovers immediately behind player, out of overlap
    if(gameState.hasStarter&&gameState.team.length){
      const offset={up:[-16,0],down:[16,-6],left:[10,-14],right:[-11,9]}[gameState.player.dir]||[16,-6];
      const spr=getMonsterSprite(gameState.team[0].id,16),wave=Math.sin(tick*.007)*2;
      ctx.drawImage(spr,CX+offset[0],CY+offset[1]+wave,18,18);
      pix(CX+offset[0]+5,CY+offset[1]+16,8,1,'#529c83');
    }
    drawChar16(CX,CY,'#e06e59',gameState.player.stepPhase,'player',gameState.player.dir);
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
    if(!gameState.hasStarter){pix(72,157,176,18,'#244d4acc');fText('✦ Hol dir Vaters Kapsel',79,170,10,'#fff0c6');}
  }
  
    function hpbar(x,y,w,v,color='#70ad69'){
    pix(x,y,w,8,'#283b45');pix(x+1,y+1,w-2,6,'#8d8272');
    pix(x+2,y+2,Math.max(0,Math.round((w-4)*Math.max(0,Math.min(1,v)))),4,v<.25?'#cb715d':v<.5?'#dbaf5e':color);
    pix(x+3,y+2,Math.max(0,Math.round((w-4)*Math.max(0,Math.min(1,v)))-3),1,'#f1edb8');
  }
  function renderBattle(tick){
    const b=gameState.battle;if(!b)return;
    const ally=getActiveAlly();if(!ally)return;
    const enemy=b.enemy;const allySp=SPECIES[ally.id-1],enemySp=SPECIES[enemy.id-1];
    // GBA-inspiriertes Layout in 320 × 180: obere Kampfbuehne, darunter 2 Panels.
    const bg=ctx.createLinearGradient(0,0,0,118);
    bg.addColorStop(0,'#b1dfd2');bg.addColorStop(.65,'#dbedcf');bg.addColorStop(1,'#95c19d');
    ctx.fillStyle=bg;ctx.fillRect(0,0,PW,118);
    for(let i=0;i<24;i++){
      const x=i*16-12,h=10+Math.floor(hash(i,12)*17);
      pix(x,86-h,7,h,'#96b79f');pix(x+3,79-h,3,9,'#729d8c');
    }
    pix(0,91,320,27,'#90bd9c');
    for(let i=0;i<28;i++){
      const x=i*13+hash(i,92)*8,y=93+hash(i,12)*23;
      pix(x,y,2,2,i%3?'#b9d9a0':'#e3d4a1');
    }
    ellipseBattle(245,100,58,12,'#75a987','#507b73');
    ellipseBattle(79,108,70,14,'#78ab89','#4f806e');
    const bounce=Math.sin(tick*.005)*2;
    const hurt=b.animTimer>0;
    if(hurt)b.animTimer--;
    const shake=hurt && b.animTimer%2===0?3:0;
    ctx.save();ctx.imageSmoothingEnabled=true;
    // Enemy: FRONT VIEW, right / Player: TRUE REAR VIEW, left.
    ctx.drawImage(getMonsterSprite(enemy.id,32),192+shake,12+bounce,109,96);
    ctx.drawImage(getMonsterBackSprite(ally.id),22,32-bounce,111,90);
    ctx.restore();
    if(hurt){
      for(let j=0;j<11;j++){
        const pos=(b.animTimer*7+j*23)%100;
        const x=99+pos*1.4; const y=68-Math.sin(j*2.4+b.animTimer*.4)*19;
        pix(x,y,3,3,j%2?'#fbf6e3':(b.lastAttackColor||'#a33ff5'));
      }
      pix(222+shake,43,12,2,'#fff4c8');
    }
    // Gegner-Leiste oben links
    boxArt(5,5,143,35,'#f8efd6','#365456','#fff9e7');
    fText(enemySp.name,12,18,10,'#263f43');
    fText('Lv.'+enemy.lv,123,18,9,'#486e60','right');
    fText('KP',12,33,8,'#546a61');hpbar(31,26,109,enemy.hp/enemy.maxHp,'#69ad68');
    // Eigene Leiste rechts unten; mit genauen KP
    boxArt(176,79,140,38,'#f8efd6','#365456','#fff9e7');
    fText(allySp.name,182,91,9,'#263f43');
    fText('Lv.'+ally.lv,309,91,8,'#456459','right');
    hpbar(184,96,123,ally.hp/ally.maxHp,'#72b477');
    fText(`${ally.hp}/${ally.maxHp} KP`,305,112,8,'#456459','right');
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
    const b=gameState.battle,ally=menuOnly?gameState.team[0]:getActiveAlly();
    if(!ally)return;
    ensureMonsterMoves(ally);
    const index=menuOnly?gameState.freeAttackCursor||0:b.attackCursor||0;
    const top=menuOnly?Math.max(0,Math.min(ally.moves.length-6,index-3)):Math.max(0,Math.min(ally.moves.length-6,b.attackTop||0));
    if(menuOnly)pix(0,0,PW,PH,'#122b3699');
    boxArt(132,5,185,170,'#f8eed5','#2f5558','#fdf4d7');
    pix(136,9,177,33,'#365b5b');
    fText('ATTACKENBUCH',144,23,14,'#fff0c6');
    fText(`Lv.${ally.lv}  ·  ${ally.moves.length} gelernt`,143,37,9,'#d2e7d1');
    for(let row=0;row<6;row++){
      const i=top+row;if(i>=ally.moves.length)break;
      const move=ATTACKS[ally.moves[i]],y=47+row*18,active=i===index;
      pix(137,y,174,17,active?'#4d7676':row%2?'#e8ebd6':'#faf5e3');
      pix(138,y+1,2,15,TYPE_COLORS[move.type][1]);
      fText(`${active?'▶':' '} ${move.name}`,142,y+12,10,active?'#fff5df':'#304d50');
      fText(move.heal?`+${move.heal} KP`:`${move.power}`,267,y+12,9,active?'#f9e7b1':'#65756c','right');
      if(active){fText('↑',280,y+11,10,'#fff6db');fText('↓',296,y+11,10,'#fff6db');}
    }
    if(ally.moves.length>6){fText(`${top+1}-${Math.min(top+6,ally.moves.length)}/${ally.moves.length}`,311,167,8,'#55766b','right');}
    const current=ATTACKS[ally.moves[index]];
    pix(7,122,121,52,'#24444a');pix(10,125,115,46,'#f5e8c7');
    fText(current.name,15,139,11,'#304d48');
    fText(`${current.type} · ${current.heal?'HEILUNG':'STÄRKE '+current.power}`,15,151,8,'#5d7768');
    fText(menuOnly?'L/R SORTIEREN': 'A EINSETZEN · B ZURÜCK',15,166,8,'#587064');
    if(menuOnly)fText('Im Spiel: jederzeit mit ⚡',8,27,9,'#fff9cf');
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
  function renderMenu(){
    pix(0,0,PW,PH,'#1c393e95');
    boxArt(47,14,226,153,'#ecdcb8','#2d514d');
    fText('✦ REISETAGEBUCH ✦',160,37,15,'#345851','center');
    fText(`Vaters Seiten: ${gameState.pages.filter(Boolean).length}/3     Orden: ${gameState.badges}/3`,66,55,9,'#557064');
    const items=['Buch der 150 Seelen',`Team heilen  (${gameState.potions} Tränke)`,'Spielstand speichern','Zurück ins Abenteuer'];
    items.forEach((s,i)=>{
      let y=75+i*21;
      if(gameState.menuCursor===i){pix(62,y-12,197,18,'#93b6a0');pix(62,y-12,3,18,'#ebcc78');}
      fText((gameState.menuCursor===i?'▶ ':'  ')+s,68,y,11,gameState.menuCursor===i?'#244a43':'#526759');
    });
    fText('A: Auswählen        B: Schließen',160,156,8,'#5c7466','center');
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
    fText(`Element    ${seen?sp.type:'Unbekannt'}`,122,82,10,'#5c7363');
    fText(seen ? `Form ${sp.stage}/${sp.stageCount}   ${sp.evolvesTo ? '→ Nr.'+String(sp.evolvesTo).padStart(3,'0')+' ab Lv.'+sp.evolveLv : '· Endform'}` : 'Form unbekannt',122,96,9,'#5c7363');
    fText(`KP ${seen?sp.hp:'--'}   ANG ${seen?sp.atk:'--'}   VER ${seen?sp.def:'--'}`,122,110,9,'#5c7363');
    fText(gameState.caughtIds[id]?'✦ VERBUNDEN':seen?'◈ GESEHEN':'◇ NICHT ENTDECKT',122,122,9,'#9d7b51');
    pix(17,133,284,1,'#b3986a');
    const whisper=seen?sp.whisper:'Diese Seele wartet noch darauf, gefunden zu werden.';
    wrapped(whisper,276,9).slice(0,2).forEach((ln,i)=>fText(ln,19,145+i*12,9,'#49665c'));
    fText('↑↓: Nr.   ←→: ±10    B: Zurück',19,167,9,'#647c68');
  }
  function renderTitle(tick){
    const grad=ctx.createLinearGradient(0,0,0,PH);grad.addColorStop(0,'#213c57');grad.addColorStop(.66,'#63877b');grad.addColorStop(1,'#c6b88c');
    ctx.fillStyle=grad;ctx.fillRect(0,0,PW,PH);
    // layered night-sky silhouettes, stars and a bright moon
    pix(250,17,28,28,'#f4da99');pix(245,22,36,17,'#f4da99');pix(255,13,19,36,'#f4da99');
    for(let i=0;i<45;i++){let x=Math.floor(hash(i,4)*PW),y=Math.floor(hash(i,13)*100);pix(x,y,i%5===0?2:1,1,'#f4e5b6');}
    for(let i=0;i<24;i++){let x=i*17-15,h=15+hash(i,41)*40;pix(x,120-h,13,h,'#315761');pix(x+3,111-h,7,10,'#385f67');}
    pix(0,121,PW,59,'#456a61');
    for(let i=0;i<36;i++){let x=i*12-7,h=5+hash(i,7)*14;pix(x,142-h,7,h,'#365d56');}
    for(let i=0;i<40;i++){let x=hash(i,26)*PW,y=140+hash(i,48)*40;pix(x,y,2,2,i%3?'#78957a':'#d6b979');}
    ctx.save();ctx.globalAlpha=.95;
    ctx.drawImage(getMonsterSprite(1,32),31,60+Math.sin(tick*.003)*4,56,56);
    ctx.drawImage(getMonsterSprite(2,32),236,74-Math.sin(tick*.004)*4,54,54);
    ctx.restore();
    // engraved title plate
    pix(53,31,215,59,'#213e4b');pix(56,34,209,53,'#e4cb91');pix(59,37,203,47,'#334e57');
    fText('ECHO',160,57,26,'#f4d8a0','center');
    fText('CHRONIKEN',160,77,19,'#e9c58c','center');
    fText('DAS ERBE DER 150 SEELEN',160,102,9,'#fff1bd','center');
    boxArt(96,126,128,24,'#e9d19d','#385b55');
    fText('▶  A  STARTEN',160,142,12,Math.floor(tick/600)%2===0?'#36574e':'#6c7755','center');
    fText('GAMEPAD  ·  WIDESCREEN EDITION',160,169,9,'#fff1c3','center');
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
    if (soundEnabled) ensureAudio();
  });
  let lastTouchMode = '';
  function updateTouchLabel() {
    if (lastTouchMode === gameState.mode) return;
    lastTouchMode = gameState.mode;
    touchALabel.textContent = ({TITLE: 'Starten', DIALOG: 'Weiter', OVERWORLD: 'Aktion', BATTLE: 'Wählen', ATTACKS:'Angriff', LEXICON: 'Info', MENU: 'Wählen'})[gameState.mode] || 'OK';
  }


  // Der Kampf-Test ist ein Sandbox-Modus. Vorheriger Spielstand bleibt im Arbeitsspeicher erhalten.
  const labPanel=document.getElementById('battle-lab-panel');
  const labAlly=document.getElementById('lab-ally');
  const labEnemy=document.getElementById('lab-enemy');
  let savedBeforeLab=null;
  const LAB_IDS=[1,2,3,5,6,7,8,9];
  for(const id of LAB_IDS){
    const s=SPECIES[id-1];
    for(const select of [labAlly,labEnemy]){
      const option=document.createElement('option');option.value=String(id);
      option.textContent=`#${String(id).padStart(3,'0')} ${s.name} · Stufe ${s.stage}`;
      select.appendChild(option);
    }
  }
  labAlly.value='1'; labEnemy.value='9';
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
    gameState.attackOrigin=null;
    gameState.caughtIds={...gameState.caughtIds};
    gameState.seenIds={...gameState.seenIds};
    const id=Number(labAlly.value),eId=Number(labEnemy.value);
    const ally=createMonsterInstance(id,Math.max(5,3+SPECIES[id-1].stage*5));
    const enemy=createMonsterInstance(eId,Math.max(4,2+SPECIES[eId-1].stage*5));
    gameState.team=[ally];
    gameState.hasStarter=true;
    gameState.mode='BATTLE';
    gameState.battle={isTrainer:false,trainerName:null,gymIndex:null,
      enemyQueue:[enemy],enemy,cursor:0,log:`Ein wildes ${SPECIES[eId-1].name} erscheint!`,animTimer:0,busy:false};
    closeLabPanel();refreshLabButtons();sfx.confirm();
  });
  // Canvas-Buttons direkt antippen, ohne eine virtuelle A-Taste verwenden zu müssen.
  canvas.addEventListener('pointerdown',e=>{
    const r=canvas.getBoundingClientRect();const x=(e.clientX-r.left)/r.width*PW,y=(e.clientY-r.top)/r.height*PH;
    if(gameState.mode==='ATTACKS'){
      const menuOnly=gameState.attackOrigin==='OVERWORLD'||gameState.attackOrigin==='MENU';
      const b=gameState.battle,ally=menuOnly?gameState.team[0]:getActiveAlly();
      if(!ally)return;
      ensureMonsterMoves(ally);
      if(x<137||x>319||y<46||y>161)return;
      const top=menuOnly?Math.max(0,Math.min(ally.moves.length-6,(gameState.freeAttackCursor||0)-3)):(b.attackTop||0);
      const index=top+Math.floor((y-47)/18);
      if(index<0||index>=ally.moves.length)return;
      if(menuOnly)gameState.freeAttackCursor=index;else b.attackCursor=index;
      if(x>289){attackReorder(1);return;}
      if(x>271){attackReorder(-1);return;}
      if(!menuOnly)useSelectedAttack();
      return;
    }
    if(gameState.mode!=='BATTLE'||!gameState.battle||gameState.battle.busy)return;
    if(y<121||x<163)return;
    const col=x>=242?1:0,row=y>=148?1:0;
    gameState.battle.cursor=row*2+col;
    executeBattleAction(gameState.battle.cursor);
  });
  
    window.echoBattleLab={start(allyId=1,enemyId=9){labAlly.value=String(allyId);labEnemy.value=String(enemyId);document.getElementById('lab-start').click();}, stop:exitLab, status:()=>({active:!!savedBeforeLab,mode:gameState.mode,ally:gameState.team[0]?.id,enemy:gameState.battle?.enemy?.id})};

  window.tvControllerInput=(cmd)=>handleCommand(cmd);
  window.echoQASnapshot=()=>({mode:gameState.mode,player:{...gameState.player},starter:gameState.hasStarter,team:gameState.team.map(m=>({id:m.id,lv:m.lv,hp:m.hp,moves:m.moves})),dialogPages:gameState.dialogQueue.length,battle:gameState.battle?{enemy:gameState.battle.enemy?.id,busy:gameState.battle.busy,cursor:gameState.battle.cursor}:null});
  if(gameState.dialogQueue.length>0 || gameState.mode==='OVERWORLD'){
    // A clean title screen on every launch; continuation stays in existing state.
    gameState.mode='TITLE';
  }

  // --- HAUPTSCHLEIFE (GAME LOOP) ---
  function loop(tick) {
    pollGamepad(tick);
    updateTouchLabel();

    if (gameState.mode === 'TITLE') {
      renderTitle(tick);
    } else if (gameState.mode === 'OVERWORLD') {
      renderOverworld(tick);
    } else if (gameState.mode === 'DIALOG') {
      renderOverworld(tick);
      renderDialog();
    } else if (gameState.mode === 'BATTLE'||gameState.mode==='ATTACKS') {
      if(gameState.mode==='ATTACKS'&&['OVERWORLD','MENU'].includes(gameState.attackOrigin))renderOverworld(tick);
      else renderBattle(tick);
      if(gameState.mode==='ATTACKS')renderAttackBook(tick);
    } else if (gameState.mode === 'LEXICON') {
      renderLexicon();
    } else if (gameState.mode === 'MENU') {
      renderOverworld(tick);
      renderMenu();
    }

    requestAnimationFrame(loop);
  }

  requestAnimationFrame(loop);
})();

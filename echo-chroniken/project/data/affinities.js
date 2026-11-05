/* Echo-Chroniken original affinity system. Data reviewed against 150-slot artwork atlas.
   Internal legacy labels (FLUT, WURZEL, AETHER) remain accepted for old saves/skills.
   The 150-entry map is explicit; no old "FLUT by default" assumptions are used. */
(() => {
  const TYPE_INFO = Object.freeze({
    NORMAL:  {name:'Normal', symbol:'◆', color:'#8c938e'},
    FLAMME:  {name:'Feuer',  symbol:'♨', color:'#d96838'},
    WASSER:  {name:'Wasser', symbol:'≈', color:'#398ec5'},
    ERDE:    {name:'Erde',   symbol:'▲', color:'#ac8856'},
    NATUR:   {name:'Natur',  symbol:'♣', color:'#469b55'},
    EIS:     {name:'Eis',    symbol:'❄', color:'#73b9d9'},
    LUFT:    {name:'Luft',   symbol:'➤', color:'#83aba3'},
    BLITZ:   {name:'Blitz',  symbol:'ϟ', color:'#dab037'},
    LICHT:   {name:'Licht',  symbol:'☼', color:'#e6b64a'},
    SCHATTEN:{name:'Schatten',symbol:'☾',color:'#74568e'},
    PSYCHO:  {name:'Psycho', symbol:'◉', color:'#bf689c'},
    GEIST:   {name:'Geist',  symbol:'✧', color:'#746dc4'}
  });
  const ALIASES={FLUT:'WASSER',WURZEL:'NATUR',AETHER:'GEIST'};
  const normalize=(name)=>ALIASES[name]||name||'NORMAL';
  // Each rule names attacking type -> target types. The element chart is original
  // and non-binary: some matchups are neutral, and two defenders multiply.
  const STRONG={
    FLAMME:['NATUR','EIS','SCHATTEN'],
    WASSER:['FLAMME','ERDE'],
    ERDE:['FLAMME','BLITZ'],
    NATUR:['WASSER','ERDE'],
    EIS:['NATUR','LUFT'],
    LUFT:['NATUR','PSYCHO'],
    BLITZ:['WASSER','LUFT'],
    LICHT:['SCHATTEN','GEIST'],
    SCHATTEN:['LICHT','PSYCHO'],
    PSYCHO:['GEIST','NORMAL'],
    GEIST:['PSYCHO'],
    NORMAL:[]
  };
  const WEAK={
    FLAMME:['WASSER','ERDE'],
    WASSER:['NATUR','BLITZ'],
    ERDE:['WASSER','NATUR'],
    NATUR:['FLAMME','EIS','LUFT'],
    EIS:['FLAMME','ERDE'],
    LUFT:['EIS','BLITZ'],
    BLITZ:['ERDE','NATUR'],
    LICHT:['PSYCHO'],
    SCHATTEN:['FLAMME','LICHT'],
    PSYCHO:['SCHATTEN','LUFT'],
    GEIST:['LICHT','SCHATTEN'],
    NORMAL:[]
  };
  // Primary/secondary affinities assigned from the real art and evolutionary
  // families. A single entry is allowed, but all 150 are specified manually.
  const entries=[
    ['LICHT','GEIST'],       // 001 Miora, spirit of light
    ['LICHT','GEIST'],       // 002 Seelara
    ['LICHT','GEIST'],       // 003 Maternalis
    ['GEIST','BLITZ'],       // 004 Glimmerpfote
    ['NORMAL','PSYCHO'],     // 005 Hasengeist I
    ['NORMAL','PSYCHO'],     // 006 Hasengeist II
    ['SCHATTEN','GEIST'],    // 007 Schattenkatze I
    ['SCHATTEN','GEIST'],    // 008 Schattenkatze II
    ['SCHATTEN','GEIST'],    // 009 Schattenkatze III
    ['SCHATTEN','GEIST'],    // 010 Nachtpfote
    ['GEIST','PSYCHO'],      // 011 Katzengeist I
    ['GEIST','PSYCHO'],      // 012 Katzengeist II
    ['LICHT','LUFT'],        // 013 Engelsgeist I
    ['LICHT','LUFT'],        // 014 Engelsgeist II
    ['LICHT','GEIST'],       // 015 Lichtflämmchen
    ['GEIST','FLAMME'],      // 016 Fuchsgeist I
    ['GEIST','FLAMME'],      // 017 Fuchsgeist II
    ['NATUR','GEIST'],       // 018 Kürbisgeist I
    ['NATUR','GEIST'],       // 019 Kürbisgeist II
    ['WASSER','GEIST'],      // 020 Nebelflöckchen
    ['EIS','SCHATTEN'],      // 021 Wolfsgeist I
    ['EIS','SCHATTEN'],      // 022 Wolfsgeist II
    ['FLAMME'],             // 023 Feuerfuchs I
    ['FLAMME'],             // 024 Feuerfuchs II
    ['FLAMME','GEIST'],      // 025 Feuerfuchs III
    ['WASSER','LUFT'],       // 026 Gischtflöckchen
    ['NATUR','LICHT'],       // 027 Hirschgeist I
    ['NATUR','LICHT'],       // 028 Hirschgeist II
    ['GEIST','ERDE'],        // 029 Skelett-Hund I
    ['GEIST','ERDE'],        // 030 Skelett-Hund II
    ['GEIST','ERDE'],        // 031 Skelett-Hund III
    ['SCHATTEN','GEIST'],    // 032 Schattenwuschel
    ['LUFT','PSYCHO'],       // 033 Eulengeist I
    ['LUFT','PSYCHO'],       // 034 Eulengeist II
    ['EIS','LUFT'],          // 035 Eiskauz I
    ['EIS','LUFT'],          // 036 Eiskauz II
    ['NORMAL','PSYCHO'],     // 037 Rosahoppel
    ['LUFT','GEIST'],        // 038 Fledermausgeist I
    ['LUFT','GEIST'],        // 039 Fledermausgeist II
    ['GEIST','LUFT'],        // 040 Knochenrabe I
    ['GEIST','LUFT'],        // 041 Knochenrabe II
    ['NORMAL','FLAMME'],     // 042 Flammenlöffel
    ['NORMAL','GEIST'],      // 043 Mäusegeist I
    ['NORMAL','GEIST'],      // 044 Mäusegeist II
    ['WASSER','GEIST'],      // 045 Nebelhund I
    ['WASSER','GEIST'],      // 046 Nebelhund II
    ['WASSER','GEIST'],      // 047 Nebelhund III
    ['SCHATTEN','FLAMME'],   // 048 Dunkelhoppel
    ['NORMAL','EIS'],        // 049 Bärengeist I
    ['NORMAL','EIS'],        // 050 Bärengeist II
    ['FLAMME','GEIST'],      // 051 Flammenfuchs I
    ['FLAMME','GEIST'],      // 052 Flammenfuchs II
    ['FLAMME','GEIST'],      // 053 Flammenfuchs III
    ['NATUR','WASSER'],      // 054 Tauhorn
    ['NORMAL','GEIST'],      // 055 Waschbärgeist I
    ['NORMAL','GEIST'],      // 056 Waschbärgeist II
    ['NATUR','LICHT'],       // 057 Waldhirsch I
    ['NATUR','LICHT'],       // 058 Waldhirsch II
    ['LICHT','NATUR'],       // 059 Mondkitz
    ['FLAMME','NORMAL'],     // 060 Rotpandageist I
    ['FLAMME','NORMAL'],     // 061 Rotpandageist II
    ['WASSER','GEIST'],      // 062 Nebelwyrm I
    ['WASSER','GEIST'],      // 063 Nebelwyrm II
    ['SCHATTEN','NATUR'],    // 064 Nachtgeweih
    ['WASSER','EIS'],        // 065 Robbengeist I
    ['WASSER','EIS'],        // 066 Robbengeist II
    ['GEIST','ERDE'],        // 067 Zombiehase I
    ['GEIST','ERDE'],        // 068 Zombiehase II
    ['GEIST','ERDE'],        // 069 Zombiehase III
    ['FLAMME','BLITZ'],      // 070 Funkenfähe
    ['LUFT','SCHATTEN'],     // 071 Rabengeist I
    ['LUFT','SCHATTEN'],     // 072 Rabengeist II
    ['EIS','SCHATTEN'],      // 073 Eiswolf I
    ['EIS','SCHATTEN'],      // 074 Eiswolf II
    ['EIS','SCHATTEN'],      // 075 Eiswolf III
    ['FLAMME','LICHT'],      // 076 Sonnenwedel
    ['NATUR','NORMAL'],      // 077 Eichhörnchengeist I
    ['NATUR','NORMAL'],      // 078 Eichhörnchengeist II
    ['GEIST','ERDE'],        // 079 Knochenkatze I
    ['GEIST','ERDE'],        // 080 Knochenkatze II
    ['FLAMME','SCHATTEN'],   // 081 Kohlenschweif
    ['SCHATTEN','PSYCHO'],   // 082 Schattenhase I
    ['SCHATTEN','PSYCHO'],   // 083 Schattenhase II
    ['ERDE','GEIST'],        // 084 Knochenhase I
    ['ERDE','GEIST'],        // 085 Knochenhase II
    ['LUFT','LICHT'],        // 086 Wolkeneulchen
    ['LICHT','PSYCHO'],      // 087 Einhorngeist I
    ['LICHT','PSYCHO'],      // 088 Einhorngeist II
    ['SCHATTEN','LUFT'],     // 089 Schattenfledermaus I
    ['SCHATTEN','LUFT'],     // 090 Schattenfledermaus II
    ['SCHATTEN','LUFT'],     // 091 Schattenfledermaus III
    ['PSYCHO','LUFT'],       // 092 Lavendelflaum
    ['ERDE','GEIST'],        // 093 Stiergeist I
    ['ERDE','GEIST'],        // 094 Stiergeist II
    ['WASSER','GEIST'],      // 095 Geisterqualle I
    ['WASSER','GEIST'],      // 096 Geisterqualle II
    ['WASSER','GEIST'],      // 097 Geisterqualle III
    ['SCHATTEN','LUFT'],     // 098 Schattenfeder
    ['ERDE','NATUR'],        // 099 Widdergeist I
    ['ERDE','NATUR'],        // 100 Widdergeist II
    ['GEIST','LUFT'],        // 101 Knocheneule I
    ['GEIST','LUFT'],        // 102 Knocheneule II
    ['PSYCHO','LUFT'],       // 103 Mondflatter
    ['FLAMME','LUFT'],       // 104 Drachengeist I
    ['FLAMME','LUFT'],       // 105 Drachengeist II
    ['ERDE','GEIST'],        // 106 Knochenhirsch I
    ['ERDE','GEIST'],        // 107 Knochenhirsch II
    ['SCHATTEN','LUFT'],     // 108 Nachtflatter
    ['WASSER','GEIST'],      // 109 Fischgeist I
    ['WASSER','GEIST'],      // 110 Fischgeist II
    ['WASSER','LICHT'],      // 111 Quellflosse
    ['ERDE','WASSER'],       // 112 Schildkrötengeist I
    ['ERDE','WASSER'],       // 113 Schildkrötengeist II
    ['WASSER','BLITZ'],      // 114 Flutwirbel
    ['SCHATTEN','FLAMME'],   // 115 Dämonenfuchs I
    ['SCHATTEN','FLAMME'],   // 116 Dämonenfuchs II
    ['WASSER','SCHATTEN'],   // 117 Tiefenwyrm
    ['SCHATTEN','GEIST'],    // 118 Schattenhund I
    ['SCHATTEN','GEIST'],    // 119 Schattenhund II
    ['ERDE','WASSER'],       // 120 Schimmerpanzer
    ['FLAMME','PSYCHO'],     // 121 Flammenhase I
    ['FLAMME','PSYCHO'],     // 122 Flammenhase II
    ['ERDE','NATUR'],        // 123 Moorschild
    ['FLAMME','LICHT'],      // 124 Phönixeule I
    ['FLAMME','LICHT'],      // 125 Phönixeule II
    ['ERDE','SCHATTEN'],     // 126 Gruftpanzer
    ['LICHT','LUFT'],        // 127 Himmelsmiez
    ['LICHT','LUFT'],        // 128 Engelschnurr
    ['SCHATTEN','GEIST'],    // 129 Dunkelhalo
    ['NORMAL','LICHT'],      // 130 Glockenkalb
    ['NORMAL','NATUR'],      // 131 Wiesenbimmel
    ['ERDE','EIS'],          // 132 Knochenstier
    ['LUFT','LICHT'],        // 133 Wolkenpiep
    ['WASSER','LUFT'],       // 134 Gischtpiep
    ['BLITZ','LUFT'],        // 135 Sturmschnabel
    ['NORMAL','PSYCHO'],     // 136 Rosagrunzer
    ['GEIST','ERDE'],        // 137 Knochenschnüff
    ['SCHATTEN','PSYCHO'],   // 138 Schattenborste
    ['NORMAL','GEIST'],      // 139 Ringelgeist
    ['SCHATTEN','PSYCHO'],   // 140 Dämmerstreif
    ['SCHATTEN','GEIST'],    // 141 Nachtringel
    ['NATUR','PSYCHO'],      // 142 Rosenlöffel
    ['LICHT','PSYCHO'],      // 143 Flimmerhase
    ['FLAMME','NORMAL'],     // 144 Glutohren
    ['EIS','ERDE'],          // 145 Froststachel
    ['EIS','WASSER'],        // 146 Eisschauer
    ['NATUR','SCHATTEN'],    // 147 Dornschatten
    ['NATUR','FLAMME'],      // 148 Funkennuss, ember-leaf spirit
    ['NATUR','LUFT'],        // 149 Wolkennuss
    ['SCHATTEN','NATUR']     // 150 Nachtsammler
  ];
  if(entries.length!==150)throw new Error('Affinity list must contain exactly 150 creatures');
  entries.forEach((types,index)=>{
    if(!types.length||types.length>2||new Set(types).size!==types.length||
      types.some(type=>!TYPE_INFO[type]))throw new Error('Invalid types for species '+(index+1));
    if(window.ECHO_SPECIES?.[index])window.ECHO_SPECIES[index].affinities=types.slice();
  });
  const typesFor=monsterOrSpecies=>{
    const sp=monsterOrSpecies&&Number.isFinite(monsterOrSpecies.id)&&window.ECHO_SPECIES?
      window.ECHO_SPECIES[monsterOrSpecies.id-1]:monsterOrSpecies;
    return sp?.affinities?.map(normalize)||[normalize(sp?.type)];
  };
  function effectiveness(moveType,defender) {
    const offense=normalize(moveType),defense=Array.isArray(defender)?defender.map(normalize):typesFor(defender);
    const raw=defense.reduce((product,type)=>product*(STRONG[offense]?.includes(type)?1.5:WEAK[offense]?.includes(type)?.65:1),1);
    return Math.round(Math.max(.45,Math.min(2.25,raw))*100)/100;
  }
  function stab(moveType,user) {return typesFor(user).includes(normalize(moveType))?1.18:1;}
  function label(mult){return mult>1.05?'SEHR GUT':mult<.95?'SCHWACH':'NEUTRAL';}
  function compatible(learner,skillType){
    const target=normalize(skillType),own=typesFor(learner);
    if(own.includes(target)||['NORMAL','PSYCHO','GEIST'].includes(target))return true;
    const cross={
      FLAMME:['ERDE','NATUR','LICHT','GEIST','PSYCHO'],
      WASSER:['NATUR','ERDE','EIS','LUFT','GEIST'],
      ERDE:['NATUR','WASSER','FLAMME','NORMAL','GEIST'],
      NATUR:['WASSER','ERDE','NORMAL','LUFT','LICHT'],
      EIS:['WASSER','LUFT','SCHATTEN','GEIST'],
      LUFT:['BLITZ','EIS','LICHT','PSYCHO','GEIST'],
      BLITZ:['LUFT','FLAMME','WASSER','PSYCHO'],
      LICHT:['GEIST','PSYCHO','LUFT','NATUR'],
      SCHATTEN:['GEIST','PSYCHO','FLAMME','LUFT']
    };
    return own.some(type=>cross[target]?.includes(type));
  }
  window.EchoTypes=Object.freeze({
    INFO:TYPE_INFO,ASSIGNMENTS:entries,STRONG,WEAK,normalize,typesFor,effectiveness,stab,label,compatible
  });
})();

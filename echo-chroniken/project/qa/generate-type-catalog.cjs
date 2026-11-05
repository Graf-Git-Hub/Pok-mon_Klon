// Regenerate the complete human-readable 150-species, moves, and rune catalog.
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const env={window:{}};for(const f of ['data/species.js','data/affinities.js','data/skills.js'])
  vm.runInNewContext(fs.readFileSync(path.join(root,f),'utf8'),env);
const A=env.window.EchoTypes,S=env.window.EchoSkillbook,all=env.window.ECHO_SPECIES;
const typ=t=>A.INFO[t]?.name||t;
const engine=fs.readFileSync(path.join(root,'src/game.js'),'utf8');
const moveStart=engine.indexOf('  const ATTACKS = {')+'  const ATTACKS = '.length;
const moveEnd=engine.indexOf('\n  };',moveStart)+'\n  }'.length;
const BASE_MOVES=vm.runInNewContext('('+engine.slice(moveStart,moveEnd)+')');
const ALL_MOVES={...BASE_MOVES,...S.ATTACKS};
const short=id=>ALL_MOVES[id]?.name||id.replace(/[A-Z]/g,x=>' '+x);
const learnedList=sp=>{
 const types=A.typesFor(sp),primary=S.TYPE_SKILLS[types[0]]||[],secondary=S.TYPE_SKILLS[types[1]]||[];
 const entries=primary.map((id,i)=>({lv:[1,7,11,16,24][i]||30,id}));
 entries.push({lv:3,id:'seelenstups'},{lv:9,id:'sternenstaub'},{lv:19,id:'echowelle'},{lv:30,id:'astralsturm'});
 for(let i=0;i<Math.min(secondary.length,3);i++)entries.push({lv:[8,18,28][i],id:secondary[i]});
 return entries.sort((a,b)=>a.lv-b.lv).filter((v,i,a)=>a.findIndex(y=>y.id===v.id)===i)
  .map(x=>'Lv.'+x.lv+' '+short(x.id)).join(', ');
};
const lines=[
 '# Echo-Chroniken: Element-, Attacken- und Runenverzeichnis (150 Wesen)',
 '',
 'Dieses Verzeichnis wird aus den tatsächlich verwendeten Spielregeln erzeugt. Die 150 eindeutigen Typ-Zuweisungen entstanden nach Sichtung des vorhandenen 10×15-Sprite-Atlas. Das Bildmotiv ist entscheidend, nicht die bisherige pauschale FLUT-Klassifizierung.',
 '',
 '## Spielregeln',
 '',
 '- **12 Elemente:** Normal, Feuer, Wasser, Erde, Natur, Eis, Luft, Blitz, Licht, Schatten, Psycho, Geist.',
 '- **Höchst zwei Wesenstypen** pro Art. Sie bestimmen Widerstände und Schwächen. Eine Attacke hat unabhängig davon ihren eigenen Typ.',
 '- **Eigener Elementbonus:** passende Attacken verursachen 18 % mehr Schaden. Gegen den Gegner wirken offensive Element-Vorteile ×1,50 und Widerstände ×0,65 je gegnerischem Typ. Die kombinierte Elementwirkung ist begrenzt auf ×0,45 bis ×2,25, damit extreme Doppeltypen nicht unfair werden.',
 '- **Unbegrenztes Behalten der natürlich erlernten Stufenattacken:** Alle einmal gelernten natürlichen Angriffe bleiben im Attackenbuch. Für den Kampf werden **maximal vier** vorbereitet. Ein erneutes Ausrüsten ersetzt nur die Vorbereitung, niemals die erlernte Fähigkeit.',
 '- **Runenlehre:** zusätzlich maximal **zwei dauerhaft erlernte Runenattacken** je einzelnem Geist. Dafür muss eine seltene, verbrauchbare Rune vorhanden sein; nicht jede Rune ist für jedes Wesen geeignet.',
 '- **Runenquellen:** Einmalige, fortschrittsgebundene Belohnungen für einzigartige Trainer-/Boss-Siege, kein unendliches Farmen. Im Reisetagebuch über „Runenlehre“ und im Attackenbuch über „A Ausrüsten“ bedienbar.',
 '- **Taktische Teamauswahl:** Im Kampf zeigt „Geist“ den ganzen aktiven Trupp samt Typen, KP und bestem Typfaktor; der Wechsel verbraucht wie bisher den eigenen Zug.',
 '',
 '## Angriffs-Typentabelle',
 '',
 '| Angriff | Stark gegen | Schwach gegen |',
 '| --- | --- | --- |',
 ...Object.keys(A.INFO).map(t=>'| '+A.INFO[t].symbol+' '+typ(t)+' | '+(A.STRONG[t]||[]).map(typ).join(', ')+' | '+(A.WEAK[t]||[]).map(typ).join(', ')+' |'),
 '',
 '## Vollständige Artenübersicht',
 '',
 '| Nr. | Wesen | Stufe | Typ 1 | Typ 2 | Alle erlernbaren Level-Attacken | Lernbare Runentypen |',
 '| ---: | --- | ---: | --- | --- | --- | --- |',
 ...all.map(sp=>{
   const types=A.typesFor(sp), primary=S.TYPE_SKILLS[types[0]]?.[0],secondary=S.TYPE_SKILLS[types[1]]?.[0];
   const compatible=S.RUNES.filter(r=>A.compatible(sp,S.ATTACKS[r.id].type)).map(r=>typ(S.ATTACKS[r.id].type));
   return '| '+String(sp.id).padStart(3,'0')+' | '+sp.name+' | '+sp.stage+'/'+sp.stageCount+
     ' | '+typ(types[0])+' | '+(types[1]?typ(types[1]):'–')+' | '+learnedList(sp)+
     ' | '+[...new Set(compatible)].join(', ')+' |';
 }),
 '',
 '## Vollständiger Attackenkatalog: vorhandene und neue Fähigkeiten',
 '',
 '| Attacke | Element | Stärke | Herkunft | Beschreibung |',
 '| --- | --- | ---: | --- | --- |',
 ...Object.entries(ALL_MOVES).map(([id,m])=>{
   const rune=S.RUNES.some(r=>r.id===id);
   return '| '+m.name+' | '+typ(A.normalize(m.type))+' | '+(m.heal?'Heilung +'+m.heal:m.power)+
      ' | '+(rune?'Rune':'Level')+' | '+m.desc+' |';
 }),
 '',
 '## Runen-Fundreihenfolge',
 '',
 ...S.RUNES.map((r,i)=>String(i+1)+'. Nach '+S.AWARD_AFTER_UNIQUE_WINS[i]+' einzigartigen Trainer-/Boss-Siegen: '+r.name+' → '+S.ATTACKS[r.id].name+
  ' ('+typ(A.normalize(S.ATTACKS[r.id].type))+')'),
 '',
 '## Beispiel',
 '',
 '**Moorschild** (Erde/Natur) trifft auf **Feuerfuchs** (Feuer). Feuer wird durch Erde abgefangen, doch die Naturseite bleibt gefährdet. Mit einer erlernten **Quellschwall-Rune** (Wasser) kann Moorschild den Feuerfuchs selbst stark treffen. Ohne Wasser-Zweitaffinität erhält Moorschild für Quellschwall keinen eigenen Elementbonus.',
 '',
 '## Nicht Teil dieses Updates',
 '',
 'Es werden keine Pokémon-Grafiken, -Animationen oder geschützte spezifische Attackenbeschreibungen übernommen. Die Bediengrundsätze sind allgemein; der Zwölf-Typen-Chart und die neuen Attackennamen gehören zu Echo-Chroniken.',
 ''
];
const out=path.resolve(root,'../docs/game-design/TYPE_AND_ATTACK_CATALOG.md');
fs.writeFileSync(out,lines.join('\n'),'utf8');
const counts=Object.fromEntries(Object.keys(A.INFO).map(t=>[typ(t),all.filter(s=>A.typesFor(s).includes(t)).length]));
console.log('TYPE_CATALOG_CREATED',out,'species',all.length,'all moves',Object.keys(ALL_MOVES).length,'new moves',Object.keys(S.ATTACKS).length,'runes',S.RUNES.length,'counts',JSON.stringify(counts));

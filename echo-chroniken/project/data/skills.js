/* Echo-Chroniken original elemental attack and Rune Scroll catalog.
   Attacks learned through ordinary levels remain permanently in the book.
   Runenlehre can add at most 2 separately taught skills per creature;
   only 4 skills may be active inside a battle. */
(() => {
  const ATTACKS = {
    pfotenstups:{name:'Pfotenstups',type:'NORMAL',power:25,desc:'Ein schneller, sicherer Hieb.'},
    kreiswirbel:{name:'Kreiswirbel',type:'NORMAL',power:35,desc:'Bewegung wird zu Schwung.'},
    sprungtritt:{name:'Sprungtritt',type:'NORMAL',power:46,desc:'Schwungvoller Satz.'},
    herztrommel:{name:'Herztrommel',type:'NORMAL',power:59,desc:'Ein donnernder Herzschlag.'},
    kieselwurf:{name:'Kieselwurf',type:'ERDE',power:26,desc:'Ein scharfer kleiner Stein.'},
    felsriss:{name:'Felsriss',type:'ERDE',power:37,desc:'Der Boden reißt auf.'},
    steinmantel:{name:'Steinmantel',type:'ERDE',power:0,heal:23,desc:'Schützende Erdenergie.'},
    bergwucht:{name:'Bergwucht',type:'ERDE',power:49,desc:'Die Kraft eines Berges.'},
    erdbebenruf:{name:'Erdbebenruf',type:'ERDE',power:64,desc:'Ein tiefer Schlag aus Fels.'},
    reifkorn:{name:'Reifkorn',type:'EIS',power:26,desc:'Ein gefrorener Lichtfunke.'},
    frostbiss:{name:'Frostbiss',type:'EIS',power:37,desc:'Kälte zieht durch den Raum.'},
    kristallgrat:{name:'Kristallgrat',type:'EIS',power:49,desc:'Eisspitzen wachsen hervor.'},
    winterkrone:{name:'Winterkrone',type:'EIS',power:64,desc:'Ein kurzer, harter Winter.'},
    federstoß:{name:'Federstoß',type:'LUFT',power:26,desc:'Scharfe Luft und Federn.'},
    windklinge:{name:'Windklinge',type:'LUFT',power:37,desc:'Eine Klinge aus Wind.'},
    wolkensprung:{name:'Wolkensprung',type:'LUFT',power:49,desc:'Ein Wirbel aus Wolken.'},
    himmelsbrausen:{name:'Himmelsbrausen',type:'LUFT',power:64,desc:'Ein Brausen über dem Wald.'},
    knisterkuss:{name:'Knisterkuss',type:'BLITZ',power:26,desc:'Ein kleiner elektrischer Impuls.'},
    blitzstich:{name:'Blitzstich',type:'BLITZ',power:37,desc:'Ein blitzschneller Strahl.'},
    donnerklang:{name:'Donnerklang',type:'BLITZ',power:49,desc:'Donner schlägt im Takt.'},
    gewitterherz:{name:'Gewitterherz',type:'BLITZ',power:64,desc:'Ein ganzer Gewitterchor.'},
    gedankenfunke:{name:'Gedankenfunke',type:'PSYCHO',power:26,desc:'Ein Bild trifft den Geist.'},
    traumfaden:{name:'Traumfaden',type:'PSYCHO',power:37,desc:'Gedanken werden zu Fäden.'},
    spiegelsturz:{name:'Spiegelsturz',type:'PSYCHO',power:49,desc:'Ein erschütterndes Trugbild.'},
    seelenrätsel:{name:'Seelenrätsel',type:'PSYCHO',power:64,desc:'Ein Rätsel ohne Ausweg.'},
    spuksaum:{name:'Spuksaum',type:'GEIST',power:29,desc:'Ein flatternder Geisterschleier.'},
    geistertritt:{name:'Geistertritt',type:'GEIST',power:40,desc:'Ein Schritt durch die Wand.'},
    seelentor:{name:'Seelentor',type:'GEIST',power:64,desc:'Alte Echos brechen hervor.'},
    quellschwall:{name:'Quellschwall',type:'WASSER',power:41,desc:'Eine fremde Quelle bricht auf.'},
    kohlenregen:{name:'Kohlenregen',type:'FLAMME',power:41,desc:'Warme Kohlen tanzen im Wind.'},
    erdpanzer:{name:'Erdpanzer',type:'ERDE',power:41,desc:'Ein Ring aus Stein drückt zu.'},
    blütenbogen:{name:'Blütenbogen',type:'NATUR',power:41,desc:'Ein Bogen aus jungen Trieben.'},
    eisspiegel:{name:'Eisspiegel',type:'EIS',power:41,desc:'Kälte wirft das Licht zurück.'},
    luftsichel:{name:'Luftsichel',type:'LUFT',power:41,desc:'Eine Sichel aus Sturm.'},
    stromsprung:{name:'Stromsprung',type:'BLITZ',power:41,desc:'Ein Strombogen springt über.'},
    sonnenfaden:{name:'Sonnenfaden',type:'LICHT',power:41,desc:'Ein Lichtfaden zieht Kreise.'},
    nachtflüstern:{name:'Nachtflüstern',type:'SCHATTEN',power:41,desc:'Ein Geheimnis aus Dunkelheit.'},
    kopfkino:{name:'Kopfkino',type:'PSYCHO',power:41,desc:'Ein trügerisches Gedankenbild.'},
    echosprung:{name:'Echosprung',type:'GEIST',power:41,desc:'Ein Echo schlägt zurück.'},
    pfotentanz:{name:'Pfotentanz',type:'NORMAL',power:41,desc:'Jeder Schritt sitzt.'}
  };
  const TYPE_SKILLS={
    NORMAL:['pfotenstups','kreiswirbel','sprungtritt','herztrommel'],
    FLAMME:['glutfunken','funkenflug','feuerwirbel','phönixstoß'],
    WASSER:['wasserperle','wellenschlag','gezeitenruf','sturmflut'],
    ERDE:['kieselwurf','felsriss','steinmantel','bergwucht','erdbebenruf'],
    NATUR:['blattschnips','rankengriff','waldsegen','mooshammer','wurzelsturm'],
    EIS:['reifkorn','frostbiss','kristallgrat','winterkrone'],
    LUFT:['federstoß','windklinge','wolkensprung','himmelsbrausen'],
    BLITZ:['knisterkuss','blitzstich','donnerklang','gewitterherz'],
    LICHT:['lichtfunke','mondschein','heilflimmern','sternenfall','sonnenchor'],
    SCHATTEN:['schattentipp','nebelbiss','nachthieb','finsternis'],
    PSYCHO:['gedankenfunke','traumfaden','spiegelsturz','seelenrätsel'],
    GEIST:['spuksaum','geistertritt','echowelle','seelentor']
  };
  const RUNES=[
    {id:'kohlenregen',name:'Kohlenregen-Rune',minChapter:2},
    {id:'quellschwall',name:'Quellschwall-Rune',minChapter:2},
    {id:'kopfkino',name:'Kopfkino-Rune',minChapter:3},
    {id:'erdpanzer',name:'Erdpanzer-Rune',minChapter:4},
    {id:'blütenbogen',name:'Blütenbogen-Rune',minChapter:4},
    {id:'eisspiegel',name:'Eisspiegel-Rune',minChapter:5},
    {id:'luftsichel',name:'Luftsichel-Rune',minChapter:5},
    {id:'stromsprung',name:'Stromsprung-Rune',minChapter:6},
    {id:'sonnenfaden',name:'Sonnenfaden-Rune',minChapter:7},
    {id:'nachtflüstern',name:'Nachtflüstern-Rune',minChapter:8},
    {id:'echosprung',name:'Echosprung-Rune',minChapter:9},
    {id:'pfotentanz',name:'Pfotentanz-Rune',minChapter:10}
  ];
  // Main-story unique-boss milestones: all twelve runes are earnable by the finale.
  // Twelve finite awards across 16 unique story/optional trainer victories.
  const AWARD_AFTER_UNIQUE_WINS=Object.freeze([1,2,3,4,5,6,8,9,10,12,14,16]);
  const RUNE_IDS=RUNES.map(x=>x.id);
  // Optional tactical effects; never tied to save-schema or creature IDs.
  // Statuses live only in a single battle and refresh rather than stack.
  const STATUS_RULES=Object.freeze({
    feuerwirbel:{kind:'burn',chance:.30,turns:3,label:'BRAND'},
    phönixstoß:{kind:'burn',chance:.40,turns:3,label:'BRAND'},
    kohlenregen:{kind:'burn',chance:.50,turns:3,label:'BRAND'},
    frostbiss:{kind:'weak',chance:.30,turns:2,label:'FROST'},
    winterkrone:{kind:'weak',chance:.50,turns:2,label:'FROST'},
    blitzstich:{kind:'weak',chance:.25,turns:2,label:'SCHOCK'},
    gewitterherz:{kind:'weak',chance:.40,turns:2,label:'SCHOCK'},
    seelenrätsel:{kind:'weak',chance:.45,turns:2,label:'VERWIRRT'},
    steinmantel:{kind:'guard',chance:1,turns:1,label:'SCHUTZ',self:true},
    eisspiegel:{kind:'guard',chance:1,turns:1,label:'SCHUTZ',self:true},
    pfotentanz:{kind:'guard',chance:1,turns:1,label:'SCHUTZ',self:true},
    waldsegen:{kind:'regen',chance:1,turns:2,label:'NACHKLANG',self:true}
  });
  const newState=()=>({burn:0,poison:0,paralysis:0,weak:0,weakLabel:'',guard:0,regen:0});
  function state(b,monster){
    if(!b.effects)b.effects=[];
    let slot=b.effects.find(x=>x.monster===monster);
    if(!slot){slot={monster,status:newState()};b.effects.push(slot);}
    return slot.status;
  }
  function apply(b,attacker,defender,moveId,roll=Math.random){
    const rule=STATUS_RULES[moveId];
    if(!rule)return '';
    const recipient=rule.self?attacker:defender;
    if(!recipient||recipient.hp<=0||roll()>=rule.chance)return '';
    const s=state(b,recipient);
    s[rule.kind]=Math.max(s[rule.kind]||0,rule.turns);
    if(rule.kind==='weak')s.weakLabel=rule.label;
    return rule.label;
  }
  function adjustedDamage(b,attacker,defender,raw){
    const a=state(b,attacker),d=state(b,defender);
    let factor=a.weak>0?.8:1;
    if(d.guard>0){factor*=.65;d.guard=0;}
    return Math.max(2,Math.round(raw*factor));
  }
  function endAction(b,monster){
    const s=state(b,monster),events=[];
    if(s.poison>0){
      const lost=Math.min(Math.max(0,monster.hp-1),Math.max(1,Math.floor(monster.maxHp*.05)));
      monster.hp-=lost;s.poison--;if(lost)events.push('GIFT -'+lost+' HP');
    }
    if(s.paralysis>0)s.paralysis--;
    if(s.burn>0){
      // Periodic damage is capped so a status alone never KOs a creature.
      const lost=Math.min(Math.max(0,monster.hp-1),Math.max(1,Math.floor(monster.maxHp*.05)));
      monster.hp-=lost;s.burn--;if(lost)events.push('BRAND -'+lost+' HP');
    }
    if(s.regen>0){
      const healed=Math.min(monster.maxHp-monster.hp,Math.max(1,Math.ceil(monster.maxHp*.05)));
      monster.hp+=healed;s.regen--;if(healed)events.push('NACHKLANG +'+healed+' HP');
    }
    if(s.weak>0){s.weak--;if(s.weak===0)s.weakLabel='';}
    return events.join(' / ');
  }
  function labels(b,monster){
    // Read-only UI/QA lookup: rendering must not create combat state.
    const s=b.effects?.find(x=>x.monster===monster)?.status;
    if(!s)return '';
    const parts=[];
    if(s.burn>0)parts.push('BRAND');
    if(s.poison>0)parts.push('GIFT');
    if(s.paralysis>0)parts.push('PARALYSE');
    if(s.weak>0)parts.push(s.weakLabel||'SCHWACH');
    if(s.guard>0)parts.push('SCHUTZ');
    if(s.regen>0)parts.push('REGEN');
    return parts.join(' + ');
  }
  const STATUS=Object.freeze({rules:STATUS_RULES,apply,adjustedDamage,endAction,labels,state});
  // Enemy tactics are deliberately transparent, bounded and save-agnostic.
  // They use approximate damage, not the future RNG or a player's hidden inputs.
  const ENEMY_AI=Object.freeze({
    estimate(user,target,move,aff,species,battle){
      if(!move||!move.power)return 0;
      const a=species[user.id-1],d=species[target.id-1];
      const raw=move.power*.205+user.lv*.48+a.atk*.17-d.def*.14;
      const modifier=aff.effectiveness(move.type,target)*aff.stab(move.type,user);
      const statuses=battle?.effects||[];
      const from=statuses.find(x=>x.monster===user)?.status;
      const to=statuses.find(x=>x.monster===target)?.status;
      const penalty=from?.weak>0?.8:1,protection=to?.guard>0?.65:1;
      return Math.max(2,Math.floor(raw*.99*modifier*penalty*protection));
    },
    choose({battle,enemy,ally,prepared,attacks,aff,species,random=Math.random}){
      const known=prepared.filter(id=>attacks[id]);
      const offensive=known.filter(id=>attacks[id].power>0);
      if(!offensive.length)return {id:'seelenstups',reason:'fallback'};
      const estimate=(user,target,move)=>ENEMY_AI.estimate(user,target,move,aff,species,battle);
      const current=offensive.map(id=>({id,damage:estimate(enemy,ally,attacks[id])*(enemy.encounterScale||1)}));
      const strongest=current.reduce((a,b)=>a.damage>=b.damage?a:b);
      // Intro opponents intentionally keep simple, readable attack choices.
      // The early area must not become harder merely because late bosses learn tactics.
      if(enemy.lv<=8){
        const ranked=offensive.slice().sort((a,b)=>
          attacks[b].power*aff.effectiveness(attacks[b].type,ally)*aff.stab(attacks[b].type,enemy)-
          attacks[a].power*aff.effectiveness(attacks[a].type,ally)*aff.stab(attacks[a].type,enemy));
        return {id:ranked[random()<.72?0:Math.min(1,ranked.length-1)],reason:'rookie-attack'};
      }
      const playerMoves=(ally.equippedMoves||ally.moves||[]).filter(id=>attacks[id]?.power>0);
      const incoming=playerMoves.length?
        Math.max(...playerMoves.map(id=>estimate(ally,enemy,attacks[id]))):
        Math.max(2,ally.lv*.5+species[ally.id-1].atk*.1);
      const healId=known.find(id=>attacks[id].heal>0);
      if(healId&&!battle?.enemyHealUsed){
        const move=attacks[healId],amount=Math.min(move.heal,enemy.maxHp-enemy.hp);
        const ward=STATUS_RULES[healId]?.kind==='guard'?.65:1;
        const afterHealingDamage=incoming*ward;
        // Healing cannot save an already hopeless fight, or waste a turn at high HP.
        // Do not skip a probable immediate knockout for a small heal.
        if(enemy.hp>0&&enemy.hp<=enemy.maxHp*.44&&
          amount>=Math.max(8,move.heal*.5)&&
          enemy.hp+amount>afterHealingDamage*.9&&
          ally.hp>strongest.damage*1.05&&
          (enemy.hp<=incoming*1.35||enemy.hp<=enemy.maxHp*.25)){
          return {id:healId,reason:'survival-heal'};
        }
      }
      const effects=battle?.effects||[];
      const onEnemy=effects.find(x=>x.monster===enemy)?.status;
      const onAlly=effects.find(x=>x.monster===ally)?.status;
      const ranked=current.map(({id,damage})=>{
        const rule=STATUS_RULES[id];let bonus=0;
        if(rule){
          if(rule.kind==='burn'&&!onAlly?.burn){
            bonus=rule.chance*Math.min(12,ally.maxHp*.05*2);
          }else if(rule.kind==='weak'&&!onAlly?.weak){
            bonus=rule.chance*Math.min(10,incoming*.35);
          }else if(rule.kind==='guard'&&!onEnemy?.guard){
            bonus=Math.min(12,incoming*.35)*(enemy.hp<=incoming*1.5?1:.45);
          }else if(rule.kind==='regen'&&!onEnemy?.regen){
            bonus=Math.min(10,Math.max(0,enemy.maxHp-enemy.hp)*.12);
          }
        }
        // Finishing the fight now is worth more than a future status tick.
        const lethal=damage>=ally.hp?100:0;
        return {id,damage,score:damage+bonus+lethal,bonus};
      }).sort((a,b)=>b.score-a.score);
      const runnerUp=ranked[1];
      const chosen=runnerUp&&runnerUp.score>=ranked[0].score*.83&&random()<.16?
        runnerUp:ranked[0];
      return {id:chosen.id,reason:chosen.bonus>0?'effective-status':'element-damage'};
    }
  });
  const ATTACK_TYPES=Object.freeze(Object.fromEntries(
    Object.entries(ATTACKS).map(([id,v])=>[id,v.type])));
  window.EchoSkillbook=Object.freeze({
    ATTACKS,TYPE_SKILLS,RUNES,RUNE_IDS,ATTACK_TYPES,STATUS,ENEMY_AI,AWARD_AFTER_UNIQUE_WINS,MAX_EQUIPPED:4,MAX_RUNE_LEARNED:2
  });
})();

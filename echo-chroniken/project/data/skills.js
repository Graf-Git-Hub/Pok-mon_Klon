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
  const ATTACK_TYPES=Object.freeze(Object.fromEntries(
    Object.entries(ATTACKS).map(([id,v])=>[id,v.type])));
  window.EchoSkillbook=Object.freeze({
    ATTACKS,TYPE_SKILLS,RUNES,RUNE_IDS,ATTACK_TYPES,AWARD_AFTER_UNIQUE_WINS,MAX_EQUIPPED:4,MAX_RUNE_LEARNED:2
  });
})();


import React, { useEffect, useMemo, useState } from "react";

const clamp = (v, min = 0, max = 100) => Math.max(min, Math.min(max, v));
const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const chance = (p) => Math.random() * 100 < p;
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const id = () => Math.random().toString(36).slice(2) + Date.now().toString(36);
const copy = (x) => JSON.parse(JSON.stringify(x));
const money = (n) => `${Math.round(n).toLocaleString("de-DE")}G`;

const DB = {
  names: ["Arian","Mira","Konrad","Elena","Roderik","Freya","Hagen","Liora","Tilo","Adela","Cassian","Nyra","Viktor","Sera","Levin","Runa","Darian","Ilyra"],
  surnames: ["Falk","Dorn","Krone","Eisen","Raben","Sturm","Blut","Silber","Grauwolf","Asche"],
  cities: ["Rabenfurt","Graustein","Nordhain","Kaltwasser","Dornwacht","Kronstadt","Silberhafen","Aschetor"],
  houses: ["Haus Falkenherz","Haus Blutmond","Haus Eisenwacht","Haus Silberhain","Haus Dornkrone","Haus Rabensturm","Haus Aschewolf"],
  traits: ["ehrgeizig","loyal","neidisch","grausam","gierig","listig","mutig","rachsüchtig","charmant","fanatisch","misstrauisch","brillant"],
  roles: ["Elternteil","Geschwister","Wache","Bandenführer","Adelige","Söldner","Priester","Händler","Spion","Mafiaboss","Rivale","Freund"],
  eras: ["Mittelalter","Modern","Cyberpunk"],
  ideologies: ["Monarchie","Republik","Theokratie","Kapitalismus","Anarchie","Militarismus","Technokratie"],
  jobs: [
    {name:"Tagelöhner", pay:[4,16], req:g=>true, skill:"labor"},
    {name:"Schmied", pay:[10,35], req:g=>g.stats.health>25, skill:"craft"},
    {name:"Stadtwache", pay:[14,45], req:g=>g.skills.combat>14, skill:"combat"},
    {name:"Söldner", pay:[25,90], req:g=>g.skills.combat>25, skill:"combat"},
    {name:"Spion", pay:[30,110], req:g=>g.skills.intrigue>25, skill:"intrigue"},
    {name:"Händler", pay:[25,120], req:g=>g.skills.diplomacy>18, skill:"trade"},
    {name:"Ritter", pay:[60,220], req:g=>g.skills.combat>50 && g.stats.reputation>35, skill:"leadership"},
    {name:"Hofberater", pay:[80,300], req:g=>g.skills.diplomacy>45, skill:"diplomacy"},
    {name:"Influencer", pay:[30,400], req:g=>g.social.followers>2000, skill:"fame"},
    {name:"CEO", pay:[200,1200], req:g=>g.companies.length>0, skill:"trade"},
    {name:"Hacker", pay:[80,700], req:g=>g.era!=="Mittelalter" && g.skills.intrigue>35, skill:"intrigue"},
    {name:"Cyber-Söldner", pay:[180,900], req:g=>g.era==="Cyberpunk" && g.skills.combat>45, skill:"combat"},
  ],
  crimes: [
    {name:"Taschendiebstahl", risk:18, reward:[10,55], heat:7},
    {name:"Einbruch", risk:32, reward:[50,240], heat:18},
    {name:"Schmuggel", risk:28, reward:[60,280], heat:15},
    {name:"Erpressung", risk:34, reward:[90,400], heat:22},
    {name:"Raubüberfall", risk:46, reward:[140,650], heat:30},
    {name:"Auftragsmord", risk:65, reward:[600,2400], heat:55},
    {name:"Geldwäsche", risk:35, reward:[240,1200], heat:20},
    {name:"Schutzgeld", risk:38, reward:[180,900], heat:25},
    {name:"Gefängnisausbruch", risk:72, reward:[0,0], heat:50},
    {name:"Kartell-Deal", risk:55, reward:[900,4000], heat:60},
  ],
  assets: [
    {name:"Kleine Hütte", type:"home", price:100, rep:4},
    {name:"Stadthaus", type:"home", price:400, rep:8},
    {name:"Villa", type:"home", price:1200, rep:14},
    {name:"Burg", type:"home", price:4000, rep:22},
    {name:"Palast", type:"home", price:12000, rep:35},
    {name:"Kriegspferd", type:"vehicle", price:300, rep:5},
    {name:"Sportwagen", type:"vehicle", price:900, rep:10},
    {name:"Yacht", type:"luxury", price:3500, rep:20},
    {name:"Privatjet", type:"luxury", price:9000, rep:30},
    {name:"Cyberbike", type:"vehicle", price:1800, rep:18},
  ],
  weapons: [
    {name:"Rostiger Dolch", power:4, price:0},
    {name:"Langschwert", power:14, price:180},
    {name:"Armbrust", power:18, price:260},
    {name:"Pistole", power:28, price:500},
    {name:"Cyber-Katana", power:42, price:2200},
  ],
  illnesses: ["Fieber","Pest","Gebrochener Arm","Trauma","Burnout","Schlaflosigkeit","Suchtkrankheit","Wahnsinn","Kriegsverletzung"],
  addictions: ["Alkohol","Glücksspiel","Drogen","Macht","Ruhm","Gewalt"],
  news: [
    "Ein König wurde ermordet.",
    "Eine Börse kollabiert.",
    "Eine Revolution beginnt.",
    "Ein Kartell übernimmt einen Hafen.",
    "Ein Kult gewinnt Macht.",
    "Ein Bürgerkrieg startet.",
    "Eine KI-Firma kontrolliert den Markt.",
    "Ein Adelshaus verliert seine Erben.",
    "Ein berühmter General desertiert.",
    "Eine Seuche breitet sich global aus.",
  ],
  factions: ["Schwarze Hand","Kirche der Flamme","Kaufmannsgilde","Königstreue Legion","Rebellenbund","Söldnergilde","Cyber-Konzern","Kartell der Küstenlande"],
  stocks: ["Eisenhandel","Gewürze","Schiffswerften","Söldnergilde","Bankhaus Krone","CyberTech","Luxusgüter","Rüstungskonzern"],
};

const MENU = [
  { id:"life", label:"Leben", icon:"🏠", sub:["Neu","Alter","Tagebuch","Profil"] },
  { id:"career", label:"Karriere", icon:"💼", sub:["Jobs","Firmen","Invest","Imperium"] },
  { id:"social", label:"Sozial", icon:"❤️", sub:["Familie","Freunde","Liebe","Rivalen"] },
  { id:"underworld", label:"Unterwelt", icon:"☠️", sub:["Crime","Mafia","Kerker","Schwarz"] },
  { id:"power", label:"Macht", icon:"👑", sub:["Politik","Krieg","Religion","Revolt"] },
  { id:"assets", label:"Besitz", icon:"🏰", sub:["Häuser","Fahrzeug","Waffen","Luxus"] },
  { id:"body", label:"Körper", icon:"🩸", sub:["Heilen","Fitness","Sucht","Krank"] },
  { id:"world", label:"Welt", icon:"🌍", sub:["Karte","Fraktion","Börse","News"] },
  { id:"app", label:"App", icon:"📱", sub:["Save","Load","PWA","Info"] },
];

function makePerson(role) {
  const name = `${pick(DB.names)} ${pick(DB.surnames)}`;
  return {
    id:id(), name, role: role || pick(DB.roles), age: rand(8,72), house: pick(DB.houses), trait: pick(DB.traits), ideology: pick(DB.ideologies),
    alive:true, relation:rand(-40,80), loyalty:rand(0,100), fear:rand(0,100), mood:rand(0,100), ambition:rand(0,100), greed:rand(0,100), romance:rand(0,100),
    wealth:rand(0,500), memories:[`Erste Begegnung mit ${name}.`], friends:[], enemies:[], children:[], married:chance(35),
  };
}
function makeWorld(era="Mittelalter") {
  return {
    regions:["Nordreich","Küstenlande","Aschewüste","Silberwald","Dornmark","Kronstadt","Stahlzone","Neonhafen"].map(name=>({
      id:id(), name, owner:pick(DB.houses), wealth:rand(20,100), danger:rand(5,100), unrest:rand(0,100), army:rand(50,1000)
    })),
    factions:DB.factions.map(name=>({id:id(), name, power:rand(15,100), relation:rand(-100,100), ideology:pick(DB.ideologies), leader:pick(DB.names)})),
    stocks:DB.stocks.map(name=>({id:id(), name, value:rand(40,180), volatility:rand(5,35), owned:0})),
    headline:pick(DB.news),
    era,
  };
}
function newGame(era=pick(DB.eras)) {
  return {
    id:id(), era, name:`${pick(DB.names)} ${pick(DB.surnames)}`, age:14, year:era==="Mittelalter"?1174:era==="Modern"?2026:2140,
    title:"Straßenkind", city:pick(DB.cities), gold:12, job:"Kein Beruf", prison:0, wanted:0, mafiaRank:"Niemand", kingdom:null,
    event:"Du wachst hungrig in einer kalten Gasse auf. Niemand interessiert sich für dein Überleben.",
    log:["Dein Leben beginnt ganz unten.","Deine Familie besitzt fast nichts.","Im Reich breiten sich Hunger, Krieg und Intrigen aus."],
    stats:{happiness:45, health:72, intelligence:51, looks:56, reputation:10, fear:5, stress:20},
    skills:{combat:8, intrigue:12, diplomacy:4, leadership:2, trade:3, craft:2, fame:0},
    social:{fame:5, followers:rand(0,5000), scandal:0, influence:10},
    assets:{home:"Keins", vehicle:"Keins", luxury:[], weapon:DB.weapons[0]},
    dynasty:{name:`Dynastie ${pick(DB.surnames)}`, prestige:rand(0,50), generations:1, heirs:[], marriages:[]},
    companies:[], addictions:[], diseases:[], followers:rand(0,25), world:makeWorld(era),
    relations:[makePerson("Elternteil"), makePerson("Geschwister"), makePerson("Bandenführer"), makePerson("Wache"), makePerson("Adelige"), makePerson("Söldner"), makePerson("Priester"), makePerson("Rivale")],
    app:{saved:false, offline:true, version:"0.2 Max PWA", installed:false}
  };
}
function withEvent(g, text) {
  const n=copy(g);
  n.event=text;
  n.log=[text,...n.log].slice(0,8);
  return n;
}
function mutateWorld(n) {
  n.world.stocks=n.world.stocks.map(s=>({...s,value:Math.max(1,s.value+rand(-s.volatility,s.volatility))}));
  n.world.factions=n.world.factions.map(f=>({...f,power:clamp(f.power+rand(-8,8)),relation:clamp(f.relation+rand(-12,12),-100,100)}));
  n.world.regions=n.world.regions.map(r=>({...r,wealth:clamp(r.wealth+rand(-6,6)),danger:clamp(r.danger+rand(-8,8)),unrest:clamp(r.unrest+rand(-10,10))}));
  n.relations=n.relations.map(p=>{
    p.age+=1; p.mood=clamp(p.mood+rand(-12,12)); p.loyalty=clamp(p.loyalty+rand(-7,7)); p.wealth=Math.max(0,p.wealth+rand(-30,60));
    if(chance(8)) p.memories=[pick(DB.news),...(p.memories||[])].slice(0,3);
    if(chance(4)) p.role=pick(["Attentäter","Rebell","Söldnerführer","Adliger","Mafiaboss","CEO","Kultführer"]);
    return p;
  });
  if(chance(35)) n.world.headline=pick(DB.news);
  return n;
}
function ageUp(g) {
  let n=copy(g);
  n.age++; n.year++; n.wanted=clamp(n.wanted-rand(2,8)); n.gold=Math.max(0,n.gold+rand(-5,25));
  n.stats.health=clamp(n.stats.health+rand(-8,4)); n.stats.happiness=clamp(n.stats.happiness+rand(-10,8)); n.stats.stress=clamp(n.stats.stress+rand(-7,10));
  n.social.followers=Math.max(0,n.social.followers+rand(-500,2500)); n.social.fame=clamp(n.social.fame+rand(-4,6)); n.social.scandal=clamp(n.social.scandal+rand(-5,8));
  if(n.prison>0){ n.prison--; n.stats.health=clamp(n.stats.health-rand(3,10)); n.skills.intrigue=clamp(n.skills.intrigue+rand(1,5)); if(chance(25)) n.log.unshift(pick(["Ein Wärter will bestochen werden.","Eine Gefängnisgang bietet Schutz an.","Ein Ausbruchsplan entsteht.","Du gewinnst Respekt im Kerker."])); return withEvent(n,"Du überlebst ein weiteres Jahr im Kerker."); }
  if(n.job!=="Kein Beruf"){ const j=DB.jobs.find(x=>x.name===n.job); const pay=j?rand(j.pay[0],j.pay[1]):rand(8,80); n.gold+=pay; n.stats.reputation=clamp(n.stats.reputation+1); if(j?.skill) n.skills[j.skill]=clamp((n.skills[j.skill]||0)+rand(1,4)); n.log.unshift(`Du arbeitest als ${n.job} und verdienst ${pay} Gold.`); }
  if(chance(10)) n.diseases.push(pick(DB.illnesses));
  if(chance(7)) n.addictions.push(pick(DB.addictions));
  n=mutateWorld(n);
  return withEvent(n,pick(["Ein Mord erschüttert den Königshof.","Banditen plündern Händlerwege.","Ein Turnier lockt Kämpfer an.","Eine Seuche breitet sich aus.","Ein Bürgerkrieg droht.","Ein Adelshaus plant Verrat.","Ein Unterweltboss sucht Nachfolger."]));
}
function act(g,type,payload){
  const n=copy(g);
  if(type==="job"){n.job=payload;n.stats.reputation=clamp(n.stats.reputation+2);return withEvent(n,`Du beginnst als ${payload}.`);}
  if(type==="crime"){
    const c=DB.crimes.find(x=>x.name===payload) || DB.crimes[0];
    if(payload==="Gefängnisausbruch"&&n.prison<=0)return withEvent(n,"Du bist nicht im Gefängnis.");
    if(rand(1,100)<c.risk+Math.floor(n.wanted/3)){n.prison=payload==="Gefängnisausbruch"?n.prison+rand(3,10):rand(1,payload==="Auftragsmord"?15:5);n.wanted=clamp(n.wanted+c.heat);return withEvent(n,`${payload} scheitert. Die Konsequenzen sind hart.`);}
    const gain=rand(c.reward[0],c.reward[1]); n.gold+=gain; n.wanted=clamp(n.wanted+c.heat); n.skills.intrigue=clamp(n.skills.intrigue+4); if(payload==="Gefängnisausbruch")n.prison=0; return withEvent(n,`${payload} gelingt. +${money(gain)}.`);
  }
  if(type==="mafia"){ const ranks=["Niemand","Läufer","Schläger","Vollstrecker","Capo","Unterboss","Mafiaboss"]; const i=Math.min(ranks.indexOf(n.mafiaRank)+1,ranks.length-1); n.mafiaRank=ranks[i]; n.stats.fear=clamp(n.stats.fear+10); return withEvent(n,`Du steigst in der Unterwelt auf: ${n.mafiaRank}.`);}
  if(type==="asset"){ const a=DB.assets.find(x=>x.name===payload); if(!a)return n; if(n.gold<a.price)return withEvent(n,`Du brauchst ${money(a.price)} für ${a.name}.`); n.gold-=a.price; if(a.type==="home")n.assets.home=a.name; else if(a.type==="vehicle")n.assets.vehicle=a.name; else n.assets.luxury.push(a.name); n.stats.reputation=clamp(n.stats.reputation+a.rep); return withEvent(n,`Du kaufst ${a.name}.`);}
  if(type==="weapon"){ const w=DB.weapons.find(x=>x.name===payload); if(!w)return n; if(n.gold<w.price)return withEvent(n,`Du brauchst ${money(w.price)}.`); n.gold-=w.price; n.assets.weapon=w; n.skills.combat=clamp(n.skills.combat+Math.floor(w.power/4)); return withEvent(n,`Du kaufst ${w.name}.`);}
  if(type==="invest"){ const s=n.world.stocks.find(x=>x.name===payload); if(!s||n.gold<20)return withEvent(n,"Du brauchst 20G."); n.gold-=20; s.owned++; return withEvent(n,`Du investierst in ${payload}.`);}
  if(type==="sellInvest"){ const s=n.world.stocks.find(x=>x.name===payload); if(!s||s.owned<=0)return withEvent(n,"Keine Anteile vorhanden."); s.owned--; n.gold+=s.value; return withEvent(n,`Du verkaufst einen Anteil ${payload} für ${money(s.value)}.`);}
  if(type==="relation"){ const p=n.relations.find(x=>x.id===payload.id); if(!p)return n; if(payload.kind==="talk"){p.relation=clamp(p.relation+rand(4,12),-100,100);p.memories=[`Gespräch mit ${n.name}`,...p.memories].slice(0,3);return withEvent(n,`${p.name} erzählt dir ein Gerücht.`)} if(payload.kind==="romance"){p.relation=clamp(p.relation+rand(8,18),-100,100);n.stats.happiness=clamp(n.stats.happiness+4);return withEvent(n,`Zwischen dir und ${p.name} entsteht Spannung.`)} if(payload.kind==="threaten"){p.fear=clamp(p.fear+20);p.relation=clamp(p.relation-15,-100,100);n.stats.fear=clamp(n.stats.fear+8);return withEvent(n,`Du bedrohst ${p.name}.`)}}
  if(type==="train"){n.skills.combat=clamp(n.skills.combat+7);n.stats.health=clamp(n.stats.health-3);return withEvent(n,"Du trainierst hart.");}
  if(type==="war"){n.skills.combat=clamp(n.skills.combat+8);n.skills.leadership=clamp(n.skills.leadership+5);n.stats.health=clamp(n.stats.health-rand(5,20));n.stats.reputation=clamp(n.stats.reputation+8);return withEvent(n,"Du ziehst in den Krieg.");}
  if(type==="court"){n.skills.diplomacy=clamp(n.skills.diplomacy+6);n.stats.reputation=clamp(n.stats.reputation+5);return withEvent(n,"Du suchst Zugang zum Hof.");}
  if(type==="revolt"){n.followers+=rand(20,200);n.stats.fear=clamp(n.stats.fear+12);return withEvent(n,"Du startest eine Revolution. Anhänger sammeln sich.");}
  if(type==="kingdom"){n.kingdom=`${n.city}reich`;n.title="Herrscher";n.stats.fear=clamp(n.stats.fear+20);n.dynasty.prestige=clamp(n.dynasty.prestige+25);return withEvent(n,"Du gründest dein eigenes Königreich.");}
  if(type==="heir"){const h=pick(DB.names);n.dynasty.heirs.push(h);n.dynasty.prestige=clamp(n.dynasty.prestige+10);return withEvent(n,`Ein neuer Erbe wird geboren: ${h}.`);}
  if(type==="heal"){n.gold=Math.max(0,n.gold-10);n.stats.health=clamp(n.stats.health+18);return withEvent(n,"Ein Heiler behandelt dich.");}
  if(type==="illness"){const x=pick(DB.illnesses);n.diseases.push(x);n.stats.health=clamp(n.stats.health-rand(5,18));return withEvent(n,`Neue Belastung: ${x}.`);}
  if(type==="company"){const name=pick(["Handelshaus","Söldnerfirma","Bank","Schmugglernetz","Cyberfirma"]);if(n.gold<250)return withEvent(n,"Du brauchst 250G für eine Firma.");n.gold-=250;n.companies.push({id:id(),name,profit:rand(20,120),level:1});return withEvent(n,`Du gründest: ${name}.`);}
  if(type==="save"){localStorage.setItem("kingdom-life-max-save",JSON.stringify(n));n.app.saved=true;return withEvent(n,"Spielstand gespeichert.");}
  if(type==="load"){const s=localStorage.getItem("kingdom-life-max-save");return s?withEvent(JSON.parse(s),"Spielstand geladen."):withEvent(n,"Kein Speicherstand gefunden.");}
  if(type==="pwa"){n.app.installed=true;return withEvent(n,"PWA-Modus: Safari → Teilen → Zum Home-Bildschirm.");}
  if(type==="news"){return withEvent(n,`WELTNACHRICHT: ${pick(DB.news)}`)}
  return n;
}

function Stat({label,value}){return <div className="stat"><div className="stat-row"><span>{label}</span><b>{value}%</b></div><div className="bar"><div className="fill" style={{width:`${value}%`}} /></div></div>}
function Mini({label,value}){return <div className="mini"><span>{label}</span><b>{value}</b></div>}
function Action({children,onClick,kind=""}){return <button onClick={onClick} className={`action ${kind}`}>{children}</button>}

export default function App(){
  const [game,setGame]=useState(()=>newGame());
  const [menu,setMenu]=useState("life");
  const [submenu,setSubmenu]=useState("Neu");
  const [selected,setSelected]=useState(game.relations[0]?.id);
  const active=MENU.find(m=>m.id===menu)||MENU[0];
  const person=game.relations.find(p=>p.id===selected)||game.relations[0];
  const switchMenu=(m)=>{setMenu(m.id);setSubmenu(m.sub[0])};

  const actions=useMemo(()=>{
    if(menu==="life")return submenu==="Neu"?[
      ["Neues Leben",()=>setGame(newGame())],["Mittelalter",()=>setGame(newGame("Mittelalter"))],["Modern",()=>setGame(newGame("Modern"))],["Cyberpunk",()=>setGame(newGame("Cyberpunk"))]
    ]:[
      ["Altern",()=>setGame(ageUp(game))],["Welt tickt",()=>setGame(withEvent(mutateWorld(copy(game)),"Die Welt bewegt sich weiter."))],["News",()=>setGame(act(game,"news"))],["Profil",()=>setGame(withEvent(game,`${game.name}: ${game.title}, ${game.era}.`))]
    ];
    if(menu==="career")return submenu==="Firmen"?[["Firma gründen",()=>setGame(act(game,"company"))],["CEO werden",()=>setGame(act(game,"job","CEO"))],["Imperium",()=>setGame(withEvent(game,"Du baust dein Firmenimperium aus."))],["Lobbying",()=>setGame(withEvent(game,"Du beeinflusst Politiker."))]]:DB.jobs.slice(0,8).filter(j=>j.req(game)).map(j=>[j.name,()=>setGame(act(game,"job",j.name))]);
    if(menu==="social")return [["Reden",()=>setGame(act(game,"relation",{id:person.id,kind:"talk"}))],["Flirten",()=>setGame(act(game,"relation",{id:person.id,kind:"romance"}))],["Bedrohen",()=>setGame(act(game,"relation",{id:person.id,kind:"threaten"}))],["Erben",()=>setGame(act(game,"heir"))]];
    if(menu==="underworld")return submenu==="Mafia"?[["Mafia-Aufstieg",()=>setGame(act(game,"mafia"))],["Schutzgeld",()=>setGame(act(game,"crime","Schutzgeld"))],["Geldwäsche",()=>setGame(act(game,"crime","Geldwäsche"))],["Kartell-Deal",()=>setGame(act(game,"crime","Kartell-Deal"))]]:DB.crimes.slice(0,8).map(c=>[c.name,()=>setGame(act(game,"crime",c.name))]);
    if(menu==="power")return [["Hof betreten",()=>setGame(act(game,"court"))],["Krieg",()=>setGame(act(game,"war"))],["Revolution",()=>setGame(act(game,"revolt"))],["Königreich",()=>setGame(act(game,"kingdom"))]];
    if(menu==="assets")return submenu==="Waffen"?DB.weapons.slice(1).map(w=>[`${w.name} ${money(w.price)}`,()=>setGame(act(game,"weapon",w.name))]):DB.assets.slice(0,8).map(a=>[`${a.name} ${money(a.price)}`,()=>setGame(act(game,"asset",a.name))]);
    if(menu==="body")return [["Heilen",()=>setGame(act(game,"heal"))],["Trainieren",()=>setGame(act(game,"train"))],["Krankheit",()=>setGame(act(game,"illness"))],["Sucht bekämpfen",()=>setGame(withEvent(game,"Du kämpfst gegen deine Abhängigkeiten."))]];
    if(menu==="world")return submenu==="Börse"?game.world.stocks.slice(0,4).map(s=>[`Kauf ${s.name}`,()=>setGame(act(game,"invest",s.name))]):[["News",()=>setGame(act(game,"news"))],["Fraktion",()=>setGame(withEvent(game,"Du kontaktierst eine Fraktion."))],["Markt tickt",()=>setGame(withEvent(mutateWorld(copy(game)),"Märkte und Fraktionen verändern sich."))],["Anteil verkaufen",()=>setGame(act(game,"sellInvest",game.world.stocks[0].name))]];
    if(menu==="app")return [["Speichern",()=>setGame(act(game,"save"))],["Laden",()=>setGame(act(game,"load"))],["PWA",()=>setGame(act(game,"pwa"))],["Info",()=>setGame(withEvent(game,"Installieren: Safari → Teilen → Zum Home-Bildschirm."))]];
    return [];
  },[game,menu,submenu,person]);

  return <div className="app">
    <header className="header">
      <div className="header-left"><div className="avatar">{game.era==="Cyberpunk"?"🤖":game.era==="Modern"?"🧑":"🧔"}</div><div><div className="name">{game.name}</div><div className="meta">{game.title} • {game.city} • {game.era}</div><div className="meta">Alter {game.age} • Jahr {game.year} • {game.kingdom||"kein Reich"}</div></div></div>
      <div className="gold">{money(game.gold)}<small>{game.job}</small></div>
    </header>
    <nav className="main-menu">{MENU.map(m=><button key={m.id} onClick={()=>switchMenu(m)} className={`menu-btn ${menu===m.id?"active":""}`}><div className="menu-icon">{m.icon}</div><div className="menu-label">{m.label}</div></button>)}</nav>
    <div className="sub-menu">{active.sub.map(s=><button key={s} onClick={()=>setSubmenu(s)} className={`sub-btn ${submenu===s?"active":""}`}>{s}</button>)}</div>
    <main className="content">
      <section className="event"><div className="event-title">{active.label} / {submenu}</div><div className="event-text">{game.event}</div></section>
      <div className="quick"><Mini label="Gold" value={money(game.gold)}/><Mini label="Ruhm" value={game.social.fame}/><Mini label="Fahndung" value={game.wanted}/><Mini label="Mafia" value={game.mafiaRank}/></div>
      <div className="actions">{actions.slice(0,4).map(([label,fn])=><Action key={label} onClick={fn}>{label}</Action>)}</div>
      <section className="panel">
        <div className="panel-title">Details</div>
        {menu==="social"?<div className="grid2">{game.relations.map(p=><button key={p.id} onClick={()=>setSelected(p.id)} className={`card selectable ${selected===p.id?"chosen":""}`}><b>{p.name}</b><br/>{p.role}<br/>Bez. {p.relation} • Loyal {p.loyalty}<br/><small>{p.memories?.[0]}</small></button>)}</div>
        :menu==="world"?<div className="grid2">{(submenu==="Börse"?game.world.stocks:submenu==="Fraktion"?game.world.factions:game.world.regions).map(x=><div key={x.id||x.name} className="card"><b>{x.name}</b><br/>{x.value?`Wert ${x.value} • Anteile ${x.owned}`:x.power?`Macht ${x.power} • Bez. ${x.relation}`:`Wohlstand ${x.wealth} • Gefahr ${x.danger}`}<br/>{x.owner||x.ideology||""}</div>)}</div>
        :menu==="career"?<div className="grid2">{[...DB.jobs.slice(0,8).map(j=>j.name),...game.companies.map(c=>c.name)].map(x=><div key={x} className="card"><b>{x}</b><br/>Karriere / Firma</div>)}</div>
        :menu==="underworld"?<div className="grid2">{DB.crimes.slice(0,8).map(c=><div key={c.name} className="card danger"><b>{c.name}</b><br/>Risiko {c.risk}%<br/>Belohnung {money(c.reward[0])}-{money(c.reward[1])}</div>)}</div>
        :menu==="assets"?<div className="grid2"><Mini label="Haus" value={game.assets.home}/><Mini label="Waffe" value={game.assets.weapon.name}/><Mini label="Fahrzeug" value={game.assets.vehicle}/><Mini label="Luxus" value={game.assets.luxury.length}/>{DB.assets.slice(0,4).map(a=><div className="card" key={a.name}><b>{a.name}</b><br/>{money(a.price)}</div>)}</div>
        :menu==="app"?<div className="grid2"><Mini label="Version" value={game.app.version}/><Mini label="Offline" value={game.app.offline?"Ja":"Nein"}/><Mini label="Save" value={game.app.saved?"Ja":"Nein"}/><Mini label="PWA" value="bereit"/></div>
        :<div className="grid2"><Mini label="Dynastie" value={game.dynasty.name}/><Mini label="Prestige" value={game.dynasty.prestige}/><Mini label="Erben" value={game.dynasty.heirs.length}/><Mini label="Follower" value={game.social.followers}/>{game.log.slice(0,4).map((l,i)=><div key={i} className="card"><b>Log</b><br/>{l}</div>)}</div>}
      </section>
    </main>
    <footer className="bottom"><Stat label="Freude" value={game.stats.happiness}/><Stat label="Health" value={game.stats.health}/><Stat label="Ruf" value={game.stats.reputation}/><button onClick={()=>setGame(ageUp(game))} className="age">+ Alter</button></footer>
  </div>
}

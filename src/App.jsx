import React, { useMemo, useState } from "react";

const clamp = (v, min = 0, max = 100) => Math.max(min, Math.min(max, v));
const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const chance = (p) => Math.random() * 100 < p;
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const id = () => Math.random().toString(36).slice(2) + Date.now().toString(36);
const copy = (x) => JSON.parse(JSON.stringify(x));
const money = (n) => `${Math.round(n).toLocaleString("de-DE")}G`;

const DB = {
  names: ["Arian","Mira","Konrad","Elena","Roderik","Freya","Hagen","Liora","Tilo","Adela","Cassian","Nyra"],
  surnames: ["Falk","Dorn","Krone","Eisen","Raben","Sturm","Blut","Silber","Grauwolf","Asche"],
  cities: ["Rabenfurt","Graustein","Nordhain","Kaltwasser","Dornwacht","Kronstadt","Silberhafen","Aschetor"],
  houses: ["Haus Falkenherz","Haus Blutmond","Haus Eisenwacht","Haus Silberhain","Haus Dornkrone","Haus Rabensturm"],
  traits: ["ehrgeizig","loyal","neidisch","grausam","gierig","listig","mutig","rachsüchtig","charmant"],
  roles: ["Elternteil","Geschwister","Wache","Bandenführer","Adelige","Söldner","Priester","Händler","Spion","Mafiaboss"],
  eras: ["Mittelalter","Modern","Cyberpunk"],
  jobs: ["Tagelöhner","Schmied","Stadtwache","Söldner","Spion","Händler","Ritter","Hofberater","Influencer","CEO","Hacker"],
  crimes: ["Taschendiebstahl","Einbruch","Schmuggel","Erpressung","Raubüberfall","Auftragsmord","Geldwäsche","Schutzgeld","Kartell-Deal"],
  news: ["Ein König wurde ermordet.","Eine Börse kollabiert.","Eine Revolution beginnt.","Ein Kartell übernimmt einen Hafen.","Ein Kult gewinnt Macht.","Ein Bürgerkrieg startet."],
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
  return {
    id:id(),
    name:`${pick(DB.names)} ${pick(DB.surnames)}`,
    role: role || pick(DB.roles),
    age: rand(8,72),
    house: pick(DB.houses),
    trait: pick(DB.traits),
    alive:true,
    relation:rand(-40,80),
    loyalty:rand(0,100),
    fear:rand(0,100),
    mood:rand(0,100),
    ambition:rand(0,100),
    memories:["Erste Begegnung."],
  };
}

function makeWorld(era="Mittelalter") {
  return {
    regions:["Nordreich","Küstenlande","Aschewüste","Silberwald","Dornmark","Kronstadt"].map(name=>({
      id:id(), name, owner:pick(DB.houses), wealth:rand(20,100), danger:rand(5,100), unrest:rand(0,100)
    })),
    factions:["Schwarze Hand","Kirche der Flamme","Kaufmannsgilde","Legion","Rebellenbund","Söldnergilde"].map(name=>({
      id:id(), name, power:rand(15,100), relation:rand(-100,100)
    })),
    stocks:["Eisenhandel","Gewürze","Werften","Söldnergilde","Bankhaus","CyberTech"].map(name=>({
      id:id(), name, value:rand(40,180), owned:0
    })),
    headline:pick(DB.news),
    era,
  };
}

function newGame(era=pick(DB.eras)) {
  return {
    era,
    name:`${pick(DB.names)} ${pick(DB.surnames)}`,
    age:14,
    year:era==="Mittelalter"?1174:era==="Modern"?2026:2140,
    title:"Straßenkind",
    city:pick(DB.cities),
    gold:12,
    job:"Kein Beruf",
    prison:0,
    wanted:0,
    mafiaRank:"Niemand",
    kingdom:null,
    event:"Du wachst hungrig in einer kalten Gasse auf. Niemand interessiert sich für dein Überleben.",
    log:["Dein Leben beginnt ganz unten.","Deine Familie besitzt fast nichts.","Im Reich breiten sich Hunger, Krieg und Intrigen aus."],
    stats:{happiness:45, health:72, intelligence:51, looks:56, reputation:10, fear:5, stress:20},
    skills:{combat:8, intrigue:12, diplomacy:4, leadership:2, trade:3},
    social:{fame:5, followers:rand(0,5000), scandal:0, influence:10},
    assets:{home:"Keins", vehicle:"Keins", luxury:[], weapon:"Rostiger Dolch"},
    dynasty:{name:`Dynastie ${pick(DB.surnames)}`, prestige:rand(0,50), generations:1, heirs:[]},
    companies:[],
    addictions:[],
    diseases:[],
    followers:rand(0,25),
    world:makeWorld(era),
    relations:[makePerson("Elternteil"),makePerson("Geschwister"),makePerson("Bandenführer"),makePerson("Wache"),makePerson("Adelige"),makePerson("Rivale")],
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
  n.world.stocks=n.world.stocks.map(s=>({...s,value:Math.max(1,s.value+rand(-25,25))}));
  n.world.factions=n.world.factions.map(f=>({...f,power:clamp(f.power+rand(-8,8)),relation:clamp(f.relation+rand(-12,12),-100,100)}));
  n.world.regions=n.world.regions.map(r=>({...r,wealth:clamp(r.wealth+rand(-6,6)),danger:clamp(r.danger+rand(-8,8)),unrest:clamp(r.unrest+rand(-10,10))}));
  n.relations=n.relations.map(p=>{
    p.age+=1;
    p.mood=clamp(p.mood+rand(-12,12));
    p.loyalty=clamp(p.loyalty+rand(-7,7));
    if(chance(8)) p.memories=[pick(DB.news),...(p.memories||[])].slice(0,3);
    if(chance(4)) p.role=pick(["Attentäter","Rebell","Söldnerführer","Adliger","Mafiaboss","CEO"]);
    return p;
  });
  return n;
}

function ageUp(g) {
  let n=copy(g);
  n.age++;
  n.year++;
  n.wanted=clamp(n.wanted-rand(2,8));
  n.gold=Math.max(0,n.gold+rand(-5,25));
  n.stats.health=clamp(n.stats.health+rand(-8,4));
  n.stats.happiness=clamp(n.stats.happiness+rand(-10,8));
  n.stats.stress=clamp(n.stats.stress+rand(-7,10));
  n.social.followers=Math.max(0,n.social.followers+rand(-500,2500));
  n.social.fame=clamp(n.social.fame+rand(-4,6));

  if(n.prison>0){
    n.prison--;
    n.stats.health=clamp(n.stats.health-rand(3,10));
    n.skills.intrigue=clamp(n.skills.intrigue+rand(1,5));
    return withEvent(n,"Du überlebst ein weiteres Jahr im Kerker.");
  }

  if(n.job!=="Kein Beruf"){
    const pay=rand(8,180);
    n.gold+=pay;
    n.stats.reputation=clamp(n.stats.reputation+1);
    n.log.unshift(`Du arbeitest als ${n.job} und verdienst ${pay} Gold.`);
  }

  if(chance(10)) n.diseases.push(pick(["Fieber","Pest","Trauma","Burnout","Schlaflosigkeit"]));
  if(chance(7)) n.addictions.push(pick(["Alkohol","Glücksspiel","Macht","Ruhm"]));

  n=mutateWorld(n);

  return withEvent(n,pick([
    "Ein Mord erschüttert den Königshof.",
    "Banditen plündern Händlerwege.",
    "Ein Turnier lockt Kämpfer an.",
    "Eine Seuche breitet sich aus.",
    "Ein Bürgerkrieg droht.",
    "Ein Adelshaus plant Verrat.",
    "Ein Unterweltboss sucht Nachfolger."
  ]));
}

function act(g,type,payload){
  const n=copy(g);

  if(type==="job"){
    n.job=payload;
    n.stats.reputation=clamp(n.stats.reputation+2);
    return withEvent(n,`Du beginnst als ${payload}.`);
  }

  if(type==="crime"){
    const risk = payload==="Auftragsmord"?65:payload==="Raubüberfall"?46:payload==="Kartell-Deal"?55:30;
    if(rand(1,100)<risk+Math.floor(n.wanted/3)){
      n.prison=rand(1,payload==="Auftragsmord"?15:5);
      n.wanted=clamp(n.wanted+25);
      return withEvent(n,`${payload} scheitert. Die Konsequenzen sind hart.`);
    }
    const gain=rand(40,payload==="Auftragsmord"?2500:900);
    n.gold+=gain;
    n.wanted=clamp(n.wanted+12);
    n.skills.intrigue=clamp(n.skills.intrigue+4);
    return withEvent(n,`${payload} gelingt. +${money(gain)}.`);
  }

  if(type==="mafia"){
    const ranks=["Niemand","Läufer","Schläger","Vollstrecker","Capo","Unterboss","Mafiaboss"];
    const i=Math.min(ranks.indexOf(n.mafiaRank)+1,ranks.length-1);
    n.mafiaRank=ranks[i];
    n.stats.fear=clamp(n.stats.fear+10);
    return withEvent(n,`Du steigst in der Unterwelt auf: ${n.mafiaRank}.`);
  }

  if(type==="asset"){
    const prices={Hütte:100,Villa:1200,Burg:4000,Palast:12000,Yacht:3500,Privatjet:9000};
    const price=prices[payload]||500;
    if(n.gold<price) return withEvent(n,`Du brauchst ${money(price)} für ${payload}.`);
    n.gold-=price;
    if(["Hütte","Villa","Burg","Palast"].includes(payload)) n.assets.home=payload;
    else n.assets.luxury.push(payload);
    n.stats.reputation=clamp(n.stats.reputation+10);
    return withEvent(n,`Du kaufst ${payload}.`);
  }

  if(type==="invest"){
    const s=n.world.stocks.find(x=>x.name===payload);
    if(!s||n.gold<20)return withEvent(n,"Du brauchst 20G.");
    n.gold-=20;
    s.owned++;
    return withEvent(n,`Du investierst in ${payload}.`);
  }

  if(type==="relation"){
    const p=n.relations.find(x=>x.id===payload.id);
    if(!p)return n;
    if(payload.kind==="talk"){p.relation=clamp(p.relation+rand(4,12),-100,100);return withEvent(n,`${p.name} erzählt dir ein Gerücht.`);}
    if(payload.kind==="romance"){p.relation=clamp(p.relation+rand(8,18),-100,100);n.stats.happiness=clamp(n.stats.happiness+4);return withEvent(n,`Zwischen dir und ${p.name} entsteht Spannung.`);}
    if(payload.kind==="threaten"){p.fear=clamp(p.fear+20);p.relation=clamp(p.relation-15,-100,100);n.stats.fear=clamp(n.stats.fear+8);return withEvent(n,`Du bedrohst ${p.name}.`);}
  }

  if(type==="war"){
    n.skills.combat=clamp(n.skills.combat+8);
    n.skills.leadership=clamp(n.skills.leadership+5);
    n.stats.health=clamp(n.stats.health-rand(5,20));
    n.stats.reputation=clamp(n.stats.reputation+8);
    return withEvent(n,"Du ziehst in den Krieg.");
  }

  if(type==="court"){
    n.skills.diplomacy=clamp(n.skills.diplomacy+6);
    n.stats.reputation=clamp(n.stats.reputation+5);
    return withEvent(n,"Du suchst Zugang zum Hof.");
  }

  if(type==="kingdom"){
    n.kingdom=`${n.city}reich`;
    n.title="Herrscher";
    n.stats.fear=clamp(n.stats.fear+20);
    n.dynasty.prestige=clamp(n.dynasty.prestige+25);
    return withEvent(n,"Du gründest dein eigenes Königreich.");
  }

  if(type==="save"){
    localStorage.setItem("kingdom-life-max-save",JSON.stringify(n));
    n.app.saved=true;
    return withEvent(n,"Spielstand gespeichert.");
  }

  if(type==="load"){
    const s=localStorage.getItem("kingdom-life-max-save");
    return s?withEvent(JSON.parse(s),"Spielstand geladen."):withEvent(n,"Kein Speicherstand gefunden.");
  }

  if(type==="pwa") return withEvent(n,"PWA-Modus: Safari → Teilen → Zum Home-Bildschirm.");
  if(type==="news") return withEvent(n,`WELTNACHRICHT: ${pick(DB.news)}`);

  return n;
}

function Stat({label,value}){
  return (
    <div className="stat">
      <div className="stat-row"><span>{label}</span><b>{value}%</b></div>
      <div className="bar"><div className="fill" style={{width:`${value}%`}} /></div>
    </div>
  );
}

function Mini({label,value}){
  return <div className="mini"><span>{label}</span><b>{value}</b></div>;
}

export default function App(){
  const [game,setGame]=useState(()=>newGame());
  const [menu,setMenu]=useState("life");
  const [submenu,setSubmenu]=useState("Neu");
  const [selected,setSelected]=useState(game.relations[0]?.id);
  const active=MENU.find(m=>m.id===menu)||MENU[0];
  const person=game.relations.find(p=>p.id===selected)||game.relations[0];

  const switchMenu=(m)=>{setMenu(m.id);setSubmenu(m.sub[0]);};

  const actions=useMemo(()=>{
    if(menu==="life")return submenu==="Neu"
      ? [["Neues Leben",()=>setGame(newGame())],["Mittelalter",()=>setGame(newGame("Mittelalter"))],["Modern",()=>setGame(newGame("Modern"))],["Cyberpunk",()=>setGame(newGame("Cyberpunk"))]]
      : [["Altern",()=>setGame(ageUp(game))],["Welt tickt",()=>setGame(withEvent(mutateWorld(copy(game)),"Die Welt bewegt sich weiter."))],["News",()=>setGame(act(game,"news"))],["Profil",()=>setGame(withEvent(game,`${game.name}: ${game.title}, ${game.era}.`))]];

    if(menu==="career")return DB.jobs.map(j=>[j,()=>setGame(act(game,"job",j))]);
    if(menu==="social")return [["Reden",()=>setGame(act(game,"relation",{id:person.id,kind:"talk"}))],["Flirten",()=>setGame(act(game,"relation",{id:person.id,kind:"romance"}))],["Bedrohen",()=>setGame(act(game,"relation",{id:person.id,kind:"threaten"}))],["Dynastie",()=>setGame(act(game,"kingdom"))]];
    if(menu==="underworld")return [["Mafia-Aufstieg",()=>setGame(act(game,"mafia"))],...DB.crimes.slice(0,3).map(c=>[c,()=>setGame(act(game,"crime",c))])];
    if(menu==="power")return [["Hof",()=>setGame(act(game,"court"))],["Krieg",()=>setGame(act(game,"war"))],["Revolution",()=>setGame(withEvent(game,"Du startest eine Revolution."))],["Königreich",()=>setGame(act(game,"kingdom"))]];
    if(menu==="assets")return ["Hütte","Villa","Burg","Palast","Yacht","Privatjet"].map(x=>[x,()=>setGame(act(game,"asset",x))]);
    if(menu==="body")return [["Heilen",()=>setGame(withEvent(game,"Ein Heiler behandelt dich."))],["Training",()=>setGame(act(game,"war"))],["Krankheit",()=>setGame(withEvent(game,"Du lässt dich untersuchen."))],["Therapie",()=>setGame(withEvent(game,"Du kämpfst gegen deine inneren Dämonen."))]];
    if(menu==="world")return [["News",()=>setGame(act(game,"news"))],["Fraktion",()=>setGame(withEvent(game,"Du kontaktierst eine Fraktion."))],["Börse",()=>setGame(act(game,"invest",game.world.stocks[0].name))],["Karte",()=>setGame(withEvent(game,"Du studierst die Weltkarte."))]];
    if(menu==="app")return [["Speichern",()=>setGame(act(game,"save"))],["Laden",()=>setGame(act(game,"load"))],["PWA",()=>setGame(act(game,"pwa"))],["Info",()=>setGame(withEvent(game,"Installieren: Safari → Teilen → Zum Home-Bildschirm."))]];
    return [];
  },[game,menu,submenu,person]);

  return (
    <div className="app">
      <header className="header">
        <div className="header-left">
          <div className="avatar">{game.era==="Cyberpunk"?"🤖":game.era==="Modern"?"🧑":"🧔"}</div>
          <div>
            <div className="name">{game.name}</div>
            <div className="meta">{game.title} • {game.city} • {game.era}</div>
            <div className="meta">Alter {game.age} • Jahr {game.year} • {game.kingdom||"kein Reich"}</div>
          </div>
        </div>
        <div className="gold">{money(game.gold)}<small>{game.job}</small></div>
      </header>

      <nav className="main-menu">
        {MENU.map(m=>(
          <button key={m.id} onClick={()=>switchMenu(m)} className={`menu-btn ${menu===m.id?"active":""}`}>
            <div className="menu-icon">{m.icon}</div>
            <div className="menu-label">{m.label}</div>
          </button>
        ))}
      </nav>

      <div className="sub-menu">
        {active.sub.map(s=>(
          <button key={s} onClick={()=>setSubmenu(s)} className={`sub-btn ${submenu===s?"active":""}`}>{s}</button>
        ))}
      </div>

      <main className="content">
        <section className="event">
          <div className="event-title">{active.label} / {submenu}</div>
          <div className="event-text">{game.event}</div>
        </section>

        <div className="quick">
          <Mini label="Gold" value={money(game.gold)}/>
          <Mini label="Ruhm" value={game.social.fame}/>
          <Mini label="Fahndung" value={game.wanted}/>
          <Mini label="Mafia" value={game.mafiaRank}/>
        </div>

        <div className="actions">
          {actions.slice(0,4).map(([label,fn])=>(
            <button key={label} onClick={fn} className="action">{label}</button>
          ))}
        </div>

        <section className="panel">
          <div className="panel-title">Details</div>

          {menu==="social" ? (
            <div className="grid2">
              {game.relations.map(p=>(
                <button key={p.id} onClick={()=>setSelected(p.id)} className={`card selectable ${selected===p.id?"chosen":""}`}>
                  <b>{p.name}</b><br/>{p.role}<br/>Bez. {p.relation} • Loyal {p.loyalty}<br/><small>{p.memories?.[0]}</small>
                </button>
              ))}
            </div>
          ) : menu==="world" ? (
            <div className="grid2">
              {(submenu==="Börse"?game.world.stocks:submenu==="Fraktion"?game.world.factions:game.world.regions).map(x=>(
                <div key={x.id||x.name} className="card">
                  <b>{x.name}</b><br/>
                  {x.value?`Wert ${x.value} • Anteile ${x.owned}`:x.power?`Macht ${x.power} • Bez. ${x.relation}`:`Wohlstand ${x.wealth} • Gefahr ${x.danger}`}
                </div>
              ))}
            </div>
          ) : (
            <div className="grid2">
              <Mini label="Dynastie" value={game.dynasty.name}/>
              <Mini label="Prestige" value={game.dynasty.prestige}/>
              <Mini label="Erben" value={game.dynasty.heirs.length}/>
              <Mini label="Follower" value={game.social.followers}/>
              {game.log.slice(0,4).map((l,i)=><div key={i} className="card"><b>Log</b><br/>{l}</div>)}
            </div>
          )}
        </section>
      </main>

      <footer className="bottom">
        <Stat label="Freude" value={game.stats.happiness}/>
        <Stat label="Health" value={game.stats.health}/>
        <Stat label="Ruf" value={game.stats.reputation}/>
        <button onClick={()=>setGame(ageUp(game))} className="age">+ Alter</button>
      </footer>
    </div>
  );
}
// ─── Dati di esempio ─────────────────────────────────────────────────

const STUDENT = {
  name: "Luca",
  fullName: "Luca Bianchi",
  initials: "LB",
  instrument: "Chitarra elettrica",
  level: "Intermedio avanzato",
  path: "Percorso 6 mesi — Linguaggio & Tempo",
  pathStart: "14 apr 2026",
  pathEnd: "14 ott 2026",
  monthProgress: 0.42,
  overall: 0.58,
};

const COACH = {
  name: "Marco",
  fullName: "Marco Petta",
  initials: "MP",
};

const LESSONS_THIS_WEEK = [
  {
    id: "L-014",
    title: "Pennata alternata — il polso libero",
    duration: "18:42",
    status: "completed",
    chapter: "Tecnica · Modulo 2",
    tags: ["tecnica","mano destra"],
    note: "Concentrati sul respiro del polso. Non forzare."
  },
  {
    id: "L-015",
    title: "Pentatonica minore su 12 bar",
    duration: "24:10",
    status: "in-progress",
    chapter: "Linguaggio · Modulo 3",
    tags: ["blues","fraseggio"],
    progress: 0.38,
    note: "Senti il 2 e il 4. Non suonare sopra, suona dentro."
  },
  {
    id: "L-016",
    title: "Legato sincero — hammer & pull",
    duration: "15:55",
    status: "new",
    chapter: "Tecnica · Modulo 2",
    tags: ["legato","mano sinistra"],
    note: "Dopo questa, il 3° esercizio."
  },
];

const EXERCISES_THIS_WEEK = [
  {
    id: "E-228",
    title: "12 bar in La — pentatonica, tempo 90",
    due: "venerdì 24 apr",
    status: "feedback", // assegnato · consegnato · feedback
    bpm: 90,
    lessonRef: "L-015",
    note: "Luca, voglio sentirti respirare tra una frase e l'altra.",
    newFeedback: true,
  },
  {
    id: "E-229",
    title: "Pennata alternata — crome a 120 bpm",
    due: "domenica 26 apr",
    status: "assigned",
    bpm: 120,
    lessonRef: "L-014",
    note: "Metronomo sul 2 e 4. Due minuti filati."
  },
];

const PAST_SUBMISSIONS = [
  { id:"S-081", title:"Legato 3 note per corda", date:"10 apr", status:"feedback" },
  { id:"S-076", title:"Shuffle in Mi — groove", date:"02 apr", status:"feedback" },
  { id:"S-072", title:"Arpeggi Dm7 / G7", date:"25 mar", status:"archived" },
];

const ANNOTATIONS = [
  { t: 8,  sec:"0:08",  type:"ok",      text:"Partenza pulita. Il pickup arriva in tempo, bravo." },
  { t: 24, sec:"0:24",  type:"tip",     text:"Qui stai anticipando il 4. Respira, lascia vuoto lo spazio prima della frase." },
  { t: 40, sec:"0:40",  type:"warning", text:"Pennata che si chiude. Il polso si blocca — rilassa l'avambraccio. Torniamo sull'esercizio del polso libero." },
  { t: 58, sec:"0:58",  type:"ok",      text:"Questa frase è tua. È la prima volta che la senti davvero." },
  { t: 72, sec:"1:12",  type:"tip",     text:"Prova a ripetere la stessa cellula ma spostata sul 2-and. È più blues." },
  { t: 96, sec:"1:36",  type:"warning", text:"Tempo che corre. Stai davanti al click di 20ms circa. Metronomo sul 2 e 4." },
  { t: 112,sec:"1:52",  type:"video",   text:"Guarda questa video-risposta: ti faccio vedere la mano destra da vicino. Nota come il polso respira quando io suono — il tuo invece si chiude, si irrigidisce sul downbeat. Prova a fare l'esercizio del polso libero (5 min) prima di ogni session questa settimana.", duration:"0:42", hasText:true },
  { t: 128,sec:"2:08",  type:"ok",      text:"Finale maturo. Hai chiuso la porta con calma." },
];

const RATING = [
  { label:"Tempo",       value: 3.5 },
  { label:"Tono",        value: 4.0 },
  { label:"Tecnica",     value: 3.0 },
  { label:"Groove",      value: 4.0 },
  { label:"Espressione", value: 4.5 },
];

const SKILLS_RADAR = [
  { label:"Ritmica",        value: 4.2 },
  { label:"Tecnica",        value: 3.4 },
  { label:"Teoria",         value: 3.0 },
  { label:"Orecchio",       value: 3.8 },
  { label:"Improvvisazione",value: 3.2 },
  { label:"Performance",    value: 3.6 },
];

const CHAT = [
  { from:"coach", t:"lun 09:12", text:"Luca, ho caricato la lezione sul polso libero. Guardala con calma prima di registrare." },
  { from:"student", t:"lun 12:40", text:"Ricevuto Marco. Stasera la guardo due volte come dici tu." },
  { from:"coach", t:"mar 10:02", text:"Bene. Quando registri l'esercizio, mettimi il click nel video — voglio sentire come ti muovi attorno." },
  { from:"student", t:"mar 22:15", text:"Ho caricato il 12 bar. L'ho suonato 5 volte, questa è la più onesta.", attach:{type:"video",label:"12_bar_take5.mp4",length:"2:14"} },
  { from:"coach", t:"mer 08:30", text:"Guardato. Ti ho lasciato 8 annotazioni sul video, una è una mia video-risposta. C'è una cosa sul polso di cui dobbiamo parlare." },
  { from:"coach", t:"mer 08:31", text:"Non è un problema, è un passaggio. Succede a tutti a questo livello." },
];

// COACH_CHATS — inbox di Marco, 3 thread distinti che raccontano 3 momenti didattici diversi
const COACH_CHATS = [
  {
    id:"luca",
    name:"Luca Bianchi", initials:"LB",
    status:"online adesso",
    level:"Intermedio avanzato · mese 4/6",
    lastPreview:"Non è un problema, è un passaggio. Succede a tutti a questo livello.",
    lastTime:"10:02",
    unread:0,
    online:true,
    messages: CHAT,
  },
  {
    id:"sara",
    name:"Sara Verdi", initials:"SV",
    status:"visto 2 ore fa",
    level:"Intermedio · pick della settimana",
    lastPreview:"Contato. Sono sul 2 e 4 finalmente. Grazie Marco, mi hai sbloccato una cosa importante.",
    lastTime:"ieri",
    unread:2,
    online:false,
    messages:[
      { from:"student", t:"lun 14:20", text:"Marco! Ho appena condiviso la mia terza take del 12 bar in community. Mi sentite a 0:52?" },
      { from:"coach",   t:"lun 15:45", text:"Sara, l'ho ascoltata. Il passaggio a 0:52 è tuo. Hai smesso di correre." },
      { from:"student", t:"lun 15:48", text:"Sul serio?? Ci ho provato per un'ora ieri sera 🥲" },
      { from:"coach",   t:"lun 15:51", text:"Per questo adesso suona vera. Vorrei metterla come pick della settimana — se per te va bene." },
      { from:"student", t:"lun 15:52", text:"Marco ma certo!! Che emozione." },
      { from:"student", t:"lun 15:55", text:"Però voglio capire cosa ho fatto di diverso stavolta. Non vorrei perderlo." },
      { from:"coach",   t:"lun 16:40", text:"Te lo spiego venerdì in call. Nel frattempo riascoltala dal secondo 48 con il click sotto e conta. È tutto lì." },
      { from:"coach",   t:"lun 16:41", text:"Ti carico anche una mini-lezione di 3 minuti sul 'respiro' della frase. Arriva entro stasera.", attach:{type:"video",label:"respiro_frase_teaser.mp4",length:"0:42"} },
      { from:"student", t:"mar 09:30", text:"Contato. Sono sul 2 e 4 finalmente. Grazie Marco, mi hai sbloccato una cosa importante." },
    ],
  },
  {
    id:"andrea",
    name:"Andrea Ferri", initials:"AF",
    status:"visto ieri",
    level:"Avanzato · mese 2/12",
    lastPreview:"Stasera registro la nuova take dello shuffle. Mi aspetto di soffrire.",
    lastTime:"ieri",
    unread:1,
    online:false,
    messages:[
      { from:"student", t:"dom 19:10", text:"Marco, ho preparato lo shuffle in Mi ma mi sento di nuovo troppo veloce. Non riesco a stare fermo." },
      { from:"coach",   t:"dom 21:32", text:"Rallenta ancora. 70 bpm. Niente sedicesimi per una settimana intera." },
      { from:"student", t:"dom 21:35", text:"70?? Sembra un'altra vita 😅" },
      { from:"coach",   t:"dom 21:40", text:"È un'altra vita. Il groove sta lì, non nella velocità. Tutto quello che senti come 'caldo' è rallentato." },
      { from:"coach",   t:"dom 21:41", text:"Voglio una take di 2 minuti filati a 70, solo crome. Niente ghost notes, niente fill. Solo tempo." },
      { from:"student", t:"lun 08:12", text:"Ok, ci provo. Stasera te la mando." },
      { from:"student", t:"lun 08:14", text:"Una domanda veloce: metronomo sul 2 e 4 o sul 1?" },
      { from:"coach",   t:"lun 09:55", text:"Sul 2 e 4 sempre. Ma per lo shuffle prova anche metronomo solo sul 4 — sentirai come il 2 diventa tuo. È un esperimento." },
      { from:"student", t:"lun 19:50", text:"Stasera registro la nuova take dello shuffle. Mi aspetto di soffrire." },
    ],
  },
];

const COACH_QUEUE = [
  { id:"Q-1", student:"Luca Bianchi",   initials:"LB", title:"12 bar in La — pentatonica", duration:"2:14", exerciseRef:"E-228 · bpm 90",   waiting:"48h", urgent:true  },
  { id:"Q-2", student:"Sara Verdi",     initials:"SV", title:"Arpeggi Cmaj7 — legato",     duration:"1:47", exerciseRef:"E-211 · bpm 100",  waiting:"44h", urgent:true  },
  { id:"Q-3", student:"Andrea Ferri",   initials:"AF", title:"Shuffle lento — groove",     duration:"2:52", exerciseRef:"E-303 · bpm 80",   waiting:"26h", urgent:true  },
  { id:"Q-4", student:"Giulia Romano",  initials:"GR", title:"Pennata alternata — 100bpm", duration:"1:30", exerciseRef:"E-156 · bpm 100",  waiting:"18h", urgent:false },
  { id:"Q-5", student:"Dario Lombardi", initials:"DL", title:"Fraseggio dorico",           duration:"2:04", exerciseRef:"E-402 · dorico",   waiting:"4h",  urgent:false },
];

// Ogni studente ha un coachId — default "marco", subset "paolo" (5 principianti/base)
const STUDENTS_LIST = [
  {name:"Luca Bianchi",   i:"LB", level:"Intermedio",     prog:42, flag:"1 feedback da fare", lastActive:"2 ore fa",   coachId:"marco"},
  {name:"Sara Verdi",     i:"SV", level:"Avanzato",       prog:68, flag:"pick settimana",     lastActive:"ieri",        coachId:"marco"},
  {name:"Andrea Ferri",   i:"AF", level:"Int. avanzato",  prog:55, flag:"in attesa 26h",      lastActive:"5 ore fa",    coachId:"marco"},
  {name:"Giulia Romano",  i:"GR", level:"Intermedio",     prog:31, lastActive:"3 giorni fa",  coachId:"paolo"},
  {name:"Dario Lombardi", i:"DL", level:"Int. avanzato",  prog:48, lastActive:"oggi",         coachId:"marco"},
  {name:"Elena Ricci",    i:"ER", level:"Base",           prog:22, lastActive:"oggi",         coachId:"paolo"},
  {name:"Marco Conti",    i:"MC", level:"Avanzato",       prog:74, lastActive:"ieri",         coachId:"marco"},
  {name:"Francesca Esposito", i:"FE", level:"Intermedio", prog:39, lastActive:"2 giorni fa",  coachId:"marco"},
  {name:"Paolo Greco",    i:"PG", level:"Base",           prog:14, flag:"1 feedback da fare", lastActive:"1 ora fa",    coachId:"paolo"},
  {name:"Chiara De Luca", i:"CL", level:"Int. avanzato",  prog:61, lastActive:"ieri",         coachId:"marco"},
  {name:"Matteo Russo",   i:"MR", level:"Intermedio",     prog:44, lastActive:"oggi",         coachId:"marco"},
  {name:"Silvia Marino",  i:"SM", level:"Avanzato",       prog:70, lastActive:"4 giorni fa",  coachId:"marco"},
  {name:"Davide Fontana", i:"DF", level:"Base",           prog:8,  lastActive:"nuovo",        coachId:"paolo"},
  {name:"Laura Villa",    i:"LV", level:"Int. avanzato",  prog:52, lastActive:"oggi",         coachId:"marco"},
  {name:"Simone Caruso",  i:"SC", level:"Intermedio",     prog:36, lastActive:"3 giorni fa",  coachId:"marco"},
  {name:"Valeria Pellegrini", i:"VP", level:"Avanzato",   prog:81, flag:"in pausa",           lastActive:"1 sett. fa",  coachId:"marco"},
  {name:"Alessio Barbieri", i:"AB", level:"Intermedio",   prog:45, lastActive:"oggi",         coachId:"marco"},
  {name:"Martina Longo",  i:"ML", level:"Base",           prog:18, lastActive:"2 giorni fa",  coachId:"paolo"},
  {name:"Federico Mancini", i:"FM", level:"Int. avanzato", prog:58, lastActive:"ieri",        coachId:"marco"},
  {name:"Arianna Serra",  i:"AS", level:"Intermedio",     prog:41, lastActive:"oggi",         coachId:"marco"},
  {name:"Nicola Gentile", i:"NG", level:"Avanzato",       prog:66, lastActive:"3 ore fa",     coachId:"marco"},
  {name:"Beatrice Santoro", i:"BS", level:"Base",         prog:25, flag:"esercizio scaduto", lastActive:"4 giorni fa", coachId:"marco"},
  {name:"Tommaso Orlando", i:"TO", level:"Intermedio",    prog:38, lastActive:"oggi",         coachId:"marco"},
  {name:"Camilla Riva",   i:"CR", level:"Int. avanzato",  prog:54, lastActive:"ieri",         coachId:"marco"},
  {name:"Gabriele Fiore", i:"GF", level:"Avanzato",       prog:72, lastActive:"oggi",         coachId:"marco"},
  {name:"Irene Bruno",    i:"IB", level:"Base",           prog:11, lastActive:"5 giorni fa",  coachId:"marco"},
  {name:"Stefano Moretti", i:"SF", level:"Intermedio",    prog:47, lastActive:"oggi",         coachId:"marco"},
  {name:"Alice Galli",    i:"AG", level:"Int. avanzato",  prog:60, lastActive:"2 ore fa",     coachId:"marco"},
];

// Team coach di Marco — sempre editabile (add coach UI). id stabile = chiave di routing.
// "marco" è il fondatore (non cancellabile). Tutti gli altri sono aggiunti nel tempo.
const COACHES = [
  {
    id: "marco",
    name: "Marco Petta",
    initials: "MP",
    role: "Fondatore",
    tagline: "Autore del metodo P.G.T. · studenti intermedi/avanzati",
    tone: "ember",
    specialties: ["tecnica","fraseggio","composizione"],
    locked: true,
    avgResponseTime: "14h",
    feedbackThisWeek: 9,
    maxStudents: 25,
    bio: "Autore del metodo. Segue personalmente ogni percorso dal livello intermedio in su.",
  },
  {
    id: "paolo",
    name: "Paolo Marchetti",
    initials: "PM",
    role: "Coach senior",
    tagline: "Chitarrista sessionista · 4 anni con Marco",
    tone: "ink",
    specialties: ["tecnica base","coordinazione","metronomo"],
    locked: false,
    avgResponseTime: "8h",
    feedbackThisWeek: 4,
    maxStudents: 10,
    bio: "Mentore di Marco dal 2022. Si occupa dei primi mesi di ogni nuovo studente.",
  },
];

const COACH_STATS = {
  activeStudents: 14,
  toReview: 5,
  unreadMsgs: 3,
  expiringMonth: 2,
};

// COACH_ANALYTICS — metriche "business / classe" per la sezione "approfondisci" del dashboard coach.
// Tutti i numeri sono coerenti con il resto dei mock (14 attivi, 5 in coda, etc.).
const COACH_ANALYTICS = {
  // KPI secondari (seconda riga stat card)
  mrr: 1860,               // € ricorrenti / mese (14 attivi × ~€133 medio)
  atRisk: 3,               // studenti inattivi 7+ giorni
  avgResponseTime: "19h",  // SLA ultimi 30 giorni

  // Trend ultime 8 settimane — take ricevute vs feedback inviati
  trend: [
    { w:"S-7", submitted: 9,  feedback: 8  },
    { w:"S-6", submitted: 12, feedback: 10 },
    { w:"S-5", submitted: 11, feedback: 11 },
    { w:"S-4", submitted: 14, feedback: 12 },
    { w:"S-3", submitted: 15, feedback: 13 },
    { w:"S-2", submitted: 13, feedback: 14 },
    { w:"S-1", submitted: 16, feedback: 14 },
    { w:"S-0", submitted: 18, feedback: 13 }, // settimana corrente: accumulo di 5 in coda
  ],

  // Heatmap 7 giorni × 6 fasce orarie — quando gli studenti inviano take
  // Ogni riga è un giorno (L→D), ogni colonna una fascia di 4 ore (0-4, 4-8, 8-12, 12-16, 16-20, 20-24)
  // I numeri sono "quanti take inviati in quella slot nelle ultime 4 settimane"
  heatmap: [
    /* L */ [0, 0, 1, 2, 3, 5],
    /* M */ [0, 0, 2, 1, 4, 6],
    /* M */ [0, 0, 1, 3, 5, 4],
    /* G */ [0, 1, 2, 2, 6, 7],
    /* V */ [0, 0, 3, 2, 4, 5],
    /* S */ [1, 0, 2, 4, 3, 2],
    /* D */ [2, 1, 3, 5, 4, 1],
  ],

  // Radar medio della classe (stesse 5 metriche di SKILLS_RADAR)
  classRadar: {
    "Tempo": 72,
    "Tecnica": 65,
    "Groove": 69,
    "Espressione": 61,
    "Orecchio": 58,
  },

  // Top 3 lezioni più viste (coerente con LIBRARY_TREE)
  topLessons: [
    { title:"Click sul 2 e 4",                       views:22, delta:"+4" },
    { title:"Pentatonica minore su 12 bar",          views:18, delta:"+2" },
    { title:"Le note blu — il 5♭ che racconta",      views:14, delta:"+3" },
  ],

  // Top 3 esercizi più inviati (ultime 4 settimane)
  topExercises: [
    { title:"Pennata alternata crome 120bpm", submissions:11 },
    { title:"12 bar in La — pentatonica",     submissions:9  },
    { title:"Shuffle lento — groove",          submissions:7  },
  ],

  // Leaderboard studenti
  mostActive: [
    { name:"Sara Verdi",      i:"SV", metric:"7 take · 12h pratica" },
    { name:"Nicola Gentile",  i:"NG", metric:"5 take · 9h pratica" },
    { name:"Gabriele Fiore",  i:"GF", metric:"4 take · 8h pratica" },
  ],
  mostImproved: [
    { name:"Sara Verdi",      i:"SV", metric:"+12 pt radar (Tempo)" },
    { name:"Dario Lombardi",  i:"DL", metric:"+8 pt radar (Groove)" },
    { name:"Luca Bianchi",    i:"LB", metric:"+6 pt radar (Espressione)" },
  ],
};

const LIBRARY_TREE = [
  {
    id:"C1", title:"Tecnica",
    modules:[
      { id:"M11", title:"Mano destra", lessons:[
        { id:"L-014", title:"Pennata alternata — il polso libero", duration:"18:42", views:12 },
        { id:"L-020", title:"Economy picking — il ponte tra le corde", duration:"22:08", views:8 },
        { id:"L-031", title:"Pollice e dita — ibrido", duration:"16:20", views:5 },
      ]},
      { id:"M12", title:"Mano sinistra", lessons:[
        { id:"L-016", title:"Legato sincero — hammer & pull", duration:"15:55", views:9 },
        { id:"L-019", title:"Stretching e diteggiature", duration:"11:40", views:7 },
      ]},
    ]
  },
  {
    id:"C2", title:"Linguaggio",
    modules:[
      { id:"M21", title:"Blues", lessons:[
        { id:"L-015", title:"Pentatonica minore su 12 bar", duration:"24:10", views:18 },
        { id:"L-040", title:"Le note blu — il 5♭ che racconta", duration:"19:02", views:14 },
      ]},
      { id:"M22", title:"Modale", lessons:[
        { id:"L-051", title:"Dorico — respirare sul 6", duration:"21:30", views:6 },
      ]},
    ]
  },
  {
    id:"C3", title:"Tempo & Groove",
    modules:[
      { id:"M31", title:"Metronomo come partner", lessons:[
        { id:"L-060", title:"Click sul 2 e 4", duration:"12:12", views:22 },
        { id:"L-061", title:"Displacement — spostare l'accento", duration:"17:48", views:4 },
      ]},
    ]
  },
];

// ─── COLLABORATORE (coach senior) ────────────────────────────────────
// Paolo Marchetti, chitarrista sessionista, 4 anni con Marco, cura 5 studenti base/intermedi.
// Vede solo i SUOI studenti, la SUA coda assegnata da Marco, la chat con i suoi, e lo storico dei feedback già dati.
// NON vede business (MRR/churn), contratti, invito studenti, library edit, o altri studenti.

const COLLAB_PROFILE = {
  name: "Paolo Marchetti",
  initials: "PM",
  role: "Coach senior",
  tagline: "Chitarrista sessionista · 4 anni con Marco",
  yearsWithMarco: 4,
  studentsAssigned: 5,
  bio: "Mentore di Marco dal 2022. Si occupa dei primi mesi di ogni nuovo studente, fino a quando Marco non prende in carico il percorso.",
};

const COLLAB_STATS = {
  assigned: 3,          // video da correggere (subset del queue Marco)
  myStudents: 5,        // studenti assegnati
  unreadMsgs: 3,        // messaggi non letti
  sentThisWeek: 4,      // feedback già inviati questa settimana
};

// I 5 studenti assegnati a Paolo (subset di STUDENTS_LIST, profili base/principianti)
const COLLAB_STUDENTS = [
  { name:"Giulia Romano",  i:"GR", level:"Intermedio", prog:31, flag:"1 take da correggere", lastActive:"3 ore fa" },
  { name:"Elena Ricci",    i:"ER", level:"Base",       prog:22, lastActive:"oggi" },
  { name:"Paolo Greco",    i:"PG", level:"Base",       prog:14, flag:"2 messaggi non letti", lastActive:"1 ora fa" },
  { name:"Martina Longo",  i:"ML", level:"Base",       prog:18, lastActive:"2 giorni fa" },
  { name:"Davide Fontana", i:"DF", level:"Base",       prog:8,  flag:"nuovo — primo video", lastActive:"oggi" },
];

// Coda video di Paolo — assegnati da Marco
const COLLAB_QUEUE = [
  { id:"QC-1", student:"Giulia Romano", initials:"GR", title:"Pennata alternata — 100bpm",  duration:"1:30", exerciseRef:"E-156 · bpm 100", waiting:"18h", urgent:false, assignedBy:"Marco" },
  { id:"QC-2", student:"Paolo Greco",   initials:"PG", title:"Accordi aperti — E, A, D",    duration:"1:14", exerciseRef:"E-105 · base",    waiting:"10h", urgent:false, assignedBy:"Marco" },
  { id:"QC-3", student:"Elena Ricci",   initials:"ER", title:"Metronomo — le crome",        duration:"2:02", exerciseRef:"E-118 · bpm 70",  waiting:"4h",  urgent:false, assignedBy:"Marco" },
];

// Chat di Paolo coi suoi studenti — stessa shape di COACH_CHATS
const COLLAB_CHATS = [
  {
    id:"giulia",
    name:"Giulia Romano", initials:"GR",
    status:"visto 2 ore fa", level:"Intermedio · mese 2/6",
    lastPreview:"Paolo grazie, riprovo stasera a 90.",
    lastTime:"oggi", unread:1, online:false,
    messages:[
      { from:"student", t:"lun 14:20", text:"Paolo, ho fatto l'esercizio ma mi pare di essere sempre fuori tempo." },
      { from:"coach",   t:"lun 16:12", text:"Giulia, ho dato un'occhiata alla take. Stai correndo. Metti il metronomo a 90 e goditi ogni croma — non pensare alla battuta finale." },
      { from:"coach",   t:"lun 16:13", text:"Ti carico una nota vocale di 40 secondi sulla respirazione della frase.", attach:{type:"audio", label:"respiro_frase.m4a", length:"0:42"} },
      { from:"student", t:"mar 10:05", text:"Paolo grazie, riprovo stasera a 90." },
    ],
  },
  {
    id:"paolo",
    name:"Paolo Greco", initials:"PG",
    status:"online adesso", level:"Base · mese 1/3",
    lastPreview:"Mi sento un po' perso sulle transizioni.",
    lastTime:"1h fa", unread:2, online:true,
    messages:[
      { from:"student", t:"mar 14:30", text:"Paolo, sono nuovo — ho fatto pratica ieri ma non capisco come passare da A a D senza perdere il tempo." },
      { from:"student", t:"mar 14:32", text:"Mi sento un po' perso sulle transizioni." },
    ],
  },
  {
    id:"elena",
    name:"Elena Ricci", initials:"ER",
    status:"visto oggi", level:"Base · settimana 3",
    lastPreview:"Ok ci provo, grazie del consiglio!",
    lastTime:"ieri", unread:0, online:false,
    messages:[
      { from:"coach",   t:"lun 09:00", text:"Elena, ti consiglio di provare la lezione 'Click sul 2 e 4' di Marco questa settimana. Poi mandami una take di 1 minuto." },
      { from:"student", t:"lun 18:40", text:"Ok ci provo, grazie del consiglio!" },
    ],
  },
];

// Storico feedback dati da Paolo (archivio "cosa ho già risposto")
const COLLAB_FEEDBACK_HISTORY = [
  { id:"FH-1", student:"Giulia Romano",  initials:"GR", title:"Pennata alternata crome 100", date:"oggi 11:20",     annotations:5, ratingAvg:3.4, status:"inviato" },
  { id:"FH-2", student:"Elena Ricci",    initials:"ER", title:"Click sul 2 e 4",             date:"ieri 16:45",      annotations:3, ratingAvg:3.8, status:"inviato" },
  { id:"FH-3", student:"Giulia Romano",  initials:"GR", title:"Accordi aperti · pulizia",    date:"ven 19:12",       annotations:7, ratingAvg:3.1, status:"inviato" },
  { id:"FH-4", student:"Martina Longo",  initials:"ML", title:"Barré F — prima settimana",   date:"gio 10:30",       annotations:4, ratingAvg:2.9, status:"inviato" },
  { id:"FH-5", student:"Paolo Greco",    initials:"PG", title:"Accordi base · E-A-D",        date:"mer 14:08",       annotations:3, ratingAvg:3.3, status:"inviato" },
];

// Esporta a window
Object.assign(window, {
  STUDENT, COACH, LESSONS_THIS_WEEK, EXERCISES_THIS_WEEK, PAST_SUBMISSIONS,
  ANNOTATIONS, RATING, SKILLS_RADAR, CHAT, COACH_CHATS, COACH_QUEUE, COACH_STATS, COACH_ANALYTICS, LIBRARY_TREE,
  STUDENTS_LIST, COACHES,
  COLLAB_PROFILE, COLLAB_STATS, COLLAB_STUDENTS, COLLAB_QUEUE, COLLAB_CHATS, COLLAB_FEEDBACK_HISTORY,
});

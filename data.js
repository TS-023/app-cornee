// Mock data for projectoverzicht.nl mobile app
// Field names mirror the Supabase schema (table: projects, employees, contacts)
// so the app can plug into the live database 1-to-1.

window.PIN_COLORS = {
  teal:   '#1F7A7A',
  olive:  '#4F6E3F',
  gold:   '#E8A93B',
  purple: '#9D7BB6',
  red:    '#E54B4B',
  grey:   '#B7BCC0',
};

// Fase → kleur. Matches Supabase `fase` veld values.
window.FASE_BY_COLOR = {
  teal:   'DO',          // Definitief Ontwerp / In ontwikkeling
  red:    'VO',          // Voorlopig Ontwerp / Vergunning
  olive:  'Opgeleverd',
  gold:   'TO',          // Technisch Ontwerp / In aanbouw
  grey:   'SO',          // Schetsontwerp / Concept
  purple: 'Studie',
};
window.PIN_LABELS = {
  teal:   'In ontwikkeling',
  olive:  'Opgeleverd',
  gold:   'Ontwerp',
  purple: 'Verkenning',
  red:    'On hold',
  grey:   'Niet gerealiseerd',
};

// Project fase (name) → colour key, and status overrides.
window.FASE_COLOR = {
  'Verkenning': 'purple',
  'Ontwerp': 'gold',
  'Uitvoering': 'teal',
  'Realisatie': 'teal',
  'In ontwikkeling': 'teal',
  'Opgeleverd': 'olive',
};
window.STATUS_COLOR = {
  'On hold': 'red',
  'Niet gerealiseerd': 'grey',
  'Gecanceld': 'grey',
};
// Resolve a project's colour key from status (override) → fase → stored color.
window.projectColor = (p) => {
  if (!p) return 'grey';
  if (p.status && window.STATUS_COLOR[p.status]) return window.STATUS_COLOR[p.status];
  if (p.fase && window.FASE_COLOR[p.fase]) return window.FASE_COLOR[p.fase];
  return p.color || 'grey';
};

const photo = (id) => `https://picsum.photos/id/${id}/800/520`;

// ─── PROJECTS ────────────────────────────────────────────────
// Fields mirror Supabase `projects` table. Coordinates (x,y) are %
// of the cropped map image (1134×1720).
window.PROJECTS = [
  pj({ slug:'noordland',  nr:'24301', name:'NOORDLAND',     alt:'Hoorn Noord',     fase:'TO',         color:'teal',   x:12, y:4,  img:177,
       opgave:'Architectuur', type:'Nieuwbouw', functie:'Wonen', verkregen:'Selectie',
       prov:'Noord-Holland', stad:'Hoorn',       straat:'Westerdijk', nr_h:'12',  postcode:'1601 AB',
       opdr:'BPD Ontwikkeling', contact:'Mark Bakker', tel:'+31 20 123 4501', email:'m.bakker@bpd.nl',
       bvo:14500, m_wonen:11200, m_kantoor:0, m_comm:1100, m_publiek:600, m_short:0, m_ond:0,
       auto:140, fiets:280, ratio:'1:2',
       npg:'A', dak:1200, zon:420, label:'BREEAM Very Good',
       hoogte:24, tevr:8.2, awards:1,
       oplev:'2024-09-15' }),

  pj({ slug:'staverland', nr:'24302', name:'STAVERLAND',    alt:'Hoorn West',      fase:'VO',         color:'red',    x:28, y:6,  img:225,
       opgave:'Architectuur', type:'Gebiedsontwikkeling', functie:'Mixed-use', verkregen:'Aanbesteding',
       prov:'Noord-Holland', stad:'Hoorn',       straat:'De Hulk', nr_h:'4',      postcode:'1601 KC',
       opdr:'Heijmans',         contact:'Petra Smit',  tel:'+31 73 543 2100', email:'p.smit@heijmans.nl',
       bvo:8900,  m_wonen:5400,  m_kantoor:2100, m_comm:900,  m_publiek:500, m_short:0, m_ond:0,
       auto:95,   fiets:160,  ratio:'1:1.5',
       npg:'B',   dak:600,    zon:240,  label:'BREEAM Good',
       hoogte:32, tevr:7.6,   awards:0,
       oplev:'2025-06-01' }),

  pj({ slug:'wavenhorst', nr:'24303', name:'WAVENHORST',    alt:'Hoorn Oost',      fase:'Opgeleverd', color:'olive',  x:40, y:3,  img:106,
       opgave:'Architectuur', type:'Nieuwbouw', functie:'Wonen', verkregen:'Selectie',
       prov:'Noord-Holland', stad:'Hoorn',       straat:'Wijdenes', nr_h:'88',   postcode:'1606 NS',
       opdr:'Synchroon',        contact:'Tom Jansen',  tel:'+31 30 290 8200', email:'t.jansen@synchroon.nl',
       bvo:6200,  m_wonen:6200,  m_kantoor:0, m_comm:0,    m_publiek:0,   m_short:0, m_ond:0,
       auto:60,   fiets:130,  ratio:'1:2',
       npg:'A',   dak:980,    zon:310,  label:'BREEAM Excellent',
       hoogte:14, tevr:8.7,   awards:2,
       oplev:'2022-03-22' }),

  pj({ slug:'wheerdorp',  nr:'24304', name:'WHEERDORP',     alt:'Purmer Zuid',     fase:'Opgeleverd', color:'olive',  x:13, y:19, img:323,
       opgave:'Architectuur', type:'Renovatie', functie:'Wonen', verkregen:'Selectie',
       prov:'Noord-Holland', stad:'Purmerend',   straat:'Wheermolen', nr_h:'27', postcode:'1442 BE',
       opdr:'AM',               contact:'Emma Visser', tel:'+31 30 609 2500', email:'e.visser@am.nl',
       bvo:4300,  m_wonen:4100,  m_kantoor:0, m_comm:200,  m_publiek:0,   m_short:0, m_ond:0,
       auto:42,   fiets:90,   ratio:'1:2.2',
       npg:'A',   dak:540,    zon:180,  label:'BREEAM Very Good',
       hoogte:18, tevr:8.4,   awards:1,
       oplev:'2023-04-18' }),

  pj({ slug:'polderhof',  nr:'24305', name:'POLDERHOF',     alt:'Volendam Oost',   fase:'SO',         color:'grey',   x:30, y:18, img:338,
       opgave:'Architectuur', type:'Nieuwbouw', functie:'Wonen', verkregen:'Selectie',
       prov:'Noord-Holland', stad:'Volendam',    straat:'Slobbeland', nr_h:'2',  postcode:'1131 AZ',
       opdr:'Heijmans',         contact:'Rick Bosman', tel:'+31 73 543 2102', email:'r.bosman@heijmans.nl',
       bvo:3200,  m_wonen:2800,  m_kantoor:0, m_comm:400,  m_publiek:0,   m_short:0, m_ond:0,
       auto:32,   fiets:70,   ratio:'1:1.8',
       npg:'B',   dak:0,      zon:160,  label:'—',
       hoogte:12, tevr:0,     awards:0,
       oplev:'2027-01-01' }),

  pj({ slug:'zaansglas',  nr:'24306', name:'ZAANS GLAS',    alt:'',                fase:'TO',         color:'gold',   x:22, y:30, img:401,
       opgave:'Architectuur', type:'Nieuwbouw', functie:'Wonen', verkregen:'Tender',
       prov:'Noord-Holland', stad:'Zaandam',     straat:'Hemkade', nr_h:'48',    postcode:'1506 PT',
       opdr:'Boelens de Gruyter', contact:'Sophie Hendriks', tel:'+31 20 700 2200', email:'s.hendriks@bdg.nl',
       bvo:11700, m_wonen:9800,  m_kantoor:0, m_comm:1100, m_publiek:800, m_short:0, m_ond:0,
       auto:110,  fiets:220,  ratio:'1:1.9',
       npg:'A',   dak:1400,   zon:680,  label:'BREEAM Excellent',
       hoogte:48, tevr:0,     awards:0,
       oplev:'2025-11-30' }),

  pj({ slug:'monnickenhof',nr:'24307',name:'MONNICKENHOF',  alt:'Zeedijk',         fase:'TO',         color:'gold',   x:47, y:31, img:443,
       opgave:'Architectuur', type:'Nieuwbouw', functie:'Mixed-use', verkregen:'Selectie',
       prov:'Noord-Holland', stad:'Monnickendam',straat:'Pierebaan', nr_h:'14',  postcode:'1141 GV',
       opdr:'ProperStok',       contact:'Anne Dekker', tel:'+31 30 460 5800', email:'a.dekker@properstok.nl',
       bvo:5600,  m_wonen:4200,  m_kantoor:0, m_comm:1100, m_publiek:300, m_short:0, m_ond:0,
       auto:54,   fiets:120,  ratio:'1:1.6',
       npg:'A',   dak:480,    zon:240,  label:'BREEAM Very Good',
       hoogte:18, tevr:0,     awards:0,
       oplev:'2024-10-12' }),

  pj({ slug:'ijoevers',   nr:'24308', name:'IJ-OEVERS',     alt:'Almere Haven Noord',fase:'VO',       color:'red',    x:56, y:36, img:488,
       opgave:'Architectuur', type:'Gebiedsontwikkeling', functie:'Wonen', verkregen:'Tender',
       prov:'Flevoland',     stad:'Almere',      straat:'Sluiskade', nr_h:'2',   postcode:'1359 KS',
       opdr:'Vorm',             contact:'Daan Kok',   tel:'+31 73 200 4400',  email:'d.kok@vorm.nl',
       bvo:9400,  m_wonen:7800,  m_kantoor:0, m_comm:800, m_publiek:800,  m_short:0, m_ond:0,
       auto:90,   fiets:200,  ratio:'1:1.9',
       npg:'A',   dak:1100,   zon:480,  label:'BREEAM Excellent',
       hoogte:36, tevr:0,     awards:0,
       oplev:'2027-03-01' }),

  pj({ slug:'havenkop',   nr:'24309', name:'HAVENKOP',      alt:'NDSM-werf',       fase:'Opgeleverd', color:'teal',   x:24, y:39, img:164,
       opgave:'Architectuur', type:'Herbestemming', functie:'Kantoor', verkregen:'Selectie',
       prov:'Noord-Holland', stad:'Amsterdam',   straat:'Ms. van Riemsdijkweg', nr_h:'56', postcode:'1033 RC',
       opdr:'G&S Vastgoed',     contact:'Lisa van den Berg', tel:'+31 20 800 1000', email:'l.vdberg@gs.nl',
       bvo:21000, m_wonen:0,     m_kantoor:18400, m_comm:1500, m_publiek:1100, m_short:0, m_ond:0,
       auto:180,  fiets:420,  ratio:'1:2.3',
       npg:'A+',  dak:2400,   zon:1200, label:'BREEAM Excellent',
       hoogte:54, tevr:9.1,   awards:3,
       oplev:'2023-07-04' }),

  pj({ slug:'westwharf',  nr:'24310', name:'WEST WHARF',    alt:'Westhaven 3',     fase:'TO',         color:'teal',   x:28, y:42, img:513,
       opgave:'Architectuur', type:'Nieuwbouw', functie:'Mixed-use', verkregen:'Tender',
       prov:'Noord-Holland', stad:'Amsterdam',   straat:'Westhaven', nr_h:'18',  postcode:'1014 BD',
       opdr:'Amvest',           contact:'Jan de Vries',tel:'+31 20 430 4000', email:'j.devries@amvest.nl',
       bvo:13300, m_wonen:9400,  m_kantoor:2400, m_comm:1100, m_publiek:400, m_short:0, m_ond:0,
       auto:120,  fiets:280,  ratio:'1:2',
       npg:'A',   dak:1600,   zon:720,  label:'BREEAM Excellent',
       hoogte:42, tevr:0,     awards:0,
       oplev:'2025-12-01' }),

  pj({ slug:'centrum',    nr:'24311', name:'CENTRUM SQUARE',alt:'Rokin 5',         fase:'TO',         color:'gold',   x:25, y:45, img:534,
       opgave:'Architectuur', type:'Herbestemming', functie:'Mixed-use', verkregen:'Direct',
       prov:'Noord-Holland', stad:'Amsterdam',   straat:'Rokin',     nr_h:'5',   postcode:'1012 KK',
       opdr:'Heijmans',         contact:'Petra Smit',  tel:'+31 73 543 2100', email:'p.smit@heijmans.nl',
       bvo:7100,  m_wonen:3200,  m_kantoor:2400, m_comm:1100, m_publiek:400, m_short:0, m_ond:0,
       auto:0,    fiets:180,  ratio:'1:2.5',
       npg:'A',   dak:480,    zon:280,  label:'BREEAM Very Good',
       hoogte:28, tevr:0,     awards:0,
       oplev:'2025-04-12' }),

  pj({ slug:'oostblok',   nr:'24312', name:'OOSTBLOK',      alt:'IJburg V',        fase:'Opgeleverd', color:'olive',  x:32, y:43, img:563,
       opgave:'Architectuur', type:'Nieuwbouw', functie:'Wonen', verkregen:'Selectie',
       prov:'Noord-Holland', stad:'Amsterdam',   straat:'Pampuslaan', nr_h:'120',postcode:'1087 HP',
       opdr:'BPD',              contact:'Mark Bakker', tel:'+31 20 123 4501', email:'m.bakker@bpd.nl',
       bvo:8800,  m_wonen:8200,  m_kantoor:0,  m_comm:600, m_publiek:0,   m_short:0, m_ond:0,
       auto:80,   fiets:200,  ratio:'1:2.2',
       npg:'A',   dak:1100,   zon:360,  label:'BREEAM Excellent',
       hoogte:24, tevr:8.5,   awards:1,
       oplev:'2023-10-18' }),

  pj({ slug:'kade19',     nr:'24313', name:'KADE 19',       alt:'Houthavens',      fase:'VO',         color:'red',    x:26, y:49, img:338,
       opgave:'Architectuur', type:'Nieuwbouw', functie:'Wonen', verkregen:'Tender',
       prov:'Noord-Holland', stad:'Amsterdam',   straat:'Houthavenkade', nr_h:'19', postcode:'1014 ZG',
       opdr:'Boelens de Gruyter', contact:'Sophie Hendriks', tel:'+31 20 700 2200', email:'s.hendriks@bdg.nl',
       bvo:11700, m_wonen:9400,  m_kantoor:0, m_comm:1500, m_publiek:800, m_short:0, m_ond:0,
       auto:0,    fiets:280,  ratio:'1:2.5',
       npg:'A+',  dak:1400,   zon:560,  label:'BREEAM Excellent',
       hoogte:42, tevr:0,     awards:0,
       oplev:'2025-09-30' }),

  pj({ slug:'atrium',     nr:'24314', name:'ATRIUM',        alt:'Zuidas Tower B',  fase:'Opgeleverd', color:'olive',  x:34, y:48, img:164,
       opgave:'Architectuur', type:'Nieuwbouw', functie:'Kantoor', verkregen:'Direct',
       prov:'Noord-Holland', stad:'Amsterdam',   straat:'Strawinskylaan', nr_h:'3079', postcode:'1077 ZX',
       opdr:'G&S Vastgoed',     contact:'Lisa van den Berg', tel:'+31 20 800 1000', email:'l.vdberg@gs.nl',
       bvo:32000, m_wonen:9200,  m_kantoor:18400, m_comm:2100, m_publiek:0, m_short:0, m_ond:2300,
       auto:240,  fiets:600,  ratio:'1:2.5',
       npg:'A+',  dak:2800,   zon:1400, label:'BREEAM Outstanding',
       hoogte:62, tevr:9.3,   awards:3,
       oplev:'2018-09-30' }),

  pj({ slug:'diemerpark', nr:'24315', name:'DIEMERPARK',    alt:'Plantage Oost',   fase:'VO',         color:'red',    x:36, y:47, img:218,
       opgave:'Architectuur', type:'Nieuwbouw', functie:'Wonen', verkregen:'Selectie',
       prov:'Noord-Holland', stad:'Diemen',      straat:'Diemerparklaan', nr_h:'24',postcode:'1112 XL',
       opdr:'Synchroon',        contact:'Tom Jansen',  tel:'+31 30 290 8200', email:'t.jansen@synchroon.nl',
       bvo:7100,  m_wonen:6800,  m_kantoor:0, m_comm:300, m_publiek:0,    m_short:0, m_ond:0,
       auto:64,   fiets:160,  ratio:'1:2.1',
       npg:'A',   dak:900,    zon:300,  label:'BREEAM Very Good',
       hoogte:18, tevr:0,     awards:0,
       oplev:'2025-08-01' }),

  pj({ slug:'amstelzijde',nr:'24316', name:'AMSTELZIJDE',   alt:'Bovenkerkerweg',  fase:'VO',         color:'red',    x:17, y:56, img:443,
       opgave:'Architectuur', type:'Nieuwbouw', functie:'Wonen', verkregen:'Tender',
       prov:'Noord-Holland', stad:'Amstelveen',  straat:'Bovenkerkerweg', nr_h:'400', postcode:'1185 XB',
       opdr:'Heijmans',         contact:'Petra Smit',  tel:'+31 73 543 2100', email:'p.smit@heijmans.nl',
       bvo:7100,  m_wonen:6800,  m_kantoor:0, m_comm:300, m_publiek:0,    m_short:0, m_ond:0,
       auto:70,   fiets:160,  ratio:'1:2',
       npg:'A',   dak:800,    zon:320,  label:'BREEAM Very Good',
       hoogte:21, tevr:0,     awards:0,
       oplev:'2025-11-15' }),

  pj({ slug:'weesper',    nr:'24317', name:'WEESPER ROND',  alt:'Bloemendalerpolder',fase:'Studie',   color:'purple', x:45, y:57, img:425,
       opgave:'Stedenbouw', type:'Gebiedsontwikkeling', functie:'Wonen', verkregen:'Direct',
       prov:'Noord-Holland', stad:'Weesp',       straat:'Bloemendalerpolder', nr_h:'1', postcode:'1382 GB',
       opdr:'Vorm',             contact:'Daan Kok',   tel:'+31 73 200 4400', email:'d.kok@vorm.nl',
       bvo:9400,  m_wonen:8200,  m_kantoor:0, m_comm:600, m_publiek:600,  m_short:0, m_ond:0,
       auto:80,   fiets:220,  ratio:'1:2.4',
       npg:'A',   dak:1200,   zon:420,  label:'BREEAM Excellent',
       hoogte:18, tevr:0,     awards:0,
       oplev:'2028-06-01' }),

  pj({ slug:'almerestad', nr:'24318', name:'ALMERE STAD',   alt:'Centraal Almere', fase:'TO',         color:'gold',   x:73, y:42, img:488,
       opgave:'Architectuur', type:'Nieuwbouw', functie:'Mixed-use', verkregen:'Tender',
       prov:'Flevoland',     stad:'Almere',      straat:'Stadhuisplein', nr_h:'1', postcode:'1315 HR',
       opdr:'Amvest',           contact:'Jan de Vries',tel:'+31 20 430 4000', email:'j.devries@amvest.nl',
       bvo:13300, m_wonen:8400,  m_kantoor:3200, m_comm:1100, m_publiek:600, m_short:0, m_ond:0,
       auto:120,  fiets:280,  ratio:'1:2',
       npg:'A',   dak:1600,   zon:680,  label:'BREEAM Very Good',
       hoogte:38, tevr:0,     awards:0,
       oplev:'2024-12-15' }),

  pj({ slug:'poortnoord', nr:'24319', name:'POORT NOORD',   alt:'Almere Poort',    fase:'Opgeleverd', color:'teal',   x:80, y:43, img:513,
       opgave:'Architectuur', type:'Nieuwbouw', functie:'Wonen', verkregen:'Selectie',
       prov:'Flevoland',     stad:'Almere',      straat:'Poortdreef', nr_h:'200',postcode:'1361 EG',
       opdr:'BPD',              contact:'Mark Bakker', tel:'+31 20 123 4501', email:'m.bakker@bpd.nl',
       bvo:8800,  m_wonen:8400,  m_kantoor:0, m_comm:400, m_publiek:0,    m_short:0, m_ond:0,
       auto:84,   fiets:200,  ratio:'1:2.1',
       npg:'A',   dak:1100,   zon:380,  label:'BREEAM Very Good',
       hoogte:22, tevr:8.3,   awards:0,
       oplev:'2023-11-20' }),

  pj({ slug:'ijburgoost', nr:'24320', name:'IJBURG OOST',   alt:'Almere Buiten',   fase:'Opgeleverd', color:'olive',  x:90, y:47, img:218,
       opgave:'Architectuur', type:'Nieuwbouw', functie:'Wonen', verkregen:'Selectie',
       prov:'Flevoland',     stad:'Almere',      straat:'Eilandenweg', nr_h:'80',postcode:'1314 EM',
       opdr:'Dura Vermeer',     contact:'Bas Mulder',  tel:'+31 88 740 9000', email:'b.mulder@duravermeer.nl',
       bvo:21000, m_wonen:18400, m_kantoor:0, m_comm:1500, m_publiek:1100,m_short:0, m_ond:0,
       auto:200,  fiets:440,  ratio:'1:2.2',
       npg:'A+',  dak:2400,   zon:1200, label:'BREEAM Excellent',
       hoogte:24, tevr:8.8,   awards:2,
       oplev:'2022-06-10' }),

  pj({ slug:'larense',    nr:'24321', name:'LARENSE BRINK', alt:'',                fase:'Opgeleverd', color:'olive',  x:73, y:60, img:534,
       opgave:'Architectuur', type:'Nieuwbouw', functie:'Wonen', verkregen:'Direct',
       prov:'Noord-Holland', stad:'Laren',       straat:'Brink', nr_h:'14',      postcode:'1251 KS',
       opdr:'Synchroon',        contact:'Tom Jansen',  tel:'+31 30 290 8200', email:'t.jansen@synchroon.nl',
       bvo:3200,  m_wonen:3200,  m_kantoor:0, m_comm:0,   m_publiek:0,    m_short:0, m_ond:0,
       auto:32,   fiets:60,   ratio:'1:1.8',
       npg:'A',   dak:540,    zon:160,  label:'BREEAM Very Good',
       hoogte:9,  tevr:8.6,   awards:0,
       oplev:'2022-05-10' }),

  pj({ slug:'mediahub',   nr:'24322', name:'MEDIA HUB',     alt:'Sumatralaan',     fase:'VO',         color:'red',    x:75, y:65, img:563,
       opgave:'Architectuur', type:'Nieuwbouw', functie:'Kantoor', verkregen:'Tender',
       prov:'Noord-Holland', stad:'Hilversum',   straat:'Sumatralaan', nr_h:'45',postcode:'1217 GP',
       opdr:'AM',               contact:'Emma Visser', tel:'+31 30 609 2500', email:'e.visser@am.nl',
       bvo:17600, m_wonen:0,     m_kantoor:15400, m_comm:1100, m_publiek:1100,m_short:0, m_ond:0,
       auto:160,  fiets:380,  ratio:'1:2.4',
       npg:'A+',  dak:2200,   zon:980,  label:'BREEAM Excellent',
       hoogte:42, tevr:0,     awards:0,
       oplev:'2026-05-20' }),

  pj({ slug:'paleistuin', nr:'24323', name:'PALEISTUIN',    alt:'Soestdijklaan',   fase:'TO',         color:'gold',   x:87, y:69, img:589,
       opgave:'Architectuur', type:'Nieuwbouw', functie:'Wonen', verkregen:'Selectie',
       prov:'Utrecht',       stad:'Baarn',       straat:'Soestdijklaan', nr_h:'2',postcode:'3741 BC',
       opdr:'BAM',              contact:'Rick Bosman', tel:'+31 88 521 7000', email:'r.bosman@bam.nl',
       bvo:5500,  m_wonen:5100,  m_kantoor:0, m_comm:400, m_publiek:0,    m_short:0, m_ond:0,
       auto:48,   fiets:120,  ratio:'1:2.2',
       npg:'A',   dak:780,    zon:260,  label:'BREEAM Very Good',
       hoogte:16, tevr:0,     awards:0,
       oplev:'2025-10-01' }),

  pj({ slug:'bergweg',    nr:'24324', name:'BERGWEG',       alt:'',                fase:'TO',         color:'teal',   x:84, y:75, img:627,
       opgave:'Architectuur', type:'Nieuwbouw', functie:'Wonen', verkregen:'Selectie',
       prov:'Utrecht',       stad:'Soest',       straat:'Bergweg', nr_h:'14',    postcode:'3766 EC',
       opdr:'Synchroon',        contact:'Tom Jansen',  tel:'+31 30 290 8200', email:'t.jansen@synchroon.nl',
       bvo:4100,  m_wonen:4100,  m_kantoor:0, m_comm:0,   m_publiek:0,    m_short:0, m_ond:0,
       auto:38,   fiets:90,   ratio:'1:2',
       npg:'A',   dak:560,    zon:180,  label:'BREEAM Very Good',
       hoogte:12, tevr:0,     awards:0,
       oplev:'2024-08-22' }),

  pj({ slug:'heidelanden',nr:'24325', name:'HEIDELANDEN',   alt:'Hilversum-Zuid',  fase:'SO',         color:'grey',   x:60, y:78, img:684,
       opgave:'Stedenbouw',   type:'Gebiedsontwikkeling', functie:'Wonen', verkregen:'Direct',
       prov:'Utrecht',       stad:'Hilversum',   straat:'Heideweg', nr_h:'1',    postcode:'1217 AA',
       opdr:'AM',               contact:'Emma Visser', tel:'+31 30 609 2500', email:'e.visser@am.nl',
       bvo:5500,  m_wonen:5500,  m_kantoor:0, m_comm:0,   m_publiek:0,    m_short:0, m_ond:0,
       auto:55,   fiets:120,  ratio:'1:2.2',
       npg:'A',   dak:800,    zon:280,  label:'—',
       hoogte:16, tevr:0,     awards:0,
       oplev:'2028-01-01' }),

  pj({ slug:'ouderijn',   nr:'24326', name:'OUDE RIJN',     alt:'',                fase:'SO',         color:'grey',   x:18, y:87, img:715,
       opgave:'Stedenbouw',   type:'Nieuwbouw', functie:'Wonen', verkregen:'Selectie',
       prov:'Utrecht',       stad:'Woerden',     straat:'Rijnkade', nr_h:'1',    postcode:'3441 BE',
       opdr:'Heijmans',         contact:'Petra Smit',  tel:'+31 73 543 2100', email:'p.smit@heijmans.nl',
       bvo:4800,  m_wonen:4500,  m_kantoor:0, m_comm:300, m_publiek:0,    m_short:0, m_ond:0,
       auto:42,   fiets:110,  ratio:'1:2',
       npg:'B',   dak:0,      zon:140,  label:'—',
       hoogte:14, tevr:0,     awards:0,
       oplev:'2027-09-01' }),

  pj({ slug:'oevers',     nr:'24327', name:'OEVERS',        alt:'',                fase:'VO',         color:'red',    x:38, y:80, img:737,
       opgave:'Architectuur', type:'Nieuwbouw', functie:'Wonen', verkregen:'Selectie',
       prov:'Utrecht',       stad:'Maarssen',    straat:'Maarssenbroeksedijk', nr_h:'40', postcode:'3603 AA',
       opdr:'AM',               contact:'Emma Visser', tel:'+31 30 609 2500', email:'e.visser@am.nl',
       bvo:5100,  m_wonen:4800,  m_kantoor:0, m_comm:300, m_publiek:0,    m_short:0, m_ond:0,
       auto:48,   fiets:120,  ratio:'1:2',
       npg:'A',   dak:680,    zon:220,  label:'BREEAM Very Good',
       hoogte:15, tevr:0,     awards:0,
       oplev:'2025-07-10' }),

  pj({ slug:'vleut',      nr:'24328', name:'VLEUTENWATER',  alt:'Vleuterweide',    fase:'TO',         color:'gold',   x:26, y:92, img:751,
       opgave:'Architectuur', type:'Nieuwbouw', functie:'Wonen', verkregen:'Selectie',
       prov:'Utrecht',       stad:'Vleuten',     straat:'Vleuterweide', nr_h:'88', postcode:'3454 PJ',
       opdr:'BAM',              contact:'Rick Bosman', tel:'+31 88 521 7000', email:'r.bosman@bam.nl',
       bvo:7800,  m_wonen:7400,  m_kantoor:0, m_comm:400, m_publiek:0,    m_short:0, m_ond:0,
       auto:74,   fiets:170,  ratio:'1:2.1',
       npg:'A',   dak:1100,   zon:380,  label:'BREEAM Excellent',
       hoogte:18, tevr:0,     awards:0,
       oplev:'2024-11-30' }),

  pj({ slug:'utrecht',    nr:'24329', name:'CENTRAAL UTRECHT', alt:'CS-zijde',     fase:'Opgeleverd', color:'olive',  x:51, y:92, img:669,
       opgave:'Architectuur', type:'Herbestemming', functie:'Mixed-use', verkregen:'Direct',
       prov:'Utrecht',       stad:'Utrecht',     straat:'Stationshal', nr_h:'1',  postcode:'3511 ED',
       opdr:'NS Stations',      contact:'Sophie Hendriks', tel:'+31 30 235 1234', email:'s.hendriks@ns.nl',
       bvo:24000, m_wonen:0,     m_kantoor:14000, m_comm:6800, m_publiek:3200, m_short:0, m_ond:0,
       auto:0,    fiets:1200, ratio:'1:5',
       npg:'A+',  dak:2800,   zon:1400, label:'BREEAM Excellent',
       hoogte:38, tevr:9.0,   awards:2,
       oplev:'2023-02-14' }),

  pj({ slug:'bosrijk',    nr:'24330', name:'BOSRIJK',       alt:'Zeisterbos',      fase:'TO',         color:'gold',   x:74, y:90, img:659,
       opgave:'Architectuur', type:'Nieuwbouw', functie:'Wonen', verkregen:'Selectie',
       prov:'Utrecht',       stad:'Zeist',       straat:'Driebergseweg', nr_h:'12', postcode:'3708 JA',
       opdr:'BPD',              contact:'Mark Bakker', tel:'+31 20 123 4501', email:'m.bakker@bpd.nl',
       bvo:6700,  m_wonen:6300,  m_kantoor:0, m_comm:400, m_publiek:0,    m_short:0, m_ond:0,
       auto:64,   fiets:140,  ratio:'1:2',
       npg:'A',   dak:880,    zon:320,  label:'BREEAM Very Good',
       hoogte:14, tevr:0,     awards:0,
       oplev:'2025-09-10' }),

  pj({ slug:'driebergen', nr:'24331', name:'DRIEBERGEN',    alt:'Stationspark',    fase:'VO',         color:'red',    x:87, y:97, img:684,
       opgave:'Architectuur', type:'Nieuwbouw', functie:'Mixed-use', verkregen:'Tender',
       prov:'Utrecht',       stad:'Driebergen',  straat:'Hoofdstraat', nr_h:'200',postcode:'3971 KP',
       opdr:'AM',               contact:'Emma Visser', tel:'+31 30 609 2500', email:'e.visser@am.nl',
       bvo:9200,  m_wonen:6800,  m_kantoor:1400, m_comm:800, m_publiek:200, m_short:0, m_ond:0,
       auto:88,   fiets:220,  ratio:'1:2.5',
       npg:'A',   dak:1200,   zon:480,  label:'BREEAM Excellent',
       hoogte:24, tevr:0,     awards:0,
       oplev:'2026-12-01' }),
];

// Map field abbreviations → full Supabase column names + display labels.
// Used by the DetailScreen to render real tabs.
window.PROJECT_FIELDS = {
  algemeen: [
    { col:'projectnummer',  k:'nr',       label:'PROJECTNUMMER' },
    { col:'projectnaam',    k:'name',     label:'PROJECTNAAM' },
    { col:'alternatieve_naam', k:'alt',   label:'ALTERNATIEVE NAAM' },
    { col:'project_type',   k:'projecttype', label:'PROJECTTYPE', from:'type' },
    { col:'categorie',      k:'categorie',label:'CATEGORIE' },
    { col:'functie',        k:'functies', label:'FUNCTIE', from:'functie' },
    { col:'fase',           k:'fase',     label:'FASE' },
    { col:'status',         k:'status',   label:'STATUS' },
    { col:'website',        k:'link',     label:'WEBSITE' },
    { col:'beschrijving',   k:'beschrijving', label:'BESCHRIJVING' },
  ],
  locatie: [
    { col:'land',           k:'land',     label:'LAND',    fixed:'Nederland' },
    { col:'provincie',      k:'prov',     label:'PROVINCIE' },
    { col:'stad',           k:'stad',     label:'STAD' },
    { col:'straat',         k:'straat',   label:'STRAAT' },
    { col:'huisnummer',     k:'nr_h',     label:'HUISNUMMER' },
    { col:'postcode',       k:'postcode', label:'POSTCODE' },
    { col:'latitude',       k:'lat',      label:'LATITUDE' },
    { col:'longitude',      k:'lon',      label:'LONGITUDE' },
  ],
  team: [
    { col:'eigenaar',       k:'team_eigenaar',      label:'EIGENAAR' },
    { col:'ontwikkelaar',   k:'team_ontwikkelaar',  label:'ONTWIKKELAAR', from:'opdr' },
    { col:'architect',      k:'team_architect',     label:'ARCHITECT', from:'arch' },
    { col:'landschap',      k:'team_landschap',     label:'LANDSCHAPSARCHITECT' },
    { col:'projectmanager', k:'team_projectmanager',label:'PROJECTMANAGER' },
    { col:'aannemer',       k:'team_aannemer',      label:'AANNEMER' },
    { col:'constructeur',   k:'team_constructeur',  label:'CONSTRUCTEUR' },
    { col:'installateur',   k:'team_installateur',  label:'INSTALLATEUR' },
    { col:'bouwfysica',     k:'team_bouwfysica',    label:'BOUWFYSICA' },
    { col:'overig',         k:'team_overig',        label:'OVERIG' },
  ],
  tijd: [
    { col:'verkenning',     k:'t_verkenning', label:'VERKENNING' },
    { col:'ontwerp',        k:'t_ontwerp',    label:'ONTWERP' },
    { col:'realisatie',     k:'t_realisatie', label:'REALISATIE' },
    { col:'looptijd',       k:'looptijd',     label:'ALGEMENE LOOPTIJD' },
    { col:'opleverdatum',   k:'oplev',        label:'OPLEVERING' },
  ],
  metrage: [
    { col:'bv_bestaand',    k:'bv_bestaand',  label:'BESTAAND',    unit:'m²' },
    { col:'bv_sloop',       k:'bv_sloop',     label:'SLOOP',       unit:'m²' },
    { col:'bv_renovatie',   k:'bv_renovatie', label:'RENOVATIE',   unit:'m²' },
    { col:'bv_nieuw',       k:'bv_nieuw',     label:'NIEUWBOUW',   unit:'m²' },
    { col:'totaal_bvo',     k:'bvo',          label:'TOTAAL BVO',  unit:'m²' },
    { col:'pr_wonen',       k:'pr_wonen',     label:'PROGRAMMA · WONEN',       unit:'m²', from:'m_wonen' },
    { col:'pr_kantoor',     k:'pr_kantoor',   label:'PROGRAMMA · KANTOOR',     unit:'m²', from:'m_kantoor' },
    { col:'pr_comm',        k:'pr_comm',      label:'PROGRAMMA · COMMERCIEEL', unit:'m²', from:'m_comm' },
    { col:'pr_leisure',     k:'pr_leisure',   label:'PROGRAMMA · LEISURE',     unit:'m²' },
    { col:'pr_publiek',     k:'pr_publiek',   label:'PROGRAMMA · PUBLIEK',     unit:'m²', from:'m_publiek' },
    { col:'pr_overig',      k:'pr_overig',    label:'PROGRAMMA · OVERIG',      unit:'m²' },
    { col:'units_wonen',    k:'units_wonen',  label:'WONINGEN',    unit:'st.' },
  ],
  details: [
    { col:'autoparkeren',   k:'auto',         label:'AUTOPARKEREN',  unit:'plekken' },
    { col:'fietsparkeren',  k:'fiets',        label:'FIETSPARKEREN', unit:'plekken' },
    { col:'bouwhoogte',     k:'hoogte',       label:'BOUWHOOGTE',    unit:'m' },
    { col:'bouwlagen',      k:'lagen',        label:'BOUWLAGEN',     unit:'st.' },
    { col:'constructie_type',     k:'constr_type', label:'CONSTRUCTIE · TYPE' },
    { col:'constructie_materiaal',k:'constr_mat',  label:'CONSTRUCTIE · MATERIAAL' },
    { col:'gevel_type',     k:'gevel_type',   label:'GEVEL · TYPE' },
    { col:'gevel_materiaal',k:'gevel_mat',    label:'GEVEL · MATERIAAL' },
  ],
  erkenning: [
    { col:'labels',         k:'labels',       label:'LABELS / CERTIFICATEN', from:'label' },
    { col:'awards',         k:'awards',       label:'AWARDS' },
  ],
  renovatie: [
    { col:'ren_architect',  k:'ren_architect',    label:'OORSPR. ARCHITECT' },
    { col:'ren_jaar',       k:'ren_jaar',         label:'BOUWJAAR' },
    { col:'ren_functie',    k:'ren_functie',      label:'OORSPR. FUNCTIE' },
    { col:'ren_samenwerking', k:'ren_samenwerking', label:'I.S.M.' },
    { col:'ren_metrage',    k:'ren_metrage',      label:'OORSPR. METRAGE', unit:'m²' },
  ],
};

window.PROJECT_TABS = [
  { id:'algemeen',     label:'ALGEMEEN' },
  { id:'locatie',      label:'LOCATIE' },
  { id:'team',         label:'TEAM' },
  { id:'tijd',         label:'TIJD' },
  { id:'metrage',      label:'METRAGE' },
  { id:'details',      label:'DETAILS' },
  { id:'erkenning',    label:'ERKENNING' },
  { id:'renovatie',    label:'RENOVATIE' },
];

// ─── EMPLOYEES ────────────────────────────────────────────────
// Mirrors Supabase `employees` table.
window.EMPLOYEES = [
  { id:'gil',      naam:'Gil Louwerens',    rol:'Architect',         team:'Ontwerp',     score:500, projecten:8, awards:3, foto:'https://i.pravatar.cc/200?img=12' },
  { id:'cornee',   naam:'Cornee Louwerens', rol:'Architect',         team:'Ontwerp',     score:432, projecten:7, awards:2, foto:'https://i.pravatar.cc/200?img=33' },
  { id:'tom',      naam:'Tom Stut',         rol:'Sr. Architect',     team:'Ontwerp',     score:321, projecten:6, awards:2, foto:'https://i.pravatar.cc/200?img=68' },
  { id:'anne',     naam:'Anne van Dijk',    rol:'Sr. Architect',     team:'Ontwerp',     score:278, projecten:5, awards:1, foto:'https://i.pravatar.cc/200?img=47' },
  { id:'marijn',   naam:'Marijn Bakker',    rol:'Stedenbouwkundige', team:'Stedenbouw',  score:246, projecten:5, awards:1, foto:'https://i.pravatar.cc/200?img=15' },
  { id:'pascal',   naam:'Pascal Wesdijk',   rol:'Projectarchitect',  team:'Uitvoering',  score:203, projecten:4, awards:0, foto:'https://i.pravatar.cc/200?img=59' },
  { id:'sven',     naam:'Sven van Houten',  rol:'Architect',         team:'Ontwerp',     score:188, projecten:4, awards:0, foto:'https://i.pravatar.cc/200?img=11' },
  { id:'lotte',    naam:'Lotte Verhagen',   rol:'Interieurarchitect',team:'Interieur',   score:162, projecten:3, awards:1, foto:'https://i.pravatar.cc/200?img=44' },
  { id:'daan',     naam:'Daan Smit',        rol:'BIM-coördinator',   team:'Technisch',   score:138, projecten:4, awards:0, foto:'https://i.pravatar.cc/200?img=61' },
  { id:'eva',      naam:'Eva de Wit',       rol:'Onderzoeker',       team:'Onderzoek',   score:96,  projecten:2, awards:0, foto:'https://i.pravatar.cc/200?img=23' },
  { id:'rik',      naam:'Rik Janssen',      rol:'Architect',         team:'Ontwerp',     score:74,  projecten:2, awards:0, foto:'https://i.pravatar.cc/200?img=51' },
  { id:'sara',     naam:'Sara El Amrani',   rol:'Stedenbouwkundige', team:'Stedenbouw',  score:58,  projecten:2, awards:0, foto:'https://i.pravatar.cc/200?img=20' },
  { id:'tobias',   naam:'Tobias Vink',      rol:'Stagiair',          team:'Ontwerp',     score:42,  projecten:1, awards:0, foto:'https://i.pravatar.cc/200?img=65' },
  { id:'iris',     naam:'Iris Mulder',      rol:'Architect',         team:'Uitvoering',  score:38,  projecten:1, awards:0, foto:'https://i.pravatar.cc/200?img=49' },
];

// Profielvelden verrijken — in productie komen deze uit het account dat iemand
// aanmaakt. Hier deterministisch afgeleid zodat het profiel echte inhoud toont.
// nick      = publieke weergavenaam  ·  naam = volledige naam (prive, op aanvraag)
// vakgebied = functie/rol            ·  sector = bredere bedrijfssector
// velden    = aantal ingevulde projectvelden (punten volgen hieruit)
// toonDemografie / toonContact = privacy-voorkeuren van de gebruiker
(function () {
  const SECTOR_BY_TEAM = {
    Ontwerp: 'Architectuur', Stedenbouw: 'Architectuur', Interieur: 'Architectuur',
    Technisch: 'Bouwtechniek', Onderzoek: 'Onderzoek', Uitvoering: 'Bouw',
  };
  const STEDEN = ['Amsterdam', 'Haarlem', 'Utrecht', 'Amstelveen', 'Zaandam', 'Hoofddorp'];
  const VROUW = ['Anne', 'Lotte', 'Eva', 'Sara', 'Iris'];
  (window.EMPLOYEES || []).forEach((e, i) => {
    const voor = e.naam.split(' ')[0];
    e.nick = e.nick || voor;
    e.vakgebied = e.vakgebied || e.rol;
    e.sector = e.sector || SECTOR_BY_TEAM[e.team] || 'Architectuur';
    e.relatie = e.relatie || 'Medewerker';
    e.geslacht = e.geslacht || (VROUW.includes(voor) ? 'Vrouw' : 'Man');
    e.leeftijd = e.leeftijd || (26 + (i * 7) % 33);
    e.woonplaats = e.woonplaats || STEDEN[i % STEDEN.length];
    e.velden = e.velden != null ? e.velden : Math.max(1, Math.round(e.score / 11));
    e.toonDemografie = e.toonDemografie != null ? e.toonDemografie : (i % 3 !== 0);
    e.toonContact = e.toonContact != null ? e.toonContact : false; // standaard: alleen op aanvraag
  });
})();

// ─── Publieke community-leden ────────────────────────────────
// Dit is een publieke app, geen interne tool van één organisatie. Naast de
// eerste (bekende) leden vullen honderden andere gebruikers de ranglijst.
// Deterministisch gegenereerd zodat ranking + aantallen realistisch ogen.
// De ingelogde gebruiker (`you`) staat bewust buiten de top 10, zodat de
// "eigen positie t/m plek 10"-logica zichtbaar is in de demo.
(function () {
  const VOOR = ['Sem','Noah','Liam','Lucas','Daan','Finn','Levi','Mees','Bram','Luuk','Jens','Tim','Thijs','Ruben','Stijn','Gijs','Bas','Joris','Wouter','Niels','Maud','Sanne','Fenna','Tess','Lynn','Roos','Julia','Nora','Saar','Loes','Esmee','Fleur','Lieke','Yara','Bo','Noor','Isa','Mila','Evi','Liv','Pim','Teun','Cas','Hugo','Floris','Vince','Sepp','Dex','Mats','Guus'];
  const ACHTER = ['de Vries','Jansen','Bakker','Visser','Smit','Meijer','de Boer','Mulder','de Groot','Bos','Vos','Peters','Hendriks','van Dijk','van den Berg','van Leeuwen','Dijkstra','Kuipers','Willems','Maas','Verhoeven','Koster','Prins','Huisman','Postma','Scholten','Hofman','Timmermans','Wolters','Sanders'];
  const TEAMS_G = ['Ontwerp','Stedenbouw','Interieur','Technisch','Onderzoek','Uitvoering'];
  const ROLLEN = ['Architect','Stedenbouwkundige','Interieurarchitect','Onderzoeker','Projectarchitect','Adviseur','Student bouwkunde','Architectuurliefhebber'];
  const N = 360;
  let seed = 7;
  const rnd = () => (seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
  const extra = [];
  for (let k = 0; k < N; k++) {
    const voor = VOOR[k % VOOR.length];
    const acht = ACHTER[(k * 7 + 3) % ACHTER.length];
    const score = Math.max(1, Math.round(300 - k * 0.78 + (rnd() * 6 - 3)));
    extra.push({
      id: 'lid-' + k, naam: voor + ' ' + acht,
      rol: ROLLEN[k % ROLLEN.length], team: TEAMS_G[k % TEAMS_G.length],
      score, projecten: 1 + (k % 5), awards: 0,
      velden: Math.max(1, Math.round(score / 11)),
      vakgebied: ROLLEN[k % ROLLEN.length], sector: 'Architectuur', relatie: 'Lid',
      toonDemografie: false, toonContact: false,
    });
  }
  window.COMMUNITY_MEMBERS = extra;

  // Markeer het lid dat rond positie 251 staat als de ingelogde gebruiker
  // ("jij"). Vast object, dus de markering blijft staan ook als window.EMPLOYEES
  // later door live data wordt vervangen. De Leaderboard combineert
  // EMPLOYEES + COMMUNITY_MEMBERS en berekent de échte positie dynamisch.
  const sorted = [...(window.EMPLOYEES || []), ...extra].sort((a, b) => b.score - a.score);
  const me = sorted[250] || sorted[sorted.length - 1];
  if (me) { me.you = true; me.nick = me.nick || me.naam.split(' ')[0]; }
})();

window.TEAMS = ['Alle', 'Ontwerp', 'Stedenbouw', 'Interieur', 'Technisch', 'Onderzoek', 'Uitvoering'];

// Keuzelijsten voor het aanmaken van een account / profiel.
// Vakgebied = wat je doet (ook voor niet-professionals: ‘Architectuurliefhebber’).
// Sector = in welke branche je actief bent (los van je vakgebied).
window.VAKGEBIEDEN = [
  'Architect', 'Stedenbouwkundige', 'Landschapsarchitect', 'Interieurarchitect',
  'Ontwikkelaar', 'Constructeur', 'Aannemer', 'Projectmanager',
  'Onderzoeker', 'Student', 'Architectuurliefhebber', 'Anders',
];
window.SECTOREN = [
  'Architectuur', 'Stedenbouw', 'Vastgoed / ontwikkeling', 'Bouw',
  'Overheid', 'Onderwijs', 'Zorg', 'Financiën', 'Anders',
];

// ─── COMPANIES (bedrijven directory) ──────────────────────────
// Mirrors Supabase `companies` table. Shows up under Profielen.
window.COMPANIES = [
  { id:'co1',  naam:'DELVA Landscape Architects', rol:'Landschapsarchitect',
    straat:'Hoogte Kadijk 71', stad:'Amsterdam', postcode:'1018 BE',
    email:'info@delva.la', tel:'+31 (020) 364 8950',
    color:'olive', logo:null, labels:['landschap','duurzaam'], awards:3, projecten:8 },
  { id:'co2',  naam:'MVSA Architects', rol:'Architect',
    straat:'Vijzelstraat 72', stad:'Amsterdam', postcode:'1017 HL',
    email:'info@mvsa-architects.com', tel:'+31 (020) 530 4830',
    color:'teal', logo:null, labels:['architectuur','interieur'], awards:7, projecten:24 },
  { id:'co3',  naam:'KAAN Architecten', rol:'Architect',
    straat:'Sint Jobsweg 30', stad:'Rotterdam', postcode:'3024 EJ',
    email:'info@kaanarchitecten.com', tel:'+31 (010) 244 5430',
    color:'teal', logo:null, labels:['architectuur','stedenbouw'], awards:4, projecten:6 },
  { id:'co4',  naam:'OMA', rol:'Architect',
    straat:'Heer Bokelweg 149', stad:'Rotterdam', postcode:'3032 AD',
    email:'office@oma.com', tel:'+31 (010) 243 8200',
    color:'red', logo:null, labels:['architectuur','onderzoek'], awards:12, projecten:5 },
  { id:'co5',  naam:'Mecanoo', rol:'Architect',
    straat:'Oude Delft 203', stad:'Delft', postcode:'2611 HD',
    email:'info@mecanoo.nl', tel:'+31 (015) 279 8100',
    color:'gold', logo:null, labels:['architectuur','interieur'], awards:8, projecten:9 },
  { id:'co6',  naam:'BPD Ontwikkeling', rol:'Opdrachtgever',
    straat:'IJsbaanpad 1A', stad:'Amsterdam', postcode:'1076 CV',
    email:'info@bpd.nl', tel:'+31 (020) 540 6111',
    color:'teal', logo:null, labels:['ontwikkelaar','wonen'], awards:1, projecten:5 },
  { id:'co7',  naam:'Heijmans', rol:'Aannemer',
    straat:'Graafsebaan 65', stad:'Rosmalen', postcode:'5248 JT',
    email:'info@heijmans.nl', tel:'+31 (073) 543 5111',
    color:'red', logo:null, labels:['aannemer','infra'], awards:2, projecten:7 },
  { id:'co8',  naam:'Arcadis', rol:'Constructeur',
    straat:'Beaulieustraat 22', stad:'Arnhem', postcode:'6814 DV',
    email:'info@arcadis.com', tel:'+31 (088) 426 1261',
    color:'olive', logo:null, labels:['adviseur','constructie'], awards:1, projecten:14 },
  { id:'co9',  naam:'BAM Bouw en Techniek', rol:'Aannemer',
    straat:'Rijnzathe 8', stad:'De Meern', postcode:'3454 PV',
    email:'info@bam.nl', tel:'+31 (088) 521 7000',
    color:'red', logo:null, labels:['aannemer','bouw'], awards:1, projecten:5 },
  { id:'co10', naam:'Synchroon', rol:'Ontwikkelaar',
    straat:'Stationsplein 95', stad:'Utrecht', postcode:'3511 ED',
    email:'info@synchroon.nl', tel:'+31 (030) 290 8200',
    color:'olive', logo:null, labels:['ontwikkelaar','wonen'], awards:2, projecten:6 },
  { id:'co11', naam:'Studioninedots', rol:'Architect',
    straat:'Vlierweg 4', stad:'Amsterdam', postcode:'1032 LB',
    email:'office@studioninedots.nl', tel:'+31 (020) 638 1818',
    color:'red', logo:null, labels:['architectuur'], awards:3, projecten:4 },
  { id:'co12', naam:'cepezed', rol:'Architect',
    straat:'Phoenixstraat 28b', stad:'Delft', postcode:'2611 AL',
    email:'mail@cepezed.nl', tel:'+31 (015) 215 0000',
    color:'gold', logo:null, labels:['architectuur','industrieel'], awards:5, projecten:6 },

  // ── Grote bouwbedrijven & partijen (voorbeelden) ──
  { id:'co13', naam:'VolkerWessels', rol:'Aannemer',
    straat:'Podium 9', stad:'Amersfoort', postcode:'3826 PA',
    email:'info@volkerwessels.com', tel:'+31 (088) 186 6000',
    color:'red', logo:null, labels:['aannemer','infra','bouw'], awards:1, projecten:11 },
  { id:'co14', naam:'Dura Vermeer', rol:'Aannemer',
    straat:'Plesmanlaan 100', stad:'Rotterdam', postcode:'3088 GZ',
    email:'info@duravermeer.nl', tel:'+31 (088) 008 9000',
    color:'red', logo:null, labels:['aannemer','bouw'], awards:0, projecten:8 },
  { id:'co15', naam:'Ballast Nedam', rol:'Aannemer',
    straat:'Ringwade 71', stad:'Nieuwegein', postcode:'3439 LM',
    email:'info@ballast-nedam.nl', tel:'+31 (088) 750 0000',
    color:'red', logo:null, labels:['aannemer','infra'], awards:0, projecten:6 },
  { id:'co16', naam:'Van Wijnen', rol:'Aannemer',
    straat:'Lingewei 1', stad:'Gorinchem', postcode:'4204 LJ',
    email:'info@vanwijnen.nl', tel:'+31 (088) 609 0900',
    color:'red', logo:null, labels:['aannemer','wonen'], awards:1, projecten:7 },
  { id:'co17', naam:'AM', rol:'Ontwikkelaar',
    straat:'Ptolemaeuslaan 80', stad:'Utrecht', postcode:'3528 BP',
    email:'info@am.nl', tel:'+31 (030) 609 2222',
    color:'olive', logo:null, labels:['ontwikkelaar','gebiedsontwikkeling'], awards:2, projecten:9 },
  { id:'co18', naam:'VORM', rol:'Ontwikkelaar',
    straat:'Poppenbouwing 50', stad:'Geldermalsen', postcode:'4191 NZ',
    email:'info@vorm.nl', tel:'+31 (088) 008 6760',
    color:'olive', logo:null, labels:['ontwikkelaar','wonen'], awards:1, projecten:5 },
  { id:'co19', naam:'Amvest', rol:'Belegger',
    straat:'Claude Debussylaan 15', stad:'Amsterdam', postcode:'1082 MC',
    email:'info@amvest.nl', tel:'+31 (020) 430 1200',
    color:'purple', logo:null, labels:['belegger','wonen'], awards:0, projecten:4 },
  { id:'co20', naam:'Vesteda', rol:'Belegger',
    straat:'De Boelelaan 759', stad:'Amsterdam', postcode:'1082 RS',
    email:'info@vesteda.com', tel:'+31 (0800) 700 0700',
    color:'purple', logo:null, labels:['belegger','wonen'], awards:0, projecten:6 },
  { id:'co21', naam:'Bouwinvest', rol:'Belegger',
    straat:'La Guardiaweg 4', stad:'Amsterdam', postcode:'1043 DG',
    email:'info@bouwinvest.nl', tel:'+31 (020) 677 1600',
    color:'purple', logo:null, labels:['belegger','vastgoed'], awards:0, projecten:5 },
  { id:'co22', naam:'West 8', rol:'Landschapsarchitect',
    straat:'Schiehaven 13M', stad:'Rotterdam', postcode:'3024 EC',
    email:'west8@west8.nl', tel:'+31 (010) 485 5801',
    color:'olive', logo:null, labels:['landschap','stedenbouw'], awards:6, projecten:7 },
  { id:'co23', naam:'Felixx Landscape Architects', rol:'Landschapsarchitect',
    straat:'Schiekade 189', stad:'Rotterdam', postcode:'3013 BR',
    email:'info@felixx.nl', tel:'+31 (010) 226 0211',
    color:'olive', logo:null, labels:['landschap','klimaat'], awards:2, projecten:5 },
  { id:'co24', naam:'Arup', rol:'Adviseur',
    straat:'Naritaweg 118', stad:'Amsterdam', postcode:'1043 CA',
    email:'amsterdam@arup.com', tel:'+31 (020) 305 8500',
    color:'grey', logo:null, labels:['adviseur','duurzaamheid'], awards:4, projecten:12 },
  { id:'co25', naam:'ABT', rol:'Constructeur',
    straat:'Arnhemsestraatweg 358', stad:'Velp', postcode:'6883 ZE',
    email:'info@abt.eu', tel:'+31 (026) 368 3111',
    color:'grey', logo:null, labels:['constructie','adviseur'], awards:2, projecten:10 },
  { id:'co26', naam:'Royal HaskoningDHV', rol:'Adviseur',
    straat:'Laan 1914 35', stad:'Amersfoort', postcode:'3818 EX',
    email:'info@rhdhv.com', tel:'+31 (088) 348 2000',
    color:'grey', logo:null, labels:['adviseur','duurzaamheid'], awards:1, projecten:9 },
];

// ─── Bedrijfstype → kleurcode (type bedrijf) ──────────────────
// Kleuren uit hetzelfde palet als de kaart (window.PIN_COLORS).
// Rood = ontwikkelaar · Teal = aannemer · Olijf/groen = landschapsarchitect
// Geel = architect · Paars = eigenaar · Grijs = adviseurs
window.COMPANY_TYPE_COLORS = {
  ontwikkelaar:        window.PIN_COLORS.red,     // rood
  aannemer:            window.PIN_COLORS.teal,    // blauw/teal
  landschapsarchitect: window.PIN_COLORS.olive,   // groen
  architect:           window.PIN_COLORS.gold,    // geel
  eigenaar:            window.PIN_COLORS.purple,  // paars
  adviseur:            window.PIN_COLORS.grey,    // grijs
};
window.COMPANY_TYPE_LABELS = {
  ontwikkelaar: 'Ontwikkelaar', aannemer: 'Aannemer',
  landschapsarchitect: 'Landschapsarchitect', architect: 'Architect',
  eigenaar: 'Eigenaar', adviseur: 'Adviseurs',
};
// Map a company's `rol` (free text) onto one of the six type buckets.
window.companyTypeKey = (rol = '') => {
  const r = (rol || '').toLowerCase();
  if (r.includes('landschap')) return 'landschapsarchitect';
  if (r.includes('architect')) return 'architect';
  if (r.includes('ontwikkel')) return 'ontwikkelaar';
  if (r.includes('aannemer') || r.includes('uitvoer') || r.includes('bouw')) return 'aannemer';
  if (r.includes('opdrachtgever') || r.includes('eigenaar') || r.includes('belegger') || r.includes('vastgoed')) return 'eigenaar';
  return 'adviseur'; // constructeur, adviseur, installateur, financieel, overheid …
};
window.companyColor = (c) => window.COMPANY_TYPE_COLORS[window.companyTypeKey(c && c.rol)];

window.COMPANY_FILTERS = ['bedrijven', 'labels', 'awards'];

// ─── LABELS (duurzaamheids- & welzijnslabels) ─────────────────
// Type → kleur (palet van de kaart):
// Duurzaamheid = groen/olijf · Welzijn = geel · Energie = teal · Circulair = paars
window.LABEL_TYPE_COLORS = {
  Duurzaamheid: window.PIN_COLORS.olive,   // groen
  Welzijn:      window.PIN_COLORS.gold,    // geel
  Energie:      window.PIN_COLORS.teal,    // teal
  Circulair:    window.PIN_COLORS.purple,  // paars
};
window.LABEL_TYPES = ['Duurzaamheid', 'Welzijn', 'Energie', 'Circulair'];
// erkend: Internationaal | Nationaal
window.LABELS = [
  { id:'lb1',  naam:'BREEAM-NL',     type:'Duurzaamheid', categorie:'Outstanding',  erkend:'Internationaal', projecten:6, project:'ATRIUM',          oms:'Duurzaamheidskeurmerk voor gebouwen — score Outstanding (★★★★★).' },
  { id:'lb2',  naam:'BREEAM-NL',     type:'Duurzaamheid', categorie:'Excellent',    erkend:'Internationaal', projecten:9, project:'NOORDLAND',       oms:'Duurzaamheidskeurmerk — score Excellent (★★★★).' },
  { id:'lb3',  naam:'Paris Proof',   type:'Duurzaamheid', categorie:'Voldaan',      erkend:'Nationaal',      projecten:4, project:'WEST WHARF',      oms:'Werkelijk energiegebruik onder de Paris Proof-norm (DGBC).' },
  { id:'lb4',  naam:'BENG',          type:'Energie',      categorie:'BENG 1·2·3',   erkend:'Nationaal',      projecten:14, project:'ZAANS GLAS',     oms:'Bijna Energieneutrale Gebouwen — wettelijke energieprestatie-eisen.' },
  { id:'lb5',  naam:'Energielabel',  type:'Energie',      categorie:'A++++',        erkend:'Nationaal',      projecten:11, project:'POORT NOORD',    oms:'Definitief energielabel van het gebouw.' },
  { id:'lb6',  naam:'WELL',          type:'Welzijn',      categorie:'Gold',         erkend:'Internationaal', projecten:3, project:'HAVENKOP',        oms:'WELL Building Standard — gezondheid & welzijn van gebruikers.' },
  { id:'lb7',  naam:'Fitwel',        type:'Welzijn',      categorie:'2 sterren',    erkend:'Internationaal', projecten:2, project:'CENTRUM SQUARE',  oms:'Welzijnscertificering gericht op gezond gebruik van het gebouw.' },
  { id:'lb8',  naam:'GPR Gebouw',    type:'Duurzaamheid', categorie:'8,0+',         erkend:'Nationaal',      projecten:7, project:'OOSTBLOK',        oms:'Integrale duurzaamheidsprestatie op 5 thema’s (schaal 1–10).' },
  { id:'lb9',  naam:'LEED',          type:'Duurzaamheid', categorie:'Platinum',     erkend:'Internationaal', projecten:1, project:'ATRIUM',          oms:'Internationaal duurzaamheidskeurmerk (USGBC).' },
  { id:'lb10', naam:'Madaster',      type:'Circulair',    categorie:'Materialenpaspoort', erkend:'Nationaal', projecten:5, project:'CENTRAAL UTRECHT', oms:'Circulair materialenpaspoort — registratie van toegepaste materialen.' },
];

// ─── AWARDS (gewonnen prijzen) ────────────────────────────────
// Positie → kleur (palet van de kaart):
// 1e = goud/geel · 2e = teal · 3e = olijf · Nominatie = grijs
window.AWARD_POSITIES = ['1e plaats', '2e plaats', '3e plaats', 'Nominatie'];
window.AWARD_POSITIE_COLORS = {
  '1e plaats':  window.PIN_COLORS.gold,    // goud
  '2e plaats':  window.PIN_COLORS.teal,    // teal
  '3e plaats':  window.PIN_COLORS.olive,   // olijf
  'Nominatie':  window.PIN_COLORS.grey,    // grijs
};
window.AWARDS = [
  { id:'aw1', naam:'Amsterdamse Architectuur Prijs', categorie:'Architectuur', erkend:'Nationaal',      positie:'1e plaats',  jaar:2023, project:'HAVENKOP' },
  { id:'aw2', naam:'MIPIM Awards',                   categorie:'Best Residential', erkend:'Internationaal', positie:'1e plaats', jaar:2022, project:'ATRIUM' },
  { id:'aw3', naam:'BNA Beste Gebouw van het Jaar',  categorie:'Architectuur', erkend:'Nationaal',      positie:'Nominatie',  jaar:2024, project:'NOORDLAND' },
  { id:'aw4', naam:'Mies van der Rohe Award',        categorie:'Architectuur', erkend:'Internationaal', positie:'Nominatie',  jaar:2024, project:'WEST WHARF' },
  { id:'aw5', naam:'ARC Award',                      categorie:'Interieur',    erkend:'Nationaal',      positie:'2e plaats',  jaar:2023, project:'CENTRUM SQUARE' },
  { id:'aw6', naam:'Gulden Feniks',                  categorie:'Transformatie', erkend:'Nationaal',     positie:'1e plaats',  jaar:2021, project:'CENTRAAL UTRECHT' },
  { id:'aw7', naam:'Abe Bonnema Prijs',              categorie:'Architectuur', erkend:'Nationaal',      positie:'3e plaats',  jaar:2022, project:'OOSTBLOK' },
  { id:'aw8', naam:'World Architecture Festival',    categorie:'Mixed-use',    erkend:'Internationaal', positie:'2e plaats',  jaar:2023, project:'WEST WHARF' },
  { id:'aw9', naam:'Gouden A.A.P.',                  categorie:'Stedenbouw',   erkend:'Nationaal',      positie:'Nominatie',  jaar:2024, project:'WEESPER ROND' },
];
window.PROFIEL_FILTERS = ['bedrijven', 'labels', 'awards'];

// ─── Koppelingen: project ↔ bedrijf / label / award ───────────
// Deterministisch afgeleid (echte veld-matches eerst, daarna een vaste
// pseudo-koppeling op type) zodat zowel het netwerk als de profielbladen
// gevuld zijn. Levert dezelfde links op bij elke render.
window.buildCompanyLinks = function (projects, companies) {
  const byType = {};
  companies.forEach((c) => { const t = window.companyTypeKey(c.rol); (byType[t] = byType[t] || []).push(c); });
  const pick = (t, seed) => { const a = byType[t] || []; return a.length ? a[seed % a.length] : null; };
  const links = new Map();
  projects.forEach((p, i) => {
    const set = new Set();
    companies.forEach((c) => {
      const n = (c.naam || '').toLowerCase();
      if (n && ((p.opdr && p.opdr.toLowerCase().includes(n)) || (p.arch && p.arch.toLowerCase().includes(n)))) set.add(c.id);
    });
    const add = (t, seed) => { const c = pick(t, seed); if (c) set.add(c.id); };
    add('architect', i);
    add(i % 2 ? 'ontwikkelaar' : 'eigenaar', i * 2 + 1);
    add('aannemer', i * 3 + 2);
    add('adviseur', i * 5 + 3);
    if (i % 2 === 0) add('landschapsarchitect', i + 1);
    links.set(p.id, set);
  });
  return links;
};
function _povHash(str) { let h = 0; const s = String(str || ''); for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) & 0x7fffffff; return h; }
function _povDetSlice(projects, seed, n) {
  const out = [], len = projects.length; if (!len) return out;
  const step = 1 + seed % Math.max(1, len - 1);
  let idx = seed % len; const used = new Set();
  for (let k = 0; k < Math.min(n, len); k++) { while (used.has(idx)) idx = (idx + 1) % len; used.add(idx); out.push(projects[idx]); idx = (idx + step) % len; }
  return out;
}
window.projectsForCompany = function (company, projects) {
  const links = window.buildCompanyLinks(projects, window.COMPANIES || []);
  return projects.filter((p) => (links.get(p.id) || new Set()).has(company.id));
};
window.projectsForAward = function (award, projects) {
  const t = (award.project || '').toUpperCase();
  const real = projects.filter((p) => (p.name || '').toUpperCase() === t || (p.alt || '').toUpperCase() === t);
  return real.length ? real : _povDetSlice(projects, _povHash(award.id), 1);
};
window.projectsForLabel = function (label, projects) {
  const fam = (label.naam || '').toUpperCase().split(/[\s\-]/)[0];
  const pj = (label.project || '').toUpperCase();
  const real = projects.filter((p) => fam && (p.label || '').toUpperCase().includes(fam) || (p.name || '').toUpperCase() === pj);
  return real.length ? real : _povDetSlice(projects, _povHash(label.id), Math.min(label.projecten || 4, projects.length));
};

// ─── CONTACTS (adresboek) ─────────────────────────────────────
window.CONTACTS = [
  { id:'c1', naam:'Jan de Vries',     bedrijf:'Arcadis',                rol:'Constructeur',     email:'jan@arcadis.nl',     tel:'+31 20 130 4400', tags:['adviseur','constructeur'] },
  { id:'c2', naam:'Petra Smit',       bedrijf:'Heijmans',               rol:'Projectleider',    email:'p.smit@heijmans.nl', tel:'+31 73 543 2100', tags:['aannemer'] },
  { id:'c3', naam:'Mark Bakker',      bedrijf:'BPD Ontwikkeling',       rol:'Opdrachtgever',    email:'m.bakker@bpd.nl',    tel:'+31 20 123 4501', tags:['opdrachtgever'] },
  { id:'c4', naam:'Lisa van den Berg',bedrijf:'G&S Vastgoed',           rol:'Adviseur',         email:'l.vdberg@gs.nl',     tel:'+31 20 800 1000', tags:['opdrachtgever'] },
  { id:'c5', naam:'Tom Jansen',       bedrijf:'Synchroon',              rol:'Projectleider',    email:'t.jansen@synchroon.nl', tel:'+31 30 290 8200', tags:['opdrachtgever'] },
  { id:'c6', naam:'Emma Visser',      bedrijf:'AM',                     rol:'Ontwikkelmanager', email:'e.visser@am.nl',     tel:'+31 30 609 2500', tags:['opdrachtgever'] },
  { id:'c7', naam:'Bas Mulder',       bedrijf:'Dura Vermeer',           rol:'Installateur',     email:'b.mulder@duravermeer.nl', tel:'+31 88 740 9000', tags:['aannemer'] },
  { id:'c8', naam:'Sophie Hendriks',  bedrijf:'NS Stations',            rol:'Architect',        email:'s.hendriks@ns.nl',   tel:'+31 30 235 1234', tags:['adviseur'] },
  { id:'c9', naam:'Rick Bosman',      bedrijf:'BAM',                    rol:'Uitvoerder',       email:'r.bosman@bam.nl',    tel:'+31 88 521 7000', tags:['aannemer'] },
  { id:'c10',naam:'Anne Dekker',      bedrijf:'ProperStok',             rol:'Vergunning',       email:'a.dekker@properstok.nl', tel:'+31 30 460 5800', tags:['overheid'] },
  { id:'c11',naam:'Daan Kok',         bedrijf:'Vorm',                   rol:'Ontwikkelmanager', email:'d.kok@vorm.nl',      tel:'+31 73 200 4400', tags:['opdrachtgever'] },
];

// Helper: build a project object from compact arguments
function pj(o) {
  return {
    id: o.slug, slug:o.slug, nr:o.nr, projectnummer:o.nr, name:o.name, projectnaam:o.name,
    alt:o.alt, opgave:o.opgave, type:o.type, functie:o.functie, verkregen:o.verkregen, fase:o.fase,
    prov:o.prov, stad:o.stad, straat:o.straat, nr_h:o.nr_h, postcode:o.postcode,
    opdr:o.opdr, contact:o.contact, tel:o.tel, email:o.email,
    bvo:o.bvo, m_wonen:o.m_wonen, m_kantoor:o.m_kantoor, m_comm:o.m_comm,
    m_publiek:o.m_publiek, m_short:o.m_short, m_ond:o.m_ond,
    auto:o.auto, fiets:o.fiets, ratio:o.ratio,
    npg:o.npg, dak:o.dak, zon:o.zon, label:o.label,
    hoogte:o.hoogte, tevr:o.tevr, awards:o.awards, oplev:o.oplev,
    color:o.color, x:o.x, y:o.y,
    img: photo(o.img),
    // Convenience derived fields (legacy compatibility with components):
    dev:o.opdr, arch:o.opdr === 'NS Stations' ? 'Benthem Crouwel' : 'MVSA Architects',
    m2: (o.bvo / 1000).toFixed(1).replace('.0','') + 'k m²',
    func: o.functie, year: o.oplev.slice(0,4), plot: o.stad,
    planning: window.PIN_LABELS[o.color],
  };
}

window.photo = photo;

// ─── Extra voorbeeldprojecten op de kaart ─────────────────────
// Los gehouden van window.PROJECTS omdat die door de live data-load wordt
// overschreven — app.jsx voegt deze lijst toe na het laden.
window.EXTRA_PROJECTS = [
  pj({ slug:'havenkwartier', nr:'24310', name:'HAVENKWARTIER', alt:'Amsterdam Houthaven', fase:'TO', color:'teal', x:0, y:0, img:1029,
       opgave:'Architectuur', type:'Nieuwbouw', functie:'Mixed-use', verkregen:'Selectie',
       prov:'Noord-Holland', stad:'Amsterdam', straat:'Houtmankade', nr_h:'88', postcode:'1013 RG',
       opdr:'AM Wonen', contact:'Lisa Vermeer', tel:'+31 20 555 0110', email:'l.vermeer@am.nl',
       bvo:21800, m_wonen:15600, m_kantoor:3200, m_comm:2000, m_publiek:1000, m_short:0, m_ond:0,
       auto:180, fiets:520, ratio:'1:3', npg:'A', dak:1800, zon:640, label:'BREEAM Excellent',
       hoogte:42, tevr:8.6, awards:1, oplev:'2025-06-01' }),

  pj({ slug:'maliebaan-hof', nr:'24311', name:'MALIEBAANHOF', alt:'Utrecht Oost', fase:'VO', color:'gold', x:0, y:0, img:1024,
       opgave:'Architectuur', type:'Renovatie', functie:'Kantoor', verkregen:'Aanbesteding',
       prov:'Utrecht', stad:'Utrecht', straat:'Maliebaan', nr_h:'16', postcode:'3581 CP',
       opdr:'a.s.r. real estate', contact:'Joost de Vries', tel:'+31 30 555 2200', email:'j.devries@asr.nl',
       bvo:9400, m_wonen:0, m_kantoor:8200, m_comm:1200, m_publiek:0, m_short:0, m_ond:0,
       auto:60, fiets:140, ratio:'1:1', npg:'B', dak:700, zon:240, label:'WELL Gold',
       hoogte:19, tevr:7.9, awards:0, oplev:'2026-03-01' }),

  pj({ slug:'weerwater-park', nr:'24312', name:'WEERWATERPARK', alt:'Almere Centrum', fase:'SO', color:'purple', x:0, y:0, img:1059,
       opgave:'Stedenbouw', type:'Gebiedsontwikkeling', functie:'Wonen', verkregen:'Prijsvraag',
       prov:'Flevoland', stad:'Almere', straat:'Esplanade', nr_h:'2', postcode:'1315 TA',
       opdr:'Gemeente Almere', contact:'Fatima Aziz', tel:'+31 36 555 7000', email:'f.aziz@almere.nl',
       bvo:31000, m_wonen:24000, m_kantoor:2500, m_comm:3000, m_publiek:1500, m_short:0, m_ond:0,
       auto:210, fiets:760, ratio:'1:4', npg:'A', dak:2600, zon:980, label:'Paris Proof',
       hoogte:55, tevr:8.1, awards:0, oplev:'2027-12-01' }),

  pj({ slug:'zaanbocht', nr:'24313', name:'ZAANBOCHT', alt:'Zaandam Hembrug', fase:'DO', color:'teal', x:0, y:0, img:1043,
       opgave:'Architectuur', type:'Transformatie', functie:'Mixed-use', verkregen:'Selectie',
       prov:'Noord-Holland', stad:'Zaandam', straat:'Hembrugstraat', nr_h:'7', postcode:'1505 RS',
       opdr:'Lingotto', contact:'Bram Koster', tel:'+31 75 555 3300', email:'b.koster@lingotto.nl',
       bvo:16700, m_wonen:11800, m_kantoor:2400, m_comm:1800, m_publiek:700, m_short:0, m_ond:0,
       auto:120, fiets:360, ratio:'1:2.5', npg:'A', dak:1400, zon:500, label:'BREEAM Very Good',
       hoogte:33, tevr:8.0, awards:0, oplev:'2025-11-01' }),

  pj({ slug:'mediapark-studio', nr:'24314', name:'MEDIAPARK STUDIO', alt:'Hilversum', fase:'Opgeleverd', color:'olive', x:0, y:0, img:1015,
       opgave:'Architectuur', type:'Nieuwbouw', functie:'Publiek', verkregen:'Aanbesteding',
       prov:'Noord-Holland', stad:'Hilversum', straat:'Sumatralaan', nr_h:'45', postcode:'1217 GP',
       opdr:'NPO', contact:'Sanne Bos', tel:'+31 35 555 9000', email:'s.bos@npo.nl',
       bvo:12300, m_wonen:0, m_kantoor:4200, m_comm:900, m_publiek:7200, m_short:0, m_ond:0,
       auto:90, fiets:220, ratio:'1:1.5', npg:'A', dak:1100, zon:430, label:'BREEAM Outstanding',
       hoogte:21, tevr:8.8, awards:2, oplev:'2023-05-01' }),
];

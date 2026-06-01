// ─────────────────────────────────────────────────────────────
// Supabase wiring — mirrors uploads/supabase.js from the website.
// Loads projects/employees/contacts from the live DB and exposes
// auth helpers. Falls back gracefully if the network is unreachable.
// ─────────────────────────────────────────────────────────────

const SUPABASE_URL  = 'https://rrxglrrrijgfyvinbmwu.supabase.co';
const SUPABASE_ANON = 'sb_publishable_xlvYAi683npTSAOLz1CgRw_1HT2EZ-T';

// supabase-js is loaded via CDN before this script
let db = null;
try {
  if (typeof supabase !== 'undefined' && supabase.createClient) {
    db = supabase.createClient(SUPABASE_URL, SUPABASE_ANON);
    window.db = db;
  }
} catch (e) {
  console.warn('Supabase init failed:', e);
}

// ─── City → map coord lookup ─────────────────────────────────
// The cropped map (assets/map-clean.jpg) covers Hoorn → Driebergen.
// Projects geocoded here land on the map; others are placed center
// with a faded look until the user edits them.
window.CITY_COORDS = {
  'Hoorn':         { x: 25, y: 5  },
  'Purmerend':     { x: 22, y: 18 },
  'Volendam':      { x: 38, y: 16 },
  'Monnickendam':  { x: 38, y: 25 },
  'Zaandam':       { x: 14, y: 28 },
  'Amsterdam':     { x: 26, y: 42 },
  'Diemen':        { x: 34, y: 45 },
  'Amstelveen':    { x: 18, y: 53 },
  'Weesp':         { x: 44, y: 53 },
  'Uithoorn':      { x: 12, y: 62 },
  'Almere':        { x: 78, y: 44 },
  'Huizen':        { x: 78, y: 53 },
  'Laren':         { x: 75, y: 60 },
  'Hilversum':     { x: 75, y: 66 },
  'Baarn':         { x: 87, y: 70 },
  'Soest':         { x: 84, y: 76 },
  'Maarssen':      { x: 38, y: 80 },
  'Vleuten':       { x: 28, y: 88 },
  'Woerden':       { x: 18, y: 88 },
  'Utrecht':       { x: 51, y: 92 },
  'Zeist':         { x: 74, y: 90 },
  'Driebergen':    { x: 87, y: 96 },
  'Driebergen-Rijsenburg': { x: 87, y: 96 },
};

// Status mapping: fase → color
window.FASE_TO_COLOR = {
  'SO':         'grey',
  'VO':         'red',
  'DO':         'teal',
  'TO':         'gold',
  'Opgeleverd': 'olive',
  'Studie':     'purple',
  'Concept':    'grey',
};
function colorFromFase(fase) {
  return window.FASE_TO_COLOR[fase] || 'grey';
}

// ─── Map a Supabase row → in-app project shape ───────────────
function mapProjectRow(row) {
  const stad = row.stad || '';
  const coord = window.CITY_COORDS[stad] || { x: 50, y: 50, missing: true };
  const color = colorFromFase(row.fase);
  return {
    id: row.id,
    slug: row.id,
    nr: row.projectnummer || '',
    projectnummer: row.projectnummer || '',
    name: (row.projectnaam || '').toUpperCase(),
    projectnaam: row.projectnaam,
    alt: row.alternatieve_naam || '',
    opgave: row.opgave || '',
    type: row.project_type || '',
    functie: row.functie || '',
    verkregen: row.verkregen_dmv || '',
    fase: row.fase || '',
    prov: row.provincie || '',
    stad,
    straat: row.straat || '',
    nr_h: row.huisnummer || '',
    postcode: row.postcode || '',
    opdr: row.opdrachtgever || '',
    contact: row.contactpersoon || '',
    tel: row.telefoon || '',
    email: row.email || '',
    bvo: row.totaal_bvo || 0,
    m_wonen: row.m_wonen || 0,
    m_kantoor: row.m_kantoor || 0,
    m_comm: row.m_commercieel || 0,
    m_publiek: row.m_publiek || 0,
    m_short: row.m_shortstay || 0,
    m_ond: row.m_onderwijs || 0,
    auto: row.autoparkeren || 0,
    fiets: row.fietsparkeren || 0,
    ratio: row.ratio_wonen || '',
    npg: row.npg_score || '',
    dak: row.daktuin || 0,
    zon: row.zonnepanelen || 0,
    label: row.duurzaamheidslabel || '',
    hoogte: row.bouwhoogte || 0,
    tevr: row.tevredenheid || 0,
    awards: row.awards || 0,
    oplev: row.opleverdatum || '',
    color, x: coord.x, y: coord.y, missing: coord.missing,
    img: `https://picsum.photos/seed/${row.id}/800/520`,
    // legacy alias keys still used by some components
    dev: row.opdrachtgever || '',
    arch: 'MVSA Architects',
    m2: row.totaal_bvo ? ((row.totaal_bvo/1000).toFixed(1).replace('.0','') + 'k m²') : '—',
    func: row.functie || '',
    year: row.opleverdatum ? row.opleverdatum.slice(0,4) : '—',
    plot: stad,
    planning: window.PIN_LABELS[color],
  };
}

function mapEmployeeRow(row) {
  return {
    id: row.id,
    naam: row.naam || '',
    rol: row.rol || '',
    team: row.team || 'Ontwerp',
    score: row.score || 0,
    projecten: row.projecten || 0,
    awards: row.awards || 0,
    foto: row.foto_url || null,
  };
}

function mapContactRow(row) {
  return {
    id: row.id,
    naam: row.naam || '',
    bedrijf: row.bedrijf || '',
    rol: row.rol || '',
    email: row.email || '',
    tel: row.telefoon || '',
    tags: row.tags || [],
  };
}

// Reverse: in-app field → Supabase column
window.FIELD_TO_COLUMN = {
  nr:'projectnummer', name:'projectnaam', alt:'alternatieve_naam',
  opgave:'opgave', type:'project_type', functie:'functie',
  verkregen:'verkregen_dmv', fase:'fase',
  prov:'provincie', stad:'stad', straat:'straat',
  nr_h:'huisnummer', postcode:'postcode',
  opdr:'opdrachtgever', contact:'contactpersoon',
  email:'email', tel:'telefoon',
  bvo:'totaal_bvo', m_wonen:'m_wonen', m_kantoor:'m_kantoor',
  m_comm:'m_commercieel', m_publiek:'m_publiek',
  m_short:'m_shortstay', m_ond:'m_onderwijs',
  auto:'autoparkeren', fiets:'fietsparkeren', ratio:'ratio_wonen',
  npg:'npg_score', dak:'daktuin', zon:'zonnepanelen', label:'duurzaamheidslabel',
  hoogte:'bouwhoogte', tevr:'tevredenheid', awards:'awards',
  oplev:'opleverdatum',
};

// ─── API ─────────────────────────────────────────────────────
window.API = {
  // Connection status
  liveData: false,
  source: 'mock', // 'live' | 'mock'

  // ── Projects
  async loadProjects() {
    if (!db) return { projects: window.PROJECTS, source: 'mock' };
    try {
      const { data, error } = await db.from('projects')
        .select('*').order('created_at', { ascending: false });
      if (error) throw error;
      if (!data || data.length === 0) {
        return { projects: window.PROJECTS, source: 'mock' };
      }
      const mapped = data.map(mapProjectRow);
      window.PROJECTS = mapped;
      window.API.liveData = true;
      window.API.source = 'live';
      return { projects: mapped, source: 'live' };
    } catch (e) {
      console.warn('loadProjects failed, using mock:', e.message);
      return { projects: window.PROJECTS, source: 'mock' };
    }
  },

  async saveProjectFields(projectId, patch) {
    if (!db) throw new Error('Geen verbinding met database.');
    // Translate in-app keys → Supabase columns
    const dbPatch = {};
    for (const [k, v] of Object.entries(patch)) {
      const col = window.FIELD_TO_COLUMN[k];
      if (col) dbPatch[col] = v;
    }
    if (Object.keys(dbPatch).length === 0) return;
    const { error } = await db.from('projects')
      .update({ ...dbPatch, updated_at: new Date().toISOString() })
      .eq('id', projectId);
    if (error) throw error;
  },

  // ── Employees
  async loadEmployees() {
    if (!db) return { employees: window.EMPLOYEES, source: 'mock' };
    try {
      const { data, error } = await db.from('employees')
        .select('*').order('score', { ascending: false });
      if (error) throw error;
      if (!data || data.length === 0) {
        return { employees: window.EMPLOYEES, source: 'mock' };
      }
      const mapped = data.map(mapEmployeeRow);
      window.EMPLOYEES = mapped;
      return { employees: mapped, source: 'live' };
    } catch (e) {
      console.warn('loadEmployees failed, using mock:', e.message);
      return { employees: window.EMPLOYEES, source: 'mock' };
    }
  },

  // ── Contacts
  async loadContacts() {
    if (!db) return { contacts: window.CONTACTS, source: 'mock' };
    try {
      const { data, error } = await db.from('contacts').select('*').limit(200);
      if (error) throw error;
      if (!data || data.length === 0) {
        return { contacts: window.CONTACTS, source: 'mock' };
      }
      const mapped = data.map(mapContactRow);
      window.CONTACTS = mapped;
      return { contacts: mapped, source: 'live' };
    } catch (e) {
      console.warn('loadContacts failed, using mock:', e.message);
      return { contacts: window.CONTACTS, source: 'mock' };
    }
  },

  // ── Auth
  async signIn(email, password) {
    if (!db) throw new Error('Geen verbinding met database.');
    const { data, error } = await db.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data.user;
  },
  async signUp(email, password, naam) {
    if (!db) throw new Error('Geen verbinding met database.');
    const { data, error } = await db.auth.signUp({ email, password });
    if (error) throw error;
    // Create profile
    if (data.user && naam) {
      try {
        await db.from('profiles').insert({ id: data.user.id, naam, email });
      } catch(e) { console.warn('profile insert failed:', e); }
    }
    return data.user;
  },
  async signOut() {
    if (!db) return;
    await db.auth.signOut();
  },
  async getSession() {
    if (!db) return null;
    const { data } = await db.auth.getSession();
    return data.session;
  },
  async getProfile(userId) {
    if (!db || !userId) return null;
    try {
      const { data } = await db.from('profiles').select('*').eq('id', userId).maybeSingle();
      return data;
    } catch { return null; }
  },
  onAuthChange(callback) {
    if (!db) return () => {};
    const { data: { subscription } } = db.auth.onAuthStateChange((_event, session) => {
      callback(session);
    });
    return () => subscription.unsubscribe();
  },
};

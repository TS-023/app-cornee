// NIEUW PROJECT — multi-step wizard
// Captures the full project parameter set, grouped into logical steps.
// Couples Team / Label / Awards to the Profielen (window.COMPANIES) directory.
const { SAGE, SAGE_DARK, TEXT_DARK, TEXT_MED, TEXT_LIGHT, BORDER, GOLD } = window.POTHEME;
const npReact = React;
const { useState: useNPState } = React;

// ── Option lists ──────────────────────────────────────────────
const PROJECTTYPES = [
  'Stedenbouw',
  'Architectuur — nieuwbouw',
  'Architectuur — sloop/nieuwbouw',
  'Architectuur — renovatie',
  'Architectuur — restauratie',
];
const CATEGORIEEN = ['Mixed-use', 'Wonen', 'Kantoor', 'Publiek', 'Leisure/commercieel', 'Overheid', 'Overig'];
const FUNCTIES = [
  'Grondgebonden woningen', 'Appartementen', 'Kantoor', 'Winkel / retail', 'Horeca',
  'Hotel', 'Bioscoop', 'Theater', 'Museum', 'Ziekenhuis', 'Zorg', 'Onderwijs',
  'Politiebureau', 'Kazerne', 'Sport', 'Parkeren', 'Bedrijfsruimte', 'Logistiek', 'Overig',
];
const FASES = ['Verkenning', 'Ontwerp', 'Uitvoering', 'Realisatie', 'Opgeleverd'];
const STATUSSEN = ['Actief', 'On hold', 'Niet gerealiseerd'];
const FASE_COLOR = { 'Verkenning': 'purple', 'Ontwerp': 'gold', 'Uitvoering': 'teal', 'Realisatie': 'teal', 'Opgeleverd': 'olive' };
const TEAM_ROLES = [
  { k: 'eigenaar', label: 'Eigenaar', rol: 'Opdrachtgever' },
  { k: 'ontwikkelaar', label: 'Ontwikkelaar', rol: 'Ontwikkelaar' },
  { k: 'architect', label: 'Architect', rol: 'Architect' },
  { k: 'landschap', label: 'Landschapsarchitect', rol: 'Landschapsarchitect' },
  { k: 'projectmanager', label: 'Projectmanager', rol: 'Projectmanager' },
  { k: 'aannemer', label: 'Aannemer', rol: 'Aannemer' },
  { k: 'constructeur', label: 'Constructeur', rol: 'Constructeur' },
  { k: 'installateur', label: 'Installateur', rol: 'Installateur' },
  { k: 'bouwfysica', label: 'Bouwfysica', rol: 'Bouwfysica' },
  { k: 'overig', label: 'Overig', rol: null },
];
const CONSTR_TYPE = ['Skeletbouw', 'Wandenbouw', 'Tunnelgieten', 'Staalframe', 'Houtskeletbouw', 'Overig'];
const CONSTR_MAT = ['Beton', 'Staal', 'Hout (CLT)', 'Metselwerk', 'Hybride', 'Overig'];
const GEVEL_TYPE = ['Gemetselde gevel', 'Vliesgevel', 'Prefab betonelement', 'Houten gevel', 'Natuursteen', 'Overig'];
const GEVEL_MAT = ['Baksteen', 'Beton', 'Glas', 'Hout', 'Aluminium', 'Natuursteen', 'Keramiek', 'Overig'];
const PROVINCIES = ['Noord-Holland', 'Zuid-Holland', 'Utrecht', 'Flevoland', 'Noord-Brabant', 'Gelderland', 'Overijssel', 'Groningen', 'Friesland', 'Drenthe', 'Zeeland', 'Limburg'];
const LABEL_OPTIES = ['BREEAM Outstanding', 'BREEAM Excellent', 'BREEAM Very Good', 'WELL Platinum', 'WELL Gold', 'GPR ≥ 8', 'Paris Proof', 'Energieneutraal (BENG)'];

const npInput = {
  width: '100%', boxSizing: 'border-box', border: `1px solid ${BORDER}`, borderRadius: 8,
  padding: '12px', fontFamily: 'Barlow, sans-serif', fontSize: 14, color: TEXT_DARK,
  outline: 'none', background: '#fff', WebkitAppearance: 'none', appearance: 'none',
};

// ── Reusable controls ─────────────────────────────────────────
function Lbl({ children, hint }) {
  return (
    <div style={{ marginBottom: 7, display: 'flex', alignItems: 'baseline', gap: 8 }}>
      <span style={{
        fontFamily: 'Barlow, sans-serif', fontWeight: 600, fontSize: 11,
        letterSpacing: '0.14em', color: TEXT_MED, textTransform: 'uppercase',
      }}>{children}</span>
      {hint && <span style={{ fontFamily: 'Barlow, sans-serif', fontSize: 11, color: TEXT_LIGHT }}>{hint}</span>}
    </div>
  );
}
function Row({ label, hint, children, gap = 18 }) {
  return <div style={{ marginBottom: gap }}><Lbl hint={hint}>{label}</Lbl>{children}</div>;
}
function TwoCol({ children }) {
  return <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>{children}</div>;
}
function Text({ value, onChange, placeholder, type = 'text' }) {
  return <input style={npInput} type={type} value={value || ''} placeholder={placeholder}
    onChange={e => onChange(e.target.value)} />;
}
function Num({ value, onChange, placeholder, suffix }) {
  return (
    <div style={{ position: 'relative' }}>
      <input style={{ ...npInput, paddingRight: suffix ? 44 : 12 }} type="number" inputMode="numeric"
        value={value === 0 || value ? value : ''} placeholder={placeholder || '0'}
        onChange={e => onChange(e.target.value === '' ? '' : +e.target.value)} />
      {suffix && <span style={{
        position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
        fontFamily: 'Barlow, sans-serif', fontSize: 12, color: TEXT_LIGHT, pointerEvents: 'none',
      }}>{suffix}</span>}
    </div>
  );
}
// Single-choice chips, with optional colour dot + "add your own"
function Chips({ options, value, onChange, colorMap, allowAdd }) {
  const [adding, setAdding] = useNPState(false);
  const [draft, setDraft] = useNPState('');
  const extra = value && !options.includes(value) ? [value] : [];
  const all = [...options, ...extra];
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
      {all.map(o => {
        const on = value === o;
        return (
          <button key={o} onClick={() => onChange(on ? '' : o)} style={chipStyle(on)}>
            {colorMap && <span style={{ width: 9, height: 9, borderRadius: 5, background: colorMap[o] || '#bbb' }} />}
            {o}
          </button>
        );
      })}
      {allowAdd && (adding ? (
        <span style={{ display: 'inline-flex', gap: 6 }}>
          <input autoFocus style={{ ...npInput, width: 130, padding: '7px 10px' }} value={draft}
            placeholder="Toevoegen…" onChange={e => setDraft(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && draft.trim()) { onChange(draft.trim()); setDraft(''); setAdding(false); } }} />
          <button onClick={() => { if (draft.trim()) { onChange(draft.trim()); setDraft(''); } setAdding(false); }} style={chipStyle(true)}>OK</button>
        </span>
      ) : (
        <button onClick={() => setAdding(true)} style={{ ...chipStyle(false), borderStyle: 'dashed' }}>+ Anders</button>
      ))}
    </div>
  );
}
// Multi-choice chips with add-your-own
function MultiChips({ options, values, onChange, allowAdd }) {
  const [adding, setAdding] = useNPState(false);
  const [draft, setDraft] = useNPState('');
  const vals = values || [];
  const extra = vals.filter(v => !options.includes(v));
  const all = [...options, ...extra];
  const toggle = (o) => onChange(vals.includes(o) ? vals.filter(x => x !== o) : [...vals, o]);
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
      {all.map(o => (
        <button key={o} onClick={() => toggle(o)} style={chipStyle(vals.includes(o))}>{o}</button>
      ))}
      {allowAdd && (adding ? (
        <span style={{ display: 'inline-flex', gap: 6 }}>
          <input autoFocus style={{ ...npInput, width: 150, padding: '7px 10px' }} value={draft}
            placeholder="Eigen functie…" onChange={e => setDraft(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && draft.trim()) { onChange([...vals, draft.trim()]); setDraft(''); setAdding(false); } }} />
          <button onClick={() => { if (draft.trim()) onChange([...vals, draft.trim()]); setDraft(''); setAdding(false); }} style={chipStyle(true)}>OK</button>
        </span>
      ) : (
        <button onClick={() => setAdding(true)} style={{ ...chipStyle(false), borderStyle: 'dashed' }}>+ Toevoegen</button>
      ))}
    </div>
  );
}
function chipStyle(on) {
  return {
    all: 'unset', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 7,
    padding: '8px 14px', borderRadius: 999,
    background: on ? TEXT_DARK : '#F4F2EE', color: on ? '#fff' : TEXT_MED,
    border: `1px solid ${on ? TEXT_DARK : BORDER}`,
    fontFamily: 'Barlow, sans-serif', fontSize: 12, fontWeight: 500, letterSpacing: '0.02em',
  };
}
// Couple a team role to a company from the Profielen directory (or free text)
function CompanyPicker({ suggestRol, value, onChange }) {
  const companies = window.COMPANIES || [];
  const suggested = suggestRol ? companies.filter(c => c.rol === suggestRol) : [];
  const others = companies.filter(c => !suggested.includes(c));
  const isFree = value && value.startsWith('vrij:');
  return (
    <div>
      <select style={npInput} value={isFree ? '__free__' : (value || '')}
        onChange={e => {
          const v = e.target.value;
          if (v === '__free__') onChange('vrij:');
          else onChange(v);
        }}>
        <option value="">— Kies bedrijf uit profielen —</option>
        {suggested.length > 0 && (
          <optgroup label={`Voorgesteld (${suggestRol})`}>
            {suggested.map(c => <option key={c.id} value={c.id}>{c.naam}</option>)}
          </optgroup>
        )}
        <optgroup label="Alle bedrijven">
          {others.map(c => <option key={c.id} value={c.id}>{c.naam}</option>)}
        </optgroup>
        <option value="__free__">+ Ander bedrijf (vrije invoer)…</option>
      </select>
      {isFree && (
        <input autoFocus style={{ ...npInput, marginTop: 8 }} placeholder="Bedrijfsnaam"
          value={value.slice(5)} onChange={e => onChange('vrij:' + e.target.value)} />
      )}
    </div>
  );
}
function PhasePeriod({ label, value, onChange, accent }) {
  const [van, tot] = value || ['', ''];
  return (
    <div style={{ marginBottom: 14, padding: '12px 14px', background: '#F8F7F4', borderRadius: 10, borderLeft: `3px solid ${accent}` }}>
      <div style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 700, fontSize: 12, color: TEXT_DARK, letterSpacing: '0.08em', marginBottom: 9, textTransform: 'uppercase' }}>{label}</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, alignItems: 'center' }}>
        <input style={{ ...npInput, padding: '9px 10px' }} type="month" value={van} onChange={e => onChange([e.target.value, tot])} />
        <input style={{ ...npInput, padding: '9px 10px' }} type="month" value={tot} onChange={e => onChange([van, e.target.value])} />
      </div>
    </div>
  );
}
function StepHeading({ children, sub }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 800, fontSize: 19, color: TEXT_DARK, letterSpacing: '0.01em' }}>{children}</div>
      {sub && <div style={{ fontFamily: 'Barlow, sans-serif', fontSize: 12.5, color: TEXT_MED, marginTop: 4, lineHeight: 1.4 }}>{sub}</div>}
    </div>
  );
}
function SubHead({ children, right }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '4px 0 12px' }}>
      <span style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 600, fontSize: 11, letterSpacing: '0.18em', color: TEXT_MED }}>{children}</span>
      <span style={{ flex: 1, height: 1, background: BORDER }} />
      {right}
    </div>
  );
}

// ── The wizard ────────────────────────────────────────────────
const BLANK = {
  name: '', alt: '', projecttype: '', categorie: '', functies: [], fase: '', status: 'Actief', link: '', beschrijving: '',
  land: 'Nederland', prov: '', stad: '', straat: '', nr_h: '', postcode: '', lon: '', lat: '',
  team: {}, verkenning: ['', ''], ontwerp: ['', ''], realisatie: ['', ''],
  bv: { bestaand: '', sloop: '', renovatie: '', nieuw: '' },
  pr: { wonen: '', kantoor: '', commercieel: '', leisure: '', publiek: '', overig: '' },
  units_wonen: '', auto: '', fiets: '', hoogte: '', lagen: '',
  constr_type: '', constr_mat: '', gevel_type: '', gevel_mat: '',
  labels: [], awards: [],
  ren: { architect: '', jaar: '', functie: '', samenwerking: '', metrage: '' },
};

function NewProjectSheet({ onClose, onSave }) {
  const [f, setF] = useNPState(BLANK);
  const [step, setStep] = useNPState(0);
  const stepRowRef = window.useDragScroll();
  const [metMode, setMetMode] = useNPState('bouwvolume');
  const set = (k, v) => setF(s => ({ ...s, [k]: v }));
  const setNest = (group, k, v) => setF(s => ({ ...s, [group]: { ...s[group], [k]: v } }));

  const isReno = /renovatie|restauratie|sloop/i.test(f.projecttype);
  const STEPS = ['Algemeen', 'Locatie', 'Team', 'Tijd', 'Metrage', 'Details', isReno ? 'Labels, awards & renovatie' : 'Labels, awards & overig'];
  const last = STEPS.length - 1;

  // Derived metrage totals
  const sum = (obj) => Object.values(obj).reduce((a, b) => a + (+b || 0), 0);
  const bvTotaal = (+f.bv.renovatie || 0) + (+f.bv.nieuw || 0);
  const prTotaal = sum(f.pr);
  const metMatch = bvTotaal === prTotaal;

  // Derived looptijd
  const yrs = [f.verkenning[0], f.verkenning[1], f.ontwerp[0], f.ontwerp[1], f.realisatie[0], f.realisatie[1]]
    .filter(Boolean).map(s => +s.slice(0, 4));
  const loopVan = yrs.length ? Math.min(...yrs) : null;
  const loopTot = yrs.length ? Math.max(...yrs) : null;

  const valid = f.name.trim();
  const goSave = () => {
    if (!valid) { setStep(0); return; }
    const compName = (v) => {
      if (!v) return '';
      if (v.startsWith('vrij:')) return v.slice(5);
      const c = (window.COMPANIES || []).find(x => x.id === v);
      return c ? c.naam : '';
    };
    onSave({
      name: f.name.trim(), alt: f.alt.trim(),
      type: f.projecttype, categorie: f.categorie, functie: f.functies[0] || f.categorie,
      functies: f.functies, fase: f.fase, status: f.status, link: f.link, beschrijving: f.beschrijving,
      land: f.land, prov: f.prov, stad: f.stad.trim(), straat: f.straat, nr_h: f.nr_h, postcode: f.postcode,
      lon: f.lon, lat: f.lat,
      team: Object.fromEntries(TEAM_ROLES.map(r => [r.k, compName(f.team[r.k])]).filter(([, v]) => v)),
      opdr: compName(f.team.ontwikkelaar) || compName(f.team.eigenaar),
      arch: compName(f.team.architect) || 'MVSA Architects',
      verkenning: f.verkenning, ontwerp: f.ontwerp, realisatie: f.realisatie,
      loopVan, loopTot,
      bouwvolume: f.bv, programma: f.pr, bvo: bvTotaal || prTotaal,
      units_wonen: +f.units_wonen || 0, auto: +f.auto || 0, fiets: +f.fiets || 0,
      hoogte: +f.hoogte || 0, lagen: +f.lagen || 0,
      constr_type: f.constr_type, constr_mat: f.constr_mat, gevel_type: f.gevel_type, gevel_mat: f.gevel_mat,
      labels: f.labels, awards: f.awards,
      renovatie: isReno ? f.ren : null,
      color: FASE_COLOR[f.fase] || 'grey',
    });
  };

  return (
    <div style={{
      position: 'absolute', inset: 0, background: '#fff', zIndex: 120,
      display: 'flex', flexDirection: 'column', overflow: 'hidden',
      animation: 'sheetUp 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)',
    }}>
      <window.SheetHeader title="NIEUW PROJECT" onClose={onClose} />

      {/* Step indicator */}
      <div ref={stepRowRef} style={{
        display: 'flex', overflowX: 'auto', padding: '0 4px',
        borderBottom: `1px solid ${BORDER}`, background: '#fff', flexShrink: 0,
        scrollbarWidth: 'none', cursor: 'grab',
      }}>
        {STEPS.map((s, i) => {
          const on = i === step, done = i < step;
          return (
            <button key={s} onClick={() => setStep(i)} style={{
              all: 'unset', cursor: 'pointer', flexShrink: 0,
              display: 'inline-flex', alignItems: 'center', gap: 8, padding: '15px 16px',
              borderBottom: on ? `2px solid ${TEXT_DARK}` : '2px solid transparent',
              whiteSpace: 'nowrap',
            }}>
              <span style={{
                width: 20, height: 20, borderRadius: 10, flexShrink: 0,
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'Barlow, sans-serif', fontWeight: 800, fontSize: 10,
                background: on ? TEXT_DARK : (done ? SAGE : 'transparent'),
                color: (on || done) ? '#fff' : TEXT_LIGHT,
                border: (on || done) ? 'none' : `1.5px solid ${BORDER}`,
              }}>{done ? '✓' : i + 1}</span>
              <span style={{
                fontFamily: 'Barlow, sans-serif', fontWeight: on ? 700 : 500, fontSize: 12,
                letterSpacing: '0.08em', textTransform: 'uppercase',
                color: on ? TEXT_DARK : (done ? TEXT_MED : TEXT_LIGHT),
              }}>{s}</span>
            </button>
          );
        })}
      </div>

      {/* Body */}
      <div style={{ flex: 1, overflow: 'auto', padding: '20px 20px 24px' }}>
        {step === 0 && (
          <div>
            <StepHeading sub="De basisgegevens waarmee het project op de kaart en in de lijst verschijnt.">Algemeen</StepHeading>
            <Row label="Projectnaam"><Text value={f.name} onChange={v => set('name', v)} placeholder="bijv. Noordkade" /></Row>
            <Row label="Alternatieve naam" hint="optioneel"><Text value={f.alt} onChange={v => set('alt', v)} placeholder="Werktitel of locatie" /></Row>
            <Row label="Projecttype"><Chips options={PROJECTTYPES} value={f.projecttype} onChange={v => set('projecttype', v)} /></Row>
            <Row label="Categorie"><Chips options={CATEGORIEEN} value={f.categorie} onChange={v => set('categorie', v)} /></Row>
            <Row label="Functie" hint="meerdere mogelijk"><MultiChips options={FUNCTIES} values={f.functies} onChange={v => set('functies', v)} allowAdd /></Row>
            <Row label="Fase"><Chips options={FASES} value={f.fase} onChange={v => set('fase', v)} colorMap={Object.fromEntries(FASES.map(x => [x, window.PIN_COLORS[FASE_COLOR[x]]]))} /></Row>
            <Row label="Status"><Chips options={STATUSSEN} value={f.status} onChange={v => set('status', v)} /></Row>
            <Row label="Website" hint="optioneel"><Text value={f.link} onChange={v => set('link', v)} placeholder="https://" type="url" /></Row>
            <Row label="Beschrijving" hint={`${(f.beschrijving.trim() ? f.beschrijving.trim().split(/\s+/).length : 0)} / 300 woorden`} gap={4}>
              <textarea style={{ ...npInput, minHeight: 110, resize: 'vertical', lineHeight: 1.5 }}
                value={f.beschrijving} placeholder="Korte omschrijving van de opgave, het ontwerp en de context…"
                onChange={e => {
                  const words = e.target.value.trim().split(/\s+/);
                  if (e.target.value === '' || words.length <= 300) set('beschrijving', e.target.value);
                }} />
            </Row>
          </div>
        )}

        {step === 1 && (
          <div>
            <StepHeading sub="Adres en coördinaten — de coördinaten bepalen de positie van de pin op de kaart.">Locatie</StepHeading>
            <TwoCol>
              <Row label="Land"><Text value={f.land} onChange={v => set('land', v)} /></Row>
              <Row label="Provincie">
                <select style={npInput} value={f.prov} onChange={e => set('prov', e.target.value)}>
                  <option value="">— Kies —</option>
                  {PROVINCIES.map(p => <option key={p}>{p}</option>)}
                </select>
              </Row>
            </TwoCol>
            <Row label="Stad / plaats"><Text value={f.stad} onChange={v => set('stad', v)} placeholder="bijv. Amsterdam" /></Row>
            <TwoCol>
              <Row label="Straat"><Text value={f.straat} onChange={v => set('straat', v)} /></Row>
              <Row label="Nummer"><Text value={f.nr_h} onChange={v => set('nr_h', v)} /></Row>
            </TwoCol>
            <Row label="Postcode"><Text value={f.postcode} onChange={v => set('postcode', v)} placeholder="1234 AB" /></Row>
            <SubHead>COÖRDINATEN</SubHead>
            <TwoCol>
              <Row label="Latitude"><Text value={f.lat} onChange={v => set('lat', v)} placeholder="52.370" /></Row>
              <Row label="Longitude"><Text value={f.lon} onChange={v => set('lon', v)} placeholder="4.895" /></Row>
            </TwoCol>
          </div>
        )}

        {step === 2 && (
          <div>
            <StepHeading sub="Koppel betrokken bedrijven uit de Profielen-directory. Onbekend bedrijf? Kies ‘ander bedrijf’.">Team</StepHeading>
            {TEAM_ROLES.map(r => (
              <Row key={r.k} label={r.label}>
                <CompanyPicker suggestRol={r.rol} value={f.team[r.k]} onChange={v => setNest('team', r.k, v)} />
              </Row>
            ))}
          </div>
        )}

        {step === 3 && (
          <div>
            <StepHeading sub="Per fase een periode. De algemene looptijd wordt hieruit afgeleid (start = begin verkenning, oplevering = eind realisatie).">Tijd</StepHeading>
            <PhasePeriod label="Verkenning" value={f.verkenning} onChange={v => set('verkenning', v)} accent={window.PIN_COLORS.purple} />
            <PhasePeriod label="Ontwerp" value={f.ontwerp} onChange={v => set('ontwerp', v)} accent={window.PIN_COLORS.teal} />
            <PhasePeriod label="Realisatie" value={f.realisatie} onChange={v => set('realisatie', v)} accent={window.PIN_COLORS.gold} />
            <div style={{
              marginTop: 8, padding: '14px 16px', borderRadius: 10,
              background: SAGE, color: '#fff',
            }}>
              <div style={{ fontFamily: 'Barlow, sans-serif', fontSize: 11, letterSpacing: '0.16em', opacity: 0.9 }}>ALGEMENE LOOPTIJD</div>
              <div style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 800, fontSize: 22, marginTop: 3 }}>
                {loopVan ? `${loopVan} — ${loopTot}` : 'Nog niet bepaald'}
              </div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div>
            <StepHeading sub="Vul bouwvolume én programma in. De twee totalen moeten overeenkomen.">Metrage (m² BVO)</StepHeading>
            <div style={{ display: 'flex', gap: 8, marginBottom: 18 }}>
              {['bouwvolume', 'programma'].map(m => (
                <button key={m} onClick={() => setMetMode(m)} style={{
                  all: 'unset', cursor: 'pointer', flex: 1, textAlign: 'center', padding: '10px 0',
                  borderRadius: 8, fontFamily: 'Barlow, sans-serif', fontWeight: 600, fontSize: 12,
                  letterSpacing: '0.08em', textTransform: 'uppercase',
                  background: metMode === m ? TEXT_DARK : '#F4F2EE', color: metMode === m ? '#fff' : TEXT_MED,
                  border: `1px solid ${metMode === m ? TEXT_DARK : BORDER}`,
                }}>{m}</button>
              ))}
            </div>
            {metMode === 'bouwvolume' ? (
              <div>
                {[['bestaand', 'Bestaand'], ['sloop', 'Sloop'], ['renovatie', 'Renovatie'], ['nieuw', 'Nieuwbouw']].map(([k, lbl]) => (
                  <Row key={k} label={lbl} gap={12}><Num value={f.bv[k]} onChange={v => setNest('bv', k, v)} suffix="m²" /></Row>
                ))}
                <TotaalBar label="Totaal opgeleverd (renovatie + nieuw)" value={bvTotaal} match={metMatch} other={prTotaal} otherLabel="programma" />
              </div>
            ) : (
              <div>
                {[['wonen', 'Wonen'], ['kantoor', 'Kantoor'], ['commercieel', 'Commercieel'], ['leisure', 'Leisure'], ['publiek', 'Publiek'], ['overig', 'Overig']].map(([k, lbl]) => (
                  <Row key={k} label={lbl} gap={12}><Num value={f.pr[k]} onChange={v => setNest('pr', k, v)} suffix="m²" /></Row>
                ))}
                <TotaalBar label="Totaal programma" value={prTotaal} match={metMatch} other={bvTotaal} otherLabel="bouwvolume" />
              </div>
            )}
            <Row label="Aantal woningen" hint="units" gap={0}><Num value={f.units_wonen} onChange={v => set('units_wonen', v)} suffix="st." /></Row>
          </div>
        )}

        {step === 5 && (
          <div>
            <StepHeading sub="Mobiliteit, afmetingen, constructie en gevel.">Details</StepHeading>
            <SubHead>MOBILITEIT</SubHead>
            <TwoCol>
              <Row label="Autoparkeren"><Num value={f.auto} onChange={v => set('auto', v)} suffix="pl." /></Row>
              <Row label="Fietsparkeren"><Num value={f.fiets} onChange={v => set('fiets', v)} suffix="pl." /></Row>
            </TwoCol>
            <SubHead>AFMETINGEN</SubHead>
            <TwoCol>
              <Row label="Bouwhoogte"><Num value={f.hoogte} onChange={v => set('hoogte', v)} suffix="m" /></Row>
              <Row label="Bouwlagen"><Num value={f.lagen} onChange={v => set('lagen', v)} suffix="st." /></Row>
            </TwoCol>
            <SubHead>CONSTRUCTIE</SubHead>
            <Row label="Type"><Chips options={CONSTR_TYPE} value={f.constr_type} onChange={v => set('constr_type', v)} allowAdd /></Row>
            <Row label="Materiaal"><Chips options={CONSTR_MAT} value={f.constr_mat} onChange={v => set('constr_mat', v)} allowAdd /></Row>
            <SubHead>GEVEL</SubHead>
            <Row label="Type"><Chips options={GEVEL_TYPE} value={f.gevel_type} onChange={v => set('gevel_type', v)} allowAdd /></Row>
            <Row label="Materiaal" gap={0}><Chips options={GEVEL_MAT} value={f.gevel_mat} onChange={v => set('gevel_mat', v)} allowAdd /></Row>
          </div>
        )}

        {step === 6 && (
          <div>
            <StepHeading sub="Certificaten en prijzen worden gekoppeld vanuit de Profielen-directory.">{isReno ? 'Labels, awards & renovatie' : 'Labels, awards & overig'}</StepHeading>
            <Row label="Labels / certificaten"><MultiChips options={LABEL_OPTIES} values={f.labels} onChange={v => set('labels', v)} allowAdd /></Row>
            <Row label="Awards" hint="prijzen / nominaties"><MultiChips options={['Gewonnen prijsvraag', 'ARC Award', 'Amsterdam Architectuur Prijs', 'Genomineerd']} values={f.awards} onChange={v => set('awards', v)} allowAdd /></Row>
            {isReno && (
              <div style={{ marginTop: 10, padding: '16px', borderRadius: 12, background: '#F8F7F4', border: `1px solid ${BORDER}` }}>
                <SubHead>OORSPRONKELIJK GEBOUW</SubHead>
                <Row label="Oorspronkelijk architect"><Text value={f.ren.architect} onChange={v => setNest('ren', 'architect', v)} /></Row>
                <TwoCol>
                  <Row label="Bouwjaar"><Text value={f.ren.jaar} onChange={v => setNest('ren', 'jaar', v)} placeholder="1968" /></Row>
                  <Row label="Oorspr. metrage"><Num value={f.ren.metrage} onChange={v => setNest('ren', 'metrage', v)} suffix="m²" /></Row>
                </TwoCol>
                <Row label="Oorspronkelijke functie"><Text value={f.ren.functie} onChange={v => setNest('ren', 'functie', v)} /></Row>
                <Row label="In samenwerking met" gap={0}><Text value={f.ren.samenwerking} onChange={v => setNest('ren', 'samenwerking', v)} /></Row>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer nav */}
      <div style={{ flexShrink: 0, padding: '12px 20px 30px', borderTop: `1px solid ${BORDER}`, display: 'flex', gap: 10 }}>
        {step > 0 && (
          <button onClick={() => setStep(step - 1)} style={{
            all: 'unset', cursor: 'pointer', padding: '15px 22px', borderRadius: 10,
            border: `1px solid ${BORDER}`, color: TEXT_MED,
            fontFamily: 'Barlow, sans-serif', fontWeight: 600, fontSize: 13, letterSpacing: '0.1em',
          }}>VORIGE</button>
        )}
        {step < last ? (
          <button onClick={() => setStep(step + 1)} style={primaryBtn(true)}>VOLGENDE</button>
        ) : (
          <button onClick={goSave} style={primaryBtn(valid)}>PROJECT OPSLAAN</button>
        )}
      </div>
    </div>
  );
}
function primaryBtn(enabled) {
  return {
    all: 'unset', cursor: enabled ? 'pointer' : 'not-allowed', flex: 1, textAlign: 'center',
    padding: '15px 0', borderRadius: 10, background: enabled ? SAGE : '#C9D4D4', color: '#fff',
    fontFamily: 'Barlow, sans-serif', fontWeight: 600, fontSize: 13, letterSpacing: '0.14em',
  };
}
function TotaalBar({ label, value, match, other, otherLabel }) {
  const bothEmpty = value === 0 && other === 0;
  return (
    <div style={{ marginTop: 6, marginBottom: 18 }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
        padding: '13px 15px', borderRadius: 10, background: '#F0EFEC',
      }}>
        <span style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 600, fontSize: 12, color: TEXT_MED, letterSpacing: '0.04em' }}>{label}</span>
        <span style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 800, fontSize: 18, color: TEXT_DARK, fontVariantNumeric: 'tabular-nums' }}>{value.toLocaleString('nl-NL')} m²</span>
      </div>
      {!bothEmpty && (
        <div style={{
          marginTop: 8, display: 'flex', alignItems: 'center', gap: 8,
          fontFamily: 'Barlow, sans-serif', fontSize: 12, fontWeight: 600,
          color: match ? '#4F6E3F' : '#C0392B',
        }}>
          <span style={{ width: 8, height: 8, borderRadius: 4, background: match ? '#4F6E3F' : '#C0392B' }} />
          {match ? 'Totalen komen overeen' : `Wijkt af van ${otherLabel}-totaal (${other.toLocaleString('nl-NL')} m²)`}
        </div>
      )}
    </div>
  );
}

window.NewProjectSheet = NewProjectSheet;

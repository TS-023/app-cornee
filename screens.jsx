// Screens for projectoverzicht.nl mobile prototype
const { SAGE, SAGE_DARK, TEXT_DARK, TEXT_MED, TEXT_LIGHT, BORDER, GOLD } = window.POTHEME;

// ────────────────────────────────────────────────────────────
// LOADING SCREEN
// ────────────────────────────────────────────────────────────
function LoadingScreen({ onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2200);
    return () => clearTimeout(t);
  }, []);
  return (
    <div style={{
      flex: 1, background: SAGE, color: '#fff',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      position: 'relative', animation: 'fadeIn 0.4s ease'
    }}>
      <div style={{ animation: 'pulseLogo 1.8s ease-in-out infinite' }}>
        <AppLogo size={92} bg="#fff" fg={SAGE} />
      </div>
      <div style={{
        marginTop: 22,
        fontFamily: 'Barlow, sans-serif', fontWeight: 600, fontSize: 16,
        letterSpacing: '0.10em'
      }}>PROJECTENOVERZICHT.NL</div>
      <div style={{
        position: 'absolute', bottom: 44,
        fontFamily: 'Barlow, sans-serif', fontWeight: 400, fontSize: 11,
        letterSpacing: '0.20em', color: 'rgba(255,255,255,0.85)'
      }}>A GALGENWIBO DESIGN</div>
    </div>);

}

// ────────────────────────────────────────────────────────────
// MAP SCREEN
// ────────────────────────────────────────────────────────────
// Approx lat/lng for the cities present in the dataset (real-map placement)
const CITY_LL = {
  'Hoorn': [52.642, 5.059], 'Purmerend': [52.505, 4.959], 'Volendam': [52.494, 5.073],
  'Zaandam': [52.442, 4.829], 'Monnickendam': [52.456, 5.039], 'Almere': [52.370, 5.215],
  'Amsterdam': [52.360, 4.895], 'Diemen': [52.339, 4.962], 'Amstelveen': [52.310, 4.863],
  'Weesp': [52.308, 5.041], 'Laren': [52.257, 5.227], 'Hilversum': [52.224, 5.176],
  'Baarn': [52.212, 5.288], 'Soest': [52.174, 5.293], 'Woerden': [52.085, 4.884],
  'Maarssen': [52.139, 5.039], 'Vleuten': [52.107, 5.003], 'Utrecht': [52.090, 5.122],
  'Zeist': [52.089, 5.233], 'Driebergen': [52.052, 5.281]
};
// Voorbeeldweergave: spreid de projecten over heel Nederland (alle provincies),
// zodat het startscherm het hele land toont i.p.v. één cluster.
const NL_SPREAD = [
  [53.219, 6.568], [53.201, 5.808], [52.995, 6.564], [52.785, 6.897], [52.512, 6.094],
  [52.221, 6.893], [52.211, 5.969], [52.255, 6.164], [51.985, 5.899], [51.842, 5.853],
  [52.156, 5.387], [52.090, 5.122], [52.518, 5.471], [52.360, 4.895], [52.381, 4.637],
  [52.632, 4.749], [52.959, 4.760], [52.078, 4.288], [51.924, 4.478], [52.160, 4.490],
  [51.813, 4.690], [51.586, 4.776], [51.560, 5.091], [51.697, 5.304], [51.441, 5.469],
  [51.370, 6.172], [51.194, 5.987], [50.851, 5.691], [51.499, 3.611], [51.453, 3.571],
  [51.504, 3.888], [52.642, 5.059]
];
// Build deterministic lat/lng per project. Projecten zonder eigen coördinaten
// worden over heel Nederland verspreid (voorbeeldweergave, geen cluster).
function projectLatLngs(projects) {
  return projects.map((p, idx) => {
    // Prefer explicit coordinates entered in the wizard
    const lat = parseFloat(p.lat),lon = parseFloat(p.lon);
    if (!isNaN(lat) && !isNaN(lon)) return [lat, lon];
    const base = NL_SPREAD[idx % NL_SPREAD.length];
    const ring = Math.floor(idx / NL_SPREAD.length);
    if (ring === 0) return [base[0], base[1]];
    const ang = idx * 2.39996,r = 0.05 + ring * 0.045;
    return [base[0] + Math.sin(ang) * r, base[1] + Math.cos(ang) * r * 1.55];
  });
}
function pinSvg(color, size) {
  return `<svg width="${size}" height="${size * 1.3}" viewBox="0 0 28 36" style="display:block;filter:drop-shadow(0 2px 3px rgba(0,0,0,0.35))"><path d="M14 0C6.27 0 0 6.27 0 14c0 10.5 14 22 14 22s14-11.5 14-22C28 6.27 21.73 0 14 0z" fill="${color}"/><circle cx="14" cy="13.5" r="4.5" fill="#fff"/></svg>`;
}

function MapScreen({ projects, onOpenProject, favorites, onToggleFavorite, onAddProject }) {
  const [selected, setSelected] = useState(null);
  const mapEl = useRef(null);
  const mapRef = useRef(null);
  const layerRef = useRef(null);
  const fitRef = useRef(false);
  const sel = selected ? projects.find((p) => p.id === selected) : null;

  // Init Leaflet map once
  useEffect(() => {
    if (mapRef.current || !mapEl.current || !window.L) return;
    const map = window.L.map(mapEl.current, {
      zoomControl: false, attributionControl: false,
      minZoom: 4, maxZoom: 17, zoomSnap: 0.5
    }).setView([52.15, 5.4], 7);
    window.L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      subdomains: 'abcd', maxZoom: 19
    }).addTo(map);
    layerRef.current = window.L.layerGroup().addTo(map);
    mapRef.current = map;
    return () => {map.remove();mapRef.current = null;};
  }, []);

  // (Re)draw markers when projects / selection change
  useEffect(() => {
    const map = mapRef.current,lg = layerRef.current;
    if (!map || !lg || !window.L) return;
    lg.clearLayers();
    const lls = projectLatLngs(projects);
    projects.forEach((p, idx) => {
      const ll = lls[idx];
      const isSel = selected === p.id;
      const size = isSel ? 36 : 26;
      const icon = window.L.divIcon({
        className: 'pov-pin', html: pinSvg(window.PIN_COLORS[window.projectColor(p)], size),
        iconSize: [size, size * 1.3], iconAnchor: [size / 2, size * 1.3]
      });
      const m = window.L.marker(ll, { icon, zIndexOffset: isSel ? 1000 : 0, riseOnHover: true }).addTo(lg);
      m.on('click', () => setSelected(p.id));
    });
    if (!fitRef.current && lls.length) {
      fitRef.current = true;
      const bounds = window.L.latLngBounds(lls).pad(0.12);
      const doFit = () => {map.invalidateSize();map.fitBounds(bounds, { maxZoom: 11 });};
      setTimeout(doFit, 250);
      setTimeout(doFit, 600);
    }
  }, [projects, selected]);

  // Pan to a selected project
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !sel) return;
    const i = projects.findIndex((p) => p.id === sel.id);
    const ll = projectLatLngs(projects)[i];
    if (ll) map.panTo(ll, { animate: true });
  }, [selected]);

  return (
    <div data-screen-label="01 Kaart" style={{
      flex: 1, position: 'relative', overflow: 'hidden', background: '#eef0ec'
    }}>
      <div ref={mapEl} style={{ position: 'absolute', inset: 0, zIndex: 0 }} />

      {/* Top-right: add-project FAB */}
      <button
        onClick={() => onAddProject ? onAddProject() : alert('Nieuw project toevoegen — binnenkort beschikbaar')}
        title="Project toevoegen"
        style={{
          all: 'unset', cursor: 'pointer', position: 'absolute',
          right: 12, top: 12, width: 40, height: 40, borderRadius: 20,
          background: '#fff', color: TEXT_DARK,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 1px 4px rgba(0,0,0,0.15)', zIndex: 15
        }}>
        <svg width="18" height="18" viewBox="0 0 18 18">
          <path d="M9 3.5v11M3.5 9h11" stroke={TEXT_DARK} strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>

      {/* Bottom-right: zoom controls */}
      <div style={{
        position: 'absolute', right: 12, bottom: sel ? 156 : 18,
        display: 'flex', flexDirection: 'column',
        background: '#fff', borderRadius: 6,
        boxShadow: '0 1px 4px rgba(0,0,0,0.15)',
        fontFamily: 'Barlow, sans-serif', fontWeight: 500,
        transition: 'bottom 0.25s ease', zIndex: 15
      }}>
        <button onClick={() => mapRef.current && mapRef.current.zoomIn()} style={zoomBtn} title="Inzoomen">+</button>
        <div style={{ height: 1, background: BORDER }} />
        <button onClick={() => mapRef.current && mapRef.current.zoomOut()} style={zoomBtn} title="Uitzoomen">−</button>
      </div>

      {/* Bottom preview card */}
      {sel &&
      <div style={{
        position: 'absolute', left: 14, right: 14, bottom: 14,
        animation: 'slideUp 0.32s cubic-bezier(0.2, 0.8, 0.2, 1) both',
        zIndex: 6
      }}>
          <ProjectCard project={sel} compact onClick={() => onOpenProject(sel.id)}
        isFavorite={favorites && favorites.has(sel.id)}
        onToggleFavorite={onToggleFavorite ? () => onToggleFavorite(sel.id) : null} />
          <button onClick={() => setSelected(null)} style={{
          all: 'unset', cursor: 'pointer', position: 'absolute',
          top: 10, left: 10,
          width: 28, height: 28, borderRadius: 14,
          background: 'rgba(0,0,0,0.45)', color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'Barlow, sans-serif', fontWeight: 600, fontSize: 16
        }}>×</button>
        </div>
      }
    </div>);

}
const zoomBtn = {
  all: 'unset', cursor: 'pointer', width: 40, height: 38,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  color: TEXT_DARK, fontSize: 20, fontWeight: 500
};

// ────────────────────────────────────────────────────────────
// LIST SCREEN — toggleable grid (small) / large cards
// ────────────────────────────────────────────────────────────
function ListScreen({ projects, onOpenProject, density, onDensityChange, favorites, onToggleFavorite, onAddProject }) {
  const isGrid = density === 'grid';
  return (
    <div data-screen-label="02 Lijst" style={{ flex: 1, overflow: 'auto', background: '#fff' }}>
      {/* Toolbar: add-project + density toggle */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        gap: 8, padding: '14px 20px 6px'
      }}>
        <button onClick={() => onAddProject && onAddProject()} title="Nieuw project" style={{
          all: 'unset', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 7,
          padding: '7px 13px 7px 9px', borderRadius: 999,
          background: SAGE, color: '#fff',
          fontFamily: 'Barlow, sans-serif', fontWeight: 600, fontSize: 11, letterSpacing: '0.1em'
        }}>
          <svg width="13" height="13" viewBox="0 0 13 13"><path d="M6.5 2v9M2 6.5h9" stroke="#fff" strokeWidth="1.7" strokeLinecap="round" /></svg>
          NIEUW PROJECT
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{
            fontFamily: 'Barlow, sans-serif', fontWeight: 500, fontSize: 11,
            letterSpacing: '0.16em', color: TEXT_MED
          }}>WEERGAVE</span>
          <button onClick={() => onDensityChange('list')} style={iconToggle(!isGrid)}>
            <svg width="14" height="14" viewBox="0 0 14 14"><rect x="0" y="2" width="14" height="3" fill="currentColor" /><rect x="0" y="9" width="14" height="3" fill="currentColor" /></svg>
          </button>
          <button onClick={() => onDensityChange('grid')} style={iconToggle(isGrid)}>
            <svg width="14" height="14" viewBox="0 0 14 14"><rect x="0" y="0" width="6" height="6" fill="currentColor" /><rect x="8" y="0" width="6" height="6" fill="currentColor" /><rect x="0" y="8" width="6" height="6" fill="currentColor" /><rect x="8" y="8" width="6" height="6" fill="currentColor" /></svg>
          </button>
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: isGrid ? '1fr 1fr' : '1fr',
        gap: isGrid ? 16 : 22,
        padding: isGrid ? '8px 20px 28px' : '8px 20px 28px'
      }}>
        {projects.map((p) =>
        <ProjectCard key={p.id} project={p} compact={isGrid} onClick={() => onOpenProject(p.id)}
        isFavorite={favorites && favorites.has(p.id)}
        onToggleFavorite={onToggleFavorite ? () => onToggleFavorite(p.id) : null} />
        )}
      </div>
    </div>);

}
function iconToggle(on) {
  return {
    all: 'unset', cursor: 'pointer',
    width: 30, height: 26, borderRadius: 4,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: on ? '#fff' : TEXT_MED,
    background: on ? SAGE : 'transparent',
    border: on ? 'none' : `1px solid ${BORDER}`
  };
}

// ────────────────────────────────────────────────────────────
// UNIVERSE — network graph of projects ↔ bedrijven
// 1× klik = selecteer (toont verbindingen) · 2× klik = open profiel
// ────────────────────────────────────────────────────────────
function UniverseScreen({ projects, onOpenProject, onOpenCompany }) {
  const companies = window.COMPANIES || [];
  const [selected, setSelected] = useState(null);
  const [hover, setHover] = useState(null);
  const active = selected || hover;

  const W = 360,H = 580;
  const cx = W / 2,cy = H / 2;
  const compR = 112;
  const projR = 224;

  // project -> Set(companyId)
  const linkMap = window.buildCompanyLinks(projects, companies);
  // pick the best-connected bedrijven for the inner ring
  const count = {};
  projects.forEach((p) => (linkMap.get(p.id) || new Set()).forEach((cid) => {count[cid] = (count[cid] || 0) + 1;}));
  const shown = companies.filter((c) => count[c.id]).sort((a, b) => count[b.id] - count[a.id]).slice(0, 16);
  const compById = {};
  const compPos = shown.map((c, i, arr) => {
    const a = i / arr.length * Math.PI * 2 - Math.PI / 2;
    const node = { ...c, ex: cx + Math.cos(a) * compR, ey: cy + Math.sin(a) * compR };
    compById[c.id] = node;
    return node;
  });
  const projPos = projects.map((p, i) => {
    const a = i / projects.length * Math.PI * 2 - Math.PI / 2;
    return { ...p, px: cx + Math.cos(a) * projR, py: cy + Math.sin(a) * projR };
  });
  const links = [];
  projPos.forEach((p) => {
    (linkMap.get(p.id) || new Set()).forEach((cid) => {
      const c = compById[cid];
      if (c) links.push({ from: c, to: p, key: p.id + '-' + cid });
    });
  });

  const activeComp = active && active.startsWith('c:') ? active.slice(2) : null;
  const activeProj = active && active.startsWith('p:') ? active.slice(2) : null;
  const click = (id, openFn) => {if (selected === id) openFn();else setSelected(id);};

  return (
    <div data-screen-label="03 Universe" style={{
      flex: 1, background: '#FAFAF7', overflow: 'hidden', position: 'relative',
      display: 'flex', flexDirection: 'column'
    }}>
      <div style={{
        padding: '18px 20px 4px', textAlign: 'center',
        fontFamily: 'Barlow, sans-serif', fontWeight: 600, fontSize: 13,
        letterSpacing: '0.18em', color: TEXT_DARK
      }}>PROJECT NETWERK</div>
      <div style={{
        padding: '0 32px 4px', textAlign: 'center',
        fontFamily: 'Barlow, sans-serif', fontSize: 10, fontWeight: 400,
        letterSpacing: '0.08em', color: TEXT_MED, lineHeight: 1.5
      }}>{projects.length} projecten · {shown.length} bedrijven · {links.length} verbindingen</div>
      <div style={{
        padding: '0 32px 6px', textAlign: 'center',
        fontFamily: 'Barlow, sans-serif', fontSize: 9, fontWeight: 600,
        letterSpacing: '0.10em', color: TEXT_LIGHT, textTransform: 'uppercase'
      }}>{selected ? 'Tik nogmaals om te openen' : 'Tik op een knooppunt voor de verbindingen'}</div>

      <div style={{ flex: 1, minHeight: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%" preserveAspectRatio="xMidYMid meet" style={{ display: 'block', maxHeight: '100%' }} onClick={() => setSelected(null)}>
        {/* Background concentric guides */}
        <circle cx={cx} cy={cy} r={compR} fill="none" stroke={BORDER} strokeDasharray="2 4" opacity="0.7" />
        <circle cx={cx} cy={cy} r={projR} fill="none" stroke={BORDER} strokeDasharray="2 4" opacity="0.5" />

        {/* Links */}
        {links.map((l) => {
          const on = activeComp === l.from.id || activeProj === l.to.id;
          return (
            <line key={l.key}
            x1={l.from.ex} y1={l.from.ey} x2={l.to.px} y2={l.to.py}
            stroke={on ? window.PIN_COLORS[window.projectColor(l.to)] : '#D6D9D5'}
            strokeWidth={on ? 1.4 : 0.6}
            opacity={active && !on ? 0.12 : 1}
            style={{ transition: 'all 0.2s ease' }} />);

        })}

        {/* Bedrijven (inner ring) */}
        {compPos.map((c) => {
          const id = 'c:' + c.id;
          const on = active === id || activeProj && (linkMap.get(activeProj) || new Set()).has(c.id);
          const isSel = selected === id;
          return (
            <g key={c.id}
            onClick={(ev) => {ev.stopPropagation();click(id, () => onOpenCompany(c));}}
            onMouseEnter={() => setHover(id)}
            onMouseLeave={() => setHover(null)}
            style={{ cursor: 'pointer' }}>
              <circle cx={c.ex} cy={c.ey} r={on ? 10 : 7}
              fill={window.companyColor(c) || SAGE} stroke={isSel ? TEXT_DARK : '#fff'} strokeWidth={isSel ? 2.5 : 1.5}
              style={{ transition: 'all 0.2s ease' }} />
              {(on || !active) &&
              <text x={c.ex} y={c.ey + 22} textAnchor="middle"
              fontFamily="Barlow, sans-serif" fontWeight="600" fontSize="7"
              fill={TEXT_DARK} letterSpacing="0.02em">
                  {c.naam.length > 16 ? c.naam.slice(0, 15) + '…' : c.naam}
                </text>
              }
            </g>);

        })}

        {/* Projecten (outer ring) */}
        {projPos.map((p) => {
          const id = 'p:' + p.id;
          const on = active === id || activeComp && (linkMap.get(p.id) || new Set()).has(activeComp);
          const isSel = selected === id;
          return (
            <g key={p.id}
            onClick={(ev) => {ev.stopPropagation();click(id, () => onOpenProject(p.id));}}
            onMouseEnter={() => setHover(id)}
            onMouseLeave={() => setHover(null)}
            style={{ cursor: 'pointer' }}>
              <circle cx={p.px} cy={p.py} r={on ? 9 : 5.5}
              fill={window.PIN_COLORS[window.projectColor(p)]} stroke={isSel ? TEXT_DARK : '#fff'} strokeWidth={isSel ? 2.5 : 1.4}
              style={{ transition: 'all 0.2s ease' }} />
              {on &&
              <text x={p.px} y={p.py - 12} textAnchor="middle"
              fontFamily="Barlow, sans-serif" fontWeight="700" fontSize="8"
              fill={TEXT_DARK} letterSpacing="0.04em">
                  {p.name}
                </text>
              }
            </g>);

        })}
      </svg>
      </div>

      {/* Legend — bedrijfstypes */}
      <div style={{ padding: '4px 20px 28px', display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '8px 14px' }}>
        {Object.entries(window.COMPANY_TYPE_COLORS).map(([k, c]) =>
        <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 8, height: 8, borderRadius: 4, background: c }} />
            <span style={{
            fontFamily: 'Barlow, sans-serif', fontSize: 9,
            letterSpacing: '0.12em', color: TEXT_MED
          }}>{(window.COMPANY_TYPE_LABELS[k] || k).toUpperCase()}</span>
          </div>
        )}
      </div>
    </div>);

}

// ────────────────────────────────────────────────────────────
// PROFIELEN — bedrijven (companies directory)
// ────────────────────────────────────────────────────────────
function ProfielenScreen({ onOpenCompany, onOpenLabel, onOpenAward, user, profile, onRequestLogin, onSignOut, onAdd }) {
  const [activeFilter, setActiveFilter] = useState('bedrijven');
  const [showLegend, setShowLegend] = useState(false);
  const filterRowRef = window.useDragScroll();
  const filters = window.PROFIEL_FILTERS || ['bedrijven', 'labels', 'awards'];

  const companies = window.COMPANIES || [];
  const labels = window.LABELS || [];
  const awards = window.AWARDS || [];

  // Per-tab kleurlegenda
  let legend;
  if (activeFilter === 'labels') {
    legend = window.LABEL_TYPES.map((k) => [k, window.LABEL_TYPE_COLORS[k], k]);
  } else if (activeFilter === 'awards') {
    legend = window.AWARD_POSITIES.map((k) => [k, window.AWARD_POSITIE_COLORS[k], k]);
  } else {
    legend = Object.keys(window.COMPANY_TYPE_COLORS).map((k) => [k, window.COMPANY_TYPE_COLORS[k], window.COMPANY_TYPE_LABELS[k]]);
  }

  const addTitle = activeFilter === 'labels' ? 'Nieuw label' : activeFilter === 'awards' ? 'Nieuwe award' : 'Nieuw bedrijf';
  const legendTitle = activeFilter === 'labels' ? 'Type label' : activeFilter === 'awards' ? 'Positie' : 'Type bedrijf';

  return (
    <div data-screen-label="04 Profielen" style={{ flex: 1, overflow: 'auto', background: '#F4F2EE' }}>
      {/* Filter chips: bedrijven · labels · awards · + */}
      <div ref={filterRowRef} style={{
        padding: '14px 14px 14px 20px', display: 'flex', gap: 8,
        alignItems: 'center', overflowX: 'auto', scrollbarWidth: 'none',
        background: '#F4F2EE'
      }}>
        {filters.map((f) => {
          const on = activeFilter === f;
          return (
            <button key={f} onClick={() => setActiveFilter(f)} style={{
              all: 'unset', cursor: 'pointer', flexShrink: 0,
              padding: '8px 18px', borderRadius: 999,
              fontFamily: 'Barlow, sans-serif', fontSize: 13, fontWeight: 500,
              letterSpacing: '0.02em',
              background: on ? '#fff' : 'rgba(255,255,255,0.55)',
              color: on ? TEXT_DARK : TEXT_MED,
              boxShadow: on ? '0 1px 3px rgba(0,0,0,0.08)' : 'none'
            }}>{f}</button>);

        })}
        <div style={{ flex: 1 }} />
        <button onClick={() => setShowLegend((s) => !s)} title="Legenda" style={{
          all: 'unset', cursor: 'pointer', flexShrink: 0,
          width: 40, height: 40, borderRadius: 20,
          background: showLegend ? '#fff' : 'rgba(255,255,255,0.55)',
          color: showLegend ? TEXT_DARK : TEXT_MED,
          boxShadow: showLegend ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <circle cx="9" cy="9" r="7.4" stroke="currentColor" strokeWidth="1.4" />
            <circle cx="9" cy="5.6" r="0.95" fill="currentColor" />
            <path d="M9 8v4.6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
        <button onClick={() => onAdd && onAdd(activeFilter)} title={addTitle} style={{
          all: 'unset', cursor: 'pointer', flexShrink: 0,
          width: 40, height: 40, borderRadius: 20,
          background: 'rgba(255,255,255,0.55)', color: TEXT_MED,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <svg width="16" height="16" viewBox="0 0 16 16"><path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
        </button>
      </div>

      {/* Kleurlegenda — opent via het info-icoontje */}
      {showLegend &&
      <div style={{
        margin: '0 20px 16px', padding: '14px 16px',
        background: '#fff', borderRadius: 10,
        boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 8px 24px rgba(0,0,0,0.06)',
        animation: 'fadeIn 0.18s ease'
      }}>
          <div style={{
          fontFamily: 'Barlow, sans-serif', fontSize: 10, fontWeight: 700,
          letterSpacing: '0.16em', color: TEXT_MED, textTransform: 'uppercase', marginBottom: 12
        }}>{legendTitle}</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px 18px' }}>
            {legend.map(([k, color, label]) =>
          <span key={k} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <span style={{ width: 11, height: 11, borderRadius: 6, background: color, flexShrink: 0 }} />
                <span style={{
              fontFamily: 'Barlow, sans-serif', fontSize: 12, fontWeight: 500,
              letterSpacing: '0.03em', color: TEXT_DARK, textTransform: 'uppercase'
            }}>{label}</span>
              </span>
          )}
          </div>
        </div>
      }

      {/* Cards */}
      <div style={{
        display: 'flex', flexDirection: 'column', gap: 16,
        padding: '0 20px 28px'
      }}>
        {activeFilter === 'bedrijven' && companies.map((c) =>
        <CompanyCard key={c.id} company={c} onClick={() => onOpenCompany && onOpenCompany(c)} />
        )}
        {activeFilter === 'labels' && labels.map((l) =>
        <LabelCard key={l.id} label={l} onClick={() => onOpenLabel && onOpenLabel(l)} />
        )}
        {activeFilter === 'awards' && awards.map((a) =>
        <AwardCard key={a.id} award={a} onClick={() => onOpenAward && onOpenAward(a)} />
        )}
      </div>
    </div>);

}

// ─── Label card (duurzaamheids- / welzijnslabel) ───────────────
function LabelCard({ label, onClick }) {
  const accent = window.LABEL_TYPE_COLORS[label.type] || '#B7BCC0';
  return (
    <button onClick={onClick} style={{
      all: 'unset', cursor: 'pointer', display: 'block', width: '100%', boxSizing: 'border-box',
      background: '#fff', borderRadius: 4,
      boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 8px 24px rgba(0,0,0,0.06)',
      position: 'relative', overflow: 'hidden'
    }}>
      <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 6, background: accent }} />
      <div style={{ padding: '18px 18px 18px 22px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
          <div style={{ minWidth: 0 }}>
            <div style={{
              fontFamily: 'Barlow, sans-serif', fontWeight: 700, fontSize: 18,
              color: TEXT_DARK, letterSpacing: '-0.005em', lineHeight: 1.15
            }}>{label.naam}</div>
            <div style={{
              fontFamily: 'Barlow, sans-serif', fontWeight: 600, fontSize: 11,
              color: accent, marginTop: 5, letterSpacing: '0.12em', textTransform: 'uppercase'
            }}>{label.type}</div>
          </div>
          <Pill text={label.categorie} bg={accent} />
        </div>
        <div style={{
          fontFamily: 'Barlow, sans-serif', fontSize: 12.5, color: TEXT_MED,
          lineHeight: 1.5, letterSpacing: '0.01em', marginTop: 12
        }}>{label.oms}</div>
        <div style={{ display: 'flex', gap: 22, marginTop: 14 }}>
          <MetaPair label="Erkend" value={label.erkend} />
          <MetaPair label="Projecten" value={String(label.projecten)} />
        </div>
      </div>
    </button>);

}

// ─── Award card (gewonnen prijs) ───────────────────────────────
function AwardCard({ award, onClick }) {
  const accent = window.AWARD_POSITIE_COLORS[award.positie] || '#B7BCC0';
  return (
    <button onClick={onClick} style={{
      all: 'unset', cursor: 'pointer', display: 'block', width: '100%', boxSizing: 'border-box',
      background: '#fff', borderRadius: 4,
      boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 8px 24px rgba(0,0,0,0.06)',
      position: 'relative', overflow: 'hidden'
    }}>
      <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 6, background: accent }} />
      <div style={{ padding: '18px 18px 18px 22px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
          <div style={{ minWidth: 0 }}>
            <div style={{
              fontFamily: 'Barlow, sans-serif', fontWeight: 700, fontSize: 17,
              color: TEXT_DARK, letterSpacing: '-0.005em', lineHeight: 1.2
            }}>{award.naam}</div>
            <div style={{
              fontFamily: 'Barlow, sans-serif', fontWeight: 500, fontSize: 13,
              color: TEXT_MED, marginTop: 4, letterSpacing: '0.01em'
            }}>{award.categorie} · {award.jaar}</div>
          </div>
          <Pill text={award.positie} bg={accent} />
        </div>
        <div style={{ display: 'flex', gap: 22, marginTop: 14 }}>
          <MetaPair label="Project" value={award.project} />
          <MetaPair label="Erkend" value={award.erkend} />
        </div>
      </div>
    </button>);

}

// Small coloured badge pill — dark text on light palette colours (goud/grijs)
function Pill({ text, bg }) {
  const light = bg === window.PIN_COLORS.gold || bg === window.PIN_COLORS.grey;
  return (
    <span style={{
      flexShrink: 0, display: 'inline-flex', alignItems: 'center',
      padding: '5px 11px', borderRadius: 999, background: bg,
      fontFamily: 'Barlow, sans-serif', fontSize: 10.5, fontWeight: 700,
      letterSpacing: '0.08em', textTransform: 'uppercase',
      color: light ? TEXT_DARK : '#fff', whiteSpace: 'nowrap'
    }}>{text}</span>);

}
function MetaPair({ label, value }) {
  return (
    <div style={{ minWidth: 0 }}>
      <div style={{
        fontFamily: 'Barlow, sans-serif', fontSize: 9, fontWeight: 600,
        color: TEXT_MED, letterSpacing: '0.16em', textTransform: 'uppercase'
      }}>{label}</div>
      <div style={{
        fontFamily: 'Barlow, sans-serif', fontSize: 13, fontWeight: 600,
        color: TEXT_DARK, marginTop: 3, letterSpacing: '0.01em',
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
      }}>{value}</div>
    </div>);

}

function ProfielAuthBanner({ user, profile, onRequestLogin, onSignOut }) {
  return (
    <div style={{
      padding: '12px 18px',
      display: 'flex', alignItems: 'center', gap: 12,
      background: user ? '#F8F7F4' : SAGE,
      color: user ? TEXT_DARK : '#fff',
      borderBottom: `1px solid ${BORDER}`
    }}>
      {user ?
      <>
          <div style={{
          width: 32, height: 32, borderRadius: 16,
          background: SAGE, color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'Barlow, sans-serif', fontWeight: 700, fontSize: 12
        }}>{(profile?.naam || user.email || '').slice(0, 2).toUpperCase()}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
            fontFamily: 'Barlow, sans-serif', fontWeight: 700, fontSize: 13,
            color: TEXT_DARK, letterSpacing: '0.02em',
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
          }}>{profile?.naam || user.email}</div>
            <div style={{
            fontFamily: 'Barlow, sans-serif', fontSize: 10, color: TEXT_MED,
            letterSpacing: '0.10em', marginTop: 2
          }}>{profile?.status === 'approved' ? 'GOEDGEKEURD' : profile?.status === 'pending' ? 'WACHT OP GOEDKEURING' : 'INGELOGD'}</div>
          </div>
          <button onClick={onSignOut} style={{
          all: 'unset', cursor: 'pointer',
          fontFamily: 'Barlow, sans-serif', fontSize: 10, fontWeight: 600,
          letterSpacing: '0.16em', color: TEXT_MED,
          padding: '6px 12px', border: `1px solid ${BORDER}`, borderRadius: 999
        }}>UITLOGGEN</button>
        </> :

      <>
          <div style={{
          width: 32, height: 32, borderRadius: 16,
          background: 'rgba(255,255,255,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
            <svg width="14" height="14" viewBox="0 0 14 14"><circle cx="7" cy="5" r="2.5" stroke="#fff" strokeWidth="1.4" fill="none" /><path d="M2 12c0-2.5 2.2-4 5-4s5 1.5 5 4" stroke="#fff" strokeWidth="1.4" fill="none" /></svg>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{
            fontFamily: 'Barlow, sans-serif', fontWeight: 700, fontSize: 12,
            letterSpacing: '0.04em'
          }}>NIET INGELOGD</div>
            <div style={{
            fontFamily: 'Barlow, sans-serif', fontSize: 10, opacity: 0.85,
            letterSpacing: '0.06em', marginTop: 2
          }}>Log in om bij te dragen</div>
          </div>
          <button onClick={onRequestLogin} style={{
          all: 'unset', cursor: 'pointer',
          fontFamily: 'Barlow, sans-serif', fontSize: 10, fontWeight: 700,
          letterSpacing: '0.16em', color: SAGE,
          padding: '6px 14px', background: '#fff', borderRadius: 999
        }}>INLOGGEN</button>
        </>
      }
    </div>);

}

// ─── Company card ──────────────────────────────────────────
function CompanyCard({ company, onClick }) {
  const accent = window.companyColor(company) || '#B7BCC0';
  return (
    <button onClick={onClick} style={{
      all: 'unset', cursor: 'pointer', display: 'block', width: '100%',
      boxSizing: 'border-box',
      background: '#fff', borderRadius: 4,
      boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 8px 24px rgba(0,0,0,0.06)',
      position: 'relative', overflow: 'hidden'
    }}>
      {/* Green accent bar */}
      <div style={{
        position: 'absolute', left: 0, top: 0, bottom: 0,
        width: 6, background: accent
      }} />

      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 86px', gap: 14,
        padding: '18px 18px 18px 22px', alignItems: 'flex-start'
      }}>
        {/* Text column */}
        <div style={{ minWidth: 0 }}>
          <div style={{
            fontFamily: 'Barlow, sans-serif', fontWeight: 700, fontSize: 16,
            color: TEXT_DARK, letterSpacing: '-0.005em', lineHeight: 1.2
          }}>{company.naam}</div>
          <div style={{
            fontFamily: 'Barlow, sans-serif', fontWeight: 400, fontSize: 13,
            color: TEXT_MED, marginTop: 4, letterSpacing: '0.01em'
          }}>{company.rol}</div>

          <div style={{
            marginTop: 14,
            fontFamily: 'Barlow, sans-serif', fontSize: 12,
            color: TEXT_MED, lineHeight: 1.5, letterSpacing: '0.01em'
          }}>
            <div>{company.straat}</div>
            <div>{company.stad}</div>
            <div>{company.postcode}</div>
          </div>

          <div style={{
            marginTop: 14,
            fontFamily: 'Barlow, sans-serif', fontSize: 12,
            color: TEXT_MED, lineHeight: 1.5, letterSpacing: '0.01em'
          }}>
            <div>{company.email}</div>
            <div>{company.tel}</div>
          </div>
        </div>

        {/* Image placeholder */}
        <div style={{
          width: 86, height: 86, flexShrink: 0,
          background: company.logo ? `url(${company.logo}) center/cover` : '#888',
          marginTop: 28
        }} />
      </div>
    </button>);

}

// ─── Leaderboard (moved out of Profielen, used in Dashboard) ─
function Leaderboard({ onOpenEmployee }) {
  // Publieke ranglijst: de bekende leden (of live data) + de bredere community.
  const employees = [...(window.EMPLOYEES || []), ...(window.COMMUNITY_MEMBERS || [])];
  const [team, setTeam] = useState('Alle');
  const [period, setPeriod] = useState('all');
  const teamRowRef = window.useDragScroll();
  const filtered = employees.
  filter((e) => team === 'Alle' || e.team === team).
  sort((a, b) => b.score - a.score);

  const podium = filtered.slice(0, 3);
  const totalScore = filtered.reduce((s, e) => s + e.score, 0);

  // De ingelogde gebruiker — van wie dit profiel is. In de prototype is dit
  // één gemarkeerd lid (`you`); live komt dit uit het ingelogde account.
  const myIndex = filtered.findIndex((e) => e.you); // 0-based positie, -1 = niet in lijst

  // De ranglijst onder het podium loopt t/m plek 10 (plekken 4 t/m 10).
  // Staat de gebruiker daarbuiten (bv. nr 251), dan vervalt plek 10 en komt
  // de eigen rij daar te staan — met de échte positie.
  let restRows;
  if (myIndex >= 10) {
    restRows = filtered.slice(3, 9).map((e, i) => ({ e, place: i + 4, me: false }));
    restRows.push({ e: filtered[myIndex], place: myIndex + 1, me: true });
  } else {
    restRows = filtered.slice(3, 10).map((e, i) => ({ e, place: i + 4, me: e.you === true }));
  }

  return (
    <div style={{ background: '#fff', margin: '0 -18px', borderRadius: 0 }}>
      {/* KPI row */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 1,
        background: BORDER, padding: '1px 0',
        borderTop: `1px solid ${BORDER}`,
        borderBottom: `1px solid ${BORDER}`
      }}>
        <Kpi2 num={employees.length} label="LEDEN" />
        <Kpi2 num={totalScore.toLocaleString('nl-NL')} label="PUNTEN" />
        <Kpi2 num={employees.reduce((s, e) => s + e.projecten, 0)} label="PROJECTEN" />
      </div>

      {/* Period switch */}
      <div style={{ padding: '14px 18px 6px', display: 'flex', gap: 6 }}>
        {[['all', 'Altijd'], ['year', 'Jaar'], ['month', 'Maand']].map(([id, lbl]) =>
        <button key={id} onClick={() => setPeriod(id)} style={{
          all: 'unset', cursor: 'pointer',
          padding: '6px 14px', borderRadius: 999,
          fontFamily: 'Barlow, sans-serif', fontSize: 11, fontWeight: 600,
          letterSpacing: '0.14em',
          background: period === id ? TEXT_DARK : 'transparent',
          color: period === id ? '#fff' : TEXT_MED,
          border: period === id ? 'none' : `1px solid ${BORDER}`
        }}>{lbl.toUpperCase()}</button>
        )}
      </div>

      {/* Team filter chips */}
      <div ref={teamRowRef} style={{
        padding: '8px 18px 12px', display: 'flex', gap: 6,
        overflowX: 'auto', scrollbarWidth: 'none', cursor: 'grab'
      }}>
        {window.TEAMS.map((t) =>
        <button key={t} onClick={() => setTeam(t)} style={{
          all: 'unset', cursor: 'pointer', flexShrink: 0,
          padding: '5px 12px', borderRadius: 999,
          fontFamily: 'Barlow, sans-serif', fontSize: 10, fontWeight: 500,
          letterSpacing: '0.12em',
          background: team === t ? SAGE : 'transparent',
          color: team === t ? '#fff' : TEXT_MED,
          border: team === t ? 'none' : `1px solid ${BORDER}`
        }}>{t.toUpperCase()}</button>
        )}
      </div>

      {/* Podium */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1.18fr 1fr',
        gap: 8, padding: '14px 14px 18px', alignItems: 'end'
      }}>
        {[podium[1], podium[0], podium[2]].map((e, i) => {
          if (!e) return <div key={i} />;
          const place = [2, 1, 3][i];
          const isFirst = place === 1;
          return (
            <button key={e.id} onClick={() => onOpenEmployee(e)} style={{
              all: 'unset', cursor: 'pointer', minWidth: 0, boxSizing: 'border-box',
              background: '#fff', borderRadius: 10,
              boxShadow: isFirst ?
              '0 4px 10px rgba(0,0,0,0.08), 0 14px 34px rgba(0,0,0,0.07)' :
              '0 2px 6px rgba(0,0,0,0.06), 0 8px 24px rgba(0,0,0,0.04)',
              padding: isFirst ? '18px 8px 16px' : '12px 6px',
              textAlign: 'center', position: 'relative',
              border: isFirst ? `2px solid ${GOLD}` : `1px solid ${BORDER}`
            }}>
              <div style={{
                position: 'absolute', top: isFirst ? -12 : -10, left: '50%', transform: 'translateX(-50%)',
                width: isFirst ? 26 : 20, height: isFirst ? 26 : 20, borderRadius: 13,
                background: isFirst ? GOLD : place === 2 ? '#B7BCC0' : '#D4A380',
                color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'Barlow, sans-serif', fontWeight: 800, fontSize: isFirst ? 12 : 10
              }}>{place}</div>
              <Avatar emp={e} size={isFirst ? 72 : 46} style={{ margin: isFirst ? '6px auto 10px' : '4px auto 8px' }} />
              <div style={{
                fontFamily: 'Barlow, sans-serif', fontWeight: 700, fontSize: 11,
                letterSpacing: '0.04em', color: TEXT_DARK,
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
              }}>{e.naam.toUpperCase()}</div>
              <div style={{
                fontFamily: 'Barlow, sans-serif', fontSize: 9,
                color: TEXT_MED, marginTop: 2, letterSpacing: '0.05em'
              }}>{e.rol}</div>
              <div style={{
                fontFamily: 'Barlow, sans-serif', fontWeight: 800,
                fontSize: isFirst ? 26 : 16, color: TEXT_DARK, marginTop: isFirst ? 12 : 8,
                letterSpacing: '-0.01em', fontVariantNumeric: 'tabular-nums'
              }}>{e.score}</div>
              <div style={{
                fontFamily: 'Barlow, sans-serif', fontSize: 8,
                color: TEXT_MED, letterSpacing: '0.16em', marginTop: 2
              }}>PUNTEN</div>
            </button>);

        })}
      </div>

      {/* Rest of leaderboard — t/m plek 10, met eigen positie gepind */}
      <div>
        {restRows.map((row, idx) => {
          const { e, place, me } = row;
          const prev = restRows[idx - 1];
          const gap = me && prev && place > prev.place + 1;
          return (
            <React.Fragment key={e.id}>
              {gap &&
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                gap: 4, padding: '6px 0 2px', color: TEXT_LIGHT,
                fontFamily: 'Barlow, sans-serif', fontSize: 14, fontWeight: 700,
                letterSpacing: '0.3em', borderTop: `1px solid ${BORDER}`
              }}>···</div>
              }
              <button onClick={() => onOpenEmployee(e)} style={{
                all: 'unset', cursor: 'pointer', display: 'flex',
                alignItems: 'center', gap: 12, padding: '12px 18px',
                borderTop: gap ? 'none' : `1px solid ${BORDER}`, width: '100%', boxSizing: 'border-box',
                background: me ? '#FBF5E8' : 'transparent'
              }}>
                <div style={{
                  fontFamily: 'Barlow, sans-serif', fontWeight: me ? 800 : 600, fontSize: 12,
                  color: me ? GOLD : TEXT_LIGHT, width: 28, textAlign: 'center',
                  fontVariantNumeric: 'tabular-nums'
                }}>{place}</div>
                <Avatar emp={e} size={36} style={me ? { boxShadow: `0 0 0 2px ${GOLD}` } : {}} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    <span style={{
                      fontFamily: 'Barlow, sans-serif', fontWeight: 700, fontSize: 12,
                      letterSpacing: '0.04em', color: TEXT_DARK,
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                    }}>{(e.nick || e.naam).toUpperCase()}</span>
                    {me &&
                    <span style={{
                      flexShrink: 0, padding: '2px 7px', borderRadius: 999, background: GOLD,
                      fontFamily: 'Barlow, sans-serif', fontWeight: 800, fontSize: 8,
                      letterSpacing: '0.14em', color: '#fff'
                    }}>JIJ</span>
                    }
                  </div>
                  <div style={{
                    fontFamily: 'Barlow, sans-serif', fontSize: 10,
                    color: TEXT_MED, marginTop: 2, letterSpacing: '0.05em'
                  }}>{e.rol} · {e.team}</div>
                </div>
                <div style={{
                  fontFamily: 'Barlow, sans-serif', fontWeight: 700, fontSize: 14,
                  color: TEXT_DARK, fontVariantNumeric: 'tabular-nums'
                }}>{e.score}</div>
              </button>
            </React.Fragment>);

        })}
      </div>
    </div>);

}
function Avatar({ emp, size = 36, style = {} }) {
  const initials = emp.naam.split(' ').map((w) => w[0]).slice(0, 2).join('');
  return (
    <div style={{
      width: size, height: size, borderRadius: size / 2, flexShrink: 0,
      background: SAGE, color: '#fff',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'Barlow, sans-serif', fontWeight: 700,
      fontSize: size * 0.34, letterSpacing: '0.02em',
      position: 'relative', overflow: 'hidden',
      ...style
    }}>
      <span>{initials}</span>
      {emp.foto &&
      <img src={emp.foto} alt=""
      style={{
        position: 'absolute', inset: 0, width: '100%', height: '100%',
        objectFit: 'cover'
      }}
      onError={(e) => {e.target.style.display = 'none';}} />

      }
    </div>);

}
function Kpi2({ num, label }) {
  return (
    <div style={{
      background: '#fff', padding: '14px 8px', textAlign: 'center'
    }}>
      <div style={{
        fontFamily: 'Barlow, sans-serif', fontWeight: 800, fontSize: 22,
        color: TEXT_DARK, letterSpacing: '-0.01em'
      }}>{num}</div>
      <div style={{
        fontFamily: 'Barlow, sans-serif', fontSize: 9, color: TEXT_MED,
        letterSpacing: '0.16em', marginTop: 4
      }}>{label}</div>
    </div>);

}

// ────────────────────────────────────────────────────────────
// DETAIL SCREEN — uses real Supabase field structure
// ────────────────────────────────────────────────────────────
function DetailScreen({ project, onBack, isFavorite, onToggleFavorite, user, onRequestLogin, onProjectUpdated }) {
  const [tab, setTab] = useState('algemeen');
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({});
  const [saving, setSaving] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);
  const tabRowRef = window.useDragScroll();
  const isReno = /renovatie|restauratie|sloop/i.test(project.projecttype || project.type || '');
  const tabs = window.PROJECT_TABS.filter((t) => t.id !== 'renovatie' || isReno || project.ren_architect);

  const tryEdit = () => {
    if (!user) {onRequestLogin();return;}
    setEditing(true);
    setDraft({});
  };

  const cancel = () => {setEditing(false);setDraft({});};

  const save = async () => {
    if (Object.keys(draft).length === 0) {setEditing(false);return;}
    setSaving(true);
    try {
      await window.API.saveProjectFields(project.id, draft);
      // Optimistic update — merge draft into project
      onProjectUpdated(project.id, draft);
      setSavedFlash(true);
      setTimeout(() => setSavedFlash(false), 1200);
      setEditing(false);
      setDraft({});
    } catch (e) {
      alert('Opslaan mislukt: ' + e.message);
    }
    setSaving(false);
  };

  // Build rows for current tab from PROJECT_FIELDS definitions
  const buildRows = (tabId) => {
    const fields = window.PROJECT_FIELDS[tabId] || [];
    return fields.map((f) => {
      let liveValue = draft[f.k] !== undefined ? draft[f.k] : project[f.k];
      // Fallback to an alternate (legacy seed) key when the primary is empty
      if ((liveValue === undefined || liveValue === null || liveValue === '') && f.from) {
        liveValue = project[f.from];
      }
      let raw = f.fixed !== undefined ? f.fixed : liveValue;
      let value;
      const isEmpty = raw === undefined || raw === null || raw === '' || raw === 0 ||
      Array.isArray(raw) && raw.length === 0;
      if (isEmpty) {
        value = '—';
      } else if (Array.isArray(raw)) {
        value = raw.join(' · ');
      } else if (f.unit === 'm²' || f.unit === 'plekken') {
        value = Number(raw).toLocaleString('nl-NL') + ' ' + f.unit;
      } else if (f.unit === 'm') {
        value = raw + ' m';
      } else if (f.unit === '/10') {
        value = Number(raw).toFixed(1) + ' / 10';
      } else if (f.col === 'opleverdatum' && /^\d{4}-\d{2}-\d{2}/.test(raw)) {
        const d = new Date(raw);
        value = d.toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' });
      } else {
        value = String(raw);
      }
      return { ...f, label: f.label, value, raw: liveValue, empty: isEmpty, fixed: f.fixed !== undefined };
    });
  };

  const tabRows = buildRows(tab);
  const allFields = Object.values(window.PROJECT_FIELDS).flat();
  const filledCount = allFields.filter((f) => {
    const v = f.fixed !== undefined ? f.fixed : draft[f.k] !== undefined ? draft[f.k] : project[f.k];
    return v !== undefined && v !== null && v !== '' && v !== 0;
  }).length;
  const completeness = Math.round(filledCount / allFields.length * 100);

  return (
    <div data-screen-label={`10 Detail ${project.name}`} style={{
      flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#fff',
      position: 'relative'
    }}>
      {/* Hero image */}
      <div style={{
        position: 'relative', width: '100%', aspectRatio: '16 / 9', flexShrink: 0,
        backgroundImage: `url(${project.img})`,
        backgroundSize: 'cover', backgroundPosition: 'center'
      }}>
        {/* Back chevron */}
        <button onClick={onBack} style={{
          all: 'unset', cursor: 'pointer', position: 'absolute',
          top: 12, left: 12,
          width: 36, height: 36, borderRadius: 18,
          background: 'rgba(0,0,0,0.45)', color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <svg width="16" height="16" viewBox="0 0 16 16"><path d="M10 2L4 8l6 6" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
        {/* Favorite */}
        <button onClick={onToggleFavorite} style={{
          all: 'unset', cursor: 'pointer', position: 'absolute',
          top: 12, right: 12,
          width: 36, height: 36, borderRadius: 18,
          background: 'rgba(0,0,0,0.45)', color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <svg width="18" height="18" viewBox="0 0 18 18">
            <path d="M9 16s-7-4.5-7-9.5C2 4 4 2 6.5 2 8 2 9 3 9 3s1-1 2.5-1C14 2 16 4 16 6.5 16 11.5 9 16 9 16z"
            fill={isFavorite ? GOLD : 'none'} stroke="#fff" strokeWidth="1.6" />
          </svg>
        </button>
        {/* Title overlay */}
        <div style={{
          position: 'absolute', left: 0, right: 0, bottom: 0,
          padding: '24px 22px 22px',
          background: 'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.55) 100%)',
          color: '#fff',
          fontFamily: 'Barlow, sans-serif', fontWeight: 900,
          fontSize: Math.min(38, Math.max(18, Math.floor(340 / Math.max(project.name.length, 1)))),
          letterSpacing: '0.02em',
          lineHeight: 1.05,
          wordBreak: 'break-word',
          overflowWrap: 'break-word'
        }}>{project.name}</div>
      </div>

      {/* Gold accent bar */}
      <div style={{ height: 8, background: GOLD, flexShrink: 0 }} />

      {/* Tabs */}
      <div ref={tabRowRef} style={{
        display: 'flex', background: '#F0EFEC', flexShrink: 0,
        overflowX: 'auto', scrollbarWidth: 'none', cursor: 'grab'
      }}>
        {tabs.map((t) => {
          const on = t.id === tab;
          return (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              all: 'unset', cursor: 'pointer', flex: '1 0 auto',
              minWidth: 'max-content',
              padding: '14px 18px',
              textAlign: 'center',
              fontFamily: 'Barlow, sans-serif', fontWeight: on ? 600 : 500,
              fontSize: 11, letterSpacing: '0.14em',
              color: on ? TEXT_DARK : TEXT_LIGHT,
              background: on ? '#fff' : 'transparent',
              borderBottom: on ? `2px solid ${TEXT_DARK}` : '2px solid transparent'
            }}>{t.label}</button>);

        })}
      </div>

      {/* Data rows */}
      <div style={{ flex: 1, overflow: 'auto', padding: '20px 22px 100px', position: 'relative' }}>
        {/* Completeness meter */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18,
          padding: '10px 14px', background: '#F8F7F4', borderRadius: 6
        }}>
          <div style={{
            fontFamily: 'Barlow, sans-serif', fontSize: 10, fontWeight: 600,
            letterSpacing: '0.16em', color: TEXT_MED
          }}>VOLLEDIGHEID</div>
          <div style={{ flex: 1, height: 4, background: '#E5E5E5', borderRadius: 2 }}>
            <div style={{
              height: '100%', width: `${completeness}%`, background: GOLD,
              borderRadius: 2, transition: 'width 0.6s ease'
            }} />
          </div>
          <div style={{
            fontFamily: 'Barlow, sans-serif', fontSize: 12, fontWeight: 700,
            color: TEXT_DARK, fontVariantNumeric: 'tabular-nums'
          }}>{completeness}%</div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {tabRows.map((row, i) =>
          <DetailRow
            key={row.k}
            row={row}
            editing={editing && !row.fixed}
            onChange={(v) => setDraft((d) => ({ ...d, [row.k]: v }))} />

          )}
        </div>

        {savedFlash &&
        <div style={{
          position: 'fixed', bottom: 80, left: '50%', transform: 'translateX(-50%)',
          padding: '10px 18px', borderRadius: 999,
          background: TEXT_DARK, color: '#fff',
          fontFamily: 'Barlow, sans-serif', fontSize: 11, letterSpacing: '0.16em',
          zIndex: 200, animation: 'fadeIn 0.2s ease'
        }}>OPGESLAGEN ✓</div>
        }
      </div>

      {/* Actie-bar — vast rechtsonder, scrollt niet mee */}
      <div style={{
        position: 'absolute', right: 18, bottom: 18, zIndex: 20,
        display: 'flex', justifyContent: 'flex-end', gap: 10
      }}>
        {editing ?
        <>
            <button onClick={cancel} disabled={saving} style={{
            all: 'unset', cursor: 'pointer',
            padding: '10px 20px', borderRadius: 999,
            background: '#fff', color: TEXT_MED,
            border: `1px solid ${BORDER}`,
            boxShadow: '0 4px 14px rgba(0,0,0,0.16)',
            fontFamily: 'Barlow, sans-serif', fontWeight: 500, fontSize: 11,
            letterSpacing: '0.20em'
          }}>ANNULEER</button>
            <button onClick={save} disabled={saving} style={{
            all: 'unset', cursor: saving ? 'wait' : 'pointer',
            padding: '10px 22px', borderRadius: 999,
            background: GOLD, color: '#fff',
            boxShadow: '0 4px 14px rgba(0,0,0,0.22)',
            fontFamily: 'Barlow, sans-serif', fontWeight: 700, fontSize: 11,
            letterSpacing: '0.20em', opacity: saving ? 0.6 : 1
          }}>{saving ? 'OPSLAAN…' : 'OPSLAAN'}</button>
          </> :

        <button onClick={tryEdit} style={{
          all: 'unset', cursor: 'pointer',
          padding: '12px 24px', borderRadius: 999,
          background: TEXT_DARK, color: '#fff',
          boxShadow: '0 4px 14px rgba(0,0,0,0.22)',
          fontFamily: 'Barlow, sans-serif', fontWeight: 600, fontSize: 11,
          letterSpacing: '0.20em'
        }}>{user ? 'BEWERKEN' : 'LOG IN OM TE BEWERKEN'}</button>
        }
      </div>
    </div>);

}
function DetailRow({ row, editing, onChange }) {
  const { TEXT_DARK, TEXT_MED, TEXT_LIGHT, BORDER, SAGE } = window.POTHEME;
  if (editing) {
    const isNumeric = row.unit === 'm²' || row.unit === 'plekken' || row.unit === 'm' || row.unit === '/10';
    const isDate = row.col === 'opleverdatum';
    return (
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: 12, alignItems: 'center',
        fontFamily: 'Barlow, sans-serif'
      }}>
        <div style={{
          fontWeight: 500, fontSize: 11, letterSpacing: '0.16em',
          color: TEXT_MED
        }}>{row.label}</div>
        <input
          value={row.raw == null ? '' : row.raw}
          onChange={(e) => {
            let v = e.target.value;
            if (isNumeric && v !== '') v = Number(v) || 0;
            onChange(v);
          }}
          type={isDate ? 'date' : isNumeric ? 'number' : 'text'}
          placeholder="—"
          style={{
            width: '100%', boxSizing: 'border-box',
            padding: '7px 10px', borderRadius: 5,
            border: `1px solid ${BORDER}`,
            background: '#FFFDF8',
            fontFamily: 'Barlow, sans-serif', fontSize: 13,
            color: TEXT_DARK, letterSpacing: '0.02em', outline: 'none'
          }}
          onFocus={(e) => e.target.style.borderColor = SAGE}
          onBlur={(e) => e.target.style.borderColor = BORDER} />
        
      </div>);

  }
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: 12,
      fontFamily: 'Barlow, sans-serif',
      alignItems: 'end',
      opacity: row.empty ? 0.55 : 1
    }}>
      <div style={{
        fontWeight: 500, fontSize: 11, letterSpacing: '0.16em',
        color: TEXT_MED
      }}>{row.label}</div>
      <div style={{
        fontWeight: row.empty ? 400 : 500, fontSize: 13, letterSpacing: '0.04em',
        color: row.empty ? TEXT_LIGHT : TEXT_DARK,
        fontStyle: row.empty ? 'italic' : 'normal',
        textAlign: 'right'
      }}>{row.value}</div>
    </div>);

}

// ────────────────────────────────────────────────────────────
// SEARCH OVERLAY — projects + werknemers + contacten
// ────────────────────────────────────────────────────────────
function SearchOverlay({ projects, onClose, onOpenProject, onOpenEmployee }) {
  const [q, setQ] = useState('');
  const inputRef = useRef(null);
  useEffect(() => {inputRef.current && inputRef.current.focus();}, []);

  const ql = q.trim().toLowerCase();
  const projectMatches = ql === '' ?
  projects.slice(0, 6) :
  projects.filter((p) =>
  [p.name, p.opdr, p.contact, p.stad, p.straat, p.functie, p.projectnummer, p.alt].
  filter(Boolean).some((s) => String(s).toLowerCase().includes(ql))
  );
  const empMatches = ql === '' ? [] : window.EMPLOYEES.filter((e) =>
  [e.naam, e.rol, e.team].some((s) => s.toLowerCase().includes(ql))
  );
  const contactMatches = ql === '' ? [] : window.CONTACTS.filter((c) =>
  [c.naam, c.bedrijf, c.rol, c.email].filter(Boolean).some((s) => s.toLowerCase().includes(ql))
  );
  const total = projectMatches.length + empMatches.length + contactMatches.length;

  return (
    <div style={{
      position: 'absolute', inset: 0, background: '#fff', zIndex: 100,
      display: 'flex', flexDirection: 'column',
      animation: 'fadeIn 0.2s ease'
    }}>
      <div style={{
        background: SAGE, padding: '48px 16px 14px',
        display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0
      }}>
        <input ref={inputRef} value={q} onChange={(e) => setQ(e.target.value)}
        placeholder="Zoek project, persoon, opdrachtgever…"
        style={{
          flex: 1, background: 'rgba(255,255,255,0.18)',
          border: 'none', outline: 'none',
          borderRadius: 6, padding: '10px 14px',
          fontFamily: 'Barlow, sans-serif', fontSize: 13,
          color: '#fff', letterSpacing: '0.02em'
        }} />
        <button onClick={onClose} title="Sluiten" style={{
          all: 'unset', cursor: 'pointer', color: '#fff',
          width: 30, height: 30, borderRadius: 15,
          background: 'rgba(255,255,255,0.15)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
        }}>
          <svg width="15" height="15" viewBox="0 0 20 20"><path d="M5 5l10 10M15 5l-10 10" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" /></svg>
        </button>
      </div>
      <div style={{
        padding: '10px 22px',
        fontFamily: 'Barlow, sans-serif', fontWeight: 500, fontSize: 10,
        letterSpacing: '0.18em', color: TEXT_MED
      }}>{total} RESULTATEN</div>
      <div style={{ flex: 1, overflow: 'auto' }}>
        {projectMatches.length > 0 &&
        <SearchGroup label={`PROJECTEN · ${projectMatches.length}`}>
            {projectMatches.map((p) =>
          <button key={p.id} onClick={() => onOpenProject(p.id)} style={searchRow}>
                <div style={{
              width: 48, height: 48, flexShrink: 0,
              backgroundImage: `url(${p.img})`,
              backgroundSize: 'cover', backgroundPosition: 'center'
            }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                fontFamily: 'Barlow, sans-serif', fontWeight: 700, fontSize: 13,
                color: TEXT_DARK, letterSpacing: '0.02em'
              }}>{p.name}</div>
                  <div style={{
                fontFamily: 'Barlow, sans-serif', fontSize: 10,
                color: TEXT_MED, letterSpacing: '0.06em', marginTop: 2
              }}>#{p.projectnummer} · {p.stad}</div>
                </div>
                <Pin color={window.PIN_COLORS[p.color]} size={16} dot={false} />
              </button>
          )}
          </SearchGroup>
        }
        {empMatches.length > 0 &&
        <SearchGroup label={`LEDEN · ${empMatches.length}`}>
            {empMatches.map((e) =>
          <button key={e.id} onClick={() => onOpenEmployee(e)} style={searchRow}>
                <Avatar emp={e} size={40} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                fontFamily: 'Barlow, sans-serif', fontWeight: 700, fontSize: 13,
                color: TEXT_DARK, letterSpacing: '0.02em'
              }}>{e.naam}</div>
                  <div style={{
                fontFamily: 'Barlow, sans-serif', fontSize: 10,
                color: TEXT_MED, letterSpacing: '0.06em', marginTop: 2
              }}>{e.rol} · {e.team}</div>
                </div>
                <div style={{
              fontFamily: 'Barlow, sans-serif', fontWeight: 700, fontSize: 13,
              color: TEXT_DARK
            }}>{e.score}</div>
              </button>
          )}
          </SearchGroup>
        }
        {contactMatches.length > 0 &&
        <SearchGroup label={`CONTACTEN · ${contactMatches.length}`}>
            {contactMatches.map((c) =>
          <div key={c.id} style={searchRow}>
                <div style={{
              width: 40, height: 40, borderRadius: 20, background: '#F0EFEC',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'Barlow, sans-serif', fontSize: 13, fontWeight: 700,
              color: SAGE_DARK
            }}>{c.naam.split(' ').map((w) => w[0]).slice(0, 2).join('')}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                fontFamily: 'Barlow, sans-serif', fontWeight: 700, fontSize: 13,
                color: TEXT_DARK, letterSpacing: '0.02em'
              }}>{c.naam}</div>
                  <div style={{
                fontFamily: 'Barlow, sans-serif', fontSize: 10,
                color: TEXT_MED, letterSpacing: '0.06em', marginTop: 2
              }}>{c.rol} · {c.bedrijf}</div>
                </div>
              </div>
          )}
          </SearchGroup>
        }
        {total === 0 && q &&
        <div style={{
          padding: 40, textAlign: 'center', color: TEXT_LIGHT,
          fontFamily: 'Barlow, sans-serif', fontSize: 13, letterSpacing: '0.06em'
        }}>Geen resultaten voor "{q}"</div>
        }
      </div>
    </div>);

}
function SearchGroup({ label, children }) {
  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{
        padding: '12px 22px 6px',
        fontFamily: 'Barlow, sans-serif', fontSize: 9, fontWeight: 600,
        letterSpacing: '0.20em', color: TEXT_LIGHT
      }}>{label}</div>
      <div>{children}</div>
    </div>);

}
const searchRow = {
  all: 'unset', cursor: 'pointer', display: 'flex',
  alignItems: 'center', gap: 12, padding: '10px 22px',
  borderBottom: `1px solid ${BORDER}`, width: '100%', boxSizing: 'border-box'
};

// ────────────────────────────────────────────────────────────
// FILTERS SHEET
// ────────────────────────────────────────────────────────────
// ────────────────────────────────────────────────────────────
// SHARED SHEET HEADER — sage bar, iPhone top safe-margin, × sluiten
// ────────────────────────────────────────────────────────────
function SheetHeader({ title, onClose, right }) {
  return (
    <div style={{
      background: SAGE, padding: '48px 18px 14px', flexShrink: 0,
      display: 'flex', alignItems: 'center', gap: 12
    }}>
      <div style={{
        flex: 1, fontFamily: 'Barlow, sans-serif', fontWeight: 600, fontSize: 14,
        color: '#fff', letterSpacing: '0.14em'
      }}>{title}</div>
      {right}
      <button onClick={onClose} title="Sluiten" style={{
        all: 'unset', cursor: 'pointer',
        width: 30, height: 30, borderRadius: 15,
        background: 'rgba(255,255,255,0.15)', color: '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
      }}>
        <svg width="15" height="15" viewBox="0 0 20 20"><path d="M5 5l10 10M15 5l-10 10" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" /></svg>
      </button>
    </div>);

}

// Dual-thumb range slider (metrage / bouwhoogte)
function RangeSlider({ min, max, step = 1, value, onChange, format = (v) => v }) {
  const [lo, hi] = value;
  const pct = (v) => (v - min) / (max - min) * 100;
  return (
    <div>
      <style>{`
        .rs-wrap input[type=range]{ -webkit-appearance:none; appearance:none; position:absolute; top:0; left:0; width:100%; height:26px; margin:0; background:transparent; pointer-events:none; }
        .rs-wrap input[type=range]::-webkit-slider-thumb{ -webkit-appearance:none; appearance:none; pointer-events:auto; width:22px; height:22px; border-radius:11px; background:#fff; border:2px solid ${SAGE_DARK}; box-shadow:0 1px 4px rgba(0,0,0,0.25); cursor:pointer; }
        .rs-wrap input[type=range]::-moz-range-thumb{ pointer-events:auto; width:22px; height:22px; border-radius:11px; background:#fff; border:2px solid ${SAGE_DARK}; box-shadow:0 1px 4px rgba(0,0,0,0.25); cursor:pointer; }
        .rs-wrap input[type=range]::-webkit-slider-runnable-track{ background:transparent; border:none; }
        .rs-wrap input[type=range]::-moz-range-track{ background:transparent; border:none; }
      `}</style>
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        fontFamily: 'Barlow, sans-serif', fontSize: 13, fontWeight: 700,
        color: TEXT_DARK, marginBottom: 12, fontVariantNumeric: 'tabular-nums'
      }}>
        <span>{format(lo)}</span><span>{format(hi)}</span>
      </div>
      <div className="rs-wrap" style={{ position: 'relative', height: 26 }}>
        <div style={{ position: 'absolute', top: 11, left: 0, right: 0, height: 4, background: '#ECEAE6', borderRadius: 2 }} />
        <div style={{ position: 'absolute', top: 11, height: 4, background: SAGE, borderRadius: 2, left: pct(lo) + '%', right: 100 - pct(hi) + '%' }} />
        <input type="range" min={min} max={max} step={step} value={lo}
        onChange={(e) => onChange([Math.min(+e.target.value, hi - step), hi])} />
        <input type="range" min={min} max={max} step={step} value={hi}
        onChange={(e) => onChange([lo, Math.max(+e.target.value, lo + step)])} />
      </div>
    </div>);

}

function FilterChips({ options, selected, onToggle }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
      {options.map((o) => {
        const on = selected.includes(o);
        return (
          <button key={o} onClick={() => onToggle(o)} style={{
            all: 'unset', cursor: 'pointer',
            padding: '9px 16px', borderRadius: 999,
            fontFamily: 'Barlow, sans-serif', fontSize: 12, fontWeight: 500,
            letterSpacing: '0.04em',
            background: on ? TEXT_DARK : '#F4F2EE',
            color: on ? '#fff' : TEXT_MED,
            border: `1px solid ${on ? TEXT_DARK : BORDER}`
          }}>{o}</button>);

      })}
    </div>);

}
function FilterSection({ title, children }) {
  return (
    <div style={{ marginBottom: 26 }}>
      <div style={{
        fontFamily: 'Barlow, sans-serif', fontWeight: 600, fontSize: 11,
        letterSpacing: '0.18em', color: TEXT_MED, marginBottom: 14
      }}>{title}</div>
      {children}
    </div>);

}
function CollapsibleSection({ title, count = 0, defaultOpen = false, children }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ borderBottom: `1px solid ${BORDER}` }}>
      <button onClick={() => setOpen((o) => !o)} style={{
        all: 'unset', cursor: 'pointer', width: '100%', boxSizing: 'border-box',
        display: 'flex', alignItems: 'center', gap: 10, padding: '15px 0'
      }}>
        <span style={{
          fontFamily: 'Barlow, sans-serif', fontWeight: 600, fontSize: 12,
          letterSpacing: '0.16em', color: TEXT_DARK
        }}>{title}</span>
        {count > 0 &&
        <span style={{
          fontFamily: 'Barlow, sans-serif', fontSize: 10, fontWeight: 700, color: '#fff',
          background: SAGE, borderRadius: 9, minWidth: 18, height: 18, padding: '0 5px',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center'
        }}>{count}</span>
        }
        <span style={{ flex: 1 }} />
        <svg width="14" height="14" viewBox="0 0 14 14" style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
          <path d="M3 5l4 4 4-4" stroke={TEXT_MED} strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && <div style={{ paddingBottom: 20 }}>{children}</div>}
    </div>);

}

// ────────────────────────────────────────────────────────────
// FILTERS SHEET — full panel: status, type, functie, metrage, bouwhoogte
// ────────────────────────────────────────────────────────────
function FiltersSheet({ filters, setFilters, defaults, allProjects, resultCount, onClose }) {
  const round = (v, n) => Math.round(v / n) * n;
  const bvos = allProjects.map((p) => p.bvo || 0).filter((v) => v > 0);
  const hoogtes = allProjects.map((p) => p.hoogte || 0).filter((v) => v > 0);
  const years = allProjects.map((p) => +String(p.oplev || '').slice(0, 4)).filter(Boolean);
  const bvoBounds = bvos.length ? [round(Math.min(...bvos), 500), round(Math.max(...bvos) + 500, 500)] : [0, 35000];
  const hoogteBounds = [0, hoogtes.length ? round(Math.max(...hoogtes) + 5, 5) : 70];
  const yearBounds = years.length ? [Math.min(...years), Math.max(...years)] : [2015, 2030];
  const statuses = Object.keys(window.PIN_COLORS);
  const types = [...new Set(allProjects.map((p) => p.type))].filter(Boolean);
  const functies = [...new Set(allProjects.map((p) => p.functie))].filter(Boolean);
  const provs = [...new Set(allProjects.map((p) => p.prov))].filter(Boolean);

  const toggleArr = (key, val) => setFilters((f) => ({
    ...f, [key]: (f[key] || []).includes(val) ? f[key].filter((x) => x !== val) : [...(f[key] || []), val]
  }));
  const bvo = filters.bvo || bvoBounds;
  const hoogte = filters.hoogte || hoogteBounds;
  const jaar = filters.jaar || yearBounds;
  const count = filters.status.length + filters.type.length + filters.functie.length + (
  filters.prov ? filters.prov.length : 0) + (
  filters.bvo ? 1 : 0) + (filters.hoogte ? 1 : 0) + (filters.jaar ? 1 : 0);

  return (
    <div style={{
      position: 'absolute', inset: 0, background: '#fff', zIndex: 100,
      display: 'flex', flexDirection: 'column', overflow: 'hidden',
      animation: 'slideUp 0.3s cubic-bezier(0.2, 0.8, 0.2, 1) both'
    }}>
      <SheetHeader title={`FILTERS${count ? ' · ' + count : ''}`} onClose={onClose}
      right={count > 0 ?
      <button onClick={() => setFilters({ ...defaults })} style={{
        all: 'unset', cursor: 'pointer',
        fontFamily: 'Barlow, sans-serif', fontSize: 11, fontWeight: 500,
        letterSpacing: '0.14em', color: '#fff', opacity: 0.85
      }}>WIS ALLES</button> :
      null} />

      <div style={{ flex: 1, overflow: 'auto', padding: '4px 20px 16px' }}>
        <CollapsibleSection title="STATUS" count={filters.status.length} defaultOpen>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {statuses.map((c) => {
              const on = filters.status.includes(c);
              return (
                <button key={c} onClick={() => toggleArr('status', c)} style={{
                  all: 'unset', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8,
                  padding: '8px 14px', borderRadius: 999,
                  background: on ? '#F6F4EF' : '#F4F2EE',
                  border: `1px solid ${on ? GOLD : BORDER}`,
                  fontFamily: 'Barlow, sans-serif', fontSize: 12, fontWeight: 500,
                  color: TEXT_DARK, letterSpacing: '0.03em'
                }}>
                  <span style={{ width: 10, height: 10, borderRadius: 5, background: window.PIN_COLORS[c] }} />
                  {window.PIN_LABELS[c]}
                </button>);

            })}
          </div>
        </CollapsibleSection>

        <CollapsibleSection title="TYPE PROJECT" count={filters.type.length} defaultOpen>
          <FilterChips options={types} selected={filters.type} onToggle={(v) => toggleArr('type', v)} />
        </CollapsibleSection>

        <CollapsibleSection title="FUNCTIE" count={filters.functie.length}>
          <FilterChips options={functies} selected={filters.functie} onToggle={(v) => toggleArr('functie', v)} />
        </CollapsibleSection>

        <CollapsibleSection title="PROVINCIE" count={filters.prov ? filters.prov.length : 0}>
          <FilterChips options={provs} selected={filters.prov || []} onToggle={(v) => toggleArr('prov', v)} />
        </CollapsibleSection>

        <CollapsibleSection title="METRAGE (BVO)" count={filters.bvo ? 1 : 0}>
          <RangeSlider min={bvoBounds[0]} max={bvoBounds[1]} step={500}
          value={bvo}
          onChange={(v) => setFilters((f) => ({ ...f, bvo: v[0] <= bvoBounds[0] && v[1] >= bvoBounds[1] ? null : v }))}
          format={(v) => v.toLocaleString('nl-NL') + ' m²'} />
        </CollapsibleSection>

        <CollapsibleSection title="BOUWHOOGTE" count={filters.hoogte ? 1 : 0}>
          <RangeSlider min={hoogteBounds[0]} max={hoogteBounds[1]} step={1}
          value={hoogte}
          onChange={(v) => setFilters((f) => ({ ...f, hoogte: v[0] <= hoogteBounds[0] && v[1] >= hoogteBounds[1] ? null : v }))}
          format={(v) => v + ' m'} />
        </CollapsibleSection>

        <CollapsibleSection title="OPLEVERING" count={filters.jaar ? 1 : 0}>
          <RangeSlider min={yearBounds[0]} max={yearBounds[1]} step={1}
          value={jaar}
          onChange={(v) => setFilters((f) => ({ ...f, jaar: v[0] <= yearBounds[0] && v[1] >= yearBounds[1] ? null : v }))}
          format={(v) => String(v)} />
        </CollapsibleSection>
      </div>

      <div style={{ flexShrink: 0, padding: '12px 20px 30px', borderTop: `1px solid ${BORDER}` }}>
        <button onClick={onClose} style={{
          all: 'unset', cursor: 'pointer', display: 'block', textAlign: 'center',
          width: '100%', boxSizing: 'border-box',
          padding: '15px 0', borderRadius: 10, background: SAGE, color: '#fff',
          fontFamily: 'Barlow, sans-serif', fontWeight: 600, fontSize: 13, letterSpacing: '0.14em'
        }}>TOON {resultCount} {resultCount === 1 ? 'PROJECT' : 'PROJECTEN'}</button>
      </div>
    </div>);

}

// ────────────────────────────────────────────────────────────
// FAVORIETEN SCREEN (overlay)
// ────────────────────────────────────────────────────────────
function FavorietenSheet({ favorites, projects, onClose, onOpenProject }) {
  const favProjects = projects.filter((p) => favorites.has(p.id));
  return (
    <div style={{
      position: 'absolute', inset: 0, background: '#fff', zIndex: 100,
      display: 'flex', flexDirection: 'column',
      animation: 'slideUp 0.3s cubic-bezier(0.2, 0.8, 0.2, 1) both'
    }}>
      <SheetHeader title={`FAVORIETEN · ${favProjects.length}`} onClose={onClose} />
      <div style={{ flex: 1, overflow: 'auto', padding: '18px' }}>
        {favProjects.length === 0 ?
        <div style={{
          textAlign: 'center', padding: '60px 30px', color: TEXT_LIGHT,
          fontFamily: 'Barlow, sans-serif', fontSize: 13, letterSpacing: '0.06em', lineHeight: 1.6
        }}>
            <svg width="44" height="44" viewBox="0 0 18 18" style={{ marginBottom: 16, opacity: 0.5 }}>
              <path d="M9 16s-7-4.5-7-9.5C2 4 4 2 6.5 2 8 2 9 3 9 3s1-1 2.5-1C14 2 16 4 16 6.5 16 11.5 9 16 9 16z" stroke={TEXT_LIGHT} strokeWidth="1.4" fill="none" />
            </svg>
            <div>Nog geen favorieten.</div>
            <div style={{ fontSize: 11, marginTop: 6 }}>Tik op het hartje bij een project.</div>
          </div> :

        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {favProjects.map((p) =>
          <ProjectCard key={p.id} project={p} compact onClick={() => onOpenProject(p.id)} />
          )}
          </div>
        }
      </div>
    </div>);

}

// ────────────────────────────────────────────────────────────
// DASHBOARD SHEET — mirrors projects_dashboard.html
// ────────────────────────────────────────────────────────────
function ProjectDataDashboard({ projects, onOpenProject }) {
  const byStatus = {};
  projects.forEach((p) => { const c = window.projectColor(p); byStatus[c] = (byStatus[c] || 0) + 1; });
  const totalBvo = projects.reduce((s, p) => s + (p.bvo || 0), 0);
  const byCity = {}, byProv = {};
  projects.forEach((p) => {
    if (p.stad) byCity[p.stad] = (byCity[p.stad] || 0) + 1;
    if (p.prov) byProv[p.prov] = (byProv[p.prov] || 0) + 1;
  });
  const topCities = Object.entries(byCity).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const topProvs = Object.entries(byProv).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const byFunc = {};
  projects.forEach((p) => { if (p.functie) byFunc[p.functie] = (byFunc[p.functie] || 0) + 1; });

  const allFields = Object.values(window.PROJECT_FIELDS).flat().filter((f) => f.fixed === undefined);
  const filledOf = (p) => allFields.reduce((s, f) => {
    let v = p[f.k]; if ((v === undefined || v === null || v === '') && f.from) v = p[f.from];
    const ok = v !== undefined && v !== null && v !== '' && v !== 0 && !(Array.isArray(v) && v.length === 0);
    return s + (ok ? 1 : 0);
  }, 0);
  const filledTotal = projects.reduce((s, p) => s + filledOf(p), 0);
  const slotTotal = projects.length * allFields.length;
  const emptyTotal = slotTotal - filledTotal;

  const withCreated = projects.filter((p) => p.createdAt);
  const newest = withCreated.sort((a, b) => b.createdAt - a.createdAt)[0] || null;
  const withEdited = projects.filter((p) => p.updatedAt);
  const edited = withEdited.sort((a, b) => b.updatedAt - a.updatedAt)[0] || null;

  if (!projects.length) return null;

  return (
    <React.Fragment>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 22 }}>
        <Kpi label="PROJECTEN" value={projects.length} />
        <Kpi label="TOTAAL BVO" value={(totalBvo / 1000).toFixed(0) + 'k m²'} />
        <Kpi label="VELDEN INGEVULD" value={filledTotal.toLocaleString('nl-NL')} />
        <Kpi label="LEGE VELDEN" value={emptyTotal.toLocaleString('nl-NL')} />
      </div>

      {(newest || edited) &&
      <React.Fragment>
          <SectionTitle>RECENT</SectionTitle>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 22 }}>
            {newest && <RecentTile label="NIEUW TOEGEVOEGD" project={newest} onOpenProject={onOpenProject} />}
            {edited && <RecentTile label="LAATST BEWERKT" project={edited} onOpenProject={onOpenProject} />}
          </div>
        </React.Fragment>
      }

      <SectionTitle>STATUS VERDELING</SectionTitle>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 22 }}>
        {Object.entries(byStatus).sort((a, b) => b[1] - a[1]).map(([color, count]) => {
          const pct = count / projects.length * 100;
          return (
            <div key={color}>
              <div style={{
                display: 'flex', justifyContent: 'space-between',
                fontFamily: 'Barlow, sans-serif', fontWeight: 500, fontSize: 10,
                letterSpacing: '0.10em', color: TEXT_MED, marginBottom: 4
              }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 8, height: 8, borderRadius: 4, background: window.PIN_COLORS[color] }} />
                  {(window.PIN_LABELS[color] || color).toUpperCase()}
                </span>
                <span style={{ fontVariantNumeric: 'tabular-nums' }}>{count}</span>
              </div>
              <div style={{ height: 4, background: '#F0EFEC', borderRadius: 2 }}>
                <div style={{ height: '100%', width: pct + '%', background: window.PIN_COLORS[color], borderRadius: 2, transition: 'width 0.6s ease' }} />
              </div>
            </div>);
        })}
      </div>

      <SectionTitle>TOP PROVINCIES</SectionTitle>
      <RankList items={topProvs} total={projects.length} style={{ marginBottom: 22 }} />

      <SectionTitle>TOP STEDEN</SectionTitle>
      <RankList items={topCities} total={projects.length} style={{ marginBottom: 22 }} />

      <SectionTitle>FUNCTIE</SectionTitle>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        {Object.entries(byFunc).sort((a, b) => b[1] - a[1]).map(([f, count]) =>
        <div key={f} style={{ padding: '12px 14px', background: '#F8F7F4', borderRadius: 6 }}>
            <div style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 800, fontSize: 22, color: TEXT_DARK, letterSpacing: '-0.01em' }}>{count}</div>
            <div style={{ fontFamily: 'Barlow, sans-serif', fontSize: 10, color: TEXT_MED, letterSpacing: '0.12em', marginTop: 4, textTransform: 'uppercase' }}>{f}</div>
          </div>
        )}
      </div>
    </React.Fragment>);
}
function DashboardSheet({ projects, favorites, onToggleFavorite, onClose, onOpenProject, onOpenEmployee }) {
  const favProjects = projects.filter((p) => favorites.has(p.id));

  const [sub, setSub] = useState('Leaderboard');
  const SUBS = ['Leaderboard', 'Invulstatus', 'Projecten', 'Favorieten'];

  return (
    <div style={{
      position: 'absolute', inset: 0, background: '#fff', zIndex: 100,
      display: 'flex', flexDirection: 'column', overflow: 'hidden',
      animation: 'slideUp 0.3s cubic-bezier(0.2, 0.8, 0.2, 1) both'
    }}>
      <SheetHeader title="DASHBOARD" onClose={onClose} />
      <SubTabs tabs={SUBS} active={sub} onChange={setSub} />
      {sub === 'Leaderboard' ?
      <div style={{ flex: 1, overflow: 'auto', padding: '18px 18px 30px' }}>
          <Leaderboard onOpenEmployee={onOpenEmployee} />
        </div> :
      sub === 'Invulstatus' ?
      <div style={{ flex: 1, overflow: 'auto', padding: '18px 18px 30px' }}>
          <InvulStatus projects={projects} onOpenProject={onOpenProject} />
        </div> :
      sub === 'Favorieten' ?
      <div style={{ flex: 1, overflow: 'auto', padding: '18px 18px 30px' }}>
          {favProjects.length === 0 ?
        <div style={{
          padding: '60px 24px', textAlign: 'center',
          fontFamily: 'Barlow, sans-serif', color: TEXT_MED, fontSize: 13, lineHeight: 1.6
        }}>Nog geen favorieten.<br />Tik op het hartje bij een project om het hier te verzamelen.</div> :

        <div>
              <div style={{
            fontFamily: 'Barlow, sans-serif', fontSize: 11, fontWeight: 600,
            letterSpacing: '0.06em', color: TEXT_MED, marginBottom: 18, lineHeight: 1.5
          }}>Data over je {favProjects.length} favoriete {favProjects.length === 1 ? 'project' : 'projecten'}.</div>
              <ProjectDataDashboard projects={favProjects} onOpenProject={onOpenProject} />
            </div>
        }
        </div> :

      <div style={{ flex: 1, overflow: 'auto', padding: '18px 18px 30px' }}>
        <ProjectDataDashboard projects={projects} onOpenProject={onOpenProject} />
      </div>
      }
    </div>);

}
function RecentTile({ label, project, onOpenProject }) {
  const { TEXT_DARK, TEXT_MED } = window.POTHEME;
  return (
    <button onClick={() => onOpenProject(project.id)} style={{
      all: 'unset', cursor: 'pointer', display: 'block', overflow: 'hidden',
      borderRadius: 8, background: '#F8F7F4'
    }}>
      <div style={{
        width: '100%', aspectRatio: '16 / 9',
        backgroundImage: `url(${project.img})`, backgroundSize: 'cover', backgroundPosition: 'center'
      }} />
      <div style={{ padding: '8px 10px 10px' }}>
        <div style={{
          fontFamily: 'Barlow, sans-serif', fontWeight: 600, fontSize: 9,
          letterSpacing: '0.14em', color: TEXT_MED
        }}>{label}</div>
        <div style={{
          fontFamily: 'Barlow, sans-serif', fontWeight: 700, fontSize: 12,
          color: TEXT_DARK, marginTop: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
        }}>{project.name}</div>
      </div>
    </button>);

}
function SubTabs({ tabs, active, onChange }) {
  return (
    <div style={{
      padding: '14px 18px', display: 'flex', gap: 8, flexShrink: 0,
      borderBottom: `1px solid ${BORDER}`, background: '#fff'
    }}>
      {tabs.map((t) => {
        const on = t === active;
        return (
          <button key={t} onClick={() => onChange(t)} style={{
            all: 'unset', cursor: 'pointer',
            padding: '8px 16px', borderRadius: 999,
            fontFamily: 'Barlow, sans-serif', fontSize: 12, fontWeight: 500,
            letterSpacing: '0.04em',
            background: on ? TEXT_DARK : '#F4F2EE',
            color: on ? '#fff' : TEXT_MED,
            border: `1px solid ${on ? TEXT_DARK : BORDER}`
          }}>{t}</button>);

      })}
    </div>);

}
function InvulStatus({ projects, onOpenProject }) {
  const [sort, setSort] = useState('laag');
  const allFields = Object.values(window.PROJECT_FIELDS).flat().filter((f) => f.fixed === undefined);
  const filled = (p, f) => {
    let v = p[f.k];if ((v === undefined || v === null || v === '') && f.from) v = p[f.from];
    return v !== undefined && v !== null && v !== '' && v !== 0 && !(Array.isArray(v) && v.length === 0);
  };
  let rows = projects.map((p) => {
    const n = allFields.reduce((s, f) => s + (filled(p, f) ? 1 : 0), 0);
    return { p, pct: Math.round(n / allFields.length * 100) };
  });
  const sorters = {
    laag: (a, b) => a.pct - b.pct,
    hoog: (a, b) => b.pct - a.pct,
    naam: (a, b) => a.p.name.localeCompare(b.p.name)
  };
  rows = rows.sort(sorters[sort]);
  const avg = rows.length ? Math.round(rows.reduce((s, r) => s + r.pct, 0) / rows.length) : 0;
  const done = rows.filter((r) => r.pct === 100).length;
  const todo = rows.length - done;
  const barColor = (pct) => pct >= 90 ? '#4F6E3F' : pct >= 60 ? GOLD : '#E54B4B';
  const SORTS = [['laag', 'Minst ingevuld'], ['hoog', 'Meest ingevuld'], ['naam', 'Naam (A–Z)']];
  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 22 }}>
        <Kpi label="GEMIDDELD" value={avg + '%'} />
        <Kpi label="COMPLEET" value={done} />
        <Kpi label="ONVOLLEDIG" value={todo} />
      </div>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14
      }}>
        <SectionTitle>INVULSTATUS PER PROJECT</SectionTitle>
      </div>
      <div style={{ display: 'flex', gap: 7, marginBottom: 16, flexWrap: 'wrap' }}>
        {SORTS.map(([k, lbl]) =>
        <button key={k} onClick={() => setSort(k)} style={{
          all: 'unset', cursor: 'pointer', padding: '6px 12px', borderRadius: 999,
          fontFamily: 'Barlow, sans-serif', fontSize: 11, fontWeight: 500, letterSpacing: '0.02em',
          background: sort === k ? TEXT_DARK : '#F4F2EE', color: sort === k ? '#fff' : TEXT_MED,
          border: `1px solid ${sort === k ? TEXT_DARK : BORDER}`
        }}>{lbl}</button>
        )}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
        {rows.map(({ p, pct }) =>
        <button key={p.id} onClick={() => onOpenProject(p.id)} style={{
          all: 'unset', cursor: 'pointer', display: 'block', width: '100%', boxSizing: 'border-box'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 5 }}>
              <span style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 700, fontSize: 12, color: TEXT_DARK, letterSpacing: '0.03em' }}>{p.name}</span>
              <span style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 700, fontSize: 12, color: barColor(pct), fontVariantNumeric: 'tabular-nums' }}>{pct}%</span>
            </div>
            <div style={{ height: 5, background: '#F0EFEC', borderRadius: 3 }}>
              <div style={{ height: '100%', width: pct + '%', background: barColor(pct), borderRadius: 3, transition: 'width 0.6s ease' }} />
            </div>
          </button>
        )}
      </div>
    </div>);

}
function SectionTitle({ children }) {
  return (
    <div style={{
      fontFamily: 'Barlow, sans-serif', fontWeight: 600, fontSize: 10,
      letterSpacing: '0.20em', color: TEXT_MED, marginBottom: 10,
      display: 'flex', alignItems: 'center', gap: 10
    }}>
      <span>{children}</span>
      <span style={{ flex: 1, height: 1, background: BORDER }} />
    </div>);

}
function RankList({ items, total, style = {} }) {
  const max = items[0] ? items[0][1] : 1;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, ...style }}>
      {items.map(([name, count], i) =>
      <div key={name} style={{
        display: 'grid', gridTemplateColumns: '18px 1fr auto', alignItems: 'center', gap: 10
      }}>
          <div style={{
          fontFamily: 'Barlow, sans-serif', fontSize: 10, fontWeight: 600,
          color: TEXT_LIGHT, fontVariantNumeric: 'tabular-nums'
        }}>{i + 1}.</div>
          <div>
            <div style={{
            fontFamily: 'Barlow, sans-serif', fontSize: 12, fontWeight: 600,
            color: TEXT_DARK, letterSpacing: '0.02em', marginBottom: 4
          }}>{name}</div>
            <div style={{ height: 3, background: '#F0EFEC', borderRadius: 2 }}>
              <div style={{
              height: '100%', width: `${count / max * 100}%`,
              background: SAGE, borderRadius: 2, transition: 'width 0.6s ease'
            }} />
            </div>
          </div>
          <div style={{
          fontFamily: 'Barlow, sans-serif', fontSize: 12, fontWeight: 700,
          color: TEXT_DARK, fontVariantNumeric: 'tabular-nums'
        }}>{count}</div>
        </div>
      )}
    </div>);

}
function Kpi({ label, value }) {
  return (
    <div style={{
      background: '#F8F7F4', padding: '16px 14px', borderRadius: 8
    }}>
      <div style={{
        fontFamily: 'Barlow, sans-serif', fontWeight: 700, fontSize: 28,
        color: TEXT_DARK, letterSpacing: '0.02em'
      }}>{value}</div>
      <div style={{
        fontFamily: 'Barlow, sans-serif', fontWeight: 500, fontSize: 10,
        color: TEXT_MED, letterSpacing: '0.16em', marginTop: 4
      }}>{label}</div>
    </div>);

}

Object.assign(window, {
  LoadingScreen, MapScreen, ListScreen, UniverseScreen, ProfielenScreen,
  CompanyCard, LabelCard, AwardCard, Pill, MetaPair, Leaderboard,
  DetailScreen, SearchOverlay, FiltersSheet, FavorietenSheet, DashboardSheet,
  EmployeeSheet, ProfielDetailSheet, NewContactSheet, AddProfielSheet,
  SheetHeader, SheetSaveBar, FormRow, fieldInputStyle, SingleChips, FilterChips
});

// ────────────────────────────────────────────────────────────
// FORM SHEETS — nieuw project / nieuw contact
// ────────────────────────────────────────────────────────────
const fieldInputStyle = {
  width: '100%', boxSizing: 'border-box', border: `1px solid ${BORDER}`, borderRadius: 8,
  padding: '12px 12px', fontFamily: 'Barlow, sans-serif', fontSize: 14, color: TEXT_DARK,
  outline: 'none', background: '#fff', WebkitAppearance: 'none', appearance: 'none'
};
function FormRow({ label, children }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{
        fontFamily: 'Barlow, sans-serif', fontWeight: 600, fontSize: 11,
        letterSpacing: '0.14em', color: TEXT_MED, marginBottom: 7, textTransform: 'uppercase'
      }}>{label}</div>
      {children}
    </div>);

}
function SingleChips({ options, value, onChange, colorMap }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
      {options.map((o) => {
        const on = value === o;
        return (
          <button key={o} onClick={() => onChange(o)} style={{
            all: 'unset', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '8px 14px', borderRadius: 999,
            background: on ? TEXT_DARK : '#F4F2EE',
            color: on ? '#fff' : TEXT_MED,
            border: `1px solid ${on ? TEXT_DARK : BORDER}`,
            fontFamily: 'Barlow, sans-serif', fontSize: 12, fontWeight: 500, letterSpacing: '0.03em'
          }}>
            {colorMap && <span style={{ width: 10, height: 10, borderRadius: 5, background: colorMap[o] }} />}
            {colorMap ? window.PIN_LABELS[o] : o}
          </button>);

      })}
    </div>);

}
function SheetSaveBar({ label, disabled, onClick }) {
  return (
    <div style={{ flexShrink: 0, padding: '12px 20px 30px', borderTop: `1px solid ${BORDER}` }}>
      <button onClick={onClick} disabled={disabled} style={{
        all: 'unset', cursor: disabled ? 'not-allowed' : 'pointer', display: 'block', textAlign: 'center',
        width: '100%', boxSizing: 'border-box',
        padding: '15px 0', borderRadius: 10,
        background: disabled ? '#C9D4D4' : SAGE, color: '#fff',
        fontFamily: 'Barlow, sans-serif', fontWeight: 600, fontSize: 13, letterSpacing: '0.14em'
      }}>{label}</button>
    </div>);

}
function NewContactSheet({ onClose, onSave }) {
  const [f, setF] = useState({ naam: '', bedrijf: '', rol: '', email: '', tel: '' });
  const set = (k, v) => setF((s) => ({ ...s, [k]: v }));
  const valid = f.naam.trim();
  return (
    <div style={{
      position: 'absolute', inset: 0, background: '#fff', zIndex: 120,
      display: 'flex', flexDirection: 'column', overflow: 'hidden',
      animation: 'slideUp 0.3s cubic-bezier(0.2, 0.8, 0.2, 1) both'
    }}>
      <SheetHeader title="NIEUW CONTACT" onClose={onClose} />
      <div style={{ flex: 1, overflow: 'auto', padding: '20px 20px 16px' }}>
        <FormRow label="Naam"><input style={fieldInputStyle} value={f.naam} onChange={(e) => set('naam', e.target.value)} placeholder="Voor- en achternaam" /></FormRow>
        <FormRow label="Bedrijf"><input style={fieldInputStyle} value={f.bedrijf} onChange={(e) => set('bedrijf', e.target.value)} placeholder="bijv. Heijmans" /></FormRow>
        <FormRow label="Rol"><input style={fieldInputStyle} value={f.rol} onChange={(e) => set('rol', e.target.value)} placeholder="bijv. Projectleider" /></FormRow>
        <FormRow label="E-mail"><input style={fieldInputStyle} type="email" value={f.email} onChange={(e) => set('email', e.target.value)} placeholder="naam@bedrijf.nl" /></FormRow>
        <FormRow label="Telefoon"><input style={fieldInputStyle} type="tel" value={f.tel} onChange={(e) => set('tel', e.target.value)} placeholder="+31 …" /></FormRow>
      </div>
      <SheetSaveBar label="CONTACT OPSLAAN" disabled={!valid}
      onClick={() => {if (valid) onSave({ ...f, naam: f.naam.trim() });}} />
    </div>);

}

// ────────────────────────────────────────────────────────────
// ADD PROFIEL SHEET — context-aware: bedrijf / label / award
// (gestuurd vanaf het +-icoon, afhankelijk van de actieve tab)
// ────────────────────────────────────────────────────────────
function AddProfielSheet({ kind, onClose, onSave }) {
  const cfg = {
    bedrijven: { title: 'NIEUW BEDRIJF', save: 'BEDRIJF OPSLAAN' },
    labels: { title: 'NIEUW LABEL', save: 'LABEL OPSLAAN' },
    awards: { title: 'NIEUWE AWARD', save: 'AWARD OPSLAAN' }
  }[kind] || { title: 'NIEUW', save: 'OPSLAAN' };

  const [f, setF] = useState(
    kind === 'labels' ?
    { naam: '', type: 'Duurzaamheid', categorie: '', erkend: 'Nationaal', oms: '' } :
    kind === 'awards' ?
    { naam: '', categorie: '', project: '', positie: '1e plaats', erkend: 'Nationaal', jaar: String(new Date().getFullYear()) } :
    { naam: '', rol: 'Architect', stad: '', straat: '', postcode: '', email: '', tel: '' }
  );
  const set = (k, v) => setF((s) => ({ ...s, [k]: v }));
  const valid = f.naam.trim();

  return (
    <div style={{
      position: 'absolute', inset: 0, background: '#fff', zIndex: 120,
      display: 'flex', flexDirection: 'column', overflow: 'hidden',
      animation: 'slideUp 0.3s cubic-bezier(0.2, 0.8, 0.2, 1) both'
    }}>
      <SheetHeader title={cfg.title} onClose={onClose} />
      <div style={{ flex: 1, overflow: 'auto', padding: '20px 20px 16px' }}>
        {kind === 'bedrijven' &&
        <>
            <FormRow label="Naam"><input style={fieldInputStyle} value={f.naam} onChange={(e) => set('naam', e.target.value)} placeholder="bijv. Heijmans" /></FormRow>
            <FormRow label="Type bedrijf"><SingleChips options={['Architect', 'Landschapsarchitect', 'Ontwikkelaar', 'Aannemer', 'Eigenaar', 'Adviseur']} value={f.rol} onChange={(v) => set('rol', v)} /></FormRow>
            <FormRow label="Stad"><input style={fieldInputStyle} value={f.stad} onChange={(e) => set('stad', e.target.value)} placeholder="bijv. Amsterdam" /></FormRow>
            <FormRow label="Straat"><input style={fieldInputStyle} value={f.straat} onChange={(e) => set('straat', e.target.value)} placeholder="Straat en huisnummer" /></FormRow>
            <FormRow label="Postcode"><input style={fieldInputStyle} value={f.postcode} onChange={(e) => set('postcode', e.target.value)} placeholder="1234 AB" /></FormRow>
            <FormRow label="E-mail"><input style={fieldInputStyle} type="email" value={f.email} onChange={(e) => set('email', e.target.value)} placeholder="info@bedrijf.nl" /></FormRow>
            <FormRow label="Telefoon"><input style={fieldInputStyle} type="tel" value={f.tel} onChange={(e) => set('tel', e.target.value)} placeholder="+31 …" /></FormRow>
          </>
        }
        {kind === 'labels' &&
        <>
            <FormRow label="Naam label"><input style={fieldInputStyle} value={f.naam} onChange={(e) => set('naam', e.target.value)} placeholder="bijv. BREEAM-NL" /></FormRow>
            <FormRow label="Type"><SingleChips options={window.LABEL_TYPES} value={f.type} onChange={(v) => set('type', v)} /></FormRow>
            <FormRow label="Categorie"><input style={fieldInputStyle} value={f.categorie} onChange={(e) => set('categorie', e.target.value)} placeholder="bijv. Excellent, Outstanding, Gold" /></FormRow>
            <FormRow label="Erkenning"><SingleChips options={['Nationaal', 'Internationaal']} value={f.erkend} onChange={(v) => set('erkend', v)} /></FormRow>
            <FormRow label="Omschrijving"><input style={fieldInputStyle} value={f.oms} onChange={(e) => set('oms', e.target.value)} placeholder="Korte toelichting" /></FormRow>
          </>
        }
        {kind === 'awards' &&
        <>
            <FormRow label="Naam prijs"><input style={fieldInputStyle} value={f.naam} onChange={(e) => set('naam', e.target.value)} placeholder="bijv. Amsterdamse Architectuur Prijs" /></FormRow>
            <FormRow label="Categorie"><input style={fieldInputStyle} value={f.categorie} onChange={(e) => set('categorie', e.target.value)} placeholder="bijv. Architectuur, Interieur" /></FormRow>
            <FormRow label="Project"><input style={fieldInputStyle} value={f.project} onChange={(e) => set('project', e.target.value)} placeholder="Welk project won?" /></FormRow>
            <FormRow label="Positie"><SingleChips options={window.AWARD_POSITIES} value={f.positie} onChange={(v) => set('positie', v)} /></FormRow>
            <FormRow label="Erkenning"><SingleChips options={['Nationaal', 'Internationaal']} value={f.erkend} onChange={(v) => set('erkend', v)} /></FormRow>
            <FormRow label="Jaar"><input style={fieldInputStyle} type="number" value={f.jaar} onChange={(e) => set('jaar', e.target.value)} placeholder="2024" /></FormRow>
          </>
        }
      </div>
      <SheetSaveBar label={cfg.save} disabled={!valid}
      onClick={() => {
        if (!valid) return;
        const base = { ...f, naam: f.naam.trim() };
        if (kind === 'awards') base.jaar = parseInt(f.jaar, 10) || new Date().getFullYear();
        onSave(kind, base);
      }} />
    </div>);

}

// ────────────────────────────────────────────────────────────
// PROFIEL DETAIL SHEET — volledig blad: bedrijf / label / award
// met de gegevens én alle gekoppelde projecten
// ────────────────────────────────────────────────────────────
function ProfielDetailSheet({ kind, item, projects, onClose, onOpenProject }) {
  if (!item) return null;
  const linked =
    kind === 'company' ? window.projectsForCompany(item, projects) :
    kind === 'award' ? window.projectsForAward(item, projects) :
    window.projectsForLabel(item, projects);

  const accent =
    kind === 'company' ? window.companyColor(item) || SAGE :
    kind === 'label' ? window.LABEL_TYPE_COLORS[item.type] || SAGE :
    window.AWARD_POSITIE_COLORS[item.positie] || SAGE;

  const kindLabel = kind === 'company' ? 'BEDRIJF' : kind === 'label' ? 'LABEL' : 'AWARD';
  const subtitle =
    kind === 'company' ? item.rol :
    kind === 'label' ? `${item.type} · ${item.categorie}` :
    `${item.categorie} · ${item.jaar}`;

  const infoRows =
    kind === 'company' ? [
    ['ADRES', [item.straat, [item.postcode, item.stad].filter(Boolean).join('  ')].filter(Boolean).join(', ')],
    ['E-MAIL', item.email],
    ['TELEFOON', item.tel]] :
    kind === 'label' ? [
    ['TYPE', item.type],
    ['CATEGORIE', item.categorie],
    ['ERKENNING', item.erkend],
    ['OMSCHRIJVING', item.oms]] : [
    ['CATEGORIE', item.categorie],
    ['POSITIE', item.positie],
    ['ERKENNING', item.erkend],
    ['JAAR', String(item.jaar)]];

  const stats =
    kind === 'company' ? [
    [item.projecten != null ? item.projecten : linked.length, 'PROJECTEN'],
    [item.awards != null ? item.awards : 0, 'AWARDS'],
    [(item.labels || []).length, 'LABELS']] :
    kind === 'label' ? [
    [item.projecten != null ? item.projecten : linked.length, 'PROJECTEN'],
    [item.erkend, 'ERKENNING']] : [
    [item.positie, 'POSITIE'],
    [item.jaar, 'JAAR']];

  return (
    <div style={{
      position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 110,
      animation: 'fadeIn 0.2s ease'
    }} onClick={onClose}>
      <div onClick={(ev) => ev.stopPropagation()} style={{
        position: 'absolute', top: 24, left: 16, right: 16, bottom: 24,
        background: '#fff', borderRadius: 16, overflow: 'hidden',
        display: 'flex', flexDirection: 'column',
        animation: 'slideUp 0.3s cubic-bezier(0.2, 0.8, 0.2, 1) both',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
      }}>
        {/* Dark top */}
        <div style={{ background: TEXT_DARK, padding: '26px 24px 22px', position: 'relative', flexShrink: 0 }}>
          <button onClick={onClose} style={{
            all: 'unset', cursor: 'pointer', position: 'absolute', top: 12, right: 12, color: '#fff',
            width: 28, height: 28, borderRadius: 14, background: 'rgba(255,255,255,0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <svg width="14" height="14" viewBox="0 0 14 14"><path d="M3 3l8 8M11 3l-8 8" stroke="#fff" strokeWidth="1.6" fill="none" strokeLinecap="round" /></svg>
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <span style={{ width: 10, height: 10, borderRadius: 5, background: accent }} />
            <span style={{ fontFamily: 'Barlow, sans-serif', fontSize: 9, fontWeight: 700, letterSpacing: '0.18em', color: 'rgba(255,255,255,0.6)' }}>{kindLabel}</span>
          </div>
          <div style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 800, fontSize: 22, color: '#fff', letterSpacing: '-0.01em', lineHeight: 1.1 }}>{item.naam}</div>
          <div style={{ fontFamily: 'Barlow, sans-serif', fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,0.7)', marginTop: 5, letterSpacing: '0.10em', textTransform: 'uppercase' }}>{subtitle}</div>
        </div>

        <div style={{ flex: 1, overflow: 'auto', padding: '20px 22px 24px' }}>
          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${stats.length}, 1fr)`, gap: 8, marginBottom: 20 }}>
            {stats.map(([n, l]) =>
            <div key={l} style={{ background: '#F8F7F4', padding: '12px 8px', borderRadius: 8, textAlign: 'center' }}>
                <div style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 800, fontSize: 18, color: TEXT_DARK, letterSpacing: '-0.01em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{n}</div>
                <div style={{ fontFamily: 'Barlow, sans-serif', fontSize: 8, color: TEXT_MED, letterSpacing: '0.14em', marginTop: 3 }}>{l}</div>
              </div>
            )}
          </div>

          {/* Info */}
          <SectionTitle>{kind === 'company' ? 'BEDRIJFSINFORMATIE' : 'INFORMATIE'}</SectionTitle>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 22 }}>
            {infoRows.filter(([, v]) => v).map(([l, v]) =>
            <div key={l}>
                <div style={{ fontFamily: 'Barlow, sans-serif', fontSize: 9, fontWeight: 600, color: TEXT_MED, letterSpacing: '0.16em' }}>{l}</div>
                <div style={{ fontFamily: 'Barlow, sans-serif', fontSize: 13, fontWeight: 600, color: TEXT_DARK, marginTop: 3, letterSpacing: '0.01em', lineHeight: 1.4 }}>{v}</div>
              </div>
            )}
          </div>

          {/* Gekoppelde projecten */}
          <SectionTitle>GEKOPPELDE PROJECTEN · {linked.length}</SectionTitle>
          {linked.length === 0 ?
          <div style={{ fontFamily: 'Barlow, sans-serif', fontSize: 12, color: TEXT_MED, padding: '8px 0 4px' }}>Nog geen gekoppelde projecten.</div> :
          <div style={{ display: 'flex', flexDirection: 'column' }}>
              {linked.map((p) =>
            <button key={p.id} onClick={() => {onClose();onOpenProject(p.id);}} style={{
              all: 'unset', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12,
              padding: '11px 0', borderTop: `1px solid ${BORDER}`
            }}>
                  <Pin color={window.PIN_COLORS[window.projectColor(p)]} size={15} dot={false} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 700, fontSize: 12, color: TEXT_DARK, letterSpacing: '0.03em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</div>
                    <div style={{ fontFamily: 'Barlow, sans-serif', fontSize: 10, color: TEXT_MED, marginTop: 2, letterSpacing: '0.04em' }}>{(window.PIN_LABELS[window.projectColor(p)] || '').toUpperCase()}{p.stad ? ' · ' + p.stad : ''}</div>
                  </div>
                  <svg width="14" height="14" viewBox="0 0 16 16" style={{ flexShrink: 0 }}><path d="M6 3l5 5-5 5" stroke={TEXT_LIGHT} strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </button>
            )}
            </div>
          }
        </div>
      </div>
    </div>);

}

// ────────────────────────────────────────────────────────────
// EMPLOYEE SHEET — visitekaartje (mirrors profile.html)
// ────────────────────────────────────────────────────────────
function EmployeeSheet({ employee, onClose, onOpenProject }) {
  const e = employee;
  const [contactReq, setContactReq] = useState('idle'); // idle | sent
  // Projects this employee is "linked" to (deterministic pseudo-link)
  const linked = window.PROJECTS.filter((_, i) => i % window.EMPLOYEES.length === window.EMPLOYEES.findIndex((x) => x.id === e.id)).slice(0, 5);

  const fullName = e.naam;
  const display = e.nick || e.naam.split(' ')[0];
  const emailGuess = (e.naam.split(' ')[0] + '.' + e.naam.split(' ').slice(-1)[0]).toLowerCase().replace(/\s+/g, '') + '@mvsa-architects.com';

  return (
    <div style={{
      position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 110,
      animation: 'fadeIn 0.2s ease'
    }} onClick={onClose}>
      <div onClick={(ev) => ev.stopPropagation()} style={{
        position: 'absolute', top: 24, left: 16, right: 16, bottom: 24,
        background: '#fff', borderRadius: 16, overflow: 'hidden',
        display: 'flex', flexDirection: 'column',
        animation: 'slideUp 0.3s cubic-bezier(0.2, 0.8, 0.2, 1) both',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
      }}>
        {/* Dark top */}
        <div style={{
          background: TEXT_DARK, padding: '30px 24px 24px',
          display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
          position: 'relative', flexShrink: 0
        }}>
          <button onClick={onClose} style={{
            all: 'unset', cursor: 'pointer', position: 'absolute',
            top: 12, right: 12, color: '#fff',
            width: 28, height: 28, borderRadius: 14,
            background: 'rgba(255,255,255,0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <svg width="14" height="14" viewBox="0 0 14 14"><path d="M3 3l8 8M11 3l-8 8" stroke="#fff" strokeWidth="1.6" fill="none" strokeLinecap="round" /></svg>
          </button>
          <Avatar emp={e} size={80} style={{ border: '3px solid rgba(255,255,255,0.15)', marginBottom: 14 }} />
          {/* Publieke weergavenaam (nickname). Volledige naam is prive en
              alleen op aanvraag zichtbaar onder Contact. */}
          <div style={{
            fontFamily: 'Barlow, sans-serif', fontWeight: 800, fontSize: 22,
            color: '#fff', letterSpacing: '-0.01em'
          }}>{display}</div>
          <div style={{
            fontFamily: 'Barlow, sans-serif', fontSize: 11, fontWeight: 500,
            color: 'rgba(255,255,255,0.7)', marginTop: 4, letterSpacing: '0.12em',
            textTransform: 'uppercase'
          }}>{e.vakgebied || e.rol}</div>
          {/* Sector + relatie tot het forum — vervangt het team-label dat het
              vakgebied dubbelde. */}
          <div style={{ display: 'flex', gap: 6, marginTop: 12, justifyContent: 'center' }}>
            <span style={{
              padding: '4px 11px', borderRadius: 999, background: 'rgba(255,255,255,0.12)',
              fontFamily: 'Barlow, sans-serif', fontSize: 9, fontWeight: 700, whiteSpace: 'nowrap',
              color: 'rgba(255,255,255,0.9)', letterSpacing: '0.12em'
            }}>{(e.sector || 'Architectuur').toUpperCase()}</span>
            <span style={{
              padding: '4px 11px', borderRadius: 999, background: 'rgba(255,255,255,0.12)',
              fontFamily: 'Barlow, sans-serif', fontSize: 9, fontWeight: 700, whiteSpace: 'nowrap',
              color: 'rgba(255,255,255,0.9)', letterSpacing: '0.12em'
            }}>{(e.relatie || 'Medewerker').toUpperCase()}</span>
          </div>
          {/* ‘Laatst actief’ hoort niet bij contact — staat hier als activiteits-meta. */}
          <div style={{
            fontFamily: 'Barlow, sans-serif', fontSize: 10, fontWeight: 500,
            color: 'rgba(255,255,255,0.45)', marginTop: 14, letterSpacing: '0.1em'
          }}>LAATST ACTIEF · VANDAAG</div>
        </div>

        <div style={{ flex: 1, overflow: 'auto', padding: '20px 22px 24px' }}>
          {/* Stats — awards verwijderd; ‘velden’ toont hoeveel projectvelden
              iemand heeft ingevuld (waar de punten uit volgen). */}
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 8
          }}>
            {[
            { n: e.score, l: 'PUNTEN' },
            { n: e.projecten, l: 'PROJECTEN' },
            { n: e.velden, l: 'VELDEN' }].
            map((s) =>
            <div key={s.l} style={{
              background: '#F8F7F4', padding: '12px 8px', borderRadius: 8, textAlign: 'center'
            }}>
                <div style={{
                fontFamily: 'Barlow, sans-serif', fontWeight: 800, fontSize: 22,
                color: TEXT_DARK, letterSpacing: '-0.01em'
              }}>{s.n}</div>
                <div style={{
                fontFamily: 'Barlow, sans-serif', fontSize: 9, color: TEXT_MED,
                letterSpacing: '0.16em', marginTop: 2
              }}>{s.l}</div>
              </div>
            )}
          </div>
          <div style={{
            fontFamily: 'Barlow, sans-serif', fontSize: 10.5, color: TEXT_MED,
            lineHeight: 1.5, marginBottom: 22, letterSpacing: '0.02em'
          }}>Punten volgen uit ingevulde projectvelden — elk veld wordt per persoon bijgehouden.</div>

          {/* Demografie — alleen zichtbaar als de gebruiker dit deelt */}
          {e.toonDemografie &&
          <React.Fragment>
              <SectionTitle>PROFIEL</SectionTitle>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
                {[e.geslacht, e.leeftijd ? e.leeftijd + ' jaar' : null].filter(Boolean).map((v) =>
              <span key={v} style={{
                padding: '7px 14px', borderRadius: 999, background: '#F4F2EE',
                border: `1px solid ${BORDER}`,
                fontFamily: 'Barlow, sans-serif', fontSize: 12, fontWeight: 600,
                color: TEXT_DARK, letterSpacing: '0.02em'
              }}>{v}</span>
              )}
              </div>
            </React.Fragment>
          }

          {/* Contact — standaard afgeschermd, alleen zichtbaar op aanvraag */}
          <SectionTitle>CONTACT</SectionTitle>
          {e.toonContact ?
          <React.Fragment>
              <ContactRow icon="✉" label="E-MAIL" value={emailGuess} />
              <ContactRow icon="⌂" label="WOONPLAATS" value={e.woonplaats} />
            </React.Fragment> :
          contactReq === 'sent' ?
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10, padding: '14px 16px',
            background: '#EAF0EE', borderRadius: 10, marginBottom: 8,
            fontFamily: 'Barlow, sans-serif', fontSize: 12, color: SAGE_DARK,
            fontWeight: 600, lineHeight: 1.45, letterSpacing: '0.01em'
          }}>
              <span style={{ fontSize: 16 }}>✓</span>
              Verzoek verstuurd — je krijgt bericht zodra {display} de contactgegevens deelt.
            </div> :

          <div style={{
            padding: '16px', background: '#F8F7F4', borderRadius: 10, marginBottom: 8
          }}>
              <div style={{
              display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12,
              fontFamily: 'Barlow, sans-serif', fontSize: 12, color: TEXT_MED,
              lineHeight: 1.45, letterSpacing: '0.01em'
            }}>
                <span style={{ fontSize: 15, color: TEXT_LIGHT }}>◌</span>
                E-mail en woonplaats zijn afgeschermd en alleen op aanvraag zichtbaar.
              </div>
              <button onClick={() => setContactReq('sent')} style={{
              all: 'unset', cursor: 'pointer', display: 'block', textAlign: 'center',
              width: '100%', boxSizing: 'border-box', padding: '12px',
              borderRadius: 999, background: TEXT_DARK, color: '#fff',
              fontFamily: 'Barlow, sans-serif', fontWeight: 700, fontSize: 11, letterSpacing: '0.18em'
            }}>GEGEVENS OPVRAGEN</button>
            </div>
          }

          {/* Projects */}
          {linked.length > 0 &&
          <>
              <SectionTitle>PROJECTEN · {linked.length}</SectionTitle>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {linked.map((p) =>
              <button key={p.id} onClick={() => {onClose();onOpenProject(p.id);}} style={{
                all: 'unset', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '8px 0'
              }}>
                    <Pin color={window.PIN_COLORS[p.color]} size={14} dot={false} />
                    <div style={{
                  fontFamily: 'Barlow, sans-serif', fontWeight: 600, fontSize: 12,
                  color: TEXT_DARK, letterSpacing: '0.02em'
                }}>{p.name}</div>
                    <div style={{
                  fontFamily: 'Barlow, sans-serif', fontSize: 10, color: TEXT_MED,
                  marginLeft: 'auto', letterSpacing: '0.04em'
                }}>{p.stad}</div>
                  </button>
              )}
              </div>
            </>
          }
        </div>
      </div>
    </div>);

}
function ContactRow({ icon, label, value }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12
    }}>
      <div style={{
        width: 32, height: 32, borderRadius: 8, background: '#F8F7F4',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 16, color: SAGE_DARK
      }}>{icon}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontFamily: 'Barlow, sans-serif', fontSize: 9, fontWeight: 600,
          color: TEXT_MED, letterSpacing: '0.16em'
        }}>{label}</div>
        <div style={{
          fontFamily: 'Barlow, sans-serif', fontSize: 12, fontWeight: 600,
          color: TEXT_DARK, marginTop: 2, letterSpacing: '0.02em',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
        }}>{value}</div>
      </div>
    </div>);

}
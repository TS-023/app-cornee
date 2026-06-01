// Main app — projectoverzicht.nl mobile prototype
const { useState, useEffect } = React;
const { SAGE, TEXT_DARK, TEXT_MED, BORDER, GOLD } = window.POTHEME;

function App() {
  // Boot: show loading screen briefly
  const [booting, setBooting] = useState(true);
  const [loadingData, setLoadingData] = useState(false);

  // Top tab (Kaart / Lijst / Universe / Profielen)
  const [tab, setTab] = useState('KAART');

  // Bottom overlay (search/filters/favorieten/dashboard) – null means none
  const [overlay, setOverlay] = useState(null);

  // Project detail – holds project id or null
  const [openId, setOpenId] = useState(null);
  // Employee visitekaartje
  const [openEmp, setOpenEmp] = useState(null);
  // Profielblad (bedrijf / label / award) — { kind, item }
  const [profiel, setProfiel] = useState(null);
  // Form sheets: 'newProject' | 'newContact' | null
  const [sheet, setSheet] = useState(null);

  // Live data + auth
  const [projects, setProjects] = useState(() => [...(window.EXTRA_PROJECTS || []), ...window.PROJECTS]);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [showAuth, setShowAuth] = useState(false);
  const [dataSource, setDataSource] = useState('mock');

  // Persisted state
  const [favorites, setFavorites] = useState(() => {
    try { return new Set(JSON.parse(localStorage.getItem('pov-favs') || '[]')); }
    catch { return new Set(); }
  });
  const [activeFilters, setActiveFilters] = useState(() => {
    try { return new Set(JSON.parse(localStorage.getItem('pov-filters') || '[]')); }
    catch { return new Set(); }
  });
  // Multi-dimensional filters: status (kleur), type, functie, metrage (bvo), bouwhoogte
  const DEFAULT_FILTERS = { status: [], type: [], functie: [], prov: [], bvo: null, hoogte: null, jaar: null };
  const [filters, setFilters] = useState(() => {
    try { return { ...DEFAULT_FILTERS, ...JSON.parse(localStorage.getItem('pov-filters2') || '{}') }; }
    catch { return { ...DEFAULT_FILTERS }; }
  });
  const [density, setDensity] = useState(() => localStorage.getItem('pov-density') || 'grid');

  // Persist
  useEffect(() => { localStorage.setItem('pov-favs', JSON.stringify([...favorites])); }, [favorites]);
  useEffect(() => { localStorage.setItem('pov-filters', JSON.stringify([...activeFilters])); }, [activeFilters]);
  useEffect(() => { localStorage.setItem('pov-filters2', JSON.stringify(filters)); }, [filters]);
  useEffect(() => { localStorage.setItem('pov-density', density); }, [density]);

  // Load live data + bind auth state on mount
  useEffect(() => {
    let cancelled = false;
    setLoadingData(true);
    (async () => {
      const [{ projects: ps, source }] = await Promise.all([
        window.API.loadProjects(),
        window.API.loadEmployees(),
        window.API.loadContacts(),
      ]);
      if (cancelled) return;
      setProjects([...(window.EXTRA_PROJECTS || []), ...ps]);
      setDataSource(source);
      setLoadingData(false);
    })();
    window.API.getSession().then(session => {
      if (cancelled || !session) return;
      setUser(session.user);
      window.API.getProfile(session.user.id).then(p => !cancelled && setProfile(p));
    });
    const unsub = window.API.onAuthChange(session => {
      setUser(session?.user || null);
      if (session?.user) {
        window.API.getProfile(session.user.id).then(setProfile);
      } else {
        setProfile(null);
      }
    });
    return () => { cancelled = true; unsub(); };
  }, []);

  const onProjectUpdated = (id, patch) => {
    setProjects(prev => prev.map(p => p.id === id ? { ...p, ...patch, updatedAt: Date.now() } : p));
  };

  const signOut = async () => {
    await window.API.signOut();
    setUser(null); setProfile(null);
  };

  const openProject = (id) => { setOpenId(id); setOverlay(null); setOpenEmp(null); setProfiel(null); };
  const openEmployee = (emp) => { setOpenEmp(emp); };
  const openCompany = (c) => setProfiel({ kind: 'company', item: c });

  // Create a new project from the wizard payload and show it immediately
  const addProject = (vals) => {
    const mr = (p) => (p && (p[0] || p[1])) ? [p[0], p[1]].filter(Boolean).map(s => s.length === 7 ? s : s).join(' – ') : '';
    const now = Date.now();
    const v = vals || {};
    const t = v.team || {};
    const bv = v.bouwvolume || {}, pr = v.programma || {}, ren = v.renovatie || {};
    const colorKey = window.projectColor({ status: v.status, fase: v.fase, color: v.color });
    const proj = {
      id: 'new-' + now, slug: 'new-' + now, nr: String(24400 + projects.length),
      name: v.name, alt: v.alt || '',
      projecttype: v.type, type: v.type, categorie: v.categorie,
      functies: v.functies || [], functie: (v.functies && v.functies[0]) || v.functie || v.categorie,
      fase: v.fase, status: v.status, link: v.link || '', beschrijving: v.beschrijving || '',
      land: v.land || 'Nederland', prov: v.prov, stad: v.stad, straat: v.straat || '', nr_h: v.nr_h || '', postcode: v.postcode || '',
      lat: v.lat || '', lon: v.lon || '',
      team_eigenaar: t.eigenaar || '', team_ontwikkelaar: t.ontwikkelaar || '', team_architect: t.architect || '',
      team_landschap: t.landschap || '', team_projectmanager: t.projectmanager || '', team_aannemer: t.aannemer || '',
      team_constructeur: t.constructeur || '', team_installateur: t.installateur || '', team_bouwfysica: t.bouwfysica || '', team_overig: t.overig || '',
      opdr: v.opdr || t.ontwikkelaar || t.eigenaar || '', arch: v.arch || t.architect || '',
      t_verkenning: mr(v.verkenning), t_ontwerp: mr(v.ontwerp), t_realisatie: mr(v.realisatie),
      looptijd: (v.loopVan && v.loopTot) ? `${v.loopVan} – ${v.loopTot}` : '',
      oplev: v.loopTot ? `${v.loopTot}-12-01` : '',
      bv_bestaand: +bv.bestaand || 0, bv_sloop: +bv.sloop || 0, bv_renovatie: +bv.renovatie || 0, bv_nieuw: +bv.nieuw || 0,
      bvo: v.bvo || 0,
      pr_wonen: +pr.wonen || 0, pr_kantoor: +pr.kantoor || 0, pr_comm: +pr.commercieel || 0,
      pr_leisure: +pr.leisure || 0, pr_publiek: +pr.publiek || 0, pr_overig: +pr.overig || 0,
      units_wonen: v.units_wonen || 0, auto: v.auto || 0, fiets: v.fiets || 0,
      hoogte: v.hoogte || 0, lagen: v.lagen || 0,
      constr_type: v.constr_type || '', constr_mat: v.constr_mat || '',
      gevel_type: v.gevel_type || '', gevel_mat: v.gevel_mat || '',
      labels: v.labels || [], awards: v.awards || [],
      ren_architect: ren.architect || '', ren_jaar: ren.jaar || '', ren_functie: ren.functie || '',
      ren_samenwerking: ren.samenwerking || '', ren_metrage: +ren.metrage || 0,
      color: colorKey, x: 50, y: 50,
      img: window.photo ? window.photo(Math.floor(Math.random() * 900) + 10) : '',
      createdAt: now, updatedAt: now,
    };
    setProjects(prev => [proj, ...prev]);
    setSheet(null);
    // Land straight on the new project's detail so the just-entered
    // parameters are visible immediately — and so it can never be
    // "lost" behind an active list filter.
    setOpenId(proj.id);
  };

  // Create a new contact (mutates the shared CONTACTS list so search finds it)
  const addContact = (vals) => {
    window.CONTACTS = [{ id: 'c-' + Date.now(), tags: [], ...vals }, ...(window.CONTACTS || [])];
    setSheet(null);
  };
  // Context-aware add from the Profielen +-icoon (bedrijf / label / award)
  const addProfiel = (kind, vals) => {
    const id = kind.slice(0, 2) + '-' + Date.now();
    if (kind === 'labels') {
      window.LABELS = [{ id, projecten: 0, project: vals.project || '—', ...vals }, ...(window.LABELS || [])];
    } else if (kind === 'awards') {
      window.AWARDS = [{ id, ...vals }, ...(window.AWARDS || [])];
    } else {
      window.COMPANIES = [{ id, color: 'grey', logo: null, labels: [], awards: 0, projecten: 0, ...vals }, ...(window.COMPANIES || [])];
    }
    setSheet(null);
  };
  const toggleFav = (id) => {
    setFavorites(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };
  const toggleFilter = (c) => {
    setActiveFilters(prev => {
      const next = new Set(prev);
      next.has(c) ? next.delete(c) : next.add(c);
      return next;
    });
  };

  // Apply all active filter dimensions to a project list
  const applyFilters = (list) => list.filter(p => {
    if (filters.status.length && !filters.status.includes(p.color)) return false;
    if (filters.type.length && !filters.type.includes(p.type)) return false;
    if (filters.functie.length && !filters.functie.includes(p.functie)) return false;
    if (filters.prov && filters.prov.length && !filters.prov.includes(p.prov)) return false;
    if (filters.bvo && (p.bvo < filters.bvo[0] || p.bvo > filters.bvo[1])) return false;
    if (filters.hoogte && (p.hoogte < filters.hoogte[0] || p.hoogte > filters.hoogte[1])) return false;
    if (filters.jaar) { const y = +String(p.oplev || '').slice(0, 4); if (y < filters.jaar[0] || y > filters.jaar[1]) return false; }
    return true;
  });
  const filterCount = filters.status.length + filters.type.length + filters.functie.length +
    (filters.prov ? filters.prov.length : 0) +
    (filters.bvo ? 1 : 0) + (filters.hoogte ? 1 : 0) + (filters.jaar ? 1 : 0);
  const visibleProjects = applyFilters(projects);

  const project = openId ? projects.find(p => p.id === openId) : null;

  if (booting) {
    return (
      <PhoneFrame>
        <LoadingScreen onDone={() => setBooting(false)} />
      </PhoneFrame>
    );
  }

  // Detail screen replaces the whole interior
  if (project) {
    return (
      <PhoneFrame>
        <Header
          rightAction={null}
          onLogo={() => { setOpenId(null); setTab('KAART'); }}
          user={user} onSignIn={() => setShowAuth(true)} onSignOut={signOut}
          dataSource={dataSource}
        />
        <DetailScreen
          project={project}
          isFavorite={favorites.has(project.id)}
          onToggleFavorite={() => toggleFav(project.id)}
          onBack={() => setOpenId(null)}
          user={user}
          onRequestLogin={() => setShowAuth(true)}
          onProjectUpdated={onProjectUpdated}
        />
        {showAuth && (
          <AuthSheet onClose={() => setShowAuth(false)} onSignedIn={(u) => { setUser(u); setShowAuth(false); }} />
        )}
      </PhoneFrame>
    );
  }

  // Main app
  const tabs = ['KAART', 'LIJST', 'UNIVERSE', 'PROFIELEN'];
  const bottomItems = ['ZOEKEN', 'FILTERS', 'FAVORIETEN', 'DASHBOARD'];

  return (
    <PhoneFrame>
      <Header
        onLogo={() => { setTab('KAART'); setOverlay(null); }}
        user={user} onSignIn={() => setShowAuth(true)} onSignOut={signOut}
        dataSource={dataSource}
      />
      {loadingData && (
        <div style={{
          height: 2, background: 'rgba(232,169,59,0.2)',
          flexShrink: 0, overflow: 'hidden',
        }}>
          <div style={{
            height: '100%', width: '40%', background: GOLD,
            animation: 'shimmer 1.4s ease-in-out infinite',
          }} />
        </div>
      )}
      <TabBar tabs={tabs} active={tab} onChange={(t) => { setTab(t); setOverlay(null); }} />

      {tab === 'KAART' && (
        <MapScreen
          projects={visibleProjects}
          onOpenProject={openProject}
          favorites={favorites}
          onToggleFavorite={toggleFav}
          onAddProject={() => setSheet('newProject')}
        />
      )}
      {tab === 'LIJST' && (
        <ListScreen
          projects={visibleProjects}
          onOpenProject={openProject}
          density={density}
          onDensityChange={setDensity}
          favorites={favorites}
          onToggleFavorite={toggleFav}
          onAddProject={() => setSheet('newProject')}
        />
      )}
      {tab === 'UNIVERSE' && (
        <UniverseScreen projects={projects} onOpenProject={openProject} onOpenCompany={openCompany} />
      )}
      {tab === 'PROFIELEN' && (
        <ProfielenScreen
          onOpenCompany={(c) => setProfiel({ kind: 'company', item: c })}
          onOpenLabel={(l) => setProfiel({ kind: 'label', item: l })}
          onOpenAward={(a) => setProfiel({ kind: 'award', item: a })}
          user={user} profile={profile} onRequestLogin={() => setShowAuth(true)} onSignOut={signOut}
          onAdd={(kind) => setSheet('add:' + kind)} />
      )}

      <BottomBar items={bottomItems} active={overlay && overlay.toUpperCase()} onTap={(it) => {
        const key = it.toLowerCase();
        setOverlay(overlay === key ? null : key);
      }} />

      {overlay === 'zoeken' && (
        <SearchOverlay
          projects={projects}
          onClose={() => setOverlay(null)}
          onOpenProject={openProject}
          onOpenEmployee={openEmployee}
        />
      )}
      {overlay === 'filters' && (
        <FiltersSheet
          filters={filters}
          setFilters={setFilters}
          defaults={DEFAULT_FILTERS}
          allProjects={projects}
          resultCount={visibleProjects.length}
          onClose={() => setOverlay(null)}
        />
      )}
      {overlay === 'favorieten' && (
        <FavorietenSheet
          favorites={favorites}
          projects={projects}
          onClose={() => setOverlay(null)}
          onOpenProject={openProject}
        />
      )}
      {overlay === 'dashboard' && (
        <DashboardSheet
          projects={projects}
          favorites={favorites}
          onToggleFavorite={toggleFav}
          onClose={() => setOverlay(null)}
          onOpenProject={openProject}
          onOpenEmployee={openEmployee}
        />
      )}
      {openEmp && (
        <EmployeeSheet
          employee={openEmp}
          onClose={() => setOpenEmp(null)}
          onOpenProject={openProject}
        />
      )}
      {profiel && (
        <ProfielDetailSheet
          kind={profiel.kind}
          item={profiel.item}
          projects={projects}
          onClose={() => setProfiel(null)}
          onOpenProject={openProject}
        />
      )}
      {sheet === 'newProject' && (
        <NewProjectSheet onClose={() => setSheet(null)} onSave={addProject} />
      )}
      {sheet === 'newContact' && (
        <NewContactSheet onClose={() => setSheet(null)} onSave={addContact} />
      )}
      {sheet && sheet.startsWith('add:') && (
        <AddProfielSheet kind={sheet.slice(4)} onClose={() => setSheet(null)} onSave={addProfiel} />
      )}
      {showAuth && (
        <AuthSheet onClose={() => setShowAuth(false)} onSignedIn={(u) => { setUser(u); setShowAuth(false); }} />
      )}
    </PhoneFrame>
  );
}

// ─── Phone frame (custom, no iOS chrome) ───────────────────
function PhoneFrame({ children }) {
  return (
    <div style={{
      width: 390, height: 844, borderRadius: 44,
      background: '#fff',
      overflow: 'hidden', position: 'relative',
      boxShadow: '0 50px 120px rgba(0,0,0,0.22), 0 0 0 1.5px rgba(0,0,0,0.10), inset 0 0 0 8px #1a1a1c',
      display: 'flex', flexDirection: 'column',
    }}>
      <div style={{
        width: '100%', height: '100%', borderRadius: 36,
        overflow: 'hidden', display: 'flex', flexDirection: 'column',
        background: '#fff',
      }}>{children}</div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);

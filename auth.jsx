// Auth sheet — login/signup overlay
const { useState: aUseState } = React;

function AuthSheet({ onClose, onSignedIn }) {
  const { SAGE, TEXT_DARK, TEXT_MED, TEXT_LIGHT, BORDER, GOLD } = window.POTHEME;
  const [mode, setMode] = aUseState('signin'); // signin | signup
  const [email, setEmail] = aUseState('');
  const [password, setPassword] = aUseState('');
  const [voornaam, setVoornaam] = aUseState('');
  const [achternaam, setAchternaam] = aUseState('');
  const [nick, setNick] = aUseState('');
  const [vakgebied, setVakgebied] = aUseState('');
  const [sector, setSector] = aUseState('');
  const [geslacht, setGeslacht] = aUseState('');
  const [leeftijd, setLeeftijd] = aUseState('');
  const [toonDemo, setToonDemo] = aUseState(false);
  const [busy, setBusy] = aUseState(false);
  const [err, setErr] = aUseState(null);

  const submit = async (e) => {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    try {
      const user = mode === 'signin'
        ? await window.API.signIn(email, password)
        : await window.API.signUp(email, password, `${voornaam} ${achternaam}`.trim(), {
            voornaam, achternaam, nick, vakgebied, sector,
            geslacht: toonDemo ? geslacht : '', leeftijd: toonDemo ? leeftijd : '',
            toonDemografie: toonDemo,
          });
      onSignedIn(user);
    } catch (e2) {
      setErr(e2.message || 'Er ging iets mis.');
    }
    setBusy(false);
  };

  return (
    <div style={{
      position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 120,
      animation: 'fadeIn 0.2s ease',
      display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        background: '#fff', borderTopLeftRadius: 22, borderTopRightRadius: 22,
        padding: '20px 24px 30px', maxHeight: '92vh', overflowY: 'auto',
        animation: 'slideUp 0.3s cubic-bezier(0.2, 0.8, 0.2, 1) both',
      }}>
        <div style={{ width: 40, height: 4, borderRadius: 2, background: BORDER, margin: '0 auto 18px' }} />
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6,
        }}>
          <AppLogo size={32} bg={SAGE} fg="#fff" />
          <div style={{
            fontFamily: 'Barlow, sans-serif', fontWeight: 700, fontSize: 18,
            color: TEXT_DARK, letterSpacing: '-0.01em',
          }}>{mode === 'signin' ? 'Inloggen' : 'Account aanmaken'}</div>
        </div>
        <div style={{
          fontFamily: 'Barlow, sans-serif', fontSize: 11, color: TEXT_MED,
          letterSpacing: '0.06em', marginBottom: 22, lineHeight: 1.5,
        }}>{mode === 'signin'
          ? 'Log in om projecten te bewerken en favorieten te synchroniseren.'
          : 'Maak een account aan om bij te dragen. Na goedkeuring kun je projecten bewerken.'}</div>

        <form onSubmit={submit}>
          {mode === 'signup' && (
            <React.Fragment>
              <Field label="VOORNAAM" value={voornaam} onChange={setVoornaam} type="text" placeholder="Voornaam (privé — alleen op aanvraag)" />
              <Field label="ACHTERNAAM" value={achternaam} onChange={setAchternaam} type="text" placeholder="Achternaam (privé — alleen op aanvraag)" />
              <Field label="WEERGAVENAAM" value={nick} onChange={setNick} type="text" placeholder="Publiek getoonde naam, bijv. een voornaam of bijnaam" />
              <Select label="VAKGEBIED" value={vakgebied} onChange={setVakgebied} options={window.VAKGEBIEDEN || []} placeholder="— Kies je vakgebied —" />
              <Select label="SECTOR" value={sector} onChange={setSector} options={window.SECTOREN || []} placeholder="— Kies je sector —" />
              <DemoBlock
                geslacht={geslacht} setGeslacht={setGeslacht}
                leeftijd={leeftijd} setLeeftijd={setLeeftijd}
                toon={toonDemo} setToon={setToonDemo}
              />
            </React.Fragment>
          )}
          <Field label="E-MAIL" value={email} onChange={setEmail} type="email" placeholder="naam@mvsa-architects.com" autoFocus={mode === 'signin'} />
          <Field label="WACHTWOORD" value={password} onChange={setPassword} type="password" placeholder="••••••••" />

          {err && (
            <div style={{
              padding: '10px 14px', borderRadius: 6, background: '#FFF0F0',
              color: '#B14545', fontSize: 12, fontFamily: 'Barlow, sans-serif',
              letterSpacing: '0.02em', marginBottom: 14, marginTop: 4,
            }}>{err}</div>
          )}

          <button type="submit" disabled={busy} style={{
            all: 'unset', cursor: busy ? 'wait' : 'pointer',
            display: 'block', width: '100%', boxSizing: 'border-box',
            padding: '14px', borderRadius: 999,
            background: TEXT_DARK, color: '#fff',
            fontFamily: 'Barlow, sans-serif', fontWeight: 700, fontSize: 12,
            letterSpacing: '0.18em', textAlign: 'center',
            opacity: busy ? 0.6 : 1, marginTop: 8,
          }}>{busy ? 'BEZIG…' : (mode === 'signin' ? 'INLOGGEN' : 'ACCOUNT AANMAKEN')}</button>

          <div style={{ textAlign: 'center', marginTop: 18 }}>
            <button type="button" onClick={() => { setErr(null); setMode(mode === 'signin' ? 'signup' : 'signin'); }} style={{
              all: 'unset', cursor: 'pointer',
              fontFamily: 'Barlow, sans-serif', fontSize: 11,
              color: window.POTHEME.SAGE_DARK, letterSpacing: '0.10em',
            }}>{mode === 'signin' ? 'Nog geen account? Registreer ›' : 'Al een account? Inloggen ›'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, type='text', placeholder, autoFocus }) {
  const { TEXT_DARK, TEXT_MED, BORDER, SAGE } = window.POTHEME;
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{
        fontFamily: 'Barlow, sans-serif', fontSize: 10, fontWeight: 600,
        letterSpacing: '0.18em', color: TEXT_MED, marginBottom: 6,
      }}>{label}</div>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        style={{
          width: '100%', boxSizing: 'border-box',
          padding: '12px 14px', borderRadius: 6,
          border: `1px solid ${BORDER}`,
          fontFamily: 'Barlow, sans-serif', fontSize: 14,
          color: TEXT_DARK, outline: 'none',
          transition: 'border-color 0.15s ease',
        }}
        onFocus={e => e.target.style.borderColor = SAGE}
        onBlur={e => e.target.style.borderColor = BORDER}
      />
    </div>
  );
}

function Select({ label, value, onChange, options, placeholder }) {
  const { TEXT_DARK, TEXT_MED, BORDER, SAGE } = window.POTHEME;
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{
        fontFamily: 'Barlow, sans-serif', fontSize: 10, fontWeight: 600,
        letterSpacing: '0.18em', color: TEXT_MED, marginBottom: 6,
      }}>{label}</div>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{
          width: '100%', boxSizing: 'border-box',
          padding: '12px 14px', borderRadius: 6,
          border: `1px solid ${BORDER}`, background: '#fff',
          fontFamily: 'Barlow, sans-serif', fontSize: 14,
          color: value ? TEXT_DARK : TEXT_MED, outline: 'none', WebkitAppearance: 'none', appearance: 'none',
        }}
        onFocus={e => e.target.style.borderColor = SAGE}
        onBlur={e => e.target.style.borderColor = BORDER}
      >
        <option value="">{placeholder}</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

// Optionele demografie + privacy-toggle (geslacht & leeftijd tonen op profiel).
function DemoBlock({ geslacht, setGeslacht, leeftijd, setLeeftijd, toon, setToon }) {
  const { TEXT_DARK, TEXT_MED, TEXT_LIGHT, BORDER, SAGE } = window.POTHEME;
  return (
    <div style={{
      marginBottom: 14, padding: '14px 16px', background: '#F8F7F4',
      borderRadius: 10, border: `1px solid ${BORDER}`,
    }}>
      <div style={{
        fontFamily: 'Barlow, sans-serif', fontSize: 10, fontWeight: 600,
        letterSpacing: '0.18em', color: TEXT_MED, marginBottom: 4,
      }}>DEMOGRAFIE · OPTIONEEL</div>
      <div style={{
        fontFamily: 'Barlow, sans-serif', fontSize: 11, color: TEXT_LIGHT,
        lineHeight: 1.4, marginBottom: 12,
      }}>Vul in voor de community-statistieken. Jij bepaalt of het op je profiel zichtbaar is.</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 10 }}>
        <select value={geslacht} onChange={e => setGeslacht(e.target.value)} style={{
          boxSizing: 'border-box', padding: '11px 12px', borderRadius: 6,
          border: `1px solid ${BORDER}`, background: '#fff',
          fontFamily: 'Barlow, sans-serif', fontSize: 13,
          color: geslacht ? TEXT_DARK : TEXT_MED, outline: 'none', WebkitAppearance: 'none', appearance: 'none',
        }}>
          <option value="">Geslacht</option>
          <option>Vrouw</option><option>Man</option><option>Anders</option><option>Zeg ik liever niet</option>
        </select>
        <input type="number" inputMode="numeric" value={leeftijd} placeholder="Leeftijd"
          onChange={e => setLeeftijd(e.target.value)} style={{
          boxSizing: 'border-box', padding: '11px 12px', borderRadius: 6,
          border: `1px solid ${BORDER}`, background: '#fff',
          fontFamily: 'Barlow, sans-serif', fontSize: 13, color: TEXT_DARK, outline: 'none',
        }} />
      </div>
      <label style={{
        display: 'flex', alignItems: 'center', gap: 10, marginTop: 12, cursor: 'pointer',
      }} onClick={() => setToon(!toon)}>
        <span style={{
          width: 38, height: 22, borderRadius: 999, flexShrink: 0, position: 'relative',
          background: toon ? SAGE : '#D9D6CF', transition: 'background 0.18s ease',
        }}>
          <span style={{
            position: 'absolute', top: 2, left: toon ? 18 : 2, width: 18, height: 18,
            borderRadius: 999, background: '#fff', transition: 'left 0.18s ease',
            boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
          }} />
        </span>
        <span style={{
          fontFamily: 'Barlow, sans-serif', fontSize: 12, fontWeight: 600, color: TEXT_DARK,
        }}>Tonen op mijn profiel</span>
      </label>
    </div>
  );
}

Object.assign(window, { AuthSheet });

// Shared UI components for projectoverzicht.nl mobile app
const { useState, useEffect, useRef } = React;

// Drag-to-scroll for horizontal chip/tab rows: attach the returned ref to a
// scroll container so it can be swiped with mouse-drag (desktop) as well as
// touch. Returns a ref to spread onto the row element.
function useDragScroll() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let down = false, moved = false, startX = 0, startLeft = 0;
    const onDown = (e) => { down = true; moved = false; startX = e.pageX; startLeft = el.scrollLeft; };
    const onMove = (e) => {
      if (!down) return;
      const dx = e.pageX - startX;
      if (Math.abs(dx) > 3) { moved = true; el.style.cursor = 'grabbing'; }
      el.scrollLeft = startLeft - dx;
    };
    const onUp = () => { down = false; el.style.cursor = ''; };
    // Swallow the click that follows a drag so chips don't fire on release.
    const onClickCapture = (e) => { if (moved) { e.stopPropagation(); e.preventDefault(); moved = false; } };
    el.addEventListener('mousedown', onDown);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    el.addEventListener('click', onClickCapture, true);
    return () => {
      el.removeEventListener('mousedown', onDown);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      el.removeEventListener('click', onClickCapture, true);
    };
  }, []);
  return ref;
}

const SAGE = '#9DB5B5';
const SAGE_DARK = '#7B9696';
const TEXT_DARK = '#4A4A4A';
const TEXT_MED = '#6E6E6E';
const TEXT_LIGHT = '#B7BCC0';
const BORDER = '#E5E5E5';
const GOLD = '#E8A93B';

// Layout rhythm — proportions from the maatvoering reference (ref frame 400×860).
// rand 20/400 = 5% side gutter · witbalk 10 = white separators · 30 = functional bars · 50 = top/bottom safe margins.
const LAYOUT = {
  gutter: 20,   // rand (side margin)
  witbalk: 10,  // white separator between bands
  bar: 30,      // functionaliteiten / subtab band height
  marge: 48,    // top / bottom safe margin
};

window.POTHEME = { SAGE, SAGE_DARK, TEXT_DARK, TEXT_MED, TEXT_LIGHT, BORDER, GOLD, LAYOUT };

// White separator band (witbalk: 10/860)
function Witbalk() {
  return <div style={{ height: LAYOUT.witbalk, background: '#fff', flexShrink: 0 }} />;
}

// ─── Pin icon ───────────────────────────────────────────
function Pin({ color = '#E54B4B', size = 28, dot = true, style = {} }) {
  return (
    <svg width={size} height={size * 1.3} viewBox="0 0 28 36" style={style}>
      <path d="M14 0C6.27 0 0 6.27 0 14c0 10.5 14 22 14 22s14-11.5 14-22C28 6.27 21.73 0 14 0z" fill={color} />
      {dot && <circle cx="14" cy="13.5" r="4.5" fill="#fff" />}
    </svg>
  );
}

// ─── App logo (white square with sage pin) ───────────────
function AppLogo({ size = 34, bg = '#fff', fg = SAGE }) {
  return (
    <div style={{
      width: size, height: size, background: bg, borderRadius: 4,
      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
    }}>
      <svg width={size * 0.55} height={size * 0.7} viewBox="0 0 22 28">
        <path d="M11 0C4.92 0 0 4.92 0 11c0 8.25 11 17 11 17s11-8.75 11-17C22 4.92 17.08 0 11 0z" fill={fg} />
        <circle cx="11" cy="10.5" r="3.5" fill="#fff" />
      </svg>
    </div>
  );
}

// ─── Top header (sage bar with logo + sign-in) ───────────
function Header({ onLogo, user, onSignIn, dataSource }) {
  return (
    <div style={{ background: SAGE, color: '#fff', flexShrink: 0 }}>
      {/* Brand row — top marge 50/860 (~49px) above the bovenbalk */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 14,
        padding: '50px 14px 12px 20px',
      }}>
        <button onClick={onLogo} style={{
          all: 'unset', cursor: onLogo ? 'pointer' : 'default',
        }}>
          <AppLogo size={36} />
        </button>
        <div style={{
          fontFamily: 'Barlow, sans-serif', fontWeight: 600, fontSize: 14,
          letterSpacing: '0.06em', flex: 1,
        }}>PROJECTENOVERZICHT.NL</div>
        {user ? (
          <div style={{
            width: 32, height: 32, borderRadius: 16,
            background: 'rgba(255,255,255,0.18)',
            color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'Barlow, sans-serif', fontWeight: 700, fontSize: 11,
            letterSpacing: '0.02em',
          }} title={user.email}>
            {(user.email || '').slice(0,2).toUpperCase()}
          </div>
        ) : (
          <button onClick={onSignIn} title="Inloggen" style={{
            all: 'unset', cursor: 'pointer',
            width: 40, height: 40, borderRadius: 20,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(255,255,255,0.15)', color: '#fff', flexShrink: 0,
          }}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <circle cx="9" cy="6.4" r="3" stroke="currentColor" strokeWidth="1.6" />
              <path d="M2.8 15.4c0.8-3 3.2-4.6 6.2-4.6s5.4 1.6 6.2 4.6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Tab bar (KAART / LIJST / UNIVERSE / PROFIELEN) ──────
function TabBar({ tabs, active, onChange }) {
  return (
    <div style={{
      display: 'flex', background: '#F0EFEC', flexShrink: 0,
      paddingTop: 7,
    }}>
      {tabs.map(t => {
        const on = t === active;
        return (
          <button key={t} onClick={() => onChange(t)} style={{
            all: 'unset', cursor: 'pointer', flex: 1,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            height: 44, boxSizing: 'border-box',
            fontFamily: 'Barlow, sans-serif', fontWeight: on ? 600 : 500,
            fontSize: 13, letterSpacing: '0.14em',
            color: on ? TEXT_DARK : TEXT_LIGHT,
            background: on ? '#fff' : 'transparent',
            borderBottom: on ? `2px solid ${TEXT_DARK}` : '2px solid transparent',
          }}>{t}</button>
        );
      })}
    </div>
  );
}

// ─── Bottom action bar (ZOEKEN / FILTERS / FAVORIETEN / DASHBOARD)
function BottomBar({ items, active, onTap }) {
  return (
    <div style={{
      display: 'flex', background: '#fff', flexShrink: 0,
      borderTop: `1px solid ${BORDER}`,
      paddingBottom: LAYOUT.marge,
    }}>
      {items.map(it => (
        <button key={it} onClick={() => onTap(it)} style={{
          all: 'unset', cursor: 'pointer', flex: 1, textAlign: 'center',
          padding: '15px 0 13px',
          fontFamily: 'Barlow, sans-serif', fontWeight: active === it ? 600 : 500,
          fontSize: 12, letterSpacing: '0.16em',
          color: active === it ? TEXT_DARK : TEXT_MED,
        }}>{it}</button>
      ))}
    </div>
  );
}

// ─── Project card (used in detail preview & list views) ──
function ProjectCard({ project, compact = false, onClick, isFavorite, onToggleFavorite }) {
  const fmtBvo = (n) => n ? `${n.toLocaleString('nl-NL')} M²` : '—';
  const dash = (v) => (v || '—');
  const barColor = window.PIN_COLORS[window.projectColor(project)] || GOLD;
  return (
    <button onClick={onClick} data-comment-anchor="project-card" style={{
      all: 'unset', cursor: 'pointer', display: 'block',
      background: '#fff', width: '100%', boxSizing: 'border-box',
      padding: 0, overflow: 'hidden', position: 'relative',
      boxShadow: '0 2px 5px rgba(0,0,0,0.07), 0 10px 26px rgba(0,0,0,0.07)',
    }}>
      {/* Image with title overlay */}
      <div style={{
        position: 'relative', width: '100%',
        aspectRatio: compact ? '16 / 9' : '16 / 8.5',
        backgroundImage: `url(${project.img})`,
        backgroundSize: 'cover', backgroundPosition: 'center',
      }}>
        <div style={{
          position: 'absolute', left: 0, right: 0, bottom: 0,
          padding: compact ? '34px 14px 11px' : '46px 24px 18px',
          background: 'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.5) 100%)',
          color: '#fff',
          fontFamily: 'Barlow, sans-serif', fontWeight: 800,
          fontSize: compact ? Math.max(11, Math.min(20, Math.floor(200 / Math.max(project.name.length, 6)))) : (project.name.length > 14 ? 30 : 38),
          letterSpacing: compact ? '0' : '0.01em',
          lineHeight: 1.05,
          textTransform: 'uppercase',
          wordBreak: compact ? 'normal' : 'break-word',
          whiteSpace: compact ? 'nowrap' : 'normal',
          overflow: compact ? 'hidden' : 'visible',
          textOverflow: 'ellipsis',
        }}>{project.name}</div>
        {onToggleFavorite && (
          <span role="button" onClick={(e) => { e.stopPropagation(); onToggleFavorite(); }} title="Favoriet" style={{
            position: 'absolute', top: 10, right: 10, cursor: 'pointer',
            width: 34, height: 34, borderRadius: 17,
            background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(2px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24"
              fill={isFavorite ? '#fff' : 'none'} stroke="#fff" strokeWidth="2" strokeLinejoin="round">
              <path d="M12 21s-7.5-4.7-10-9.2C.4 8.6 2 5 5.4 5 7.5 5 9 6.3 12 9c3-2.7 4.5-4 6.6-4C22 5 23.6 8.6 22 11.8 19.5 16.3 12 21 12 21z" />
            </svg>
          </span>
        )}
      </div>
      {/* Status-coloured bar */}
      <div style={{ height: compact ? 7 : 9, background: barColor }} />

      {compact ? (
        /* Small / grid card — single row: functie left, metrage right */
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          gap: 8, padding: '14px 14px',
          fontFamily: 'Barlow, sans-serif', fontWeight: 500,
          fontSize: 12, letterSpacing: '0.06em', color: TEXT_MED,
          textTransform: 'uppercase',
        }}>
          <span style={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{dash(project.functie)}</span>
          <span style={{ flexShrink: 0 }}>{fmtBvo(project.bvo)}</span>
        </div>
      ) : (
        /* Large / list card — compact: only the filled values, no labels.
           Two tight rows: developer + metrage, architect + functie. */
        <div style={{
          display: 'flex', flexDirection: 'column', gap: 7,
          padding: '13px 24px 15px',
          fontFamily: 'Barlow, sans-serif', textTransform: 'uppercase',
        }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 14 }}>
            <span style={{
              fontSize: 16, fontWeight: 700, letterSpacing: '0.02em', color: TEXT_DARK,
              minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>{dash(project.opdr)}</span>
            <span style={{
              flexShrink: 0, fontSize: 13, fontWeight: 600, letterSpacing: '0.06em', color: TEXT_MED,
            }}>{fmtBvo(project.bvo)}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 14 }}>
            <span style={{
              fontSize: 13, fontWeight: 600, letterSpacing: '0.04em', color: TEXT_MED,
              minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>{dash(project.arch)}</span>
            <span style={{
              flexShrink: 0, fontSize: 13, fontWeight: 600, letterSpacing: '0.06em', color: TEXT_MED,
            }}>{dash(project.functie)}</span>
          </div>
        </div>
      )}
    </button>
  );
}

// Label / value pair for the large project card.
// NB: named CardField (not Field) to avoid colliding with auth.jsx's input Field,
// which is loaded later and would otherwise override this one (boxed inputs bug).
function CardField({ label, value }) {
  return (
    <div style={{ minWidth: 0 }}>
      <div style={{
        fontSize: 13, fontWeight: 600, letterSpacing: '0.14em',
        color: TEXT_MED, textTransform: 'uppercase',
      }}>{label}</div>
      <div style={{
        fontSize: 14, fontWeight: 600, letterSpacing: '0.02em',
        color: TEXT_DARK, lineHeight: 1.25, marginTop: 6, textTransform: 'uppercase',
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
      }}>{value}</div>
    </div>
  );
}

Object.assign(window, { Pin, AppLogo, Header, TabBar, BottomBar, ProjectCard, Witbalk, useDragScroll });

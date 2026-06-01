# Projectenoverzicht.nl — mobiele app (prototype)

Een mobiel-first prototype waarin bouw- en vastgoedprojecten in heel Nederland
worden ontsloten: op de kaart, in een lijst, als netwerk van bedrijven, en met
publieke profielen, een ranglijst (leaderboard) en een data-dashboard.

> Publieke app — bedoeld voor iedereen die projecten wil bekijken en aanvullen,
> niet als interne tool van één organisatie.

---

## ✨ Functionaliteit

- **Kaart** — alle projecten als pins, verspreid over heel Nederland.
- **Lijst** — schakelbaar tussen grote kaarten en een compact grid.
- **Universe** — interactief netwerk van projecten ↔ bedrijven.
  1× tikken op een knooppunt toont de verbindingen, nogmaals tikken opent het profiel.
- **Profielen** — bedrijven, labels en awards, elk met een volledig profielblad
  inclusief alle gekoppelde projecten.
- **Projectdetail** — alle projectvelden per tabblad, met inline bewerken
  (vereist login) en een volledigheidsmeter.
- **Dashboard** — leaderboard (met eigen positie t/m plek 10), invulstatus en
  data-overzichten (ook gefilterd op favorieten).
- **Nieuw project / contact / bedrijf** — meerstaps invoerwizard.
- **Login / registratie** via Supabase Auth (optioneel).

---

## 🧱 Techniek

- **React 18** met **JSX**, in de browser getranspileerd door **Babel Standalone** —
  er is **geen build-stap** nodig.
- **Leaflet** voor de kaart (CARTO-tiles).
- **Supabase** als optionele databron; valt automatisch terug op mock-data
  wanneer de database niet bereikbaar is.
- **Barlow** (Google Fonts) als huisstijl-font.

Alle externe libraries worden via een CDN geladen, dus er zijn geen
`node_modules` of dependencies om te installeren.

---

## 📁 Mappenstructuur

```
projectenoverzicht-app/
├── index.html              # Entry point — laadt alle scripts in de juiste volgorde
├── README.md
├── .gitignore
└── src/
    ├── app.jsx             # Root-component: state, navigatie, sheets
    ├── core/
    │   ├── data.js         # Mock-seed data + helpers (PROJECTS, COMPANIES,
    │   │                    #   LABELS, AWARDS, kleuren, koppelingen…)
    │   └── db.js           # Supabase API-laag + mock-fallback
    ├── components/
    │   └── components.jsx   # Gedeelde UI (Header, TabBar, BottomBar,
    │                        #   ProjectCard, Pin, AppLogo…)
    ├── screens/
    │   ├── screens.jsx      # Kaart, Lijst, Universe, Profielen, Detail,
    │   │                    #   Dashboard, Leaderboard, profielbladen, zoeken…
    │   └── new-project.jsx  # Meerstaps "nieuw project"-wizard
    └── auth/
        └── auth.jsx         # Login- / registratie-sheet
```

> De `.jsx`-bestanden delen onderling code via het globale `window`-object
> (elk bestand registreert zijn componenten aan het einde met `Object.assign(window, …)`).
> Daarom is de **laadvolgorde** in `index.html` belangrijk:
> `data → db → components → screens → new-project → auth → app`.

---

## ▶️ Lokaal draaien

Omdat Babel de `.jsx`-bestanden via `fetch` inlaadt, werkt het **niet** door
`index.html` rechtstreeks via `file://` te openen. Start een eenvoudige
statische webserver vanuit de projectmap:

```bash
# Python 3
python3 -m http.server 8000

# of met Node
npx serve .
```

Open daarna **http://localhost:8000** in de browser.
(In VS Code kan ook de "Live Server"-extensie gebruikt worden.)

---

## 🚀 Publiceren via GitHub Pages

1. Push deze map naar een GitHub-repository.
2. Ga in de repo naar **Settings → Pages**.
3. Kies bij *Source* de branch (bijv. `main`) en map `/ (root)`.
4. Na enkele minuten staat de app live op
   `https://<gebruiker>.github.io/<repo>/`.

Geen build-configuratie nodig — het is een statische site.

---

## 🔌 Databron (Supabase)

De Supabase-URL en publieke **anon key** staan boven in `src/core/db.js`:

```js
const SUPABASE_URL  = 'https://…supabase.co';
const SUPABASE_ANON = 'sb_publishable_…';
```

- De anon key is een *publishable* sleutel en mag in client-code staan;
  de toegang wordt geregeld via Supabase Row Level Security.
- Wil je een eigen database gebruiken? Pas deze twee waarden aan.
- Is Supabase niet bereikbaar, dan toont de app automatisch de mock-data
  uit `src/core/data.js`, zodat het prototype altijd werkt.

---

## 📝 Opmerkingen

- Dit is een **prototype/designartefact**, geen productiecode. Voor een
  productie-app is een echte build-stap aan te raden (bijv. Vite + React met
  ES-modules) en het opsplitsen van de grotere `.jsx`-bestanden.
- De app is ontworpen voor een mobiel scherm en wordt binnen een telefoon-frame
  gecentreerd weergegeven.

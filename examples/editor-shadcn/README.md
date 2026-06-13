# Email Builder — Editor shadcn/ui

Evoluzione dell'editor open source [EmailBuilder.js](https://github.com/usewaypoint/email-builder-js) (Waypoint), trasformato da esempio dimostrativo a **modulo demo pronto per l'integrazione in piattaforma**: interfaccia in stile [shadcn/ui](https://ui.shadcn.com) (new-york / neutral) con icone [lucide](https://lucide.dev), shell applicativa che replica il portale host, gestione template con versioning, export ZIP + MJML e funzioni AI con proxy sicuro.

Documenti di progetto (nella root del repo): `evoluzione-prd.md`, `frontend.md`, `dev-prd-detail.md`, `evoluzioni-v1.md`, `evoluzioni-v2.md`.

---

## Avvio rapido

Prerequisiti: Node ≥ 18 (consigliato 22), npm 10.

```bash
# 1) dalla ROOT del monorepo: installa le dipendenze
npm install

# 2) solo al primo avvio: compila i pacchetti @usewaypoint/*
for p in packages/*; do (cd $p && npx tsup ./src/index.ts* --outDir dist --format cjs,esm --dts); done

# 3) avvia l'editor
cd examples/editor-shadcn
npm run dev          # → http://localhost:5173
```

Altri comandi (da `examples/editor-shadcn`):

```bash
npm run test            # suite vitest (75 test)
npm run build           # typecheck + build di produzione
npm run preview         # serve la build
npm run ai-proxy        # proxy AI (vedi sotto)
npm run template-server # backend template con versioning (vedi sotto)
```

### Abilitare le funzioni AI (opzionale)

Le funzioni AI richiedono il proxy locale: **il token non passa MAI dal browser**.

```bash
cd examples/editor-shadcn
cp server/.env.example server/.env    # inserisci la tua AI_API_KEY
npm run ai-proxy                      # → http://localhost:8787 (in un terminale separato)
```

In `server/.env` si configurano `AI_BASE_URL` (default OpenAI, vale qualunque endpoint OpenAI-compatible), `AI_MODEL` e `AI_API_KEY`. Il file è in `.gitignore`. Il frontend chiama solo il proxy (`VITE_AI_PROXY_URL`, default `http://localhost:8787`): in produzione la stessa variabile punterà al proxy della piattaforma. Senza proxy attivo l'app funziona normalmente e le azioni AI mostrano un errore esplicativo.

### Backend template con versioning (opzionale — V2.5)

Il backend REST locale aggiunge persistenza su disco e cronologia versioni automatica:

```bash
cd examples/editor-shadcn
npm run template-server   # → http://localhost:8788 (in un terminale separato)
```

Per attivarlo nel frontend: `VITE_TEMPLATE_BACKEND=http` in `.env.local`. Il file di persistenza è `server/templates-db.json` (gitignored). Per default l'app continua a usare localStorage. In piattaforma puntare `VITE_TEMPLATE_API_URL` alle API esistenti e impostare `VITE_TEMPLATE_BACKEND=http`.

---

## Cosa è stato aggiunto rispetto al progetto di partenza

Il progetto originale (`examples/vite-emailbuilder-mui`) è un singolo editor MUI con sample read-only, condivisione via URL e download del JSON. Tutto ciò che segue è **nuovo**, diviso per ciclo di sviluppo.

---

### V1 — Base + funzionalità core

#### Interfaccia e shell applicativa
- **Migrazione completa da MUI 5 a Tailwind CSS v4 + shadcn/ui + lucide-react** — zero dipendenze `@mui/*`/`@emotion/*`; design token identici al portale host.
- **Shell del portale**: header con logo su gradiente, ricerca template globale, selettore lingua, notifiche e menu utente (placeholder); sidebar di navigazione con Dashboard, Editor, Template prefatti, I miei template, Esportazioni e box "Powered by".
- **Interfaccia bilingue IT/EN** con dizionari tipizzati (chiave mancante = errore di compilazione) e persistenza della lingua.
- **Dark mode dell'interfaccia** (chiaro/scuro, persistito).
- L'editor (`src/components/editor/`) è **disaccoppiato dalla shell**: si monta da solo nel portale reale.

#### Gestione template
- **Salvataggio template personali** in localStorage: salva / salva come (automatico sui prefatti, che restano read-only), rinomina, duplica, elimina con conferma, guardia "modifiche non salvate".
- **Viste a card con miniatura live** (email renderizzata in scala, non screenshot statici).
- **Ricerca template** dall'header su prefatti e personali.
- **2 template Hospitality curati**: *Hotel — Pre-stay* (riepilogo soggiorno + servizi) e *Hotel — Post-stay* (feedback 5 stelle + codice sconto), palette verde bosco/crema/terracotta.

#### Editing
- **Undo / Redo** (100 step, bottoni + Cmd/Ctrl+Z e Shift+Cmd/Ctrl+Z).
- **Drag & drop dei blocchi** con maniglia on-hover (in origine solo frecce su/giù, che restano come fallback).
- **Colonne responsive**: "Stack columns on mobile" (layout fluid-hybrid senza media query) e "Reverse order on mobile" (tecnica `dir=rtl`) — renderer email locale in `src/email/`.
- **Anteprima dark mode** dell'email (simulazione; gestione reale con pipeline MJML in V2).

#### Intelligenza artificiale (via proxy sicuro)
- **AI Copywriting**: migliora / più formale / più persuasivo / accorcia sui blocchi Text, Heading e Button (markdown preservato).
- **Traduzione contestuale** in IT/EN/FR/DE/ES.
- **Prompt-to-section**: "Genera con AI" nel menu blocchi — descrizione in linguaggio naturale → sezione JSON **validata con zod** (retry automatico).
- **Proxy AI zero-dipendenze** (`server/ai-proxy.mjs`): token solo server-side, CORS ristretto, whitelist campi. Prompt versionati in `src/ai/prompts/`.

#### Qualità e deliverable
- **Export ZIP**: `email.html` (path immagini riscritti in `images/`), `template.json`, immagini scaricate; fallback non bloccante per CORS; storico esportazioni di sessione.
- **Monitor peso HTML** in toolbar (clipping Gmail: neutro < 80 KB, ambra 80–102, rosso oltre).
- **Preflight**: alt mancanti, link vuoti/`#`, contrasto WCAG < 4.5:1, peso oltre soglia — con "Vai al blocco".
- **58 test automatici** (vitest): sample, i18n, template store, export ZIP, colonne mobili, peso, preflight, validazione AI, smoke test.

---

### V2 — Pipeline MJML + Persistenza cloud-ready

#### V2.1 — Pipeline MJML (output email-client compatibile)

- **Traduttore JSON → MJML** completo (`src/mjml/`): tutti e 10 i tipi di blocco mappati in MJML 4, con font mapping automatico verso Google Fonts (Inter, Poppins, Playfair Display, Lora, ecc.) e attributi tipografici/spacing fedeli all'editor.

  | Blocco editor | Tag MJML generato |
  |---|---|
  | EmailLayout | `<mj-body>` + `<mj-head>` |
  | Container | `<mj-section>` + `<mj-column>` |
  | ColumnsContainer | `<mj-section>` con N `<mj-column>` |
  | Text | `<mj-text>` |
  | Heading | `<mj-text>` con `<h1/h2/h3>` interno |
  | Button | `<mj-button>` |
  | Image | `<mj-image>` |
  | Avatar | `<mj-image>` con `border-radius` |
  | Divider | `<mj-divider>` |
  | Spacer | `<mj-spacer>` |
  | Html | `<mj-raw>` |

- **Toggle Classico / MJML nella tab HTML**: switch on-demand che compila con `mjml-browser` (lazy-loaded, non appesantisce il bundle iniziale); eventuali warning MJML mostrati inline.
- **Export ZIP arricchito**: include ora `email.mjml` (sorgente MJML) e `email-mjml.html` (HTML compilato con ghost table Outlook, media query mobile, CSS inline) affianco all'`email.html` classico.

#### V2.5 — Persistenza cloud-ready + Versioning automatico

- **Interfaccia `TemplateRepository`** (`src/templates/repository/`): contratto unico per `list / get / save / rename / duplicate / delete / listVersions / getVersion`. Le viste non dipendono dall'implementazione sottostante.

- **`LocalStorageRepository`** (default): stessa UX di V1, ora con versioning automatico a ogni salvataggio (max 50 versioni per template, rotazione FIFO). Compatibile con i dati già salvati.

- **`HttpRepository`**: chiama un backend REST — attivabile con `VITE_TEMPLATE_BACKEND=http` senza cambiare una riga di codice UI. In piattaforma si punta a `VITE_TEMPLATE_API_URL` e il gioco è fatto.

- **`server/template-server.mjs`** — backend Node.js zero-dipendenze (`npm run template-server`, porta 8788): API REST completa (`GET/POST/PUT/DELETE /templates`, `GET /templates/:id/versions`), persistenza JSON su file, versioning automatico a ogni PUT con snapshot non distruttivi.

- **UI Cronologia versioni**: voce "Cronologia versioni" nel menu ⋮ di ogni template card. Il pannello mostra la lista versioni con miniatura live renderizzata, data, numero versione e pulsante "Ripristina" — il ripristino crea sempre un nuovo salvataggio, non sovrascrive mai la storia.

- **`templateStore.ts` refactoring**: `useVersionStore` Zustand reattivo; versioning integrato in `saveTemplate`; `_setStorageForTesting` resetta correttamente entrambi gli store; schema Zod tollerante per le versioni (retrocompatibile con documenti evoluti).

#### Test V2
- **9 nuovi test** (da 58 a 75 totali):
  - Traduttore MJML: 9 casi (tag generati, ColumnsContainer, errori, font, colori)
  - Versioning: 5 casi (first save, accumulo, ordinamento, delete cascade, reset isolamento test)

---

## Struttura del progetto

```
examples/editor-shadcn/
├── server/
│   ├── ai-proxy.mjs          # proxy AI (token solo qui)
│   ├── template-server.mjs   # backend REST template + versioning (V2.5)
│   └── .env.example          # da copiare in .env
└── src/
    ├── components/shell/     # header, sidebar, navigazione (solo demo)
    ├── components/views/     # dashboard, template, esportazioni, cronologia versioni
    ├── components/editor/    # editor autonomo: non importa mai dalla shell
    ├── components/ui/        # componenti shadcn/ui
    ├── documents/            # store zustand (con undo/redo) + blocchi editor
    ├── email/                # renderer email locale (Reader + renderToStaticMarkup estesi)
    ├── mjml/                 # traduttore JSON → MJML + API mjmlToHtml (V2.1)
    ├── templates/
    │   ├── repository/       # TemplateRepository interface + Local/Http impl (V2.5)
    │   └── templateStore.ts  # store zustand con versioning automatico
    ├── export/               # export ZIP (+ email.mjml, email-mjml.html in V2)
    ├── ai/                   # client (solo proxy), prompt, validazione, UI
    └── lib/                  # i18n, peso HTML, preflight, tema
```

## Note per l'integrazione in piattaforma

- Montare `EditorView` + gli store (`documents/`, `templates/`, `export/`, `ai/`) dentro il layout del portale; la shell di questa demo è usa-e-getta.
- **Persistenza**: impostare `VITE_TEMPLATE_BACKEND=http` e `VITE_TEMPLATE_API_URL` per usare `HttpRepository` contro le API della piattaforma — zero modifiche al codice UI.
- **AI**: puntare `VITE_AI_PROXY_URL` al proxy di produzione; i prompt non cambiano.
- **MJML**: l'export ZIP produce sempre `email.mjml` + `email-mjml.html`; il toggle nella tab HTML è opzionale ma consigliato per verificare la compatibilità Outlook prima dell'invio.
- Colori UI solo tramite token shadcn; gli unici hex nel sorgente sono i default dei documenti email e le palette del color picker.

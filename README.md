# Email Builder — Editor shadcn/ui

Evoluzione dell'editor open source [EmailBuilder.js](https://github.com/usewaypoint/email-builder-js) (Waypoint), trasformato da esempio dimostrativo a **modulo demo pronto per l'integrazione in piattaforma**: interfaccia in stile [shadcn/ui](https://ui.shadcn.com) (new-york / neutral) con icone [lucide](https://lucide.dev), shell applicativa che replica il portale host, gestione template, export ZIP e funzioni AI con proxy sicuro.

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
npm run test         # suite vitest (58 test)
npm run build        # typecheck + build di produzione
npm run preview      # serve la build
npm run ai-proxy     # proxy AI (vedi sotto)
```

### Abilitare le funzioni AI (opzionale)

Le funzioni AI richiedono il proxy locale: **il token non passa MAI dal browser**.

```bash
cd examples/editor-shadcn
cp server/.env.example server/.env    # inserisci la tua AI_API_KEY
npm run ai-proxy                      # → http://localhost:8787 (in un terminale separato)
```

In `server/.env` si configurano `AI_BASE_URL` (default OpenAI, vale qualunque endpoint OpenAI-compatible), `AI_MODEL` e `AI_API_KEY`. Il file è in `.gitignore`. Il frontend chiama solo il proxy (`VITE_AI_PROXY_URL`, default `http://localhost:8787`): in produzione la stessa variabile punterà al proxy della piattaforma. Senza proxy attivo l'app funziona normalmente e le azioni AI mostrano un errore esplicativo.

---

## Cosa è stato aggiunto rispetto al progetto di partenza

Il progetto originale (`examples/vite-emailbuilder-mui`) è un singolo editor MUI con sample read-only, condivisione via URL e download del JSON. Tutto ciò che segue è **nuovo**:

### Interfaccia e shell applicativa
- **Migrazione completa da MUI 5 a Tailwind CSS v4 + shadcn/ui + lucide-react** — zero dipendenze `@mui/*`/`@emotion/*`; design token identici al portale host.
- **Shell del portale**: header con logo su gradiente, ricerca template globale, selettore lingua, notifiche e menu utente (placeholder); sidebar di navigazione con Dashboard, Editor, Template prefatti, I miei template, Esportazioni e box "Powered by".
- **Interfaccia bilingue IT/EN** con dizionari tipizzati (chiave mancante = errore di compilazione) e persistenza della lingua.
- **Dark mode dell'interfaccia** (chiaro/scuro, persistito).
- L'editor (`src/components/editor/`) è **disaccoppiato dalla shell**: si monta da solo nel portale reale.

### Gestione template
- **Salvataggio template personali** in localStorage: salva / salva come (automatico sui prefatti, che restano read-only), rinomina, duplica, elimina con conferma, guardia "modifiche non salvate".
- **Viste a card con miniatura live** (email renderizzata in scala, non screenshot statici).
- **Ricerca template** dall'header su prefatti e personali.
- **2 template Hospitality curati**: *Hotel — Pre-stay* (riepilogo soggiorno + servizi) e *Hotel — Post-stay* (feedback 5 stelle + codice sconto), palette verde bosco/crema/terracotta.

### Editing
- **Undo / Redo** (100 step, bottoni + Cmd/Ctrl+Z e Shift+Cmd/Ctrl+Z).
- **Drag & drop dei blocchi** con maniglia on-hover (in origine solo frecce su/giù, che restano come fallback).
- **Colonne responsive**: "Stack columns on mobile" (layout fluid-hybrid che si impila senza media query) e "Reverse order on mobile" (tecnica `dir=rtl`: ordine desktop invariato, invertito da impilate) — renderer email locale in `src/email/`.
- **Anteprima dark mode** dell'email (simulazione dichiarata; gestione reale prevista con la pipeline MJML, v2).

### Intelligenza artificiale (via proxy sicuro)
- **AI Copywriting**: migliora / più formale / più persuasivo / accorcia sui blocchi Text, Heading e Button (formattazione markdown preservata).
- **Traduzione contestuale** in IT/EN/FR/DE/ES.
- **Prompt-to-section**: "Genera con AI" nel menu blocchi — descrizione in linguaggio naturale → sezione JSON **validata con zod** (retry automatico, nessun output del modello può corrompere il documento).
- **Proxy AI zero-dipendenze** (`server/ai-proxy.mjs`): token solo server-side, CORS ristretto, whitelist dei campi inoltrati. Prompt versionati e ben identificabili in `src/ai/prompts/`.

### Qualità e deliverable
- **Export ZIP** completo: `email.html` (path immagini riscritti in `images/`), `template.json` riutilizzabile, immagini scaricate; fallback non bloccante per immagini CORS-protette; storico esportazioni di sessione con ri-esporta.
- **Monitor peso HTML** in toolbar (soglia clipping Gmail: neutro < 80 KB, ambra 80–100, rosso oltre).
- **Verifica (preflight)**: alt mancanti, link vuoti/`#`, contrasto WCAG < 4.5:1, peso oltre soglia — con "Vai al blocco".
- **58 test automatici** (vitest): sample, i18n, template store, export ZIP, colonne mobili, peso, preflight, validazione AI, smoke test dell'app.

Funzioni ereditate dall'originale e mantenute: editing visuale dei 10 tipi di blocco con inspector, tab Modifica/Anteprima/HTML/JSON, vista desktop/mobile, import JSON, condivisione via link `#code/...`.

---

## Struttura del progetto

```
examples/editor-shadcn/
├── server/
│   ├── ai-proxy.mjs          # proxy AI (token solo qui)
│   └── .env.example          # da copiare in .env
└── src/
    ├── components/shell/     # header, sidebar, navigazione (solo demo)
    ├── components/views/     # dashboard, template, esportazioni
    ├── components/editor/    # editor autonomo: non importa mai dalla shell
    ├── components/ui/        # componenti shadcn/ui
    ├── documents/            # store zustand (con undo/redo) + blocchi editor
    ├── email/                # renderer email locale (Reader + renderToStaticMarkup estesi)
    ├── templates/            # prefab (incl. Hospitality) + templateStore (localStorage)
    ├── export/               # export ZIP + storico
    ├── ai/                   # client (solo proxy), prompt, validazione, UI
    └── lib/                  # i18n, peso HTML, preflight, tema
```

## Note per l'integrazione in piattaforma

- Montare `EditorView` + gli store (`documents/`, `templates/`, `export/`, `ai/`) dentro il layout del portale; la shell di questa demo è usa-e-getta.
- Persistenza: oggi localStorage; il passaggio alle API piattaforma è previsto tramite adapter `TemplateRepository` (vedi `evoluzioni-v2.md` §V2.5).
- AI: puntare `VITE_AI_PROXY_URL` al proxy di produzione; i prompt non cambiano.
- Colori UI solo tramite token shadcn; gli unici hex nel sorgente sono i default dei documenti email e le palette del color picker.
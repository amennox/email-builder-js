# DEV-PRD-DETAIL.MD — Istruzioni operative per il generatore di codice

> **Destinatario:** generatore di codice AI. Questo documento è prescrittivo: segui gli step nell'ordine indicato, esegui i test intermedi di ogni step e spunta i checkpoint prima di passare allo step successivo. Non procedere a uno step se i checkpoint del precedente non sono tutti verdi.
>
> **Documenti di riferimento (da leggere prima di iniziare):**
> - `evoluzione-prd.md` — specifiche di prodotto (la demo implementa il §6)
> - `frontend.md` — tema UI vincolante: shadcn/ui new-york, base neutral, icone lucide
> - `implementazione-evoluzione.md` — piano generale (la demo è lo Step 0)

---

## 0. Scope di questa consegna

**Obiettivo:** una demo ben funzionante, app `examples/editor-shadcn`, con:

1. **app shell che replica il portale host** (`frontend.md` §4.1-4.2): header con logo su gradiente, ricerca template, selettore lingua IT/EN, sezione utente placeholder; sidebar di navigazione con menu e box "Powered by";
2. editor email completo nella zona interna (porting funzionale dell'app `examples/vite-emailbuilder-mui`), **disaccoppiato dalla shell** perché in produzione verrà montato dentro il portale reale;
3. gestione di **template prefatti** (i 9 sample esistenti, read-only) in vista a card;
4. **salvataggio template personali** in localStorage — da zero o modificando un prefatto — con rinomina, duplicazione, eliminazione;
5. **export ZIP** con HTML compilato, JSON del template e tutte le immagini referenziate;
6. **interfaccia bilingue IT/EN** tramite modulo i18n minimale (`frontend.md` §4.5).

**Fuori scope (non implementare ora):** pipeline MJML, dark mode dell'email, componenti kinetic, locking, templating Liquid, Product Block — fasi successive (`implementazione-evoluzione.md` Step 1-10). **Autenticazione, gestione profilo e notifiche:** solo placeholder visivi, nessuna logica. L'HTML è generato con `renderToStaticMarkup` di `@usewaypoint/email-builder`, già disponibile nel monorepo.

**Vincoli globali:**

- non modificare i pacchetti `packages/*` né l'app `examples/vite-emailbuilder-mui` (resta come riferimento);
- TypeScript strict, zero `any` non giustificati, zero errori ESLint;
- nessuna dipendenza `@mui/*` / `@emotion/*`; icone solo `lucide-react`;
- tutti i colori UI tramite token shadcn (vedi `frontend.md` §3);
- testi dell'interfaccia in **italiano**;
- ogni step termina con commit dedicato (messaggio indicato nello step).

---

## Step 1 — Scaffolding dell'app

**Attività:**

1. Crea `examples/editor-shadcn` con Vite (`react-swc-ts`); registrala nei workspace (`examples/*` è già incluso nel `package.json` di root — verifica solo che il nome del package sia univoco: `@usewaypoint/editor-shadcn`, `"private": true`).
2. Installa e configura Tailwind v4 (`@tailwindcss/vite`) e shadcn (`npx shadcn@latest init` — style `new-york`, base `neutral`, CSS variables). Configura alias `@/*` in `tsconfig` e `vite.config.ts`.
3. Aggiungi i componenti shadcn elencati in `frontend.md` §2 e le dipendenze: `lucide-react`, `zustand`, `zod`, `react-colorful`, `jszip`, `file-saver` (+ `@types/file-saver`), `highlight.js`, e i pacchetti workspace `@usewaypoint/email-builder` + tutti i `@usewaypoint/block-*` + `@usewaypoint/document-core` (stesse versioni dell'app MUI).
4. Aggiungi `vitest` + `@testing-library/react` + `jsdom`; script `"test": "vitest run"`.
5. In `src/main.tsx` monta una pagina placeholder con un `Button` shadcn e un'icona lucide per verificare la pipeline di stile.

**Test intermedi:**

```bash
npm install
npm run dev --workspace=@usewaypoint/editor-shadcn    # pagina visibile su :5173
npm run build --workspace=@usewaypoint/editor-shadcn  # build senza errori
```

**Checkpoint:**

- [ ] `npm run dev` mostra il bottone shadcn stilizzato correttamente (sfondo scuro, `rounded-md`, font di sistema).
- [ ] `npm run build` completa senza errori TS.
- [ ] `components.json` conforme a `frontend.md` §2.
- [ ] Nessuna dipendenza MUI/Emotion in `package.json`.

**Commit:** `feat(editor-shadcn): scaffolding vite + tailwind v4 + shadcn`

---

## Step 2 — Porting della logica documenti (senza UI)

**Attività:**

1. Copia da `examples/vite-emailbuilder-mui/src/` in `examples/editor-shadcn/src/`:
   - `documents/editor/core.tsx`, `documents/editor/EditorBlock.tsx`, `documents/editor/EditorContext.tsx`;
   - `documents/blocks/` (tutti i blocchi e gli helper) — **rimuovendo gli import MUI** da `TuneMenu.tsx`, `AddBlockMenu/*` e `EditorBlockWrapper.tsx`: per ora sostituiscili con elementi nativi non stilizzati (verranno rifatti allo Step 4);
   - `getConfiguration/` completo (i 9 sample + `validateJsonStringValue.ts` da `TemplatePanel/ImportJson/`).
2. Estendi lo store `EditorContext` con: `currentTemplateId: string | null`, `isDirty: boolean` (true a ogni `setDocument`/modifica, false dopo save/load), `currentView: 'dashboard' | 'editor' | 'prefab-templates' | 'my-templates' | 'exports'` (default `dashboard`), `locale: 'it' | 'en'` (default `it`, persistita su localStorage `editor:locale`).
3. Crea il modulo i18n minimale `src/lib/i18n/` come da `frontend.md` §4.5 (chiavi tipizzate, dizionari `it.ts`/`en.ts`, hook `useT()`); popola i dizionari man mano negli step successivi.
4. Scrivi test vitest: `getConfiguration('#sample/welcome')` restituisce un documento con blocco `root`; ogni sample passa la validazione zod di `core.tsx`; `validateJsonStringValue` rifiuta JSON malformato; il modulo i18n restituisce la stringa corretta per entrambe le lingue e fallisce in compilazione su chiave mancante.

**Test intermedi:**

```bash
npm run test --workspace=@usewaypoint/editor-shadcn
npx tsc --noEmit -p examples/editor-shadcn
```

**Checkpoint:**

- [ ] Tutti i 9 sample caricano e validano con zod.
- [ ] `renderToStaticMarkup(sample, { rootBlockId: 'root' })` produce HTML non vuoto per ogni sample (test dedicato).
- [ ] Zero import `@mui/*` residui (verifica: `grep -r "@mui" examples/editor-shadcn/src` vuoto).

**Commit:** `feat(editor-shadcn): porting store, blocchi e sample`

---

## Step 3 — App shell del portale + vista Editor

**Attività:**

1. Implementa la **shell** secondo `frontend.md` §4.1-4.2, in `components/shell/`:
   - `AppHeader`: zona logo `w-64` con il gradiente esatto `linear-gradient(to right, rgba(24, 24, 27, 0.05), rgba(0, 0, 0, 0))`, logo placeholder + nome prodotto + "BETA"; barra ricerca a pillola (per ora solo UI, cablata allo Step 5); selettore lingua IT/EN funzionante (cambia `locale` nello store, persiste); bottone notifiche placeholder; sezione utente con avatar a iniziali e `DropdownMenu` Profilo (Dialog cambio password fittizio) / Logout (toast);
   - `AppSidebar`: menu con le voci e icone della tabella di `frontend.md` §4.2, voce attiva con indicatore, navigazione via `currentView`; box "Powered by" in fondo (`src/assets/powered-by.svg` placeholder).
2. Crea le viste vuote in `components/views/`: `DashboardView` (card statistiche fittizie), `PrefabTemplatesView`, `MyTemplatesView`, `ExportsView` (popolate allo Step 5) — ognuna montata nella zona interna in base a `currentView`.
3. Implementa la **vista Editor** (`components/editor/`, `frontend.md` §4.3), senza alcun import dalla shell:
   - toolbar interna: nome template + badge "non salvato"; `Tabs` Edit/Preview/HTML/JSON collegati a `selectedMainTab`; `ToggleGroup` Desktop/Mobile collegato a `selectedScreenSize`; toggle tema chiaro/scuro (classe `dark` su `html`, persistita in localStorage `editor:ui-theme`); bottoni Salva/Esporta/Importa/Condividi presenti ma disabilitati (attivati negli step 5-6);
   - canvas: rendering del documento via `EditorBlock`/`Reader` come nell'app MUI; vista Preview (`Reader`), HTML (`renderToStaticMarkup` + highlight.js), JSON (pretty print + highlight.js); larghezza 600px/370px secondo screen size;
   - inspector `w-80` collassabile: `Tabs` Stili/Blocco con contenuto placeholder.
4. Tutte le stringhe introdotte passano da `t()` (dizionari IT + EN aggiornati).

**Test intermedi:** avvio dev server; confronto visivo della shell con lo snapshot del portale host; navigazione tra le 5 voci di menu; cambio lingua; navigazione tra le 4 tab dell'editor e i 2 screen size; verifica visiva dei token (sfondi, bordi, focus ring).

**Checkpoint:**

- [ ] Shell conforme allo snapshot: header con gradiente sulla zona logo, ricerca a pillola, lingua, avatar; sidebar con sezioni uppercase, voce attiva evidenziata, "Powered by" in fondo.
- [ ] Le 5 voci di menu cambiano la vista interna; lo stato è nello store (nessun router).
- [ ] Cambio lingua IT/EN aggiorna immediatamente tutte le stringhe e persiste al reload.
- [ ] Menu utente: dialog cambio password e logout placeholder funzionanti (solo toast).
- [ ] Le 4 tab dell'editor mostrano editor, preview, HTML evidenziato e JSON evidenziato del documento corrente.
- [ ] Toggle Desktop/Mobile cambia la larghezza del canvas (600px / 370px); inspector collassabile.
- [ ] Dark mode UI funzionante e persistita al reload.
- [ ] `grep -r "components/shell" examples/editor-shadcn/src/components/editor` vuoto (editor disaccoppiato).

**Commit:** `feat(editor-shadcn): app shell portale host + vista editor`

---

## Step 4 — Editing completo (inspector + interazioni canvas)

**Attività:**

1. Ricostruisci gli input panel dell'inspector (`ConfigurationPanel`, `StylesPanel` e tutti gli `input-panels/`) con i componenti shadcn secondo la mappatura di `frontend.md` §5: `Input`, `Select`, `Slider`, `Switch`, `ToggleGroup`, color picker `react-colorful` in `Popover`.
2. Ricostruisci le interazioni canvas: selezione blocco (ring), hover, `TuneMenu` (ArrowUp/ArrowDown/Copy/Trash2), `AddBlockMenu` in `Popover` con griglia di blocchi e icone lucide (mappatura `frontend.md` §6).
3. Ogni modifica dal pannello aggiorna il documento nello store e setta `isDirty = true`.

**Test intermedi:** per ogni tipo di blocco (Heading, Text, Button, Image, Avatar, Divider, Spacer, Html, Columns, Container): aggiungi → modifica 2-3 proprietà → sposta → duplica → elimina. Verifica che Preview e HTML riflettano le modifiche.

**Checkpoint:**

- [ ] Tutti i 10 tipi di blocco si aggiungono, modificano, spostano, duplicano ed eliminano senza errori console.
- [ ] Il pannello Stili modifica le proprietà del documento root (colori, font, padding) con effetto visibile.
- [ ] Color picker funzionante (hex input + picker visuale).
- [ ] Badge "non salvato" compare in toolbar quando `isDirty`.

**Commit:** `feat(editor-shadcn): inspector e interazioni canvas complete`

---

## Step 5 — Template manager (prefatti + localStorage)

**Attività:**

1. Crea `src/templates/templateStore.ts`:

```ts
type TSavedTemplate = {
  id: string;          // crypto.randomUUID()
  name: string;
  document: TEditorConfiguration;
  createdAt: string;   // ISO 8601
  updatedAt: string;   // ISO 8601
};
```

   API: `listTemplates()`, `getTemplate(id)`, `saveTemplate(name, document, id?)`, `renameTemplate(id, name)`, `duplicateTemplate(id)`, `deleteTemplate(id)`. Persistenza su chiave localStorage `emailbuilder:templates` (array JSON, validato con zod alla lettura; dati corrotti → array vuoto + `toast.error`).
2. Popola le viste template (`frontend.md` §4.4):
   - `PrefabTemplatesView`: griglia card dei 9 prefatti (da `getConfiguration`) con miniatura renderizzata in scala, azioni Apri e "Usa come base" (duplica come personale);
   - `MyTemplatesView`: griglia card dei personali con CRUD via `DropdownMenu` (Rinomina con `Dialog`, Duplica, Esporta ZIP — attivo dallo Step 6 —, Elimina con `AlertDialog`), empty state e bottone "Nuovo template" (carica documento vuoto e apre l'editor);
   - `DashboardView`: card con conteggi reali (n. template personali, data ultimo salvataggio) + dati fittizi dichiarati;
   - `ExportsView`: storico export della sessione (popolato allo Step 6, per ora empty state).
3. Cabla la **ricerca dell'header**: digitando ≥ 2 caratteri, `Popover` con i template (prefatti e personali) il cui nome matcha (case-insensitive); click sul risultato → apre il template nell'editor.
4. Flusso di salvataggio in toolbar:
   - **Salva** su template personale già aperto → sovrascrive (aggiorna `updatedAt`);
   - **Salva** su prefatto o documento nuovo → `Dialog` "Salva come" che chiede il nome (precompilato con il nome del prefatto + " (copia)");
   - dopo il salvataggio: `isDirty = false`, `toast.success`.
5. Cambio template o cambio vista con modifiche pendenti → `AlertDialog` di conferma ("Modifiche non salvate. Continuare?").

**Test intermedi:**

- unit test vitest su `templateStore` (mock localStorage): save→list→get→rename→duplicate→delete; round-trip del documento identico (deep equal); test della funzione di ricerca (match case-insensitive su prefatti e personali);
- manuale: salva da zero, salva da prefatto, modifica e risalva, rinomina, duplica, elimina, ricarica la pagina e verifica la persistenza; cerca un template dall'header e aprilo.

**Checkpoint:**

- [ ] Unit test `templateStore` e ricerca tutti verdi.
- [ ] Un template salvato sopravvive al reload del browser.
- [ ] I prefatti non sono modificabili: "Salva" su un prefatto crea sempre una copia personale.
- [ ] Le card mostrano la miniatura renderizzata dell'email (non un'immagine statica).
- [ ] Eliminazione protetta da `AlertDialog`; rinomina aggiorna subito card e risultati di ricerca.
- [ ] Cambio template o vista con modifiche pendenti chiede conferma.
- [ ] La ricerca nell'header trova prefatti e personali e apre il template selezionato.
- [ ] La Dashboard mostra il conteggio reale dei template personali.

**Commit:** `feat(editor-shadcn): template manager con persistenza localStorage`

---

## Step 6 — Export ZIP

**Attività:**

1. Crea `src/export/exportZip.ts` con `exportTemplateAsZip(name: string, document: TEditorConfiguration): Promise<void>`:
   - genera l'HTML con `renderToStaticMarkup(document, { rootBlockId: 'root' })`;
   - estrae tutti gli URL immagine dal documento (props `url` dei blocchi `Image` e `imageUrl` di `Avatar` — ricava l'elenco esatto dei campi dagli schemi zod dei blocchi, non hardcodare solo questi due se ne esistono altri);
   - scarica ogni immagine con `fetch`; nomi file: `images/img-001.png` ecc. (estensione dal `Content-Type`; deduplica URL identici);
   - riscrive i riferimenti nell'HTML esportato con i path relativi `images/...`;
   - **gestione CORS:** se il fetch di un'immagine fallisce, lascia l'URL assoluto nell'HTML, escludila dallo ZIP e segnala a fine export un `toast.warning` con l'elenco delle immagini non incluse — l'export non deve mai fallire per questo;
   - compone lo ZIP con `jszip`: `email.html` (HTML con path riscritti), `template.json` (documento originale, con gli URL assoluti, pretty-printed), `images/`;
   - salva come `<nome-template-slugificato>.zip` con `file-saver`.
2. Collega la voce "Esporta ZIP" del menu Esporta in toolbar e l'azione "Esporta ZIP" delle card in `MyTemplatesView`; mostra spinner (`Loader2` animato) durante la generazione.
3. A ogni export registra una voce nello storico di sessione (store in-memory: nome template, timestamp, n. immagini incluse/escluse) e popola `ExportsView` con la lista e un bottone "Ri-esporta" per voce.
4. Attiva anche "Scarica JSON", "Importa JSON" (con `validateJsonStringValue` e `Dialog`) e "Condividi" (link `#code/<base64>` copiato negli appunti + toast), portandoli dall'app MUI.

**Test intermedi:**

- unit test vitest: estrazione URL immagine da un documento di test con N immagini (incluse duplicate); riscrittura path nell'HTML; struttura dello ZIP (jszip permette l'ispezione in memoria: verifica presenza di `email.html`, `template.json`, conteggio file in `images/`);
- manuale: esporta il sample "order-ecomerce" (contiene immagini), scompatta lo ZIP, apri `email.html` nel browser **da file system** e verifica che le immagini si vedano offline.

**Checkpoint:**

- [ ] Unit test export tutti verdi.
- [ ] Lo ZIP del sample con immagini contiene `email.html`, `template.json` e `images/` con i file attesi.
- [ ] `email.html` aperto offline mostra le immagini locali.
- [ ] `template.json` re-importato via "Importa JSON" riproduce esattamente l'email.
- [ ] Immagine con CORS bloccato → export riuscito + warning, URL assoluto preservato.
- [ ] Ogni export compare in `ExportsView` con timestamp; "Ri-esporta" rigenera lo ZIP.

**Commit:** `feat(editor-shadcn): export ZIP con html, json e immagini`

---

## Step 7 — QA finale, conformità tema e build

**Attività:**

1. Verifica di conformità a `frontend.md` §8 (esegui realmente i grep indicati).
2. Percorso end-to-end completo: dalla Dashboard → "Template prefatti" → "Usa come base" → modifica → salva come → nuovo template da zero con almeno 6 tipi di blocco → salva → ricerca dall'header e apertura → export ZIP di entrambi → verifica voci in "Esportazioni" → cambio lingua EN e ripetizione di un giro di navigazione → menu utente (dialog password, logout) → reload → condividi link → apertura del link in finestra anonima.
3. Pulizia: rimuovi codice morto, placeholder, `console.log`; ESLint senza warning.
4. `README.md` dell'app: prerequisiti, comandi dev/build/test, screenshot, funzionalità.
5. Build di produzione e smoke test su `vite preview`.

**Test intermedi:**

```bash
grep -r "@mui" examples/editor-shadcn/src           # atteso: vuoto
grep -rE "#[0-9a-fA-F]{6}" examples/editor-shadcn/src/components/editor  # atteso: vuoto (eccezioni documentate)
npm run test --workspace=@usewaypoint/editor-shadcn
npm run build --workspace=@usewaypoint/editor-shadcn
npm run preview --workspace=@usewaypoint/editor-shadcn
```

**Checkpoint:**

- [ ] Tutti i criteri di `frontend.md` §8 spuntati.
- [ ] Percorso end-to-end completato senza errori in console.
- [ ] Tutti i test automatici verdi; build e preview funzionanti.
- [ ] README presente e accurato.

**Commit:** `chore(editor-shadcn): QA finale, readme e build di produzione`

---

## 8. Criteri di accettazione finali (riepilogo)

| # | Criterio | Verifica |
|---|---|---|
| 1 | UI conforme a shadcn/ui new-york/neutral, sole icone lucide | grep + confronto visivo con ui.shadcn.com |
| 2 | 9 template prefatti caricabili e non sovrascrivibili | manuale + test Step 2 |
| 3 | CRUD template personali persistente in localStorage | unit test Step 5 + reload |
| 4 | Salvataggio sia da zero sia da prefatto ("Salva come") | manuale Step 5 |
| 5 | Export ZIP: `email.html` + `template.json` + `images/`, HTML funzionante offline | unit + manuale Step 6 |
| 6 | Import JSON e condivisione `#code/` funzionanti | manuale Step 6/7 |
| 7 | Shell conforme allo snapshot del portale host (header con gradiente, ricerca, lingua, utente; sidebar con menu e "Powered by") | confronto visivo Step 3/7 |
| 8 | UI bilingue IT/EN completa e persistente; nessuna stringa hardcoded | grep `t(` + manuale Step 7 |
| 9 | Editor disaccoppiato dalla shell (montabile da solo nel portale reale) | grep import Step 3/7 |
| 10 | Zero errori console, zero errori TS/ESLint, build production ok | Step 7 |
| 11 | Pacchetti `packages/*` e app MUI non modificati | `git diff --stat` limitato a `examples/editor-shadcn` e ai file di documentazione |

In caso di ambiguità non coperta da questo documento: scegliere la soluzione più semplice coerente con `frontend.md` e annotarla nel README dell'app, senza estendere lo scope.

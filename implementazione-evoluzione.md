# Piano di Implementazione per l'Evoluzione di email-builder-js

> **Documenti correlati:** `evoluzione-prd.md` (specifiche), `frontend.md` (tema shadcn/ui + lucide), `dev-prd-detail.md` (istruzioni operative per il generatore di codice).

## 1. Obiettivo

Convertire `email-builder-js` da libreria open source di authoring email basata su React/JSON in un modulo nativo enterprise per piattaforma di messaggistica omnicanale.

Il focus principale è:
- integrazione nativa in piattaforma proprietaria;
- pipeline di compilazione robusta e compatibile con client moderni e legacy;
- supporto mobile-first, dark mode, interattività CSS-only e governance aziendale;
- prevenzione del clipping Gmail e ottimizzazione del peso HTML.

---

## 2. Stato attuale e priorità tecnologiche

### 2.1 Stato attuale del progetto

Dal repository emerge un monorepo TypeScript (npm workspaces) con pacchetti React:
- `@usewaypoint/email-builder` (che espone `Reader` e `renderToStaticMarkup`) e blocchi email modulari (`block-*`, `document-core`);
- peer dependency React `^16 || ^17 || ^18`;
- TypeScript `^5.3.3`, build con `tsup` e test con `jest`;
- un'app demo `examples/vite-emailbuilder-mui` (Vite 5 + React 18 + MUI 5 + Zustand 4) con editor completo: drawer template di esempio, canvas, tab Edit/Preview/HTML/JSON, inspector laterale, import/download JSON e condivisione via hash URL (`#code/...`).

L'app demo è il punto di partenza per il nuovo frontend shadcn/ui descritto in `frontend.md`.

### 2.2 Priorità tecnologiche

1. Realizzare una pipeline compilazione `JSON -> MJML -> HTML`.
2. Estendere lo schema JSON per responsive, dark mode, locking e logiche dinamiche.
3. Aggiungere supporto templating nativo (Liquid/Handlebars) per l'integrazione piattaforma.
4. Implementare monitoraggio peso HTML e minificazione puntuale.
5. Garantire fallback Outlook/B2B e gestione brand kit con blocchi bloccabili.

---

## 3. Fasi tecnologiche da implementare

### 3.1 Pipeline di compilazione intermedia

- Introdurre un microservizio o modulo interno che traduce la configurazione JSON estesa in MJML.
- Compilare MJML in HTML finale con il compilatore ufficiale MJML.
- Validare il MJML generato per evitare tag sconosciuti o nodi orfani.

Risultati attesi:
- supporto automatico alle tabelle condizionali Outlook e VML per sfondi/bordi;
- miglior compatibilità legacy senza hack manuali di rendering email.

### 3.2 Estensione dello schema JSON

Aggiungere al modello JSON:
- `responsive` con varianti mobile e desktop;
- `dark_mode` con coppie di colori e asset dual-URL;
- `locking` per `styleLocked` / `contentLocked`;
- `designTokens` centralizzati per palette, tipografia e brand kit;
- campi per `templating` condizionale e iterativo.

### 3.3 Gestione dark mode e dual asset

- Implementare supporto `prefers-color-scheme` e selettori specifici Gmail (`[data-ogsc]`).
- Generare classi e regole MJML/CSS per alternate logo light/dark.
- Aggiungere preview toggle Light/Dark nell'interfaccia editor.

### 3.4 Componenti interattivi CSS-only

- Introdurre blocchi `carousel`, `accordion`, `image gallery` e `column inversion` basati su HTML/CSS compatibile.
- Fornire fallback B2B: testo espanso, griglie statiche, layout sequenziale.
- Evitare JavaScript nel rendering email.

### 3.5 Monitoraggio e ottimizzazione del peso HTML

- Implementare un modulo client/editor che misura la dimensione della stringa HTML in tempo reale.
- Mostrare indicatore visuale di soglia per i 100 KB (limite reale Gmail: ~102 KB).
- Applicare minificazione aggressiva in fase di export: rimozione spazi/commenti, accorpamento stili inline.

### 3.6 B2B / Outlook e governance Brand Kit

- Costruire stack font sicuri con fallback standardizzati e conditional CSS per Outlook.
- Definire `brand tokens` globali per palette, tipografia e loghi.
- Implementare proprietà bloccabili in UI per utenti con permessi operativi.

### 3.7 Integrazione nativa con la piattaforma di messaggistica

- Supportare costrutti di templating `Liquid` o `Handlebars` direttamente nei nodi del JSON.
- Aggiungere blocco `Product Block` con fetch asincrono dall'API interna della piattaforma.
- Map email JSON ai dati di invio dinamici: `if`, `for`, `{{ property }}`.

---

## 4. Librerie nuove da includere

### 4.1 Compilazione email e validazione

- `mjml` — compilatore MJML ufficiale (Node). La validazione è integrata nel compilatore stesso
  (opzione `validationLevel: 'strict'`): non serve un validatore separato.
- `mjml-browser` — variante browser del compilatore, utile per la preview MJML lato editor senza backend.
- `html-minifier-terser` — per minificare l'HTML finale.
- Nota: MJML produce già stili inline dove necessario; librerie di inlining aggiuntive (`juice`,
  `inline-css`) servono solo se si introducono CSS esterni alla pipeline MJML.

### 4.2 Templating per integrazione piattaforma

- `liquidjs` — motore Liquid lato JS.
- oppure `handlebars` se la piattaforma richiede handlebars.

### 4.3 Schema e validazione

- `zod` — già presente, da usare per validare il nuovo JSON esteso.
- eventualmente `@types/mjml` o tipizzazioni per MJML.

### 4.4 Integrazione e API

- usare la `fetch` nativa (disponibile in tutti i browser moderni e in Node ≥ 18): non servono
  `axios` né `cross-fetch` per i blocchi product-aware.

### 4.5 Demo: persistenza ed export

- `jszip` — creazione dell'archivio ZIP di export (HTML + JSON + immagini).
- `file-saver` (o download via `URL.createObjectURL`) — salvataggio del file lato browser.
- `localStorage` nativo per la persistenza dei template personali (nessuna libreria necessaria).

### 4.6 Strumenti di sviluppo e test

- per i pacchetti del monorepo: aggiornare `jest`, `ts-jest`, `@types/jest` all'ultima stabile compatibile;
- per la nuova app demo Vite: usare `vitest` + `@testing-library/react` (integrazione nativa con Vite);
- considerare `playwright` o simili per test di rendering HTML se necessario.

---

## 5. Standard da aggiornare

### 5.1 Dipendenze e versioni

- React peer dependency: standardizzare su `^18` (18.3.x) e rimuovere l'ancora obsoleto `^16 || ^17` se non serve compatibilità legacy.
- TypeScript: salire ad almeno `^5.6`.
- `tsup`: aggiornare all'ultima versione compatibile.
- `eslint` / `prettier`: allineare a versioni più recenti per il monorepo.

### 5.2 Configurazioni TypeScript

- unificare la target compilation a `ES2022` o `ES2023` nel `tsconfig.json`.
- aggiungere `lib` utili: `DOM`, `DOM.Iterable`, `ES2022`, `ES2023.String`.
- `moduleResolution`: usare `bundler` per le app Vite e `node16`/`nodenext` per i pacchetti
  compilati con tsup (il valore `node` è deprecato per i nuovi progetti).
- mantenere `skipLibCheck: true` solo se necessario.

### 5.3 Standard di rendering email

- formalizzare il principio: `no JavaScript in email`, `inline styles`, `fallback table layout`.
- definire soglia operativa di clipping: 100 KB HTML (limite reale Gmail: ~102 KB).
- adottare `MJML` come layer comune di compatibilità legacy.

---

## 6. Piano di esecuzione per step

### Step 0: Demo frontend shadcn/ui (prerequisito)

- realizzare la nuova app demo `examples/editor-shadcn` (Tailwind + shadcn/ui + lucide-react)
  secondo `frontend.md`, portando la logica esistente da `examples/vite-emailbuilder-mui`;
- includere gestione template prefatti, salvataggio in localStorage ed export ZIP;
- seguire gli step operativi, i test e i checkpoint definiti in `dev-prd-detail.md`.

### Step 1: Preparazione e allineamento architetturale

- aggiornare `package.json` e `tsconfig.json` con le nuove dipendenze e standard.
- creare un nuovo package o modulo `packages/email-builder-mjml` per la pipeline JSON->MJML.
- predisporre `README` e documentazione di sviluppo per la nuova architettura.

### Step 2: Definizione dello schema JSON esteso

- scrivere gli schemi `zod` per il JSON esteso con `responsive`, `dark_mode`, `locking`, `templating`.
- aggiornare i tipi `TReaderDocument`.
- mappare i nuovi campi sulle UI/componenti esistenti nel builder.

### Step 3: Implementazione del traduttore JSON->MJML

- realizzare un parser di trasformazione JSON in MJML.
- aggiungere test unitari per tutti i blocchi core e i campi estesi.
- validare il MJML generato e risolvere eventuali errori.

### Step 4: Compilazione e ottimizzazione HTML

- integrare `mjml` per ottenere HTML finale dal MJML.
- aggiungere pipeline di minificazione e inlining.
- creare il modulo `HTML Weight Monitor` che stima la dimensione finale.

### Step 5: Dark mode e dual asset

- supportare `dark_mode` nella generazione MJML/CSS.
- integrare la logica dual-asset per immagini e stili.
- creare preview dark/light nel builder.

### Step 6: Interattività CSS-only e fallback B2B

- aggiungere blocchi interattivi `carousel`, `accordion`, `image gallery`, `column inversion`.
- implementare fallback statico per Outlook e client legacy.
- testare rendering su casi d'uso mobile e desktop.

### Step 7: Governance Brand Kit e role-based locking

- implementare token globali centralizzati.
- aggiungere `styleLocked` / `contentLocked` al JSON.
- bloccare i controlli UI in base al ruolo utente.

### Step 8: Integrazione nativa con templating e product-aware block

- integrare `Liquid`/`Handlebars` in editor e in output.
- creare il blocco `Product Block` con chiamate API interne e caching.
- validare il passaggio dati dinamico e la compatibilità con l'infrastruttura platform.

### Step 9: QA, test di regressione e criteri di accettazione

- realizzare casi di test per:
  - MJML valido 100%;
  - peso HTML sotto 100 KB;
  - dark mode su Apple Mail / Gmail;
  - fallback accordion su Outlook;
  - font stack sicuro per Outlook.
- eseguire test end-to-end di rendering e comparare output HTML.

### Step 10: Documentazione, release e rollout

- aggiornare `README.md` e creare guida per l'integrazione nativa in piattaforma.
- documentare i nuovi schemi JSON e i blocchi aggiunti.
- pianificare rilascio progressivo: feature branch, PR review, stabilizzazione.

---

## 7. Metriche di successo

- generazione MJML valida al 100% senza tag sconosciuti;
- dimensione HTML inferiore a 100 KB per email standard;
- dual asset dark mode funzionante su Apple Mail iOS e Gmail App;
- componente accordion degradato a testo espanso su Outlook;
- Product Block popolato correttamente dai dati della piattaforma;
- demo shadcn/ui funzionante: template prefatti, CRUD template in localStorage, export ZIP completo (vedi criteri in `dev-prd-detail.md`).

---

## 8. Raccomandazioni finali

- adottare `MJML` come layer di compatibilità standard;
- utilizzare `zod` per validare lo schema esteso;
- ridurre la compatibilità React legacy a `^18` se la piattaforma lo permette;
- mantenere `no JS in email` e spostare logica dinamica sul JSON/templating.

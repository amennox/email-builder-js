# EVOLUZIONI V2 — Funzionalità avanzate (completamento del quadro)

> **Documenti correlati:** `evoluzione-prd.md`, `implementazione-evoluzione.md`, `evoluzioni-v1.md` (prerequisito: V1 completata).
>
> **Criterio di selezione V2:** interventi che richiedono backend, modifiche architetturali profonde (pipeline di rendering, modello dati), o integrazioni esterne. Stime per sviluppatore senior assistito da generatore di codice; dove indicato, il costo si riduce sensibilmente nell'integrazione con la piattaforma host perché si riusa infrastruttura esistente.

## 1. Elenco interventi V2 (ordinati per dipendenze)

| # | Intervento | Stima | Dipende da |
|---|---|---|---|
| V2.1 | Pipeline MJML (JSON → MJML → HTML) | 6–10 gg | — |
| V2.2 | Mobile overrides visivi per blocco | 4–8 gg | V2.1 |
| V2.3 | Dark mode email completa (dual asset) | 3–5 gg | V2.1 |
| V2.4 | Templating Liquid + Product Block | 4–8 gg | — (meglio dopo V2.1) |
| V2.5 | Persistenza cloud + versioning (adapter) | 4–8 gg | — |
| V2.6 | Media library + AI immagini | 8–15 gg | V2.5 (storage) |
| V2.7 | Synced blocks (moduli sincronizzati) | 5–8 gg | V2.5 |
| V2.8 | Commenti sui blocchi → realtime multiplayer | 3–5 gg / 15–25 gg | V2.5 |

**Totale V2: ~37–74 giorni** (la forbice dipende soprattutto da V2.6 e V2.8).

**Ordine consigliato:** V2.1 → V2.3 → V2.2 → V2.4 → V2.5 → V2.7 → V2.8 (commenti) → V2.6 → V2.8 (realtime, solo se la domanda lo giustifica).

---

## V2.1 Pipeline MJML — la fondazione di tutto

È l'intervento abilitante: senza media query e ghost tables generati da MJML, mobile overrides (V2.2) e dark mode (V2.3) non sono realizzabili nell'HTML finale, e la compatibilità Outlook resta non garantita.

- Nuovo package `packages/email-builder-mjml`: traduttore `TEditorConfiguration → MJML` per i 10 tipi di blocco (mappa indicativa: EmailLayout→`mj-body`, Container→`mj-section`/`mj-wrapper`, ColumnsContainer→`mj-section`+`mj-column`, Text→`mj-text`, Heading→`mj-text`, Button→`mj-button`, Image→`mj-image`, Avatar→`mj-image` con border-radius, Divider→`mj-divider`, Spacer→`mj-spacer`, Html→`mj-raw`).
- Compilazione: `mjml` (Node/microservizio) e `mjml-browser` (demo client-side) con `validationLevel: 'strict'`; minificazione `html-minifier-terser`.
- Nella demo: l'export ZIP e la tab HTML offrono lo switch "renderer classico / MJML"; confronto visivo dei due output.
- Test: snapshot MJML per ogni blocco e per i 9+2 template prefab; zero errori di validazione (criterio Blocker del PRD §7); verifica ghost tables `<!--[if mso]>` presenti nell'output.

**Rischi:** fedeltà visiva non identica al renderer attuale (MJML impone i suoi default di spacing) → prevedere una fase di tuning sui template prefab; alcune proprietà custom potrebbero richiedere `mj-raw`/attributi css-class.

## V2.2 Mobile overrides visivi per blocco

Il punto più richiesto dai designer. Estensione dello schema (PRD §2.2): campo opzionale `responsive.mobile` sui blocchi con sottoinsieme di proprietà (fontSize, padding, textAlign, `hidden: boolean`).

- **UI:** quando il toggle vista è su "Mobile", l'inspector mostra un interruttore "Override mobile" per proprietà supportata; i valori override sono evidenziati (badge `Smartphone`); azione "Ripristina da desktop". Pulsante "Nascondi su mobile" (`EyeOff`) nel TuneMenu.
- **Output:** classi generate (`.mob-{blockId}`) + media query `@media (max-width:480px)` con `!important`, via attributi `css-class` MJML; `hidden` mobile = `display:none !important` nella media query (e viceversa per blocchi solo-mobile).
- **Editor:** l'anteprima mobile applica gli override in tempo reale (qui basta il React renderer, gli override si applicano come stili condizionali).

**Accettazione:** un blocco con font 24px desktop / 16px mobile rende correttamente su entrambi in Litmus/Email on Acid (o test manuale Gmail iOS + Apple Mail); blocco nascosto su mobile assente visivamente ma email valida; documenti senza `responsive` invariati al byte.

## V2.3 Dark mode email completa

Implementa PRD §3.1 sull'output MJML: dual-asset per Image/Avatar (`darkUrl` opzionale + swap con `prefers-color-scheme: dark` e fallback `[data-ogsc]`/`[data-ogsb]` per Gmail), override colori `dark_mode` per blocco (campo già predisposto in V1.6), head style generato con entrambe le famiglie di selettori. Il toggle anteprima di V1.6 smette di essere simulazione e usa i valori reali.

**Accettazione:** logo light/dark switcha su Apple Mail iOS; colori override applicati su Gmail App Android (criterio "Media" del PRD §7); email senza campi dark invariate.

## V2.4 Templating Liquid + Product Block

- **Liquid:** `liquidjs` nella demo per la preview con dati di test editabili (pannello "Dati di prova" con JSON: `user`, `cart`, ecc.); nuovi blocchi `ConditionalContainer` (`{% if %}`) e `LoopContainer` (`{% for %}`) che wrappano children e in export emettono i tag Liquid grezzi attorno al markup (passthrough: sarà il motore della piattaforma a risolverli in invio); inserimento `{{ variabile }}` nei blocchi testo con autocomplete delle variabili note.
- **Product Block:** blocco che da SKU/ID compila immagine+titolo+prezzo+CTA. Nella demo: API mock (`src/ai`-style: `VITE_PRODUCTS_API_URL`, fallback a catalogo JSON locale di 10 prodotti demo); in piattaforma: endpoint interno reale. Cache in memoria, stato loading/error nel blocco.

**Accettazione:** preview con `{% if user.is_premium %}` mostra/nasconde la sezione cambiando i dati di prova; export contiene i tag Liquid intatti e HTML valido; Product Block popola i campi da mock e degrada con placeholder se l'API non risponde.

## V2.5 Persistenza cloud + versioning (pattern adapter)

Obiettivo: rimuovere il rischio "svuoto la cache e perdo tutto" SENZA costruire infrastruttura che la piattaforma host già possiede.

- Refactor: interfaccia `TemplateRepository` (`list/get/save/rename/duplicate/delete/listVersions/getVersion`) con due implementazioni: `LocalStorageRepository` (attuale) e `HttpRepository` (REST: `GET/POST/PUT/DELETE /templates`, `GET /templates/:id/versions`). Selezione via config.
- Per la demo standalone: mini-backend Node/Express + SQLite (un file, ~200 righe) che implementa il contratto, con versioning automatico a ogni save (snapshot JSON + timestamp + autore fittizio).
- UI versioni: pannello "Cronologia" con lista versioni, anteprima miniatura, ripristina (il ripristino crea una nuova versione, mai distruttivo).

**Accettazione:** swap repository senza modifiche alle viste; 50 versioni navigabili e ripristinabili; contract test eseguito su entrambe le implementazioni.

**Nota integrazione:** in piattaforma si implementa solo `HttpRepository` contro le API esistenti → la stima crolla a 2–3 gg.

## V2.6 Media library + AI immagini

Il pezzo più oneroso, da fare quando esiste storage (V2.5 o storage piattaforma).

- **Fase A — Media library (5–8 gg):** upload drag&drop, storage (S3-compatibile o piattaforma), griglia asset con ricerca, selezione dal pannello Image/Avatar al posto dell'URL manuale, compressione automatica lato upload (resize a max 1200px, WebP/JPEG qualità 80, target peso PRD §3.3), CDN URL.
- **Fase B — AI immagini (3–7 gg):** integrazioni via provider esterni configurabili (stesso pattern `.env`/proxy di V1.7): rimozione sfondo, outpainting/estensione, upscaling. Ogni operazione crea un nuovo asset (mai distruttiva).

**Accettazione:** A: upload→selezione→email esportata con URL CDN, immagine 5MB ridotta sotto 300KB automaticamente. B: bg-removal e outpainting funzionanti con almeno un provider; errori provider gestiti con toast, mai blocco dell'editor.

**Rischio:** costi e instabilità API dei provider AI immagini → feature flag per disattivarle singolarmente.

## V2.7 Synced blocks (moduli sincronizzati)

Design pragmatico, senza riscrivere il modello dati: nuovo tipo di nodo `SyncedBlock` che contiene solo `{ libraryId: string }`. Una "Libreria moduli" (persistita via `TemplateRepository`) conserva frammenti `TEditorConfiguration` nominati (es. "Footer aziendale"). Alla risoluzione (render, preview, export) il nodo viene espanso dal frammento corrente: modificare il modulo in libreria propaga automaticamente ovunque, perché i template contengono il riferimento, non la copia.

- UI: "Salva come modulo" dal TuneMenu di un Container; sezione "Moduli" nel menu aggiungi-blocco; i blocchi sincronizzati hanno bordo distintivo (`Link2`) e si modificano solo aprendo il modulo sorgente ("Modifica modulo… / Scollega copia locale").
- Edge case da testare: modulo eliminato (placeholder di avviso), cicli vietati (un modulo non può contenere SyncedBlock di sé stesso), export ZIP espande sempre.

**Accettazione:** modifica del footer in libreria visibile in 3 template che lo referenziano senza riaprirli; "scollega" crea copia indipendente; nessun ciclo possibile (test).

## V2.8 Collaborazione: prima i commenti, poi (eventuale) realtime

Approccio a due stadi, per il punto 3 della valutazione critica:

- **Stadio 1 — Commenti ancorati ai blocchi (3–5 gg):** thread di commenti per blockId persistiti via repository (V2.5), indicatore `MessageCircle` con contatore sul blocco, pannello laterale "Commenti" con risoluzione thread, menzioni semplici. Copre l'80% del bisogno reale di review aziendale.
- **Stadio 2 — Realtime multiplayer (15–25 gg, GO/NO-GO separato):** CRDT con Yjs (`y-websocket` o piattaforma realtime esistente), binding sullo store zustand del documento, presence (avatar + cursori/selezioni colorate), gestione conflitti inclusa nel CRDT, locking PRD §4.2 integrato come permesso di scrittura. Decidere solo con domanda utente verificata: è la voce con il peggior rapporto costo/beneficio per un modulo embedded.

**Accettazione (stadio 1):** due utenti (sessioni) vedono gli stessi thread; risoluzione e riapertura; commento su blocco eliminato resta consultabile nel pannello. (Stadio 2: criteri da definire nel suo PRD dedicato.)

---

## 2. Vincoli trasversali V2

- Ogni intervento mantiene la retrocompatibilità dei JSON esistenti (campi sempre opzionali, test di non-regressione sui template prefab inclusi gli Hospitality di V1.1).
- Pattern di configurazione esterna unificato (V1.7): endpoint e token sempre via `.env`/config, mai hardcoded; in produzione tutto passa dai proxy della piattaforma.
- Per V2.1–V2.3 il criterio di chiusura include un giro di test su client reali (minimo: Gmail web, Gmail App Android, Apple Mail iOS, Outlook Windows) o su servizio di preview (Litmus/Email on Acid).
- Aggiornare `evoluzione-prd.md` §7 (matrice di accettazione) man mano che i criteri V2 diventano requisiti di rilascio.

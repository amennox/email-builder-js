# EVOLUZIONI V1 — Quick win e consistenza prodotto

> **Documenti correlati:** `evoluzione-prd.md`, `frontend.md`, `dev-prd-detail.md` (demo già implementata in `examples/editor-shadcn`), `evoluzioni-v2.md` (piano avanzato).
>
> **Criterio di selezione V1:** ogni item è realizzabile in pochi giorni, non richiede backend, non dipende dalla pipeline MJML, e produce valore dimostrabile immediato. Stime per sviluppatore senior assistito da generatore di codice, livello demo/POC.

## 0. Premessa — Valutazione critica dell'analisi di partenza

L'analisi è valida e ben allineata al PRD: mobile overrides, AI come interfaccia primaria, governance B2B e la matrice dei gap colgono i punti giusti. Correzioni e integrazioni emerse dal confronto con il codice reale:

1. **Dipendenze tecniche non esplicitate.** Mobile overrides "veri" e dark mode email richiedono media query nell'HTML finale: il renderer attuale (`renderToStaticMarkup`) produce solo stili inline. Vanno quindi sequenziati DOPO la pipeline MJML (V2), altrimenti l'editor mostrerebbe effetti che l'export non può riprodurre. In V1 si fa solo ciò che non dipende da media query (inversione colonne via `dir=rtl`, anteprima dark nell'editor).
2. **Sicurezza AI.** Un token in `.env` di un'app Vite (`VITE_*`) finisce nel bundle client: accettabile per la demo, da dichiarare esplicitamente. L'architettura proposta (client OpenAI-compatible con endpoint/model/token configurabili) va predisposta per passare a un proxy server-side in produzione senza toccare i prompt.
3. **Multiplayer: ROI da verificare.** Stripo/BeeFree sono prodotti standalone; per un modulo embedded in piattaforma proprietaria il realtime in stile Figma è la voce più costosa dell'intera lista a fronte di un beneficio incerto. Meglio prima commenti ancorati ai blocchi + il locking già previsto dal PRD (V2, con realtime come opzione successiva).
4. **Persistenza cloud.** In produzione la persistenza sarà quella della piattaforma host: il valore non è costruire un backend, ma isolare un'interfaccia `TemplateRepository` (adapter) dietro cui stanno localStorage oggi e l'API piattaforma domani. L'**undo/redo locale** invece è un quick win autonomo e va anticipato in V1 (nell'analisi compare solo come "versioning cloud").
5. **Quick win assenti dall'analisi** e aggiunti qui: drag & drop dei blocchi (oggi solo frecce su/giù — gap di usabilità più visibile del tool), monitor peso HTML / Gmail clipping (già criterio "Alta" nel PRD, banale da fare), preflight accessibilità (alt-text mancanti, link vuoti).
6. **Dato "60% dark mode"**: plausibile ma da trattare come ordine di grandezza, non come fonte; la priorità resta comunque alta.
7. **Template Hospitality**: scelta giusta e a costo minimo; è l'item con il miglior rapporto valore/sforzo dell'intera lista.

---

## 1. Elenco interventi V1 (in ordine di esecuzione consigliato)

| # | Intervento | Stima | Valore |
|---|---|---|---|
| V1.1 | 2 template Hospitality (pre-stay / post-stay) | 1–2 gg | Demo commerciale |
| V1.2 | Undo / Redo locale | 0,5–1 gg | Usabilità di base |
| V1.3 | Monitor peso HTML (soglia Gmail 100 KB) | 0,5–1 gg | Requisito PRD |
| V1.4 | Drag & drop riordino blocchi | 2–4 gg | Usabilità chiave |
| V1.5 | Inversione colonne su mobile (toggle) | 1–2 gg | Gap analisi §Rendering |
| V1.6 | Anteprima dark mode (solo editor) | 1 gg | Primo passo dark mode |
| V1.7 | AI Assist v1: copywriting, traduzione, prompt-to-section | 3–5 gg | Gap analisi §AI |
| V1.8 | Preflight accessibilità e qualità | 1 gg | Credibilità enterprise |

**Totale V1: ~10–17 giorni.**

---

## V1.1 Template Hospitality "Hotel" (pre-stay e post-stay)

Due nuovi prefab in `src/getConfiguration/sample/` registrati in `prefabs.ts`: `hotel-pre-stay.ts` e `hotel-post-stay.ts`. Solo JSON, nessun codice nuovo.

**Direzione artistica** (ispirata a residenze storiche di design, tono "il tempo rallenta"):

- palette: verde bosco `#2F4A3C` (primario), salvia `#8FA98F`, crema `#F7F4EE` (sfondo), avorio `#FFFFFF` (canvas), terracotta `#C0764A` (accento CTA), testo `#2B2B27`;
- tipografia: heading Georgia/serif (eleganza, safe per email), body Helvetica/Arial; molto spazio bianco, divider sottili, bottoni squadrati o radius minimo;
- nome fittizio "Hotel" / "Grand Hotel" — nessun riferimento a strutture reali; immagini placeholder da URL Unsplash a tema (facciata liberty, camera, vigneto, colazione).

**Pre-stay ("Il suo soggiorno la attende"):** header con logo testuale; hero image; saluto personalizzato; riepilogo soggiorno (date, camera) in container su sfondo crema; sezione "I servizi che troverà" a 2 colonne × 2 righe (Spa & benessere, Ristorante, Bike & Golf, Concierge digitale); CTA terracotta "Completa il check-in online"; info arrivo (orari, parcheggio, contatti); footer verde bosco con indirizzo e social.

**Post-stay ("Grazie del suo soggiorno"):** hero più sobrio; ringraziamento; blocco feedback centrale con 5 stelle (immagine o caratteri ★) e CTA "Lasci la sua recensione"; incentivo ritorno (codice sconto in container bordato); cross-sell esperienza (es. degustazione); footer coerente.

**Accettazione:** entrambi i template validano con zod, si aprono dall'editor, esportano in ZIP con immagini, peso HTML < 100 KB, leggibili a 370px.

## V1.2 Undo / Redo locale

Integrare [`zundo`](https://github.com/charkour/zundo) (middleware temporal per zustand) sul solo campo `document` dello store `EditorContext`; bottoni `Undo2`/`Redo2` in toolbar + scorciatoie Cmd/Ctrl+Z, Shift+Cmd/Ctrl+Z; limite 100 step; reset history su `loadTemplate`.

**Accettazione:** 20 modifiche consecutive annullabili e ripristinabili; undo dopo delete blocco ripristina il blocco; history azzerata al cambio template.

## V1.3 Monitor peso HTML

Modulo `src/lib/htmlWeight.ts`: `new Blob([html]).size` calcolato con debounce (500 ms) sul documento corrente. Indicatore in toolbar: badge `42 KB` neutro sotto 80 KB, ambra 80–100 KB, rosso oltre 100 KB con tooltip che spiega il clipping Gmail (soglia operativa PRD §3.3). Stesso check in export ZIP con `toast.warning`.

**Accettazione:** unit test su soglie; indicatore aggiornato durante l'editing senza lag percepibile.

## V1.4 Drag & drop riordino blocchi

Con `@dnd-kit/core` + `@dnd-kit/sortable`: rendere trascinabili i blocchi figli all'interno dello stesso contenitore (EmailLayout, Container, colonne di ColumnsContainer); maniglia `GripVertical` nel TuneMenu; indicatore di inserimento (linea `bg-ring`); su drop si riordina `childrenIds`. Le frecce su/giù restano come fallback accessibile. Fuori scope V1: trascinare TRA contenitori diversi e dal menu "aggiungi blocco" (V2 se serve).

**Accettazione:** riordino fluido in tutti e tre i tipi di contenitore; nessuna perdita di blocchi (test su `childrenIds` prima/dopo); undo funziona sul riordino.

## V1.5 Inversione colonne su mobile (toggle)

Il blocco `ColumnsContainer` va internalizzato: copia del sorgente del pacchetto in `src/documents/blocks/ColumnsContainer/` (pattern già usato per Container/EmailLayout) con flag `reverseColumnsOnMobile: boolean` nello schema zod e toggle `Switch` nel pannello inspector. Render: tabella con `dir="rtl"` sul contenitore e `dir="ltr"` sulle celle quando attivo (tecnica PRD §3.2) — funziona senza media query, quindi è compatibile con il renderer attuale.

**Accettazione:** con toggle attivo l'ordine visivo desktop resta invariato e l'HTML esportato contiene `dir="rtl"`; anteprima mobile (370px) mostra le colonne impilate in ordine inverso; default off su tutti i template esistenti (retrocompatibilità JSON garantita da campo opzionale).

## V1.6 Anteprima dark mode (solo editor)

Toggle `SunMoon` nella tab Anteprima che applica al wrapper della preview una simulazione dell'inversione tipica dei client (filtro CSS o palette invertita "alla Gmail"). Dichiaratamente una **simulazione**: il banner info chiarisce che la gestione reale (dual asset, `[data-ogsc]`) arriva con la pipeline MJML (V2.3). Prepara però lo schema: aggiungere fin d'ora il campo opzionale `dark_mode` ai blocchi secondo PRD §2.2, così i template creati oggi saranno pronti.

**Accettazione:** toggle funzionante in Anteprima; campo `dark_mode` accettato dallo schema senza effetti sul render attuale.

## V1.7 AI Assist v1 (copywriting, traduzione, prompt-to-section)

Architettura (`src/ai/`):

- `client.ts`: chiamate **OpenAI-compatible** (`POST {baseUrl}/chat/completions`) con `baseUrl`, `model`, `apiKey` da `.env` (`VITE_AI_BASE_URL`, `VITE_AI_MODEL`, `VITE_AI_API_KEY`); `.env.example` nel repo, `.env` in `.gitignore`. **Nota di sicurezza obbligatoria nel README:** in Vite il token è visibile nel bundle → solo demo; per produzione lo stesso client punta a un proxy della piattaforma (basta cambiare `baseUrl`, zero modifiche ai prompt).
- `prompts/`: un file per caso d'uso (`rewrite.ts`, `translate.ts`, `generateSection.ts`), prompt ben identificabili e versionati nel sorgente come richiesto.
- Funzionalità UI:
  1. **Copywriting**: nel pannello dei blocchi Text/Heading/Button, menu `Sparkles` con azioni "Migliora", "Più formale", "Più persuasivo", "Accorcia" → sostituisce il testo del blocco (markdown preservato, istruito nel prompt);
  2. **Traduzione**: stessa posizione, "Traduci in…" (it/en/fr/de/es) mantenendo la formattazione;
  3. **Prompt-to-section**: bottone "Genera con AI" nel menu aggiungi-blocco → dialog con textarea ("Sezione con tre prodotti in offerta, sfondo azzurro, bottone rosso") → il modello restituisce un frammento `TEditorConfiguration` (structured output via `response_format: json_schema` derivato dagli schemi zod) → **validazione zod obbligatoria** prima dell'inserimento; in caso di output invalido, un retry automatico con l'errore in contesto, poi messaggio d'errore pulito.

Fuori scope V1 (→ V2): generazione dell'intera email da prompt, AI sulle immagini.

**Accettazione:** le 3 funzioni operano contro qualunque endpoint OpenAI-compatible configurato; nessun documento corrotto possibile (ogni inserimento passa da zod); senza `.env` configurato le voci AI sono disabilitate con tooltip esplicativo; token mai committato.

## V1.8 Preflight accessibilità e qualità

Pannello "Verifica" (icona `ClipboardCheck` in toolbar) con check statici sul JSON: immagini senza `alt`, bottoni/link senza `href` o con `#`, contrasto testo/sfondo < 4.5:1 (calcolo WCAG sui colori dei blocchi), peso oltre soglia (riusa V1.3). Lista problemi cliccabile → seleziona il blocco interessato.

**Accettazione:** ogni regola ha unit test con un documento volutamente difettoso; click sul problema apre il blocco nell'inspector.

---

## 2. Vincoli trasversali V1

- Stessi standard della demo: TypeScript strict, token shadcn, icone lucide, stringhe via `t()` (dizionari it/en aggiornati per ogni feature), test vitest per ogni modulo nuovo, commit per item.
- Nessuna nuova dipendenza oltre a: `zundo`, `@dnd-kit/core`, `@dnd-kit/sortable`.
- I pacchetti `packages/*` non si toccano: i blocchi da estendere si internalizzano in `src/documents/blocks/` (pattern già esistente).
- Ogni item aggiorna `README.md` dell'app.

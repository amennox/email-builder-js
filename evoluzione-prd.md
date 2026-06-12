# DOCUMENTO DI SPECIFICHE TECNICHE

### Evoluzione e potenziamento di email-builder-js per l'integrazione nativa in piattaforma di messaggistica omnicanale (Target 2026)

> **Documenti correlati:**
> - `implementazione-evoluzione.md` — piano di implementazione per fasi
> - `frontend.md` — specifiche del tema frontend (shadcn/ui + lucide)
> - `dev-prd-detail.md` — istruzioni operative per il generatore di codice (demo, step, test, checkpoint)

## 1. Introduzione e Obiettivi Strategici

Il presente documento definisce le specifiche tecniche necessarie per evolvere la libreria open-source
email-builder-js (progetto di partenza basato su React e JSON astratto) in un modulo di authoring email
enterprise competitivo per l'anno 2026. L'obiettivo primario è l'**integrazione nativa all'interno di una
piattaforma di messaggistica proprietaria**.

Considerando i trend del mercato 2026, lo sviluppo adotta una filosofia **Mobile & Web-First (B2C)**, area in cui
si concentra la grande maggioranza delle aperture complessive. Al contempo, il sistema introduce logiche strutturate di
_Graceful Degradation_ per mitigare i problemi di rendering dello stack legacy **B2B** (client desktop come
Microsoft Outlook), riducendo al minimo l'onere di manutenzione del codice senza compromettere la stabilità
del layout.

## 2. Architettura del Sistema e Pipeline di Compilazione

Il limite principale di email-builder-js risiede nella generazione diretta di HTML standard non ottimizzato
per i vincoli storici dei client di posta. Per ovviare a questo problema senza riscrivere un motore di rendering
proprietario, si introduce un'architettura a pipeline basata su un middleware di compilazione intermedio.

### 2.1 Pipeline di Generazione: JSON → MJML → HTML

Invece di mappare l'albero dei componenti React direttamente in nodi HTML, l'editor salverà lo stato in un
JSON esteso. In fase di export o invio, un modulo dedicato (eseguibile sia come microservizio sia come libreria
condivisa nel monorepo, es. `packages/email-builder-mjml`) tradurrà questo JSON nel markup **MJML
(Mailjet Markup Language)**, il quale verrà infine compilato nell'HTML finale tramite il compilatore ufficiale
MJML.

> **Motivazione strategica dell'uso di MJML.**
> L'adozione di MJML come layer intermedio risolve istantaneamente i problemi dei client legacy B2B
> (Outlook Windows). Il compilatore MJML inietta in automatico le tabelle condizionali Microsoft (_Ghost
> Tables_) e il codice VML per la gestione nativa di bordi, padding e allineamenti, sollevando il team dallo
> sviluppo di hack manuali. Il compilatore MJML include inoltre una validazione integrata
> (`validationLevel: 'strict'`) che intercetta tag sconosciuti o nodi orfani.

> **Nota di scope.** La pipeline MJML è il target architetturale per l'invio in produzione. La demo
> interattiva (vedi `dev-prd-detail.md`) usa inizialmente il renderer HTML già esistente
> (`renderToStaticMarkup` di `@usewaypoint/email-builder`) e prevede la pipeline MJML come export
> alternativo attivabile in una fase successiva.

### 2.2 Estensione dello Schema JSON (Esempio Strutturale)

Lo schema originale deve essere esteso per includere proprietà responsive native, token di design globali e
comportamenti interattivi. Di seguito la specifica del nuovo nodo astratto per un componente di tipo Bottone:

```json
{
  "type": "button",
  "id": "btn_98234",
  "content": "Acquista Ora",
  "style": {
    "padding": "12px 24px",
    "backgroundColor": "#0284c7",
    "color": "#ffffff",
    "fontFamily": "Arial, sans-serif"
  },
  "responsive": {
    "mobile": {
      "padding": "16px 32px",
      "fontSize": "16px",
      "display": "block"
    }
  },
  "dark_mode": {
    "backgroundColor": "#38bdf8",
    "color": "#0f172a"
  },
  "locking": {
    "styleLocked": true,
    "contentLocked": false
  }
}
```

## 3. Specifiche Funzionali Mobile-First & B2C (Core 2026)

Per garantire la massima competitività nei canali consumer, l'editor deve superare lo stato di visualizzatore
statico per supportare le abitudini di lettura su smartphone e webmail.

### 3.1 Gestione Avanzata del Dark Mode (Dual-Asset e Media Queries)

I client moderni (Gmail App, Apple Mail iOS) applicano inversioni di colore arbitrarie. Il builder deve integrare
un controllo granulare del tema scuro:

- **Toggle Anteprima:** interfaccia utente dotata di switch Light/Dark in tempo reale.
- **Dual-Asset Image Module:** possibilità di mappare due URL per lo stesso blocco immagine (es.
  `logo_light.png` e `logo_dark.png`). Il motore di rendering genererà classi CSS con media query
  `@media (prefers-color-scheme: dark)` associate ad attributi `display:none` condizionali.
- **Inversione Forzata su Gmail:** Gmail (app e webmail) non rispetta in modo affidabile
  `prefers-color-scheme`; è quindi necessaria la sovrascrittura dei colori tramite i selettori specifici
  `[data-ogsc]` (testo) e `[data-ogsb]` (sfondi).

### 3.2 Componenti Kinetic (Interattività CSS-Only)

Sfruttando il supporto completo ai fogli di stile avanzati di Apple Mail e di alcune webmail moderne, l'editor
implementerà blocchi interattivi privi di codice JavaScript (bloccato dai client per ragioni di sicurezza).
Si noti che Gmail rimuove i tag `<input>`: il fallback statico non riguarda quindi solo i client B2B legacy,
ma anche l'intero ecosistema Gmail.

| Componente Kinetic | Meccanismo Tecnico (CSS) | Fallback (Gmail / B2B) |
|---|---|---|
| Carosello Immagini | Tag `<input type="radio">` nascosti e selettori di prossimità (`:checked ~ .slide`) per scorrere le immagini al tap. | Galleria di immagini disposta in griglia verticale statica. |
| Menu a Fisarmonica (Accordion) | Tag nativi HTML5 `<details>` e `<summary>` stilizzati, oppure hack checkbox per espandere/comprimere sezioni di testo. | Testo completamente espanso di default. |
| Inversione Colonne Mobile | Tabelle con `dir="rtl"` sul contenitore e `dir="ltr"` sui nodi figli per modificare l'ordine visivo da [Testo \| Immagine] su desktop a [Immagine \| Testo] su mobile. | Layout desktop standard, incolonnato sequenzialmente. |

### 3.3 Ottimizzazione Peso e Prevenzione del "Gmail Clipping"

Gmail tronca i messaggi il cui codice HTML supera circa **102 KB**. Per sicurezza, la soglia operativa
di progetto è fissata a **100 KB**.

> **Rischio tecnico.**
> Il clipping interrompe il rendering dell'HTML, nasconde il link di disiscrizione (causando segnalazioni di
> spam) e mozza il pixel di tracciamento delle aperture posto in calce alla mail.

Il builder includerà un **Modulo di Monitoraggio Peso** che analizza la dimensione della stringa HTML
risultante ad ogni modifica dell'utente. Verrà mostrato un indicatore visivo nella barra di stato dell'editor. In
fase di export, il backend eseguirà una minificazione aggressiva eliminando spazi bianchi, commenti e
accorpando gli stili inline ridondanti.

## 4. Specifiche Funzionali B2B & Mitigazione Client Datati

Anche se marginale, il segmento aziendale richiede la salvaguardia della leggibilità dei messaggi sui client
desktop tradizionali (Outlook 2016-2019).

### 4.1 Robustezza Tipografica e Font Stacks

I client locali sprovvisti di connessione a internet esterna o con rigide policy di sicurezza bloccano i web font
(es. Google Fonts), forzando l'intero testo in _Times New Roman_ a causa di un noto bug di Outlook.

**Specifica di mitigazione:** l'interfaccia dell'editor applicherà rigidamente uno stack CSS strutturato. Ad ogni
font personalizzato selezionato dall'utente, il compilatore concatenerà una famiglia di fallback "safe"
standardizzata (es. `font-family: 'Montserrat', Arial, Helvetica, sans-serif;`). Sarà inoltre
inserito un tag di stile condizionale per forzare Outlook a interpretare correttamente la gerarchia:

```html
<!--[if mso]>
<style type="text/css">
  body, table, td, p, a { font-family: Arial, Helvetica, sans-serif !important; }
</style>
<![endif]-->
```

### 4.2 Brand Kits e Role-Based Property Locking (Governance)

Per gli account aziendali multifunzione, è imperativo proteggere l'identità visiva del brand. Il builder integrerà
logiche di blocco basate sul ruolo utente:

- **Design Tokens Globali:** definizione centralizzata di una palette colori immutabile, loghi ufficiali e stili di
  testo applicati a cascata su tutti i blocchi.
- **Proprietà Lucchettabili (Locking):** gli amministratori possono impostare il flag `styleLocked: true`
  nel JSON di un elemento. L'utente operativo (es. copywriter) potrà modificare il testo all'interno
  dell'interfaccia, ma i controlli di colore, font, padding e link saranno disabilitati nella sidebar.

## 5. Integrazione Nativa nella Piattaforma di Messaggistica

Il posizionamento del builder all'interno dell'infrastruttura proprietaria consente di azzerare i tempi di
esportazione e offre un'esperienza d'uso contestuale e automatizzata.

### 5.1 Deep Data Binding (Motore di Templating)

L'editor integrerà nativamente i costrutti logici del motore di invio della piattaforma (es. sintassi **Liquid** o
**Handlebars**). Tramite interfaccia visuale (drag & drop), l'utente potrà inserire nodi condizionali e iterativi
direttamente nell'albero dei componenti:

- `{% if user.is_premium %} ... {% endif %}`: blocco a visibilità condizionale basato sulle
  proprietà dell'anagrafica nel DB.
- `{% for item in cart.items %} ... {% endfor %}`: blocco ripetitore per la generazione di righe
  dinamiche (es. email transazionali di carrello abbandonato).

### 5.2 Blocchi "Product-Aware" tramite API Interna

Sfruttando la coesistenza nello stesso ecosistema software, verrà sviluppato un blocco speciale denominato
Product Block. L'utente inserisce nel pannello laterale unicamente l'ID o lo SKU del prodotto. L'editor
effettuerà una chiamata asincrona al database della piattaforma recuperando in tempo reale: titolo del
prodotto, descrizione ottimizzata, prezzo corrente e URL dell'immagine memorizzata sulla CDN proprietaria. I
campi si compileranno automaticamente nel JSON dell'email, riducendo a zero gli errori manuali di
inserimento dati.

## 6. Demo Applicativa (Requisito di Progetto)

Il progetto deve includere una **demo ben funzionante**, basata sul nuovo frontend shadcn/ui
(vedi `frontend.md`), con le seguenti capacità minime:

- **App shell identica al portale host:** header con logo su gradiente, ricerca template, selettore
  lingua IT/EN e sezione utente placeholder; sidebar di navigazione con menu (dashboard, editor,
  template, esportazioni) e box "Powered by". L'editor è disaccoppiato dalla shell per il futuro
  montaggio nel portale reale.
- **Gestione di template prefatti:** catalogo di template predefiniti (riusando i sample esistenti del
  repository) selezionabili come punto di partenza.
- **Salvataggio template:** creazione di template personali sia da zero sia modificando un prefatto
  (Salva / Salva come), con persistenza in `localStorage`, rinomina, duplicazione ed eliminazione.
- **Esportazione ZIP:** export di un archivio contenente l'HTML compilato, il JSON del template e tutte
  le immagini referenziate (con riscrittura dei riferimenti in path relativi).

Le specifiche operative complete della demo sono in `dev-prd-detail.md`.

## 7. Matrice dei Criteri di Accettazione e Sviluppo

La tabella seguente riassume le metriche e i criteri di conformità tecnologica richiesti per il rilascio in
produzione del modulo di modifica delle email:

| Area Modulo | Criterio di Accettazione Tecnico | Severità per il Rilascio |
|---|---|---|
| Parser JSON-to-MJML | Generazione di codice MJML valido al 100% senza tag sconosciuti o orfani. | Critica (Blocker) |
| Modulo Peso HTML | Blocco preventivo dell'invio o notifica bloccante se l'HTML finale supera i 100 KB. | Alta |
| Dark Mode Sync | Rendering corretto dei loghi alternativi su Apple Mail iOS 15+ e Gmail App Android. | Media |
| Fisarmonica CSS | Degradazione a testo espanso lineare su Outlook Desktop senza alterare la larghezza della tabella. | Bassa (Tollerabile) |
| Demo: template manager | CRUD completo dei template personali in localStorage; i prefatti non sono sovrascrivibili. | Alta |
| Demo: export ZIP | ZIP con `email.html`, `template.json` e `images/` coerenti; HTML apribile in browser con immagini locali. | Alta |
| Demo: UI shadcn | UI conforme a `frontend.md` (token shadcn, icone esclusivamente lucide, nessuna dipendenza MUI residua). | Alta |
| Demo: shell portale | Header e sidebar conformi allo snapshot del portale host; interfaccia bilingue IT/EN; editor montabile senza la shell. | Alta |

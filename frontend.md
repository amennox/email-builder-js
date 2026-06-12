# FRONTEND.MD — Tema dell'editor in stile shadcn/ui con icone lucide

> **Documenti correlati:** `evoluzione-prd.md` (specifiche di prodotto), `implementazione-evoluzione.md` (piano per fasi), `dev-prd-detail.md` (istruzioni operative per il generatore di codice).
>
> **Obiettivo:** rendere l'interfaccia dell'editor visivamente e tecnicamente identica al design system di [ui.shadcn.com](https://ui.shadcn.com) (stile **new-york**, palette **neutral**), con icone esclusivamente della serie **lucide** (`lucide-react`), perché l'editor verrà integrato in un progetto host che usa già questo template.

---

## 1. Decisione architetturale

L'app demo esistente (`examples/vite-emailbuilder-mui`) è costruita interamente su **MUI 5 + Emotion**. Imitare shadcn con un re-theming di MUI produrrebbe un risultato approssimativo e introdurrebbe in produzione due design system in conflitto (Emotion runtime + Tailwind del progetto host).

**Decisione: migrazione completa.** Si crea una nuova app `examples/editor-shadcn` che:

1. **riusa senza modifiche** i pacchetti del monorepo (`@usewaypoint/email-builder`, `@usewaypoint/block-*`, `@usewaypoint/document-core`) — questi generano l'HTML *dell'email*, non l'interfaccia, e non vanno toccati;
2. **porta la logica applicativa** dell'app MUI (store Zustand `EditorContext`, schema `documents/editor/core.tsx`, sample in `getConfiguration/sample/`, validazione import JSON) con modifiche minime;
3. **riscrive il layer di presentazione** (drawer, pannelli, input, dialog, menu) con Tailwind CSS + componenti shadcn/ui + lucide-react.

Vietato in `examples/editor-shadcn`: `@mui/*`, `@emotion/*`, `@mui/icons-material`, qualunque set di icone diverso da `lucide-react`.

---

## 2. Stack e inizializzazione

| Tecnologia | Versione | Note |
|---|---|---|
| Vite | ^5 (o superiore) | plugin `@vitejs/plugin-react-swc` |
| React | ^18.3 | allineato al resto del monorepo |
| TypeScript | ≥ 5.6 | `moduleResolution: bundler` |
| Tailwind CSS | v4 | configurazione CSS-first (`@import "tailwindcss"`) |
| shadcn/ui | CLI `shadcn@latest` | style **new-york**, base color **neutral**, CSS variables ON |
| lucide-react | ultima | unico set di icone ammesso |
| zustand | ^4 | riusato dall'app esistente |
| zod | ^3 | riusato dall'app esistente |

Comandi di setup (dalla cartella `examples/editor-shadcn`):

```bash
npm create vite@latest editor-shadcn -- --template react-swc-ts
npm install tailwindcss @tailwindcss/vite lucide-react zustand zod
npx shadcn@latest init     # style: new-york, base color: neutral, css variables: yes
npx shadcn@latest add button input label select slider switch tabs tooltip dialog \
  dropdown-menu separator scroll-area toggle-group textarea badge sonner alert-dialog popover
```

`components.json` atteso:

```json
{
  "style": "new-york",
  "rsc": false,
  "tsx": true,
  "tailwind": {
    "css": "src/index.css",
    "baseColor": "neutral",
    "cssVariables": true
  },
  "iconLibrary": "lucide",
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  }
}
```

---

## 3. Design tokens (devono coincidere con ui.shadcn.com)

In `src/index.css`, tema neutral standard shadcn (Tailwind v4, colori oklch). **Non inventare valori diversi:** questi sono i token generati da `shadcn init` con base color neutral e devono restare identici per garantire l'uniformità con il progetto host.

```css
@import "tailwindcss";
@import "tw-animate-css";

@custom-variant dark (&:is(.dark *));

:root {
  --radius: 0.625rem;
  --background: oklch(1 0 0);
  --foreground: oklch(0.145 0 0);
  --card: oklch(1 0 0);
  --card-foreground: oklch(0.145 0 0);
  --popover: oklch(1 0 0);
  --popover-foreground: oklch(0.145 0 0);
  --primary: oklch(0.205 0 0);
  --primary-foreground: oklch(0.985 0 0);
  --secondary: oklch(0.97 0 0);
  --secondary-foreground: oklch(0.205 0 0);
  --muted: oklch(0.97 0 0);
  --muted-foreground: oklch(0.556 0 0);
  --accent: oklch(0.97 0 0);
  --accent-foreground: oklch(0.205 0 0);
  --destructive: oklch(0.577 0.245 27.325);
  --border: oklch(0.922 0 0);
  --input: oklch(0.922 0 0);
  --ring: oklch(0.708 0 0);
}

.dark {
  --background: oklch(0.145 0 0);
  --foreground: oklch(0.985 0 0);
  --card: oklch(0.205 0 0);
  --card-foreground: oklch(0.985 0 0);
  --popover: oklch(0.205 0 0);
  --popover-foreground: oklch(0.985 0 0);
  --primary: oklch(0.922 0 0);
  --primary-foreground: oklch(0.205 0 0);
  --secondary: oklch(0.269 0 0);
  --secondary-foreground: oklch(0.985 0 0);
  --muted: oklch(0.269 0 0);
  --muted-foreground: oklch(0.708 0 0);
  --accent: oklch(0.269 0 0);
  --accent-foreground: oklch(0.985 0 0);
  --destructive: oklch(0.704 0.191 22.216);
  --border: oklch(1 0 0 / 10%);
  --input: oklch(1 0 0 / 15%);
  --ring: oklch(0.556 0 0);
}
```

Regole d'uso vincolanti:

- **mai colori hardcoded** nella UI dell'editor: solo classi semantiche (`bg-background`, `text-foreground`, `text-muted-foreground`, `border-border`, `bg-muted`, `bg-accent`, `text-destructive`, `ring-ring`); i colori hex restano legittimi solo *dentro il documento email* (canvas e color picker);
- tipografia: font UI di sistema o **Geist Sans** (come ui.shadcn.com); dimensione base dell'interfaccia `text-sm` (14px), label `text-sm font-medium`, testo secondario `text-xs text-muted-foreground` o `text-sm text-muted-foreground`;
- raggi: `rounded-md` per input e bottoni, `rounded-lg` per card/popover/dialog (derivati da `--radius`);
- ombre: minime — `shadow-xs`/`shadow-sm`; niente elevazioni materiali stile MUI;
- focus: `focus-visible:ring-[3px] focus-visible:ring-ring/50` (default dei componenti shadcn — non rimuoverlo);
- dark mode della UI: classe `dark` sull'elemento `html`, toggle nella toolbar (questa è la dark mode *dell'editor*; non confonderla con la preview dark mode *dell'email* descritta nel PRD §3.1).

---

## 4. Layout dell'applicazione

La demo replica la **shell del portale host** ("Hospitality for Human", vedi snapshot di riferimento): header superiore a tutta larghezza, sidebar di navigazione a sinistra, contenuto nella zona interna. **L'editor email vive esclusivamente nella zona interna** e non deve dipendere dalla shell: shell e editor sono componenti separati, così l'editor potrà essere montato tal quale dentro il portale reale.

```
┌──────────────────────────────────────────────────────────────────┐
│ HEADER h-16 border-b                                             │
│ [logo su gradiente] [ricerca template]      [IT/EN] [🔔] [utente]│
├────────────┬─────────────────────────────────────────────────────┤
│ SIDEBAR    │  ZONA INTERNA (vista attiva)                        │
│ NAV w-64   │                                                     │
│ border-r   │  - vista "Editor":  toolbar + canvas + inspector    │
│            │  - vista "Template": griglia card template          │
│ menu       │                                                     │
│ ...        │                                                     │
│ [powered   │                                                     │
│  by]       │                                                     │
└────────────┴─────────────────────────────────────────────────────┘
```

### 4.1 Header superiore — `h-16 border-b bg-background flex items-center`

Da sinistra a destra:

1. **Zona logo** — larghezza fissa pari alla sidebar (`w-64`), altezza piena, con gradiente orizzontale **esattamente**:
   `style="background-image: linear-gradient(to right, rgba(24, 24, 27, 0.05), rgba(0, 0, 0, 0));"`.
   Contenuto: logo prodotto (quadrato nero `size-8 rounded-md` con iniziale bianca, come placeholder) + nome prodotto `text-sm font-semibold` + etichetta "BETA" `text-[10px] text-muted-foreground uppercase` sotto il nome.
2. **Barra di ricerca template** — `Input` con icona `Search` a sinistra, `rounded-full bg-muted/50 border-transparent focus-visible:bg-background`, larghezza `max-w-md flex-1`, placeholder localizzato ("Cerca template..."). Digitando si apre un pannello risultati (`Popover` ancorato all'input) con i template — prefatti e personali — il cui nome matcha (case-insensitive); il click su un risultato apre il template nell'editor.
3. **Selettore lingua** — `DropdownMenu` con trigger `Button variant="ghost"` (icona `Languages` o bandierina emoji + sigla "IT"/"EN" + `ChevronDown`); voci: Italiano, English. Cambia tutte le stringhe dell'interfaccia (vedi §4.5) e persiste in localStorage `editor:locale`.
4. **Notifiche (placeholder)** — `Button variant="ghost" size="icon"` con `Bell` e pallino rosso `size-2 rounded-full bg-destructive` in alto a destra; al click un `Popover` "Nessuna notifica".
5. **Sezione utente** — avatar circolare `size-9 rounded-full bg-foreground text-background` con iniziali (es. "AM") + nome `text-sm font-medium` + email `text-xs text-muted-foreground` (nome/email fittizi hardcoded). `DropdownMenu`: **Profilo** (apre `Dialog` con form cambio password — campi e bottone presenti, submit che mostra solo `toast.success`: nessuna logica reale), `DropdownMenuSeparator`, **Logout** (icona `LogOut`, mostra solo un toast). Tutta la parte utente è **placeholder dichiarato**: serve all'omogeneità visiva, non va implementata alcuna autenticazione.

### 4.2 Sidebar di navigazione — `w-64 border-r bg-muted/30 flex flex-col`

Non contiene più la lista template (che diventa una vista interna, §4.4): è il **menu del portale**.

- Sezioni con label `text-[11px] font-medium text-muted-foreground uppercase tracking-wider px-4 pt-4 pb-1`.
- Voci di menu: `Button variant="ghost"` full-width, `h-9 px-4 justify-start gap-2 text-sm`, icona lucide `size-4`; voce attiva: `bg-accent text-accent-foreground font-medium` con indicatore a sinistra `absolute left-0 w-0.5 h-5 bg-foreground rounded-r`.
- Struttura menu della demo:

| Sezione | Voce | Icona lucide | Vista aperta |
|---|---|---|---|
| — | Dashboard | `LayoutDashboard` | vista placeholder con card statistiche fittizie (n. template, ultimo salvataggio, n. export) |
| EMAIL BUILDER | Editor | `Pencil` | vista Editor (§4.3) sul template corrente |
| EMAIL BUILDER | Template prefatti | `LayoutTemplate` | griglia card dei 9 prefatti (§4.4) |
| EMAIL BUILDER | I miei template | `FolderOpen` | griglia card dei template salvati (§4.4) |
| EMAIL BUILDER | Esportazioni | `FileArchive` | vista con lo storico export della sessione (nome, data, pulsante ri-esporta) |

- In fondo (`mt-auto border-t p-4`): **box "Powered by"** — contenitore `flex flex-col items-center gap-1 text-xs text-muted-foreground` con la scritta "Powered by" e un'immagine/logo placeholder (`<img>` da `src/assets/powered-by.svg`, altezza `h-5`, sostituibile dal cliente).

La navigazione tra viste è gestita da stato Zustand (`currentView`), **senza** react-router: l'hash URL resta riservato alla condivisione `#code/...`.

### 4.3 Vista Editor (zona interna)

È l'editor vero e proprio, autonomo dalla shell, composto da toolbar interna, canvas e inspector:

**Toolbar interna** — `h-12 border-b bg-background px-3 flex items-center justify-between`:

1. nome del template corrente (`text-sm font-medium`) + badge "non salvato" (`Badge variant="secondary"`) quando ci sono modifiche pendenti;
2. al centro: `Tabs` per Edit / Preview / HTML / JSON (componente shadcn `Tabs`, `TabsList` con sfondo `bg-muted`);
3. `ToggleGroup type="single"` per Desktop / Mobile (icone `Monitor`, `Smartphone`);
4. azioni a destra: Salva (`Button size="sm"` primario, icona `Save`), menu Esporta (`DropdownMenu`: "Esporta ZIP" con `FileArchive`, "Scarica JSON" con `Download`), Importa JSON (`Upload`), Condividi (`Share2`), toggle tema chiaro/scuro (`Sun`/`Moon`), toggle inspector (`PanelRight`).

**Canvas centrale:**

- sfondo `bg-muted/40`, area scrollabile (`ScrollArea` o `overflow-auto`);
- documento email centrato, `max-w-[600px]` (desktop) / `w-[370px]` (mobile), `bg-white border rounded-lg shadow-sm`;
- selezione blocco: outline `ring-2 ring-ring ring-offset-2`; hover: `outline outline-1 outline-border`;
- menu contestuale del blocco (ex `TuneMenu`): barra verticale flottante con `Button variant="ghost" size="icon"` per `ArrowUp`, `ArrowDown`, `Copy`, `Trash2`;
- placeholder "aggiungi blocco" (ex `PlaceholderButton`): area tratteggiata `border border-dashed border-border rounded-md text-muted-foreground hover:bg-accent` con icona `Plus`; il menu dei blocchi si apre in un `Popover`/`DropdownMenu` a griglia 3×N, ogni voce con icona lucide e label `text-xs`.

**Inspector destro** — `w-80 border-l`, collassabile: `Tabs` a due voci ("Stili" / "Blocco"); pannelli per blocco con gli input mappati come da §5; gruppi separati da `Separator`; ogni campo: `Label` + controllo, gap verticale `space-y-2`, gruppi `space-y-6`, padding pannello `p-4`.

### 4.4 Viste Template (prefatti e personali)

Griglia di card (`grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-4 p-6`), ogni card `border rounded-lg bg-card hover:shadow-sm transition-shadow`:

- miniatura: anteprima dell'email renderizzata in scala (iframe/`Reader` in container `aspect-[4/3] overflow-hidden border-b bg-white pointer-events-none`, contenuto scalato con `transform: scale(...)`);
- corpo card: nome `text-sm font-medium`, data ultima modifica `text-xs text-muted-foreground` (solo personali);
- azioni: click sulla card → apre nell'editor; per i personali `DropdownMenu` (`EllipsisVertical`) con Rinomina / Duplica / Esporta ZIP / Elimina (`AlertDialog`, `text-destructive`); per i prefatti azioni Apri e Duplica ("Usa come base");
- vista "I miei template" vuota → empty state centrato (icona `FolderOpen` grande `text-muted-foreground`, testo, bottone "Nuovo template" `Plus`);
- bottone **"Nuovo template"** in alto a destra della vista (`Button` con `Plus`).

### 4.5 Internazionalizzazione (IT/EN)

Tutte le stringhe della UI passano da un modulo i18n minimale interno (nessuna dipendenza esterna):

- `src/lib/i18n.ts`: dizionari `it.ts` e `en.ts` tipizzati (`Record<TranslationKey, string>`, chiavi unione TS così la mancanza di una chiave è errore di compilazione), hook `useT()` che legge la lingua dallo store, helper `t(key)`;
- lingua di default: `it`; persistenza in localStorage `editor:locale`;
- nessuna stringa visibile hardcoded nei componenti: sempre `t('...')`. I nomi dei template e il contenuto delle email NON si traducono.

---

## 5. Mappatura componenti MUI → shadcn/ui

| Uso nell'app attuale | Componente MUI | Sostituto shadcn/ui |
|---|---|---|
| Pannelli laterali | `Drawer variant="persistent"` | `aside` fisso con `transition-[width]` (no Sheet: i pannelli non sono overlay) |
| Tab principali, tab inspector | `Tabs`, `Tab` | `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent` |
| Toggle desktop/mobile, allineamento testo | `ToggleButtonGroup` | `ToggleGroup type="single"` |
| Bottoni icona | `IconButton` | `Button variant="ghost" size="icon"` |
| Campi testo / URL | `TextField` | `Label` + `Input` (o `Textarea` per contenuti multilinea) |
| Select (font family, font weight) | `TextField select` / `Select` | `Select`, `SelectTrigger`, `SelectContent`, `SelectItem` |
| Slider (border radius, larghezza colonne, spacer) | `Slider` | `Slider` |
| Boolean (es. testo barrato, full width) | `Switch` / `ToggleButton` | `Switch` + `Label` |
| Radio group (stili predefiniti) | `RadioGroup` | `RadioGroup` shadcn oppure `ToggleGroup` |
| Dialog import JSON | `Dialog` | `Dialog`, `DialogContent`, `DialogHeader`, `DialogFooter` |
| Conferme distruttive | `Dialog` | `AlertDialog` |
| Menu contestuali (TuneMenu, export) | `Menu`, `MenuItem` | `DropdownMenu` |
| Notifiche (copia link, salvataggio) | `Snackbar` | `sonner` (`toast.success(...)`) |
| Tooltip | `Tooltip` | `Tooltip` (con `TooltipProvider` alla radice) |
| Divisori | `Divider` | `Separator` |
| Color picker | `react-colorful` dentro `Popover` MUI | `react-colorful` (si mantiene) dentro `Popover` shadcn; swatch `size-8 rounded-md border` |
| Layout | `Stack`, `Box` | `div` + utility flex/grid Tailwind |
| Reset CSS | `CssBaseline` | preflight di Tailwind (automatico) |

---

## 6. Mappatura icone MUI → lucide

Tutte le icone provengono da `lucide-react`, dimensione standard `size-4` (16px) nella toolbar e negli input, `size-5` nel menu blocchi, `stroke-width` di default (2).

| Icona MUI attuale | lucide-react | Dove |
|---|---|---|
| `MenuOutlined` / `FirstPageOutlined` | `PanelLeft` / `PanelLeftClose` | toggle sidebar template |
| `LastPageOutlined` | `PanelRight` / `PanelRightClose` | toggle inspector |
| `EditOutlined` | `Pencil` | tab Edit |
| `PreviewOutlined` | `Eye` | tab Preview |
| `CodeOutlined` | `CodeXml` | tab HTML |
| `DataObjectOutlined` | `Braces` | tab JSON |
| `MonitorOutlined` | `Monitor` | toggle desktop |
| `PhoneIphoneOutlined` | `Smartphone` | toggle mobile |
| `FileDownloadOutlined` | `Download` | download JSON |
| `FileUploadOutlined` | `Upload` | import JSON |
| `IosShareOutlined` | `Share2` | condividi link |
| `CloseOutlined` | `X` | chiusura dialog |
| `AddOutlined` | `Plus` | aggiungi blocco / nuovo template |
| `DeleteOutlined` | `Trash2` | elimina blocco/template |
| `ContentCopyOutlined` | `Copy` | duplica blocco |
| `ArrowUpwardOutlined` / `ArrowDownwardOutlined` | `ArrowUp` / `ArrowDown` | sposta blocco |
| `FormatAlignLeftOutlined` / `Center` / `Right` | `AlignLeft` / `AlignCenter` / `AlignRight` | allineamento testo |
| `TextFieldsOutlined` | `Type` | dimensione font |
| `HeightOutlined` | `MoveVertical` | altezza spacer |
| `AspectRatioOutlined` | `Ratio` | dimensioni immagine |
| `RoundedCornerOutlined` | `Radius` | border radius |
| `AppRegistrationOutlined` | `SlidersHorizontal` | pannello stili |
| `HMobiledataOutlined` (blocco Heading) | `Heading1` | menu blocchi |
| `NotesOutlined` (Text) | `Text` | menu blocchi |
| `SmartButtonOutlined` (Button) | `MousePointerClick` | menu blocchi |
| `ImageOutlined` (Image) | `Image` | menu blocchi |
| `AccountCircleOutlined` (Avatar) | `CircleUserRound` | menu blocchi |
| `HorizontalRuleOutlined` (Divider) | `Minus` | menu blocchi |
| `Crop32Outlined` (Spacer) | `RectangleHorizontal` | menu blocchi |
| `HtmlOutlined` (Html) | `FileCode2` | menu blocchi |
| `ViewColumnOutlined` (Columns) | `Columns3` | menu blocchi |
| `LibraryAddOutlined` (Container) | `Container` | menu blocchi |
| — (nuove, editor) | `Save`, `FileArchive`, `Sun`, `Moon`, `EllipsisVertical` | salva, export ZIP, tema, menu voce template |
| — (nuove, shell) | `Search`, `Languages`, `Bell`, `LogOut`, `UserRound`, `KeyRound`, `ChevronDown` | ricerca, lingua, notifiche, logout, profilo, cambio password, dropdown |
| — (nuove, navigazione) | `LayoutDashboard`, `LayoutTemplate`, `FolderOpen`, `Plus` | menu sidebar e viste template |

Se un nome lucide indicato non esistesse nella versione installata, scegliere l'equivalente semanticamente più vicino dal catalogo lucide — mai ricorrere ad altri set di icone.

---

## 7. Struttura file attesa

```
examples/editor-shadcn/
├── components.json
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
└── src/
    ├── index.css                  # token shadcn (§3)
    ├── main.tsx                   # root + ThemeProvider (dark class) + Toaster (sonner)
    ├── assets/powered-by.svg      # logo placeholder per il box "Powered by"
    ├── lib/utils.ts               # cn() — generato da shadcn init
    ├── lib/i18n/                  # i18n minimale: index.ts (hook useT), it.ts, en.ts (§4.5)
    ├── components/ui/             # componenti generati dalla CLI shadcn (non modificare a mano)
    ├── components/shell/          # AppHeader (logo, ricerca, lingua, utente), AppSidebar (menu + powered by)
    ├── components/editor/         # toolbar interna, canvas, inspector, dialogs (autonomo dalla shell)
    ├── components/views/          # DashboardView, PrefabTemplatesView, MyTemplatesView, ExportsView
    ├── documents/                 # logica portata da vite-emailbuilder-mui (store, core, blocks)
    ├── templates/                 # sample prefatti + templateStore (localStorage)
    └── export/                    # generazione ZIP (vedi dev-prd-detail.md)
```

---

## 8. Criteri di accettazione del tema

- [ ] Nessuna dipendenza `@mui/*` o `@emotion/*` nel `package.json` di `examples/editor-shadcn`.
- [ ] Tutte le icone importate da `lucide-react`; zero import da altri set.
- [ ] `components.json` con `style: new-york`, `baseColor: neutral`, `cssVariables: true`.
- [ ] Nessun colore hardcoded nelle classi della UI (verifica: grep di `#[0-9a-fA-F]{3,6}` nei file di `components/editor/` non deve dare risultati, esclusi color picker e default dei documenti email).
- [ ] Dark mode della UI funzionante via classe `dark` su `html`.
- [ ] Confronto visivo side-by-side con ui.shadcn.com: bottoni, input, tabs, dialog e dropdown indistinguibili per colori, raggi, tipografia e stati di focus/hover.
- [ ] Shell conforme allo snapshot del portale host: header `h-16` con zona logo su gradiente (valore CSS esatto di §4.1), ricerca a pillola, selettore lingua, avatar con iniziali; sidebar con sezioni uppercase, voce attiva con indicatore, box "Powered by" in fondo.
- [ ] L'editor (`components/editor/`) non importa nulla da `components/shell/` né da `components/views/`: deve poter essere montato da solo nel portale reale.
- [ ] Tutte le stringhe UI passano da `t()`; cambio lingua IT/EN istantaneo e persistito.
- [ ] Parte utente (profilo, cambio password, logout) presente solo come placeholder visivo, senza logica di autenticazione.

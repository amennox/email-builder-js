# Email Builder — demo shadcn/ui

Demo dell'editor email con interfaccia in stile [shadcn/ui](https://ui.shadcn.com) (style **new-york**, palette **neutral**) e icone [lucide](https://lucide.dev), conforme a `frontend.md` e `dev-prd-detail.md` nella root del repository. Replica la shell del portale host (header con logo su gradiente, ricerca template, lingua IT/EN, utente placeholder; sidebar di navigazione con box "Powered by").

## Avvio

```bash
# dalla root del monorepo
npm install
# compila i pacchetti @usewaypoint/* (necessario al primo avvio)
for p in packages/*; do (cd $p && npx tsup ./src/index.ts* --outDir dist --format cjs,esm --dts); done

cd examples/editor-shadcn
npm run dev      # http://localhost:5173
npm run test     # vitest (35 test)
npm run build    # build di produzione
npm run preview  # smoke test della build
```

## Funzionalità

- **Shell del portale**: header h-16 con zona logo su gradiente, ricerca template (popover risultati su prefatti e personali), selettore lingua IT/EN persistito, notifiche e utente placeholder (profilo/cambio password/logout solo visivi, nessuna autenticazione reale).
- **Navigazione**: Dashboard (contatori reali), Editor, Template prefatti (9 sample read-only), I miei template (CRUD), Esportazioni (storico di sessione con ri-esporta). Stato in Zustand, nessun router; l'hash URL è riservato alla condivisione `#code/...`.
- **Editor**: tab Modifica/Anteprima/HTML/JSON, toggle desktop (600px) / mobile (370px), inspector collassabile (Stili/Blocco) con tutti i pannelli per i 10 tipi di blocco, tema chiaro/scuro dell'interfaccia.
- **Template**: salvataggio in `localStorage` (`emailbuilder:templates`), "Salva come" automatico sui prefatti, rinomina/duplica/elimina con conferme, guardia "modifiche non salvate" su cambio vista/template.
- **Export ZIP**: `email.html` (HTML compilato con path immagini riscritti in `images/`), `template.json` (riutilizzabile via Importa JSON), `images/` scaricate via fetch. Le immagini bloccate da CORS restano con URL assoluto e vengono segnalate: l'export non fallisce mai.
- **i18n**: dizionari tipizzati IT/EN (`src/lib/i18n`), chiave mancante = errore di compilazione.

## Architettura

```
src/
├── components/shell/     # header, sidebar, navigation (SOLO demo)
├── components/views/     # dashboard, template, esportazioni
├── components/editor/    # editor autonomo: NON importa mai dalla shell
├── components/ui/        # componenti shadcn/ui
├── documents/            # store zustand + blocchi (porting da vite-emailbuilder-mui)
├── templates/            # prefab + templateStore (localStorage)
├── export/               # exportZip + storico esportazioni
└── lib/i18n/             # dizionari it/en + useT()
```

`components/editor/` è disaccoppiato dalla shell: per l'integrazione nel portale reale si monta `EditorView` (più gli store in `documents/`, `templates/`, `export/`) dentro il layout esistente.

## Note

- I colori della UI usano esclusivamente i token shadcn (`bg-background`, `text-muted-foreground`, ...). Gli unici hex presenti sono i default del documento email e le palette del color picker.
- Lo storage corrotto in `localStorage` viene reimpostato con notifica all'avvio.

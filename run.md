npm install
# compila i pacchetti @usewaypoint/* (necessario al primo avvio)
for p in packages/*; do (cd $p && npx tsup ./src/index.ts* --outDir dist --format cjs,esm --dts); done

cd examples/editor-shadcn
npm run dev      # http://localhost:5173
npm run test     # vitest (35 test)
npm run build    # build di produzione
npm run preview  # smoke test della build
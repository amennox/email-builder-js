/** Prompt: generazione di una sezione email (prompt-to-layout) in JSON validato. */

const FORMAT_SPEC = `
Rispondi SOLO con un oggetto JSON valido, nessun testo extra. Formato:
{
  "blocks": { "<id>": <blocco>, ... },
  "order": ["<id radice 1>", ...]
}

"order" contiene gli id dei blocchi di primo livello della sezione, in ordine.
Ogni <blocco> ha forma { "type": <tipo>, "data": { "style": {...}, "props": {...} } }.

Tipi disponibili e props principali:
- "Heading": props { "text": string, "level": "h1"|"h2"|"h3" }
- "Text": props { "text": string, "markdown": true? }
- "Button": props { "text": string, "url": string, "buttonBackgroundColor": "#RRGGBB", "buttonTextColor": "#RRGGBB", "buttonStyle": "rectangle"|"rounded"|"pill", "size": "small"|"medium"|"large", "fullWidth": boolean }
- "Image": props { "url": string, "alt": string, "contentAlignment": "top"|"middle"|"bottom" }
- "Divider": props { "lineColor": "#RRGGBB", "lineHeight": number }
- "Spacer": props { "height": number }
- "Container": props { "childrenIds": [string] } — contenitore verticale; style può avere "backgroundColor", "borderRadius"
- "ColumnsContainer": props { "columnsCount": 2|3, "columnsGap": number, "columns": [{"childrenIds":[...]},{"childrenIds":[...]},{"childrenIds":[]}] } — "columns" ha SEMPRE 3 elementi, gli inutilizzati con childrenIds []

"style" comune (tutti opzionali): { "color": "#RRGGBB", "backgroundColor": "#RRGGBB", "fontSize": number, "textAlign": "left"|"center"|"right", "padding": {"top":n,"bottom":n,"left":n,"right":n} }

Regole:
- ogni id usato in childrenIds/columns DEVE esistere in "blocks";
- i blocchi referenziati da un contenitore NON vanno anche in "order";
- per le immagini usa URL https://images.unsplash.com/... reali e pertinenti, con "alt" descrittivo;
- testi nella stessa lingua della richiesta dell'utente.

Esempio minimo:
{"blocks":{"s1":{"type":"Heading","data":{"style":{"textAlign":"center","padding":{"top":16,"bottom":8,"left":24,"right":24}},"props":{"text":"Titolo","level":"h2"}}}},"order":["s1"]}
`;

export function buildGenerateSectionMessages(userPrompt: string, previousError?: string) {
  const messages = [
    {
      role: 'system' as const,
      content: 'Sei un designer di email. Generi sezioni email come JSON conforme alla specifica indicata.' + FORMAT_SPEC,
    },
    { role: 'user' as const, content: userPrompt },
  ];
  if (previousError) {
    messages.push({
      role: 'user' as const,
      content: `Il JSON precedente non era valido: ${previousError}. Correggi e rispondi di nuovo SOLO con il JSON.`,
    });
  }
  return messages;
}

import { TEditorConfiguration } from '../../documents/editor/core';

// Post-stay: ringraziamento + richiesta feedback + incentivo al ritorno.
const HOTEL_POST_STAY: TEditorConfiguration = {
  root: {
    type: 'EmailLayout',
    data: {
      backdropColor: '#F7F4EE',
      canvasColor: '#FFFFFF',
      textColor: '#2B2B27',
      fontFamily: 'BOOK_SANS',
      childrenIds: [
        'hpo-brand',
        'hpo-hero',
        'hpo-title',
        'hpo-thanks',
        'hpo-divider-1',
        'hpo-feedback-box',
        'hpo-divider-2',
        'hpo-return-box',
        'hpo-experience',
        'hpo-footer',
      ],
    },
  },
  'hpo-brand': {
    type: 'Heading',
    data: {
      style: {
        color: '#2F4A3C',
        fontFamily: 'MODERN_SERIF',
        textAlign: 'center',
        padding: { top: 32, bottom: 4, right: 24, left: 24 },
      },
      props: { text: 'GRAND HOTEL', level: 'h2' },
    },
  },
  'hpo-hero': {
    type: 'Image',
    data: {
      style: { padding: { top: 16, bottom: 0, right: 0, left: 0 } },
      props: {
        url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&q=70&auto=format&fit=crop',
        alt: 'Un tramonto sulle colline, come quelli del suo soggiorno',
        contentAlignment: 'middle',
      },
    },
  },
  'hpo-title': {
    type: 'Heading',
    data: {
      style: {
        color: '#2F4A3C',
        fontFamily: 'MODERN_SERIF',
        textAlign: 'center',
        padding: { top: 32, bottom: 8, right: 24, left: 24 },
      },
      props: { text: 'Grazie del suo soggiorno', level: 'h1' },
    },
  },
  'hpo-thanks': {
    type: 'Text',
    data: {
      style: {
        color: '#6B6B66',
        fontSize: 16,
        textAlign: 'center',
        padding: { top: 0, bottom: 24, right: 48, left: 48 },
      },
      props: {
        text: 'Gentile Anna, è stato un piacere averla nostra ospite. Speriamo che il tempo trascorso da noi le abbia lasciato il ricordo di un luogo dove tornare.',
      },
    },
  },
  'hpo-divider-1': {
    type: 'Divider',
    data: {
      style: { padding: { top: 8, bottom: 24, right: 48, left: 48 } },
      props: { lineColor: '#8FA98F', lineHeight: 1 },
    },
  },
  'hpo-feedback-box': {
    type: 'Container',
    data: {
      style: {
        backgroundColor: '#F7F4EE',
        borderRadius: 8,
        padding: { top: 32, bottom: 32, right: 32, left: 32 },
      },
      props: { childrenIds: ['hpo-feedback-title', 'hpo-stars', 'hpo-feedback-text', 'hpo-feedback-cta'] },
    },
  },
  'hpo-feedback-title': {
    type: 'Heading',
    data: {
      style: {
        color: '#2F4A3C',
        fontFamily: 'MODERN_SERIF',
        textAlign: 'center',
        padding: { top: 0, bottom: 8, right: 0, left: 0 },
      },
      props: { text: 'Com’è andata?', level: 'h2' },
    },
  },
  'hpo-stars': {
    type: 'Heading',
    data: {
      style: { color: '#C0764A', textAlign: 'center', padding: { top: 0, bottom: 8, right: 0, left: 0 } },
      props: { text: '★ ★ ★ ★ ★', level: 'h2' },
    },
  },
  'hpo-feedback-text': {
    type: 'Text',
    data: {
      style: { color: '#6B6B66', fontSize: 15, textAlign: 'center', padding: { top: 0, bottom: 16, right: 8, left: 8 } },
      props: {
        text: 'Due minuti del suo tempo ci aiutano a migliorare e aiutano altri viaggiatori a scegliere. Ci racconti la sua esperienza.',
      },
    },
  },
  'hpo-feedback-cta': {
    type: 'Button',
    data: {
      style: { textAlign: 'center', padding: { top: 0, bottom: 0, right: 0, left: 0 } },
      props: {
        text: 'Lasci la sua recensione',
        url: 'https://example.com/feedback',
        buttonBackgroundColor: '#C0764A',
        buttonTextColor: '#FFFFFF',
        buttonStyle: 'rounded',
        size: 'large',
        fullWidth: false,
      },
    },
  },
  'hpo-divider-2': {
    type: 'Divider',
    data: {
      style: { padding: { top: 24, bottom: 24, right: 48, left: 48 } },
      props: { lineColor: '#8FA98F', lineHeight: 1 },
    },
  },
  'hpo-return-box': {
    type: 'Container',
    data: {
      style: {
        backgroundColor: '#FFFFFF',
        borderColor: '#8FA98F',
        borderRadius: 8,
        padding: { top: 24, bottom: 24, right: 32, left: 32 },
      },
      props: { childrenIds: ['hpo-return-title', 'hpo-return-text'] },
    },
  },
  'hpo-return-title': {
    type: 'Heading',
    data: {
      style: { color: '#2F4A3C', textAlign: 'center', padding: { top: 0, bottom: 8, right: 0, left: 0 } },
      props: { text: 'Un invito a tornare', level: 'h3' },
    },
  },
  'hpo-return-text': {
    type: 'Text',
    data: {
      style: { textAlign: 'center', fontSize: 15, padding: { top: 0, bottom: 0, right: 0, left: 0 } },
      props: {
        markdown: true,
        text: 'Per il suo prossimo soggiorno, il **10% di sconto** prenotando dal nostro sito.\n\nCodice: **BENTORNATA10** · valido 12 mesi',
      },
    },
  },
  'hpo-experience': {
    type: 'ColumnsContainer',
    data: {
      style: { padding: { top: 24, bottom: 8, right: 24, left: 24 } },
      props: {
        columnsCount: 2,
        columnsGap: 24,
        contentAlignment: 'middle',
        columns: [
          { childrenIds: ['hpo-exp-img'] },
          { childrenIds: ['hpo-exp-title', 'hpo-exp-text'] },
          { childrenIds: [] },
        ],
      },
    },
  },
  'hpo-exp-img': {
    type: 'Image',
    data: {
      style: { padding: { top: 8, bottom: 8, right: 0, left: 0 } },
      props: {
        url: 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=600&q=70&auto=format&fit=crop',
        alt: 'Degustazione di vini del territorio',
        contentAlignment: 'middle',
      },
    },
  },
  'hpo-exp-title': {
    type: 'Heading',
    data: {
      style: { color: '#2F4A3C', textAlign: 'left', padding: { top: 8, bottom: 4, right: 8, left: 8 } },
      props: { text: 'La prossima volta: la cantina', level: 'h3' },
    },
  },
  'hpo-exp-text': {
    type: 'Text',
    data: {
      style: { color: '#6B6B66', fontSize: 14, textAlign: 'left', padding: { top: 0, bottom: 8, right: 8, left: 8 } },
      props: {
        text: 'Una degustazione guidata dei vini della nostra tenuta, tra i filari a pochi passi dall’hotel.',
      },
    },
  },
  'hpo-footer': {
    type: 'Container',
    data: {
      style: { backgroundColor: '#2F4A3C', padding: { top: 24, bottom: 24, right: 24, left: 24 } },
      props: { childrenIds: ['hpo-footer-text'] },
    },
  },
  'hpo-footer-text': {
    type: 'Text',
    data: {
      style: { color: '#F7F4EE', fontSize: 12, textAlign: 'center', padding: { top: 0, bottom: 0, right: 0, left: 0 } },
      props: {
        markdown: true,
        text: 'GRAND HOTEL · Viale dei Tigli 36 · Instagram · Facebook\n\nRiceve questa email perché è stata nostra ospite. Annulla iscrizione',
      },
    },
  },
};

export default HOTEL_POST_STAY;

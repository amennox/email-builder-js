import { TEditorConfiguration } from '../../documents/editor/core';

// Palette Hospitality: verde bosco #2F4A3C, salvia #8FA98F, crema #F7F4EE,
// terracotta #C0764A, testo #2B2B27. Heading serif, body sans.
const HOTEL_PRE_STAY: TEditorConfiguration = {
  root: {
    type: 'EmailLayout',
    data: {
      backdropColor: '#F7F4EE',
      canvasColor: '#FFFFFF',
      textColor: '#2B2B27',
      fontFamily: 'BOOK_SANS',
      childrenIds: [
        'hps-brand',
        'hps-hero',
        'hps-title',
        'hps-greeting',
        'hps-stay-box',
        'hps-divider-1',
        'hps-services-title',
        'hps-services-row-1',
        'hps-services-row-2',
        'hps-cta',
        'hps-divider-2',
        'hps-arrival-title',
        'hps-arrival-text',
        'hps-footer',
      ],
    },
  },
  'hps-brand': {
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
  'hps-hero': {
    type: 'Image',
    data: {
      style: { padding: { top: 16, bottom: 0, right: 0, left: 0 } },
      props: {
        url: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=1200&q=70&auto=format&fit=crop',
        alt: 'La facciata storica del nostro hotel immersa nel verde',
        contentAlignment: 'middle',
      },
    },
  },
  'hps-title': {
    type: 'Heading',
    data: {
      style: {
        color: '#2F4A3C',
        fontFamily: 'MODERN_SERIF',
        textAlign: 'center',
        padding: { top: 32, bottom: 8, right: 24, left: 24 },
      },
      props: { text: 'Il suo soggiorno la attende', level: 'h1' },
    },
  },
  'hps-greeting': {
    type: 'Text',
    data: {
      style: {
        color: '#6B6B66',
        fontSize: 16,
        textAlign: 'center',
        padding: { top: 0, bottom: 24, right: 48, left: 48 },
      },
      props: {
        text: 'Gentile Anna, manca poco al suo arrivo. Abbiamo preparato ogni dettaglio perché il tempo, da noi, scorra più lentamente.',
      },
    },
  },
  'hps-stay-box': {
    type: 'Container',
    data: {
      style: {
        backgroundColor: '#F7F4EE',
        borderRadius: 8,
        padding: { top: 24, bottom: 24, right: 32, left: 32 },
      },
      props: { childrenIds: ['hps-stay-title', 'hps-stay-details'] },
    },
  },
  'hps-stay-title': {
    type: 'Heading',
    data: {
      style: { color: '#2F4A3C', textAlign: 'center', padding: { top: 0, bottom: 8, right: 0, left: 0 } },
      props: { text: 'Il suo soggiorno', level: 'h3' },
    },
  },
  'hps-stay-details': {
    type: 'Text',
    data: {
      style: { textAlign: 'center', fontSize: 15, padding: { top: 0, bottom: 0, right: 0, left: 0 } },
      props: {
        markdown: true,
        text: '**Check-in** venerdì 26 giugno, dalle 15:00\n\n**Check-out** domenica 28 giugno, entro le 11:00\n\n**Camera** Suite "Alba" — vista giardino',
      },
    },
  },
  'hps-divider-1': {
    type: 'Divider',
    data: {
      style: { padding: { top: 32, bottom: 16, right: 48, left: 48 } },
      props: { lineColor: '#8FA98F', lineHeight: 1 },
    },
  },
  'hps-services-title': {
    type: 'Heading',
    data: {
      style: {
        color: '#2F4A3C',
        fontFamily: 'MODERN_SERIF',
        textAlign: 'center',
        padding: { top: 8, bottom: 16, right: 24, left: 24 },
      },
      props: { text: 'I servizi che troverà', level: 'h2' },
    },
  },
  'hps-services-row-1': {
    type: 'ColumnsContainer',
    data: {
      style: { padding: { top: 0, bottom: 0, right: 24, left: 24 } },
      props: {
        columnsCount: 2,
        columnsGap: 24,
        columns: [
          { childrenIds: ['hps-svc-spa-img', 'hps-svc-spa-title', 'hps-svc-spa-text'] },
          { childrenIds: ['hps-svc-rest-img', 'hps-svc-rest-title', 'hps-svc-rest-text'] },
          { childrenIds: [] },
        ],
      },
    },
  },
  'hps-svc-spa-img': {
    type: 'Image',
    data: {
      style: { padding: { top: 8, bottom: 8, right: 0, left: 0 } },
      props: {
        url: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=600&q=70&auto=format&fit=crop',
        alt: 'Spa e area benessere',
        contentAlignment: 'middle',
      },
    },
  },
  'hps-svc-spa-title': {
    type: 'Heading',
    data: {
      style: { color: '#2F4A3C', textAlign: 'center', padding: { top: 0, bottom: 4, right: 8, left: 8 } },
      props: { text: 'Spa & Benessere', level: 'h3' },
    },
  },
  'hps-svc-spa-text': {
    type: 'Text',
    data: {
      style: { color: '#6B6B66', fontSize: 14, textAlign: 'center', padding: { top: 0, bottom: 16, right: 8, left: 8 } },
      props: { text: 'Sauna, percorso sensoriale e massaggi su prenotazione.' },
    },
  },
  'hps-svc-rest-img': {
    type: 'Image',
    data: {
      style: { padding: { top: 8, bottom: 8, right: 0, left: 0 } },
      props: {
        url: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=70&auto=format&fit=crop',
        alt: 'Il nostro ristorante',
        contentAlignment: 'middle',
      },
    },
  },
  'hps-svc-rest-title': {
    type: 'Heading',
    data: {
      style: { color: '#2F4A3C', textAlign: 'center', padding: { top: 0, bottom: 4, right: 8, left: 8 } },
      props: { text: 'Ristorante', level: 'h3' },
    },
  },
  'hps-svc-rest-text': {
    type: 'Text',
    data: {
      style: { color: '#6B6B66', fontSize: 14, textAlign: 'center', padding: { top: 0, bottom: 16, right: 8, left: 8 } },
      props: { text: 'Cucina del territorio con ingredienti del nostro orto.' },
    },
  },
  'hps-services-row-2': {
    type: 'ColumnsContainer',
    data: {
      style: { padding: { top: 0, bottom: 8, right: 24, left: 24 } },
      props: {
        columnsCount: 2,
        columnsGap: 24,
        columns: [
          { childrenIds: ['hps-svc-bike-img', 'hps-svc-bike-title', 'hps-svc-bike-text'] },
          { childrenIds: ['hps-svc-conc-img', 'hps-svc-conc-title', 'hps-svc-conc-text'] },
          { childrenIds: [] },
        ],
      },
    },
  },
  'hps-svc-bike-img': {
    type: 'Image',
    data: {
      style: { padding: { top: 8, bottom: 8, right: 0, left: 0 } },
      props: {
        url: 'https://images.unsplash.com/photo-1471506480208-91b3a4cc78be?w=600&q=70&auto=format&fit=crop',
        alt: 'Percorsi bike tra le colline',
        contentAlignment: 'middle',
      },
    },
  },
  'hps-svc-bike-title': {
    type: 'Heading',
    data: {
      style: { color: '#2F4A3C', textAlign: 'center', padding: { top: 0, bottom: 4, right: 8, left: 8 } },
      props: { text: 'Bike & Golf', level: 'h3' },
    },
  },
  'hps-svc-bike-text': {
    type: 'Text',
    data: {
      style: { color: '#6B6B66', fontSize: 14, textAlign: 'center', padding: { top: 0, bottom: 16, right: 8, left: 8 } },
      props: { text: 'Colonnina bici attrezzata e campi da golf a pochi minuti.' },
    },
  },
  'hps-svc-conc-img': {
    type: 'Image',
    data: {
      style: { padding: { top: 8, bottom: 8, right: 0, left: 0 } },
      props: {
        url: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=600&q=70&auto=format&fit=crop',
        alt: 'Concierge digitale sul suo smartphone',
        contentAlignment: 'middle',
      },
    },
  },
  'hps-svc-conc-title': {
    type: 'Heading',
    data: {
      style: { color: '#2F4A3C', textAlign: 'center', padding: { top: 0, bottom: 4, right: 8, left: 8 } },
      props: { text: 'Concierge digitale', level: 'h3' },
    },
  },
  'hps-svc-conc-text': {
    type: 'Text',
    data: {
      style: { color: '#6B6B66', fontSize: 14, textAlign: 'center', padding: { top: 0, bottom: 16, right: 8, left: 8 } },
      props: { text: 'Apra la camera con lo smartphone e prenoti i servizi in chat.' },
    },
  },
  'hps-cta': {
    type: 'Button',
    data: {
      style: { textAlign: 'center', padding: { top: 16, bottom: 16, right: 24, left: 24 } },
      props: {
        text: 'Completi il check-in online',
        url: 'https://example.com/check-in',
        buttonBackgroundColor: '#C0764A',
        buttonTextColor: '#FFFFFF',
        buttonStyle: 'rounded',
        size: 'large',
        fullWidth: false,
      },
    },
  },
  'hps-divider-2': {
    type: 'Divider',
    data: {
      style: { padding: { top: 16, bottom: 16, right: 48, left: 48 } },
      props: { lineColor: '#8FA98F', lineHeight: 1 },
    },
  },
  'hps-arrival-title': {
    type: 'Heading',
    data: {
      style: { color: '#2F4A3C', textAlign: 'center', padding: { top: 0, bottom: 8, right: 24, left: 24 } },
      props: { text: 'Come raggiungerci', level: 'h3' },
    },
  },
  'hps-arrival-text': {
    type: 'Text',
    data: {
      style: { color: '#6B6B66', fontSize: 14, textAlign: 'center', padding: { top: 0, bottom: 32, right: 48, left: 48 } },
      props: {
        markdown: true,
        text: 'Viale dei Tigli 36 — parcheggio riservato agli ospiti.\n\nPer ogni esigenza: **+39 000 0000000** · hello@grandhotel.example',
      },
    },
  },
  'hps-footer': {
    type: 'Container',
    data: {
      style: { backgroundColor: '#2F4A3C', padding: { top: 24, bottom: 24, right: 24, left: 24 } },
      props: { childrenIds: ['hps-footer-text'] },
    },
  },
  'hps-footer-text': {
    type: 'Text',
    data: {
      style: { color: '#F7F4EE', fontSize: 12, textAlign: 'center', padding: { top: 0, bottom: 0, right: 0, left: 0 } },
      props: {
        markdown: true,
        text: 'GRAND HOTEL · Viale dei Tigli 36 · Instagram · Facebook\n\nRiceve questa email perché ha una prenotazione presso la nostra struttura. Annulla iscrizione',
      },
    },
  },
};

export default HOTEL_PRE_STAY;

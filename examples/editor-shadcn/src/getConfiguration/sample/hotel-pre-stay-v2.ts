import { TEditorConfiguration } from '../../documents/editor/core';

// Palette The Hotel: deep forest #33433B, sage #A9C4A6, warm gold #A9854F,
// cream canvas #F6F2EA, warm backdrop #EAE4D7, body text #55524A.
// Typography: Cormorant Garamond (serif headings) + Jost (sans body).
const HOTEL_PRE_STAY_V2: TEditorConfiguration = {
  root: {
    type: 'EmailLayout',
    data: {
      backdropColor: '#EAE4D7',
      canvasColor: '#F6F2EA',
      textColor: '#55524A',
      fontFamily: 'GEOMETRIC_SANS',
      childrenIds: [
        'hps2-header',
        'hps2-divider1',
        'hps2-hero',
        'hps2-eyebrow',
        'hps2-title',
        'hps2-greeting',
        'hps2-reservation-box',
        'hps2-goodtoknow-label',
        'hps2-goodtoknow-title',
        'hps2-goodtoknow-list',
        'hps2-divider2',
        'hps2-lumi',
        'hps2-addons-label',
        'hps2-addons-title',
        'hps2-addons-row1',
        'hps2-addons-row2',
        'hps2-region-label',
        'hps2-region-title',
        'hps2-region-body',
        'hps2-region-images',
        'hps2-region-cta',
        'hps2-contact',
        'hps2-footer',
      ],
    },
  },
  'hps2-header': {
    type: 'Container',
    data: {
      style: {
        backgroundColor: '#F6F2EA',
        padding: { top: 30, bottom: 22, right: 40, left: 40 },
      },
      props: { childrenIds: ['hps2-header-row'] },
    },
  },
  'hps2-header-row': {
    type: 'ColumnsContainer',
    data: {
      style: { backgroundColor: '#F6F2EA' },
      props: {
        columnsCount: 2,
        columnsGap: 16,
        columns: [
          { childrenIds: ['hps2-logo'] },
          { childrenIds: ['hps2-location'] },
          { childrenIds: [] },
        ],
      },
    },
  },
  'hps2-logo': {
    type: 'Image',
    data: {
      style: { padding: { top: 0, bottom: 0, right: 0, left: 0 } },
      props: {
        url: 'https://placehold.co/180x40/33433B/F6F2EA?text=The+Hotel',
        alt: 'The Hotel',
        width: 180,
        contentAlignment: 'middle',
      },
    },
  },
  'hps2-location': {
    type: 'Text',
    data: {
      style: {
        color: '#6E7A6C',
        fontSize: 11,
        fontFamily: 'GEOMETRIC_SANS',
        textAlign: 'right',
        padding: { top: 8, bottom: 0, right: 0, left: 0 },
      },
      props: { text: 'Montebelluna · Italy' },
    },
  },
  'hps2-divider1': {
    type: 'Divider',
    data: {
      style: { padding: { top: 0, bottom: 0, right: 40, left: 40 } },
      props: { lineColor: '#E1D9C8', lineHeight: 1 },
    },
  },
  'hps2-hero': {
    type: 'Image',
    data: {
      style: { padding: { top: 0, bottom: 0, right: 0, left: 0 } },
      props: {
        url: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=1200&q=70&auto=format&fit=crop',
        alt: 'A guest room at The Hotel, with wood ceiling and natural light',
        width: 600,
        height: 240,
        contentAlignment: 'middle',
      },
    },
  },
  'hps2-eyebrow': {
    type: 'Text',
    data: {
      style: {
        color: '#A9854F',
        fontSize: 12,
        fontFamily: 'GEOMETRIC_SANS',
        textAlign: 'center',
        padding: { top: 44, bottom: 18, right: 56, left: 56 },
      },
      props: { text: 'YOUR ARRIVAL IS NEAR' },
    },
  },
  'hps2-title': {
    type: 'Heading',
    data: {
      style: {
        color: '#33433B',
        fontFamily: 'MODERN_SERIF',
        textAlign: 'center',
        padding: { top: 0, bottom: 8, right: 56, left: 56 },
      },
      props: { text: 'We look forward to welcoming you, {{guest_first_name}}.', level: 'h1' },
    },
  },
  'hps2-greeting': {
    type: 'Text',
    data: {
      style: {
        color: '#55524A',
        fontSize: 16,
        fontFamily: 'GEOMETRIC_SANS',
        fontWeight: 'normal',
        textAlign: 'center',
        padding: { top: 22, bottom: 40, right: 62, left: 62 },
      },
      props: {
        text: 'In a refined historic residence where time seems to stand still, every detail has been considered for your comfort. Here is everything you need to know before you arrive — so that, from your very first step, you can simply relax.',
      },
    },
  },
  'hps2-reservation-box': {
    type: 'Container',
    data: {
      style: {
        backgroundColor: '#33433B',
        borderRadius: 4,
        padding: { top: 34, bottom: 34, right: 40, left: 40 },
      },
      props: {
        childrenIds: [
          'hps2-reservation-label',
          'hps2-reservation-confirmation',
          'hps2-reservation-dates',
          'hps2-reservation-divider',
          'hps2-reservation-roomrow',
          'hps2-manage-button',
        ],
      },
    },
  },
  'hps2-reservation-label': {
    type: 'Text',
    data: {
      style: {
        color: '#A9C4A6',
        fontSize: 11,
        fontFamily: 'GEOMETRIC_SANS',
        padding: { top: 0, bottom: 4, right: 0, left: 0 },
      },
      props: { text: 'YOUR RESERVATION' },
    },
  },
  'hps2-reservation-confirmation': {
    type: 'Text',
    data: {
      style: {
        color: '#D9E2D4',
        fontSize: 13,
        fontFamily: 'GEOMETRIC_SANS',
        fontWeight: 'normal',
        padding: { top: 0, bottom: 26, right: 0, left: 0 },
      },
      props: { text: 'Confirmation {{confirmation_number}}' },
    },
  },
  'hps2-reservation-dates': {
    type: 'ColumnsContainer',
    data: {
      style: { backgroundColor: '#33433B' },
      props: {
        columnsCount: 2,
        columnsGap: 16,
        columns: [
          { childrenIds: ['hps2-checkin'] },
          { childrenIds: ['hps2-checkout'] },
          { childrenIds: [] },
        ],
      },
    },
  },
  'hps2-checkin': {
    type: 'Container',
    data: {
      style: { backgroundColor: '#33433B' },
      props: {
        childrenIds: ['hps2-checkin-label', 'hps2-checkin-date', 'hps2-checkin-time'],
      },
    },
  },
  'hps2-checkin-label': {
    type: 'Text',
    data: {
      style: {
        color: '#9FB39B',
        fontSize: 11,
        fontFamily: 'GEOMETRIC_SANS',
        padding: { top: 0, bottom: 6, right: 0, left: 0 },
      },
      props: { text: 'CHECK-IN' },
    },
  },
  'hps2-checkin-date': {
    type: 'Heading',
    data: {
      style: {
        color: '#F6F2EA',
        fontFamily: 'MODERN_SERIF',
        padding: { top: 0, bottom: 0, right: 0, left: 0 },
      },
      props: { text: '{{checkin_date}}', level: 'h3' },
    },
  },
  'hps2-checkin-time': {
    type: 'Text',
    data: {
      style: {
        color: '#C5D0BF',
        fontSize: 13,
        fontFamily: 'GEOMETRIC_SANS',
        padding: { top: 4, bottom: 0, right: 0, left: 0 },
      },
      props: { text: 'from {{checkin_time}}' },
    },
  },
  'hps2-checkout': {
    type: 'Container',
    data: {
      style: { backgroundColor: '#33433B' },
      props: {
        childrenIds: ['hps2-checkout-label', 'hps2-checkout-date', 'hps2-checkout-time'],
      },
    },
  },
  'hps2-checkout-label': {
    type: 'Text',
    data: {
      style: {
        color: '#9FB39B',
        fontSize: 11,
        fontFamily: 'GEOMETRIC_SANS',
        padding: { top: 0, bottom: 6, right: 0, left: 0 },
      },
      props: { text: 'CHECK-OUT' },
    },
  },
  'hps2-checkout-date': {
    type: 'Heading',
    data: {
      style: {
        color: '#F6F2EA',
        fontFamily: 'MODERN_SERIF',
        padding: { top: 0, bottom: 0, right: 0, left: 0 },
      },
      props: { text: '{{checkout_date}}', level: 'h3' },
    },
  },
  'hps2-checkout-time': {
    type: 'Text',
    data: {
      style: {
        color: '#C5D0BF',
        fontSize: 13,
        fontFamily: 'GEOMETRIC_SANS',
        padding: { top: 4, bottom: 0, right: 0, left: 0 },
      },
      props: { text: 'by {{checkout_time}}' },
    },
  },
  'hps2-reservation-divider': {
    type: 'Divider',
    data: {
      style: { padding: { top: 26, bottom: 26, right: 0, left: 0 } },
      props: { lineColor: '#46564C', lineHeight: 1 },
    },
  },
  'hps2-reservation-roomrow': {
    type: 'ColumnsContainer',
    data: {
      style: { backgroundColor: '#33433B' },
      props: {
        columnsCount: 2,
        columnsGap: 16,
        columns: [
          { childrenIds: ['hps2-room'] },
          { childrenIds: ['hps2-guests'] },
          { childrenIds: [] },
        ],
      },
    },
  },
  'hps2-room': {
    type: 'Container',
    data: {
      style: { backgroundColor: '#33433B' },
      props: { childrenIds: ['hps2-room-label', 'hps2-room-name'] },
    },
  },
  'hps2-room-label': {
    type: 'Text',
    data: {
      style: {
        color: '#9FB39B',
        fontSize: 11,
        fontFamily: 'GEOMETRIC_SANS',
        padding: { top: 0, bottom: 5, right: 0, left: 0 },
      },
      props: { text: 'ROOM' },
    },
  },
  'hps2-room-name': {
    type: 'Text',
    data: {
      style: {
        color: '#F6F2EA',
        fontSize: 15,
        fontFamily: 'GEOMETRIC_SANS',
        padding: { top: 0, bottom: 0, right: 0, left: 0 },
      },
      props: { text: '{{room_name}}' },
    },
  },
  'hps2-guests': {
    type: 'Container',
    data: {
      style: { backgroundColor: '#33433B' },
      props: { childrenIds: ['hps2-guests-label', 'hps2-guests-value'] },
    },
  },
  'hps2-guests-label': {
    type: 'Text',
    data: {
      style: {
        color: '#9FB39B',
        fontSize: 11,
        fontFamily: 'GEOMETRIC_SANS',
        padding: { top: 0, bottom: 5, right: 0, left: 0 },
      },
      props: { text: 'GUESTS · NIGHTS' },
    },
  },
  'hps2-guests-value': {
    type: 'Text',
    data: {
      style: {
        color: '#F6F2EA',
        fontSize: 15,
        fontFamily: 'GEOMETRIC_SANS',
        padding: { top: 0, bottom: 0, right: 0, left: 0 },
      },
      props: { text: '{{guests}} guests · {{nights}} nights' },
    },
  },
  'hps2-manage-button': {
    type: 'Button',
    data: {
      style: {
        textAlign: 'left',
        padding: { top: 28, bottom: 0, right: 0, left: 0 },
      },
      props: {
        text: 'Manage your booking →',
        url: 'https://theHotel.com/manage-booking',
        buttonBackgroundColor: '#EFE9DC',
        buttonTextColor: '#33433B',
        buttonStyle: 'rounded',
        size: 'small',
        fullWidth: false,
      },
    },
  },
  'hps2-goodtoknow-label': {
    type: 'Text',
    data: {
      style: {
        color: '#A9854F',
        fontSize: 12,
        fontFamily: 'GEOMETRIC_SANS',
        padding: { top: 14, bottom: 4, right: 56, left: 56 },
      },
      props: { text: 'GOOD TO KNOW' },
    },
  },
  'hps2-goodtoknow-title': {
    type: 'Heading',
    data: {
      style: {
        color: '#33433B',
        fontFamily: 'MODERN_SERIF',
        padding: { top: 0, bottom: 22, right: 56, left: 56 },
      },
      props: { text: 'Before you arrive', level: 'h2' },
    },
  },
  'hps2-goodtoknow-list': {
    type: 'Text',
    data: {
      style: {
        color: '#4F4C44',
        fontSize: 15,
        fontFamily: 'GEOMETRIC_SANS',
        fontWeight: 'normal',
        padding: { top: 0, bottom: 18, right: 56, left: 56 },
      },
      props: {
        markdown: true,
        text:
          '- **Getting here**\nViale della Vittoria, 36 — 31044 Montebelluna (TV). Venice Marco Polo airport is ~50 min by car; Treviso ~25 min. [Open directions](https://theHotel.com/directions)\n\n' +
          '- **Parking & access**\nComplimentary on-site parking. Your stay is entirely keyless — you\'ll open the property and your room directly from your smartphone.\n\n' +
          '- **A special occasion?**\nTravelling for something to celebrate, or arriving outside usual hours? Simply [let us know](https://theHotel.com/contact) and we\'ll take care of the rest.',
      },
    },
  },
  'hps2-divider2': {
    type: 'Divider',
    data: {
      style: { padding: { top: 22, bottom: 0, right: 56, left: 56 } },
      props: { lineColor: '#E1D9C8', lineHeight: 1 },
    },
  },
  'hps2-lumi': {
    type: 'ColumnsContainer',
    data: {
      style: { backgroundColor: '#F6F2EA', padding: { top: 40, bottom: 0, right: 0, left: 0 } },
      props: {
        columnsCount: 2,
        columnsGap: 0,
        columns: [
          { childrenIds: ['hps2-lumi-image'] },
          { childrenIds: ['hps2-lumi-label', 'hps2-lumi-heading', 'hps2-lumi-body', 'hps2-lumi-link'] },
          { childrenIds: [] },
        ],
      },
    },
  },
  'hps2-lumi-image': {
    type: 'Image',
    data: {
      style: { padding: { top: 0, bottom: 0, right: 0, left: 0 } },
      props: {
        url: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=600&q=70&auto=format&fit=crop',
        alt: 'Smart welcome screen at The Hotel',
        width: 300,
        contentAlignment: 'middle',
      },
    },
  },
  'hps2-lumi-label': {
    type: 'Text',
    data: {
      style: {
        color: '#A9854F',
        fontSize: 11,
        fontFamily: 'GEOMETRIC_SANS',
        padding: { top: 24, bottom: 4, right: 44, left: 44 },
      },
      props: { text: 'A SMARTER STAY' },
    },
  },
  'hps2-lumi-heading': {
    type: 'Heading',
    data: {
      style: {
        color: '#33433B',
        fontFamily: 'MODERN_SERIF',
        padding: { top: 0, bottom: 14, right: 44, left: 44 },
      },
      props: { text: 'Meet Lumi, your digital ambassador', level: 'h2' },
    },
  },
  'hps2-lumi-body': {
    type: 'Text',
    data: {
      style: {
        color: '#55524A',
        fontSize: 15,
        fontFamily: 'GEOMETRIC_SANS',
        fontWeight: 'normal',
        padding: { top: 0, bottom: 18, right: 44, left: 44 },
      },
      props: {
        text: 'From booking a service to a local recommendation, Lumi anticipates what you need — day or night. Everything you require, in the palm of your hand.',
      },
    },
  },
  'hps2-lumi-link': {
    type: 'Text',
    data: {
      style: {
        color: '#33433B',
        fontSize: 12,
        fontFamily: 'GEOMETRIC_SANS',
        padding: { top: 0, bottom: 0, right: 44, left: 44 },
      },
      props: {
        markdown: true,
        text: '[Discover the experience →](https://theHotel.com/lumi)',
      },
    },
  },
  'hps2-addons-label': {
    type: 'Text',
    data: {
      style: {
        color: '#A9854F',
        fontSize: 12,
        fontFamily: 'GEOMETRIC_SANS',
        textAlign: 'center',
        padding: { top: 46, bottom: 4, right: 56, left: 56 },
      },
      props: { text: 'CURATED FOR YOU' },
    },
  },
  'hps2-addons-title': {
    type: 'Heading',
    data: {
      style: {
        color: '#33433B',
        fontFamily: 'MODERN_SERIF',
        textAlign: 'center',
        padding: { top: 0, bottom: 26, right: 56, left: 56 },
      },
      props: { text: 'Add a little something', level: 'h2' },
    },
  },
  'hps2-addons-row1': {
    type: 'ColumnsContainer',
    data: {
      style: { backgroundColor: '#F6F2EA', padding: { top: 0, bottom: 0, right: 40, left: 40 } },
      props: {
        columnsCount: 2,
        columnsGap: 16,
        columns: [
          { childrenIds: ['hps2-addon-card1'] },
          { childrenIds: ['hps2-addon-card2'] },
          { childrenIds: [] },
        ],
      },
    },
  },
  'hps2-addon-card1': {
    type: 'Container',
    data: {
      style: {
        backgroundColor: '#FFFFFF',
        borderColor: '#ECE4D5',
        borderRadius: 4,
        padding: { top: 0, bottom: 18, right: 0, left: 0 },
      },
      props: {
        childrenIds: ['hps2-addon1-img', 'hps2-addon1-title', 'hps2-addon1-text', 'hps2-addon1-link'],
      },
    },
  },
  'hps2-addon1-img': {
    type: 'Image',
    data: {
      style: { padding: { top: 0, bottom: 0, right: 0, left: 0 } },
      props: {
        url: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=600&q=70&auto=format&fit=crop',
        alt: 'Wellness detail',
        width: 240,
        height: 130,
        contentAlignment: 'middle',
      },
    },
  },
  'hps2-addon1-title': {
    type: 'Heading',
    data: {
      style: {
        color: '#33433B',
        fontFamily: 'MODERN_SERIF',
        padding: { top: 16, bottom: 6, right: 18, left: 18 },
      },
      props: { text: 'Sauna & wellness', level: 'h3' },
    },
  },
  'hps2-addon1-text': {
    type: 'Text',
    data: {
      style: {
        color: '#6A675E',
        fontSize: 13,
        fontFamily: 'GEOMETRIC_SANS',
        fontWeight: 'normal',
        padding: { top: 0, bottom: 12, right: 18, left: 18 },
      },
      props: { text: 'Unwind after a day outdoors with a private wellness moment.' },
    },
  },
  'hps2-addon1-link': {
    type: 'Text',
    data: {
      style: {
        color: '#A9854F',
        fontSize: 11,
        fontFamily: 'GEOMETRIC_SANS',
        padding: { top: 0, bottom: 0, right: 18, left: 18 },
      },
      props: {
        markdown: true,
        text: '[Request →](https://theHotel.com/addons/wellness)',
      },
    },
  },
  'hps2-addon-card2': {
    type: 'Container',
    data: {
      style: {
        backgroundColor: '#FFFFFF',
        borderColor: '#ECE4D5',
        borderRadius: 4,
        padding: { top: 0, bottom: 18, right: 0, left: 0 },
      },
      props: {
        childrenIds: ['hps2-addon2-img', 'hps2-addon2-title', 'hps2-addon2-text', 'hps2-addon2-link'],
      },
    },
  },
  'hps2-addon2-img': {
    type: 'Image',
    data: {
      style: { padding: { top: 0, bottom: 0, right: 0, left: 0 } },
      props: {
        url: 'https://images.unsplash.com/photo-1559563362-c667ba5f5480?w=600&q=70&auto=format&fit=crop',
        alt: 'AgerPatris vineyard',
        width: 240,
        height: 130,
        contentAlignment: 'middle',
      },
    },
  },
  'hps2-addon2-title': {
    type: 'Heading',
    data: {
      style: {
        color: '#33433B',
        fontFamily: 'MODERN_SERIF',
        padding: { top: 16, bottom: 6, right: 18, left: 18 },
      },
      props: { text: 'Prosecco tasting', level: 'h3' },
    },
  },
  'hps2-addon2-text': {
    type: 'Text',
    data: {
      style: {
        color: '#6A675E',
        fontSize: 13,
        fontFamily: 'GEOMETRIC_SANS',
        fontWeight: 'normal',
        padding: { top: 0, bottom: 12, right: 18, left: 18 },
      },
      props: { text: 'Our organic prosecco at the AgerPatris estate, steps away.' },
    },
  },
  'hps2-addon2-link': {
    type: 'Text',
    data: {
      style: {
        color: '#A9854F',
        fontSize: 11,
        fontFamily: 'GEOMETRIC_SANS',
        padding: { top: 0, bottom: 0, right: 18, left: 18 },
      },
      props: {
        markdown: true,
        text: '[Reserve →](https://theHotel.com/addons/tasting)',
      },
    },
  },
  'hps2-addons-row2': {
    type: 'ColumnsContainer',
    data: {
      style: { backgroundColor: '#F6F2EA', padding: { top: 16, bottom: 8, right: 40, left: 40 } },
      props: {
        columnsCount: 2,
        columnsGap: 16,
        columns: [
          { childrenIds: ['hps2-addon-card3'] },
          { childrenIds: ['hps2-addon-card4'] },
          { childrenIds: [] },
        ],
      },
    },
  },
  'hps2-addon-card3': {
    type: 'Container',
    data: {
      style: {
        backgroundColor: '#FFFFFF',
        borderColor: '#ECE4D5',
        borderRadius: 4,
        padding: { top: 0, bottom: 18, right: 0, left: 0 },
      },
      props: {
        childrenIds: ['hps2-addon3-img', 'hps2-addon3-title', 'hps2-addon3-text', 'hps2-addon3-link'],
      },
    },
  },
  'hps2-addon3-img': {
    type: 'Image',
    data: {
      style: { padding: { top: 0, bottom: 0, right: 0, left: 0 } },
      props: {
        url: 'https://images.unsplash.com/photo-1471506480208-91b3a4cc78be?w=600&q=70&auto=format&fit=crop',
        alt: 'Cycling routes near the hotel',
        width: 240,
        height: 130,
        contentAlignment: 'middle',
      },
    },
  },
  'hps2-addon3-title': {
    type: 'Heading',
    data: {
      style: {
        color: '#33433B',
        fontFamily: 'MODERN_SERIF',
        padding: { top: 16, bottom: 6, right: 18, left: 18 },
      },
      props: { text: 'Bike & golf', level: 'h3' },
    },
  },
  'hps2-addon3-text': {
    type: 'Text',
    data: {
      style: {
        color: '#6A675E',
        fontSize: 13,
        fontFamily: 'GEOMETRIC_SANS',
        fontWeight: 'normal',
        padding: { top: 0, bottom: 12, right: 18, left: 18 },
      },
      props: { text: 'Trails through the Prosecco hills and courses minutes away.' },
    },
  },
  'hps2-addon3-link': {
    type: 'Text',
    data: {
      style: {
        color: '#A9854F',
        fontSize: 11,
        fontFamily: 'GEOMETRIC_SANS',
        padding: { top: 0, bottom: 0, right: 18, left: 18 },
      },
      props: {
        markdown: true,
        text: '[Plan it →](https://theHotel.com/addons/bike-golf)',
      },
    },
  },
  'hps2-addon-card4': {
    type: 'Container',
    data: {
      style: {
        backgroundColor: '#FFFFFF',
        borderColor: '#ECE4D5',
        borderRadius: 4,
        padding: { top: 0, bottom: 18, right: 0, left: 0 },
      },
      props: {
        childrenIds: ['hps2-addon4-img', 'hps2-addon4-title', 'hps2-addon4-text', 'hps2-addon4-link'],
      },
    },
  },
  'hps2-addon4-img': {
    type: 'Image',
    data: {
      style: { padding: { top: 0, bottom: 0, right: 0, left: 0 } },
      props: {
        url: 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=600&q=70&auto=format&fit=crop',
        alt: 'In-room comfort',
        width: 240,
        height: 130,
        contentAlignment: 'middle',
      },
    },
  },
  'hps2-addon4-title': {
    type: 'Heading',
    data: {
      style: {
        color: '#33433B',
        fontFamily: 'MODERN_SERIF',
        padding: { top: 16, bottom: 6, right: 18, left: 18 },
      },
      props: { text: 'In-room comfort', level: 'h3' },
    },
  },
  'hps2-addon4-text': {
    type: 'Text',
    data: {
      style: {
        color: '#6A675E',
        fontSize: 13,
        fontFamily: 'GEOMETRIC_SANS',
        fontWeight: 'normal',
        padding: { top: 0, bottom: 12, right: 18, left: 18 },
      },
      props: { text: 'Late check-out, a welcome amenity, or breakfast to the room.' },
    },
  },
  'hps2-addon4-link': {
    type: 'Text',
    data: {
      style: {
        color: '#A9854F',
        fontSize: 11,
        fontFamily: 'GEOMETRIC_SANS',
        padding: { top: 0, bottom: 0, right: 18, left: 18 },
      },
      props: {
        markdown: true,
        text: '[Add →](https://theHotel.com/addons/comfort)',
      },
    },
  },
  'hps2-region-label': {
    type: 'Text',
    data: {
      style: {
        color: '#A9854F',
        fontSize: 12,
        fontFamily: 'GEOMETRIC_SANS',
        textAlign: 'center',
        padding: { top: 44, bottom: 4, right: 56, left: 56 },
      },
      props: { text: 'BETWEEN VENICE & THE DOLOMITES' },
    },
  },
  'hps2-region-title': {
    type: 'Heading',
    data: {
      style: {
        color: '#33433B',
        fontFamily: 'MODERN_SERIF',
        textAlign: 'center',
        padding: { top: 0, bottom: 14, right: 56, left: 56 },
      },
      props: { text: 'A region worth exploring', level: 'h2' },
    },
  },
  'hps2-region-body': {
    type: 'Text',
    data: {
      style: {
        color: '#55524A',
        fontSize: 15,
        fontFamily: 'GEOMETRIC_SANS',
        fontWeight: 'normal',
        textAlign: 'center',
        padding: { top: 0, bottom: 22, right: 56, left: 56 },
      },
      props: {
        text: 'Where the Prosecco hills open toward the plain — a short drive from canals, mountains and vineyards alike.',
      },
    },
  },
  'hps2-region-images': {
    type: 'ColumnsContainer',
    data: {
      style: { backgroundColor: '#F6F2EA', padding: { top: 0, bottom: 6, right: 40, left: 40 } },
      props: {
        columnsCount: 3,
        columnsGap: 12,
        columns: [
          { childrenIds: ['hps2-region-venice-img', 'hps2-region-venice-caption'] },
          { childrenIds: ['hps2-region-dolomites-img', 'hps2-region-dolomites-caption'] },
          { childrenIds: ['hps2-region-hills-img', 'hps2-region-hills-caption'] },
        ],
      },
    },
  },
  'hps2-region-venice-img': {
    type: 'Image',
    data: {
      style: { padding: { top: 0, bottom: 0, right: 0, left: 0 } },
      props: {
        url: 'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=400&q=70&auto=format&fit=crop',
        alt: 'Venice',
        width: 166,
        height: 120,
        contentAlignment: 'middle',
      },
    },
  },
  'hps2-region-venice-caption': {
    type: 'Text',
    data: {
      style: {
        color: '#4F4C44',
        fontSize: 13,
        fontFamily: 'GEOMETRIC_SANS',
        textAlign: 'center',
        padding: { top: 9, bottom: 0, right: 0, left: 0 },
      },
      props: { text: 'Venice' },
    },
  },
  'hps2-region-dolomites-img': {
    type: 'Image',
    data: {
      style: { padding: { top: 0, bottom: 0, right: 0, left: 0 } },
      props: {
        url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400&q=70&auto=format&fit=crop',
        alt: 'The Dolomites',
        width: 166,
        height: 120,
        contentAlignment: 'middle',
      },
    },
  },
  'hps2-region-dolomites-caption': {
    type: 'Text',
    data: {
      style: {
        color: '#4F4C44',
        fontSize: 13,
        fontFamily: 'GEOMETRIC_SANS',
        textAlign: 'center',
        padding: { top: 9, bottom: 0, right: 0, left: 0 },
      },
      props: { text: 'The Dolomites' },
    },
  },
  'hps2-region-hills-img': {
    type: 'Image',
    data: {
      style: { padding: { top: 0, bottom: 0, right: 0, left: 0 } },
      props: {
        url: 'https://images.unsplash.com/photo-1504279577054-acfeccf8fc52?w=400&q=70&auto=format&fit=crop',
        alt: 'Prosecco hills and golf',
        width: 166,
        height: 120,
        contentAlignment: 'middle',
      },
    },
  },
  'hps2-region-hills-caption': {
    type: 'Text',
    data: {
      style: {
        color: '#4F4C44',
        fontSize: 13,
        fontFamily: 'GEOMETRIC_SANS',
        textAlign: 'center',
        padding: { top: 9, bottom: 0, right: 0, left: 0 },
      },
      props: { text: 'Prosecco hills' },
    },
  },
  'hps2-region-cta': {
    type: 'Button',
    data: {
      style: {
        textAlign: 'center',
        padding: { top: 24, bottom: 4, right: 56, left: 56 },
      },
      props: {
        text: 'Explore experiences →',
        url: 'https://theHotel.com/experiences',
        buttonBackgroundColor: '#33433B',
        buttonTextColor: '#F6F2EA',
        buttonStyle: 'rounded',
        size: 'large',
        fullWidth: false,
      },
    },
  },
  'hps2-contact': {
    type: 'Container',
    data: {
      style: {
        backgroundColor: '#F6F2EA',
        padding: { top: 46, bottom: 46, right: 56, left: 56 },
      },
      props: {
        childrenIds: [
          'hps2-contact-divider',
          'hps2-contact-heading',
          'hps2-contact-body',
          'hps2-contact-phone',
        ],
      },
    },
  },
  'hps2-contact-divider': {
    type: 'Divider',
    data: {
      style: { padding: { top: 0, bottom: 34, right: 0, left: 0 } },
      props: { lineColor: '#E1D9C8', lineHeight: 1 },
    },
  },
  'hps2-contact-heading': {
    type: 'Heading',
    data: {
      style: {
        color: '#33433B',
        fontFamily: 'MODERN_SERIF',
        textAlign: 'center',
        padding: { top: 0, bottom: 12, right: 0, left: 0 },
      },
      props: { text: 'Anything at all, before you set off?', level: 'h2' },
    },
  },
  'hps2-contact-body': {
    type: 'Text',
    data: {
      style: {
        color: '#55524A',
        fontSize: 15,
        fontFamily: 'GEOMETRIC_SANS',
        fontWeight: 'normal',
        textAlign: 'center',
        padding: { top: 0, bottom: 18, right: 0, left: 0 },
      },
      props: { text: 'Our team is here to make your arrival effortless. We\'d be delighted to help.' },
    },
  },
  'hps2-contact-phone': {
    type: 'Text',
    data: {
      style: {
        color: '#33433B',
        fontSize: 15,
        fontFamily: 'GEOMETRIC_SANS',
        textAlign: 'center',
        padding: { top: 0, bottom: 0, right: 0, left: 0 },
      },
      props: {
        markdown: true,
        text: '+39 0423 1917070 · [reservations@theHotel.com](mailto:reservations@theHotel.com)',
      },
    },
  },
  'hps2-footer': {
    type: 'Container',
    data: {
      style: {
        backgroundColor: '#33433B',
        padding: { top: 40, bottom: 36, right: 56, left: 56 },
      },
      props: {
        childrenIds: [
          'hps2-footer-logo',
          'hps2-footer-address',
          'hps2-footer-social',
          'hps2-footer-divider',
          'hps2-footer-tagline',
          'hps2-footer-unsubscribe',
        ],
      },
    },
  },
  'hps2-footer-logo': {
    type: 'Image',
    data: {
      style: {
        textAlign: 'center',
        padding: { top: 0, bottom: 14, right: 0, left: 0 },
      },
      props: {
        url: 'https://placehold.co/170x40/33433B/F6F2EA?text=The+Hotel',
        alt: 'The Hotel',
        width: 170,
        contentAlignment: 'middle',
      },
    },
  },
  'hps2-footer-address': {
    type: 'Text',
    data: {
      style: {
        color: '#C5D0BF',
        fontSize: 13,
        fontFamily: 'GEOMETRIC_SANS',
        fontWeight: 'normal',
        textAlign: 'center',
        padding: { top: 6, bottom: 4, right: 0, left: 0 },
      },
      props: { text: 'Viale della Vittoria, 36 — 31044 Montebelluna (TV), Italy' },
    },
  },
  'hps2-footer-social': {
    type: 'Text',
    data: {
      style: {
        color: '#A9C4A6',
        fontSize: 11,
        fontFamily: 'GEOMETRIC_SANS',
        textAlign: 'center',
        padding: { top: 16, bottom: 12, right: 0, left: 0 },
      },
      props: {
        markdown: true,
        text:
          '[Instagram](https://www.instagram.com/theHotel/) · ' +
          '[Facebook](https://www.facebook.com/people/The-Hotel/61573879271243/) · ' +
          '[Website](https://theHotel.com/en/)',
      },
    },
  },
  'hps2-footer-divider': {
    type: 'Divider',
    data: {
      style: { padding: { top: 14, bottom: 18, right: 0, left: 0 } },
      props: { lineColor: '#46564C', lineHeight: 1 },
    },
  },
  'hps2-footer-tagline': {
    type: 'Text',
    data: {
      style: {
        color: '#8FA08B',
        fontSize: 11,
        fontFamily: 'GEOMETRIC_SANS',
        fontWeight: 'normal',
        textAlign: 'center',
        padding: { top: 0, bottom: 6, right: 0, left: 0 },
      },
      props: { text: 'A sustainable design hotel — a refined historic residence where time seems to stand still.' },
    },
  },
  'hps2-footer-unsubscribe': {
    type: 'Text',
    data: {
      style: {
        color: '#7A8B77',
        fontSize: 11,
        fontFamily: 'GEOMETRIC_SANS',
        fontWeight: 'normal',
        textAlign: 'center',
        padding: { top: 2, bottom: 0, right: 0, left: 0 },
      },
      props: {
        markdown: true,
        text:
          "You're receiving this because you have an upcoming reservation with us.\n" +
          '[View in browser](https://theHotel.com/view-in-browser) · ' +
          '[Email preferences](https://theHotel.com/preferences) · ' +
          '[Unsubscribe](https://theHotel.com/unsubscribe)',
      },
    },
  },
};

export default HOTEL_PRE_STAY_V2;

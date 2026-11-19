import type { ColorKey } from './catalog-meta';

/**
 * The colour each product's real photos show. Only this colour is sold; the product's other
 * colours are listed as sold out until photos exist for them (see docs/IMAGES.md).
 *
 * To change one: put the colour that really appears in the photos on the right of the
 * colon. The comment after each line lists the colours that product currently offers.
 */
export const PHOTO_COLORS: Readonly<Record<string, ColorKey>> = {
  'nile-low': 'white', // ivory | sand   | white
  'dune-court': 'sand', // sand | black | ivory
  'corniche-hi': 'black', // black | ivory
  'souk-canvas': 'navy', // navy | terracotta | ivory
  'oasis-leather': 'black', // ivory | olive | black
  'maadi-retro': 'cobalt', // terracotta | navy | cobalt
  'sprint-delta': 'black', // black | cobalt | ivory
  'cairo-tempo': 'stone', // stone | terracotta
  'nile-trail': 'navy', // olive | black | navy
  'pace-light': 'ivory', // ivory | cobalt
  'marathon-pro': 'cobalt', // black | terracotta | cobalt
  'siwa-chukka': 'beige', // tan | black | beige
  'atlas-chelsea': 'black', // black | tan
  'sinai-hiker': 'black', // olive | tan | black
  'alex-work': 'brown', // tan | black | brown
  'sahel-slide': 'black', // sand | black | ivory
  'dahab-strap': 'black', // tan | cobalt | black
  'luxor-leather': 'tan', // tan | black | olive
  'marsa-cork': 'beige', // sand | olive | beige
  'zamalek-loafer': 'black', // black | tan | brown
  'khan-derby': 'brown', // black | tan | brown
  'giza-oxford': 'black', // black | tan | brown
  'heliopolis-penny': 'tan', // tan | black | brown
  'garden-city-mule': 'black', // sand | black
};
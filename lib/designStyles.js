// The /design-styles/<style>/ pages: one entry per style. The page renders
// it; the sitemap (lib/sitemap.js) lists STYLE_SLUGS. Unknown slugs 404
// (the page sets dynamicParams = false).
import { IMAGES } from './images.js';

export const STYLE_META = {
  modern:       { label:'Modern',       desc:'Clean lines, functional furniture, and a neutral palette define the modern aesthetic. Expect open floor plans, hidden storage, and materials like glass, steel, and concrete.', hero: IMAGES.styles.modernHero },
  scandinavian: { label:'Scandinavian', desc:'Born in the Nordic countries, Scandinavian design embraces simplicity, natural light, and cosy warmth. Think white walls, pale wood, linen fabrics, and unfussy furnishings.', hero: IMAGES.styles.scandinavianHero },
  traditional:  { label:'Traditional', desc:'Classic proportions, rich wood tones, ornate detailing, and plush upholstery define the traditional style. Timeless, familiar, and deeply comfortable.', hero: IMAGES.styles.traditionalHero },
  minimalist:   { label:'Minimalist', desc:'Less is more. Minimalist spaces are carefully curated — every object earns its place. Monochromatic palettes, clean surfaces, and maximum natural light.', hero: IMAGES.styles.minimalistHero },
  bohemian:     { label:'Bohemian', desc:'Eclectic, free-spirited, and deeply personal. Bohemian interiors mix global textiles, handmade objects, and abundant plants with a fearless use of colour and pattern.', hero: IMAGES.styles.bohemianHero },
  industrial:   { label:'Industrial', desc:'Raw materials take centre stage: exposed brick, concrete floors, steel beams, and Edison bulbs. Urban and honest, industrial spaces celebrate the beauty of the unfinished.', hero: IMAGES.styles.industrialHero },
  luxury:       { label:'Luxury', desc:'Bespoke joinery, premium stones, imported furniture, and impeccable craftsmanship. Luxury design is the art of restraint combined with the finest materials money can buy.', hero: IMAGES.styles.luxuryHero },
  contemporary: { label:'Contemporary', desc:'Always current, never static. Contemporary design incorporates the best of now — bold accents, mixed materials, sculptural forms, and a sophisticated editorial quality.', hero: IMAGES.styles.contemporaryHero },
};

export const STYLE_SLUGS = Object.freeze(Object.keys(STYLE_META));

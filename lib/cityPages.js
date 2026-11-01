// The /cities/<city>/ pages: one entry per city. The page renders it; the
// sitemap (lib/sitemap.js) lists CITY_PAGE_SLUGS. Unknown slugs 404 (the
// page sets dynamicParams = false).

export const CITY_DATA = {
  bangalore: {
    name: 'Bangalore', state: 'Karnataka',
    image: '/images/cities/bangalore.jpg',
    description: 'Find interior designers in Bangalore. From modern apartments in Whitefield to luxury villas in Sarjapur, our verified designers cover every neighbourhood and style.',
  },
  mumbai: {
    name: 'Mumbai', state: 'Maharashtra',
    image: '/images/cities/mumbai.jpg',
    description: 'Interior designers in Mumbai. Whether you need a compact sea-facing flat redesigned or a luxury Bandra home transformed, our Mumbai designers deliver.',
  },
  delhi: {
    name: 'Delhi NCR', state: 'Delhi',
    image: '/images/cities/delhi.jpg',
    description: 'Discover interior designers in Delhi NCR. From South Delhi farmhouses to Gurgaon high-rises, find designers who know the city\'s unique aesthetic sensibility.',
  },
  hyderabad: {
    name: 'Hyderabad', state: 'Telangana',
    image: '/images/cities/bangalore.jpg',
    description: 'Find interior designers in Hyderabad. HITEC City apartments, Jubilee Hills villas, and everything in between — our designers know Hyderabad intimately.',
  },
  chennai: {
    name: 'Chennai', state: 'Tamil Nadu',
    image: '/images/cities/mumbai.jpg',
    description: 'Interior designers in Chennai who blend Tamil craftsmanship with contemporary design. From Adyar to OMR, find designers who understand Chennai homes.',
  },
  pune: {
    name: 'Pune', state: 'Maharashtra',
    image: '/images/cities/delhi.jpg',
    description: 'Connect with interior designers in Pune. Aundh, Koregaon Park, Hinjewadi — our designers bring style to every Pune neighbourhood.',
  },
};

export const CITY_PAGE_SLUGS = Object.freeze(Object.keys(CITY_DATA));

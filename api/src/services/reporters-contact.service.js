/**
 * Reporters Contact Service
 * Provides mock contact information for reporters
 */

// Mock contact database for reporters mentioned in the challenge briefs
const REPORTERS_CONTACTS = {
  // Brief 1: Mortgage/Fintech reporters
  'nick-robins-early': {
    name: 'Nick Robins-Early',
    email: 'nick.robins-early@theguardian.com',
    linkedin: 'https://www.linkedin.com/in/nickrobinsearly',
    twitter: '@nickrobinsearly'
  },
  'kalyeena-makortoff': {
    name: 'Kalyeena Makortoff',
    email: 'kalyeena.makortoff@theguardian.com',
    linkedin: 'https://www.linkedin.com/in/kalyeena-makortoff',
    twitter: '@kmakortoff'
  },
  'lauren-almeida': {
    name: 'Lauren Almeida',
    email: 'lauren.almeida@theguardian.com',
    linkedin: 'https://www.linkedin.com/in/laurenalmeida',
    twitter: '@laurenalmeida'
  },
  'paul-macinnes': {
    name: 'Paul MacInnes',
    email: 'paul.macinnes@theguardian.com',
    linkedin: 'https://www.linkedin.com/in/paulmacinnes',
    twitter: '@paulmac'
  },
  'blake-montgomery': {
    name: 'Blake Montgomery',
    email: 'blake.montgomery@theguardian.com',
    linkedin: 'https://www.linkedin.com/in/blakemontgomery',
    twitter: '@blakemontgomery'
  },
  'sarah-butler': {
    name: 'Sarah Butler',
    email: 'sarah.butler@theguardian.com',
    linkedin: 'https://www.linkedin.com/in/sarahbutler',
    twitter: '@whatbutlersaw'
  },
  'jasper-jolly': {
    name: 'Jasper Jolly',
    email: 'jasper.jolly@theguardian.com',
    linkedin: 'https://www.linkedin.com/in/jasperjolly',
    twitter: '@jasperjolly'
  },
  'luca-ittimani': {
    name: 'Luca Ittimani',
    email: 'luca.ittimani@theguardian.com',
    linkedin: 'https://www.linkedin.com/in/lucaittimani',
    twitter: '@lucaittimani'
  },
  'rupert-jones': {
    name: 'Rupert Jones',
    email: 'rupert.jones@theguardian.com',
    linkedin: 'https://www.linkedin.com/in/rupertjones',
    twitter: '@rupertjones'
  },
  'dan-milmo': {
    name: 'Dan Milmo',
    email: 'dan.milmo@theguardian.com',
    linkedin: 'https://www.linkedin.com/in/danmilmo',
    twitter: '@danmilmo'
  },
  'jamie-grierson': {
    name: 'Jamie Grierson',
    email: 'jamie.grierson@theguardian.com',
    linkedin: 'https://www.linkedin.com/in/jamiegrierson',
    twitter: '@JamieGrierson10'
  },
  'julia-kollewe': {
    name: 'Julia Kollewe',
    email: 'julia.kollewe@theguardian.com',
    linkedin: 'https://www.linkedin.com/in/juliakollewe',
    twitter: '@juliakollewe'
  },
  'edward-helmore': {
    name: 'Edward Helmore',
    email: 'edward.helmore@theguardian.com',
    linkedin: 'https://www.linkedin.com/in/edwardhelmore',
    twitter: '@edhelmore'
  },
  'joanna-partridge': {
    name: 'Joanna Partridge',
    email: 'joanna.partridge@theguardian.com',
    linkedin: 'https://www.linkedin.com/in/joannapartridge',
    twitter: '@joannapartridge'
  },

  // Brief 2: Restaurant Robotics reporters
  'dara-kerr': {
    name: 'Dara Kerr',
    email: 'dara.kerr@theguardian.com',
    linkedin: 'https://www.linkedin.com/in/darakerr',
    twitter: '@darakerr'
  },
  'sammy-gecsoyler': {
    name: 'Sammy Gecsoyler',
    email: 'sammy.gecsoyler@theguardian.com',
    linkedin: 'https://www.linkedin.com/in/sammygecsoyler',
    twitter: '@sgecsoyler'
  },
  'robert-booth': {
    name: 'Robert Booth',
    email: 'robert.booth@theguardian.com',
    linkedin: 'https://www.linkedin.com/in/robertbooth',
    twitter: '@robert_booth'
  },
  'alyx-gorman': {
    name: 'Alyx Gorman',
    email: 'alyx.gorman@theguardian.com',
    linkedin: 'https://www.linkedin.com/in/alyxgorman',
    twitter: '@alyxgorman'
  },
  'nick-huber': {
    name: 'Nick Huber',
    email: 'nick.huber@theguardian.com',
    linkedin: 'https://www.linkedin.com/in/nickhuber',
    twitter: '@nickhuber'
  },
  'alexander-abnos': {
    name: 'Alexander Abnos',
    email: 'alexander.abnos@theguardian.com',
    linkedin: 'https://www.linkedin.com/in/alexanderabnos',
    twitter: '@alexabnos'
  },

  // Brief 3: Materials/EV/Climate reporters
  'dharna-noor': {
    name: 'Dharna Noor',
    email: 'dharna.noor@theguardian.com',
    linkedin: 'https://www.linkedin.com/in/dharnanoor',
    twitter: '@dharnanoor'
  },
  'jonathan-watts': {
    name: 'Jonathan Watts',
    email: 'jonathan.watts@theguardian.com',
    linkedin: 'https://www.linkedin.com/in/jonathanwatts',
    twitter: '@jonathanwatts'
  },
  'gina-mccarthy': {
    name: 'Gina McCarthy',
    email: 'gina.mccarthy@theguardian.com',
    linkedin: 'https://www.linkedin.com/in/ginamccarthy',
    twitter: '@ginamccarthy'
  },
  'lisa-ocarroll': {
    name: "Lisa O'Carroll",
    email: 'lisa.ocarroll@theguardian.com',
    linkedin: 'https://www.linkedin.com/in/lisaocarroll',
    twitter: '@lisaocarroll'
  },
  'jessica-elgot': {
    name: 'Jessica Elgot',
    email: 'jessica.elgot@theguardian.com',
    linkedin: 'https://www.linkedin.com/in/jessicaelgot',
    twitter: '@jessicaelgot'
  },
  'oliver-milman': {
    name: 'Oliver Milman',
    email: 'oliver.milman@theguardian.com',
    linkedin: 'https://www.linkedin.com/in/olivermilman',
    twitter: '@olivermilman'
  },
  'rebecca-solnit': {
    name: 'Rebecca Solnit',
    email: 'rebecca.solnit@theguardian.com',
    linkedin: 'https://www.linkedin.com/in/rebeccasolnit',
    twitter: '@rebeccasolnit'
  },
  'rob-davies': {
    name: 'Rob Davies',
    email: 'rob.davies@theguardian.com',
    linkedin: 'https://www.linkedin.com/in/robdavies',
    twitter: '@RowZephyr'
  },
  'graeme-wearden': {
    name: 'Graeme Wearden',
    email: 'graeme.wearden@theguardian.com',
    linkedin: 'https://www.linkedin.com/in/graemewearden',
    twitter: '@graemewearden'
  },

  // Additional reporters
  'eleni-courea': {
    name: 'Eleni Courea',
    email: 'eleni.courea@theguardian.com',
    linkedin: 'https://www.linkedin.com/in/elenicourea',
    twitter: '@elenicourea'
  },
  'jillian-ambrose': {
    name: 'Jillian Ambrose',
    email: 'jillian.ambrose@theguardian.com',
    linkedin: 'https://www.linkedin.com/in/jillianambrose',
    twitter: '@jillianambrose'
  },
  'adam-morton': {
    name: 'Adam Morton',
    email: 'adam.morton@theguardian.com',
    linkedin: 'https://www.linkedin.com/in/adammorton',
    twitter: '@adamlmorton'
  },
  'emma-bryce': {
    name: 'Emma Bryce',
    email: 'emma.bryce@theguardian.com',
    linkedin: 'https://www.linkedin.com/in/emmabryce',
    twitter: '@emmabryce'
  },
  'amy-hawkins': {
    name: 'Amy Hawkins',
    email: 'amy.hawkins@theguardian.com',
    linkedin: 'https://www.linkedin.com/in/amyhawkins',
    twitter: '@amyhawkins'
  },
  'nils-pratley': {
    name: 'Nils Pratley',
    email: 'nils.pratley@theguardian.com',
    linkedin: 'https://www.linkedin.com/in/nilspratley',
    twitter: '@nilspratley'
  },
  'marina-dunbar': {
    name: 'Marina Dunbar',
    email: 'marina.dunbar@theguardian.com',
    linkedin: 'https://www.linkedin.com/in/marinadunbar',
    twitter: '@marinadunbar'
  },
  'eleanor-drage': {
    name: 'Eleanor Drage',
    email: 'eleanor.drage@theguardian.com',
    linkedin: 'https://www.linkedin.com/in/eleanordrage',
    twitter: '@eleanordrage'
  },
  'tobi-thomas': {
    name: 'Tobi Thomas',
    email: 'tobi.thomas@theguardian.com',
    linkedin: 'https://www.linkedin.com/in/tobitomas',
    twitter: '@tobithomas'
  },
  'jonathan-barrett': {
    name: 'Jonathan Barrett',
    email: 'jonathan.barrett@theguardian.com',
    linkedin: 'https://www.linkedin.com/in/jonathanbarrett',
    twitter: '@jonobarrett'
  },
  'petra-stock': {
    name: 'Petra Stock',
    email: 'petra.stock@theguardian.com',
    linkedin: 'https://www.linkedin.com/in/petrastock',
    twitter: '@petrastock'
  },
  'cecilia-nowell': {
    name: 'Cecilia Nowell',
    email: 'cecilia.nowell@theguardian.com',
    linkedin: 'https://www.linkedin.com/in/cecilianowell',
    twitter: '@cecilianowell'
  },
  'graham-readfearn': {
    name: 'Graham Readfearn',
    email: 'graham.readfearn@theguardian.com',
    linkedin: 'https://www.linkedin.com/in/grahamreadfearn',
    twitter: '@readfearn'
  },
  'finn-peacock': {
    name: 'Finn Peacock',
    email: 'finn.peacock@theguardian.com',
    linkedin: 'https://www.linkedin.com/in/finnpeacock',
    twitter: '@finnpeacock'
  },
  'roger-mcnamee': {
    name: 'Roger McNamee',
    email: 'roger.mcnamee@theguardian.com',
    linkedin: 'https://www.linkedin.com/in/rogermcnamee',
    twitter: '@moonalice'
  },
  'patrick-commins': {
    name: 'Patrick Commins',
    email: 'patrick.commins@theguardian.com',
    linkedin: 'https://www.linkedin.com/in/patrickcommins',
    twitter: '@patrickcommins'
  },
  'gene-marks': {
    name: 'Gene Marks',
    email: 'gene.marks@theguardian.com',
    linkedin: 'https://www.linkedin.com/in/genemarks',
    twitter: '@genemarks'
  },
  'dustin-guastella': {
    name: 'Dustin Guastella',
    email: 'dustin.guastella@theguardian.com',
    linkedin: 'https://www.linkedin.com/in/dustinguastella',
    twitter: '@dustinguastella'
  },
  'richard-partington': {
    name: 'Richard Partington',
    email: 'richard.partington@theguardian.com',
    linkedin: 'https://www.linkedin.com/in/richardpartington',
    twitter: '@RPartington'
  },
  'callum-jones': {
    name: 'Callum Jones',
    email: 'callum.jones@theguardian.com',
    linkedin: 'https://www.linkedin.com/in/callumjones',
    twitter: '@callumjones'
  },
  'hilary-osborne': {
    name: 'Hilary Osborne',
    email: 'hilary.osborne@theguardian.com',
    linkedin: 'https://www.linkedin.com/in/hilaryosborne',
    twitter: '@hilaryosborne'
  }
};

/**
 * Sanitize reporter name for lookup
 * - Convert to lowercase
 * - Replace spaces with hyphens
 * - Remove special characters except hyphens
 * - Remove apostrophes and quotes
 */
function sanitizeName(name) {
  if (!name) return '';
  
  return name
    .toLowerCase()
    .trim()
    .replace(/[''"]/g, '') // Remove apostrophes and quotes
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/[^a-z0-9-]/g, ''); // Remove special characters except hyphens
}

/**
 * Get reporter contact information by name
 * @param {string} name - Reporter name (will be sanitized)
 * @returns {Object|null} Contact information or null if not found
 */
function getReporterContact(name) {
  const sanitized = sanitizeName(name);
  return REPORTERS_CONTACTS[sanitized] || null;
}

/**
 * Get all reporters (for testing/debugging)
 * @returns {Array} Array of all reporter contacts
 */
function getAllReporters() {
  return Object.values(REPORTERS_CONTACTS);
}

/**
 * Search reporters by partial name match
 * @param {string} query - Search query
 * @returns {Array} Array of matching reporters
 */
function searchReporters(query) {
  if (!query) return [];
  
  const sanitized = sanitizeName(query);
  
  return Object.entries(REPORTERS_CONTACTS)
    .filter(([key, reporter]) => 
      key.includes(sanitized) || 
      sanitizeName(reporter.name).includes(sanitized)
    )
    .map(([_, reporter]) => reporter);
}

module.exports = {
  getReporterContact,
  getAllReporters,
  searchReporters,
  sanitizeName
};

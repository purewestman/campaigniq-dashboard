/*
 * Training Data Module — CampaignIQ Dashboard
 * Maps partner ID to training category completions
 * Auto-generated structure from FY27 training completions
 * Categories: salesPro, techPro, bootcamp, implSpec
 */

export interface TrainingPerson {
  firstName: string;
  lastName: string;
  email: string;
}

export interface PartnerTrainingData {
  salesPro: TrainingPerson[];
  techPro: TrainingPerson[];
  bootcamp: TrainingPerson[];
  implSpec: TrainingPerson[];
}

// ──────────────────────────────────────────────────────────────────
// TRAINING CATEGORY CLASSIFICATION
// Maps training course names to FY27 program categories
// ──────────────────────────────────────────────────────────────────

const CATEGORY_KEYWORDS: Record<string, string> = {
  // Sales Professional
  "sales professional": "salesPro",
  "sales pro": "salesPro",
  "partner seller": "salesPro",
  "pure sales": "salesPro",
  "selling flash": "salesPro",

  // Technical Sales Professional
  "technical sales professional": "techPro",
  "tech sales": "techPro",
  "technical seller": "techPro",
  "partner technical": "techPro",
  "tech professional": "techPro",

  // Partner SE Bootcamp
  "bootcamp": "bootcamp",
  "partner se": "bootcamp",
  "se bootcamp": "bootcamp",
  "sales engineer": "bootcamp",

  // Implementation Specialization
  "implementation": "implSpec",
  "implementer": "implSpec",
  "implementation specialist": "implSpec",
  "cip": "implSpec",
  "certified implementation": "implSpec",
  "how to build": "implSpec",

  // Exclude cert prep & specializations (return null)
  "prep": null,
  "study guide": null,
  "introduction": null,
  "next steps": null,
  "asp": null,
  "support specialization": null,
  "migration specialist": null,
  "app modernization": null,
  "cyber resilience": null,
};

function classifyTraining(courseName: string): string | null {
  if (!courseName) return null;
  const lower = courseName.toLowerCase();

  // First check exclusion keywords (return null if excluded)
  for (const [keyword, category] of Object.entries(CATEGORY_KEYWORDS)) {
    if (lower.includes(keyword) && category === null) {
      return null; // Excluded category
    }
  }

  // Then check inclusion keywords
  for (const [keyword, category] of Object.entries(CATEGORY_KEYWORDS)) {
    if (lower.includes(keyword) && category !== null) {
      return category;
    }
  }

  return null; // Unknown category
}

// ──────────────────────────────────────────────────────────────────
// PARTNER NAME MAPPING
// Normalizes partner names from CSV to match Partner IDs in data.ts
// ──────────────────────────────────────────────────────────────────

const PARTNER_NAME_MAP: Record<string, number> = {
  // Partner ID 1
  "data sciences corporation": 1,
  "data sciences": 1,

  // Partner ID 2
  "axiz (pty) ltd": 2,
  "axiz": 2,

  // Partner ID 3
  "ntt data south africa proprietary limited": 3,
  "ntt data south africa": 3,
  "ntt data": 3,

  // Partner ID 4
  "nec xon systems (pty) ltd": 4,
  "nec xon": 4,

  // Partner ID 5
  "first technology kwazulu natal (pty) ltd": 5,
  "first technology kwazulu": 5,

  // Partner ID 6
  "ioco infrastructure services": 6,
  "ioco": 6,

  // Partner ID 7
  "sithabile technology services (pty) ltd": 7,
  "sithabile": 7,

  // Partner ID 8
  "technology corporate management": 8,
  "technology corporate": 8,

  // Partner ID 9
  "altron digital business": 9,
  "altrondigital business": 9,
  "altron": 9,

  // Partner ID 10
  "itgility pty (ltd)": 10,
  "itgility": 10,

  // Partner ID 11
  "bcx": 11,

  // Partner ID 12
  "triple h technology group": 12,
  "triple h": 12,

  // Partner ID 13
  "lekonakonetsi consulting services (pty) ltd": 13,
  "lekonakonetsi": 13,

  // Partner ID 14
  "altron finance": 14,

  // Partner ID 15
  "billion rows (pty) ltd": 15,
  "billion rows": 15,

  // Partner ID 16
  "bottomline it": 16,

  // Partner ID 17
  "complete enterprise solutions mozambique, limitada": 17,
  "complete enterprise solutions mozambique": 17,

  // Partner ID 18
  "complete enterprise solutions namibia pty ltd": 18,
  "complete enterprise solutions namibia": 18,

  // Partner ID 19
  "complete enterprise solutions zambia, ltd": 19,
  "complete enterprise solutions zambia": 19,

  // Partner ID 20
  "data sciences corporation uk": 20,

  // Partner ID 21
  "dimension data saudi arabia": 21,
  "dimension data": 21,

  // Partner ID 22
  "first technology - gauteng": 22,
  "first technology gauteng": 22,

  // Partner ID 23
  "first technology group (pty) ltd": 23,
  "first technology group": 23,

  // Partner ID 24
  "firstnet": 24,

  // Partner ID 25
  "ioco cloud services": 25,

  // Partner ID 26
  "kenac computer systems (pvt) ltd": 26,
  "kenac": 26,

  // Partner ID 27
  "lcs holdings": 27,

  // Partner ID 28
  "matlala group (pty) ltd": 28,
  "matlala": 28,

  // Partner ID 29
  "mbulase group": 29,

  // Partner ID 30
  "net data solutions": 30,

  // Partner ID 31
  "nexus it professional services": 31,
  "nexus it": 31,
};

function matchPartnerName(name: string): number | null {
  if (!name) return null;
  const normalized = name.toLowerCase().trim();

  // Try exact match first
  if (PARTNER_NAME_MAP[normalized]) {
    return PARTNER_NAME_MAP[normalized];
  }

  // Try partial match
  for (const [key, id] of Object.entries(PARTNER_NAME_MAP)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return id;
    }
  }

  return null;
}

// ──────────────────────────────────────────────────────────────────
// TRAINING DATA STRUCTURE
// Initialize empty training data for all partners
// ──────────────────────────────────────────────────────────────────

export const trainingData: Record<number, PartnerTrainingData> = {
  1: { salesPro: [], techPro: [], bootcamp: [], implSpec: [] },
  2: { salesPro: [], techPro: [], bootcamp: [], implSpec: [] },
  3: { salesPro: [], techPro: [], bootcamp: [], implSpec: [] },
  4: { salesPro: [], techPro: [], bootcamp: [], implSpec: [] },
  5: { salesPro: [], techPro: [], bootcamp: [], implSpec: [] },
  6: { salesPro: [], techPro: [], bootcamp: [], implSpec: [] },
  7: { salesPro: [], techPro: [], bootcamp: [], implSpec: [] },
  8: { salesPro: [], techPro: [], bootcamp: [], implSpec: [] },
  9: { salesPro: [], techPro: [], bootcamp: [], implSpec: [] },
  10: { salesPro: [], techPro: [], bootcamp: [], implSpec: [] },
  11: { salesPro: [], techPro: [], bootcamp: [], implSpec: [] },
  12: { salesPro: [], techPro: [], bootcamp: [], implSpec: [] },
  13: { salesPro: [], techPro: [], bootcamp: [], implSpec: [] },
  14: { salesPro: [], techPro: [], bootcamp: [], implSpec: [] },
  15: { salesPro: [], techPro: [], bootcamp: [], implSpec: [] },
  16: { salesPro: [], techPro: [], bootcamp: [], implSpec: [] },
  17: { salesPro: [], techPro: [], bootcamp: [], implSpec: [] },
  18: { salesPro: [], techPro: [], bootcamp: [], implSpec: [] },
  19: { salesPro: [], techPro: [], bootcamp: [], implSpec: [] },
  20: { salesPro: [], techPro: [], bootcamp: [], implSpec: [] },
  21: { salesPro: [], techPro: [], bootcamp: [], implSpec: [] },
  22: { salesPro: [], techPro: [], bootcamp: [], implSpec: [] },
  23: { salesPro: [], techPro: [], bootcamp: [], implSpec: [] },
  24: { salesPro: [], techPro: [], bootcamp: [], implSpec: [] },
  25: { salesPro: [], techPro: [], bootcamp: [], implSpec: [] },
  26: { salesPro: [], techPro: [], bootcamp: [], implSpec: [] },
  27: { salesPro: [], techPro: [], bootcamp: [], implSpec: [] },
  28: { salesPro: [], techPro: [], bootcamp: [], implSpec: [] },
  29: { salesPro: [], techPro: [], bootcamp: [], implSpec: [] },
  30: { salesPro: [], techPro: [], bootcamp: [], implSpec: [] },
  31: { salesPro: [], techPro: [], bootcamp: [], implSpec: [] },
};

// ──────────────────────────────────────────────────────────────────
// PUBLIC API
// ──────────────────────────────────────────────────────────────────

export function classifyAndAddTraining(
  partnerName: string,
  courseName: string,
  email: string,
  firstName: string,
  lastName: string
): void {
  const partnerId = matchPartnerName(partnerName);
  const category = classifyTraining(courseName) as keyof PartnerTrainingData;

  if (!partnerId) {
    console.warn(`[trainingData] Unknown partner: "${partnerName}"`);
    return;
  }

  if (!category) {
    // Silently skip excluded categories (prep, specializations, etc.)
    return;
  }

  const partner = trainingData[partnerId];
  if (!partner) {
    console.warn(`[trainingData] Partner ID ${partnerId} not initialized`);
    return;
  }

  // Check for duplicates
  const exists = partner[category].some(p => p.email === email);
  if (exists) return;

  // Add to category
  partner[category].push({
    firstName: firstName || "Unknown",
    lastName: lastName || "User",
    email,
  });
}

// ──────────────────────────────────────────────────────────────────
// INITIALIZE TRAINING DATA FROM FY27 COMPLETIONS
// ──────────────────────────────────────────────────────────────────
// Initialize training data with parsed completions
(function initializeTrainingData() {

  // Partner 1
  trainingData[1].salesPro = [
    { firstName: "Koos", lastName: "Hattingh", email: "koos.hattingh@datasciences.co.za" },
    { firstName: "Heather", lastName: "Avenant", email: "heather.avenant@datasciences.co.za" },
    { firstName: "Rukaya", lastName: "Najam", email: "rukaya.najam@datasciences.co.za" },
    { firstName: "James", lastName: "Glashoff", email: "james.glashoff@datasciences.co.za" },
    { firstName: "Quintin", lastName: "Strydom", email: "quintin.strydom@datasciences.co.za" },
    { firstName: "Miyelani", lastName: "Mnisi", email: "miyelani.mnisi@datasciences.co.za" },
    { firstName: "Wayne", lastName: "Bailey", email: "wayne.bailey@datasciences.co.za" },
  ];
  trainingData[1].bootcamp = [
    { firstName: "Ignes", lastName: "Ingram", email: "ignes.ingram@datasciences.co.za" },
  ];
  trainingData[1].implSpec = [
    { firstName: "Mndeni", lastName: "Msibi", email: "mndeni.msibi@datasciences.co.za" },
    { firstName: "Kenny", lastName: "Thiart", email: "kenny.thiart@datasciences.co.za" },
    { firstName: "Jacque", lastName: "Oosthuizen", email: "jacque.oosthuizen@datasciences.co.za" },
    { firstName: "Freddy", lastName: "Kgari", email: "freddie.kgari@datasciences.co.za" },
    { firstName: "Justin", lastName: "Bohler", email: "justin.bohler@datasciences.co.za" },
    { firstName: "Morne", lastName: "Groenewald", email: "morne.groenewald@datasciences.co.za" },
    { firstName: "Nelson", lastName: "Lopes", email: "nelson.lopes@datasciences.co.za" },
    { firstName: "Tamia", lastName: "Eckersley", email: "tamia.eckersley@datasciences.co.za" },
    { firstName: "Rudolf", lastName: "van der Gryp", email: "rudolf.vandergryp@datasciences.co.za" },
    { firstName: "Prekash", lastName: "Naidoo", email: "prekash.naidoo@datasciences.co.za" },
    { firstName: "Warren", lastName: "Hulley", email: "warren.hulley@datasciences.co.za" },
    { firstName: "Marcel", lastName: "Rebelo", email: "marcel.rebelo@datasciences.co.za" },
    { firstName: "Duane", lastName: "Hulley", email: "duane.hulley@datasciences.co.za" },
    { firstName: "Ken", lastName: "Bougard", email: "ken.bougard@datasciences.co.za" },
    { firstName: "Rivalani", lastName: "Mabasa", email: "rivalani.mabasa@datasciences.co.za" },
    { firstName: "Eric", lastName: "Ruhfus", email: "eric.ruhfus@datasciences.co.za" },
    { firstName: "Jean-Claude", lastName: "Alho", email: "jc.alho@datasciences.co.za" },
    { firstName: "Ian", lastName: "Van Der Breggen", email: "ianvdb@datasciences.co.za" },
  ];

  // Partner 2
  trainingData[2].salesPro = [
    { firstName: "Adolph", lastName: "Strydom", email: "adolph.strydom@axiz.com" },
    { firstName: "Jen", lastName: "Gouws", email: "jen.gouws@axiz.com" },
    { firstName: "Barry", lastName: "Yates", email: "barry.yates@axiz.com" },
    { firstName: "Henk", lastName: "Lombaard", email: "henk.lombaard@axiz.com" },
    { firstName: "Jonathan", lastName: "Whitten", email: "jonathan.whitten@axiz.com" },
  ];
  trainingData[2].bootcamp = [
    { firstName: "Renai", lastName: "Howe", email: "renai.howe@axiz.com" },
  ];
  trainingData[2].implSpec = [
    { firstName: "Peter", lastName: "McGuigan", email: "peter.mcguigan@nec.xon.co.zadelete" },
    { firstName: "Zayed", lastName: "Carrim", email: "zayed.carrim@nec.xon.co.za" },
    { firstName: "Schalk", lastName: "Albertyn", email: "schalk.albertyn@nec.xon.co.za" },
    { firstName: "Mike", lastName: "Dewar", email: "michael.dewar@nec.xon.co.za" },
    { firstName: "Lou", lastName: "du Preez", email: "lou.dupreez@nec.xon.co.za" },
    { firstName: "Merwe", lastName: "Erasmus", email: "merwe.erasmus@nec.xon.co.za" },
    { firstName: "Monique", lastName: "Pretorius", email: "monique.pretorius@nec.xon.co.za" },
    { firstName: "Peter", lastName: "McGuigan", email: "peter.mcguigan@nec.xon.co.zadelete" },
    { firstName: "Conrad", lastName: "Van Niekerk", email: "conrad.vanniekerk@nec.xon.co.za" },
    { firstName: "Adolph", lastName: "Strydom", email: "adolph.strydom@axiz.com" },
    { firstName: "Graeme", lastName: "Arrow", email: "graeme.arrow@axiz.com" },
    { firstName: "Warren", lastName: "Smith", email: "warren.smith@axiz.com" },
    { firstName: "Alex", lastName: "Kritzinger", email: "alex.kritzinger@axiz.com" },
    { firstName: "Devika", lastName: "Thamburan", email: "devika.thamburan@axiz.com" },
    { firstName: "Jen", lastName: "Gouws", email: "jen.gouws@axiz.com" },
    { firstName: "Chantal", lastName: "Nel", email: "chantal.nel@axiz.com" },
    { firstName: "Nicole", lastName: "Lambrou", email: "nicole.lambrou@axiz.com" },
    { firstName: "Phumzile", lastName: "Rametsi", email: "phumzile.rametsi@axiz.com" },
    { firstName: "Lisa", lastName: "Herbst", email: "lisa.herbst@axiz.com" },
    { firstName: "Cristina", lastName: "Claassens", email: "cristina.claassens@axiz.com" },
    { firstName: "Aldo", lastName: "Strappazzon", email: "aldo.strappazzon@axiz.com" },
    { firstName: "Kevin", lastName: "Naidoo", email: "kevin.naidoo@axiz.com" },
    { firstName: "Bernice", lastName: "Meyer", email: "bernice.meyer@axiz.com" },
    { firstName: "Aaron", lastName: "Semane", email: "aaron.semane@axiz.com" },
    { firstName: "Keagan", lastName: "Bezuidenhout", email: "keagan.bezuidenhout@axiz.com" },
    { firstName: "elvira", lastName: "scheller", email: "elvira.scheller@axiz.com" },
    { firstName: "Jonathan", lastName: "Vorster", email: "jonathan.vorster@axiz.com" },
    { firstName: "Titus", lastName: "Malo", email: "titus.malo@axiz.com" },
    { firstName: "Leandro", lastName: "Ramjee", email: "leandro.ramjee@axiz.com" },
  ];

  // Partner 3
  trainingData[3].salesPro = [
    { firstName: "Eugene", lastName: "Pienaar", email: "eugene.pienaar@global.ntt" },
  ];
  trainingData[3].bootcamp = [
    { firstName: "Greg", lastName: "Cummings", email: "greg.cummings@global.ntt" },
  ];
  trainingData[3].implSpec = [
    { firstName: "Rudi", lastName: "Fischer", email: "rudi.fischer@dimensiondata.com" },
    { firstName: "Morne", lastName: "Frans", email: "morne.frans@dimensiondata.com" },
    { firstName: "Riaan", lastName: "Taylor", email: "riaan.taylor@global.ntt" },
    { firstName: "Peetri", lastName: "Riekert", email: "peetri.riekert@global.ntt" },
    { firstName: "Gareth", lastName: "Hopkins", email: "gareth.hopkins@dimensiondata.com" },
    { firstName: "Lourens", lastName: "Janse van Rensburg", email: "lourens.jvrensburg@global.ntt" },
  ];

  // Partner 4
  trainingData[4].salesPro = [
    { firstName: "Andre", lastName: "Grobler", email: "andre.grobler@nec.xon.co.za" },
    { firstName: "Sifiso", lastName: "Nkosi", email: "sifiso.nkosi@nec.xon.co.za" },
    { firstName: "Schalk", lastName: "Gouws", email: "schalk.gouws@nec.xon.co.za" },
    { firstName: "Marian", lastName: "Lubbe", email: "marian.lubbe@nec.xon.co.za" },
  ];
  trainingData[4].bootcamp = [
    { firstName: "Kobus", lastName: "Putter", email: "kobus.putter@nec.xon.co.za" },
  ];
  trainingData[4].implSpec = [
    { firstName: "Peter", lastName: "McGuigan", email: "peter.mcguigan@nec.xon.co.za" },
    { firstName: "Zayed", lastName: "Carrim", email: "zayed.carrim@nec.xon.co.za" },
    { firstName: "Schalk", lastName: "Albertyn", email: "schalk.albertyn@nec.xon.co.za" },
    { firstName: "Mike", lastName: "Dewar", email: "michael.dewar@nec.xon.co.za" },
    { firstName: "Lou", lastName: "du Preez", email: "lou.dupreez@nec.xon.co.za" },
    { firstName: "Merwe", lastName: "Erasmus", email: "merwe.erasmus@nec.xon.co.za" },
    { firstName: "Monique", lastName: "Pretorius", email: "monique.pretorius@nec.xon.co.za" },
    { firstName: "Peter", lastName: "McGuigan", email: "peter.mcguigan@nec.xon.co.zadelete" },
    { firstName: "Conrad", lastName: "Van Niekerk", email: "conrad.vanniekerk@nec.xon.co.za" },
  ];

  // Partner 6
  trainingData[6].salesPro = [
    { firstName: "Harvey", lastName: "Leibowitz", email: "harvey.leibowitz@ioco.tech" },
    { firstName: "Faith", lastName: "Tshikororo", email: "faith.tshikororo@ioco.tech" },
    { firstName: "Jim", lastName: "Bokaba", email: "jim.bokaba@ioco.tech" },
    { firstName: "Nicomine", lastName: "Wells", email: "nicomine.wells@ioco.tech" },
    { firstName: "Megan", lastName: "Tindall", email: "megan.tindall@ioco.tech" },
    { firstName: "Jeetendra", lastName: "Kanti-Narsing", email: "jeetendra.narsing@ioco.tech" },
    { firstName: "Henry", lastName: "Minnaar", email: "henry.minnaar@ioco.tech" },
    { firstName: "Shirley", lastName: "Cantatore", email: "shirley.cantatore@ioco.tech" },
  ];
  trainingData[6].techPro = [
    { firstName: "Christopher", lastName: "Young", email: "christopher.young@ioco.tech" },
  ];
  trainingData[6].implSpec = [
    { firstName: "Nick", lastName: "Dahya", email: "nick.dahya@ioco.tech" },
    { firstName: "Kobus", lastName: "Boshoff", email: "kobus.boshoff@ioco.tech" },
    { firstName: "Richard", lastName: "Blewitt", email: "richard.blewitt@ioco.tech" },
    { firstName: "Anant", lastName: "Desai", email: "anant.desai@ioco.tech" },
    { firstName: "Colin", lastName: "Theron", email: "colin.theron@ioco.tech" },
    { firstName: "Duncan", lastName: "Human", email: "duncan.human@ioco.tech" },
    { firstName: "Jacques", lastName: "de Jager", email: "jacques.dejager@ioco.tech" },
    { firstName: "Jiten", lastName: "Vassan", email: "jiten.vassan@ioco.tech" },
    { firstName: "Johan", lastName: "Grove", email: "johan.grove@ioco.tech" },
    { firstName: "Mags", lastName: "Naidoo", email: "mags.naidoo@ioco.tech" },
    { firstName: "Nardi", lastName: "Barnard", email: "nardi.barnard@ioco.tech" },
    { firstName: "Rebaona", lastName: "Tisane", email: "rebaona.tisane@ioco.tech" },
    { firstName: "Hein", lastName: "Kruger", email: "hein.kruger@ioco.tech" },
    { firstName: "Deon", lastName: "Roux", email: "deon.roux@ioco.tech" },
    { firstName: "Ndumiso", lastName: "August", email: "ndumiso.august@ioco.tech" },
  ];

  // Partner 7
  trainingData[7].salesPro = [
    { firstName: "Richard", lastName: "Tatham", email: "richard.tatham@sithabile.co.za" },
    { firstName: "Bryce", lastName: "Tatham", email: "bryce.tatham@sithabile.co.za" },
    { firstName: "Charles", lastName: "Mackeurtan", email: "charles.mackeurtan@sithabile.co.za" },
  ];
  trainingData[7].implSpec = [
    { firstName: "Elizabeth", lastName: "Borges", email: "liz.borges@sithabile.co.za" },
    { firstName: "JP", lastName: "Hattingh", email: "jp.hattingh@sithabile.co.za" },
    { firstName: "Damon", lastName: "Engelsman", email: "damon.engelsman@sithabile.co.za" },
    { firstName: "Malcolm", lastName: "Tiley", email: "malcolm.tiley@sithabile.co.za" },
    { firstName: "Orla", lastName: "Meeker", email: "orla.meaker@sithabile.co.za" },
    { firstName: "Francois", lastName: "Janse van Vuuren", email: "francois.jansevanvuuren@sithabile.co.za" },
  ];

  // Partner 8
  trainingData[8].salesPro = [
    { firstName: "Ashika", lastName: "Basdeo", email: "ashika.basdeo@tcm.co.za" },
    { firstName: "Elentia", lastName: "Moodley", email: "elentia.moodley@tcm.co.za" },
    { firstName: "Micaela", lastName: "Vieira", email: "micaela.vieira@tcm.co.za" },
    { firstName: "Terry", lastName: "Bailey", email: "terry.bailey@tcm.co.za" },
  ];
  trainingData[8].bootcamp = [
    { firstName: "David", lastName: "Cornelli", email: "david.cornelli@tcm.co.za" },
    { firstName: "Francois", lastName: "Bezuidenhout", email: "francois.bezuidenhout@tcm.co.za" },
    { firstName: "Louis", lastName: "Albertyn", email: "louis.albertyn@tcm.co.za" },
    { firstName: "Andries", lastName: "Botha", email: "andries.botha@tcm.co.za" },
  ];
  trainingData[8].implSpec = [
    { firstName: "Phillip", lastName: "Ambartzakis", email: "phillip.ambartzakis@tcm.co.za" },
    { firstName: "Colin", lastName: "Smith", email: "colin.smith@tcm.co.za" },
    { firstName: "Goolam", lastName: "Ally", email: "goolam.ally@tcm.co.za" },
    { firstName: "Warren", lastName: "Clark", email: "warren.clark@tcm.co.za" },
    { firstName: "Dierk", lastName: "Lobbecke", email: "dierk.lobbecke@tcm.co.za" },
    { firstName: "Bartho", lastName: "Smal", email: "bartho.smal@tcm.co.za" },
    { firstName: "Paul", lastName: "Pimenta", email: "paul.pimenta@tcm.co.za" },
    { firstName: "Vishnu", lastName: "Naidoo", email: "vishnu.naidoo@tcm.co.za" },
    { firstName: "Bulelwa", lastName: "Melamane", email: "bulelwa.melamane@tcm.co.za" },
    { firstName: "Mbalenhle", lastName: "Linda", email: "mbalenhle.linda@tcm.co.za" },
    { firstName: "Kobus", lastName: "Botes", email: "kobus.botes@tcm.co.za" },
  ];

  // Partner 9
  trainingData[9].salesPro = [
    { firstName: "Bridgette", lastName: "Kemp", email: "bridgette.kemp@altron.com" },
    { firstName: "Nicola", lastName: "Tempest", email: "nicola.tempest@altron.com" },
    { firstName: "Leriza", lastName: "DeBruyn", email: "leriza.debruyn@axiz.com" },
    { firstName: "Mike", lastName: "Styer", email: "mike.styer@axiz.com" },
    { firstName: "Amogelang", lastName: "Mosaka", email: "amogelang.mosaka@axiz.com" },
    { firstName: "Themba", lastName: "Wulana", email: "themba.wulana@axiz.com" },
    { firstName: "Irving", lastName: "Hare", email: "irving.hare@axiz.com" },
    { firstName: "Bradley", lastName: "McCulloch", email: "bradley.mcculloch@axiz.com" },
  ];
  trainingData[9].techPro = [
    { firstName: "Khosick", lastName: "Juggernauth", email: "khosick.juggernauth@axiz.com" },
  ];
  trainingData[9].bootcamp = [
    { firstName: "Verlin", lastName: "Pillay", email: "verlin.pillay@axiz.com" },
    { firstName: "Jacques", lastName: "Swanevelder", email: "jacquess@itgility.co.za" },
  ];
  trainingData[9].implSpec = [
    { firstName: "Adrian", lastName: "Pillay", email: "adrian.pillay@altron.com" },
    { firstName: "Zane", lastName: "Maphalle", email: "zane.maphalle@altron.com" },
    { firstName: "Craig Edward", lastName: "Botha", email: "craigedward.botha@altron.com" },
    { firstName: "Paulina", lastName: "Moagi", email: "paulina.moagi@altron.com" },
    { firstName: "Katlego", lastName: "Mabuse", email: "katlego.mabuse@altron.com" },
    { firstName: "Oscar", lastName: "Ronander", email: "oscar.ronander@axiz.com" },
    { firstName: "Mareliza", lastName: "Smit", email: "marelize.smit@axiz.com" },
    { firstName: "Thabo", lastName: "Makhalanyane", email: "thabo.makhalanyane@axiz.com" },
    { firstName: "Wayde", lastName: "Bowen", email: "wayde.bowen@axiz.com" },
    { firstName: "Adolph", lastName: "Strydom", email: "adolph.strydom@axiz.com" },
    { firstName: "Graeme", lastName: "Arrow", email: "graeme.arrow@axiz.com" },
    { firstName: "Warren", lastName: "Smith", email: "warren.smith@axiz.com" },
    { firstName: "Alex", lastName: "Kritzinger", email: "alex.kritzinger@axiz.com" },
    { firstName: "Devika", lastName: "Thamburan", email: "devika.thamburan@axiz.com" },
    { firstName: "Jen", lastName: "Gouws", email: "jen.gouws@axiz.com" },
    { firstName: "Chantal", lastName: "Nel", email: "chantal.nel@axiz.com" },
    { firstName: "Nicole", lastName: "Lambrou", email: "nicole.lambrou@axiz.com" },
    { firstName: "Phumzile", lastName: "Rametsi", email: "phumzile.rametsi@axiz.com" },
    { firstName: "Lisa", lastName: "Herbst", email: "lisa.herbst@axiz.com" },
    { firstName: "Cristina", lastName: "Claassens", email: "cristina.claassens@axiz.com" },
    { firstName: "Aldo", lastName: "Strappazzon", email: "aldo.strappazzon@axiz.com" },
    { firstName: "Kevin", lastName: "Naidoo", email: "kevin.naidoo@axiz.com" },
    { firstName: "Bernice", lastName: "Meyer", email: "bernice.meyer@axiz.com" },
    { firstName: "Aaron", lastName: "Semane", email: "aaron.semane@axiz.com" },
    { firstName: "Keagan", lastName: "Bezuidenhout", email: "keagan.bezuidenhout@axiz.com" },
    { firstName: "elvira", lastName: "scheller", email: "elvira.scheller@axiz.com" },
    { firstName: "Jonathan", lastName: "Vorster", email: "jonathan.vorster@axiz.com" },
    { firstName: "Titus", lastName: "Malo", email: "titus.malo@axiz.com" },
    { firstName: "Leandro", lastName: "Ramjee", email: "leandro.ramjee@axiz.com" },
  ];

  // Partner 11
  trainingData[11].salesPro = [
    { firstName: "Carla", lastName: "Clara", email: "carla.clara@bcx.co.za" },
  ];

  // Partner 12
  trainingData[12].salesPro = [
    { firstName: "Justine", lastName: "de Sousa", email: "justined@triplehgroup.co.za" },
    { firstName: "Tarin", lastName: "Pearson", email: "tarinp@triplehgroup.co.za" },
    { firstName: "Elize", lastName: "Krause", email: "elizek@triplehgroup.co.za" },
    { firstName: "Madelaine", lastName: "Bihl", email: "madelaineb@triplehgroup.co.za" },
    { firstName: "Roxy", lastName: "Kirton", email: "roxyk@triplehgroup.co.za" },
    { firstName: "Sabeeha", lastName: "Alikutti", email: "sabeehaa@triplehgroup.co.za" },
    { firstName: "Vernon", lastName: "Erasmus", email: "vernone@triplehgroup.co.za" },
  ];
  trainingData[12].implSpec = [
    { firstName: "Angela", lastName: "Smith", email: "angelas@triplehgroup.co.za" },
    { firstName: "Frederik", lastName: "Strydom", email: "frederiks@triplehgroup.co.za" },
    { firstName: "Kiewiet", lastName: "Kritzinger", email: "kiewietk@triplehgroup.co.za" },
  ];

  // Partner 13
  trainingData[13].salesPro = [
    { firstName: "Diana", lastName: "Mbatha", email: "diana@lcsholdings.co.za" },
    { firstName: "Nokulunga", lastName: "Kubheka", email: "nokulunga@lcsholdings.co.za" },
    { firstName: "Lindokuhle", lastName: "Simelane", email: "lindokuhle@lcsholdings.co.za" },
  ];
  trainingData[13].techPro = [
    { firstName: "Thabiso", lastName: "Mdingi", email: "thabiso@lcsholdings.co.za" },
    { firstName: "Bandile", lastName: "Maphumulo", email: "bandile@lcsholdings.co.za" },
    { firstName: "Siphamandla", lastName: "Ndlangamandla", email: "siphamandla@lcsholdings.co.za" },
  ];

  // Partner 15
  trainingData[15].salesPro = [
    { firstName: "Teboho", lastName: "Maoyi", email: "teboho.maoyi@billionrows.co.za" },
  ];

  // Partner 16
  trainingData[16].implSpec = [
    { firstName: "Kabelo", lastName: "Molise", email: "kabelo.molise@bottomlineit.co.za" },
    { firstName: "Katlego", lastName: "Thokoane", email: "katlego.thokoane@bottomlineit.co.za" },
    { firstName: "Ndaedzo", lastName: "Mathada", email: "ndaedzo.mathada@bottomlineit.co.za" },
    { firstName: "Ben", lastName: "Malambule", email: "ben.malambule@bottomlineit.co.za" },
    { firstName: "Memory", lastName: "Phasha", email: "memory.phasha@bottomlineit.co.za" },
    { firstName: "Tsepiso", lastName: "Lebona", email: "tsepiso.lebona@bottomlineit.co.za" },
  ];

  // Partner 17
  trainingData[17].salesPro = [
    { firstName: "Arjun", lastName: "Mahendracumar", email: "amahendracumar@mz.ces-africa.com" },
    { firstName: "Aniceto", lastName: "Marmeleiro", email: "amarmeleiro@mz.ces-africa.com" },
    { firstName: "Mussa", lastName: "Hassamo", email: "mhassamo@bytespieces.com" },
    { firstName: "Emilio", lastName: "Machado", email: "emachado@mz.ces-africa.com" },
    { firstName: "Líria", lastName: "Mavimbe", email: "lmavimbe@mz.ces-africa.com" },
    { firstName: "Maizer", lastName: "Valgy", email: "mvalgy@mz.ces-africa.com" },
    { firstName: "Kelven", lastName: "Zunguza", email: "kzunguza@mz.ces-africa.com" },
    { firstName: "Idário", lastName: "Samo", email: "isamo@mz.ces-africa.com" },
    { firstName: "Aniceto", lastName: "Marmeleiro", email: "amarmeleiro@bytespieces.com" },
    { firstName: "Arsénio", lastName: "Rufino", email: "arufino@bytespieces.com" },
    { firstName: "Elton", lastName: "Rasse", email: "erasse@bytespieces.com" },
    { firstName: "Niki", lastName: "Triantafyllou", email: "ntriantafyllou@bytespieces.comdelete" },
    { firstName: "Melaine", lastName: "Leandra", email: "mleandra@bytespieces.com" },
  ];
  trainingData[17].techPro = [
    { firstName: "Mwenya", lastName: "Kasonde", email: "mkasonde@zm.ces-africa.com" },
    { firstName: "Nonenge", lastName: "Mvula", email: "nmvula@zm.ces-africa.com" },
    { firstName: "Brighton", lastName: "Mphande", email: "bmphande@zm.ces-africa.com" },
    { firstName: "Ewin", lastName: "Chifumpu", email: "echifumpu@zm.ces-africa.com" },
  ];
  trainingData[17].bootcamp = [
    { firstName: "Valentine", lastName: "Sondoyi", email: "vsondoyi@zm.ces-africa.com" },
    { firstName: "Luckjoe", lastName: "Wamundila", email: "lwamundila@zm.ces-africa.com" },
    { firstName: "Mwiza", lastName: "Chiwale", email: "mchiwale@zm.ces-africa.com" },
  ];
  trainingData[17].implSpec = [
    { firstName: "Samuel", lastName: "Thomas", email: "sthomas@mz.ces-africa.com" },
    { firstName: "Adarsh", lastName: "Bharadwaj", email: "abharadwaj@mz.ces-africa.com" },
    { firstName: "Gerson", lastName: "Borges", email: "gborges@mz.ces-africa.com" },
    { firstName: "Jose", lastName: "Machoco", email: "jmachoco@mz.ces-africa.com" },
    { firstName: "Faira", lastName: "Mussa", email: "fmussa@bytespieces.com" },
    { firstName: "Aider", lastName: "da Costa Nube", email: "anube@mz.ces-africa.com" },
    { firstName: "Hennie", lastName: "Du Toit", email: "hdutoit@na.ces-africa.com" },
    { firstName: "Danilo", lastName: "Juma", email: "djuma@bytespieces.com" },
    { firstName: "Shamillah", lastName: "Izaks", email: "sizaks@na.ces-africa.com" },
    { firstName: "Sulemangy", lastName: "Abubacar", email: "sabubacar@mz.ces-africa.com" },
    { firstName: "Chisanga", lastName: "Mulenga Phiri", email: "cmphiri@zm.ces-africa.com" },
    { firstName: "Shawn", lastName: "Hentze", email: "shentze@na.ces-africa.com" },
    { firstName: "Johan", lastName: "Ludeke", email: "jludeke@na.ces-africa.com" },
    { firstName: "Linda", lastName: "Shapole", email: "lshapole@zm.ces-africa.com" },
    { firstName: "Clarence", lastName: "Muteba", email: "cmuteba@zm.ces-africa.com" },
    { firstName: "Sandile", lastName: "Lungu", email: "slungu@zm.ces-africa.com" },
  ];

  // Partner 21
  trainingData[21].salesPro = [
    { firstName: "Mazen", lastName: "Al Saadi", email: "mazen.alsaadi@dimensiondata.com" },
  ];

  // Partner 22
  trainingData[22].salesPro = [
    { firstName: "Calvin", lastName: "Monyebodi", email: "calvinm@firsttech.co.za" },
    { firstName: "Kaylen", lastName: "Abboo", email: "kaylena@ftechkzn.co.za" },
    { firstName: "Lungile", lastName: "Sibiya", email: "lungile.sibiya@ftechkzn.co.za" },
    { firstName: "Miralda", lastName: "Pillay", email: "miraldap@ftechkzn.co.za" },
    { firstName: "Dion", lastName: "Francis", email: "dionf@ftechkzn.co.za" },
    { firstName: "Wiseman", lastName: "Ngidi", email: "wisemann@ftechkzn.co.za" },
    { firstName: "Jenna", lastName: "Jelliman", email: "jennaj@ftechkzn.co.za" },
    { firstName: "Sthe", lastName: "Thusi", email: "sthet@ftechkzn.co.za" },
    { firstName: "Nonjabulo", lastName: "Abby Tshibi", email: "nonjabulot@ftechkzn.co.za" },
    { firstName: "Wendy", lastName: "Mhlongo", email: "wendym@ftechkzn.co.za" },
    { firstName: "Priyanka", lastName: "Ramsamy", email: "priyanka@ftechkzn.co.za" },
    { firstName: "Kavith", lastName: "Harilal", email: "kavith@ftechkzn.co.za" },
    { firstName: "Debbie", lastName: "Pather", email: "debbip@ftechkzn.co.za" },
    { firstName: "Dean", lastName: "Riddle", email: "deanr@ftechkzn.co.za" },
    { firstName: "Andy", lastName: "Boone", email: "andyb@ftechkzn.co.za" },
    { firstName: "Denise", lastName: "van Huyssteen", email: "denisev@ftechkzn.co.za" },
    { firstName: "Bhavesh", lastName: "Devjee", email: "bhavesh.devjee@ftechkzn.co.za" },
    { firstName: "Soma", lastName: "Dhever", email: "somad@ftechkzn.co.za" },
    { firstName: "Majid", lastName: "Karim", email: "majidk@ftechkzn.co.za" },
  ];
  trainingData[22].techPro = [
    { firstName: "Ramiro", lastName: "Rampartab", email: "ramiror@ftechkzn.co.za" },
    { firstName: "Rajiv", lastName: "Pirtu", email: "rajivp@ftechkzn.co.za" },
    { firstName: "Stelios", lastName: "Kyriakides", email: "steliosk@ftechkzn.co.za" },
  ];
  trainingData[22].bootcamp = [
    { firstName: "Lehlohonolo", lastName: "Mofokeng", email: "lehlohonolom@ftechkzn.co.za" },
    { firstName: "Vikesh", lastName: "Surju", email: "vikeshs@ftechkzn.co.za" },
    { firstName: "Andrew", lastName: "Cotty", email: "andrew.cotty@ftechkzn.co.za" },
  ];
  trainingData[22].implSpec = [
    { firstName: "Vernon", lastName: "Harripersadh", email: "vernonh@ftechkzn.co.za" },
    { firstName: "Melanie", lastName: "Govender", email: "melanieg@ftechkzn.co.za" },
  ];

  // Partner 28
  trainingData[28].salesPro = [
    { firstName: "Abbey", lastName: "Matlala", email: "abbey@matlalait.com" },
  ];
  trainingData[28].techPro = [
    { firstName: "Lucas", lastName: "Magagula", email: "lucas.magagula@matlalait.com" },
    { firstName: "Evan", lastName: "Madlophe", email: "evans.madlophe@matlalait.com" },
    { firstName: "Sibonisiwe", lastName: "Radebe", email: "sibonisiwe.radebe@matlalait.com" },
  ];
  trainingData[28].implSpec = [
    { firstName: "Mahlatse", lastName: "Seema", email: "mahlatse.seema@matlalait.com" },
  ];

})();

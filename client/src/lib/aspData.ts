// Auto-generated from Online FY27 report v2.csv
// ASP = Authorized Support Partner eligibility
// Requirements: ≥2 individuals in each of 3 categories

export interface AspPerson {
  email: string;
  firstName: string;
  lastName: string;
}

export interface PartnerAspData {
  /** Passed FlashArray/FlashBlade Foundations for ASP Training & Assessment */
  foundations: AspPerson[];
  /** Earned FlashArray/FlashBlade Storage Professional Certification */
  storageProCert: AspPerson[];
  /** Earned FlashArray/FlashBlade Support Specialist Certification */
  supportSpecCert: AspPerson[];
  /** True when all 3 categories have ≥2 individuals */
  eligible: boolean;
}

export const aspData: Record<number, PartnerAspData> = {
  1: {
    foundations: [{ email: "jp.marais@datasciences.co.za", firstName: "Jean-Pierre", lastName: "Marais" }, { email: "jacques.vanaswegen@datasciences.co.za", firstName: "Jacques", lastName: "van Aswegen" }, { email: "danie.grobler@datasciences.co.za", firstName: "Danie", lastName: "Grobler" }, { email: "mekeal.beepath@datasciences.co.za", firstName: "Mekeal", lastName: "Beepath" }],
    storageProCert: [{ email: "riaan.ras@datasciences.co.za", firstName: "Riaan", lastName: "Ras" }, { email: "jp.marais@datasciences.co.za", firstName: "Jean-Pierre", lastName: "Marais" }, { email: "gino.thomas@datasciences.co.za", firstName: "Gino", lastName: "Thomas" }],
    supportSpecCert: [{ email: "danie.grobler@datasciences.co.za", firstName: "Danie", lastName: "Grobler" }, { email: "riaan.ras@datasciences.co.za", firstName: "Riaan", lastName: "Ras" }, { email: "gino.thomas@datasciences.co.za", firstName: "Gino", lastName: "Thomas" }, { email: "jp.marais@datasciences.co.za", firstName: "Jean-Pierre", lastName: "Marais" }, { email: "adrean.rebelo@datasciences.co.za", firstName: "Adrean", lastName: "Rebelo" }],
    eligible: true,
  },
  2: {
    foundations: [{ email: "thabo.makhalanyane@axiz.com", firstName: "Thabo", lastName: "Makhalanyane" }, { email: "paul.njoroge@avvint.com", firstName: "Paul", lastName: "Njoroge" }],
    storageProCert: [{ email: "jen.gouws@axiz.com", firstName: "Jen", lastName: "Gouws" }],
    supportSpecCert: [{ email: "adolph.strydom@axiz.com", firstName: "Adolph", lastName: "Strydom" }],
    eligible: false,
  },
  3: {
    foundations: [{ email: "peetri.riekert@global.ntt", firstName: "Peetri", lastName: "Riekert" }],
    storageProCert: [],
    supportSpecCert: [{ email: "kayode.fatoki@global.ntt", firstName: "Kayode", lastName: "Fatoki" }, { email: "kagiso.mathuloe@global.ntt", firstName: "Kagiso", lastName: "Mathuloe" }],
    eligible: false,
  },
  4: {
    foundations: [{ email: "merwe.erasmus@nec.xon.co.za", firstName: "Merwe", lastName: "Erasmus" }, { email: "glenn.wagner@nec.xon.co.za", firstName: "Glenn", lastName: "Wagner" }, { email: "zayed.carrim@nec.xon.co.za", firstName: "Zayed", lastName: "Carrim" }],
    storageProCert: [],
    supportSpecCert: [],
    eligible: false,
  },
  5: {
    foundations: [],
    storageProCert: [{ email: "cameron.madurai@ftechkzn.co.za", firstName: "Cameron", lastName: "Madurai" }, { email: "ramiror@ftechkzn.co.za", firstName: "Ramiro", lastName: "Rampartab" }],
    supportSpecCert: [{ email: "cameron.madurai@ftechkzn.co.za", firstName: "Cameron", lastName: "Madurai" }, { email: "nonjabulot@ftechkzn.co.za", firstName: "Nonjabulo", lastName: "Abby Tshibi" }, { email: "ramiror@ftechkzn.co.za", firstName: "Ramiro", lastName: "Rampartab" }, { email: "steliosk@ftechkzn.co.za", firstName: "Stelios", lastName: "Kyriakides" }, { email: "davinc@ftechkzn.co.za", firstName: "Davin", lastName: "Chapman" }],
    eligible: false,
  },
  6: {
    foundations: [],
    storageProCert: [{ email: "christopher.young@ioco.tech", firstName: "Christopher", lastName: "Young" }, { email: "jim.bokaba@ioco.tech", firstName: "Jim", lastName: "Bokaba" }],
    supportSpecCert: [],
    eligible: false,
  },
  7: {
    foundations: [],
    storageProCert: [{ email: "adolph.madzivhandila@sithabile.co.za", firstName: "Adolph", lastName: "Madzivhandila" }],
    supportSpecCert: [{ email: "adolph.madzivhandila@sithabile.co.za", firstName: "Adolph", lastName: "Madzivhandila" }],
    eligible: false,
  },
  8: {
    foundations: [],
    storageProCert: [{ email: "dierk.lobbecke@tcm.co.za", firstName: "Dierk", lastName: "Lobbecke" }],
    supportSpecCert: [{ email: "dierk.lobbecke@tcm.co.za", firstName: "Dierk", lastName: "Lobbecke" }],
    eligible: false,
  },
  9: {
    foundations: [{ email: "faizel.saiet@altron.com", firstName: "Faizel", lastName: "Saiet" }, { email: "mpho.mpya@altron.com", firstName: "Mpho", lastName: "Mpya" }, { email: "andrew.govender@altron.com", firstName: "Andrew", lastName: "Govender" }, { email: "selvan.pillay@altron.com", firstName: "Selvan", lastName: "Pillay" }, { email: "williamrobert.souter@altron.com", firstName: "Robert", lastName: "Souter" }, { email: "robert.mlombile@altron.com", firstName: "Robert", lastName: "Mlombile" }],
    storageProCert: [{ email: "williamrobert.souter@altron.com", firstName: "Robert", lastName: "Souter" }, { email: "mpho.mpya@altron.com", firstName: "Mpho", lastName: "Mpya" }],
    supportSpecCert: [],
    eligible: false,
  },
  15: {
    foundations: [],
    storageProCert: [{ email: "linda.maoyi@billionrows.co.za", firstName: "Linda", lastName: "Maoyi" }],
    supportSpecCert: [],
    eligible: false,
  },
  17: {
    foundations: [{ email: "sthomas@mz.ces-africa.com", firstName: "Samuel", lastName: "Thomas" }, { email: "abharadwaj@mz.ces-africa.com", firstName: "Adarsh", lastName: "Bharadwaj" }],
    storageProCert: [],
    supportSpecCert: [],
    eligible: false,
  },
};

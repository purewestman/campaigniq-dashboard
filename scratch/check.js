const pptxgen = require('pptxgenjs');
const pres = new pptxgen();
console.log(Object.keys(pres).filter(k => k.includes('load') || k.includes('template') || k.includes('master')));

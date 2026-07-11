/**
 * One-off: add the footer "Understand" column keys (catchy one-liners per
 * document type) to all 17 locale files. Existing keys are never overwritten.
 * Run: node scripts/add-footer-i18n.js
 */
const fs = require('fs')
const path = require('path')

const MESSAGES_DIR = path.join(__dirname, '..', 'messages')

const A = {
  en: {
    understand: 'Understand',
    understandCheck: 'Check lab values instantly',
    understandArztbrief: 'Decode doctor letters',
    understandHospital: 'Understand hospital reports',
    understandMedication: 'Medications made clear',
    understandInsurance: 'Insurance letters, no jargon',
    understandLanguages: 'Explained in 17 languages',
  },
  de: {
    understand: 'Endlich verstehen',
    understandCheck: 'Laborwerte sofort checken',
    understandArztbrief: 'Arztbriefe entschlüsseln',
    understandHospital: 'Krankenhausberichte verstehen',
    understandMedication: 'Medikamente klar erklärt',
    understandInsurance: 'Kassenbriefe ohne Amtsdeutsch',
    understandLanguages: 'Erklärt in 17 Sprachen',
  },
  tr: {
    understand: 'Sonunda anlayın',
    understandCheck: 'Tahlil değerini anında kontrol et',
    understandArztbrief: 'Doktor mektuplarını çözün',
    understandHospital: 'Hastane raporlarını anlayın',
    understandMedication: 'İlaçlar net anlatılır',
    understandInsurance: 'Sigorta yazıları, bürokrasisiz',
    understandLanguages: '17 dilde açıklama',
  },
  ar: {
    understand: 'افهم أخيراً',
    understandCheck: 'افحص قيم التحاليل فوراً',
    understandArztbrief: 'فُك رموز خطابات الأطباء',
    understandHospital: 'افهم تقارير المستشفى',
    understandMedication: 'أدويتك بوضوح',
    understandInsurance: 'خطابات التأمين بلا تعقيد',
    understandLanguages: 'الشرح بـ 17 لغة',
  },
  ru: {
    understand: 'Наконец понятно',
    understandCheck: 'Проверить показатель за секунду',
    understandArztbrief: 'Расшифровать врачебное письмо',
    understandHospital: 'Понять больничную выписку',
    understandMedication: 'Лекарства простыми словами',
    understandInsurance: 'Письма страховой без канцелярита',
    understandLanguages: 'Объяснение на 17 языках',
  },
  pl: {
    understand: 'Wreszcie zrozumieć',
    understandCheck: 'Sprawdź wynik od razu',
    understandArztbrief: 'Rozszyfruj list lekarski',
    understandHospital: 'Zrozum wypis ze szpitala',
    understandMedication: 'Leki jasno wyjaśnione',
    understandInsurance: 'Pisma z kasy bez urzędniczego języka',
    understandLanguages: 'Wyjaśnienia w 17 językach',
  },
  es: {
    understand: 'Entender por fin',
    understandCheck: 'Comprueba tus valores al instante',
    understandArztbrief: 'Descifra cartas médicas',
    understandHospital: 'Entiende informes de hospital',
    understandMedication: 'Medicamentos explicados claro',
    understandInsurance: 'Cartas del seguro sin jerga',
    understandLanguages: 'Explicado en 17 idiomas',
  },
  fr: {
    understand: 'Enfin comprendre',
    understandCheck: 'Vérifiez vos valeurs en un instant',
    understandArztbrief: 'Décodez les courriers médicaux',
    understandHospital: 'Comprenez les rapports d’hôpital',
    understandMedication: 'Médicaments expliqués clairement',
    understandInsurance: 'Courriers d’assurance sans jargon',
    understandLanguages: 'Expliqué en 17 langues',
  },
  it: {
    understand: 'Capire finalmente',
    understandCheck: 'Controlla i valori all’istante',
    understandArztbrief: 'Decifra le lettere del medico',
    understandHospital: 'Capisci i referti ospedalieri',
    understandMedication: 'Farmaci spiegati chiaramente',
    understandInsurance: 'Lettere assicurative senza gergo',
    understandLanguages: 'Spiegato in 17 lingue',
  },
  pt: {
    understand: 'Entender finalmente',
    understandCheck: 'Verifique valores num instante',
    understandArztbrief: 'Decifre cartas médicas',
    understandHospital: 'Entenda relatórios hospitalares',
    understandMedication: 'Medicamentos explicados com clareza',
    understandInsurance: 'Cartas do seguro sem burocratês',
    understandLanguages: 'Explicado em 17 idiomas',
  },
  nl: {
    understand: 'Eindelijk begrijpen',
    understandCheck: 'Check labwaarden direct',
    understandArztbrief: 'Ontcijfer artsenbrieven',
    understandHospital: 'Begrijp ziekenhuisverslagen',
    understandMedication: 'Medicijnen helder uitgelegd',
    understandInsurance: 'Verzekeringsbrieven zonder jargon',
    understandLanguages: 'Uitgelegd in 17 talen',
  },
  zh: {
    understand: '终于看得懂',
    understandCheck: '即时检查化验值',
    understandArztbrief: '解读医生信函',
    understandHospital: '看懂出院报告',
    understandMedication: '用药一目了然',
    understandInsurance: '保险信函不再晦涩',
    understandLanguages: '17 种语言解读',
  },
  ja: {
    understand: 'やっとわかる',
    understandCheck: '検査値をすぐチェック',
    understandArztbrief: '医師の手紙を読み解く',
    understandHospital: '退院報告書がわかる',
    understandMedication: '薬をわかりやすく',
    understandInsurance: '保険の書類も難解語なし',
    understandLanguages: '17言語で解説',
  },
  ko: {
    understand: '드디어 이해되는',
    understandCheck: '검사 수치 즉시 확인',
    understandArztbrief: '의사 소견서 해독',
    understandHospital: '퇴원 보고서 이해하기',
    understandMedication: '약을 쉽게 설명',
    understandInsurance: '보험 서류, 어려운 말 없이',
    understandLanguages: '17개 언어로 설명',
  },
  hi: {
    understand: 'आख़िरकार समझ आया',
    understandCheck: 'लैब वैल्यू तुरंत जांचें',
    understandArztbrief: 'डॉक्टर के पत्र समझें',
    understandHospital: 'अस्पताल की रिपोर्ट समझें',
    understandMedication: 'दवाएं साफ़ शब्दों में',
    understandInsurance: 'बीमा पत्र, बिना जटिल भाषा',
    understandLanguages: '17 भाषाओं में समझाया गया',
  },
  ur: {
    understand: 'آخرکار سمجھ آ گیا',
    understandCheck: 'لیب ویلیو فوراً جانچیں',
    understandArztbrief: 'ڈاکٹر کے خطوط سمجھیں',
    understandHospital: 'ہسپتال کی رپورٹ سمجھیں',
    understandMedication: 'ادویات آسان الفاظ میں',
    understandInsurance: 'انشورنس خطوط، بغیر مشکل زبان',
    understandLanguages: '17 زبانوں میں وضاحت',
  },
  bn: {
    understand: 'অবশেষে বোঝা গেল',
    understandCheck: 'ল্যাব মান সঙ্গে সঙ্গে যাচাই করুন',
    understandArztbrief: 'ডাক্তারের চিঠির মানে বুঝুন',
    understandHospital: 'হাসপাতালের রিপোর্ট বুঝুন',
    understandMedication: 'ওষুধ সহজ ভাষায়',
    understandInsurance: 'বীমার চিঠি, জটিল ভাষা ছাড়া',
    understandLanguages: '১৭টি ভাষায় ব্যাখ্যা',
  },
}

const locales = fs.readdirSync(MESSAGES_DIR).filter(f => f.endsWith('.json')).map(f => f.replace('.json', ''))

for (const locale of locales) {
  const file = path.join(MESSAGES_DIR, `${locale}.json`)
  const data = JSON.parse(fs.readFileSync(file, 'utf8'))
  if (!data.siteFooter || typeof data.siteFooter !== 'object') data.siteFooter = {}
  const additions = A[locale] || A.en
  for (const [k, v] of Object.entries(additions)) {
    if (!(k in data.siteFooter)) data.siteFooter[k] = v
  }
  fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n', 'utf8')
  console.log(`ok ${locale}${A[locale] ? '' : ' (English fallback)'}`)
}
console.log('Done.')

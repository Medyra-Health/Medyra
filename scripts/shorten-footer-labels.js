/**
 * One-off: replace the wordy footer "Understand" labels with short punchy
 * 1 to 2 word versions, in all 17 locales. Overwrites the six link keys on
 * purpose. Run: node scripts/shorten-footer-labels.js
 */
const fs = require('fs')
const path = require('path')

const MESSAGES_DIR = path.join(__dirname, '..', 'messages')

const L = {
  en: { understand: 'Understand', understandCheck: 'Value Check', understandArztbrief: 'Doctor Letters', understandHospital: 'Hospital Reports', understandMedication: 'Medications', understandInsurance: 'Insurance Letters', understandLanguages: '17 Languages' },
  de: { understand: 'Verstehen', understandCheck: 'Wert Check', understandArztbrief: 'Arztbriefe', understandHospital: 'Klinikberichte', understandMedication: 'Medikamente', understandInsurance: 'Kassenbriefe', understandLanguages: '17 Sprachen' },
  tr: { understand: 'Anlayın', understandCheck: 'Değer Kontrolü', understandArztbrief: 'Doktor Mektupları', understandHospital: 'Hastane Raporları', understandMedication: 'İlaçlar', understandInsurance: 'Sigorta Yazıları', understandLanguages: '17 Dil' },
  ar: { understand: 'افهم', understandCheck: 'فحص القيم', understandArztbrief: 'خطابات الأطباء', understandHospital: 'تقارير المستشفى', understandMedication: 'الأدوية', understandInsurance: 'خطابات التأمين', understandLanguages: '17 لغة' },
  ru: { understand: 'Понять', understandCheck: 'Проверка значений', understandArztbrief: 'Письма врача', understandHospital: 'Выписки', understandMedication: 'Лекарства', understandInsurance: 'Письма страховой', understandLanguages: '17 языков' },
  pl: { understand: 'Zrozum', understandCheck: 'Sprawdź wynik', understandArztbrief: 'Listy lekarskie', understandHospital: 'Wypisy', understandMedication: 'Leki', understandInsurance: 'Pisma z kasy', understandLanguages: '17 języków' },
  es: { understand: 'Entiende', understandCheck: 'Chequeo de valores', understandArztbrief: 'Cartas médicas', understandHospital: 'Informes clínicos', understandMedication: 'Medicamentos', understandInsurance: 'Cartas del seguro', understandLanguages: '17 idiomas' },
  fr: { understand: 'Comprendre', understandCheck: 'Check valeurs', understandArztbrief: 'Courriers médicaux', understandHospital: 'Rapports cliniques', understandMedication: 'Médicaments', understandInsurance: 'Courriers assurance', understandLanguages: '17 langues' },
  it: { understand: 'Capire', understandCheck: 'Check valori', understandArztbrief: 'Lettere mediche', understandHospital: 'Referti clinici', understandMedication: 'Farmaci', understandInsurance: 'Lettere assicurative', understandLanguages: '17 lingue' },
  pt: { understand: 'Entenda', understandCheck: 'Checar valores', understandArztbrief: 'Cartas médicas', understandHospital: 'Relatórios clínicos', understandMedication: 'Medicamentos', understandInsurance: 'Cartas do seguro', understandLanguages: '17 idiomas' },
  nl: { understand: 'Begrijp', understandCheck: 'Waarde check', understandArztbrief: 'Artsenbrieven', understandHospital: 'Klinische verslagen', understandMedication: 'Medicijnen', understandInsurance: 'Verzekeringsbrieven', understandLanguages: '17 talen' },
  zh: { understand: '看得懂', understandCheck: '数值速查', understandArztbrief: '医生信函', understandHospital: '出院报告', understandMedication: '用药说明', understandInsurance: '保险信函', understandLanguages: '17 种语言' },
  ja: { understand: 'わかる', understandCheck: '数値チェック', understandArztbrief: '医師の手紙', understandHospital: '退院報告書', understandMedication: 'お薬', understandInsurance: '保険の書類', understandLanguages: '17言語' },
  ko: { understand: '이해하기', understandCheck: '수치 확인', understandArztbrief: '의사 소견서', understandHospital: '퇴원 보고서', understandMedication: '복용약', understandInsurance: '보험 서류', understandLanguages: '17개 언어' },
  hi: { understand: 'समझें', understandCheck: 'वैल्यू जांच', understandArztbrief: 'डॉक्टर पत्र', understandHospital: 'अस्पताल रिपोर्ट', understandMedication: 'दवाएं', understandInsurance: 'बीमा पत्र', understandLanguages: '17 भाषाएं' },
  ur: { understand: 'سمجھیں', understandCheck: 'ویلیو چیک', understandArztbrief: 'ڈاکٹر خطوط', understandHospital: 'ہسپتال رپورٹس', understandMedication: 'ادویات', understandInsurance: 'انشورنس خطوط', understandLanguages: '17 زبانیں' },
  bn: { understand: 'বুঝুন', understandCheck: 'মান যাচাই', understandArztbrief: 'ডাক্তারের চিঠি', understandHospital: 'হাসপাতাল রিপোর্ট', understandMedication: 'ওষুধ', understandInsurance: 'বীমার চিঠি', understandLanguages: '১৭টি ভাষা' },
}

const locales = fs.readdirSync(MESSAGES_DIR).filter(f => f.endsWith('.json')).map(f => f.replace('.json', ''))

for (const locale of locales) {
  const file = path.join(MESSAGES_DIR, `${locale}.json`)
  const data = JSON.parse(fs.readFileSync(file, 'utf8'))
  const labels = L[locale] || L.en
  data.siteFooter = { ...(data.siteFooter || {}), ...labels }
  fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n', 'utf8')
  console.log(`ok ${locale}`)
}
console.log('Done.')

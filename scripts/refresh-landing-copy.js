/**
 * One-off: the doctor visit prep badge stops saying "New feature" (it is not
 * new anymore, it is a highlight) and the security subtitle becomes one short,
 * plain sentence. Overwrites those two keys in all 17 locales on purpose.
 * Run: node scripts/refresh-landing-copy.js
 */
const fs = require('fs')
const path = require('path')

const MESSAGES_DIR = path.join(__dirname, '..', 'messages')

const L = {
  en: { badge: 'Patient favorite', security: 'Encrypted before it is stored. Deleted when you say so. That simple.' },
  de: { badge: 'Beliebteste Funktion', security: 'Verschlüsselt, bevor es gespeichert wird. Gelöscht, wenn Sie es sagen. So einfach.' },
  tr: { badge: 'En sevilen özellik', security: 'Kaydedilmeden önce şifrelenir. Siz isteyince silinir. Bu kadar basit.' },
  ar: { badge: 'الميزة الأكثر حباً', security: 'يُشفَّر قبل التخزين. ويُحذف عندما تقرر أنت. بهذه البساطة.' },
  ru: { badge: 'Любимая функция', security: 'Шифруется до сохранения. Удаляется, когда скажете вы. Вот так просто.' },
  pl: { badge: 'Ulubiona funkcja', security: 'Szyfrowane przed zapisaniem. Usuwane, gdy tak zdecydujesz. Po prostu.' },
  es: { badge: 'La favorita de los pacientes', security: 'Cifrado antes de guardarse. Borrado cuando tú lo digas. Así de simple.' },
  fr: { badge: 'Préférée des patients', security: 'Chiffré avant d’être stocké. Supprimé quand vous le décidez. Aussi simple que ça.' },
  it: { badge: 'La preferita dei pazienti', security: 'Cifrato prima di essere salvato. Cancellato quando lo decidi tu. Semplice.' },
  pt: { badge: 'A favorita dos pacientes', security: 'Cifrado antes de ser guardado. Apagado quando você decidir. Simples assim.' },
  nl: { badge: 'Favoriet bij patiënten', security: 'Versleuteld voordat het wordt opgeslagen. Verwijderd wanneer u dat zegt. Zo simpel.' },
  zh: { badge: '最受喜爱的功能', security: '存储前先加密。您说删除就删除。就这么简单。' },
  ja: { badge: '一番人気の機能', security: '保存前に暗号化。削除はあなたの一言で。それだけです。' },
  ko: { badge: '가장 사랑받는 기능', security: '저장 전에 암호화됩니다. 삭제는 당신이 말할 때. 그게 전부입니다.' },
  hi: { badge: 'सबसे पसंदीदा फीचर', security: 'सेव होने से पहले एन्क्रिप्ट। आपके कहने पर डिलीट। बस इतना ही।' },
  ur: { badge: 'سب سے پسندیدہ فیچر', security: 'محفوظ ہونے سے پہلے انکرپٹ۔ آپ کے کہنے پر ڈیلیٹ۔ بس اتنا ہی۔' },
  bn: { badge: 'সবচেয়ে প্রিয় ফিচার', security: 'সংরক্ষণের আগে এনক্রিপ্ট। আপনি বললেই মুছে যায়। এতটাই সহজ।' },
}

const locales = fs.readdirSync(MESSAGES_DIR).filter(f => f.endsWith('.json')).map(f => f.replace('.json', ''))

for (const locale of locales) {
  const file = path.join(MESSAGES_DIR, `${locale}.json`)
  const data = JSON.parse(fs.readFileSync(file, 'utf8'))
  const v = L[locale] || L.en
  if (data.landing?.doctorVisit) data.landing.doctorVisit.badge = v.badge
  if (data.landing?.security) data.landing.security.subtitle = v.security
  fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n', 'utf8')
  console.log(`ok ${locale}`)
}
console.log('Done.')

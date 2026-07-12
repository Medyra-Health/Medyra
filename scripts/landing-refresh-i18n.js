/**
 * One-off: fix the language count (18 -> 17) in the specific keys that
 * mention it, and add the featureShow.* keys for the new animated landing
 * showcase, in all 17 locales. Run: node scripts/landing-refresh-i18n.js
 */
const fs = require('fs')
const path = require('path')

const MESSAGES_DIR = path.join(__dirname, '..', 'messages')

// Key paths whose value contains the language count
const COUNT_KEYS = [
  'landing.languages.title',
  'pricingPage.free.f5',
  'pricingPage.personal.f5',
  'pricingPage.family.f5',
  'pricingPage.clinic.f5',
  'pricingPage.trust.languages',
  'pricingPage.languages.title',
]

const F = {
  en: {
    badge: 'One platform, every document',
    title: 'Whatever the doctor sends,',
    titleHighlight: 'Medyra explains it',
    subtitle: 'Lab reports, doctor letters, hospital reports, medication plans and insurance letters, plus a free instant value checker.',
    more: 'Learn more',
    descLab: 'Check a single value free, or upload the whole report for a full explanation.',
    descLetter: 'Every medical term and abbreviation translated into plain language.',
    descHospital: 'What happened, what changed and what to do after the hospital.',
    descMeds: 'What each medication is for and how to take it, made clear.',
    descInsurance: 'Decisions, costs and deadlines without the bureaucracy German.',
    descLanguages: 'The full explanation arrives in your language, chat included.',
  },
  de: {
    badge: 'Eine Plattform, jedes Dokument',
    title: 'Was auch immer die Praxis schickt,',
    titleHighlight: 'Medyra erklärt es',
    subtitle: 'Laborbefunde, Arztbriefe, Krankenhausberichte, Medikationspläne und Kassenbriefe, plus ein kostenloser Wert-Check.',
    more: 'Mehr erfahren',
    descLab: 'Einzelnen Wert kostenlos prüfen oder den ganzen Befund hochladen und komplett erklären lassen.',
    descLetter: 'Jeder Fachbegriff und jede Abkürzung in klare Sprache übersetzt.',
    descHospital: 'Was passiert ist, was sich geändert hat und was nach dem Krankenhaus zu tun ist.',
    descMeds: 'Wofür jedes Medikament ist und wie Sie es einnehmen, klar erklärt.',
    descInsurance: 'Bescheide, Kosten und Fristen ohne Amtsdeutsch.',
    descLanguages: 'Die komplette Erklärung kommt in Ihrer Sprache, Chat inklusive.',
  },
  tr: {
    badge: 'Tek platform, her belge',
    title: 'Doktor ne gönderirse göndersin,',
    titleHighlight: 'Medyra açıklar',
    subtitle: 'Tahlil raporları, doktor mektupları, hastane raporları, ilaç planları ve sigorta yazıları; ayrıca ücretsiz anında değer kontrolü.',
    more: 'Daha fazla',
    descLab: 'Tek değeri ücretsiz kontrol edin veya tüm raporu yükleyip eksiksiz açıklama alın.',
    descLetter: 'Her tıbbi terim ve kısaltma anlaşılır dile çevrilir.',
    descHospital: 'Ne oldu, ne değişti ve hastaneden sonra ne yapmalı.',
    descMeds: 'Her ilacın ne için olduğu ve nasıl alınacağı, net şekilde.',
    descInsurance: 'Kararlar, masraflar ve süreler; bürokrasi Almancası olmadan.',
    descLanguages: 'Eksiksiz açıklama sizin dilinizde gelir, sohbet dahil.',
  },
  ar: {
    badge: 'منصة واحدة، كل مستند',
    title: 'مهما أرسل الطبيب،',
    titleHighlight: 'Medyra يشرحه',
    subtitle: 'تقارير المختبر وخطابات الأطباء وتقارير المستشفى وخطط الأدوية وخطابات التأمين، إضافة إلى فاحص قيم فوري مجاني.',
    more: 'اعرف المزيد',
    descLab: 'افحص قيمة واحدة مجاناً أو ارفع التقرير كاملاً لشرح كامل.',
    descLetter: 'كل مصطلح طبي واختصار مترجم إلى لغة بسيطة.',
    descHospital: 'ما الذي حدث وما الذي تغيّر وما الذي يجب فعله بعد المستشفى.',
    descMeds: 'لماذا كل دواء وكيف يؤخذ، بوضوح.',
    descInsurance: 'القرارات والتكاليف والمهل دون لغة الدوائر الرسمية.',
    descLanguages: 'الشرح الكامل يصل بلغتك، والمحادثة أيضاً.',
  },
  ru: {
    badge: 'Одна платформа, любой документ',
    title: 'Что бы ни прислал врач,',
    titleHighlight: 'Medyra объяснит',
    subtitle: 'Анализы, письма врача, больничные выписки, планы приёма лекарств и письма страховой, плюс бесплатная мгновенная проверка показателей.',
    more: 'Подробнее',
    descLab: 'Проверьте один показатель бесплатно или загрузите весь анализ для полного объяснения.',
    descLetter: 'Каждый медицинский термин и сокращение переведены на простой язык.',
    descHospital: 'Что произошло, что изменилось и что делать после больницы.',
    descMeds: 'Для чего каждое лекарство и как его принимать, понятным языком.',
    descInsurance: 'Решения, расходы и сроки без канцелярита.',
    descLanguages: 'Полное объяснение приходит на вашем языке, чат включён.',
  },
  es: {
    badge: 'Una plataforma, cada documento',
    title: 'Envíe lo que envíe el médico,',
    titleHighlight: 'Medyra lo explica',
    subtitle: 'Informes de laboratorio, cartas médicas, informes de hospital, planes de medicación y cartas del seguro, más un chequeo de valores gratis.',
    more: 'Saber más',
    descLab: 'Comprueba un valor gratis o sube el informe completo para una explicación total.',
    descLetter: 'Cada término médico y abreviatura traducidos a lenguaje sencillo.',
    descHospital: 'Qué pasó, qué cambió y qué hacer después del hospital.',
    descMeds: 'Para qué sirve cada medicamento y cómo tomarlo, con claridad.',
    descInsurance: 'Decisiones, costes y plazos sin jerga burocrática.',
    descLanguages: 'La explicación completa llega en tu idioma, chat incluido.',
  },
  fr: {
    badge: 'Une plateforme, chaque document',
    title: 'Quel que soit le courrier du médecin,',
    titleHighlight: 'Medyra l’explique',
    subtitle: 'Analyses, courriers médicaux, rapports d’hôpital, plans de médication et courriers d’assurance, plus un vérificateur de valeurs gratuit.',
    more: 'En savoir plus',
    descLab: 'Vérifiez une valeur gratuitement ou téléversez le rapport complet pour une explication totale.',
    descLetter: 'Chaque terme médical et abréviation traduits en langage simple.',
    descHospital: 'Ce qui s’est passé, ce qui a changé et quoi faire après l’hôpital.',
    descMeds: 'À quoi sert chaque médicament et comment le prendre, clairement.',
    descInsurance: 'Décisions, coûts et délais sans jargon administratif.',
    descLanguages: 'L’explication complète arrive dans votre langue, chat compris.',
  },
  it: {
    badge: 'Una piattaforma, ogni documento',
    title: 'Qualunque cosa mandi il medico,',
    titleHighlight: 'Medyra la spiega',
    subtitle: 'Referti di laboratorio, lettere mediche, referti ospedalieri, piani terapeutici e lettere assicurative, più un check dei valori gratuito.',
    more: 'Scopri di più',
    descLab: 'Controlla un valore gratis o carica il referto completo per una spiegazione totale.',
    descLetter: 'Ogni termine medico e abbreviazione tradotti in linguaggio semplice.',
    descHospital: 'Cosa è successo, cosa è cambiato e cosa fare dopo l’ospedale.',
    descMeds: 'A cosa serve ogni farmaco e come assumerlo, con chiarezza.',
    descInsurance: 'Decisioni, costi e scadenze senza gergo burocratico.',
    descLanguages: 'La spiegazione completa arriva nella tua lingua, chat inclusa.',
  },
  pt: {
    badge: 'Uma plataforma, cada documento',
    title: 'Seja o que for que o médico envie,',
    titleHighlight: 'a Medyra explica',
    subtitle: 'Relatórios de laboratório, cartas médicas, relatórios hospitalares, planos de medicação e cartas do seguro, mais um verificador de valores grátis.',
    more: 'Saber mais',
    descLab: 'Verifique um valor grátis ou carregue o relatório completo para uma explicação total.',
    descLetter: 'Cada termo médico e abreviatura traduzidos para linguagem simples.',
    descHospital: 'O que aconteceu, o que mudou e o que fazer depois do hospital.',
    descMeds: 'Para que serve cada medicamento e como tomar, com clareza.',
    descInsurance: 'Decisões, custos e prazos sem linguagem burocrática.',
    descLanguages: 'A explicação completa chega no seu idioma, chat incluído.',
  },
  nl: {
    badge: 'Eén platform, elk document',
    title: 'Wat de arts ook stuurt,',
    titleHighlight: 'Medyra legt het uit',
    subtitle: 'Labuitslagen, artsenbrieven, ziekenhuisverslagen, medicatieplannen en verzekeringsbrieven, plus een gratis waardecheck.',
    more: 'Meer weten',
    descLab: 'Check één waarde gratis of upload het hele verslag voor een volledige uitleg.',
    descLetter: 'Elke medische term en afkorting vertaald naar gewone taal.',
    descHospital: 'Wat er gebeurd is, wat er veranderd is en wat te doen na het ziekenhuis.',
    descMeds: 'Waar elk medicijn voor is en hoe u het inneemt, helder uitgelegd.',
    descInsurance: 'Besluiten, kosten en termijnen zonder ambtelijk jargon.',
    descLanguages: 'De volledige uitleg komt in uw taal, chat inbegrepen.',
  },
  pl: {
    badge: 'Jedna platforma, każdy dokument',
    title: 'Cokolwiek przyśle lekarz,',
    titleHighlight: 'Medyra to wyjaśni',
    subtitle: 'Wyniki laboratoryjne, listy lekarskie, wypisy ze szpitala, plany leków i pisma z ubezpieczalni, plus darmowy sprawdzacz wyników.',
    more: 'Dowiedz się więcej',
    descLab: 'Sprawdź pojedynczy wynik za darmo lub prześlij cały dokument po pełne wyjaśnienie.',
    descLetter: 'Każdy termin medyczny i skrót przetłumaczony na prosty język.',
    descHospital: 'Co się stało, co się zmieniło i co robić po szpitalu.',
    descMeds: 'Do czego służy każdy lek i jak go przyjmować, jasno wyjaśnione.',
    descInsurance: 'Decyzje, koszty i terminy bez urzędniczego języka.',
    descLanguages: 'Pełne wyjaśnienie przychodzi w Twoim języku, razem z czatem.',
  },
  zh: {
    badge: '一个平台，所有文件',
    title: '无论医生寄来什么，',
    titleHighlight: 'Medyra 都能解读',
    subtitle: '化验报告、医生信函、出院报告、用药计划和保险信函，还有免费的即时数值检查。',
    more: '了解更多',
    descLab: '免费检查单个数值，或上传完整报告获得全面解读。',
    descLetter: '每个医学术语和缩写都翻译成通俗语言。',
    descHospital: '发生了什么、有什么变化、出院后该做什么。',
    descMeds: '每种药物的用途和服用方法，一目了然。',
    descInsurance: '决定、费用和期限，没有官僚德语。',
    descLanguages: '完整解读以您的语言呈现，包括问答聊天。',
  },
  ja: {
    badge: 'ひとつのプラットフォームであらゆる書類を',
    title: '医師から届いた書類は何でも、',
    titleHighlight: 'Medyraが解説',
    subtitle: '検査報告書、医師の手紙、退院報告書、服薬計画、保険の書類。無料の数値チェックも。',
    more: '詳しく見る',
    descLab: '数値をひとつ無料でチェック、または報告書全体をアップロードして完全な解説を。',
    descLetter: 'すべての医学用語と略語をわかりやすい言葉に翻訳します。',
    descHospital: '何が起きたか、何が変わったか、退院後に何をすべきか。',
    descMeds: '各薬が何のためか、どう飲むかを明快に。',
    descInsurance: '決定、費用、期限をお役所言葉なしで。',
    descLanguages: '完全な解説があなたの言語で届きます。チャットも対応。',
  },
  ko: {
    badge: '하나의 플랫폼, 모든 문서',
    title: '의사가 무엇을 보내든,',
    titleHighlight: 'Medyra가 설명합니다',
    subtitle: '검사 결과지, 의사 소견서, 퇴원 보고서, 복약 계획, 보험 서류. 무료 즉시 수치 확인도 함께.',
    more: '자세히 보기',
    descLab: '수치 하나를 무료로 확인하거나 전체 결과지를 올려 완전한 설명을 받으세요.',
    descLetter: '모든 의학 용어와 약어를 쉬운 말로 번역합니다.',
    descHospital: '무슨 일이 있었는지, 무엇이 바뀌었는지, 퇴원 후 무엇을 해야 하는지.',
    descMeds: '각 약이 무엇을 위한 것인지, 어떻게 복용하는지 명확하게.',
    descInsurance: '결정, 비용, 기한을 관료적 표현 없이.',
    descLanguages: '완전한 설명이 당신의 언어로 도착합니다. 채팅 포함.',
  },
  hi: {
    badge: 'एक प्लेटफ़ॉर्म, हर दस्तावेज़',
    title: 'डॉक्टर जो भी भेजें,',
    titleHighlight: 'Medyra समझाएगा',
    subtitle: 'लैब रिपोर्ट, डॉक्टर पत्र, अस्पताल रिपोर्ट, दवा योजनाएं और बीमा पत्र, साथ में मुफ़्त तुरंत वैल्यू जांच।',
    more: 'और जानें',
    descLab: 'एक वैल्यू मुफ़्त जांचें या पूरी रिपोर्ट अपलोड कर पूरा स्पष्टीकरण पाएं।',
    descLetter: 'हर मेडिकल शब्द और संक्षेप सरल भाषा में अनुवादित।',
    descHospital: 'क्या हुआ, क्या बदला और अस्पताल के बाद क्या करना है।',
    descMeds: 'हर दवा किसलिए है और कैसे लेनी है, साफ़ शब्दों में।',
    descInsurance: 'निर्णय, लागत और समय सीमाएं, बिना जटिल भाषा के।',
    descLanguages: 'पूरा स्पष्टीकरण आपकी भाषा में आता है, चैट सहित।',
  },
  ur: {
    badge: 'ایک پلیٹ فارم، ہر دستاویز',
    title: 'ڈاکٹر جو بھی بھیجے،',
    titleHighlight: 'Medyra سمجھا دے گا',
    subtitle: 'لیب رپورٹس، ڈاکٹر خطوط، ہسپتال رپورٹس، ادویات کے منصوبے اور انشورنس خطوط، ساتھ مفت فوری ویلیو چیک۔',
    more: 'مزید جانیں',
    descLab: 'ایک ویلیو مفت جانچیں یا مکمل رپورٹ اپ لوڈ کر کے پوری وضاحت حاصل کریں۔',
    descLetter: 'ہر طبی اصطلاح اور مخفف آسان زبان میں ترجمہ۔',
    descHospital: 'کیا ہوا، کیا بدلا اور ہسپتال کے بعد کیا کرنا ہے۔',
    descMeds: 'ہر دوا کس لیے ہے اور کیسے لینی ہے، صاف الفاظ میں۔',
    descInsurance: 'فیصلے، اخراجات اور مہلتیں، دفتری زبان کے بغیر۔',
    descLanguages: 'مکمل وضاحت آپ کی زبان میں آتی ہے، چیٹ سمیت۔',
  },
  bn: {
    badge: 'এক প্ল্যাটফর্ম, প্রতিটি নথি',
    title: 'ডাক্তার যা ই পাঠান,',
    titleHighlight: 'Medyra ব্যাখ্যা করবে',
    subtitle: 'ল্যাব রিপোর্ট, ডাক্তারের চিঠি, হাসপাতাল রিপোর্ট, ওষুধের পরিকল্পনা ও বীমার চিঠি, সাথে বিনামূল্যের তাৎক্ষণিক মান যাচাই।',
    more: 'আরও জানুন',
    descLab: 'একটি মান বিনামূল্যে যাচাই করুন বা পুরো রিপোর্ট আপলোড করে সম্পূর্ণ ব্যাখ্যা নিন।',
    descLetter: 'প্রতিটি মেডিকেল শব্দ ও সংক্ষেপ সহজ ভাষায় অনূদিত।',
    descHospital: 'কী হয়েছে, কী বদলেছে এবং হাসপাতালের পরে কী করতে হবে।',
    descMeds: 'প্রতিটি ওষুধ কীসের জন্য এবং কীভাবে খেতে হবে, স্পষ্টভাবে।',
    descInsurance: 'সিদ্ধান্ত, খরচ ও সময়সীমা, জটিল ভাষা ছাড়া।',
    descLanguages: 'সম্পূর্ণ ব্যাখ্যা আপনার ভাষায় আসে, চ্যাটসহ।',
  },
}

function getPath(obj, dotted) {
  return dotted.split('.').reduce((o, k) => (o && typeof o === 'object' ? o[k] : undefined), obj)
}
function setPath(obj, dotted, value) {
  const keys = dotted.split('.')
  let o = obj
  for (const k of keys.slice(0, -1)) {
    if (!o[k] || typeof o[k] !== 'object') return false
    o = o[k]
  }
  o[keys[keys.length - 1]] = value
  return true
}

const locales = fs.readdirSync(MESSAGES_DIR).filter(f => f.endsWith('.json')).map(f => f.replace('.json', ''))

for (const locale of locales) {
  const file = path.join(MESSAGES_DIR, `${locale}.json`)
  const data = JSON.parse(fs.readFileSync(file, 'utf8'))

  // 18 -> 17 (Latin and Bengali numerals) in the count keys only
  let fixed = 0
  for (const key of COUNT_KEYS) {
    const v = getPath(data, key)
    if (typeof v === 'string' && (/18/.test(v) || /১৮/.test(v))) {
      setPath(data, key, v.replace(/18/g, '17').replace(/১৮/g, '১৭'))
      fixed++
    }
  }

  // featureShow keys (never overwrite)
  const add = F[locale] || F.en
  if (!data.featureShow || typeof data.featureShow !== 'object') data.featureShow = {}
  for (const [k, v] of Object.entries(add)) {
    if (!(k in data.featureShow)) data.featureShow[k] = v
  }

  fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n', 'utf8')
  console.log(`ok ${locale} (fixed ${fixed} count strings)`)
}
console.log('Done.')

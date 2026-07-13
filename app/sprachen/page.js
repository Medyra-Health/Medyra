import Link from 'next/link'
import AppHeader, { HeaderButton } from '@/components/AppHeader'
import FeatureCluster from '@/components/FeatureCluster'
import { getPageLocale, pickContent } from '@/lib/pageLocale'

export const metadata = {
  title: 'Deutscher Befund, erklärt in Ihrer Sprache: 17 Sprachen | Medyra',
  description:
    'Deutschen Arztbrief oder Laborbefund erhalten, aber die Sprache ist eine Hürde? Medyra erklärt deutsche medizinische Dokumente auf Türkisch, Arabisch, Englisch, Russisch, Polnisch und 12 weiteren Sprachen.',
  alternates: { canonical: 'https://medyra.de/sprachen' },
  openGraph: {
    title: 'Deutscher Befund, erklärt in Ihrer Sprache',
    description: 'Medyra erklärt deutsche medizinische Dokumente in 17 Sprachen.',
    url: 'https://medyra.de/sprachen',
  },
}

// Native-language value proposition, one line each (inherently multilingual)
const LANGS = [
  { label: 'English', line: 'Your German medical report, explained in plain English.', rtl: false },
  { label: 'Türkçe', line: 'Almanca tıbbi raporunuz, anlaşılır Türkçe ile açıklanır.', rtl: false },
  { label: 'العربية', line: 'تقريرك الطبي الألماني، مشروحاً بالعربية بلغة بسيطة.', rtl: true },
  { label: 'Русский', line: 'Ваш немецкий медицинский документ, объяснённый по-русски.', rtl: false },
  { label: 'Polski', line: 'Twój niemiecki wynik badania, wyjaśniony po polsku.', rtl: false },
  { label: 'Español', line: 'Tu informe médico alemán, explicado en español sencillo.', rtl: false },
  { label: 'Français', line: 'Votre compte rendu médical allemand, expliqué en français.', rtl: false },
  { label: 'Italiano', line: 'Il tuo referto medico tedesco, spiegato in italiano.', rtl: false },
  { label: 'Português', line: 'O seu relatório médico alemão, explicado em português.', rtl: false },
  { label: 'Nederlands', line: 'Uw Duitse medische verslag, uitgelegd in het Nederlands.', rtl: false },
  { label: '中文', line: '您的德国医疗报告，用简明中文解释。', rtl: false },
  { label: '日本語', line: 'ドイツの医療報告書を、わかりやすい日本語で説明します。', rtl: false },
  { label: '한국어', line: '독일 의료 보고서를 쉬운 한국어로 설명해 드립니다.', rtl: false },
  { label: 'हिन्दी', line: 'आपकी जर्मन मेडिकल रिपोर्ट, सरल हिन्दी में समझाई गई।', rtl: false },
  { label: 'اردو', line: 'آپ کی جرمن طبی رپورٹ، آسان اردو میں سمجھائی گئی۔', rtl: true },
  { label: 'বাংলা', line: 'আপনার জার্মান মেডিকেল রিপোর্ট, সহজ বাংলায় ব্যাখ্যা করা।', rtl: false },
  { label: 'Deutsch', line: 'Ihr Befund, in einfacher Sprache statt Fachchinesisch.', rtl: false },
]

const CONTENT = {
  de: {
    headerTitle: '17 Sprachen', headerCta: 'Befund hochladen', back: 'Start',
    badge: 'Für alle, die in Deutschland leben',
    h1a: 'Deutscher Befund.', h1b: 'Ihre Sprache.',
    sub: 'Millionen Menschen in Deutschland bekommen medizinische Dokumente in einer Sprache, die nicht ihre Muttersprache ist. Medyra erklärt deutsche Befunde in 17 Sprachen, medizinisch präzise und verständlich.',
    cta: 'Jetzt kostenlos ausprobieren',
    gridLabel: '17 Sprachen', gridTitle: 'In Ihren Worten',
    stepsLabel: 'So funktioniert es', stepsTitle: 'Drei Schritte zur Klarheit',
    steps: [
      { title: 'Sprache wählen', desc: 'Oben rechts Ihre Sprache einstellen, einmal, dann bleibt sie gespeichert.' },
      { title: 'Deutsches Dokument hochladen', desc: 'Laborbefund, Arztbrief, Medikationsplan oder Krankenkassen-Brief, als PDF oder Foto.' },
      { title: 'Erklärung in Ihrer Sprache', desc: 'Die komplette Erklärung samt Arztfragen erscheint in Ihrer Sprache. Deutsche Fachbegriffe bleiben erkennbar in Klammern.' },
    ],
    chatNote: 'Auch der Frage-Chat antwortet in Ihrer Sprache: Stellen Sie Ihre Rückfrage auf Türkisch, Arabisch oder Polnisch und Medyra antwortet genauso.',
    ctaTitle: 'Gesundheit sollte keine Sprachbarriere haben',
    ctaSub: '3 Dokumente pro Monat kostenlos. DSGVO-konform, verschlüsselt, automatisch gelöscht.',
    ctaButton: 'Befund in meiner Sprache erklären',
  },
  en: {
    headerTitle: '17 languages', headerCta: 'Upload report', back: 'Home',
    badge: 'For everyone living in Germany',
    h1a: 'German report.', h1b: 'Your language.',
    sub: 'Millions of people in Germany receive medical documents in a language that is not their mother tongue. Medyra explains German medical documents in 17 languages, medically precise and understandable.',
    cta: 'Try it free now',
    gridLabel: '17 languages', gridTitle: 'In your own words',
    stepsLabel: 'How it works', stepsTitle: 'Three steps to clarity',
    steps: [
      { title: 'Choose your language', desc: 'Set your language at the top right, once, and it stays saved.' },
      { title: 'Upload the German document', desc: 'Lab report, doctor letter, medication plan or insurance letter, as PDF or photo.' },
      { title: 'Explanation in your language', desc: 'The complete explanation including doctor questions appears in your language. German medical terms stay recognizable in brackets.' },
    ],
    chatNote: 'The follow up chat answers in your language too: ask in Turkish, Arabic or Polish and Medyra replies the same way.',
    ctaTitle: 'Health should have no language barrier',
    ctaSub: '3 documents per month free. GDPR compliant, encrypted, deleted automatically.',
    ctaButton: 'Explain my report in my language',
  },
  tr: {
    headerTitle: '17 dil', headerCta: 'Rapor yükle', back: 'Ana sayfa',
    badge: 'Almanya’da yaşayan herkes için',
    h1a: 'Almanca rapor.', h1b: 'Sizin diliniz.',
    sub: 'Almanya’da milyonlarca insan ana dili olmayan bir dilde tıbbi belgeler alıyor. Medyra Almanca tıbbi belgeleri 17 dilde, tıbben doğru ve anlaşılır şekilde açıklar.',
    cta: 'Şimdi ücretsiz deneyin',
    gridLabel: '17 dil', gridTitle: 'Kendi kelimelerinizle',
    stepsLabel: 'Nasıl çalışır', stepsTitle: 'Netliğe üç adım',
    steps: [
      { title: 'Dilinizi seçin', desc: 'Sağ üstten dilinizi bir kez ayarlayın, kayıtlı kalır.' },
      { title: 'Almanca belgeyi yükleyin', desc: 'Tahlil raporu, doktor mektubu, ilaç planı veya sigorta yazısı; PDF veya fotoğraf olarak.' },
      { title: 'Açıklama sizin dilinizde', desc: 'Doktor soruları dahil eksiksiz açıklama sizin dilinizde görünür. Almanca tıbbi terimler parantez içinde tanınabilir kalır.' },
    ],
    chatNote: 'Soru cevap sohbeti de sizin dilinizde yanıt verir: Türkçe, Arapça veya Lehçe sorun, Medyra aynı dilde cevaplasın.',
    ctaTitle: 'Sağlıkta dil engeli olmamalı',
    ctaSub: 'Ayda 3 belge ücretsiz. GDPR uyumlu, şifreli, otomatik silinir.',
    ctaButton: 'Raporumu kendi dilimde açıkla',
  },
  ar: {
    headerTitle: '17 لغة', headerCta: 'ارفع التقرير', back: 'الرئيسية',
    badge: 'لكل من يعيش في ألمانيا',
    h1a: 'تقرير ألماني.', h1b: 'لغتك أنت.',
    sub: 'ملايين الناس في ألمانيا يتلقون مستندات طبية بلغة ليست لغتهم الأم. يشرح Medyra المستندات الطبية الألمانية بـ 17 لغة، بدقة طبية وبأسلوب مفهوم.',
    cta: 'جربه مجاناً الآن',
    gridLabel: '17 لغة', gridTitle: 'بكلماتك أنت',
    stepsLabel: 'كيف يعمل', stepsTitle: 'ثلاث خطوات نحو الوضوح',
    steps: [
      { title: 'اختر لغتك', desc: 'اضبط لغتك في الأعلى مرة واحدة، وستبقى محفوظة.' },
      { title: 'ارفع المستند الألماني', desc: 'تقرير مختبر أو خطاب طبيب أو خطة أدوية أو خطاب تأمين؛ كملف PDF أو صورة.' },
      { title: 'الشرح بلغتك', desc: 'يظهر الشرح الكامل مع أسئلة الطبيب بلغتك. تبقى المصطلحات الألمانية واضحة بين قوسين.' },
    ],
    chatNote: 'محادثة الأسئلة تجيب بلغتك أيضاً: اسأل بالعربية أو التركية أو البولندية وسيرد Medyra بنفس اللغة.',
    ctaTitle: 'الصحة يجب ألا يكون لها حاجز لغوي',
    ctaSub: '3 مستندات شهرياً مجاناً. متوافق مع GDPR، مشفر، يُحذف تلقائياً.',
    ctaButton: 'اشرح تقريري بلغتي',
  },
  ru: {
    headerTitle: '17 языков', headerCta: 'Загрузить документ', back: 'Главная',
    badge: 'Для всех, кто живёт в Германии',
    h1a: 'Немецкий документ.', h1b: 'Ваш язык.',
    sub: 'Миллионы людей в Германии получают медицинские документы на языке, который не является их родным. Medyra объясняет немецкие медицинские документы на 17 языках, медицински точно и понятно.',
    cta: 'Попробовать бесплатно',
    gridLabel: '17 языков', gridTitle: 'Вашими словами',
    stepsLabel: 'Как это работает', stepsTitle: 'Три шага к ясности',
    steps: [
      { title: 'Выберите язык', desc: 'Установите язык вверху справа один раз, и он сохранится.' },
      { title: 'Загрузите немецкий документ', desc: 'Анализ, письмо врача, план приёма лекарств или письмо страховой; как PDF или фото.' },
      { title: 'Объяснение на вашем языке', desc: 'Полное объяснение вместе с вопросами для врача появляется на вашем языке. Немецкие термины остаются узнаваемыми в скобках.' },
    ],
    chatNote: 'Чат с вопросами тоже отвечает на вашем языке: спросите по-русски, по-турецки или по-польски, и Medyra ответит так же.',
    ctaTitle: 'У здоровья не должно быть языкового барьера',
    ctaSub: '3 документа в месяц бесплатно. GDPR, шифрование, автоматическое удаление.',
    ctaButton: 'Объяснить документ на моём языке',
  },
  fr: {
    headerTitle: '17 langues', headerCta: 'Télécharger le rapport', back: 'Accueil',
    badge: 'Pour tous ceux qui vivent en Allemagne',
    h1a: 'Rapport allemand.', h1b: 'Votre langue.',
    sub: 'Des millions de personnes en Allemagne reçoivent des documents médicaux dans une langue qui n’est pas leur langue maternelle. Medyra explique les documents médicaux allemands en 17 langues, avec précision médicale et clarté.',
    cta: 'Essayez gratuitement maintenant',
    gridLabel: '17 langues', gridTitle: 'Dans vos propres mots',
    stepsLabel: 'Comment ça marche', stepsTitle: 'Trois étapes vers la clarté',
    steps: [
      { title: 'Choisissez votre langue', desc: 'Définissez votre langue en haut à droite, une seule fois, elle reste enregistrée.' },
      { title: 'Téléchargez le document allemand', desc: 'Résultat de laboratoire, lettre de médecin, plan de médication ou lettre d’assurance, en PDF ou photo.' },
      { title: 'Explication dans votre langue', desc: 'L’explication complète, y compris les questions pour le médecin, apparaît dans votre langue. Les termes médicaux allemands restent reconnaissables entre parenthèses.' },
    ],
    chatNote: 'Le chat de suivi répond aussi dans votre langue : posez votre question en turc, en arabe ou en polonais, et Medyra répond de la même manière.',
    ctaTitle: 'La santé ne devrait pas connaître de barrière linguistique',
    ctaSub: '3 documents par mois gratuits. Conforme au RGPD, chiffré, supprimé automatiquement.',
    ctaButton: 'Expliquer mon rapport dans ma langue',
  },
  es: {
    headerTitle: '17 idiomas', headerCta: 'Subir informe', back: 'Inicio',
    badge: 'Para todos los que viven en Alemania',
    h1a: 'Informe alemán.', h1b: 'Su idioma.',
    sub: 'Millones de personas en Alemania reciben documentos médicos en un idioma que no es su lengua materna. Medyra explica los documentos médicos alemanes en 17 idiomas, con precisión médica y de forma comprensible.',
    cta: 'Pruébelo gratis ahora',
    gridLabel: '17 idiomas', gridTitle: 'En sus propias palabras',
    stepsLabel: 'Cómo funciona', stepsTitle: 'Tres pasos hacia la claridad',
    steps: [
      { title: 'Elija su idioma', desc: 'Configure su idioma arriba a la derecha, una sola vez, y quedará guardado.' },
      { title: 'Suba el documento alemán', desc: 'Informe de laboratorio, carta médica, plan de medicación o carta del seguro, en PDF o foto.' },
      { title: 'Explicación en su idioma', desc: 'La explicación completa, incluidas las preguntas para el médico, aparece en su idioma. Los términos médicos alemanes permanecen reconocibles entre paréntesis.' },
    ],
    chatNote: 'El chat de seguimiento también responde en su idioma: pregunte en turco, árabe o polaco, y Medyra responderá igual.',
    ctaTitle: 'La salud no debería tener barreras de idioma',
    ctaSub: '3 documentos al mes gratis. Conforme al RGPD, cifrado, eliminado automáticamente.',
    ctaButton: 'Explicar mi informe en mi idioma',
  },
  it: {
    headerTitle: '17 lingue', headerCta: 'Carica il referto', back: 'Home',
    badge: 'Per chiunque viva in Germania',
    h1a: 'Referto tedesco.', h1b: 'La tua lingua.',
    sub: 'Milioni di persone in Germania ricevono documenti medici in una lingua che non è la loro madrelingua. Medyra spiega i documenti medici tedeschi in 17 lingue, con precisione medica e in modo comprensibile.',
    cta: 'Provalo gratis ora',
    gridLabel: '17 lingue', gridTitle: 'Nelle tue parole',
    stepsLabel: 'Come funziona', stepsTitle: 'Tre passi verso la chiarezza',
    steps: [
      { title: 'Scegli la tua lingua', desc: 'Imposta la tua lingua in alto a destra, una sola volta, e resterà salvata.' },
      { title: 'Carica il documento tedesco', desc: 'Referto di laboratorio, lettera del medico, piano terapeutico o lettera assicurativa, come PDF o foto.' },
      { title: 'Spiegazione nella tua lingua', desc: 'La spiegazione completa, incluse le domande per il medico, appare nella tua lingua. I termini medici tedeschi restano riconoscibili tra parentesi.' },
    ],
    chatNote: 'Anche la chat di follow-up risponde nella tua lingua: chiedi in turco, arabo o polacco, e Medyra risponderà allo stesso modo.',
    ctaTitle: 'La salute non dovrebbe avere barriere linguistiche',
    ctaSub: '3 documenti al mese gratis. Conforme al GDPR, crittografato, eliminato automaticamente.',
    ctaButton: 'Spiega il mio referto nella mia lingua',
  },
  pt: {
    headerTitle: '17 idiomas', headerCta: 'Enviar relatório', back: 'Início',
    badge: 'Para todos que vivem na Alemanha',
    h1a: 'Relatório alemão.', h1b: 'Seu idioma.',
    sub: 'Milhões de pessoas na Alemanha recebem documentos médicos em um idioma que não é sua língua materna. A Medyra explica documentos médicos alemães em 17 idiomas, com precisão médica e de forma compreensível.',
    cta: 'Experimente grátis agora',
    gridLabel: '17 idiomas', gridTitle: 'Nas suas próprias palavras',
    stepsLabel: 'Como funciona', stepsTitle: 'Três passos para a clareza',
    steps: [
      { title: 'Escolha seu idioma', desc: 'Defina seu idioma no canto superior direito, uma vez, e ele permanece salvo.' },
      { title: 'Envie o documento alemão', desc: 'Relatório laboratorial, carta médica, plano de medicação ou carta do seguro, em PDF ou foto.' },
      { title: 'Explicação no seu idioma', desc: 'A explicação completa, incluindo perguntas para o médico, aparece no seu idioma. Os termos médicos alemães permanecem reconhecíveis entre parênteses.' },
    ],
    chatNote: 'O chat de acompanhamento também responde no seu idioma: pergunte em turco, árabe ou polonês, e a Medyra responderá da mesma forma.',
    ctaTitle: 'A saúde não deveria ter barreira de idioma',
    ctaSub: '3 documentos por mês grátis. Conforme o RGPD, criptografado, excluído automaticamente.',
    ctaButton: 'Explicar meu relatório no meu idioma',
  },
  nl: {
    headerTitle: '17 talen', headerCta: 'Rapport uploaden', back: 'Home',
    badge: 'Voor iedereen die in Duitsland woont',
    h1a: 'Duits rapport.', h1b: 'Uw taal.',
    sub: 'Miljoenen mensen in Duitsland ontvangen medische documenten in een taal die niet hun moedertaal is. Medyra legt Duitse medische documenten uit in 17 talen, medisch precies en begrijpelijk.',
    cta: 'Probeer nu gratis',
    gridLabel: '17 talen', gridTitle: 'In uw eigen woorden',
    stepsLabel: 'Hoe het werkt', stepsTitle: 'Drie stappen naar duidelijkheid',
    steps: [
      { title: 'Kies uw taal', desc: 'Stel uw taal rechtsboven één keer in, en deze blijft opgeslagen.' },
      { title: 'Upload het Duitse document', desc: 'Labrapport, doktersbrief, medicatieschema of verzekeringsbrief, als PDF of foto.' },
      { title: 'Uitleg in uw taal', desc: 'De volledige uitleg inclusief vragen voor de arts verschijnt in uw taal. Duitse medische termen blijven herkenbaar tussen haakjes.' },
    ],
    chatNote: 'Ook de vervolgchat antwoordt in uw taal: vraag in het Turks, Arabisch of Pools en Medyra antwoordt op dezelfde manier.',
    ctaTitle: 'Gezondheid zou geen taalbarrière moeten kennen',
    ctaSub: '3 documenten per maand gratis. AVG-conform, versleuteld, automatisch verwijderd.',
    ctaButton: 'Leg mijn rapport uit in mijn taal',
  },
  pl: {
    headerTitle: '17 języków', headerCta: 'Prześlij wynik', back: 'Start',
    badge: 'Dla wszystkich mieszkających w Niemczech',
    h1a: 'Niemiecki wynik.', h1b: 'Twój język.',
    sub: 'Miliony ludzi w Niemczech otrzymują dokumenty medyczne w języku, który nie jest ich językiem ojczystym. Medyra wyjaśnia niemieckie dokumenty medyczne w 17 językach, z medyczną precyzją i zrozumiale.',
    cta: 'Wypróbuj teraz za darmo',
    gridLabel: '17 języków', gridTitle: 'Twoimi własnymi słowami',
    stepsLabel: 'Jak to działa', stepsTitle: 'Trzy kroki do jasności',
    steps: [
      { title: 'Wybierz swój język', desc: 'Ustaw swój język w prawym górnym rogu, raz, a zostanie zapamiętany.' },
      { title: 'Prześlij niemiecki dokument', desc: 'Wynik laboratoryjny, pismo lekarskie, plan leków lub pismo od ubezpieczyciela, jako PDF lub zdjęcie.' },
      { title: 'Wyjaśnienie w twoim języku', desc: 'Pełne wyjaśnienie wraz z pytaniami do lekarza pojawia się w twoim języku. Niemieckie terminy medyczne pozostają rozpoznawalne w nawiasach.' },
    ],
    chatNote: 'Czat z pytaniami również odpowiada w twoim języku: zapytaj po turecku, arabsku lub polsku, a Medyra odpowie w ten sam sposób.',
    ctaTitle: 'Zdrowie nie powinno mieć bariery językowej',
    ctaSub: '3 dokumenty miesięcznie za darmo. Zgodność z RODO, szyfrowanie, automatyczne usuwanie.',
    ctaButton: 'Wyjaśnij mój wynik w moim języku',
  },
  zh: {
    headerTitle: '17种语言', headerCta: '上传报告', back: '首页',
    badge: '为所有居住在德国的人',
    h1a: '德文报告。', h1b: '您的语言。',
    sub: '德国数百万人收到的医疗文件语言并非其母语。Medyra用17种语言解释德文医疗文件，医学上精准且通俗易懂。',
    cta: '立即免费试用',
    gridLabel: '17种语言', gridTitle: '用您自己的语言',
    stepsLabel: '工作原理', stepsTitle: '清晰易懂的三个步骤',
    steps: [
      { title: '选择您的语言', desc: '在右上角设置一次您的语言，之后会自动保存。' },
      { title: '上传德文文件', desc: '化验报告、医生信件、用药计划或保险信件，可以是PDF或照片。' },
      { title: '用您的语言解释', desc: '完整的解释，包括给医生的问题，都会以您的语言呈现。德文专业术语会以括号形式保留，便于识别。' },
    ],
    chatNote: '后续聊天也会用您的语言回答：用土耳其语、阿拉伯语或波兰语提问，Medyra也会用同样的语言回复。',
    ctaTitle: '健康不应有语言障碍',
    ctaSub: '每月3份文件免费。符合GDPR，加密处理，自动删除。',
    ctaButton: '用我的语言解释我的报告',
  },
  ja: {
    headerTitle: '17言語', headerCta: '報告書をアップロード', back: 'ホーム',
    badge: 'ドイツに住むすべての方へ',
    h1a: 'ドイツ語の報告書。', h1b: 'あなたの言語で。',
    sub: 'ドイツでは何百万人もの人々が母国語ではない言語で医療文書を受け取っています。Medyraはドイツ語の医療文書を17言語で、医学的に正確かつ分かりやすく説明します。',
    cta: '今すぐ無料でお試しください',
    gridLabel: '17言語', gridTitle: 'あなた自身の言葉で',
    stepsLabel: '仕組み', stepsTitle: '明確さへの3つのステップ',
    steps: [
      { title: '言語を選択', desc: '右上で言語を一度設定すれば、保存されます。' },
      { title: 'ドイツ語の文書をアップロード', desc: '検査報告書、医師の手紙、服薬プラン、または保険の手紙をPDFまたは写真でアップロードします。' },
      { title: 'あなたの言語で説明', desc: '医師への質問を含む完全な説明があなたの言語で表示されます。ドイツ語の医学用語は括弧内でそのまま認識できます。' },
    ],
    chatNote: 'フォローアップチャットもあなたの言語で回答します：トルコ語、アラビア語、ポーランド語で質問すると、Medyraも同じ言語で返信します。',
    ctaTitle: '健康に言語の壁があってはいけません',
    ctaSub: '月3件の文書が無料。GDPR準拠、暗号化、自動削除。',
    ctaButton: '自分の言語で報告書を説明してもらう',
  },
  ko: {
    headerTitle: '17개 언어', headerCta: '보고서 업로드', back: '홈',
    badge: '독일에 거주하는 모든 분들을 위해',
    h1a: '독일어 보고서.', h1b: '당신의 언어로.',
    sub: '독일에서 수백만 명의 사람들이 모국어가 아닌 언어로 의료 문서를 받습니다. Medyra는 독일어 의료 문서를 17개 언어로, 의학적으로 정확하고 이해하기 쉽게 설명합니다.',
    cta: '지금 무료로 체험하기',
    gridLabel: '17개 언어', gridTitle: '당신의 언어로',
    stepsLabel: '작동 방식', stepsTitle: '명확함을 위한 세 단계',
    steps: [
      { title: '언어 선택', desc: '오른쪽 상단에서 언어를 한 번 설정하면 저장됩니다.' },
      { title: '독일어 문서 업로드', desc: '검사 보고서, 의사 편지, 복약 계획표 또는 보험 편지를 PDF나 사진으로 업로드하세요.' },
      { title: '당신의 언어로 설명', desc: '의사에게 물어볼 질문을 포함한 전체 설명이 당신의 언어로 표시됩니다. 독일어 의학 용어는 괄호 안에 그대로 표시되어 알아볼 수 있습니다.' },
    ],
    chatNote: '후속 채팅도 당신의 언어로 답변합니다: 터키어, 아랍어 또는 폴란드어로 질문하면 Medyra도 같은 언어로 답변합니다.',
    ctaTitle: '건강에는 언어 장벽이 없어야 합니다',
    ctaSub: '월 3건 문서 무료. GDPR 준수, 암호화, 자동 삭제.',
    ctaButton: '내 언어로 보고서 설명받기',
  },
  hi: {
    headerTitle: '17 भाषाएं', headerCta: 'रिपोर्ट अपलोड करें', back: 'होम',
    badge: 'जर्मनी में रहने वाले हर किसी के लिए',
    h1a: 'जर्मन रिपोर्ट।', h1b: 'आपकी भाषा।',
    sub: 'जर्मनी में लाखों लोग ऐसी भाषा में चिकित्सा दस्तावेज़ प्राप्त करते हैं जो उनकी मातृभाषा नहीं है। Medyra जर्मन चिकित्सा दस्तावेज़ों को 17 भाषाओं में, चिकित्सकीय रूप से सटीक और समझने योग्य ढंग से समझाता है।',
    cta: 'अभी मुफ़्त में आज़माएं',
    gridLabel: '17 भाषाएं', gridTitle: 'आपके अपने शब्दों में',
    stepsLabel: 'यह कैसे काम करता है', stepsTitle: 'स्पष्टता के तीन कदम',
    steps: [
      { title: 'अपनी भाषा चुनें', desc: 'ऊपर दाईं ओर अपनी भाषा एक बार सेट करें, यह सहेजी रहती है।' },
      { title: 'जर्मन दस्तावेज़ अपलोड करें', desc: 'लैब रिपोर्ट, डॉक्टर पत्र, दवा योजना या बीमा पत्र, PDF या फोटो के रूप में।' },
      { title: 'आपकी भाषा में स्पष्टीकरण', desc: 'डॉक्टर के सवालों सहित पूरा स्पष्टीकरण आपकी भाषा में दिखाई देता है। जर्मन चिकित्सा शब्द कोष्ठक में पहचाने जाने योग्य रहते हैं।' },
    ],
    chatNote: 'फॉलो-अप चैट भी आपकी भाषा में जवाब देती है: तुर्की, अरबी या पोलिश में पूछें, और Medyra उसी तरह जवाब देगा।',
    ctaTitle: 'स्वास्थ्य में भाषा की बाधा नहीं होनी चाहिए',
    ctaSub: 'हर महीने 3 दस्तावेज़ मुफ़्त। GDPR अनुरूप, एन्क्रिप्टेड, स्वचालित रूप से हटाया गया।',
    ctaButton: 'मेरी भाषा में मेरी रिपोर्ट समझाएं',
  },
  bn: {
    headerTitle: '১৭টি ভাষা', headerCta: 'রিপোর্ট আপলোড করুন', back: 'হোম',
    badge: 'জার্মানিতে বসবাসকারী সবার জন্য',
    h1a: 'জার্মান রিপোর্ট।', h1b: 'আপনার ভাষা।',
    sub: 'জার্মানিতে লক্ষ লক্ষ মানুষ এমন ভাষায় চিকিৎসা নথি পান যা তাদের মাতৃভাষা নয়। Medyra জার্মান চিকিৎসা নথিগুলি ১৭টি ভাষায়, চিকিৎসাগতভাবে সঠিক এবং বোধগম্যভাবে ব্যাখ্যা করে।',
    cta: 'এখনই বিনামূল্যে চেষ্টা করুন',
    gridLabel: '১৭টি ভাষা', gridTitle: 'আপনার নিজের ভাষায়',
    stepsLabel: 'এটি কীভাবে কাজ করে', stepsTitle: 'স্পষ্টতার জন্য তিনটি ধাপ',
    steps: [
      { title: 'আপনার ভাষা বেছে নিন', desc: 'উপরের ডানদিকে একবার আপনার ভাষা সেট করুন, এটি সংরক্ষিত থাকবে।' },
      { title: 'জার্মান নথি আপলোড করুন', desc: 'ল্যাব রিপোর্ট, ডাক্তার পত্র, ওষুধের পরিকল্পনা বা বীমা পত্র, PDF বা ছবি হিসেবে।' },
      { title: 'আপনার ভাষায় ব্যাখ্যা', desc: 'ডাক্তারের প্রশ্নসহ সম্পূর্ণ ব্যাখ্যা আপনার ভাষায় প্রদর্শিত হয়। জার্মান চিকিৎসা পরিভাষা বন্ধনীতে চেনার মতো থাকে।' },
    ],
    chatNote: 'ফলো-আপ চ্যাটও আপনার ভাষায় উত্তর দেয়: তুর্কি, আরবি বা পোলিশ ভাষায় জিজ্ঞাসা করুন, এবং Medyra একইভাবে উত্তর দেবে।',
    ctaTitle: 'স্বাস্থ্যে ভাষার বাধা থাকা উচিত নয়',
    ctaSub: 'মাসে ৩টি নথি বিনামূল্যে। GDPR সম্মত, এনক্রিপ্টেড, স্বয়ংক্রিয়ভাবে মুছে ফেলা।',
    ctaButton: 'আমার ভাষায় আমার রিপোর্ট ব্যাখ্যা করুন',
  },
  ur: {
    headerTitle: '17 زبانیں', headerCta: 'رپورٹ اپ لوڈ کریں', back: 'ہوم',
    badge: 'جرمنی میں رہنے والے ہر شخص کے لیے',
    h1a: 'جرمن رپورٹ۔', h1b: 'آپ کی زبان۔',
    sub: 'جرمنی میں لاکھوں لوگ ایسی زبان میں طبی دستاویزات وصول کرتے ہیں جو ان کی مادری زبان نہیں ہے۔ Medyra جرمن طبی دستاویزات کو 17 زبانوں میں، طبی طور پر درست اور قابل فہم انداز میں بیان کرتا ہے۔',
    cta: 'ابھی مفت آزمائیں',
    gridLabel: '17 زبانیں', gridTitle: 'اپنے الفاظ میں',
    stepsLabel: 'یہ کیسے کام کرتا ہے', stepsTitle: 'وضاحت کے تین مراحل',
    steps: [
      { title: 'اپنی زبان منتخب کریں', desc: 'اوپر دائیں جانب اپنی زبان ایک بار سیٹ کریں، یہ محفوظ رہے گی۔' },
      { title: 'جرمن دستاویز اپ لوڈ کریں', desc: 'لیب رپورٹ، ڈاکٹر کا خط، ادویات کا منصوبہ یا انشورنس خط، PDF یا تصویر کی صورت میں۔' },
      { title: 'آپ کی زبان میں وضاحت', desc: 'ڈاکٹر کے سوالات سمیت مکمل وضاحت آپ کی زبان میں ظاہر ہوتی ہے۔ جرمن طبی اصطلاحات قوسین میں پہچانی جانے کے قابل رہتی ہیں۔' },
    ],
    chatNote: 'فالو اپ چیٹ بھی آپ کی زبان میں جواب دیتی ہے: ترکی، عربی یا پولش میں پوچھیں، اور Medyra اسی طرح جواب دے گا۔',
    ctaTitle: 'صحت میں زبان کی رکاوٹ نہیں ہونی چاہیے',
    ctaSub: 'ماہانہ 3 دستاویزات مفت۔ GDPR کے مطابق، خفیہ کاری، خودکار حذف۔',
    ctaButton: 'میری زبان میں میری رپورٹ کی وضاحت کریں',
  },
}

export default async function SprachenPage() {
  const locale = await getPageLocale()
  const c = pickContent(CONTENT, locale)

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: 'var(--font-dm-sans), sans-serif' }}>
      <style>{`.font-display { font-family: var(--font-playfair), Georgia, serif; }`}</style>

      <AppHeader back={{ href: '/', label: c.back }} title={c.headerTitle} tone="emerald">
        <HeaderButton href="/upload" tone="emerald">{c.headerCta}</HeaderButton>
      </AppHeader>

      {/* Dark hero */}
      <section className="relative bg-[#040C08] overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="absolute -top-24 left-[20%] w-[500px] h-[500px] rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.10) 0%, transparent 68%)' }} />
          <div className="absolute -bottom-32 right-[15%] w-[420px] h-[420px] rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(52,211,153,0.06) 0%, transparent 68%)' }} />
        </div>

        <div className="container mx-auto px-4 max-w-4xl relative z-10 pt-16 pb-24 md:pt-24 md:pb-28 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-semibold tracking-wide mb-6">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
            {c.badge}
          </div>
          <h1 className="font-display text-4xl md:text-6xl font-bold text-[#E8F5F0] leading-[1.1] mb-6">
            {c.h1a}{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#10B981] to-[#34D399]">
              {c.h1b}
            </span>
          </h1>
          <p className="text-[#E8F5F0]/60 text-lg leading-relaxed max-w-2xl mx-auto mb-10">{c.sub}</p>
          <Link
            href="/upload"
            className="inline-flex items-center justify-center px-9 h-12 rounded-xl bg-gradient-to-r from-[#10B981] to-[#059669] text-white text-base font-bold shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-shadow"
          >
            {c.cta}
          </Link>
        </div>
        <div aria-hidden="true" className="absolute bottom-0 inset-x-0 h-16 bg-gradient-to-b from-transparent to-white pointer-events-none" />
      </section>

      {/* Language grid with native lines */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-12">
            <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-3">{c.gridLabel}</p>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-[#0B1F17]">{c.gridTitle}</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {LANGS.map(l => (
              <div
                key={l.label}
                dir={l.rtl ? 'rtl' : 'ltr'}
                className="rounded-2xl border border-gray-200 bg-white p-5 hover:border-emerald-200 hover:shadow-md transition-all"
              >
                <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-2">{l.label}</p>
                <p className="text-sm text-gray-700 leading-relaxed">{l.line}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 md:py-24 bg-[#F3FAF6]">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-12">
            <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-3">{c.stepsLabel}</p>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-[#0B1F17]">{c.stepsTitle}</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {c.steps.map((s, i) => (
              <div key={i} className="rounded-2xl bg-white border border-gray-200 p-7 text-center">
                <span className="inline-flex w-10 h-10 rounded-full bg-emerald-500 text-white font-black items-center justify-center mb-4">
                  {i + 1}
                </span>
                <h3 className="font-bold text-[#0B1F17] mb-2">{s.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
          <p className="text-center text-sm text-gray-500 mt-10 max-w-xl mx-auto leading-relaxed">{c.chatNote}</p>
        </div>
      </section>

      <FeatureCluster current="/sprachen" pageName="17 Sprachen" locale={locale} />

      {/* CTA band */}
      <section className="py-16 md:py-20 bg-[#040C08]">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-[#E8F5F0] mb-4">{c.ctaTitle}</h2>
          <p className="text-[#E8F5F0]/55 mb-8 max-w-lg mx-auto">{c.ctaSub}</p>
          <Link
            href="/upload"
            className="inline-flex items-center justify-center px-9 h-12 rounded-xl bg-gradient-to-r from-[#10B981] to-[#059669] text-white text-base font-bold shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-shadow"
          >
            {c.ctaButton}
          </Link>
        </div>
      </section>
    </div>
  )
}

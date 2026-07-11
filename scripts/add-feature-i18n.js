/**
 * One-off: merge i18n keys for the July 2026 feature wave
 * (value checker, languages section, doc types, share, reminders, referral)
 * into all 17 locale files. Existing keys are never overwritten.
 *
 * Run: node scripts/add-feature-i18n.js
 */
const fs = require('fs')
const path = require('path')

const MESSAGES_DIR = path.join(__dirname, '..', 'messages')

const A = {
  en: {
    valueChecker: {
      badge: 'Free instant check', title: 'Is your lab value', titleHighlight: 'normal?',
      subtitle: 'Pick a value, type your number, and see instantly how it compares to the reference range. Free, no signup.',
      cardLabel: 'Live value check', noSignup: 'No signup needed', fullToolLink: 'Open the full lab value checker',
      searchPlaceholder: 'Search value, e.g. TSH, Ferritin', valuePlaceholder: 'Your value, e.g. 5.2',
      noResults: 'No matching value found', popular: 'Popular:',
      status: { low: 'Below normal range', normal: 'Within normal range', elevated: 'Above normal range', high: 'Well above normal range' },
      normalRange: 'Normal range', causesElevated: 'Common causes of high values', causesLow: 'Common causes of low values',
      learnMore: 'More about {value}', uploadCta: 'Explain my full report',
      enterValue: 'Enter your {value} value in {unit} to see how it compares.',
      disclaimer: 'General information based on standard adult reference ranges. Your lab may use different ranges; the range on your report applies. Not medical advice.',
    },
    languagesSection: {
      badge: '17 languages', title: 'Your German report,', titleHighlight: 'in your language',
      subtitle: 'Medyra explains German medical documents in 17 languages, including the follow-up chat.',
      cta: 'See all languages',
    },
    upload: {
      docTypeLabel: 'What are you uploading? (optional, helps the AI)',
      docTypeAuto: 'Detect automatically', docTypeLab: 'Lab report', docTypeLetter: 'Doctor letter',
      docTypeMedication: 'Medication plan', docTypeInsurance: 'Insurance letter',
    },
    report: {
      share: {
        button: 'Share', title: 'Share this explanation', description: 'Read-only link for family, caregivers or your doctor.',
        point1: 'Shows only the explanation, never your file or chat', point2: 'Expires automatically after 7 days', point3: 'You can revoke the link at any time',
        create: 'Create share link', copy: 'Copy', copied: 'Copied', expires: 'Valid until {date}',
        privacyNote: 'Anyone with this link can view the explanation. Share it only with people you trust.',
        revoke: 'Revoke link', revoked: 'Link revoked',
      },
      reminder: {
        title: 'Set a recheck reminder', description: 'We email you when it is time to recheck your values, so you can compare old and new.',
        in4w: 'In 4 weeks', in3m: 'In 3 months', in6m: 'In 6 months',
        created: 'Reminder set', activeTitle: 'Recheck reminder active', activeDesc: 'We will email you on {date}.',
        cancel: 'Cancel reminder', cancelled: 'Reminder cancelled',
      },
    },
    dashboard: {
      referral: {
        title: 'Invite friends', description: 'Share your link. You and your friend each get 1 extra free report per month.',
        copy: 'Copy', copied: 'Copied', stats: '{count} invited, +{bonus} bonus reports',
        shareText: 'Medyra explains medical reports in plain language. With my link we both get an extra free report:',
      },
    },
  },

  de: {
    valueChecker: {
      badge: 'Kostenlos testen', title: 'Ist Ihr Laborwert', titleHighlight: 'normal?',
      subtitle: 'Wert auswählen, Zahl eintippen und sofort sehen, wie er im Referenzbereich liegt. Kostenlos, ohne Anmeldung.',
      cardLabel: 'Live Wert-Check', noSignup: 'Ohne Anmeldung', fullToolLink: 'Zum vollständigen Laborwert-Checker',
      searchPlaceholder: 'Wert suchen, z. B. TSH, Ferritin', valuePlaceholder: 'Ihr Wert, z. B. 5,2',
      noResults: 'Kein passender Wert gefunden', popular: 'Beliebt:',
      status: { low: 'Unter dem Normalbereich', normal: 'Im Normalbereich', elevated: 'Über dem Normalbereich', high: 'Deutlich über dem Normalbereich' },
      normalRange: 'Normalbereich', causesElevated: 'Häufige Ursachen erhöhter Werte', causesLow: 'Häufige Ursachen niedriger Werte',
      learnMore: 'Mehr über {value}', uploadCta: 'Ganzen Befund erklären lassen',
      enterValue: 'Geben Sie Ihren {value}-Wert in {unit} ein, um ihn einzuordnen.',
      disclaimer: 'Allgemeine Information auf Basis üblicher Referenzbereiche für Erwachsene. Ihr Labor kann abweichen; maßgeblich ist der Bereich auf Ihrem Befund. Keine medizinische Beratung.',
    },
    languagesSection: {
      badge: '17 Sprachen', title: 'Ihr deutscher Befund,', titleHighlight: 'in Ihrer Sprache',
      subtitle: 'Medyra erklärt deutsche medizinische Dokumente in 17 Sprachen, inklusive Rückfragen-Chat.',
      cta: 'Alle Sprachen ansehen',
    },
    upload: {
      docTypeLabel: 'Was laden Sie hoch? (optional, hilft der KI)',
      docTypeAuto: 'Automatisch erkennen', docTypeLab: 'Laborbefund', docTypeLetter: 'Arztbrief',
      docTypeMedication: 'Medikationsplan', docTypeInsurance: 'Krankenkassen-Brief',
    },
    report: {
      share: {
        button: 'Teilen', title: 'Erklärung teilen', description: 'Schreibgeschützter Link für Familie, Angehörige oder Ihre Ärztin.',
        point1: 'Zeigt nur die Erklärung, nie Ihre Datei oder Ihren Chat', point2: 'Läuft nach 7 Tagen automatisch ab', point3: 'Jederzeit widerrufbar',
        create: 'Link erstellen', copy: 'Kopieren', copied: 'Kopiert', expires: 'Gültig bis {date}',
        privacyNote: 'Jeder mit diesem Link kann die Erklärung sehen. Teilen Sie ihn nur mit Personen, denen Sie vertrauen.',
        revoke: 'Link widerrufen', revoked: 'Link widerrufen',
      },
      reminder: {
        title: 'Kontroll-Erinnerung einrichten', description: 'Wir erinnern Sie per E-Mail, wenn es Zeit für die Kontrolle ist. Danach können Sie alte und neue Werte vergleichen.',
        in4w: 'In 4 Wochen', in3m: 'In 3 Monaten', in6m: 'In 6 Monaten',
        created: 'Erinnerung eingerichtet', activeTitle: 'Kontroll-Erinnerung aktiv', activeDesc: 'Wir erinnern Sie am {date} per E-Mail.',
        cancel: 'Erinnerung löschen', cancelled: 'Erinnerung gelöscht',
      },
    },
    dashboard: {
      referral: {
        title: 'Freunde einladen', description: 'Teilen Sie Ihren Link. Sie und Ihre Freunde erhalten je 1 zusätzlichen Gratis-Befund pro Monat.',
        copy: 'Kopieren', copied: 'Kopiert', stats: '{count} eingeladen, +{bonus} Bonus-Befunde',
        shareText: 'Medyra erklärt medizinische Befunde in verständlicher Sprache. Mit meinem Link bekommen wir beide einen zusätzlichen Gratis-Befund:',
      },
    },
  },

  tr: {
    valueChecker: {
      badge: 'Ücretsiz anında kontrol', title: 'Laboratuvar değeriniz', titleHighlight: 'normal mi?',
      subtitle: 'Bir değer seçin, sayınızı yazın ve referans aralığına göre durumunu anında görün. Ücretsiz, kayıt gerekmez.',
      cardLabel: 'Canlı değer kontrolü', noSignup: 'Kayıt gerekmez', fullToolLink: 'Tam laboratuvar değeri kontrolünü aç',
      searchPlaceholder: 'Değer arayın, örn. TSH, Ferritin', valuePlaceholder: 'Değeriniz, örn. 5,2',
      noResults: 'Eşleşen değer bulunamadı', popular: 'Popüler:',
      status: { low: 'Normal aralığın altında', normal: 'Normal aralıkta', elevated: 'Normal aralığın üzerinde', high: 'Normal aralığın çok üzerinde' },
      normalRange: 'Normal aralık', causesElevated: 'Yüksek değerlerin yaygın nedenleri', causesLow: 'Düşük değerlerin yaygın nedenleri',
      learnMore: '{value} hakkında daha fazla', uploadCta: 'Tüm raporumu açıkla',
      enterValue: '{value} değerinizi {unit} olarak girin ve durumunu görün.',
      disclaimer: 'Yetişkinler için standart referans aralıklarına dayalı genel bilgidir. Laboratuvarınız farklı aralıklar kullanabilir; raporunuzdaki aralık geçerlidir. Tıbbi tavsiye değildir.',
    },
    languagesSection: {
      badge: '17 dil', title: 'Almanca raporunuz,', titleHighlight: 'kendi dilinizde',
      subtitle: 'Medyra, Almanca tıbbi belgeleri soru-cevap sohbeti dahil 17 dilde açıklar.',
      cta: 'Tüm dilleri gör',
    },
    upload: {
      docTypeLabel: 'Ne yüklüyorsunuz? (isteğe bağlı, yapay zekaya yardımcı olur)',
      docTypeAuto: 'Otomatik algıla', docTypeLab: 'Laboratuvar raporu', docTypeLetter: 'Doktor mektubu',
      docTypeMedication: 'İlaç planı', docTypeInsurance: 'Sigorta mektubu',
    },
    report: {
      share: {
        button: 'Paylaş', title: 'Bu açıklamayı paylaş', description: 'Aile, bakıcılar veya doktorunuz için salt okunur bağlantı.',
        point1: 'Yalnızca açıklamayı gösterir, dosyanızı veya sohbetinizi asla göstermez', point2: '7 gün sonra otomatik olarak sona erer', point3: 'Bağlantıyı istediğiniz zaman iptal edebilirsiniz',
        create: 'Paylaşım bağlantısı oluştur', copy: 'Kopyala', copied: 'Kopyalandı', expires: '{date} tarihine kadar geçerli',
        privacyNote: 'Bu bağlantıya sahip herkes açıklamayı görebilir. Yalnızca güvendiğiniz kişilerle paylaşın.',
        revoke: 'Bağlantıyı iptal et', revoked: 'Bağlantı iptal edildi',
      },
      reminder: {
        title: 'Kontrol hatırlatıcısı kur', description: 'Değerlerinizi tekrar kontrol etme zamanı geldiğinde size e-posta göndeririz; eski ve yeni değerleri karşılaştırabilirsiniz.',
        in4w: '4 hafta sonra', in3m: '3 ay sonra', in6m: '6 ay sonra',
        created: 'Hatırlatıcı kuruldu', activeTitle: 'Kontrol hatırlatıcısı aktif', activeDesc: '{date} tarihinde size e-posta göndereceğiz.',
        cancel: 'Hatırlatıcıyı iptal et', cancelled: 'Hatırlatıcı iptal edildi',
      },
    },
    dashboard: {
      referral: {
        title: 'Arkadaşlarınızı davet edin', description: 'Bağlantınızı paylaşın. Siz ve arkadaşınız ayda 1 ek ücretsiz rapor kazanırsınız.',
        copy: 'Kopyala', copied: 'Kopyalandı', stats: '{count} davet edildi, +{bonus} bonus rapor',
        shareText: 'Medyra tıbbi raporları anlaşılır bir dille açıklıyor. Bağlantımla ikimiz de ekstra ücretsiz rapor kazanırız:',
      },
    },
  },

  ar: {
    valueChecker: {
      badge: 'فحص فوري مجاني', title: 'هل قيمة تحليلك', titleHighlight: 'طبيعية؟',
      subtitle: 'اختر القيمة، أدخل رقمك، وشاهد فوراً موقعه من النطاق المرجعي. مجاناً وبدون تسجيل.',
      cardLabel: 'فحص مباشر للقيم', noSignup: 'بدون تسجيل', fullToolLink: 'افتح أداة فحص قيم التحاليل الكاملة',
      searchPlaceholder: 'ابحث عن قيمة، مثل TSH أو Ferritin', valuePlaceholder: 'قيمتك، مثل 5.2',
      noResults: 'لم يتم العثور على قيمة مطابقة', popular: 'الأكثر شيوعاً:',
      status: { low: 'أقل من النطاق الطبيعي', normal: 'ضمن النطاق الطبيعي', elevated: 'أعلى من النطاق الطبيعي', high: 'أعلى بكثير من النطاق الطبيعي' },
      normalRange: 'النطاق الطبيعي', causesElevated: 'أسباب شائعة لارتفاع القيم', causesLow: 'أسباب شائعة لانخفاض القيم',
      learnMore: 'المزيد عن {value}', uploadCta: 'اشرح تقريري الكامل',
      enterValue: 'أدخل قيمة {value} بوحدة {unit} لمعرفة موقعها.',
      disclaimer: 'معلومات عامة تستند إلى النطاقات المرجعية القياسية للبالغين. قد يستخدم مختبرك نطاقات مختلفة؛ النطاق الوارد في تقريرك هو المعتمد. هذه ليست استشارة طبية.',
    },
    languagesSection: {
      badge: '17 لغة', title: 'تقريرك الألماني،', titleHighlight: 'بلغتك',
      subtitle: 'يشرح Medyra المستندات الطبية الألمانية بـ 17 لغة، بما في ذلك محادثة الأسئلة.',
      cta: 'عرض جميع اللغات',
    },
    upload: {
      docTypeLabel: 'ما الذي تقوم برفعه؟ (اختياري، يساعد الذكاء الاصطناعي)',
      docTypeAuto: 'اكتشاف تلقائي', docTypeLab: 'تقرير مختبر', docTypeLetter: 'خطاب طبيب',
      docTypeMedication: 'خطة الأدوية', docTypeInsurance: 'خطاب التأمين',
    },
    report: {
      share: {
        button: 'مشاركة', title: 'مشاركة هذا الشرح', description: 'رابط للقراءة فقط للعائلة أو مقدمي الرعاية أو طبيبك.',
        point1: 'يعرض الشرح فقط، ولا يعرض ملفك أو محادثتك أبداً', point2: 'تنتهي صلاحيته تلقائياً بعد 7 أيام', point3: 'يمكنك إلغاء الرابط في أي وقت',
        create: 'إنشاء رابط مشاركة', copy: 'نسخ', copied: 'تم النسخ', expires: 'صالح حتى {date}',
        privacyNote: 'يمكن لأي شخص لديه هذا الرابط رؤية الشرح. شاركه فقط مع أشخاص تثق بهم.',
        revoke: 'إلغاء الرابط', revoked: 'تم إلغاء الرابط',
      },
      reminder: {
        title: 'إعداد تذكير بإعادة الفحص', description: 'نرسل لك بريداً إلكترونياً عندما يحين وقت إعادة فحص قيمك، لتتمكن من مقارنة القديم بالجديد.',
        in4w: 'بعد 4 أسابيع', in3m: 'بعد 3 أشهر', in6m: 'بعد 6 أشهر',
        created: 'تم إعداد التذكير', activeTitle: 'تذكير إعادة الفحص مفعل', activeDesc: 'سنرسل لك بريداً إلكترونياً في {date}.',
        cancel: 'إلغاء التذكير', cancelled: 'تم إلغاء التذكير',
      },
    },
    dashboard: {
      referral: {
        title: 'ادعُ أصدقاءك', description: 'شارك رابطك. تحصل أنت وصديقك على تقرير مجاني إضافي كل شهر.',
        copy: 'نسخ', copied: 'تم النسخ', stats: 'تمت دعوة {count}، +{bonus} تقارير إضافية',
        shareText: 'يشرح Medyra التقارير الطبية بلغة بسيطة. عبر رابطي نحصل كلانا على تقرير مجاني إضافي:',
      },
    },
  },

  ru: {
    valueChecker: {
      badge: 'Бесплатная мгновенная проверка', title: 'Ваш лабораторный показатель', titleHighlight: 'в норме?',
      subtitle: 'Выберите показатель, введите число и сразу увидите, как оно соотносится с референсным диапазоном. Бесплатно, без регистрации.',
      cardLabel: 'Проверка показателя', noSignup: 'Без регистрации', fullToolLink: 'Открыть полный проверщик показателей',
      searchPlaceholder: 'Найти показатель, напр. TSH, Ferritin', valuePlaceholder: 'Ваше значение, напр. 5,2',
      noResults: 'Показатель не найден', popular: 'Популярные:',
      status: { low: 'Ниже нормы', normal: 'В пределах нормы', elevated: 'Выше нормы', high: 'Значительно выше нормы' },
      normalRange: 'Норма', causesElevated: 'Частые причины повышенных значений', causesLow: 'Частые причины пониженных значений',
      learnMore: 'Подробнее о {value}', uploadCta: 'Объяснить весь мой анализ',
      enterValue: 'Введите значение {value} в {unit}, чтобы увидеть результат.',
      disclaimer: 'Общая информация на основе стандартных референсных диапазонов для взрослых. Ваша лаборатория может использовать другие диапазоны; действителен диапазон в вашем бланке. Не является медицинской консультацией.',
    },
    languagesSection: {
      badge: '17 языков', title: 'Ваш немецкий документ,', titleHighlight: 'на вашем языке',
      subtitle: 'Medyra объясняет немецкие медицинские документы на 17 языках, включая чат с вопросами.',
      cta: 'Все языки',
    },
    upload: {
      docTypeLabel: 'Что вы загружаете? (необязательно, помогает ИИ)',
      docTypeAuto: 'Определить автоматически', docTypeLab: 'Лабораторный анализ', docTypeLetter: 'Врачебное письмо',
      docTypeMedication: 'План приёма лекарств', docTypeInsurance: 'Письмо из страховой',
    },
    report: {
      share: {
        button: 'Поделиться', title: 'Поделиться объяснением', description: 'Ссылка только для чтения: для семьи, близких или вашего врача.',
        point1: 'Показывает только объяснение, никогда ваш файл или чат', point2: 'Автоматически истекает через 7 дней', point3: 'Ссылку можно отозвать в любой момент',
        create: 'Создать ссылку', copy: 'Копировать', copied: 'Скопировано', expires: 'Действительна до {date}',
        privacyNote: 'Любой, у кого есть эта ссылка, может увидеть объяснение. Делитесь только с теми, кому доверяете.',
        revoke: 'Отозвать ссылку', revoked: 'Ссылка отозвана',
      },
      reminder: {
        title: 'Напоминание о повторном анализе', description: 'Мы напомним вам по электронной почте, когда придёт время перепроверить показатели, чтобы сравнить старые и новые.',
        in4w: 'Через 4 недели', in3m: 'Через 3 месяца', in6m: 'Через 6 месяцев',
        created: 'Напоминание создано', activeTitle: 'Напоминание активно', activeDesc: 'Мы напишем вам {date}.',
        cancel: 'Отменить напоминание', cancelled: 'Напоминание отменено',
      },
    },
    dashboard: {
      referral: {
        title: 'Пригласите друзей', description: 'Поделитесь своей ссылкой. Вы и ваш друг получите по 1 дополнительному бесплатному анализу в месяц.',
        copy: 'Копировать', copied: 'Скопировано', stats: 'Приглашено: {count}, +{bonus} бонусных анализов',
        shareText: 'Medyra объясняет медицинские документы простым языком. По моей ссылке мы оба получим дополнительный бесплатный анализ:',
      },
    },
  },

  pl: {
    valueChecker: {
      badge: 'Darmowe natychmiastowe sprawdzenie', title: 'Czy Twój wynik jest', titleHighlight: 'w normie?',
      subtitle: 'Wybierz parametr, wpisz liczbę i od razu zobacz, jak wypada na tle zakresu referencyjnego. Za darmo, bez rejestracji.',
      cardLabel: 'Sprawdzanie wyniku na żywo', noSignup: 'Bez rejestracji', fullToolLink: 'Otwórz pełne narzędzie sprawdzania wyników',
      searchPlaceholder: 'Szukaj parametru, np. TSH, Ferritin', valuePlaceholder: 'Twoja wartość, np. 5,2',
      noResults: 'Nie znaleziono parametru', popular: 'Popularne:',
      status: { low: 'Poniżej normy', normal: 'W normie', elevated: 'Powyżej normy', high: 'Znacznie powyżej normy' },
      normalRange: 'Zakres normy', causesElevated: 'Częste przyczyny podwyższonych wartości', causesLow: 'Częste przyczyny obniżonych wartości',
      learnMore: 'Więcej o {value}', uploadCta: 'Wyjaśnij cały mój wynik',
      enterValue: 'Wpisz swoją wartość {value} w {unit}, aby zobaczyć wynik.',
      disclaimer: 'Informacje ogólne oparte na standardowych zakresach referencyjnych dla dorosłych. Twoje laboratorium może stosować inne zakresy; obowiązuje zakres z Twojego wyniku. To nie jest porada medyczna.',
    },
    languagesSection: {
      badge: '17 języków', title: 'Twój niemiecki wynik,', titleHighlight: 'w Twoim języku',
      subtitle: 'Medyra wyjaśnia niemieckie dokumenty medyczne w 17 językach, łącznie z czatem.',
      cta: 'Zobacz wszystkie języki',
    },
    upload: {
      docTypeLabel: 'Co przesyłasz? (opcjonalnie, pomaga AI)',
      docTypeAuto: 'Wykryj automatycznie', docTypeLab: 'Wynik laboratoryjny', docTypeLetter: 'List lekarski',
      docTypeMedication: 'Plan leków', docTypeInsurance: 'List z ubezpieczalni',
    },
    report: {
      share: {
        button: 'Udostępnij', title: 'Udostępnij to wyjaśnienie', description: 'Link tylko do odczytu dla rodziny, opiekunów lub lekarza.',
        point1: 'Pokazuje tylko wyjaśnienie, nigdy Twój plik ani czat', point2: 'Wygasa automatycznie po 7 dniach', point3: 'Link możesz odwołać w każdej chwili',
        create: 'Utwórz link', copy: 'Kopiuj', copied: 'Skopiowano', expires: 'Ważny do {date}',
        privacyNote: 'Każdy, kto ma ten link, może zobaczyć wyjaśnienie. Udostępniaj go tylko zaufanym osobom.',
        revoke: 'Odwołaj link', revoked: 'Link odwołany',
      },
      reminder: {
        title: 'Ustaw przypomnienie o kontroli', description: 'Wyślemy Ci e-mail, gdy przyjdzie czas na ponowne badanie, abyś mógł porównać stare i nowe wartości.',
        in4w: 'Za 4 tygodnie', in3m: 'Za 3 miesiące', in6m: 'Za 6 miesięcy',
        created: 'Przypomnienie ustawione', activeTitle: 'Przypomnienie aktywne', activeDesc: 'Napiszemy do Ciebie {date}.',
        cancel: 'Anuluj przypomnienie', cancelled: 'Przypomnienie anulowane',
      },
    },
    dashboard: {
      referral: {
        title: 'Zaproś znajomych', description: 'Udostępnij swój link. Ty i Twój znajomy otrzymacie po 1 dodatkowym darmowym raporcie miesięcznie.',
        copy: 'Kopiuj', copied: 'Skopiowano', stats: 'Zaproszono: {count}, +{bonus} dodatkowych raportów',
        shareText: 'Medyra wyjaśnia dokumenty medyczne prostym językiem. Z moim linkiem oboje dostaniemy dodatkowy darmowy raport:',
      },
    },
  },

  es: {
    valueChecker: {
      badge: 'Comprobación instantánea gratis', title: '¿Tu valor de laboratorio es', titleHighlight: 'normal?',
      subtitle: 'Elige un valor, escribe tu número y ve al instante cómo se compara con el rango de referencia. Gratis, sin registro.',
      cardLabel: 'Comprobación en vivo', noSignup: 'Sin registro', fullToolLink: 'Abrir el comprobador completo de valores',
      searchPlaceholder: 'Buscar valor, p. ej. TSH, Ferritin', valuePlaceholder: 'Tu valor, p. ej. 5,2',
      noResults: 'No se encontró ningún valor', popular: 'Populares:',
      status: { low: 'Por debajo del rango normal', normal: 'Dentro del rango normal', elevated: 'Por encima del rango normal', high: 'Muy por encima del rango normal' },
      normalRange: 'Rango normal', causesElevated: 'Causas frecuentes de valores altos', causesLow: 'Causas frecuentes de valores bajos',
      learnMore: 'Más sobre {value}', uploadCta: 'Explicar mi informe completo',
      enterValue: 'Introduce tu valor de {value} en {unit} para ver el resultado.',
      disclaimer: 'Información general basada en rangos de referencia estándar para adultos. Tu laboratorio puede usar rangos diferentes; el rango de tu informe es el válido. No es consejo médico.',
    },
    languagesSection: {
      badge: '17 idiomas', title: 'Tu informe alemán,', titleHighlight: 'en tu idioma',
      subtitle: 'Medyra explica documentos médicos alemanes en 17 idiomas, incluido el chat de preguntas.',
      cta: 'Ver todos los idiomas',
    },
    upload: {
      docTypeLabel: '¿Qué estás subiendo? (opcional, ayuda a la IA)',
      docTypeAuto: 'Detectar automáticamente', docTypeLab: 'Informe de laboratorio', docTypeLetter: 'Carta médica',
      docTypeMedication: 'Plan de medicación', docTypeInsurance: 'Carta del seguro',
    },
    report: {
      share: {
        button: 'Compartir', title: 'Compartir esta explicación', description: 'Enlace de solo lectura para familia, cuidadores o tu médico.',
        point1: 'Muestra solo la explicación, nunca tu archivo ni tu chat', point2: 'Caduca automáticamente a los 7 días', point3: 'Puedes revocar el enlace en cualquier momento',
        create: 'Crear enlace', copy: 'Copiar', copied: 'Copiado', expires: 'Válido hasta {date}',
        privacyNote: 'Cualquiera con este enlace puede ver la explicación. Compártelo solo con personas de confianza.',
        revoke: 'Revocar enlace', revoked: 'Enlace revocado',
      },
      reminder: {
        title: 'Crear recordatorio de control', description: 'Te enviamos un correo cuando sea hora de repetir tus análisis, para comparar valores antiguos y nuevos.',
        in4w: 'En 4 semanas', in3m: 'En 3 meses', in6m: 'En 6 meses',
        created: 'Recordatorio creado', activeTitle: 'Recordatorio activo', activeDesc: 'Te escribiremos el {date}.',
        cancel: 'Cancelar recordatorio', cancelled: 'Recordatorio cancelado',
      },
    },
    dashboard: {
      referral: {
        title: 'Invita a tus amigos', description: 'Comparte tu enlace. Tú y tu amigo recibiréis 1 informe gratis adicional al mes.',
        copy: 'Copiar', copied: 'Copiado', stats: '{count} invitados, +{bonus} informes extra',
        shareText: 'Medyra explica informes médicos en lenguaje sencillo. Con mi enlace, ambos recibimos un informe gratis extra:',
      },
    },
  },

  fr: {
    valueChecker: {
      badge: 'Vérification instantanée gratuite', title: 'Votre valeur de laboratoire est-elle', titleHighlight: 'normale ?',
      subtitle: 'Choisissez une valeur, saisissez votre chiffre et voyez instantanément où elle se situe par rapport à la plage de référence. Gratuit, sans inscription.',
      cardLabel: 'Vérification en direct', noSignup: 'Sans inscription', fullToolLink: 'Ouvrir le vérificateur complet',
      searchPlaceholder: 'Rechercher une valeur, ex. TSH, Ferritin', valuePlaceholder: 'Votre valeur, ex. 5,2',
      noResults: 'Aucune valeur trouvée', popular: 'Populaires :',
      status: { low: 'Sous la plage normale', normal: 'Dans la plage normale', elevated: 'Au-dessus de la plage normale', high: 'Bien au-dessus de la plage normale' },
      normalRange: 'Plage normale', causesElevated: 'Causes fréquentes de valeurs élevées', causesLow: 'Causes fréquentes de valeurs basses',
      learnMore: 'En savoir plus sur {value}', uploadCta: 'Expliquer mon rapport complet',
      enterValue: 'Saisissez votre valeur {value} en {unit} pour voir le résultat.',
      disclaimer: 'Informations générales fondées sur les plages de référence standard pour adultes. Votre laboratoire peut utiliser des plages différentes ; la plage de votre compte rendu fait foi. Ceci ne constitue pas un avis médical.',
    },
    languagesSection: {
      badge: '17 langues', title: 'Votre compte rendu allemand,', titleHighlight: 'dans votre langue',
      subtitle: 'Medyra explique les documents médicaux allemands en 17 langues, y compris le chat de questions.',
      cta: 'Voir toutes les langues',
    },
    upload: {
      docTypeLabel: 'Que téléversez-vous ? (facultatif, aide l’IA)',
      docTypeAuto: 'Détecter automatiquement', docTypeLab: 'Analyse de laboratoire', docTypeLetter: 'Courrier médical',
      docTypeMedication: 'Plan de médication', docTypeInsurance: 'Courrier d’assurance',
    },
    report: {
      share: {
        button: 'Partager', title: 'Partager cette explication', description: 'Lien en lecture seule pour la famille, les aidants ou votre médecin.',
        point1: 'Montre uniquement l’explication, jamais votre fichier ni votre chat', point2: 'Expire automatiquement après 7 jours', point3: 'Vous pouvez révoquer le lien à tout moment',
        create: 'Créer un lien de partage', copy: 'Copier', copied: 'Copié', expires: 'Valable jusqu’au {date}',
        privacyNote: 'Toute personne disposant de ce lien peut voir l’explication. Ne le partagez qu’avec des personnes de confiance.',
        revoke: 'Révoquer le lien', revoked: 'Lien révoqué',
      },
      reminder: {
        title: 'Créer un rappel de contrôle', description: 'Nous vous envoyons un e-mail quand il est temps de refaire vos analyses, pour comparer anciennes et nouvelles valeurs.',
        in4w: 'Dans 4 semaines', in3m: 'Dans 3 mois', in6m: 'Dans 6 mois',
        created: 'Rappel créé', activeTitle: 'Rappel de contrôle actif', activeDesc: 'Nous vous écrirons le {date}.',
        cancel: 'Annuler le rappel', cancelled: 'Rappel annulé',
      },
    },
    dashboard: {
      referral: {
        title: 'Invitez vos amis', description: 'Partagez votre lien. Vous et votre ami recevez chacun 1 rapport gratuit supplémentaire par mois.',
        copy: 'Copier', copied: 'Copié', stats: '{count} invités, +{bonus} rapports bonus',
        shareText: 'Medyra explique les documents médicaux en langage simple. Avec mon lien, nous recevons tous les deux un rapport gratuit :',
      },
    },
  },

  it: {
    valueChecker: {
      badge: 'Verifica istantanea gratuita', title: 'Il tuo valore di laboratorio è', titleHighlight: 'normale?',
      subtitle: 'Scegli un valore, inserisci il numero e vedi subito come si colloca rispetto all’intervallo di riferimento. Gratis, senza registrazione.',
      cardLabel: 'Verifica dal vivo', noSignup: 'Senza registrazione', fullToolLink: 'Apri il verificatore completo dei valori',
      searchPlaceholder: 'Cerca valore, es. TSH, Ferritin', valuePlaceholder: 'Il tuo valore, es. 5,2',
      noResults: 'Nessun valore trovato', popular: 'Più cercati:',
      status: { low: 'Sotto l’intervallo normale', normal: 'Nell’intervallo normale', elevated: 'Sopra l’intervallo normale', high: 'Molto sopra l’intervallo normale' },
      normalRange: 'Intervallo normale', causesElevated: 'Cause frequenti di valori alti', causesLow: 'Cause frequenti di valori bassi',
      learnMore: 'Scopri di più su {value}', uploadCta: 'Spiega tutto il mio referto',
      enterValue: 'Inserisci il tuo valore {value} in {unit} per vedere il risultato.',
      disclaimer: 'Informazioni generali basate su intervalli di riferimento standard per adulti. Il tuo laboratorio può usare intervalli diversi; vale quello indicato sul tuo referto. Non è un consiglio medico.',
    },
    languagesSection: {
      badge: '17 lingue', title: 'Il tuo referto tedesco,', titleHighlight: 'nella tua lingua',
      subtitle: 'Medyra spiega i documenti medici tedeschi in 17 lingue, chat di domande inclusa.',
      cta: 'Vedi tutte le lingue',
    },
    upload: {
      docTypeLabel: 'Cosa stai caricando? (facoltativo, aiuta l’IA)',
      docTypeAuto: 'Rileva automaticamente', docTypeLab: 'Referto di laboratorio', docTypeLetter: 'Lettera del medico',
      docTypeMedication: 'Piano terapeutico', docTypeInsurance: 'Lettera dell’assicurazione',
    },
    report: {
      share: {
        button: 'Condividi', title: 'Condividi questa spiegazione', description: 'Link di sola lettura per famiglia, caregiver o il tuo medico.',
        point1: 'Mostra solo la spiegazione, mai il tuo file o la chat', point2: 'Scade automaticamente dopo 7 giorni', point3: 'Puoi revocare il link in qualsiasi momento',
        create: 'Crea link di condivisione', copy: 'Copia', copied: 'Copiato', expires: 'Valido fino al {date}',
        privacyNote: 'Chiunque abbia questo link può vedere la spiegazione. Condividilo solo con persone di fiducia.',
        revoke: 'Revoca link', revoked: 'Link revocato',
      },
      reminder: {
        title: 'Imposta un promemoria di controllo', description: 'Ti inviamo un’e-mail quando è ora di ricontrollare i tuoi valori, così puoi confrontare vecchi e nuovi.',
        in4w: 'Tra 4 settimane', in3m: 'Tra 3 mesi', in6m: 'Tra 6 mesi',
        created: 'Promemoria impostato', activeTitle: 'Promemoria attivo', activeDesc: 'Ti scriveremo il {date}.',
        cancel: 'Annulla promemoria', cancelled: 'Promemoria annullato',
      },
    },
    dashboard: {
      referral: {
        title: 'Invita gli amici', description: 'Condividi il tuo link. Tu e il tuo amico ricevete 1 referto gratuito extra al mese.',
        copy: 'Copia', copied: 'Copiato', stats: '{count} invitati, +{bonus} referti bonus',
        shareText: 'Medyra spiega i referti medici in linguaggio semplice. Con il mio link riceviamo entrambi un referto gratis in più:',
      },
    },
  },

  pt: {
    valueChecker: {
      badge: 'Verificação instantânea grátis', title: 'O seu valor de laboratório está', titleHighlight: 'normal?',
      subtitle: 'Escolha um valor, digite o número e veja de imediato como se compara com o intervalo de referência. Grátis, sem registo.',
      cardLabel: 'Verificação ao vivo', noSignup: 'Sem registo', fullToolLink: 'Abrir o verificador completo de valores',
      searchPlaceholder: 'Procurar valor, ex. TSH, Ferritin', valuePlaceholder: 'O seu valor, ex. 5,2',
      noResults: 'Nenhum valor encontrado', popular: 'Populares:',
      status: { low: 'Abaixo do intervalo normal', normal: 'Dentro do intervalo normal', elevated: 'Acima do intervalo normal', high: 'Muito acima do intervalo normal' },
      normalRange: 'Intervalo normal', causesElevated: 'Causas frequentes de valores altos', causesLow: 'Causas frequentes de valores baixos',
      learnMore: 'Mais sobre {value}', uploadCta: 'Explicar o meu relatório completo',
      enterValue: 'Introduza o seu valor de {value} em {unit} para ver o resultado.',
      disclaimer: 'Informação geral baseada em intervalos de referência padrão para adultos. O seu laboratório pode usar intervalos diferentes; vale o intervalo do seu relatório. Não é aconselhamento médico.',
    },
    languagesSection: {
      badge: '17 idiomas', title: 'O seu relatório alemão,', titleHighlight: 'no seu idioma',
      subtitle: 'A Medyra explica documentos médicos alemães em 17 idiomas, incluindo o chat de perguntas.',
      cta: 'Ver todos os idiomas',
    },
    upload: {
      docTypeLabel: 'O que está a carregar? (opcional, ajuda a IA)',
      docTypeAuto: 'Detetar automaticamente', docTypeLab: 'Relatório de laboratório', docTypeLetter: 'Carta médica',
      docTypeMedication: 'Plano de medicação', docTypeInsurance: 'Carta do seguro',
    },
    report: {
      share: {
        button: 'Partilhar', title: 'Partilhar esta explicação', description: 'Link só de leitura para família, cuidadores ou o seu médico.',
        point1: 'Mostra apenas a explicação, nunca o seu ficheiro ou chat', point2: 'Expira automaticamente após 7 dias', point3: 'Pode revogar o link a qualquer momento',
        create: 'Criar link de partilha', copy: 'Copiar', copied: 'Copiado', expires: 'Válido até {date}',
        privacyNote: 'Qualquer pessoa com este link pode ver a explicação. Partilhe apenas com pessoas de confiança.',
        revoke: 'Revogar link', revoked: 'Link revogado',
      },
      reminder: {
        title: 'Definir lembrete de controlo', description: 'Enviamos um e-mail quando for altura de repetir as análises, para comparar valores antigos e novos.',
        in4w: 'Em 4 semanas', in3m: 'Em 3 meses', in6m: 'Em 6 meses',
        created: 'Lembrete definido', activeTitle: 'Lembrete ativo', activeDesc: 'Escrevemos-lhe a {date}.',
        cancel: 'Cancelar lembrete', cancelled: 'Lembrete cancelado',
      },
    },
    dashboard: {
      referral: {
        title: 'Convide amigos', description: 'Partilhe o seu link. Você e o seu amigo recebem 1 relatório grátis extra por mês.',
        copy: 'Copiar', copied: 'Copiado', stats: '{count} convidados, +{bonus} relatórios bónus',
        shareText: 'A Medyra explica relatórios médicos em linguagem simples. Com o meu link, ambos recebemos um relatório grátis extra:',
      },
    },
  },

  nl: {
    valueChecker: {
      badge: 'Gratis directe check', title: 'Is uw labwaarde', titleHighlight: 'normaal?',
      subtitle: 'Kies een waarde, typ uw getal en zie direct hoe deze zich verhoudt tot het referentiebereik. Gratis, zonder registratie.',
      cardLabel: 'Live waardecheck', noSignup: 'Zonder registratie', fullToolLink: 'Open de volledige labwaarde-checker',
      searchPlaceholder: 'Zoek waarde, bijv. TSH, Ferritin', valuePlaceholder: 'Uw waarde, bijv. 5,2',
      noResults: 'Geen waarde gevonden', popular: 'Populair:',
      status: { low: 'Onder het normale bereik', normal: 'Binnen het normale bereik', elevated: 'Boven het normale bereik', high: 'Ver boven het normale bereik' },
      normalRange: 'Normaal bereik', causesElevated: 'Veelvoorkomende oorzaken van hoge waarden', causesLow: 'Veelvoorkomende oorzaken van lage waarden',
      learnMore: 'Meer over {value}', uploadCta: 'Mijn volledige uitslag uitleggen',
      enterValue: 'Voer uw {value}-waarde in {unit} in om het resultaat te zien.',
      disclaimer: 'Algemene informatie op basis van standaard referentiewaarden voor volwassenen. Uw lab kan andere waarden hanteren; het bereik op uw uitslag geldt. Geen medisch advies.',
    },
    languagesSection: {
      badge: '17 talen', title: 'Uw Duitse uitslag,', titleHighlight: 'in uw taal',
      subtitle: 'Medyra legt Duitse medische documenten uit in 17 talen, inclusief de vragenchat.',
      cta: 'Alle talen bekijken',
    },
    upload: {
      docTypeLabel: 'Wat uploadt u? (optioneel, helpt de AI)',
      docTypeAuto: 'Automatisch herkennen', docTypeLab: 'Labuitslag', docTypeLetter: 'Artsenbrief',
      docTypeMedication: 'Medicatieplan', docTypeInsurance: 'Verzekeringsbrief',
    },
    report: {
      share: {
        button: 'Delen', title: 'Deze uitleg delen', description: 'Alleen-lezen link voor familie, mantelzorgers of uw arts.',
        point1: 'Toont alleen de uitleg, nooit uw bestand of chat', point2: 'Verloopt automatisch na 7 dagen', point3: 'U kunt de link op elk moment intrekken',
        create: 'Deellink maken', copy: 'Kopiëren', copied: 'Gekopieerd', expires: 'Geldig tot {date}',
        privacyNote: 'Iedereen met deze link kan de uitleg bekijken. Deel hem alleen met mensen die u vertrouwt.',
        revoke: 'Link intrekken', revoked: 'Link ingetrokken',
      },
      reminder: {
        title: 'Controleherinnering instellen', description: 'We mailen u wanneer het tijd is om uw waarden opnieuw te laten controleren, zodat u oud en nieuw kunt vergelijken.',
        in4w: 'Over 4 weken', in3m: 'Over 3 maanden', in6m: 'Over 6 maanden',
        created: 'Herinnering ingesteld', activeTitle: 'Controleherinnering actief', activeDesc: 'We mailen u op {date}.',
        cancel: 'Herinnering annuleren', cancelled: 'Herinnering geannuleerd',
      },
    },
    dashboard: {
      referral: {
        title: 'Vrienden uitnodigen', description: 'Deel uw link. U en uw vriend krijgen elk 1 extra gratis rapport per maand.',
        copy: 'Kopiëren', copied: 'Gekopieerd', stats: '{count} uitgenodigd, +{bonus} bonusrapporten',
        shareText: 'Medyra legt medische uitslagen uit in gewone taal. Met mijn link krijgen we allebei een extra gratis rapport:',
      },
    },
  },

  zh: {
    valueChecker: {
      badge: '免费即时检查', title: '您的化验值', titleHighlight: '正常吗？',
      subtitle: '选择指标，输入数值，立即查看它与参考范围的对比。免费，无需注册。',
      cardLabel: '实时数值检查', noSignup: '无需注册', fullToolLink: '打开完整的化验值检查工具',
      searchPlaceholder: '搜索指标，如 TSH、Ferritin', valuePlaceholder: '您的数值，如 5.2',
      noResults: '未找到匹配的指标', popular: '热门：',
      status: { low: '低于正常范围', normal: '在正常范围内', elevated: '高于正常范围', high: '远高于正常范围' },
      normalRange: '正常范围', causesElevated: '数值偏高的常见原因', causesLow: '数值偏低的常见原因',
      learnMore: '了解更多关于 {value}', uploadCta: '解读我的完整报告',
      enterValue: '输入您的 {value} 数值（单位 {unit}）查看结果。',
      disclaimer: '基于成人标准参考范围的一般信息。您的实验室可能使用不同范围，以您报告上的范围为准。这不是医疗建议。',
    },
    languagesSection: {
      badge: '17 种语言', title: '您的德国报告，', titleHighlight: '用您的语言解读',
      subtitle: 'Medyra 用 17 种语言解读德国医疗文件，包括问答聊天。',
      cta: '查看所有语言',
    },
    upload: {
      docTypeLabel: '您上传的是什么？（可选，帮助 AI 更准确）',
      docTypeAuto: '自动识别', docTypeLab: '化验报告', docTypeLetter: '医生信函',
      docTypeMedication: '用药计划', docTypeInsurance: '保险信函',
    },
    report: {
      share: {
        button: '分享', title: '分享此解读', description: '供家人、照护者或医生查看的只读链接。',
        point1: '仅显示解读内容，绝不显示您的文件或聊天记录', point2: '7 天后自动失效', point3: '您可以随时撤销链接',
        create: '创建分享链接', copy: '复制', copied: '已复制', expires: '有效期至 {date}',
        privacyNote: '任何拥有此链接的人都能查看解读内容。请只分享给您信任的人。',
        revoke: '撤销链接', revoked: '链接已撤销',
      },
      reminder: {
        title: '设置复查提醒', description: '到了复查时间我们会发邮件提醒您，方便您对比新旧数值。',
        in4w: '4 周后', in3m: '3 个月后', in6m: '6 个月后',
        created: '提醒已设置', activeTitle: '复查提醒已开启', activeDesc: '我们将在 {date} 给您发邮件。',
        cancel: '取消提醒', cancelled: '提醒已取消',
      },
    },
    dashboard: {
      referral: {
        title: '邀请朋友', description: '分享您的链接。您和朋友每月各获得 1 份额外免费报告。',
        copy: '复制', copied: '已复制', stats: '已邀请 {count} 人，+{bonus} 份奖励报告',
        shareText: 'Medyra 用通俗语言解读医疗报告。通过我的链接，我们都能获得一份额外免费报告：',
      },
    },
  },

  ja: {
    valueChecker: {
      badge: '無料で今すぐチェック', title: 'あなたの検査値は', titleHighlight: '正常ですか？',
      subtitle: '項目を選んで数値を入力するだけで、基準範囲との比較がすぐに分かります。無料・登録不要。',
      cardLabel: 'ライブ数値チェック', noSignup: '登録不要', fullToolLink: '検査値チェッカーの完全版を開く',
      searchPlaceholder: '項目を検索（例: TSH、Ferritin）', valuePlaceholder: 'あなたの数値（例: 5.2）',
      noResults: '該当する項目が見つかりません', popular: '人気:',
      status: { low: '基準範囲より低い', normal: '基準範囲内', elevated: '基準範囲より高い', high: '基準範囲を大きく超えている' },
      normalRange: '基準範囲', causesElevated: '高値のよくある原因', causesLow: '低値のよくある原因',
      learnMore: '{value} について詳しく', uploadCta: '検査結果全体を解説してもらう',
      enterValue: '{value} の数値を {unit} で入力すると結果が表示されます。',
      disclaimer: '成人の標準基準範囲に基づく一般情報です。検査機関により範囲が異なる場合があり、お手元の結果票の範囲が優先されます。医療アドバイスではありません。',
    },
    languagesSection: {
      badge: '17言語', title: 'ドイツの検査結果を、', titleHighlight: 'あなたの言語で',
      subtitle: 'Medyraはドイツの医療文書を質問チャットも含めて17言語で解説します。',
      cta: 'すべての言語を見る',
    },
    upload: {
      docTypeLabel: '何をアップロードしますか？（任意・AIの精度が上がります）',
      docTypeAuto: '自動判別', docTypeLab: '検査報告書', docTypeLetter: '医師の手紙',
      docTypeMedication: '服薬計画', docTypeInsurance: '保険の書類',
    },
    report: {
      share: {
        button: '共有', title: 'この解説を共有', description: '家族・介護者・主治医向けの閲覧専用リンクです。',
        point1: '解説のみを表示し、ファイルやチャットは表示されません', point2: '7日後に自動的に無効になります', point3: 'リンクはいつでも取り消せます',
        create: '共有リンクを作成', copy: 'コピー', copied: 'コピーしました', expires: '{date} まで有効',
        privacyNote: 'このリンクを知っている人は誰でも解説を閲覧できます。信頼できる人にのみ共有してください。',
        revoke: 'リンクを取り消す', revoked: 'リンクを取り消しました',
      },
      reminder: {
        title: '再検査リマインダーを設定', description: '再検査の時期になったらメールでお知らせします。新旧の数値を比較できます。',
        in4w: '4週間後', in3m: '3か月後', in6m: '6か月後',
        created: 'リマインダーを設定しました', activeTitle: '再検査リマインダー設定中', activeDesc: '{date} にメールでお知らせします。',
        cancel: 'リマインダーを解除', cancelled: 'リマインダーを解除しました',
      },
    },
    dashboard: {
      referral: {
        title: '友達を招待', description: 'リンクを共有すると、あなたと友達それぞれに毎月1件の無料解析が追加されます。',
        copy: 'コピー', copied: 'コピーしました', stats: '{count} 人を招待、+{bonus} 件のボーナス',
        shareText: 'Medyraは医療文書を分かりやすい言葉で解説します。私のリンクから登録すると、2人とも無料解析が1件増えます：',
      },
    },
  },

  ko: {
    valueChecker: {
      badge: '무료 즉시 확인', title: '내 검사 수치는', titleHighlight: '정상일까요?',
      subtitle: '항목을 선택하고 숫자를 입력하면 참고 범위와의 비교 결과를 바로 확인할 수 있습니다. 무료, 가입 불필요.',
      cardLabel: '실시간 수치 확인', noSignup: '가입 불필요', fullToolLink: '전체 검사 수치 확인 도구 열기',
      searchPlaceholder: '항목 검색 (예: TSH, Ferritin)', valuePlaceholder: '내 수치 (예: 5.2)',
      noResults: '일치하는 항목이 없습니다', popular: '인기:',
      status: { low: '정상 범위보다 낮음', normal: '정상 범위 내', elevated: '정상 범위보다 높음', high: '정상 범위를 크게 초과' },
      normalRange: '정상 범위', causesElevated: '수치가 높은 흔한 원인', causesLow: '수치가 낮은 흔한 원인',
      learnMore: '{value} 더 알아보기', uploadCta: '전체 검사 결과 해석 받기',
      enterValue: '{value} 수치를 {unit} 단위로 입력하면 결과가 표시됩니다.',
      disclaimer: '성인 표준 참고 범위에 기반한 일반 정보입니다. 검사 기관마다 범위가 다를 수 있으며, 결과지에 표시된 범위가 우선합니다. 의료 조언이 아닙니다.',
    },
    languagesSection: {
      badge: '17개 언어', title: '독일 검사 결과를,', titleHighlight: '내 언어로',
      subtitle: 'Medyra는 질문 채팅을 포함해 독일 의료 문서를 17개 언어로 설명합니다.',
      cta: '모든 언어 보기',
    },
    upload: {
      docTypeLabel: '무엇을 업로드하시나요? (선택, AI 정확도 향상)',
      docTypeAuto: '자동 인식', docTypeLab: '검사 결과지', docTypeLetter: '의사 소견서',
      docTypeMedication: '복약 계획', docTypeInsurance: '보험 서류',
    },
    report: {
      share: {
        button: '공유', title: '이 설명 공유하기', description: '가족, 보호자 또는 담당 의사를 위한 읽기 전용 링크입니다.',
        point1: '설명만 표시되며 파일이나 채팅은 절대 표시되지 않습니다', point2: '7일 후 자동으로 만료됩니다', point3: '언제든지 링크를 취소할 수 있습니다',
        create: '공유 링크 만들기', copy: '복사', copied: '복사됨', expires: '{date}까지 유효',
        privacyNote: '이 링크가 있는 누구나 설명을 볼 수 있습니다. 신뢰하는 사람에게만 공유하세요.',
        revoke: '링크 취소', revoked: '링크가 취소되었습니다',
      },
      reminder: {
        title: '재검사 알림 설정', description: '재검사 시기가 되면 이메일로 알려드립니다. 이전 수치와 새 수치를 비교해 보세요.',
        in4w: '4주 후', in3m: '3개월 후', in6m: '6개월 후',
        created: '알림이 설정되었습니다', activeTitle: '재검사 알림 활성화됨', activeDesc: '{date}에 이메일을 보내드립니다.',
        cancel: '알림 취소', cancelled: '알림이 취소되었습니다',
      },
    },
    dashboard: {
      referral: {
        title: '친구 초대', description: '링크를 공유하세요. 나와 친구 모두 매달 무료 분석 1회를 추가로 받습니다.',
        copy: '복사', copied: '복사됨', stats: '{count}명 초대, +{bonus} 보너스 분석',
        shareText: 'Medyra는 의료 문서를 쉬운 말로 설명해 줍니다. 제 링크로 가입하면 둘 다 무료 분석을 하나 더 받아요:',
      },
    },
  },

  hi: {
    valueChecker: {
      badge: 'मुफ़्त तुरंत जांच', title: 'क्या आपका लैब वैल्यू', titleHighlight: 'सामान्य है?',
      subtitle: 'वैल्यू चुनें, अपना नंबर लिखें और तुरंत देखें कि यह संदर्भ सीमा की तुलना में कहां है। मुफ़्त, बिना साइन-अप।',
      cardLabel: 'लाइव वैल्यू जांच', noSignup: 'साइन-अप ज़रूरी नहीं', fullToolLink: 'पूरा लैब वैल्यू चेकर खोलें',
      searchPlaceholder: 'वैल्यू खोजें, जैसे TSH, Ferritin', valuePlaceholder: 'आपका मान, जैसे 5.2',
      noResults: 'कोई मिलती-जुलती वैल्यू नहीं मिली', popular: 'लोकप्रिय:',
      status: { low: 'सामान्य सीमा से कम', normal: 'सामान्य सीमा में', elevated: 'सामान्य सीमा से अधिक', high: 'सामान्य सीमा से बहुत अधिक' },
      normalRange: 'सामान्य सीमा', causesElevated: 'उच्च मान के सामान्य कारण', causesLow: 'कम मान के सामान्य कारण',
      learnMore: '{value} के बारे में और जानें', uploadCta: 'मेरी पूरी रिपोर्ट समझाएं',
      enterValue: 'परिणाम देखने के लिए अपना {value} मान {unit} में दर्ज करें।',
      disclaimer: 'वयस्कों के मानक संदर्भ सीमाओं पर आधारित सामान्य जानकारी। आपकी लैब अलग सीमाएं उपयोग कर सकती है; आपकी रिपोर्ट की सीमा ही मान्य है। यह चिकित्सा सलाह नहीं है।',
    },
    languagesSection: {
      badge: '17 भाषाएं', title: 'आपकी जर्मन रिपोर्ट,', titleHighlight: 'आपकी भाषा में',
      subtitle: 'Medyra जर्मन मेडिकल दस्तावेज़ों को सवाल-जवाब चैट सहित 17 भाषाओं में समझाता है।',
      cta: 'सभी भाषाएं देखें',
    },
    upload: {
      docTypeLabel: 'आप क्या अपलोड कर रहे हैं? (वैकल्पिक, AI की मदद करता है)',
      docTypeAuto: 'अपने आप पहचानें', docTypeLab: 'लैब रिपोर्ट', docTypeLetter: 'डॉक्टर का पत्र',
      docTypeMedication: 'दवा योजना', docTypeInsurance: 'बीमा पत्र',
    },
    report: {
      share: {
        button: 'साझा करें', title: 'यह व्याख्या साझा करें', description: 'परिवार, देखभाल करने वालों या आपके डॉक्टर के लिए केवल-पढ़ने वाला लिंक।',
        point1: 'केवल व्याख्या दिखाता है, आपकी फ़ाइल या चैट कभी नहीं', point2: '7 दिनों बाद अपने आप समाप्त हो जाता है', point3: 'आप लिंक कभी भी रद्द कर सकते हैं',
        create: 'शेयर लिंक बनाएं', copy: 'कॉपी', copied: 'कॉपी हो गया', expires: '{date} तक मान्य',
        privacyNote: 'इस लिंक वाला कोई भी व्यक्ति व्याख्या देख सकता है। केवल भरोसेमंद लोगों के साथ साझा करें।',
        revoke: 'लिंक रद्द करें', revoked: 'लिंक रद्द कर दिया गया',
      },
      reminder: {
        title: 'दोबारा जांच का रिमाइंडर सेट करें', description: 'जब दोबारा जांच का समय होगा, हम आपको ईमेल भेजेंगे, ताकि आप पुराने और नए मान की तुलना कर सकें।',
        in4w: '4 हफ़्ते में', in3m: '3 महीने में', in6m: '6 महीने में',
        created: 'रिमाइंडर सेट हो गया', activeTitle: 'दोबारा जांच रिमाइंडर सक्रिय', activeDesc: 'हम आपको {date} को ईमेल करेंगे।',
        cancel: 'रिमाइंडर रद्द करें', cancelled: 'रिमाइंडर रद्द कर दिया गया',
      },
    },
    dashboard: {
      referral: {
        title: 'दोस्तों को आमंत्रित करें', description: 'अपना लिंक साझा करें। आपको और आपके दोस्त को हर महीने 1 अतिरिक्त मुफ़्त रिपोर्ट मिलेगी।',
        copy: 'कॉपी', copied: 'कॉपी हो गया', stats: '{count} आमंत्रित, +{bonus} बोनस रिपोर्ट',
        shareText: 'Medyra मेडिकल रिपोर्ट को आसान भाषा में समझाता है। मेरे लिंक से हम दोनों को एक अतिरिक्त मुफ़्त रिपोर्ट मिलेगी:',
      },
    },
  },

  ur: {
    valueChecker: {
      badge: 'مفت فوری جانچ', title: 'کیا آپ کی لیب ویلیو', titleHighlight: 'نارمل ہے؟',
      subtitle: 'ویلیو منتخب کریں، اپنا نمبر لکھیں اور فوراً دیکھیں کہ یہ حوالہ حد کے مقابلے میں کہاں ہے۔ مفت، بغیر رجسٹریشن۔',
      cardLabel: 'لائیو ویلیو چیک', noSignup: 'رجسٹریشن ضروری نہیں', fullToolLink: 'مکمل لیب ویلیو چیکر کھولیں',
      searchPlaceholder: 'ویلیو تلاش کریں، جیسے TSH، Ferritin', valuePlaceholder: 'آپ کی ویلیو، جیسے 5.2',
      noResults: 'کوئی مماثل ویلیو نہیں ملی', popular: 'مقبول:',
      status: { low: 'نارمل حد سے کم', normal: 'نارمل حد میں', elevated: 'نارمل حد سے زیادہ', high: 'نارمل حد سے بہت زیادہ' },
      normalRange: 'نارمل حد', causesElevated: 'زیادہ ویلیو کی عام وجوہات', causesLow: 'کم ویلیو کی عام وجوہات',
      learnMore: '{value} کے بارے میں مزید', uploadCta: 'میری مکمل رپورٹ سمجھائیں',
      enterValue: 'نتیجہ دیکھنے کے لیے اپنی {value} ویلیو {unit} میں درج کریں۔',
      disclaimer: 'بالغوں کی معیاری حوالہ حدود پر مبنی عمومی معلومات۔ آپ کی لیب مختلف حدود استعمال کر سکتی ہے؛ آپ کی رپورٹ کی حد ہی معتبر ہے۔ یہ طبی مشورہ نہیں ہے۔',
    },
    languagesSection: {
      badge: '17 زبانیں', title: 'آپ کی جرمن رپورٹ،', titleHighlight: 'آپ کی زبان میں',
      subtitle: 'Medyra جرمن طبی دستاویزات کو سوال جواب چیٹ سمیت 17 زبانوں میں سمجھاتا ہے۔',
      cta: 'تمام زبانیں دیکھیں',
    },
    upload: {
      docTypeLabel: 'آپ کیا اپ لوڈ کر رہے ہیں؟ (اختیاری، AI کی مدد کرتا ہے)',
      docTypeAuto: 'خودکار شناخت', docTypeLab: 'لیب رپورٹ', docTypeLetter: 'ڈاکٹر کا خط',
      docTypeMedication: 'ادویات کا منصوبہ', docTypeInsurance: 'انشورنس کا خط',
    },
    report: {
      share: {
        button: 'شیئر کریں', title: 'یہ وضاحت شیئر کریں', description: 'خاندان، نگہداشت کرنے والوں یا آپ کے ڈاکٹر کے لیے صرف پڑھنے کا لنک۔',
        point1: 'صرف وضاحت دکھاتا ہے، کبھی آپ کی فائل یا چیٹ نہیں', point2: '7 دن بعد خودکار طور پر ختم ہو جاتا ہے', point3: 'آپ لنک کبھی بھی منسوخ کر سکتے ہیں',
        create: 'شیئر لنک بنائیں', copy: 'کاپی', copied: 'کاپی ہو گیا', expires: '{date} تک کارآمد',
        privacyNote: 'اس لنک والا کوئی بھی شخص وضاحت دیکھ سکتا ہے۔ صرف قابل اعتماد لوگوں کے ساتھ شیئر کریں۔',
        revoke: 'لنک منسوخ کریں', revoked: 'لنک منسوخ ہو گیا',
      },
      reminder: {
        title: 'دوبارہ ٹیسٹ کی یاددہانی لگائیں', description: 'جب دوبارہ ٹیسٹ کا وقت ہوگا تو ہم آپ کو ای میل کریں گے، تاکہ آپ پرانی اور نئی ویلیوز کا موازنہ کر سکیں۔',
        in4w: '4 ہفتوں میں', in3m: '3 مہینوں میں', in6m: '6 مہینوں میں',
        created: 'یاددہانی لگ گئی', activeTitle: 'دوبارہ ٹیسٹ کی یاددہانی فعال', activeDesc: 'ہم آپ کو {date} کو ای میل کریں گے۔',
        cancel: 'یاددہانی منسوخ کریں', cancelled: 'یاددہانی منسوخ ہو گئی',
      },
    },
    dashboard: {
      referral: {
        title: 'دوستوں کو مدعو کریں', description: 'اپنا لنک شیئر کریں۔ آپ اور آپ کے دوست دونوں کو ہر ماہ 1 اضافی مفت رپورٹ ملے گی۔',
        copy: 'کاپی', copied: 'کاپی ہو گیا', stats: '{count} مدعو، +{bonus} بونس رپورٹس',
        shareText: 'Medyra طبی رپورٹس کو آسان زبان میں سمجھاتا ہے۔ میرے لنک سے ہم دونوں کو ایک اضافی مفت رپورٹ ملے گی:',
      },
    },
  },

  bn: {
    valueChecker: {
      badge: 'বিনামূল্যে তাৎক্ষণিক পরীক্ষা', title: 'আপনার ল্যাব মান কি', titleHighlight: 'স্বাভাবিক?',
      subtitle: 'একটি মান বেছে নিন, আপনার সংখ্যা লিখুন এবং রেফারেন্স সীমার তুলনায় এটি কোথায় তা সঙ্গে সঙ্গে দেখুন। বিনামূল্যে, নিবন্ধন ছাড়াই।',
      cardLabel: 'লাইভ মান পরীক্ষা', noSignup: 'নিবন্ধন লাগবে না', fullToolLink: 'সম্পূর্ণ ল্যাব মান পরীক্ষক খুলুন',
      searchPlaceholder: 'মান খুঁজুন, যেমন TSH, Ferritin', valuePlaceholder: 'আপনার মান, যেমন 5.2',
      noResults: 'কোনো মিল পাওয়া যায়নি', popular: 'জনপ্রিয়:',
      status: { low: 'স্বাভাবিক সীমার নিচে', normal: 'স্বাভাবিক সীমার মধ্যে', elevated: 'স্বাভাবিক সীমার উপরে', high: 'স্বাভাবিক সীমার অনেক উপরে' },
      normalRange: 'স্বাভাবিক সীমা', causesElevated: 'উচ্চ মানের সাধারণ কারণ', causesLow: 'নিম্ন মানের সাধারণ কারণ',
      learnMore: '{value} সম্পর্কে আরও জানুন', uploadCta: 'আমার সম্পূর্ণ রিপোর্ট ব্যাখ্যা করুন',
      enterValue: 'ফলাফল দেখতে আপনার {value} মান {unit} এ লিখুন।',
      disclaimer: 'প্রাপ্তবয়স্কদের মানক রেফারেন্স সীমার ভিত্তিতে সাধারণ তথ্য। আপনার ল্যাব ভিন্ন সীমা ব্যবহার করতে পারে; আপনার রিপোর্টের সীমাই প্রযোজ্য। এটি চিকিৎসা পরামর্শ নয়।',
    },
    languagesSection: {
      badge: '১৭টি ভাষা', title: 'আপনার জার্মান রিপোর্ট,', titleHighlight: 'আপনার ভাষায়',
      subtitle: 'Medyra প্রশ্নোত্তর চ্যাটসহ জার্মান মেডিকেল নথি ১৭টি ভাষায় ব্যাখ্যা করে।',
      cta: 'সব ভাষা দেখুন',
    },
    upload: {
      docTypeLabel: 'আপনি কী আপলোড করছেন? (ঐচ্ছিক, AI-কে সাহায্য করে)',
      docTypeAuto: 'স্বয়ংক্রিয়ভাবে শনাক্ত করুন', docTypeLab: 'ল্যাব রিপোর্ট', docTypeLetter: 'ডাক্তারের চিঠি',
      docTypeMedication: 'ওষুধের পরিকল্পনা', docTypeInsurance: 'বীমার চিঠি',
    },
    report: {
      share: {
        button: 'শেয়ার করুন', title: 'এই ব্যাখ্যা শেয়ার করুন', description: 'পরিবার, সেবাদানকারী বা আপনার ডাক্তারের জন্য শুধু-পড়ার লিঙ্ক।',
        point1: 'শুধু ব্যাখ্যা দেখায়, কখনো আপনার ফাইল বা চ্যাট নয়', point2: '৭ দিন পরে স্বয়ংক্রিয়ভাবে মেয়াদ শেষ হয়', point3: 'আপনি যেকোনো সময় লিঙ্ক বাতিল করতে পারেন',
        create: 'শেয়ার লিঙ্ক তৈরি করুন', copy: 'কপি', copied: 'কপি হয়েছে', expires: '{date} পর্যন্ত বৈধ',
        privacyNote: 'এই লিঙ্ক যার কাছে আছে সে-ই ব্যাখ্যা দেখতে পারবে। শুধু বিশ্বস্ত মানুষের সাথে শেয়ার করুন।',
        revoke: 'লিঙ্ক বাতিল করুন', revoked: 'লিঙ্ক বাতিল হয়েছে',
      },
      reminder: {
        title: 'পুনঃপরীক্ষার রিমাইন্ডার সেট করুন', description: 'পুনরায় পরীক্ষার সময় হলে আমরা আপনাকে ইমেল করব, যাতে আপনি পুরনো ও নতুন মান তুলনা করতে পারেন।',
        in4w: '৪ সপ্তাহ পরে', in3m: '৩ মাস পরে', in6m: '৬ মাস পরে',
        created: 'রিমাইন্ডার সেট হয়েছে', activeTitle: 'পুনঃপরীক্ষার রিমাইন্ডার চালু', activeDesc: 'আমরা {date} তারিখে আপনাকে ইমেল করব।',
        cancel: 'রিমাইন্ডার বাতিল করুন', cancelled: 'রিমাইন্ডার বাতিল হয়েছে',
      },
    },
    dashboard: {
      referral: {
        title: 'বন্ধুদের আমন্ত্রণ জানান', description: 'আপনার লিঙ্ক শেয়ার করুন। আপনি ও আপনার বন্ধু প্রতি মাসে ১টি করে অতিরিক্ত বিনামূল্যের রিপোর্ট পাবেন।',
        copy: 'কপি', copied: 'কপি হয়েছে', stats: '{count} জন আমন্ত্রিত, +{bonus} বোনাস রিপোর্ট',
        shareText: 'Medyra মেডিকেল রিপোর্ট সহজ ভাষায় ব্যাখ্যা করে। আমার লিঙ্কে আমরা দুজনেই একটি অতিরিক্ত বিনামূল্যের রিপোর্ট পাব:',
      },
    },
  },
}

// Deep-merge: only add keys that do not exist yet (never overwrite live copy)
function mergeMissing(target, additions) {
  for (const [k, v] of Object.entries(additions)) {
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      if (!target[k] || typeof target[k] !== 'object') target[k] = {}
      mergeMissing(target[k], v)
    } else if (!(k in target)) {
      target[k] = v
    }
  }
}

const locales = fs.readdirSync(MESSAGES_DIR).filter(f => f.endsWith('.json')).map(f => f.replace('.json', ''))

for (const locale of locales) {
  const file = path.join(MESSAGES_DIR, `${locale}.json`)
  const data = JSON.parse(fs.readFileSync(file, 'utf8'))
  const additions = A[locale] || A.en // untranslated locales fall back to English
  mergeMissing(data, additions)
  fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n', 'utf8')
  console.log(`✔ ${locale}${A[locale] ? '' : ' (English fallback)'}`)
}
console.log('Done.')

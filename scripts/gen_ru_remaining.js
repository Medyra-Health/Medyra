const fs = require('fs')
const path = require('path')

const base = path.join(__dirname, '../data/lexikon/translations/ru')

const files = {
  'ft3': {
    shortAnswer: 'FT3 (svobodny triiyodtironin) — aktivny gormon shchitovidnoy zhelezy. Norma: 3.5-6.5 pmol/l. Povyshenie ukazyvaet na gipertireoz, snizhenie — na gipotireoz.',
    metaDescription: 'FT3 povyshen ili ponizhen? Norma triiyodtironina i zabolevaniya shchitovidnoy zhelezy — obyasnenie.',
    causesElevated: ['Bolezn Greyvsa', 'Toksicheskiy uzlovoy zob', 'Tireoidit'],
    causesLow: ['Gipotireoz', 'Tyazhelye zabolevaniya', 'Defitsit yoda'],
    doctorQuestions: ['Nuzhna li terapiya shchitovidnoy zhelezy?', 'Trebuetsya li UZI?', 'Kogda povtorit analiz?'],
    rangeLabels: { low: 'Nizkiy', normal: 'Norma', elevated: 'Umerenno povyshen', high: 'Znachitelno povyshen' },
    categoryLabel: 'Shchitovidnaya zheleza',
    pageTitle: 'FT3 — Svobodny triiyodtironin: norma | Medyra'
  },
  'ft4': {
    shortAnswer: 'FT4 (svobodny tiroksin) — osnovnoy gormon shchitovidnoy zhelezy. Norma: 12-22 pmol/l. V sochetanii s TTG pozvolyaet otsenit funktsiy shchitovidnoy zhelezy.',
    metaDescription: 'FT4 povyshen ili ponizhen? Norma tiroksina i funktsiya shchitovidnoy zhelezy — obyasnenie.',
    causesElevated: ['Gipertireoz', 'Bolezn Greyvsa', 'Adenoma shchitovidnoy zhelezy'],
    causesLow: ['Gipotireoz', 'Tireoidit Khashimoto', 'Posle terapii'],
    doctorQuestions: ['Nuzhno li lechenie shchitovidnoy zhelezy?', 'Kak chasto proveryat gormony?'],
    rangeLabels: { low: 'Nizkiy', normal: 'Norma', elevated: 'Umerenno povyshen', high: 'Znachitelno povyshen' },
    categoryLabel: 'Shchitovidnaya zheleza',
    pageTitle: 'FT4 — Svobodny tiroksin: norma i znachenie | Medyra'
  },
  'inr': {
    shortAnswer: 'MNO (mezhdunarodnoe normalizovannoe otnoshenie) otsenivaet svertyvaemost krovi. Norma: 0.8-1.2. Pri prieme antikoagulyantov tselevoe znachenie vyshe.',
    metaDescription: 'MNO povysheno ili ponizheno? Norma svertyvayemosti krovi i antikoagulyantov — obyasnenie.',
    causesElevated: ['Antikogulyvantnaya terapiya (varfarin)', 'Defitsit vitamina K', 'Zabolevaniya pecheni', 'DVS-sindrom'],
    causesLow: ['Tromboz', 'Nekotorye lekarstva'],
    doctorQuestions: ['Pravilnaya li doza antikoagulyanta?', 'Est li risk krovotecheniya?', 'Kogda sleduyushchiy kontrol?'],
    rangeLabels: { low: 'Nizkiy', normal: 'Norma', elevated: 'Umerenno povyshen', high: 'Risk krovotecheniya' },
    categoryLabel: 'Koagulyatsiya',
    pageTitle: 'MNO (INR) — Svertyvayemost krovi: norma | Medyra'
  },
  'kalium': {
    shortAnswer: 'Kaliy vazhen dlya raboty serdtsa, myshts i nervov. Norma: 3.5-5.1 mmol/l. Kak snizhenie, tak i povyshenie mogut vyzyvat narusheniya serdechnogo ritma.',
    metaDescription: 'Kaliy povyshen ili ponizhen? Norma i prichiny otkloneniy — obyasnenie prostym yazykom.',
    causesElevated: ['Pochechnaya nedostatochnost', 'Atsidoz', 'Nekotorye lekarstva', 'Povrezhdenie kletok'],
    causesLow: ['Diuretiki', 'Rvota', 'Diaреya', 'Pervichny giperaldosteronizm'],
    doctorQuestions: ['Nuzhno li skorrektirovat kaliy?', 'Vliyaet li na ritm serdtsa?', 'Nuzhno li izmenit lekarstva?'],
    rangeLabels: { low: 'Gipokaliemiya', normal: 'Norma', elevated: 'Umerenno povyshen', high: 'Giperkaliemiya' },
    categoryLabel: 'Elektrolity',
    pageTitle: 'Kaliy: norma i narusheniya ritma serdtsa | Medyra'
  },
  'leukozyten-urin': {
    shortAnswer: 'Leykotsity v moche v norme edinichy (do 5/pole zreniya). Povyshennoe kolichestvo (leykotsituriya) chashche vsego ukazyvaet na infektsiyu mochevyvodyashchikh putey.',
    metaDescription: 'Leykotsity v moche povysheny? Norma i prichiny — infektsiya mochevykh putey — obyasnenie.',
    causesElevated: ['Infektsiya mochevyvodyashchikh putey', 'Uretrit', 'Interstitsialny nefrit', 'Kamni v pochkakh'],
    causesLow: [],
    doctorQuestions: ['Nuzhen li posev mochi?', 'Trebuyutsya li antibiotiki?', 'Est li vospalenie pochek?'],
    rangeLabels: { low: 'Norma', normal: 'Norma', elevated: 'Umerenno povyshen', high: 'Znachitelno povyshen' },
    categoryLabel: 'Pokazateli mochi',
    pageTitle: 'Leykotsity v moche: norma i infektsii | Medyra'
  },
  'magnesium': {
    shortAnswer: 'Magniy vazhen dlya myshts, nervov i energeticheskogo obmena. Norma: 0.7-1.1 mmol/l. Defitsit magniya mozhet vyzyvat myshechnye sudorogi i ustalost.',
    metaDescription: 'Magniy ponizhen ili povyshen? Norma magniya i prichiny defitsita — obyasnenie.',
    causesElevated: ['Pochechnaya nedostatochnost', 'Peredozirovka dobavok'],
    causesLow: ['Nepravilnoe pitanie', 'Diaреya', 'Alkogolizm', 'Diuretiki', 'Diabet'],
    doctorQuestions: ['Nuzhny li dobavki magniya?', 'Svyazana li ustalost s defitsitom magniya?', 'Kak izmenit pitanie?'],
    rangeLabels: { low: 'Defitsit', normal: 'Norma', elevated: 'Umerenno povyshen', high: 'Znachitelno povyshen' },
    categoryLabel: 'Elektrolity',
    pageTitle: 'Magniy: norma, defitsit i sudorogi | Medyra'
  },
  'natrium': {
    shortAnswer: 'Natriy reguliruet vodny balans i davlenie krovi. Norma: 136-145 mmol/l. Nizkiy natriy vyzyvaet ustalost i sputannost soznaniya, vysokiy — zhazhddu i nevrologicheskie simptomy.',
    metaDescription: 'Natriy povyshen ili ponizhen? Norma i prichiny narusheniya vodnogo balansa — obyasnenie.',
    causesElevated: ['Degidratatsiya', 'Nesakharniy diabet', 'Izbytok soli v diete'],
    causesLow: ['Obilnoe pite', 'Diuretiki', 'Rvota', 'Nadpochechnikovaya nedostatochnost'],
    doctorQuestions: ['Nuzhno li izmenit pitevoy rezhim?', 'Est li narusheniya gormonov?', 'Nuzhna li korrektsiya terapii?'],
    rangeLabels: { low: 'Gipоnatriyemiya', normal: 'Norma', elevated: 'Umerenno povyshen', high: 'Gipernatriyemiya' },
    categoryLabel: 'Elektrolity',
    pageTitle: 'Natriy: norma i vodny balans | Medyra'
  },
  'protein-urin': {
    shortAnswer: 'Belok v moche (proteinuriya) v norme otsutstvuyet ili minimalen (do 150 mg/sut). Povyshennoe soderzhanie ukazyvaet na povrezhdenie pochechnogo filtra.',
    metaDescription: 'Belok v moche povyshen? Norma proteinurii i zabolevaniya pochek — obyasnenie prostym yazykom.',
    causesElevated: ['Diabeticheskaya nefropatiya', 'Gipertonicheskaya nefropatiya', 'Glomerulonefrit', 'Infektsiya'],
    causesLow: [],
    doctorQuestions: ['Est li povrezhdenie pochechnogo filtra?', 'Nuzhen li nefrolog?', 'Kak zashchitit pochki?'],
    rangeLabels: { low: 'Norma', normal: 'Norma', elevated: 'Mikroalbumin', high: 'Proteinuriya' },
    categoryLabel: 'Pokazateli mochi',
    pageTitle: 'Belok v moche: norma i bolezni pochek | Medyra'
  },
  'ptt': {
    shortAnswer: 'AChTV (aktivirovannoe chastichnoe tromboplastinovoe vremya) otsenivaet vnutrenniy put svertyvаniya. Norma: 25-38 sekund. Ispolzuetsya dlya monitoringa geparinovoy terapii.',
    metaDescription: 'AChTV povysheno? Norma i znachenie pri narusheniyakh svertyvаniya — obyasnenie.',
    causesElevated: ['Geparinovaya terapiya', 'Defitsit faktorov svertyvаniya', 'Bolezn fon Villebranda', 'Antifosfolipidny sindrom'],
    causesLow: ['Tromboz', 'Vospalenie'],
    doctorQuestions: ['Pravilnaya li doza geparina?', 'Est li narushenie svertyvаniya?', 'Kogda sleduyushchiy kontrol?'],
    rangeLabels: { low: 'Nizkiy', normal: 'Norma', elevated: 'Umerenno povyshen', high: 'Risk krovotecheniya' },
    categoryLabel: 'Koagulyatsiya',
    pageTitle: 'AChTV (PTT) — Svertyvayemost krovi: norma | Medyra'
  },
  'quick': {
    shortAnswer: 'Protrombinоvoe vremya (Quick) otsenivaet vneshniy put svertyvаniya krovi. Norma: 70-130%. Snizhenie nablyudaetsya pri prieme antikoagulyantov ili zabolevaniyakh pecheni.',
    metaDescription: 'Protrombinоvoe vremya snizheno? Norma i prichiny narusheniya svertyvаniya — obyasnenie.',
    causesElevated: [],
    causesLow: ['Varfarin/antikoagulyatny', 'Zabolevaniya pecheni', 'Defitsit vitamina K', 'DVS-sindrom'],
    doctorQuestions: ['Pravilnaya li doza antikoagulyanta?', 'Est li zabolevanie pecheni?', 'Est li risk krovotecheniya?'],
    rangeLabels: { low: 'Risk krovotecheniya', normal: 'Norma', elevated: 'Povyshen', high: 'Vysokiy' },
    categoryLabel: 'Koagulyatsiya',
    pageTitle: 'Protrombinоvoe vremya (Quick): norma | Medyra'
  },
  'transferrin': {
    shortAnswer: 'Transferrin — belok-perenoschik zheleza v krovi. Norma: 2.0-3.6 g/l. Povyshennye znacheniya ukazyvayut na defitsit zheleza, ponizhennnye — na khronicheskoe vospalenie.',
    metaDescription: 'Transferrin povyshen ili ponizhen? Norma i rol v obmene zheleza — obyasnenie.',
    causesElevated: ['Defitsit zheleza', 'Beremennost'],
    causesLow: ['Khronicheskoe vospalenie', 'Peregruzka zhelezo', 'Narusheniya pitaniya', 'Zabolevaniya pecheni'],
    doctorQuestions: ['Est li defitsit zheleza?', 'Kak interpretirovat vmeste s ferritinom?', 'Nuzhny li dobavki?'],
    rangeLabels: { low: 'Nizkiy', normal: 'Norma', elevated: 'Umerenno povyshen', high: 'Defitsit zheleza' },
    categoryLabel: 'Pokazateli zheleza',
    pageTitle: 'Transferrin: norma i obmen zheleza | Medyra'
  },
  'tsh': {
    shortAnswer: 'TTG (tireotropny gormon) reguliruet funktsiyu shchitovidnoy zhelezy. Norma: 0.4-4.0 mME/l. Povyshenie ukazyvaet na gipotireoz, snizhenie — na gipertireoz.',
    metaDescription: 'TTG povyshen ili ponizhen? Norma tireotropnogo gormona i bolezni shchitovidnoy zhelezy — obyasnenie.',
    causesElevated: ['Gipotireoz', 'Tireoidit Khashimoto', 'Defitsit yoda'],
    causesLow: ['Gipertireoz', 'Bolezn Greyvsa', 'Toksicheskiy zob', 'Peredozirovka gormonov shchitovidnoy zhelezy'],
    doctorQuestions: ['Nuzhno li lechenie shchitovidnoy zhelezy?', 'Trebuetsya li UZI?', 'Kak chasto proveryat TTG?'],
    rangeLabels: { low: 'Gipertireoz', normal: 'Norma', elevated: 'Subklinicheskiy gipotireoz', high: 'Gipotireoz' },
    categoryLabel: 'Shchitovidnaya zheleza',
    pageTitle: 'TTG (TSH) — Tireotropny gormon: norma | Medyra'
  },
  'vitamin-b12': {
    shortAnswer: 'Vitamin B12 neobkhodim dlya nervnoy sistemy i obrazovaniya kletok krovi. Norma: 148-738 pmol/l. Defitsit rasprostranen u vegetariantsev i veganov.',
    metaDescription: 'Vitamin B12 ponizhen? Norma i prichiny defitsita — obyasnenie prostym yazykom.',
    causesElevated: ['Bolezni pecheni', 'Nekotorye vidy raka'],
    causesLow: ['Veganstvo/vegetarianstvo', 'Malabsorptsiya', 'Atroficheskiy gastrit', 'Metformin'],
    doctorQuestions: ['Est li defitsit B12?', 'Nuzhny li inekcii ili dobavki?', 'Est li nevrologicheskie simptomy?'],
    rangeLabels: { low: 'Defitsit', normal: 'Norma', elevated: 'Povyshen', high: 'Znachitelno povyshen' },
    categoryLabel: 'Vitaminy',
    pageTitle: 'Vitamin B12: norma, defitsit i anemiya | Medyra'
  },
  'vitamin-d': {
    shortAnswer: 'Vitamin D (25-OH-D) neobkhodim dlya kostey, immuniteta i myshts. Norma: 50-125 nmol/l. Defitsit rasprostranen i mozhet vyzyvat ustalost, boli v kostyakh i oslablenie immuniteta.',
    metaDescription: 'Vitamin D ponizhen? Norma i prichiny defitsita — obyasnenie prostym yazykom.',
    causesElevated: ['Peredozirovka dobavok'],
    causesLow: ['Nedostatok solnechnogo sveta', 'Nepravilnoe pitanie', 'Malabsorptsiya', 'Tyomnaya kozha', 'Ozhirenie'],
    doctorQuestions: ['Nuzhny li dobavki vitamina D?', 'Kakuyu dozu prinimat?', 'Kogda povtorit analiz?'],
    rangeLabels: { low: 'Defitsit', normal: 'Norma', elevated: 'Povyshen', high: 'Peredozirovka' },
    categoryLabel: 'Vitaminy',
    pageTitle: 'Vitamin D: norma, defitsit i dobavki | Medyra'
  }
}

for (const [slug, data] of Object.entries(files)) {
  const fp = path.join(base, slug + '.json')
  fs.writeFileSync(fp, JSON.stringify(data, null, 2) + '\n', 'utf8')
  console.log('wrote', slug)
}
console.log('Done')

/**
 * Every interface string of قريب. Voice: design/system/voice.md.
 * Promises are written exactly as checked by scripts/check-promises.ts.
 */
import { toArabicNumerals } from '../lib/arabic';

export type Intention = 'sujood' | 'after_prayer' | 'before_sleep' | 'now';

export const ar = {
  appName: 'قريب',
  tagline: 'دعاءٌ واحد كلَّ يوم',

  tabs: { today: 'اليوم', library: 'المكتبة', notebook: 'الدفتر', calendar: 'المداومة' },
  nav: { settings: 'الإعدادات', back: 'رجوع', close: 'إغلاق', mainNav: 'الأقسام', skipToContent: 'انتقل إلى المحتوى' },

  onboarding: {
    slides: [
      {
        title: 'لكلّ دعاءٍ قصة',
        body: 'خلف كل دعاء في القرآن والسنة إنسانٌ في لحظة حقيقية: نبيٌّ في ضيق، وأمٌّ في مصيبة، وصحابيٌّ يسأل: علّمني ما أقول.',
        line: 'دعاءٌ واحد كلَّ يوم، بهدوء.',
      },
      {
        title: 'من الترديد إلى الحضور',
        body: 'لا نكتفي بالكلمات: نعيش الموقف، ونفهم المعنى، ثم ندعو بقلبٍ حاضر.',
        line: 'دقيقة ونصف تكفي.',
      },
      {
        title: 'بلا سلاسل، بلا مقارنة',
        body: 'لا نقاط، ولا أيام متتالية، ولا رسائل تُشعرك بالذنب. إن فاتك يوم فاليوم التالي ينتظرك.',
        line: 'القليل الدائم خيرٌ من الكثير المنقطع.',
      },
      {
        title: 'دعاؤك سرٌّ بينك وبين ربك',
        body: 'ما تكتبه يبقى على جهازك وحده. لا حساب، ولا خادم يقرأ.',
        line: 'ابدأ بدعاء اليوم.',
      },
    ],
    next: 'التالي',
    skip: 'تخطَّ',
    back: 'الشريحة السابقة',
    start: 'ابدأ بدعاء اليوم',
    progress: (i: number, n: number) => `الشريحة ${num(i)} من ${num(n)}`,
  },

  today: {
    greeting: 'السلام عليكم',
    live: 'عِش الدعاء',
    done: 'دعوتَ الله اليوم بهذا الدعاء',
    again: 'أعِد التأمل',
    empty: 'لا دعاء في هذا الإصدار بعد.',
  },

  card: {
    quran: 'من القرآن',
    sunnah: 'من السنة',
    welcome: 'دعاء الترحيب',
    draft: 'مسودة',
    draftNote: 'نسخة معاينة: هذه البطاقة لم تبلغ حد المراجعة بعد، ولا تظهر في الإصدار العام.',
    sceneLabel: 'الموقف',
    copy: 'نسخ الدعاء',
    copied: 'نُسخ الدعاء.',
    share: 'مشاركة الدعاء',
    favoriteAdd: 'أضف الدعاء إلى المفضلة',
    favoriteRemove: 'أزل الدعاء من المفضلة',
    surahRef: (name: string, from: number, to: number) =>
      from === to ? `سورة ${name}: ${num(from)}` : `سورة ${name}: ${num(from)}–${num(to)}`,
    hadithRef: (collection: string, number: string) => `${collection} (${num(number)})`,
  },

  sections: {
    context: 'الموقف',
    fullHadith: 'نص الحديث كاملًا',
    meaning: 'المعنى',
    reflections: 'وقفات',
    whenToSay: 'متى يُدعى به',
    retold: 'بتصرّف',
    copiedFrom: 'نُسخ من sunnah.com',
    numbering: (n: string) => n,
    sources: 'المراجع',
  },

  live: {
    title: 'عِش الدعاء',
    steps: { presence: 'الحضور', scene: 'الموقف', meaning: 'المعنى', need: 'حاجتك', supplicate: 'الدعاء' },
    stepLabel: (i: number, name: string) => `${num(i)} · ${name}`,
    progress: (i: number, n: number) => `الخطوة ${num(i)} من ${num(n)}`,
    showAll: 'أظهر النص كاملًا',
    next: 'التالي',
    nextWaiting: 'التالي ينتظر حتى يظهر النص',
    amen: 'يا ربّ',
    close: 'إغلاق عِش الدعاء',
    share: 'مشاركة الدعاء',
    repeat: (done: number, total: number) => `${num(done)} من ${num(total)}`,
    repeatTap: 'المس بعد كل مرة',
    repeatLabel: (total: number) => `عدد المرات الوارد في النص: ${num(total)}`,
    myDuasHint: 'تذكّر حاجاتك في دعائك اليوم',
    myDuasShow: 'أظهر ثلاثًا منها',
    myDuasHide: 'أخفِها',
    intentionTitle: 'متى ستدعو به اليوم؟',
    intentionHint: 'اختيار واحد، وهو اختياري.',
    intentionPreset: (reason: string) => `اخترناه لأن النص يذكره: ${reason}`,
    skip: 'تخطَّ',
    continue: 'متابعة',
    saveNote: 'احفظ في الدفتر',
    finish: 'إتمام',
    needTitle: 'هل لك حاجة تدعو بها مع هذا الدعاء؟',
    needLabel: 'حاجتك',
    needAdd: 'أضف إلى دعواتي',
    needSkip: 'لا الآن',
    needAdded: 'أُضيفت إلى دعواتي.',
    closing: 'جعله الله دعاءً مستجابًا',
    confirmTitle: 'أتغلق قبل الإتمام؟',
    confirmBody: 'لن يُسجَّل اليوم. ما كتبته محفوظ مسودةً على جهازك، ويعود إن فتحت التجربة ثانية.',
    confirmStay: 'تابع التجربة',
    confirmLeave: 'أغلق',
    notRecorded: 'التأمل هنا لا يسجّل يومًا جديدًا، إلا إن كان هذا دعاء اليوم.',
  },

  intentions: {
    sujood: 'في السجود',
    after_prayer: 'دبر الصلاة',
    before_sleep: 'قبل النوم',
    now: 'الآن دعوتُ',
  } satisfies Record<Intention, string>,
  intentionLine: (label: string) => `النية: ${label}`,

  privacyLine: 'ما تكتبه لا يغادر جهازك.',

  library: {
    title: 'المكتبة',
    lived: 'مررتَ بها',
    favorites: 'المفضلة',
    search: 'ابحث بكلمة من الدعاء أو عنوانه',
    searchLabel: 'البحث في الأدعية',
    clear: 'امسح البحث',
    favoriteMark: 'في المفضلة',
    emptyTitle: 'لم تمرّ بدعاءٍ بعد',
    emptyBody: 'كل دعاءٍ تعيشه يبقى هنا، فتعود إليه متى شئت.',
    goToday: 'اذهب إلى دعاء اليوم',
    favEmptyTitle: 'لا شيء في المفضلة بعد',
    favEmptyBody: 'المس القلب على أي دعاء ليبقى هنا.',
    noResultsTitle: 'لا نتائج',
    noResultsBody: 'جرّب كلمة أخرى من الدعاء أو عنوانه. البحث يتجاهل التشكيل وأشكال الهمزة.',
    notFoundTitle: 'لم نجد هذا الدعاء',
    notFoundBody: 'ربما تغيّر الرابط، أو أن الدعاء ليس في هذا الإصدار بعد.',
  },

  notebook: {
    title: 'الدفتر',
    found: 'ما وجدته',
    myDuas: 'دعواتي',
    writeNow: 'اكتب الآن',
    edit: 'عدّل ما كتبته',
    editAria: 'تعديل ما كتبته',
    deleteAria: 'حذف ما كتبته',
    deleteTitle: 'أتحذف ما كتبته؟',
    deleteBody: 'لا يمكن استرجاعه بعد الحذف.',
    delete: 'احذف',
    cancel: 'تراجع',
    save: 'احفظ',
    textLabel: 'ما وجدته',
    emptyTitle: 'لم تكتب شيئًا بعد',
    emptyBody: 'بعد كل دعاء تعيشه يمكنك أن تكتب سطرًا، أو تكتب الآن بلا دعاء.',
  },

  myDuas: {
    open: 'أدعو بها',
    answered: 'استُجيبت',
    add: 'أضف حاجة',
    newTitle: 'حاجة جديدة',
    editTitle: 'عدّل الحاجة',
    need: 'حاجتك',
    note: 'ملاحظة (اختيارية)',
    notePlaceholder: 'متى تدعو بها، أو لمن',
    addedOn: (date: string) => `أُضيفت ${date}`,
    answeredOn: (date: string) => `استُجيبت ${date}`,
    switchLabel: 'استُجيبت؟',
    howTitle: 'كيف استجاب الله؟',
    howLabel: 'اكتب كيف استُجيبت (اختياري)',
    howPlaceholder: 'اكتب كيف استُجيبت',
    editAria: 'تعديل الحاجة',
    deleteAria: 'حذف الحاجة',
    deleteTitle: 'أتحذف هذه الحاجة؟',
    deleteBody: 'تُحذف من دعواتي، ولا يمكن استرجاعها بعد الحذف.',
    emptyTitle: 'اكتب ما تحتاجه.\nلن يراه أحد غيرك.',
    emptyBody: 'حاجاتك هنا تدعو بها، وحين يستجيب الله تعلّمها وتكتب كيف.',
    answeredEmptyTitle: 'ستبقى هنا ما يستجيبه الله',
    answeredEmptyBody: 'حين تُستجاب حاجة، علّمها «استُجيبت» واكتب كيف. تعود إليها في الضيق.',
  },

  calendar: {
    title: 'المداومة',
    subtitle: 'الأيام التي عشتَ فيها دعاءً، بالتقويم الهجري.',
    prev: 'الشهر السابق',
    next: 'الشهر التالي',
    weekdays: ['س', 'ح', 'ن', 'ث', 'ر', 'خ', 'ج'],
    weekdayNames: ['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'],
    dayAria: (weekday: string, day: string, lived: boolean, today: boolean) =>
      `${weekday} ${day}${today ? '، اليوم' : ''}${lived ? '، عشتَ فيه دعاءً' : ''}`,
    emptyDay: 'لم تعش دعاءً في هذا اليوم. لا بأس، فاليوم التالي ينتظرك.',
    futureDay: 'هذا اليوم لم يأتِ بعد.',
    openDua: 'افتح الدعاء',
    missingDua: 'هذا الدعاء لم يعد في هذا الإصدار.',
    reminder: 'أضف تذكيرًا إلى تقويمك',
    reminderTitle: 'تذكير في تقويمك',
    reminderBody: 'اختر وقتًا، فيُنزَّل ملف تقويم بحدث يومي يفتح «قريب». تقويم جهازك هو الذي يذكّرك، بلا إشعارات منّا.',
    reminderTime: 'الوقت',
    reminderDownload: 'نزّل ملف التقويم',
    reminderDone: 'نُزّل الملف. افتحه لتضيف التذكير إلى تقويمك.',
    eventTitle: 'دعاء اليوم في «قريب»',
    eventBody: 'دعاءٌ واحد كلَّ يوم، بهدوء.',
  },

  settings: {
    title: 'الإعدادات',
    appearance: 'المظهر',
    theme: { system: 'تلقائي', light: 'فاتح', dark: 'داكن' },
    textSize: 'حجم النص',
    textSmaller: 'صغّر النص',
    textLarger: 'كبّر النص',
    textValue: 'حجم النص بالبكسل',
    textSample: 'دعاءٌ واحد كلَّ يوم، بهدوء.',
    showMyDuas: 'أظهر ثلاثًا من حاجاتي في «عِش الدعاء»',
    data: 'بياناتي',
    export: 'صدّر نسخة احتياطية',
    exported: 'نُزّلت النسخة الاحتياطية.',
    import: 'استورد نسخة احتياطية',
    erase: 'امسح كل بياناتي',
    privacyGroup: 'الخصوصية',
    privacy: 'سياسة الخصوصية',
    contentGroup: 'عن المحتوى',
    aboutContent: 'عن المحتوى',
    aboutGroup: 'عن التطبيق',
    aboutBody: 'دعاءٌ واحد كلَّ يوم من القرآن والسنة، مع موقفه ومعناه، وتجربة قصيرة تعيش فيها الدعاء قبل أن تدعو به. مجاني، بلا حساب، ويعمل بلا إنترنت.',
    version: (v: string) => `الإصدار ${num(v)}`,
    contact: (c: string) => `للتواصل: ${c}`,
  },

  importFlow: {
    title: 'استيراد نسخة احتياطية',
    contains: 'في هذه النسخة:',
    days: (n: number) => `${num(n)} ${n === 1 ? 'يوم' : 'أيام'} عشتَ فيها دعاءً`,
    entries: (n: number) => `${num(n)} ${n === 1 ? 'مدخلة' : 'مدخلات'} في «ما وجدته»`,
    needs: (n: number) => `${num(n)} ${n === 1 ? 'حاجة' : 'حاجات'} في «دعواتي»`,
    favorites: (n: number) => `${num(n)} ${n === 1 ? 'دعاء' : 'أدعية'} في المفضلة`,
    exportedOn: (date: string) => `صُدّرت ${date}`,
    warning: 'ستحلّ هذه النسخة محل كل بياناتك الحالية على هذا الجهاز.',
    replace: 'استبدل بياناتي',
    cancel: 'تراجع',
    done: 'استُوردت النسخة.',
    errorTitle: 'تعذّر الاستيراد',
    errorBody: 'هذا الملف ليس نسخة احتياطية من «قريب»، أو أنه تالف. لم يتغير شيء في بياناتك.',
    tooLarge: 'هذا الملف أكبر من أن يكون نسخة احتياطية من «قريب». لم يتغير شيء في بياناتك.',
    pickAnother: 'اختر ملفًا آخر',
  },

  erase: {
    title: 'أتمسح كل بياناتك؟',
    body: 'يُحذف من هذا الجهاز كل ما حفظه «قريب»: الأيام التي عشتَ فيها دعاءً، والدفتر، و«دعواتي»، والمفضلة، والإعدادات. لا يمكن استرجاعها إلا من نسخة احتياطية.',
    confirm: 'امسح',
    cancel: 'تراجع',
  },

  privacy: {
    title: 'سياسة الخصوصية',
    updated: (date: string) => `آخر تحديث: ${date}`,
    paragraphs: [
      'ما تكتبه لا يغادر جهازك. «قريب» يحفظ ما تكتبه وما تختاره في متصفحك على هذا الجهاز فقط: الأيام التي عشتَ فيها دعاءً، وما كتبتَه في الدفتر، و«دعواتي»، والمفضلة، والإعدادات.',
      'لا حساب، ولا خادم يحفظ بياناتك، ولا إحصاءات، ولا ملفات تعريف من طرف ثالث.',
      'لا يطلب التطبيق شيئًا من الشبكة إلا ملفاته نفسها من العنوان الذي فتحته منه: الصفحة، والخطوط، والأيقونات، ونصوص الأدعية. لا يُرسل معها شيء مما كتبتَه. وبعد أول زيارة يعمل بلا إنترنت.',
      'النسخة الاحتياطية ملف نصي عادي (JSON) غير مشفّر، يُنزَّل إلى جهازك، ولا يُرسل إلى أحد. احفظه حيث تثق، فمن يفتحه يقرأ ما فيه.',
      'بطاقة المشاركة ونصها لا يحملان شيئًا مما كتبتَه. ما يُشارَك هو الدعاء ومصدره فقط، وأنت من يختار أين يشاركه.',
      'ملف التذكير في التقويم يُنشأ على جهازك ويُضاف إلى تقويمك أنت؛ لا نعرف وقته ولا نرسل إشعارات.',
      '«امسح كل بياناتي» في الإعدادات يحذف كل ما حفظه «قريب» على هذا الجهاز.',
    ],
  },

  aboutContent: {
    title: 'عن المحتوى',
    honest: 'طابقنا كل نص مع مصدره، والمراجعة العلمية جارية.',
    honestApproved: 'طابقنا كل نص مع مصدره، وراجع كل بطاقة معروضة المراجع الشرعي المسمّى أدناه.',
    inRelease: 'البطاقات في هذا الإصدار',
    shown: (n: number) => `المعروض في التطبيق: ${num(n)}`,
    verified: (n: number) => `طوبق مع مصدره: ${num(n)}`,
    approved: (n: number) => `راجعه المراجع الشرعي: ${num(n)}`,
    drafts: (n: number) => `مسودات في هذه المعاينة: ${num(n)}`,
    sources: 'المصادر',
    quranSource:
      'نص القرآن: نص مجمع الملك فهد لطباعة المصحف الشريف (text_qpc_hafs) كما ينشره api.quran.com، بخط مصحف المدينة KFGQPC Uthmanic Script HAFS. يُنسخ بالسورة والآية آليًا ولا يُكتب باليد، وتُطابق حروفه على نص مشروع Tanzil (tanzil.net)، برخصة CC BY 3.0، الذي يُستعمل للبحث وحده.',
    hadithSource:
      'نص الحديث: من صحيحي البخاري ومسلم فقط الآن، منسوخًا آليًا من نسخة sunnah.com المفتوحة بالكتاب والرقم، ويُذكر مع كل حديث مصدره ورقمه ونظام ترقيمه.',
    gradePolicy: 'سياسة الدرجة',
    gradeBody: 'لا يدخل الآن إلا ما في صحيح البخاري أو صحيح مسلم، فيكفي فيه العزو. ولا تُعرض درجة إلا ومعها من حكم بها.',
    review: 'المراجعة',
    reviewBody:
      'تمر كل بطاقة بمرحلتين: تحقق من المصادر يطابق كل نص ومرجع وموقف ومعنى على مصدره، ثم مراجعة مراجع شرعي مسمّى. البطاقات المعروضة الآن اجتازت المرحلة الأولى، والمرحلة الثانية جارية.',
    reviewer: (name: string) => `المراجع الشرعي: ${name}`,
    noReviewer: 'لم يُسمَّ المراجع الشرعي بعد.',
  },

  share: {
    title: 'مشاركة الدعاء',
    formatLabel: 'مقاس الصورة',
    post: 'منشور',
    story: 'قصة',
    levelLabel: 'ما تحمله الصورة',
    levelDua: 'الدعاء',
    levelScene: 'مع الموقف',
    levelReflection: 'مع وقفة',
    note: 'لا تحمل الصورة ولا النص شيئًا مما كتبتَه.',
    copyText: 'انسخ النص',
    copied: 'نُسخ النص.',
    shareImage: 'شارك الصورة',
    download: 'نزّل الصورة',
    preview: (title: string) => `معاينة صورة المشاركة: ${title}`,
    drawing: 'تُرسم الصورة…',
    tag: 'دعاءٌ واحد كلَّ يوم',
  },

  error: {
    title: 'حدث خطأ',
    body: 'بياناتك ما زالت محفوظة على جهازك. أعد تحميل التطبيق، وإن تكرر الخطأ فاحفظ نسخة من بياناتك أولًا.',
    reload: 'أعد التحميل',
    save: 'احفظ نسخة من بياناتي',
  },

  loading: 'يُحمَّل…',
  toastClose: 'إغلاق التنبيه',
};

/** Arabic-Indic digits for anything the user reads. */
export function num(n: number | string): string {
  return toArabicNumerals(n);
}

/**
 * The length of «عِش الدعاء» in words, from the steps' durations (one place, P-03).
 */
export function durationWords(seconds: number): string {
  if (seconds <= 45) return 'نصف دقيقة';
  if (seconds <= 75) return 'دقيقة';
  if (seconds <= 105) return 'دقيقة ونصف';
  if (seconds <= 150) return 'دقيقتان';
  const minutes = Math.round(seconds / 60);
  return minutes <= 10 ? `${num(minutes)} دقائق` : `${num(minutes)} دقيقة`;
}

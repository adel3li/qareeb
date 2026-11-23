# Screens: the visual reference

53 screens and states of «قريب», in `light/` and `dark/` (WebP, 390×844 at device scale 2; tall screens are captured full height; `large-text-*` are 360×640 at the 24px text size; `wide-*` are 1280×820). Captured on 23 November 2026 from a preview build of an earlier implementation (PR #1, branch `claude/qareeb-app`), with the clock set to Monday 23 November 2026 (١٣ جمادى الآخرة ١٤٤٨) and sample user data marked «مثال».

They are a reference for layout, states and flows. The design system in `design/system/` and the docs in `docs/handoff/` stay the source of truth: where a screen differs from them, they win. The cards in the screens were drafts, so red «مسودة» marks and `<<…>>` placeholders appear in them.

Gallery: https://claude.ai/artifact/66d2V7aBbQNVgi5jHXxuLx

## أول تشغيل

Four onboarding slides with skip and back, then the welcome dua (al-Fatiha 6–7) on the first day.

| File | Screen | Note |
|---|---|---|
| `onboarding-1.webp` | الشريحة ١ | Wordmark, skip, progress dots |
| `onboarding-2.webp` | الشريحة ٢ | Back appears from slide 2 |
| `onboarding-3.webp` | الشريحة ٣ | «بلا سلاسل، بلا مقارنة» |
| `onboarding-4.webp` | الشريحة ٤ | «ابدأ بدعاء اليوم» |
| `today-welcome.webp` | اليوم · دعاء الترحيب | Welcome chip, the whole copied verses, draft note |

## عِش الدعاء

The guided flow: five paced steps, then intention, notebook, a need for دعواتي, and the closing. Recorded only at the closing.

| File | Screen | Note |
|---|---|---|
| `live-1-paced.webp` | ١ · الحضور (يظهر) | First sentence shown; «التالي» waits |
| `live-1.webp` | ١ · الحضور | After «أظهر النص كاملًا» |
| `live-2.webp` | ٢ · الموقف | Paced text inside the arch |
| `live-3.webp` | ٣ · المعنى |  |
| `live-4.webp` | ٤ · حاجتك |  |
| `live-5.webp` | ٥ · الدعاء | The dua in SacredText, «يا ربّ» |
| `live-intention.webp` | النية | One optional choice |
| `live-notebook.webp` | الدفتر | Journal prompt, privacy line |
| `live-mydua.webp` | دعواتي | Optional need |
| `live-closing.webp` | الختام | Held 2 seconds, then Today |
| `live-confirm-close.webp` | إغلاق قبل الإتمام | Unsaved text: confirm, kept as a draft |
| `today-done.webp` | اليوم · تمّ | «دعوتَ الله اليوم بهذا الدعاء» and «أعِد التأمل» |

## اليوم

A returning user's day: the rotating dua, its sections, and sharing.

| File | Screen | Note |
|---|---|---|
| `today.webp` | اليوم | Greeting, Hijri date, the card |
| `today-sections.webp` | الأقسام مفتوحة | الموقف، المعنى، وقفات; placeholders in red in drafts |
| `share-sheet.webp` | المشاركة · منشور | 4:5 canvas image, copy text |
| `share-sheet-story.webp` | المشاركة · قصة مع وقفة | 9:16 with a reflection |

## المكتبة

Duas lived and favourites, with search that ignores vowel marks and letter forms.

| File | Screen | Note |
|---|---|---|
| `library.webp` | مررتَ بها | Newest first, Hijri date, favourite mark |
| `library-search.webp` | البحث | Matching «يونس» |
| `library-noresults.webp` | لا نتائج |  |
| `library-favorites.webp` | المفضلة |  |
| `dua-page-hadith.webp` | صفحة الدعاء · حديث | #/dua/dua_0003, full narration open |
| `library-empty.webp` | فارغة | Before any dua is lived |
| `dua-not-found.webp` | رابط غير موجود |  |

## الدفتر

ما وجدته grouped by Hijri day, and دعواتي with answered needs. No counts.

| File | Screen | Note |
|---|---|---|
| `notebook-found.webp` | ما وجدته | Edit and delete always visible |
| `notebook-write.webp` | اكتب الآن | Sheet |
| `notebook-delete.webp` | تأكيد الحذف | «احذف» / «تراجع» |
| `notebook-empty.webp` | ما وجدته فارغ |  |
| `mydua-open.webp` | دعواتي · أدعو بها | Switch «استُجيبت؟» |
| `mydua-add.webp` | حاجة جديدة |  |
| `mydua-answered-sheet.webp` | كيف استجاب الله؟ | Opens when switched on |
| `mydua-answered.webp` | استُجيبت | With how it was answered |
| `mydua-empty.webp` | دعواتي فارغة | «اكتب ما تحتاجه. لن يراه أحد غيرك.» |
| `mydua-answered-empty.webp` | استُجيبت فارغة |  |

## المداومة

Real Hijri months from Saturday; lived days marked quietly, no totals.

| File | Screen | Note |
|---|---|---|
| `calendar.webp` | الشهر | Today dashed, lived days with a dot |
| `calendar-day.webp` | يوم عشتَ فيه دعاءً | Dua, intention, what was written |
| `calendar-empty-day.webp` | يوم بلا دعاء | «لا بأس، فاليوم التالي ينتظرك» |
| `calendar-reminder.webp` | تذكير في التقويم | Downloads a daily .ics |

## الإعدادات

Appearance, data, privacy and the honest «عن المحتوى».

| File | Screen | Note |
|---|---|---|
| `settings.webp` | الإعدادات | Theme, text size, switch, data rows |
| `settings-privacy.webp` | سياسة الخصوصية |  |
| `settings-about-content.webp` | عن المحتوى | Counts read from the data |
| `settings-import.webp` | استيراد · الملخص | Checked summary, then confirm |
| `settings-import-error.webp` | استيراد · ملف تالف | Nothing changes |
| `settings-erase.webp` | امسح كل بياناتي | Confirmation |

## حالات خاصة

The root error screen, and the largest text size (24px) on a 360×640 screen.

| File | Screen | Note |
|---|---|---|
| `error.webp` | حدث خطأ | Reload, or save a copy of the data |
| `large-text-today.webp` | نص كبير · اليوم | 360×640 at 24px |
| `large-text-calendar.webp` | نص كبير · المداومة |  |

## الشاشات العريضة

At 768px and wider the tabs move into the top bar and the column stays centred.

| File | Screen | Note |
|---|---|---|
| `wide-today.webp` | اليوم | 1280×820 |
| `wide-calendar.webp` | المداومة |  |

export type Lang = "en" | "ar";

export const GOOGLE_PLAY_URL =
  process.env.NEXT_PUBLIC_GOOGLE_PLAY_URL ||
  "https://play.google.com/store/apps/details?id=com.forgepulse.brickbreakerball";
export const YOUTUBE_URL = "https://youtu.be/xFAEdzZf7L4";
export const GITHUB_URL = "https://github.com/msr7799";

export const worlds = [
  { id: 1, en: "COSMIC NEXUS", ar: "ملتقى الكون", enSub: "Deep-space forge", arSub: "مصهر في أعماق الفضاء" },
  { id: 2, en: "SKY GARDENS", ar: "حدائق السماء", enSub: "Luminous aerial biome", arSub: "عالم مضيء فوق السحاب" },
  { id: 3, en: "FROST CITADEL", ar: "قلعة الصقيع", enSub: "Frozen fortress", arSub: "حصن متجمّد" },
  { id: 4, en: "DESERT EMPIRE", ar: "إمبراطورية الصحراء", enSub: "Ancient solar machinery", arSub: "آلات شمسية عتيقة" },
  { id: 5, en: "INFERNO REALM", ar: "عالم الجحيم", enSub: "Volcanic industrial world", arSub: "عالم بركاني صناعي" },
  { id: 6, en: "AZURE PARADISE", ar: "الفردوس الأزرق", enSub: "Deep-water sanctuary", arSub: "ملاذ في أعماق المياه" },
  { id: 7, en: "TIDAL KINGDOM", ar: "مملكة المد", enSub: "Bright coastal kingdom", arSub: "مملكة ساحلية مضيئة" },
  { id: 8, en: "FINAL REACTOR", ar: "المفاعل الأخير", enSub: "Dangerous endgame facility", arSub: "منشأة خطرة في نهاية الرحلة" },
  { id: 9, en: "INFERNO GATE", ar: "بوابة الجحيم", enSub: "The molten threshold", arSub: "عتبة العالم المنصهر" },
  { id: 10, en: "VOID ECLIPSE", ar: "كسوف الفراغ", enSub: "A fractured cosmic frontier", arSub: "حدود كونية متصدعة" },
  { id: 11, en: "BLOOD MOON", ar: "قمر الدم", enSub: "Storms beneath the red eclipse", arSub: "عواصف تحت الكسوف الأحمر" },
  { id: 12, en: "COSMIC WHALE", ar: "الحوت الكوني", enSub: "A luminous deep-space passage", arSub: "ممر مضيء في الفضاء العميق" },
  { id: 13, en: "CHRONO SANCTUM", ar: "معبد الزمن", enSub: "The frozen clockwork citadel", arSub: "قلعة زمنية متجمدة" }
] as const;

export const volleyWorlds = [
  { id: 1, en: "Mystery Forest", ar: "الغابة الغامضة", stages: 7, enSub: "Funnel shots through the ancient forest", arSub: "مرّر الكرات عبر مسارات الغابة القديمة" },
  { id: 2, en: "Venom Wilds", ar: "براري السموم", stages: 10, enSub: "Survive poisoned passages and hostile growth", arSub: "تجاوز الممرات السامة والنباتات المعادية" },
  { id: 3, en: "Aqua Vortex", ar: "دوامة المياه", stages: 6, enSub: "Bank volleys through flooded ruins", arSub: "وجّه الارتدادات عبر الأطلال المغمورة" },
  { id: 4, en: "Desert Spirits", ar: "أرواح الصحراء", stages: 10, enSub: "Discover narrow routes through buried halls", arSub: "اكتشف المسارات الضيقة في القاعات المدفونة" },
  { id: 5, en: "Ice Grave", ar: "قبر الجليد", stages: 10, enSub: "Break open frozen multi-bounce chambers", arSub: "افتح حجرات جليدية متعددة الارتداد" },
  { id: 6, en: "Tormented Souls", ar: "الأرواح المعذبة", stages: 10, enSub: "Cross haunted strongholds and cursed rails", arSub: "اعبر الحصون المسكونة والمسارات الملعونة" },
  { id: 7, en: "Moon Light", ar: "ضوء القمر", stages: 8, enSub: "Challenge the guardian of the moonlit shrine", arSub: "تحدَّ حارس المعبد المضاء بالقمر" },
  { id: 8, en: "Infernal Gates", ar: "بوابات الجحيم", stages: 10, enSub: "Master dangerous rails above molten stone", arSub: "أتقن المسارات الخطرة فوق الصخور المنصهرة" },
  { id: 9, en: "Final Eclipse", ar: "الكسوف الأخير", stages: 10, enSub: "Conquer the final portal gauntlet", arSub: "اقتحم ممر البوابات الأخير" }
] as const;

export const copy = {
  en: {
    nav: { home: "Home", modes: "Game modes", bosses: "Worlds", gameplay: "Gameplay", gallery: "Gallery", rules: "Rules", privacy: "Privacy", download: "Get the game" },
    heroKicker: "FORGE PULSE GAMES PRESENTS",
    heroTitle: "TWO WAYS TO BREAK THE WORLD.",
    heroBody: "A fantasy brick-breaking adventure built around precision, momentum and spectacular worlds. Master the classic paddle or unleash a full volley of balls against towering bosses.",
    googlePlay: "GET IT ON GOOGLE PLAY",
    watchGameplay: "WATCH GAMEPLAY",
    scroll: "DISCOVER THE GAME",
    introKicker: "A BRICK-BREAKER FORGED DIFFERENTLY",
    introTitle: "Arcade precision meets a world-spanning adventure.",
    introBody: "Brick Breaker Ball expands the familiar bounce-and-break formula into two complete campaigns. Every world changes the atmosphere, every board asks for a new line, and every hit pushes you closer to the next confrontation.",
    stats: [["2", "distinct game modes"], ["104", "Classic stages"], ["81", "Volley stages"], ["9", "Volley boss worlds"]],
    modesKicker: "CHOOSE YOUR STYLE",
    modesTitle: "Classic control. Volley strategy.",
    classic: { label: "CLASSIC MODE", title: "Own every rebound.", body: "Control the paddle, protect your lives and dismantle formations brick by brick across 13 evolving worlds. Power-ups, special materials and precision bonuses keep every stage moving.", points: ["13 worlds · 104 stages", "Paddle and ball customization", "Power-ups, hazards and special bricks"] },
    volley: { label: "VOLLEY MODE", title: "Aim once. Unleash everything.", body: "Launch growing volleys through 81 handcrafted stages. Find ricochet routes, break guarded cores and finish each world in a cinematic boss battle.", points: ["9 themed worlds · 81 stages", "Ball pickups and tactical ricochets", "A final boss in every world"] },
    bossesKicker: "THE VOLLEY CAMPAIGN",
    bossesTitle: "Nine worlds. Nine final warnings.",
    bossesBody: "Each Volley world has its own visual identity, stage count and final encounter. Swipe through the campaign and meet what waits at the core.",
    stages: "stages",
    bossBattle: "Boss battle",
    galleryKicker: "FROM THE GAME",
    galleryTitle: "Every shot tells the story.",
    galleryBody: "Real screens and promotional artwork from the current Android game—from the mode selector to late-world Classic layouts and Volley boss encounters.",
    finalKicker: "THE NEXT BOUNCE IS YOURS",
    finalTitle: "Choose your mode. Break the impossible.",
    finalBody: "Download Brick Breaker Ball for Android and begin with Classic precision or Volley firepower.",
    footerLine: "A fantasy brick-breaking adventure by Forge Pulse Games.",
    legal: "Legal"
  },
  ar: {
    nav: { home: "الرئيسية", modes: "أنماط اللعب", bosses: "العوالم", gameplay: "تجربة اللعب", gallery: "المعرض", rules: "القوانين", privacy: "الخصوصية", download: "حمّل اللعبة" },
    heroKicker: "FORGE PULSE GAMES تقدم",
    heroTitle: "طريقتان لكسر العالم.",
    heroBody: "مغامرة خيالية لكسر الطوب مبنية على الدقة والزخم وعوالم مذهلة. أتقن المضرب في النمط الكلاسيكي أو أطلق وابلًا كاملًا من الكرات في مواجهة زعماء هائلين.",
    googlePlay: "حمّلها من GOOGLE PLAY",
    watchGameplay: "شاهد أسلوب اللعب",
    scroll: "اكتشف اللعبة",
    introKicker: "لعبة كسر طوب بهوية مختلفة",
    introTitle: "دقة الأركيد داخل مغامرة تمتد عبر العوالم.",
    introBody: "توسّع Brick Breaker Ball فكرة الارتداد والكسر المألوفة إلى حملتين كاملتين. لكل عالم أجواؤه، ولكل لوحة مسار جديد، وكل ضربة تقرّبك من المواجهة التالية.",
    stats: [["2", "نمطا لعب مختلفان"], ["104", "مراحل Classic"], ["81", "مراحل Volley"], ["9", "عوالم زعماء Volley"]],
    modesKicker: "اختر أسلوبك",
    modesTitle: "تحكم Classic. استراتيجية Volley.",
    classic: { label: "نمط CLASSIC", title: "تحكّم في كل ارتداد.", body: "حرّك المضرب، احمِ فرصك وفكّك التشكيلات طوبة بعد أخرى عبر 13 عالمًا متطورًا. القوى الخاصة والخامات المختلفة ومكافآت الدقة تجعل كل مرحلة متجددة.", points: ["13 عالمًا · 104 مراحل", "تخصيص المضارب والكرات", "قوى خاصة ومخاطر وقراميد متنوعة"] },
    volley: { label: "نمط VOLLEY", title: "صوّب مرة. وأطلق كل شيء.", body: "أطلق وابلًا متزايدًا عبر 81 مرحلة مصممة بعناية. اكتشف مسارات الارتداد، واكسر الأنوية المحمية، واختتم كل عالم بمعركة زعيم سينمائية.", points: ["9 عوالم · 81 مرحلة", "كرات إضافية وارتدادات تكتيكية", "زعيم أخير في كل عالم"] },
    bossesKicker: "حملة VOLLEY",
    bossesTitle: "تسعة عوالم. تسعة إنذارات أخيرة.",
    bossesBody: "يمتلك كل عالم في Volley هويته البصرية وعدد مراحله ومواجهته النهائية. تصفح الحملة واكتشف من ينتظرك عند النواة.",
    stages: "مراحل",
    bossBattle: "معركة زعيم",
    galleryKicker: "من داخل اللعبة",
    galleryTitle: "كل ضربة تروي جزءًا من الحكاية.",
    galleryBody: "شاشات حقيقية وأعمال دعائية من نسخة Android الحالية، من اختيار النمط إلى مراحل Classic المتقدمة ومواجهات زعماء Volley.",
    finalKicker: "الارتداد التالي لك",
    finalTitle: "اختر نمطك. واكسر المستحيل.",
    finalBody: "حمّل Brick Breaker Ball لأندرويد وابدأ بدقة Classic أو قوة Volley.",
    footerLine: "مغامرة خيالية لكسر الطوب من Forge Pulse Games.",
    legal: "الروابط القانونية"
  }
} as const;

export function href(lang: Lang, path = "") { return `/${lang}${path}`; }

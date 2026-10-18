export type Lang = "en" | "ar";

export const GOOGLE_PLAY_URL =
  process.env.NEXT_PUBLIC_GOOGLE_PLAY_URL ||
  "https://play.google.com/store/apps/details?id=com.forgepulse.brickbreakerball";
export const YOUTUBE_URL = "https://youtu.be/xFAEdzZf7L4";
export const GITHUB_URL = "https://github.com/msr7799";

export const volleyWorlds = [
  { id: 1, en: "Mystery Forest", ar: "الغابة الغامضة", stages: 10, enSub: "Funnel shots through the ancient forest", arSub: "مرّر الكرات عبر مسارات الغابة القديمة" },
  { id: 2, en: "Venom Wilds", ar: "براري السموم", stages: 10, enSub: "Survive poisoned passages and hostile growth", arSub: "تجاوز الممرات السامة والنباتات المعادية" },
  { id: 3, en: "Aqua Vortex", ar: "دوامة المياه", stages: 10, enSub: "Bank volleys through flooded ruins", arSub: "وجّه الارتدادات عبر الأطلال المغمورة" },
  { id: 4, en: "Desert Spirits", ar: "أرواح الصحراء", stages: 10, enSub: "Discover narrow routes through buried halls", arSub: "اكتشف المسارات الضيقة في القاعات المدفونة" },
  { id: 5, en: "Ice Grave", ar: "قبر الجليد", stages: 10, enSub: "Break open frozen multi-bounce chambers", arSub: "افتح حجرات جليدية متعددة الارتداد" },
  { id: 6, en: "Tormented Souls", ar: "الأرواح المعذبة", stages: 10, enSub: "Cross haunted strongholds and cursed rails", arSub: "اعبر الحصون المسكونة والمسارات الملعونة" },
  { id: 7, en: "Moon Light", ar: "ضوء القمر", stages: 10, enSub: "Challenge the guardian of the moonlit shrine", arSub: "تحدَّ حارس المعبد المضاء بالقمر" },
  { id: 8, en: "Infernal Gates", ar: "بوابات الجحيم", stages: 10, enSub: "Master dangerous rails above molten stone", arSub: "أتقن المسارات الخطرة فوق الصخور المنصهرة" },
  { id: 9, en: "Final Eclipse", ar: "الكسوف الأخير", stages: 10, enSub: "Conquer the final portal gauntlet", arSub: "اقتحم ممر البوابات الأخير" }
] as const;

export const copy = {
  en: {
    nav: { home: "Home", modes: "Volley", bosses: "Worlds", gameplay: "Gameplay", gallery: "Gallery", rules: "Rules", privacy: "Privacy", download: "Get the game" },
    heroKicker: "FORGE PULSE GAMES PRESENTS",
    heroTitle: "AIM. LAUNCH. BREAK THE WORLD.",
    heroBody: "Aim a growing volley of balls through spectacular worlds, clear dangerous brick formations and face a boss at the end of every world.",
    googlePlay: "GET IT ON GOOGLE PLAY",
    watchGameplay: "WATCH GAMEPLAY",
    scroll: "DISCOVER THE GAME",
    introKicker: "A BRICK-BREAKER FORGED DIFFERENTLY",
    introTitle: "Arcade precision meets a world-spanning adventure.",
    introBody: "Across nine worlds, each stage asks you to find a new angle. Collect extra balls, use ricochets and clear the formation before it reaches the danger line.",
    stats: [["90", "Volley stages"], ["9", "themed worlds"], ["10", "stages per world"], ["9", "boss encounters"]],
    modesKicker: "THE GAMEPLAY",
    modesTitle: "One aim. A whole volley of possibilities.",
    volley: { label: "VOLLEY", title: "Aim once. Unleash everything.", body: "Launch growing volleys through 90 stages. Find ricochet routes, break guarded cores and finish each world in a boss battle.", points: ["9 themed worlds · 90 stages", "Ball pickups and tactical ricochets", "A final boss in every world"] },
    bossesKicker: "THE VOLLEY CAMPAIGN",
    bossesTitle: "Nine worlds. Nine final warnings.",
    bossesBody: "Each Volley world has its own visual identity, stage count and final encounter. Swipe through the campaign and meet what waits at the core.",
    stages: "stages",
    bossBattle: "Boss battle",
    galleryKicker: "FROM THE GAME",
    galleryTitle: "Every shot tells the story.",
    galleryBody: "Volley gameplay screens and world artwork from the Android game.",
    finalKicker: "THE NEXT BOUNCE IS YOURS",
    finalTitle: "Take aim. Break the impossible.",
    finalBody: "Download Brick Breaker Ball for Android and play the Volley campaign across nine worlds.",
    footerLine: "A fantasy brick-breaking adventure by Forge Pulse Games.",
    legal: "Legal"
  },
  ar: {
    nav: { home: "الرئيسية", modes: "الفولي", bosses: "العوالم", gameplay: "تجربة اللعب", gallery: "المعرض", rules: "القوانين", privacy: "الخصوصية", download: "حمّل اللعبة" },
    heroKicker: "FORGE PULSE GAMES تقدم",
    heroTitle: "صوّب. أطلق. واكسر العالم.",
    heroBody: "صوّب وابلًا متزايدًا من الكرات عبر عوالم مذهلة، وحطّم تشكيلات القراميد وواجه زعيمًا في نهاية كل عالم.",
    googlePlay: "حمّلها من GOOGLE PLAY",
    watchGameplay: "شاهد أسلوب اللعب",
    scroll: "اكتشف اللعبة",
    introKicker: "لعبة كسر طوب بهوية مختلفة",
    introTitle: "دقة الأركيد داخل مغامرة تمتد عبر العوالم.",
    introBody: "تضم الحملة تسعة عوالم، وتحتاج كل مرحلة إلى زاوية جديدة. اجمع كرات إضافية، واستغل الارتدادات، وامسح التشكيل قبل وصوله إلى خط الخطر.",
    stats: [["90", "مرحلة فولي"], ["9", "عوالم متنوعة"], ["10", "مراحل لكل عالم"], ["9", "مواجهات زعماء"]],
    modesKicker: "أسلوب اللعب",
    modesTitle: "تصويبة واحدة. احتمالات ارتداد كثيرة.",
    volley: { label: "الفولي", title: "صوّب مرة. وأطلق كل شيء.", body: "أطلق وابلًا متزايدًا عبر 90 مرحلة. اكتشف مسارات الارتداد، واكسر الأنوية المحمية، واختتم كل عالم بمعركة زعيم.", points: ["9 عوالم · 90 مرحلة", "كرات إضافية وارتدادات تكتيكية", "زعيم أخير في كل عالم"] },
    bossesKicker: "حملة VOLLEY",
    bossesTitle: "تسعة عوالم. تسعة إنذارات أخيرة.",
    bossesBody: "يمتلك كل عالم في Volley هويته البصرية وعدد مراحله ومواجهته النهائية. تصفح الحملة واكتشف من ينتظرك عند النواة.",
    stages: "مراحل",
    bossBattle: "معركة زعيم",
    galleryKicker: "من داخل اللعبة",
    galleryTitle: "كل ضربة تروي جزءًا من الحكاية.",
    galleryBody: "شاشات من أسلوب لعب الفولي ورسومات عوالمه في لعبة أندرويد.",
    finalKicker: "الارتداد التالي لك",
    finalTitle: "صوّب واكسر المستحيل.",
    finalBody: "حمّل Brick Breaker Ball لأندرويد والعب حملة الفولي عبر تسعة عوالم.",
    footerLine: "مغامرة خيالية لكسر الطوب من Forge Pulse Games.",
    legal: "الروابط القانونية"
  }
} as const;

export function href(lang: Lang, path = "") { return `/${lang}${path}`; }

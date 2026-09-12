export type Lang = "en" | "ar";

export const worlds = [
  { id: 1, en: "CRYSTAL LEVIATHAN", ar: "تنين الكريستال", enSub: "Crystal water dragon beneath the deep", arSub: "تنين مائي كريستالي في أعماق البحر" },
  { id: 2, en: "CELESTIAL GROVE", ar: "البستان السماوي", enSub: "Mushroom kingdom beneath planetary skies", arSub: "مملكة فطرية تحت سماء الكواكب" },
  { id: 3, en: "VOID WHALE", ar: "حوت الفراغ", enSub: "A cosmic whale sailing the stars", arSub: "حوت كوني يبحر بين النجوم" },
  { id: 4, en: "AZURE PYRAMID", ar: "الهرم الأزرق", enSub: "Ancient desert city of crystal pyramids", arSub: "مدينة صحراوية قديمة من الأهرامات الكريستالية" },
  { id: 5, en: "SKY KINGDOM", ar: "مملكة السماء", enSub: "Floating city and islands above the clouds", arSub: "مدينة وجزر عائمة فوق السحاب" },
  { id: 6, en: "STORM SPIRE", ar: "برج العاصفة", enSub: "Storm towers charged with lightning", arSub: "أبراج عاصفة مشحونة بالبرق" },
  { id: 7, en: "CRYSTAL COAST", ar: "ساحل الكريستال", enSub: "Crystal shore and the water pyramid", arSub: "شاطئ كريستالي وهرم مائي" },
  { id: 8, en: "FROZEN CITADEL", ar: "القلعة المتجمدة", enSub: "Frozen fortress beneath the aurora", arSub: "حصن متجمد تحت الشفق" },
  { id: 9, en: "DARK MATTER", ar: "المادة المظلمة", enSub: "Enter the dark vortex", arSub: "ادخل الدوامة المظلمة" },
  { id: 10, en: "CONJUNCTION", ar: "الاقتران", enSub: "Survive the planetary alignment", arSub: "انجُ من اصطفاف الكواكب" },
  { id: 11, en: "CHAOS", ar: "الفوضى", enSub: "Face the unraveling cosmos", arSub: "واجه انهيار الكون" },
  { id: 12, en: "THE END OF TIME", ar: "نهاية الزمن", enSub: "Reach the edge of all time", arSub: "بلغ حافة الزمن" },
  { id: 13, en: "DARK VOLCANO", ar: "البركان المظلم", enSub: "The final world", arSub: "العالم الأخير" }
] as const;

export const copy = {
  en: {
    nav: { home: "Home", play: "Play", worlds: "Worlds", rules: "Rules", privacy: "Privacy" },
    heroEyebrow: "BROWSER EDITION • ANDROID GAME",
    heroTitle: "Break every world. Master every bounce.",
    heroBody: "Brick Breaker Ball combines classic brick-breaking with 90 campaign stages, 13 animated worlds, power-ups, special bricks, collectible balls and evolving paddle styles.",
    playNow: "PLAY NOW",
    viewRules: "VIEW RULES",
    stats: [
      ["90", "Campaign stages"],
      ["13", "Animated worlds"],
      ["60", "Individual balls"],
      ["36", "Paddle style sets"]
    ],
    featureTitle: "Built around progression",
    featureBody: "Every stage pushes the campaign forward. New ball cosmetics unlock as you progress, while worlds introduce denser layouts, faster pacing and more dangerous brick mechanics.",
    features: [
      ["60 BALLS", "Start with Chrome Mirror, then unlock Black Gloss, Amber Glass, Orange Glass, Smoky Stone, Pearl White and the rest of the collection."],
      ["POWER-UPS", "Fireball, piercing, multiball, sticky paddles, laser fire, extra lives, size changes and more can transform a run."],
      ["SPECIAL BRICKS", "Crystals crack before breaking. Steel can resist normal hits. Teleporters, hazards, carriers and armored targets change the board."],
      ["13 WORLDS", "Each campaign world has its own animated video backdrop and escalating stage difficulty."]
    ],
    worldsTitle: "13 worlds. One campaign.",
    worldsBody: "The web edition uses the same world video artwork from the Android project and keeps the 9:16 playfield responsive on phones, tablets and desktop browsers.",
    cosmeticsTitle: "Collect your next ball",
    cosmeticsBody: "The native game catalog exposes 60 individual ball cosmetics. The first six are the foundation of progression.",
    webTitle: "Play instantly in your browser",
    webBody: "A responsive HTML5 web edition is included in this site. Use mouse, touch, A/D or arrow keys to control the paddle. Progress is saved locally in your browser.",
    finalTitle: "Ready to break the first world?",
    finalBody: "No account required. Open the web edition and start Stage 1.",
    footer: "Brick Breaker Ball • Kotlin / LibGDX native game + Next.js web edition"
  },
  ar: {
    nav: { home: "الرئيسية", play: "العب", worlds: "العوالم", rules: "القوانين", privacy: "الخصوصية" },
    heroEyebrow: "نسخة المتصفح • لعبة أندرويد",
    heroTitle: "اكسر كل عالم. وتحكّم بكل ارتداد.",
    heroBody: "Brick Breaker Ball تجمع أسلوب كسر الطوب الكلاسيكي مع 90 مرحلة، و13 عالمًا متحركًا، وتمائم وقوى خاصة، وقراميد متنوعة، وكور قابلة للجمع، ومضارب تتطور مع اللعب.",
    playNow: "العب الآن",
    viewRules: "شاهد القوانين",
    stats: [
      ["90", "مرحلة في الحملة"],
      ["13", "عالمًا متحركًا"],
      ["60", "كرة منفصلة"],
      ["36", "مجموعة ستايل للمضارب"]
    ],
    featureTitle: "تقدم مستمر داخل اللعبة",
    featureBody: "كل مرحلة تدفع الحملة إلى الأمام. تفتح كورًا جديدة مع تقدمك، وتقدم العوالم تشكيلات أصعب وسرعات أعلى وميكانيكيات أخطر للقراميد.",
    features: [
      ["60 كرة", "تبدأ بـ Chrome Mirror ثم تفتح Black Gloss وAmber Glass وOrange Glass وSmoky Stone وPearl White وبعدها بقية المجموعة."],
      ["قوى وتمائم", "كرة النار والاختراق وتعدد الكور والمضرب اللاصق والليزر والحياة الإضافية وتغيير الأحجام وغيرها تغير مجرى الجولة."],
      ["قراميد خاصة", "الكريستال يتشقق قبل أن ينكسر، والفولاذ يقاوم الضربات العادية، مع ناقلات ومخاطر وقراميد مدرعة."],
      ["13 عالمًا", "لكل عالم فيديو متحرك خاص به مع صعوبة تتصاعد مرحلة بعد مرحلة."]
    ],
    worldsTitle: "13 عالمًا. حملة واحدة.",
    worldsBody: "نسخة الويب تستخدم نفس فيديوهات العوالم الموجودة في مشروع الأندرويد، وتحافظ على ساحة اللعب 9:16 بشكل رسبونسف على الهاتف والتابلت والكمبيوتر.",
    cosmeticsTitle: "افتح كرتك التالية",
    cosmeticsBody: "كتالوج اللعبة الحالي يحتوي على 60 كرة منفصلة. أول ست كور هي أساس نظام التقدم.",
    webTitle: "العب مباشرة من المتصفح",
    webBody: "الموقع يحتوي نسخة HTML5 رسبونسف قابلة للعب. استخدم الماوس أو اللمس أو الأسهم أو A/D لتحريك المضرب، ويتم حفظ تقدمك محليًا في المتصفح.",
    finalTitle: "جاهز تكسر العالم الأول؟",
    finalBody: "ما تحتاج حساب. افتح نسخة الويب وابدأ المرحلة الأولى.",
    footer: "Brick Breaker Ball • لعبة Kotlin / LibGDX الأصلية + نسخة ويب Next.js"
  }
} as const;

export function href(lang: Lang, path = "") {
  return `/${lang}${path}`;
}

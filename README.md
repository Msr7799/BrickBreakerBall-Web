# Brick Breaker Ball Web

نسخة ويب ثنائية اللغة من لعبة **Brick Breaker Ball**. يحتوي المشروع على موقع تعريفي، صفحات القوانين والخصوصية، ونسخة HTML5 قابلة للعب داخل المتصفح.

English is available at `/en` and Arabic is available at `/ar`.

![Brick Breaker Ball home page](game-pic.png)
![Brick Breaker Ball play page](game-pic1.png)
![Brick Breaker Ball worlds page](game-pic2.png)
![Brick Breaker Ball cosmetics page](game-pic3.png)

[![Next.js](https://img.shields.io/badge/Next.js-15.5.24-000000?logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.1.1-149eca?logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-3178c6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.1.12-06b6d4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![HTML5 Canvas](https://img.shields.io/badge/Game-HTML5_Canvas-e34f26?logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)
[![pnpm](https://img.shields.io/badge/Package_manager-pnpm-f69220?logo=pnpm&logoColor=white)](https://pnpm.io/)

## نظرة عامة

الموقع مبني باستخدام Next.js App Router، ويعرض محتوى اللعبة وأصولها بطريقة متجاوبة على الجوال والتابلت والكمبيوتر. صفحة اللعب تستخدم Canvas لمحاكاة حركة الكرة، اصطدامها بالبلوكات، حركة البادل، المراحل، الأرواح، القوى، والأهداف الخاصة.

المشروع ليس نسخة مترجمة أو مشغّلًا مباشرًا لمحرك LibGDX الأصلي؛ بل هو إعادة تنفيذ ويب تستخدم بيانات الحملة والأصول المرئية والصوتية المتوفرة في المشروع الأصلي.

## المزايا

- واجهة باللغة الإنجليزية والعربية مع مسارات مستقلة.
- 90 مرحلة موزعة على 13 عالمًا.
- فيديو خلفية متغير لكل عالم من `public/game/worlds`.
- 60 كرة قابلة للاختيار من `balls_set`.
- 36 مجموعة Paddle Style Sets، وكل مجموعة تحتوي نسخة `Normal` و`Weapon` و`Sticky`.
- عرض الـ paddles من Sprite Sheets وملفات JSON الخاصة بالإحداثيات.
- تحكم بالماوس واللمس والأسهم ومفاتيح `A` و`D`.
- حفظ المرحلة المفتوحة، الكرة المختارة، ومجموعة البادل في `localStorage`.
- صفحات مستقلة للقوانين والخصوصية باللغتين.
- تصميم متجاوب مبني فوق Tailwind CSS.

## صفحات الموقع

| المسار | الوصف |
| --- | --- |
| `/` | تحويل تلقائي إلى النسخة الإنجليزية |
| `/en` | الصفحة الرئيسية بالإنجليزية |
| `/en/play` | نسخة اللعب بالإنجليزية |
| `/en/rules` | قوانين اللعبة بالإنجليزية |
| `/en/privacy` | سياسة الخصوصية بالإنجليزية |
| `/ar` | الصفحة الرئيسية بالعربية |
| `/ar/play` | نسخة اللعب بالعربية |
| `/ar/rules` | قوانين اللعبة بالعربية |
| `/ar/privacy` | سياسة الخصوصية بالعربية |

## هيكل المشروع

```text
BrickBreakerBall-Web/
├── app/
│   ├── page.tsx                 # المسار الرئيسي والتحويل للغة الافتراضية
│   ├── layout.tsx               # Metadata والتخطيط العام
│   ├── globals.css              # الألوان، الخلفيات، وتنسيقات اللعبة
│   ├── en/                      # صفحات النسخة الإنجليزية
│   └── ar/                      # صفحات النسخة العربية
│
├── components/
│   ├── GameCanvas.tsx           # منطق ورسم لعبة Canvas واختيارات التجهيزات
│   ├── PlayPage.tsx             # صفحة اللعب
│   ├── HomePage.tsx             # الصفحة الرئيسية
│   ├── PageShell.tsx            # الغلاف العام واتجاه اللغة
│   ├── SiteHeader.tsx           # شريط التنقل
│   ├── SiteFooter.tsx           # تذييل الموقع
│   ├── RulesPage.tsx             # صفحة القوانين
│   ├── RulesMarkdown.tsx         # عرض ملفات Markdown
│   └── PrivacyPage.tsx           # صفحة الخصوصية
│
├── content/
│   ├── rules-en.md              # قوانين اللعبة بالإنجليزية
│   ├── rules-ar.md              # قوانين اللعبة بالعربية
│   └── balls.json               # بيانات الكور الوصفية
│
├── lib/
│   └── site.ts                  # اللغات، النصوص، بيانات العوالم، والروابط
│
├── public/game/
│   ├── assets/                  # صور البلوكات، المؤثرات، القوى، والـ UI
│   ├── audio/                   # المؤثرات الصوتية
│   ├── branding/                # الشعار والأيقونات
│   ├── cosmetics/               # أصول التجميل الإضافية
│   ├── showcase/                # صور العرض
│   ├── sprites/
│   │   ├── balls-sprites/       # Sprite Sheets وملفات الكور الـ 60
│   │   └── paddles-sprites/     # Sprite Sheets وبيانات مجموعات البادل
│   ├── world-map/               # صور خريطة العوالم
│   └── worlds/                  # فيديوهات العوالم من 1.mp4 إلى 13.mp4
│
├── next.config.ts               # إعدادات Next.js
├── postcss.config.mjs           # إعداد PostCSS وTailwind
├── tsconfig.json                # إعداد TypeScript
├── package.json                 # السكربتات والاعتمادات
└── pnpm-lock.yaml               # قفل إصدارات الاعتمادات
```

## التقنيات المستخدمة

### واجهة الموقع

- **Next.js 15 App Router:** بناء الصفحات، التخطيط العام، والـ metadata.
- **React 19:** بناء المكونات التفاعلية وإدارة حالة صفحة اللعب.
- **TypeScript:** تعريف الأنواع وتقليل أخطاء بيانات الأصول.
- **Tailwind CSS 4:** بناء الواجهات المتجاوبة بسرعة وبنمط موحد.
- **CSS وHTML Video:** خلفيات متحركة، طبقات شفافة، وتصميم متجاوب.

### محرك اللعب

- **HTML5 Canvas:** رسم الملعب، البلوكات، الكرة، البادل، واجهة المرحلة، والأهداف.
- **`requestAnimationFrame`:** تحديث الحركة والفيزياء بصورة مستمرة.
- **Web Audio:** تشغيل مؤثرات اصطدام البلوك والجدار والقوى والانفجار.
- **Pointer Events:** دعم اللمس والماوس من نفس مسار التحكم.
- **`localStorage`:** حفظ تقدم اللاعب وتجهيزاته المختارة على الجهاز.

### إدارة الأصول

- ملفات JSON تحدد أسماء وإحداثيات إطارات الـ Sprite Sheets.
- قصّ إطارات البادل من الـ Sprite Sheets مع الحفاظ على النسبة الأصلية.
- تحميل ملفات الكور والبادل والفيديو من مجلد `public` لتكون متاحة مباشرة من المتصفح.

## التشغيل محليًا

المتطلبات:

- Node.js إصدار يدعم Next.js 15.
- pnpm.

التثبيت والتشغيل:

```bash
pnpm install
pnpm dev
```

افتح:

```text
http://localhost:3000
```

لتغيير رابط الموقع المستخدم في Open Graph metadata، عرّف المتغير:

```env
NEXT_PUBLIC_SITE_URL=https://example.com
```

## فحص وبناء الإنتاج

```bash
pnpm check
pnpm build
pnpm start
```

إذا ظهرت أخطاء عن chunks مفقودة مثل `Cannot find module './17.js'` أثناء التطوير، أوقف خادم Next.js واحذف مجلد `.next` ثم أعد تشغيله:

```powershell
Remove-Item .next -Recurse -Force
pnpm dev
```

## النشر على Vercel

1. اربط المستودع بمشروع جديد في Vercel.
2. اختر إعدادات Next.js الافتراضية.
3. أضف `NEXT_PUBLIC_SITE_URL` بقيمة رابط الإنتاج.
4. استخدم أمر البناء الافتراضي أو:

```bash
pnpm build
```

لا يحتاج المشروع إلى قاعدة بيانات أو خادم API لتشغيل نسخة اللعب الحالية.

## الخصوصية والتخزين

لا يتضمن المشروع افتراضيًا حسابات أو مدفوعات أو أدوات تتبع أو إعلانات خارجية. يتم حفظ المرحلة المفتوحة والكرة والبادل المختارين داخل `localStorage` في متصفح المستخدم، ويمكن حذفها بمسح بيانات الموقع من إعدادات المتصفح.

## ملاحظات التطوير

نسخة الويب قابلة للعب عبر المراحل الـ90 وتستخدم بنية الحملة والأصول المتوفرة، لكنها لا تدّعي إعادة إنتاج كل ميكانيكيات نسخة Android الأصلية من LibGDX بشكل مطابق 1:1.

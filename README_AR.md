# Brick Breaker Ball Web

[![Read in English](https://img.shields.io/badge/Read_in_English-README.md-2563eb?style=for-the-badge)](README.md)

موقع ثنائي اللغة للعبة **Brick Breaker Ball** على أندرويد بنمط الفولي فقط. يضم معرض العوالم التسعة، وصفحات القوانين والخصوصية، وتجربة فولي مصغّرة، ومحرّر مراحل للإدارة.

النسخة الإنجليزية متاحة في `/en` والنسخة العربية متاحة في `/ar`.

<p dir="ltr">
  <img src="game-pic.png" alt="الصفحة الرئيسية" width="190" />
  <img src="game-pic1.png" alt="صفحة اللعب" width="190" />
  <img src="game-pic2.png" alt="صفحة العوالم" width="190" />
  <img src="game-pic3.png" alt="صفحة التجميلات" width="190" />
</p>

[![Next.js](https://img.shields.io/badge/Next.js-15.5.24-000000?logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.1.1-149eca?logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-3178c6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.1.12-06b6d4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![HTML5 Canvas](https://img.shields.io/badge/Game-HTML5_Canvas-e34f26?logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)
[![pnpm](https://img.shields.io/badge/Package_manager-pnpm-f69220?logo=pnpm&logoColor=white)](https://pnpm.io/)

## نظرة عامة

الموقع مبني باستخدام Next.js App Router، ويعرض محتوى اللعبة وأصولها على الكمبيوتر والتابلت والجوال. تستخدم صفحة اللعب HTML5 Canvas لتجربة مصغّرة لتصويب الفولي وارتداد الكرات واصطدامها بالقراميد.

التجربة المصغّرة ليست تشغيلًا مباشرًا للعبة Android المبنية بمحرك LibGDX. مشروع Android هو مصدر حملة الفولي المكونة من 90 مرحلة، ويستخدم الموقع رسومات العوالم وصور مراحلها.

## المزايا

- واجهة عربية وإنجليزية بمسارات مستقلة.
- 90 مرحلة فولي موزعة على تسعة عوالم، في كل عالم عشر مراحل ومواجهة زعيم.
- رسومات زعماء الفولي وصور اللعب وخلفيات المراحل من مشروع Android.
- تجربة تصويب مصغّرة بالماوس واللمس داخل المتصفح.
- محرّر مراحل الفولي وأداة تقطيع الصور للإدارة.
- صفحات مستقلة للقوانين والخصوصية باللغتين.
- تصميم متجاوب باستخدام Tailwind CSS.

---

<p>
<img src="public/game/volley-Bosses/1.png" alt="زعيم الغابة الغامضة في الفولي" width="190" />
<img src="public/game/volley-Bosses/9.png" alt="زعيم الكسوف الأخير في الفولي" width="190" />
</p>

<p>
<img src="public/game/site/screens/volley-tormented-souls.png" alt="مرحلة من الفولي" width="220" />
</p>

## صفحات الموقع

| المسار | الوصف |
| --- | --- |
| `/` | تحويل تلقائي إلى النسخة الإنجليزية |
| `/en` | الصفحة الرئيسية بالإنجليزية |
| `/en/play` | اللعبة بالإنجليزية |
| `/en/rules` | قوانين اللعبة بالإنجليزية |
| `/en/privacy` | الخصوصية بالإنجليزية |
| `/ar` | الصفحة الرئيسية بالعربية |
| `/ar/play` | اللعبة بالعربية |
| `/ar/rules` | قوانين اللعبة بالعربية |
| `/ar/privacy` | الخصوصية بالعربية |

## هيكل المشروع

```text
BrickBreakerBall-Web/
├── app/                        # المسارات والتخطيط العام
│   ├── en/                     # صفحات النسخة الإنجليزية
│   └── ar/                     # صفحات النسخة العربية
├── components/                # مكونات الموقع واللعبة
│   ├── PlayableVolleyDemo.tsx  # تجربة فولي مصغّرة
│   ├── PlayPage.tsx            # صفحة اللعب
│   ├── HomePage.tsx            # الصفحة الرئيسية
│   ├── PageShell.tsx           # الغلاف العام واتجاه اللغة
│   ├── SiteHeader.tsx          # شريط التنقل
│   ├── SiteFooter.tsx          # التذييل
│   ├── RulesPage.tsx            # صفحة القوانين
│   ├── RulesMarkdown.tsx        # عرض ملفات Markdown
│   └── PrivacyPage.tsx          # صفحة الخصوصية
├── content/                   # القوانين وبيانات الكور
├── lib/site.ts                # النصوص واللغات وبيانات العوالم
├── public/game/               # الصور والأصوات والفيديوهات
│   ├── assets/                # البلوكات والمؤثرات والقوى
│   ├── audio/                 # المؤثرات الصوتية
│   ├── sprites/               # Sprite Sheets وملفات JSON
│   ├── volley-world/          # خلفيات المراحل وأطالس الرسومات
│   ├── volley-Bosses/         # رسومات زعماء العوالم
│   └── site/                  # هوية الموقع ولقطات اللعب
├── package.json               # السكربتات والاعتمادات
└── pnpm-lock.yaml             # إصدارات الاعتمادات المثبتة
```

## التقنيات المستخدمة

- **Next.js 15 App Router:** المسارات والتخطيطات والـ metadata.
- **React 19:** بناء المكونات وإدارة الحالة التفاعلية.
- **TypeScript:** تعريف الأنواع وتقليل أخطاء بيانات الأصول.
- **Tailwind CSS 4:** تصميم الواجهات المتجاوبة.
- **HTML5 Canvas:** رسم الملعب والبلوكات والكرة والبادل وواجهة اللعب.
- **`requestAnimationFrame`:** تشغيل حلقة اللعبة وتحديث الفيزياء.
- **Web Audio:** تشغيل أصوات الاصطدام والقوى والانفجارات.
- **Pointer Events:** دعم الماوس واللمس.
- **`localStorage`:** حفظ المرحلة والتجهيزات المختارة على الجهاز.

## التشغيل محليًا

المتطلبات: Node.js متوافق مع Next.js 15 وpnpm.

```bash
pnpm install
pnpm dev
```

افتح `http://localhost:3000`.

لتحديد رابط الإنتاج المستخدم في Open Graph metadata:

```env
NEXT_PUBLIC_SITE_URL=https://example.com
```

## فحص وبناء الإنتاج

```bash
pnpm check
pnpm build
pnpm start
```

إذا ظهر خطأ عن ملف chunk مفقود مثل `Cannot find module './17.js'`، أوقف خادم Next.js واحذف `.next` ثم أعد التشغيل:

```powershell
Remove-Item .next -Recurse -Force
pnpm dev
```

## النشر

اربط المشروع بمنصة Vercel واستخدم إعدادات Next.js الافتراضية، ثم أضف `NEXT_PUBLIC_SITE_URL` بقيمة رابط الإنتاج. الصفحات العامة ثابتة، بينما يستخدم محرّر الإدارة Firebase لتسجيل الدخول والحفظ السحابي.

## الخصوصية والنطاق

لا تتطلب الصفحات العامة حساب لاعب. يستخدم محرّر الإدارة تسجيل الدخول بحساب Google عبر Firebase، ويمكنه حفظ بيانات المراحل ومساحة تقطيع الصور في قاعدة البيانات المهيأة.

يعرض الموقع مراحل الحملة التسعين ويوفر مساحة لتحريرها. تجربة المتصفح نموذج فولي مصغّر، أما الحملة الكاملة فتعمل داخل تطبيق أندرويد.

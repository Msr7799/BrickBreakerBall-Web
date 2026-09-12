import PageShell from "@/components/PageShell";
import type { Lang } from "@/lib/site";

const sections = {
  en: [
    ["1. Overview", "Brick Breaker Ball includes an Android game and this web edition. Neither version requires an account to play. The project does not ask you to provide your name, email address, phone number or password as part of normal gameplay."],
    ["2. Data stored on your device", "The Android game stores gameplay progress, settings, unlocked cosmetics, inventory, scores and similar game state locally on the device. The web edition stores browser-game progress, unlocked web stages, selected cosmetic and basic preferences in localStorage. Clearing app storage, browser storage or uninstalling the game may remove this local data."],
    ["3. Website data", "This website is designed to work without account creation. The supplied website code does not include third-party analytics, advertising trackers or payment forms by default. Standard hosting infrastructure may still process technical request data such as IP address, user agent and security logs as part of delivering the site."],
    ["4. Advertising in the Android game", "If advertising is enabled in a production Android build, Brick Breaker Ball may use Google Mobile Ads to show rewarded advertisements. Google and its advertising partners may process device identifiers, ad interaction information, approximate location derived from network information, diagnostics and related data according to Google's policies and the consent choices available to you."],
    ["5. In-app purchases", "Android purchases are processed by Google Play. The developer does not receive full payment-card details. The game may receive purchase identifiers, product information, purchase state and transaction information needed to unlock purchased content, prevent duplicate grants and restore eligible purchases."],
    ["6. Permissions", "The Android version may use Internet and network-state access for advertising, billing and platform services. Vibration access is used for optional haptic feedback. The game does not request access to contacts, microphone, camera or precise location as part of its normal feature set."],
    ["7. Third-party services", "The Android version may rely on Google Play Billing and Google Mobile Ads. The website may be hosted by a third-party hosting provider. Those services operate under their own terms and privacy policies."],
    ["8. Children's privacy", "Brick Breaker Ball does not provide a form for users to submit personal information directly to the developer. If the game is distributed to audiences that require additional child-safety or advertising protections, the publisher must configure the store listing and advertising services accordingly."],
    ["9. Retention and choices", "Local game and browser data remains on your device until it is deleted, overwritten, cleared or removed with the app/browser storage. Data processed by external platform providers is retained according to their own policies and your account or consent settings where applicable."],
    ["10. Security", "Reasonable technical measures are used to limit the amount of data handled directly by the game and website. No method of electronic storage or transmission can be guaranteed to be completely secure."],
    ["11. Changes", "This policy may be updated when the game, website, services or legal requirements change. The effective date at the top of this page will be updated when material changes are made."],
    ["12. Contact", "For privacy questions, contact the developer through the project GitHub profile: https://github.com/msr7799"]
  ],
  ar: [
    ["1. نظرة عامة", "تتضمن Brick Breaker Ball لعبة أندرويد ونسخة الويب الموجودة في هذا الموقع. لا تتطلب أي من النسختين إنشاء حساب للعب، ولا يطلب المشروع اسمك أو بريدك الإلكتروني أو رقم هاتفك أو كلمة مرورك ضمن الاستخدام الطبيعي للعبة."],
    ["2. البيانات المحفوظة على جهازك", "تحفظ لعبة أندرويد تقدم اللعب والإعدادات والعناصر التجميلية المفتوحة والمخزون والنتائج وحالة اللعبة محليًا على الجهاز. وتحفظ نسخة الويب تقدم مراحل المتصفح والمرحلة المفتوحة والكرة المختارة وبعض التفضيلات في localStorage. قد يؤدي حذف بيانات التطبيق أو بيانات المتصفح أو إزالة اللعبة إلى حذف هذه البيانات المحلية."],
    ["3. بيانات الموقع", "صُمم الموقع ليعمل من دون إنشاء حساب. الكود المرفق للموقع لا يحتوي افتراضيًا على تحليلات خارجية أو متتبعات إعلانية أو نماذج دفع. ومع ذلك قد تقوم منصة الاستضافة بمعالجة بيانات تقنية مثل عنوان IP ونوع المتصفح وسجلات الأمان كجزء من تقديم الموقع وحمايته."],
    ["4. الإعلانات في لعبة أندرويد", "إذا تم تفعيل الإعلانات في نسخة أندرويد الإنتاجية، فقد تستخدم Brick Breaker Ball خدمة Google Mobile Ads لعرض إعلانات مكافآت. قد تعالج Google وشركاؤها معرّفات الجهاز وتفاعلات الإعلانات والموقع التقريبي المستنتج من الشبكة وبيانات التشخيص وفق سياسات Google وخيارات الموافقة المتاحة لك."],
    ["5. المشتريات داخل اللعبة", "تعالج Google Play عمليات الشراء في نسخة أندرويد. لا يحصل المطور على بيانات البطاقة كاملة. قد تستقبل اللعبة معرّفات الشراء ومعلومات المنتج وحالة العملية وبيانات المعاملة اللازمة لفتح المحتوى ومنع منح نفس العملية مرتين واستعادة المشتريات المؤهلة."],
    ["6. الصلاحيات", "قد تستخدم نسخة أندرويد الإنترنت وحالة الشبكة للإعلانات والفوترة وخدمات المنصة. ويُستخدم الاهتزاز للتغذية اللمسية الاختيارية. لا تطلب اللعبة الوصول إلى جهات الاتصال أو الميكروفون أو الكاميرا أو الموقع الدقيق ضمن وظائفها الطبيعية."],
    ["7. خدمات الأطراف الثالثة", "قد تعتمد نسخة أندرويد على Google Play Billing وGoogle Mobile Ads، وقد يُستضاف الموقع لدى مزود استضافة خارجي. تعمل هذه الخدمات وفق شروطها وسياسات الخصوصية الخاصة بها."],
    ["8. خصوصية الأطفال", "لا توفر Brick Breaker Ball نموذجًا يطلب من المستخدم إرسال معلومات شخصية مباشرة إلى المطور. وإذا تم توزيع اللعبة على فئات عمرية تتطلب حماية إضافية للأطفال أو قيودًا إعلانية، فيجب على الناشر ضبط متجر التطبيق وخدمات الإعلان بما يتوافق مع تلك المتطلبات."],
    ["9. الاحتفاظ بالبيانات وخياراتك", "تبقى بيانات اللعبة والمتصفح المحلية على جهازك إلى أن تُحذف أو تُستبدل أو يتم مسح التخزين. أما البيانات التي تعالجها خدمات المنصات الخارجية فتخضع لفترات الاحتفاظ وسياسات تلك الجهات وإعدادات حسابك أو موافقتك عند انطباقها."],
    ["10. الأمان", "تُستخدم إجراءات تقنية معقولة لتقليل كمية البيانات التي يعالجها الموقع واللعبة مباشرة، لكن لا توجد وسيلة تخزين أو نقل إلكتروني يمكن ضمان أمانها الكامل."],
    ["11. التعديلات", "قد يتم تحديث هذه السياسة عند تغيير اللعبة أو الموقع أو الخدمات أو المتطلبات القانونية، وسيتم تحديث تاريخ السريان عند إجراء تغييرات جوهرية."],
    ["12. التواصل", "للاستفسارات المتعلقة بالخصوصية، يمكن التواصل مع المطور عبر حساب المشروع على GitHub: https://github.com/msr7799"]
  ]
} as const;

export default function PrivacyPage({ lang }: { lang: Lang }) {
  const ar = lang === "ar";
  return (
    <PageShell lang={lang}>
      <main className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-10">
          <p className="text-xs font-black tracking-[.2em] text-orange-300">LEGAL</p>
          <h1 className="mt-3 text-4xl font-black tracking-tight text-white sm:text-6xl">{ar ? "سياسة الخصوصية" : "Privacy Policy"}</h1>
          <p className="mt-4 text-sm text-white/45">{ar ? "تاريخ السريان: 12 سبتمبر 2026" : "Effective date: September 12, 2026"}</p>
        </div>
        <div className="space-y-4">
          {sections[lang].map(([title, body]) => (
            <section key={title} className="glass rounded-3xl p-6 sm:p-8">
              <h2 className="text-xl font-black text-white">{title}</h2>
              <p className="mt-3 whitespace-pre-line text-[15px] leading-8 text-white/60">{body}</p>
            </section>
          ))}
        </div>
      </main>
    </PageShell>
  );
}

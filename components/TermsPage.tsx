import Link from "next/link";
import PageShell from "@/components/PageShell";
import { GITHUB_URL, GOOGLE_PLAY_URL, type Lang } from "@/lib/site";

type Section = { title: string; paragraphs: string[] };
type Terms = {
  kicker: string; title: string; intro: string; effective: string;
  sections: Section[]; links: string; privacy: string; purchases: string;
  refunds: string; play: string; contact: string; note: string;
};

const terms: Record<Lang, Terms> = {
  en: {
    kicker: "LEGAL · FORGE PULSE GAMES",
    title: "Terms of Service",
    intro: "Please read these terms before using the Brick Breaker Ball Android game or its companion website. These terms describe your responsibilities, digital purchases, advertising, and important limitations.",
    effective: "Effective date: November 8, 2026",
    sections: [
      { title: "1. The service and acceptance", paragraphs: [
        "Brick Breaker Ball is a game published under the Forge Pulse Games brand. These terms apply to the Android game and to the informational website at bricks-breaker-ball.vercel.app, including the browser gameplay preview and stage editor.",
        "By accessing or using the game or website, you agree to these terms. If you do not agree, please do not use the service."
      ] },
      { title: "2. Age and permitted use", paragraphs: [
        "Use the game lawfully, follow any applicable age rating, and obtain parent or guardian authorization where required. You may not exploit bugs, interfere with the services, infringe others' rights, or use the website editor to distribute unlawful or infringing material."
      ] },
      { title: "3. Gameplay and local progress", paragraphs: [
        "The Android game may keep progress, scores, inventory, unlocks, cosmetic selections and settings locally on your device. Clearing storage, uninstalling the app or changing devices may permanently remove progress where no compatible restore method exists. Keep this in mind before deleting app data.",
        "The website's playable Volley demo is a limited browser preview and is not the full Android campaign. The public stage editor may store work in your browser and allow local exports; do not assume that a draft is saved on our servers."
      ] },
      { title: "4. Digital items and Google Play purchases", paragraphs: [
        "The Android game may offer optional digital items, upgrades or other in-app purchases. Each item's description, price, currency, taxes and applicable terms are shown before purchase through Google Play. Google Play processes payments; the website does not take game purchase payments.",
        "Virtual items are licensed for use within the game and do not represent cash, physical property or transferable assets. Consumable items may be exhausted by use. Restoration of eligible purchases depends on the item type, your Google Play account, purchase verification and platform rules. Do not assume that every item can be transferred or restored."
      ] },
      { title: "5. Refunds and purchase support", paragraphs: [
        "Google Play purchases and refund requests are subject to the applicable Google Play policies and consumer law. Where relevant, request a refund or review purchase history through Google Play. Contact the developer if purchased content is not delivered or recognized.",
        "Nothing in these terms removes mandatory statutory refund, warranty or consumer-protection rights."
      ] },
      { title: "6. Advertising and rewards", paragraphs: [
        "The game may show optional rewarded ads when available; the website may show advertising. Availability and rewards can vary by network connection, region, inventory and game version. Third-party advertising providers may have their own terms and privacy policies. See our Privacy Policy for information about data and consent choices."
      ] },
      { title: "7. Website editor and your submissions", paragraphs: [
        "You are responsible for having the necessary rights to images, names and level designs that you create, import or share using the editor. You retain rights in your original contributions. The editor's locally stored data can be lost when browser storage is cleared. Do not include private information in exported or publicly shared designs."
      ] },
      { title: "8. Intellectual property and game license", paragraphs: [
        "The game, site, artwork, music, branding, and original software are protected by applicable intellectual-property laws and belong to their respective rights holders. You receive a personal, limited, revocable, non-exclusive, non-transferable license to use the game and site for lawful personal entertainment. This license does not permit unauthorized copying, commercial redistribution or sale of assets."
      ] },
      { title: "9. Privacy and third-party platforms", paragraphs: [
        "The game and website may use services provided by Google Play, advertising providers, the hosting platform and other third parties as described in our Privacy Policy. Their services may be governed by separate terms. The website's public pages do not require you to create an account."
      ] },
      { title: "10. Updates, availability and suspension", paragraphs: [
        "We may update gameplay, adjust features, fix defects or temporarily interrupt services for security, maintenance or legal reasons. Online functions, advertising and third-party purchases may not always be available. We may restrict misuse where permitted by law and will seek to provide appropriate notice of material changes."
      ] },
      { title: "11. Limitations and governing law", paragraphs: [
        "We aim to provide a reliable game, but no digital service can be guaranteed to work without interruptions or defects. Any limits on liability apply only to the extent allowed by applicable law and do not exclude rights or remedies that cannot legally be waived.",
        "These terms are governed by the laws of the Kingdom of Bahrain, subject to mandatory consumer protections and jurisdiction rules that may apply in your country."
      ] },
      { title: "12. Contact and changes to these terms", paragraphs: [
        "For questions about these terms, purchases or support, contact the developer using the GitHub link below. We may revise these terms when the game or applicable requirements change and will update the effective date for material revisions."
      ] }
    ],
    links: "Useful links", privacy: "Privacy Policy", purchases: "Manage Google Play purchases",
    refunds: "Google Play refunds", play: "Game on Google Play", contact: "Developer contact",
    note: "These terms are intended to describe the game and website. Mandatory consumer rights always take precedence where applicable."
  },
  ar: {
    kicker: "معلومات قانونية · FORGE PULSE GAMES",
    title: "شروط وأحكام الاستخدام",
    intro: "يُرجى قراءة هذه الشروط قبل استخدام لعبة Brick Breaker Ball على أندرويد أو موقعها التعريفي. وهي توضّح مسؤوليات المستخدم والمشتريات الرقمية والإعلانات وحدود الخدمة.",
    effective: "تاريخ السريان: 8 نوفمبر 2026",
    sections: [
      { title: "1. الخدمة والموافقة", paragraphs: [
        "Brick Breaker Ball لعبة تُنشر تحت علامة Forge Pulse Games. تشمل هذه الشروط لعبة أندرويد وموقعها التعريفي bricks-breaker-ball.vercel.app، بما فيه تجربة اللعب في المتصفح ومحرّر المراحل.",
        "باستخدام اللعبة أو الموقع فإنك توافق على هذه الشروط. إذا لم توافق عليها، يُرجى عدم استخدام الخدمة."
      ] },
      { title: "2. العمر والاستخدام المشروع", paragraphs: [
        "يجب استخدام اللعبة بصورة قانونية والالتزام بالتصنيف العمري والحصول على موافقة ولي الأمر عند الحاجة. يُحظر استغلال الثغرات أو تعطيل الخدمة أو التعدي على حقوق الآخرين أو استخدام المحرّر لنشر محتوى غير قانوني أو مخالف للحقوق."
      ] },
      { title: "3. اللعب والتقدم المحفوظ محلياً", paragraphs: [
        "قد تحتفظ لعبة أندرويد بتقدم المراحل والنتائج والمخزون والعناصر المفتوحة والمظاهر والإعدادات محلياً على جهازك. يمكن أن يؤدي حذف بيانات التطبيق أو إزالته أو تغيير الجهاز إلى فقدان التقدم نهائياً إذا لم تتوفر وسيلة استعادة متوافقة.",
        "تجربة Volley على الموقع نسخة محدودة للمتصفح وليست الحملة الكاملة لأندرويد. وقد يحتفظ محرر المراحل بعملك في المتصفح مع إمكانية تصديره محلياً؛ لا تفترض أن المسودات محفوظة على خوادمنا."
      ] },
      { title: "4. المشتريات الرقمية عبر Google Play", paragraphs: [
        "قد تتيح اللعبة شراء عناصر رقمية أو ترقيات اختيارية داخل التطبيق. تظهر تفاصيل المنتج والسعر والعملة والضرائب والشروط السارية قبل إتمام الشراء في Google Play. تعالج Google Play المدفوعات ولا يتولى الموقع تحصيل ثمن مشتريات اللعبة.",
        "العناصر الافتراضية مخصصة للاستخدام داخل اللعبة وليست أموالاً أو ممتلكات مادية قابلة للتحويل. وقد تُستهلك بعض العناصر عند استخدامها. تعتمد استعادة المشتريات المؤهلة على نوع العنصر وحساب Google Play والتحقق من الشراء وقواعد المنصة، ولا يمكن افتراض إمكانية نقل أو استعادة جميع العناصر."
      ] },
      { title: "5. الاسترداد ودعم المشتريات", paragraphs: [
        "تخضع عمليات الشراء وطلبات استرداد الأموال لسياسات Google Play المعمول بها وقوانين حماية المستهلك السارية. يمكن مراجعة المشتريات أو طلب الاسترداد من Google Play، والتواصل مع المطور إذا لم يصل المحتوى المدفوع أو لم يُعترف بالشراء.",
        "لا تُسقط هذه الشروط أي حقوق نظامية إلزامية للمستهلك في الاسترداد أو الضمان أو التعويض."
      ] },
      { title: "6. الإعلانات والمكافآت", paragraphs: [
        "قد تعرض اللعبة إعلانات اختيارية مقابل مكافآت عند توافرها، وقد يعرض الموقع إعلانات. يتغير توافر الإعلان والمكافأة حسب الاتصال والمنطقة ومخزون الإعلانات وإصدار اللعبة. تخضع الخدمات الإعلانية الخارجية لشروطها وسياساتها. راجع سياسة الخصوصية لمعرفة معالجة البيانات وخيارات الموافقة."
      ] },
      { title: "7. محرر المراحل ومحتوى المستخدم", paragraphs: [
        "تتحمل مسؤولية امتلاك الحقوق اللازمة للصور والأسماء وتصاميم المراحل التي تنشئها أو تستوردها أو تشاركها من خلال المحرر. تحتفظ بحقوق مساهماتك الأصلية. قد تفقد البيانات المخزنة محلياً إذا حذفت تخزين المتصفح. لا تُضمّن بيانات شخصية في التصاميم التي تصدّرها أو تنشرها."
      ] },
      { title: "8. الملكية الفكرية وترخيص الاستخدام", paragraphs: [
        "البرمجيات والرسومات والأصوات والعلامات التجارية والمحتوى الأصلي للعبة والموقع محمية بالقوانين وتعود حقوقها لأصحابها. يُمنح المستخدم ترخيصاً شخصياً محدوداً وقابلاً للإلغاء وغير حصري وغير قابل للنقل للاستعمال الترفيهي المشروع، دون حق نسخ الأصول أو إعادة توزيعها أو بيعها تجارياً دون إذن."
      ] },
      { title: "9. الخصوصية والخدمات الخارجية", paragraphs: [
        "قد تستخدم اللعبة والموقع خدمات Google Play والإعلانات والاستضافة وأطرافاً خارجية أخرى وفق سياسة الخصوصية، وقد تسري عليها شروط مستقلة. لا يلزم إنشاء حساب لتصفح الصفحات العامة في الموقع."
      ] },
      { title: "10. التحديثات والتوافر وإيقاف إساءة الاستخدام", paragraphs: [
        "قد نحدّث اللعبة أو نعدّل المزايا أو نعالج الأخطاء أو نوقف بعض الخدمات مؤقتاً لأسباب أمنية أو تقنية أو قانونية. وقد لا تتوفر الوظائف المتصلة بالإنترنت أو الإعلانات والمشتريات في جميع الأوقات. يجوز الحد من إساءة الاستخدام بما يسمح به القانون، مع السعي للإشعار المناسب بالتغييرات الجوهرية."
      ] },
      { title: "11. المسؤولية والقانون الواجب التطبيق", paragraphs: [
        "نسعى لتقديم لعبة مستقرة، لكن لا يمكن ضمان خلو أي خدمة رقمية من الأعطال أو الانقطاع. لا تسري أي حدود للمسؤولية إلا في الحدود التي يجيزها القانون، ولا تلغي الحقوق أو سبل الانتصاف التي لا يجوز التنازل عنها.",
        "تخضع الشروط لقوانين مملكة البحرين، مع مراعاة أحكام حماية المستهلك والاختصاص القضائي الإلزامية التي قد تُطبق في بلد المستخدم."
      ] },
      { title: "12. التواصل وتعديل الشروط", paragraphs: [
        "لأي سؤال عن الشروط أو المشتريات أو الدعم، تواصل مع المطور عبر رابط GitHub أدناه. قد نحدّث الشروط عند تغيير اللعبة أو المتطلبات القانونية، وسنحدث تاريخ السريان عند إجراء تعديلات جوهرية."
      ] }
    ],
    links: "روابط مفيدة", privacy: "سياسة الخصوصية", purchases: "إدارة مشتريات Google Play",
    refunds: "استرداد الأموال عبر Google Play", play: "اللعبة على Google Play", contact: "التواصل مع المطور",
    note: "توضح هذه الشروط طريقة استخدام اللعبة والموقع، مع بقاء حقوق المستهلك الإلزامية محفوظة وفق القوانين الواجبة التطبيق."
  }
};

export default function TermsPage({ lang }: { lang: Lang }) {
  const t = terms[lang];
  return (
    <PageShell lang={lang}>
      <main className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-10">
          <p className="text-xs font-black tracking-[.2em] text-orange-300">{t.kicker}</p>
          <h1 className="mt-3 text-4xl font-black tracking-tight text-white sm:text-6xl">{t.title}</h1>
          <p className="mt-5 max-w-3xl text-base leading-8 text-white/70">{t.intro}</p>
          <p className="mt-4 text-sm text-white/50">{t.effective}</p>
        </div>
        <div className="space-y-4">
          {t.sections.map(section => (
            <section key={section.title} className="glass rounded-3xl p-6 sm:p-8">
              <h2 className="text-xl font-black text-white">{section.title}</h2>
              {section.paragraphs.map(p => <p key={p} className="mt-3 text-[15px] leading-8 text-white/70">{p}</p>)}
            </section>
          ))}
          <section className="glass rounded-3xl p-6 sm:p-8">
            <h2 className="text-xl font-black text-white">{t.links}</h2>
            <ul className="mt-4 grid gap-3 text-[15px] text-orange-200 underline underline-offset-4">
              <li><Link href={`/${lang}/privacy`}>{t.privacy}</Link></li>
              <li><a href="https://play.google.com/store/account" rel="noopener noreferrer" target="_blank">{t.purchases}</a></li>
              <li><a href="https://support.google.com/googleplay/answer/2479637" rel="noopener noreferrer" target="_blank">{t.refunds}</a></li>
              <li><a href={GOOGLE_PLAY_URL} rel="noopener noreferrer" target="_blank">{t.play}</a></li>
              <li><a href={GITHUB_URL} rel="noopener noreferrer" target="_blank">{t.contact}</a></li>
            </ul>
            <p className="mt-6 text-sm leading-7 text-white/55">{t.note}</p>
          </section>
        </div>
      </main>
    </PageShell>
  );
}

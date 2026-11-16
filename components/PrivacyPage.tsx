import PageShell from "@/components/PageShell";
import type { Lang } from "@/lib/site";

// Keep the English copy in sync with the Android bundled
// app/src/main/assets/privacy/privacy_policy.txt policy.
const sections = {
  en: [
    ["1. Overview", "Brick Breaker Ball is an Android game published by Forge Pulse Games. You can play offline without creating an account. Connecting Google Play Games / Firebase Authentication is optional for ordinary gameplay but is needed for account-linked cloud progress and server-verified daily rewards. The game does not ask you to type your name, email address, phone number or password to play. When you connect an account, the service processes a verified Firebase user ID to associate cloud records with your game account."],
    ["2. Data stored on your device", "The game stores progress, settings, scores, unlocked balls and cosmetics, inventory, virtual currency balances and related game state locally on your device. Android automatic app backup is disabled. Clearing app storage or uninstalling the game removes this local data, but does not by itself erase any account-linked cloud records."],
    ["3. Firebase account, MongoDB cloud saves and daily rewards", "When you sign in, Firebase Authentication identifies your game account. Our Vercel backend verifies your Firebase ID token and uses your Firebase user ID to find game records in MongoDB. MongoDB may store campaign progress, stars, scores, ball selections, cosmetics, orbs, items, settings, balances, purchase or reward receipt markers, and daily reward dates, streaks and claimed rewards. A previous progress checkpoint may be retained for recovery. Authentication tokens are verified but are not stored in progress checkpoints or the daily reward database. This is our own cloud backup service, not Google Play Games Saved Games. Reconnecting the same account after reinstalling may restore the last successfully synchronized checkpoint; changes not yet synchronized may be lost. The website Stage Lab does not store Android account progress."],
    ["4. Website data and advertising", "Our website does not require registration or payment forms. Its pages may request Google AdSense advertisements, subject to account approval and ad availability. Google and advertising partners may use cookies or similar technologies and process browser and device information, IP address and ad interactions to deliver and measure ads, subject to applicable consent choices. Our hosting provider may process technical request data such as IP addresses, user agents and security logs."],
    ["5. Advertising in the Android game", "When enabled in the production Android build, Google AdMob (Google Mobile Ads SDK) provides optional rewarded advertisements. Google and its advertising partners may process advertising identifiers, ad interactions, approximate location inferred from network data, and diagnostic information as described in Google's policies. Where applicable, Google's User Messaging Platform presents consent choices and the game provides an Ad Privacy option when required. Ad availability depends on the advertising service and account status."],
    ["6. In-app purchases", "Google Play processes Android in-app purchases. We do not receive full payment-card details. The game may process purchase tokens, product identifiers, transaction state and receipt markers to unlock content, prevent duplicate grants and restore eligible purchases. Google Play retains payment and transaction records under its own policies."],
    ["7. Permissions", "The Android game uses Internet and network-state access for account services, cloud saves, advertising and Google Play Billing. Vibration is used for optional haptic feedback. The game does not request access to contacts, microphone, camera or precise device location as part of ordinary gameplay."],
    ["8. Third-party services", "The Android game may use Google Play Games Services, Firebase Authentication, Google Analytics for Firebase, Firebase Crashlytics, Google Play Billing and Google AdMob. The website uses Vercel hosting and may use Google AdSense; our account services store game records in MongoDB. Third-party providers handle their own information under their policies. Google privacy policy: https://policies.google.com/privacy . Google advertising: https://policies.google.com/technologies/ads . Firebase privacy and security: https://firebase.google.com/support/privacy ."],
    ["9. Children's privacy", "Brick Breaker Ball is not directed to children under age 13. Age-of-consent requirements and additional protections for younger users vary by country. The game does not provide a form for users to submit personal information directly to the developer. Advertising, consent and store settings must follow applicable child and teen privacy requirements."],
    ["10. Retention and requests to delete cloud data", "Local data remains until you clear it or uninstall the game. Game-managed MongoDB cloud checkpoints (including any retained previous checkpoint) and daily reward records can remain linked to your Firebase user ID after uninstalling or signing out.\n\nTo request deletion of your game-managed cloud data, email alromaihi2224@gmail.com with the subject \"Brick Breaker Ball - Cloud Data Deletion Request\". State that you want your game cloud records deleted and include non-sensitive details that help us locate your connected game account. We may ask you to verify that the account is yours through an appropriate secure method. Never send passwords, authentication tokens or full payment details.\n\nAfter ownership is verified, we will review and process deletion of the game-managed MongoDB progress checkpoints, daily reward history and other game account records linked to that Firebase user ID, and the associated Firebase Authentication user record where applicable, subject to legal or security retention requirements. We will contact you about the outcome. This is a manual support-request process; the game does not currently provide an automatic cloud-data deletion button. Deleting the app does not automatically delete cloud data. Records held independently by Google Play, Google or other providers are governed by their policies and may require separate requests."],
    ["11. Your choices, security and changes", "You may manage advertising preferences through your device and any in-app consent options available in your region. We use reasonable safeguards, including HTTPS connections and server-side identity verification, to help protect data we handle. No transmission or storage method can be guaranteed completely secure. We may revise this policy when the game, website or legal requirements change, and will update its effective date for material changes."],
    ["12. Contact", "For privacy questions, requests to access or delete game-managed cloud data, or concerns about your account, contact Forge Pulse Games at alromaihi2224@gmail.com. This is the support email listed on our Google Play store page. Developer GitHub: https://github.com/msr7799 ."]
  ]
} as const;

const policyLinks = [
  { title: "Google Privacy", url: "https://policies.google.com/privacy" },
  { title: "Google Advertising", url: "https://policies.google.com/technologies/ads" },
  { title: "Firebase Privacy", url: "https://firebase.google.com/support/privacy" },
];

export default function PrivacyPage({ lang }: { lang: Lang }) {
  return (
    <PageShell lang={lang}>
      <main className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-10">
          <p className="text-xs font-black tracking-[.2em] text-orange-300">LEGAL</p>
          <h1 className="mt-3 text-4xl font-black tracking-tight text-white sm:text-6xl">Privacy Policy</h1>
          <p className="mt-4 text-sm text-white/45">Effective date: November 16, 2026</p>
        </div>
        <div className="space-y-4">
          {sections.en.map(([title, body], index) => (
            <section key={title} className="glass rounded-3xl p-6 sm:p-8">
              <h2 className="text-xl font-black text-white">{title}</h2>
              <p className="mt-3 whitespace-pre-line text-[15px] leading-8 text-white/60">{body}</p>
              {index === 7 && (
                <div className="mt-4 flex flex-wrap gap-4 text-sm text-orange-300">
                  {policyLinks.map(link => (
                    <a key={link.url} href={link.url} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4 hover:text-white">{link.title}</a>
                  ))}
                </div>
              )}
              {index === 11 && (
                <a href="mailto:alromaihi2224@gmail.com" className="mt-4 inline-block text-orange-300 underline underline-offset-4 hover:text-white">alromaihi2224@gmail.com</a>
              )}
            </section>
          ))}
        </div>
      </main>
    </PageShell>
  );
}

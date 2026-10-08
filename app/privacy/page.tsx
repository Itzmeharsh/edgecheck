import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function PrivacyPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const backHref = user ? "/dashboard" : "/";
  const backLabel = user ? "Back to Dashboard" : "Back to EdgeCheck";

  return (
    <main className="min-h-screen bg-[#F7FBFD] text-[#173944]">
      {/* Header */}
      <header className="border-b border-[#E5F0F5] bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5 lg:px-8">
          <Link href={backHref} className="flex items-center gap-3">
            <div className="font-bold text-xl text-[#102A43]">
              Edge<span className="text-[#1597D4]">Check</span>
            </div>
          </Link>

          <Link
            href={backHref}
            className="text-sm font-medium text-[#78919A] transition-colors hover:text-[#1597D4]"
          >
            {backLabel}
          </Link>
        </div>
      </header>

      {/* Content */}
      <section className="mx-auto max-w-4xl px-6 py-14 lg:px-8 lg:py-20">
        <div className="mb-12">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-[#1597D4]">
            Privacy
          </p>

          <h1 className="text-4xl font-bold tracking-tight text-[#102A43] sm:text-5xl">
            Privacy Policy
          </h1>

          <p className="mt-4 text-sm text-[#78919A]">
            Last updated: October 8, 2026
          </p>

          <p className="mt-6 max-w-3xl text-base leading-7 text-[#58717B]">
            This Privacy Policy explains how EdgeCheck collects, uses, stores,
            and protects information when you use the EdgeCheck website and
            application.
          </p>
        </div>

        <div className="space-y-12 text-[15px] leading-7 text-[#4F6872]">
          {/* 1 */}
          <section>
            <h2 className="mb-4 text-2xl font-bold text-[#173944]">
              1. Information We Collect
            </h2>

            <p>
              When you use EdgeCheck, we may collect information that you
              provide directly, information generated through your use of the
              service, and technical information required to operate and
              secure the application.
            </p>

            <p className="mt-4">
              Depending on how you use EdgeCheck, this may include:
            </p>

            <ul className="mt-4 list-disc space-y-2 pl-6">
              <li>Account and authentication information.</li>
              <li>Your name and profile information.</li>
              <li>Trading strategies and strategy descriptions you create.</li>
              <li>Structured strategy rules generated from your input.</li>
              <li>Market-analysis results and analysis history.</li>
              <li>Chart and analysis information submitted through the application.</li>
              <li>Your selected AI provider.</li>
              <li>Encrypted AI provider API-key data when you choose to use BYOK.</li>
              <li>Usage information such as analysis usage limits.</li>
              <li>
                Technical information required for security, debugging, and
                service operation.
              </li>
            </ul>
          </section>

          {/* 2 */}
          <section>
            <h2 className="mb-4 text-2xl font-bold text-[#173944]">
              2. Account Information
            </h2>

            <p>
              EdgeCheck uses Supabase authentication to manage user accounts
              and authentication sessions. Depending on the authentication
              method you use, authentication-related information may be
              processed by Supabase and the authentication provider involved.
            </p>

            <p className="mt-4">
              Your EdgeCheck account may be associated with a profile containing
              information such as your name, account identifier, subscription
              plan, and selected AI provider.
            </p>
          </section>

          {/* 3 */}
          <section>
            <h2 className="mb-4 text-2xl font-bold text-[#173944]">
              3. Strategies and Analysis Data
            </h2>

            <p>
              EdgeCheck allows you to create and save trading strategies. This
              information may include the strategy name, description, and
              structured rules derived from your strategy description.
            </p>

            <p className="mt-4">
              When you run an analysis, EdgeCheck may store information such as
              the selected strategy, timeframe, analysis result, matched
              conditions, missing conditions, important market levels, and an
              AI-generated analysis summary.
            </p>

            <p className="mt-4">
              This information is used to provide and improve the functionality
              of the EdgeCheck service.
            </p>
          </section>

          {/* 4 */}
          <section>
            <h2 className="mb-4 text-2xl font-bold text-[#173944]">
              4. AI Providers and API Keys
            </h2>

            <p>
              EdgeCheck supports AI-powered analysis through supported AI
              providers. The current application supports Google Gemini and
              OpenAI.
            </p>

            <p className="mt-4">
              EdgeCheck also supports a Bring Your Own Key (BYOK) model. If you
              choose to provide your own AI provider API key, EdgeCheck stores
              the key in encrypted form rather than storing the API key as
              plaintext.
            </p>

            <p className="mt-4">
              API keys are encrypted server-side using AES-256-GCM encryption.
              The encryption key used by EdgeCheck is maintained as a server-side
              environment secret and is not intended to be exposed to the
              browser.
            </p>

            <p className="mt-4">
              When your selected AI provider requires the key for an analysis,
              EdgeCheck decrypts the stored value server-side for the relevant
              server-side operation.
            </p>

            <p className="mt-4">
              You should only provide API keys that you are authorized to use.
              You are responsible for the API key and the applicable terms,
              limits, and charges imposed by the relevant AI provider.
            </p>
          </section>

          {/* 5 */}
          <section>
            <h2 className="mb-4 text-2xl font-bold text-[#173944]">
              5. Market Data
            </h2>

            <p>
              EdgeCheck uses market data provided through supported market-data
              services, currently including Upstox, to obtain market information
              used for analysis and charting.
            </p>

            <p className="mt-4">
              EdgeCheck uses real market data as the source of truth for market
              conditions. AI-generated analysis is based on market information
              and strategy conditions and is not intended to replace the
              underlying market-data source.
            </p>
          </section>

          {/* 6 */}
          <section>
            <h2 className="mb-4 text-2xl font-bold text-[#173944]">
              6. How We Use Information
            </h2>

            <p>
              We may use information collected through EdgeCheck to:
            </p>

            <ul className="mt-4 list-disc space-y-2 pl-6">
              <li>Provide and operate the EdgeCheck service.</li>
              <li>Create and manage user accounts.</li>
              <li>Save and display your strategies.</li>
              <li>Perform requested market and strategy analyses.</li>
              <li>Apply free and premium usage limits.</li>
              <li>Store and display analysis history.</li>
              <li>Maintain and secure the application.</li>
              <li>
                Detect, investigate, and prevent abuse or unauthorized access.
              </li>
              <li>
                Debug technical problems and improve service reliability.
              </li>
              <li>Communicate with you about the service when necessary.</li>
            </ul>
          </section>

          {/* 7 */}
          <section>
            <h2 className="mb-4 text-2xl font-bold text-[#173944]">
              7. Data Storage and Security
            </h2>

            <p>
              EdgeCheck uses Supabase and PostgreSQL infrastructure to store
              application data. User-specific database access is protected using
              authentication and Row Level Security (RLS) policies designed to
              restrict access to authorized user data.
            </p>

            <p className="mt-4">
              Security measures include authentication controls, database access
              policies, encrypted storage of user-provided AI API keys, and
              server-side handling of sensitive credentials.
            </p>

            <p className="mt-4">
              However, no online service or method of electronic storage can be
              guaranteed to be completely secure. You should use appropriate
              precautions when accessing EdgeCheck and when providing information
              to any online service.
            </p>
          </section>

          {/* 8 */}
          <section>
            <h2 className="mb-4 text-2xl font-bold text-[#173944]">
              8. Third-Party Services
            </h2>

            <p>
              EdgeCheck relies on third-party services to provide certain parts
              of the application. These may include:
            </p>

            <ul className="mt-4 list-disc space-y-2 pl-6">
              <li>Supabase for authentication and database infrastructure.</li>
              <li>Upstox for market-data services.</li>
              <li>Google Gemini for AI analysis when Gemini is selected.</li>
              <li>OpenAI for AI analysis when OpenAI is selected.</li>
              <li>Vercel for application hosting and deployment.</li>
            </ul>

            <p className="mt-4">
              These providers may process information according to their own
              privacy policies and terms. Their handling of information is
              governed by the terms and policies applicable to their services.
            </p>
          </section>

          {/* 9 */}
          <section>
            <h2 className="mb-4 text-2xl font-bold text-[#173944]">
              9. AI Processing
            </h2>

            <p>
              When you request an AI-powered analysis, information necessary to
              perform that analysis may be sent to the AI provider selected in
              your EdgeCheck account.
            </p>

            <p className="mt-4">
              This may include your strategy rules, relevant market information,
              and visual/chart context required for the requested analysis.
            </p>

            <p className="mt-4">
              The handling of information by the selected AI provider is also
              subject to that provider's applicable terms and privacy policies.
            </p>
          </section>

          {/* 10 */}
          <section>
            <h2 className="mb-4 text-2xl font-bold text-[#173944]">
              10. Cookies and Sessions
            </h2>

            <p>
              EdgeCheck may use cookies or similar browser storage mechanisms
              required for authentication sessions, security, and normal
              application functionality.
            </p>

            <p className="mt-4">
              These mechanisms may be necessary for keeping you signed in and
              maintaining a secure application session.
            </p>
          </section>

          {/* 11 */}
          <section>
            <h2 className="mb-4 text-2xl font-bold text-[#173944]">
              11. Data Retention and Deletion
            </h2>

            <p>
              EdgeCheck retains account, strategy, analysis, and related
              information for as long as reasonably necessary to provide the
              service, maintain account functionality, comply with applicable
              obligations, and protect the service.
            </p>

            <p className="mt-4">
              If you want to request deletion of your EdgeCheck account or
              personal information, contact us at:
            </p>

            <p className="mt-4">
              <a
                href="mailto:harshbroyt@gmail.com"
                className="font-semibold text-[#1597D4] hover:underline"
              >
                harshbroyt@gmail.com
              </a>
            </p>

            <p className="mt-4">
              Some information may need to be retained where required for
              legitimate operational, security, legal, or accounting purposes.
            </p>
          </section>

          {/* 12 */}
          <section>
            <h2 className="mb-4 text-2xl font-bold text-[#173944]">
              12. Your Responsibilities
            </h2>

            <p>
              You are responsible for maintaining the security of your account
              credentials and any API keys you choose to connect to EdgeCheck.
            </p>

            <p className="mt-4">
              You should not provide credentials, API keys, or other information
              that you are not authorized to use or disclose.
            </p>
          </section>

          {/* 13 */}
          <section>
            <h2 className="mb-4 text-2xl font-bold text-[#173944]">
              13. Children's Privacy
            </h2>

            <p>
              EdgeCheck is not intended to knowingly collect personal information
              from children. If you believe that a child has provided personal
              information to EdgeCheck, please contact us so that the situation
              can be reviewed.
            </p>
          </section>

          {/* 14 */}
          <section>
            <h2 className="mb-4 text-2xl font-bold text-[#173944]">
              14. Changes to This Privacy Policy
            </h2>

            <p>
              We may update this Privacy Policy from time to time to reflect
              changes to EdgeCheck, our practices, technology, or applicable
              requirements.
            </p>

            <p className="mt-4">
              When changes are made, the updated version will be posted on this
              page and the "Last updated" date will be changed accordingly.
            </p>
          </section>

          {/* 15 */}
          <section>
            <h2 className="mb-4 text-2xl font-bold text-[#173944]">
              15. Contact Us
            </h2>

            <p>
              If you have questions, concerns, or requests relating to this
              Privacy Policy or the handling of your information, contact:
            </p>

            <p className="mt-4">
              <strong>EdgeCheck</strong>
            </p>

            <p>
              Privacy contact:{" "}
              <a
                href="mailto:harshbroyt@gmail.com"
                className="font-semibold text-[#1597D4] hover:underline"
              >
                harshbroyt@gmail.com
              </a>
            </p>
          </section>
        </div>

        {/* Bottom */}
        <div className="mt-16 border-t border-[#E5F0F5] pt-8">
          <Link
            href={backHref}
            className="text-sm font-semibold text-[#1597D4] hover:underline"
          >
            ← {backLabel}
          </Link>
        </div>
      </section>
    </main>
  );
}
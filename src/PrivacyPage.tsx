import { SubpageBackBar } from "./components/SubpageBackBar";

export function PrivacyPage({
  onNavigate,
}: {
  onNavigate: (page: string) => void;
}) {
  return (
    <div className="yk-ed-page">
      <div className="yk-ed-container">
        <SubpageBackBar
          currentPage="privacy"
          currentLabel="Privacy Policy"
          onNavigate={onNavigate}
        />

        <header className="yk-ed-hero">
          <div className="yk-ed-kicker">
            <i>LEGAL</i> / DATA PROTECTION
          </div>
          <h1 className="yk-ed-title">
            Privacy Policy<em>.</em>
          </h1>
          <p className="yk-ed-lead">
            How Yekis collects, verifies, and safeguards identity and payment
            records across Ethiopia.
          </p>
        </header>

        <section className="yk-ed-legal-list">
          <div className="yk-ed-pillar-row">
            <span className="yk-ed-pillar-num">01 / COLLECTION</span>
            <h3>What We Collect</h3>
            <p>
              We collect information you provide directly when creating a
              workspace account, verifying your identity (Fayda, Kebele ID,
              Passport, TIN), or funding and releasing milestone contracts.
            </p>
          </div>
          <div className="yk-ed-pillar-row">
            <span className="yk-ed-pillar-num">02 / USAGE</span>
            <h3>How We Use Your Data</h3>
            <p>
              We use your data strictly to operate the escrow ledger, prevent
              counterparty fraud, issue ERCA-compliant tax receipts, and
              process payouts via Telebirr, CBE Birr, and Safaricom M-Pesa.
            </p>
          </div>
          <div className="yk-ed-pillar-row">
            <span className="yk-ed-pillar-num">03 / SECURITY</span>
            <h3>Data Storage &amp; Contact</h3>
            <p>
              All identity documents and ledger records are encrypted at rest
              and in transit. For privacy inquiries, contact{" "}
              <a href="mailto:privacy@yekis.com">privacy@yekis.com</a>.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

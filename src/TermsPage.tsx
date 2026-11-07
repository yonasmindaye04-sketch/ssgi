import { SubpageBackBar } from "./components/SubpageBackBar";

export function TermsPage({
  onNavigate,
}: {
  onNavigate: (page: string) => void;
}) {
  return (
    <div className="yk-ed-page">
      <div className="yk-ed-container">
        <SubpageBackBar
          currentPage="terms"
          currentLabel="Terms of Service"
          onNavigate={onNavigate}
        />

        <header className="yk-ed-hero">
          <div className="yk-ed-kicker">
            <i>LEGAL</i> / ESCROW AGREEMENT
          </div>
          <h1 className="yk-ed-title">
            Terms of Service<em>.</em>
          </h1>
          <p className="yk-ed-lead">
            Standard rules governing milestone deposits, deliverables, 2.5% +
            2.5% fee splits, and 48-hour dispute mediation.
          </p>
        </header>

        <section className="yk-ed-legal-list">
          <div className="yk-ed-pillar-row">
            <span className="yk-ed-pillar-num">01 / ESCROW</span>
            <h3>Segregated Milestone Holding</h3>
            <p>
              Client funds are locked in escrow before work starts and released
              only upon client approval or formal mediation resolution.
            </p>
          </div>
          <div className="yk-ed-pillar-row">
            <span className="yk-ed-pillar-num">02 / FEES</span>
            <h3>Transparent 2.5% + 2.5% Split</h3>
            <p>
              Yekis deducts 2.5% from the client deposit and 2.5% from the
              freelancer payout upon milestone completion. Freelancers retain
              97.5% of their contract value.
            </p>
          </div>
          <div className="yk-ed-pillar-row">
            <span className="yk-ed-pillar-num">03 / MEDIATION</span>
            <h3>Evidence-Backed Arbitration</h3>
            <p>
              Disputed milestones are reviewed by a human mediator in Addis
              Ababa within 48 hours using time-stamped workspace deliverables.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

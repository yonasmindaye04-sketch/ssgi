import { useState } from "react";
import { useI18n } from "./i18n";
import { openSupportChat } from "./components/supportChatEvents";
import { SubpageBackBar } from "./components/SubpageBackBar";

type FeesPageProps = {
  onNavigate: (page: string) => void;
  onStart: (mode: "login" | "register") => void;
};

type PaymentRail = "TELEBIRR" | "CBE_BIRR" | "M_PESA";

const PRESET_AMOUNTS = [5000, 15000, 25000, 50000, 100000];

export function FeesPage({ onNavigate, onStart }: FeesPageProps) {
  const { t } = useI18n();

  const [amountEtb, setAmountEtb] = useState<number>(25000);
  const [rolePerspective, setRolePerspective] = useState<"client" | "freelancer">(
    "freelancer"
  );
  const [selectedRail, setSelectedRail] = useState<PaymentRail>("TELEBIRR");
  const [includeWithholding, setIncludeWithholding] = useState<boolean>(false);
  const [hasVerifiedTin, setHasVerifiedTin] = useState<boolean>(true);

  const safeAmount = Number.isFinite(amountEtb) && amountEtb > 0 ? amountEtb : 0;
  const clientFee = Math.round(safeAmount * 0.025);
  const freelancerFee = Math.round(safeAmount * 0.025);
  const clientTotalDeposit = safeAmount + clientFee;

  const withholdingRate =
    includeWithholding && safeAmount >= 10000
      ? hasVerifiedTin
        ? 0.03
        : 0.3
      : 0;
  const withholdingTax = Math.round(safeAmount * withholdingRate);
  const freelancerNetPayout = Math.max(
    0,
    safeAmount - freelancerFee - withholdingTax
  );

  const formatEtb = (val: number) => `${val.toLocaleString("en-US")} ETB`;

  const feeItems = [
    t.marketing.fees.feeItem1,
    t.marketing.fees.feeItem2,
    t.marketing.fees.feeItem3,
    t.marketing.fees.feeItem4,
    t.marketing.fees.feeItem5,
  ];

  return (
    <div className="yk-ed-page">
      <div className="yk-ed-container">
        <SubpageBackBar
          currentPage="fees"
          currentLabel={t.nav.fees}
          onNavigate={onNavigate}
        />

        {/* Open Editorial Hero — Zero Boxes */}
        <header className="yk-ed-hero">
          <div className="yk-ed-kicker">
            <i>02</i> / {t.marketing.fees.eyebrow}
          </div>
          <h1 className="yk-ed-title">
            {t.marketing.fees.title.replace(".", "")}
            <em>.</em>
          </h1>
          <p className="yk-ed-lead">{t.marketing.fees.subheadline}</p>

          <div className="yk-ed-metrics">
            <div>
              <b>97.5%</b>
              <span>{t.marketing.fees.talentShare}</span>
            </div>
            <div>
              <b>2.5% + 2.5%</b>
              <span>
                {t.marketing.fees.clientFee} / {t.marketing.fees.freelancerFee}
              </span>
            </div>
            <div>
              <b>0 ETB</b>
              <span>Signup &amp; Job Posting Fee</span>
            </div>
            <div>
              <b>&lt; 48h</b>
              <span>Human Escrow Mediation SLA</span>
            </div>
          </div>
        </header>

        {/* Open Two-Column Interactive Calculator & Fee Ledger — Zero Boxes */}
        <section
          className="yk-ed-split yk-ed-split-equal"
          aria-label="Fee calculator and policy"
        >
          {/* Left: Open Interactive ETB Milestone Calculator */}
          <div className="yk-ed-col-left">
            <div className="yk-ed-sec-head">
              <div>
                <div className="yk-ed-kicker">INTERACTIVE SIMULATOR</div>
                <h2 className="yk-ed-h2">ETB Milestone &amp; Payout Calculator</h2>
              </div>

              <div
                className="yk-ed-inline-tabs"
                role="group"
                aria-label="Perspective selector"
              >
                <button
                  type="button"
                  className={rolePerspective === "freelancer" ? "is-active" : ""}
                  onClick={() => setRolePerspective("freelancer")}
                >
                  Freelancer View
                </button>
                <button
                  type="button"
                  className={rolePerspective === "client" ? "is-active" : ""}
                  onClick={() => setRolePerspective("client")}
                >
                  Client View
                </button>
              </div>
            </div>

            {/* Open Amount Field + Slider */}
            <div className="yk-ed-field-block">
              <div className="yk-ed-label-row">
                <label htmlFor="yekis-fee-amount">AGREED MILESTONE AMOUNT</label>
                <span>Drag slider or enter exact ETB</span>
              </div>
              <div className="yk-ed-amount-line">
                <input
                  id="yekis-fee-amount"
                  type="number"
                  min={500}
                  max={1000000}
                  step={500}
                  value={amountEtb}
                  onChange={(e) =>
                    setAmountEtb(Math.max(0, Number(e.target.value)))
                  }
                />
                <span>ETB</span>
              </div>
              <input
                type="range"
                className="yk-ed-slider"
                min={1000}
                max={200000}
                step={1000}
                value={Math.min(200000, Math.max(1000, safeAmount))}
                onChange={(e) => setAmountEtb(Number(e.target.value))}
                aria-label="Milestone amount slider in ETB"
              />
              <div className="yk-ed-presets">
                {PRESET_AMOUNTS.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    className={safeAmount === preset ? "is-active" : ""}
                    onClick={() => setAmountEtb(preset)}
                  >
                    {preset.toLocaleString("en-US")} ETB
                  </button>
                ))}
              </div>
            </div>

            {/* Open Settlement Payment Rail Selector */}
            <div className="yk-ed-field-block">
              <div className="yk-ed-label-row">
                <span>SETTLEMENT PAYMENT RAIL</span>
                <em>Instant Wallet Release</em>
              </div>
              <div className="yk-ed-inline-tabs">
                {(
                  [
                    { id: "TELEBIRR", label: "Telebirr" },
                    { id: "CBE_BIRR", label: "CBE Birr" },
                    { id: "M_PESA", label: "M-Pesa Ethiopia" },
                  ] as const
                ).map((rail) => (
                  <button
                    key={rail.id}
                    type="button"
                    className={selectedRail === rail.id ? "is-active" : ""}
                    onClick={() => setSelectedRail(rail.id)}
                  >
                    {rail.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Open Hairline Tax Switches */}
            <div className="yk-ed-switches">
              <div className="yk-ed-switch-row">
                <div>
                  <strong>Corporate / NGO Withholding Tax</strong>
                  <span>
                    Applies to Ethiopian business service contracts &ge; 10,000 ETB
                  </span>
                </div>
                <button
                  type="button"
                  className={`yk-ed-toggle-link ${includeWithholding ? "on" : ""}`}
                  onClick={() => setIncludeWithholding((prev) => !prev)}
                >
                  {includeWithholding ? "ENABLED" : "OPTIONAL"}
                </button>
              </div>

              <div className="yk-ed-switch-row">
                <div>
                  <strong>TIN Verification Status</strong>
                  <span>
                    {hasVerifiedTin
                      ? "Verified TIN + license reduces withholding to 3%"
                      : "Unverified TIN incurs 30% statutory withholding"}
                  </span>
                </div>
                <button
                  type="button"
                  className={`yk-ed-toggle-link ${hasVerifiedTin ? "on" : ""}`}
                  onClick={() => {
                    setIncludeWithholding(true);
                    setHasVerifiedTin((prev) => !prev);
                  }}
                >
                  {hasVerifiedTin ? "3% (TIN VERIFIED)" : "30% (UNVERIFIED)"}
                </button>
              </div>
            </div>

            {/* Open Hairline Ledger Receipt */}
            <div className="yk-ed-ledger" aria-live="polite">
              <div className="yk-ed-ledger-row">
                <span>Agreed Milestone Scope</span>
                <strong>{formatEtb(safeAmount)}</strong>
              </div>
              <div className="yk-ed-ledger-row">
                <span>Client Escrow Fee (+2.5%)</span>
                <strong>+{formatEtb(clientFee)}</strong>
              </div>
              <div className="yk-ed-ledger-row">
                <span>Total Client Escrow Deposit</span>
                <strong>{formatEtb(clientTotalDeposit)}</strong>
              </div>
              <div className="yk-ed-ledger-row">
                <span>Freelancer Service Fee (-2.5%)</span>
                <strong>-{formatEtb(freelancerFee)}</strong>
              </div>
              {includeWithholding && (
                <div className="yk-ed-ledger-row">
                  <span>
                    ERCA Withholding Tax (
                    {safeAmount >= 10000
                      ? hasVerifiedTin
                        ? "3% Verified TIN"
                        : "30% Unverified"
                      : "0% under 10k ETB"}
                    )
                  </span>
                  <strong>-{formatEtb(withholdingTax)}</strong>
                </div>
              )}
              <div className="yk-ed-ledger-row is-total">
                <span>
                  {rolePerspective === "client"
                    ? `Total Client Deposit (${selectedRail.replace("_", " ")})`
                    : `Net Freelancer Take-Home (${selectedRail.replace("_", " ")})`}
                </span>
                <strong>
                  {rolePerspective === "client"
                    ? formatEtb(clientTotalDeposit)
                    : formatEtb(freelancerNetPayout)}
                </strong>
              </div>
            </div>
          </div>

          {/* Right: Open Fee Policy & Comparison Ledger */}
          <div className="yk-ed-col-right">
            <div className="yk-ed-kicker">OFFICIAL ESCROW SCHEDULE</div>
            <h2 className="yk-ed-h2">{t.marketing.fees.panelTitle}</h2>
            <p className="yk-ed-body">{t.marketing.fees.note}</p>

            {/* Open Split Bar */}
            <div className="yk-ed-split-meter">
              <div className="yk-ed-split-labels">
                <strong>97.5% Freelancer Take-Home</strong>
                <em>2.5% + 2.5% Escrow Split</em>
              </div>
              <div
                className="yk-ed-split-bar"
                role="img"
                aria-label="97.5% freelancer take-home vs 2.5% fee"
              >
                <div className="yk-ed-split-keep" />
                <div className="yk-ed-split-fee" />
              </div>
            </div>

            {/* Unboxed Hairline List of 5 Fee Guarantees */}
            <ul className="yk-neb-list" style={{ marginTop: 28 }}>
              {feeItems.map((item, idx) => (
                <li key={idx}>
                  <span>0{idx + 1}</span>
                  <b>{item}</b>
                  <em>Included</em>
                </li>
              ))}
            </ul>

            {/* Open Comparison Table */}
            <div style={{ marginTop: 40 }}>
              <div className="yk-ed-kicker">BENCHMARK</div>
              <table className="yk-ed-table">
                <thead>
                  <tr>
                    <th>Feature</th>
                    <th>Yekis</th>
                    <th>Global Platforms</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Freelancer Service Fee</td>
                    <td>
                      <strong>2.5%</strong>
                    </td>
                    <td>10% – 20%</td>
                  </tr>
                  <tr>
                    <td>Native ETB Settlement</td>
                    <td>
                      <strong>Telebirr, CBE, M-Pesa</strong>
                    </td>
                    <td>USD Wire Only</td>
                  </tr>
                  <tr>
                    <td>ERCA Withholding &amp; TIN</td>
                    <td>
                      <strong>Automated (3% / 30%)</strong>
                    </td>
                    <td>Not Supported</td>
                  </tr>
                  <tr>
                    <td>Local Dispute Mediation</td>
                    <td>
                      <strong>&lt; 48h in Addis Ababa</strong>
                    </td>
                    <td>Automated Tickets</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="yk-neb-actions" style={{ marginTop: 32 }}>
              <button
                type="button"
                className="yk-neb-cta"
                onClick={() => onStart("register")}
              >
                <span>{t.marketing.fees.title}</span>
                <i aria-hidden="true">&rarr;</i>
              </button>
              <button
                type="button"
                className="yk-neb-link"
                onClick={() => {
                  if (!openSupportChat()) {
                    onNavigate("faq");
                  }
                }}
              >
                {t.marketing.fees.readFaq} &rarr;
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

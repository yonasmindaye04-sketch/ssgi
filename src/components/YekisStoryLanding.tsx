import React, { useState } from "react";
import { ArrowUpRight, Check } from "lucide-react";
import { useI18n } from "../i18n";
import { UserRoleOption, calculateYekisEscrowBreakdown } from "../utils/yekisMath";

interface YekisStoryLandingProps {
  onNavigate: (page: string) => void;
  onStart: (mode: "login" | "register", role?: UserRoleOption) => void;
}

type HeroPerspective = "client" | "freelancer";

type EscrowStageItem = {
  index: string;
  id: string;
  title: string;
  summary: string;
  contractRef: string;
  statusLine: string;
  amountEtb: string;
  rail: string;
  ledgerRows: { label: string; value: string; highlight?: boolean }[];
  actionLabel: string;
  footnote: string;
};

type PracticeArea = {
  index: string;
  id: string;
  title: string;
  openRoles: string;
  medianBudget: string;
  typicalTimeline: string;
  summary: string;
  skills: string;
  sampleMilestones: { step: string; title: string; share: string }[];
};

type StoryTestimonial = {
  id: string;
  roleType: "client" | "freelancer";
  roleBadge: string;
  quote: string;
  author: string;
  roleAndCity: string;
  contractTitle: string;
  contractValue: string;
  payoutSpeed: string;
};

const QUICK_FEE_PRESETS = [10000, 25000, 50000, 100000];

const STORY_TESTIMONIALS: StoryTestimonial[] = [
  {
    id: "voice-abel",
    roleType: "freelancer",
    roleBadge: "FREELANCER · BAHIR DAR",
    quote:
      "As a full-stack developer in Bahir Dar, getting paid used to be the hardest part of remote work. Now milestone funds land in my Telebirr wallet the moment the client approves.",
    author: "Abel T.",
    roleAndCity: "Full-Stack Engineer · Bahir Dar",
    contractTitle: "Fleet Dispatch & Driver Settlement Portal",
    contractValue: "85,000 ETB",
    payoutSpeed: "Released in 12 mins",
  },
  {
    id: "voice-hanna",
    roleType: "client",
    roleBadge: "CLIENT · ADDIS ABABA",
    quote:
      "We hired three engineers through Yekis last quarter. Funding each sprint in escrow meant zero payment anxiety on either side — every milestone shipped ahead of schedule.",
    author: "Hanna L.",
    roleAndCity: "Startup Founder · Addis Ababa",
    contractTitle: "Retail Telegram Catalog & Checkout Funnel",
    contractValue: "52,000 ETB",
    payoutSpeed: "3 / 3 milestones approved",
  },
  {
    id: "voice-meron",
    roleType: "freelancer",
    roleBadge: "FREELANCER · ADDIS ABABA",
    quote:
      "Escrow on every contract means I never chase invoices or argue over deposits again. Clients see our print-ready proofs inside the workspace and release payment immediately.",
    author: "Meron G.",
    roleAndCity: "Brand & Packaging Designer · Addis Ababa",
    contractTitle: "Specialty Coffee Export Identity System",
    contractValue: "45,000 ETB",
    payoutSpeed: "Released via CBE Birr",
  },
  {
    id: "voice-samuel",
    roleType: "freelancer",
    roleBadge: "FREELANCER · HAWASSA",
    quote:
      "The milestone ledger is the clearest financial workflow I have used in Ethiopia — funded, under review, and released ETB balances at a glance with automatic TIN receipts.",
    author: "Samuel K.",
    roleAndCity: "Data Analyst · Hawassa",
    contractTitle: "Regional Commodity Price Analytics Suite",
    contractValue: "64,000 ETB",
    payoutSpeed: "97.5% take-home retained",
  },
  {
    id: "voice-sara",
    roleType: "client",
    roleBadge: "CLIENT · BAHIR DAR",
    quote:
      "Hiring certified Amharic, Afaan Oromoo, and Tigrinya linguists through Yekis with automated ERCA withholding receipts saved our NGO finance desk weeks of audit paperwork.",
    author: "Dr. Sara M.",
    roleAndCity: "NGO Program Coordinator · Bahir Dar",
    contractTitle: "Maternal Health App Localization (180 Modules)",
    contractValue: "38,000 ETB",
    payoutSpeed: "ERCA 3% TIN compliant",
  },
  {
    id: "voice-betty",
    roleType: "client",
    roleBadge: "CLIENT · MEKELLE",
    quote:
      "When our scope expanded mid-project, we adjusted Milestone 03 directly in the contract trail. Both sides had a time-stamped record from brief to final delivery.",
    author: "Betty A.",
    roleAndCity: "Operations Lead · Mekelle",
    contractTitle: "Cooperative Inventory & Reporting Dashboard",
    contractValue: "64,000 ETB",
    payoutSpeed: "Zero dispute friction",
  },
];

export const YekisStoryLanding: React.FC<YekisStoryLandingProps> = ({
  onNavigate,
  onStart,
}) => {
  const { t } = useI18n();

  // Chapter 01 interactive contract preview state
  const [heroPerspective, setHeroPerspective] =
    useState<HeroPerspective>("client");
  const [heroMilestoneIdx, setHeroMilestoneIdx] = useState<number>(1);
  const [m2Released, setM2Released] = useState<boolean>(false);

  // Chapter 03 interactive 4-step escrow walkthrough state
  const [activeEscrowStep, setActiveEscrowStep] = useState<number>(0);

  // Chapter 04 interactive practice area state
  const [activePracticeIdx, setActivePracticeIdx] = useState<number>(0);

  // Chapter 05 interactive fee preset state
  const [feePresetEtb, setFeePresetEtb] = useState<number>(25000);

  // Chapter 06 testimonial filter state
  const [voiceFilter, setVoiceFilter] = useState<"ALL" | "client" | "freelancer">(
    "ALL"
  );

  const heroMilestones = [
    {
      code: "01",
      title: "System Architecture & API Schema",
      amount: "15,000 ETB",
      status: "Released · Telebirr",
      isReleased: true,
      deliverable: "OpenAPI 3.1 spec + PostgreSQL ledger schema signed off",
    },
    {
      code: "02",
      title: "Dispatcher Web Dashboard & Live Map",
      amount: "45,000 ETB",
      status: m2Released
        ? "Released · Telebirr (#TX-9941)"
        : "Funded in Escrow · Ready for Review",
      isReleased: m2Released,
      deliverable:
        "Staging deployment + telemetry map uploaded by Abel T. (14 mins ago)",
    },
    {
      code: "03",
      title: "Driver Mobile Check-In & QA Handover",
      amount: "25,000 ETB",
      status: "Scheduled · Funds Locked",
      isReleased: false,
      deliverable: "Final Android APK + load test report due in 5 days",
    },
  ];

  const escrowStages: EscrowStageItem[] = [
    {
      index: "01",
      id: "fund",
      title: t.marketing.escrow.step1Title,
      summary: t.marketing.escrow.step1Desc,
      contractRef: "ESCROW LEDGER · #YK-2481-M2",
      statusLine: "Segregated ETB Escrow Account Funded",
      amountEtb: "45,000 ETB",
      rail: "Telebirr · CBE Birr · M-Pesa",
      ledgerRows: [
        { label: "Milestone 02 Scope", value: "Dispatcher Web Dashboard" },
        { label: "Principal Locked in Escrow", value: "45,000 ETB" },
        { label: "Client Escrow Fee (+2.5%)", value: "1,125 ETB" },
        {
          label: "Counterparty Visibility",
          value: "Verified Before Work Starts",
          highlight: true,
        },
      ],
      actionLabel: "Proceed to Stage 02 · Work",
      footnote:
        "Funds are held in a segregated ETB escrow account — never mixed with operating funds.",
    },
    {
      index: "02",
      id: "work",
      title: t.marketing.escrow.step2Title,
      summary: t.marketing.escrow.step2Desc,
      contractRef: "DELIVERY LOG · #YK-2481-M2",
      statusLine: "Time-Stamped Deliverables Submitted",
      amountEtb: "45,000 ETB",
      rail: "Workspace Audit Trail Active",
      ledgerRows: [
        {
          label: "10:14 EAT · Repository Tag",
          value: "v2.4-staging signed & pushed",
        },
        {
          label: "11:02 EAT · Staging Preview",
          value: "dispatch-preview.abyssinia.et",
        },
        {
          label: "11:18 EAT · Handoff Notes",
          value: "32 fleet routes verified in QA",
        },
        {
          label: "Milestone Protection",
          value: "5-Day Review Clock Started",
          highlight: true,
        },
      ],
      actionLabel: "Proceed to Stage 03 · Approve",
      footnote:
        "Every file, message, and scope adjustment is time-stamped inside the contract workspace.",
    },
    {
      index: "03",
      id: "approve",
      title: t.marketing.escrow.step3Title,
      summary: t.marketing.escrow.step3Desc,
      contractRef: "INSTANT PAYOUT · #YK-2481-M2",
      statusLine: "Approved by Client · Instant Wallet Settlement",
      amountEtb: "43,875 ETB",
      rail: "Direct to Telebirr / CBE Birr",
      ledgerRows: [
        { label: "Approved Milestone Value", value: "45,000 ETB" },
        { label: "Freelancer Service Fee (-2.5%)", value: "-1,125 ETB" },
        { label: "Auto-Release Safeguard", value: "Releases in 5d if no reply" },
        {
          label: "Net Freelancer Take-Home (97.5%)",
          value: "43,875 ETB",
          highlight: true,
        },
      ],
      actionLabel: "Proceed to Stage 04 · Protected",
      footnote:
        "Approving a milestone releases payment immediately; silent clients auto-release after 5 days.",
    },
    {
      index: "04",
      id: "protected",
      title: t.marketing.escrow.step4Title,
      summary: t.marketing.escrow.step4Desc,
      contractRef: "RESOLUTION DESK · ADDIS ABABA",
      statusLine: "Human Mediation SLA < 48 Hours",
      amountEtb: "100% Protected",
      rail: "Bilingual Support (EN · አማ · ORO · ትግ)",
      ledgerRows: [
        {
          label: "Evidence Reviewed",
          value: "Signed brief + time-stamped commits",
        },
        {
          label: "Assigned Specialist",
          value: "Addis Ababa Escrow Arbitration Desk",
        },
        { label: "Resolution Outcome", value: "Fair split or full refund/payout" },
        {
          label: "First Response Guarantee",
          value: "Under 48 Hours",
          highlight: true,
        },
      ],
      actionLabel: "Back to Stage 01 · Fund",
      footnote:
        "Funds remain frozen in escrow during mediation until a human specialist reviews the evidence.",
    },
  ];

  const practiceAreas: PracticeArea[] = [
    {
      index: "01",
      id: "engineering",
      title: `${t.marketing.categories.c1Title1} ${t.marketing.categories.c1Title2}`,
      openRoles: t.marketing.categories.c1Roles,
      medianBudget: "45,000 – 120,000 ETB",
      typicalTimeline: "2 – 5 Weeks · 3 to 4 Milestones",
      summary:
        "Full-stack web applications, Telebirr & CBE Birr payment integrations, Android/iOS mobile apps, and custom internal logistics or ERP portals.",
      skills: "React · TypeScript · Node.js · Flutter · PostgreSQL · Telebirr API",
      sampleMilestones: [
        {
          step: "M1 · 20%",
          title: "System Architecture, Database Schema & Wireframes",
          share: "20% of Escrow",
        },
        {
          step: "M2 · 50%",
          title: "Core Frontend, Backend API & Payment Webhook Build",
          share: "50% of Escrow",
        },
        {
          step: "M3 · 30%",
          title: "Staging QA, Security Audit & Production Handover",
          share: "30% of Escrow",
        },
      ],
    },
    {
      index: "02",
      id: "design",
      title: `${t.marketing.categories.c2Title1} ${t.marketing.categories.c2Title2}`,
      openRoles: t.marketing.categories.c2Roles,
      medianBudget: "20,000 – 60,000 ETB",
      typicalTimeline: "1 – 3 Weeks · 3 Milestones",
      summary:
        "Complete corporate brand systems, bilingual Amharic/English typography, export packaging dielines, and interactive Figma product design systems.",
      skills: "Figma · Brand Identity · Print Dielines · UI/UX Systems · Motion",
      sampleMilestones: [
        {
          step: "M1 · 30%",
          title: "Brand Discovery, Visual Direction & Wordmark Concepts",
          share: "30% of Escrow",
        },
        {
          step: "M2 · 45%",
          title: "High-Fidelity UI Screens / Packaging Print Proofs",
          share: "45% of Escrow",
        },
        {
          step: "M3 · 25%",
          title: "Source Files, Design Tokens & Style Guide Delivery",
          share: "25% of Escrow",
        },
      ],
    },
    {
      index: "03",
      id: "marketing",
      title: `${t.marketing.categories.c3Title1} ${t.marketing.categories.c3Title2}`,
      openRoles: t.marketing.categories.c3Roles,
      medianBudget: "25,000 – 75,000 ETB",
      typicalTimeline: "2 – 4 Weeks · 3 Milestones",
      summary:
        "Performance Telegram channel funnels, short-form TikTok/Reels video production, search strategy, and conversion analytics for Ethiopian brands.",
      skills: "Telegram Funnels · Video Reels · Meta/TikTok Ads · Conversion SEO",
      sampleMilestones: [
        {
          step: "M1 · 30%",
          title: "Campaign Strategy, Scripts & Tracking Setup",
          share: "30% of Escrow",
        },
        {
          step: "M2 · 40%",
          title: "Creative Production & Funnel Automation Launch",
          share: "40% of Escrow",
        },
        {
          step: "M3 · 30%",
          title: "ROAS Optimization & Final Performance Report",
          share: "30% of Escrow",
        },
      ],
    },
    {
      index: "04",
      id: "writing",
      title: `${t.marketing.categories.c4Title1} ${t.marketing.categories.c4Title2}`,
      openRoles: t.marketing.categories.c4Roles,
      medianBudget: "12,000 – 40,000 ETB",
      typicalTimeline: "1 – 2 Weeks · 2 to 3 Milestones",
      summary:
        "Technical documentation, grant proposals for NGOs, B2B whitepapers, and conversion copywriting crafted by subject-matter specialists.",
      skills: "Technical Writing · Grant Proposals · UX Copy · Editorial Research",
      sampleMilestones: [
        {
          step: "M1 · 35%",
          title: "Research Outline, Tone Matrix & First Section Draft",
          share: "35% of Escrow",
        },
        {
          step: "M2 · 65%",
          title: "Complete Manuscript, Citations & Final Editorial Polish",
          share: "65% of Escrow",
        },
      ],
    },
    {
      index: "05",
      id: "localization",
      title: `${t.marketing.categories.c5Title1} ${t.marketing.categories.c5Title2}`,
      openRoles: t.marketing.categories.c5Roles,
      medianBudget: "15,000 – 55,000 ETB",
      typicalTimeline: "1 – 3 Weeks · 3 Milestones",
      summary:
        "Certified localization, legal/medical translation, and native voiceover across Amharic, Afaan Oromoo, Tigrinya, and English.",
      skills: "Amharic · Afaan Oromoo · Tigrinya · Terminology QA · Voiceover",
      sampleMilestones: [
        {
          step: "M1 · 25%",
          title: "Glossary Alignment & Sample String Approval",
          share: "25% of Escrow",
        },
        {
          step: "M2 · 50%",
          title: "Full String / Document Translation & Proofreading",
          share: "50% of Escrow",
        },
        {
          step: "M3 · 25%",
          title: "In-Context Linguistic QA & Final Certification",
          share: "25% of Escrow",
        },
      ],
    },
    {
      index: "06",
      id: "data",
      title: `${t.marketing.categories.c6Title1} ${t.marketing.categories.c6Title2}`,
      openRoles: t.marketing.categories.c6Roles,
      medianBudget: "20,000 – 70,000 ETB",
      typicalTimeline: "1 – 3 Weeks · 3 Milestones",
      summary:
        "Historical dataset cleaning, automated woreda/regional survey pipelines, Python/SQL ETL scripts, and executive Power BI dashboards.",
      skills: "Python · SQL · Power BI · Excel Automation · Survey QA",
      sampleMilestones: [
        {
          step: "M1 · 30%",
          title: "Data Audit, Schema Normalization & Deduplication",
          share: "30% of Escrow",
        },
        {
          step: "M2 · 45%",
          title: "Automated Pipeline & Interactive Dashboard Build",
          share: "45% of Escrow",
        },
        {
          step: "M3 · 25%",
          title: "Validation Testing & Team Documentation Handover",
          share: "25% of Escrow",
        },
      ],
    },
  ];

  const activeStage = escrowStages[activeEscrowStep] ?? escrowStages[0];
  const activePractice = practiceAreas[activePracticeIdx] ?? practiceAreas[0];

  const feeBreakdown = calculateYekisEscrowBreakdown(feePresetEtb, false, true);
  const feeClient = feeBreakdown.clientFee;
  const feeFreelancer = feeBreakdown.freelancerFee;
  const feeClientTotal = feeBreakdown.clientTotalDeposit;
  const feeFreelancerNet = feeBreakdown.freelancerNetPayout;

  const filteredVoices =
    voiceFilter === "ALL"
      ? STORY_TESTIMONIALS
      : STORY_TESTIMONIALS.filter((v) => v.roleType === voiceFilter);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="yk-ed-page yk-story-page" id="top">
      <div className="yk-ed-container">
        {/* Continuous Storytelling Chapter Bar */}
        <nav className="yk-story-bar" aria-label="Story chapters">
          <span className="yk-story-bar-label">
            STORYTELLING INDEX · ADDIS ABABA
          </span>
          <div className="yk-story-bar-links">
            <button
              type="button"
              onClick={() => scrollToSection("story-hero")}
            >
              01 · Proposition
            </button>
            <button
              type="button"
              onClick={() => scrollToSection("story-why")}
            >
              02 · Why Escrow
            </button>
            <button
              type="button"
              onClick={() => scrollToSection("story-mechanism")}
            >
              03 · How It Works
            </button>
            <button
              type="button"
              onClick={() => scrollToSection("story-categories")}
            >
              04 · Practice Areas
            </button>
            <button
              type="button"
              onClick={() => scrollToSection("story-fees")}
            >
              05 · Fair Fees
            </button>
            <button
              type="button"
              onClick={() => scrollToSection("story-proof")}
            >
              06 · Proof
            </button>
            <button
              type="button"
              onClick={() => scrollToSection("story-cta")}
            >
              07 · Start
            </button>
          </div>
        </nav>

        {/* ─────────────────────────────────────────────────────────────────
            CHAPTER 01 · THE PROPOSITION & LIVE ESCROW CONTRACT DOSSIER
           ───────────────────────────────────────────────────────────────── */}
        <section
          className="yk-story-hero"
          id="story-hero"
          aria-label="Hero proposition and live contract preview"
        >
          <div className="yk-story-hero-grid">
            <div className="yk-story-hero-copy">
              <div className="yk-ed-kicker">
                <i>01</i> / {t.marketing.hero.eyebrow}
              </div>
              <h1 className="yk-ed-title">
                {t.marketing.hero.title.replace(/\.$/, "")}
                <em>.</em>
              </h1>
              <p className="yk-ed-lead">{t.marketing.hero.subheadline}</p>

              <div className="yk-neb-actions" style={{ marginBottom: 32 }}>
                <button
                  type="button"
                  className="yk-neb-cta"
                  onClick={() => onStart("register", "CLIENT")}
                >
                  <span>{t.nav.getStarted}</span>
                  <i aria-hidden="true">&rarr;</i>
                </button>
                <button
                  type="button"
                  className="yk-neb-link"
                  onClick={() => scrollToSection("story-mechanism")}
                >
                  {t.marketing.escrow.headline} &darr;
                </button>
              </div>

              <div className="yk-story-meta-line">
                <span>Telebirr · CBE Birr · M-Pesa</span>
                <span aria-hidden="true">/</span>
                <span>Fayda &amp; TIN Verified</span>
                <span aria-hidden="true">/</span>
                <span>97.5% Talent Payout</span>
              </div>
            </div>

            {/* Right: Unboxed Live Contract Ledger Preview */}
            <div
              className="yk-story-dossier"
              aria-label="Interactive live contract ledger preview"
            >
              <div className="yk-story-dossier-head">
                <div>
                  <span className="yk-story-dossier-code">
                    LIVE CONTRACT LEDGER · #YK-2481
                  </span>
                  <h2>Abyssinia Logistics Dispatch Portal</h2>
                </div>
                <div
                  className="yk-ed-inline-tabs"
                  role="group"
                  aria-label="Preview perspective"
                >
                  <button
                    type="button"
                    className={heroPerspective === "client" ? "is-active" : ""}
                    onClick={() => setHeroPerspective("client")}
                  >
                    Client View
                  </button>
                  <button
                    type="button"
                    className={
                      heroPerspective === "freelancer" ? "is-active" : ""
                    }
                    onClick={() => setHeroPerspective("freelancer")}
                  >
                    Freelancer View
                  </button>
                </div>
              </div>

              <ul className="yk-story-ms-list">
                {heroMilestones.map((ms, idx) => {
                  const selected = heroMilestoneIdx === idx;
                  return (
                    <li
                      key={ms.code}
                      className={selected ? "is-selected" : ""}
                    >
                      <button
                        type="button"
                        className="yk-story-ms-row"
                        onClick={() => setHeroMilestoneIdx(idx)}
                        aria-expanded={selected}
                      >
                        <span className="yk-story-ms-idx">{ms.code}</span>
                        <div className="yk-story-ms-main">
                          <strong>{ms.title}</strong>
                          <small>{ms.status}</small>
                        </div>
                        <span className="yk-story-ms-amt">{ms.amount}</span>
                      </button>
                      {selected && (
                        <div className="yk-story-ms-detail">
                          <p>{ms.deliverable}</p>
                          {idx === 1 && !m2Released && (
                            <button
                              type="button"
                              className="yk-story-release-btn"
                              onClick={() => setM2Released(true)}
                            >
                              <Check size={14} />
                              <span>
                                {heroPerspective === "client"
                                  ? "Approve Deliverable & Release 45,000 ETB"
                                  : "Simulate Client Approval (Release 43,875 ETB Net)"}
                              </span>
                            </button>
                          )}
                          {idx === 1 && m2Released && (
                            <span className="yk-story-released-note">
                              ✓ 45,000 ETB released from escrow to Telebirr
                              wallet (97.5% net: 43,875 ETB)
                            </span>
                          )}
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>

              <div className="yk-story-dossier-foot">
                <div>
                  <span>TOTAL CONTRACT ESCROW</span>
                  <strong>85,000 ETB</strong>
                </div>
                <div>
                  <span>
                    {heroPerspective === "client"
                      ? "RELEASED SO FAR"
                      : "YOUR NET TAKE-HOME (97.5%)"}
                  </span>
                  <strong>
                    {heroPerspective === "client"
                      ? m2Released
                        ? "60,000 ETB"
                        : "15,000 ETB"
                      : "82,875 ETB"}
                  </strong>
                </div>
                <div>
                  <span>SETTLEMENT RAIL</span>
                  <strong>Telebirr &amp; CBE Birr</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Full-width 4-metric strip below the Hero */}
          <div className="yk-ed-metrics" style={{ marginTop: 48 }}>
            <div>
              <b>12,480+</b>
              <span>{t.marketing.stats.jobsCompleted}</span>
            </div>
            <div>
              <b>3,940+</b>
              <span>{t.marketing.stats.verifiedFreelancers}</span>
            </div>
            <div>
              <b>84.6M ETB</b>
              <span>{t.marketing.stats.securedEscrow}</span>
            </div>
            <div>
              <b>6.5 hrs</b>
              <span>{t.marketing.stats.avgPayout}</span>
            </div>
          </div>
        </section>

        {/* ─────────────────────────────────────────────────────────────────
            CHAPTER 02 · NARRATIVE BRIDGE: WHY ESCROW CHANGES EVERYTHING
           ───────────────────────────────────────────────────────────────── */}
        <section
          className="yk-ed-split yk-ed-split-equal"
          id="story-why"
          aria-labelledby="story-why-heading"
        >
          <div className="yk-ed-col-left">
            <div className="yk-ed-kicker">
              <i>02</i> / {t.marketing.about.eyebrow}
            </div>
            <h2 className="yk-ed-h2" id="story-why-heading">
              {t.marketing.about.problemTitle.replace(/\.$/, "")}
              <em>.</em>
            </h2>
            <p className="yk-ed-body">{t.marketing.about.problemBody}</p>
            <p className="yk-ed-body">{t.marketing.about.intro}</p>

            <div className="yk-neb-actions" style={{ marginTop: 28 }}>
              <button
                type="button"
                className="yk-neb-link"
                onClick={() => onNavigate("about")}
              >
                Read Our Full Addis Ababa Story &rarr;
              </button>
            </div>
          </div>

          <div className="yk-ed-col-right">
            <blockquote className="yk-story-blockquote">
              &ldquo;{t.marketing.about.missionQuote}&rdquo;
            </blockquote>

            <div className="yk-ed-pillars">
              <div className="yk-ed-pillar-row">
                <span className="yk-ed-pillar-num">
                  01 / SEGREGATED ETB ESCROW
                </span>
                <h3>{t.marketing.about.feature1Title}</h3>
                <p>{t.marketing.about.feature1Desc}</p>
              </div>
              <div className="yk-ed-pillar-row">
                <span className="yk-ed-pillar-num">
                  02 / FAYDA, KEBELE ID &amp; TIN KYC
                </span>
                <h3>{t.marketing.about.feature2Title}</h3>
                <p>{t.marketing.about.feature2Desc}</p>
              </div>
              <div className="yk-ed-pillar-row">
                <span className="yk-ed-pillar-num">
                  03 / 48-HOUR HUMAN ARBITRATION
                </span>
                <h3>{t.marketing.about.feature3Title}</h3>
                <p>{t.marketing.about.feature3Desc}</p>
              </div>
            </div>
          </div>
        </section>

        {/* ─────────────────────────────────────────────────────────────────
            CHAPTER 03 · THE MECHANISM: 4-ACT INTERACTIVE ESCROW STORY
           ───────────────────────────────────────────────────────────────── */}
        <section
          className="yk-ed-section"
          id="story-mechanism"
          aria-labelledby="story-mech-heading"
        >
          <div className="yk-story-sec-intro">
            <div className="yk-ed-kicker">
              <i>03</i> / {t.marketing.escrow.eyebrow}
            </div>
            <h2 className="yk-ed-title" id="story-mech-heading">
              {t.marketing.escrow.slogan.replace(/\.$/, "")}
              <em>.</em>
            </h2>
            <p className="yk-ed-lead">{t.marketing.escrow.subheadline}</p>
          </div>

          <div className="yk-story-mech-grid">
            {/* Left: 4 Interactive Story Steps */}
            <div
              className="yk-story-steps"
              role="tablist"
              aria-label="Four stages of a Yekis contract"
            >
              {escrowStages.map((stage, idx) => {
                const isActive = activeEscrowStep === idx;
                return (
                  <button
                    key={stage.id}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    className={`yk-story-step-btn ${isActive ? "is-active" : ""}`}
                    onClick={() => setActiveEscrowStep(idx)}
                  >
                    <div className="yk-story-step-top">
                      <span className="yk-story-step-num">{stage.index}</span>
                      <strong>{stage.title}</strong>
                    </div>
                    <p>{stage.summary}</p>
                  </button>
                );
              })}
            </div>

            {/* Right: Unboxed Stage Ledger for the Active Act */}
            <div
              className="yk-story-stage-view"
              role="tabpanel"
              aria-live="polite"
            >
              <div className="yk-story-stage-head">
                <div>
                  <span className="yk-ed-kicker">{activeStage.contractRef}</span>
                  <h3>
                    Stage {activeStage.index} &middot; {activeStage.title}
                  </h3>
                  <p>{activeStage.statusLine}</p>
                </div>
                <div className="yk-story-stage-figure">
                  <b>{activeStage.amountEtb}</b>
                  <span>{activeStage.rail}</span>
                </div>
              </div>

              <div className="yk-ed-ledger">
                {activeStage.ledgerRows.map((row) => (
                  <div
                    key={row.label}
                    className={`yk-ed-ledger-row ${row.highlight ? "is-total" : ""}`}
                  >
                    <span>{row.label}</span>
                    <strong>{row.value}</strong>
                  </div>
                ))}
              </div>

              <p className="yk-story-stage-foot">{activeStage.footnote}</p>

              <div className="yk-neb-actions" style={{ marginTop: 24 }}>
                <button
                  type="button"
                  className="yk-neb-cta"
                  onClick={() =>
                    setActiveEscrowStep((prev) => (prev + 1) % escrowStages.length)
                  }
                >
                  <span>{activeStage.actionLabel}</span>
                  <i aria-hidden="true">&rarr;</i>
                </button>
                <button
                  type="button"
                  className="yk-neb-link"
                  onClick={() => onStart("register", "CLIENT")}
                >
                  Start an Escrow Contract &rarr;
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ─────────────────────────────────────────────────────────────────
            CHAPTER 04 · CAPABILITIES: SIX PRACTICE AREAS & SCOPE EXPLORER
           ───────────────────────────────────────────────────────────────── */}
        <section
          className="yk-ed-section"
          id="story-categories"
          aria-labelledby="story-cat-heading"
        >
          <div className="yk-story-sec-intro">
            <div className="yk-ed-kicker">
              <i>04</i> / {t.marketing.categories.eyebrow}
            </div>
            <h2 className="yk-ed-title" id="story-cat-heading">
              {(t.marketing.categories.title === t.marketing.hero.title
                ? "Six practice areas. Vetted specialists"
                : t.marketing.categories.title.replace(/\.$/, "")
              )}
              <em>.</em>
            </h2>
            <p className="yk-ed-lead">
              Select any practice area below to inspect typical milestone
              structures, ETB contract ranges, and verified deliverables.
            </p>
          </div>

          <div className="yk-story-mech-grid">
            <div
              className="yk-story-cat-list"
              role="tablist"
              aria-label="Six Yekis talent categories"
            >
              {practiceAreas.map((area, idx) => {
                const isSelected = activePracticeIdx === idx;
                return (
                  <button
                    key={area.id}
                    type="button"
                    role="tab"
                    aria-selected={isSelected}
                    className={`yk-story-cat-row ${isSelected ? "is-active" : ""}`}
                    onClick={() => setActivePracticeIdx(idx)}
                  >
                    <span className="yk-story-cat-num">{area.index}</span>
                    <strong>{area.title}</strong>
                    <em>{area.openRoles}</em>
                  </button>
                );
              })}
            </div>

            <div
              className="yk-story-stage-view"
              role="tabpanel"
              aria-live="polite"
            >
              <div className="yk-story-stage-head">
                <div>
                  <span className="yk-ed-kicker">
                    PRACTICE AREA {activePractice.index} ·{" "}
                    {activePractice.openRoles.toUpperCase()}
                  </span>
                  <h3>{activePractice.title}</h3>
                  <p>{activePractice.summary}</p>
                </div>
                <div className="yk-story-stage-figure">
                  <b>{activePractice.medianBudget}</b>
                  <span>{activePractice.typicalTimeline}</span>
                </div>
              </div>

              <div className="yk-story-skill-line">
                <span>VERIFIED SPECIALIST SKILLS:</span>{" "}
                <strong>{activePractice.skills}</strong>
              </div>

              <ul className="yk-neb-list" style={{ marginTop: 18 }}>
                {activePractice.sampleMilestones.map((ms) => (
                  <li key={ms.step}>
                    <span>{ms.step}</span>
                    <b>{ms.title}</b>
                    <em>{ms.share}</em>
                  </li>
                ))}
              </ul>

              <div className="yk-neb-actions" style={{ marginTop: 28 }}>
                <button
                  type="button"
                  className="yk-neb-cta"
                  onClick={() => onStart("register", "CLIENT")}
                >
                  <span>Hire in {activePractice.title}</span>
                  <i aria-hidden="true">&rarr;</i>
                </button>
                <button
                  type="button"
                  className="yk-neb-link"
                  onClick={() => onNavigate("case-studies")}
                >
                  View Verified Case Studies &rarr;
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ─────────────────────────────────────────────────────────────────
            CHAPTER 05 · TRANSPARENT ECONOMICS: 97.5% GOES TO TALENT
           ───────────────────────────────────────────────────────────────── */}
        <section
          className="yk-ed-split yk-ed-split-equal"
          id="story-fees"
          aria-labelledby="story-fees-heading"
        >
          <div className="yk-ed-col-left">
            <div className="yk-ed-kicker">
              <i>05</i> / {t.marketing.fees.eyebrow}
            </div>
            <h2 className="yk-ed-h2" id="story-fees-heading">
              {t.marketing.fees.headline.replace(/\.$/, "")}
              <em>.</em>
            </h2>
            <p className="yk-ed-body">{t.marketing.fees.subheadline}</p>

            <div className="yk-ed-split-meter">
              <div className="yk-ed-split-labels">
                <strong>97.5% {t.marketing.fees.talentShare}</strong>
                <em>
                  2.5% {t.marketing.fees.clientFee} + 2.5%{" "}
                  {t.marketing.fees.freelancerFee}
                </em>
              </div>
              <div
                className="yk-ed-split-bar"
                role="img"
                aria-label="97.5% freelancer share vs 2.5% fee"
              >
                <div className="yk-ed-split-keep" />
                <div className="yk-ed-split-fee" />
              </div>
            </div>

            <ul className="yk-neb-list" style={{ marginTop: 24 }}>
              <li>
                <span>01</span>
                <b>{t.marketing.fees.feeItem1}</b>
                <em>Guaranteed</em>
              </li>
              <li>
                <span>02</span>
                <b>{t.marketing.fees.feeItem2}</b>
                <em>2.5% + 2.5%</em>
              </li>
              <li>
                <span>03</span>
                <b>{t.marketing.fees.feeItem3}</b>
                <em>Telebirr &amp; CBE</em>
              </li>
              <li>
                <span>04</span>
                <b>{t.marketing.fees.feeItem4}</b>
                <em>0 ETB</em>
              </li>
            </ul>
          </div>

          <div className="yk-ed-col-right">
            <div className="yk-ed-kicker">QUICK ETB PAYOUT PREVIEW</div>
            <h3 className="yk-ed-h2" style={{ fontSize: "clamp(22px, 2.4vw, 30px)" }}>
              Select a Milestone Amount
            </h3>

            <div
              className="yk-ed-presets"
              style={{ marginBottom: 20, marginTop: 12 }}
              role="group"
              aria-label="Milestone preset amounts in ETB"
            >
              {QUICK_FEE_PRESETS.map((amt) => (
                <button
                  key={amt}
                  type="button"
                  className={feePresetEtb === amt ? "is-active" : ""}
                  onClick={() => setFeePresetEtb(amt)}
                >
                  {amt.toLocaleString("en-US")} ETB
                </button>
              ))}
            </div>

            <div className="yk-ed-ledger" aria-live="polite">
              <div className="yk-ed-ledger-row">
                <span>Agreed Milestone Amount</span>
                <strong>{feePresetEtb.toLocaleString("en-US")} ETB</strong>
              </div>
              <div className="yk-ed-ledger-row">
                <span>Client Escrow Fee (+2.5%)</span>
                <strong>+{feeClient.toLocaleString("en-US")} ETB</strong>
              </div>
              <div className="yk-ed-ledger-row">
                <span>Total Client Deposit Locked</span>
                <strong>{feeClientTotal.toLocaleString("en-US")} ETB</strong>
              </div>
              <div className="yk-ed-ledger-row">
                <span>Freelancer Service Fee (-2.5%)</span>
                <strong>-{feeFreelancer.toLocaleString("en-US")} ETB</strong>
              </div>
              <div className="yk-ed-ledger-row is-total">
                <span>Net Freelancer Payout (97.5%)</span>
                <strong>{feeFreelancerNet.toLocaleString("en-US")} ETB</strong>
              </div>
            </div>

            <div className="yk-neb-actions" style={{ marginTop: 28 }}>
              <button
                type="button"
                className="yk-neb-cta"
                onClick={() => onNavigate("fees")}
              >
                <span>Open Full Fee &amp; TIN Tax Calculator</span>
                <i aria-hidden="true">&rarr;</i>
              </button>
            </div>
          </div>
        </section>

        {/* ─────────────────────────────────────────────────────────────────
            CHAPTER 06 · PROOF IN THEIR WORDS & VERIFIED DELIVERIES
           ───────────────────────────────────────────────────────────────── */}
        <section
          className="yk-ed-section"
          id="story-proof"
          aria-labelledby="story-proof-heading"
        >
          <div className="yk-story-proof-head">
            <div>
              <div className="yk-ed-kicker">
                <i>06</i> / {t.marketing.testimonials.eyebrow}
              </div>
              <h2 className="yk-ed-title" id="story-proof-heading">
                {t.marketing.testimonials.title.replace(/\.$/, "")}
                <em>.</em>
              </h2>
              <p className="yk-ed-lead" style={{ marginBottom: 0 }}>
                {t.marketing.testimonials.subtitle}
              </p>
            </div>

            <div
              className="yk-ed-inline-tabs"
              role="tablist"
              aria-label="Filter member stories"
            >
              <button
                type="button"
                role="tab"
                aria-selected={voiceFilter === "ALL"}
                className={voiceFilter === "ALL" ? "is-active" : ""}
                onClick={() => setVoiceFilter("ALL")}
              >
                All Voices ({STORY_TESTIMONIALS.length})
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={voiceFilter === "client"}
                className={voiceFilter === "client" ? "is-active" : ""}
                onClick={() => setVoiceFilter("client")}
              >
                Clients (3)
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={voiceFilter === "freelancer"}
                className={voiceFilter === "freelancer" ? "is-active" : ""}
                onClick={() => setVoiceFilter("freelancer")}
              >
                Freelancers (3)
              </button>
            </div>
          </div>

          <div className="yk-story-voices-grid">
            {filteredVoices.map((v) => (
              <article key={v.id} className="yk-story-voice-item">
                <div className="yk-story-voice-meta">
                  <span>{v.roleBadge}</span>
                  <em>{v.payoutSpeed}</em>
                </div>
                <blockquote>&ldquo;{v.quote}&rdquo;</blockquote>
                <div className="yk-story-voice-foot">
                  <div>
                    <strong>{v.author}</strong>
                    <span>{v.roleAndCity}</span>
                  </div>
                  <div className="yk-story-voice-contract">
                    <b>{v.contractValue}</b>
                    <span>{v.contractTitle}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="yk-neb-actions" style={{ marginTop: 36 }}>
            <button
              type="button"
              className="yk-neb-link"
              onClick={() => onNavigate("case-studies")}
            >
              Inspect All 6 Verified Delivery Dossiers &rarr;
            </button>
            <button
              type="button"
              className="yk-neb-link"
              onClick={() => onNavigate("faq")}
            >
              {t.marketing.fees.readFaq} &rarr;
            </button>
          </div>
        </section>

        {/* ─────────────────────────────────────────────────────────────────
            CHAPTER 07 · FINAL CONVERSION & DUAL-PATH ONBOARDING
           ───────────────────────────────────────────────────────────────── */}
        <section
          className="yk-ed-outro"
          id="story-cta"
          aria-labelledby="story-cta-heading"
        >
          <div>
            <div className="yk-ed-kicker">
              <i>07</i> / {t.marketing.categories.outroTitle}
            </div>
            <h2 id="story-cta-heading">{t.marketing.cta.title}</h2>
            <p>{t.marketing.cta.subtitle}</p>
          </div>
          <div className="yk-neb-actions">
            <button
              type="button"
              className="yk-neb-cta"
              onClick={() => onStart("register", "CLIENT")}
            >
              <span>{t.marketing.cta.postJob}</span>
              <i aria-hidden="true">&rarr;</i>
            </button>
            <button
              type="button"
              className="yk-neb-link"
              onClick={() => onStart("register", "FREELANCER")}
            >
              {t.marketing.cta.findWork} <ArrowUpRight size={14} />
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

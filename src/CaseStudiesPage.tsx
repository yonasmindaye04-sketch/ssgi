import { useState, useMemo } from "react";
import { ChevronDown } from "lucide-react";
import { useI18n } from "./i18n";
import { SubpageBackBar } from "./components/SubpageBackBar";

type CaseStudiesPageProps = {
  onNavigate: (page: string) => void;
  onStart?: (mode: "login" | "register") => void;
};

type CaseCategory =
  | "ALL"
  | "ENGINEERING"
  | "DESIGN"
  | "MARKETING"
  | "LOCALIZATION"
  | "DATA";

type CaseStudyItem = {
  id: string;
  category: Exclude<CaseCategory, "ALL">;
  categoryLabel: string;
  title: string;
  client: string;
  city: string;
  summary: string;
  budgetEtb: string;
  timeline: string;
  milestoneCount: number;
  rail: string;
  quote: string;
  quoteAuthor: string;
  outcomeMetric: string;
  milestones: { title: string; amount: string; duration: string }[];
};

const CASE_STUDIES: CaseStudyItem[] = [
  {
    id: "cs-abyssinia-fleet",
    category: "ENGINEERING",
    categoryLabel: "Web & Mobile Engineering",
    title: "Abyssinia Logistics Dispatch & Telebirr Driver Settlement Portal",
    client: "Abyssinia Freight & Cold-Chain PLC",
    city: "Addis Ababa",
    summary:
      "Built a real-time fleet tracking web application and mobile driver check-in portal with automated Telebirr trip allowances, replacing manual spreadsheet reconciliation across 140+ trucks.",
    budgetEtb: "85,000 ETB",
    timeline: "3 Weeks",
    milestoneCount: 4,
    rail: "Telebirr & CBE Birr",
    quote:
      "Approving each milestone released payment immediately. Our lead developer in Bahir Dar delivered every sprint ahead of schedule with zero payment friction.",
    quoteAuthor: "Yared K., Operations Director · Addis Ababa",
    outcomeMetric: "-68% dispatch reconciliation time",
    milestones: [
      {
        title: "01 · System Architecture & API Schema",
        amount: "15,000 ETB",
        duration: "4 days",
      },
      {
        title: "02 · Dispatcher Web Dashboard & Live Map",
        amount: "30,000 ETB",
        duration: "7 days",
      },
      {
        title: "03 · Driver Mobile Check-In & Telebirr Webhook",
        amount: "25,000 ETB",
        duration: "6 days",
      },
      {
        title: "04 · Load Testing, QA & Production Handover",
        amount: "15,000 ETB",
        duration: "4 days",
      },
    ],
  },
  {
    id: "cs-kaffa-coffee",
    category: "DESIGN",
    categoryLabel: "Design & Creative",
    title: "Kaffa Origin Specialty Coffee Export Identity & Packaging System",
    client: "Kaffa Highland Exporters Union",
    city: "Hawassa",
    summary:
      "Complete brand identity, bilingual export packaging dielines, and a wholesale buyer lookbook for specialty washed Arabica lots shipping to European and Middle Eastern roasters.",
    budgetEtb: "45,000 ETB",
    timeline: "2 Weeks",
    milestoneCount: 3,
    rail: "CBE Birr",
    quote:
      "Escrow gave our union board confidence to hire a top Addis studio remotely. We reviewed print-ready proofs inside Yekis before releasing each tranche.",
    quoteAuthor: "Meron G., Export Marketing Lead · Hawassa",
    outcomeMetric: "3 international buyer contracts signed",
    milestones: [
      {
        title: "01 · Brand Strategy, Wordmark & Color System",
        amount: "15,000 ETB",
        duration: "5 days",
      },
      {
        title: "02 · 250g & 1kg Export Bag Print Dielines",
        amount: "18,000 ETB",
        duration: "5 days",
      },
      {
        title: "03 · Digital Buyer Deck & Brand Guidelines",
        amount: "12,000 ETB",
        duration: "4 days",
      },
    ],
  },
  {
    id: "cs-zemen-localization",
    category: "LOCALIZATION",
    categoryLabel: "Translation & Localization",
    title:
      "Multilingual Maternal Health App Localization (Amharic, Afaan Oromoo & Tigrinya)",
    client: "Biruh Health Initiative NGO",
    city: "Bahir Dar",
    summary:
      "Medical-grade translation, voiceover recording, and cultural QA of 180+ maternal nutrition modules across Amharic, Afaan Oromoo, and Tigrinya for rural health extension workers.",
    budgetEtb: "38,000 ETB",
    timeline: "10 Days",
    milestoneCount: 3,
    rail: "Telebirr",
    quote:
      "Hiring three certified linguists through Yekis with TIN-compliant receipts saved our finance team weeks of grant auditing paperwork.",
    quoteAuthor: "Dr. Sara M., Program Coordinator · Bahir Dar",
    outcomeMetric: "180 modules localized with 100% clinical QA",
    milestones: [
      {
        title: "01 · Medical Glossary & Terminology Alignment",
        amount: "8,000 ETB",
        duration: "2 days",
      },
      {
        title: "02 · UI Strings & Lesson Script Translation",
        amount: "18,000 ETB",
        duration: "5 days",
      },
      {
        title: "03 · Native Audio Prompts & In-App Linguistic QA",
        amount: "12,000 ETB",
        duration: "3 days",
      },
    ],
  },
  {
    id: "cs-sheger-growth",
    category: "MARKETING",
    categoryLabel: "Digital Marketing",
    title: "Sheger Home & Electronics Telegram + TikTok Performance Launch",
    client: "Sheger Retail Group",
    city: "Addis Ababa",
    summary:
      "Produced 12 short-form Amharic product reels, automated a Telegram catalog bot funnel, and managed targeted holiday conversion campaigns with clear ROAS milestones.",
    budgetEtb: "52,000 ETB",
    timeline: "4 Weeks",
    milestoneCount: 3,
    rail: "Telebirr",
    quote:
      "We tied every milestone to verified creative deliverables and campaign setup. Sales inquiries on our Telegram channel tripled in the first two weeks.",
    quoteAuthor: "Hanna G., Founder · Addis Ababa",
    outcomeMetric: "3.4x return on campaign spend",
    milestones: [
      {
        title: "01 · Creative Scripting & 6 Studio Video Reels",
        amount: "20,000 ETB",
        duration: "10 days",
      },
      {
        title: "02 · Telegram Catalog Funnel & Pixel Tracking",
        amount: "14,000 ETB",
        duration: "7 days",
      },
      {
        title: "03 · Second Batch Reels & Conversion Optimization",
        amount: "18,000 ETB",
        duration: "11 days",
      },
    ],
  },
  {
    id: "cs-tigray-agri-data",
    category: "DATA",
    categoryLabel: "Data & Back-Office",
    title: "Regional Grain Market Price & Cooperative Inventory Analytics Suite",
    client: "Northern Highlands Cooperative Network",
    city: "Mekelle",
    summary:
      "Cleaned 4 years of historical commodity records, automated weekly woreda price ingestion forms, and delivered an interactive Power BI & Python reporting dashboard.",
    budgetEtb: "64,000 ETB",
    timeline: "3 Weeks",
    milestoneCount: 4,
    rail: "CBE Birr",
    quote:
      "Every dataset delivery was verified in the milestone workspace before release. Our analysts now publish weekly market briefs in 15 minutes instead of 3 days.",
    quoteAuthor: "Betty A., Operations Lead · Mekelle",
    outcomeMetric: "42,000+ historical records structured",
    milestones: [
      {
        title: "01 · Historical CSV/Excel Cleaning & Deduplication",
        amount: "16,000 ETB",
        duration: "5 days",
      },
      {
        title: "02 · Automated Mobile Data Collection Schema",
        amount: "16,000 ETB",
        duration: "5 days",
      },
      {
        title: "03 · Executive Price & Inventory Dashboard",
        amount: "20,000 ETB",
        duration: "6 days",
      },
      {
        title: "04 · Staff Training & Documentation Handover",
        amount: "12,000 ETB",
        duration: "5 days",
      },
    ],
  },
  {
    id: "cs-diredawa-portal",
    category: "ENGINEERING",
    categoryLabel: "Web & Mobile Engineering",
    title: "Dire Dawa Textile Supplier B2B Ordering & Customs Document Tracker",
    client: "East Rift Manufacturing PLC",
    city: "Dire Dawa",
    summary:
      "Engineered a secure supplier portal with role-based document sign-off, pro-forma invoice generation in ETB/USD, and automated SMS/Telegram status alerts.",
    budgetEtb: "110,000 ETB",
    timeline: "5 Weeks",
    milestoneCount: 4,
    rail: "CBE Birr & M-Pesa",
    quote:
      "Splitting a 110,000 ETB build into four clear milestones kept both our procurement team and the freelance engineering squad 100% aligned.",
    quoteAuthor: "Nardos A., Technical Lead · Dire Dawa",
    outcomeMetric: "100% digital pro-forma workflow",
    milestones: [
      {
        title: "01 · Role-Based Auth & Supplier Onboarding Flow",
        amount: "25,000 ETB",
        duration: "8 days",
      },
      {
        title: "02 · Pro-Forma Invoice & Customs Document Engine",
        amount: "35,000 ETB",
        duration: "10 days",
      },
      {
        title: "03 · Automated Telegram & SMS Alert Integration",
        amount: "28,000 ETB",
        duration: "9 days",
      },
      {
        title: "04 · Security Audit & Cloud Deployment",
        amount: "22,000 ETB",
        duration: "8 days",
      },
    ],
  },
];

export function CaseStudiesPage({ onNavigate, onStart }: CaseStudiesPageProps) {
  const { t } = useI18n();
  const [activeCategory, setActiveCategory] = useState<CaseCategory>("ALL");
  const [expandedId, setExpandedId] = useState<string | null>(
    "cs-abyssinia-fleet"
  );

  const categories: { id: CaseCategory; label: string }[] = [
    { id: "ALL", label: "All Stories" },
    {
      id: "ENGINEERING",
      label: `${t.marketing.categories.c1Title1} ${t.marketing.categories.c1Title2}`,
    },
    {
      id: "DESIGN",
      label: `${t.marketing.categories.c2Title1} ${t.marketing.categories.c2Title2}`,
    },
    {
      id: "MARKETING",
      label: `${t.marketing.categories.c3Title1} ${t.marketing.categories.c3Title2}`,
    },
    {
      id: "LOCALIZATION",
      label: `${t.marketing.categories.c5Title1} ${t.marketing.categories.c5Title2}`,
    },
    {
      id: "DATA",
      label: `${t.marketing.categories.c6Title1} ${t.marketing.categories.c6Title2}`,
    },
  ];

  const filteredStudies = useMemo(() => {
    if (activeCategory === "ALL") return CASE_STUDIES;
    return CASE_STUDIES.filter((item) => item.category === activeCategory);
  }, [activeCategory]);

  const handleStartProject = () => {
    if (onStart) {
      onStart("register");
    } else {
      onNavigate("home");
    }
  };

  return (
    <div className="yk-ed-page">
      <div className="yk-ed-container">
        <SubpageBackBar
          currentPage="case-studies"
          currentLabel={t.nav.caseStudies}
          onNavigate={onNavigate}
        />

        {/* Open Editorial Hero — Zero Boxes */}
        <header className="yk-ed-hero">
          <div className="yk-ed-kicker">
            <i>04</i> / VERIFIED DELIVERY DOSSIERS
          </div>
          <h1 className="yk-ed-title">
            {t.marketing.caseStudies.title.replace(/\.$/, "")}
            <em>.</em>
          </h1>
          <p className="yk-ed-lead">{t.marketing.caseStudies.subtitle}</p>

          <div className="yk-ed-metrics">
            <div>
              <b>394,000 ETB</b>
              <span>Featured Escrow Volume Released</span>
            </div>
            <div>
              <b>21 Milestones</b>
              <span>100% Approved Without Dispute Loss</span>
            </div>
            <div>
              <b>&lt; 15 min</b>
              <span>Median Wallet Payout After Approval</span>
            </div>
            <div>
              <b>5 Cities</b>
              <span>Addis · Bahir Dar · Hawassa · Mekelle · Dire Dawa</span>
            </div>
          </div>
        </header>

        {/* Minimal Unboxed Filter Bar */}
        <div
          className="yk-ed-filter-strip"
          role="tablist"
          aria-label="Filter case studies by category"
        >
          {categories.map((cat) => {
            const count =
              cat.id === "ALL"
                ? CASE_STUDIES.length
                : CASE_STUDIES.filter((s) => s.category === cat.id).length;
            return (
              <button
                key={cat.id}
                type="button"
                role="tab"
                aria-selected={activeCategory === cat.id}
                className={`yk-ed-filter-link ${activeCategory === cat.id ? "is-active" : ""}`}
                onClick={() => setActiveCategory(cat.id)}
              >
                <span>{cat.label}</span>
                <i>{count}</i>
              </button>
            );
          })}
        </div>

        {/* Open Editorial Dossier Rows — Zero Cards */}
        <section className="yk-ed-dossier-list" aria-label="Case study stories">
          {filteredStudies.map((study, idx) => {
            const isExpanded = expandedId === study.id;
            return (
              <article key={study.id} className="yk-ed-dossier-row">
                <div className="yk-ed-dossier-top">
                  <div className="yk-ed-dossier-meta">
                    <span className="yk-ed-dossier-idx">
                      0{idx + 1} · {study.city.toUpperCase()}
                    </span>
                    <span className="yk-ed-dossier-cat">
                      {study.categoryLabel}
                    </span>
                  </div>

                  <div className="yk-ed-dossier-main">
                    <h2>{study.title}</h2>
                    <p className="yk-ed-dossier-client">
                      Client: <strong>{study.client}</strong> &middot; Outcome:{" "}
                      <em>{study.outcomeMetric}</em>
                    </p>
                    <p className="yk-ed-dossier-summary">{study.summary}</p>
                    <blockquote className="yk-ed-dossier-quote">
                      &ldquo;{study.quote}&rdquo; —{" "}
                      <span>{study.quoteAuthor}</span>
                    </blockquote>
                  </div>

                  <div className="yk-ed-dossier-stats">
                    <div>
                      <b>{study.budgetEtb}</b>
                      <span>Escrow Budget</span>
                    </div>
                    <div>
                      <b>{study.timeline}</b>
                      <span>Delivery Time</span>
                    </div>
                    <div>
                      <b>{study.milestoneCount} Tranches</b>
                      <span>{study.rail}</span>
                    </div>
                    <button
                      type="button"
                      className="yk-ed-expand-btn"
                      aria-expanded={isExpanded}
                      onClick={() =>
                        setExpandedId(isExpanded ? null : study.id)
                      }
                    >
                      <span>
                        {isExpanded
                          ? "Hide Milestones"
                          : `Inspect ${study.milestoneCount} Milestones`}
                      </span>
                      <ChevronDown
                        size={15}
                        style={{
                          transform: isExpanded ? "rotate(180deg)" : "none",
                          transition: "transform 0.2s ease",
                        }}
                      />
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="yk-ed-dossier-milestones">
                    <ul className="yk-neb-list">
                      {study.milestones.map((ms) => (
                        <li key={ms.title}>
                          <span>{ms.duration.toUpperCase()}</span>
                          <b>{ms.title}</b>
                          <em>{ms.amount} · Released</em>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </article>
            );
          })}
        </section>

        {/* Minimal Unboxed Outro Row */}
        <section className="yk-ed-outro">
          <div>
            <h2>Ready to fund your first milestone in ETB?</h2>
            <p>
              Post your project scope for free, lock funds in escrow only when
              you choose a freelancer, and release payment when each milestone
              is approved.
            </p>
          </div>
          <div className="yk-neb-actions">
            <button
              type="button"
              className="yk-neb-cta"
              onClick={handleStartProject}
            >
              <span>{t.marketing.cta.postJob}</span>
              <i aria-hidden="true">&rarr;</i>
            </button>
            <button
              type="button"
              className="yk-neb-link"
              onClick={() => onNavigate("fees")}
            >
              Simulate ETB Escrow Fees &rarr;
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}

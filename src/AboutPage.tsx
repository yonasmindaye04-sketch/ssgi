import { useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { useI18n } from "./i18n";
import { openSupportChat } from "./components/supportChatEvents";
import { SubpageBackBar } from "./components/SubpageBackBar";

type AboutPageProps = {
  onNavigate: (page: string) => void;
  onStart: (mode: "login" | "register") => void;
};

const TEAM_MEMBERS = [
  {
    num: "01",
    name: "Dawit Alemu",
    role: "Founder & Engineering",
    bio: "Architected Yekis's double-entry ETB escrow ledger, Telebirr/CBE payout integrations, and Fayda identity verification pipeline.",
  },
  {
    num: "02",
    name: "Selamawit Tadesse",
    role: "Escrow & Tax Compliance",
    bio: "Oversees Ethiopian ERCA withholding tax automation (3% TIN-verified vs. 30% statutory) and commercial bank reconciliation.",
  },
  {
    num: "03",
    name: "Bereket Hailu",
    role: "Dispute Mediation Lead",
    bio: "Leads evidence-backed contract arbitration in Addis Ababa, ensuring milestone disputes are reviewed by a human specialist within 48 hours.",
  },
  {
    num: "04",
    name: "Hana Mekonnen",
    role: "Community & Freelancer Success",
    bio: "Supports 480+ verified Ethiopian developers, designers, translators, and analysts across Addis Ababa, Bahir Dar, Hawassa, and Mekelle.",
  },
];

export function AboutPage({ onNavigate, onStart }: AboutPageProps) {
  const { t } = useI18n();

  const [fullName, setFullName] = useState("");
  const [contactInfo, setContactInfo] = useState("");
  const [topic, setTopic] = useState("ESCROW_INQUIRY");
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const pillars = [
    {
      num: "01 / ESCROW",
      title: t.marketing.about.feature1Title,
      body: t.marketing.about.feature1Desc,
    },
    {
      num: "02 / IDENTITY",
      title: t.marketing.about.feature2Title,
      body: t.marketing.about.feature2Desc,
    },
    {
      num: "03 / MEDIATION",
      title: t.marketing.about.feature3Title,
      body: t.marketing.about.feature3Desc,
    },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !contactInfo.trim() || !message.trim()) {
      setError("Please fill in your name, email or phone (+251), and message.");
      return;
    }
    setError(null);
    setSubmitted(true);
  };

  return (
    <div className="yk-ed-page">
      <div className="yk-ed-container">
        <SubpageBackBar
          currentPage="about"
          currentLabel={t.nav.about}
          onNavigate={onNavigate}
        />

        {/* Open Editorial Hero — Zero Boxes */}
        <header className="yk-ed-hero">
          <div className="yk-ed-kicker">
            <i>03</i> / {t.marketing.about.eyebrow}
          </div>
          <h1 className="yk-ed-title">
            {t.marketing.about.title.replace(".", "")}
            <em>.</em>
          </h1>
          <p className="yk-ed-quote">
            &ldquo;{t.marketing.about.missionQuote}&rdquo;
          </p>
          <p className="yk-ed-lead">{t.marketing.about.intro}</p>

          <div className="yk-ed-metrics">
            <div>
              <b>Addis Ababa</b>
              <span>Built &amp; Operated in Ethiopia</span>
            </div>
            <div>
              <b>100% ETB</b>
              <span>Telebirr, CBE Birr &amp; M-Pesa Native</span>
            </div>
            <div>
              <b>Fayda + TIN</b>
              <span>Verified Counterparty Identity</span>
            </div>
            <div>
              <b>4 Languages</b>
              <span>English · አማርኛ · Afaan Oromoo · ትግርኛ</span>
            </div>
          </div>
        </header>

        {/* Open Two-Column Narrative & Three Guarantees — Zero Boxes */}
        <section className="yk-ed-split yk-ed-split-equal">
          <div className="yk-ed-col-left">
            <div className="yk-ed-kicker">THE PROBLEM WE SOLVE</div>
            <h2 className="yk-ed-h2">{t.marketing.about.problemTitle}</h2>
            <p className="yk-ed-body">{t.marketing.about.problemBody}</p>
            <p className="yk-ed-body">{t.marketing.about.intro}</p>

            <div className="yk-neb-actions" style={{ marginTop: 28 }}>
              <button
                type="button"
                className="yk-neb-cta"
                onClick={() => onStart("register")}
              >
                <span>{t.nav.getStarted}</span>
                <i aria-hidden="true">&rarr;</i>
              </button>
              <button
                type="button"
                className="yk-neb-link"
                onClick={() => onNavigate("case-studies")}
              >
                Explore Case Studies &rarr;
              </button>
            </div>
          </div>

          <div className="yk-ed-col-right">
            <div className="yk-ed-kicker">THREE NON-NEGOTIABLE GUARANTEES</div>
            <div className="yk-ed-pillars">
              {pillars.map((p) => (
                <div key={p.num} className="yk-ed-pillar-row">
                  <span className="yk-ed-pillar-num">{p.num}</span>
                  <h3>{p.title}</h3>
                  <p>{p.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Open Leadership Directory — Hairline Rows, Zero Boxes */}
        <section className="yk-ed-section" aria-labelledby="about-team-heading">
          <div className="yk-ed-kicker">LEADERSHIP &amp; OPERATIONS</div>
          <h2 className="yk-ed-h2" id="about-team-heading">
            {t.marketing.about.teamTitle}
          </h2>
          <ul className="yk-ed-team-list">
            {TEAM_MEMBERS.map((member) => (
              <li key={member.name}>
                <span className="yk-ed-team-num">{member.num}</span>
                <div className="yk-ed-team-who">
                  <strong>{member.name}</strong>
                  <em>{member.role}</em>
                </div>
                <p className="yk-ed-team-bio">{member.bio}</p>
              </li>
            ))}
          </ul>
        </section>

        {/* Open Contact Directory & Minimal Bottom-Bordered Inquiry Form */}
        <section
          className="yk-ed-split yk-ed-split-equal"
          aria-labelledby="about-contact-heading"
        >
          <div className="yk-ed-col-left">
            <div className="yk-ed-kicker">DIRECT CHANNELS</div>
            <h2 className="yk-ed-h2" id="about-contact-heading">
              {t.marketing.about.contactTitle}
            </h2>
            <p className="yk-ed-body">
              Reach our Addis Ababa operations desk directly via email, phone,
              Telegram, or live support chat.
            </p>

            <ul className="yk-neb-list" style={{ marginTop: 20 }}>
              <li>
                <span>EMAIL</span>
                <b>
                  <a href="mailto:support@yekis.com">
                    {t.marketing.about.email}
                  </a>
                </b>
                <em>
                  <ArrowUpRight size={14} />
                </em>
              </li>
              <li>
                <span>PHONE</span>
                <b>
                  <a href="tel:+251911000000">{t.marketing.about.phone}</a>
                </b>
                <em>
                  <ArrowUpRight size={14} />
                </em>
              </li>
              <li>
                <span>TELEGRAM</span>
                <b>
                  <a
                    href="https://t.me/yekis_channel"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {t.marketing.about.telegramChannel}
                  </a>
                </b>
                <em>
                  <ArrowUpRight size={14} />
                </em>
              </li>
              <li>
                <span>COMMUNITY</span>
                <b>
                  <a
                    href="https://t.me/yekis_group"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {t.marketing.about.telegramGroup}
                  </a>
                </b>
                <em>
                  <ArrowUpRight size={14} />
                </em>
              </li>
              <li>
                <span>BOT</span>
                <b>
                  <a
                    href="https://t.me/ye_kis_bot"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {t.marketing.about.telegramBot}
                  </a>
                </b>
                <em>
                  <ArrowUpRight size={14} />
                </em>
              </li>
            </ul>

            <div className="yk-neb-actions" style={{ marginTop: 24 }}>
              <button
                type="button"
                className="yk-neb-link"
                onClick={() => openSupportChat()}
              >
                Open Live Support Desk &rarr;
              </button>
            </div>
          </div>

          <div className="yk-ed-col-right">
            <div className="yk-ed-kicker">OPERATIONS DESK</div>
            <h2 className="yk-ed-h2">Send a Message</h2>

            {submitted ? (
              <div className="yk-ed-empty" aria-live="polite">
                <h3>Message received by Addis Ababa Operations</h3>
                <p>
                  Thank you, <strong>{fullName}</strong>. A Yekis escrow
                  specialist will respond via <strong>{contactInfo}</strong>{" "}
                  within 4 business hours.
                </p>
                <button
                  type="button"
                  className="yk-neb-link"
                  onClick={() => {
                    setSubmitted(false);
                    setFullName("");
                    setContactInfo("");
                    setMessage("");
                  }}
                >
                  Send another message &rarr;
                </button>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                noValidate
                className="yk-ed-min-form"
              >
                <label>
                  <span>Full Name</span>
                  <input
                    type="text"
                    placeholder="e.g. Abebe Kebede"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </label>

                <label>
                  <span>Email or Ethiopian Phone (+251)</span>
                  <input
                    type="text"
                    placeholder="abebe@company.et or +251 911 234 567"
                    value={contactInfo}
                    onChange={(e) => setContactInfo(e.target.value)}
                  />
                </label>

                <label>
                  <span>Topic</span>
                  <select
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                  >
                    <option value="ESCROW_INQUIRY">
                      Enterprise / NGO Escrow Onboarding
                    </option>
                    <option value="TIN_TAX">
                      ERCA Withholding &amp; TIN Compliance
                    </option>
                    <option value="DISPUTE">
                      Milestone Dispute &amp; Mediation
                    </option>
                    <option value="PARTNERSHIP">
                      University or Payment Rail Partnership
                    </option>
                  </select>
                </label>

                <label>
                  <span>How can we help?</span>
                  <textarea
                    rows={3}
                    placeholder="Describe your project scope, escrow question, or support request..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  />
                </label>

                {error && (
                  <p className="yk-ed-form-error" role="alert">
                    {error}
                  </p>
                )}

                <div style={{ marginTop: 18 }}>
                  <button type="submit" className="yk-neb-cta">
                    <span>Send Message to Operations</span>
                    <i aria-hidden="true">&rarr;</i>
                  </button>
                </div>
              </form>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

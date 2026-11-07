import { useState, useMemo, useRef, useEffect } from "react";
import { Search, X, ChevronDown } from "lucide-react";
import { events } from "./analytics";
import { useI18n } from "./i18n";
import { openSupportChat } from "./components/supportChatEvents";
import { SubpageBackBar } from "./components/SubpageBackBar";

type FAQPageProps = {
  onNavigate: (page: string) => void;
  onStart: (mode: "login" | "register") => void;
};

type QuestionItem = {
  key: string;
  catIndex: number;
  category: string;
  q: string;
  a: string;
  id?: string;
  link?: string;
};

export function FAQPage({ onNavigate, onStart }: FAQPageProps) {
  const { t } = useI18n();
  const inputRef = useRef<HTMLInputElement>(null);

  const categories = useMemo<
    {
      title: string;
      questions: { q: string; a: string; id?: string; link?: string }[];
    }[]
  >(
    () => [
      {
        title: t.marketing.faq.trustTitle,
        questions: [
          { q: t.marketing.faq.q1, a: t.marketing.faq.a1 },
          { q: t.marketing.faq.q2, a: t.marketing.faq.a2 },
          { q: t.marketing.faq.q3, a: t.marketing.faq.a3, id: "disputes" },
          { q: t.marketing.faq.q4, a: t.marketing.faq.a4 },
        ],
      },
      {
        title: t.marketing.faq.startTitle,
        questions: [
          { q: t.marketing.faq.q5, a: t.marketing.faq.a5 },
          { q: t.marketing.faq.q6, a: t.marketing.faq.a6 },
          { q: t.marketing.faq.q7, a: t.marketing.faq.a7, link: "fees" },
          { q: t.marketing.faq.q8, a: t.marketing.faq.a8 },
        ],
      },
      {
        title: t.marketing.faq.paidTitle,
        questions: [
          { q: t.marketing.faq.q9, a: t.marketing.faq.a9 },
          { q: t.marketing.faq.q10, a: t.marketing.faq.a10 },
          { q: t.marketing.faq.q11, a: t.marketing.faq.a11 },
        ],
      },
    ],
    [t]
  );

  const allQuestions: QuestionItem[] = useMemo(() => {
    const list: QuestionItem[] = [];
    categories.forEach((cat, catIdx) => {
      cat.questions.forEach((item, qIdx) => {
        list.push({
          key: `faq-${catIdx}-${qIdx}`,
          catIndex: catIdx,
          category: cat.title,
          q: item.q,
          a: item.a,
          id: item.id,
          link: item.link,
        });
      });
    });
    return list;
  }, [categories]);

  const [activeCategory, setActiveCategory] = useState<"ALL" | number>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [openKey, setOpenKey] = useState<string | null>("faq-0-0");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      const typing =
        el &&
        (el.tagName === "INPUT" ||
          el.tagName === "TEXTAREA" ||
          el.isContentEditable);
      if (e.key === "/" && !typing) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const filteredQuestions = useMemo(() => {
    const needle = searchQuery.trim().toLowerCase();
    return allQuestions.filter((item) => {
      if (activeCategory !== "ALL" && item.catIndex !== activeCategory) {
        return false;
      }
      if (!needle) return true;
      return `${item.q} ${item.a} ${item.category}`
        .toLowerCase()
        .includes(needle);
    });
  }, [allQuestions, activeCategory, searchQuery]);

  const groupedVisible = useMemo(() => {
    const map = new Map<number, { category: string; items: QuestionItem[] }>();
    filteredQuestions.forEach((item) => {
      const existing = map.get(item.catIndex);
      if (existing) {
        existing.items.push(item);
      } else {
        map.set(item.catIndex, { category: item.category, items: [item] });
      }
    });
    return Array.from(map.entries());
  }, [filteredQuestions]);

  const handleToggle = (key: string, question: string) => {
    if (openKey !== key) {
      events.faqExpanded(question);
    }
    setOpenKey(openKey === key ? null : key);
  };

  return (
    <div className="yk-ed-page">
      <div className="yk-ed-container">
        <SubpageBackBar
          currentPage="faq"
          currentLabel={t.nav.faq}
          onNavigate={onNavigate}
        />

        {/* Open Editorial Hero — Zero Boxes */}
        <header className="yk-ed-hero">
          <div className="yk-ed-kicker">
            <i>01</i> / {t.marketing.faq.eyebrow}
          </div>
          <h1 className="yk-ed-title">
            {t.marketing.faq.title.replace(".", "")}
            <em>.</em>
          </h1>
          <p className="yk-ed-lead">{t.marketing.faq.subtitle}</p>

          <div className="yk-ed-metrics">
            <div>
              <b>100%</b>
              <span>Milestone Funds Held in ETB Escrow</span>
            </div>
            <div>
              <b>&lt; 48h</b>
              <span>Evidence-Backed Dispute Review</span>
            </div>
            <div>
              <b>97.5%</b>
              <span>Freelancer Payout Retained</span>
            </div>
            <div>
              <b>3 Rails</b>
              <span>Telebirr · CBE Birr · M-Pesa</span>
            </div>
          </div>
        </header>

        {/* Open Two-Column Layout: Left Search & Categories, Right Unboxed Hairline Accordion */}
        <section className="yk-ed-split" aria-label="Frequently Asked Questions">
          <aside className="yk-ed-sidebar">
            <label className="yk-ed-search">
              <Search size={18} className="yk-ed-search-icon" />
              <input
                ref={inputRef}
                type="search"
                placeholder={t.marketing.faq.searchPlaceholder}
                aria-label={t.marketing.faq.searchPlaceholder}
                autoComplete="off"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery ? (
                <button
                  type="button"
                  className="yk-ed-search-clear"
                  onClick={() => setSearchQuery("")}
                  aria-label="Clear search"
                >
                  <X size={15} />
                </button>
              ) : (
                <kbd>/</kbd>
              )}
            </label>

            <nav className="yk-ed-cat-nav" aria-label="FAQ Categories">
              <button
                type="button"
                className={`yk-ed-cat-btn ${activeCategory === "ALL" ? "is-active" : ""}`}
                onClick={() => setActiveCategory("ALL")}
              >
                <span>All Questions</span>
                <i>{allQuestions.length}</i>
              </button>
              {categories.map((cat, idx) => (
                <button
                  key={cat.title}
                  type="button"
                  className={`yk-ed-cat-btn ${activeCategory === idx ? "is-active" : ""}`}
                  onClick={() => setActiveCategory(idx)}
                >
                  <span>{cat.title}</span>
                  <i>{cat.questions.length}</i>
                </button>
              ))}
            </nav>

            <div className="yk-ed-side-note">
              <h4>Need direct help with a milestone?</h4>
              <p>
                Our Addis Ababa operations desk responds in English and Amharic.
              </p>
              <div className="yk-ed-inline-actions">
                <button
                  type="button"
                  className="yk-neb-link"
                  onClick={() => {
                    if (!openSupportChat()) {
                      onNavigate("about");
                    }
                  }}
                >
                  Open Live Support &rarr;
                </button>
                <button
                  type="button"
                  className="yk-neb-link"
                  onClick={() => onNavigate("fees")}
                >
                  {t.marketing.faq.viewFees} &rarr;
                </button>
              </div>
            </div>
          </aside>

          <div className="yk-ed-main">
            {filteredQuestions.length === 0 ? (
              <div className="yk-ed-empty" aria-live="polite">
                <p>{t.marketing.faq.noResults}</p>
                <button
                  type="button"
                  className="yk-neb-link"
                  onClick={() => {
                    setSearchQuery("");
                    setActiveCategory("ALL");
                  }}
                >
                  Reset filters &rarr;
                </button>
              </div>
            ) : (
              groupedVisible.map(([catIdx, group]) => (
                <div key={`group-${catIdx}`} className="yk-ed-faq-group">
                  <div className="yk-ed-group-label">
                    <i>0{catIdx + 1}</i> / {group.category}
                  </div>
                  <ul className="yk-ed-accordion">
                    {group.items.map((item) => {
                      const isOpen = openKey === item.key;
                      return (
                        <li
                          key={item.key}
                          id={item.id}
                          className={isOpen ? "is-open" : ""}
                        >
                          <button
                            type="button"
                            className="yk-ed-acc-trigger"
                            aria-expanded={isOpen}
                            onClick={() => handleToggle(item.key, item.q)}
                          >
                            <span>{item.q}</span>
                            <ChevronDown
                              size={18}
                              className="yk-ed-acc-chevron"
                            />
                          </button>
                          {isOpen && (
                            <div className="yk-ed-acc-body">
                              <p>{item.a}</p>
                              {item.link && (
                                <button
                                  type="button"
                                  className="yk-neb-link"
                                  style={{ marginTop: 12 }}
                                  onClick={() => onNavigate(item.link!)}
                                >
                                  {t.marketing.faq.viewFees} &rarr;
                                </button>
                              )}
                            </div>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Minimal Unboxed Outro Row */}
        <section className="yk-ed-outro">
          <div>
            <h2>{t.marketing.cta.title}</h2>
            <p>{t.marketing.cta.subtitle}</p>
          </div>
          <div className="yk-neb-actions">
            <button
              type="button"
              className="yk-neb-cta"
              onClick={() => onStart("register")}
            >
              <span>{t.marketing.cta.postJob}</span>
              <i aria-hidden="true">&rarr;</i>
            </button>
            <button
              type="button"
              className="yk-neb-link"
              onClick={() => onStart("register")}
            >
              {t.marketing.cta.findWork} &rarr;
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}

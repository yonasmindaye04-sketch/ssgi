import React from "react";
import { ArrowLeft } from "lucide-react";
import { useI18n } from "../i18n";

interface SubpageBackBarProps {
  currentPage: "faq" | "fees" | "about" | "case-studies" | "privacy" | "terms";
  currentLabel: string;
  onNavigate: (page: string) => void;
}

export const SubpageBackBar: React.FC<SubpageBackBarProps> = ({
  currentPage,
  currentLabel,
  onNavigate,
}) => {
  const { t } = useI18n();

  const subpages = [
    { id: "faq", label: t.nav.faq },
    { id: "fees", label: t.nav.fees },
    { id: "about", label: t.nav.about },
    { id: "case-studies", label: t.nav.caseStudies },
  ] as const;

  return (
    <nav className="yk-ed-backbar" aria-label="Subpage navigation">
      <div className="yk-ed-backbar-left">
        <button
          type="button"
          className="yk-ed-back-btn"
          onClick={() => onNavigate("home")}
        >
          <ArrowLeft size={16} />
          <span>{t.nav.backToHome}</span>
        </button>
        <span className="yk-ed-crumb-sep" aria-hidden="true">
          /
        </span>
        <span className="yk-ed-crumb-current">{currentLabel}</span>
      </div>

      <div className="yk-ed-backbar-links" role="list">
        {subpages.map((sp) => {
          const active = currentPage === sp.id;
          return (
            <button
              key={sp.id}
              type="button"
              className={`yk-ed-sublink ${active ? "is-active" : ""}`}
              onClick={() => onNavigate(sp.id)}
              aria-current={active ? "page" : undefined}
            >
              {sp.label}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

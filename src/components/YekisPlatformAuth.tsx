import React, { useState } from "react";
import { ArrowLeft, Moon, Sun, Eye, EyeOff, X, Send, ExternalLink } from "lucide-react";
import { useTheme } from "../theme/ThemeContext";
import { useI18n } from "../i18n";
import { LanguageSelector } from "./LanguageSelector";

export type PlatformAuthMode = "login" | "register" | "forgot-password" | "reset-password";
export type PlatformRoleChoice = "CLIENT" | "FREELANCER" | "BOTH";

interface YekisPlatformAuthProps {
  initialMode?: "login" | "register";
  initialRole?: PlatformRoleChoice;
  onBackToHome: () => void;
  onAuthed?: (session: { email: string; role: PlatformRoleChoice; mode: PlatformAuthMode }) => void;
}

function AuthVisualAnimation() {
  return (
    <div className="auth-vis" aria-hidden="true">
      {/* Soft gradient accent */}
      <div className="auth-vis-glow" />

      {/* Dot grid texture */}
      <svg className="auth-vis-dots" viewBox="0 0 200 200">
        {Array.from({ length: 100 }, (_, i) => {
          const col = i % 10;
          const row = Math.floor(i / 10);
          return (
            <circle
              key={i}
              cx={col * 22 + 5}
              cy={row * 22 + 5}
              r="1.2"
              fill="var(--color-text-secondary)"
              opacity="0.18"
            />
          );
        })}
      </svg>

      {/* Key metrics row */}
      <div className="auth-vis-metrics">
        <div className="auth-vis-metric" style={{ animationDelay: "0.4s" }}>
          <span className="auth-vis-metric-num">2,400+</span>
          <span className="auth-vis-metric-label">Contracts signed</span>
        </div>
        <div className="auth-vis-metric-divider" />
        <div className="auth-vis-metric" style={{ animationDelay: "0.7s" }}>
          <span className="auth-vis-metric-num">ETB 12M+</span>
          <span className="auth-vis-metric-label">Secured in escrow</span>
        </div>
        <div className="auth-vis-metric-divider" />
        <div className="auth-vis-metric" style={{ animationDelay: "1.0s" }}>
          <span className="auth-vis-metric-num">98%</span>
          <span className="auth-vis-metric-label">Payout success rate</span>
        </div>
      </div>

      {/* Live activity feed — staggered slide-ins */}
      <div className="auth-vis-feed">
        <div className="auth-vis-feed-item" style={{ animationDelay: "1.2s" }}>
          <div className="auth-vis-feed-icon green" />
          <div className="auth-vis-feed-body">
            <strong>Milestone delivered</strong>
            <span>UI Design — ETB 18,000</span>
          </div>
          <span className="auth-vis-feed-time">2m ago</span>
        </div>
        <div className="auth-vis-feed-item" style={{ animationDelay: "1.8s" }}>
          <div className="auth-vis-feed-icon blue" />
          <div className="auth-vis-feed-body">
            <strong>Contract signed</strong>
            <span>Mobile App Development</span>
          </div>
          <span className="auth-vis-feed-time">8m ago</span>
        </div>
        <div className="auth-vis-feed-item" style={{ animationDelay: "2.4s" }}>
          <div className="auth-vis-feed-icon green" />
          <div className="auth-vis-feed-body">
            <strong>Escrow funded</strong>
            <span>ETB 24,500 locked</span>
          </div>
          <span className="auth-vis-feed-time">14m ago</span>
        </div>
      </div>

      {/* Trust badges row */}
      <div className="auth-vis-trust">
        <div className="auth-vis-trust-badge" style={{ animationDelay: "2.8s" }}>
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
          <span>Held while you review</span>
        </div>
        <div className="auth-vis-trust-badge" style={{ animationDelay: "3.1s" }}>
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <span>KYC verified</span>
        </div>
        <div className="auth-vis-trust-badge" style={{ animationDelay: "3.4s" }}>
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
            <line x1="1" y1="10" x2="23" y2="10" />
          </svg>
          <span>Telebirr &amp; CBE</span>
        </div>
      </div>
    </div>
  );
}

export const YekisPlatformAuth: React.FC<YekisPlatformAuthProps> = ({
  initialMode = "login",
  initialRole = "CLIENT",
  onBackToHome,
  onAuthed,
}) => {
  const { theme, toggleTheme } = useTheme();
  const { t } = useI18n();

  const [authMode, setAuthMode] = useState<PlatformAuthMode>(initialMode);
  const [role, setRole] = useState<PlatformRoleChoice>(initialRole);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [password, setPassword] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showCookiePrefs, setShowCookiePrefs] = useState(false);
  const [consentNotifications, setConsentNotifications] = useState(true);
  const [consentMarketing, setConsentMarketing] = useState(false);
  const [consentAnalytics, setConsentAnalytics] = useState(true);
  const [legalModal, setLegalModal] = useState<"terms" | "privacy" | null>(null);
  const [showTelegramModal, setShowTelegramModal] = useState(false);
  const [telegramCode, setTelegramCode] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const submitAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }

    if (authMode === "forgot-password") {
      setSuccessMessage("Password reset instructions have been sent to your email.");
      return;
    }

    if (authMode === "register") {
      if (!phone.trim() || phone.trim().length < 9) {
        setError("Please enter a valid Ethiopian phone number (+251...).");
        return;
      }
      if (!dateOfBirth) {
        setError("Please select your date of birth.");
        return;
      }
      if (password.length < 10) {
        setError("Password must be at least 10 characters long.");
        return;
      }
      if (!termsAccepted) {
        setError("Please agree to the Terms & Privacy Policy.");
        return;
      }
    } else if (!password.trim()) {
      setError("Please enter your password.");
      return;
    }

    setIsLoading(true);
    window.setTimeout(() => {
      setIsLoading(false);
      setSuccessMessage(
        authMode === "login"
          ? `Signed in as ${email.trim()}. Redirecting to your Yekis workspace...`
          : `Account created for ${email.trim()} (${role}). Your Yekis escrow workspace is ready.`
      );
      onAuthed?.({ email: email.trim(), role, mode: authMode });
    }, 250);
  };

  return (
    <main className="platform-auth" data-testid="yekis-platform-auth">
      <div
        style={{
          position: "absolute",
          top: 20,
          left: 24,
          right: 24,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          zIndex: 10,
        }}
      >
        <button
          type="button"
          className="auth-back"
          style={{ position: "static" }}
          onClick={() => {
            setError("");
            setSuccessMessage("");
            onBackToHome();
          }}
        >
          <ArrowLeft size={17} /> {t.nav.backToHome}
        </button>

        <div
          className="auth-header-actions"
          style={{ display: "flex", alignItems: "center", gap: 10 }}
        >
          <LanguageSelector variant="dropdown" />
          <button
            type="button"
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label={
              theme === "light" ? "Switch to dark mode" : "Switch to light mode"
            }
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 44,
              height: 44,
              borderRadius: "50%",
              background: "var(--color-bg-elevated)",
              border: "1px solid var(--color-border)",
              color: "var(--color-text)",
              cursor: "pointer",
            }}
          >
            {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
          </button>
        </div>
      </div>

      {/* Left Art Column */}
      <div className="platform-auth-art">
        <img
          src="/svgviewer-output.svg"
          alt="Yekis Logo"
          className="platform-logo"
          style={{ width: 72, height: 72, borderRadius: 18, marginBottom: 8 }}
        />
        <p className="eyebrow">Yekis jobs</p>
        <h1>Work with clarity.</h1>
        <p>
          Find trusted talent, manage milestone work, and keep payments visible
          from brief to delivery.
        </p>
        <div className="auth-proof">
          <span>01</span>
          <strong>Jobs, contracts, and escrow in one workspace.</strong>
        </div>
        <div className="auth-proof">
          <span>02</span>
          <strong>Built for Ethiopian clients and freelancers.</strong>
        </div>
        <AuthVisualAnimation />
      </div>

      {/* Right Form Column */}
      <form className="auth-panel" onSubmit={submitAuth} noValidate>
        <div className="auth-panel-header">
          <div>
            <p className="eyebrow">
              {authMode === "login"
                ? t.workspace.auth.welcomeBack
                : authMode === "forgot-password"
                  ? t.workspace.auth.recoverAccount
                  : authMode === "reset-password"
                    ? t.workspace.auth.setNewPassword
                    : t.workspace.auth.getStarted}
            </p>
            <h2>
              {authMode === "login"
                ? t.workspace.auth.signInTitle
                : authMode === "forgot-password"
                  ? t.workspace.auth.forgotTitle
                  : authMode === "reset-password"
                    ? t.workspace.auth.resetTitle
                    : t.workspace.auth.createTitle}
            </h2>
          </div>
        </div>

        {authMode === "register" && (
          <div
            className="segmented-control"
            style={{ gridTemplateColumns: "repeat(3, 1fr)" }}
          >
            <button
              type="button"
              className={role === "CLIENT" ? "selected" : ""}
              onClick={() => setRole("CLIENT")}
            >
              {t.workspace.roles.client}
            </button>
            <button
              type="button"
              className={role === "FREELANCER" ? "selected" : ""}
              onClick={() => setRole("FREELANCER")}
            >
              {t.workspace.roles.freelancer}
            </button>
            <button
              type="button"
              className={role === "BOTH" ? "selected" : ""}
              onClick={() => setRole("BOTH")}
              title="Hire talent and take on work with one account"
            >
              {t.workspace.roles.both}
            </button>
          </div>
        )}

        {(authMode === "login" ||
          authMode === "register" ||
          authMode === "forgot-password") && (
          <label style={{ fontSize: "0.8rem", fontWeight: 600 }}>
            {t.workspace.auth.emailLabel}
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              required
              style={{
                padding: "8px 12px",
                marginTop: "3px",
                fontSize: "0.88rem",
                borderRadius: "8px",
              }}
            />
          </label>
        )}

        {authMode === "register" && (
          <div
            className="auth-row-split"
            style={{
              display: "grid",
              gridTemplateColumns: "1.15fr 0.85fr",
              gap: "10px",
              marginTop: "4px",
            }}
          >
            <label style={{ margin: 0, fontSize: "0.8rem", fontWeight: 600 }}>
              {t.workspace.auth.phoneLabel}
              <input
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                placeholder="+251911223344"
                required
                style={{
                  padding: "8px 12px",
                  marginTop: "3px",
                  fontSize: "0.88rem",
                  borderRadius: "8px",
                }}
              />
            </label>
            <label style={{ margin: 0, fontSize: "0.8rem", fontWeight: 600 }}>
              {t.workspace.auth.dobLabel}
              <input
                type="date"
                value={dateOfBirth}
                onChange={(event) => setDateOfBirth(event.target.value)}
                required
                style={{
                  padding: "8px 12px",
                  marginTop: "3px",
                  fontSize: "0.88rem",
                  borderRadius: "8px",
                }}
              />
            </label>
          </div>
        )}

        {authMode === "reset-password" && (
          <label style={{ fontSize: "0.8rem", fontWeight: 600 }}>
            {t.workspace.auth.resetTokenLabel}
            <input
              type="text"
              value={resetToken}
              onChange={(event) => setResetToken(event.target.value)}
              placeholder="Enter reset token"
              required
              style={{
                padding: "8px 12px",
                marginTop: "3px",
                fontSize: "0.88rem",
                borderRadius: "8px",
              }}
            />
          </label>
        )}

        {(authMode === "login" ||
          authMode === "register" ||
          authMode === "reset-password") && (
          <div style={{ marginTop: "6px" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "4px",
              }}
            >
              <label
                htmlFor="yekis-auth-password"
                style={{
                  margin: 0,
                  fontSize: "0.82rem",
                  fontWeight: 600,
                  color: "var(--color-text-secondary)",
                }}
              >
                {authMode === "reset-password"
                  ? t.workspace.auth.newPasswordLabel
                  : t.workspace.auth.passwordLabel}
              </label>
              {authMode === "login" && (
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode("forgot-password");
                    setError("");
                    setSuccessMessage("");
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    padding: 0,
                    color: "var(--color-primary)",
                    fontSize: "0.8rem",
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "opacity 0.15s ease",
                  }}
                >
                  {t.workspace.auth.forgotPasswordBtn}
                </button>
              )}
            </div>
            <div style={{ position: "relative" }}>
              <input
                id="yekis-auth-password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Your password"
                minLength={
                  authMode === "register" || authMode === "reset-password"
                    ? 10
                    : undefined
                }
                required
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  paddingRight: "40px",
                  paddingLeft: "12px",
                  paddingTop: "9px",
                  paddingBottom: "9px",
                  margin: 0,
                  fontSize: "0.88rem",
                  borderRadius: "8px",
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute",
                  right: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "var(--color-text-secondary)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                }}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
        )}

        {authMode === "register" && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 6,
              marginTop: 8,
              marginBottom: 2,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 8,
                fontSize: "0.82rem",
                color: "var(--color-text-secondary)",
              }}
            >
              <label
                htmlFor="termsCheck"
                style={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 8,
                  margin: 0,
                  cursor: "pointer",
                  fontSize: "0.82rem",
                }}
              >
                <input
                  id="termsCheck"
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={(event) => setTermsAccepted(event.target.checked)}
                  required
                  style={{
                    accentColor: "var(--color-primary)",
                    flexShrink: 0,
                    margin: 0,
                    width: "16px",
                    height: "16px",
                    cursor: "pointer",
                  }}
                />
                <span>
                  I agree to the{" "}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setLegalModal("terms");
                    }}
                    style={{
                      background: "none",
                      border: "none",
                      padding: 0,
                      color: "var(--color-primary)",
                      fontWeight: 600,
                      textDecoration: "underline",
                      cursor: "pointer",
                      fontSize: "inherit",
                    }}
                  >
                    Terms
                  </button>
                  {" & "}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setLegalModal("privacy");
                    }}
                    style={{
                      background: "none",
                      border: "none",
                      padding: 0,
                      color: "var(--color-primary)",
                      fontWeight: 600,
                      textDecoration: "underline",
                      cursor: "pointer",
                      fontSize: "inherit",
                    }}
                  >
                    Privacy Policy
                  </button>
                </span>
              </label>

              <button
                type="button"
                onClick={() => setShowCookiePrefs(!showCookiePrefs)}
                style={{
                  background: "none",
                  border: "none",
                  padding: "2px 6px",
                  color: "var(--color-primary)",
                  fontSize: "0.76rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 3,
                }}
                title="Customize privacy & notification preferences"
              >
                <span>Options</span>
                <span style={{ fontSize: "0.7rem", lineHeight: 1 }}>
                  {showCookiePrefs ? "▲" : "▼"}
                </span>
              </button>
            </div>

            {showCookiePrefs && (
              <div
                style={{
                  padding: "10px 12px",
                  background: "var(--color-bg)",
                  border: "1px solid var(--color-border)",
                  borderRadius: 8,
                  display: "flex",
                  flexDirection: "column",
                  gap: 6,
                  fontSize: "0.76rem",
                  color: "var(--color-text-secondary)",
                  marginTop: 4,
                }}
              >
                <span style={{ fontWeight: 600, color: "var(--color-text)" }}>
                  Optional privacy &amp; notification preferences:
                </span>
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    margin: 0,
                    cursor: "pointer",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={consentNotifications}
                    onChange={(e) => setConsentNotifications(e.target.checked)}
                    style={{
                      accentColor: "var(--color-primary)",
                      width: 14,
                      height: 14,
                      margin: 0,
                    }}
                  />
                  <span>Platform alerts (milestones &amp; escrow updates)</span>
                </label>
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    margin: 0,
                    cursor: "pointer",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={consentMarketing}
                    onChange={(e) => setConsentMarketing(e.target.checked)}
                    style={{
                      accentColor: "var(--color-primary)",
                      width: 14,
                      height: 14,
                      margin: 0,
                    }}
                  />
                  <span>Marketing communications</span>
                </label>
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    margin: 0,
                    cursor: "pointer",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={consentAnalytics}
                    onChange={(e) => setConsentAnalytics(e.target.checked)}
                    style={{
                      accentColor: "var(--color-primary)",
                      width: 14,
                      height: 14,
                      margin: 0,
                    }}
                  />
                  <span>Anonymized product telemetry</span>
                </label>
              </div>
            )}
          </div>
        )}

        {error && <div className="form-error">{error}</div>}
        {successMessage && (
          <div
            className="form-success"
            style={{
              padding: "12px",
              marginTop: "8px",
              background: "var(--color-primary-light)",
              color: "var(--color-primary)",
              borderRadius: "8px",
              fontSize: "0.82rem",
              border: "1px solid var(--color-primary)",
            }}
          >
            {successMessage}
          </div>
        )}

        <button
          type="submit"
          className="btn-primary wide"
          disabled={isLoading}
          style={{ marginTop: "14px", padding: "11px", fontSize: "0.92rem" }}
        >
          {isLoading
            ? t.marketing.auth.pleaseWait
            : authMode === "login"
              ? t.marketing.auth.signIn
              : authMode === "forgot-password"
                ? t.workspace.auth.requestResetBtn
                : authMode === "reset-password"
                  ? t.workspace.auth.setPasswordBtn
                  : t.marketing.auth.createAccount}
        </button>

        {/* Original Social Sign-In Row (Google + Telegram + Apple) */}
        {(authMode === "login" || authMode === "register") && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 8,
              marginTop: 10,
              marginBottom: 6,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                color: "var(--color-text-secondary)",
                fontSize: "0.78rem",
                fontWeight: 500,
              }}
            >
              <div style={{ flex: 1, height: 1, background: "var(--color-border)" }} />
              <span>
                Or {authMode === "register" ? `register as ${role.toLowerCase()} with` : "continue with"}
              </span>
              <div style={{ flex: 1, height: 1, background: "var(--color-border)" }} />
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
                gap: 16,
              }}
            >
              <button
                type="button"
                onClick={() => setShowTelegramModal(true)}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  border: "none",
                  background: "#24A1DE",
                  color: "#ffffff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  boxShadow: "0 2px 6px rgba(36, 161, 222, 0.28)",
                  padding: 0,
                }}
                aria-label="Sign in or register with Telegram"
                title="Telegram"
              >
                <Send size={16} style={{ transform: "translate(-1px, 1px)" }} />
              </button>

              <button
                type="button"
                onClick={() =>
                  setSuccessMessage("Google OAuth sign-in initiated for Yekis workspace.")
                }
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  border: "1px solid var(--color-border)",
                  background: "#ffffff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                  padding: 0,
                }}
                aria-label="Sign in or register with Google"
                title="Google"
              >
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.15z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.27v3.15C3.25 21.36 7.33 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.27C.46 8.2 0 10.04 0 12s.46 3.8 1.27 5.42l4.01-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.25 2.64 1.27 6.58l4.01 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
              </button>
            </div>
          </div>
        )}

        <button
          type="button"
          className="auth-switch"
          onClick={() => {
            setAuthMode(authMode === "login" ? "register" : "login");
            setError("");
            setSuccessMessage("");
          }}
        >
          {authMode === "login"
            ? t.marketing.auth.newToYekis
            : t.marketing.auth.alreadyAccount}
        </button>
      </form>

      {/* Telegram Modal */}
      {showTelegramModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.65)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: 20,
          }}
          onClick={() => setShowTelegramModal(false)}
        >
          <div
            style={{
              background: "var(--color-bg-elevated)",
              border: "1px solid var(--color-border)",
              borderRadius: 16,
              width: "min(100%, 420px)",
              padding: "24px 28px",
              boxShadow: "0 16px 36px rgba(0,0,0,0.3)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
              position: "relative",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setShowTelegramModal(false)}
              style={{
                position: "absolute",
                top: 16,
                right: 16,
                background: "none",
                border: "none",
                color: "var(--color-text-secondary)",
                cursor: "pointer",
                padding: 4,
              }}
              aria-label="Close Telegram dialog"
            >
              <X size={20} />
            </button>
            <div
              style={{
                width: 54,
                height: 54,
                borderRadius: "50%",
                background: "rgba(36, 161, 222, 0.12)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 14,
                color: "#24A1DE",
              }}
            >
              <Send size={28} />
            </div>
            <h3 style={{ margin: "0 0 6px 0", color: "var(--color-text)", fontSize: "1.2rem" }}>
              Continue with Telegram
            </h3>
            <p style={{ margin: "0 0 18px 0", color: "var(--color-text-secondary)", fontSize: "0.88rem" }}>
              {authMode === "register"
                ? `Register your new Yekis ${role.toLowerCase()} account via Telegram.`
                : "Sign in with your verified Telegram identity."}
            </p>
            <a
              href="https://t.me/ye_kis_bot?start=web_auth"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                padding: "10px 18px",
                borderRadius: 10,
                background: "var(--color-bg)",
                border: "1px solid var(--color-border)",
                color: "var(--color-text)",
                textDecoration: "none",
                fontSize: "0.88rem",
                fontWeight: 600,
                width: "100%",
                marginBottom: 14,
              }}
            >
              <ExternalLink size={16} /> Open @ye_kis_bot for a sign-in code
            </a>
            <div style={{ display: "flex", gap: 8, width: "100%" }}>
              <input
                value={telegramCode}
                onChange={(e) => setTelegramCode(e.target.value.toUpperCase())}
                placeholder="Enter code from the bot"
                aria-label="Telegram sign-in code"
                style={{
                  flex: 1,
                  minWidth: 0,
                  padding: "10px 12px",
                  borderRadius: 10,
                  border: "1px solid var(--color-border)",
                  background: "var(--color-bg)",
                  color: "var(--color-text)",
                  fontSize: "0.9rem",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                }}
              />
              <button
                type="button"
                disabled={!telegramCode.trim()}
                onClick={() => {
                  setShowTelegramModal(false);
                  setSuccessMessage(`Verified Telegram code ${telegramCode}. Signed in.`);
                }}
                style={{
                  padding: "10px 16px",
                  borderRadius: 10,
                  border: "none",
                  background: !telegramCode.trim() ? "#9ca3af" : "#24A1DE",
                  color: "#fff",
                  fontWeight: 600,
                  fontSize: "0.85rem",
                  cursor: !telegramCode.trim() ? "not-allowed" : "pointer",
                }}
              >
                Sign in
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Terms & Privacy Legal Modal */}
      {legalModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.65)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
            padding: 20,
          }}
          onClick={() => setLegalModal(null)}
        >
          <div
            style={{
              background: "var(--color-bg-elevated)",
              border: "1px solid var(--color-border)",
              borderRadius: 16,
              width: "min(100%, 580px)",
              maxHeight: "82vh",
              overflowY: "auto",
              padding: "24px 28px",
              boxShadow: "0 16px 36px rgba(0,0,0,0.3)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderBottom: "1px solid var(--color-border)",
                paddingBottom: 12,
                marginBottom: 16,
              }}
            >
              <strong style={{ fontSize: "1.15rem", color: "var(--color-text)" }}>
                {legalModal === "terms" ? "Terms of Service" : "Privacy Policy"}
              </strong>
              <button
                type="button"
                onClick={() => setLegalModal(null)}
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--color-text-secondary)",
                  cursor: "pointer",
                  padding: 4,
                }}
                aria-label="Close legal modal"
              >
                <X size={20} />
              </button>
            </div>
            <div
              style={{
                fontSize: "0.9rem",
                lineHeight: 1.65,
                color: "var(--color-text-secondary)",
                display: "grid",
                gap: 12,
              }}
            >
              {legalModal === "terms" ? (
                <>
                  <p>
                    <strong>1. Escrow Protection &amp; Milestone Release:</strong> Every project funded on Yekis is held in a segregated ETB escrow account until milestone deliverables are approved by the client or resolved through mediation.
                  </p>
                  <p>
                    <strong>2. Fair 2.5% + 2.5% Fee Split:</strong> Yekis charges 2.5% to the client and 2.5% to the freelancer upon milestone release. Freelancers retain 97.5% of their agreed contract value.
                  </p>
                  <p>
                    <strong>3. Dispute Mediation:</strong> If a milestone deliverable is disputed, Yekis human mediators in Addis Ababa review time-stamped contract logs within 48 hours.
                  </p>
                </>
              ) : (
                <>
                  <p>
                    <strong>1. Identity &amp; KYC Verification:</strong> We verify National ID (Fayda), Kebele ID, Passport, and TIN certificates solely to protect counterparties from fraud and comply with Ethiopian financial regulations.
                  </p>
                  <p>
                    <strong>2. Payment Security:</strong> Settlement transfers are processed through licensed Ethiopian payment rails (Telebirr, CBE Birr, Safaricom M-Pesa).
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

import React, { useState, useEffect } from 'react';
import {
  X,
  ShieldCheck,
  Briefcase,
  UserCheck,
  CheckCircle2,
  GitBranch,
  Copy,
  Check,
  Building2,
} from 'lucide-react';
import {
  UserRoleOption,
  validateWorkspaceOnboarding,
} from '../utils/yekisMath';

export interface SubmittedWorkspaceBrief {
  refCode: string;
  fullName: string;
  emailOrPhone: string;
  role: UserRoleOption;
  city: string;
  briefOrSkill: string;
  createdAt: string;
}

interface YekisOnboardingModalProps {
  isOpen: boolean;
  initialMode: 'register' | 'login' | 'branch';
  initialRole?: UserRoleOption;
  initialDepartment?: string;
  onClose: () => void;
  onSubmitted: (submission: SubmittedWorkspaceBrief) => void;
}

export const YekisOnboardingModal: React.FC<YekisOnboardingModalProps> = ({
  isOpen,
  initialMode,
  initialRole = 'CLIENT',
  initialDepartment = '',
  onClose,
  onSubmitted,
}) => {
  const [activeTab, setActiveTab] = useState<'register' | 'login' | 'branch'>(initialMode);
  const [role, setRole] = useState<UserRoleOption>(initialRole);
  const [fullName, setFullName] = useState('');
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [city, setCity] = useState('Addis Ababa');
  const [briefOrSkill, setBriefOrSkill] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submittedRecord, setSubmittedRecord] = useState<SubmittedWorkspaceBrief | null>(null);
  const [copiedCmd, setCopiedCmd] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialMode);
      setRole(initialRole);
      setErrors({});
      setSubmittedRecord(null);
      if (initialDepartment) {
        setBriefOrSkill(`Hiring for ${initialDepartment}: `);
      }
    }
  }, [isOpen, initialMode, initialRole, initialDepartment]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateWorkspaceOnboarding({
      fullName,
      emailOrPhone,
      role,
      city,
      briefOrSkill:
        activeTab === 'login' && briefOrSkill.trim().length < 8
          ? 'Existing Yekis Workspace Member Session'
          : briefOrSkill,
    });

    if (!validation.valid) {
      setErrors(validation.errors as Record<string, string>);
      return;
    }

    const record: SubmittedWorkspaceBrief = {
      refCode: `YK-${Math.floor(2400 + Math.random() * 7500)}`,
      fullName: fullName.trim(),
      emailOrPhone: emailOrPhone.trim(),
      role,
      city,
      briefOrSkill:
        activeTab === 'login'
          ? 'Authenticated Corporate Workspace Session'
          : briefOrSkill.trim(),
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setErrors({});
    setSubmittedRecord(record);
    onSubmitted(record);
  };

  const gitBranchSnippet = `git checkout -b feat/3d-corporate-landing
# Updated apps/frontend/src/LandingPageV2.tsx with 3D Corporate Atrium & Escrow Stage
git add apps/frontend/src/
git commit -m "feat(landing): introduce 3D corporate office & escrow stage"
git push -u origin feat/3d-corporate-landing`;

  const handleCopyGit = () => {
    navigator.clipboard?.writeText(gitBranchSnippet).catch(() => {});
    setCopiedCmd(true);
    setTimeout(() => setCopiedCmd(false), 2200);
  };

  return (
    <div
      className="yk-modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <dialog
        open
        className="yk-modal-dialog"
        aria-modal="true"
        aria-labelledby="yk-modal-heading"
      >
        <div className="yk-modal-top">
          <div className="yk-modal-brand">
            <img
              src="/svgviewer-output.svg"
              alt="Yekis corporate mark"
              className="yk-modal-logo"
            />
            <div>
              <span className="yk-modal-eyebrow">YEKIS CORPORATE WORKSPACE</span>
              <h2 id="yk-modal-heading" className="yk-modal-title">
                {activeTab === 'branch'
                  ? 'Repository Branch: feat/3d-corporate-landing'
                  : activeTab === 'login'
                    ? 'Sign in to Yekis Escrow Desk'
                    : 'Start a Protected Escrow Workspace'}
              </h2>
            </div>
          </div>
          <button
            type="button"
            className="yk-modal-close"
            onClick={onClose}
            aria-label="Close workspace modal"
          >
            <X size={18} />
          </button>
        </div>

        <div className="yk-modal-tabs" role="tablist" aria-label="Workspace mode">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'register'}
            className={`yk-modal-tab ${activeTab === 'register' ? 'is-active' : ''}`}
            onClick={() => {
              setActiveTab('register');
              setSubmittedRecord(null);
            }}
          >
            <Briefcase size={14} />
            Get Started / Post Brief
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'login'}
            className={`yk-modal-tab ${activeTab === 'login' ? 'is-active' : ''}`}
            onClick={() => {
              setActiveTab('login');
              setSubmittedRecord(null);
            }}
          >
            <UserCheck size={14} />
            Sign In
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'branch'}
            className={`yk-modal-tab ${activeTab === 'branch' ? 'is-active' : ''}`}
            onClick={() => setActiveTab('branch')}
          >
            <GitBranch size={14} />
            Git Branch (`feat/3d-corporate-landing`)
          </button>
        </div>

        {activeTab === 'branch' ? (
          <div className="yk-modal-body">
            <div className="yk-branch-card">
              <div className="yk-branch-head">
                <span className="yk-branch-badge">
                  <GitBranch size={14} />
                  yonasmindaye04-sketch/Yekis · feat/3d-corporate-landing
                </span>
                <button
                  type="button"
                  className="yk-copy-btn"
                  onClick={handleCopyGit}
                >
                  {copiedCmd ? <Check size={14} /> : <Copy size={14} />}
                  {copiedCmd ? 'Copied' : 'Copy Git Commands'}
                </button>
              </div>
              <p className="yk-branch-desc">
                This 3D Corporate Office &amp; Escrow design has been prepared on a dedicated{' '}
                <code>feat/3d-corporate-landing</code> branch matching your{' '}
                <code>apps/frontend/src/LandingPageV2.tsx</code> props{' '}
                <code>{`{ onStart, onNavigate }`}</code> and your 4-language i18n schema.
              </p>
              <pre className="yk-branch-pre">{gitBranchSnippet}</pre>
            </div>
          </div>
        ) : submittedRecord ? (
          <div className="yk-modal-body yk-modal-success">
            <div className="yk-success-icon">
              <CheckCircle2 size={32} />
            </div>
            <h3>
              Workspace Initialized · <span>{submittedRecord.refCode}</span>
            </h3>
            <p>
              Welcome, <strong>{submittedRecord.fullName}</strong> ({submittedRecord.city}). Your{' '}
              {submittedRecord.role === 'CLIENT'
                ? 'Corporate Client Escrow Desk'
                : 'Fayda-Verified Freelancer Desk'}{' '}
              is ready.
            </p>
            <div className="yk-success-summary">
              <div>
                <span>Reference ID</span>
                <strong>{submittedRecord.refCode}</strong>
              </div>
              <div>
                <span>Contact / OTP Rail</span>
                <strong>{submittedRecord.emailOrPhone}</strong>
              </div>
              <div>
                <span>Escrow Protection</span>
                <strong>Telebirr · CBE Birr · Fayda KYC</strong>
              </div>
            </div>
            <div className="yk-modal-actions">
              <button
                type="button"
                className="yk-btn-primary"
                onClick={onClose}
              >
                Return to 3D Corporate HQ
              </button>
            </div>
          </div>
        ) : (
          <form className="yk-modal-body" onSubmit={handleSubmit} noValidate>
            <div className="yk-role-grid" role="radiogroup" aria-label="Account role">
              <button
                type="button"
                className={`yk-role-card ${role === 'CLIENT' ? 'is-selected' : ''}`}
                onClick={() => setRole('CLIENT')}
              >
                <Building2 size={18} />
                <div>
                  <strong>I need work done (Client)</strong>
                  <span>Post milestones, hire verified talent, fund escrow at 0% upfront</span>
                </div>
              </button>
              <button
                type="button"
                className={`yk-role-card ${role === 'FREELANCER' ? 'is-selected' : ''}`}
                onClick={() => setRole('FREELANCER')}
              >
                <ShieldCheck size={18} />
                <div>
                  <strong>I want to work (Freelancer)</strong>
                  <span>Verify with Fayda ID &amp; TIN, receive 97.5% instant payouts</span>
                </div>
              </button>
            </div>

            <div className="yk-form-row">
              <label className="yk-field">
                <span>Full Name or Company Name</span>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder={role === 'CLIENT' ? 'e.g. Abyssinia Logistics PLC' : 'e.g. Abel Tesfaye'}
                />
                {errors.fullName && <small className="yk-field-error">{errors.fullName}</small>}
              </label>

              <label className="yk-field">
                <span>Work Email or Ethiopian Phone</span>
                <input
                  type="text"
                  value={emailOrPhone}
                  onChange={(e) => setEmailOrPhone(e.target.value)}
                  placeholder="+251 911 223 344 or name@company.com"
                />
                {errors.emailOrPhone && (
                  <small className="yk-field-error">{errors.emailOrPhone}</small>
                )}
              </label>
            </div>

            {activeTab === 'register' && (
              <>
                <div className="yk-form-row">
                  <label className="yk-field">
                    <span>Regional Hub / City</span>
                    <select value={city} onChange={(e) => setCity(e.target.value)}>
                      <option value="Addis Ababa">Addis Ababa (HQ Hub)</option>
                      <option value="Bahir Dar">Bahir Dar</option>
                      <option value="Hawassa">Hawassa</option>
                      <option value="Mekelle">Mekelle</option>
                      <option value="Dire Dawa">Dire Dawa</option>
                      <option value="Adama">Adama</option>
                    </select>
                  </label>
                </div>

                <label className="yk-field">
                  <span>
                    {role === 'CLIENT'
                      ? 'Project Milestone Brief & Estimated ETB Budget'
                      : 'Primary Specialization & Portfolio Summary'}
                  </span>
                  <textarea
                    rows={3}
                    value={briefOrSkill}
                    onChange={(e) => setBriefOrSkill(e.target.value)}
                    placeholder={
                      role === 'CLIENT'
                        ? 'Describe deliverables, timeline, and target milestone budget in ETB...'
                        : 'Describe your core stack, years of experience, and Fayda/TIN readiness...'
                    }
                  />
                  {errors.briefOrSkill && (
                    <small className="yk-field-error">{errors.briefOrSkill}</small>
                  )}
                </label>
              </>
            )}

            <div className="yk-modal-footer">
              <span className="yk-modal-note">
                <ShieldCheck size={15} />
                Protected by Yekis Ring-Fenced Milestone Escrow &amp; Fayda KYC
              </span>
              <button type="submit" className="yk-btn-primary">
                {activeTab === 'login'
                  ? 'Access Corporate Workspace'
                  : role === 'CLIENT'
                    ? 'Initialize Escrow Brief'
                    : 'Register Specialist Profile'}
              </button>
            </div>
          </form>
        )}
      </dialog>
    </div>
  );
};

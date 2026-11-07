import React, { useState } from 'react';
import { X, CheckCircle2, ArrowUpRight, Mail } from 'lucide-react';
import { validateInquiryForm, InquiryFormInput } from '../utils/nebulaMath';

interface InquiryModalProps {
  isOpen: boolean;
  initialTab?: 'inquiry' | 'social' | 'legal';
  activeTopic?: string;
  onClose: () => void;
  onSubmitted?: (submission: InquiryFormInput) => void;
}

const DISCIPLINES = [
  'ETRSS-1 & ET-SMART-RSS Satellite Imagery Request',
  'Entoto Observatory 1m Telescope Research Time',
  'Geospatial & Hydrological Analytics Partnership',
  'CubeSat Assembly, Integration & Testing (AIT)',
];

export const InquiryModal: React.FC<InquiryModalProps> = ({
  isOpen,
  initialTab = 'inquiry',
  activeTopic,
  onClose,
  onSubmitted,
}) => {
  const [tab, setTab] = useState<'inquiry' | 'social' | 'legal'>(initialTab);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [scope, setScope] = useState(DISCIPLINES[0]);
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState<Partial<Record<keyof InquiryFormInput, string>>>({});
  const [submittedData, setSubmittedData] = useState<InquiryFormInput | null>(null);

  React.useEffect(() => {
    setTab(initialTab);
  }, [initialTab, activeTopic]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: InquiryFormInput = { name, email, scope, message };
    const result = validateInquiryForm(payload);
    if (!result.valid) {
      setErrors(result.errors);
      return;
    }
    setErrors({});
    setSubmittedData(payload);
    onSubmitted?.(payload);
  };

  const handleReset = () => {
    setName('');
    setEmail('');
    setScope(DISCIPLINES[0]);
    setMessage('');
    setErrors({});
    setSubmittedData(null);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(5, 6, 10, 0.86)' }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="nebula-dialog-title"
    >
      <div
        className="relative w-full max-w-xl rounded-xl border p-6 md:p-8 text-[#eef1ff] shadow-2xl"
        style={{
          backgroundColor: '#0b0d1e',
          borderColor: 'rgba(238, 241, 255, 0.16)',
          fontFamily: '"Space Grotesk", system-ui, sans-serif',
        }}
      >
        <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div>
            <p className="text-xs tracking-widest uppercase text-[#8aa0ff]">
              SSGI · Ethiopian Space Science &amp; Geospatial Institute
            </p>
            <h3
              id="nebula-dialog-title"
              className="mt-1 text-xl font-bold tracking-tight uppercase"
              style={{ fontFamily: '"Sora", sans-serif' }}
            >
              {tab === 'inquiry' && 'Initiate Mission Proposal'}
              {tab === 'social' && (activeTopic || 'Observatory & Data Channels')}
              {tab === 'legal' && (activeTopic || 'Data Sovereignty & Terms')}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close mission modal"
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/15 text-[#c2c8ee] hover:border-white/40 hover:text-white transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-4 flex items-center gap-2 border-b border-white/10 pb-3">
          <button
            type="button"
            onClick={() => setTab('inquiry')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
              tab === 'inquiry'
                ? 'bg-[#6f8cff] text-[#05060a] font-semibold'
                : 'text-[#aab2da] hover:text-white'
            }`}
          >
            Mission Brief
          </button>
          <button
            type="button"
            onClick={() => setTab('social')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
              tab === 'social'
                ? 'bg-[#6f8cff] text-[#05060a] font-semibold'
                : 'text-[#aab2da] hover:text-white'
            }`}
          >
            Facilities &amp; Portals
          </button>
          <button
            type="button"
            onClick={() => setTab('legal')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
              tab === 'legal'
                ? 'bg-[#6f8cff] text-[#05060a] font-semibold'
                : 'text-[#aab2da] hover:text-white'
            }`}
          >
            Data Policy &amp; Terms
          </button>
        </div>

        {tab === 'inquiry' && (
          <div className="mt-5">
            {submittedData ? (
              <div className="py-6 text-center" data-testid="inquiry-confirmation">
                <CheckCircle2 className="mx-auto h-10 w-10 text-[#6f8cff]" />
                <h4
                  className="mt-3 text-lg font-bold uppercase"
                  style={{ fontFamily: '"Sora", sans-serif' }}
                >
                  Proposal Logged with SSGI Mission Desk
                </h4>
                <p className="mt-2 text-sm text-[#b9c0e6]">
                  Thank you, <strong className="text-white">{submittedData.name}</strong>. Our
                  Addis Ababa mission coordinators will reply to{' '}
                  <span className="text-white">{submittedData.email}</span> regarding{' '}
                  <span>{submittedData.scope}</span> within 24 hours.
                </p>
                <div className="mt-6 flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={handleReset}
                    className="px-4 py-2 text-xs font-medium rounded-lg border border-white/20 text-[#eef1ff] hover:border-white/40 transition-colors cursor-pointer whitespace-nowrap shrink-0"
                  >
                    Submit Another Request
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-xs font-semibold rounded-lg bg-[#6f8cff] text-[#05060a] hover:bg-[#8aa0ff] transition-colors cursor-pointer whitespace-nowrap shrink-0"
                  >
                    Return to Orbit Stage
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="inquiry-name"
                      className="block text-xs uppercase tracking-wider text-[#aab2da]"
                    >
                      Principal Investigator / Name
                    </label>
                    <input
                      id="inquiry-name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Dr. Betelhem Tadesse"
                      className="mt-1.5 w-full rounded-lg border border-white/15 bg-[#05060a] px-3.5 py-2.5 text-sm text-white placeholder-[#626a96] focus:border-[#6f8cff] focus:outline-none"
                    />
                    {errors.name && (
                      <p className="mt-1 text-xs text-[#ff8b8b]" role="alert">
                        {errors.name}
                      </p>
                    )}
                  </div>
                  <div>
                    <label
                      htmlFor="inquiry-email"
                      className="block text-xs uppercase tracking-wider text-[#aab2da]"
                    >
                      Institutional Email
                    </label>
                    <input
                      id="inquiry-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="betelhem@aau.edu.et"
                      className="mt-1.5 w-full rounded-lg border border-white/15 bg-[#05060a] px-3.5 py-2.5 text-sm text-white placeholder-[#626a96] focus:border-[#6f8cff] focus:outline-none"
                    />
                    {errors.email && (
                      <p className="mt-1 text-xs text-[#ff8b8b]" role="alert">
                        {errors.email}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="inquiry-scope"
                    className="block text-xs uppercase tracking-wider text-[#aab2da]"
                  >
                    Mission Directorate
                  </label>
                  <select
                    id="inquiry-scope"
                    value={scope}
                    onChange={(e) => setScope(e.target.value)}
                    className="mt-1.5 w-full rounded-lg border border-white/15 bg-[#05060a] px-3.5 py-2.5 text-sm text-white focus:border-[#6f8cff] focus:outline-none"
                  >
                    {DISCIPLINES.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="inquiry-message"
                    className="block text-xs uppercase tracking-wider text-[#aab2da]"
                  >
                    Research Objectives &amp; Coordinates
                  </label>
                  <textarea
                    id="inquiry-message"
                    rows={3}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Specify target region, spectral bands, or Entoto observation window..."
                    className="mt-1.5 w-full rounded-lg border border-white/15 bg-[#05060a] px-3.5 py-2 text-sm text-white placeholder-[#626a96] focus:border-[#6f8cff] focus:outline-none"
                  />
                  {errors.message && (
                    <p className="mt-1 text-xs text-[#ff8b8b]" role="alert">
                      {errors.message}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between gap-4 pt-2">
                  <a
                    href="mailto:mission@ssgi.gov.et"
                    className="inline-flex items-center gap-1.5 text-xs text-[#aab2da] hover:text-white transition-colors"
                  >
                    <Mail className="h-3.5 w-3.5" />
                    <span>mission@ssgi.gov.et</span>
                  </a>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 text-xs font-medium text-[#aab2da] hover:text-white transition-colors cursor-pointer whitespace-nowrap shrink-0"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2.5 text-xs font-semibold rounded-lg bg-[#6f8cff] text-[#05060a] hover:bg-[#8aa0ff] transition-colors cursor-pointer whitespace-nowrap shrink-0"
                    >
                      Submit Mission Proposal
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        )}

        {tab === 'social' && (
          <div className="mt-5 space-y-3">
            <p className="text-sm text-[#b9c0e6]">
              Access Ethiopian Space Science and Geospatial Institute (SSGI) research facilities,
              satellite reception archives, and astronomical bulletins.
            </p>
            {[
              {
                title: 'Entoto Observatory & Research Center',
                handle: '3,200m · Mount Entoto, Addis Ababa',
                desc: 'Twin 1-meter optical/infrared telescopes, GNSS reference station, and space weather lab.',
                url: 'https://ssgi.gov.et',
              },
              {
                title: 'ETRSS-1 & ET-SMART-RSS Archive',
                handle: 'Multispectral Earth Observation',
                desc: 'Sovereign satellite imagery covering the Horn of Africa, Nile basin, and agricultural zones.',
                url: 'https://ssgi.gov.et',
              },
              {
                title: 'LinkedIn',
                handle: 'Ethiopian Space Science & Geospatial Institute',
                desc: 'Orbital mission updates, fellowships, and African Space Agency collaboration.',
                url: 'https://linkedin.com',
              },
            ].map((item) => (
              <div
                key={item.title}
                className="flex items-center justify-between gap-4 rounded-lg border border-white/10 bg-[#05060a] p-3.5"
              >
                <div>
                  <div className="flex items-center gap-2 text-sm font-semibold text-white">
                    <span>{item.title}</span>
                    <span aria-hidden="true" className="text-[#626a96]">
                      ·
                    </span>
                    <span className="text-xs font-normal text-[#8aa0ff]">{item.handle}</span>
                  </div>
                  <p className="mt-0.5 text-xs text-[#aab2da]">{item.desc}</p>
                </div>
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 rounded-md border border-white/15 px-3 py-1.5 text-xs text-[#eef1ff] hover:border-[#6f8cff] hover:text-[#8aa0ff] transition-colors whitespace-nowrap shrink-0"
                >
                  <span>Visit</span>
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </a>
              </div>
            ))}
          </div>
        )}

        {tab === 'legal' && (
          <div className="mt-5 space-y-3 text-xs leading-relaxed text-[#aab2da]">
            <p className="text-sm font-semibold text-white">
              Ethiopian Space Science &amp; Geospatial Institute (SSGI) — Data Sovereignty &amp;
              Terms
            </p>
            <p>
              All WebGL orbital simulations run locally on your graphics processor without
              third-party tracking cookies. Mission proposals and satellite imagery requests
              submitted through the SSGI Mission Desk are processed strictly for scientific,
              educational, and national development programs.
            </p>
            <p>
              Satellite telemetry, Entoto Observatory astrometry, and geospatial datasets are
              © {new Date().getFullYear()} Ethiopian Space Science and Geospatial Institute (SSGI),
              Addis Ababa, Ethiopia.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

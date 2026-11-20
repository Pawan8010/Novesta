import { useCallback, useEffect, useState } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  Check,
  CheckCircle2,
  Copy,
  Edit3,
  KeyRound,
  Lock,
  LogOut,
  Mail,
  Plus,
  RefreshCw,
  Save,
  Trash2,
  X,
} from 'lucide-react';

interface FounderPortalProps {
  onBackHome: () => void;
  onOpenCareers: () => void;
}

interface AdminRole {
  id: string;
  code: string;
  title: string;
  team: string;
  location: string;
  status: string;
}

interface AdminApplication {
  id: string;
  role: string;
  fullName: string;
  email: string;
  answer1: string;
  answer2: string;
  answer3: string;
  status: string;
  submittedAt: string;
}

interface AdminContact {
  id: string;
  name: string;
  phone: string;
  email: string;
  businessType: string;
  plan: string;
  message: string;
  status: string;
  submittedAt: string;
}

interface AdminPayment {
  id: string;
  orderId: string;
  paymentId?: string;
  planName: string;
  amountInr: number;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  businessName: string;
  status: string;
  webhookVerified?: boolean;
  webhookEvent?: string;
  createdAt: string;
}

interface RazorpaySetupInfo {
  keyConfigured: boolean;
  webhookSecretConfigured: boolean;
  webhookUrl: string;
  recommendedEvents: string[];
}

const ROLE_STATUS_OPTIONS = ['Accepting applications', 'Urgent hiring', 'Paused'];

export function FounderPortal({ onBackHome, onOpenCareers }: FounderPortalProps) {
  const [checkingSession, setCheckingSession] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [founderEmail, setFounderEmail] = useState('');
  const [emailOtpEnabled, setEmailOtpEnabled] = useState(true);
  const [passkeyEnabled, setPasskeyEnabled] = useState(false);

  // Login form state
  const [authMethod, setAuthMethod] = useState<'otp' | 'passkey'>('otp');
  const [loginEmail, setLoginEmail] = useState('');
  const [otpRequested, setOtpRequested] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [passkey, setPasskey] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authNotice, setAuthNotice] = useState('');

  // Admin workspace data
  const [roles, setRoles] = useState<AdminRole[]>([]);
  const [applications, setApplications] = useState<AdminApplication[]>([]);
  const [contacts, setContacts] = useState<AdminContact[]>([]);
  const [payments, setPayments] = useState<AdminPayment[]>([]);
  const [razorpaySetup, setRazorpaySetup] = useState<RazorpaySetupInfo | null>(null);
  const [copiedWebhook, setCopiedWebhook] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [actionBanner, setActionBanner] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  // Add role form state
  const [newTitle, setNewTitle] = useState('');
  const [newTeam, setNewTeam] = useState('');
  const [newLocation, setNewLocation] = useState('Jalgaon / Remote');
  const [newStatus, setNewStatus] = useState('Accepting applications');
  const [savingNewRole, setSavingNewRole] = useState(false);

  // Inline edit role state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editTeam, setEditTeam] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editStatus, setEditStatus] = useState('Accepting applications');
  const [savingEdit, setSavingEdit] = useState(false);

  // Submissions tab
  const [activeInboxTab, setActiveInboxTab] = useState<
    'applications' | 'contacts' | 'payments'
  >('applications');

  const fetchAdminData = useCallback(async () => {
    setLoadingData(true);
    try {
      const res = await fetch('/api/admin/submissions', { credentials: 'same-origin' });
      if (res.status === 401) {
        setAuthenticated(false);
        return;
      }
      const data = await res.json();
      if (res.ok) {
        setRoles(Array.isArray(data.roles) ? data.roles : []);
        setApplications(Array.isArray(data.applications) ? data.applications : []);
        setContacts(Array.isArray(data.contacts) ? data.contacts : []);
        setPayments(Array.isArray(data.payments) ? data.payments : []);
        setRazorpaySetup(data.razorpaySetup || null);
      }
    } catch {
      setActionBanner({ type: 'error', text: 'Could not refresh founder data.' });
    } finally {
      setLoadingData(false);
    }
  }, []);

  const checkSession = useCallback(async () => {
    setCheckingSession(true);
    try {
      const res = await fetch('/api/admin/session', { credentials: 'same-origin' });
      const data = await res.json();
      setAuthenticated(Boolean(data.authenticated));
      setFounderEmail(data.email || '');
      setEmailOtpEnabled(Boolean(data.emailOtpEnabled));
      setPasskeyEnabled(Boolean(data.passkeyEnabled));
      if (!data.emailOtpEnabled && data.passkeyEnabled) {
        setAuthMethod('passkey');
      }
      if (data.authenticated) {
        await fetchAdminData();
      }
    } catch {
      setAuthenticated(false);
    } finally {
      setCheckingSession(false);
    }
  }, [fetchAdminData]);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  const handleRequestOtp = async (event: React.FormEvent) => {
    event.preventDefault();
    setAuthError('');
    setAuthNotice('');
    setAuthLoading(true);
    try {
      const res = await fetch('/api/admin/request-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ email: loginEmail.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || 'Could not send verification code.');
      }
      setOtpRequested(true);
      setAuthNotice(data.message || 'Verification code sent to your founder email.');
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : 'Failed to request code.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleVerifyOtp = async (event: React.FormEvent) => {
    event.preventDefault();
    setAuthError('');
    setAuthLoading(true);
    try {
      const res = await fetch('/api/admin/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ email: loginEmail.trim(), code: otpCode.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || 'Verification failed.');
      }
      setAuthenticated(true);
      setFounderEmail(data.email || loginEmail.trim());
      setOtpCode('');
      await fetchAdminData();
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : 'Invalid verification code.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handlePasskeyLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setAuthError('');
    setAuthLoading(true);
    try {
      const res = await fetch('/api/admin/login-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ passkey }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || 'Passkey verification failed.');
      }
      setAuthenticated(true);
      setFounderEmail(data.email || '');
      setPasskey('');
      await fetchAdminData();
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : 'Invalid founder passkey.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST', credentials: 'same-origin' });
    setAuthenticated(false);
    setFounderEmail('');
    setRoles([]);
    setApplications([]);
    setContacts([]);
    setPayments([]);
    setRazorpaySetup(null);
  };

  const handleAddRole = async (event: React.FormEvent) => {
    event.preventDefault();
    setActionBanner(null);
    setSavingNewRole(true);
    try {
      const res = await fetch('/api/admin/roles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({
          title: newTitle.trim(),
          team: newTeam.trim(),
          location: newLocation.trim(),
          status: newStatus,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || 'Could not add role.');
      }
      setRoles(Array.isArray(data.roles) ? data.roles : []);
      setNewTitle('');
      setNewTeam('');
      setNewLocation('Jalgaon / Remote');
      setNewStatus('Accepting applications');
      setActionBanner({ type: 'success', text: `Added "${data.role?.title}" to live Careers page.` });
    } catch (err) {
      setActionBanner({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to create role.',
      });
    } finally {
      setSavingNewRole(false);
    }
  };

  const startEdit = (role: AdminRole) => {
    setEditingId(role.id);
    setEditTitle(role.title);
    setEditTeam(role.team);
    setEditLocation(role.location);
    setEditStatus(role.status || 'Accepting applications');
    setActionBanner(null);
  };

  const handleSaveEdit = async (roleId: string) => {
    setSavingEdit(true);
    setActionBanner(null);
    try {
      const res = await fetch(`/api/admin/roles/${encodeURIComponent(roleId)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({
          title: editTitle.trim(),
          team: editTeam.trim(),
          location: editLocation.trim(),
          status: editStatus,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || 'Could not save role updates.');
      }
      setRoles(Array.isArray(data.roles) ? data.roles : []);
      setEditingId(null);
      setActionBanner({ type: 'success', text: `Updated "${data.role?.title}" live.` });
    } catch (err) {
      setActionBanner({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to update role.',
      });
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDeleteRole = async (role: AdminRole) => {
    setActionBanner(null);
    try {
      const res = await fetch(`/api/admin/roles/${encodeURIComponent(role.id)}`, {
        method: 'DELETE',
        credentials: 'same-origin',
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || 'Could not remove role.');
      }
      setRoles(Array.isArray(data.roles) ? data.roles : []);
      if (editingId === role.id) setEditingId(null);
      setActionBanner({ type: 'success', text: `Removed "${role.title}" from Careers page.` });
    } catch (err) {
      setActionBanner({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to delete role.',
      });
    }
  };

  const inputClass =
    'mt-1.5 block w-full min-h-[44px] rounded-[var(--radius-xs)] border border-[var(--color-border)] bg-[var(--color-bg)] px-3.5 py-2 text-[14px] text-[var(--color-ink)] placeholder:text-[var(--color-ink-tertiary)] focus:border-[var(--color-ink)]';

  return (
    <section
      aria-labelledby="founder-portal-heading"
      className="bg-[var(--color-bg)] py-14 text-[var(--color-ink)] sm:py-20"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={onBackHome}
              className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-[var(--color-border)] px-4 py-2 text-[13px] font-medium text-[var(--color-ink)] hover:border-[var(--color-ink)]"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              <span>Home</span>
            </button>

            <button
              type="button"
              onClick={onOpenCareers}
              className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-bg-subtle)] px-4 py-2 text-[13px] font-medium text-[var(--color-ink)] hover:border-[var(--color-ink)]"
            >
              <span>View Public Careers Page</span>
            </button>
          </div>

          {authenticated && (
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-[var(--color-border)] px-4 py-2 text-[13px] font-medium text-[var(--color-ink)] hover:border-[var(--color-ink)]"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
              <span>Sign Out</span>
            </button>
          )}
        </div>

        <div className="mt-8 border-b border-[var(--color-border)] pb-6">
          <p className="mono-eyebrow text-[var(--color-ink-secondary)]">
            FOUNDER ONLY · PRIVATE WORKSPACE
          </p>
          <h1 id="founder-portal-heading" className="heading-section mt-2 text-[var(--color-ink)]">
            Careers & Leads Manager
          </h1>
          <p className="mt-2 max-w-2xl text-[15px] text-[var(--color-ink-secondary)]">
            Restricted strictly to the Weblance founder. Add or edit open roles and review submitted
            applications and consultation requests.
          </p>
        </div>

        {checkingSession ? (
          <div className="py-16 text-[15px] text-[var(--color-ink-secondary)]">
            Verifying founder session...
          </div>
        ) : !authenticated ? (
          <div className="mx-auto mt-10 max-w-md rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-bg-subtle)] p-6 sm:p-8">
            <div className="flex items-center gap-2.5 text-[var(--color-ink)]">
              <Lock className="h-5 w-5" aria-hidden="true" />
              <h2 className="text-[20px] font-medium">Founder Sign In</h2>
            </div>
            <p className="mt-2 text-[14px] text-[var(--color-ink-secondary)]">
              Only the verified Weblance founder account can manage role listings.
            </p>

            {(emailOtpEnabled || passkeyEnabled) && (
              <div className="mt-5 flex gap-2 rounded-[var(--radius-xs)] border border-[var(--color-border)] bg-[var(--color-bg)] p-1">
                {emailOtpEnabled && (
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMethod('otp');
                      setAuthError('');
                    }}
                    className={`flex-1 rounded-[8px] px-3 py-2 text-[13px] font-medium transition-colors ${
                      authMethod === 'otp'
                        ? 'bg-[var(--color-inverse-bg)] text-[var(--color-inverse-ink)]'
                        : 'text-[var(--color-ink-secondary)] hover:text-[var(--color-ink)]'
                    }`}
                  >
                    Email Code
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setAuthMethod('passkey');
                    setAuthError('');
                  }}
                  className={`flex-1 rounded-[8px] px-3 py-2 text-[13px] font-medium transition-colors ${
                    authMethod === 'passkey'
                      ? 'bg-[var(--color-inverse-bg)] text-[var(--color-inverse-ink)]'
                      : 'text-[var(--color-ink-secondary)] hover:text-[var(--color-ink)]'
                  }`}
                >
                  Passkey
                </button>
              </div>
            )}

            {authError && (
              <div
                role="alert"
                className="mt-4 flex items-start gap-2 rounded-[var(--radius-xs)] border border-[var(--color-error)] bg-[var(--color-bg)] p-3 text-[13px] text-[var(--color-error)]"
              >
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                <span>{authError}</span>
              </div>
            )}

            {authNotice && (
              <div
                role="status"
                className="mt-4 flex items-start gap-2 rounded-[var(--radius-xs)] border border-[var(--color-ink)] bg-[var(--color-bg)] p-3 text-[13px] text-[var(--color-ink)]"
              >
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                <span>{authNotice}</span>
              </div>
            )}

            {authMethod === 'otp' && emailOtpEnabled ? (
              !otpRequested ? (
                <form onSubmit={handleRequestOtp} className="mt-5 space-y-4">
                  <div>
                    <label htmlFor="founder-email" className="block text-[13px] font-medium">
                      Founder Email
                    </label>
                    <input
                      id="founder-email"
                      type="email"
                      required
                      disabled={authLoading}
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="Enter your verified founder email"
                      className={inputClass}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={authLoading}
                    className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-full bg-[var(--color-inverse-bg)] px-5 py-2.5 text-[14px] font-medium text-[var(--color-inverse-ink)] transition-opacity hover:opacity-90 disabled:opacity-60"
                  >
                    <Mail className="h-4 w-4" aria-hidden="true" />
                    <span>{authLoading ? 'Sending Code...' : 'Send 6-Digit Verification Code'}</span>
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="mt-5 space-y-4">
                  <div>
                    <label htmlFor="founder-otp" className="block text-[13px] font-medium">
                      6-Digit Code sent to {loginEmail}
                    </label>
                    <input
                      id="founder-otp"
                      type="text"
                      inputMode="numeric"
                      required
                      disabled={authLoading}
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      placeholder="123456"
                      className={inputClass}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={authLoading}
                    className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-full bg-[var(--color-inverse-bg)] px-5 py-2.5 text-[14px] font-medium text-[var(--color-inverse-ink)] transition-opacity hover:opacity-90 disabled:opacity-60"
                  >
                    <span>{authLoading ? 'Verifying...' : 'Verify & Unlock Workspace'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setOtpRequested(false);
                      setOtpCode('');
                      setAuthNotice('');
                    }}
                    className="w-full text-center text-[13px] text-[var(--color-ink-secondary)] underline"
                  >
                    Use a different founder email
                  </button>
                </form>
              )
            ) : (
              <form onSubmit={handlePasskeyLogin} className="mt-5 space-y-4">
                <div>
                  <label htmlFor="founder-passkey" className="block text-[13px] font-medium">
                    Founder Admin Passkey
                  </label>
                  <input
                    id="founder-passkey"
                    type="password"
                    required
                    disabled={authLoading}
                    value={passkey}
                    onChange={(e) => setPasskey(e.target.value)}
                    placeholder="Enter FOUNDER_ADMIN_KEY"
                    className={inputClass}
                  />
                </div>
                <button
                  type="submit"
                  disabled={authLoading}
                  className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-full bg-[var(--color-inverse-bg)] px-5 py-2.5 text-[14px] font-medium text-[var(--color-inverse-ink)] transition-opacity hover:opacity-90 disabled:opacity-60"
                >
                  <KeyRound className="h-4 w-4" aria-hidden="true" />
                  <span>{authLoading ? 'Signing in...' : 'Unlock with Passkey'}</span>
                </button>
              </form>
            )}
          </div>
        ) : (
          <div className="mt-8 space-y-12">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-[14px] text-[var(--color-ink-secondary)]">
                Signed in as <span className="font-medium text-[var(--color-ink)]">{founderEmail}</span>
              </p>
              <button
                type="button"
                onClick={fetchAdminData}
                disabled={loadingData}
                className="inline-flex min-h-[40px] items-center gap-2 rounded-full border border-[var(--color-border)] px-4 py-1.5 text-[13px] font-medium text-[var(--color-ink)] hover:border-[var(--color-ink)]"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${loadingData ? 'animate-spin' : ''}`} aria-hidden="true" />
                <span>Refresh</span>
              </button>
            </div>

            {actionBanner && (
              <div
                role={actionBanner.type === 'error' ? 'alert' : 'status'}
                className={`flex items-start gap-2.5 rounded-[var(--radius-xs)] border p-3.5 text-[14px] ${
                  actionBanner.type === 'error'
                    ? 'border-[var(--color-error)] text-[var(--color-error)]'
                    : 'border-[var(--color-ink)] bg-[var(--color-bg-subtle)] text-[var(--color-ink)]'
                }`}
              >
                {actionBanner.type === 'error' ? (
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                ) : (
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                )}
                <span>{actionBanner.text}</span>
              </div>
            )}

            {/* 1. Add New Role Listing */}
            <div className="rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-bg-subtle)] p-6 sm:p-8">
              <h2 className="text-[20px] font-medium text-[var(--color-ink)]">
                Add New Open Role
              </h2>
              <p className="mt-1 text-[14px] text-[var(--color-ink-secondary)]">
                New listings publish directly to the public Careers page.
              </p>

              <form onSubmit={handleAddRole} className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <label htmlFor="new-role-title" className="block text-[13px] font-medium">
                    Role Title *
                  </label>
                  <input
                    id="new-role-title"
                    type="text"
                    required
                    disabled={savingNewRole}
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g., Next.js Frontend Engineer"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label htmlFor="new-role-team" className="block text-[13px] font-medium">
                    Team / Department *
                  </label>
                  <input
                    id="new-role-team"
                    type="text"
                    required
                    disabled={savingNewRole}
                    value={newTeam}
                    onChange={(e) => setNewTeam(e.target.value)}
                    placeholder="e.g., Engineering"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label htmlFor="new-role-location" className="block text-[13px] font-medium">
                    Location *
                  </label>
                  <input
                    id="new-role-location"
                    type="text"
                    required
                    disabled={savingNewRole}
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    placeholder="Jalgaon / Remote"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label htmlFor="new-role-status" className="block text-[13px] font-medium">
                    Hiring Status
                  </label>
                  <select
                    id="new-role-status"
                    disabled={savingNewRole}
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className={inputClass}
                  >
                    {ROLE_STATUS_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2 lg:col-span-4">
                  <button
                    type="submit"
                    disabled={savingNewRole}
                    className="inline-flex min-h-[44px] items-center gap-2 rounded-full bg-[var(--color-inverse-bg)] px-6 py-2.5 text-[14px] font-medium text-[var(--color-inverse-ink)] transition-opacity hover:opacity-90 disabled:opacity-60"
                  >
                    <Plus className="h-4 w-4" aria-hidden="true" />
                    <span>{savingNewRole ? 'Adding Role...' : 'Publish Role to Careers Page'}</span>
                  </button>
                </div>
              </form>
            </div>

            {/* 2. Manage Existing Role Listings */}
            <div>
              <h2 className="text-[22px] font-medium text-[var(--color-ink)]">
                Published Role Listings ({roles.length})
              </h2>

              <div className="mt-4 divide-y divide-[var(--color-border)] border-y border-[var(--color-border)]">
                {roles.map((role) => {
                  const isEditing = editingId === role.id;
                  return (
                    <div key={role.id} className="py-5">
                      {isEditing ? (
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                          <div>
                            <label className="block text-[12px] font-medium text-[var(--color-ink-secondary)]">
                              Title
                            </label>
                            <input
                              type="text"
                              value={editTitle}
                              onChange={(e) => setEditTitle(e.target.value)}
                              className={inputClass}
                            />
                          </div>
                          <div>
                            <label className="block text-[12px] font-medium text-[var(--color-ink-secondary)]">
                              Team
                            </label>
                            <input
                              type="text"
                              value={editTeam}
                              onChange={(e) => setEditTeam(e.target.value)}
                              className={inputClass}
                            />
                          </div>
                          <div>
                            <label className="block text-[12px] font-medium text-[var(--color-ink-secondary)]">
                              Location
                            </label>
                            <input
                              type="text"
                              value={editLocation}
                              onChange={(e) => setEditLocation(e.target.value)}
                              className={inputClass}
                            />
                          </div>
                          <div>
                            <label className="block text-[12px] font-medium text-[var(--color-ink-secondary)]">
                              Status
                            </label>
                            <select
                              value={editStatus}
                              onChange={(e) => setEditStatus(e.target.value)}
                              className={inputClass}
                            >
                              {ROLE_STATUS_OPTIONS.map((opt) => (
                                <option key={opt} value={opt}>
                                  {opt}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="flex flex-wrap gap-2 sm:col-span-2 lg:col-span-4">
                            <button
                              type="button"
                              disabled={savingEdit}
                              onClick={() => handleSaveEdit(role.id)}
                              className="inline-flex min-h-[40px] items-center gap-1.5 rounded-full bg-[var(--color-inverse-bg)] px-5 py-2 text-[13px] font-medium text-[var(--color-inverse-ink)]"
                            >
                              <Save className="h-3.5 w-3.5" aria-hidden="true" />
                              <span>{savingEdit ? 'Saving...' : 'Save Changes'}</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingId(null)}
                              className="inline-flex min-h-[40px] items-center gap-1.5 rounded-full border border-[var(--color-border)] px-4 py-2 text-[13px] font-medium text-[var(--color-ink)]"
                            >
                              <X className="h-3.5 w-3.5" aria-hidden="true" />
                              <span>Cancel</span>
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                          <div>
                            <div className="flex flex-wrap items-center gap-x-2.5 text-[13px] text-[var(--color-ink-secondary)]">
                              <span className="font-mono font-medium text-[var(--color-ink)]">
                                {role.code}
                              </span>
                              <span>·</span>
                              <span>{role.team}</span>
                              <span>·</span>
                              <span>{role.location}</span>
                              <span>·</span>
                              <span className="font-medium text-[var(--color-ink)]">{role.status}</span>
                            </div>
                            <h3 className="mt-1 text-[18px] font-medium text-[var(--color-ink)]">
                              {role.title}
                            </h3>
                          </div>

                          <div className="flex flex-wrap items-center gap-2">
                            <button
                              type="button"
                              onClick={() => startEdit(role)}
                              className="inline-flex min-h-[40px] items-center gap-1.5 rounded-full border border-[var(--color-border)] px-4 py-1.5 text-[13px] font-medium text-[var(--color-ink)] hover:border-[var(--color-ink)]"
                            >
                              <Edit3 className="h-3.5 w-3.5" aria-hidden="true" />
                              <span>Edit</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteRole(role)}
                              className="inline-flex min-h-[40px] items-center gap-1.5 rounded-full border border-[var(--color-border)] px-4 py-1.5 text-[13px] font-medium text-[var(--color-error)] hover:border-[var(--color-error)]"
                            >
                              <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                              <span>Delete</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 3. Live Applications, Consultation Leads & Razorpay Payments */}
            <div>
              <div className="flex flex-wrap items-center gap-3 border-b border-[var(--color-border)] pb-4">
                <button
                  type="button"
                  onClick={() => setActiveInboxTab('applications')}
                  className={`min-h-[40px] rounded-full px-5 py-2 text-[14px] font-medium transition-colors ${
                    activeInboxTab === 'applications'
                      ? 'bg-[var(--color-inverse-bg)] text-[var(--color-inverse-ink)]'
                      : 'border border-[var(--color-border)] text-[var(--color-ink-secondary)] hover:text-[var(--color-ink)]'
                  }`}
                >
                  Career Applications ({applications.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveInboxTab('contacts')}
                  className={`min-h-[40px] rounded-full px-5 py-2 text-[14px] font-medium transition-colors ${
                    activeInboxTab === 'contacts'
                      ? 'bg-[var(--color-inverse-bg)] text-[var(--color-inverse-ink)]'
                      : 'border border-[var(--color-border)] text-[var(--color-ink-secondary)] hover:text-[var(--color-ink)]'
                  }`}
                >
                  Consultation Leads ({contacts.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveInboxTab('payments')}
                  className={`min-h-[40px] rounded-full px-5 py-2 text-[14px] font-medium transition-colors ${
                    activeInboxTab === 'payments'
                      ? 'bg-[var(--color-inverse-bg)] text-[var(--color-inverse-ink)]'
                      : 'border border-[var(--color-border)] text-[var(--color-ink-secondary)] hover:text-[var(--color-ink)]'
                  }`}
                >
                  Payments & Webhook ({payments.length})
                </button>
              </div>

              {activeInboxTab === 'applications' ? (
                applications.length === 0 ? (
                  <p className="py-8 text-[15px] text-[var(--color-ink-secondary)]">
                    No career applications submitted yet.
                  </p>
                ) : (
                  <div className="mt-6 space-y-4">
                    {applications.map((app) => (
                      <article
                        key={app.id}
                        className="rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-bg-subtle)] p-5"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div>
                            <h3 className="text-[17px] font-medium text-[var(--color-ink)]">
                              {app.fullName} · {app.role}
                            </h3>
                            <p className="text-[13px] text-[var(--color-ink-secondary)]">
                              {app.email} · Ref: {app.id}
                            </p>
                          </div>
                          <span className="text-[12px] text-[var(--color-ink-secondary)] tabular-nums">
                            {new Date(app.submittedAt).toLocaleString()}
                          </span>
                        </div>
                        <div className="mt-4 space-y-2 border-t border-[var(--color-border)] pt-3 text-[14px] text-[var(--color-ink)]">
                          <p>
                            <span className="font-medium text-[var(--color-ink-secondary)]">01: </span>
                            {app.answer1}
                          </p>
                          <p>
                            <span className="font-medium text-[var(--color-ink-secondary)]">02: </span>
                            {app.answer2}
                          </p>
                          <p>
                            <span className="font-medium text-[var(--color-ink-secondary)]">03: </span>
                            {app.answer3}
                          </p>
                        </div>
                      </article>
                    ))}
                  </div>
                )
              ) : activeInboxTab === 'contacts' ? (
                contacts.length === 0 ? (
                  <p className="py-8 text-[15px] text-[var(--color-ink-secondary)]">
                    No consultation requests submitted yet.
                  </p>
                ) : (
                  <div className="mt-6 space-y-4">
                    {contacts.map((lead) => (
                      <article
                        key={lead.id}
                        className="rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-bg-subtle)] p-5"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div>
                            <h3 className="text-[17px] font-medium text-[var(--color-ink)]">
                              {lead.name} · {lead.businessType}
                            </h3>
                            <p className="text-[13px] text-[var(--color-ink-secondary)]">
                              {lead.phone} · {lead.email} · Plan: {lead.plan} · Ref: {lead.id}
                            </p>
                          </div>
                          <span className="text-[12px] text-[var(--color-ink-secondary)] tabular-nums">
                            {new Date(lead.submittedAt).toLocaleString()}
                          </span>
                        </div>
                        <p className="mt-3 border-t border-[var(--color-border)] pt-3 text-[14px] text-[var(--color-ink)]">
                          {lead.message}
                        </p>
                      </article>
                    ))}
                  </div>
                )
              ) : (
                <div className="mt-6 space-y-6">
                  {razorpaySetup && (
                    <div className="rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-bg-subtle)] p-5">
                      <h3 className="text-[16px] font-medium text-[var(--color-ink)]">
                        Razorpay Webhook Setup
                      </h3>
                      <p className="mt-1 text-[13px] text-[var(--color-ink-secondary)]">
                        Paste this HTTPS endpoint into Razorpay Dashboard → Settings → Webhooks:
                      </p>
                      <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
                        <code className="flex-1 overflow-x-auto rounded-[8px] border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-[13px] text-[var(--color-ink)]">
                          {razorpaySetup.webhookUrl}
                        </code>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard?.writeText(razorpaySetup.webhookUrl);
                            setCopiedWebhook(true);
                            setTimeout(() => setCopiedWebhook(false), 2000);
                          }}
                          className="inline-flex min-h-[40px] shrink-0 items-center justify-center gap-1.5 rounded-full border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-2 text-[13px] font-medium text-[var(--color-ink)] hover:border-[var(--color-ink)]"
                        >
                          {copiedWebhook ? (
                            <>
                              <Check className="h-3.5 w-3.5" aria-hidden="true" />
                              <span>Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                              <span>Copy URL</span>
                            </>
                          )}
                        </button>
                      </div>
                      <p className="mt-3 text-[13px] text-[var(--color-ink-secondary)]">
                        Active Events: {razorpaySetup.recommendedEvents.join(', ')} · Secret check:{' '}
                        <span className="font-medium text-[var(--color-ink)]">
                          {razorpaySetup.webhookSecretConfigured ? 'Configured on server' : 'Not set'}
                        </span>
                      </p>
                    </div>
                  )}

                  {payments.length === 0 ? (
                    <p className="py-4 text-[15px] text-[var(--color-ink-secondary)]">
                      No Razorpay orders or payments recorded yet.
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {payments.map((pay) => (
                        <article
                          key={pay.id}
                          className="rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-bg-subtle)] p-5"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div>
                              <h3 className="text-[17px] font-medium text-[var(--color-ink)]">
                                {pay.customerName} · ₹{pay.amountInr.toLocaleString('en-IN')} ·{' '}
                                {pay.planName}
                              </h3>
                              <p className="text-[13px] text-[var(--color-ink-secondary)]">
                                {pay.businessName} · {pay.customerPhone} · {pay.customerEmail}
                              </p>
                            </div>
                            <span className="text-[13px] font-medium text-[var(--color-ink)]">
                              {pay.status}
                            </span>
                          </div>
                          <p className="mt-2 font-mono text-[12px] text-[var(--color-ink-secondary)]">
                            Receipt: {pay.id} · Order: {pay.orderId}
                            {pay.paymentId ? ` · Payment: ${pay.paymentId}` : ''}
                            {pay.webhookEvent ? ` · Webhook: ${pay.webhookEvent}` : ''}
                          </p>
                        </article>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

import 'dotenv/config';
import express from 'express';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const isProduction = process.env.NODE_ENV === 'production';

const DATA_DIR = path.resolve(__dirname, 'data');
const SUBMISSIONS_FILE = path.join(DATA_DIR, 'submissions.json');
const AUTH_SECRET_FILE = path.join(DATA_DIR, 'auth-secret.txt');

const DEFAULT_FOUNDER_EMAILS = [
  'rajputpavan168@gmail.com',
  'rajputpawan168@gmail.com',
  'rajputpawan9765@gmail.com',
  'novesta111@gmail.com',
];

function getAllowedFounderEmails(): string[] {
  const custom = process.env.FOUNDER_EMAILS?.split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return custom && custom.length > 0 ? custom : DEFAULT_FOUNDER_EMAILS;
}

function getSessionSecret(): string {
  if (process.env.SESSION_SECRET?.trim()) {
    return process.env.SESSION_SECRET.trim();
  }
  try {
    if (fs.existsSync(AUTH_SECRET_FILE)) {
      const existing = fs.readFileSync(AUTH_SECRET_FILE, 'utf8').trim();
      if (existing.length >= 32) return existing;
    }
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    const generated = crypto.randomBytes(32).toString('hex');
    fs.writeFileSync(AUTH_SECRET_FILE, generated, 'utf8');
    return generated;
  } catch {
    return crypto.randomBytes(32).toString('hex');
  }
}

interface CareerRoleRecord {
  id: string;
  code: string;
  title: string;
  team: string;
  location: string;
  status: string;
}

interface ContactRecord {
  id: string;
  name: string;
  phone: string;
  email: string;
  businessType: string;
  plan: string;
  message: string;
  status: 'Accepted';
  submittedAt: string;
}

interface CareerApplicationRecord {
  id: string;
  role: string;
  fullName: string;
  email: string;
  answer1: string;
  answer2: string;
  answer3: string;
  status: 'Accepted';
  submittedAt: string;
}

interface FeedbackEntry {
  id: string;
  name: string;
  business: string;
  rating: number;
  comment: string;
  createdAt: string;
  isSample?: boolean;
}

interface PaymentRecord {
  id: string;
  orderId: string;
  paymentId?: string;
  planId: string;
  planName: string;
  amountInr: number;
  amountPaise: number;
  currency: 'INR';
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  businessName: string;
  status: 'Created' | 'Paid (Verified)' | 'Captured (Webhook)' | 'Failed';
  webhookVerified?: boolean;
  webhookEvent?: string;
  createdAt: string;
  updatedAt: string;
}

interface SubmissionsStore {
  contacts: ContactRecord[];
  applications: CareerApplicationRecord[];
  roles: CareerRoleRecord[];
  feedbacks: FeedbackEntry[];
  payments: PaymentRecord[];
}

const AUTHORITATIVE_PLANS: Record<
  string,
  { id: string; name: string; billing: string; amountInr: number }
> = {
  'large-business-all-services': {
    id: 'large-business-all-services',
    name: 'Large Business · All Services',
    billing: 'for 2 years',
    amountInr: 30000,
  },
  'medium-business-full-growth': {
    id: 'medium-business-full-growth',
    name: 'Medium Business · All Services & CRM',
    billing: 'for 2 years',
    amountInr: 17000,
  },
  'small-business-service-2yr': {
    id: 'small-business-service-2yr',
    name: 'Small Business · Services & Support',
    billing: 'for 2 years',
    amountInr: 7000,
  },
  'medium-business-website': {
    id: 'medium-business-website',
    name: 'Medium Business · Website Only',
    billing: 'one-time',
    amountInr: 10000,
  },
  'small-business-website': {
    id: 'small-business-website',
    name: 'Small Business · Website Only',
    billing: 'one-time',
    amountInr: 5000,
  },
};

const DEFAULT_CAREER_ROLES: CareerRoleRecord[] = [
  {
    id: 'fullstack-engineer',
    code: '01',
    title: 'Full-Stack Web Engineer',
    team: 'Engineering',
    location: 'Jalgaon / Remote',
    status: 'Accepting applications',
  },
  {
    id: 'seo-maps-specialist',
    code: '02',
    title: 'SEO & Google Maps Specialist',
    team: 'Search & Local Growth',
    location: 'Jalgaon / Remote',
    status: 'Accepting applications',
  },
  {
    id: 'ai-automation-builder',
    code: '03',
    title: 'AI & WhatsApp Automation Builder',
    team: 'Automation',
    location: 'Jalgaon / Remote',
    status: 'Accepting applications',
  },
];

const SAMPLE_FEEDBACKS: FeedbackEntry[] = [
  {
    id: 'sample-1',
    name: 'Aarav Kulkarni',
    business: 'Hospitality Partner (Sample)',
    rating: 5,
    comment:
      'Clean site architecture and fast Google Business Profile updates helped customers find our booking page directly.',
    createdAt: '2026-11-10T10:00:00.000Z',
    isSample: true,
  },
  {
    id: 'sample-2',
    name: 'Sneha Deshmukh',
    business: 'Cafe & Bakery (Sample)',
    rating: 5,
    comment:
      'Having WhatsApp inquiry automation linked to our menu saved hours every weekend.',
    createdAt: '2026-11-14T14:30:00.000Z',
    isSample: true,
  },
];

function loadStore(): SubmissionsStore {
  try {
    if (fs.existsSync(SUBMISSIONS_FILE)) {
      const parsed = JSON.parse(fs.readFileSync(SUBMISSIONS_FILE, 'utf8'));
      return {
        contacts: Array.isArray(parsed.contacts) ? parsed.contacts : [],
        applications: Array.isArray(parsed.applications) ? parsed.applications : [],
        roles:
          Array.isArray(parsed.roles) && parsed.roles.length > 0
            ? parsed.roles
            : [...DEFAULT_CAREER_ROLES],
        feedbacks: Array.isArray(parsed.feedbacks) ? parsed.feedbacks : [],
        payments: Array.isArray(parsed.payments) ? parsed.payments : [],
      };
    }
  } catch (err) {
    console.warn('Could not load submissions store:', err);
  }
  return {
    contacts: [],
    applications: [],
    roles: [...DEFAULT_CAREER_ROLES],
    feedbacks: [],
    payments: [],
  };
}

function saveStore(store: SubmissionsStore): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(SUBMISSIONS_FILE, JSON.stringify(store, null, 2), 'utf8');
  } catch (err) {
    console.warn('Could not persist submissions store:', err);
  }
}

interface ContactPayload {
  name?: unknown;
  phone?: unknown;
  email?: unknown;
  businessType?: unknown;
  plan?: unknown;
  message?: unknown;
}

function validateContactPayload(body: ContactPayload): {
  valid: boolean;
  error?: string;
  data?: {
    name: string;
    phone: string;
    email: string;
    businessType: string;
    plan: string;
    message: string;
  };
} {
  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const phone = typeof body.phone === 'string' ? body.phone.trim() : '';
  const email = typeof body.email === 'string' ? body.email.trim() : '';
  const businessType =
    typeof body.businessType === 'string' ? body.businessType.trim() : '';
  const plan = typeof body.plan === 'string' ? body.plan.trim().slice(0, 80) : '';
  const message = typeof body.message === 'string' ? body.message.trim() : '';

  if (name.length < 2 || name.length > 120) {
    return { valid: false, error: 'Please provide your full name (2–120 characters).' };
  }

  const cleanPhone = phone.replace(/[\s\-()]/g, '');
  if (!/^\+?[0-9]{8,15}$/.test(cleanPhone)) {
    return { valid: false, error: 'Please provide a valid phone or WhatsApp number.' };
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 160) {
    return { valid: false, error: 'Please provide a valid email address.' };
  }

  if (!businessType || businessType.length > 80) {
    return { valid: false, error: 'Please select a business type.' };
  }

  if (message.length < 3 || message.length > 2500) {
    return { valid: false, error: 'Please enter a message (3–2500 characters).' };
  }

  return {
    valid: true,
    data: { name, phone, email, businessType, plan, message },
  };
}

const FOUNDER_COOKIE_NAME = 'novesta_founder_session';
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 days

function parseCookies(cookieHeader: string | undefined): Record<string, string> {
  const result: Record<string, string> = {};
  if (!cookieHeader) return result;
  for (const part of cookieHeader.split(';')) {
    const idx = part.indexOf('=');
    if (idx === -1) continue;
    const key = part.slice(0, idx).trim();
    const val = part.slice(idx + 1).trim();
    try {
      result[key] = decodeURIComponent(val);
    } catch {
      result[key] = val;
    }
  }
  return result;
}

function signSessionToken(email: string, secret: string): string {
  const payload = Buffer.from(
    JSON.stringify({ email, exp: Date.now() + SESSION_TTL_MS }),
    'utf8'
  ).toString('base64url');
  const sig = crypto.createHmac('sha256', secret).update(payload).digest('base64url');
  return `${payload}.${sig}`;
}

function verifySessionToken(
  token: string | undefined,
  secret: string
): { valid: boolean; email?: string } {
  if (!token) return { valid: false };
  const parts = token.split('.');
  if (parts.length !== 2) return { valid: false };
  const [payload, sig] = parts;
  const expectedSig = crypto.createHmac('sha256', secret).update(payload).digest('base64url');
  const sigBuf = Buffer.from(sig);
  const expectedBuf = Buffer.from(expectedSig);
  if (sigBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(sigBuf, expectedBuf)) {
    return { valid: false };
  }
  try {
    const parsed = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    if (typeof parsed.email !== 'string' || typeof parsed.exp !== 'number') {
      return { valid: false };
    }
    if (Date.now() > parsed.exp) {
      return { valid: false };
    }
    return { valid: true, email: parsed.email };
  } catch {
    return { valid: false };
  }
}

async function startServer() {
  const app = express();
  app.set('trust proxy', 1);
  app.disable('x-powered-by');
  app.use(
    express.json({
      limit: '128kb',
      verify: (req, _res, buf) => {
        (req as express.Request & { rawBody?: Buffer }).rawBody = buf;
      },
    })
  );

  const resolveBaseUrl = (req: express.Request): string => {
    const envUrl = process.env.APP_URL?.trim();
    if (envUrl && /^https?:\/\//i.test(envUrl) && envUrl !== 'MY_APP_URL') {
      return envUrl.replace(/\/$/, '');
    }
    const proto = (req.headers['x-forwarded-proto'] as string)?.split(',')[0]?.trim() || req.protocol;
    return `${proto}://${req.get('host')}`;
  };

  app.use((_req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    next();
  });

  const store = loadStore();
  const sessionSecret = getSessionSecret();
  const otpChallenges = new Map<
    string,
    { codeHash: string; expiresAt: number; attempts: number }
  >();

  const getAuthenticatedFounder = (req: express.Request): string | null => {
    const cookies = parseCookies(req.headers.cookie);
    const verified = verifySessionToken(cookies[FOUNDER_COOKIE_NAME], sessionSecret);
    return verified.valid && verified.email ? verified.email : null;
  };

  const setFounderSessionCookie = (
    req: express.Request,
    res: express.Response,
    email: string
  ) => {
    const token = signSessionToken(email, sessionSecret);
    const proto = (req.headers['x-forwarded-proto'] as string)?.split(',')[0]?.trim() || req.protocol;
    const isHttps = proto === 'https' || req.secure;
    const cookieParts = [
      `${FOUNDER_COOKIE_NAME}=${encodeURIComponent(token)}`,
      'Path=/',
      `Max-Age=${Math.floor(SESSION_TTL_MS / 1000)}`,
      'HttpOnly',
      isHttps ? 'SameSite=None' : 'SameSite=Lax',
    ];
    if (isHttps) {
      cookieParts.push('Secure');
    }
    res.setHeader('Set-Cookie', cookieParts.join('; '));
  };

  // Health check endpoint
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      service: 'novesta-web',
      totalAcceptedRequests: store.contacts.length + store.applications.length,
    });
  });

  // Live open roles + real-time application counts
  app.get('/api/careers/roles', (_req, res) => {
    const countsByRole = store.applications.reduce<Record<string, number>>((acc, item) => {
      acc[item.role] = (acc[item.role] || 0) + 1;
      return acc;
    }, {});

    res.json({
      roles: store.roles.map((role) => ({
        ...role,
        applicantCount: countsByRole[role.title] || 0,
      })),
      totalApplications: store.applications.length,
    });
  });

  // Founder Auth & Admin Endpoints (strictly founder-only)
  app.get('/api/admin/session', (req, res) => {
    const founderEmail = getAuthenticatedFounder(req);
    res.json({
      authenticated: Boolean(founderEmail),
      email: founderEmail || undefined,
      emailOtpEnabled: Boolean(process.env.RESEND_API_KEY),
      passkeyEnabled: Boolean(process.env.FOUNDER_ADMIN_KEY?.trim()),
    });
  });

  app.post('/api/admin/logout', (req, res) => {
    const proto = (req.headers['x-forwarded-proto'] as string)?.split(',')[0]?.trim() || req.protocol;
    const isHttps = proto === 'https' || req.secure;
    const clearParts = [
      `${FOUNDER_COOKIE_NAME}=`,
      'Path=/',
      'Max-Age=0',
      'HttpOnly',
      isHttps ? 'SameSite=None' : 'SameSite=Lax',
    ];
    if (isHttps) clearParts.push('Secure');
    res.setHeader('Set-Cookie', clearParts.join('; '));
    res.json({ ok: true });
  });

  app.post('/api/admin/request-otp', async (req, res) => {
    const rawEmail = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    const allowedEmails = getAllowedFounderEmails();
    if (!rawEmail || !allowedEmails.includes(rawEmail)) {
      res.status(403).json({
        error: 'Access restricted: only the Novesta founder email can request an admin code.',
      });
      return;
    }

    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) {
      res.status(503).json({
        error: 'Email verification is unavailable without RESEND_API_KEY configured.',
      });
      return;
    }

    const code = String(crypto.randomInt(100000, 1000000));
    const codeHash = crypto.createHash('sha256').update(code).digest('hex');
    otpChallenges.set(rawEmail, {
      codeHash,
      expiresAt: Date.now() + 10 * 60 * 1000,
      attempts: 0,
    });

    const fromAddress =
      process.env.RESEND_FROM_EMAIL || 'Novesta Security <onboarding@resend.dev>';

    try {
      const emailResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: fromAddress,
          to: [rawEmail],
          subject: `[Novesta Founder Login] Your verification code: ${code}`,
          text: [
            `Your Novesta Founder Admin verification code is: ${code}`,
            ``,
            `This code expires in 10 minutes. If you did not request this login, you can safely ignore this email.`,
          ].join('\n'),
        }),
      });

      if (!emailResponse.ok) {
        const errText = await emailResponse.text();
        console.error('Resend OTP delivery error:', emailResponse.status, errText);
        res.status(502).json({
          error:
            'Could not deliver verification email to that address. Try your primary Resend email or Founder Passkey.',
        });
        return;
      }

      res.json({
        ok: true,
        message: `Verification code sent to ${rawEmail}. Check your inbox and enter the 6-digit code.`,
      });
    } catch (err) {
      console.error('Failed sending OTP email:', err);
      res.status(500).json({ error: 'Network error sending verification code.' });
    }
  });

  app.post('/api/admin/verify-otp', (req, res) => {
    const rawEmail = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    const code = typeof req.body?.code === 'string' ? req.body.code.trim() : '';

    const challenge = otpChallenges.get(rawEmail);
    if (!challenge || Date.now() > challenge.expiresAt) {
      otpChallenges.delete(rawEmail);
      res.status(401).json({ error: 'Code expired or invalid. Please request a new code.' });
      return;
    }

    if (challenge.attempts >= 5) {
      otpChallenges.delete(rawEmail);
      res.status(429).json({ error: 'Too many failed attempts. Please request a new code.' });
      return;
    }

    const inputHash = crypto.createHash('sha256').update(code).digest('hex');
    const a = Buffer.from(inputHash);
    const b = Buffer.from(challenge.codeHash);
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
      challenge.attempts += 1;
      res.status(401).json({ error: 'Incorrect verification code. Please check your email.' });
      return;
    }

    otpChallenges.delete(rawEmail);
    setFounderSessionCookie(req, res, rawEmail);
    res.json({ ok: true, email: rawEmail });
  });

  app.post('/api/admin/login-key', (req, res) => {
    const configuredKey = process.env.FOUNDER_ADMIN_KEY?.trim();
    if (!configuredKey) {
      res.status(403).json({
        error: 'Founder passkey login is not configured in environment variables. Use Email Verification Code instead.',
      });
      return;
    }

    const submittedKey = typeof req.body?.passkey === 'string' ? req.body.passkey.trim() : '';
    const expectedBuf = Buffer.from(configuredKey, 'utf8');
    const providedBuf = Buffer.from(submittedKey, 'utf8');
    if (
      providedBuf.length !== expectedBuf.length ||
      !crypto.timingSafeEqual(providedBuf, expectedBuf)
    ) {
      res.status(401).json({ error: 'Invalid founder passkey.' });
      return;
    }

    const primaryEmail = getAllowedFounderEmails()[0] || 'founder@novesta.in';
    setFounderSessionCookie(req, res, primaryEmail);
    res.json({ ok: true, email: primaryEmail });
  });

  app.get('/api/admin/submissions', (req, res) => {
    const founderEmail = getAuthenticatedFounder(req);
    if (!founderEmail) {
      res.status(401).json({ error: 'Founder authentication required.' });
      return;
    }

    const baseUrl = resolveBaseUrl(req);
    res.json({
      roles: store.roles,
      applications: store.applications,
      contacts: store.contacts,
      payments: store.payments,
      razorpaySetup: {
        keyConfigured: Boolean(
          process.env.RAZORPAY_KEY_ID?.trim() && process.env.RAZORPAY_KEY_SECRET?.trim()
        ),
        webhookSecretConfigured: Boolean(process.env.RAZORPAY_WEBHOOK_SECRET?.trim()),
        webhookUrl: `${baseUrl}/api/payments/razorpay/webhook`,
        recommendedEvents: ['payment.captured', 'order.paid', 'payment.failed'],
      },
    });
  });

  app.post('/api/admin/roles', (req, res) => {
    const founderEmail = getAuthenticatedFounder(req);
    if (!founderEmail) {
      res.status(401).json({ error: 'Founder authentication required.' });
      return;
    }

    const title = typeof req.body?.title === 'string' ? req.body.title.trim() : '';
    const team = typeof req.body?.team === 'string' ? req.body.team.trim() : '';
    const location = typeof req.body?.location === 'string' ? req.body.location.trim() : '';
    const status =
      typeof req.body?.status === 'string' && req.body.status.trim()
        ? req.body.status.trim()
        : 'Accepting applications';

    if (title.length < 2 || title.length > 100) {
      res.status(400).json({ error: 'Role title must be 2–100 characters.' });
      return;
    }
    if (team.length < 2 || team.length > 80) {
      res.status(400).json({ error: 'Team / department must be 2–80 characters.' });
      return;
    }
    if (location.length < 2 || location.length > 80) {
      res.status(400).json({ error: 'Location must be 2–80 characters.' });
      return;
    }

    const nextNumber = store.roles.length + 1;
    const code = String(nextNumber).padStart(2, '0');
    const baseSlug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
      .slice(0, 40);
    const id = `${baseSlug || 'role'}-${Date.now().toString(36)}`;

    const newRole: CareerRoleRecord = {
      id,
      code,
      title,
      team,
      location,
      status: status.slice(0, 40),
    };

    store.roles.push(newRole);
    saveStore(store);

    res.status(201).json({ ok: true, role: newRole, roles: store.roles });
  });

  app.put('/api/admin/roles/:id', (req, res) => {
    const founderEmail = getAuthenticatedFounder(req);
    if (!founderEmail) {
      res.status(401).json({ error: 'Founder authentication required.' });
      return;
    }

    const roleId = req.params.id;
    const target = store.roles.find((r) => r.id === roleId);
    if (!target) {
      res.status(404).json({ error: 'Role not found.' });
      return;
    }

    const title = typeof req.body?.title === 'string' ? req.body.title.trim() : target.title;
    const team = typeof req.body?.team === 'string' ? req.body.team.trim() : target.team;
    const location =
      typeof req.body?.location === 'string' ? req.body.location.trim() : target.location;
    const status = typeof req.body?.status === 'string' ? req.body.status.trim() : target.status;
    const code =
      typeof req.body?.code === 'string' && req.body.code.trim()
        ? req.body.code.trim().slice(0, 6)
        : target.code;

    if (title.length < 2 || title.length > 100) {
      res.status(400).json({ error: 'Role title must be 2–100 characters.' });
      return;
    }
    if (team.length < 2 || team.length > 80) {
      res.status(400).json({ error: 'Team / department must be 2–80 characters.' });
      return;
    }
    if (location.length < 2 || location.length > 80) {
      res.status(400).json({ error: 'Location must be 2–80 characters.' });
      return;
    }

    target.code = code;
    target.title = title;
    target.team = team;
    target.location = location;
    target.status = status.slice(0, 40) || 'Accepting applications';
    saveStore(store);

    res.json({ ok: true, role: target, roles: store.roles });
  });

  app.delete('/api/admin/roles/:id', (req, res) => {
    const founderEmail = getAuthenticatedFounder(req);
    if (!founderEmail) {
      res.status(401).json({ error: 'Founder authentication required.' });
      return;
    }

    const roleId = req.params.id;
    const before = store.roles.length;
    store.roles = store.roles
      .filter((r) => r.id !== roleId)
      .map((r, index) => ({ ...r, code: String(index + 1).padStart(2, '0') }));

    if (store.roles.length === before) {
      res.status(404).json({ error: 'Role not found.' });
      return;
    }

    saveStore(store);
    res.json({ ok: true, roles: store.roles });
  });

  app.post('/api/admin/roles/reset', (req, res) => {
    const founderEmail = getAuthenticatedFounder(req);
    if (!founderEmail) {
      res.status(401).json({ error: 'Founder authentication required.' });
      return;
    }
    store.roles = [...DEFAULT_CAREER_ROLES];
    saveStore(store);
    res.json({ ok: true, roles: store.roles });
  });

  app.delete('/api/admin/applications/:id', (req, res) => {
    const founderEmail = getAuthenticatedFounder(req);
    if (!founderEmail) {
      res.status(401).json({ error: 'Founder authentication required.' });
      return;
    }
    const appId = req.params.id;
    const before = store.applications.length;
    store.applications = store.applications.filter((a) => a.id !== appId);
    if (store.applications.length === before) {
      res.status(404).json({ error: 'Application not found.' });
      return;
    }
    saveStore(store);
    res.json({ ok: true, applications: store.applications });
  });

  app.delete('/api/admin/contacts/:id', (req, res) => {
    const founderEmail = getAuthenticatedFounder(req);
    if (!founderEmail) {
      res.status(401).json({ error: 'Founder authentication required.' });
      return;
    }
    const leadId = req.params.id;
    const before = store.contacts.length;
    store.contacts = store.contacts.filter((c) => c.id !== leadId);
    if (store.contacts.length === before) {
      res.status(404).json({ error: 'Consultation lead not found.' });
      return;
    }
    saveStore(store);
    res.json({ ok: true, contacts: store.contacts });
  });

  // Feedback store & endpoints (live entries persisted + seeded samples)
  app.get('/api/feedback', (_req, res) => {
    res.json({ items: [...store.feedbacks, ...SAMPLE_FEEDBACKS] });
  });

  app.post('/api/feedback', (req, res) => {
    const body = req.body || {};
    const name = typeof body.name === 'string' ? body.name.trim() : '';
    const business = typeof body.business === 'string' ? body.business.trim() : '';
    const comment = typeof body.comment === 'string' ? body.comment.trim() : '';
    const ratingNum = Number(body.rating);

    if (name.length < 2 || name.length > 80) {
      res.status(400).json({ error: 'Please enter your name (2–80 characters).' });
      return;
    }
    if (!Number.isInteger(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      res.status(400).json({ error: 'Please choose a rating between 1 and 5 stars.' });
      return;
    }
    if (comment.length < 3 || comment.length > 600) {
      res.status(400).json({ error: 'Please write feedback between 3 and 600 characters.' });
      return;
    }

    const entry: FeedbackEntry = {
      id: `fb-${Date.now()}`,
      name,
      business: business.slice(0, 80) || 'Verified Visitor',
      rating: ratingNum,
      comment,
      createdAt: new Date().toISOString(),
    };

    store.feedbacks.unshift(entry);
    if (store.feedbacks.length > 50) {
      store.feedbacks.length = 50;
    }
    saveStore(store);

    res.status(201).json({
      ok: true,
      item: entry,
      message: 'Thank you for sharing your feedback with Novesta.',
    });
  });

  /**
   * Razorpay Online Payments & Signed Webhook Integration
   */
  app.get('/api/payments/config', (_req, res) => {
    const keyId = process.env.RAZORPAY_KEY_ID?.trim() || '';
    const keySecret = process.env.RAZORPAY_KEY_SECRET?.trim() || '';
    res.json({
      enabled: Boolean(keyId && keySecret),
      currency: 'INR',
      plans: Object.values(AUTHORITATIVE_PLANS),
    });
  });

  app.post('/api/payments/razorpay/order', async (req, res) => {
    const keyId = process.env.RAZORPAY_KEY_ID?.trim();
    const keySecret = process.env.RAZORPAY_KEY_SECRET?.trim();
    if (!keyId || !keySecret) {
      res.status(503).json({
        error: 'Online checkout is temporarily unavailable. Please use WhatsApp or the consultation form.',
      });
      return;
    }

    const body = req.body || {};
    const planId = typeof body.planId === 'string' ? body.planId.trim() : '';
    const name = typeof body.name === 'string' ? body.name.trim() : '';
    const phone = typeof body.phone === 'string' ? body.phone.trim() : '';
    const email = typeof body.email === 'string' ? body.email.trim() : '';
    const businessName =
      typeof body.businessName === 'string' ? body.businessName.trim().slice(0, 120) : '';

    const plan = AUTHORITATIVE_PLANS[planId];
    if (!plan) {
      res.status(400).json({ error: 'Invalid pricing plan selected.' });
      return;
    }
    if (name.length < 2 || name.length > 120) {
      res.status(400).json({ error: 'Please enter your full name (2–120 characters).' });
      return;
    }
    const cleanPhone = phone.replace(/[\s\-()]/g, '');
    if (!/^\+?[0-9]{8,15}$/.test(cleanPhone)) {
      res.status(400).json({ error: 'Please enter a valid 10-digit phone or WhatsApp number.' });
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 160) {
      res.status(400).json({ error: 'Please enter a valid email address.' });
      return;
    }

    const receipt = `WBL-${Date.now().toString(36).toUpperCase()}`;
    const amountPaise = plan.amountInr * 100;
    const authHeader = `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString('base64')}`;

    try {
      const rpResponse = await fetch('https://api.razorpay.com/v1/orders', {
        method: 'POST',
        headers: {
          Authorization: authHeader,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: amountPaise,
          currency: 'INR',
          receipt,
          notes: {
            planId: plan.id,
            planName: plan.name,
            customerName: name,
            customerPhone: phone,
            customerEmail: email,
            businessName: businessName || 'Not specified',
          },
        }),
      });

      const rpData = (await rpResponse.json().catch(() => ({}))) as {
        id?: string;
        amount?: number;
        currency?: string;
        error?: { description?: string };
      };

      if (!rpResponse.ok || !rpData.id) {
        console.error('Razorpay order error:', rpResponse.status, rpData);
        res.status(502).json({
          error: rpData.error?.description || 'Could not initialize Razorpay checkout order.',
        });
        return;
      }

      const now = new Date().toISOString();
      const paymentRecord: PaymentRecord = {
        id: receipt,
        orderId: rpData.id,
        planId: plan.id,
        planName: plan.name,
        amountInr: plan.amountInr,
        amountPaise,
        currency: 'INR',
        customerName: name,
        customerPhone: phone,
        customerEmail: email,
        businessName: businessName || 'Not specified',
        status: 'Created',
        createdAt: now,
        updatedAt: now,
      };

      store.payments.unshift(paymentRecord);
      if (store.payments.length > 200) store.payments.length = 200;
      saveStore(store);

      res.json({
        ok: true,
        keyId,
        orderId: rpData.id,
        amount: amountPaise,
        amountInr: plan.amountInr,
        currency: 'INR',
        receipt,
        plan,
      });
    } catch (err) {
      console.error('Razorpay network error:', err);
      res.status(500).json({ error: 'Network error connecting to Razorpay.' });
    }
  });

  app.post('/api/payments/razorpay/verify', async (req, res) => {
    const keySecret = process.env.RAZORPAY_KEY_SECRET?.trim();
    if (!keySecret) {
      res.status(503).json({ error: 'Payment verification unavailable.' });
      return;
    }

    const orderId =
      typeof req.body?.razorpay_order_id === 'string' ? req.body.razorpay_order_id.trim() : '';
    const paymentId =
      typeof req.body?.razorpay_payment_id === 'string' ? req.body.razorpay_payment_id.trim() : '';
    const signature =
      typeof req.body?.razorpay_signature === 'string' ? req.body.razorpay_signature.trim() : '';

    if (!orderId || !paymentId || !signature) {
      res.status(400).json({ error: 'Incomplete payment verification payload.' });
      return;
    }

    const expectedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');

    const providedBuf = Buffer.from(signature, 'utf8');
    const expectedBuf = Buffer.from(expectedSignature, 'utf8');
    if (
      providedBuf.length !== expectedBuf.length ||
      !crypto.timingSafeEqual(providedBuf, expectedBuf)
    ) {
      res.status(400).json({ error: 'Payment signature verification failed.' });
      return;
    }

    const record = store.payments.find((p) => p.orderId === orderId);
    const now = new Date().toISOString();
    if (record) {
      record.paymentId = paymentId;
      record.status = 'Paid (Verified)';
      record.updatedAt = now;
      saveStore(store);
    }

    const recipient = process.env.CONTACT_TO_EMAIL || 'novesta111@gmail.com';
    const resendApiKey = process.env.RESEND_API_KEY;
    if (resendApiKey && record) {
      try {
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: process.env.RESEND_FROM_EMAIL || 'Novesta Payments <onboarding@resend.dev>',
            to: [recipient],
            reply_to: record.customerEmail,
            subject: `[Novesta Payment Verified] ₹${record.amountInr} — ${record.planName}`,
            text: [
              `Razorpay Payment Confirmed`,
              `Receipt: ${record.id}`,
              `Plan: ${record.planName} (₹${record.amountInr})`,
              `Order ID: ${orderId}`,
              `Payment ID: ${paymentId}`,
              ``,
              `Customer: ${record.customerName} (${record.businessName})`,
              `Phone / WhatsApp: ${record.customerPhone}`,
              `Email: ${record.customerEmail}`,
            ].join('\n'),
          }),
        });
      } catch (err) {
        console.warn('Could not email payment receipt:', err);
      }
    }

    res.json({
      ok: true,
      receipt: record?.id || orderId,
      orderId,
      paymentId,
      planName: record?.planName || 'Novesta Plan',
      amountInr: record?.amountInr || 0,
      status: 'Paid (Verified)',
      paidAt: now,
    });
  });

  app.get('/api/payments/razorpay/webhook', (_req, res) => {
    res.json({
      ok: true,
      status: 'ready',
      method: 'POST',
      webhookSecretConfigured: Boolean(process.env.RAZORPAY_WEBHOOK_SECRET?.trim()),
      events: ['payment.captured', 'order.paid', 'payment.failed'],
    });
  });

  app.post('/api/payments/razorpay/webhook', (req, res) => {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET?.trim();
    const signature = (req.headers['x-razorpay-signature'] as string | undefined)?.trim() || '';
    const rawBody = (req as express.Request & { rawBody?: Buffer }).rawBody;

    if (webhookSecret) {
      if (!signature || !rawBody) {
        res.status(401).json({ error: 'Missing webhook signature or payload.' });
        return;
      }
      const expected = crypto
        .createHmac('sha256', webhookSecret)
        .update(rawBody)
        .digest('hex');
      const sigBuf = Buffer.from(signature, 'utf8');
      const expBuf = Buffer.from(expected, 'utf8');
      if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
        res.status(401).json({ error: 'Invalid Razorpay webhook signature.' });
        return;
      }
    }

    const eventName = typeof req.body?.event === 'string' ? req.body.event : 'unknown';
    const paymentEntity = req.body?.payload?.payment?.entity;
    const orderEntity = req.body?.payload?.order?.entity;
    const orderId =
      (typeof paymentEntity?.order_id === 'string' && paymentEntity.order_id) ||
      (typeof orderEntity?.id === 'string' && orderEntity.id) ||
      '';
    const paymentId = typeof paymentEntity?.id === 'string' ? paymentEntity.id : undefined;

    if (orderId) {
      const now = new Date().toISOString();
      const existing = store.payments.find((p) => p.orderId === orderId);
      if (existing) {
        if (paymentId) existing.paymentId = paymentId;
        existing.webhookVerified = Boolean(webhookSecret);
        existing.webhookEvent = eventName;
        if (eventName === 'payment.captured' || eventName === 'order.paid') {
          existing.status =
            existing.status === 'Paid (Verified)' ? 'Paid (Verified)' : 'Captured (Webhook)';
        } else if (eventName === 'payment.failed' && existing.status === 'Created') {
          existing.status = 'Failed';
        }
        existing.updatedAt = now;
        saveStore(store);
      } else if (eventName === 'payment.captured' || eventName === 'order.paid') {
        const amountPaise = Number(paymentEntity?.amount || orderEntity?.amount || 0);
        const notes = paymentEntity?.notes || orderEntity?.notes || {};
        store.payments.unshift({
          id: `WBL-WH-${Date.now().toString(36).toUpperCase()}`,
          orderId,
          paymentId,
          planId: typeof notes.planId === 'string' ? notes.planId : 'external',
          planName: typeof notes.planName === 'string' ? notes.planName : 'Razorpay Payment',
          amountInr: Math.round(amountPaise / 100),
          amountPaise,
          currency: 'INR',
          customerName: typeof notes.customerName === 'string' ? notes.customerName : 'Razorpay Customer',
          customerPhone:
            typeof paymentEntity?.contact === 'string'
              ? paymentEntity.contact
              : typeof notes.customerPhone === 'string'
                ? notes.customerPhone
                : '',
          customerEmail:
            typeof paymentEntity?.email === 'string'
              ? paymentEntity.email
              : typeof notes.customerEmail === 'string'
                ? notes.customerEmail
                : '',
          businessName: typeof notes.businessName === 'string' ? notes.businessName : 'Not specified',
          status: 'Captured (Webhook)',
          webhookVerified: Boolean(webhookSecret),
          webhookEvent: eventName,
          createdAt: now,
          updatedAt: now,
        });
        saveStore(store);
      }
    }

    console.info('[Novesta Razorpay Webhook]', {
      event: eventName,
      orderId,
      paymentId,
      signatureVerified: Boolean(webhookSecret),
    });

    res.status(200).json({ ok: true, received: true, event: eventName });
  });

  // Serve /favicon.ico cleanly so browsers and search crawlers never get 404
  app.get('/favicon.ico', (_req, res) => {
    const publicLogo = path.resolve(__dirname, 'public/assets/aistudio/Novesta_72b3be73.png');
    const distLogo = path.resolve(__dirname, 'dist/assets/aistudio/Novesta_72b3be73.png');
    const target = fs.existsSync(distLogo) ? distLogo : publicLogo;
    if (fs.existsSync(target)) {
      res.setHeader('Cache-Control', 'public, max-age=86400');
      res.sendFile(target);
      return;
    }
    res.status(204).end();
  });

  // Google Search Console HTML file verification endpoint
  app.get('/google1e529b83336dbecf.html', (_req, res) => {
    res
      .type('text/html; charset=utf-8')
      .send('google-site-verification: google1e529b83336dbecf.html');
  });

  // Dynamic robots.txt & sitemap.xml using APP_URL or live request origin
  app.get('/robots.txt', (req, res) => {
    const baseUrl = resolveBaseUrl(req);
    res
      .type('text/plain; charset=utf-8')
      .setHeader('Cache-Control', 'public, max-age=3600')
      .send(`User-agent: *\nAllow: /\nDisallow: /api/\nDisallow: /admin\n\nSitemap: ${baseUrl}/sitemap.xml\n`);
  });

  app.get('/sitemap.xml', (req, res) => {
    const baseUrl = resolveBaseUrl(req);
    const today = new Date().toISOString().split('T')[0];
    const routes = [
      { path: '/', changefreq: 'weekly', priority: '1.0' },
      { path: '/careers', changefreq: 'weekly', priority: '0.8' },
      { path: '/privacy', changefreq: 'monthly', priority: '0.4' },
      { path: '/terms', changefreq: 'monthly', priority: '0.4' },
    ];
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes
  .map(
    (route) => `  <url>
    <loc>${baseUrl}${route.path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;
    res
      .type('application/xml; charset=utf-8')
      .setHeader('Cache-Control', 'public, max-age=3600')
      .send(xml);
  });

  /**
   * Real-time Consultation Request Endpoint
   */
  app.post('/api/contact', async (req, res) => {
    const validation = validateContactPayload(req.body || {});
    if (!validation.valid || !validation.data) {
      res.status(400).json({ error: validation.error || 'Invalid form submission.' });
      return;
    }

    const { name, phone, email, businessType, plan, message } = validation.data;
    const record: ContactRecord = {
      id: `NOV-CON-${Date.now().toString(36).toUpperCase()}`,
      name,
      phone,
      email,
      businessType,
      plan: plan || 'Not specified',
      message,
      status: 'Accepted',
      submittedAt: new Date().toISOString(),
    };

    store.contacts.unshift(record);
    if (store.contacts.length > 200) store.contacts.length = 200;
    saveStore(store);

    const recipient = process.env.CONTACT_TO_EMAIL || 'novesta111@gmail.com';
    const resendApiKey = process.env.RESEND_API_KEY;
    const fromAddress =
      process.env.RESEND_FROM_EMAIL || 'Novesta Website <onboarding@resend.dev>';

    let delivered = false;
    if (resendApiKey) {
      try {
        const emailResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: fromAddress,
            to: [recipient],
            reply_to: email,
            subject: `[Novesta Lead ${record.id}] ${businessType}${
              plan ? ` (${plan})` : ''
            } — ${name}`,
            text: [
              `New consultation inquiry from Novesta website`,
              `Reference ID: ${record.id}`,
              ``,
              `Name: ${name}`,
              `Phone / WhatsApp: ${phone}`,
              `Email: ${email}`,
              `Business Type: ${businessType}`,
              `Selected Plan: ${plan || 'Not specified'}`,
              ``,
              `Message:`,
              message,
            ].join('\n'),
          }),
        });
        delivered = emailResponse.ok;
        if (!emailResponse.ok) {
          console.error('Resend API error:', emailResponse.status, await emailResponse.text());
        }
      } catch (error) {
        console.error('Failed to send contact email:', error);
      }
    }

    console.info('[Novesta Contact Accepted]', {
      id: record.id,
      name,
      businessType,
      delivered,
    });

    res.status(200).json({
      ok: true,
      delivered,
      request: {
        id: record.id,
        name: record.name,
        businessType: record.businessType,
        plan: record.plan,
        status: record.status,
        submittedAt: record.submittedAt,
      },
      message: delivered
        ? `Request ${record.id} accepted and sent to our team. Expect a reply within 1 business day.`
        : `Request ${record.id} accepted and queued. You can also share this reference directly on WhatsApp.`,
    });
  });

  /**
   * Real-time Careers Application Endpoint
   */
  app.post('/api/careers/apply', async (req, res) => {
    const body = req.body || {};
    const role = typeof body.role === 'string' ? body.role.trim() : '';
    const fullName = typeof body.fullName === 'string' ? body.fullName.trim() : '';
    const email = typeof body.email === 'string' ? body.email.trim() : '';
    const answer1 = typeof body.answer1 === 'string' ? body.answer1.trim() : '';
    const answer2 = typeof body.answer2 === 'string' ? body.answer2.trim() : '';
    const answer3 = typeof body.answer3 === 'string' ? body.answer3.trim() : '';
    const confirmed = Boolean(body.confirmed);

    if (role.length < 2 || role.length > 100) {
      res.status(400).json({ error: 'Please enter or choose a role (2–100 characters).' });
      return;
    }
    if (fullName.length < 2 || fullName.length > 120) {
      res.status(400).json({ error: 'Please enter your full name (2–120 characters).' });
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 160) {
      res.status(400).json({ error: 'Please enter a valid email address.' });
      return;
    }
    if (
      answer1.length < 2 ||
      answer2.length < 2 ||
      answer3.length < 2 ||
      answer1.length > 3000 ||
      answer2.length > 3000 ||
      answer3.length > 3000
    ) {
      res.status(400).json({
        error: 'Please answer all three questions (at least 2 characters each).',
      });
      return;
    }
    if (!confirmed) {
      res.status(400).json({ error: 'Please confirm you read the expectations above.' });
      return;
    }

    const record: CareerApplicationRecord = {
      id: `NOV-APP-${Date.now().toString(36).toUpperCase()}`,
      role,
      fullName,
      email,
      answer1,
      answer2,
      answer3,
      status: 'Accepted',
      submittedAt: new Date().toISOString(),
    };

    store.applications.unshift(record);
    if (store.applications.length > 200) store.applications.length = 200;
    saveStore(store);

    const recipient = process.env.CONTACT_TO_EMAIL || 'novesta111@gmail.com';
    const resendApiKey = process.env.RESEND_API_KEY;
    const fromAddress =
      process.env.RESEND_FROM_EMAIL || 'Novesta Careers <onboarding@resend.dev>';

    let delivered = false;
    if (resendApiKey) {
      try {
        const emailResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: fromAddress,
            to: [recipient],
            reply_to: email,
            subject: `[Novesta Career Application ${record.id}] ${role} — ${fullName}`,
            text: [
              `New Careers Application`,
              `Reference ID: ${record.id}`,
              ``,
              `Role: ${role}`,
              `Full Name: ${fullName}`,
              `Email: ${email}`,
              ``,
              `01. Work sample / project:`,
              answer1,
              ``,
              `02. Hard problem solved from scratch:`,
              answer2,
              ``,
              `03. Local conversion fixes:`,
              answer3,
            ].join('\n'),
          }),
        });
        delivered = emailResponse.ok;
        if (!emailResponse.ok) {
          console.error('Resend career API error:', emailResponse.status, await emailResponse.text());
        }
      } catch (error) {
        console.error('Failed to send career application:', error);
      }
    }

    const roleCount = store.applications.filter((a) => a.role === role).length;
    console.info('[Novesta Career Application Accepted]', {
      id: record.id,
      role,
      fullName,
      delivered,
    });

    res.status(200).json({
      ok: true,
      delivered,
      application: {
        id: record.id,
        role: record.role,
        fullName: record.fullName,
        status: record.status,
        submittedAt: record.submittedAt,
      },
      roleApplicantCount: roleCount,
      message: delivered
        ? `Application ${record.id} accepted and sent to the founder.`
        : `Application ${record.id} accepted! You can also share your reference ID directly on WhatsApp.`,
    });
  });

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    const assetsPath = path.join(distPath, 'assets');
    if (fs.existsSync(assetsPath)) {
      app.use(
        '/assets',
        express.static(assetsPath, {
          maxAge: '1y',
          immutable: true,
        })
      );
    }

    // Serve remaining public/dist assets without shadowing / -> SEO HTML injector
    app.use(express.static(distPath, { index: false }));

    const indexPath = path.join(distPath, 'index.html');
    const cachedTemplate = fs.existsSync(indexPath)
      ? fs.readFileSync(indexPath, 'utf8')
      : null;

    const ROUTE_SEO: Record<string, { title: string; description: string }> = {
      '/': {
        title: 'Novesta — Grow Online. Sell More. Rank Higher.',
        description:
          'Novesta builds fast websites, online ordering systems, Google Maps rankings, SEO, and AI WhatsApp automation to grow your business online.',
      },
      '/careers': {
        title: 'Careers at Novesta — Engineering & Growth Roles',
        description:
          'Join Novesta in Jalgaon or remotely. Build high-speed websites, SEO engines, Google Maps visibility, and AI WhatsApp automation.',
      },
      '/privacy': {
        title: 'Privacy Policy — Novesta Digital Growth',
        description:
          "Read Novesta's privacy policy covering inquiry data, consultation requests, analytics, and embedded Google Maps usage details.",
      },
      '/terms': {
        title: 'Terms of Service — Novesta Digital Growth',
        description:
          "Review Novesta's terms of service covering project scope, client code and domain ownership, and third-party platform integrations.",
      },
    };

    app.get(['/', '/careers', '/privacy', '/terms', '/admin', '*'], (req, res) => {
      if (req.path.startsWith('/api/')) {
        res.status(404).json({ error: 'API endpoint not found' });
        return;
      }

      if (!cachedTemplate) {
        res.status(404).send('Build output not found. Run npm run build first.');
        return;
      }

      const baseUrl = resolveBaseUrl(req);
      const isPrivateAdmin = req.path === '/admin';
      const normalizedPath = ROUTE_SEO[req.path] ? req.path : '/';
      const routeMeta = ROUTE_SEO[normalizedPath];
      const canonicalUrl = `${baseUrl}${normalizedPath === '/' ? '/' : normalizedPath}`;
      const ogImageUrl = `${baseUrl}/assets/aistudio/Novesta_72b3be73.png`;
      const gscToken =
        process.env.VITE_GSC_VERIFICATION || process.env.GSC_VERIFICATION || '';

      let html = cachedTemplate
        .replace(
          /<title>.*?<\/title>/,
          `<title>${isPrivateAdmin ? 'Founder Access — Novesta' : routeMeta.title}</title>`
        )
        .replace(
          /<meta\s+name="robots"\s+content="[^"]*"\s*\/?>/i,
          isPrivateAdmin
            ? '<meta name="robots" content="noindex, nofollow" />'
            : '<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />'
        )
        .replace(
          /<meta\s+name="description"\s+content="[^"]*"\s*\/?>/i,
          `<meta name="description" content="${routeMeta.description}" />`
        )
        .replace(
          /<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/i,
          `<link rel="canonical" href="${canonicalUrl}" />`
        )
        .replace(
          /<meta\s+property="og:url"\s+content="[^"]*"\s*\/?>/i,
          `<meta property="og:url" content="${canonicalUrl}" />`
        )
        .replace(
          /<meta\s+property="og:title"\s+content="[^"]*"\s*\/?>/i,
          `<meta property="og:title" content="${routeMeta.title}" />`
        )
        .replace(
          /<meta\s+property="og:description"\s+content="[^"]*"\s*\/?>/i,
          `<meta property="og:description" content="${routeMeta.description}" />`
        )
        .replace(
          /<meta\s+property="og:image"\s+content="[^"]*"\s*\/?>/i,
          `<meta property="og:image" content="${ogImageUrl}" />`
        )
        .replace(
          /<meta\s+name="twitter:title"\s+content="[^"]*"\s*\/?>/i,
          `<meta name="twitter:title" content="${routeMeta.title}" />`
        )
        .replace(
          /<meta\s+name="twitter:description"\s+content="[^"]*"\s*\/?>/i,
          `<meta name="twitter:description" content="${routeMeta.description}" />`
        )
        .replace(
          /<meta\s+name="twitter:image"\s+content="[^"]*"\s*\/?>/i,
          `<meta name="twitter:image" content="${ogImageUrl}" />`
        )
        .replace(/https:\/\/novesta\.in/g, baseUrl)
        .replace(/"\/assets\/aistudio\/Novesta_72b3be73\.png"/g, `"${ogImageUrl}"`);

      if (gscToken && !gscToken.startsWith('REPLACE_')) {
        html = html.replace(
          '</head>',
          `  <meta name="google-site-verification" content="${gscToken}" />\n  </head>`
        );
      }

      res
        .status(200)
        .type('text/html; charset=utf-8')
        .setHeader('Cache-Control', 'no-cache')
        .setHeader('X-Robots-Tag', isPrivateAdmin ? 'noindex, nofollow' : 'index, follow')
        .send(html);
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Novesta server listening on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start Novesta server:', err);
  process.exit(1);
});

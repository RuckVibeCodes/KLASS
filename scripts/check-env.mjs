#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const DEFAULT_FILES = ['.env.local', '.env'];
const args = process.argv.slice(2);
const fileArgIndex = args.findIndex((arg) => arg === '--file' || arg === '-f');
const explicitFile = fileArgIndex >= 0 ? args[fileArgIndex + 1] : undefined;
const cwd = process.cwd();

const required = [
  {
    key: 'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
    label: 'Clerk publishable key',
    validate: (value) => value.startsWith('pk_test_') || value.startsWith('pk_live_'),
    hint: 'Expected a Clerk key beginning with pk_test_ or pk_live_.',
  },
  {
    key: 'CLERK_SECRET_KEY',
    label: 'Clerk secret key',
    validate: (value) => value.startsWith('sk_test_') || value.startsWith('sk_live_'),
    hint: 'Expected a Clerk key beginning with sk_test_ or sk_live_.',
  },
  {
    key: 'NEXT_PUBLIC_SUPABASE_URL',
    label: 'Supabase project URL',
    validate: (value) => /^https:\/\/[a-z0-9-]+\.supabase\.co$/i.test(value),
    hint: 'Expected a Supabase URL like https://project-ref.supabase.co.',
  },
  {
    key: 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    label: 'Supabase anon key',
    validate: looksLikeJwt,
    hint: 'Expected a JWT-like anon key from Supabase.',
  },
  {
    key: 'SUPABASE_SERVICE_ROLE_KEY',
    label: 'Supabase service role key',
    validate: looksLikeJwt,
    hint: 'Expected a JWT-like service role key from Supabase.',
  },
  {
    key: 'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
    label: 'Stripe publishable key',
    validate: (value) => value.startsWith('pk_test_') || value.startsWith('pk_live_'),
    hint: 'Expected a Stripe publishable key beginning with pk_test_ or pk_live_.',
  },
  {
    key: 'STRIPE_SECRET_KEY',
    label: 'Stripe secret key',
    validate: (value) => value.startsWith('sk_test_') || value.startsWith('sk_live_'),
    hint: 'Expected a Stripe secret key beginning with sk_test_ or sk_live_.',
  },
  {
    key: 'STRIPE_WEBHOOK_SECRET',
    label: 'Stripe webhook secret',
    validate: (value) => value.startsWith('whsec_'),
    hint: 'Expected a Stripe webhook signing secret beginning with whsec_.',
  },
  {
    key: 'STRIPE_PRICE_ID_MONTHLY',
    label: 'Stripe monthly price ID',
    validate: (value) => value.startsWith('price_'),
    hint: 'Expected a Stripe price ID beginning with price_.',
  },
  {
    key: 'NEXT_PUBLIC_APP_URL',
    label: 'App URL',
    validate: isHttpUrl,
    hint: 'Expected an absolute http(s) URL, e.g. http://localhost:3000.',
  },
];

const recommended = [
  {
    key: 'CLERK_WEBHOOK_SECRET',
    label: 'Clerk webhook secret',
    validate: (value) => value.startsWith('whsec_'),
    hint: 'Needed when Clerk webhooks are enabled; expected whsec_...',
  },
  {
    key: 'STRIPE_PRICE_PLATFORM_DIY',
    label: 'Stripe platform DIY price ID',
    validate: (value) => value.startsWith('price_'),
    hint: 'Needed for platform subscription checkout.',
  },
  {
    key: 'STRIPE_PRICE_PLATFORM_DWY',
    label: 'Stripe platform DWY price ID',
    validate: (value) => value.startsWith('price_'),
    hint: 'Needed for platform subscription checkout.',
  },
  {
    key: 'STRIPE_PRICE_PLATFORM_DFY',
    label: 'Stripe platform DFY price ID',
    validate: (value) => value.startsWith('price_'),
    hint: 'Needed for platform subscription checkout.',
  },
  {
    key: 'STRIPE_CONNECT_WEBHOOK_SECRET',
    label: 'Stripe Connect webhook secret',
    validate: (value) => value.startsWith('whsec_'),
    hint: 'Needed for Connect account/payment events.',
  },
  {
    key: 'RESEND_API_KEY',
    label: 'Resend API key',
    validate: (value) => value.startsWith('re_'),
    hint: 'Needed for lead nurturing email delivery.',
  },
  {
    key: 'CRON_SECRET',
    label: 'Cron secret',
    validate: (value) => value.length >= 16,
    hint: 'Use a random value of at least 16 characters.',
  },
];

const optional = [
  {
    key: 'ANTHROPIC_API_KEY',
    label: 'Anthropic API key',
    validate: (value) => value.startsWith('sk-ant-'),
    hint: 'Required only for AI quiz/lesson generation.',
  },
  {
    key: 'WHOP_API_KEY',
    label: 'Whop API key',
    validate: (value) => value.length >= 12,
    hint: 'Required only for Whop integrations.',
  },
  {
    key: 'WHOP_WEBHOOK_SECRET',
    label: 'Whop webhook secret',
    validate: (value) => value.length >= 12,
    hint: 'Required only for Whop webhook verification.',
  },
  {
    key: 'NEXT_PUBLIC_TENOR_API_KEY',
    label: 'Tenor API key',
    validate: (value) => value.length >= 10,
    hint: 'Required only for GIF picker search.',
  },
];

const envFiles = explicitFile ? [explicitFile] : DEFAULT_FILES;
const loaded = loadEnvFiles(envFiles);
const env = { ...loaded.values, ...process.env };
const sourceLabel = loaded.files.length ? loaded.files.join(', ') : 'process environment only';

const requiredErrors = validateGroup(required, env, 'required');
const recommendedWarnings = validateGroup(recommended, env, 'recommended');
const optionalWarnings = validateGroup(optional, env, 'optional', { ignoreMissing: true });

console.log(`KLASS environment readiness check`);
console.log(`Loaded: ${sourceLabel}`);

if (requiredErrors.length === 0) {
  console.log('\n✅ Required environment variables look ready.');
} else {
  console.error('\n❌ Required environment variables need attention:');
  for (const issue of requiredErrors) {
    console.error(`- ${issue.key}: ${issue.message}`);
  }
}

const warnings = [...recommendedWarnings, ...optionalWarnings];
if (warnings.length > 0) {
  console.log('\n⚠️  Optional/recommended configuration notes:');
  for (const issue of warnings) {
    console.log(`- ${issue.key}: ${issue.message}`);
  }
}

if (requiredErrors.length > 0) {
  console.error('\nFix the required values above, then run `npm run check:env` again.');
  process.exit(1);
}

console.log('Run `npm run dev` or `npm run build` next.');

function loadEnvFiles(files) {
  const values = {};
  const loadedFiles = [];

  for (const file of files) {
    const resolved = path.resolve(cwd, file);
    if (!fs.existsSync(resolved)) continue;

    const content = fs.readFileSync(resolved, 'utf8');
    Object.assign(values, parseEnv(content));
    loadedFiles.push(file);
  }

  if (explicitFile && loadedFiles.length === 0) {
    console.error(`Environment file not found: ${explicitFile}`);
    process.exit(1);
  }

  return { values, files: loadedFiles };
}

function parseEnv(content) {
  const parsed = {};

  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;

    const equalsIndex = line.indexOf('=');
    if (equalsIndex === -1) continue;

    const key = line.slice(0, equalsIndex).trim();
    let value = line.slice(equalsIndex + 1).trim();

    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }

    parsed[key] = value;
  }

  return parsed;
}

function validateGroup(definitions, envValues, groupName, options = {}) {
  const issues = [];

  for (const definition of definitions) {
    const value = envValues[definition.key];
    if (!value) {
      if (!options.ignoreMissing) {
        issues.push({ key: definition.key, message: `Missing ${groupName} value for ${definition.label}. ${definition.hint}` });
      }
      continue;
    }

    if (isPlaceholder(value)) {
      issues.push({ key: definition.key, message: `Still looks like a placeholder (${maskValue(value)}). ${definition.hint}` });
      continue;
    }

    if (definition.validate && !definition.validate(value)) {
      issues.push({ key: definition.key, message: `Unexpected format (${maskValue(value)}). ${definition.hint}` });
    }
  }

  return issues;
}

function isPlaceholder(value) {
  const normalized = value.trim().toLowerCase();
  return (
    normalized === '' ||
    normalized.includes('...') ||
    normalized.includes('xxx') ||
    normalized.includes('your-') ||
    normalized.includes('example') ||
    normalized.includes('replace_me') ||
    normalized.includes('changeme') ||
    normalized.includes('todo')
  );
}

function looksLikeJwt(value) {
  return /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(value);
}

function isHttpUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

function maskValue(value) {
  if (value.length <= 8) return value;
  return `${value.slice(0, 6)}…${value.slice(-4)}`;
}

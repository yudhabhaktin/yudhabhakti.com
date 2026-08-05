/**
 * Diagnoses a Cloudflare API token before you put it in CI.
 *
 *   CLOUDFLARE_API_TOKEN=xxxx node scripts/check-cf-token.mjs
 *   CLOUDFLARE_API_TOKEN=xxxx CLOUDFLARE_ACCOUNT_ID=yyyy node scripts/check-cf-token.mjs
 *
 * Answers the two questions that produce an identical "Authentication error
 * [code: 10000]" from wrangler: is the token missing Workers permission, or is
 * it scoped to a different account than the one you are deploying to?
 *
 * Never prints the token.
 */
const API = 'https://api.cloudflare.com/client/v4';
const token = process.env.CLOUDFLARE_API_TOKEN;
const wantAccount = process.env.CLOUDFLARE_ACCOUNT_ID;

if (!token) {
  console.error('CLOUDFLARE_API_TOKEN is not set.');
  process.exit(2);
}

const call = async (path) => {
  const res = await fetch(`${API}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json().catch(() => ({ success: false, errors: [{ message: 'non-JSON response' }] }));
};

const msg = (j) => j.errors?.map((e) => `${e.message} [code: ${e.code}]`).join('; ') || 'unknown';

console.log(`token: ${token.slice(0, 5)}…${token.slice(-4)} (${token.length} chars)\n`);

// 1. Is the token real and active?
const verify = await call('/user/tokens/verify');
if (!verify.success) {
  console.log(`✗ token is not valid — ${msg(verify)}`);
  console.log('\n  Create a new one: Cloudflare → My Profile → API Tokens → Create Token');
  process.exit(1);
}
console.log(`✓ token is valid and ${verify.result.status}`);

// 2. Which accounts can it see? Needs Account Settings:Read, which the
//    "Edit Cloudflare Workers" template includes.
const accounts = await call('/accounts');
let ids = [];
if (accounts.success && accounts.result.length) {
  ids = accounts.result.map((a) => a.id);
  console.log(`✓ can see ${accounts.result.length} account(s):`);
  accounts.result.forEach((a) => console.log(`    ${a.id}  ${a.name}`));
} else {
  console.log('! cannot list accounts (no Account Settings:Read)');
  console.log('  Not fatal on its own, but it means the token was not made from the');
  console.log('  "Edit Cloudflare Workers" template, which grants it.');
}

// 3. The actual question: can it deploy Workers to the target account?
const targets = wantAccount ? [wantAccount] : ids;
if (!targets.length) {
  console.log('\n? no account to test against. Re-run with CLOUDFLARE_ACCOUNT_ID set.');
  process.exit(1);
}

console.log('');
let ok = false;
for (const id of targets) {
  const scripts = await call(`/accounts/${id}/workers/scripts`);
  if (scripts.success) {
    ok = true;
    console.log(`✓ Workers access OK on ${id} (${scripts.result.length} worker(s) deployed)`);
  } else {
    console.log(`✗ Workers access DENIED on ${id} — ${msg(scripts)}`);
  }
}

console.log('');
if (ok) {
  console.log('This token can deploy. Set it as the CI secret:');
  console.log('  gh secret set CLOUDFLARE_API_TOKEN --repo yudhabhaktin/yudhabhakti.com');
} else if (ids.length && wantAccount && !ids.includes(wantAccount)) {
  console.log('DIAGNOSIS: the token is scoped to a different account.');
  console.log(`  CLOUDFLARE_ACCOUNT_ID is ${wantAccount}, but the token only sees:`);
  ids.forEach((i) => console.log(`    ${i}`));
  console.log('  Fix the account ID secret, or make a token on the right account.');
} else {
  console.log('DIAGNOSIS: the token lacks the Workers Scripts:Edit permission.');
  console.log('  Cloudflare → My Profile → API Tokens → Create Token');
  console.log('  → use the "Edit Cloudflare Workers" template (not a custom token,');
  console.log('    and not an R2 token — those cannot deploy Workers).');
}
process.exit(ok ? 0 : 1);

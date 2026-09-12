/*
 * Camelot Shadow Subspace adapter for Puter.
 *
 * Puter is the authenticated workspace surface. This extension deliberately
 * talks only to the governed Bifrost adapter. It never receives the native
 * camelot-shadowd bearer token and it never exposes an arbitrary proxy.
 */

const BIFROST_URL = String(process.env.CAMELOT_BIFROST_URL || 'http://127.0.0.1:4188').replace(/\/$/, '');

function operatorFrom(req) {
  return String(
    req?.user?.username ||
    req?.user?.email ||
    req?.actor?.uid ||
    req?.actor?.type?.id ||
    'puter-authenticated-user'
  ).slice(0, 160);
}

function text(value, max = 2000) {
  const out = String(value ?? '').trim();
  return out.length > max ? out.slice(0, max) : out;
}

function uuid(value) {
  const out = text(value, 64);
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(out)) {
    throw new Error('invalid id');
  }
  return out;
}

function send(res, status, body) {
  res.status(status).json(body);
}

async function bifrost(path, init = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  try {
    const response = await fetch(`${BIFROST_URL}/api/bifrost/shadow${path}`, {
      ...init,
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
        ...(init.body ? { 'Content-Type': 'application/json' } : {}),
        ...(init.headers || {}),
      },
    });
    const body = await response.json().catch(() => ({}));
    return { status: response.status, body };
  } finally {
    clearTimeout(timer);
  }
}

extension.get('/api/camelot-shadow/health', async (req, res) => {
  try {
    const result = await bifrost('/health');
    send(res, result.status, {
      ...result.body,
      workspace: 'puter',
      boundary: 'bifrost-only',
      nativeCredentialExposed: false,
    });
  } catch (error) {
    send(res, 502, { error: error?.message || 'Camelot Shadow boundary unavailable' });
  }
});

extension.get('/api/camelot-shadow/sessions', async (req, res) => {
  try {
    const result = await bifrost('/sessions');
    send(res, result.status, result.body);
  } catch (error) {
    send(res, 502, { error: error?.message || 'Unable to list Shadow sessions' });
  }
});

extension.post('/api/camelot-shadow/sessions', async (req, res) => {
  try {
    const mission = text(req.body?.mission);
    const delegate = text(req.body?.delegate || 'sir_umbra', 96);
    if (!mission) return send(res, 400, { error: 'mission is required' });

    const result = await bifrost('/sessions', {
      method: 'POST',
      body: JSON.stringify({
        mission,
        knight_id: 'sir_umbra',
        delegate_id: delegate === 'sir_umbra' ? null : delegate,
        ttl_seconds: Math.min(3600, Math.max(300, Number(req.body?.ttl_seconds || 1800))),
        risk_ceiling: ['R0','R1','R2','R3','R4','R5'].includes(req.body?.risk_ceiling) ? req.body.risk_ceiling : 'R5',
        memory_mb: Math.min(768, Math.max(128, Number(req.body?.memory_mb || 512))),
        cpu_quota_percent: Math.min(50, Math.max(10, Number(req.body?.cpu_quota_percent || 25))),
        capabilities: ['shadow.read', 'shadow.write', 'shadow.plan', 'bifrost.request'],
        allowed_egress: ['bifrost://governed'],
      }),
    });
    send(res, result.status, result.body);
  } catch (error) {
    send(res, 400, { error: error?.message || 'Unable to summon Shadow session' });
  }
});

extension.post('/api/camelot-shadow/effects', async (req, res) => {
  try {
    const sessionId = uuid(req.body?.session_id);
    const risk = text(req.body?.risk, 2).toUpperCase();
    const effect = text(req.body?.effect, 128);
    const target = text(req.body?.target, 512);
    const intent = text(req.body?.intent);
    if (!['R0','R1','R2','R3','R4','R5','R6'].includes(risk)) return send(res, 400, { error: 'invalid risk ring' });
    if (!effect || !target || !intent) return send(res, 400, { error: 'effect, target and intent are required' });

    const result = await bifrost(`/sessions/${sessionId}/effects`, {
      method: 'POST',
      body: JSON.stringify({
        risk,
        effect,
        target,
        intent,
        requested_capabilities: effect.startsWith('external') || effect.startsWith('production') ? ['bifrost.request'] : [],
      }),
    });
    send(res, result.status, result.body);
  } catch (error) {
    send(res, 400, { error: error?.message || 'Unable to propose Shadow effect' });
  }
});

extension.post('/api/camelot-shadow/decision', async (req, res) => {
  try {
    const sessionId = uuid(req.body?.session_id);
    const effectId = uuid(req.body?.effect_id);
    const decision = req.body?.decision === 'deny' ? 'deny' : 'approve';
    const scope = req.body?.scope === 'sovereign' ? 'sovereign' : 'once';
    const note = text(req.body?.note, 1000) || `${decision} from authenticated Puter Shadow Castle.`;
    const operator = operatorFrom(req);

    const result = await bifrost(`/sessions/${sessionId}/effects/${effectId}/${decision}`, {
      method: 'POST',
      body: JSON.stringify(decision === 'approve'
        ? { operator, scope, note }
        : { operator, note }),
    });
    send(res, result.status, result.body);
  } catch (error) {
    send(res, 400, { error: error?.message || 'Unable to record HITL decision' });
  }
});

extension.get('/api/camelot-shadow/receipts/:session_id', async (req, res) => {
  try {
    const sessionId = uuid(req.params?.session_id);
    const result = await bifrost(`/sessions/${sessionId}/receipts`);
    send(res, result.status, result.body);
  } catch (error) {
    send(res, 400, { error: error?.message || 'Unable to read Shadow receipts' });
  }
});

extension.post('/api/camelot-shadow/seal', async (req, res) => {
  try {
    const sessionId = uuid(req.body?.session_id);
    const result = await bifrost(`/sessions/${sessionId}/seal`, { method: 'POST', body: '{}' });
    send(res, result.status, result.body);
  } catch (error) {
    send(res, 400, { error: error?.message || 'Unable to seal Shadow session' });
  }
});

console.log('[camelot-shadow] authenticated Bifrost adapter registered');

/*
 * Camelot Shadow Castle desktop extension.
 *
 * This GUI is intentionally a Puter-native workspace over the authenticated
 * backend adapter. Native execution authority remains behind Camelot Bifrost.
 */

const UIElement = use('ui.UIElement');

const apiOrigin = () => String(window.api_origin || '').replace(/\/$/, '');
const authHeaders = () => ({
    'Authorization': `Bearer ${puter.authToken}`,
    'Accept': 'application/json',
});

async function shadowFetch(path, init = {}) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);
    try {
        const response = await fetch(`${apiOrigin()}/api/camelot-shadow${path}`, {
            ...init,
            signal: controller.signal,
            credentials: 'same-origin',
            headers: {
                ...authHeaders(),
                ...(init.body ? { 'Content-Type': 'application/json' } : {}),
                ...(init.headers || {}),
            },
        });
        const body = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(body?.error || `HTTP ${response.status}`);
        return body;
    } finally {
        clearTimeout(timer);
    }
}

function node(tag, className, text) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
}

function button(text, className, onClick) {
    const element = node('button', className, text);
    element.type = 'button';
    element.addEventListener('click', onClick);
    return element;
}

class UICamelotShadowCastle extends UIElement {
    static CSS = `
        .camelot-shadow-castle {
            min-height: 560px;
            height: 100%;
            color: #e9e7f5;
            background:
                radial-gradient(circle at 50% -10%, rgba(124,58,237,.24), transparent 38%),
                linear-gradient(180deg, #08070e, #0b0812 52%, #05060a);
            font-family: Inter, system-ui, sans-serif;
            overflow: auto;
        }
        .csc-header {
            position: sticky; top: 0; z-index: 5;
            display: flex; align-items: center; gap: 12px;
            padding: 14px 16px;
            border-bottom: 1px solid rgba(167,139,250,.22);
            background: rgba(5,5,11,.92);
            backdrop-filter: blur(12px);
        }
        .csc-glyph {
            display:grid; place-items:center; width:38px; height:38px;
            border:1px solid rgba(167,139,250,.35); border-radius:50%;
            color:#c4b5fd; background:rgba(91,33,182,.14);
            box-shadow:0 0 26px rgba(124,58,237,.2);
            font-size:21px;
        }
        .csc-header-copy { min-width:0; flex:1; }
        .csc-header-copy strong { display:block; font-size:12px; letter-spacing:.13em; color:#fafafa; }
        .csc-header-copy small { display:block; margin-top:3px; color:#746b86; font-size:9px; letter-spacing:.06em; }
        .csc-health { display:flex; align-items:center; gap:6px; color:#9ca3af; font-size:9px; font-weight:800; }
        .csc-health i { width:7px; height:7px; border-radius:50%; background:#ef4444; }
        .csc-health.online i { background:#34d399; box-shadow:0 0 10px rgba(52,211,153,.55); }
        .csc-grid { display:grid; grid-template-columns:230px minmax(360px,1fr) 260px; gap:12px; padding:12px; }
        .csc-column { display:flex; flex-direction:column; gap:12px; min-width:0; }
        .csc-card { border:1px solid rgba(148,163,184,.14); border-radius:14px; padding:12px; background:rgba(8,9,16,.78); box-shadow:inset 0 1px rgba(255,255,255,.025); }
        .csc-title { margin-bottom:10px; color:#c4b5fd; font-size:9px; font-weight:900; letter-spacing:.12em; text-transform:uppercase; }
        .csc-card label { display:grid; gap:4px; margin:8px 0; color:#776f89; font-size:8px; font-weight:800; text-transform:uppercase; letter-spacing:.08em; }
        .csc-card input, .csc-card textarea, .csc-card select {
            box-sizing:border-box; width:100%; border:1px solid rgba(148,163,184,.17); border-radius:8px;
            padding:8px 9px; outline:none; background:#050611; color:#e5e7eb; font:500 10px/1.45 ui-monospace,monospace;
        }
        .csc-card textarea { min-height:82px; resize:vertical; }
        .csc-button { width:100%; border:1px solid rgba(167,139,250,.38); border-radius:8px; padding:9px; color:#ddd6fe; background:rgba(91,33,182,.18); font-size:9px; font-weight:850; cursor:pointer; }
        .csc-button:hover { background:rgba(109,40,217,.28); }
        .csc-button.danger { border-color:rgba(248,113,113,.28); color:#fca5a5; background:rgba(127,29,29,.08); }
        .csc-truth { padding:9px; border-radius:9px; background:rgba(16,185,129,.055); color:#6ee7b7; font-size:9px; line-height:1.45; }
        .csc-truth b { display:block; color:#a7f3d0; }
        .csc-session-list { display:grid; gap:7px; }
        .csc-session { display:grid; grid-template-columns:7px 1fr auto; gap:7px; align-items:center; width:100%; padding:8px; border:1px solid rgba(148,163,184,.12); border-radius:9px; text-align:left; color:#a3a3b4; background:rgba(2,6,23,.45); cursor:pointer; }
        .csc-session.active { border-color:rgba(167,139,250,.5); background:rgba(91,33,182,.12); }
        .csc-session > i { width:6px; height:6px; border-radius:50%; background:#34d399; }
        .csc-session strong, .csc-session small { display:block; }
        .csc-session strong { color:#e5e7eb; font-size:9px; }
        .csc-session small { margin-top:2px; color:#626278; font-size:7px; }
        .csc-session em { color:#f0abfc; font:800 8px ui-monospace,monospace; font-style:normal; }
        .csc-mission h2 { margin:3px 0 6px; color:#fff; font-size:16px; line-height:1.3; }
        .csc-mission-state { display:inline-flex; border:1px solid rgba(52,211,153,.24); border-radius:999px; padding:4px 7px; color:#6ee7b7; font-size:7px; font-weight:900; letter-spacing:.08em; }
        .csc-metrics { display:grid; grid-template-columns:repeat(4,1fr); gap:7px; margin:10px 0; }
        .csc-metrics span { padding:8px; border-radius:8px; background:rgba(2,6,23,.4); }
        .csc-metrics b, .csc-metrics small { display:block; }
        .csc-metrics b { color:#e5e7eb; font-size:10px; }
        .csc-metrics small { margin-top:2px; color:#60677b; font-size:7px; }
        .csc-tags { display:flex; flex-wrap:wrap; gap:5px; }
        .csc-tags span { border:1px solid rgba(56,189,248,.16); border-radius:999px; padding:3px 6px; color:#7dd3fc; background:rgba(14,165,233,.05); font:700 7px ui-monospace,monospace; }
        .csc-boundary { margin-top:9px; padding:8px; border-radius:8px; background:rgba(2,6,23,.45); color:#7c8297; font:600 8px ui-monospace,monospace; overflow-wrap:anywhere; }
        .csc-effect { display:grid; grid-template-columns:34px 1fr auto; gap:7px; padding:8px 0; border-bottom:1px solid rgba(148,163,184,.08); }
        .csc-effect > b { color:#fbbf24; font-size:8px; }
        .csc-effect strong, .csc-effect small, .csc-effect em { display:block; }
        .csc-effect strong { color:#e5e7eb; font-size:9px; }
        .csc-effect small { color:#7dd3fc; font:700 7px ui-monospace,monospace; }
        .csc-effect em { margin-top:3px; color:#67677b; font-size:8px; font-style:normal; line-height:1.35; }
        .csc-effect > span:last-of-type { color:#8d8da0; font-size:7px; text-transform:uppercase; }
        .csc-hitl { grid-column:2 / 4; display:flex; justify-content:flex-end; gap:6px; }
        .csc-hitl button { border:1px solid rgba(52,211,153,.25); border-radius:7px; padding:6px 8px; color:#6ee7b7; background:rgba(16,185,129,.06); font-size:8px; cursor:pointer; }
        .csc-hitl button.deny { border-color:rgba(248,113,113,.25); color:#fca5a5; background:rgba(127,29,29,.07); }
        .csc-receipts { display:grid; gap:7px; max-height:330px; overflow:auto; }
        .csc-receipt { display:grid; grid-template-columns:6px 1fr; gap:7px; }
        .csc-receipt i { width:6px; height:6px; margin-top:4px; border-radius:50%; background:#34d399; }
        .csc-receipt.deny i { background:#f87171; }
        .csc-receipt b, .csc-receipt small, .csc-receipt em { display:block; }
        .csc-receipt b { color:#c9c9d7; font-size:8px; }
        .csc-receipt small { color:#64647a; font-size:7px; }
        .csc-receipt em { color:#5b526b; font:600 7px ui-monospace,monospace; font-style:normal; overflow-wrap:anywhere; }
        .csc-empty { padding:14px; color:#65657a; text-align:center; font-size:9px; }
        .csc-error { border-color:rgba(248,113,113,.3); color:#fca5a5; }
        .csc-notice { border-color:rgba(52,211,153,.22); color:#a7f3d0; }
        @media (max-width: 900px) {
            .csc-grid { grid-template-columns:1fr; }
            .csc-metrics { grid-template-columns:repeat(2,1fr); }
        }
    `;

    constructor(...args) {
        super(...args);
        this.state = { health: null, sessions: [], activeId: null, receipts: [], error: null, notice: null };
    }

    async make({ root }) {
        this.root = root;
        root.classList.add('camelot-shadow-castle');
        await this.refresh();
        this.render();
    }

    async refresh() {
        try {
            const [health, sessions] = await Promise.all([
                shadowFetch('/health'),
                shadowFetch('/sessions'),
            ]);
            this.state.health = health;
            this.state.sessions = sessions;
            this.state.error = null;
            if (!this.state.activeId && sessions[0]) this.state.activeId = sessions[0].session_id;
            if (this.state.activeId) {
                this.state.receipts = await shadowFetch(`/receipts/${this.state.activeId}`).catch(() => []);
            }
        } catch (error) {
            this.state.health = null;
            this.state.error = error?.message || String(error);
        }
    }

    async act(fn) {
        try {
            this.state.error = null;
            this.state.notice = null;
            await fn();
            await this.refresh();
        } catch (error) {
            this.state.error = error?.message || String(error);
        }
        this.render();
    }

    active() {
        return this.state.sessions.find(session => session.session_id === this.state.activeId) || null;
    }

    render() {
        if (!this.root) return;
        this.root.replaceChildren();
        const active = this.active();

        const header = node('div', 'csc-header');
        header.append(node('div', 'csc-glyph', '◐'));
        const headerCopy = node('div', 'csc-header-copy');
        headerCopy.append(node('strong', '', 'SIR UMBRA // SHADOW CASTLE'));
        headerCopy.append(node('small', '', 'PUTER WORKSPACE × BIFROST × NATIVE CAMELOT AUTHORITY'));
        header.append(headerCopy);
        const health = node('div', `csc-health ${this.state.health?.status === 'ok' ? 'online' : ''}`);
        health.append(node('i'));
        health.append(document.createTextNode(this.state.health?.status === 'ok' ? 'NATIVE CPU ONLINE' : 'SHADOW CPU UNVERIFIED'));
        header.append(health);
        this.root.append(header);

        const grid = node('div', 'csc-grid');
        const left = node('div', 'csc-column');
        const center = node('div', 'csc-column');
        const right = node('div', 'csc-column');

        const identity = node('section', 'csc-card');
        identity.append(node('div', 'csc-title', 'Shadow Identity'));
        const truth = node('div', 'csc-truth');
        truth.append(node('b', '', 'Footprint-minimized outside.'));
        truth.append(document.createTextNode('Fully attributable and receipted inside Camelot.'));
        identity.append(truth);
        left.append(identity);

        const summon = node('section', 'csc-card');
        summon.append(node('div', 'csc-title', 'Summon Mission'));
        const missionLabel = node('label', '', 'Mission');
        const missionInput = node('textarea');
        missionInput.placeholder = 'Prepare, inspect, draft, or reason inside a bounded Shadow workspace.';
        missionLabel.append(missionInput);
        summon.append(missionLabel);
        const delegateLabel = node('label', '', 'Delegate Knight');
        const delegateInput = node('input');
        delegateInput.value = 'sir_umbra';
        delegateLabel.append(delegateInput);
        summon.append(delegateLabel);
        summon.append(button('Summon Shadow', 'csc-button', () => this.act(async () => {
            const mission = missionInput.value.trim();
            if (!mission) throw new Error('Mission is required');
            const created = await shadowFetch('/sessions', {
                method: 'POST',
                body: JSON.stringify({ mission, delegate: delegateInput.value.trim() || 'sir_umbra' }),
            });
            this.state.activeId = created.session_id;
            this.state.notice = `Shadow ${created.session_id.slice(0, 8)} summoned.`;
        })));
        left.append(summon);

        const sessionsCard = node('section', 'csc-card');
        sessionsCard.append(node('div', 'csc-title', 'Active Shadows'));
        const sessionList = node('div', 'csc-session-list');
        if (!this.state.sessions.length) sessionList.append(node('div', 'csc-empty', 'No Shadow sessions.'));
        for (const session of this.state.sessions) {
            const row = button('', `csc-session ${session.session_id === this.state.activeId ? 'active' : ''}`, async () => {
                this.state.activeId = session.session_id;
                this.state.receipts = await shadowFetch(`/receipts/${session.session_id}`).catch(() => []);
                this.render();
            });
            row.append(node('i'));
            const copy = node('span');
            copy.append(node('strong', '', session.delegate_id || session.knight_id));
            copy.append(node('small', '', `${session.session_id.slice(0, 8)} · ${session.state}`));
            row.append(copy);
            row.append(node('em', '', session.risk_ceiling));
            sessionList.append(row);
        }
        sessionsCard.append(sessionList);
        left.append(sessionsCard);

        if (active) {
            const mission = node('section', 'csc-card csc-mission');
            mission.append(node('div', 'csc-title', 'Mission')); 
            mission.append(node('h2', '', active.mission));
            mission.append(node('span', 'csc-mission-state', active.state.toUpperCase()));
            const metrics = node('div', 'csc-metrics');
            const ttl = Math.max(0, Math.ceil((new Date(active.expires_at).getTime() - Date.now()) / 60000));
            for (const [value, label] of [
                [`${active.bounds.cpu_quota_percent}%`, 'CPU QUOTA'],
                [`${active.bounds.memory_mb} MB`, 'RAM CEILING'],
                [`${ttl}m`, 'TTL'],
                [String(active.receipt_count), 'RECEIPTS'],
            ]) {
                const metric = node('span'); metric.append(node('b', '', value)); metric.append(node('small', '', label)); metrics.append(metric);
            }
            mission.append(metrics);
            const tags = node('div', 'csc-tags');
            active.capabilities.forEach(cap => tags.append(node('span', '', cap)));
            mission.append(tags);
            mission.append(node('div', 'csc-boundary', `${active.workspace.root_uri} · public inbound ${active.workspace.public_inbound ? 'ON' : 'OFF'} · ${active.workspace.allowed_egress.join(', ') || 'no egress'}`));
            center.append(mission);

            const manifest = node('section', 'csc-card');
            manifest.append(node('div', 'csc-title', 'Effect Manifest'));
            const riskLabel = node('label', '', 'Risk');
            const risk = node('select');
            ['R0','R1','R2','R3','R4','R5','R6'].forEach(value => { const option = node('option', '', value); option.value = value; if (value === 'R4') option.selected = true; risk.append(option); });
            riskLabel.append(risk); manifest.append(riskLabel);
            const effectLabel = node('label', '', 'Effect');
            const effect = node('select');
            ['external.write','external.read','production.mutate','shadow.plan'].forEach(value => { const option = node('option', '', value); option.value = value; effect.append(option); });
            effectLabel.append(effect); manifest.append(effectLabel);
            const targetLabel = node('label', '', 'Target');
            const target = node('input'); target.value = 'bifrost://approved-realm'; targetLabel.append(target); manifest.append(targetLabel);
            const intentLabel = node('label', '', 'Exact intent');
            const intent = node('textarea'); intent.placeholder = 'Describe the exact requested effect. Human approval is required for R4-R6.'; intentLabel.append(intent); manifest.append(intentLabel);
            manifest.append(button('Submit to Camelot Guardrails', 'csc-button', () => this.act(async () => {
                if (!intent.value.trim()) throw new Error('Effect intent is required');
                await shadowFetch('/effects', {
                    method: 'POST',
                    body: JSON.stringify({
                        session_id: active.session_id,
                        risk: risk.value,
                        effect: effect.value,
                        target: target.value,
                        intent: intent.value.trim(),
                    }),
                });
                this.state.notice = Number(risk.value.slice(1)) >= 4 ? `${risk.value} effect frozen at HITL.` : `${risk.value} effect policy-authorized.`;
            })));
            center.append(manifest);

            const effects = node('section', 'csc-card');
            effects.append(node('div', 'csc-title', 'Mission Effects'));
            if (!active.effects.length) effects.append(node('div', 'csc-empty', 'No effect manifests. Shadow remains isolated.'));
            for (const item of [...active.effects].reverse()) {
                const row = node('div', 'csc-effect');
                row.append(node('b', '', item.risk));
                const copy = node('span');
                copy.append(node('strong', '', item.effect));
                copy.append(node('small', '', item.target));
                copy.append(node('em', '', item.intent));
                row.append(copy);
                row.append(node('span', '', item.status.replace('_', ' ')));
                if (item.status === 'pending_approval') {
                    const hitl = node('div', 'csc-hitl');
                    hitl.append(button('Deny', 'deny', () => this.decide(active.session_id, item, 'deny')));
                    hitl.append(button(item.risk === 'R6' ? 'Approve Sovereign' : 'Approve Once', '', () => this.decide(active.session_id, item, 'approve')));
                    row.append(hitl);
                }
                effects.append(row);
            }
            center.append(effects);
        } else {
            const empty = node('section', 'csc-card csc-empty', 'Summon or select a Shadow mission to open its workspace.');
            center.append(empty);
        }

        const ledger = node('section', 'csc-card');
        ledger.append(node('div', 'csc-title', 'HITL Ledger · Append Only'));
        const receiptList = node('div', 'csc-receipts');
        if (!this.state.receipts.length) receiptList.append(node('div', 'csc-empty', 'No receipts loaded.'));
        for (const item of [...this.state.receipts].reverse().slice(0, 20)) {
            const row = node('div', `csc-receipt ${String(item.decision).includes('DENY') ? 'deny' : ''}`);
            row.append(node('i'));
            const copy = node('span');
            copy.append(node('b', '', item.action));
            copy.append(node('small', '', `${item.risk} · ${item.decision}`));
            copy.append(node('em', '', item.receipt_hash));
            row.append(copy); receiptList.append(row);
        }
        ledger.append(receiptList); right.append(ledger);

        const boundary = node('section', 'csc-card');
        boundary.append(node('div', 'csc-title', 'Authority Boundary'));
        boundary.append(node('div', 'csc-truth', 'Puter displays the workspace. Bifrost brokers the path. camelot-shadowd enforces the native boundary. No Shadow daemon token is present in this desktop.'));
        right.append(boundary);

        if (active) {
            const seal = node('section', 'csc-card');
            seal.append(node('div', 'csc-title', 'Seal Shadow'));
            seal.append(node('div', 'csc-empty', 'Write the final receipt, then purge the ephemeral mission workspace.'));
            seal.append(button(active.state === 'sealed' ? 'SEALED' : 'Seal & Purge Workspace', 'csc-button danger', () => this.act(async () => {
                if (active.state === 'sealed') return;
                await shadowFetch('/seal', { method: 'POST', body: JSON.stringify({ session_id: active.session_id }) });
                this.state.notice = 'Shadow sealed. Workspace removed; ledger retained.';
            })));
            right.append(seal);
        }

        if (this.state.error) right.append(node('section', 'csc-card csc-error', this.state.error));
        if (this.state.notice) right.append(node('section', 'csc-card csc-notice', this.state.notice));

        grid.append(left, center, right);
        this.root.append(grid);
    }

    decide(sessionId, effect, decision) {
        return this.act(async () => {
            await shadowFetch('/decision', {
                method: 'POST',
                body: JSON.stringify({
                    session_id: sessionId,
                    effect_id: effect.effect_id,
                    decision,
                    scope: effect.risk === 'R6' ? 'sovereign' : 'once',
                    note: `${decision} from Puter Shadow Castle.`,
                }),
            });
            this.state.notice = `${effect.risk} effect ${decision === 'approve' ? 'approved' : 'denied'} and receipted.`;
        });
    }
}

$(window).on('ctxmenu-will-open', event => {
    if (event.detail.options?.id !== 'user-options-menu') return;
    const items = event.detail.options.items || [];
    if (items.some(item => item.id === 'camelot-shadow-castle')) return;
    const entry = {
        id: 'camelot-shadow-castle',
        html: '◐ Camelot Shadow Castle',
        action: () => {
            const shadow = new UICamelotShadowCastle();
            shadow.open_as_window({
                title: 'Camelot Shadow Castle',
                width: 1180,
                height: 760,
            });
        },
    };
    const taskIndex = items.findIndex(item => item.id === 'task_manager');
    const index = taskIndex >= 0 ? taskIndex + 1 : items.length;
    event.detail.options.items = [...items.slice(0, index), entry, ...items.slice(index)];
});

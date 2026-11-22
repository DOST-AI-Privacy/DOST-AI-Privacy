(() => {
  'use strict';

  /* ========================================================================
     1. Immersive Scroll Progress, Chapter Rail & Subtle Glide Transitions
     ======================================================================== */
  const progressBar = document.getElementById('top-progress');
  const chapterDots = Array.from(document.querySelectorAll('.rail-dot'));
  const chapterEls = chapterDots
    .map((dot) => document.getElementById(dot.dataset.chapter))
    .filter(Boolean);

  let ticking = false;
  function updateScrollUI() {
    ticking = false;
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    const ratio = Math.min(1, Math.max(0, scrollTop / maxScroll));

    if (progressBar) {
      progressBar.style.transform = `scaleX(${ratio})`;
    }

    const probe = scrollTop + window.innerHeight * 0.38;
    let currentId = chapterEls[0]?.id || 'top';
    for (const el of chapterEls) {
      if (el.offsetTop <= probe) {
        currentId = el.id;
      }
    }

    chapterDots.forEach((dot) => {
      dot.classList.toggle('is-active', dot.dataset.chapter === currentId);
    });
  }

  window.addEventListener(
    'scroll',
    () => {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(updateScrollUI);
      }
    },
    { passive: true }
  );
  updateScrollUI();

  const stages = Array.from(document.querySelectorAll('.scroll-stage'));
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!prefersReduced && 'IntersectionObserver' in window) {
    const vh = window.innerHeight || document.documentElement.clientHeight;
    stages.forEach((el) => {
      if (el.getBoundingClientRect().top > vh * 0.92) {
        el.classList.add('is-entering');
      }
    });

    const stageObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.remove('is-entering');
            stageObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.05, rootMargin: '0px 0px -40px 0px' }
    );

    stages.forEach((el) => {
      if (el.classList.contains('is-entering')) {
        stageObserver.observe(el);
      }
    });
  }

  /* ========================================================================
     2. Interactive 4-Step Walkthrough (Visual Flow SVG + Minimal Trace)
     ======================================================================== */
  const STEPS = [
    {
      verdict: 'Blocked before activation',
      verdictClass: 'is-danger',
      desc:
        'The coding agent tries to install an external SQL MCP server found on the web. DOST checks publisher, permissions, and scripts before activation and returns the denial reason silently.',
      svg: `
        <svg viewBox="0 0 560 96" xmlns="http://www.w3.org/2000/svg">
          <circle cx="38" cy="48" r="6" fill="#5b8cff" />
          <text x="38" y="76" text-anchor="middle" fill="#cbd5e1" font-family="JetBrains Mono, monospace" font-size="10.5">AGENT</text>
          <line x1="52" y1="48" x2="224" y2="48" stroke="#f59e0b" stroke-width="2" class="flow-stream" />
          <text x="138" y="34" text-anchor="middle" fill="#fbbf24" font-family="JetBrains Mono, monospace" font-size="10">install sql-mcp</text>

          <line x1="240" y1="14" x2="240" y2="82" stroke="#f43f5e" stroke-width="2.5" />
          <circle cx="240" cy="48" r="10" fill="#05070c" stroke="#f43f5e" stroke-width="2" />
          <path d="M 236 44 L 244 52 M 244 44 L 236 52" stroke="#fda4af" stroke-width="1.8" stroke-linecap="round" />
          <text x="240" y="94" text-anchor="middle" fill="#fda4af" font-family="JetBrains Mono, monospace" font-size="9.5">DOST GATE</text>

          <line x1="258" y1="48" x2="496" y2="48" stroke="rgba(148,163,184,0.18)" stroke-dasharray="4 6" stroke-width="1.5" />
          <circle cx="512" cy="48" r="6" fill="rgba(148,163,184,0.28)" />
          <text x="512" y="76" text-anchor="middle" fill="#5c6a80" font-family="JetBrains Mono, monospace" font-size="10.5">UNVERIFIED MCP</text>
        </svg>`,
      code: [
        '<span class="wt-dim">agent.install</span> <span class="hl-warn">sql-inspector-mcp@0.4.2</span>',
        '<span class="wt-dim">scopes:</span> <span class="hl-danger">db:write, shell:exec</span>',
        '<span class="hl-danger">DENIED</span> Unverified publisher and write scope'
      ].join('<br />'),
      signals: [
        ['Artifact state', 'Never activated'],
        ['Developer popups', '0'],
        ['Payload logged', 'Omitted']
      ]
    },
    {
      verdict: 'Agent adapts automatically',
      verdictClass: 'is-ok',
      desc:
        'Using the policy reason from DOST, the agent switches on its own to a read-only SQL query over the existing approved development database connection.',
      svg: `
        <svg viewBox="0 0 560 96" xmlns="http://www.w3.org/2000/svg">
          <circle cx="38" cy="48" r="6" fill="#5b8cff" />
          <text x="38" y="76" text-anchor="middle" fill="#cbd5e1" font-family="JetBrains Mono, monospace" font-size="10.5">AGENT</text>

          <path d="M 52 44 C 125 18, 175 18, 228 40" fill="none" stroke="rgba(244,63,94,0.35)" stroke-dasharray="4 5" stroke-width="1.4" />
          <path d="M 52 52 C 150 52, 200 52, 496 52" fill="none" stroke="#34d399" stroke-width="2" class="flow-stream" />
          <text x="275" y="38" text-anchor="middle" fill="#6ee7b7" font-family="JetBrains Mono, monospace" font-size="10">fallback: read-only dev DB</text>

          <circle cx="512" cy="52" r="6" fill="#34d399" />
          <text x="512" y="78" text-anchor="middle" fill="#cbd5e1" font-family="JetBrains Mono, monospace" font-size="10.5">APPROVED DB</text>
        </svg>`,
      code: [
        '<span class="wt-dim">agent:</span> "Switching to <span class="hl-ok">dev_db_readonly</span> under team policy."',
        'SELECT email, person_id, err FROM dev_orders LIMIT 3;',
        '<span class="wt-dim">result:</span> 3 rows returned locally'
      ].join('<br />'),
      signals: [
        ['Fallback route', 'Existing read-only DB'],
        ['Developer popups', '0'],
        ['Jira link', 'PLAT-418']
      ]
    },
    {
      verdict: 'PII masked in flight',
      verdictClass: 'is-accent',
      desc:
        'When the agent sends those query rows to the cloud model, DOST replaces sensitive values with typed placeholders and keeps the mapping inside the trusted proxy for this request only.',
      svg: `
        <svg viewBox="0 0 560 96" xmlns="http://www.w3.org/2000/svg">
          <circle cx="38" cy="48" r="6" fill="#f59e0b" />
          <text x="38" y="76" text-anchor="middle" fill="#fbbf24" font-family="JetBrains Mono, monospace" font-size="10">alex@acme.test</text>

          <line x1="56" y1="48" x2="254" y2="48" stroke="#f59e0b" stroke-width="2" class="flow-stream" />

          <rect x="260" y="22" width="44" height="52" fill="rgba(91,140,255,0.16)" stroke="#5b8cff" stroke-width="1.6" />
          <text x="282" y="52" text-anchor="middle" fill="#f3f6fb" font-family="JetBrains Mono, monospace" font-size="10" font-weight="600">DOST</text>

          <line x1="310" y1="48" x2="496" y2="48" stroke="#5b8cff" stroke-width="2" class="flow-stream" />

          <circle cx="512" cy="48" r="6" fill="#5b8cff" />
          <text x="512" y="76" text-anchor="middle" fill="#8ab0ff" font-family="JetBrains Mono, monospace" font-size="10">Email_01</text>
        </svg>`,
      code: [
        '<span class="wt-dim">local:</span>  { owner: <span class="hl-warn">"alex@acme.test"</span>, id: <span class="hl-warn">"TR-9948102"</span> }',
        '<span class="wt-dim">to LLM:</span> { owner: <span class="hl-accent">"Email_01"</span>,       id: <span class="hl-accent">"Person_ID_01"</span> }'
      ].join('<br />'),
      signals: [
        ['Mapping scope', 'Request-local only'],
        ['Credentials', 'Excluded from map'],
        ['Raw rows logged', 'Never']
      ]
    },
    {
      verdict: 'Restored and wiped',
      verdictClass: 'is-ok',
      desc:
        'As the cloud LLM streams its fix, DOST restores matching placeholders inline, discards the ephemeral map immediately, and logs metadata-only events to the Control Center.',
      svg: `
        <svg viewBox="0 0 560 96" xmlns="http://www.w3.org/2000/svg">
          <circle cx="38" cy="48" r="6" fill="#34d399" />
          <text x="38" y="76" text-anchor="middle" fill="#6ee7b7" font-family="JetBrains Mono, monospace" font-size="10">alex@acme.test</text>

          <line x1="254" y1="48" x2="56" y2="48" stroke="#34d399" stroke-width="2" class="flow-stream" />

          <rect x="260" y="22" width="44" height="52" fill="rgba(52,211,153,0.14)" stroke="#34d399" stroke-width="1.6" />
          <text x="282" y="52" text-anchor="middle" fill="#f3f6fb" font-family="JetBrains Mono, monospace" font-size="10" font-weight="600">DOST</text>

          <line x1="496" y1="48" x2="310" y2="48" stroke="#5b8cff" stroke-width="2" class="flow-stream" />

          <circle cx="512" cy="48" r="6" fill="#5b8cff" />
          <text x="512" y="76" text-anchor="middle" fill="#8ab0ff" font-family="JetBrains Mono, monospace" font-size="10">SSE STREAM</text>
        </svg>`,
      code: [
        '<span class="wt-dim">from LLM:</span> Fix guard for <span class="hl-accent">Email_01</span> (<span class="hl-accent">Person_ID_01</span>)',
        '<span class="wt-dim">to IDE:</span>   Fix guard for <span class="hl-ok">alex@acme.test</span> (<span class="hl-ok">TR-9948102</span>)'
      ].join('<br />'),
      signals: [
        ['Ephemeral map', 'Discarded on close'],
        ['Route coverage', 'Enforced'],
        ['Prompts in logs', '0 bytes']
      ]
    }
  ];

  let activeStep = 0;
  const stepTabs = Array.from(document.querySelectorAll('.rail-step'));
  const wtPanel = document.getElementById('wt-panel');
  const wtFlowSvg = document.getElementById('wt-flow-svg');
  const wtCode = document.getElementById('wt-code');
  const wtVerdict = document.getElementById('wt-verdict');
  const wtDesc = document.getElementById('wt-desc');
  const wtSignals = document.getElementById('wt-signals');
  const wtPrev = document.getElementById('wt-prev');
  const wtNext = document.getElementById('wt-next');

  function renderStep(idx) {
    activeStep = (idx + STEPS.length) % STEPS.length;
    const step = STEPS[activeStep];

    stepTabs.forEach((tab, i) => {
      const selected = i === activeStep;
      tab.setAttribute('aria-selected', String(selected));
      tab.tabIndex = selected ? 0 : -1;
    });

    if (wtPanel) wtPanel.setAttribute('aria-labelledby', `wt-tab-${activeStep}`);
    if (wtFlowSvg) wtFlowSvg.innerHTML = step.svg;
    if (wtCode) wtCode.innerHTML = step.code;
    if (wtVerdict) {
      wtVerdict.textContent = step.verdict;
      wtVerdict.className = `wt-verdict-word ${step.verdictClass}`;
    }
    if (wtDesc) wtDesc.textContent = step.desc;
    if (wtSignals) {
      wtSignals.innerHTML = step.signals
        .map(([k, v]) => `<div class="wt-signal-row"><span>${k}</span><span>${v}</span></div>`)
        .join('');
    }
    if (wtPrev) wtPrev.disabled = activeStep === 0;
    if (wtNext) {
      wtNext.textContent = activeStep === STEPS.length - 1 ? 'Replay ↺' : 'Next →';
    }
  }

  stepTabs.forEach((tab) => {
    tab.addEventListener('click', () => renderStep(Number(tab.dataset.step)));
    tab.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        const next = (activeStep + 1) % STEPS.length;
        renderStep(next);
        stepTabs[next].focus();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        const prev = (activeStep - 1 + STEPS.length) % STEPS.length;
        renderStep(prev);
        stepTabs[prev].focus();
      }
    });
  });

  if (wtPrev) wtPrev.addEventListener('click', () => activeStep > 0 && renderStep(activeStep - 1));
  if (wtNext) wtNext.addEventListener('click', () => renderStep((activeStep + 1) % STEPS.length));
  renderStep(0);

  /* ========================================================================
     3. Dual-View Control Center Toggle
     ======================================================================== */
  const ccTabs = Array.from(document.querySelectorAll('[data-cc-view]'));
  const ccEng = document.getElementById('cc-panel-eng');
  const ccSec = document.getElementById('cc-panel-sec');

  function setCCView(view) {
    const isEng = view === 'eng';
    ccTabs.forEach((btn) => {
      const selected = btn.dataset.ccView === view;
      btn.setAttribute('aria-selected', String(selected));
      btn.tabIndex = selected ? 0 : -1;
    });
    if (ccEng) ccEng.hidden = !isEng;
    if (ccSec) ccSec.hidden = isEng;
  }

  ccTabs.forEach((btn, i) => {
    btn.addEventListener('click', () => setCCView(btn.dataset.ccView));
    btn.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        e.preventDefault();
        const next = ccTabs[(i + 1) % ccTabs.length];
        setCCView(next.dataset.ccView);
        next.focus();
      }
    });
  });

  /* ========================================================================
     4. Interactive Deployment Topology Switcher
     ======================================================================== */
  const DEPLOY_MODES = {
    gateway: {
      caption:
        'Fastest pilot start. A central gateway runs inside your boundary for routed prompts while the host broker governs skills, MCPs, and tools.',
      svg: `
        <svg viewBox="0 0 880 140" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Explicit Gateway deployment flow">
          <rect x="20" y="14" width="540" height="112" fill="none" stroke="rgba(148,163,184,0.18)" stroke-dasharray="4 5" />
          <text x="36" y="34" fill="#5c6a80" font-family="JetBrains Mono, monospace" font-size="10">CUSTOMER BOUNDARY</text>

          <circle cx="96" cy="76" r="7" fill="#5b8cff" />
          <text x="96" y="104" text-anchor="middle" fill="#e2e8f0" font-family="JetBrains Mono, monospace" font-size="11.5">IDE / AGENT</text>

          <line x1="114" y1="76" x2="328" y2="76" stroke="#5b8cff" stroke-width="2" class="flow-stream" />
          <text x="220" y="64" text-anchor="middle" fill="#8ab0ff" font-family="JetBrains Mono, monospace" font-size="10">routed requests + host checks</text>

          <rect x="336" y="44" width="180" height="64" fill="rgba(91,140,255,0.14)" stroke="#5b8cff" stroke-width="1.6" />
          <text x="426" y="72" text-anchor="middle" fill="#f3f6fb" font-family="JetBrains Mono, monospace" font-size="12" font-weight="600">DOST GATEWAY</text>
          <text x="426" y="92" text-anchor="middle" fill="#8ab0ff" font-family="JetBrains Mono, monospace" font-size="10">+ Agent Host Broker</text>

          <line x1="524" y1="76" x2="770" y2="76" stroke="#34d399" stroke-width="2" class="flow-stream" />
          <text x="650" y="64" text-anchor="middle" fill="#6ee7b7" font-family="JetBrains Mono, monospace" font-size="10">masked traffic</text>

          <circle cx="786" cy="76" r="7" fill="#34d399" />
          <text x="786" y="104" text-anchor="middle" fill="#e2e8f0" font-family="JetBrains Mono, monospace" font-size="11.5">CLOUD LLMS</text>
        </svg>`
    },
    device: {
      caption:
        'Keeps masking and restoration on the developer workstation for strict data residency, off-network laptops, and active interaction signals.',
      svg: `
        <svg viewBox="0 0 880 140" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="On-Device Adapter deployment flow">
          <rect x="20" y="14" width="520" height="112" fill="rgba(52,211,153,0.03)" stroke="rgba(52,211,153,0.34)" stroke-dasharray="4 5" />
          <text x="36" y="34" fill="#6ee7b7" font-family="JetBrains Mono, monospace" font-size="10">DEVELOPER WORKSTATION (LOCAL RESIDENCY)</text>

          <circle cx="104" cy="76" r="7" fill="#5b8cff" />
          <text x="104" y="104" text-anchor="middle" fill="#e2e8f0" font-family="JetBrains Mono, monospace" font-size="11.5">AI CLIENT</text>

          <line x1="120" y1="76" x2="302" y2="76" stroke="#5b8cff" stroke-width="2" class="flow-stream" />
          <text x="210" y="64" text-anchor="middle" fill="#94a3b8" font-family="JetBrains Mono, monospace" font-size="10">local loopback</text>

          <rect x="310" y="44" width="194" height="64" fill="rgba(52,211,153,0.12)" stroke="#34d399" stroke-width="1.6" />
          <text x="407" y="72" text-anchor="middle" fill="#f3f6fb" font-family="JetBrains Mono, monospace" font-size="12" font-weight="600">LOCAL ADAPTER</text>
          <text x="407" y="92" text-anchor="middle" fill="#6ee7b7" font-family="JetBrains Mono, monospace" font-size="10">On-device mask &amp; host events</text>

          <line x1="512" y1="76" x2="770" y2="76" stroke="#34d399" stroke-width="2" class="flow-stream" />
          <text x="646" y="64" text-anchor="middle" fill="#6ee7b7" font-family="JetBrains Mono, monospace" font-size="10">masked traffic only</text>

          <circle cx="786" cy="76" r="7" fill="#34d399" />
          <text x="786" y="104" text-anchor="middle" fill="#e2e8f0" font-family="JetBrains Mono, monospace" font-size="11.5">CLOUD LLMS</text>
        </svg>`
    },
    proxy: {
      caption:
        'Plugs into existing enterprise egress and TLS trust infrastructure, paired with host and Jira integrations for explicit coverage reporting.',
      svg: `
        <svg viewBox="0 0 880 140" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Managed Network Proxy deployment flow">
          <rect x="20" y="14" width="540" height="112" fill="none" stroke="rgba(245,158,11,0.3)" stroke-dasharray="4 5" />
          <text x="36" y="34" fill="#fbbf24" font-family="JetBrains Mono, monospace" font-size="10">CORPORATE NETWORK &amp; EGRESS</text>

          <circle cx="96" cy="76" r="7" fill="#5b8cff" />
          <text x="96" y="104" text-anchor="middle" fill="#e2e8f0" font-family="JetBrains Mono, monospace" font-size="11.5">CORP FLEET</text>

          <line x1="114" y1="76" x2="320" y2="76" stroke="#f59e0b" stroke-width="2" class="flow-stream" />
          <text x="218" y="64" text-anchor="middle" fill="#fbbf24" font-family="JetBrains Mono, monospace" font-size="10">managed egress TLS</text>

          <rect x="328" y="44" width="196" height="64" fill="rgba(245,158,11,0.1)" stroke="#f59e0b" stroke-width="1.6" />
          <text x="426" y="72" text-anchor="middle" fill="#f3f6fb" font-family="JetBrains Mono, monospace" font-size="12" font-weight="600">NETWORK PROXY</text>
          <text x="426" y="92" text-anchor="middle" fill="#fbbf24" font-family="JetBrains Mono, monospace" font-size="10">Policy + Coverage Telemetry</text>

          <line x1="532" y1="76" x2="770" y2="76" stroke="#34d399" stroke-width="2" class="flow-stream" />
          <text x="654" y="64" text-anchor="middle" fill="#6ee7b7" font-family="JetBrains Mono, monospace" font-size="10">governed egress</text>

          <circle cx="786" cy="76" r="7" fill="#34d399" />
          <text x="786" y="104" text-anchor="middle" fill="#e2e8f0" font-family="JetBrains Mono, monospace" font-size="11.5">CLOUD LLMS</text>
        </svg>`
    }
  };

  const deployTabs = Array.from(document.querySelectorAll('[data-deploy]'));
  const deploySvg = document.getElementById('deploy-svg');
  const deployCaption = document.getElementById('deploy-caption');

  function setDeployMode(key) {
    const mode = DEPLOY_MODES[key] || DEPLOY_MODES.gateway;
    deployTabs.forEach((btn) => {
      const selected = btn.dataset.deploy === key;
      btn.setAttribute('aria-selected', String(selected));
      btn.tabIndex = selected ? 0 : -1;
    });
    if (deploySvg) deploySvg.innerHTML = mode.svg;
    if (deployCaption) deployCaption.textContent = mode.caption;
  }

  deployTabs.forEach((btn, i) => {
    btn.addEventListener('click', () => setDeployMode(btn.dataset.deploy));
    btn.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        const next = deployTabs[(i + 1) % deployTabs.length];
        setDeployMode(next.dataset.deploy);
        next.focus();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        const prev = deployTabs[(i - 1 + deployTabs.length) % deployTabs.length];
        setDeployMode(prev.dataset.deploy);
        prev.focus();
      }
    });
  });

  setDeployMode('gateway');

  /* ========================================================================
     5. Pilot Inquiry Modal (mailto:atahan.alp@ug.bilkent.edu.tr)
     ======================================================================== */
  const PILOT_EMAIL = 'atahan.alp@ug.bilkent.edu.tr';
  const modal = document.getElementById('pilot-modal');
  const closeBtn = document.getElementById('pilot-modal-close');
  const form = document.getElementById('pilot-form');
  const copyBtn = document.getElementById('pilot-copy-btn');
  const openBtns = Array.from(document.querySelectorAll('[data-open-pilot]'));
  let lastFocus = null;

  function buildBrief() {
    const name = (document.getElementById('pilot-name')?.value || '').trim();
    const company = (document.getElementById('pilot-company')?.value || '').trim();
    const role = (document.getElementById('pilot-role')?.value || '').trim();
    const size = (document.getElementById('pilot-size')?.value || '').trim();
    const tools = (document.getElementById('pilot-tools')?.value || '').trim();
    const goal = (document.getElementById('pilot-goal')?.value || '').trim();

    const subject = company ? `DOST Pilot Inquiry: ${company}` : 'DOST Pilot Inquiry';
    const body = [
      'Hi DOST Team,',
      '',
      'We would like to discuss a DOST pilot for our engineering team.',
      '',
      `Name: ${name || '(not specified)'}`,
      `Company: ${company || '(not specified)'}`,
      `Role: ${role || '(not specified)'}`,
      `Team Size: ${size || '(not specified)'}`,
      `AI Tools & Workflow: ${tools || '(not specified)'}`,
      '',
      'Pilot Goal:',
      goal || '(not specified)'
    ].join('\n');

    return { subject, body };
  }

  function openModal() {
    if (!modal) return;
    lastFocus = document.activeElement;
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    document.getElementById('pilot-name')?.focus();
  }

  function closeModal() {
    if (!modal) return;
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (lastFocus && typeof lastFocus.focus === 'function') lastFocus.focus();
  }

  openBtns.forEach((btn) => btn.addEventListener('click', openModal));
  closeBtn?.addEventListener('click', closeModal);
  modal?.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal?.classList.contains('is-open')) closeModal();
  });

  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    const { subject, body } = buildBrief();
    window.location.href = `mailto:${PILOT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  });

  copyBtn?.addEventListener('click', async () => {
    const { subject, body } = buildBrief();
    const text = `To: ${PILOT_EMAIL}\nSubject: ${subject}\n\n${body}`;
    try {
      await navigator.clipboard.writeText(text);
      const prev = copyBtn.textContent;
      copyBtn.textContent = 'Copied ✓';
      setTimeout(() => {
        copyBtn.textContent = prev;
      }, 2000);
    } catch {
      copyBtn.textContent = PILOT_EMAIL;
    }
  });
})();

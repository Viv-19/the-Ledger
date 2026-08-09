import { S } from '../state.js';
import { sSet } from '../storage.js';
import { mondayOf, esc } from '../utils.js';
import { QUARTERS, ROADMAP } from '../data/roadmap.js';
import { SKILLS, SKILL_LEVELS, MS_STATUS, HOUR_TARGETS } from '../data/skills.js';
import { COMPANIES, CONTACT_STATES, APP_STATES } from '../data/companies.js';

let cvSub = 'overview';

function currentQuarter() {
    const start = new Date(2026, 7, 1);
    const now   = new Date();
    const mo    = (now.getFullYear() - 2026) * 12 + (now.getMonth() - 7);
    const qi    = Math.floor(mo / 3);
    return (qi >= 0 && qi < 8) ? QUARTERS[qi][0] : 'Q1';
}

/* ---- Overview ---- */
function renderCVOverview() {
    const wrap   = document.getElementById('cv-overview');
    const rmDone = ROADMAP.filter(m => S.cvData.milestones[m.id] === 2).length;
    const skGood = SKILLS.filter(s => [3, 4].includes(S.cvData.skills[s.id])).length;
    const wk     = mondayOf(new Date());
    const h      = S.cvHours[wk] || { deep: 0, dsa: 0, writing: 0 };
    const warm   = COMPANIES.filter(c => ['Warm contact', 'Referral secured'].includes((S.coData[c.id] || {}).contact)).length;
    const cq     = currentQuarter();
    const cqName = QUARTERS.find(q => q[0] === cq);
    wrap.innerHTML = `
      <div class="stat-grid">
        <div class="stat"><div class="k">Roadmap</div><div class="v">${rmDone}<small> / ${ROADMAP.length} done</small></div></div>
        <div class="stat"><div class="k">Skills comfortable+</div><div class="v">${skGood}<small> / ${SKILLS.length}</small></div></div>
        <div class="stat"><div class="k">This week hours</div><div class="v">${(h.deep + h.dsa + h.writing)}<small> logged</small></div></div>
        <div class="stat"><div class="k">Companies warm</div><div class="v">${warm}<small> / ${COMPANIES.length}</small></div></div>
      </div>
      <div class="section-label">You are here</div>
      <div class="stat">
        <div class="k">${cqName[0]} &middot; ${cqName[1]}</div>
        <div style="font-family:'Fraunces';font-size:20px;margin-top:4px;">${cqName[2]}</div>
        <p class="chal-blurb" style="margin-top:8px;">Open the Roadmap tab — this quarter is expanded. Aim to close its 6 milestones before it ends.</p>
      </div>`;
}

/* ---- Roadmap ---- */
function renderRoadmap() {
    const wrap  = document.getElementById('cv-roadmap');
    const cq    = currentQuarter();
    const doneN = ROADMAP.filter(m => S.cvData.milestones[m.id] === 2).length;
    let html = `
      <div class="progress-row">
        <div class="progress-track"><div class="progress-fill" style="width:${doneN / ROADMAP.length * 100}%"></div></div>
        <div class="progress-num">${doneN} / ${ROADMAP.length} done</div>
      </div>`;
    QUARTERS.forEach(([q, period, theme]) => {
        const items = ROADMAP.filter(m => m[0] === q);
        const qd    = items.filter(m => S.cvData.milestones[m.id] === 2).length;
        html += `<div class="acc ${q === cq ? 'open' : ''}">
          <div class="acc-head"><h3>${q} &middot; ${period}<br><span class="meta">${theme}</span></h3><span class="meta">${qd}/${items.length}</span></div>
          <div class="acc-body">
            ${items.map(m => {
                const st = S.cvData.milestones[m.id] || 0;
                return `<div class="ms">
                  <span class="pill s${st}" data-ms="${m.id}">${MS_STATUS[st]}</span>
                  <div class="txt"><span class="cat">${m[1]}</span> ${esc(m[2])}</div>
                </div>`;
            }).join('')}
          </div>
        </div>`;
    });
    wrap.innerHTML = html;
    wrap.querySelectorAll('.acc-head').forEach(h =>
        h.addEventListener('click', () => h.parentElement.classList.toggle('open'))
    );
    wrap.querySelectorAll('[data-ms]').forEach(p =>
        p.addEventListener('click', async e => {
            e.stopPropagation();
            const id = p.dataset.ms;
            S.cvData.milestones[id] = ((S.cvData.milestones[id] || 0) + 1) % 3;
            await sSet('cv', S.cvData);
            renderRoadmap();
        })
    );
}

/* ---- Skills ---- */
function renderSkills() {
    const wrap = document.getElementById('cv-skills');
    const good = SKILLS.filter(s => [3, 4].includes(S.cvData.skills[s.id])).length;
    let html = `
      <div class="progress-row">
        <div class="progress-track"><div class="progress-fill" style="width:${good / SKILLS.length * 100}%"></div></div>
        <div class="progress-num">${good} / ${SKILLS.length} comfortable+</div>
      </div>`;
    const cats = [...new Set(SKILLS.map(s => s[0]))];
    cats.forEach((cat, ci) => {
        const items = SKILLS.filter(s => s[0] === cat);
        const gd    = items.filter(s => [3, 4].includes(S.cvData.skills[s.id])).length;
        html += `<div class="acc ${ci === 0 ? 'open' : ''}">
          <div class="acc-head"><h3>${esc(cat)}</h3><span class="meta">${gd}/${items.length}</span></div>
          <div class="acc-body">
            ${items.map(s => {
                const lv = S.cvData.skills[s.id] || 0;
                return `<div class="ms">
                  <span class="lvl l${lv}" data-sk="${s.id}">${SKILL_LEVELS[lv]}</span>
                  <div class="txt">${esc(s[1])}<span class="prio ${s[3]}">${s[3]}</span><span class="mean">${esc(s[2])}</span></div>
                </div>`;
            }).join('')}
          </div>
        </div>`;
    });
    wrap.innerHTML = html;
    wrap.querySelectorAll('.acc-head').forEach(h =>
        h.addEventListener('click', () => h.parentElement.classList.toggle('open'))
    );
    wrap.querySelectorAll('[data-sk]').forEach(p =>
        p.addEventListener('click', async e => {
            e.stopPropagation();
            const id = p.dataset.sk;
            S.cvData.skills[id] = ((S.cvData.skills[id] || 0) + 1) % 5;
            await sSet('cv', S.cvData);
            renderSkills();
        })
    );
}

/* ---- Companies ---- */
function renderCompanies() {
    const wrap = document.getElementById('cv-companies');
    let html = `<p class="chal-blurb" style="margin:0 0 14px;">Door A is where your Aganitha years compound; Door B (semiconductor / product) is DSA-gated insurance. Bands are 2026 estimates for ~2 yrs experience — re-check before you negotiate. Tap the pills to update status.</p>`;
    [['A', 'Door A — medical imaging & life-science AI'], ['B', 'Door B — product companies & GCCs (DSA-gated)']].forEach(([door, label]) => {
        html += `<div class="section-label">${label}</div>`;
        COMPANIES.filter(c => c[3] === door).forEach(c => {
            const st         = S.coData[c.id] || { contact: 'Not contacted', app: 'Not applied' };
            const cc         = st.contact, ac = st.app;
            const contactCls = cc === 'Referral secured' ? 'ref' : (cc === 'Warm contact' ? 'warm' : '');
            const appCls     = ac === 'Offer' ? 'off' : (['Applied', 'Screening', 'Interviewing'].includes(ac) ? 'app' : '');
            html += `<div class="co">
              <span class="door ${c[3]}">${c[3]}</span>
              <div><div class="cname">${esc(c[0])}</div><div class="cmeta">${esc(c[1])} &middot; ${esc(c[2])}</div></div>
              <span class="band">${esc(c[4])} LPA</span>
              <div style="display:flex;gap:6px;width:100%;margin-top:4px;">
                <span class="pill2 ${contactCls}" data-contact="${c.id}">${cc}</span>
                <span class="pill2 ${appCls}" data-app="${c.id}">${ac}</span>
              </div>
            </div>`;
        });
    });
    wrap.innerHTML = html;
    wrap.querySelectorAll('[data-contact]').forEach(p =>
        p.addEventListener('click', async () => {
            const id = p.dataset.contact;
            const st = S.coData[id] || { contact: 'Not contacted', app: 'Not applied' };
            st.contact = CONTACT_STATES[(CONTACT_STATES.indexOf(st.contact) + 1) % CONTACT_STATES.length];
            S.coData[id] = st;
            await sSet('companies', S.coData);
            renderCompanies();
            if (cvSub === 'overview') renderCVOverview();
        })
    );
    wrap.querySelectorAll('[data-app]').forEach(p =>
        p.addEventListener('click', async () => {
            const id = p.dataset.app;
            const st = S.coData[id] || { contact: 'Not contacted', app: 'Not applied' };
            st.app = APP_STATES[(APP_STATES.indexOf(st.app) + 1) % APP_STATES.length];
            S.coData[id] = st;
            await sSet('companies', S.coData);
            renderCompanies();
        })
    );
}

/* ---- Hours ---- */
function renderHours() {
    const wrap   = document.getElementById('cv-hours');
    const wk     = mondayOf(new Date());
    const cur    = S.cvHours[wk] || { deep: 0, dsa: 0, writing: 0 };
    const fields = [['deep', 'Deep practice'], ['dsa', 'DSA'], ['writing', 'Writing']];
    let html = `<div class="section-label" style="margin-top:0;">This week (from ${wk})</div><div class="hours-grid">`;
    html += fields.map(([k, lab]) =>
        `<div class="hcard">
           <div class="k">${lab}</div>
           <div class="stepper">
             <button data-dec="${k}">&minus;</button>
             <span class="val" id="hv-${k}">${cur[k] || 0}</span>
             <button data-inc="${k}">+</button>
           </div>
           <div class="tgt">target ${HOUR_TARGETS[k]}/wk</div>
         </div>`
    ).join('');
    html += `</div>`;
    let tot = { deep: 0, dsa: 0, writing: 0 };
    let weeks = 0;
    Object.values(S.cvHours).forEach(w => {
        tot.deep    += w.deep    || 0;
        tot.dsa     += w.dsa     || 0;
        tot.writing += w.writing || 0;
        weeks++;
    });
    html += `
      <div class="section-label">All-time</div>
      <div class="stat-grid">
        <div class="stat"><div class="k">Deep practice</div><div class="v">${tot.deep}<small> hrs</small></div></div>
        <div class="stat"><div class="k">DSA</div><div class="v">${tot.dsa}<small> hrs</small></div></div>
        <div class="stat"><div class="k">Writing</div><div class="v">${tot.writing}<small> hrs</small></div></div>
        <div class="stat"><div class="k">Weeks logged</div><div class="v">${weeks}</div></div>
      </div>`;
    wrap.innerHTML = html;
    fields.forEach(([k]) => {
        wrap.querySelector(`[data-inc="${k}"]`).addEventListener('click', () => stepHour(wk, k, 0.5));
        wrap.querySelector(`[data-dec="${k}"]`).addEventListener('click', () => stepHour(wk, k, -0.5));
    });
}

async function stepHour(wk, k, d) {
    if (!S.cvHours[wk]) S.cvHours[wk] = { deep: 0, dsa: 0, writing: 0 };
    S.cvHours[wk][k] = Math.max(0, Math.round(((S.cvHours[wk][k] || 0) + d) * 2) / 2);
    document.getElementById('hv-' + k).textContent = S.cvHours[wk][k];
    await sSet('cvhours', S.cvHours);
    renderHours();
}

/* ---- Main render ---- */
export function renderCV() {
    document.querySelectorAll('.cv-sub').forEach(s => s.style.display = 'none');
    document.getElementById('cv-' + cvSub).style.display = 'block';
    document.querySelectorAll('[data-cv]').forEach(b =>
        b.classList.toggle('active', b.dataset.cv === cvSub)
    );
    if (cvSub === 'overview')        renderCVOverview();
    else if (cvSub === 'roadmap')    renderRoadmap();
    else if (cvSub === 'skills')     renderSkills();
    else if (cvSub === 'companies')  renderCompanies();
    else                             renderHours();
}

export function switchCVTab(sub) {
    cvSub = sub;
    renderCV();
}

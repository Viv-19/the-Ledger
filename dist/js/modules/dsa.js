import { S } from '../state.js';
import { sSet } from '../storage.js';
import { todayStr, dateStr, addDays, esc, pad, MONTHS } from '../utils.js';
import { DSA, DSA_TOPICS, DSA_TARGET, REV_INTERVALS } from '../data/dsa.js';

/* ---- UI state local to this module ---- */
let dsaSub = 'problems';

/* ---- Computed totals (exported for use by today.js) ---- */
export function dsaSolvedCount()    { return DSA.filter(p => S.dsaData.solved[p.id]).length; }
export function dsaExtraCount()     { return Object.values(S.dsaData.extra).reduce((a, b) => a + (b || 0), 0); }
export function contestProblemCount() { return S.contests.reduce((a, c) => a + (+c.solved || 0), 0); }
export function dsaTotal()          { return dsaSolvedCount() + dsaExtraCount() + contestProblemCount(); }

function reviewDueCount() {
    const t = todayStr();
    return Object.values(S.dsaData.revise).filter(r => r.due <= t).length;
}

function latestRating(platform) {
    const rows = S.contests.filter(c => c.platform === platform && c.rating)
        .sort((a, b) => a.date.localeCompare(b.date));
    return rows.length ? rows[rows.length - 1].rating : null;
}

function peakRating(platform) {
    const rows = S.contests.filter(c => c.platform === platform && c.rating);
    return rows.length ? Math.max(...rows.map(r => +r.rating)) : null;
}

async function saveDsa() { await sSet('dsa', S.dsaData); }

/* ---- Helper to build direct LeetCode problem URLs ---- */
export function getLeetCodeUrl(name) {
    const customSlugs = {
        'Encode and Decode Strings': 'encode-and-decode-strings',
        'Subsets II': 'subsets-ii',
        'Combination Sum II': 'combination-sum-ii',
        'Course Schedule II': 'course-schedule-ii',
        'Two Sum II': 'two-sum-ii',
        '3Sum': '3sum',
        '4Sum': '4sum',
        'Pow(x, n)': 'powx-n',
        'Best Time to Buy/Sell Stock with Cooldown': 'best-time-to-buy-and-sell-stock-with-cooldown',
        'Meeting Rooms': 'meeting-rooms',
        'Meeting Rooms II': 'meeting-rooms-ii',
        'Number of Connected Components': 'number-of-connected-components-in-an-undirected-graph',
        'Graph Valid Tree': 'graph-valid-tree',
        'Alien Dictionary': 'alien-dictionary',
    };
    if (customSlugs[name]) {
        return `https://leetcode.com/problems/${customSlugs[name]}/`;
    }
    const slug = name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-');
    return `https://leetcode.com/problems/${slug}/`;
}

function cfRankName(r) {
    const rating = +r || 0;
    if (!rating || rating < 1200) return 'Newbie';
    if (rating < 1400) return 'Pupil';
    if (rating < 1600) return 'Specialist';
    if (rating < 1900) return 'Expert';
    if (rating < 2100) return 'Candidate Master';
    if (rating < 2300) return 'Master';
    return 'Grandmaster';
}

/* ---- Stats card ---- */
export function renderDsaStats() {
    const lcStats = S.dsaData.lcBase || { easy: 56, med: 49, hard: 1 };
    
    const easyChecked = DSA.filter(p => p.diff === 'E' && S.dsaData.solved[p.id]).length;
    const medChecked  = DSA.filter(p => p.diff === 'M' && S.dsaData.solved[p.id]).length;
    const hardChecked = DSA.filter(p => p.diff === 'H' && S.dsaData.solved[p.id]).length;
    
    const easyCount = lcStats.easy + easyChecked;
    const medCount  = lcStats.med + medChecked;
    const hardCount = lcStats.hard + hardChecked;
    const extraCount = dsaExtraCount();
    
    const tot = easyCount + medCount + hardCount + extraCount;
    const lc  = latestRating('LeetCode');
    const cf  = latestRating('Codeforces');
    const cfPeak = peakRating('Codeforces');
    
    const cfContestsCount = S.contests.filter(c => c.platform === 'Codeforces').length || 6;
    const cfProblemsCount = S.contests.filter(c => c.platform === 'Codeforces').reduce((a, c) => a + (+c.solved || 0), 0) || 72;
    const cfCurrRating = cf || 892;
    const cfMaxRating = cfPeak || 939;
    const cfRank = cfRankName(cfCurrRating);
    const cfMaxRank = cfRankName(cfMaxRating);
    const dueCount = reviewDueCount();

    document.getElementById('dsaStats').innerHTML = `
      <!-- Overall 500 DSA Goal Tracker -->
      <div class="dsa-overall-tracker">
        <div class="tracker-header">
          <div class="tracker-title">
            <span class="tracker-icon">🎯</span>
            <span>DSA 500 Goal Tracker</span>
          </div>
          <div class="tracker-num">${tot} <small>/ ${DSA_TARGET}</small></div>
        </div>
        <div class="progress-track tracker-bar">
          <div class="progress-fill" style="width:${Math.min(100, (tot / DSA_TARGET) * 100)}%"></div>
        </div>
        <div class="tracker-sub">
          <span>${((tot / DSA_TARGET) * 100).toFixed(1)}% Completed</span>
          <span>${Math.max(0, DSA_TARGET - tot)} problems remaining to reach 500</span>
        </div>
      </div>

      <div class="cp-github-container">
        <!-- LeetCode Card -->
        <div class="cp-card lc-card">
          <div class="cp-card-header">
            <a href="https://leetcode.com/u/vivesh_kumar_singh19/" target="_blank" rel="noopener noreferrer" class="cp-user-info cp-link">
              <div class="cp-icon lc-logo">LC</div>
              <div>
                <div class="cp-username">vivesh_kumar_singh19 <span class="ext-icon">↗</span></div>
                <div class="cp-meta">LeetCode Profile</div>
              </div>
            </a>
            <a href="https://leetcode.com/u/vivesh_kumar_singh19/" target="_blank" rel="noopener noreferrer" class="cp-rating-badge lc">${lc ? `Rating ${lc}` : 'View Profile ↗'}</a>
          </div>
          
          <div class="cp-card-body lc-body">
            <div class="lc-circle">
              <div class="lc-num">${tot}</div>
              <div class="lc-sub">Solved</div>
            </div>
            <div class="lc-bars">
              <div class="lc-bar-row">
                <span class="diff-label easy">Easy</span>
                <div class="lc-track"><div class="lc-fill easy" style="width:${Math.min(100, Math.max(5, (easyCount/958)*100))}%"></div></div>
                <span class="diff-count">${easyCount} <small>/ 958</small></span>
              </div>
              <div class="lc-bar-row">
                <span class="diff-label medium">Medium</span>
                <div class="lc-track"><div class="lc-fill medium" style="width:${Math.min(100, Math.max(5, (medCount/2098)*100))}%"></div></div>
                <span class="diff-count">${medCount} <small>/ 2098</small></span>
              </div>
              <div class="lc-bar-row">
                <span class="diff-label hard">Hard</span>
                <div class="lc-track"><div class="lc-fill hard" style="width:${Math.min(100, Math.max(5, (hardCount/961)*100))}%"></div></div>
                <span class="diff-count">${hardCount} <small>/ 961</small></span>
              </div>
            </div>
          </div>
        </div>

        <!-- Codeforces Card -->
        <div class="cp-card cf-card">
          <div class="cp-card-header">
            <a href="https://codeforces.com/profile/viveshkumarsingh2020" target="_blank" rel="noopener noreferrer" class="cp-user-info cp-link">
              <div class="cp-icon cf-logo">
                <span>▌</span><span>▌</span><span>▌</span>
              </div>
              <div>
                <div class="cp-username">viveshkumarsingh2020 <span class="ext-icon">↗</span></div>
                <div class="cp-rank">${cfRank} <small>(max: ${cfMaxRank})</small></div>
              </div>
            </a>
            <a href="https://codeforces.com/profile/viveshkumarsingh2020" target="_blank" rel="noopener noreferrer" class="cp-rating-badge cf">${cfCurrRating}</a>
          </div>

          <div class="cf-stats-grid">
            <div class="cf-stat-item">
              <span class="cf-label">Contest Rating:</span>
              <span class="cf-value gold">${cfCurrRating}</span>
            </div>
            <div class="cf-stat-item">
              <span class="cf-label">Max Contest Rating:</span>
              <span class="cf-value">${cfMaxRating}</span>
            </div>
            <div class="cf-stat-item">
              <span class="cf-label">Rated Contests:</span>
              <span class="cf-value">${cfContestsCount}</span>
            </div>
            <div class="cf-stat-item">
              <span class="cf-label">Problems Solved:</span>
              <span class="cf-value">${cfProblemsCount}</span>
            </div>
          </div>
        </div>
      </div>
      
      ${dueCount > 0 ? `
      <div class="dsa-rev-banner">
        <span class="rev-icon">⚡</span>
        <span>Spaced Revision: <b>${dueCount}</b> problem${dueCount === 1 ? '' : 's'} due for review today</span>
      </div>` : ''}`;
}

/* ---- Problems tab ---- */
function nameById(id) {
    const p = DSA.find(x => x.id === id);
    return p ? p : { name: id, topic: '', diff: '' };
}

function renderDsaProblems() {
    const wrap = document.getElementById('dsa-problems');
    let html = '';
    DSA_TOPICS.forEach((t, ti) => {
        const items = DSA.filter(p => p.topic === t[0]);
        const sd = items.filter(p => S.dsaData.solved[p.id]).length;
        const ex = S.dsaData.extra[t[0]] || 0;
        html += `<div class="acc ${ti === 0 ? 'open' : ''}">
          <div class="acc-head"><h3>${esc(t[0])}</h3><span class="meta">${sd}/${items.length}${ex ? ' +' + ex : ''}</span></div>
          <div class="acc-body">`;
        html += items.map(p => {
            const done = S.dsaData.solved[p.id];
            const rev  = !!S.dsaData.revise[p.id];
            const lcUrl = getLeetCodeUrl(p.name);
            return `<div class="ms">
              <button class="check ${done ? 'checked' : ''}" data-solve="${p.id}" style="margin-top:1px;"></button>
              <div class="txt">
                <a href="${lcUrl}" target="_blank" rel="noopener noreferrer" class="problem-link">
                  ${esc(p.name)} <span class="ext-icon">↗</span>
                </a>
                <span class="tag ${p.diff}">${p.diff}</span>
              </div>
              <button class="icon-btn star ${rev ? 'on' : ''}" data-star="${p.id}" title="Mark for revision">&#9733;</button>
            </div>`;
        }).join('');
        html += `<div class="ms" style="border-top:1px solid var(--border);">
          <div class="txt" style="color:var(--text-muted);font-size:13px;">Extra solved in this topic (beyond the list)</div>
          <div class="stepper">
            <button data-exdec="${ti}">&minus;</button>
            <span class="val" style="font-size:20px;" id="ex-${ti}">${ex}</span>
            <button data-exinc="${ti}">+</button>
          </div>
        </div>`;
        html += `</div></div>`;
    });
    wrap.innerHTML = html;
    wrap.querySelectorAll('.acc-head').forEach(h =>
        h.addEventListener('click', () => h.parentElement.classList.toggle('open'))
    );
    wrap.querySelectorAll('[data-solve]').forEach(b =>
        b.addEventListener('click', async e => {
            e.stopPropagation();
            const id = b.dataset.solve;
            S.dsaData.solved[id] = !S.dsaData.solved[id];
            if (!S.dsaData.solved[id]) delete S.dsaData.solved[id];
            await saveDsa();
            renderDsaProblems();
            renderDsaStats();
        })
    );
    wrap.querySelectorAll('[data-star]').forEach(b =>
        b.addEventListener('click', async e => {
            e.stopPropagation();
            const id = b.dataset.star;
            if (S.dsaData.revise[id]) delete S.dsaData.revise[id];
            else S.dsaData.revise[id] = { due: todayStr(), step: 0 };
            await saveDsa();
            renderDsaProblems();
            renderDsaStats();
        })
    );
    DSA_TOPICS.forEach((t, ti) => {
        wrap.querySelector(`[data-exinc="${ti}"]`).addEventListener('click', () => stepExtra(t[0], ti, 1));
        wrap.querySelector(`[data-exdec="${ti}"]`).addEventListener('click', () => stepExtra(t[0], ti, -1));
    });
}

async function stepExtra(topic, ti, delta) {
    S.dsaData.extra[topic] = Math.max(0, (S.dsaData.extra[topic] || 0) + delta);
    document.getElementById('ex-' + ti).textContent = S.dsaData.extra[topic];
    await saveDsa();
    renderDsaStats();
}

/* ---- Revision tab ---- */
function renderDsaRevision() {
    const wrap = document.getElementById('dsa-revision');
    const t = todayStr();
    const rows = Object.keys(S.dsaData.revise)
        .map(id => ({ id, ...S.dsaData.revise[id], p: nameById(id) }))
        .sort((a, b) => a.due.localeCompare(b.due));
    if (!rows.length) {
        wrap.innerHTML = '<div class="empty">Star problems on the Problems tab to build your revision queue. They resurface on a spaced schedule (1, 3, 7, 21, 45 days).</div>';
        return;
    }
    const due = rows.filter(r => r.due <= t);
    let html = `<p class="chal-blurb" style="margin:0 0 12px;">${due.length} due today or overdue. Reviewing advances each to the next interval.</p>`;
    html += rows.map(r => {
        const overdue = r.due <= t;
        return `<div class="ms">
          <div class="txt">
            ${esc(r.p.name)} ${r.p.diff ? `<span class="tag ${r.p.diff}">${r.p.diff}</span>` : ''}
            <span class="mean">next review: ${overdue ? '<b style="color:var(--gold)">due now</b>' : esc(r.due)} &middot; interval step ${r.step + 1}/${REV_INTERVALS.length}</span>
          </div>
          <button class="btn sm ${overdue ? 'gold' : 'ghost'}" data-rev="${r.id}">Reviewed</button>
          <button class="icon-btn" data-unrev="${r.id}">&times;</button>
        </div>`;
    }).join('');
    wrap.innerHTML = html;
    wrap.querySelectorAll('[data-rev]').forEach(b =>
        b.addEventListener('click', async () => {
            const id = b.dataset.rev;
            const r = S.dsaData.revise[id];
            r.step = Math.min(r.step + 1, REV_INTERVALS.length - 1);
            r.due  = dateStr(addDays(new Date(), REV_INTERVALS[r.step]));
            await saveDsa();
            renderDsaRevision();
            renderDsaStats();
        })
    );
    wrap.querySelectorAll('[data-unrev]').forEach(b =>
        b.addEventListener('click', async () => {
            delete S.dsaData.revise[b.dataset.unrev];
            await saveDsa();
            renderDsaRevision();
            renderDsaStats();
        })
    );
}

/* ---- Contests tab ---- */
const IST_MIN   = 330;
const BW_ANCHOR = Date.UTC(2025, 11, 6); // Sat 6 Dec 2025 was a LeetCode biweekly

function istInstant(y, m, d, hh, mm) {
    return Date.UTC(y, m, d, hh, mm) - IST_MIN * 60000;
}

function istParts(ms) {
    const d = new Date(ms + IST_MIN * 60000);
    return { y: d.getUTCFullYear(), m: d.getUTCMonth(), d: d.getUTCDate() };
}

function autoLeetContests(days) {
    const now = Date.now();
    const t = istParts(now);
    let base = Date.UTC(t.y, t.m, t.d);
    const out = [];
    for (let i = 0; i < days; i++) {
        const dt  = new Date(base + i * 86400000);
        const y   = dt.getUTCFullYear(), m = dt.getUTCMonth(), d = dt.getUTCDate(), dow = dt.getUTCDay();
        if (dow === 0) {
            const inst = istInstant(y, m, d, 8, 0);
            if (inst > now - 90 * 60000) out.push({ platform: 'LeetCode', name: 'Weekly Contest', instant: inst, y, m, d, time: '8:00 AM IST' });
        }
        if (dow === 6) {
            const diff = Math.round((Date.UTC(y, m, d) - BW_ANCHOR) / 86400000);
            if (((diff % 14) + 14) % 14 === 0) {
                const inst = istInstant(y, m, d, 20, 0);
                if (inst > now - 90 * 60000) out.push({ platform: 'LeetCode', name: 'Biweekly Contest', instant: inst, y, m, d, time: '8:00 PM IST' });
            }
        }
    }
    return out;
}

function countdown(inst) {
    const diff = inst - Date.now();
    if (diff <= -90 * 60000) return { t: 'ended', cls: '' };
    if (diff <= 0) return { t: 'live now', cls: 'live' };
    const mins = Math.floor(diff / 60000), days = Math.floor(mins / 1440), hrs = Math.floor((mins % 1440) / 60);
    if (days >= 1) return { t: `in ${days}d ${hrs}h`, cls: days <= 1 ? 'soon' : '' };
    if (hrs >= 1)  return { t: `in ${hrs}h ${mins % 60}m`, cls: 'soon' };
    return { t: `in ${mins}m`, cls: 'soon' };
}

function upcomingMerged() {
    const auto = autoLeetContests(140);
    const man  = S.contestQueue.map(c => {
        const [y, mo, d] = c.date.split('-').map(Number);
        let hh = 20, mm = 0;
        const mt = (c.time || '').match(/(\d{1,2}):(\d{2})/);
        if (mt) { hh = +mt[1]; mm = +mt[2]; }
        const inst = istInstant(y, mo - 1, d, hh, mm);
        return { platform: c.platform, name: c.name, instant: inst, id: c.id, time: c.time || '8:00 PM IST', y, m: mo - 1, d, manual: true };
    }).filter(c => c.instant > Date.now() - 90 * 60000);
    return auto.concat(man).sort((a, b) => a.instant - b.instant);
}

function cLabel(c) {
    const wd = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][new Date(Date.UTC(c.y, c.m, c.d)).getUTCDay()];
    return `${wd}, ${c.d} ${MONTHS[c.m].slice(0, 3)} &middot; ${esc(c.time)}`;
}

function prefillLog(platform, name, date) {
    const p = document.getElementById('ctPlat'); if (p) p.value = platform;
    const n = document.getElementById('ctName'); if (n) n.value = name;
    const dd = document.getElementById('ctDate'); if (dd) dd.value = date;
    const r = document.getElementById('ctRank');
    if (r) { r.focus(); r.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
}

function renderDsaContests() {
    const wrap  = document.getElementById('dsa-contests');
    const plats = ['LeetCode', 'Codeforces', 'CodeChef', 'AtCoder', 'Other'];

    let head = '<div class="stat-grid" style="margin-bottom:12px;">';
    ['LeetCode', 'Codeforces'].forEach(p => {
        const lr = latestRating(p), pk = peakRating(p);
        const n  = S.contests.filter(c => c.platform === p).length;
        head += `<div class="stat"><div class="k">${p}</div><div class="v">${lr || '—'}<small>${pk ? ' &middot; peak ' + pk : ''}</small></div><div class="dots" style="margin-top:6px;color:var(--text-muted);font-family:'IBM Plex Mono';font-size:11px;">${n} contest${n === 1 ? '' : 's'}</div></div>`;
    });
    head += '</div>';

    const up = upcomingMerged().slice(0, 2);
    let upHtml = '<div class="section-label" style="margin-top:6px;">Upcoming &middot; queued (Next 2)</div>';
    upHtml += '<div class="sync-note">Click <b>Participate ↗</b> to open the live contest and automatically schedule it on your calendar for that day.</div>';
    upHtml += up.map(c => {
        const cd = countdown(c.instant);
        const date = `${c.y}-${pad(c.m + 1)}-${pad(c.d)}`;
        return `<div class="ms">
          <div class="txt"><b>${esc(c.platform)}</b> ${esc(c.name)} <span class="mean">${cLabel(c)} &middot; <span class="cd ${cd.cls}">${cd.t}</span></span></div>
          <button class="btn sm gold" data-part="${esc(c.platform)}|${esc(c.name)}|${date}|${esc(c.time)}">Participate ↗</button>
          <button class="btn sm ghost" data-log="${esc(c.platform)}|${esc(c.name)}|${date}">Log</button>
          ${c.manual ? `<button class="icon-btn" data-delq="${c.id}">&times;</button>` : ''}
        </div>`;
    }).join('') || '<div class="empty">No upcoming contests.</div>';

    const qform = `
      <div class="add-form">
        <div class="fields">
          <select id="qPlat">${['Codeforces','LeetCode','CodeChef','AtCoder','Other'].map(p => `<option>${p}</option>`).join('')}</select>
          <input id="qName" placeholder="Round (e.g. Codeforces Round 1000, Div 2)" style="flex:1;">
        </div>
        <div class="fields">
          <input class="time-in" id="qDate" type="date">
          <input class="time-in" id="qTime" placeholder="20:00 (IST)">
        </div>
        <div><button class="btn sm" id="qAdd">Queue this contest</button></div>
      </div>`;

    const form = `
      <div class="section-label">Log a result</div>
      <div class="add-form">
        <div class="fields">
          <select id="ctPlat">${plats.map(p => `<option>${p}</option>`).join('')}</select>
          <input id="ctName" placeholder="Contest (e.g. Weekly 400)" style="flex:1;">
          <input class="time-in" id="ctDate" type="date" value="${todayStr()}">
        </div>
        <div class="fields">
          <input id="ctRank" type="number" placeholder="Rank">
          <input id="ctSolved" type="number" placeholder="Solved">
          <input id="ctRating" type="number" placeholder="Rating after">
          <input id="ctDelta" type="number" placeholder="+/- delta">
        </div>
        <input id="ctNotes" placeholder="Notes (optional)">
        <div><button class="btn gold sm" id="ctAdd">Log contest</button></div>
      </div>`;

    const list = S.contests.slice().sort((a, b) => b.date.localeCompare(a.date)).map(c =>
        `<div class="ms">
           <div class="txt">
             <b>${esc(c.platform)}</b> ${esc(c.name || '')}
             <span class="mean">${esc(c.date)} &middot; rank ${c.rank || '—'} &middot; solved ${c.solved || 0}${c.rating ? ' &middot; rating ' + c.rating : ''}${c.delta ? ` (${c.delta > 0 ? '+' : ''}${c.delta})` : ''}${c.notes ? ' &middot; ' + esc(c.notes) : ''}</span>
           </div>
           <button class="icon-btn" data-delc="${c.id}">&times;</button>
         </div>`
    ).join('') || '<div class="empty">No contests logged yet.</div>';

    wrap.innerHTML = head + upHtml + qform + form + '<div class="section-label">History</div>' + list;

    wrap.querySelectorAll('[data-part]').forEach(b =>
        b.addEventListener('click', async () => {
            const [plat, name, date, time] = b.dataset.part.split('|');
            
            // 1. Open contest page in new tab
            const url = plat.toLowerCase() === 'leetcode'
                ? 'https://leetcode.com/contest/'
                : 'https://codeforces.com/contests';
            window.open(url, '_blank');

            // 2. Schedule contest on calendar for that day
            const exists = S.cal.events.find(e => e.date === date && e.title.includes(name));
            if (!exists) {
                S.cal.events.push({
                    id: 'e' + Date.now(),
                    date: date,
                    title: `Contest: ${plat} - ${name}`,
                    cal: plat.toLowerCase() === 'leetcode' ? 'personal' : 'aganitha',
                    time: time || '8:00 PM IST',
                });
                await sSet('cal', S.cal);
                document.dispatchEvent(new CustomEvent('cal:changed'));
            }
            alert(`Participating in ${plat} - ${name}!\nAdded to your schedule/calendar for ${date}.`);
            renderDsaContests();
        })
    );

    wrap.querySelectorAll('[data-log]').forEach(b =>
        b.addEventListener('click', () => {
            const [p, n, d] = b.dataset.log.split('|');
            prefillLog(p, n, d);
        })
    );
    wrap.querySelectorAll('[data-delq]').forEach(b =>
        b.addEventListener('click', async () => {
            S.contestQueue = S.contestQueue.filter(x => x.id !== b.dataset.delq);
            await sSet('contestqueue', S.contestQueue);
            renderDsaContests();
        })
    );
    document.getElementById('qAdd').addEventListener('click', async () => {
        const name = document.getElementById('qName').value.trim();
        const date = document.getElementById('qDate').value;
        if (!name || !date) return;
        S.contestQueue.push({
            id: 'q' + Date.now(),
            platform: document.getElementById('qPlat').value,
            name, date,
            time: document.getElementById('qTime').value.trim(),
        });
        await sSet('contestqueue', S.contestQueue);
        renderDsaContests();
    });
    document.getElementById('ctAdd').addEventListener('click', async () => {
        const name = document.getElementById('ctName').value.trim();
        S.contests.push({
            id: 'ct' + Date.now(),
            platform: document.getElementById('ctPlat').value,
            name,
            date: document.getElementById('ctDate').value || todayStr(),
            rank:   document.getElementById('ctRank').value,
            solved: document.getElementById('ctSolved').value,
            rating: document.getElementById('ctRating').value,
            delta:  document.getElementById('ctDelta').value,
            notes:  document.getElementById('ctNotes').value.trim(),
        });
        await sSet('contests', S.contests);
        renderDsaContests();
        renderDsaStats();
    });
    wrap.querySelectorAll('[data-delc]').forEach(b =>
        b.addEventListener('click', async () => {
            S.contests = S.contests.filter(x => x.id !== b.dataset.delc);
            await sSet('contests', S.contests);
            renderDsaContests();
            renderDsaStats();
        })
    );
}

/* ---- Main render ---- */
export function renderDsa() {
    document.querySelectorAll('.dsa-sub').forEach(s => s.style.display = 'none');
    document.getElementById('dsa-' + dsaSub).style.display = 'block';
    document.querySelectorAll('[data-dsa]').forEach(b =>
        b.classList.toggle('active', b.dataset.dsa === dsaSub)
    );
    renderDsaStats();
    if (dsaSub === 'problems')  renderDsaProblems();
    else if (dsaSub === 'revision') renderDsaRevision();
    else renderDsaContests();
}

export function switchDsaTab(sub) {
    dsaSub = sub;
    renderDsa();
}

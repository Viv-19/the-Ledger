import { S } from '../state.js';
import { sSet } from '../storage.js';
import { todayStr, esc } from '../utils.js';
import { CHALLENGES } from '../data/challenges.js';

let chalFilter = 'All';

function allChallenges() {
    return CHALLENGES
        .filter(c => !S.chalState.deleted.includes(c.id))
        .concat(S.chalState.custom);
}

export function renderChalFilter() {
    const cats = ['All', 'Explore', 'Physical', 'Discipline', 'Skill', 'Social', 'Create', 'Reset'];
    document.getElementById('catFilter').innerHTML = cats.map(c =>
        `<button class="chip ${chalFilter === c ? 'active' : ''}" data-cat="${c}">${c}</button>`
    ).join('');
    document.querySelectorAll('#catFilter [data-cat]').forEach(el =>
        el.addEventListener('click', () => {
            chalFilter = el.dataset.cat;
            renderChalFilter();
            renderChalList();
        })
    );
}

export function renderChalList() {
    const list  = allChallenges();
    const done  = list.filter(c => S.chalState.state[c.id] && S.chalState.state[c.id].done).length;
    const total = list.length;
    document.getElementById('progressFill').style.width = (done / total * 100) + '%';
    document.getElementById('progressNum').textContent = `${done} / ${total}`;
    const shown = chalFilter === 'All' ? list : list.filter(c => c.c === chalFilter);
    const el = document.getElementById('chalList');
    if (!shown.length) { el.innerHTML = '<div class="empty">Nothing here yet.</div>'; return; }
    el.innerHTML = shown.map(c => {
        const isDone = S.chalState.state[c.id] && S.chalState.state[c.id].done;
        const idx = CHALLENGES.findIndex(x => x.id === c.id);
        const num = idx >= 0 ? String(idx + 1).padStart(2, '0') : '+';
        return `<div class="chal ${isDone ? 'done' : ''}">
          <div class="chal-num">${num}</div>
          <button class="check ${isDone ? 'checked' : ''}" data-toggle="${c.id}"></button>
          <div class="chal-body">
            <div class="chal-top">
              <span class="chal-title">${esc(c.t)}</span>
              <span class="tag ${c.c}">${c.c}</span>
              ${c.sunday ? '<span class="badge-today">Start this Sunday</span>' : ''}
              <button class="btn gold sm" data-schedchal="${c.id}" style="font-size:11px; padding:3px 8px; margin-left:auto;">📅 Schedule for Weekend</button>
              <button class="icon-btn chal-x" data-del="${c.id}">&times;</button>
            </div>
            <p class="chal-blurb">${esc(c.b)}</p>
          </div>
        </div>`;
    }).join('');
    el.querySelectorAll('[data-toggle]').forEach(b =>
        b.addEventListener('click', () => toggleChal(b.dataset.toggle))
    );
    el.querySelectorAll('[data-schedchal]').forEach(b =>
        b.addEventListener('click', () => scheduleChalForWeekend(b.dataset.schedchal))
    );
    el.querySelectorAll('[data-del]').forEach(b =>
        b.addEventListener('click', () => delChal(b.dataset.del))
    );
}

function getUpcomingWeekendDates() {
    const today = new Date();
    const day = today.getDay();
    const satDiff = (6 - day + 7) % 7;
    const sunDiff = (7 - day + 7) % 7;
    
    const satDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + (satDiff === 0 ? 0 : satDiff));
    const sunDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + (sunDiff === 0 && day !== 0 ? 7 : sunDiff));

    const formatD = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    return {
        sat: { date: formatD(satDate), label: `Saturday (${satDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })})` },
        sun: { date: formatD(sunDate), label: `Sunday (${sunDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })})` }
    };
}

async function scheduleChalForWeekend(id) {
    const chal = allChallenges().find(c => c.id === id);
    if (!chal) return;

    const weekend = getUpcomingWeekendDates();
    let selectedDay = 'sat';
    let selectedTime = '1:00 PM - 5:00 PM';

    const modalHtml = `
      <div id="schedModalOverlay" class="modal-overlay">
        <div class="modal-card">
          <div class="modal-head">
            <div class="modal-title">📅 Schedule Challenge</div>
            <button class="icon-btn modal-close" id="closeSchedModal">&times;</button>
          </div>
          
          <div style="font-size:14px; font-weight:600; color:var(--text); margin-bottom:14px; line-height:1.4;">
            "${esc(chal.t)}"
          </div>

          <div style="font-size:12px; color:var(--text-muted); margin-bottom:6px; font-weight:600;">1. Select Weekend Day:</div>
          <div class="modal-day-select">
            <button class="modal-day-btn active" data-mday="sat" id="btnSat">
              <span class="day-name">Saturday</span>
              <span class="day-date">${weekend.sat.label.split('(')[1].replace(')', '')}</span>
            </button>
            <button class="modal-day-btn" data-mday="sun" id="btnSun">
              <span class="day-name">Sunday</span>
              <span class="day-date">${weekend.sun.label.split('(')[1].replace(')', '')}</span>
            </button>
          </div>

          <div style="font-size:12px; color:var(--text-muted); margin-top:14px; margin-bottom:6px; font-weight:600;">2. Select Time Slot:</div>
          <div class="modal-time-select">
            <button class="modal-time-btn active" data-mtime="1:00 PM - 5:00 PM">1:00 PM &ndash; 5:00 PM (Afternoon Block)</button>
            <button class="modal-time-btn" data-mtime="5:00 PM - 9:00 PM">5:00 PM &ndash; 9:00 PM (Evening Block)</button>
            <button class="modal-time-btn" data-mtime="9:00 PM - 11:00 PM">9:00 PM &ndash; 11:00 PM (Night Coding)</button>
          </div>

          <div style="margin-top:20px; display:flex; gap:10px; justify-content:flex-end;">
            <button class="btn ghost sm" id="cancelSchedModal">Cancel</button>
            <button class="btn gold sm" id="confirmSchedModal">⚡ Schedule &amp; Live Sync Google Calendar</button>
          </div>
        </div>
      </div>`;

    const existingModal = document.getElementById('schedModalOverlay');
    if (existingModal) existingModal.remove();

    document.body.insertAdjacentHTML('beforeend', modalHtml);
    const overlay = document.getElementById('schedModalOverlay');

    overlay.querySelectorAll('[data-mday]').forEach(btn => {
        btn.onclick = () => {
            overlay.querySelectorAll('[data-mday]').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            selectedDay = btn.dataset.mday;
        };
    });

    overlay.querySelectorAll('[data-mtime]').forEach(btn => {
        btn.onclick = () => {
            overlay.querySelectorAll('[data-mtime]').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            selectedTime = btn.dataset.mtime;
        };
    });

    const closeModal = () => overlay.remove();
    document.getElementById('closeSchedModal').onclick = closeModal;
    document.getElementById('cancelSchedModal').onclick = closeModal;

    document.getElementById('confirmSchedModal').onclick = async () => {
        const targetObj = selectedDay === 'sat' ? weekend.sat : weekend.sun;
        
        S.cal.events.push({
            id: 'e_chal_' + Date.now(),
            date: targetObj.date,
            title: `🏆 Challenge: ${chal.t}`,
            cal: 'personal',
            time: selectedTime,
        });
        await sSet('cal', S.cal);
        document.dispatchEvent(new CustomEvent('cal:changed'));

        if (window.gcalCreateEvent) {
            window.gcalCreateEvent(`🏆 Challenge: ${chal.t}`, targetObj.date, selectedTime);
        }

        closeModal();

        const toast = document.createElement('div');
        toast.className = 'gcal-toast';
        toast.innerHTML = `✓ Scheduled "${chal.t}" for ${targetObj.label} (${selectedTime}) & Live Synced to Google Calendar!`;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 4000);
    };
}

async function toggleChal(id) {
    const cur = S.chalState.state[id] && S.chalState.state[id].done;
    S.chalState.state[id] = { done: !cur, date: !cur ? todayStr() : null };
    await sSet('challenges', S.chalState);
    renderChalList();
}

async function delChal(id) {
    if (id.startsWith('c') && CHALLENGES.find(x => x.id === id)) {
        if (!S.chalState.deleted.includes(id)) S.chalState.deleted.push(id);
    } else {
        S.chalState.custom = S.chalState.custom.filter(x => x.id !== id);
    }
    delete S.chalState.state[id];
    await sSet('challenges', S.chalState);
    renderChalList();
}

export function renderAddChalForm(open) {
    const wrap = document.getElementById('addChalForm');
    if (!open) { wrap.innerHTML = ''; return; }
    const cats = ['Explore', 'Physical', 'Discipline', 'Skill', 'Social', 'Create', 'Reset'];
    wrap.innerHTML = `
      <div class="add-form">
        <input id="ncTitle" placeholder="Challenge title">
        <div class="fields">
          <select id="ncCat">${cats.map(c => `<option>${c}</option>`).join('')}</select>
          <input id="ncBlurb" placeholder="One line about it" style="flex:1;">
        </div>
        <div>
          <button class="btn gold sm" id="ncSave">Add challenge</button>
          <button class="btn ghost sm" id="ncCancel">Cancel</button>
        </div>
      </div>`;
    document.getElementById('ncSave').addEventListener('click', async () => {
        const t = document.getElementById('ncTitle').value.trim();
        if (!t) return;
        S.chalState.custom.push({
            id: 'u' + Date.now(),
            c: document.getElementById('ncCat').value,
            t,
            b: document.getElementById('ncBlurb').value.trim(),
        });
        await sSet('challenges', S.chalState);
        renderAddChalForm(false);
        renderChalList();
    });
    document.getElementById('ncCancel').addEventListener('click', () => renderAddChalForm(false));
}

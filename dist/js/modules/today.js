import { S } from '../state.js';
import { sGet, sSet } from '../storage.js';
import { dateStr, todayStr, addDays, getDayType, esc, MONTHS } from '../utils.js';
import { DEFAULT_SCHED, FOCUS_OPTS, FOCUS_COLOR, HABITS } from '../data/schedule.js';
import { ROADMAP } from '../data/roadmap.js';
import { SKILLS } from '../data/skills.js';
import { dsaTotal } from './dsa.js';

/* ---- UI state local to this module ---- */
let viewDateKey = todayStr();
let viewIsToday = true;
let schedEditing = false;
let notesTimer = null;
const dayType = getDayType();

/* ---- North Star constants ---- */
const NS_START      = new Date(2026, 7, 1);   // 1 Aug 2026
const NS_SHORT_DATE = new Date(2027, 0, 31);  // conversion window
const NS_LONG_DATE  = new Date(2028, 7, 1);   // the switch

/* ---- Helpers ---- */
function effSchedule(type) {
    return S.customSched[type] ? S.customSched[type] : DEFAULT_SCHED[type];
}

function viewType() {
    return viewIsToday ? dayType : getDayType(addDays(new Date(), 1));
}

/* ---- Data load / save ---- */
async function loadView() {
    viewDateKey = viewIsToday ? todayStr() : dateStr(addDays(new Date(), 1));
    const dd = await sGet('day:' + viewDateKey);
    S.dayData = (dd && typeof dd === 'object')
        ? { done: dd.done || [], focus: dd.focus || '', habits: dd.habits || {}, notes: dd.notes || '' }
        : { done: [], focus: '', habits: {}, notes: '' };
}

async function saveDay() {
    await sSet('day:' + viewDateKey, S.dayData);
}

function saveSched(type, blocks) {
    S.customSched[type] = blocks.map(b => ({ ...b }));
    sSet('sched:' + type, S.customSched[type]);
}

/* ---- Focus ---- */
function renderFocus() {
    document.getElementById('focusLabel').textContent =
        viewIsToday ? "Tonight’s block is for" : "Tomorrow’s block is for";
    const wrap = document.getElementById('focusChips');
    wrap.innerHTML = FOCUS_OPTS.map(f =>
        `<button class="chip ${f.cls} ${S.dayData.focus === f.id ? 'active' : ''}" data-focus="${f.id}">${f.label}</button>`
    ).join('');
    wrap.querySelectorAll('[data-focus]').forEach(el =>
        el.addEventListener('click', async () => {
            S.dayData.focus = S.dayData.focus === el.dataset.focus ? '' : el.dataset.focus;
            await saveDay();
            renderFocus();
        })
    );
}

/* ---- Time dropdown & sorting helpers ---- */
function generate12hTimeOptions() {
    const times = [];
    for (let h = 0; h < 24; h++) {
        for (let m of [0, 30]) {
            const hh = String(h).padStart(2, '0');
            const mm = String(m).padStart(2, '0');
            const ampm = h >= 12 ? 'PM' : 'AM';
            const h12 = h % 12 === 0 ? 12 : h % 12;
            const label = `${String(h12).padStart(2, '0')}:${mm} ${ampm}`;
            const val = `${hh}:${mm}`;
            times.push({ val, label });
        }
    }
    return times;
}

function parseMinutes(timeStr) {
    if (!timeStr) return 0;
    const str = timeStr.trim().toLowerCase();
    const match = str.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/);
    if (match) {
        let h = parseInt(match[1], 10);
        let m = match[2] ? parseInt(match[2], 10) : 0;
        let mer = match[3];
        if (mer === 'pm' && h < 12) h += 12;
        if (mer === 'am' && h === 12) h = 0;
        if (!mer && h >= 1 && h <= 6) h += 12;
        return h * 60 + m;
    }
    return 0;
}

function sortScheduleBlocks(blocks) {
    return blocks.slice().sort((a, b) => parseMinutes(a.time) - parseMinutes(b.time));
}

function format12hRange(sVal, eVal) {
    const formatSingle = (val) => {
        const [hStr, mStr] = val.split(':');
        let h = parseInt(hStr, 10);
        const ampm = h >= 12 ? 'PM' : 'AM';
        const h12 = h % 12 === 0 ? 12 : h % 12;
        return `${h12}:${mStr} ${ampm}`;
    };
    return `${formatSingle(sVal)} - ${formatSingle(eVal)}`;
}

/* ---- Schedule ---- */
function renderSchedule() {
    const list  = document.getElementById('blockList');
    const extra = document.getElementById('schedEditExtra');
    const type  = viewType();
    const blocks = effSchedule(type);

    if (schedEditing) {
        list.innerHTML = blocks.map((b, i) =>
            `<div class="edit-block" data-i="${i}">
               <input class="time-in tin" value="${esc(b.time)}">
               <input class="lbl lin" value="${esc(b.label)}">
               <span class="ord">
                 <button class="icon-btn up">&#9650;</button>
                 <button class="icon-btn dn">&#9660;</button>
               </span>
               <button class="icon-btn del">&times;</button>
             </div>`
        ).join('');

        const timeOpts = generate12hTimeOptions();
        extra.innerHTML = `
          <div class="add-form" style="margin-top:12px;">
            <div class="fields" style="align-items:center; gap:8px;">
              <div style="display:flex; flex-direction:column; gap:2px; flex:1;">
                <label style="font-size:11px; color:var(--text-muted); font-weight:600;">Start Time</label>
                <select id="schedStartSelect" style="width:100%;">
                  ${timeOpts.map(o => `<option value="${o.val}" ${o.val === '19:00' ? 'selected' : ''}>${o.label}</option>`).join('')}
                </select>
              </div>
              <div style="display:flex; flex-direction:column; gap:2px; flex:1;">
                <label style="font-size:11px; color:var(--text-muted); font-weight:600;">End Time</label>
                <select id="schedEndSelect" style="width:100%;">
                  ${timeOpts.map(o => `<option value="${o.val}" ${o.val === '23:00' ? 'selected' : ''}>${o.label}</option>`).join('')}
                </select>
              </div>
            </div>
            <input class="lbl" id="newLabel" placeholder="What happens then (e.g. myofinder)">
            <div style="display:flex; gap:8px; align-items:center; margin-top:6px;">
              <button class="btn sm gold" id="addBlockBtn">+ Add Block & Live Sync ⚡</button>
              <button class="btn ghost sm" id="doneEditBtn">Done editing</button>
            </div>
          </div>`;

        list.querySelectorAll('.edit-block').forEach(row => {
            const i = +row.dataset.i;
            row.querySelector('.tin').addEventListener('change', e => { blocks[i].time = e.target.value; saveSched(type, sortScheduleBlocks(blocks)); });
            row.querySelector('.lin').addEventListener('change', e => { blocks[i].label = e.target.value; saveSched(type, sortScheduleBlocks(blocks)); });
            row.querySelector('.up').addEventListener('click', () => {
                if (i > 0) { [blocks[i - 1], blocks[i]] = [blocks[i], blocks[i - 1]]; saveSched(type, sortScheduleBlocks(blocks)); renderSchedule(); }
            });
            row.querySelector('.dn').addEventListener('click', () => {
                if (i < blocks.length - 1) { [blocks[i + 1], blocks[i]] = [blocks[i], blocks[i + 1]]; saveSched(type, sortScheduleBlocks(blocks)); renderSchedule(); }
            });
            row.querySelector('.del').addEventListener('click', () => {
                const deletedBlock = blocks[i];
                if (deletedBlock && window.gcalDeleteEvent) {
                    window.gcalDeleteEvent(deletedBlock.label, viewDateKey);
                }
                blocks.splice(i, 1); saveSched(type, sortScheduleBlocks(blocks)); renderSchedule();
            });
        });

        document.getElementById('addBlockBtn').addEventListener('click', () => {
            const sVal = document.getElementById('schedStartSelect').value;
            const eVal = document.getElementById('schedEndSelect').value;
            const formattedTime = format12hRange(sVal, eVal);
            const l = document.getElementById('newLabel').value.trim();
            if (!l) return;
            blocks.push({ id: 'b' + Date.now(), time: formattedTime, label: l });
            const sorted = sortScheduleBlocks(blocks);
            saveSched(type, sorted);
            renderSchedule();

            // Auto Live Sync schedule block to Google Calendar
            if (window.gcalCreateEvent) {
                window.gcalCreateEvent(l, viewDateKey, formattedTime);
            }
        });

        document.getElementById('doneEditBtn').addEventListener('click', () => {
            schedEditing = false;
            document.getElementById('editSchedBtn').textContent = 'Edit plan';
            renderSchedule();
        });
    } else {
        extra.innerHTML = '';
        const sortedBlocks = sortScheduleBlocks(blocks);
        list.innerHTML = sortedBlocks.map(b => {
            const done = S.dayData.done.includes(b.id);
            const note = b.note ? `<span class="note">${esc(b.note)}</span>` : '';
            return `<div class="block ${done ? 'done' : ''}" data-id="${b.id}">
                      <button class="check ${done ? 'checked' : ''}"></button>
                      <div class="time">${esc(b.time)}</div>
                      <div class="label">${esc(b.label)}${note}</div>
                    </div>`;
        }).join('');
        list.querySelectorAll('.block').forEach(el =>
            el.addEventListener('click', () => toggleBlock(el.dataset.id))
        );
    }
}

async function toggleBlock(id) {
    if (S.dayData.done.includes(id)) {
        S.dayData.done = S.dayData.done.filter(x => x !== id);
    } else {
        S.dayData.done.push(id);
        
        // Auto Live Sync schedule check-off to Google Calendar
        const type = viewType();
        const blocks = effSchedule(type);
        const b = blocks.find(x => x.id === id);
        if (b && window.gcalCreateEvent) {
            window.gcalCreateEvent(`✓ Completed: ${b.label}`, viewDateKey, b.time);
        }
    }
    await saveDay();
    renderSchedule();
}

/* ---- Habits ---- */
function renderHabits() {
    document.getElementById('habitsSection').style.display = viewIsToday ? 'block' : 'none';
    if (!viewIsToday) return;
    const row = document.getElementById('habitRow');
    row.innerHTML = HABITS.map(h =>
        `<button class="habit ${S.dayData.habits[h.id] ? 'on' : ''}" data-h="${h.id}">
           <span class="dot"></span>${h.label}
         </button>`
    ).join('');
    row.querySelectorAll('[data-h]').forEach(el =>
        el.addEventListener('click', async () => {
            S.dayData.habits[el.dataset.h] = !S.dayData.habits[el.dataset.h];
            await saveDay();
            renderHabits();
        })
    );
}

/* ---- Notes ---- */
function renderNotes() {
    document.getElementById('dayNotes').value = S.dayData.notes || '';
}

export function wireNotes() {
    document.getElementById('dayNotes').addEventListener('input', e => {
        S.dayData.notes = e.target.value;
        clearTimeout(notesTimer);
        notesTimer = setTimeout(saveDay, 400);
    });
}

/* ---- North Star ---- */
function clamp01(x) { return Math.max(0, Math.min(1, x)); }

function monY(d) {
    return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

function goalProgress(kind) {
    if (kind === 'short') {
        const q = ROADMAP.filter(m => ['Q1', 'Q2'].includes(m[0]));
        const done = q.filter(m => S.cvData.milestones[m.id] === 2).length;
        return q.length ? done / q.length : 0;
    }
    const rm = ROADMAP.filter(m => S.cvData.milestones[m.id] === 2).length / ROADMAP.length;
    const sk = SKILLS.filter(s => [3, 4].includes(S.cvData.skills[s.id])).length / SKILLS.length;
    const ds = Math.min(1, dsaTotal() / 500);
    return rm * 0.5 + sk * 0.3 + ds * 0.2;
}

function project(p, startD, targetD) {
    const now = Date.now();
    const elapsed = now - startD.getTime();
    const total = targetD.getTime() - startD.getTime();
    const timeFrac = clamp01(elapsed / total);
    const daysEl = elapsed / 86400000;
    let status, cls, eta;

    if (p >= 1) {
        status = 'Reached'; cls = 'ahead'; eta = '';
    } else if (daysEl < 14 || p < 0.03) {
        status = 'Gathering data'; cls = 'ontrack'; eta = 'give it a few weeks';
    } else {
        const rate = p / daysEl;
        const proj = new Date(now + ((1 - p) / rate) * 86400000);
        eta = monY(proj);
        if (p >= timeFrac + 0.05) { status = 'Ahead'; cls = 'ahead'; }
        else if (p >= timeFrac - 0.05) { status = 'On track'; cls = 'ontrack'; }
        else { status = 'Behind'; cls = 'behind'; }
    }
    return { p, timeFrac, status, cls, eta };
}

function nsRow(name, target, g, first) {
    const tail = g.status === 'Reached'
        ? ''
        : g.status === 'Gathering data'
            ? ` &middot; ${g.eta}`
            : ` &middot; on pace for <b>${g.eta}</b>`;
    return `<div class="ns-goal ${first ? 'first' : ''}">
      <div class="gt">
        <span class="gname">${name}</span>
        <span class="gtarget">${target}</span>
      </div>
      <div class="ns-bar">
        <div class="fill" style="width:${(g.p * 100).toFixed(0)}%"></div>
        <div class="timemark" style="left:${(g.timeFrac * 100).toFixed(0)}%"></div>
      </div>
      <div class="gwhere">
        ${(g.p * 100).toFixed(0)}% there &middot;
        ${(g.timeFrac * 100).toFixed(0)}% of the time gone &middot;
        <span class="gstatus ${g.cls}">${g.status}</span>${tail}
      </div>
    </div>`;
}

export function renderNorthStar() {
    const s = project(goalProgress('short'), NS_START, NS_SHORT_DATE);
    const l = project(goalProgress('long'),  NS_START, NS_LONG_DATE);
    document.getElementById('northStar').innerHTML = `
      <div class="northstar">
        <div class="ns-head">North Star &middot; where I am, when I arrive</div>
        ${nsRow('Convert &amp; first raise', '~₹9 LPA by Jan 2027', s, true)}
        ${nsRow('The switch', '₹15–20 LPA by Aug 2028', l, false)}
        <div class="gwhere" style="opacity:0.65;margin-top:10px;">
          The bar is your progress; the tick is where the clock is &mdash; stay ahead of the tick.
          Short-term = Q1–Q2 milestones. Long-term = roadmap 50%, skills 30%, DSA 20%.
        </div>
      </div>`;
}

/* ---- Plan events (calendar events for viewed day) ---- */
export function renderPlanEvents() {
    const wrap = document.getElementById('planEvents');
    const evs = S.cal.events
        .filter(e => e.date === viewDateKey)
        .sort((a, b) => (a.time || '').localeCompare(b.time || ''));
    if (!evs.length) { wrap.innerHTML = ''; return; }
    wrap.innerHTML =
        `<div class="section-label">Events ${viewIsToday ? 'today' : 'tomorrow'} &middot; plan around these</div>` +
        evs.map(e =>
            `<div class="day-ev-row">
               <span class="swatch ${e.cal}"></span>
               <span class="et">${e.time ? esc(e.time) : '—'}</span>
               <span style="flex:1;">${esc(e.title)}</span>
             </div>`
        ).join('');
}

export function wireTodaySyncButton() {
    const btn = document.getElementById('syncTodaySchedGCalBtn');
    if (btn) {
        btn.onclick = async () => {
            const type = viewType();
            const blocks = effSchedule(type);
            const sorted = sortScheduleBlocks(blocks);
            
            if (sorted.length === 0) {
                alert('No schedule blocks found for today.');
                return;
            }

            btn.disabled = true;
            btn.textContent = '⏳ Syncing schedule...';

            let syncedCount = 0;
            for (const b of sorted) {
                if (window.gcalCreateEvent) {
                    const res = await window.gcalCreateEvent(b.label, viewDateKey, b.time);
                    if (res !== false) syncedCount++;
                }
            }

            btn.disabled = false;
            btn.textContent = "📅 Sync Today's Schedule to Google Calendar ⚡";

            const toast = document.createElement('div');
            toast.className = 'gcal-toast';
            toast.innerHTML = `✓ Synced all ${sorted.length} schedule blocks to Google Calendar for today!`;
            document.body.appendChild(toast);
            setTimeout(() => toast.remove(), 4000);
        };
    }
}

/* ---- Main render ---- */
export async function renderToday() {
    await loadView();
    renderNorthStar();
    renderFocus();
    renderSchedule();
    renderPlanEvents();
    renderHabits();
    renderNotes();
    wireTodaySyncButton();
}

/* ---- Edit schedule button (wired by app.js) ---- */
export function toggleSchedEdit() {
    schedEditing = !schedEditing;
    document.getElementById('editSchedBtn').textContent = schedEditing ? 'Done' : 'Edit plan';
    renderSchedule();
}

/* ---- Day toggle (Today / Tomorrow, wired by app.js) ---- */
export async function switchDay(isToday) {
    viewIsToday = isToday;
    schedEditing = false;
    document.getElementById('editSchedBtn').textContent = 'Edit plan';
    await renderToday();
}

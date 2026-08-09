import { S } from '../state.js';
import { sGet } from '../storage.js';
import { dateStr, addDays, getDayType } from '../utils.js';
import { DEFAULT_SCHED, FOCUS_OPTS, FOCUS_COLOR } from '../data/schedule.js';

function effSchedule(type) {
    return S.customSched[type] ? S.customSched[type] : DEFAULT_SCHED[type];
}

export async function renderWeek() {
    const days   = [];
    for (let i = 6; i >= 0; i--) days.push(addDays(new Date(), -i));
    const loaded = await Promise.all(days.map(d => sGet('day:' + dateStr(d))));

    /* Schedule completion strip */
    const strip = document.getElementById('weekStrip');
    strip.innerHTML = days.map((d, idx) => {
        const t     = getDayType(d);
        const total = effSchedule(t).length;
        const dd    = loaded[idx];
        const done  = dd && Array.isArray(dd.done) ? dd.done.length : 0;
        const pct   = Math.round((done / total) * 100);
        return `<div class="strip-day">
          <div class="strip-bar-bg"><div class="strip-bar-fill" style="height:${pct}%"></div></div>
          <div class="strip-label">${d.toLocaleDateString('en-US', { weekday: 'narrow' })}</div>
          <div class="strip-lab2">${pct}%</div>
        </div>`;
    }).join('');

    /* Habit streaks */
    const grid = document.getElementById('streakGrid');
    const defs = [
        { id: 'exercise',    k: 'Movement' },
        { id: 'junkFree',    k: 'No junk food' },
        { id: 'sleepOnTime', k: 'Sleep on time' },
    ];
    let cards = defs.map(h => {
        let streak = 0;
        for (let i = loaded.length - 1; i >= 0; i--) {
            const dd = loaded[i];
            if (dd && dd.habits && dd.habits[h.id]) streak++;
            else break;
        }
        const dots = days.map((d, idx) => {
            const dd = loaded[idx];
            return `<span class="${dd && dd.habits && dd.habits[h.id] ? 'hit' : 'miss'}"></span>`;
        }).join('');
        return `<div class="stat"><div class="k">${h.k}</div><div class="v">${streak}<small> day streak</small></div><div class="dots">${dots}</div></div>`;
    });

    /* Evening focus streak */
    let fs = 0;
    for (let i = loaded.length - 1; i >= 0; i--) {
        if (loaded[i] && loaded[i].focus) fs++;
        else break;
    }
    cards.push(`<div class="stat"><div class="k">Evening block run</div><div class="v">${fs}<small> day streak</small></div><div class="dots">${days.map((d, idx) => `<span class="${loaded[idx] && loaded[idx].focus ? 'hit' : 'miss'}"></span>`).join('')}</div></div>`);
    grid.innerHTML = cards.join('');

    /* Focus history dots */
    document.getElementById('focusHistory').innerHTML = days.map((d, idx) => {
        const f   = loaded[idx] && loaded[idx].focus;
        const col = f ? FOCUS_COLOR[f] : 'var(--surface-2)';
        return `<span title="${d.toLocaleDateString('en-US', { weekday: 'short' })}: ${f || '—'}" style="background:${col}"></span>`;
    }).join('');

    document.getElementById('focusLegend').innerHTML = FOCUS_OPTS.map(f =>
        `<span style="color:${FOCUS_COLOR[f.id]}">&#9679;</span> ${f.label}`
    ).join('&nbsp;&nbsp;');
}

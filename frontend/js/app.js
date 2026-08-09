import { S } from './state.js';
import { sGet, sDel, sListKeys } from './storage.js';
import { getDayType, todayStr } from './utils.js';
import { positionNow }          from './modules/daybar.js';
import { renderToday, wireNotes, renderNorthStar, renderPlanEvents, toggleSchedEdit, switchDay } from './modules/today.js';
import { renderCalendar, calPrev, calNext } from './modules/calendar.js';
import { renderChalFilter, renderChalList, renderAddChalForm } from './modules/challenges.js';
import { renderDsa, switchDsaTab } from './modules/dsa.js';
import { renderCV, switchCVTab } from './modules/cv.js';
import { renderWeek } from './modules/week.js';
import { initGCalOAuth } from './gcal_oauth.js';

async function init() {
    /* ---- Day bar ---- */
    positionNow();
    setInterval(positionNow, 60000);
    document.getElementById('dayTypeBadge').textContent =
        getDayType() === 'weekday' ? 'Weekday' : getDayType() === 'friday' ? 'Friday' : 'Weekend';

    /* ---- Hydrate state from storage with auto-migration for schedule ---- */
    for (const t of ['weekday', 'friday', 'weekend']) {
        const c = await sGet('sched:' + t);
        if (Array.isArray(c) && c.length) {
            const hasOldStrings = c.some(b => ['Morning', 'Late morning', 'Afternoon', 'Evening', '7-11'].includes(b.time));
            if (hasOldStrings) {
                await sDel('sched:' + t);
                delete S.customSched[t];
            } else {
                S.customSched[t] = c;
            }
        }
    }

    const cs = await sGet('challenges');
    if (cs && typeof cs === 'object') {
        S.chalState = { state: cs.state || {}, custom: cs.custom || [], deleted: cs.deleted || [] };
    }

    const cv = await sGet('cv');
    if (cv && typeof cv === 'object') {
        S.cvData = { milestones: cv.milestones || {}, skills: cv.skills || {}, customMilestones: cv.customMilestones || [], customSkills: cv.customSkills || [] };
    }

    const ch = await sGet('cvhours');
    if (ch && typeof ch === 'object') S.cvHours = ch;

    const dq = await sGet('dsa');
    if (dq && typeof dq === 'object') {
        S.dsaData = { solved: dq.solved || {}, revise: dq.revise || {}, extra: dq.extra || {} };
    }

    const ct = await sGet('contests');
    if (Array.isArray(ct)) S.contests = ct;

    const cq = await sGet('contestqueue');
    if (Array.isArray(cq)) S.contestQueue = cq;

    const co = await sGet('companies');
    if (co && typeof co === 'object') S.coData = co;

    const cl = await sGet('cal');
    if (cl && typeof cl === 'object') {
        S.cal = { events: cl.events || [], show: cl.show || { personal: true, aganitha: true } };
    }

    /* ---- Render Today ---- */
    await renderToday();
    wireNotes();
    renderCalendar();
    initGCalOAuth();
    document.getElementById('todayLoading').style.display = 'none';
    document.getElementById('todayWrap').style.display = 'block';

    /* Re-render plan events when calendar events change */
    document.addEventListener('cal:changed', () => renderPlanEvents());

    /* ---- Render Challenges ---- */
    renderChalFilter();
    renderChalList();
    document.getElementById('chalLoading').style.display = 'none';
    document.getElementById('chalWrap').style.display = 'block';

    /* ---- Render CV ---- */
    renderCV();
    document.getElementById('cvLoading').style.display = 'none';
    document.getElementById('cvWrap').style.display = 'block';

    /* ---- Render DSA ---- */
    renderDsa();
    document.getElementById('dsaLoading').style.display = 'none';
    document.getElementById('dsaWrap').style.display = 'block';

    /* ---- Render Week ---- */
    await renderWeek();
    document.getElementById('weekLoading').style.display = 'none';
    document.getElementById('weekWrap').style.display = 'block';

    /* ---- Tab routing ---- */
    document.querySelectorAll('.tab').forEach(t =>
        t.addEventListener('click', () => {
            document.querySelectorAll('.tab').forEach(x => x.classList.remove('active'));
            document.querySelectorAll('.panel').forEach(x => x.classList.remove('active'));
            t.classList.add('active');
            document.getElementById('panel-' + t.dataset.tab).classList.add('active');
            if (t.dataset.tab === 'week')  renderWeek();
            if (t.dataset.tab === 'today') { renderNorthStar(); renderPlanEvents(); }
        })
    );

    /* ---- Sub-nav wiring ---- */
    document.querySelectorAll('[data-cv]').forEach(b =>
        b.addEventListener('click', () => switchCVTab(b.dataset.cv))
    );
    document.querySelectorAll('[data-dsa]').forEach(b =>
        b.addEventListener('click', () => switchDsaTab(b.dataset.dsa))
    );
    document.querySelectorAll('#dayToggle button').forEach(b =>
        b.addEventListener('click', async () => {
            document.querySelectorAll('#dayToggle button').forEach(x => x.classList.remove('active'));
            b.classList.add('active');
            await switchDay(b.dataset.day === 'today');
        })
    );

    document.getElementById('editSchedBtn').addEventListener('click', () => toggleSchedEdit());
    document.getElementById('addChalBtn').addEventListener('click', () => renderAddChalForm(true));
    document.getElementById('calPrev').addEventListener('click', calPrev);
    document.getElementById('calNext').addEventListener('click', calNext);

    /* ---- Reset buttons ---- */
    document.getElementById('resetSchedBtn').addEventListener('click', async () => {
        if (!confirm('Reset your schedule to the default plan? Your ticks and other data stay.')) return;
        for (const t of ['weekday', 'friday', 'weekend']) await sDel('sched:' + t);
        S.customSched = {};
        await renderToday();
    });

    document.getElementById('resetBtn').addEventListener('click', async () => {
        if (!confirm('Clear ALL saved progress — everything? This cannot be undone.')) return;
        const keys = await sListKeys();
        for (const k of keys) await sDel(k);
        location.reload();
    });
}

init();

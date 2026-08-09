import { S } from '../state.js';
import { sSet } from '../storage.js';
import { todayStr, esc, pad, MONTHS } from '../utils.js';

/* ---- UI state local to this module ---- */
let calMonth = (() => { const d = new Date(); d.setDate(1); return d; })();
let calSelected = null;

/* ---- Legend ---- */
export function renderCalLegend() {
    const legs = [
        ['personal', 'Personal',  'var(--gold)', 'viveshkrsingh19@gmail.com'],
        ['aganitha', 'Aganitha',  'var(--sky)',  'vivesh@aganitha.ai'],
    ];
    document.getElementById('calLegend').innerHTML = legs.map(([id, lab, col, mail]) =>
        `<span class="lg ${S.cal.show[id] ? '' : 'off'}" data-cal="${id}" title="${mail}">
           <span class="sw" style="background:${col}"></span>${lab}
         </span>`
    ).join('');
    document.querySelectorAll('#calLegend [data-cal]').forEach(el =>
        el.addEventListener('click', async () => {
            S.cal.show[el.dataset.cal] = !S.cal.show[el.dataset.cal];
            await sSet('cal', S.cal);
            renderCalLegend();
            renderCalGrid();
        })
    );
}

/* ---- Grid ---- */
function eventsOn(ds) {
    return S.cal.events
        .filter(e => e.date === ds && S.cal.show[e.cal])
        .sort((a, b) => (a.time || '').localeCompare(b.time || ''));
}

export function renderCalGrid() {
    const today = todayStr();
    document.getElementById('calMonthLabel').textContent =
        `${MONTHS[calMonth.getMonth()]} ${calMonth.getFullYear()}`;
    const grid = document.getElementById('calGrid');
    const dow = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
    let html = dow.map(d => `<div class="cal-dow">${d}</div>`).join('');
    const first = new Date(calMonth);
    const lead = (first.getDay() + 6) % 7;
    const dim = new Date(calMonth.getFullYear(), calMonth.getMonth() + 1, 0).getDate();
    for (let i = 0; i < lead; i++) html += `<div class="cal-cell blank"></div>`;
    for (let d = 1; d <= dim; d++) {
        const ds = `${calMonth.getFullYear()}-${pad(calMonth.getMonth() + 1)}-${pad(d)}`;
        const evs = eventsOn(ds);
        const isT = ds === today;
        const isSel = ds === calSelected;
        let ev = evs.slice(0, 2).map(e =>
            `<div class="cal-ev ${e.cal}">${e.time ? esc(e.time) + ' ' : ''}${esc(e.title)}</div>`
        ).join('');
        if (evs.length > 2) ev += `<div class="cal-more">+${evs.length - 2} more</div>`;
        html += `<div class="cal-cell ${isT ? 'today' : ''} ${isSel ? 'sel' : ''}" data-d="${ds}">
                   <div class="dnum">${d}</div>${ev}
                 </div>`;
    }
    grid.innerHTML = html;
    grid.querySelectorAll('[data-d]').forEach(el =>
        el.addEventListener('click', () => {
            calSelected = el.dataset.d;
            renderCalGrid();
            renderDayEvents();
        })
    );
}

/* ---- Google Calendar 1-Click Link Generator ---- */
function googleCalUrl(title, dateStr, timeStr) {
    const cleanDate = (dateStr || todayStr()).replace(/-/g, '');
    let startISO = `${cleanDate}T090000Z`;
    let endISO = `${cleanDate}T100000Z`;
    
    if (timeStr && timeStr.includes(':')) {
        const parts = timeStr.match(/(\d{1,2}):(\d{2})/);
        if (parts) {
            const hh = String(parts[1]).padStart(2, '0');
            const mm = String(parts[2]).padStart(2, '0');
            startISO = `${cleanDate}T${hh}${mm}00Z`;
            const endHH = String((+parts[1] + 1) % 24).padStart(2, '0');
            endISO = `${cleanDate}T${endHH}${mm}00Z`;
        }
    }
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${startISO}/${endISO}&details=${encodeURIComponent('Created via The Ledger Tracker')}`;
}

/* ---- ICS iCal File Parser ---- */
export function parseICS(icsText) {
    const events = [];
    const blocks = icsText.split('BEGIN:VEVENT');
    for (let i = 1; i < blocks.length; i++) {
        const block = blocks[i].split('END:VEVENT')[0];
        let summary = '', dtstart = '';
        const lines = block.split(/\r?\n/);
        for (const line of lines) {
            if (line.startsWith('SUMMARY:')) summary = line.slice(8).trim();
            if (line.startsWith('DTSTART')) {
                const parts = line.split(':');
                if (parts.length > 1) dtstart = parts[1].trim();
            }
        }
        if (summary && dtstart) {
            const y = dtstart.slice(0, 4);
            const m = dtstart.slice(4, 6);
            const d = dtstart.slice(6, 8);
            let time = '';
            if (dtstart.includes('T')) {
                const hh = dtstart.slice(9, 11);
                const mm = dtstart.slice(11, 13);
                time = `${hh}:${mm}`;
            }
            if (y && m && d) {
                events.push({
                    id: 'ics_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
                    date: `${y}-${m}-${d}`,
                    title: summary,
                    cal: 'personal',
                    time: time || 'All Day'
                });
            }
        }
    }
    return events;
}

/* ---- Helper to generate 24h & 12h time options ---- */
function generateTimeOptions() {
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

/* ---- Day events panel ---- */
export function renderDayEvents() {
    const wrap = document.getElementById('dayEvents');
    if (!calSelected) { wrap.innerHTML = ''; return; }
    const evs = S.cal.events
        .filter(e => e.date === calSelected)
        .sort((a, b) => (a.time || '').localeCompare(b.time || ''));
    const [y, m, d] = calSelected.split('-');
    let html = `<div class="section-label" style="margin-top:10px;">${MONTHS[+m - 1]} ${+d}, ${y}</div>`;
    html += evs.map(e => {
        const gCalLink = googleCalUrl(e.title, e.date, e.time);
        return `<div class="day-ev-row">
           <span class="swatch ${e.cal}"></span>
           <span class="et">${e.time ? esc(e.time) : '—'}</span>
           <span style="flex:1;">${esc(e.title)}</span>
           <a href="${gCalLink}" target="_blank" rel="noopener noreferrer" class="btn sm ghost" style="font-size:11px;padding:3px 8px;" title="Push event to Google Calendar">📅 +Google Cal</a>
           <button class="icon-btn" data-del="${e.id}">&times;</button>
         </div>`;
    }).join('') || '<div class="empty" style="padding:8px 4px;">Nothing planned.</div>';
    const timeOpts = generateTimeOptions();
    html += `
      <div class="add-form">
        <div class="fields" style="align-items:center; gap:8px;">
          <div style="display:flex; flex-direction:column; gap:2px; flex:1;">
            <label style="font-size:11px; color:var(--text-muted); font-weight:600;">Start Time</label>
            <select id="evStartSelect" style="width:100%;">
              ${timeOpts.map(o => `<option value="${o.val}" ${o.val === '19:00' ? 'selected' : ''}>${o.label}</option>`).join('')}
            </select>
          </div>
          <div style="display:flex; flex-direction:column; gap:2px; flex:1;">
            <label style="font-size:11px; color:var(--text-muted); font-weight:600;">End Time</label>
            <select id="evEndSelect" style="width:100%;">
              ${timeOpts.map(o => `<option value="${o.val}" ${o.val === '23:00' ? 'selected' : ''}>${o.label}</option>`).join('')}
            </select>
          </div>
          <div style="display:flex; flex-direction:column; gap:2px;">
            <label style="font-size:11px; color:var(--text-muted); font-weight:600;">Calendar</label>
            <select id="evCal">
              <option value="personal">Personal</option>
              <option value="aganitha">Aganitha</option>
            </select>
          </div>
        </div>
        <input id="evTitle" placeholder="Event title (e.g. Do myofinder)">
        <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-top:4px;">
          <button class="btn gold sm" id="evAdd">Add Event & Live Sync ⚡</button>
          <label class="btn ghost sm" style="cursor:pointer;font-size:12px;">
            📥 Import Google Cal (.ics)
            <input type="file" id="icsFileInput" accept=".ics" style="display:none;">
          </label>
        </div>
      </div>`;
    wrap.innerHTML = html;
    wrap.querySelectorAll('[data-del]').forEach(b =>
        b.addEventListener('click', async () => {
            const ev = S.cal.events.find(x => x.id === b.dataset.del);
            if (ev && window.gcalDeleteEvent) {
                window.gcalDeleteEvent(ev.title, ev.date);
            }
            S.cal.events = S.cal.events.filter(x => x.id !== b.dataset.del);
            await sSet('cal', S.cal);
            renderCalGrid();
            renderDayEvents();
            document.dispatchEvent(new CustomEvent('cal:changed'));
        })
    );
    document.getElementById('evAdd').addEventListener('click', async () => {
        const t = document.getElementById('evTitle').value.trim();
        const startVal = document.getElementById('evStartSelect').value;
        const endVal = document.getElementById('evEndSelect').value;
        const evTime = `${startVal} - ${endVal}`;
        if (!t) return;
        S.cal.events.push({
            id: 'e' + Date.now(),
            date: calSelected,
            title: t,
            cal: document.getElementById('evCal').value,
            time: evTime,
        });
        await sSet('cal', S.cal);
        renderCalGrid();
        renderDayEvents();
        document.dispatchEvent(new CustomEvent('cal:changed'));

        // Silent Google Calendar Two-Way Live Sync
        if (window.gcalCreateEvent) {
            window.gcalCreateEvent(t, calSelected, evTime);
        }
    });
    
    // Wire ICS File Importer
    const fileInput = document.getElementById('icsFileInput');
    if (fileInput) {
        fileInput.addEventListener('change', e => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = async (evt) => {
                const parsed = parseICS(evt.target.result);
                if (parsed.length > 0) {
                    S.cal.events.push(...parsed);
                    await sSet('cal', S.cal);
                    renderCalGrid();
                    renderDayEvents();
                    document.dispatchEvent(new CustomEvent('cal:changed'));
                    alert(`Successfully imported ${parsed.length} Google Calendar events into your schedule!`);
                } else {
                    alert('No valid events found in the .ics file.');
                }
            };
            reader.readAsText(file);
        });
    }
}

export async function syncLiveICal(rawInput, calType = 'personal') {
    if (!rawInput) return;
    const input = rawInput.trim();

    // 1. Check if input is iframe code or Google Calendar Embed URL or email
    let embedSrc = '';
    let emailMatch = input.match(/src=([^&"'\s>]+)/) || input.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
    
    if (input.includes('<iframe') || input.includes('calendar.google.com/calendar/embed')) {
        if (emailMatch) {
            const email = decodeURIComponent(emailMatch[1]);
            embedSrc = `https://calendar.google.com/calendar/embed?src=${encodeURIComponent(email)}&ctz=Asia%2FKolkata`;
        } else {
            const srcMatch = input.match(/src=["']([^"']+)["']/);
            if (srcMatch) embedSrc = srcMatch[1];
        }
    }

    if (embedSrc) {
        const iframe = document.querySelector('#cview-gcal iframe');
        if (iframe) {
            iframe.src = embedSrc;
        }
        const gcalBtn = document.querySelector('[data-cview="gcal"]');
        if (gcalBtn) gcalBtn.click();
        alert('Google Calendar linked successfully! Switched to Live Google Calendar view.');
        return;
    }

    // 2. Handle iCal URL (.ics)
    let url = input;
    if (emailMatch && !url.includes('.ics')) {
        const email = decodeURIComponent(emailMatch[1]);
        url = `https://calendar.google.com/calendar/ical/${encodeURIComponent(email)}/public/basic.ics`;
    }

    if (!url.startsWith('http')) {
        alert('Please paste your Google Calendar iframe snippet, embed URL, or secret iCal URL.');
        return;
    }

    try {
        const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
        const res = await fetch(proxyUrl);
        if (!res.ok) throw new Error('Failed to fetch iCal feed');
        const text = await res.text();
        const parsed = parseICS(text);
        if (parsed.length > 0) {
            parsed.forEach(e => e.cal = calType);
            const existingTitles = new Set(S.cal.events.map(e => `${e.date}_${e.title}`));
            const newEvents = parsed.filter(e => !existingTitles.has(`${e.date}_${e.title}`));
            S.cal.events.push(...newEvents);
            await sSet('cal', S.cal);
            renderCalGrid();
            renderDayEvents();
            document.dispatchEvent(new CustomEvent('cal:changed'));
            alert(`Synced ${newEvents.length} live Google Calendar events into your schedule!`);
        } else {
            const gcalBtn = document.querySelector('[data-cview="gcal"]');
            if (gcalBtn) gcalBtn.click();
            alert('Switched to Live Google Calendar view.');
        }
    } catch (e) {
        const gcalBtn = document.querySelector('[data-cview="gcal"]');
        if (gcalBtn) gcalBtn.click();
        alert('Switched to Live Google Calendar view.');
    }
}

export function renderCalendar() {
    renderCalLegend();
    renderCalGrid();
    renderDayEvents();

    // Wire View Switcher (Planner vs Live Google Calendar Embed)
    const viewBtns = document.querySelectorAll('#calViewToggle button');
    viewBtns.forEach(btn => {
        btn.onclick = () => {
            viewBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const targetView = btn.dataset.cview;
            if (targetView === 'planner') {
                document.getElementById('cview-planner').style.display = 'block';
                document.getElementById('cview-gcal').style.display = 'none';
            } else {
                document.getElementById('cview-planner').style.display = 'none';
                document.getElementById('cview-gcal').style.display = 'block';
            }
        };
    });

    const syncBtn = document.getElementById('syncIcalBtn');
    if (syncBtn) {
        syncBtn.onclick = () => {
            const input = document.getElementById('icalUrlInput');
            if (input && input.value.trim()) {
                syncLiveICal(input.value.trim());
            } else {
                alert('Please paste your Google Calendar Secret iCal URL in the input field.\n\nHow to get it:\n1. Open Google Calendar on desktop\n2. Go to Settings -> Integrate calendar\n3. Copy "Secret address in iCal format"');
            }
        };
    }
}

/* ---- Navigation (wired by app.js) ---- */
export function calPrev() { calMonth.setMonth(calMonth.getMonth() - 1); renderCalGrid(); }
export function calNext() { calMonth.setMonth(calMonth.getMonth() + 1); renderCalGrid(); }


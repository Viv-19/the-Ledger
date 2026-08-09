import { S } from './state.js';
import { sSet } from './storage.js';
import { renderCalGrid, renderDayEvents } from './modules/calendar.js';

const SCOPES = 'https://www.googleapis.com/auth/calendar.events';
let tokenClient = null;
let accessToken = localStorage.getItem('gcal_oauth_token') || null;

export function initGCalOAuth() {
    window.gcalCreateEvent = createGoogleCalEvent;
    window.gcalFetchEvents = fetchGoogleCalendarEvents;
    window.gcalDeleteEvent = deleteGoogleCalEventByTitle;

    const connectBtn = document.getElementById('btnConnectGoogle');
    const statusBox = document.getElementById('gcalStatusBox');
    const syncNowBtn = document.getElementById('btnSyncTwoWayNow');
    const disconnectBtn = document.getElementById('btnDisconnectGoogle');

    if (accessToken) {
        if (statusBox) statusBox.style.display = 'block';
        if (connectBtn) connectBtn.style.display = 'none';
    }

    if (connectBtn) {
        connectBtn.onclick = () => {
            requestGoogleToken();
        };
    }

    if (syncNowBtn) {
        syncNowBtn.onclick = () => {
            fetchGoogleCalendarEvents();
        };
    }

    if (disconnectBtn) {
        disconnectBtn.onclick = () => {
            accessToken = null;
            localStorage.removeItem('gcal_oauth_token');
            if (statusBox) statusBox.style.display = 'none';
            if (connectBtn) connectBtn.style.display = 'inline-flex';
            alert('Google Calendar disconnected.');
        };
    }
}

export function requestGoogleToken() {
    if (typeof google === 'undefined' || !google.accounts || !google.accounts.oauth2) {
        alert('Google OAuth library is initializing. Please try clicking Connect again in a moment.');
        return;
    }

    const defaultClientId = '322987324221-ajucv23p4kgbgs3egg85h75q0joktvi4.apps.googleusercontent.com';
    const clientId = localStorage.getItem('gcal_client_id') || defaultClientId;
    localStorage.setItem('gcal_client_id', clientId);

    try {
        tokenClient = google.accounts.oauth2.initTokenClient({
            client_id: clientId,
            scope: SCOPES,
            callback: async (response) => {
                if (response.error !== undefined) {
                    alert('Google OAuth authorization error: ' + response.error);
                    return;
                }
                accessToken = response.access_token;
                localStorage.setItem('gcal_oauth_token', accessToken);
                
                const statusBox = document.getElementById('gcalStatusBox');
                const connectBtn = document.getElementById('btnConnectGoogle');
                if (statusBox) statusBox.style.display = 'block';
                if (connectBtn) connectBtn.style.display = 'none';

                alert('✓ Google Calendar Connected! Syncing live two-way events...');
                await fetchGoogleCalendarEvents();
            },
        });

        tokenClient.requestAccessToken({ prompt: 'consent' });
    } catch (err) {
        alert('Google OAuth setup: Please ensure your Google Cloud OAuth Client ID is registered for localhost:3000.');
    }
}

export function parseTimeRange(timeStr) {
    let startHH = 9, startMM = 0, endHH = 10, endMM = 0;
    if (!timeStr) return { startHH, startMM, endHH, endMM };

    const str = timeStr.trim().toLowerCase();
    
    // Check range formats: e.g. "10:00 AM - 1:00 PM", "1:00 PM - 5:00 PM", "9:00 PM - 11:00 PM", "7:00-7:30"
    const rangeMatch = str.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)?\s*[-–to]+\s*(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/);
    if (rangeMatch) {
        let sH = parseInt(rangeMatch[1], 10);
        let sM = rangeMatch[2] ? parseInt(rangeMatch[2], 10) : 0;
        let sMer = rangeMatch[3];
        
        let eH = parseInt(rangeMatch[4], 10);
        let eM = rangeMatch[5] ? parseInt(rangeMatch[5], 10) : 0;
        let eMer = rangeMatch[6];

        if (sMer === 'pm' && sH < 12) sH += 12;
        if (sMer === 'am' && sH === 12) sH = 0;

        if (eMer === 'pm' && eH < 12) eH += 12;
        if (eMer === 'am' && eH === 12) eH = 0;

        if (!sMer && eMer) {
            if (eMer === 'pm' && sH < 12 && sH < eH) {
                if (sH < 7) sH += 12;
            } else if (eMer === 'pm' && sH < 12 && sH > eH) {
                // e.g. 10 AM - 1 PM -> sH=10 AM, eH=13 PM
            } else if (eMer === 'pm' && sH < 12) {
                sH += 12;
            }
        } else if (sMer && !eMer) {
            if (sMer === 'pm' && eH < 12) eH += 12;
            if (sMer === 'am' && eH < sH) eH += 12;
        } else if (!sMer && !eMer) {
            if (sH >= 1 && sH <= 6) sH += 12;
            if (eH >= 1 && eH <= 6 && eH < sH) eH += 12;
            if (eH < sH) eH = Math.min(23, sH + 1);
        }

        return { startHH: sH, startMM: sM, endHH: eH, endMM: eM };
    }

    // Single time: e.g. "8:00 AM", "11:30 PM", "7:00"
    const singleMatch = str.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/);
    if (singleMatch) {
        let sH = parseInt(singleMatch[1], 10);
        let sM = singleMatch[2] ? parseInt(singleMatch[2], 10) : 0;
        let mer = singleMatch[3];

        if (mer === 'pm' && sH < 12) sH += 12;
        if (mer === 'am' && sH === 12) sH = 0;
        if (!mer && sH >= 1 && sH <= 6) sH += 12;

        return { startHH: sH, startMM: sM, endHH: (sH + 1) % 24, endMM: sM };
    }

    return { startHH, startMM, endHH, endMM };
}

export async function createGoogleCalEvent(title, dateStr, timeStr) {
    if (!accessToken) return false;

    const cleanDate = (dateStr || new Date().toISOString().split('T')[0]).trim();
    const { startHH, startMM, endHH, endMM } = parseTimeRange(timeStr);

    const sHHStr = String(startHH).padStart(2, '0');
    const sMMStr = String(startMM).padStart(2, '0');
    const eHHStr = String(endHH).padStart(2, '0');
    const eMMStr = String(endMM).padStart(2, '0');

    const startDateTime = `${cleanDate}T${sHHStr}:${sMMStr}:00+05:30`;
    const endDateTime   = `${cleanDate}T${eHHStr}:${eMMStr}:00+05:30`;

    const eventPayload = {
        summary: title,
        description: 'Created via The Ledger Two-Way Sync',
        start: { dateTime: startDateTime, timeZone: 'Asia/Kolkata' },
        end: { dateTime: endDateTime, timeZone: 'Asia/Kolkata' },
    };

    try {
        const res = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(eventPayload),
        });

        if (res.ok) {
            const data = await res.json();
            console.log('✓ Successfully created event in Google Calendar API:', data);
            
            const toast = document.createElement('div');
            toast.className = 'gcal-toast';
            toast.innerHTML = `✓ Live Synced to Google Calendar (${sHHStr}:${sMMStr} - ${eHHStr}:${eMMStr})!`;
            document.body.appendChild(toast);
            setTimeout(() => toast.remove(), 4000);

            setTimeout(fetchGoogleCalendarEvents, 1000);
            return true;
        } else if (res.status === 401) {
            accessToken = null;
            localStorage.removeItem('gcal_oauth_token');
            requestGoogleToken();
        } else {
            const errData = await res.json();
            console.error('Google Calendar API Error:', errData);
            alert('Google Calendar API: ' + (errData.error?.message || 'Could not post event'));
        }
    } catch (e) {
        console.error('Failed to post event to Google Calendar API', e);
    }
    return false;
}

export async function fetchGoogleCalendarEvents() {
    if (!accessToken) return;

    try {
        const timeMin = new Date(Date.now() - 30 * 86400000).toISOString();
        const res = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${encodeURIComponent(timeMin)}&maxResults=100&singleEvents=true`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            },
        });

        if (res.ok) {
            const data = await res.json();
            const items = data.items || [];
            let addedCount = 0;

            items.forEach(item => {
                if (!item.summary) return;
                const startRaw = item.start?.dateTime || item.start?.date;
                if (!startRaw) return;

                const dateStr = startRaw.split('T')[0];
                let timeStr = 'All Day';
                if (startRaw.includes('T')) {
                    const timePart = startRaw.split('T')[1];
                    timeStr = timePart.slice(0, 5);
                }

                const existing = S.cal.events.find(e => e.date === dateStr && e.title === item.summary);
                if (!existing) {
                    S.cal.events.push({
                        id: 'gcal_' + item.id,
                        date: dateStr,
                        title: item.summary,
                        cal: 'personal',
                        time: timeStr,
                    });
                    addedCount++;
                }
            });

            if (addedCount > 0) {
                await sSet('cal', S.cal);
                renderCalGrid();
                renderDayEvents();
                document.dispatchEvent(new CustomEvent('cal:changed'));
            }
            console.log(`Synced ${addedCount} events from Google Calendar API`);
        } else if (res.status === 401) {
            accessToken = null;
            localStorage.removeItem('gcal_oauth_token');
            requestGoogleToken();
        }
    } catch (e) {
        console.error('Failed to fetch events from Google Calendar API', e);
    }
}

export async function deleteGoogleCalEvent(eventId) {
    if (!accessToken || !eventId) return false;
    try {
        const res = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events/${encodeURIComponent(eventId)}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            },
        });
        if (res.ok || res.status === 204 || res.status === 410) {
            console.log('✓ Successfully deleted event from Google Calendar API:', eventId);
            return true;
        }
    } catch (e) {
        console.error('Failed to delete event from Google Calendar API', e);
    }
    return false;
}

export async function deleteGoogleCalEventByTitle(title, dateStr) {
    if (!accessToken || !title) return false;
    try {
        const cleanDate = (dateStr || new Date().toISOString().split('T')[0]).trim();
        const timeMin = `${cleanDate}T00:00:00Z`;
        const timeMax = `${cleanDate}T23:59:59Z`;
        const res = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events?q=${encodeURIComponent(title)}&timeMin=${encodeURIComponent(timeMin)}&timeMax=${encodeURIComponent(timeMax)}`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            },
        });
        if (res.ok) {
            const data = await res.json();
            const items = data.items || [];
            let deletedCount = 0;
            for (const item of items) {
                if (item.summary && item.summary.toLowerCase().includes(title.toLowerCase())) {
                    await deleteGoogleCalEvent(item.id);
                    deletedCount++;
                }
            }
            if (deletedCount > 0) {
                const toast = document.createElement('div');
                toast.className = 'gcal-toast';
                toast.style.background = 'rgba(239, 68, 68, 0.95)';
                toast.style.color = '#FFFFFF';
                toast.innerHTML = `🗑️ Deleted "${title}" from Google Calendar!`;
                document.body.appendChild(toast);
                setTimeout(() => toast.remove(), 4000);
            }
        }
    } catch (e) {
        console.error('Failed to delete event by title', e);
    }
}

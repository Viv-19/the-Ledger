export const pad = n => String(n).padStart(2, '0');

export const dateStr = d =>
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

export const todayStr = () => dateStr(new Date());

export function addDays(d, n) {
    const x = new Date(d);
    x.setDate(x.getDate() + n);
    return x;
}

export function mondayOf(d) {
    const x = new Date(d);
    const day = (x.getDay() + 6) % 7;
    x.setDate(x.getDate() - day);
    return dateStr(x);
}

export function getDayType(d) {
    const day = (d || new Date()).getDay();
    if (day === 5) return 'friday';
    if (day === 0 || day === 6) return 'weekend';
    return 'weekday';
}

export function esc(s) {
    return String(s)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

export const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
];

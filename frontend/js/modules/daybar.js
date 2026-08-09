export function positionNow() {
    const n = new Date();
    const h = n.getHours() + n.getMinutes() / 60;
    const pct = Math.min(100, Math.max(0, ((h - 6) / 18) * 100));
    document.getElementById('nowMarker').style.left = pct + '%';
}

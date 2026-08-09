export const DEFAULT_SCHED = {
    weekday: [
        { id: 'move',     time: '7:00 AM - 7:30 AM',    label: 'Morning movement (30 min)' },
        { id: 'ready',    time: '7:30 AM - 8:30 AM',    label: 'Shower, breakfast, get ready' },
        { id: 'ammind',   time: '8:30 AM - 9:15 AM',    label: 'Morning focus (fresh-brain theory)' },
        { id: 'commin',   time: '9:15 AM - 9:45 AM',    label: 'Commute in' },
        { id: 'office',   time: '10:00 AM - 6:00 PM',   label: 'Office — Aganitha', note: 'Post-lunch (2-3pm) slump: park lighter tasks here.' },
        { id: 'commout',  time: '6:00 PM - 6:30 PM',    label: 'Commute home' },
        { id: 'dinner',   time: '6:30 PM - 7:30 PM',    label: 'Dinner + decompress' },
        { id: 'block',    time: '7:30 PM - 10:30 PM',   label: 'Focused work block (3 hrs)', note: 'CV push / myofinder / interview prep.' },
        { id: 'winddown', time: '10:30 PM - 11:00 PM',  label: 'Wind down, screens off' },
        { id: 'sleep',    time: '11:00 PM - 11:30 PM',  label: 'Lights out — 8 hrs sleep' },
    ],
    friday: [
        { id: 'move',     time: '7:00 AM - 7:30 AM',    label: 'Morning movement (30 min)' },
        { id: 'ready',    time: '7:30 AM - 8:30 AM',    label: 'Shower, breakfast, get ready' },
        { id: 'ammind',   time: '8:30 AM - 9:15 AM',    label: 'Morning focus (light)' },
        { id: 'commin',   time: '9:15 AM - 9:45 AM',    label: 'Commute in' },
        { id: 'office',   time: '10:00 AM - 6:00 PM',   label: 'Office — Aganitha' },
        { id: 'commout',  time: '6:00 PM - 6:30 PM',    label: 'Commute home' },
        { id: 'cook',     time: '6:30 PM - 8:00 PM',    label: 'Cook something good' },
        { id: 'valorant', time: '8:00 PM - 11:00 PM',   label: 'Valorant / unwind' },
        { id: 'winddown', time: '11:00 PM - 11:30 PM',  label: 'Wind down' },
        { id: 'sleep',    time: '11:30 PM - 12:00 AM',  label: 'Lights out' },
    ],
    weekend: [
        { id: 'move',     time: '8:00 AM - 8:30 AM',    label: 'Morning movement (30 min)' },
        { id: 'chores',   time: '8:30 AM - 10:00 AM',   label: 'Laundry + chores' },
        { id: 'deep',     time: '10:00 AM - 1:00 PM',   label: 'Deep work block (3 hrs) — CV mastery / project' },
        { id: 'explore',  time: '1:00 PM - 5:00 PM',    label: 'Explore the city / challenge time' },
        { id: 'free',     time: '5:00 PM - 9:00 PM',    label: 'Free time / rest / people' },
        { id: 'myofinder',time: '9:00 PM - 11:00 PM',   label: 'Focused coding / myofinder' },
        { id: 'winddown', time: '11:00 PM - 11:30 PM',  label: 'Wind down, screens off' },
        { id: 'sleep',    time: '11:30 PM - 12:00 AM',  label: 'Lights out' },
    ],
};

export const FOCUS_OPTS = [
    { id: 'office',    label: 'Office push',    cls: 'f-office' },
    { id: 'cv',        label: 'CV mastery',     cls: 'f-cv' },
    { id: 'interview', label: 'Interview prep', cls: 'f-interview' },
    { id: 'mixed',     label: 'Mixed',          cls: 'f-mixed' },
    { id: 'rest',      label: 'Rest',           cls: 'f-rest' },
];

export const FOCUS_COLOR = {
    office:    'var(--gold)',
    cv:        'var(--peri)',
    interview: 'var(--sky)',
    mixed:     'var(--orchid)',
    rest:      'var(--teal)',
};

export const HABITS = [
    { id: 'exercise',     label: 'Moved my body' },
    { id: 'junkFree',     label: 'No junk food' },
    { id: 'sleepOnTime',  label: 'Slept on time' },
];

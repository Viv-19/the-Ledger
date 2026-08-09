/**
 * Shared mutable app state — all persisted data lives here.
 *
 * Each key maps to a storage key:
 *   dayData     → 'day:<date>'
 *   customSched → 'sched:<type>'
 *   chalState   → 'challenges'
 *   cvData      → 'cv'
 *   cvHours     → 'cvhours'
 *   dsaData     → 'dsa'
 *   contests    → 'contests'
 *   contestQueue→ 'contestqueue'
 *   coData      → 'companies'
 *   cal         → 'cal'
 *
 * app.js hydrates this from storage on startup.
 * Modules read/write S directly and call the relevant save* function.
 */
export const S = {
    dayData: { done: [], focus: '', habits: {}, notes: '' },
    customSched: {},
    chalState: { state: {}, custom: [], deleted: [] },
    cvData: { milestones: {}, skills: {}, customMilestones: [], customSkills: [] },
    cvHours: {},
    dsaData: { solved: {}, revise: {}, extra: {} },
    contests: [],
    contestQueue: [],
    coData: {},
    cal: { events: [], show: { personal: true, aganitha: true } },
};

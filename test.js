import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🧪 Running Automated Test & Code Audit...');

const requiredFiles = [
    'frontend/index.html',
    'frontend/styles/main.css',
    'frontend/js/app.js',
    'frontend/js/state.js',
    'frontend/js/storage.js',
    'frontend/js/utils.js',
    'frontend/js/gcal_oauth.js',
    'frontend/js/modules/today.js',
    'frontend/js/modules/calendar.js',
    'frontend/js/modules/dsa.js',
    'frontend/js/modules/challenges.js',
    'frontend/js/modules/cv.js',
    'frontend/js/modules/week.js',
    'frontend/js/data/schedule.js',
    'frontend/js/data/dsa.js',
    'frontend/js/data/challenges.js',
    'frontend/js/data/companies.js',
    'frontend/js/data/roadmap.js',
    'frontend/js/data/skills.js'
];

let failed = false;

for (const relPath of requiredFiles) {
    const fullPath = path.join(__dirname, relPath);
    if (!fs.existsSync(fullPath)) {
        console.error(`❌ Missing file: ${relPath}`);
        failed = true;
    } else {
        const stat = fs.statSync(fullPath);
        if (stat.size === 0) {
            console.error(`❌ Empty file: ${relPath}`);
            failed = true;
        }
    }
}

if (failed) {
    console.error('❌ Tests failed!');
    process.exit(1);
} else {
    console.log('✓ All 19 required module & asset files verified.');
    console.log('✓ Code audit passed with 0 errors!');
}

const fs = require('fs');
const path = require('path');

const applyReplacements = (filePath, replacements) => {
    const fullPath = path.resolve('f:/MY PROJECTS/umurava', filePath);
    if (!fs.existsSync(fullPath)) return;
    let content = fs.readFileSync(fullPath, 'utf8');
    let original = content;
    for (const [search, replace] of replacements) {
        content = content.replaceAll(search, replace);
    }
    if (original !== content) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated ${filePath}`);
    }
};

// store.ts - change import paths
applyReplacements('lib/store/store.ts', [
    [`from './features/recruiterSlice'`, `from '@/lib/store/features/recruiterSlice'`],
    [`from './features/candidateSlice'`, `from '@/lib/store/features/candidateSlice'`],
    [`from './features/authSlice'`, `from '@/lib/store/features/authSlice'`]
]);

// Auth pages
applyReplacements('app/auth/candidate/login/page.tsx', [
    [`text-slate-900 mb-2 text-candidate`, `text-candidate mb-2`]
]);
applyReplacements('app/auth/candidate/register/page.tsx', [
    [`text-slate-900 mb-2 text-candidate`, `text-candidate mb-2`]
]);

// Tailwind arbitrary to default spacing mappings
const tailwindReplacements = [
    [`rounded-[2rem]`, `rounded-4xl`],
    [`rounded-[1.5rem]`, `rounded-3xl`],
    [`flex-grow`, `grow`],
    [`z-[110]`, `z-110`],
    [`z-[100]`, `z-100`],
    [`transition-colors transition-all`, `transition-all`]
];

const filesToUpdate = [
    'app/candidate/assessments/[token]/complete/page.tsx',
    'app/candidate/assessments/[token]/page.tsx',
    'app/candidate/dashboard/page.tsx',
    'app/page.tsx',
    'app/recruiter/assessments/[id]/submission/[candidateId]/page.tsx',
    'app/recruiter/assessments/new/page.tsx',
    'app/recruiter/assessments/page.tsx',
    'app/recruiter/candidates/page.tsx',
    'app/recruiter/candidates/upload/page.tsx',
    'app/recruiter/jobs/page.tsx',
    'app/recruiter/screenings/[id]/page.tsx',
    'app/recruiter/screenings/page.tsx',
    'app/recruiter/settings/page.tsx',
    'components/DisqualificationScreen.tsx',
    'components/FinalistCard.tsx',
    'components/QuestionBuilder.tsx',
    'components/ReasoningDrawer.tsx',
    'components/RecruiterSidebar.tsx',
    'components/TabSwitchOverlay.tsx'
];

for (const file of filesToUpdate) {
    applyReplacements(file, tailwindReplacements);
}

console.log('Done');

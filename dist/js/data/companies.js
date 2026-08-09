export const COMPANIES = [
    ['Qure.ai',                     'Mumbai',            'Radiology AI',               'A', '18-30'],
    ['SigTuple',                    'Bangalore',         'Digital microscopy',          'A', '15-26'],
    ['Onward Assist',               'Hyderabad',         'Oncology pathology AI',       'A', '14-24'],
    ['Synapsica',                   'Bangalore',         'Spine MRI AI',                'A', '16-26'],
    ['DeepTek',                     'Pune',              'Radiology AI',                'A', '14-22'],
    ['Predible Health',             'Bangalore',         'Organ/lesion segmentation',   'A', '15-25'],
    ['5C Network',                  'Bangalore',         'Teleradiology + AI',          'A', '12-20'],
    ['CARPL.ai',                    'Delhi NCR',         'Imaging AI validation',       'A', '14-24'],
    ['Aindra Systems',              'Bangalore',         'Cervical cancer screening',   'A', '12-20'],
    ['Niramai',                     'Bangalore',         'Thermal diagnostics',         'A', '12-20'],
    ['Elucidata',                   'Delhi / Remote',    'Biomedical data + AI',        'A', '18-30'],
    ['MedGenome',                   'Bangalore',         'Genomics + diagnostics',      'A', '15-25'],
    ['Strand Life Sciences',        'Bangalore',         'Genomics + pathology',        'A', '14-24'],
    ['Philips Innovation Campus',   'Bangalore',         'Medical imaging GCC',         'A', '18-30'],
    ['GE HealthCare',               'Bangalore',         'Medical imaging GCC',         'A', '18-30'],
    ['Siemens Healthineers',        'Bangalore',         'Medical imaging GCC',         'A', '18-32'],
    ['Roche Informatics',           'Hyderabad',         'Pharma DS GCC',               'A', '18-30'],
    ['Novartis',                    'Hyderabad',         'Pharma AI GCC',               'A', '18-30'],
    ['Amgen',                       'Hyderabad',         'Pharma AI GCC',               'A', '18-32'],
    ['Bristol Myers Squibb',        'Hyderabad',         'Pharma AI GCC',               'A', '18-30'],
    ['AstraZeneca',                 'Chennai / Blr',     'Pharma AI GCC',               'A', '18-30'],
    ['Recursion / insitro (US, remote)', 'Remote',       'AI-first drug discovery',     'A', '30-60'],
    ['NVIDIA',                      'Bangalore / Pune',  'Semiconductor + AI',          'B', '25-45'],
    ['Qualcomm',                    'Hyderabad / Blr',   'Semiconductor CV',            'B', '22-40'],
    ['Samsung R&D',                 'Bangalore / Noida', 'Device CV',                   'B', '18-32'],
    ['Adobe',                       'Noida / Blr',       'Applied CV research',         'B', '25-45'],
    ['Netradyne',                   'Bangalore',         'Automotive CV',               'B', '20-35'],
    ['Intel',                       'Bangalore / Hyd',   'Semiconductor AI',            'B', '18-32'],
];

COMPANIES.forEach((c, i) => { c.id = 'co' + i; });

export const CONTACT_STATES = [
    'Not contacted', 'Researching', 'Cold outreach', 'Warm contact', 'Referral secured',
];

export const APP_STATES = [
    'Not applied', 'Applied', 'Screening', 'Interviewing', 'Offer', 'Rejected',
];

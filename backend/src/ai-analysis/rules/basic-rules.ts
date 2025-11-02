export const diseaseRules = [
  {
    name: 'Malaria',
    keywords: ['fever', 'chills', 'sweating', 'headache', 'fatigue'],
    doctorCategory: 'General Practitioner',
    recommendation: 'Consider a malaria test and stay hydrated.',
  },
  {
    name: 'Typhoid',
    keywords: ['fever', 'abdominal pain', 'constipation', 'headache'],
    doctorCategory: 'General Practitioner',
    recommendation:
      'Recommend Widal test and antibiotic treatment after confirmation.',
  },
  {
    name: 'Common Cold',
    keywords: ['sneezing', 'cough', 'runny nose', 'sore throat'],
    doctorCategory: 'ENT Specialist',
    recommendation: 'Hydration, rest, and over-the-counter medicine if needed.',
  },
  {
    name: 'COVID-19',
    keywords: [
      'fever',
      'dry cough',
      'tiredness',
      'loss of taste',
      'loss of smell',
    ],
    doctorCategory: 'Pulmonologist',
    recommendation: 'Get a COVID test and self-isolate if positive.',
  },
];

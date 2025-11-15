/**
 * Disease rule definition interface
 * Defines how symptoms map to diseases and what follow-up questions to ask
 */
export interface DiseaseRule {
  name: string;
  keywords: string[];
  requiredKeywords?: string[]; // Must have at least one of these
  doctorCategory: string;
  doctorSpecialization?: string[]; // Preferred specializations
  recommendation: string;
  severity?: 'low' | 'medium' | 'high'; // Disease severity level
  followUpQuestions?: string[]; // Questions to ask if probability is low/medium
  minProbability?: number; // Minimum probability threshold for forwarding
}

/**
 * Comprehensive disease rules database
 * Maps symptoms to diseases with probabilities and follow-up logic
 */
export const diseaseRules: DiseaseRule[] = [
  {
    name: 'Malaria',
    keywords: [
      'fever',
      'chills',
      'sweating',
      'headache',
      'fatigue',
      'muscle pain',
      'nausea',
      'vomiting',
    ],
    requiredKeywords: ['fever'],
    doctorCategory: 'General Practitioner',
    doctorSpecialization: ['General Medicine', 'Infectious Disease'],
    recommendation:
      'Consider a malaria test (RDT or blood smear) and stay hydrated. Seek immediate medical attention if symptoms worsen.',
    severity: 'high',
    followUpQuestions: [
      'Have you traveled to a malaria-endemic area recently?',
      'Do you have recurring fever episodes every 2-3 days?',
      'Have you noticed any skin rashes?',
    ],
    minProbability: 0.3,
  },
  {
    name: 'Typhoid Fever',
    keywords: [
      'fever',
      'abdominal pain',
      'constipation',
      'headache',
      'weakness',
      'loss of appetite',
      'diarrhea',
    ],
    requiredKeywords: ['fever', 'abdominal pain'],
    doctorCategory: 'General Practitioner',
    doctorSpecialization: [
      'General Medicine',
      'Infectious Disease',
      'Gastroenterology',
    ],
    recommendation:
      'Recommend Widal test or blood culture and antibiotic treatment after confirmation. Ensure proper hydration.',
    severity: 'high',
    followUpQuestions: [
      'Have you consumed any contaminated food or water recently?',
      'Is the fever high-grade and persistent?',
      'Have you noticed rose-colored spots on your chest or abdomen?',
    ],
    minProbability: 0.3,
  },
  {
    name: 'Common Cold',
    keywords: [
      'sneezing',
      'cough',
      'runny nose',
      'sore throat',
      'congestion',
      'mild fever',
      'watery eyes',
    ],
    doctorCategory: 'ENT Specialist',
    doctorSpecialization: ['ENT', 'General Medicine'],
    recommendation:
      'Hydration, rest, and over-the-counter medicine if needed. Usually resolves in 7-10 days.',
    severity: 'low',
    followUpQuestions: [
      'How long have you been experiencing these symptoms?',
      'Do you have any difficulty breathing?',
      'Are the symptoms interfering with your daily activities?',
    ],
    minProbability: 0.5,
  },
  {
    name: 'COVID-19',
    keywords: [
      'fever',
      'dry cough',
      'tiredness',
      'loss of taste',
      'loss of smell',
      'difficulty breathing',
      'chest pain',
      'sore throat',
      'diarrhea',
    ],
    requiredKeywords: ['fever', 'dry cough'],
    doctorCategory: 'Pulmonologist',
    doctorSpecialization: [
      'Pulmonology',
      'Infectious Disease',
      'General Medicine',
    ],
    recommendation:
      'Get a COVID-19 test (PCR or antigen) and self-isolate if positive. Monitor oxygen levels if available.',
    severity: 'high',
    followUpQuestions: [
      'Have you been in close contact with a COVID-19 positive person?',
      'Do you have difficulty breathing or chest tightness?',
      'Have you been vaccinated against COVID-19?',
      'What is your current oxygen saturation level (if available)?',
    ],
    minProbability: 0.25,
  },
  {
    name: 'Influenza (Flu)',
    keywords: [
      'fever',
      'chills',
      'muscle aches',
      'fatigue',
      'cough',
      'sore throat',
      'headache',
      'nasal congestion',
    ],
    requiredKeywords: ['fever'],
    doctorCategory: 'General Practitioner',
    doctorSpecialization: ['General Medicine', 'Infectious Disease'],
    recommendation:
      'Rest, hydration, and antiviral medication if diagnosed early. Vaccination is recommended annually.',
    severity: 'medium',
    followUpQuestions: [
      'When did your symptoms start?',
      'Do you have body aches and fatigue?',
      'Have you received the flu vaccine this season?',
    ],
    minProbability: 0.4,
  },
  {
    name: 'Dengue Fever',
    keywords: [
      'high fever',
      'severe headache',
      'eye pain',
      'joint pain',
      'muscle pain',
      'rash',
      'bleeding',
      'nausea',
    ],
    requiredKeywords: ['high fever', 'headache'],
    doctorCategory: 'General Practitioner',
    doctorSpecialization: ['General Medicine', 'Infectious Disease'],
    recommendation:
      'Immediate medical attention required. Monitor platelet count. Rest, hydration, and avoid NSAIDs.',
    severity: 'high',
    followUpQuestions: [
      'Have you been bitten by mosquitoes recently?',
      'Do you have any bleeding from nose or gums?',
      'Have you noticed any red spots or rash on your skin?',
      'Is the fever very high (above 40°C)?',
    ],
    minProbability: 0.3,
  },
  {
    name: 'Bronchitis',
    keywords: [
      'cough',
      'mucus production',
      'chest discomfort',
      'shortness of breath',
      'wheezing',
      'mild fever',
    ],
    requiredKeywords: ['cough'],
    doctorCategory: 'Pulmonologist',
    doctorSpecialization: ['Pulmonology', 'General Medicine'],
    recommendation:
      'Rest, hydration, and cough medication. Avoid irritants. Antibiotics only if bacterial infection is confirmed.',
    severity: 'medium',
    followUpQuestions: [
      'How long have you been coughing?',
      'Do you produce sputum? What color is it?',
      'Do you have difficulty breathing?',
      'Do you smoke or are you exposed to smoke?',
    ],
    minProbability: 0.4,
  },
  {
    name: 'Gastroenteritis',
    keywords: [
      'diarrhea',
      'nausea',
      'vomiting',
      'abdominal cramps',
      'fever',
      'dehydration',
      'loss of appetite',
    ],
    requiredKeywords: ['diarrhea'],
    doctorCategory: 'Gastroenterologist',
    doctorSpecialization: ['Gastroenterology', 'General Medicine'],
    recommendation:
      'Stay hydrated with ORS solution. Rest and avoid solid foods initially. Seek medical help if severe dehydration.',
    severity: 'medium',
    followUpQuestions: [
      'How many times have you had diarrhea in the last 24 hours?',
      'Are you able to keep fluids down?',
      'Have you consumed any suspicious food recently?',
      'Do you have signs of dehydration (dry mouth, reduced urine)?',
    ],
    minProbability: 0.4,
  },
  {
    name: 'Urinary Tract Infection (UTI)',
    keywords: [
      'burning urination',
      'frequent urination',
      'urgent urination',
      'lower abdominal pain',
      'blood in urine',
      'fever',
    ],
    requiredKeywords: ['burning urination', 'frequent urination'],
    doctorCategory: 'Urologist',
    doctorSpecialization: ['Urology', 'General Medicine'],
    recommendation:
      'Increase fluid intake. Antibiotics are usually required. Complete the full course of medication.',
    severity: 'medium',
    followUpQuestions: [
      'Do you experience pain or burning when urinating?',
      'How often do you need to urinate?',
      'Is there blood or cloudiness in your urine?',
      'Do you have lower back pain (possible kidney involvement)?',
    ],
    minProbability: 0.5,
  },
  {
    name: 'Migraine',
    keywords: [
      'severe headache',
      'sensitivity to light',
      'sensitivity to sound',
      'nausea',
      'vomiting',
      'aura',
      'one-sided pain',
    ],
    requiredKeywords: ['severe headache'],
    doctorCategory: 'Neurologist',
    doctorSpecialization: ['Neurology', 'General Medicine'],
    recommendation:
      'Rest in a dark, quiet room. Pain relief medication. Identify and avoid triggers. Consult neurologist if frequent.',
    severity: 'medium',
    followUpQuestions: [
      'Is the headache severe and one-sided?',
      'Do you experience sensitivity to light or sound?',
      'Do you have any visual disturbances before the headache (aura)?',
      'How long do the headaches typically last?',
    ],
    minProbability: 0.5,
  },
  {
    name: 'Pneumonia',
    keywords: [
      'cough',
      'fever',
      'chest pain',
      'shortness of breath',
      'fatigue',
      'sweating',
      'chills',
      'mucus production',
    ],
    requiredKeywords: ['cough', 'fever'],
    doctorCategory: 'Pulmonologist',
    doctorSpecialization: [
      'Pulmonology',
      'General Medicine',
      'Infectious Disease',
    ],
    recommendation:
      'Immediate medical attention required. Chest X-ray may be needed. Antibiotic treatment if bacterial.',
    severity: 'high',
    followUpQuestions: [
      'Do you have difficulty breathing or chest pain?',
      'What color is your sputum?',
      'Do you have high fever with chills?',
      'Have you been vaccinated against pneumonia?',
    ],
    minProbability: 0.3,
  },
];

/**
 * Default follow-up questions for unclear symptoms
 */
export const defaultFollowUpQuestions = [
  'How long have you been experiencing these symptoms?',
  'On a scale of 1-10, how severe would you rate your symptoms?',
  'Have you taken any medication for these symptoms? If yes, what and when?',
  'Are your symptoms getting worse, better, or staying the same?',
  'Have you had similar symptoms before?',
  'Are there any specific triggers or activities that worsen your symptoms?',
];

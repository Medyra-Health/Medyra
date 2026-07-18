'use client'

// UI strings for the Clinic dashboard (doctor/MFA-facing). German-first with an
// English toggle — separate from next-intl because /clinic is admin-only.

import { createContext, useContext, useEffect, useState } from 'react'

const STRINGS = {
  de: {
    // nav
    navOverview: 'Übersicht', navPatients: 'Patienten', navLetters: 'Patientenbriefe',
    navAnamnese: 'Anamnese', navSettings: 'Praxis', navPoster: 'Wartezimmer-Poster',
    accessDeniedTitle: 'Zugriff eingeschränkt',
    accessDeniedBody: 'Der Clinic-Bereich ist derzeit nur für das Medyra-Team freigeschaltet.',
    backHome: 'Zur Startseite',
    signIn: 'Anmelden',
    // common
    loading: 'Wird geladen…', save: 'Speichern', cancel: 'Abbrechen', delete: 'Löschen',
    copy: 'Link kopieren', copied: 'Kopiert!', close: 'Schließen', create: 'Erstellen',
    language: 'Sprache', patient: 'Patient', noPatient: 'Ohne Patient', search: 'Suchen…',
    open: 'Öffnen', print: 'Drucken', views: 'Aufrufe', created: 'Erstellt',
    expires: 'Gültig bis', status: 'Status', refresh: 'Aktualisieren',
    pending: 'Ausstehend', completed: 'Abgeschlossen', qrCode: 'QR-Code',
    qrHint: 'QR-Code für den Patienten – z. B. auf den Ausdruck oder am Empfang zeigen.',
    confirmDelete: 'Wirklich löschen? Dies kann nicht rückgängig gemacht werden.',
    // overview
    ovTitle: 'Guten Tag', ovSubtitle: 'Ihre Praxis auf einen Blick.',
    ovPatients: 'Patienten', ovLetters: 'Patientenbriefe', ovViews: 'Brief-Aufrufe',
    ovAnamPending: 'Anamnesen offen', ovAnamDone: 'Anamnesen fertig',
    ovActivity: 'Letzte Aktivität', ovNoActivity: 'Noch keine Aktivität. Erstellen Sie den ersten Patientenbrief!',
    ovQuick: 'Schnellaktionen',
    ovQaLetter: 'Neuer Patientenbrief', ovQaLetterSub: 'Befund hochladen & erklären lassen',
    ovQaPatient: 'Patient anlegen', ovQaPatientSub: 'Name & Sprache erfassen',
    ovQaAnamnese: 'Anamnese senden', ovQaAnamneseSub: 'Fragebogen-Link erstellen',
    ovLangTitle: 'Patientensprachen',
    ovActLetter: 'Patientenbrief erstellt', ovActAnamSent: 'Anamnese-Link erstellt', ovActAnamDone: 'Anamnese ausgefüllt',
    // patients
    paTitle: 'Patienten', paSubtitle: 'Ihre Patientenliste mit bevorzugter Sprache.',
    paAdd: 'Patient anlegen', paEdit: 'Patient bearbeiten', paName: 'Name',
    paDob: 'Geburtsdatum (optional)', paNote: 'Notiz (optional)', paLang: 'Bevorzugte Sprache',
    paEmpty: 'Noch keine Patienten. Legen Sie den ersten Patienten an.',
    paNameRequired: 'Bitte einen Namen eingeben.',
    paCount: 'Patienten',
    // letters
    leTitle: 'Patientenbriefe', leSubtitle: 'Befund hochladen → verständlicher Brief in der Sprache des Patienten.',
    leNew: 'Neuer Patientenbrief', leSelectPatient: 'Patient auswählen',
    leDocType: 'Dokumenttyp', leDocLab: 'Laborbefund', leDocLetter: 'Arztbrief / Befund',
    leDocDischarge: 'Entlassungsbericht', leDocMedication: 'Medikationsplan',
    leLang: 'Briefsprache', leLangAuto: 'Sprache des Patienten',
    leDrop: 'Dokument hier ablegen oder klicken', leDropSub: 'PDF, JPG, PNG oder TXT · max. 10 MB',
    leGenerate: 'Brief erstellen', leGenerating: 'Brief wird erstellt…',
    leStep1: 'Dokument wird gelesen…', leStep2: 'Medizinische Inhalte werden verständlich erklärt…',
    leStep3: 'Brief wird formuliert…',
    leList: 'Erstellte Briefe', leEmpty: 'Noch keine Patientenbriefe erstellt.',
    leShare: 'Link für den Patienten', leOpenBrief: 'Brief ansehen',
    leSuccess: 'Patientenbrief erstellt!', leNeedFile: 'Bitte zuerst ein Dokument auswählen.',
    // anamnese
    anTitle: 'Digitale Anamnese', anSubtitle: 'Fragebogen-Link erstellen — der Patient antwortet in seiner Sprache, Sie erhalten die Zusammenfassung auf Deutsch.',
    anNew: 'Neuen Fragebogen erstellen', anPatientOpt: 'Patient (optional)',
    anLang: 'Sprache des Patienten', anCreate: 'Link erstellen',
    anReady: 'Fragebogen-Link bereit', anReadySub: 'Link oder QR-Code an den Patienten geben — z. B. im Wartezimmer.',
    anList: 'Fragebögen', anEmpty: 'Noch keine Anamnese-Fragebögen erstellt.',
    anSummary: 'Zusammenfassung (Deutsch)', anViewSummary: 'Zusammenfassung ansehen',
    anAnswers: 'Original-Antworten', anCopySummary: 'Text kopieren',
    // settings
    seTitle: 'Praxis-Einstellungen', seSubtitle: 'Diese Angaben erscheinen auf jedem Patientenbrief als Absender.',
    seName: 'Praxisname', seDoctor: 'Ärztin / Arzt', seStreet: 'Straße & Hausnummer',
    seCity: 'PLZ & Ort', sePhone: 'Telefon', seSaved: 'Gespeichert!',
    sePosterTitle: 'Wartezimmer-Poster', sePosterSub: 'Druckfertiges A4-Poster mit QR-Code für Ihre Patienten.',
    sePosterOpen: 'Poster öffnen & drucken',
  },
  en: {
    navOverview: 'Overview', navPatients: 'Patients', navLetters: 'Patient letters',
    navAnamnese: 'Intake', navSettings: 'Practice', navPoster: 'Waiting-room poster',
    accessDeniedTitle: 'Access restricted',
    accessDeniedBody: 'The Clinic area is currently limited to the Medyra team.',
    backHome: 'Back to home',
    signIn: 'Sign in',
    loading: 'Loading…', save: 'Save', cancel: 'Cancel', delete: 'Delete',
    copy: 'Copy link', copied: 'Copied!', close: 'Close', create: 'Create',
    language: 'Language', patient: 'Patient', noPatient: 'No patient', search: 'Search…',
    open: 'Open', print: 'Print', views: 'views', created: 'Created',
    expires: 'Valid until', status: 'Status', refresh: 'Refresh',
    pending: 'Pending', completed: 'Completed', qrCode: 'QR code',
    qrHint: 'QR code for the patient — e.g. on the printout or at the front desk.',
    confirmDelete: 'Really delete? This cannot be undone.',
    ovTitle: 'Welcome back', ovSubtitle: 'Your practice at a glance.',
    ovPatients: 'Patients', ovLetters: 'Patient letters', ovViews: 'Letter views',
    ovAnamPending: 'Intakes pending', ovAnamDone: 'Intakes done',
    ovActivity: 'Recent activity', ovNoActivity: 'No activity yet. Create your first patient letter!',
    ovQuick: 'Quick actions',
    ovQaLetter: 'New patient letter', ovQaLetterSub: 'Upload a report & get it explained',
    ovQaPatient: 'Add patient', ovQaPatientSub: 'Capture name & language',
    ovQaAnamnese: 'Send intake form', ovQaAnamneseSub: 'Create questionnaire link',
    ovLangTitle: 'Patient languages',
    ovActLetter: 'Patient letter created', ovActAnamSent: 'Intake link created', ovActAnamDone: 'Intake completed',
    paTitle: 'Patients', paSubtitle: 'Your patient list with preferred language.',
    paAdd: 'Add patient', paEdit: 'Edit patient', paName: 'Name',
    paDob: 'Date of birth (optional)', paNote: 'Note (optional)', paLang: 'Preferred language',
    paEmpty: 'No patients yet. Add your first patient.',
    paNameRequired: 'Please enter a name.',
    paCount: 'patients',
    leTitle: 'Patient letters', leSubtitle: 'Upload a report → plain-language letter in the patient’s language.',
    leNew: 'New patient letter', leSelectPatient: 'Select patient',
    leDocType: 'Document type', leDocLab: 'Lab report', leDocLetter: 'Doctor letter / findings',
    leDocDischarge: 'Discharge summary', leDocMedication: 'Medication plan',
    leLang: 'Letter language', leLangAuto: 'Patient’s language',
    leDrop: 'Drop document here or click', leDropSub: 'PDF, JPG, PNG or TXT · max. 10 MB',
    leGenerate: 'Create letter', leGenerating: 'Creating letter…',
    leStep1: 'Reading document…', leStep2: 'Explaining medical content in plain language…',
    leStep3: 'Writing the letter…',
    leList: 'Created letters', leEmpty: 'No patient letters created yet.',
    leShare: 'Link for the patient', leOpenBrief: 'View letter',
    leSuccess: 'Patient letter created!', leNeedFile: 'Please select a document first.',
    anTitle: 'Digital intake', anSubtitle: 'Create a questionnaire link — the patient answers in their language, you receive the summary in German.',
    anNew: 'Create new questionnaire', anPatientOpt: 'Patient (optional)',
    anLang: 'Patient’s language', anCreate: 'Create link',
    anReady: 'Questionnaire link ready', anReadySub: 'Give the link or QR code to the patient — e.g. in the waiting room.',
    anList: 'Questionnaires', anEmpty: 'No intake questionnaires created yet.',
    anSummary: 'Summary (German)', anViewSummary: 'View summary',
    anAnswers: 'Original answers', anCopySummary: 'Copy text',
    seTitle: 'Practice settings', seSubtitle: 'These details appear on every patient letter as the sender.',
    seName: 'Practice name', seDoctor: 'Doctor', seStreet: 'Street & number',
    seCity: 'ZIP & city', sePhone: 'Phone', seSaved: 'Saved!',
    sePosterTitle: 'Waiting-room poster', sePosterSub: 'Print-ready A4 poster with QR code for your patients.',
    sePosterOpen: 'Open & print poster',
  },
}

const ClinicLangContext = createContext({ lang: 'de', setLang: () => {}, t: k => k })

export function ClinicLangProvider({ children }) {
  const [lang, setLangState] = useState('de')
  useEffect(() => {
    const stored = typeof window !== 'undefined' && localStorage.getItem('medyra_clinic_lang')
    if (stored === 'en' || stored === 'de') setLangState(stored)
  }, [])
  const setLang = l => {
    setLangState(l)
    try { localStorage.setItem('medyra_clinic_lang', l) } catch {}
  }
  const t = key => STRINGS[lang][key] ?? STRINGS.de[key] ?? key
  return (
    <ClinicLangContext.Provider value={{ lang, setLang, t }}>
      {children}
    </ClinicLangContext.Provider>
  )
}

export function useClinicT() {
  return useContext(ClinicLangContext)
}

export const CLINIC_ADMIN_EMAILS = ['abralur28@gmail.com', 'philipp.mattar@googlemail.com']

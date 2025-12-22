export function clearGuestState() {
  // Auth
  localStorage.removeItem('token');
  localStorage.removeItem('user');

  // Skjema / drafts
  localStorage.removeItem('wizardDraft');
  localStorage.removeItem('planDraft');
  localStorage.removeItem('insuranceDraft');
  localStorage.removeItem('journalDraft');

  // Eventuelle logger / cache
  localStorage.removeItem('structuredLogs');

  // Session
  sessionStorage.clear();
}

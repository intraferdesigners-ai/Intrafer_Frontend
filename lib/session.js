export function getSessionId() {
  if (typeof window === 'undefined') return '';
  let id = localStorage.getItem('intrafer_session_id');
  if (!id) {
    id = 'sess_' + Date.now() + '_' + Math.random().toString(36).slice(2, 9);
    localStorage.setItem('intrafer_session_id', id);
  }
  return id;
}

export function hasFilledPopup() {
  if (typeof window === 'undefined') return false;
  return !!localStorage.getItem('intrafer_popup_filled');
}

export function markPopupFilled() {
  if (typeof window === 'undefined') return;
  localStorage.setItem('intrafer_popup_filled', '1');
}

export function markPopupDismissed() {
  if (typeof window === 'undefined') return;
  localStorage.setItem('intrafer_popup_dismissed_at', Date.now().toString());
}

export function markPopupNotInterested() {
  if (typeof window === 'undefined') return;
  localStorage.setItem('intrafer_popup_not_interested', '1');
}

export function shouldShowPopup() {
  if (typeof window === 'undefined') return false;
  if (hasFilledPopup()) return false;
  if (localStorage.getItem('intrafer_popup_not_interested')) return false;
  const ts = localStorage.getItem('intrafer_popup_dismissed_at');
  if (ts) {
    if (Date.now() - parseInt(ts) < 5 * 60 * 1000) return false;
    localStorage.removeItem('intrafer_popup_dismissed_at');
  }
  return true;
}

export function recordFirstVisit() {
  if (typeof window === 'undefined') return;
  if (!localStorage.getItem('intrafer_first_visit')) {
    localStorage.setItem('intrafer_first_visit', Date.now().toString());
  }
}

export function getSecondsSinceFirstVisit() {
  if (typeof window === 'undefined') return 0;
  const firstVisit = localStorage.getItem('intrafer_first_visit');
  if (!firstVisit) return 0;
  return Math.floor((Date.now() - parseInt(firstVisit)) / 1000);
}

export const INVITE_URL_KEY = 's_black_pendingInviteUrl';

export const saveInviteUrl = (url: string) => {
  console.log('📨 Saving invite URL to storage:', url);
  localStorage.setItem(INVITE_URL_KEY, url);
};

export const getInviteUrl = () => {
  const url = localStorage.getItem(INVITE_URL_KEY);
  console.log('🔍 Retrieved invite URL from storage:', url);
  return url;
};

export const clearInviteUrl = () => {
  console.log('🗑️ Clearing invite URL from storage');
  localStorage.removeItem(INVITE_URL_KEY);
}; 
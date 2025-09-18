import { isExpired } from './validation';

const STORAGE_KEY = 'shortened_urls';

export const saveUrl = (urlData) => {
  const existingUrls = getUrls();
  const newUrls = [...existingUrls, urlData];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(newUrls));
  return urlData;
};

export const getUrls = () => {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const findUrlByShortcode = (shortcode) => {
  const urls = getUrls();
  return urls.find(url => url.shortcode === shortcode);
};

export const updateUrl = (shortcode, updates) => {
  const urls = getUrls();
  const index = urls.findIndex(url => url.shortcode === shortcode);
  if (index !== -1) {
    urls[index] = { ...urls[index], ...updates };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(urls));
    return urls[index];
  }
  return null;
};

export const removeExpiredUrls = () => {
  const urls = getUrls();
  const validUrls = urls.filter(url => !isExpired(url.expiresAt));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(validUrls));
  return validUrls;
};

export const isShortcodeUnique = (shortcode) => {
  const urls = getUrls();
  return !urls.some(url => url.shortcode === shortcode);
};
import { getInviteesDownloadUrl } from './firestore.js';
import { caching, inviteesStoragePath } from '../app.config.js';
import { cacheResponse, getCachedResponse, safeJsonParse } from './utils.js';

const CACHE_KEY = 'wedding:invitees';

export async function loadInvitees() {
  const cached = getCachedResponse(CACHE_KEY);
  if (cached) {
    const parsed = safeJsonParse(cached.body);
    if (parsed?.invitees) {
      return parsed.invitees;
    }
  }

  try {
    const url = await getInviteesDownloadUrl(inviteesStoragePath);
    const response = await fetch(url, {
      headers: cached?.headers?.etag ? { 'If-None-Match': cached.headers.etag } : {},
    });

    if (response.status === 304 && cached) {
      const parsed = safeJsonParse(cached.body);
      return parsed?.invitees || [];
    }

    if (!response.ok) {
      throw new Error('Invitees download failed');
    }

    await cacheResponse(CACHE_KEY, response, caching.storageCacheMinutes);
    const json = await response.clone().json();
    return json.invitees || [];
  } catch (error) {
    console.error(error);
    return [];
  }
}

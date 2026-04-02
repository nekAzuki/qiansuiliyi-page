const ARTWORK_API = 'https://firefly-api.eikasia30.workers.dev/api/v1/artwork';
const NETEASE_SEARCH_API = 'https://music.163.com/api/search/get';
const TIMEOUT_MS = 5000;

export interface SongSearchResult {
  name: string;
  artist: string;
  coverUrl: string;
}

export async function fetchCoverUrl(
  songName: string,
  artist: string
): Promise<string> {
  try {
    const url = `${ARTWORK_API}?title=${encodeURIComponent(songName)}&artist=${encodeURIComponent(artist)}&size=large`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!response.ok) return '';

    // The artwork API may return an image directly or a JSON with URL
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('image')) {
      // It returns the image directly — use the request URL as the cover URL
      return url;
    }

    // Try parsing as JSON
    try {
      const data = await response.json() as Record<string, unknown>;
      return (data?.url as string) || (data?.picUrl as string) || url;
    } catch {
      return url;
    }
  } catch {
    return '';
  }
}

export async function searchSongs(keyword: string, offset: number = 0, limit: number = 10): Promise<SongSearchResult[]> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

    // Use Netease search API
    const params = new URLSearchParams({
      s: keyword,
      type: '1',
      limit: String(limit),
      offset: String(offset),
    });

    const response = await fetch(`${NETEASE_SEARCH_API}?${params.toString()}`, {
      signal: controller.signal,
      headers: {
        'Referer': 'https://music.163.com/',
        'User-Agent': 'Mozilla/5.0',
      },
    });
    clearTimeout(timeoutId);

    if (!response.ok) return [];

    const data = await response.json() as Record<string, unknown>;
    const result = data?.result as Record<string, unknown> | undefined;
    const songs = result?.songs as Array<Record<string, unknown>> | undefined;

    if (!songs || songs.length === 0) return [];

    return songs.map((song) => {
      const artists = song.artists as Array<Record<string, unknown>> | undefined;
      const artistName = artists?.map((a) => a.name as string).join(', ') || '';
      const album = song.album as Record<string, unknown> | undefined;
      const picUrl = (album?.picUrl as string) || '';

      return {
        name: (song.name as string) || '',
        artist: artistName,
        coverUrl: picUrl,
      };
    });
  } catch {
    return [];
  }
}

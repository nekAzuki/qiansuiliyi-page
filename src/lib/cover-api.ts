const NETEASE_SEARCH_API = 'https://music.163.com/api/search/get';
const NETEASE_DETAIL_API = 'https://music.163.com/api/song/detail';
const TIMEOUT_MS = 5000;

function proxyUrl(url: string): string {
  if (!url) return '';
  // Rewrite Netease CDN URLs to go through our proxy
  try {
    const parsed = new URL(url);
    if (parsed.hostname.endsWith('.music.126.net')) {
      return `/api/proxy/image?url=${encodeURIComponent(url)}`;
    }
  } catch {
    // not a valid URL
  }
  return url;
}

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
    // Search Netease for the song and get album cover directly
    const results = await searchSongs(`${songName} ${artist}`, 0, 1);
    if (results.length > 0 && results[0].coverUrl) {
      return proxyUrl(results[0].coverUrl);
    }
    return '';
  } catch {
    return '';
  }
}

export async function searchSongs(keyword: string, offset: number = 0, limit: number = 10): Promise<SongSearchResult[]> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

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

    // Get song IDs for detail lookup (search results may not include full album art)
    const songIds = songs.map((s) => s.id as number).filter(Boolean);

    // Try to get higher quality covers from detail API
    let coverMap: Record<number, string> = {};
    try {
      coverMap = await fetchCoversByIds(songIds);
    } catch {
      // Fall back to search result covers
    }

    return songs.map((song) => {
      const songId = song.id as number;
      const artists = song.artists as Array<Record<string, unknown>> | undefined;
      const artistName = artists?.map((a) => a.name as string).join(', ') || '';
      const album = song.album as Record<string, unknown> | undefined;
      const searchPicUrl = (album?.picUrl as string) || '';

      return {
        name: (song.name as string) || '',
        artist: artistName,
        coverUrl: proxyUrl(coverMap[songId] || searchPicUrl),
      };
    });
  } catch {
    return [];
  }
}

async function fetchCoversByIds(ids: number[]): Promise<Record<number, string>> {
  if (ids.length === 0) return {};

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

    const idsParam = ids.join(',');
    const response = await fetch(
      `${NETEASE_DETAIL_API}?ids=[${idsParam}]`,
      {
        signal: controller.signal,
        headers: {
          'Referer': 'https://music.163.com/',
          'User-Agent': 'Mozilla/5.0',
        },
      }
    );
    clearTimeout(timeoutId);

    if (!response.ok) return {};

    const data = await response.json() as Record<string, unknown>;
    const songs = data?.songs as Array<Record<string, unknown>> | undefined;

    if (!songs) return {};

    const map: Record<number, string> = {};
    for (const song of songs) {
      const id = song.id as number;
      const album = song.album as Record<string, unknown> | undefined;
      const picUrl = (album?.picUrl as string) || '';
      if (id && picUrl) {
        map[id] = picUrl;
      }
    }
    return map;
  } catch {
    return {};
  }
}

const SEARCH_API = 'https://firefly-api.eikasia30.workers.dev/netease/search';
const TIMEOUT_MS = 5000;

export async function fetchCoverUrl(
  songName: string,
  artist: string
): Promise<string> {
  try {
    const keyword = `${songName} ${artist}`.trim();
    const url = `${SEARCH_API}?keyword=${encodeURIComponent(keyword)}&limit=1`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!response.ok) return '';

    const data = await response.json() as Record<string, unknown>;

    // Navigate the Netease API response structure
    const result = data?.result as Record<string, unknown> | undefined;
    const songs = result?.songs as Array<Record<string, unknown>> | undefined;

    if (!songs || songs.length === 0) return '';

    const firstSong = songs[0];
    const album = firstSong?.album as Record<string, unknown> | undefined;
    const picUrl = album?.picUrl as string | undefined;

    return picUrl ?? '';
  } catch {
    return '';
  }
}

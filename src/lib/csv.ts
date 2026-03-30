import type { Song, SongInput } from '@/types';

export function parseCSV(
  content: string,
  delimiter?: string
): { headers: string[]; rows: string[][] } {
  if (!delimiter) {
    const firstLine = content.split('\n')[0] ?? '';
    delimiter = firstLine.includes('\t') ? '\t' : ',';
  }

  const lines = parseRows(content, delimiter);
  if (lines.length === 0) {
    return { headers: [], rows: [] };
  }

  const headers = lines[0];
  const rows = lines.slice(1).filter((row) => row.some((cell) => cell.trim() !== ''));

  return { headers, rows };
}

function parseRows(content: string, delimiter: string): string[][] {
  const rows: string[][] = [];
  let current: string[] = [];
  let field = '';
  let inQuotes = false;
  let i = 0;

  while (i < content.length) {
    const char = content[i];

    if (inQuotes) {
      if (char === '"') {
        if (i + 1 < content.length && content[i + 1] === '"') {
          field += '"';
          i += 2;
        } else {
          inQuotes = false;
          i++;
        }
      } else {
        field += char;
        i++;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
        i++;
      } else if (char === delimiter) {
        current.push(field);
        field = '';
        i++;
      } else if (char === '\r') {
        if (i + 1 < content.length && content[i + 1] === '\n') {
          i++;
        }
        current.push(field);
        field = '';
        rows.push(current);
        current = [];
        i++;
      } else if (char === '\n') {
        current.push(field);
        field = '';
        rows.push(current);
        current = [];
        i++;
      } else {
        field += char;
        i++;
      }
    }
  }

  if (field !== '' || current.length > 0) {
    current.push(field);
    rows.push(current);
  }

  return rows;
}

function quoteField(value: string, delimiter: string): string {
  if (
    value.includes(delimiter) ||
    value.includes('"') ||
    value.includes('\n') ||
    value.includes('\r')
  ) {
    return '"' + value.replace(/"/g, '""') + '"';
  }
  return value;
}

export function serializeCSV(
  headers: string[],
  rows: string[][],
  delimiter: string = ','
): string {
  const lines: string[] = [];
  lines.push(headers.map((h) => quoteField(h, delimiter)).join(delimiter));
  for (const row of rows) {
    lines.push(row.map((cell) => quoteField(cell, delimiter)).join(delimiter));
  }
  return lines.join('\n');
}

export function songsToCsvRows(songs: Song[]): { headers: string[]; rows: string[][] } {
  const headers = ['歌曲名称', '歌手', '语言', '分类标签', '备注'];

  const rows = songs.map((song) => [
    song.song_name,
    song.artist,
    song.language,
    song.tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)
      .join('|'),
    song.notes,
  ]);

  return { headers, rows };
}

const HEADER_MAP: Record<string, keyof SongInput> = {
  歌曲名称: 'song_name',
  歌手: 'artist',
  语言: 'language',
  分类标签: 'tags',
  备注: 'notes',
};

export function csvRowsToSongInputs(
  headers: string[],
  rows: string[][]
): SongInput[] {
  const fieldIndices: Partial<Record<keyof SongInput, number>> = {};

  headers.forEach((header, index) => {
    const trimmed = header.trim();
    const field = HEADER_MAP[trimmed];
    if (field) {
      fieldIndices[field] = index;
    }
  });

  return rows.map((row) => {
    const get = (field: keyof SongInput): string => {
      const idx = fieldIndices[field];
      return idx !== undefined ? (row[idx]?.trim() ?? '') : '';
    };

    const tagsStr = get('tags' as keyof SongInput);
    const tags = tagsStr
      ? tagsStr
          .split('|')
          .map((t) => t.trim())
          .filter(Boolean)
      : [];

    return {
      song_name: get('song_name'),
      artist: get('artist'),
      language: get('language'),
      tags,
      notes: get('notes'),
    };
  });
}

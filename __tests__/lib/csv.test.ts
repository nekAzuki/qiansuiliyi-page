import { describe, it, expect } from 'vitest';
import { parseCSV, serializeCSV, songsToCsvRows, csvRowsToSongInputs } from '@/lib/csv';
import type { Song } from '@/types';

describe('parseCSV', () => {
  it('parses basic CSV with comma delimiter', () => {
    const csv = 'name,artist,language\nSong1,Artist1,国语\nSong2,Artist2,英语';
    const result = parseCSV(csv);
    expect(result.headers).toEqual(['name', 'artist', 'language']);
    expect(result.rows).toHaveLength(2);
    expect(result.rows[0]).toEqual(['Song1', 'Artist1', '国语']);
    expect(result.rows[1]).toEqual(['Song2', 'Artist2', '英语']);
  });

  it('parses TSV with tab delimiter', () => {
    const tsv = 'name\tartist\nSong1\tArtist1';
    const result = parseCSV(tsv);
    expect(result.headers).toEqual(['name', 'artist']);
    expect(result.rows[0]).toEqual(['Song1', 'Artist1']);
  });

  it('auto-detects tab delimiter when present in first line', () => {
    const tsv = 'col1\tcol2\nval1\tval2';
    const result = parseCSV(tsv);
    expect(result.headers).toEqual(['col1', 'col2']);
    expect(result.rows[0]).toEqual(['val1', 'val2']);
  });

  it('auto-detects comma delimiter when no tabs in first line', () => {
    const csv = 'col1,col2\nval1,val2';
    const result = parseCSV(csv);
    expect(result.headers).toEqual(['col1', 'col2']);
  });

  it('handles quoted fields containing commas', () => {
    const csv = 'name,tags\n"Song, The Great",pop';
    const result = parseCSV(csv);
    expect(result.rows[0][0]).toBe('Song, The Great');
    expect(result.rows[0][1]).toBe('pop');
  });

  it('handles quoted fields containing double quotes (escaped)', () => {
    const csv = 'name,desc\n"""Quoted""",normal';
    const result = parseCSV(csv);
    expect(result.rows[0][0]).toBe('"Quoted"');
  });

  it('handles quoted fields containing newlines', () => {
    const csv = 'name,desc\n"line1\nline2",val';
    const result = parseCSV(csv);
    expect(result.rows[0][0]).toBe('line1\nline2');
    expect(result.rows[0][1]).toBe('val');
  });

  it('handles empty fields', () => {
    const csv = 'a,b,c\n,val,\nval,,val';
    const result = parseCSV(csv);
    expect(result.rows[0]).toEqual(['', 'val', '']);
    expect(result.rows[1]).toEqual(['val', '', 'val']);
  });

  it('returns empty headers and rows for empty input', () => {
    const result = parseCSV('');
    expect(result.headers).toEqual([]);
    expect(result.rows).toEqual([]);
  });

  it('filters out blank rows', () => {
    const csv = 'a,b\nval1,val2\n,\nval3,val4';
    const result = parseCSV(csv);
    expect(result.rows).toHaveLength(2);
  });

  it('accepts explicit delimiter parameter', () => {
    const csv = 'a|b\nval1|val2';
    const result = parseCSV(csv, '|');
    expect(result.headers).toEqual(['a', 'b']);
    expect(result.rows[0]).toEqual(['val1', 'val2']);
  });

  it('handles CRLF line endings', () => {
    const csv = 'a,b\r\nval1,val2\r\nval3,val4';
    const result = parseCSV(csv);
    expect(result.rows).toHaveLength(2);
    expect(result.rows[0]).toEqual(['val1', 'val2']);
  });
});

describe('serializeCSV', () => {
  it('serializes headers and rows to CSV string', () => {
    const result = serializeCSV(['name', 'artist'], [['Song1', 'Artist1']]);
    expect(result).toBe('name,artist\nSong1,Artist1');
  });

  it('uses custom delimiter', () => {
    const result = serializeCSV(['a', 'b'], [['1', '2']], '\t');
    expect(result).toBe('a\tb\n1\t2');
  });

  it('quotes fields containing the delimiter', () => {
    const result = serializeCSV(['name'], [['Song, Great']]);
    expect(result).toBe('name\n"Song, Great"');
  });

  it('quotes fields containing double quotes and escapes them', () => {
    const result = serializeCSV(['name'], [['"Quoted"']]);
    expect(result).toBe('name\n"""Quoted"""');
  });

  it('quotes fields containing newlines', () => {
    const result = serializeCSV(['name'], [['line1\nline2']]);
    expect(result).toBe('name\n"line1\nline2"');
  });

  it('handles multiple rows', () => {
    const result = serializeCSV(['a'], [['1'], ['2'], ['3']]);
    expect(result).toBe('a\n1\n2\n3');
  });
});

describe('parseCSV and serializeCSV round-trip', () => {
  it('round-trips simple data', () => {
    const headers = ['name', 'artist', 'lang'];
    const rows = [
      ['Song A', 'Artist A', '国语'],
      ['Song B', 'Artist B', '英语'],
    ];
    const csv = serializeCSV(headers, rows);
    const parsed = parseCSV(csv);
    expect(parsed.headers).toEqual(headers);
    expect(parsed.rows).toEqual(rows);
  });

  it('round-trips data with special characters', () => {
    const headers = ['name', 'desc'];
    const rows = [
      ['Song, "Great"', 'line1\nline2'],
      ['Normal', 'value'],
    ];
    const csv = serializeCSV(headers, rows);
    const parsed = parseCSV(csv);
    expect(parsed.headers).toEqual(headers);
    expect(parsed.rows).toEqual(rows);
  });
});

describe('songsToCsvRows', () => {
  const makeSong = (overrides: Partial<Song> = {}): Song => ({
    id: 1,
    song_name: 'Test Song',
    artist: 'Test Artist',
    language: '国语',
    tags: 'pop, rock',
    cover_url: '',
    notes: 'some notes',
    sort_weight: 0,
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
    likes: 0,
    pinyin_name: 'testsong',
    pinyin_artist: 'testartist',
    initials_name: 'ts',
    initials_artist: 'ta',
    ...overrides,
  });

  it('returns Chinese headers', () => {
    const { headers } = songsToCsvRows([]);
    expect(headers).toEqual(['歌曲名称', '歌手', '语言', '分类标签', '备注']);
  });

  it('converts Song array to rows', () => {
    const songs = [makeSong({ song_name: 'MySong', artist: 'MyArtist', language: '英语', tags: 'pop, rock', notes: 'note' })];
    const { rows } = songsToCsvRows(songs);
    expect(rows).toHaveLength(1);
    expect(rows[0][0]).toBe('MySong');
    expect(rows[0][1]).toBe('MyArtist');
    expect(rows[0][2]).toBe('英语');
    expect(rows[0][4]).toBe('note');
  });

  it('joins tags with pipe separator', () => {
    const songs = [makeSong({ tags: 'pop, rock, ballad' })];
    const { rows } = songsToCsvRows(songs);
    expect(rows[0][3]).toBe('pop|rock|ballad');
  });

  it('handles empty tags', () => {
    const songs = [makeSong({ tags: '' })];
    const { rows } = songsToCsvRows(songs);
    expect(rows[0][3]).toBe('');
  });

  it('handles multiple songs', () => {
    const songs = [makeSong({ id: 1 }), makeSong({ id: 2 })];
    const { rows } = songsToCsvRows(songs);
    expect(rows).toHaveLength(2);
  });
});

describe('csvRowsToSongInputs', () => {
  const chineseHeaders = ['歌曲名称', '歌手', '语言', '分类标签', '备注'];

  it('maps Chinese headers to SongInput fields', () => {
    const rows = [['MySong', 'MyArtist', '国语', 'pop|rock', 'notes']];
    const inputs = csvRowsToSongInputs(chineseHeaders, rows);
    expect(inputs).toHaveLength(1);
    expect(inputs[0].song_name).toBe('MySong');
    expect(inputs[0].artist).toBe('MyArtist');
    expect(inputs[0].language).toBe('国语');
    expect(inputs[0].notes).toBe('notes');
  });

  it('splits tags by pipe separator', () => {
    const rows = [['Song', 'Artist', '国语', 'pop|rock|ballad', '']];
    const inputs = csvRowsToSongInputs(chineseHeaders, rows);
    expect(inputs[0].tags).toEqual(['pop', 'rock', 'ballad']);
  });

  it('handles empty tags string', () => {
    const rows = [['Song', 'Artist', '国语', '', '']];
    const inputs = csvRowsToSongInputs(chineseHeaders, rows);
    expect(inputs[0].tags).toEqual([]);
  });

  it('trims whitespace from values', () => {
    const rows = [['  Song  ', ' Artist ', '国语', ' pop | rock ', 'notes']];
    const inputs = csvRowsToSongInputs(chineseHeaders, rows);
    expect(inputs[0].song_name).toBe('Song');
    expect(inputs[0].artist).toBe('Artist');
    expect(inputs[0].tags).toEqual(['pop', 'rock']);
  });

  it('handles missing columns gracefully', () => {
    const headers = ['歌曲名称', '歌手'];
    const rows = [['Song', 'Artist']];
    const inputs = csvRowsToSongInputs(headers, rows);
    expect(inputs[0].song_name).toBe('Song');
    expect(inputs[0].artist).toBe('Artist');
    expect(inputs[0].language).toBe('');
    expect(inputs[0].tags).toEqual([]);
    expect(inputs[0].notes).toBe('');
  });

  it('handles multiple rows', () => {
    const rows = [
      ['Song1', 'Artist1', '国语', 'pop', ''],
      ['Song2', 'Artist2', '英语', 'rock', 'great'],
    ];
    const inputs = csvRowsToSongInputs(chineseHeaders, rows);
    expect(inputs).toHaveLength(2);
    expect(inputs[0].song_name).toBe('Song1');
    expect(inputs[1].song_name).toBe('Song2');
  });

  it('ignores unrecognized headers', () => {
    const headers = ['歌曲名称', '未知列', '歌手'];
    const rows = [['Song', 'ignored', 'Artist']];
    const inputs = csvRowsToSongInputs(headers, rows);
    expect(inputs[0].song_name).toBe('Song');
    expect(inputs[0].artist).toBe('Artist');
  });
});

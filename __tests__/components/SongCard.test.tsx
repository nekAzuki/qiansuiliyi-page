import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import SongCard from '@/components/home/SongCard';
import type { Song } from '@/types';

// Mock the LikeButton component to avoid hook dependency
vi.mock('@/components/home/LikeButton', () => ({
  default: ({ songId, initialCount }: { songId: number; initialCount: number }) => (
    <button data-testid="like-button">
      <span data-testid="like-count">{initialCount}</span>
    </button>
  ),
}));

// Mock navigator.clipboard
Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn().mockResolvedValue(undefined),
  },
});

function makeSong(overrides: Partial<Song> = {}): Song {
  return {
    id: 1,
    song_name: 'Test Song',
    artist: 'Test Artist',
    language: '国语',
    tags: 'pop, rock',
    cover_url: '',
    notes: '',
    sort_weight: 0,
    created_at: '2024-06-15T00:00:00Z',
    updated_at: '2024-06-15T00:00:00Z',
    likes: 42,
    pinyin_name: 'testsong',
    pinyin_artist: 'testartist',
    initials_name: 'ts',
    initials_artist: 'ta',
    ...overrides,
  };
}

describe('SongCard', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders song name', () => {
    render(<SongCard song={makeSong()} onCopy={vi.fn()} />);
    expect(screen.getByText('Test Song')).toBeInTheDocument();
  });

  it('renders artist name', () => {
    render(<SongCard song={makeSong({ artist: 'Jay Chou' })} onCopy={vi.fn()} />);
    expect(screen.getByText('Jay Chou')).toBeInTheDocument();
  });

  it('renders language tag', () => {
    render(<SongCard song={makeSong({ language: '英语' })} onCopy={vi.fn()} />);
    expect(screen.getByText('英语')).toBeInTheDocument();
  });

  it('renders like count', () => {
    render(<SongCard song={makeSong({ likes: 99 })} onCopy={vi.fn()} />);
    expect(screen.getByTestId('like-count').textContent).toBe('99');
  });

  it('renders tags as separate badges', () => {
    render(<SongCard song={makeSong({ tags: 'pop, rock, ballad' })} onCopy={vi.fn()} />);
    expect(screen.getByText('pop')).toBeInTheDocument();
    expect(screen.getByText('rock')).toBeInTheDocument();
    expect(screen.getByText('ballad')).toBeInTheDocument();
  });

  it('calls onCopy when song name button is clicked', async () => {
    const onCopy = vi.fn();
    render(<SongCard song={makeSong({ song_name: 'Copy Me' })} onCopy={onCopy} />);
    const button = screen.getByText('Copy Me');
    await fireEvent.click(button);
    expect(onCopy).toHaveBeenCalledWith('Copy Me');
  });

  it('renders cover image when cover_url is provided', () => {
    render(<SongCard song={makeSong({ cover_url: 'https://example.com/cover.jpg' })} onCopy={vi.fn()} />);
    const img = screen.getByAltText('Test Song');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', 'https://example.com/cover.jpg');
  });

  it('renders placeholder when cover_url is empty', () => {
    render(<SongCard song={makeSong({ cover_url: '' })} onCopy={vi.fn()} />);
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('does not render language tag when language is empty', () => {
    const { container } = render(<SongCard song={makeSong({ language: '' })} onCopy={vi.fn()} />);
    // The language span uses specific classes; with empty language, it should not render
    const languageBadges = container.querySelectorAll('.bg-primary-100');
    expect(languageBadges).toHaveLength(0);
  });

  it('handles empty tags string', () => {
    const { container } = render(<SongCard song={makeSong({ tags: '' })} onCopy={vi.fn()} />);
    const tagBadges = container.querySelectorAll('.bg-gray-100');
    expect(tagBadges).toHaveLength(0);
  });
});

import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import SearchBar from '@/components/home/SearchBar';

describe('SearchBar', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders with placeholder text', () => {
    render(<SearchBar value="" onChange={vi.fn()} />);
    const input = screen.getByPlaceholderText('搜索歌曲名或歌手（支持拼音）');
    expect(input).toBeInTheDocument();
  });

  it('renders with the provided value', () => {
    render(<SearchBar value="test query" onChange={vi.fn()} />);
    const input = screen.getByDisplayValue('test query');
    expect(input).toBeInTheDocument();
  });

  it('calls onChange when user types', () => {
    const onChange = vi.fn();
    render(<SearchBar value="" onChange={onChange} />);
    const input = screen.getByPlaceholderText('搜索歌曲名或歌手（支持拼音）');
    fireEvent.change(input, { target: { value: 'new value' } });
    expect(onChange).toHaveBeenCalledWith('new value');
  });

  it('does not show clear button when value is empty', () => {
    const { container } = render(<SearchBar value="" onChange={vi.fn()} />);
    const buttons = container.querySelectorAll('button');
    expect(buttons).toHaveLength(0);
  });

  it('shows clear button when value is not empty', () => {
    const { container } = render(<SearchBar value="something" onChange={vi.fn()} />);
    const buttons = container.querySelectorAll('button');
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('calls onChange with empty string when clear button is clicked', () => {
    const onChange = vi.fn();
    const { container } = render(<SearchBar value="query" onChange={onChange} />);
    const button = container.querySelector('button');
    expect(button).not.toBeNull();
    fireEvent.click(button!);
    expect(onChange).toHaveBeenCalledWith('');
  });

  it('renders as a text input', () => {
    render(<SearchBar value="" onChange={vi.fn()} />);
    const input = screen.getByPlaceholderText('搜索歌曲名或歌手（支持拼音）');
    expect(input).toHaveAttribute('type', 'text');
  });
});

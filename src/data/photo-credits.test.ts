import { describe, expect, it } from 'vitest';
import {
  parseCredits,
  reconcileCredits,
  renderCredits,
  summarizeCredits,
  type CreditRow,
} from './photo-credits';

const sample = `# Image credits

Notes.

| File | Photographer | Source link |
| ---- | ------------ | ----------- |
| \`nile-low-ivory-1.jpg\` | Jane Doe | https://unsplash.com/photos/abc |
| \`nile-low-ivory-2.jpg\` | pending | pending |
`;

describe('photo credits', () => {
  it('reads the intro and the rows', () => {
    const parsed = parseCredits(sample);
    expect(parsed.intro).toBe('# Image credits\n\nNotes.');
    expect(parsed.rows).toEqual([
      {
        file: 'nile-low-ivory-1.jpg',
        photographer: 'Jane Doe',
        link: 'https://unsplash.com/photos/abc',
      },
      { file: 'nile-low-ivory-2.jpg', photographer: 'pending', link: 'pending' },
    ]);
  });

  it('keeps filled rows, adds missing photos as pending and drops rows for deleted photos', () => {
    const { rows } = parseCredits(sample);
    const result = reconcileCredits(['nile-low-ivory-1.jpg', 'dune-court-sand-1.jpg'], rows);
    expect(result.added).toEqual(['dune-court-sand-1.jpg']);
    expect(result.removed).toEqual(['nile-low-ivory-2.jpg']);
    expect(result.rows.map((r) => r.file)).toEqual([
      'dune-court-sand-1.jpg',
      'nile-low-ivory-1.jpg',
    ]);
    expect(result.rows[1]?.photographer).toBe('Jane Doe');
  });

  it('counts pending rows and flags links that are not Unsplash or Pexels', () => {
    const rows: CreditRow[] = [
      { file: 'a.jpg', photographer: 'A', link: 'https://www.pexels.com/photo/x/' },
      { file: 'b.jpg', photographer: 'pending', link: 'pending' },
      { file: 'c.jpg', photographer: 'C', link: 'https://example.com/c' },
    ];
    expect(summarizeCredits(rows)).toEqual({
      total: 3,
      pending: 1,
      generated: 0,
      unexpectedLinks: ['c.jpg'],
    });
  });

  it('treats AI-generated rows as complete, whatever their link says', () => {
    const rows: CreditRow[] = [
      { file: 'a.jpg', photographer: 'AI-generated', link: 'n/a' },
      { file: 'b.jpg', photographer: 'AI generated (colour variation of a-1)', link: 'pending' },
      { file: 'c.jpg', photographer: 'pending', link: 'pending' },
    ];
    expect(summarizeCredits(rows)).toEqual({
      total: 3,
      pending: 1,
      generated: 2,
      unexpectedLinks: [],
    });
  });

  it('writes a table that parses back to the same rows', () => {
    const { intro, rows } = parseCredits(sample);
    expect(parseCredits(renderCredits(intro, rows))).toEqual({ intro, rows });
  });

  it('aligns the table by display width, so wide (CJK) names pass Prettier', () => {
    const rows: CreditRow[] = [
      { file: 'a.jpg', photographer: '丹 师', link: 'https://www.pexels.com/photo/x-1/' },
      { file: 'b.jpg', photographer: 'Ann', link: 'https://www.pexels.com/photo/y-2/' },
    ];
    const lines = renderCredits('# T', rows).split('\n');
    expect(lines[4]).toBe('| `a.jpg` | 丹 师        | https://www.pexels.com/photo/x-1/ |');
    expect(lines[5]).toBe('| `b.jpg` | Ann          | https://www.pexels.com/photo/y-2/ |');
  });
});

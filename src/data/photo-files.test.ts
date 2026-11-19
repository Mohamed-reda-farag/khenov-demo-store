import { describe, expect, it } from 'vitest';
import {
  buildManifest,
  colorsWithoutPhotos,
  groupPhotos,
  parsePhotoFileName,
  type PhotoNaming,
} from './photo-files';

const naming: PhotoNaming = {
  products: [
    { slug: 'nile-low', colorIds: ['ivory', 'sand'] },
    { slug: 'dune-court', colorIds: ['sand', 'black', 'ivory'] },
  ],
  legacyColors: { 'nile-low': 'ivory', 'dune-court': 'sand' },
  knownColorIds: new Set(['ivory', 'sand', 'black', 'olive']),
};

describe('parsePhotoFileName', () => {
  it('reads the colour scheme <slug>-<colorId>-<n>', () => {
    expect(parsePhotoFileName('nile-low-sand-2.jpg', naming)).toEqual({
      kind: 'ok',
      slug: 'nile-low',
      colorId: 'sand',
      index: 2,
      legacy: false,
    });
  });

  it('reads the legacy scheme <slug>-<n> as the photographed colour', () => {
    expect(parsePhotoFileName('dune-court-1.JPG', naming)).toEqual({
      kind: 'ok',
      slug: 'dune-court',
      colorId: 'sand',
      index: 1,
      legacy: true,
    });
  });

  it('flags a colour the product does not offer, and tells a known colour from an invented one', () => {
    expect(parsePhotoFileName('nile-low-black-1.jpg', naming)).toMatchObject({
      kind: 'unknown-color',
      knownElsewhere: true,
    });
    expect(parsePhotoFileName('nile-low-brown-1.jpg', naming)).toMatchObject({
      kind: 'unknown-color',
      knownElsewhere: false,
    });
  });

  it('flags files that match no product or follow no scheme', () => {
    expect(parsePhotoFileName('mystery-shoe-ivory-1.jpg', naming).kind).toBe('unknown-product');
    expect(parsePhotoFileName('nile-low-ivory.jpg', naming).kind).toBe('invalid-name');
    expect(parsePhotoFileName('cover.jpg', naming).kind).toBe('invalid-name');
    expect(parsePhotoFileName('nile-low-ivory-0.jpg', naming).kind).toBe('invalid-index');
    expect(parsePhotoFileName('nile-low-ivory-7.jpg', naming).kind).toBe('invalid-index');
  });
});

describe('groupPhotos and buildManifest', () => {
  it('groups by product and colour and counts the contiguous run', () => {
    const { groups, problems } = groupPhotos(
      [
        'nile-low-ivory-1.jpg',
        'nile-low-ivory-2.jpg',
        'nile-low-sand-1.jpg',
        'dune-court-black-1.jpg',
      ],
      naming,
    );
    expect(problems).toEqual([]);
    expect(buildManifest(groups).manifest).toEqual({
      'dune-court': { black: 1 },
      'nile-low': { ivory: 2, sand: 1 },
    });
  });

  it('maps legacy files onto the photographed colour, and the explicit name wins a clash', () => {
    const { groups, problems } = groupPhotos(['nile-low-1.jpg', 'nile-low-ivory-1.jpg'], naming);
    expect(buildManifest(groups).manifest).toEqual({ 'nile-low': { ivory: 1 } });
    expect(problems.join()).toMatch(/names the colour explicitly/);
  });

  it('keeps the first of two files with the same name and reports the other', () => {
    const { groups, problems } = groupPhotos(
      ['nile-low-sand-1.jpg', 'nile-low-sand-1.png'],
      naming,
    );
    expect(buildManifest(groups).manifest).toEqual({ 'nile-low': { sand: 1 } });
    expect(problems).toHaveLength(1);
  });

  it('stops at a gap in the numbering and reports it', () => {
    const { groups } = groupPhotos(['nile-low-sand-1.jpg', 'nile-low-sand-3.jpg'], naming);
    const { manifest, problems } = buildManifest(groups);
    expect(manifest).toEqual({ 'nile-low': { sand: 1 } });
    expect(problems[0]).toMatch(/without gaps/);
  });

  it('drops a colour whose numbering does not start at 1', () => {
    const { groups } = groupPhotos(['nile-low-sand-2.jpg'], naming);
    expect(buildManifest(groups).manifest).toEqual({});
  });

  it('reports unrecognised files instead of throwing', () => {
    const { groups, problems } = groupPhotos(
      ['nile-low-brown-1.jpg', 'x.jpg', 'nile-low-ivory-1.jpg'],
      naming,
    );
    expect(problems).toHaveLength(2);
    expect(buildManifest(groups).manifest).toEqual({ 'nile-low': { ivory: 1 } });
  });
});

describe('colorsWithoutPhotos', () => {
  it('lists every product colour that has no photos', () => {
    expect(colorsWithoutPhotos(naming.products, { 'nile-low': { ivory: 1 } })).toEqual([
      { slug: 'nile-low', colorId: 'sand' },
      { slug: 'dune-court', colorId: 'sand' },
      { slug: 'dune-court', colorId: 'black' },
      { slug: 'dune-court', colorId: 'ivory' },
    ]);
  });
});

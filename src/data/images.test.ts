import { describe, expect, it } from 'vitest';
import {
  firstPhotoColorId,
  galleryColorId,
  parseManifest,
  photoColorFor,
  photoCount,
  photoSrc,
} from './images';

const product = {
  slug: 'nile-low',
  colors: [{ id: 'ivory' }, { id: 'sand' }, { id: 'black' }],
};

describe('parseManifest', () => {
  it('keeps well-formed entries', () => {
    expect(parseManifest({ 'nile-low': { ivory: 3, sand: 1 } })).toEqual({
      'nile-low': { ivory: 3, sand: 1 },
    });
  });

  it('ignores the old shape (slug → count), junk and non-positive counts', () => {
    expect(parseManifest({ 'nile-low': 3, a: { x: 0, y: -1, z: 1.5, w: '2' }, b: null })).toEqual(
      {},
    );
    expect(parseManifest(null)).toEqual({});
    expect(parseManifest([1, 2])).toEqual({});
  });
});

describe('photo lookups', () => {
  const manifest = parseManifest({ 'nile-low': { sand: 2, ivory: 1 } });

  it('counts photos per colour and builds paths without extension', () => {
    expect(photoCount('nile-low', 'sand', manifest)).toBe(2);
    expect(photoCount('nile-low', 'black', manifest)).toBe(0);
    expect(photoCount('unknown', 'sand', manifest)).toBe(0);
    expect(photoSrc('nile-low', 'sand', 1)).toBe('/images/products/nile-low/sand-2');
  });

  it('shows the selected colour when it has photos, else the first colour that does', () => {
    expect(galleryColorId(product, 'sand', manifest)).toBe('sand');
    expect(galleryColorId(product, 'black', manifest)).toBe('ivory');
    expect(galleryColorId(product, 'black', {})).toBeUndefined();
  });

  it('takes a line photo from its colour, else from any colour that has photos', () => {
    expect(photoColorFor('nile-low', 'sand', manifest)).toBe('sand');
    expect(photoColorFor('nile-low', 'black', manifest)).toBe('ivory');
    expect(photoColorFor('other', 'black', manifest)).toBeUndefined();
  });

  it('picks a stable colour for tiles without colour context', () => {
    expect(firstPhotoColorId('nile-low', manifest)).toBe('ivory');
    expect(firstPhotoColorId('other', manifest)).toBeUndefined();
  });
});

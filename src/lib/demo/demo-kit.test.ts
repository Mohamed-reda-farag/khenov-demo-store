// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NAMESPACE, SEED_VERSION } from './config';
import { setFlagsForTest, failNext } from './flags';
import { delay, DemoNetworkError, simulateNetwork } from './network';
import { ensureSeeded, onDemoReset, registerSeeder, resetDemo } from './seed';
import { createStorage, prefsStorage, purgeStaleVersions, storage } from './storage';

beforeEach(() => {
  window.localStorage.clear();
  window.sessionStorage.clear();
  setFlagsForTest([]);
});

describe('storage', () => {
  it('namespaces keys as khenov-demo:<app>:v<version>', () => {
    expect(NAMESPACE).toBe(`khenov-demo:atar:v${SEED_VERSION}`);
    storage.set('cart', [1, 2]);
    expect(window.localStorage.getItem(`${NAMESPACE}:cart`)).toBe('[1,2]');
    expect(storage.get('cart', [])).toEqual([1, 2]);
  });

  it('returns the fallback for missing or corrupted values', () => {
    expect(storage.get('missing', 'fallback')).toBe('fallback');
    window.localStorage.setItem(`${NAMESPACE}:broken`, '{not json');
    expect(storage.get('broken', 'safe')).toBe('safe');
  });

  it('clear() removes only this namespace', () => {
    storage.set('a', 1);
    window.localStorage.setItem('unrelated', 'keep');
    storage.clear();
    expect(storage.keys()).toEqual([]);
    expect(window.localStorage.getItem('unrelated')).toBe('keep');
  });

  it('falls back to memory when the backing store throws', () => {
    const broken = {
      length: 0,
      key: () => null,
      getItem: () => {
        throw new Error('blocked');
      },
      setItem: () => {
        throw new Error('quota');
      },
      removeItem: () => {
        throw new Error('blocked');
      },
    };
    const safe = createStorage('test:ns', broken);
    expect(safe.set('k', { ok: true })).toBe(false);
    expect(safe.get('k', null)).toEqual({ ok: true });
    expect(() => safe.remove('k')).not.toThrow();
    expect(() => safe.clear()).not.toThrow();
  });

  it('purges data from other seed versions but keeps the current one and unrelated keys', () => {
    window.localStorage.setItem('khenov-demo:atar:v0:cart', '[]');
    window.localStorage.setItem(`${NAMESPACE}:cart`, '[]');
    window.localStorage.setItem('khenov-demo:other-app:v1:cart', '[]');
    expect(purgeStaleVersions()).toBe(1);
    expect(window.localStorage.getItem('khenov-demo:atar:v0:cart')).toBeNull();
    expect(window.localStorage.getItem(`${NAMESPACE}:cart`)).toBe('[]');
    expect(window.localStorage.getItem('khenov-demo:other-app:v1:cart')).toBe('[]');
  });

  it('keeps preferences outside the versioned namespace so reset never flips the language', () => {
    prefsStorage.set('locale', 'en');
    storage.clear();
    expect(prefsStorage.get('locale')).toBe('en');
  });
});

describe('network simulation', () => {
  it('delay() waits roughly within its range', async () => {
    vi.useFakeTimers();
    let done = false;
    void delay(200, 600).then(() => {
      done = true;
    });
    await vi.advanceTimersByTimeAsync(199);
    expect(done).toBe(false);
    await vi.advanceTimersByTimeAsync(402);
    expect(done).toBe(true);
    vi.useRealTimers();
  });

  it('delay() is instant in fast mode', async () => {
    setFlagsForTest(['fast']);
    const start = Date.now();
    await delay(5000, 6000);
    expect(Date.now() - start).toBeLessThan(100);
  });

  it('simulateNetwork() fails with ?demo=error, and once with failNext()', async () => {
    setFlagsForTest(['fast', 'error']);
    await expect(simulateNetwork()).rejects.toBeInstanceOf(DemoNetworkError);

    setFlagsForTest(['fast']);
    failNext();
    await expect(simulateNetwork()).rejects.toBeInstanceOf(DemoNetworkError);
    await expect(simulateNetwork()).resolves.toBeUndefined();
  });
});

describe('seeding and reset', () => {
  it('runs seeders once per seed version and again after resetDemo()', () => {
    const seeder = vi.fn(() => storage.set('seeded', true));
    registerSeeder(seeder);

    ensureSeeded();
    expect(seeder).toHaveBeenCalledTimes(1);
    ensureSeeded();
    expect(seeder).toHaveBeenCalledTimes(1);

    window.localStorage.setItem(
      `${NAMESPACE}:meta`,
      JSON.stringify({ seedVersion: SEED_VERSION - 1, seededAt: 'x' }),
    );
    ensureSeeded();
    expect(seeder).toHaveBeenCalledTimes(2);

    const listener = vi.fn();
    const off = onDemoReset(listener);
    storage.set('user-data', 'dirty');
    resetDemo();
    expect(storage.get('user-data', null)).toBeNull();
    expect(storage.get('seeded', false)).toBe(true);
    expect(seeder).toHaveBeenCalledTimes(3);
    expect(listener).toHaveBeenCalledTimes(1);
    off();
  });
});

// @vitest-environment jsdom
import { act, useEffect } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { setFlagsForTest } from '@/lib/demo/flags';
import { useAsync, type AsyncState } from './useAsync';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let root: Root;
let host: HTMLDivElement;

const seen: { state: AsyncState<string> | null } = { state: null };
const latest = (): AsyncState<string> => {
  if (!seen.state) throw new Error('Probe has not rendered');
  return seen.state;
};

function Probe({
  id,
  load,
  initial,
}: {
  id: string;
  load: () => Promise<string>;
  initial?: string;
}) {
  const state = useAsync(id, load, initial);
  useEffect(() => {
    seen.state = state;
  });
  return null;
}

const render = async (props: Parameters<typeof Probe>[0]) => {
  await act(async () => {
    root.render(<Probe {...props} />);
  });
};

beforeEach(() => {
  setFlagsForTest([]);
  host = document.createElement('div');
  root = createRoot(host);
});

afterEach(async () => {
  await act(async () => root.unmount());
});

describe('useAsync with static initial data', () => {
  it('answers the first key from `initial` without calling load', async () => {
    const load = vi.fn(() => Promise.resolve('loaded'));
    await render({ id: 'a', load, initial: 'static' });
    expect(latest()).toMatchObject({ status: 'success', data: 'static' });
    expect(load).not.toHaveBeenCalled();
  });

  it('loads normally when the key changes, keeping the old data visible meanwhile', async () => {
    let resolve: (value: string) => void = () => undefined;
    const load = vi.fn(() => new Promise<string>((r) => (resolve = r)));
    await render({ id: 'a', load, initial: 'static' });
    await render({ id: 'b', load, initial: 'static' });
    expect(latest()).toMatchObject({ status: 'loading', previous: 'static' });
    expect(load).toHaveBeenCalledTimes(1);
    await act(async () => resolve('fresh'));
    expect(latest()).toMatchObject({ status: 'success', data: 'fresh' });
  });

  it('ignores `initial` while ?demo=error is active so error states stay reachable', async () => {
    setFlagsForTest(['error']);
    const load = vi.fn(() => Promise.reject(new Error('demo')));
    await render({ id: 'a', load, initial: 'static' });
    expect(load).toHaveBeenCalledTimes(1);
    expect(latest().status).toBe('error');
  });

  it('without `initial` starts in loading and then succeeds', async () => {
    const load = vi.fn(() => Promise.resolve('loaded'));
    await render({ id: 'a', load });
    expect(latest()).toMatchObject({ status: 'success', data: 'loaded' });
    expect(load).toHaveBeenCalledTimes(1);
  });
});

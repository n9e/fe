/** @jest-environment jsdom */

jest.mock('@/utils', () => ({ copy2ClipBoard: jest.fn(() => true) }));
const mockMode = { isEnt: false };
jest.mock('@/utils/constant', () => ({
  get IS_ENT() {
    return mockMode.isEnt;
  },
}));

import { aiChatShareQueryKey, aiChatShareReadonlyQueryKey, buildAiChatShareUrl } from './share';

describe('buildAiChatShareUrl', () => {
  beforeEach(() => {
    mockMode.isEnt = false;
  });

  it('uses the Nightingale AI page outside ENT while preserving the current query parameters', () => {
    window.history.replaceState(null, '', '/log/explorer?datasource_id=7');

    const url = new URL(buildAiChatShareUrl('share-chat'));

    expect(url.pathname).toBe('/nightingale-ai');
    expect(url.searchParams.get('datasource_id')).toBe('7');
    expect(url.searchParams.get(aiChatShareQueryKey)).toBe('share-chat');
    expect(url.searchParams.get(aiChatShareReadonlyQueryKey)).toBe('1');
  });

  it('uses the FlashAI page in ENT', () => {
    mockMode.isEnt = true;

    const url = new URL(buildAiChatShareUrl('share-chat'));

    expect(url.pathname).toBe('/flashai');
    expect(url.searchParams.get(aiChatShareQueryKey)).toBe('share-chat');
    expect(url.searchParams.get(aiChatShareReadonlyQueryKey)).toBe('1');
  });
});

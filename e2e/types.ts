import type { PlayWrightAiFixtureType } from '@midscene/web/playwright';

type AiFixtureKeys = 'aiAssert' | 'aiInput' | 'aiScroll' | 'aiTap' | 'aiWaitFor';

export type MidsceneFixtureMethods = Pick<PlayWrightAiFixtureType, AiFixtureKeys>;

export type AiAssert = MidsceneFixtureMethods['aiAssert'];
export type AiScroll = MidsceneFixtureMethods['aiScroll'];
export type AiTap = MidsceneFixtureMethods['aiTap'];
export type AiWaitFor = MidsceneFixtureMethods['aiWaitFor'];

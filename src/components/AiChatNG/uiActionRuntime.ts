import { createDomFeedback, getSharedActionRuntime } from '@flashcatcloud/ai-kit/actions';

/**
 * The one UI-action registry this app has.
 *
 * A module singleton rather than a React context, because the two halves live
 * in different parts of the tree and neither can own the other: pages register
 * their actions on mount, while the chat panel that executes them is rendered
 * once at the app root and re-parented into a drawer or a floating panel
 * through a portal. A shared provider would have to sit above both and stay
 * mounted across every navigation — which is just a module-level value wearing
 * a hook.
 *
 * Actions are registered by the page and disposed on unmount, so "the user
 * navigated away mid-conversation" answers itself: the call finds nothing
 * registered and comes back as `unsupported` instead of writing into a form
 * that is no longer on screen.
 *
 * Shared across bundles, not just across this one. The commercial build merges
 * this application with another that carries its own copy of this file and its
 * own chat surface; a module singleton per copy meant the page that registered
 * an action and the surface that executed it held two registries that never
 * met, and every call came back `unsupported`. The shared runtime is pinned to
 * the page, so both copies resolve to one registry.
 */
export const uiActionRuntime = getSharedActionRuntime({
  // Ring the target and glide a cursor onto it. Writing a form field takes a
  // millisecond, so without this an action is indistinguishable from the page
  // glitching.
  feedback: createDomFeedback(),
});

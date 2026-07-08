import { useCallback, useRef, useState } from 'react';
import { SectionItem } from '../components/SectionCard';

const TOP_OFFSET = 16; // gap between page-top-header bottom and card top
const VISIBLE_THRESHOLD = 100; // minimum px of visible card content to count as "active"

function getPageTopHeaderBottom(): number {
  const el = document.querySelector('.page-top-header');
  return el ? el.getBoundingClientRect().bottom : 0;
}

export interface UseScrollSyncReturn {
  containerRef: React.RefObject<HTMLDivElement>;
  sectionRefs: React.MutableRefObject<Record<string, HTMLDivElement | null>>;
  activeSection: string;
  sectionCollapsed: Record<string, boolean>;
  setSectionCollapsed: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  expandSignal: { key: string; ts: number } | null;
  toggleAllSignal: { action: 'expand' | 'collapse'; ts: number } | null;
  setToggleAllSignal: React.Dispatch<React.SetStateAction<{ action: 'expand' | 'collapse'; ts: number } | null>>;
  scrollToSection: (key: string) => void;
  handleScroll: () => void;
  handleUserScroll: () => void;
}

export default function useScrollSync(sections: SectionItem[]): UseScrollSyncReturn {
  const containerRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const userScrolledRef = useRef(true);

  const [activeSection, setActiveSection] = useState('basic');
  const [sectionCollapsed, setSectionCollapsed] = useState<Record<string, boolean>>({
    basic: false,
    datasource: false,
    rule: false,
    pipeline: true,
    notify: true,
    effective: true,
    advanced: true,
  });
  const [expandSignal, setExpandSignal] = useState<{ key: string; ts: number } | null>(null);
  const [toggleAllSignal, setToggleAllSignal] = useState<{ action: 'expand' | 'collapse'; ts: number } | null>(null);

  const scrollToSection = useCallback((key: string) => {
    const node = sectionRefs.current[key];
    if (!node || !containerRef.current) return;

    // Suppress scroll-based selection until user manually scrolls
    userScrolledRef.current = false;

    // Step 1: Expand the card first
    setSectionCollapsed((prev) => ({ ...prev, [key]: false }));
    setExpandSignal({ key, ts: Date.now() });
    setActiveSection(key);

    // Step 2: Wait for React to commit the expanded DOM, then scroll
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (!containerRef.current) return;
        const updatedNode = sectionRefs.current[key];
        if (!updatedNode) return;

        const pageTopHeaderBottom = getPageTopHeaderBottom();
        const rect = updatedNode.getBoundingClientRect();

        // Scroll so card top is at TOP_OFFSET below page-top-header
        const scrollTarget = containerRef.current.scrollTop + rect.top - pageTopHeaderBottom - TOP_OFFSET;

        containerRef.current.scrollTo({
          top: scrollTarget,
          behavior: 'smooth',
        });
      });
    });
  }, []);

  const handleScroll = useCallback(() => {
    const container = containerRef.current;
    if (!container || !userScrolledRef.current) return;

    const pageTopHeaderBottom = getPageTopHeaderBottom();
    const viewportBottom = pageTopHeaderBottom + window.innerHeight;

    // Among sections with > VISIBLE_THRESHOLD px visible, pick the one closest to the viewport top
    let currentSection: SectionItem | undefined;
    let minTop = Infinity;

    for (const item of sections) {
      const node = sectionRefs.current[item.key];
      if (!node) continue;
      const rect = node.getBoundingClientRect();
      const visibleHeight = Math.min(rect.bottom, viewportBottom) - Math.max(rect.top, pageTopHeaderBottom);
      if (visibleHeight > VISIBLE_THRESHOLD && rect.top < minTop) {
        minTop = rect.top;
        currentSection = item;
      }
    }

    if (currentSection && currentSection.key !== activeSection) {
      setActiveSection(currentSection.key);
    }
  }, [sections, activeSection]);

  const handleUserScroll = useCallback(() => {
    userScrolledRef.current = true;
  }, []);

  return {
    containerRef,
    sectionRefs,
    activeSection,
    sectionCollapsed,
    setSectionCollapsed,
    expandSignal,
    toggleAllSignal,
    setToggleAllSignal,
    scrollToSection,
    handleScroll,
    handleUserScroll,
  };
}

import { useCallback, useEffect, useState } from 'react';

/** How long a copy button says it copied. */
const COPIED_FOR_MS = 1600;

/** Copies text to the clipboard and says so for a moment; without clipboard access nothing happens. */
export function useCopy(): {
  readonly copied: boolean;
  readonly copy: (text: string) => Promise<void>;
} {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) {
      return;
    }
    const timer = setTimeout(() => setCopied(false), COPIED_FOR_MS);
    return () => clearTimeout(timer);
  }, [copied]);

  const copy = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch {
      // No clipboard access: the text stays selectable by hand.
    }
  }, []);

  return { copied, copy };
}

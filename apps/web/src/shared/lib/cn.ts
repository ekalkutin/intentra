import { createCn } from 'cn/config';

/**
 * `cn` that knows the type scale's role-named steps (`text-body`, `text-caption`).
 * Without them it files `text-<step>` under text colour and silently drops it
 * next to `text-muted-foreground`. Keep in sync with `--text-*` in tokens.css.
 * Vite aliases the bare `cn` import here, so generated shadcn components use it too.
 */
export const cn = createCn({
  extend: {
    classGroups: {
      'font-size': [
        {
          text: [
            'micro',
            'caption',
            'label',
            'body',
            'body-lg',
            'title-sm',
            'title',
            'title-lg',
            'display-sm',
            'display',
          ],
        },
      ],
    },
  },
});

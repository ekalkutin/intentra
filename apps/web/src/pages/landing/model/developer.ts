/** Who built Intentra, and where to reach them. */
export const DEVELOPER = {
  name: 'Evgenii Kalkutin',
  email: 'intentra@kalkutin.dev',
  links: [
    { id: 'telegram', label: 'Telegram', href: 'https://t.me/ekalkutin' },
    {
      id: 'linkedin',
      label: 'LinkedIn',
      href: 'https://www.linkedin.com/in/ekalkutin/',
    },
  ],
} as const;

export type SocialId = (typeof DEVELOPER.links)[number]['id'];

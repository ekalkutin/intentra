import { useEffect, useState } from 'react';

/** What the assistant is "doing" while it works; one is picked every few seconds. */
const PHRASES = [
  'Кумекаю',
  'Шуршу',
  'Размышляю',
  'Раскладываю по полочкам',
  'Шевелю извилинами',
  'Мозгую',
  'Чешу затылок',
  'Соображаю',
  'Листаю знания',
  'Завариваю мысль',
  'Разматываю клубок',
  'Складываю пазл',
  'Жонглирую фактами',
  'Колдую',
  'Перебираю варианты',
  'Взвешиваю за и против',
  'Точу карандаш',
  'Протираю очки',
  'Сдуваю пыль с решений',
  'Причёсываю формулировки',
  'Щёлкаю счётами',
  'Ворочаю мыслями',
  'Настраиваю антенну',
  'Гляжу в хрустальный шар',
  'Сверяюсь с глоссарием',
  'Ковыряюсь в требованиях',
  'Подбираю слова',
  'Думаю думу',
  'Навожу порядок',
  'Прикидываю, что к чему',
  'Собираю мысли в кучку',
  'Вспоминаю, о чём договорились',
];

/** A spinner of glyphs, bouncing back and forth, as in Claude Code. */
const GLYPHS = ['·', '✢', '✳', '✶', '✻', '✽', '✻', '✶', '✳', '✢'];

function pickOther(current: number): number {
  const next = Math.floor(Math.random() * (PHRASES.length - 1));
  return next >= current ? next + 1 : next;
}

/** Shown while the assistant works and has nothing to say yet. */
export function ThinkingStatus({ startedAt }: { startedAt: string }) {
  const [phrase, setPhrase] = useState(() =>
    Math.floor(Math.random() * PHRASES.length),
  );
  const [glyph, setGlyph] = useState(0);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const schedule = () => {
      timer = setTimeout(
        () => {
          setPhrase(pickOther);
          schedule();
        },
        3000 + Math.random() * 1000,
      );
    };
    schedule();
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const spin = setInterval(() => setGlyph(g => (g + 1) % GLYPHS.length), 120);
    const tick = setInterval(() => setNow(Date.now()), 1000);
    return () => {
      clearInterval(spin);
      clearInterval(tick);
    };
  }, []);

  const seconds = Math.max(
    0,
    Math.round((now - new Date(startedAt).getTime()) / 1000),
  );

  return (
    <div
      role='status'
      aria-live='polite'
      className='flex items-center gap-2 py-1 text-sm'
    >
      <span
        aria-hidden
        className='inline-block w-4 text-center text-base leading-none text-orange-500 dark:text-orange-400'
      >
        {GLYPHS[glyph]}
      </span>
      <span
        key={phrase}
        className='shimmer-text animate-in font-medium duration-300 fade-in slide-in-from-bottom-1'
      >
        {PHRASES[phrase]}…
      </span>
      <span className='text-xs text-muted-foreground tabular-nums'>
        {seconds} с · можно остановить
      </span>
    </div>
  );
}

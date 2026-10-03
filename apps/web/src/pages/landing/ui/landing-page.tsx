import {
  ArrowDown,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Check,
  CheckCheck,
  ChevronRight,
  Code2,
  FileText,
  GitBranch,
  Menu,
  MessageSquare,
  Pause,
  Play,
  RotateCcw,
  ScanLine,
  Users,
  X,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';

import { useHasSession } from '@/entities/session';
import { ROUTES } from '@/shared/config';
import { cn } from '@/shared/lib';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Badge,
  Button,
  buttonVariants,
} from '@/shared/ui';

import { ContextSculpture } from './context-sculpture';

const navigation = ['product', 'benefits', 'agents', 'faq'] as const;
const faqs = ['1', '2', '3', '4', '5', '6'] as const;

function Wordmark({ inverse = false }: { readonly inverse?: boolean }) {
  const { t } = useTranslation();
  return (
    <img
      className={cn('landing-wordmark', !inverse && 'landing-wordmark-dark')}
      src='/intentra-wordmark-inverse.svg'
      alt={t('brand')}
      width={854}
      height={173}
    />
  );
}

function StartLink({ closing = false }: { readonly closing?: boolean }) {
  const { t } = useTranslation();
  const signedIn = useHasSession();
  return (
    <Link
      to={signedIn ? ROUTES.home : ROUTES.signUp}
      className={cn(buttonVariants({ size: 'lg' }), 'landing-cta')}
    >
      {t(
        signedIn
          ? 'landing.workspace'
          : closing
            ? 'landing.closing.action'
            : 'landing.start',
      )}
      <ArrowUpRight data-icon='inline-end' />
    </Link>
  );
}

function ProductDemo() {
  const { t } = useTranslation();
  const [approved, setApproved] = useState(false);
  return (
    <div className='landing-demo'>
      <div className='landing-demo-bar'>
        <span>
          <span className='landing-demo-dot' />
          {t('landing.demoSection.project')}
        </span>
        <span>{t('landing.demoSection.label')}</span>
      </div>
      <div className='landing-demo-body'>
        <div className='landing-conversation'>
          <div className='landing-speaker'>
            <img src='/intentra-avatar.svg' width={28} height={28} alt='' />
            <span>{t('landing.demoSection.analyst')}</span>
          </div>
          <p className='landing-utterance'>
            {t('landing.demoSection.question')}
          </p>
          <p className='landing-analyst-question'>
            {t('landing.demoSection.reply')}
          </p>
          <div className='landing-answer'>
            <span>{t('landing.demoSection.user')}</span>
            <p>{t('landing.demoSection.answer')}</p>
          </div>
          <p className='landing-demo-result'>
            <GitBranch size={16} aria-hidden='true' />
            {t('landing.demoSection.result')}
          </p>
        </div>
        <div className={cn('landing-knowledge', approved && 'is-approved')}>
          <div className='landing-knowledge-top'>
            <code>BR-12</code>
            <Badge variant='secondary'>
              {approved && <Check data-icon='inline-start' />}
              {t(
                approved
                  ? 'landing.demoSection.approved'
                  : 'landing.demoSection.draft',
              )}
            </Badge>
          </div>
          <p className='landing-knowledge-kind'>
            {t('landing.demoSection.kind')}
          </p>
          <h3>{t('landing.demoSection.ruleTitle')}</h3>
          <p>{t('landing.demoSection.ruleText')}</p>
          <div className='landing-knowledge-source'>
            <MessageSquare size={14} aria-hidden='true' />
            {t('landing.demoSection.source')}
            <br />
            <GitBranch size={14} aria-hidden='true' />
            {t('landing.demoSection.link')}
          </div>
          <div className='landing-demo-action' aria-live='polite'>
            {approved && (
              <p className='landing-approved-note'>
                <CheckCheck size={18} aria-hidden='true' />
                {t('landing.demoSection.ready')}
              </p>
            )}
            <Button
              variant={approved ? 'outline' : 'default'}
              onClick={() => setApproved(!approved)}
            >
              {approved ? (
                <RotateCcw data-icon='inline-start' />
              ) : (
                <Check data-icon='inline-start' />
              )}
              {t(
                approved
                  ? 'landing.demoSection.reset'
                  : 'landing.demoSection.approve',
              )}
            </Button>
          </div>
        </div>
      </div>
      <div className='landing-demo-footer'>
        {t('landing.demoSection.footnote')}
        <CheckCheck size={18} aria-hidden='true' />
      </div>
    </div>
  );
}

export function LandingPage() {
  const { t } = useTranslation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    const previous = document.title;
    document.title = t('landing.title');
    const description = document.createElement('meta');
    description.name = 'description';
    description.content = t('landing.description');
    document.head.append(description);
    return () => {
      document.title = previous;
      description.remove();
    };
  }, [t]);
  useEffect(() => {
    if (!menuOpen) return;
    const close = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMenuOpen(false);
        document.getElementById('landing-menu-toggle')?.focus();
      }
    };
    document.addEventListener('keydown', close);
    return () => document.removeEventListener('keydown', close);
  }, [menuOpen]);

  return (
    <div className={cn('landing', paused && 'landing-paused')} id='top'>
      <a className='landing-skip' href='#main'>
        {t('landing.skip')}
      </a>
      <div className='landing-blue'>
        <header className='landing-header landing-wrap'>
          <a href='#top' aria-label={t('brand')}>
            <Wordmark inverse />
          </a>
          <nav
            className='landing-desktop-nav'
            aria-label={t('landing.nav.label')}
          >
            {navigation.map(item => (
              <a key={item} href={`#${item}`}>
                {t(`landing.nav.${item}`)}
              </a>
            ))}
          </nav>
          <div className='landing-header-actions'>
            <Link to={ROUTES.signIn} className='landing-login'>
              {t('landing.signIn')}
              <ArrowUpRight size={15} aria-hidden='true' />
            </Link>
            <Button
              id='landing-menu-toggle'
              className='landing-menu-toggle'
              variant='ghost'
              size='icon'
              aria-label={t(
                menuOpen ? 'landing.nav.close' : 'landing.nav.open',
              )}
              aria-expanded={menuOpen}
              aria-controls='landing-mobile-menu'
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <X /> : <Menu />}
            </Button>
          </div>
        </header>
        {menuOpen && (
          <nav
            id='landing-mobile-menu'
            className='landing-mobile-nav'
            aria-label={t('landing.nav.label')}
          >
            {navigation.map(item => (
              <a
                key={item}
                href={`#${item}`}
                onClick={() => setMenuOpen(false)}
              >
                {t(`landing.nav.${item}`)}
                <ArrowUpRight size={18} />
              </a>
            ))}
          </nav>
        )}
        <main id='main'>
          <section
            className='landing-hero landing-wrap'
            aria-labelledby='hero-title'
          >
            <div className='landing-hero-copy'>
              <h1 id='hero-title'>
                <span>{t('landing.hero.line1')}</span>
                <span>{t('landing.hero.line2')}</span>
              </h1>
              <p>{t('landing.hero.text')}</p>
              <div className='landing-hero-actions'>
                <StartLink />
                <a href='#product' className='landing-demo-link'>
                  <Play size={15} aria-hidden='true' />
                  {t('landing.demo')}
                </a>
              </div>
              <p className='landing-hero-note'>{t('landing.hero.note')}</p>
            </div>
            <div className='landing-hero-art'>
              <ContextSculpture paused={paused} />
              <span className='landing-fragment fragment-one'>
                {t('landing.hero.fragment1')}
              </span>
              <span className='landing-fragment fragment-two'>
                {t('landing.hero.fragment2')}
              </span>
              <span className='landing-fragment fragment-three'>
                {t('landing.hero.fragment3')}
              </span>
              <div className='landing-art-caption'>
                <span>{t('landing.hero.center')}</span>
                <span>{t('landing.hero.caption')}</span>
              </div>
              <Button
                className='landing-motion-toggle'
                variant='ghost'
                size='icon'
                aria-label={t(
                  paused ? 'landing.hero.play' : 'landing.hero.pause',
                )}
                aria-pressed={paused}
                onClick={() => setPaused(!paused)}
              >
                {paused ? <Play /> : <Pause />}
              </Button>
            </div>
            <a className='landing-scroll' href='#product'>
              <ArrowDown size={17} aria-hidden='true' />
              {t('landing.hero.scroll')}
            </a>
          </section>
          <div className='landing-partners landing-wrap'>
            <p>{t('landing.strip.text')}</p>
            <div>
              <span>
                <Users size={19} aria-hidden='true' />
                {t('landing.strip.team')}
              </span>
              <span>{t('landing.strip.claude')}</span>
              <span>{t('landing.strip.codex')}</span>
              <span>{t('landing.strip.cursor')}</span>
              <small>{t('landing.strip.protocol')}</small>
            </div>
          </div>
          <section id='product' className='landing-product landing-light'>
            <div className='landing-wrap'>
              <div className='landing-section-intro'>
                <h2>{t('landing.demoSection.title')}</h2>
                <p>{t('landing.demoSection.text')}</p>
              </div>
              <ProductDemo />
              <ol className='landing-steps'>
                {(['step1', 'step2', 'step3'] as const).map((step, index) => (
                  <li key={step}>
                    <span>{index + 1}</span>
                    {t(`landing.demoSection.${step}`)}
                    {index < 2 && <ArrowRight size={20} aria-hidden='true' />}
                  </li>
                ))}
              </ol>
            </div>
          </section>
          <section className='landing-problem landing-wrap'>
            <div>
              <h2>{t('landing.problem.title')}</h2>
              <p>{t('landing.problem.text')}</p>
            </div>
            <div className='landing-problem-quote'>
              <MessageSquare size={32} strokeWidth={1.3} aria-hidden='true' />
              <blockquote>{t('landing.problem.quote')}</blockquote>
              <p>{t('landing.problem.after')}</p>
            </div>
          </section>
          <section id='benefits' className='landing-features landing-light'>
            <div className='landing-wrap'>
              <div className='landing-section-intro'>
                <h2>{t('landing.features.title')}</h2>
                <p>{t('landing.features.text')}</p>
              </div>
              <div className='landing-feature-primary'>
                <div className='landing-feature-copy'>
                  <GitBranch size={28} strokeWidth={1.4} aria-hidden='true' />
                  <h3>{t('landing.features.review.title')}</h3>
                  <p>{t('landing.features.review.text')}</p>
                </div>
                <div className='landing-dependencies'>
                  <div className='landing-dependency-root'>
                    <Check size={18} />
                    <span>
                      <code>BR-12</code>
                      {t('landing.features.review.original')}
                    </span>
                  </div>
                  <div className='landing-dependency-children'>
                    {(['dependent', 'affected'] as const).map((item, index) => (
                      <div key={item}>
                        <div>
                          <code>{index === 0 ? 'SC-08' : 'REQ-24'}</code>
                          <span>{t(`landing.features.review.${item}`)}</span>
                        </div>
                        <span className='landing-review-status'>
                          <ScanLine size={13} />
                          {t('landing.features.review.status')}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className='landing-feature-pair'>
                <article>
                  <BookOpen size={27} strokeWidth={1.4} aria-hidden='true' />
                  <h3>{t('landing.features.passport.title')}</h3>
                  <p>{t('landing.features.passport.text')}</p>
                  <div className='landing-passport'>
                    <div>
                      <BookOpen size={16} />
                      <strong>{t('landing.features.passport.name')}</strong>
                    </div>
                    {(
                      ['chapter1', 'chapter2', 'chapter3', 'chapter4'] as const
                    ).map(item => (
                      <div key={item}>
                        <span>{t(`landing.features.passport.${item}`)}</span>
                        <ChevronRight size={14} />
                      </div>
                    ))}
                  </div>
                </article>
                <article>
                  <ScanLine size={27} strokeWidth={1.4} aria-hidden='true' />
                  <h3>{t('landing.features.analysis.title')}</h3>
                  <p>{t('landing.features.analysis.text')}</p>
                  <div className='landing-open-question'>
                    <span>{t('landing.features.analysis.questionLabel')}</span>
                    <p>{t('landing.features.analysis.question')}</p>
                    <code>OQ-04</code>
                  </div>
                </article>
              </div>
            </div>
          </section>
          <section id='agents' className='landing-agents'>
            <div className='landing-wrap landing-agents-grid'>
              <div>
                <h2>{t('landing.agents.title')}</h2>
                <p>{t('landing.agents.text')}</p>
                <div className='landing-agent-names'>
                  <span>{t('landing.strip.claude')}</span>
                  <span>{t('landing.strip.codex')}</span>
                  <span>{t('landing.strip.cursor')}</span>
                </div>
                <Link to={ROUTES.signUp} className='landing-agent-link'>
                  {t('landing.agents.link')}
                  <ArrowUpRight size={20} />
                </Link>
                <p className='landing-agent-note'>{t('landing.agents.note')}</p>
              </div>
              <div className='landing-terminal'>
                <div className='landing-terminal-header'>
                  <Code2 size={18} />
                  <span>{t('landing.agents.terminalTitle')}</span>
                  <code>MCP</code>
                </div>
                <p className='landing-terminal-prompt'>
                  <ChevronRight size={18} />
                  {t('landing.agents.request')}
                </p>
                <div className='landing-terminal-response'>
                  <div className='landing-terminal-tool'>
                    <img
                      src='/intentra-avatar.svg'
                      width={25}
                      height={25}
                      alt=''
                    />
                    {t('landing.agents.tool')}
                    <Check size={17} />
                  </div>
                  {(['item1', 'item2', 'item3'] as const).map(item => (
                    <div key={item} className='landing-context-row'>
                      <FileText size={15} />
                      <span>{t(`landing.agents.${item}`)}</span>
                      <Check size={14} />
                    </div>
                  ))}
                  <p>{t('landing.agents.result')}</p>
                </div>
                <span className='landing-terminal-cursor' aria-hidden='true' />
              </div>
            </div>
          </section>
          <section className='landing-control landing-light'>
            <div className='landing-wrap'>
              <h2>{t('landing.control.title')}</h2>
              <p>{t('landing.control.text')}</p>
              <div className='landing-approval-flow'>
                <span>
                  <MessageSquare />
                  {t('landing.control.draft')}
                </span>
                <ArrowRight aria-hidden='true' />
                <span>
                  <CheckCheck />
                  {t('landing.control.review')}
                </span>
                <ArrowRight aria-hidden='true' />
                <span>
                  <GitBranch />
                  {t('landing.control.knowledge')}
                </span>
              </div>
            </div>
          </section>
          <section className='landing-roles landing-light'>
            <div className='landing-wrap'>
              <h2>{t('landing.roles.title')}</h2>
              <div className='landing-role-list'>
                {(['product', 'lead', 'dev'] as const).map(role => (
                  <article key={role}>
                    <h3>{t(`landing.roles.${role}`)}</h3>
                    <p>{t(`landing.roles.${role}Text`)}</p>
                    <ArrowDownRight
                      size={24}
                      strokeWidth={1.4}
                      aria-hidden='true'
                    />
                  </article>
                ))}
              </div>
            </div>
          </section>
          <section id='faq' className='landing-faq landing-light'>
            <div className='landing-wrap landing-faq-grid'>
              <h2>{t('landing.faq.title')}</h2>
              <Accordion>
                {faqs.map(n => (
                  <AccordionItem key={n} value={n}>
                    <AccordionTrigger>
                      {t(`landing.faq.q${n}`)}
                    </AccordionTrigger>
                    <AccordionContent>
                      {t(`landing.faq.a${n}`)}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </section>
          <section className='landing-closing'>
            <div className='landing-wrap'>
              <img src='/intentra-avatar.svg' width={64} height={64} alt='' />
              <h2>{t('landing.closing.title')}</h2>
              <p>{t('landing.closing.text')}</p>
              <StartLink closing />
            </div>
          </section>
        </main>
        <footer className='landing-footer landing-wrap'>
          <div className='landing-footer-top'>
            <p>{t('landing.footer.tagline')}</p>
            <a href='#top'>
              {t('landing.footer.top')}
              <ArrowUpRight size={18} />
            </a>
          </div>
          <a
            href='#top'
            className='landing-footer-brand'
            aria-label={t('brand')}
          >
            <Wordmark inverse />
          </a>
          <div className='landing-footer-bottom'>
            <span>
              {t('landing.footer.copyright', {
                year: new Date().getFullYear(),
              })}
            </span>
            <span>{t('landing.footer.note')}</span>
          </div>
        </footer>
      </div>
    </div>
  );
}

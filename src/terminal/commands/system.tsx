import { profile } from '../../data/profile';
import { A, Accent, Block, Cmd, Dim, Err } from '../Out';
import { commands } from '../registry';
import { THEMES, type Command, type Theme } from '../types';

const answers: { match: RegExp; reply: string }[] = [
  { match: /remote|relocat|location|where/i, reply: `I'm based in ${profile.location}. Ask me directly about remote or relocation.` },
  { match: /java|spring/i, reply: 'Yes: Java and Spring Boot are my main backend stack. See `cd helpdesk-api`.' },
  { match: /react|typescript|frontend|front-end/i, reply: 'React and TypeScript are my main frontend stack. See `experience` and `cd wild-oasis`.' },
  { match: /\bai\b|agent|llm/i, reply: "I've shipped two production AI agents at ServiceNow. See `experience` and `cd loopmotion`." },
  { match: /test|qa|quality/i, reply: 'Testing is a strength: JUnit 5, Testcontainers, Playwright and Selenium. See `skills`.' },
  { match: /hire|available|notice|role|job/i, reply: "I'm looking for senior full-stack roles. The fastest route is `contact`." },
];

export const systemCommands: Command[] = [
  {
    name: 'help',
    description: 'List all commands',
    run: () => (
      <div className="grid gap-x-4 sm:grid-cols-[12rem_1fr]">
        {commands.filter((c) => !c.hidden).map((c) => (
          <div key={c.name} className="contents">
            <span><Cmd cmd={c.name}>{c.usage ?? c.name}</Cmd></span>
            <Dim>{c.description}</Dim>
          </div>
        ))}
        <span className="mt-2 sm:col-span-2">
          <Dim>Tips: ↑/↓ for history, Tab to complete, Ctrl+L to clear.</Dim>
        </span>
      </div>
    ),
  },
  {
    name: 'ride',
    aliases: ['room'],
    description: 'Ride through Hyderabad in 3D',
    run: (_a, ctx) => {
      if (ctx.exit) ctx.exit();
      else ctx.navigate('/');
    },
  },
  {
    name: 'theme',
    description: 'Change colours: green, amber or light',
    usage: 'theme <name>',
    complete: () => THEMES,
    run: (args, ctx) => {
      const t = args[0] as Theme | undefined;
      if (!t) return <Block><Dim>Current theme: </Dim>{ctx.theme}<Dim>. Options: </Dim>{THEMES.map((x) => <span key={x}><Cmd cmd={`theme ${x}`}>{x}</Cmd> </span>)}</Block>;
      if (!THEMES.includes(t)) return <Err>theme: unknown theme "{t}". Options: {THEMES.join(', ')}</Err>;
      ctx.setTheme(t);
      return <Dim>Theme set to {t}.</Dim>;
    },
  },
  {
    name: 'ask',
    description: 'Ask a question (chatbot coming later)',
    usage: 'ask <question>',
    run: (args) => {
      const q = args.join(' ');
      if (!q) return <Dim>usage: ask "are you open to remote roles?"</Dim>;
      const hit = answers.find((a) => a.match.test(q));
      return <Block>{hit ? hit.reply : <>The chatbot is coming soon. Meanwhile, try <Cmd cmd="contact" /> and ask me directly.</>}</Block>;
    },
  },
  {
    name: 'clear',
    aliases: ['cls'],
    description: 'Clear the screen',
    run: (_a, ctx) => ctx.clear(),
  },
  {
    name: 'exit',
    hidden: true,
    description: 'Leave the terminal',
    run: (_a, ctx) => {
      if (ctx.exit) return ctx.exit();
      return <Dim>There's no exit here. Try <Cmd cmd="ride" /> to see the 3D ride instead.</Dim>;
    },
  },
  {
    name: 'sudo',
    hidden: true,
    description: 'Easter egg',
    run: (args) => {
      if (args.join(' ') === 'hire-me') {
        return (
          <Block>
            <Dim>[sudo] password for recruiter: ********</Dim>
            <Accent>Access granted. Excellent decision.</Accent>
            <div>Send the offer to <A href={`mailto:${profile.email}?subject=Let's%20talk`}>{profile.email}</A> 🎉</div>
          </Block>
        );
      }
      return <Err>{profile.handle} is not in the sudoers file. This incident will be reported… unless you try `sudo hire-me`.</Err>;
    },
  },
  {
    name: 'rm',
    hidden: true,
    description: 'Easter egg',
    run: () => <Err>rm: permission denied. This portfolio is covered by tests. 🧪</Err>,
  },
];

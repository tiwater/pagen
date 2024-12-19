import {
  AppWindow,
  Bot,
  Camera,
  Check,
  CheckCircle,
  CheckCircle2,
  Code,
  Link,
  Loader2,
  Plus,
  Send,
  Square,
  Terminal,
  User,
  UserRound,
  Wand,
  X,
} from 'lucide-react';

function LogoIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M6 4h8a6 6 0 0 1 6 6v0a6 6 0 0 1-6 6h-8" />
      <path d="M6 20v-16" />
    </svg>
  );
}

export const Icons = {
  logo: LogoIcon,
  check: Check,
  checkCircle: CheckCircle2,
  close: X,
  link: Link,
  plus: Plus,
  spinner: Loader2,
  figma: Square, // Using Square as a placeholder for Figma icon
  send: Send,
  bot: Bot,
  terminal: Terminal,
  wand: Wand,
  window: AppWindow,
  code: Code,
  camera: Camera,
  user: UserRound,
};

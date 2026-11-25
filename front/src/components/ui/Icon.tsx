import {
  AlertOctagon,
  AlertTriangle,
  Calendar,
  CalendarPlus,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  FilterX,
  Hourglass,
  Info,
  Lock,
  LogOut,
  MapPin,
  RefreshCw,
  Search,
  ShieldAlert,
  Ticket,
  User,
  Users,
  X,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import styles from "./Icon.module.css";

/**
 * Registre unique des icônes de l'application (source de vérité Design System).
 * Aucun autre fichier ne doit importer `lucide-react` directement (règle ESLint).
 */
const ICON_REGISTRY = {
  alert: AlertTriangle,
  alertOctagon: AlertOctagon,
  calendar: Calendar,
  calendarPlus: CalendarPlus,
  check: Check,
  checkCircle: CheckCircle2,
  chevronDown: ChevronDown,
  chevronLeft: ChevronLeft,
  chevronRight: ChevronRight,
  clock: Clock,
  filterX: FilterX,
  hourglass: Hourglass,
  info: Info,
  lock: Lock,
  logOut: LogOut,
  mapPin: MapPin,
  refreshCw: RefreshCw,
  search: Search,
  shieldAlert: ShieldAlert,
  ticket: Ticket,
  user: User,
  users: Users,
  x: X,
  xCircle: XCircle,
} as const satisfies Record<string, LucideIcon>;

export type IconName = keyof typeof ICON_REGISTRY;

export const ICON_NAMES = Object.keys(ICON_REGISTRY) as readonly IconName[];

export interface IconProps {
  readonly name: IconName;
  readonly size?: number;
  readonly strokeWidth?: number;
  readonly className?: string;
  /** Si fourni, rend l'icône signifiante (`role="img"` + `aria-label`) ; sinon purement décorative (`aria-hidden`). */
  readonly label?: string;
}

export function Icon({
  name,
  size = 20,
  strokeWidth = 2,
  className = "",
  label,
}: IconProps) {
  const SvgIcon = ICON_REGISTRY[name];

  return (
    <SvgIcon
      size={size}
      strokeWidth={strokeWidth}
      className={`${styles.icon} ${className}`.trim()}
      aria-hidden={label ? undefined : true}
      role={label ? "img" : undefined}
      aria-label={label}
      focusable="false"
    />
  );
}

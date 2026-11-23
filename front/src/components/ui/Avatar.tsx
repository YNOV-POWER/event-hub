import { getInitials } from "@/i18n/formatters";
import styles from "./Avatar.module.css";

export type AvatarSize = "sm" | "md" | "lg";

export interface AvatarProps {
  readonly name: string;
  readonly size?: AvatarSize;
  readonly className?: string;
}

export function Avatar({ name, size = "md", className = "" }: AvatarProps) {
  return (
    <span
      className={`${styles.avatar} ${styles[size]} ${className}`.trim()}
      aria-hidden="true"
    >
      {getInitials(name)}
    </span>
  );
}

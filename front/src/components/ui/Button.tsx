"use client";

import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  ReactNode,
  Ref,
} from "react";
import Link from "next/link";
import styles from "./Button.module.css";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "link";
export type ButtonSize = "sm" | "md" | "lg";

interface ButtonCommonProps {
  readonly variant?: ButtonVariant;
  readonly size?: ButtonSize;
  readonly fullWidth?: boolean;
  readonly isLoading?: boolean;
  readonly leftIcon?: ReactNode;
  readonly rightIcon?: ReactNode;
  readonly className?: string;
  readonly children?: ReactNode;
}

export interface ButtonAsButtonProps
  extends ButtonCommonProps,
    Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof ButtonCommonProps | "href"> {
  readonly href?: undefined;
  readonly ref?: Ref<HTMLButtonElement>;
}

export interface ButtonAsLinkProps
  extends ButtonCommonProps,
    Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof ButtonCommonProps | "href"> {
  readonly href: string;
  readonly ref?: Ref<HTMLAnchorElement>;
}

export type ButtonProps = ButtonAsButtonProps | ButtonAsLinkProps;

/**
 * Bouton polymorphe du Design System EventHub :
 * - Sans `href` : rend un `<button>` natif (actions, formulaires, mutations avec `isLoading`).
 * - Avec `href` : rend un `<Link>` Next.js (`<a>`) tout en partageant les mêmes variantes visuelles.
 */
export function Button(props: ButtonProps) {
  const {
    variant = "primary",
    size = "md",
    fullWidth = false,
    isLoading = false,
    leftIcon,
    rightIcon,
    className = "",
    children,
  } = props;

  const classes = [
    styles.button,
    styles[variant],
    styles[size],
    fullWidth ? styles.fullWidth : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  if (typeof props.href === "string") {
    const {
      href,
      ref,
      variant: _variant,
      size: _size,
      fullWidth: _fullWidth,
      isLoading: _isLoading,
      leftIcon: _leftIcon,
      rightIcon: _rightIcon,
      className: _className,
      children: _children,
      ...anchorRest
    } = props;
    void _variant;
    void _size;
    void _fullWidth;
    void _isLoading;
    void _leftIcon;
    void _rightIcon;
    void _className;
    void _children;

    return (
      <Link ref={ref} href={href} className={classes} {...anchorRest}>
        {leftIcon}
        <span>{children}</span>
        {rightIcon}
      </Link>
    );
  }

  const {
    ref,
    disabled,
    type = "button",
    href: _href,
    variant: _variant,
    size: _size,
    fullWidth: _fullWidth,
    isLoading: _isLoading,
    leftIcon: _leftIcon,
    rightIcon: _rightIcon,
    className: _className,
    children: _children,
    ...buttonRest
  } = props;
  void _href;
  void _variant;
  void _size;
  void _fullWidth;
  void _isLoading;
  void _leftIcon;
  void _rightIcon;
  void _className;
  void _children;

  return (
    <button
      ref={ref}
      type={type}
      className={classes}
      disabled={disabled || isLoading}
      aria-busy={isLoading || undefined}
      {...buttonRest}
    >
      {isLoading ? <span className={styles.spinner} aria-hidden="true" /> : leftIcon}
      <span>{children}</span>
      {!isLoading ? rightIcon : null}
    </button>
  );
}

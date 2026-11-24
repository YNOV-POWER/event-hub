"use client";

import Link from "next/link";
import { LogOut } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { UserRole } from "@/api/client";
import { Avatar } from "./Avatar";
import styles from "./Navbar.module.css";

export interface NavbarUser {
  readonly displayName: string;
  readonly role: UserRole;
}

export interface NavbarProps {
  readonly currentPath: string;
  readonly user?: NavbarUser | null;
  readonly onSignOut?: () => void;
}

export function Navbar({ currentPath, user = null, onSignOut }: NavbarProps) {
  const { t } = useTranslation();
  const isEvents = currentPath === "/" || currentPath.startsWith("/events");
  const isMyRegistrations = currentPath.startsWith("/me/registrations");
  const isAdminNew = currentPath.startsWith("/admin");

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <div className={styles.left}>
          <Link href="/events" className={styles.brand}>
            <span className={styles.logoMark} aria-hidden="true">
              E
            </span>
            <span className={styles.brandName}>{t("app.name")}</span>
          </Link>

          <nav aria-label={t("nav.mainLabel")} className={styles.nav}>
            <Link
              href="/events"
              className={`${styles.navLink} ${isEvents ? styles.navLinkActive : ""}`.trim()}
              aria-current={isEvents ? "page" : undefined}
            >
              {t("nav.events")}
            </Link>
            {user ? (
              <Link
                href="/me/registrations"
                className={`${styles.navLink} ${isMyRegistrations ? styles.navLinkActive : ""}`.trim()}
                aria-current={isMyRegistrations ? "page" : undefined}
              >
                {t("nav.myRegistrations")}
              </Link>
            ) : null}
            {user?.role === "ORGANIZER" ? (
              <Link
                href="/admin/events/new"
                className={`${styles.navLink} ${isAdminNew ? styles.navLinkActive : ""}`.trim()}
                aria-current={isAdminNew ? "page" : undefined}
              >
                {t("nav.newEvent")}
              </Link>
            ) : null}
          </nav>
        </div>

        <div className={styles.right}>
          {user ? (
            <>
              <div className={styles.userBadge}>
                <Avatar name={user.displayName} size="md" />
                <div className={styles.userInfo}>
                  <span className={styles.userName}>{user.displayName}</span>
                  <span
                    className={`${styles.userRole} ${
                      user.role === "ORGANIZER" ? styles.userRoleOrganizer : ""
                    }`.trim()}
                  >
                    {t(`nav.roles.${user.role}`)}
                  </span>
                </div>
              </div>
              {onSignOut ? (
                <>
                  <span className={styles.divider} aria-hidden="true" />
                  <button type="button" className={styles.logoutButton} onClick={onSignOut}>
                    <LogOut size={16} aria-hidden="true" />
                    <span>{t("nav.logout")}</span>
                  </button>
                </>
              ) : null}
            </>
          ) : (
            <>
              <Link href="/login" className={styles.loginLink}>
                {t("nav.login")}
              </Link>
              <Link href="/register" className={styles.registerButton}>
                {t("nav.register")}
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

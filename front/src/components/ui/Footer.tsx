"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";
import styles from "./Footer.module.css";

export function Footer() {
  const { t } = useTranslation();

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <p className={styles.copy}>{t("app.footer.copyright")}</p>
        <nav aria-label="Liens de pied de page" className={styles.links}>
          <Link href="/events" className={styles.link}>
            {t("app.footer.legal")}
          </Link>
          <Link href="/events" className={styles.link}>
            {t("app.footer.accessibility")}
          </Link>
          <Link href="/events" className={styles.link}>
            {t("app.footer.contact")}
          </Link>
        </nav>
      </div>
    </footer>
  );
}

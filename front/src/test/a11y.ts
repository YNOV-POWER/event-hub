import axe from "axe-core";
import { expect } from "vitest";

/**
 * Exécute axe-core sur un conteneur DOM et vérifie l'absence de violation
 * critique ou sérieuse (critère Atelier 6 : contrôle axe sans violation critique).
 */
export async function expectNoA11yViolations(container: HTMLElement): Promise<void> {
  const results = await axe.run(container, {
    rules: {
      // jsdom ne calcule pas les couleurs CSS calculées : color-contrast est vérifié dans Storybook/browser
      "color-contrast": { enabled: false },
    },
  });

  const severe = results.violations.filter(
    (violation) => violation.impact === "critical" || violation.impact === "serious",
  );

  expect(
    severe.map((v) => ({
      id: v.id,
      impact: v.impact,
      help: v.help,
      nodes: v.nodes.map((n) => n.html),
    })),
  ).toEqual([]);
}

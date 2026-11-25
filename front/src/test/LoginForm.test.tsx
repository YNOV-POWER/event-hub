import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ApiError } from "@/api/errors";
import { getSafeRedirect } from "@/auth/safe-redirect";
import { LoginForm } from "@/components/auth/LoginForm";
import { Alert } from "@/components/ui/Alert";
import { expectNoA11yViolations } from "./a11y";

const invalidCredentials = new ApiError({
  status: 401,
  code: "INVALID_CREDENTIALS",
  title: "Invalid credentials",
  detail: "Email or password is incorrect.",
});

describe("LoginForm (US02)", () => {
  it("envoie l'email et le mot de passe saisis", async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    const { container } = render(<LoginForm onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText("Email"), "ada@example.com");
    await user.type(screen.getByLabelText("Mot de passe"), "correct horse");
    await user.click(screen.getByRole("button", { name: "Se connecter" }));

    expect(onSubmit).toHaveBeenCalledOnce();
    expect(onSubmit.mock.calls[0]?.[0]).toEqual({
      email: "ada@example.com",
      password: "correct horse",
    });
    await expectNoA11yViolations(container);
  });

  it("bloque l'envoi tant que les champs sont invalides", async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(<LoginForm onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText("Email"), "pas-un-email");
    await user.click(screen.getByRole("button", { name: "Se connecter" }));

    expect(await screen.findByText("Veuillez saisir une adresse email valide.")).toBeVisible();
    expect(screen.getByText("Veuillez saisir votre mot de passe.")).toBeVisible();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("affiche un message générique sur 401, à la place du bandeau contextuel", async () => {
    const { container } = render(
      <LoginForm
        serverError={invalidCredentials}
        notice={<Alert tone="success">Compte créé. Vous pouvez vous connecter.</Alert>}
        onSubmit={vi.fn()}
      />,
    );

    expect(screen.getByRole("alert")).toHaveTextContent("Email ou mot de passe incorrect.");
    expect(screen.queryByText(/Compte créé/)).not.toBeInTheDocument();
    await expectNoA11yViolations(container);
  });

  it("désactive le bouton pendant la requête", () => {
    render(<LoginForm isSubmitting onSubmit={vi.fn()} />);

    expect(screen.getByRole("button", { name: "Connexion…" })).toBeDisabled();
  });
});

describe("getSafeRedirect", () => {
  it.each([
    ["/me/registrations", "/me/registrations"],
    ["/events?page=2#top", "/events?page=2#top"],
    [null, "/events"],
    ["", "/events"],
    ["//evil.example", "/events"],
    ["/\\evil.example", "/events"],
    ["/\t/evil.example", "/events"],
    ["https://evil.example", "/events"],
    ["javascript:alert(1)", "/events"],
  ])("%j donne %s", (next, expected) => {
    expect(getSafeRedirect(next)).toBe(expected);
  });
});

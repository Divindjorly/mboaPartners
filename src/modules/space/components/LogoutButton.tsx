"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "#/components/ui/Button";
import { logoutAction } from "#/modules/auth/services/auth.actions";

export function LogoutButton({ loginHref }: { loginHref: string }) {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const logout = () =>
    startTransition(async () => {
      const formData = new FormData();
      formData.set("locale", i18n.language);
      await logoutAction(null, formData);
      router.replace(loginHref);
      router.refresh();
    });

  return (
    <Button type="button" size="sm" variant="outline" onClick={logout} disabled={pending}>
      {t("space.logout")}
    </Button>
  );
}

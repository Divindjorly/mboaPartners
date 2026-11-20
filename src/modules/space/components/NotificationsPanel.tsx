"use client";

import { useTranslation } from "react-i18next";
import type { PartnerInbox } from "#/types/partner.types";
import { useSpaceAction } from "../hooks/useSpaceAction";
import { markAllNotificationsReadAction, markNotificationReadAction } from "../services/space.actions";
import { formatDateTime } from "../utils/applicationRules";

/**
 * Messages de l'équipe Mboa sur le dossier (pièce acceptée ou refusée, compléments demandés, décision) : historique,
 * lu / non lu message par message. Les plus récents d'abord ; les 20 derniers suffisent pour un dossier.
 */
export function NotificationsPanel({ inbox, loginHref }: { inbox: PartnerInbox | null; loginHref: string }) {
  const { t, i18n } = useTranslation();
  const markOne = useSpaceAction(markNotificationReadAction, loginHref);
  const markAll = useSpaceAction(markAllNotificationsReadAction, loginHref);
  const error = markOne.error ?? markAll.error;

  return (
    <section aria-labelledby="notifications-title" className="rounded-3xl bg-paper p-5 sm:p-8">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2">
        <h2 id="notifications-title" className="font-poster text-2xl font-extrabold">
          {t("space.notifications.title")}
          {inbox && inbox.unread > 0 && (
            <span className="ml-2 inline-grid min-w-6 place-items-center rounded-full bg-danger px-1.5 align-middle font-sans text-xs leading-6 font-semibold text-paper">
              <span aria-hidden>{inbox.unread}</span>
              <span className="sr-only">{t("space.notifications.unread_count", { count: inbox.unread })}</span>
            </span>
          )}
        </h2>
        {inbox && inbox.unread > 0 && (
          <button type="button" onClick={() => markAll.run({})} disabled={markAll.pending} className="text-sm font-semibold text-brand hover:underline disabled:opacity-50">
            {t("space.notifications.mark_all_read")}
          </button>
        )}
      </div>
      {error && (
        <p role="alert" className="mt-3 text-sm text-danger">
          {error}
        </p>
      )}

      {!inbox ? (
        <p className="mt-3 text-sm text-muted">{t("space.notifications.unavailable")}</p>
      ) : inbox.items.length === 0 ? (
        <p className="mt-3 text-sm text-muted">{t("space.notifications.empty")}</p>
      ) : (
        <ul className="mt-4 divide-y divide-rule border-t border-rule">
          {inbox.items.map((n) => (
            <li key={n.id} className={`-mx-2 flex gap-3 rounded-xl px-2 py-4 ${n.readAt ? "" : "bg-brand/5"}`}>
              <span aria-hidden className={`mt-2 size-2 shrink-0 rounded-full ${n.readAt ? "bg-rule" : n.priority === "high" || n.priority === "critical" ? "bg-danger" : "bg-brand"}`} />
              <div className="min-w-0 flex-1">
                <p className={n.readAt ? "" : "font-semibold"}>
                  {n.title}
                  {!n.readAt && <span className="sr-only"> · {t("space.notifications.unread")}</span>}
                </p>
                <p className="mt-0.5 text-sm text-muted">{n.body}</p>
                <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted">
                  <time dateTime={n.createdAt}>{formatDateTime(n.createdAt, i18n.language)}</time>
                  {!n.readAt && (
                    <button type="button" onClick={() => markOne.run({ id: n.id })} disabled={markOne.pending} className="font-semibold text-brand hover:underline disabled:opacity-50">
                      {t("space.notifications.mark_read")}
                    </button>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
      {inbox && inbox.total > inbox.items.length && <p className="mt-3 text-xs text-muted">{t("space.notifications.older", { count: inbox.total - inbox.items.length })}</p>}
    </section>
  );
}

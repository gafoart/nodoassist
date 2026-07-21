import { definePage } from "@openclaw/uirouter";
import { html } from "lit";

export const page = definePage({
  id: "cron",
  path: "/cron",
  component: () =>
    import("./cron-page.ts").then(() => ({
      header: true,
      render: () => html`<nodoassist-cron-page></nodoassist-cron-page>`,
    })),
});

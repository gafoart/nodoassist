import { definePage } from "@openclaw/uirouter";
import { html } from "lit";

export const page = definePage({
  id: "worktrees",
  path: "/settings/worktrees",
  aliases: ["/worktrees"],
  component: () =>
    import("./worktrees-page.ts").then(() => ({
      header: true,
      render: () => html`<nodoassist-worktrees-page></nodoassist-worktrees-page>`,
    })),
});

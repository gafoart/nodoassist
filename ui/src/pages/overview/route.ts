import { definePage } from "@openclaw/uirouter";
import { html } from "lit";

export const page = definePage({
  id: "overview",
  path: "/overview",
  component: () =>
    import("./overview-page.ts").then(() => ({
      header: true,
      render: () => html`<nodoassist-overview-page></nodoassist-overview-page>`,
    })),
});

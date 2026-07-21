#!/usr/bin/env -S node --import tsx
// NodoAssist release ClawHub plan CLI emits release workflow routing as JSON.

import { pathToFileURL } from "node:url";
import {
  buildNodoAssistReleaseClawHubPlan,
  parseNodoAssistReleaseClawHubPlanArgs,
} from "./lib/nodoassist-release-clawhub-plan.ts";

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  const args = parseNodoAssistReleaseClawHubPlanArgs(process.argv.slice(2));
  const plan = await buildNodoAssistReleaseClawHubPlan(args);
  console.log(JSON.stringify(plan, null, 2));
}

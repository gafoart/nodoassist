# `@nodoassist/ai`

Reusable model API contracts, provider adapters, and streaming primitives from
NodoAssist. The package supports isolated runtime instances; importing it does not
register providers globally.

```ts
import { createLlmRuntime } from "@nodoassist/ai";
import { registerBuiltInApiProviders } from "@nodoassist/ai/providers";

const runtime = createLlmRuntime();
registerBuiltInApiProviders(runtime.registry);
```

Provider-neutral contracts, validation, diagnostics, and event streams are
available from the package root and focused subpaths such as
`@nodoassist/ai/event-stream` and `@nodoassist/ai/validation`. No second NodoAssist
runtime package is required.

Provider ids, credentials, model catalogs, retries, and failover remain
application concerns. NodoAssist supplies those policies around this package.
Host policy (request fetch guarding, secret redaction, strict-tool defaults,
diagnostics logging) can be injected with `configureAiTransportHost`; the
defaults are inert.

`@nodoassist/ai/internal/*` subpaths exist for the NodoAssist application itself.
They carry no semver guarantee and can change or disappear in any release; do
not depend on them outside NodoAssist.

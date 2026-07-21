// Minimax tests cover provider discovery.contract plugin behavior.
import { describeMinimaxProviderDiscoveryContract } from "nodoassist/plugin-sdk/provider-test-contracts";

describeMinimaxProviderDiscoveryContract(() => import("./index.js"));

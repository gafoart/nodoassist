import { pluginRegistrationContractCases } from "nodoassist/plugin-sdk/plugin-test-contracts";
import { describePluginRegistrationContract } from "nodoassist/plugin-sdk/plugin-test-contracts";

describePluginRegistrationContract(pluginRegistrationContractCases.parallel);

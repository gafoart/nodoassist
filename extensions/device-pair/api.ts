// Device Pair API module exposes the plugin public contract.
export {
  approveDevicePairing,
  clearDeviceBootstrapTokens,
  issueDeviceBootstrapToken,
  PAIRING_SETUP_BOOTSTRAP_PROFILE,
  listDevicePairing,
  revokeDeviceBootstrapToken,
  type DeviceBootstrapProfile,
} from "nodoassist/plugin-sdk/device-bootstrap";
export { definePluginEntry, type NodoAssistPluginApi } from "nodoassist/plugin-sdk/plugin-entry";
export {
  resolveGatewayBindUrl,
  resolveGatewayPort,
  resolveTailnetHostWithRunner,
  resolveTailscaleServeGatewayUrlsWithRunner,
} from "nodoassist/plugin-sdk/core";
export { resolveAdvertisedLanHost } from "nodoassist/plugin-sdk/gateway-runtime";
export {
  resolvePreferredNodoAssistTmpDir,
  runPluginCommandWithTimeout,
} from "nodoassist/plugin-sdk/sandbox";
export { renderQrPngBase64, renderQrPngDataUrl, writeQrPngTempFile } from "./qr-image.js";

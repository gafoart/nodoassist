// Matrix plugin module implements device health behavior.
export type MatrixManagedDeviceInfo = {
  deviceId: string;
  displayName: string | null;
  current: boolean;
};

type MatrixDeviceHealthSummary = {
  currentDeviceId: string | null;
  staleNodoAssistDevices: MatrixManagedDeviceInfo[];
  currentNodoAssistDevices: MatrixManagedDeviceInfo[];
};

const NODOASSIST_DEVICE_NAME_PREFIX = "NodoAssist ";

export function isNodoAssistManagedMatrixDevice(displayName: string | null | undefined): boolean {
  return displayName?.startsWith(NODOASSIST_DEVICE_NAME_PREFIX) === true;
}

export function summarizeMatrixDeviceHealth(
  devices: MatrixManagedDeviceInfo[],
): MatrixDeviceHealthSummary {
  const currentDeviceId = devices.find((device) => device.current)?.deviceId ?? null;
  const nodoAssistDevices = devices.filter((device) =>
    isNodoAssistManagedMatrixDevice(device.displayName),
  );
  return {
    currentDeviceId,
    staleNodoAssistDevices: nodoAssistDevices.filter((device) => !device.current),
    currentNodoAssistDevices: nodoAssistDevices.filter((device) => device.current),
  };
}

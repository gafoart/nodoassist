import Foundation
import Testing
@testable import NodoAssist

struct LogLocatorTests {
    @Test func `launchd gateway log path ensures tmp dir exists`() async {
        let fm = FileManager()
        let baseDir = URL(fileURLWithPath: NSTemporaryDirectory(), isDirectory: true)
        let logDir = baseDir.appendingPathComponent("nodoassist-tests-\(UUID().uuidString)")
        defer { try? fm.removeItem(at: logDir) }

        // Env mutation must hold TestIsolationLock; raw setenv races parallel
        // tests scanning environ (e.g. NODOASSIST_CONFIG_PATH readers).
        await TestIsolation.withEnvValues(["NODOASSIST_LOG_DIR": logDir.path]) {
            _ = LogLocator.launchdGatewayLogPath
        }

        var isDir: ObjCBool = false
        #expect(fm.fileExists(atPath: logDir.path, isDirectory: &isDir))
        #expect(isDir.boolValue == true)
    }
}

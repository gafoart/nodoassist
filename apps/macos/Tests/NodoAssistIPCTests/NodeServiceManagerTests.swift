import Foundation
import Testing
@testable import NodoAssist

@Suite(.serialized) struct NodeServiceManagerTests {
    @Test func `builds node service commands with current CLI shape`() async throws {
        try await TestIsolation.withUserDefaultsValues(["nodoassist.gatewayProjectRootPath": nil]) {
            let tmp = try makeTempDirForTests()
            CommandResolver.setProjectRoot(tmp.path)

            let nodoassistPath = tmp.appendingPathComponent("node_modules/.bin/nodoassist")
            try makeExecutableForTests(at: nodoassistPath)

            let start = NodeServiceManager._testServiceCommand(["start"])
            #expect(start == [nodoassistPath.path, "node", "start", "--json"])

            let stop = NodeServiceManager._testServiceCommand(["stop"])
            #expect(stop == [nodoassistPath.path, "node", "stop", "--json"])
        }
    }
}

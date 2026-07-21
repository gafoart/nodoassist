import Foundation
import NodoAssistKit
import Testing

struct SessionMutationResponsesTests {
    @Test
    func compactResponseAcceptsSuccess() throws {
        try NodoAssistSessionsCompactResponse.requireSuccess(
            from: Data(#"{"ok":true,"key":"agent:main:main","compacted":true}"#.utf8))
    }

    @Test
    func compactResponseSurfacesGatewayFailureReason() {
        let data = Data(
            #"{"ok":false,"key":"agent:main:main","compacted":false,"reason":"turn failed"}"#.utf8)
        do {
            try NodoAssistSessionsCompactResponse.requireSuccess(
                from: data)
            Issue.record("expected failed compaction response to throw")
        } catch let error as NodoAssistSessionsCompactError {
            #expect(error.errorDescription == "turn failed")
        } catch {
            Issue.record("unexpected error: \(error)")
        }
    }
}

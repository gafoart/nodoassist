import Foundation
import Testing
@testable import NodoAssist

@Suite(.serialized)
@MainActor
struct CLIInstallerTests {
    @Test func `installed location finds executable`() throws {
        let fm = FileManager()
        let root = fm.temporaryDirectory.appendingPathComponent(
            "nodoassist-cli-installer-\(UUID().uuidString)")
        defer { try? fm.removeItem(at: root) }

        let binDir = root.appendingPathComponent("bin")
        try fm.createDirectory(at: binDir, withIntermediateDirectories: true)
        let cli = binDir.appendingPathComponent("nodoassist")
        fm.createFile(atPath: cli.path, contents: Data())
        try fm.setAttributes([.posixPermissions: 0o755], ofItemAtPath: cli.path)

        let found = CLIInstaller.installedLocation(
            searchPaths: [binDir.path],
            fileManager: fm)
        #expect(found == cli.path)

        try fm.removeItem(at: cli)
        fm.createFile(atPath: cli.path, contents: Data())
        try fm.setAttributes([.posixPermissions: 0o644], ofItemAtPath: cli.path)

        let missing = CLIInstaller.installedLocation(
            searchPaths: [binDir.path],
            fileManager: fm)
        #expect(missing == nil)
    }

    @Test func `installer command runs the signed bundled script without a shell pipeline`() {
        let command = CLIInstaller.installScriptCommand(
            version: "2026.7.3-beta.1",
            prefix: "/Users/Test User/.nodoassist",
            scriptPath: "/Applications/NodoAssist.app/Contents/Resources/install-cli.sh")

        #expect(command == [
            "/bin/bash",
            "/Applications/NodoAssist.app/Contents/Resources/install-cli.sh",
            "--json",
            "--no-onboard",
            "--prefix",
            "/Users/Test User/.nodoassist",
            "--version",
            "2026.7.3-beta.1",
        ])
        #expect(!command.contains("curl"))
    }

    @Test func `managed setup requires a parseable compatible version`() {
        let location = "/Users/test/.nodoassist/bin/nodoassist"

        #expect(CLIInstaller.classifyVersion(
            location: location,
            output: "NodoAssist 2026.7.3\n",
            expectedVersion: "2026.7.3") == .ready(location: location, version: "2026.7.3"))
        #expect(CLIInstaller.classifyVersion(
            location: location,
            output: "NodoAssist\n",
            expectedVersion: "2026.7.3") == .unusable(location: location))
        #expect(CLIInstaller.classifyVersion(
            location: location,
            output: "2026.6.1\n",
            expectedVersion: "2026.7.3") == .incompatible(
            location: location,
            found: "2026.6.1",
            required: "2026.7.3"))
    }

    @Test func `compatible external CLI satisfies setup`() async throws {
        let root = FileManager().temporaryDirectory.appendingPathComponent(
            "nodoassist-compatible-cli-\(UUID().uuidString)")
        defer { try? FileManager().removeItem(at: root) }
        try FileManager().createDirectory(at: root, withIntermediateDirectories: true)
        let executable = root.appendingPathComponent("nodoassist")
        try "#!/bin/sh\necho 'NodoAssist 2026.7.3'\n".write(
            to: executable,
            atomically: true,
            encoding: .utf8)
        try FileManager().setAttributes([.posixPermissions: 0o755], ofItemAtPath: executable.path)

        let status = await CLIInstaller.status(location: executable.path)

        #expect(status == .ready(location: executable.path, version: "2026.7.3"))
    }

    @Test func `matching external CLI with unsupported Node is unusable`() async throws {
        let root = FileManager().temporaryDirectory.appendingPathComponent(
            "nodoassist-old-node-cli-\(UUID().uuidString)")
        defer { try? FileManager().removeItem(at: root) }
        try FileManager().createDirectory(at: root, withIntermediateDirectories: true)
        let executable = root.appendingPathComponent("nodoassist")
        let node = root.appendingPathComponent("node")
        try "#!/bin/sh\necho 'NodoAssist 2026.7.3'\n".write(
            to: executable,
            atomically: true,
            encoding: .utf8)
        try "#!/bin/sh\necho 'v20.18.0'\n".write(
            to: node,
            atomically: true,
            encoding: .utf8)
        try FileManager().setAttributes([.posixPermissions: 0o755], ofItemAtPath: executable.path)
        try FileManager().setAttributes([.posixPermissions: 0o755], ofItemAtPath: node.path)

        let status = await CLIInstaller.status(location: executable.path)

        #expect(status == .unusable(location: executable.path))
    }

    @Test func `CLI probe preserves environment and resolves shebang tools beside executable`() {
        let location = "/custom/bin/nodoassist"
        let environment = CLIInstaller.probeEnvironment(
            location: location,
            processEnvironment: ["HOME": "/Users/test", "PATH": "/usr/bin"],
            preferredPaths: ["/opt/homebrew/bin", "/usr/bin"])

        #expect(environment["HOME"] == "/Users/test")
        #expect(environment["PATH"] == "/custom/bin:/opt/homebrew/bin:/usr/bin")
    }

    @Test func `managed CLI probe prefers its private runtime`() {
        let executable = "/Users/test/.nodoassist/bin/nodoassist"
        let environment = CLIInstaller.probeEnvironment(
            location: executable,
            processEnvironment: [:],
            preferredPaths: ["/Users/test/.nvm/versions/node/v20/bin", "/usr/bin"],
            managedExecutable: executable,
            managedRuntimeDirectory: "/Users/test/.nodoassist/tools/node/bin")

        #expect(environment["PATH"] == [
            "/Users/test/.nodoassist/bin",
            "/Users/test/.nodoassist/tools/node/bin",
            "/Users/test/.nvm/versions/node/v20/bin",
            "/usr/bin",
        ].joined(separator: ":"))
    }

    @Test func `successful CLI setup starts the local gateway and waits for readiness`() async {
        var didStart = false
        var didWait = false

        let activation = await CLIInstaller.activateLocalGateway(
            mode: .local,
            paused: false,
            start: { didStart = true },
            waitUntilReady: {
                didWait = true
                return true
            })

        #expect(didStart)
        #expect(didWait)
        #expect(activation == .ready)
    }

    @Test func `paused CLI setup defers gateway activation`() async {
        var didStart = false
        var didWait = false

        let activation = await CLIInstaller.activateLocalGateway(
            mode: .local,
            paused: true,
            start: { didStart = true },
            waitUntilReady: {
                didWait = true
                return true
            })

        #expect(!didStart)
        #expect(!didWait)
        #expect(activation == .deferred)
    }
}

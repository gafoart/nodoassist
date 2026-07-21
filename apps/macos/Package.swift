// swift-tools-version: 6.2
// Package manifest for the NodoAssist macOS companion (menu bar app + IPC library).

import PackageDescription

let package = Package(
    name: "NodoAssist",
    platforms: [
        .macOS(.v15),
    ],
    products: [
        .library(name: "NodoAssistIPC", targets: ["NodoAssistIPC"]),
        .library(name: "NodoAssistDiscovery", targets: ["NodoAssistDiscovery"]),
        .executable(name: "NodoAssist", targets: ["NodoAssist"]),
        .executable(name: "nodoassist-mac", targets: ["NodoAssistMacCLI"]),
    ],
    dependencies: [
        .package(url: "https://github.com/orchetect/MenuBarExtraAccess", exact: "1.3.0"),
        .package(url: "https://github.com/swiftlang/swift-subprocess.git", from: "0.4.0"),
        .package(url: "https://github.com/apple/swift-log.git", from: "1.10.1"),
        .package(url: "https://github.com/sparkle-project/Sparkle", from: "2.9.0"),
        .package(url: "https://github.com/steipete/Peekaboo.git", exact: "3.5.2"),
        .package(url: "https://github.com/pointfreeco/swift-concurrency-extras", from: "1.3.1"),
        .package(path: "../shared/NodoAssistKit"),
        .package(path: "../swabble"),
    ],
    targets: [
        .target(
            name: "NodoAssistIPC",
            dependencies: [],
            swiftSettings: [
                .enableUpcomingFeature("StrictConcurrency"),
            ]),
        .target(
            name: "NodoAssistDiscovery",
            dependencies: [
                .product(name: "NodoAssistKit", package: "NodoAssistKit"),
            ],
            path: "Sources/NodoAssistDiscovery",
            swiftSettings: [
                .enableUpcomingFeature("StrictConcurrency"),
            ]),
        .executableTarget(
            name: "NodoAssist",
            dependencies: [
                "NodoAssistIPC",
                "NodoAssistDiscovery",
                .product(name: "NodoAssistKit", package: "NodoAssistKit"),
                .product(name: "NodoAssistChatUI", package: "NodoAssistKit"),
                .product(name: "NodoAssistProtocol", package: "NodoAssistKit"),
                .product(name: "SwabbleKit", package: "swabble"),
                .product(name: "MenuBarExtraAccess", package: "MenuBarExtraAccess"),
                .product(name: "Subprocess", package: "swift-subprocess"),
                .product(name: "Logging", package: "swift-log"),
                .product(name: "Sparkle", package: "Sparkle"),
                .product(name: "PeekabooBridge", package: "Peekaboo"),
                .product(name: "PeekabooAutomationKit", package: "Peekaboo"),
                .product(name: "ConcurrencyExtras", package: "swift-concurrency-extras"),
            ],
            exclude: [
                "Resources/Info.plist",
                "Resources/Localizable.xcstrings",
            ],
            resources: [
                .copy("Resources/NodoAssist.icns"),
                .copy("Resources/DeviceModels"),
            ],
            swiftSettings: [
                .enableUpcomingFeature("StrictConcurrency"),
            ]),
        .executableTarget(
            name: "NodoAssistMacCLI",
            dependencies: [
                "NodoAssistDiscovery",
                .product(name: "NodoAssistKit", package: "NodoAssistKit"),
                .product(name: "NodoAssistProtocol", package: "NodoAssistKit"),
            ],
            path: "Sources/NodoAssistMacCLI",
            swiftSettings: [
                .enableUpcomingFeature("StrictConcurrency"),
            ]),
        .testTarget(
            name: "NodoAssistIPCTests",
            dependencies: [
                "NodoAssistIPC",
                "NodoAssist",
                "NodoAssistMacCLI",
                "NodoAssistDiscovery",
                .product(name: "NodoAssistProtocol", package: "NodoAssistKit"),
                .product(name: "SwabbleKit", package: "swabble"),
            ],
            swiftSettings: [
                .enableUpcomingFeature("StrictConcurrency"),
                .enableExperimentalFeature("SwiftTesting"),
            ]),
    ])

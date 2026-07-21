// swift-tools-version: 6.2

import PackageDescription

let package = Package(
    name: "NodoAssistKit",
    platforms: [
        .iOS(.v18),
        .macOS(.v15),
    ],
    products: [
        .library(name: "NodoAssistProtocol", targets: ["NodoAssistProtocol"]),
        .library(name: "NodoAssistKit", targets: ["NodoAssistKit"]),
        .library(name: "NodoAssistChatUI", targets: ["NodoAssistChatUI"]),
    ],
    traits: [
        .trait(name: "Talk", description: "ElevenLabs cloud TTS / talk support"),
        .default(enabledTraits: ["Talk"]),
    ],
    dependencies: [
        .package(url: "https://github.com/steipete/ElevenLabsKit", exact: "0.1.1"),
        .package(url: "https://github.com/mgriebling/SwiftMath", exact: "1.7.3"),
        .package(url: "https://github.com/swiftlang/swift-markdown", exact: "0.8.0"),
    ],
    targets: [
        .target(
            name: "NodoAssistProtocol",
            path: "Sources/NodoAssistProtocol",
            swiftSettings: [
                .enableUpcomingFeature("StrictConcurrency"),
            ]),
        .target(
            name: "NodoAssistKit",
            dependencies: [
                "NodoAssistProtocol",
                .product(name: "ElevenLabsKit", package: "ElevenLabsKit", condition: .when(traits: ["Talk"])),
            ],
            path: "Sources/NodoAssistKit",
            resources: [
                .process("Resources"),
            ],
            swiftSettings: [
                .enableUpcomingFeature("StrictConcurrency"),
            ]),
        .target(
            name: "NodoAssistChatUI",
            dependencies: [
                "NodoAssistKit",
                .product(name: "Markdown", package: "swift-markdown"),
                .product(name: "SwiftMath", package: "SwiftMath"),
            ],
            path: "Sources/NodoAssistChatUI",
            swiftSettings: [
                .enableUpcomingFeature("StrictConcurrency"),
            ]),
        .testTarget(
            name: "NodoAssistKitTests",
            dependencies: ["NodoAssistKit", "NodoAssistChatUI"],
            path: "Tests/NodoAssistKitTests",
            swiftSettings: [
                .enableUpcomingFeature("StrictConcurrency"),
                .enableExperimentalFeature("SwiftTesting"),
            ]),
    ])

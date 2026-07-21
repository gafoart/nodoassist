import NodoAssistKit
import SwiftUI
import UIKit

struct GatewayProblemBanner: View {
    let problem: GatewayConnectionProblem
    var primaryActionTitle: String?
    var onPrimaryAction: (() -> Void)?
    var onShowDetails: (() -> Void)?

    var body: some View {
        NodoAssistNoticeBanner(
            icon: self.iconName,
            title: self.problem.title,
            message: self.problem.message,
            ownerLabel: self.ownerLabel,
            tint: self.tint,
            detail: self.problem.requestId.map(NodoAssistNoticeDetail.requestID),
            primaryActionTitle: self.primaryActionTitle,
            onPrimaryAction: self.onPrimaryAction,
            secondaryActionTitle: "Details",
            onSecondaryAction: self.onShowDetails)
    }

    private var iconName: String {
        switch self.problem.kind {
        case .pairingRequired,
             .pairingRoleUpgradeRequired,
             .pairingScopeUpgradeRequired,
             .pairingMetadataUpgradeRequired:
            "person.crop.circle.badge.clock"
        case .timeout, .connectionRefused, .reachabilityFailed, .websocketCancelled:
            "wifi.exclamationmark"
        case .deviceIdentityRequired,
             .deviceSignatureExpired,
             .deviceNonceRequired,
             .deviceNonceMismatch,
             .deviceSignatureInvalid,
             .devicePublicKeyInvalid,
             .deviceIdMismatch:
            "lock.shield"
        default:
            "exclamationmark.triangle.fill"
        }
    }

    private var tint: Color {
        switch self.problem.kind {
        case .pairingRequired,
             .pairingRoleUpgradeRequired,
             .pairingScopeUpgradeRequired,
             .pairingMetadataUpgradeRequired:
            NodoAssistBrand.warn
        case .timeout, .connectionRefused, .reachabilityFailed, .websocketCancelled:
            NodoAssistBrand.warn
        default:
            NodoAssistBrand.danger
        }
    }

    private var ownerLabel: String {
        switch self.problem.owner {
        case .gateway:
            "Fix on gateway"
        case .iphone:
            "Fix on this device"
        case .both:
            "Check both"
        case .network:
            "Check network"
        case .unknown:
            "Needs attention"
        }
    }
}

struct GatewayProblemDetailsSheet: View {
    @Environment(\.dismiss) private var dismiss

    let problem: GatewayConnectionProblem
    var primaryActionTitle: String?
    var onPrimaryAction: (() -> Void)?

    @State private var copyFeedback: String?

    var body: some View {
        NavigationStack {
            List {
                Section {
                    VStack(alignment: .leading, spacing: 10) {
                        Text(self.problem.title)
                            .font(NodoAssistType.title3)
                        Text(self.problem.message)
                            .font(NodoAssistType.body)
                            .foregroundStyle(.secondary)
                        Text(self.ownerSummary)
                            .font(NodoAssistType.footnoteSemiBold)
                            .foregroundStyle(.secondary)
                    }
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .padding(.vertical, 4)
                }

                if let requestId = self.problem.requestId {
                    Section {
                        Text(verbatim: requestId)
                            .font(NodoAssistType.mono)
                            .textSelection(.enabled)
                        Button {
                            UIPasteboard.general.string = requestId
                            self.copyFeedback = "Copied request ID"
                        } label: {
                            Text("Copy request ID")
                                .font(NodoAssistType.subheadSemiBold)
                        }
                        .font(NodoAssistType.subheadSemiBold)
                    } header: {
                        Text("Request")
                            .font(NodoAssistType.captionSemiBold)
                    }
                }

                if let actionCommand = self.problem.actionCommand {
                    Section {
                        Text(verbatim: actionCommand)
                            .font(NodoAssistType.mono)
                            .textSelection(.enabled)
                        Button {
                            UIPasteboard.general.string = actionCommand
                            self.copyFeedback = "Copied command"
                        } label: {
                            Text("Copy command")
                                .font(NodoAssistType.subheadSemiBold)
                        }
                        .font(NodoAssistType.subheadSemiBold)
                    } header: {
                        Text("Gateway command")
                            .font(NodoAssistType.captionSemiBold)
                    }
                }

                if let docsURL = self.problem.docsURL {
                    Section {
                        Link(destination: docsURL) {
                            Label("Open docs", systemImage: "book")
                                .font(NodoAssistType.subheadSemiBold)
                        }
                        .font(NodoAssistType.subheadSemiBold)
                        Text(verbatim: docsURL.absoluteString)
                            .font(NodoAssistType.footnote)
                            .foregroundStyle(.secondary)
                            .textSelection(.enabled)
                    } header: {
                        Text("Help")
                            .font(NodoAssistType.captionSemiBold)
                    }
                }

                if let technicalDetails = self.problem.technicalDetails {
                    Section {
                        Text(verbatim: technicalDetails)
                            .font(NodoAssistType.monoFootnote)
                            .foregroundStyle(.secondary)
                            .textSelection(.enabled)
                    } header: {
                        Text("Technical details")
                            .font(NodoAssistType.captionSemiBold)
                    }
                }

                if let copyFeedback {
                    Section {
                        Text(copyFeedback)
                            .font(NodoAssistType.footnote)
                            .foregroundStyle(.secondary)
                    }
                }
            }
            .navigationTitle("Connection problem")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .principal) {
                    Text("Connection problem")
                        .font(NodoAssistType.headline)
                }
                ToolbarItem(placement: .topBarLeading) {
                    if let primaryActionTitle, let onPrimaryAction {
                        Button {
                            self.dismiss()
                            onPrimaryAction()
                        } label: {
                            Text(primaryActionTitle)
                                .font(NodoAssistType.subheadSemiBold)
                        }
                        .font(NodoAssistType.subheadSemiBold)
                    }
                }
                ToolbarItem(placement: .topBarTrailing) {
                    Button {
                        self.dismiss()
                    } label: {
                        Text("Done")
                            .font(NodoAssistType.subheadSemiBold)
                    }
                    .font(NodoAssistType.subheadSemiBold)
                }
            }
        }
    }

    private var ownerSummary: String {
        switch self.problem.owner {
        case .gateway:
            "Primary fix: gateway"
        case .iphone:
            "Primary fix: this device"
        case .both:
            "Primary fix: check both this device and the gateway"
        case .network:
            "Primary fix: network or remote access"
        case .unknown:
            "Primary fix: review details and retry"
        }
    }
}

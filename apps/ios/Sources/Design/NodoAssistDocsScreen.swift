import SwiftUI

struct NodoAssistDocsScreen: View {
    private let docsURL = URL(string: "https://docs.openclaw.ai")!
    private let gatewayURL = URL(string: "https://docs.openclaw.ai/gateway")!
    private let pairingURL = URL(string: "https://docs.openclaw.ai/channels/pairing")!
    let headerLeadingAction: NodoAssistSidebarHeaderAction?
    let usesNativeNavigationChrome: Bool
    let gatewayAction: (() -> Void)?

    init(
        headerLeadingAction: NodoAssistSidebarHeaderAction? = nil,
        usesNativeNavigationChrome: Bool = false,
        gatewayAction: (() -> Void)? = nil)
    {
        self.headerLeadingAction = headerLeadingAction
        self.usesNativeNavigationChrome = usesNativeNavigationChrome
        self.gatewayAction = gatewayAction
    }

    var body: some View {
        ZStack {
            NodoAssistProBackground()
            ScrollView {
                VStack(alignment: .leading, spacing: 16) {
                    if !self.usesNativeNavigationChrome {
                        self.headerCard
                    }
                    self.linkCard
                }
                .padding(.vertical, 18)
                .font(NodoAssistType.body)
            }
        }
        .navigationTitle("Docs")
        .navigationBarTitleDisplayMode(.inline)
        .toolbar(self.usesNativeNavigationChrome ? .visible : .hidden, for: .navigationBar)
        .toolbar {
            if self.usesNativeNavigationChrome, let gatewayAction {
                ToolbarItem(placement: .topBarTrailing) {
                    Button(action: gatewayAction) {
                        Image(systemName: "antenna.radiowaves.left.and.right")
                            .font(NodoAssistType.subheadSemiBold)
                    }
                    .accessibilityLabel("Gateway settings")
                }
            }
        }
    }

    private var headerCard: some View {
        ProCard(radius: NodoAssistProMetric.cardRadius) {
            NodoAssistAdaptiveHeaderRow(
                title: "Docs",
                subtitle: "Gateway setup, pairing, channels, and mobile node reference.",
                titleFont: NodoAssistType.headline,
                subtitleFont: NodoAssistType.caption)
            {
                HStack(alignment: .top, spacing: 12) {
                    if let headerLeadingAction {
                        NodoAssistSidebarHeaderLeadingSlot(action: headerLeadingAction)
                    }
                    ProIconBadge(systemName: "book", color: NodoAssistBrand.accent)
                }
            } accessory: {
                self.gatewayPill
            }
        }
        .padding(.horizontal, NodoAssistProMetric.pagePadding)
    }

    @ViewBuilder
    private var gatewayPill: some View {
        if let gatewayAction {
            Button(action: gatewayAction) {
                NodoAssistGatewayCompactPill()
            }
            .buttonBorderShape(.capsule)
            .nodoAssistGlassButton()
            .accessibilityHint("Opens Settings / Gateway")
        } else {
            NodoAssistGatewayCompactPill()
        }
    }

    private var linkCard: some View {
        ProCard(padding: 0, radius: NodoAssistProMetric.cardRadius) {
            VStack(spacing: 0) {
                self.docsLinkRow(
                    title: "Docs Home",
                    detail: "Browse the current NodoAssist reference.",
                    icon: "book",
                    url: self.docsURL)
                Divider().padding(.leading, 58)
                self.docsLinkRow(
                    title: "Gateway",
                    detail: "Connection, auth, and diagnostics.",
                    icon: "network",
                    url: self.gatewayURL)
                Divider().padding(.leading, 58)
                self.docsLinkRow(
                    title: "Pairing",
                    detail: "Mobile setup codes, QR, and node approval.",
                    icon: "qrcode",
                    url: self.pairingURL)
            }
        }
        .padding(.horizontal, NodoAssistProMetric.pagePadding)
    }

    private func docsLinkRow(title: String, detail: String, icon: String, url: URL) -> some View {
        Link(destination: url) {
            HStack(spacing: 12) {
                ProIconBadge(systemName: icon, color: NodoAssistBrand.accent)
                VStack(alignment: .leading, spacing: 3) {
                    Text(title)
                        .font(NodoAssistType.subheadSemiBold)
                    Text(detail)
                        .font(NodoAssistType.caption)
                        .foregroundStyle(.secondary)
                        .lineLimit(1)
                }
                Spacer(minLength: 8)
                Image(systemName: "arrow.up.right")
                    .font(NodoAssistType.captionBold)
                    .foregroundStyle(.secondary)
            }
            .padding(.horizontal, 14)
            .padding(.vertical, 12)
            .contentShape(Rectangle())
        }
        .buttonStyle(.plain)
    }
}

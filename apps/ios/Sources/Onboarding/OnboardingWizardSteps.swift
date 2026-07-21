import SwiftUI
import UIKit

private enum OnboardingVisual {
    static let maxWidth: CGFloat = 430
}

private struct OnboardingActivationCanvas<Content: View>: View {
    @ViewBuilder let content: Content

    var body: some View {
        GeometryReader { proxy in
            ScrollView {
                self.content
                    .frame(maxWidth: OnboardingVisual.maxWidth)
                    .frame(maxWidth: .infinity)
                    .frame(minHeight: max(0, proxy.size.height - 94), alignment: .top)
                    .padding(.horizontal, 20)
                    .padding(.top, 54)
                    .padding(.bottom, 40)
            }
            .scrollIndicators(.hidden)
            .background(NodoAssistBrand.activationCanvasGradient.ignoresSafeArea())
        }
    }
}

private struct OnboardingHeroGlyph: View {
    var body: some View {
        NodoAssistActivationGlyph(size: 78)
    }
}

private struct OnboardingHeroHeader: View {
    let title: LocalizedStringKey
    let subtitle: LocalizedStringKey?

    var body: some View {
        VStack(spacing: 18) {
            OnboardingHeroGlyph()

            VStack(spacing: 8) {
                Text(self.title)
                    .font(NodoAssistType.title1)
                    .multilineTextAlignment(.center)

                if let subtitle {
                    Text(subtitle)
                        .font(NodoAssistType.body)
                        .foregroundStyle(.secondary)
                        .multilineTextAlignment(.center)
                        .fixedSize(horizontal: false, vertical: true)
                }
            }
        }
        .frame(maxWidth: .infinity)
    }
}

private struct OnboardingWelcomePrompt: View {
    let text: LocalizedStringKey

    var body: some View {
        Text(self.text)
            .font(NodoAssistType.body)
            .foregroundStyle(.secondary)
            .multilineTextAlignment(.center)
            .frame(maxWidth: .infinity)
            .fixedSize(horizontal: false, vertical: true)
    }
}

private typealias OnboardingPrimaryButtonStyle = NodoAssistPrimaryActionButtonStyle

private enum OnboardingIntroPanelStyle {
    static let iconSize: CGFloat = 34
    static let contentSpacing: CGFloat = 12
    static let panelPadding: CGFloat = 16
    static let panelCornerRadius: CGFloat = 22

    static let panelFill = NodoAssistBrand.activationNeutralSurface
    static let iconFill = NodoAssistBrand.activationNeutralInsetSurface
    static let stroke = NodoAssistBrand.activationNeutralStroke
}

private struct OnboardingIntroPanel<Content: View>: View {
    @ViewBuilder let content: Content

    var body: some View {
        self.content
            .padding(Self.panelPadding)
            .frame(maxWidth: .infinity, alignment: .leading)
            .background {
                RoundedRectangle(cornerRadius: OnboardingIntroPanelStyle.panelCornerRadius, style: .continuous)
                    .fill(OnboardingIntroPanelStyle.panelFill)
            }
            .overlay(alignment: .top) {
                RoundedRectangle(cornerRadius: OnboardingIntroPanelStyle.panelCornerRadius, style: .continuous)
                    .stroke(Color.white.opacity(0.42), lineWidth: 0.5)
                    .blendMode(.plusLighter)
            }
            .overlay {
                RoundedRectangle(cornerRadius: OnboardingIntroPanelStyle.panelCornerRadius, style: .continuous)
                    .stroke(OnboardingIntroPanelStyle.stroke, lineWidth: 0.5)
            }
    }

    private static var panelPadding: CGFloat {
        OnboardingIntroPanelStyle.panelPadding
    }
}

private struct OnboardingIntroIcon: View {
    let symbol: String
    let tint: Color

    var body: some View {
        Image(systemName: self.symbol)
            .font(NodoAssistType.subheadSemiBold)
            .foregroundStyle(self.tint)
            .frame(
                width: OnboardingIntroPanelStyle.iconSize,
                height: OnboardingIntroPanelStyle.iconSize)
            .background {
                Circle()
                    .fill(OnboardingIntroPanelStyle.iconFill)
            }
            .overlay {
                Circle()
                    .stroke(OnboardingIntroPanelStyle.stroke, lineWidth: 0.6)
            }
    }
}

private struct OnboardingSafetyRow: View {
    let symbol: String
    let title: LocalizedStringKey

    var body: some View {
        HStack(spacing: OnboardingIntroPanelStyle.contentSpacing) {
            OnboardingIntroIcon(
                symbol: self.symbol,
                tint: NodoAssistBrand.activationPrimaryAction)

            Text(self.title)
                .font(NodoAssistType.subheadSemiBold)
                .foregroundStyle(.primary)
                .fixedSize(horizontal: false, vertical: true)
        }
        .accessibilityElement(children: .combine)
    }
}

private struct OnboardingSecurityNotice: View {
    var body: some View {
        OnboardingIntroPanel {
            HStack(alignment: .top, spacing: OnboardingIntroPanelStyle.contentSpacing) {
                OnboardingIntroIcon(
                    symbol: "exclamationmark.triangle.fill",
                    tint: NodoAssistBrand.warn)

                VStack(alignment: .leading, spacing: 6) {
                    Text("Security notice")
                        .font(NodoAssistType.subheadSemiBold)
                        .foregroundStyle(.primary)
                    (
                        Text("The connected NodoAssist agent can use device capabilities you enable.")
                            + Text(verbatim: " ")
                            + Text(
                                "Camera, microphone, photos, contacts, calendar, and location may be available.")
                            + Text(verbatim: " ")
                            + Text(
                                "Continue only if you trust the gateway and agent you connect to."))
                        .font(NodoAssistType.footnote)
                        .foregroundStyle(.secondary)
                        .fixedSize(horizontal: false, vertical: true)
                }
            }
        }
        .accessibilityElement(children: .combine)
    }
}

private struct OnboardingCommandChip: View {
    @State private var didCopy = false
    private let command = "nodoassist qr"

    var body: some View {
        HStack(spacing: 8) {
            Text(self.command)
                .font(NodoAssistType.mono)
                .textSelection(.enabled)
            Spacer(minLength: 0)
            Button {
                self.copyCommand()
            } label: {
                Image(systemName: self.didCopy ? "checkmark" : "doc.on.doc")
                    .font(NodoAssistType.subheadSemiBold)
                    .foregroundStyle(
                        self.didCopy ? NodoAssistBrand.activationPrimaryAction : Color.secondary.opacity(0.56))
                    .frame(width: 38, height: 38)
                    .contentTransition(.symbolEffect(.replace))
            }
            .buttonStyle(.plain)
            .contentShape(Rectangle())
            .accessibilityLabel("Copy setup code command")
            .accessibilityValue(self.didCopy ? "Copied" : self.command)
        }
        .foregroundStyle(NodoAssistBrand.activationPrimaryAction)
        .padding(.horizontal, 16)
        .frame(maxWidth: .infinity, alignment: .leading)
        .frame(height: 54)
        .background {
            RoundedRectangle(cornerRadius: 20, style: .continuous)
                .fill(NodoAssistBrand.activationNeutralSurface)
        }
        .overlay {
            RoundedRectangle(cornerRadius: 20, style: .continuous)
                .stroke(NodoAssistBrand.activationNeutralStroke, lineWidth: 0.5)
        }
    }

    private func copyCommand() {
        UIPasteboard.general.string = self.command
        withAnimation(.smooth(duration: 0.14)) {
            self.didCopy = true
        }
        Task { @MainActor in
            try? await Task.sleep(nanoseconds: 1_100_000_000)
            withAnimation(.smooth(duration: 0.16)) {
                self.didCopy = false
            }
        }
    }
}

struct OnboardingIntroStep: View {
    let onContinue: () -> Void

    var body: some View {
        OnboardingActivationCanvas {
            VStack(alignment: .leading, spacing: 0) {
                OnboardingHeroHeader(
                    title: "NodoAssist",
                    subtitle: "Securely connect this iPhone to your gateway.")
                    .padding(.top, 18)

                OnboardingIntroPanel {
                    VStack(alignment: .leading, spacing: 14) {
                        OnboardingSafetyRow(
                            symbol: "link",
                            title: "Connect to your gateway")
                        OnboardingSafetyRow(
                            symbol: "hand.raised",
                            title: "Choose device permissions")
                        OnboardingSafetyRow(
                            symbol: "message.fill",
                            title: "Use NodoAssist from your phone")
                    }
                }
                .padding(.top, 44)

                OnboardingSecurityNotice()
                    .padding(.top, 18)

                Spacer(minLength: 40)

                VStack(spacing: 14) {
                    Button {
                        self.onContinue()
                    } label: {
                        Text("Continue")
                            .font(NodoAssistType.subheadSemiBold)
                    }
                    .buttonStyle(OnboardingPrimaryButtonStyle())
                }
            }
        }
    }
}

struct OnboardingWelcomeStep: View {
    let statusLine: String
    let isConnecting: Bool
    let onScanQRCode: () -> Void
    let onManualSetup: () -> Void

    var body: some View {
        let statusText = self.statusLine.trimmingCharacters(in: .whitespacesAndNewlines)

        OnboardingActivationCanvas {
            VStack(alignment: .leading, spacing: 0) {
                OnboardingHeroHeader(
                    title: "Connect Gateway",
                    subtitle: nil)
                    .padding(.top, 18)

                VStack(spacing: 36) {
                    VStack(spacing: 14) {
                        OnboardingWelcomePrompt(text: "Run this on your gateway host and scan the code")

                        OnboardingCommandChip()

                        Button(action: self.onScanQRCode) {
                            if self.isConnecting {
                                HStack(spacing: 8) {
                                    ProgressView()
                                        .progressViewStyle(.circular)
                                        .tint(NodoAssistBrand.activationPrimaryActionText)
                                    Text("Connecting…")
                                        .font(NodoAssistType.subheadSemiBold)
                                }
                            } else {
                                Text("Scan QR")
                                    .font(NodoAssistType.subheadSemiBold)
                            }
                        }
                        .buttonStyle(OnboardingPrimaryButtonStyle())
                        .disabled(self.isConnecting)
                    }

                    VStack(spacing: 14) {
                        OnboardingWelcomePrompt(text: "or")

                        Button(action: self.onManualSetup) {
                            Text("Connect Manually")
                                .font(NodoAssistType.subheadSemiBold)
                        }
                        .buttonStyle(NodoAssistSecondaryActionButtonStyle(height: 54, shadowOpacity: 0.018))
                        .disabled(self.isConnecting)
                    }
                }
                .padding(.top, 46)

                if !statusText.isEmpty {
                    Text(verbatim: statusText)
                        .font(NodoAssistType.footnote)
                        .foregroundStyle(.secondary)
                        .frame(maxWidth: .infinity, alignment: .center)
                        .multilineTextAlignment(.center)
                        .padding(.horizontal, 6)
                        .padding(.top, 14)
                        .transition(.opacity)
                }

                Spacer(minLength: 40)
            }
            .animation(.smooth(duration: 0.18), value: statusText)
        }
    }
}

struct OnboardingSuccessStep: View {
    let gatewayName: String
    let gatewayAddress: String?
    let onGetStarted: () -> Void

    var body: some View {
        OnboardingActivationCanvas {
            VStack(spacing: 0) {
                Spacer(minLength: 54)

                ZStack(alignment: .bottomTrailing) {
                    NodoAssistActivationGlyph(size: 86)
                        .shadow(color: NodoAssistBrand.activationGlow.opacity(0.18), radius: 12, x: 0, y: 6)

                    Image(systemName: "checkmark")
                        .font(NodoAssistType.headlineBold)
                        .foregroundStyle(.white)
                        .frame(width: 30, height: 30)
                        .background {
                            Circle()
                                .fill(NodoAssistBrand.ok)
                        }
                        .overlay {
                            Circle()
                                .stroke(NodoAssistBrand.activationCanvas, lineWidth: 3)
                        }
                }
                .padding(.bottom, 22)

                Text("You're connected")
                    .font(NodoAssistType.title1)
                    .multilineTextAlignment(.center)
                    .padding(.bottom, 8)

                Text(verbatim: self.gatewayName)
                    .font(NodoAssistType.subheadSemiBold)
                    .foregroundStyle(.secondary)
                    .multilineTextAlignment(.center)

                if let gatewayAddress, !gatewayAddress.isEmpty {
                    Text(verbatim: gatewayAddress)
                        .font(NodoAssistType.footnote)
                        .foregroundStyle(.secondary)
                        .multilineTextAlignment(.center)
                        .padding(.top, 4)
                }

                Spacer(minLength: 40)

                Button {
                    self.onGetStarted()
                } label: {
                    Label("Go to Chat", systemImage: "bubble.left.and.bubble.right.fill")
                        .font(NodoAssistType.subheadSemiBold)
                }
                .buttonStyle(OnboardingPrimaryButtonStyle())
            }
        }
    }
}

struct OnboardingModeIcon: View {
    let symbol: String
    let selected: Bool

    var body: some View {
        Image(systemName: self.symbol)
            .font(NodoAssistType.subheadSemiBold)
            .foregroundStyle(self.selected ? NodoAssistBrand.activationPrimaryActionText : .secondary)
            .frame(width: 34, height: 34)
            .background {
                RoundedRectangle(cornerRadius: 12, style: .continuous)
                    .fill(self.selected ? NodoAssistBrand.activationPrimaryGradient : NodoAssistBrand
                        .activationNeutralGradient)
                    .shadow(
                        color: self.selected ? NodoAssistBrand.activationGlow.opacity(0.18) : .clear,
                        radius: 5,
                        x: 0,
                        y: 2)
            }
            .overlay {
                RoundedRectangle(cornerRadius: 12, style: .continuous)
                    .stroke(
                        self.selected ? Color.white.opacity(0.30) : NodoAssistBrand.activationNeutralStroke,
                        lineWidth: 0.5)
            }
    }
}

struct OnboardingModeRow: View {
    let title: LocalizedStringKey
    let subtitle: LocalizedStringKey
    let symbol: String
    let selected: Bool
    let action: () -> Void

    var body: some View {
        Button(action: self.action) {
            HStack(spacing: 12) {
                OnboardingModeIcon(symbol: self.symbol, selected: self.selected)

                VStack(alignment: .leading, spacing: 2) {
                    Text(self.title)
                        .font(NodoAssistType.subheadSemiBold)
                    Text(self.subtitle)
                        .font(NodoAssistType.footnote)
                        .foregroundStyle(.secondary)
                }
                Spacer()
                Image(systemName: self.selected ? "checkmark.circle.fill" : "circle")
                    .font(self.selected ? .title3.weight(.semibold) : .title3.weight(.regular))
                    .foregroundStyle(
                        self.selected
                            ? NodoAssistBrand.activationPrimaryAction
                            : Color(uiColor: .quaternaryLabel).opacity(0.55))
            }
            .padding(.vertical, 6)
            .frame(minHeight: 52)
            .contentShape(Rectangle())
        }
        .buttonStyle(.plain)
    }
}

import NodoAssistKit
import SwiftUI

/// iOS Settings-style icon: white glyph on a solid rounded-square, sized for a List row.
struct SettingsIcon: View {
    let systemName: String
    let color: Color

    var body: some View {
        Image(systemName: self.systemName)
            .font(.system(size: 14, weight: .semibold))
            .foregroundStyle(.white)
            .frame(width: 28, height: 28)
            .background(RoundedRectangle(cornerRadius: 7, style: .continuous).fill(self.color))
    }
}

private struct AppearanceSettingsRow: View {
    @Environment(AppAppearanceModel.self) private var appearanceModel

    private var preference: AppAppearancePreference {
        self.appearanceModel.preference
    }

    var body: some View {
        NavigationLink {
            AppearanceSettingsScreen()
        } label: {
            self.rowLabel
        }
        .accessibilityIdentifier("settings-appearance-row")
        .accessibilityLabel("Appearance")
        .accessibilityValue(self.preference.label)
        .accessibilityHint("Choose system, light, or dark appearance")
    }

    private var rowLabel: some View {
        HStack(spacing: 12) {
            ProIconBadge(
                systemName: "circle.lefthalf.filled",
                color: .secondary)

            Text("Appearance")
                .font(NodoAssistType.subheadSemiBold)

            Spacer(minLength: 8)

            Text(self.preference.label)
                .font(NodoAssistType.subhead)
                .foregroundStyle(.secondary)
        }
    }
}

private struct AppearanceSettingsScreen: View {
    @Environment(AppAppearanceModel.self) private var appearanceModel
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        List {
            Section {
                ForEach(AppAppearancePreference.allCases) { preference in
                    Button {
                        self.select(preference)
                    } label: {
                        Label {
                            HStack {
                                Text(preference.label)
                                    .font(NodoAssistType.body)
                                Spacer()
                                if preference == self.appearanceModel.preference {
                                    Image(systemName: "checkmark")
                                        .foregroundStyle(NodoAssistBrand.accent)
                                }
                            }
                        } icon: {
                            Image(systemName: preference.systemImage)
                        }
                    }
                    .foregroundStyle(.primary)
                    .accessibilityIdentifier("settings-appearance-\(preference.rawValue)")
                    .accessibilityValue(
                        preference == self.appearanceModel.preference ? "Selected" : "")
                }
            } footer: {
                Text("System follows this device’s appearance setting.")
                    .font(NodoAssistType.footnote)
            }
        }
        .navigationTitle("Appearance")
        .navigationBarTitleDisplayMode(.inline)
    }

    private func select(_ preference: AppAppearancePreference) {
        guard preference != self.appearanceModel.preference else { return }
        self.dismiss()
        Task { @MainActor in
            // Changing the root scheme while an iPad split-view destination is active can
            // leave that destination blank. Apply only after the native pop transition.
            try? await Task.sleep(for: .milliseconds(500))
            self.appearanceModel.select(preference)
        }
    }
}

extension SettingsProTab {
    var appearanceRow: some View {
        AppearanceSettingsRow()
    }

    var gatewaySection: some View {
        Section("Gateway") {
            HStack(spacing: 8) {
                NavigationLink(value: SettingsRoute.gateway) {
                    self.gatewayConnectionRow
                }
                if self.gatewayRegistry.entries.count > 1 {
                    self.gatewayQuickSwitchMenu
                }
            }
            SettingsDetailRow("Address", value: self.gatewayAddress)
            SettingsDetailRow("Server", value: self.gatewayServer)
            SettingsDetailRow("Agents", value: "\(self.appModel.gatewayAgents.count)")
            self.gatewayActions
        }
    }

    var gatewayConnectionRow: some View {
        LabeledContent {
            Text(self.gatewayStatusDetail)
                .font(NodoAssistType.subhead)
                .foregroundStyle(self.gatewayStatusColor)
        } label: {
            Text("Connection")
                .font(NodoAssistType.subheadSemiBold)
        }
    }

    @ViewBuilder var settingsListSection: some View {
        Section {
            self.settingsListRow(
                icon: "checkmark.shield.fill",
                iconColor: self.pendingApproval == nil ? .green : .orange,
                title: "Approvals",
                route: .approvals,
                badgeValue: self.pendingApproval == nil ? nil : "1")
            self.settingsListRow(
                icon: "person.2.fill",
                iconColor: .blue,
                title: "Permissions",
                route: .permissions)
            self.settingsListRow(
                icon: "point.3.connected.trianglepath.dotted",
                iconColor: .purple,
                title: "Channels",
                route: .channels)
            self.settingsListRow(
                icon: "waveform",
                iconColor: .pink,
                title: "Voice & Talk",
                route: .voice)
        }

        Section {
            self.appearanceRow
            self.settingsListRow(
                icon: "stethoscope",
                iconColor: .teal,
                title: "Diagnostics",
                route: .diagnostics)
            self.settingsListRow(
                icon: "hand.raised.fill",
                iconColor: .indigo,
                title: "Privacy",
                route: .privacy)
            self.settingsListRow(
                icon: "bell.fill",
                iconColor: .red,
                title: "Notifications",
                route: .notifications)
            self.settingsListRow(
                icon: "info.circle.fill",
                iconColor: .gray,
                title: "About",
                route: .about)
        } header: {
            Text("Device")
                .font(NodoAssistType.captionSemiBold)
                .foregroundStyle(.secondary)
        }

        Section {
            self.settingsListRow(
                icon: "doc.text",
                iconColor: .gray,
                title: "Licenses",
                route: .licenses)
                .accessibilityIdentifier("settings-licenses-row")
        }
    }

    func settingsListRow(
        icon: String,
        iconColor: Color,
        title: String,
        route: SettingsRoute,
        badgeValue: String? = nil) -> some View
    {
        NavigationLink(value: route) {
            Label {
                Text(title)
                    .font(NodoAssistType.subheadSemiBold)
            } icon: {
                SettingsIcon(systemName: icon, color: iconColor)
            }
        }
        .badge(badgeValue.map { Text($0).font(NodoAssistType.captionSemiBold) })
    }

    @ViewBuilder
    func destination(for route: SettingsRoute) -> some View {
        switch route {
        case .channels:
            SettingsChannelsDestination()
                .navigationTitle(title(for: route))
                .navigationBarTitleDisplayMode(.inline)
        default:
            List {
                switch route {
                case .gateway:
                    self.gatewayDestination
                case .approvals:
                    self.approvalsDestination
                case .permissions:
                    self.permissionsDestination
                case .voice:
                    self.voiceDestination
                case .diagnostics:
                    self.diagnosticsDestination
                case .privacy:
                    self.privacyDestination
                case .notifications:
                    self.notificationsDestination
                case .about:
                    self.aboutDestination
                case .licenses:
                    self.licensesDestination
                case .channels:
                    EmptyView()
                }
            }
            .font(NodoAssistType.body)
            .navigationTitle(title(for: route))
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                if let headerLeadingAction {
                    ToolbarItem(placement: .topBarLeading) {
                        NodoAssistSidebarHeaderLeadingSlot(action: headerLeadingAction)
                    }
                }
                ToolbarItem(placement: .principal) {
                    Text(title(for: route))
                        .font(NodoAssistType.headline)
                        .foregroundStyle(.primary)
                }
            }
        }
    }

    var gatewayDestination: some View {
        Group {
            self.detailStatusCard(
                icon: "antenna.radiowaves.left.and.right",
                title: "Gateway",
                detail: self.gatewayStatusDetail,
                value: self.gatewayStatusValue,
                color: self.gatewayStatusColor)

            self.detailListCard {
                SettingsDetailRow("Address", value: self.gatewayAddress)
                SettingsDetailRow("Server", value: self.gatewayServer)
                SettingsDetailRow("Discovered", value: "\(self.gatewayController.gateways.count)")
                SettingsDetailRow("Default Agent", value: self.appModel.activeAgentName)
                SettingsDetailRow("Agents", value: "\(self.appModel.gatewayAgents.count)")
            }

            Section {
                Button {
                    Task { await self.reconnectGateway() }
                } label: {
                    Label("Reconnect", systemImage: "arrow.triangle.2.circlepath")
                        .font(NodoAssistType.body)
                }
                .disabled(self.isReconnectingGateway || self.appModel.isAppleReviewDemoModeEnabled)
                Button {
                    Task { await self.runDiagnostics() }
                } label: {
                    Label("Diagnose", systemImage: "cross.case")
                        .font(NodoAssistType.body)
                }
                .disabled(self.isRefreshingGateway)
            }

            self.manualGatewayCard
            self.pairedGatewaysCard
            self.deviceIdentityCard
            self.agentSelectionCard
            self.gatewaySetupCard
            self.discoveredGatewaysCard
            self.gatewayAdvancedCard
        }
        .font(NodoAssistType.body)
    }

    var gatewayQuickSwitchMenu: some View {
        Menu {
            ForEach(self.gatewayRegistry.entries) { entry in
                Button {
                    Task { await self.switchGateway(to: entry) }
                } label: {
                    Label {
                        Text(entry.name)
                            .font(NodoAssistType.body)
                    } icon: {
                        Image(systemName: entry.stableID == self.gatewayRegistry.activeStableID
                            ? "checkmark.circle.fill"
                            : "circle")
                    }
                }
                .disabled(entry.stableID == self.gatewayRegistry.activeStableID || self.connectingGatewayID != nil)
            }
        } label: {
            Image(systemName: "arrow.triangle.2.circlepath")
                .font(NodoAssistType.subheadSemiBold)
                .foregroundStyle(NodoAssistBrand.accent)
        }
        .accessibilityLabel("Switch Gateway")
    }

    var approvalsDestination: some View {
        Group {
            self.detailStatusCard(
                icon: "checkmark.shield.fill",
                title: "Approvals",
                detail: self.notificationsNeedAttention
                    ? "Out-of-app approval alerts need notification permission."
                    : (self.pendingApproval == nil ? "No gateway actions are waiting for review." :
                        "Review the pending gateway action."),
                value: self.notificationsNeedAttention
                    ? "Alerts Off"
                    : (self.pendingApproval == nil ? "clear" : "1 waiting"),
                color: self.notificationsNeedAttention ? NodoAssistBrand.warn :
                    (self.pendingApproval == nil ? NodoAssistBrand.ok : NodoAssistBrand.warn))

            if self.notificationsNeedAttention {
                self.approvalNotificationsWarningCard
            }

            self.approvalsReviewCard
        }
    }

    var approvalNotificationsWarningCard: some View {
        Section {
            VStack(alignment: .leading, spacing: 4) {
                Text("Notifications are off")
                    .font(NodoAssistType.subheadSemiBold)
                Text("Enable Notifications to receive approval alerts while NodoAssist is not open.")
                    .font(NodoAssistType.caption)
                    .foregroundStyle(.secondary)
                    .fixedSize(horizontal: false, vertical: true)
            }
            if self.directRoute == nil {
                Button {
                    self.openNotificationsRouteFromApprovals()
                } label: {
                    Label("Open Notifications", systemImage: "bell.badge")
                        .font(NodoAssistType.body)
                }
            }
        }
    }

    @ViewBuilder
    var approvalsReviewCard: some View {
        if let pendingApproval {
            Section {
                ForEach(self.approvalItems, id: \.id) { item in
                    SettingsApprovalRow(item: item)
                }
                if let errorText = self.appModel.pendingExecApprovalPromptErrorText {
                    Text(errorText)
                        .font(NodoAssistType.caption)
                        .foregroundStyle(NodoAssistBrand.danger)
                }
                Button {
                    Task { await self.appModel.resolvePendingExecApprovalPrompt(decision: "allow-once") }
                } label: {
                    Label("Allow", systemImage: "checkmark")
                        .font(NodoAssistType.body)
                }
                .disabled(self.appModel.pendingExecApprovalPromptResolving)
                if pendingApproval.allowsAllowAlways {
                    Button {
                        Task { await self.appModel.resolvePendingExecApprovalPrompt(decision: "allow-always") }
                    } label: {
                        Label("Always Allow", systemImage: "checkmark.shield")
                            .font(NodoAssistType.body)
                    }
                    .disabled(self.appModel.pendingExecApprovalPromptResolving)
                }
                Button(role: .destructive) {
                    Task { await self.appModel.resolvePendingExecApprovalPrompt(decision: "deny") }
                } label: {
                    Label("Deny", systemImage: "xmark")
                        .font(NodoAssistType.body)
                }
                .disabled(self.appModel.pendingExecApprovalPromptResolving)
            }
        } else {
            Section {
                Label {
                    VStack(alignment: .leading, spacing: 2) {
                        Text("No approvals waiting")
                            .font(NodoAssistType.subheadSemiBold)
                        Text(self.approvalEmptyDetail)
                            .font(NodoAssistType.caption)
                            .foregroundStyle(.secondary)
                    }
                } icon: {
                    Image(systemName: "checkmark.shield.fill")
                        .foregroundStyle(NodoAssistBrand.ok)
                }
            }
        }
    }

    var permissionsDestination: some View {
        Group {
            self.toggleCard(
                title: "Camera",
                isOn: self.$cameraEnabled)

            self.locationModeCard

            self.toggleCard(
                title: "Keep Awake",
                isOn: self.$preventSleep)

            self.privacyAccessCard
        }
    }

    var voiceDestination: some View {
        Group {
            self.detailStatusCard(
                icon: "waveform",
                title: "Voice & Talk",
                detail: self.appModel.talkMode.gatewayTalkVoiceModeTitle,
                value: self.voiceDetail,
                color: self.talkEnabled || self.voiceWakeEnabled ? NodoAssistBrand.accent : .secondary)

            self.voiceFeatureCard
            self.talkVoiceSettingsCard
            self.shareSettingsCard
        }
    }

    var diagnosticsDestination: some View {
        Group {
            self.detailStatusCard(
                icon: "checklist.checked",
                title: "Health Check",
                detail: "Run app, permission, and gateway-adjacent checks without editing setup.",
                value: self.diagnosticsHealthValue,
                color: self.gatewayDiagnosticConnected ? NodoAssistBrand.ok : NodoAssistBrand.warn)

            Section {
                Button {
                    Task { await self.runDiagnostics() }
                } label: {
                    Label("Run Diagnostics", systemImage: "cross.case")
                        .font(NodoAssistType.body)
                }
                .disabled(self.isRefreshingGateway)
            }

            self.diagnosticChecksCard

            self.detailListCard {
                SettingsDetailRow("Device", value: DeviceInfoHelper.deviceFamily())
                SettingsDetailRow("Platform", value: DeviceInfoHelper.platformStringForDisplay())
                SettingsDetailRow("App", value: DeviceInfoHelper.nodoAssistVersionString())
                SettingsDetailRow("Model", value: DeviceInfoHelper.modelIdentifier())
            }

            self.diagnosticsAdvancedCard
        }
    }

    var privacyDestination: some View {
        Group {
            self.detailStatusCard(
                icon: "hand.raised",
                title: "Privacy",
                detail: "Control what device context NodoAssist can expose to the gateway.",
                value: self.privacyDetail,
                color: .secondary)

            self.toggleCard(
                title: "Camera Access",
                isOn: self.$cameraEnabled)

            self.locationModeCard

            self.toggleCard(
                title: "Background Listening",
                isOn: self.$talkBackgroundEnabled)

            self.privacyAccessCard
        }
    }

    var notificationsDestination: some View {
        Group {
            self.detailStatusCard(
                icon: "bell",
                title: "Notifications",
                detail: self.notificationStatusDetail,
                value: self.notificationStatusText,
                color: self.notificationStatus.color)

            Section {
                VStack(alignment: .leading, spacing: 12) {
                    Button {
                        self.handleNotificationAction()
                    } label: {
                        Label(
                            self.notificationActionText,
                            systemImage: self.notificationStatus.actionIcon)
                            .font(NodoAssistType.captionSemiBold)
                            .frame(maxWidth: .infinity)
                    }
                    .buttonStyle(.borderedProminent)
                    .controlSize(.small)
                    .disabled(self.notificationStatus == .checking || self.isRequestingNotificationAuthorization)

                    Text(self.notificationStatusDetail)
                        .font(NodoAssistType.caption)
                        .foregroundStyle(.secondary)
                        .fixedSize(horizontal: false, vertical: true)

                    Divider()

                    HStack(alignment: .top, spacing: 10) {
                        Image(systemName: "network")
                            .font(NodoAssistType.captionSemiBold)
                            .foregroundStyle(NodoAssistBrand.accent)
                            .frame(width: 22, height: 22)
                        Text(self.notificationRelayDetail)
                            .font(NodoAssistType.caption)
                            .foregroundStyle(.secondary)
                            .fixedSize(horizontal: false, vertical: true)
                    }
                }
            }
        }
    }

    var gatewayActions: some View {
        Group {
            self.gatewayActionButton(
                title: "Reconnect",
                icon: "arrow.triangle.2.circlepath",
                color: NodoAssistBrand.accent,
                isBusy: self.isReconnectingGateway,
                isDisabled: self.appModel.isAppleReviewDemoModeEnabled)
            {
                Task { await self.reconnectGateway() }
            }

            self.gatewayActionButton(
                title: "Diagnose",
                icon: "cross.case",
                color: NodoAssistBrand.accent,
                isBusy: self.isRefreshingGateway)
            {
                Task { await self.runDiagnostics() }
            }
        }
    }

    @ViewBuilder var licensesDestination: some View {
        let documents = LicenseDocumentLoader.bundledDocuments()
        if documents.isEmpty {
            ContentUnavailableView(
                "No Licenses Bundled",
                systemImage: "doc.text",
                description: Text("License files are not available in this build."))
                .font(NodoAssistType.body)
        } else {
            Section {
                ForEach(documents) { document in
                    NavigationLink {
                        LicenseDocumentDetailView(document: document)
                    } label: {
                        Label {
                            Text(document.title)
                                .font(NodoAssistType.subhead)
                        } icon: {
                            SettingsIcon(systemName: "doc.text", color: .gray)
                        }
                    }
                }
            } footer: {
                Text("NodoAssist appreciates its partners in the open-source community.")
                    .font(NodoAssistType.footnote)
            }
            .accessibilityIdentifier("settings-licenses-list")
        }
    }

    /// Native inset-grouped action row (plain tinted text, no pill chrome).
    func gatewayActionButton(
        title: String,
        icon: String,
        color: Color,
        isBusy: Bool,
        isDisabled: Bool = false,
        action: @escaping () -> Void) -> some View
    {
        Button(action: action) {
            HStack {
                Label(title, systemImage: icon)
                    .font(NodoAssistType.body)
                Spacer()
                if isBusy {
                    ProgressView().controlSize(.small)
                }
            }
            .contentShape(Rectangle())
        }
        .buttonStyle(.plain)
        .foregroundStyle(color)
        .disabled(isBusy || isDisabled)
        .accessibilityLabel(title)
    }

    var aboutDestination: some View {
        Group {
            Section {
                VStack(spacing: 12) {
                    NodoAssistProMark(size: 96, shadowRadius: 18)
                        .accessibilityHidden(true)
                    VStack(spacing: 2) {
                        Text("NodoAssist")
                            .font(NodoAssistType.title2SemiBold)
                        Text("Personal AI on your devices")
                            .font(NodoAssistType.footnote)
                            .foregroundStyle(.secondary)
                    }
                }
                .frame(maxWidth: .infinity)
                .padding(.top, 4)
                .accessibilityElement(children: .combine)
                .listRowBackground(Color.clear)
                .listRowSeparator(.hidden)
            }

            // Concise public details only; deep hardware identifiers live in Diagnostics.
            detailListCard {
                SettingsDetailRow("NodoAssist app version", value: DeviceInfoHelper.nodoAssistVersionString())
                SettingsDetailRow("Device", value: DeviceInfoHelper.deviceFamily())
                SettingsDetailRow("iOS", value: DeviceInfoHelper.iOSVersionStringForDisplay())
            }

            Section {
                self.aboutLinkRow(
                    title: "Website",
                    icon: "globe",
                    color: .blue,
                    url: URL(string: "https://openclaw.ai")!)
                self.aboutLinkRow(
                    title: "Docs",
                    icon: "book.fill",
                    color: .orange,
                    url: URL(string: "https://docs.openclaw.ai")!)
                self.aboutLinkRow(
                    title: "GitHub",
                    icon: "chevron.left.slash.chevron.right",
                    color: .gray,
                    url: URL(string: "https://github.com/openclaw/openclaw")!)
                self.aboutLinkRow(
                    title: "Discord",
                    icon: "bubble.left.and.bubble.right.fill",
                    color: .indigo,
                    url: URL(string: "https://discord.gg/clawd")!)
            } footer: {
                Text("© 2026 NodoAssist Foundation — MIT License.")
                    .font(NodoAssistType.footnote)
            }
        }
    }

    /// About link row with explicit branded label; shorthand `Link("Title", ...)`
    /// would bypass the typography audit and NodoAssistType styling.
    func aboutLinkRow(title: String, icon: String, color: Color, url: URL) -> some View {
        Link(destination: url) {
            HStack {
                Label {
                    Text(title)
                        .font(NodoAssistType.subheadSemiBold)
                        .foregroundStyle(.primary)
                } icon: {
                    SettingsIcon(systemName: icon, color: color)
                }
                Spacer()
                Image(systemName: "arrow.up.right")
                    .font(.system(size: 12, weight: .semibold))
                    .foregroundStyle(.secondary)
            }
            .contentShape(Rectangle())
        }
        .accessibilityLabel(title)
    }

    func toggleCard(title: String, isOn: Binding<Bool>) -> some View {
        Section {
            self.settingsToggle(title, isOn: isOn)
        }
    }

    var locationModeCard: some View {
        Section {
            VStack(alignment: .leading, spacing: 12) {
                HStack(spacing: 12) {
                    SettingsIcon(
                        systemName: "location",
                        color: self.locationModeRaw == NodoAssistLocationMode.off.rawValue ? .secondary : NodoAssistBrand
                            .accent)
                    VStack(alignment: .leading, spacing: 3) {
                        Text("Location")
                            .font(NodoAssistType.subheadSemiBold)
                        Text("Controls whether location can be shared with gateway tools.")
                            .font(NodoAssistType.caption)
                            .foregroundStyle(.secondary)
                            .lineLimit(2)
                    }
                    Spacer(minLength: 8)
                    if self.isChangingLocationMode {
                        ProgressView()
                            .controlSize(.small)
                    }
                }

                Picker("Location", selection: self.$locationModeRaw) {
                    Text("Off")
                        .font(NodoAssistType.captionSemiBold)
                        .tag(NodoAssistLocationMode.off.rawValue)
                    Text("While Using")
                        .font(NodoAssistType.captionSemiBold)
                        .tag(NodoAssistLocationMode.whileUsing.rawValue)
                    Text("Always")
                        .font(NodoAssistType.captionSemiBold)
                        .tag(NodoAssistLocationMode.always.rawValue)
                }
                .pickerStyle(.segmented)
                .disabled(self.isChangingLocationMode)

                Text(self.locationPermissionDetailText)
                    .font(NodoAssistType.caption2)
                    .foregroundStyle(
                        self.locationPermissionSummary.needsAttention ? NodoAssistBrand.warn : .secondary)

                if let locationPermissionWarningText {
                    Text(locationPermissionWarningText)
                        .font(NodoAssistType.caption2)
                        .foregroundStyle(NodoAssistBrand.warn)
                }
            }
        }
    }

    var agentSelectionCard: some View {
        Section {
            Picker("Default Agent", selection: self.$selectedAgentPickerId) {
                Text("Default").font(NodoAssistType.body).tag("")
                let defaultId = (self.appModel.gatewayDefaultAgentId ?? "")
                    .trimmingCharacters(in: .whitespacesAndNewlines)
                ForEach(self.appModel.gatewayAgents.filter { $0.id != defaultId }, id: \.id) { agent in
                    let name = (agent.name ?? "").trimmingCharacters(in: .whitespacesAndNewlines)
                    Text(name.isEmpty ? agent.id : name).font(NodoAssistType.body).tag(agent.id)
                }
            }
            .font(NodoAssistType.body)
        } footer: {
            Text("Used for new Chat and Talk sessions.")
                .font(NodoAssistType.footnote)
        }
    }

    var gatewaySetupCard: some View {
        Section {
            TextField("Paste setup code", text: self.$setupCode)
                .font(NodoAssistType.body)
                .textInputAutocapitalization(.never)
                .autocorrectionDisabled()
                .disabled(self.connectingGatewayID != nil)
            self.gatewayActionButton(
                title: "Scan QR",
                icon: "qrcode.viewfinder",
                color: NodoAssistBrand.accent,
                isBusy: false,
                isDisabled: self.connectingGatewayID != nil)
            {
                self.openGatewayQRScanner()
            }

            self.gatewayActionButton(
                title: "Connect",
                icon: "bolt.horizontal.circle",
                color: NodoAssistBrand.accent,
                isBusy: self.connectingGatewayID == "manual",
                isDisabled: !self.canApplyGatewaySetup || self.connectingGatewayID != nil)
            {
                Task { await self.applySetupCodeAndConnect() }
            }
        } header: {
            Text("Setup Code")
                .font(NodoAssistType.subheadSemiBold)
        } footer: {
            if let warning = self.tailnetWarningText {
                Text(warning).font(NodoAssistType.footnote).foregroundStyle(NodoAssistBrand.warn)
            } else if let status = self.setupStatusLine {
                Text(status)
                    .font(NodoAssistType.footnote)
            }
        }
    }

    var discoveredGatewaysCard: some View {
        Section("Discovered Gateways") {
            if self.gatewayController.gateways.isEmpty {
                Text("No gateways found yet. Use manual setup if Bonjour is blocked.")
                    .font(NodoAssistType.subhead)
                    .foregroundStyle(.secondary)
            } else {
                ForEach(self.gatewayController.gateways) { gateway in
                    self.discoveredGatewayRow(gateway)
                }
            }
        }
    }

    var pairedGatewaysCard: some View {
        Section {
            if self.gatewayRegistry.entries.isEmpty {
                Text("Pair a gateway to make it available here.")
                    .font(NodoAssistType.subhead)
                    .foregroundStyle(.secondary)
            } else {
                ForEach(self.gatewayRegistry.entries) { entry in
                    self.pairedGatewayRow(entry)
                }
            }
        } header: {
            Text("Paired Gateways")
                .font(NodoAssistType.subheadSemiBold)
        } footer: {
            Text("Switch gateways without pairing again.")
                .font(NodoAssistType.footnote)
        }
    }

    func pairedGatewayRow(_ entry: GatewaySettingsStore.GatewayRegistryEntry) -> some View {
        let isActive = entry.stableID == self.gatewayRegistry.activeStableID
        return Button {
            guard !isActive else { return }
            Task { await self.switchGateway(to: entry) }
        } label: {
            HStack(spacing: 12) {
                VStack(alignment: .leading, spacing: 3) {
                    Text(entry.name)
                        .font(NodoAssistType.subheadSemiBold)
                        .foregroundStyle(.primary)
                    Text(self.gatewayEndpointSummary(entry))
                        .font(NodoAssistType.caption)
                        .foregroundStyle(.secondary)
                }
                Spacer(minLength: 8)
                if self.connectingGatewayID == entry.stableID {
                    ProgressView()
                        .controlSize(.small)
                } else if isActive {
                    Image(systemName: "checkmark.circle.fill")
                        .font(NodoAssistType.subheadSemiBold)
                        .foregroundStyle(NodoAssistBrand.accent)
                        .accessibilityLabel("Active Gateway")
                }
            }
            .contentShape(Rectangle())
        }
        .buttonStyle(.plain)
        .disabled(self.connectingGatewayID != nil)
        .swipeActions {
            Button(role: .destructive) {
                self.pendingForgetGateway = entry
            } label: {
                Label {
                    Text("Forget")
                        .font(NodoAssistType.captionSemiBold)
                } icon: {
                    Image(systemName: "trash")
                }
            }
        }
        .contextMenu {
            Button(role: .destructive) {
                self.pendingForgetGateway = entry
            } label: {
                Label {
                    Text("Forget Gateway")
                        .font(NodoAssistType.body)
                } icon: {
                    Image(systemName: "trash")
                }
            }
        }
    }

    func discoveredGatewayRow(_ gateway: GatewayDiscoveryModel.DiscoveredGateway) -> some View {
        HStack(spacing: 12) {
            VStack(alignment: .leading, spacing: 3) {
                Text(verbatim: gateway.name)
                    .font(NodoAssistType.subheadSemiBold)
                Text(verbatim: self.gatewayDetailLines(gateway).joined(separator: " • "))
                    .font(NodoAssistType.caption)
                    .foregroundStyle(.secondary)
                    .lineLimit(2)
            }
            Spacer(minLength: 8)
            Button {
                Task { await self.connect(gateway) }
            } label: {
                if self.connectingGatewayID == gateway.id {
                    ProgressView().controlSize(.small)
                } else {
                    Text("Connect")
                        .font(NodoAssistType.captionSemiBold)
                }
            }
            .font(NodoAssistType.captionSemiBold)
            .buttonStyle(.bordered)
            .disabled(self.connectingGatewayID != nil)
        }
    }

    var manualGatewayCard: some View {
        Section("Manual Gateway") {
            self.settingsToggle("Use Manual Gateway", isOn: self.manualGatewayEnabledBinding)
            TextField("Host", text: self.manualHostBinding)
                .font(NodoAssistType.body)
                .textInputAutocapitalization(.never)
                .autocorrectionDisabled()
            TextField("Port", text: self.manualPortBinding)
                .font(NodoAssistType.body)
                .keyboardType(.numberPad)
            Picker("Connection security", selection: self.manualGatewayTLSBinding) {
                Text("Unencrypted")
                    .font(NodoAssistType.captionSemiBold)
                    .tag(false)
                Text("Secure (TLS)")
                    .font(NodoAssistType.captionSemiBold)
                    .tag(true)
            }
            .pickerStyle(.segmented)
            .disabled(self.manualGatewayTransport.requiresTLS)
            if let helperText = self.manualGatewayTransport.helperText {
                Text(helperText)
                    .font(NodoAssistType.footnote)
                    .foregroundStyle(.secondary)
            }
            self.gatewayActionButton(
                title: "Connect Manual",
                icon: "network",
                color: NodoAssistBrand.accent,
                isBusy: self.connectingGatewayID == "manual",
                isDisabled: self.manualGatewayHost.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty
                    || !self.manualPortIsValid)
            {
                Task { await self.connectManual() }
            }
        }
        .disabled(self.setupAttemptID != nil)
    }

    private var manualGatewayTransport: GatewayManualTransportPresentation {
        GatewayConnectionController.manualTransportPresentation(
            host: self.manualGatewayHost,
            requestedTLS: self.manualGatewayTLS)
    }

    private var manualGatewayTLSBinding: Binding<Bool> {
        Binding(
            get: { self.manualGatewayTransport.effectiveTLS },
            set: { enabled in
                guard !self.manualGatewayTransport.requiresTLS else { return }
                self.manualGatewayTLS = enabled
            })
    }

    var gatewayAdvancedCard: some View {
        Section {
            self.settingsToggle("Auto-connect on launch", isOn: self.$gatewayAutoConnect)
            self.gatewaySecureField("Gateway Auth Token", text: self.gatewayTokenBinding)
            self.gatewaySecureField("Gateway Password", text: self.gatewayPasswordBinding)
            if let headersStableID = self.gatewayCustomHeadersTargetStableID {
                NavigationLink {
                    GatewayCustomHeadersSettingsView(gatewayStableID: headersStableID)
                } label: {
                    Text("Custom Headers")
                        .font(NodoAssistType.body)
                }
            }
            Button(role: .destructive) {
                self.showResetOnboardingAlert = true
            } label: {
                Label("Reset Onboarding", systemImage: "arrow.counterclockwise")
                    .font(NodoAssistType.body)
            }
        }
    }

    func gatewaySecureField(_ placeholder: String, text: Binding<String>) -> some View {
        ZStack(alignment: .leading) {
            SecureField("", text: text)
                .font(NodoAssistType.subhead)
                .textInputAutocapitalization(.never)
                .autocorrectionDisabled()
                .accessibilityLabel(placeholder)
            if text.wrappedValue.isEmpty {
                Text(placeholder)
                    .font(NodoAssistType.subheadSemiBold)
                    .foregroundStyle(.tertiary)
                    .padding(.horizontal, 8)
                    .allowsHitTesting(false)
                    .accessibilityHidden(true)
            }
        }
        .font(NodoAssistType.subhead)
    }

    var voiceFeatureCard: some View {
        Section {
            self.settingsToggle("Voice Wake", isOn: self.$voiceWakeEnabled) { enabled in
                self.appModel.setVoiceWakeEnabled(enabled)
            }
            self.settingsToggle("Talk Mode", isOn: self.$talkEnabled) { enabled in
                guard !self.appModel.isAppleReviewDemoModeEnabled else {
                    self.talkEnabled = false
                    return
                }
                self.appModel.setTalkEnabled(enabled)
            }
            .disabled(self.appModel.isAppleReviewDemoModeEnabled)
            Picker("Speech Language", selection: self.$talkSpeechLocale) {
                ForEach(TalkSpeechLocale.supportedOptions()) { option in
                    Text(option.label).font(NodoAssistType.body).tag(option.id)
                }
            }
            .font(NodoAssistType.body)
            self.settingsToggle("Background Listening", isOn: self.$talkBackgroundEnabled)
            self.settingsToggle("Speakerphone", isOn: self.talkSpeakerphoneBinding)
            NavigationLink {
                VoiceWakeWordsSettingsView()
            } label: {
                SettingsDetailRow(
                    "Wake Words",
                    value: VoiceWakePreferences.displayString(for: self.voiceWake.triggerWords))
            }
        }
    }

    var talkVoiceSettingsCard: some View {
        Group {
            if self.gatewayConnected,
               let issue = self.appModel.talkMode.gatewayTalkCurrentFallbackIssue
            {
                Section {
                    TalkRuntimeIssueBanner(
                        issue: issue,
                        onOpenSettings: nil,
                        onShowDetails: {
                            self.showTalkIssueDetails = true
                        })
                }
            }
            Section("Voice") {
                Picker("Provider", selection: self.talkProviderSelectionBinding) {
                    ForEach(TalkModeProviderSelection.allCases) { option in
                        Text(option.label).font(NodoAssistType.body).tag(option.rawValue)
                    }
                }
                .font(NodoAssistType.body)
                if self.shouldShowRealtimeVoicePicker {
                    Picker("Realtime Voice", selection: self.talkRealtimeVoiceSelectionBinding) {
                        Text("Gateway Default").font(NodoAssistType.body).tag("")
                        ForEach(TalkModeRealtimeVoiceSelection.voices, id: \.self) { voice in
                            Text(TalkModeRealtimeVoiceSelection.label(for: voice)).font(NodoAssistType.body).tag(voice)
                        }
                    }
                    .font(NodoAssistType.body)
                }
                SettingsDetailRow("Voice Mode", value: self.appModel.talkMode.gatewayTalkVoiceModeTitle)
                SettingsDetailRow("Active Voice", value: self.gatewayTalkActiveVoiceDetail)
                if let issue = self.gatewayTalkLastIssueDetail {
                    SettingsDetailRow("Last Voice Issue", value: issue)
                }
                SettingsDetailRow("Transport", value: self.appModel.talkMode.gatewayTalkTransportLabel)
                SettingsDetailRow("API Key", value: self.talkApiKeyStatus)
            }
        }
    }

    var shareSettingsCard: some View {
        Section {
            self.settingsToggle("Show Talk Control", isOn: self.$talkButtonEnabled)
            TextField("Default Share Instruction", text: self.$defaultShareInstruction, axis: .vertical)
                .font(NodoAssistType.body)
                .lineLimit(2...5)
                .textInputAutocapitalization(.sentences)
            Button {
                Task { await self.appModel.runSharePipelineSelfTest() }
            } label: {
                Label("Run Share Self-Test", systemImage: "checkmark.seal")
                    .font(NodoAssistType.body)
            }
        } footer: {
            Text(self.appModel.lastShareEventText)
                .font(NodoAssistType.footnote)
        }
    }

    var privacyAccessCard: some View {
        Section {
            PrivacyAccessSectionView()
        }
    }

    var diagnosticsAdvancedCard: some View {
        Section {
            self.settingsToggle("Discovery Debug Logs", isOn: self.$discoveryDebugLogsEnabled) { enabled in
                self.gatewayController.setDiscoveryDebugLoggingEnabled(enabled)
            }
            self.settingsToggle("Debug Screen Status", isOn: self.$canvasDebugStatusEnabled)
            NavigationLink {
                GatewayDiscoveryDebugLogView()
            } label: {
                SettingsDetailRow("Discovery Logs", value: self.gatewayController.discoveryStatusText)
            }
        }
    }

    var deviceIdentityCard: some View {
        Section("Device") {
            TextField("Device Name", text: self.$displayName)
                .font(NodoAssistType.body)
            SettingsDetailRow("Instance ID", value: self.instanceId)
        }
    }

    func settingsToggle(
        _ title: String,
        isOn: Binding<Bool>,
        onChange: ((Bool) -> Void)? = nil) -> some View
    {
        // Native Toggle rows can ignore visible-row taps on iOS 26; reuse the shared indicator row.
        Button {
            isOn.wrappedValue.toggle()
        } label: {
            HStack {
                Text(title)
                    .font(NodoAssistType.body)
                Spacer(minLength: 8)
                NodoAssistToggleIndicator(isOn: isOn.wrappedValue)
            }
            .contentShape(Rectangle())
        }
        .buttonStyle(.plain)
        .accessibilityLabel(title)
        .accessibilityValue(isOn.wrappedValue ? "On" : "Off")
        .onChange(of: isOn.wrappedValue) { _, enabled in
            onChange?(enabled)
        }
    }
}

import SwiftUI

/// Host-provided voice-note recording state for the shared chat composer.
public struct NodoAssistChatVoiceNoteControl {
    public var recorder: NodoAssistVoiceNoteRecorder
    public var isTalkActive: Bool

    public init(recorder: NodoAssistVoiceNoteRecorder, isTalkActive: Bool) {
        self.recorder = recorder
        self.isTalkActive = isTalkActive
    }
}

struct NodoAssistVoiceNoteButton: View {
    let control: NodoAssistChatVoiceNoteControl
    let compact: Bool
    let isComposerEnabled: Bool
    let isAttachmentInputEnabled: Bool

    var isRecordingEnabled: Bool {
        self.isComposerEnabled
            && self.isAttachmentInputEnabled
            && !self.control.isTalkActive
            && !self.control.recorder.isRequestingPermission
    }

    var body: some View {
        Button {
            Task { await self.control.recorder.start() }
        } label: {
            if self.control.recorder.isRequestingPermission {
                ProgressView()
                    .controlSize(.mini)
            } else {
                Image(systemName: "mic")
                    .font(NodoAssistChatTypography.display(size: 15, weight: .semibold, relativeTo: .subheadline))
            }
        }
        .help("Record Voice Note")
        .accessibilityLabel("Record voice note")
        .accessibilityIdentifier("chat-voice-note-record")
        .modifier(VoiceNoteButtonChrome(compact: self.compact))
        .controlSize(.small)
        .foregroundStyle(.secondary)
        .contentShape(Rectangle())
        .disabled(!self.isRecordingEnabled)
    }
}

struct NodoAssistVoiceNoteRecordingRow: View {
    let recorder: NodoAssistVoiceNoteRecorder

    var body: some View {
        HStack(spacing: 10) {
            Circle()
                .fill(NodoAssistChatTheme.danger)
                .frame(width: 9, height: 9)

            Text("Recording")
                .font(NodoAssistChatTypography.footnoteSemiBold)

            Text(nodoAssistVoiceNoteDurationLabel(self.recorder.elapsedSeconds))
                .font(NodoAssistChatTypography.mono(size: 13, relativeTo: .footnote))
                .foregroundStyle(.secondary)

            Spacer(minLength: 8)

            Button {
                self.recorder.cancel()
            } label: {
                Image(systemName: "xmark")
            }
            .buttonStyle(.bordered)
            .controlSize(.small)
            .accessibilityLabel("Cancel voice note")

            Button {
                self.recorder.finish()
            } label: {
                Image(systemName: "checkmark")
            }
            .buttonStyle(.borderedProminent)
            .controlSize(.small)
            .accessibilityLabel("Finish voice note")
        }
        .padding(.horizontal, 14)
        .padding(.vertical, 10)
        .background(
            RoundedRectangle(cornerRadius: 14, style: .continuous)
                .fill(NodoAssistChatTheme.composerField)
                .overlay(
                    RoundedRectangle(cornerRadius: 14, style: .continuous)
                        .strokeBorder(NodoAssistChatTheme.composerBorder)))
    }
}

private struct VoiceNoteButtonChrome: ViewModifier {
    let compact: Bool

    func body(content: Content) -> some View {
        if self.compact {
            content.buttonStyle(.plain)
        } else {
            content.buttonStyle(.bordered)
        }
    }
}

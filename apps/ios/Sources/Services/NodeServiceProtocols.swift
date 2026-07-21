import CoreLocation
import Foundation
import NodoAssistKit
import UIKit

typealias NodoAssistCameraSnapResult = (format: String, base64: String, width: Int, height: Int)
typealias NodoAssistCameraClipResult = (format: String, base64: String, durationMs: Int, hasAudio: Bool)

protocol CameraServicing: Sendable {
    func listDevices() async -> [CameraController.CameraDeviceInfo]
    func snap(params: NodoAssistCameraSnapParams) async throws -> NodoAssistCameraSnapResult
    func clip(params: NodoAssistCameraClipParams) async throws -> NodoAssistCameraClipResult
}

protocol ScreenRecordingServicing: Sendable {
    func record(
        screenIndex: Int?,
        durationMs: Int?,
        fps: Double?,
        includeAudio: Bool?,
        outPath: String?) async throws -> String
}

@MainActor
protocol LocationServicing: Sendable {
    func authorizationStatus() -> CLAuthorizationStatus
    func accuracyAuthorization() -> CLAccuracyAuthorization
    func ensureAuthorization(mode: NodoAssistLocationMode) async -> CLAuthorizationStatus
    func currentLocation(
        params: NodoAssistLocationGetParams,
        desiredAccuracy: NodoAssistLocationAccuracy,
        maxAgeMs: Int?,
        timeoutMs: Int?) async throws -> CLLocation
    func setBackgroundLocationUpdatesEnabled(_ enabled: Bool)
    func setAuthorizationChangeHandler(
        _ handler: @escaping @MainActor @Sendable (CLAuthorizationStatus) -> Void)
    func startMonitoringSignificantLocationChanges(onUpdate: @escaping @Sendable (CLLocation) -> Void)
    func stopMonitoringSignificantLocationChanges()
}

@MainActor
protocol DeviceStatusServicing: Sendable {
    func status() async throws -> NodoAssistDeviceStatusPayload
    func info() -> NodoAssistDeviceInfoPayload
}

protocol PhotosServicing: Sendable {
    func latest(params: NodoAssistPhotosLatestParams) async throws -> NodoAssistPhotosLatestPayload
}

protocol ContactsServicing: Sendable {
    func search(params: NodoAssistContactsSearchParams) async throws -> NodoAssistContactsSearchPayload
    func add(params: NodoAssistContactsAddParams) async throws -> NodoAssistContactsAddPayload
}

protocol CalendarServicing: Sendable {
    func events(params: NodoAssistCalendarEventsParams) async throws -> NodoAssistCalendarEventsPayload
    func add(params: NodoAssistCalendarAddParams) async throws -> NodoAssistCalendarAddPayload
}

protocol RemindersServicing: Sendable {
    func list(params: NodoAssistRemindersListParams) async throws -> NodoAssistRemindersListPayload
    func add(params: NodoAssistRemindersAddParams) async throws -> NodoAssistRemindersAddPayload
}

protocol MotionServicing: Sendable {
    func activities(params: NodoAssistMotionActivityParams) async throws -> NodoAssistMotionActivityPayload
    func pedometer(params: NodoAssistPedometerParams) async throws -> NodoAssistPedometerPayload
}

struct WatchMessagingStatus: Equatable {
    var supported: Bool
    var paired: Bool
    var appInstalled: Bool
    var reachable: Bool
    var activationState: String
}

struct WatchQuickReplyEvent: Codable, Equatable {
    var replyId: String
    var promptId: String
    var actionId: String
    var actionLabel: String?
    var sessionKey: String?
    var gatewayStableID: String?
    var note: String?
    var sentAtMs: Int?
    var transport: String
}

enum WatchMessageKind: String, Codable, Equatable {
    case chat
    case quickReply
}

struct WatchExecApprovalResolveEvent: Codable, Equatable {
    var replyId: String
    var approvalId: String
    var gatewayStableID: String?
    var decision: NodoAssistWatchExecApprovalDecision
    var sentAtMs: Int?
    var transport: String
}

struct WatchExecApprovalSnapshotRequestEvent: Equatable {
    var requestId: String
    var sentAtMs: Int?
    var transport: String
}

struct WatchAppSnapshotRequestEvent: Equatable {
    var requestId: String
    var sentAtMs: Int?
    var transport: String
}

struct WatchAppCommandEvent: Codable, Equatable {
    var commandId: String
    var command: NodoAssistWatchAppCommand
    var sessionKey: String?
    var gatewayStableID: String?
    var text: String?
    var sentAtMs: Int?
    var transport: String
    var messageKind: WatchMessageKind? = nil
}

struct WatchNotificationSendResult: Equatable {
    var deliveredImmediately: Bool
    var queuedForDelivery: Bool
    var transport: String
}

protocol WatchMessagingServicing: AnyObject, Sendable {
    func status() async -> WatchMessagingStatus
    func setStatusHandler(_ handler: (@Sendable (WatchMessagingStatus) -> Void)?)
    func setReplyHandler(_ handler: (@Sendable (WatchQuickReplyEvent) -> Void)?)
    func setExecApprovalResolveHandler(_ handler: (@Sendable (WatchExecApprovalResolveEvent) -> Void)?)
    func setExecApprovalSnapshotRequestHandler(
        _ handler: (@Sendable (WatchExecApprovalSnapshotRequestEvent) -> Void)?)
    func setAppSnapshotRequestHandler(_ handler: (@Sendable (WatchAppSnapshotRequestEvent) -> Void)?)
    func setAppCommandHandler(_ handler: (@Sendable (WatchAppCommandEvent) -> Void)?)
    func sendNotification(
        id: String,
        params: NodoAssistWatchNotifyParams,
        gatewayStableID: String?) async throws -> WatchNotificationSendResult
    func sendExecApprovalPrompt(
        _ message: NodoAssistWatchExecApprovalPromptMessage) async throws -> WatchNotificationSendResult
    func sendExecApprovalResolved(
        _ message: NodoAssistWatchExecApprovalResolvedMessage) async throws -> WatchNotificationSendResult
    func sendExecApprovalExpired(
        _ message: NodoAssistWatchExecApprovalExpiredMessage) async throws -> WatchNotificationSendResult
    func syncExecApprovalSnapshot(
        _ message: NodoAssistWatchExecApprovalSnapshotMessage) async throws -> WatchNotificationSendResult
    func syncAppSnapshot(
        _ message: NodoAssistWatchAppSnapshotMessage) async throws -> WatchNotificationSendResult
    func sendChatCompletion(
        _ message: NodoAssistWatchChatCompletionMessage) async throws -> WatchNotificationSendResult
}

extension CameraController: CameraServicing {}
extension ScreenRecordService: ScreenRecordingServicing {}
extension LocationService: LocationServicing {}

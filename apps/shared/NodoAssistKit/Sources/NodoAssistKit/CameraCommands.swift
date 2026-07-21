import Foundation

public enum NodoAssistCameraCommand: String, Codable, Sendable {
    case list = "camera.list"
    case snap = "camera.snap"
    case clip = "camera.clip"
}

public enum NodoAssistCameraFacing: String, Codable, Sendable {
    case back
    case front
}

public enum NodoAssistCameraImageFormat: String, Codable, Sendable {
    case jpg
    case jpeg
}

public enum NodoAssistCameraVideoFormat: String, Codable, Sendable {
    case mp4
}

public struct NodoAssistCameraSnapParams: Codable, Sendable, Equatable {
    public var facing: NodoAssistCameraFacing?
    public var maxWidth: Int?
    public var quality: Double?
    public var format: NodoAssistCameraImageFormat?
    public var deviceId: String?
    public var delayMs: Int?

    public init(
        facing: NodoAssistCameraFacing? = nil,
        maxWidth: Int? = nil,
        quality: Double? = nil,
        format: NodoAssistCameraImageFormat? = nil,
        deviceId: String? = nil,
        delayMs: Int? = nil)
    {
        self.facing = facing
        self.maxWidth = maxWidth
        self.quality = quality
        self.format = format
        self.deviceId = deviceId
        self.delayMs = delayMs
    }
}

public struct NodoAssistCameraClipParams: Codable, Sendable, Equatable {
    public var facing: NodoAssistCameraFacing?
    public var durationMs: Int?
    public var includeAudio: Bool?
    public var format: NodoAssistCameraVideoFormat?
    public var deviceId: String?

    public init(
        facing: NodoAssistCameraFacing? = nil,
        durationMs: Int? = nil,
        includeAudio: Bool? = nil,
        format: NodoAssistCameraVideoFormat? = nil,
        deviceId: String? = nil)
    {
        self.facing = facing
        self.durationMs = durationMs
        self.includeAudio = includeAudio
        self.format = format
        self.deviceId = deviceId
    }
}

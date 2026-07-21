package ai.nodoassist.app.node

import ai.nodoassist.app.protocol.NodoAssistCalendarCommand
import ai.nodoassist.app.protocol.NodoAssistCallLogCommand
import ai.nodoassist.app.protocol.NodoAssistCameraCommand
import ai.nodoassist.app.protocol.NodoAssistCapability
import ai.nodoassist.app.protocol.NodoAssistContactsCommand
import ai.nodoassist.app.protocol.NodoAssistDeviceCommand
import ai.nodoassist.app.protocol.NodoAssistLocationCommand
import ai.nodoassist.app.protocol.NodoAssistMotionCommand
import ai.nodoassist.app.protocol.NodoAssistNotificationsCommand
import ai.nodoassist.app.protocol.NodoAssistPhotosCommand
import ai.nodoassist.app.protocol.NodoAssistSmsCommand
import ai.nodoassist.app.protocol.NodoAssistSystemCommand
import ai.nodoassist.app.protocol.NodoAssistTalkCommand
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test

class InvokeCommandRegistryTest {
  private val coreCapabilities =
    setOf(
      NodoAssistCapability.Canvas.rawValue,
      NodoAssistCapability.Device.rawValue,
      NodoAssistCapability.Notifications.rawValue,
      NodoAssistCapability.System.rawValue,
      NodoAssistCapability.Talk.rawValue,
      NodoAssistCapability.Contacts.rawValue,
      NodoAssistCapability.Calendar.rawValue,
    )

  private val optionalCapabilities =
    setOf(
      NodoAssistCapability.Camera.rawValue,
      NodoAssistCapability.Location.rawValue,
      NodoAssistCapability.Sms.rawValue,
      NodoAssistCapability.CallLog.rawValue,
      NodoAssistCapability.VoiceWake.rawValue,
      NodoAssistCapability.Motion.rawValue,
      NodoAssistCapability.Photos.rawValue,
    )

  private val coreCommands =
    setOf(
      NodoAssistDeviceCommand.Status.rawValue,
      NodoAssistDeviceCommand.Info.rawValue,
      NodoAssistDeviceCommand.Permissions.rawValue,
      NodoAssistDeviceCommand.Health.rawValue,
      NodoAssistNotificationsCommand.List.rawValue,
      NodoAssistNotificationsCommand.Actions.rawValue,
      NodoAssistSystemCommand.Notify.rawValue,
      NodoAssistTalkCommand.PttStart.rawValue,
      NodoAssistTalkCommand.PttStop.rawValue,
      NodoAssistTalkCommand.PttCancel.rawValue,
      NodoAssistTalkCommand.PttOnce.rawValue,
      NodoAssistContactsCommand.Search.rawValue,
      NodoAssistContactsCommand.Add.rawValue,
      NodoAssistCalendarCommand.Events.rawValue,
      NodoAssistCalendarCommand.Add.rawValue,
    )

  private val optionalCommands =
    setOf(
      NodoAssistCameraCommand.Snap.rawValue,
      NodoAssistCameraCommand.Clip.rawValue,
      NodoAssistCameraCommand.List.rawValue,
      NodoAssistLocationCommand.Get.rawValue,
      NodoAssistMotionCommand.Activity.rawValue,
      NodoAssistMotionCommand.Pedometer.rawValue,
      NodoAssistSmsCommand.Send.rawValue,
      NodoAssistSmsCommand.Search.rawValue,
      NodoAssistCallLogCommand.Search.rawValue,
      NodoAssistPhotosCommand.Latest.rawValue,
    )

  private val debugCommands = setOf("debug.logs", "debug.ed25519")

  @Test
  fun advertisedCapabilities_respectsFeatureAvailability() {
    val capabilities = InvokeCommandRegistry.advertisedCapabilities(defaultFlags())

    assertContainsAll(capabilities, coreCapabilities)
    assertMissingAll(capabilities, optionalCapabilities)
  }

  @Test
  fun advertisedCapabilities_includesFeatureCapabilitiesWhenEnabled() {
    val capabilities =
      InvokeCommandRegistry.advertisedCapabilities(
        defaultFlags(
          cameraEnabled = true,
          locationEnabled = true,
          sendSmsAvailable = true,
          readSmsAvailable = true,
          smsSearchPossible = true,
          callLogAvailable = true,
          photosAvailable = true,
          voiceWakeEnabled = true,
          motionActivityAvailable = true,
          motionPedometerAvailable = true,
        ),
      )

    assertContainsAll(capabilities, coreCapabilities + optionalCapabilities)
  }

  @Test
  fun advertisedCommands_respectsFeatureAvailability() {
    val commands = InvokeCommandRegistry.advertisedCommands(defaultFlags())

    assertContainsAll(commands, coreCommands)
    assertMissingAll(commands, optionalCommands + debugCommands)
  }

  @Test
  fun advertisedCommands_includesDeviceAppsOnlyWhenUserOptedIn() {
    val disabled = InvokeCommandRegistry.advertisedCommands(defaultFlags(installedAppsSharingEnabled = false))
    val enabled = InvokeCommandRegistry.advertisedCommands(defaultFlags(installedAppsSharingEnabled = true))

    assertFalse(disabled.contains(NodoAssistDeviceCommand.Apps.rawValue))
    assertTrue(enabled.contains(NodoAssistDeviceCommand.Apps.rawValue))
  }

  @Test
  fun advertisedCommands_includesFeatureCommandsWhenEnabled() {
    val commands =
      InvokeCommandRegistry.advertisedCommands(
        defaultFlags(
          cameraEnabled = true,
          locationEnabled = true,
          sendSmsAvailable = true,
          readSmsAvailable = true,
          smsSearchPossible = true,
          callLogAvailable = true,
          photosAvailable = true,
          motionActivityAvailable = true,
          motionPedometerAvailable = true,
          debugBuild = true,
        ),
      )

    assertContainsAll(commands, coreCommands + optionalCommands + debugCommands)
  }

  @Test
  fun advertisedCommands_onlyIncludesSupportedMotionCommands() {
    val commands =
      InvokeCommandRegistry.advertisedCommands(
        NodeRuntimeFlags(
          cameraEnabled = false,
          locationEnabled = false,
          sendSmsAvailable = false,
          readSmsAvailable = false,
          smsSearchPossible = false,
          callLogAvailable = false,
          photosAvailable = false,
          voiceWakeEnabled = false,
          motionActivityAvailable = true,
          motionPedometerAvailable = false,
          installedAppsSharingEnabled = false,
          debugBuild = false,
        ),
      )

    assertTrue(commands.contains(NodoAssistMotionCommand.Activity.rawValue))
    assertFalse(commands.contains(NodoAssistMotionCommand.Pedometer.rawValue))
  }

  @Test
  fun advertisedCommands_splitsSmsSendAndSearchAvailability() {
    val readOnlyCommands =
      InvokeCommandRegistry.advertisedCommands(
        defaultFlags(readSmsAvailable = true, smsSearchPossible = true),
      )
    val sendOnlyCommands =
      InvokeCommandRegistry.advertisedCommands(
        defaultFlags(sendSmsAvailable = true),
      )
    val requestableSearchCommands =
      InvokeCommandRegistry.advertisedCommands(
        defaultFlags(smsSearchPossible = true),
      )

    assertTrue(readOnlyCommands.contains(NodoAssistSmsCommand.Search.rawValue))
    assertFalse(readOnlyCommands.contains(NodoAssistSmsCommand.Send.rawValue))
    assertTrue(sendOnlyCommands.contains(NodoAssistSmsCommand.Send.rawValue))
    assertFalse(sendOnlyCommands.contains(NodoAssistSmsCommand.Search.rawValue))
    assertTrue(requestableSearchCommands.contains(NodoAssistSmsCommand.Search.rawValue))
  }

  @Test
  fun advertisedCapabilities_includeSmsWhenEitherSmsPathIsAvailable() {
    val readOnlyCapabilities =
      InvokeCommandRegistry.advertisedCapabilities(
        defaultFlags(readSmsAvailable = true),
      )
    val sendOnlyCapabilities =
      InvokeCommandRegistry.advertisedCapabilities(
        defaultFlags(sendSmsAvailable = true),
      )
    val requestableSearchCapabilities =
      InvokeCommandRegistry.advertisedCapabilities(
        defaultFlags(smsSearchPossible = true),
      )

    assertTrue(readOnlyCapabilities.contains(NodoAssistCapability.Sms.rawValue))
    assertTrue(sendOnlyCapabilities.contains(NodoAssistCapability.Sms.rawValue))
    assertFalse(requestableSearchCapabilities.contains(NodoAssistCapability.Sms.rawValue))
  }

  @Test
  fun advertisedCommands_excludesCallLogWhenUnavailable() {
    val commands = InvokeCommandRegistry.advertisedCommands(defaultFlags(callLogAvailable = false))

    assertFalse(commands.contains(NodoAssistCallLogCommand.Search.rawValue))
  }

  @Test
  fun advertisedCapabilities_excludesCallLogWhenUnavailable() {
    val capabilities = InvokeCommandRegistry.advertisedCapabilities(defaultFlags(callLogAvailable = false))

    assertFalse(capabilities.contains(NodoAssistCapability.CallLog.rawValue))
  }

  @Test
  fun advertisedPhotosSurface_respectsFeatureAvailability() {
    val disabledFlags = defaultFlags(photosAvailable = false)
    val enabledFlags = defaultFlags(photosAvailable = true)

    assertFalse(InvokeCommandRegistry.advertisedCapabilities(disabledFlags).contains(NodoAssistCapability.Photos.rawValue))
    assertFalse(InvokeCommandRegistry.advertisedCommands(disabledFlags).contains(NodoAssistPhotosCommand.Latest.rawValue))
    assertTrue(InvokeCommandRegistry.advertisedCapabilities(enabledFlags).contains(NodoAssistCapability.Photos.rawValue))
    assertTrue(InvokeCommandRegistry.advertisedCommands(enabledFlags).contains(NodoAssistPhotosCommand.Latest.rawValue))
  }

  @Test
  fun advertisedCapabilities_includesVoiceWakeWithoutAdvertisingCommands() {
    val capabilities = InvokeCommandRegistry.advertisedCapabilities(defaultFlags(voiceWakeEnabled = true))
    val commands = InvokeCommandRegistry.advertisedCommands(defaultFlags(voiceWakeEnabled = true))

    assertTrue(capabilities.contains(NodoAssistCapability.VoiceWake.rawValue))
    assertFalse(commands.any { it.contains("voice", ignoreCase = true) })
  }

  @Test
  fun find_returnsForegroundMetadataForCameraCommands() {
    val list = InvokeCommandRegistry.find(NodoAssistCameraCommand.List.rawValue)
    val location = InvokeCommandRegistry.find(NodoAssistLocationCommand.Get.rawValue)
    val pttStart = InvokeCommandRegistry.find(NodoAssistTalkCommand.PttStart.rawValue)
    val pttStop = InvokeCommandRegistry.find(NodoAssistTalkCommand.PttStop.rawValue)
    val pttCancel = InvokeCommandRegistry.find(NodoAssistTalkCommand.PttCancel.rawValue)
    val pttOnce = InvokeCommandRegistry.find(NodoAssistTalkCommand.PttOnce.rawValue)

    assertNotNull(list)
    assertEquals(true, list?.requiresForeground)
    assertNotNull(location)
    assertEquals(false, location?.requiresForeground)
    assertNotNull(pttStart)
    assertEquals(false, pttStart?.requiresForeground)
    assertNotNull(pttStop)
    assertEquals(false, pttStop?.requiresForeground)
    assertNotNull(pttCancel)
    assertEquals(false, pttCancel?.requiresForeground)
    assertNotNull(pttOnce)
    assertEquals(true, pttOnce?.requiresForeground)
  }

  @Test
  fun find_returnsNullForUnknownCommand() {
    assertNull(InvokeCommandRegistry.find("not.real"))
  }

  private fun defaultFlags(
    cameraEnabled: Boolean = false,
    locationEnabled: Boolean = false,
    sendSmsAvailable: Boolean = false,
    readSmsAvailable: Boolean = false,
    smsSearchPossible: Boolean = false,
    callLogAvailable: Boolean = false,
    photosAvailable: Boolean = false,
    voiceWakeEnabled: Boolean = false,
    motionActivityAvailable: Boolean = false,
    motionPedometerAvailable: Boolean = false,
    installedAppsSharingEnabled: Boolean = false,
    debugBuild: Boolean = false,
  ): NodeRuntimeFlags =
    NodeRuntimeFlags(
      cameraEnabled = cameraEnabled,
      locationEnabled = locationEnabled,
      sendSmsAvailable = sendSmsAvailable,
      readSmsAvailable = readSmsAvailable,
      smsSearchPossible = smsSearchPossible,
      callLogAvailable = callLogAvailable,
      photosAvailable = photosAvailable,
      voiceWakeEnabled = voiceWakeEnabled,
      motionActivityAvailable = motionActivityAvailable,
      motionPedometerAvailable = motionPedometerAvailable,
      installedAppsSharingEnabled = installedAppsSharingEnabled,
      debugBuild = debugBuild,
    )

  private fun assertContainsAll(
    actual: List<String>,
    expected: Set<String>,
  ) {
    expected.forEach { value -> assertTrue(actual.contains(value)) }
  }

  private fun assertMissingAll(
    actual: List<String>,
    forbidden: Set<String>,
  ) {
    forbidden.forEach { value -> assertFalse(actual.contains(value)) }
  }
}

package ai.nodoassist.app.protocol

import org.junit.Assert.assertEquals
import org.junit.Test

class NodoAssistProtocolConstantsTest {
  @Test
  fun canvasCommandsUseStableStrings() {
    assertEquals("canvas.present", NodoAssistCanvasCommand.Present.rawValue)
    assertEquals("canvas.hide", NodoAssistCanvasCommand.Hide.rawValue)
    assertEquals("canvas.navigate", NodoAssistCanvasCommand.Navigate.rawValue)
    assertEquals("canvas.eval", NodoAssistCanvasCommand.Eval.rawValue)
    assertEquals("canvas.snapshot", NodoAssistCanvasCommand.Snapshot.rawValue)
  }

  @Test
  fun a2uiCommandsUseStableStrings() {
    assertEquals("canvas.a2ui.push", NodoAssistCanvasA2UICommand.Push.rawValue)
    assertEquals("canvas.a2ui.pushJSONL", NodoAssistCanvasA2UICommand.PushJSONL.rawValue)
    assertEquals("canvas.a2ui.reset", NodoAssistCanvasA2UICommand.Reset.rawValue)
  }

  @Test
  fun capabilitiesUseStableStrings() {
    assertEquals("canvas", NodoAssistCapability.Canvas.rawValue)
    assertEquals("camera", NodoAssistCapability.Camera.rawValue)
    assertEquals("voiceWake", NodoAssistCapability.VoiceWake.rawValue)
    assertEquals("talk", NodoAssistCapability.Talk.rawValue)
    assertEquals("location", NodoAssistCapability.Location.rawValue)
    assertEquals("sms", NodoAssistCapability.Sms.rawValue)
    assertEquals("device", NodoAssistCapability.Device.rawValue)
    assertEquals("notifications", NodoAssistCapability.Notifications.rawValue)
    assertEquals("system", NodoAssistCapability.System.rawValue)
    assertEquals("photos", NodoAssistCapability.Photos.rawValue)
    assertEquals("contacts", NodoAssistCapability.Contacts.rawValue)
    assertEquals("calendar", NodoAssistCapability.Calendar.rawValue)
    assertEquals("motion", NodoAssistCapability.Motion.rawValue)
    assertEquals("callLog", NodoAssistCapability.CallLog.rawValue)
  }

  @Test
  fun cameraCommandsUseStableStrings() {
    assertEquals("camera.list", NodoAssistCameraCommand.List.rawValue)
    assertEquals("camera.snap", NodoAssistCameraCommand.Snap.rawValue)
    assertEquals("camera.clip", NodoAssistCameraCommand.Clip.rawValue)
  }

  @Test
  fun notificationsCommandsUseStableStrings() {
    assertEquals("notifications.list", NodoAssistNotificationsCommand.List.rawValue)
    assertEquals("notifications.actions", NodoAssistNotificationsCommand.Actions.rawValue)
  }

  @Test
  fun deviceCommandsUseStableStrings() {
    assertEquals("device.status", NodoAssistDeviceCommand.Status.rawValue)
    assertEquals("device.info", NodoAssistDeviceCommand.Info.rawValue)
    assertEquals("device.permissions", NodoAssistDeviceCommand.Permissions.rawValue)
    assertEquals("device.health", NodoAssistDeviceCommand.Health.rawValue)
    assertEquals("device.apps", NodoAssistDeviceCommand.Apps.rawValue)
  }

  @Test
  fun systemCommandsUseStableStrings() {
    assertEquals("system.notify", NodoAssistSystemCommand.Notify.rawValue)
  }

  @Test
  fun photosCommandsUseStableStrings() {
    assertEquals("photos.latest", NodoAssistPhotosCommand.Latest.rawValue)
  }

  @Test
  fun contactsCommandsUseStableStrings() {
    assertEquals("contacts.search", NodoAssistContactsCommand.Search.rawValue)
    assertEquals("contacts.add", NodoAssistContactsCommand.Add.rawValue)
  }

  @Test
  fun calendarCommandsUseStableStrings() {
    assertEquals("calendar.events", NodoAssistCalendarCommand.Events.rawValue)
    assertEquals("calendar.add", NodoAssistCalendarCommand.Add.rawValue)
  }

  @Test
  fun motionCommandsUseStableStrings() {
    assertEquals("motion.activity", NodoAssistMotionCommand.Activity.rawValue)
    assertEquals("motion.pedometer", NodoAssistMotionCommand.Pedometer.rawValue)
  }

  @Test
  fun smsCommandsUseStableStrings() {
    assertEquals("sms.send", NodoAssistSmsCommand.Send.rawValue)
    assertEquals("sms.search", NodoAssistSmsCommand.Search.rawValue)
  }

  @Test
  fun talkCommandsUseStableStrings() {
    assertEquals("talk.ptt.start", NodoAssistTalkCommand.PttStart.rawValue)
    assertEquals("talk.ptt.stop", NodoAssistTalkCommand.PttStop.rawValue)
    assertEquals("talk.ptt.cancel", NodoAssistTalkCommand.PttCancel.rawValue)
    assertEquals("talk.ptt.once", NodoAssistTalkCommand.PttOnce.rawValue)
  }

  @Test
  fun callLogCommandsUseStableStrings() {
    assertEquals("callLog.search", NodoAssistCallLogCommand.Search.rawValue)
  }
}

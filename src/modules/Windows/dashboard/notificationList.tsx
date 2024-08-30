import {
  Widget,
  Gio,
  Gtk,
  Gdk,
  GLib,
  Astal,
  GObject,
  timeout,
  bind,
} from "astal";
import Icon, { Icons } from "../../lib/icons";
//import Notification from "./Notification"
import Notifd from "gi://AstalNotifd";
import Pango from "gi://Pango";
import { NotifWidget } from "../../Widgets/index";
const Notif = Notifd.get_default();

const NotifBox = (
  <scrollable
    className="notif container"
    vscroll={Gtk.PolicyType.AUTOMATIC}
    hscroll={Gtk.PolicyType.NEVER}
    vexpand={true}
    hexpand={false}
    halign={Gtk.Align.FILL}
    valign={Gtk.Align.FILL}
  >
    <NotifWidget />
  </scrollable>
);

const Empty = (
  <box
    className="notif empty"
    halign={Gtk.Align.CENTER}
    valign={Gtk.Align.CENTER}
    vertical={true}
  >
    <label
      label={`󱙎`}
      valign={Gtk.Align.CENTER}
      halign={Gtk.Align.CENTER}
      vexpand={true}
    />
  </box>
);

export function NotificationList() {
  return (
    <box
      className="notif panel"
      vertical={true}
      vexpand={true}
      hexpand={false}
      halign={Gtk.Align.FILL}
      valign={Gtk.Align.FILL}
    >
      <centerbox
        className="notif panel box"
        spacing={20}
        valign={Gtk.Align.FILL}
        halign={Gtk.Align.CENTER}
        vertical={false}
        startWidget={
          <label
            label="Notifications"
            valign={Gtk.Align.START}
            halign={Gtk.Align.END}
          />
        }
        centerWidget={
          <button
            halign={Gtk.Align.START}
            valign={Gtk.Align.START}
            onClick={(_, event) => {
              if (event.button === Gdk.BUTTON_PRIMARY) {
                Notif.get_notifications().forEach((item, id) =>
                  timeout(50 * id, () => item.dismiss()),
                );
              }
            }}
          >
            <icon
              icon={bind(Notif, "notifications").as((items) =>
                items.length > 0 ? Icon.trash.full : Icon.trash.empty,
              )}
            />
          </button>
        }
        endWidget={
          <button
            halign={Gtk.Align.END}
            valign={Gtk.Align.START}
            onClick={(_, event) => {
              if (event.button === Gdk.BUTTON_PRIMARY) {
                Notif.set_dont_disturb(!Notif.get_dont_disturb());
              }
            }}
          >
            <icon
              icon={bind(Notif, "dont_disturb").as((d) =>
                d === false
                  ? Icons("bell-disabled-symbolic")
                  : Icons("bell-enabled-symbolic"),
              )}
              valign={Gtk.Align.CENTER}
              halign={Gtk.Align.CENTER}
            />
          </button>
        }
      />

      {/* {bind(Notif, "notifications").as((noti) =>
        noti.length > 0 ? NotifBox : Empty,
      )} */}
      {NotifBox}
    </box>
  );
}

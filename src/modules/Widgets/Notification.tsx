import { GLib, Widget, App, Gtk, Gdk } from "astal";
import { type Notification } from "types/service/notifications";
import Icons from "../lib/icons";
import Notifications from "gi://AstalNotifd"

//const notifications = await Service.import("notifications");
Notifications.popupTimeout = 30000;
Notifications.forceTimeout = false;
Notifications.cacheActions = false;
Notifications.clearDelay = 1000;

const time = (time: number, format = "%H:%M") =>
  GLib.DateTime.new_from_unix_local(time).format(format);

const NotificationIcon = ({ app_entry, app_icon, image }: Notification) => {
  if (image) {
    return <box
      hexpand={false}
      className={"icon img"}
      css={`
                background-image: url("${image}");
                background-size: cover;
                background-repeat: no-repeat;
                background-position: center;
                min-width: 5rem;
                min-height: 5rem;
            `}
    >
      <icon icon={Icons} />
    </box>
  }
  return <box
    valign={Gtk.Align.CENTER}
    hexpand={false}
    className="notiftemIcon"
    css={`
            min-width: 20px;
            min-height: 20px;
        `}
  >
    <icon
      icon={Icons}
      size={58}
      halign={Gtk.Align.CENTER}
      valign={Gtk.Align.CENTER}
      hexpand={true}
      vexpand={true}
    />
  </box>
};

export default (notification: Notification) => {
  const content = <box
    className="content"
    valign={Gtk.Align.CENTER}
    halign={Gtk.Align.FILL}
  >
    {NotificationIcon(notification)}
    <box
      vertical={true}
      halign="GtkAlign.FILL"
    >
      <box
        spacing={5}
        vertical={false}
        hexpand={true}
      >
        <label
          className="notifItemTitle"
          name="nTitle"
          xalign={0}
          justification="left"
          lines={2}
          maxWidthChars={35}
          truncate={"end"}
          wrap={true}
          use_markup={true}
          hexpand={true}
          valign={Gtk.Align.CENTER}
          halign={Gtk.Align.START}
          label={notification.summary.trim()}
        />
        <label
          className="time"
          halign={Gtk.Align.END}
          valign={Gtk.Align.CENTER}
          label={time(notification.time)}
        />
        <button
          className="close-button"
          halign={Gtk.Align.END}
          valign={Gtk.Align.CENTER}
          onClick={notification.close}
        >
          <icon icon="window-close-symbolic" />
        </button>
      </box>
      <label
        className="notifItemBody"
        hexpand={false}
        halign={Gtk.Align.START}
        use_markup={true}
        xalign={0}
        justification={"left"}
        label={notification.body.trim()}
        maxWidthChars={50}
        lines={3}
        truncate={"end"}
        wrap={true}
      />
    </box>
  </box>


  const actionsbox =
    notification.actions.length > 0
      ? <revealer
        transition="slide_down"
      >
        <eventbox>
          className="actions horizontal"
          {notification.actions.map((action) =>
            <button
              className="action-button"
              onClick={(_, event) => {
                if (event.button === Gdk.BUTTON_PRIMARY) {
                  notification.invoke(action.id)
                }
              }}
              hexpand={true}
            >
              <label label={action.label} />
            </button>
          )}
        </eventbox>
      </revealer >
      : null;

  const eventbox = <eventbox
    vexpand={false}
    hexpand={true}
    halign={Gtk.Align.START}
    onClick={(_, event) => {
      if (event.button === Gdk.BUTTON_PRIMARY) {
        notification.dismiss
      }
    }}
    onHover={(_, event) => {
      if (actionsbox) actionsbox.reveal_child = true;
    }}
    onHoverLost={(_, event) => {
      if (actionsbox) actionsbox.reveal_child = true;
      notification.dismiss();
    }}>
    <box
      vertical={true}
    >
      {actionsbox ? [content, actionsbox] : [content]}
    </box>
  </eventbox>

  return <box
    className={`notification ${notification.urgency}`}
  >
    eventbox
  </box>
}
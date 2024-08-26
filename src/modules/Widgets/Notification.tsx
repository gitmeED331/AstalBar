import { GLib, Widget, Gtk, Gdk } from "astal";
import Icon, { Icons } from "../lib/icons";
import Notifd from "gi://AstalNotifd";
import Pango from "gi://Pango";

const Notif = Notifd.get_default();
type Notification = Notifd.Notification;

// Setting notification properties
Notif.set_property("popupTimeout", 30000);
Notif.set_property("forceTimeout", false);
Notif.set_property("cacheActions", false);
Notif.set_property("clearDelay", 1000);

const time = (time: number, format = "%H:%M") =>
  GLib.DateTime.new_from_unix_local(time).format(format);

const NotificationIcon = ({ app_entry, app_icon, image }: Notification) => {
  if (image) {
    return (
      <box
        hexpand={false}
        className="icon img"
        css={`
          background-image: url("${image}");
          background-size: cover;
          background-repeat: no-repeat;
          background-position: center;
          min-width: 5rem;
          min-height: 5rem;
        `}
      />
    );
  }

  let icon = Icon.fallback.notification;
  if (Icons(app_icon)) icon = Icons(app_icon);
  if (Icons(app_entry || "")) icon = Icons(app_entry || "");

  return (
    <box
      valign={Gtk.Align.CENTER}
      hexpand={false}
      className="notiftemIcon"
      css={`
        min-width: 20px;
        min-height: 20px;
      `}
    >
      <icon
        icon={icon}
        icon_size={58}
        halign={Gtk.Align.CENTER}
        valign={Gtk.Align.CENTER}
        hexpand={true}
        vexpand={true}
      />
    </box>
  );
};

export default (notification: Notification) => {
  const content = (
    <box className="content" valign={Gtk.Align.CENTER} halign={Gtk.Align.FILL}>
      {NotificationIcon(notification)}
      <box vertical={true} halign={Gtk.Align.FILL}>
        <box spacing={5} vertical={false} hexpand={true}>
          <label
            className="notifItemTitle"
            name="nTitle"
            xalign={0}
            lines={2}
            maxWidthChars={35}
            ellipsize={Pango.EllipsizeMode.END}
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
          >
            {time(notification.time)}
          </label>
          <button
            className="close-button"
            halign={Gtk.Align.END}
            valign={Gtk.Align.CENTER}
            onClick={notification.dismiss}
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
          label={notification.body.trim()}
          maxWidthChars={50}
          lines={3}
          ellipsize={Pango.EllipsizeMode.END}
          wrap={true}
        />
      </box>
    </box>
  );

  const actionsbox =
    notification.actions.length > 0 ? (
      <revealer transitionType={Gtk.RevealerTransitionType.SLIDE_DOWN}>
        <eventbox className="actions horizontal">
          {notification.actions.map((action) => (
            <button
              className="action-button"
              onClick={(_, event) => {
                if (event.button === Gdk.BUTTON_PRIMARY) {
                  notification.invoke(action.id);
                }
              }}
              hexpand={true}
            >
              <label label={action.label} />
            </button>
          ))}
        </eventbox>
      </revealer>
    ) : null;

  const eventbox = (
    <eventbox
      vexpand={false}
      hexpand={true}
      halign={Gtk.Align.START}
      onClick={(_, event) => {
        if (event.button === Gdk.BUTTON_PRIMARY) {
          notification.dismiss();
        }
      }}
      onHover={(_, event) => {
        if (actionsbox) actionsbox.reveal_child = true;
      }}
      onHoverLost={(_, event) => {
        if (actionsbox) actionsbox.reveal_child = false;
        notification.dismiss();
      }}
    >
      <box vertical={true}>
        {actionsbox ? [content, actionsbox] : [content]}
      </box>
    </eventbox>
  );

  return (
    <box className={`notification ${notification.urgency}`}>
      {eventbox}
    </box>
  );
};

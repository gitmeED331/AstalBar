import { Widget, Gio, Gtk, GLib } from "astal";
import icons from "lib/icons"
//import Notification from "./Notification"
import AstalNofif from "gi://AstalNotifd"
import Pango from "gi://Pango"
import Icon, { Icons } from "../../lib/icons";

const Notifications = AstalNofif.get_default();

const NotificationIcon = ({ app_entry, app_icon, image }: Notification) => {
    if (image) {
        return (
            <box
                className={"icon img"}
                css={`            background-image: url("${image}");            background-size: contain;            background-repeat: no-repeat;            background-position: center;            min-width: 5rem;
            min-height: 5rem;
            `}
                )


        let icon = Icon.fallback.notification
        icon = Icons(app_icon) || Icons(app_entry)

        return (
            <box
                className={"notiftemIcon"}
                valign={Gtk.Align.CENTER}

                css={`
                min-width: 20px;
                min-height: 20px;
                `}
            >
                <icon icon={icon}
                    valign={Gtk.Align.CENTER}
                    halign={Gtk.Align.CENTER}
                />

            </box>
        )
    }
}
function notifSetup() {
    self.hook(Notifications, (self) => {
        self.children = Notifications.notifications.map(n => {
            <box
                className={"notifItem"}
                spacing={10}
                vertical={true}
                valign={Gtk.Align.START}
                halign={Gtk.Align.FILL}
                hexpand={true}
            >
                <button
                    onClick={() => {
                        n.close()
                    }}
                >
                    {Notification(n)}
                </button>
            </box>
        })
    })
}
function Notification({ n }) {

    const title = (
        <label
            className="notifItemTitle"
            hexpand={true}
            maxWidthChars={45}
            lines={2}
            ellipsize={Pango.EllipsizeMode.END}
            wrap={true}
            use_markup={true}
            valign={Gtk.Align.FILL}
            halign={Gtk.Align.FILL}
        >
            {n.summary}
        </label>
    );

    const time = (time: number, format = "%H:%M") => GLib.DateTime
        .new_from_unix_local(time)
        .format(format)

    const ntime = (
        <label className="time" valign={Gtk.Align.CENTER} halign={Gtk.Align.END}>
            {time(n.time)}
        </label>
    );

    const body = (
        <label
            className="notifItemBody"
            hexpand={true}
            vexpand={true}
            use_markup={true}
            lines={3}
            maxWidthChars={45}
            ellipsize={Pango.EllipsizeMode.END}
            wrap={true}
            valign={Gtk.Align.CENTER}
            halign={Gtk.Align.FILL}
        >
            {n.body.trim()}
        </label>
    );

    const actions = (
        <box className={"actions"} valign={Gtk.Align.CENTER}>
            {n.actions.map(({ id, label }) => (
                <button
                    className={"action-button"}
                    onClick={() => {
                        n.invoke(id);
                        n.dismiss();
                    }}
                    hexpand={true}
                >
                    <label label={label} />
                </button>
            ))}
        </box>
    );

    return (
        <eventbox attribute={{ id: n.id }} onClick={n.dismiss}>
            <box className={`notification ${n.urgency}`} vertical={false} valign={Gtk.Align.START} spacing={5}>
                {NotificationIcon(n)}
                <box vertical={true} className={"notifDetails"}>
                    <box vertical={false} spacing={5}>
                        {title}
                        {ntime}
                    </box>
                    {body}
                    {actions}
                </box>
            </box>
        </eventbox>
    )
}

const Notifs = (
    <box
        className="notif"
        spacing={7}
        vertical={true}
        vexpand={true}
        valign={Gtk.Align.START}
        halign={Gtk.Align.FILL}
        setup={notifSetup}
    />
);

const NotifBox = (
    <scrollable
        vscroll='always'
        hscroll='never'
        vexpand={true}
        className='notificationBox'
    >
        {Notifs}
    </scrollable>
);

const Empty = (
    <box
        className="notifEmpty"
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

export const NotificationList = () => {
    return (
        <box className="notifpanel" vertical vexpand>
            <centerbox className="notifpanelBox" spacing={20} start_widget={<label label="Notifications" valign={Gtk.Align.END} />} end_widget={
                <button halign={Gtk.Align.CENTER} valign={Gtk.Align.CENTER} onClick={(_, event) => {
                    if (event.button === Gdk.BUTTON_PRIMARY) {
                        const list = Array.from(Notifications.notifications);
                        list.forEach((item, i) => Utils.timeout(50 * i, () => item?.close()));
                    }
                }}>
                    <stack transition="crossfade" transitionDuration={150} setup={(self) => {
                        self.hook(Notifications, (self) => {
                            self.shown = Notifications.notifications.length === 0 ? 'empty' : 'full';
                        });
                    }}>
                        {{
                            'empty': <icon icon={Icon.trash.empty} />,
                            'full': <icon icon={Icon.trash.full} />
                        }}
                    </stack>
                </button>
            } />
            <stack transition="crossfade" transitionDuration={150} halign={Gtk.Align.CENTER} valign={Gtk.Align.FILL} setup={(self) => {
                self.hook(Notifications, (self) => {
                    self.shown = Notifications.notifications.length === 0 ? 'empty' : 'list';
                });
            }}>
                {{
                    'empty': Empty,
                    'list': NotifBox
                }}
            </stack>
        </box>
    );
}
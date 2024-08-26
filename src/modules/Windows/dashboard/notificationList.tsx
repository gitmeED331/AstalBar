import { Widget, Gio, Gtk, Gdk, GLib, Astal, GObject, timeout, bind } from "astal";
import Icon, { Icons } from "../../lib/icons"
//import Notification from "./Notification"
import Notifd from "gi://AstalNotifd"
import Pango from "gi://Pango"
import { ArrowToggleButton, SimpleToggleButton } from "src/modules/buttons/ToggleButton";

const Notif = Notifd.get_default();

const NotificationIcon = ({ app_entry, app_icon, image }: Notif) => {
    if (image) {
        return (
            <box
                className={"Notif icon"}
                css={`
                    background-image: url("${image}");
                    background-size: contain;
                    background-repeat: no-repeat;
                    background-position: center;
                    min-width: 2rem;
                    min-height: 2rem;
                `}
            />
        );
    }

    const icon = Icons(app_icon) || Icons(app_entry) || Icon.fallback.notification;
    return (
        <box
            className={"notiftemIcon"}
            valign={Gtk.Align.CENTER}
            css={`
                min-width: 2rem;
                min-height: 2rem;
            `}
        >
            <icon
                icon={icon}
                valign={Gtk.Align.CENTER}
                halign={Gtk.Align.CENTER}
            />
        </box>
    );
}
function NotifWidget() {

    const Time = (time: number, format = "%H:%M") => GLib.DateTime
        .new_from_unix_local(time)
        .format(format)

    return (
        <box
            className={"notifItem"}
            halign={Gtk.Align.CENTER}
            valign={Gtk.Align.CENTER}
            vexpand={true}
        >
            {bind(Notif, "notifications").as(items => items.map(item => (
                <box vertical={true}>
                    <centerbox
                        vertical={false}
                        halign={Gtk.Align.CENTER}
                        valign={Gtk.Align.CENTER}
                        startWidget={<NotificationIcon />}
                        centerWidget={<box vertical={true} valign={Gtk.Align.CENTER} halign={Gtk.Align.CENTER}>
                            <label label={item.summary} maxWidthChars={50} ellipsize={Pango.EllipsizeMode.END} halign={Gtk.Align.START} valign={Gtk.Align.START} />
                            <label label={item.body} maxWidthChars={50} ellipsize={Pango.EllipsizeMode.END} halign={Gtk.Align.START} valign={Gtk.Align.CENTER} />
                        </box>}
                    // endWidget={
                    //     <label className="time" valign={Gtk.Align.START} halign={Gtk.Align.END}
                    //         label={bind(Notif, "time").as(t =>Time(t))}
                    //     />}
                    />
                    {/* <box className={"notif item actions"} valign={Gtk.Align.CENTER}>
                        {item.actions?.map((action: Action) => (
                            <button
                                className={"action-button"}
                                onClick={() => {
                                    item?.invoke(action.id);
                                    item?.dismiss();
                                }}
                                hexpand={true}
                            >
                                <label label={action.label} />
                            </button>
                        ))}
                    </box> */}
                </box>
            )))}
        </box>
    );
}


//     return (
//         <eventbox
//             onClick={noti.dismiss}
//         >
//             <box className={`notification ${noti.urgency}`} vertical={false} valign={Gtk.Align.START} spacing={5} >
//                 {NotificationIcon(noti)}
//                 <box className={"notifDetails"} vertical={true} >
//                     <box vertical={false} spacing={5}>
//                         {title}
//                         {ntime}
//                     </box>
//                     {body}
//                     {/* {actions} */}
//                 </box>
//             </box>
//         </eventbox >
//     )
// }

const NotifBox = (
    <scrollable
        className='notificationBox'
        vscroll={Gtk.PolicyType.ALWAYS}
        hscroll={Gtk.PolicyType.AUTOMATIC}
        vexpand={true}
        halign={Gtk.Align.CENTER}
        valign={Gtk.Align.START}
    >
        <NotifWidget />
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
    const clearNotifications = () => {
        Notif.notifications.forEach((item, n) => timeout(50 * n, () => item?.dismiss()));
    };
    const buttonIcon = () => {
        if (Notif.get_notifications !== null && Notif.get_notifications.length === 0) {
            return Icon.trash.empty
        } else {
            return Icon.trash.full
        }
    }

    return (
        <box className="notif panel" vertical={true} vexpand={true}>
            <centerbox className="notif panel box" spacing={20}
                valign={Gtk.Align.FILL}
                halign={Gtk.Align.CENTER}
                vertical={false}
                startWidget={<label label="Notifications" valign={Gtk.Align.START} halign={Gtk.Align.END} />}
                centerWidget={
                    <button halign={Gtk.Align.START} valign={Gtk.Align.START}
                        onClick={() => {
                            clearNotifications();
                        }}>
                        <icon icon={buttonIcon()} />
                    </button>
                }
                endWidget={
                    <button halign={Gtk.Align.END} valign={Gtk.Align.START}
                        onClick={() => {
                            Notif.set_dont_disturb(!Notif.dontDisturb);
                        }}
                    >
                        <label label={bind(Notif, "dont_disturb").as(d => d === false ? "DND: Disabled" : "DND: Enabled")}
                            valign={Gtk.Align.CENTER} halign={Gtk.Align.CENTER} />
                    </button>
                }
            />

            {/* {Notif.get_notifications.length == 0 || Notif.get_dont_disturb() === true ? Empty : NotifBox} */}
            {NotifBox}
        </box>
    );
}
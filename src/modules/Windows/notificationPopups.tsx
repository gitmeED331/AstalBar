import { App, Widget, Astal, Gtk, Gdk, GLib, timeout, idle, bind } from "astal"
import Notifd from "gi://AstalNotifd"
import { Notification } from "../Widgets/index"

const Notif = Notifd.get_default()
const transitionTime = 300

function Animated(id: number) {
    const n = Notif.get_notification(id)!
    const theNotify = Notification(n)

    const inner = (
        <revealer
            transitionType={Gtk.RevealerTransitionType.SLIDE_LEFT}
            transition_duration={transitionTime}
            revealChild={false}
        >
            {theNotify}
        </revealer>
    )

    const outer = (
        <revealer
            transitionType={Gtk.RevealerTransitionType.SLIDE_RIGHT}
            transition_duration={transitionTime}
            revealChild={false}
        >
            {inner}
        </revealer>
    )

    const box = (
        <box
            halign={Gtk.Align.END}
        >
            {outer}
        </box>
    )

    idle(() => {
        outer.reveal_child = true
        timeout(transitionTime, () => {
            inner.reveal_child = true
        })
    })

    return Object.assign(box, {

        dismiss() {
            inner.reveal_child = false
            timeout(transitionTime, () => {
                outer.reveal_child = false
                timeout(transitionTime, () => {
                    box.destroy()
                })
            })
        },
    })
}


function popupBoxSetup(box: Widget.Box, map: Map<number, typeof Animated>) {
    Notif.connect("notified", (_, id: number) => {
        if (map.has(id)) {
            remove(null, id);
        }

        if (Notif.dont_disturb) {
            return;
        }

        const w = Animated(id);
        map.set(id, w);
        box.children = [w, ...box.children];
    });

    Notif.connect("dismissed", remove);
    Notif.connect("closed", remove);

    function remove(_, id: number) {
        const animatedElement = map.get(id);
        if (animatedElement) {
            animatedElement.dismiss();
            map.delete(id);
        }
    }
}

function PopupList(id: number) {
    const map: Map<number, ReturnType<typeof Animated>> = new Map();
    const notifWidth = Notif.get_property("width");
    console.log(`Notificaiton: ${Notif.get_notification}`)
    const box = (
        <box
            vertical={true}
            hexpand={true}
            halign={Gtk.Align.FILL}
            setup={(box) => popupBoxSetup(box, map)}
            css={bind(notifWidth).as(w => `min-width: ${w}px;`)}
        />
    );

    return box;
}


export default (monitor: number) => (
    <window
        name={`notifications${monitor}`}
        anchor={Astal.WindowAnchor.TOP | Astal.WindowAnchor.RIGHT}
        className={"notifications"}
        hexpand={true}
        layer={Astal.Layer.OVERLAY}
        exclusivity={Astal.Exclusivity.NORMAL}
        keymode={Astal.Keymode.NONE}
        visible={false}
        application={App}
    >
        <box
            css={"padding: 2px;"}
        >
            {PopupList}
        </box>
    </window>
)

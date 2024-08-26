import { Widget, Astal, Gtk, App, Gdk, Variable } from "astal"
import { winheight, winwidth } from "../../lib/screensizeadjust"
import Mpris from "gi://AstalMpris";
import Icon from "../../lib/icons"
const player = Mpris.Player.new("Deezer")
// --- imported widgets ---
import {
    //BrightnessSlider,
    GridCalendar,
    Player,
    PowerProfiles,
} from "../../Widgets/index"
import { NotificationList } from "./notificationList"


const Dashcal = () => (
    <box
        className={"dashcal"}
        valign={Gtk.Align.CENTER}
        halign={Gtk.Align.CENTER}
    >
        <GridCalendar />

    </box>
)
const TopCenter = () => (
    <centerbox
        className={"dashboard topCenter"}
        vertical={false}
        halign={Gtk.Align.CENTER}
        valign={Gtk.Align.START}
        spacing={10}
        centerWidget={<Player player={player} />}
    />
)
const LeftSide = () => (
    <centerbox
        className={"dashboard leftSide"}
        vertical={true}
        halign={Gtk.Align.START}
        valign={Gtk.Align.CENTER}
        spacing={10}

        startWidget={<GridCalendar />}
        // centerWidget={{/* <BrightnessSlider /> */ }}
        endWidget={<PowerProfiles />}
    />
)
const RightSide = () => (
    <centerbox
        className={"dashboard rightSide"}
        vertical={true}
        halign={Gtk.Align.CENTER}
        valign={Gtk.Align.START}
        hexpand={false}
        spacing={10}
        startWidget={<NotificationList />}
    />
)
function Dashboard() {
    const content = (
        <eventbox
            onKeyPressEvent={(_, event) => {
                if (event.get_keyval()[1] === Gdk.KEY_Escape) { App.toggle_window("dashboard") }
            }}
            onClick={() => { App.toggle_window("dashboard") }}
        >
            <box
                className={"dashboard container"}
                vertical={true}
                vexpand={false}
                hexpand={false}
                valign={Gtk.Align.CENTER}
                halign={Gtk.Align.CENTER}
                heightRequest={winheight(0.50)}
                widthRequest={winwidth(0.50)}
                css={`padding:1.5rem;`}
            >
                <centerbox vertical={true} halign={Gtk.Align.FILL} valign={Gtk.Align.FILL}
                    startWidget={<TopCenter />}

                    endWidget={<box className={"dashboard divider horizontal"}
                        valign={Gtk.Align.END}
                        halign={Gtk.Align.FILL}
                        visible={true}
                    />}
                />
                <centerbox vertical={false} halign={Gtk.Align.FILL} valign={Gtk.Align.FILL}
                    startWidget={<LeftSide />}
                    centerWidget={<box
                        className={"dashboard divider vertical"}
                        valign={Gtk.Align.FILL}
                        halign={Gtk.Align.CENTER}
                        visible={true}
                    />}
                    endWidget={<RightSide />}
                />
            </box>
        </eventbox >
    )
    return (<window
        name={"dashboard"}
        className={"dashboard window"}
        anchor={Astal.WindowAnchor.TOP | Astal.WindowAnchor.LEFT | Astal.WindowAnchor.RIGHT}
        layer={Astal.Layer.OVERLAY}
        exclusivity={Astal.Exclusivity.NORMAL}
        keymode={Astal.Keymode.EXCLUSIVE}
        visible={false}
        application={App}
    >
        {content}
    </window>
    )
}
export default Dashboard
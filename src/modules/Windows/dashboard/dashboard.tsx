import { Widget, Astal, Gtk, App, Variable } from "astal"
import { winheight, winwidth } from "../../lib/screensizeadjust"

// --- imported widgets ---
import {
    //BrightnessSlider,
    GridCalendar,
    //Player,
} from "../../Widgets"
//import { NotificationList } from "./notificationList"

const Dashcal = () => (
    <box
        className={"dashcal"}
        valign={Gtk.Align.CENTER}
        halign={Gtk.Align.CENTER}
    >
        <GridCalendar />

    </box>
)

function Dashboard() {

    return (<window
        name={"dashboard"}
        className={"dashboard window"}
        anchor={Astal.WindowAnchor.TOP | Astal.WindowAnchor.BOTTOM | Astal.WindowAnchor.RIGHT}
        layer={Astal.Layer.OVERLAY}
        exclusivity={Astal.Exclusivity.NORMAL}
        keymode={Astal.Keymode.NONE}
        visible={false}
        application={App}
    >
        <box
            className={"dashboard container"}
            vertical={true}
            vexpand={true}
            hexpand={false}
            valign={Gtk.Align.CENTER}
            halign={Gtk.Align.CENTER}
            css={`min-height: ${winheight(0.954)}px; min-width: ${winwidth(0.10)}px;`}
        >
            {/* <BrightnessSlider() /> */}
            {/* {NotificationList()} */}
            <Dashcal />
        </box>
    </window>
    )
}
export default Dashboard
import { Widget, Astal, App, Gtk } from "astal"
import AudioMixer from "../Widgets/AudioMixer"

export default () => <window
    name={"audiomixerwindow"}
    className={"window audiomixer"}
    anchor={Astal.WindowAnchor.TOP | Astal.WindowAnchor.TOP}
    layer={Astal.Layer.OVERLAY}
    exclusivity={Astal.Exclusivity.NORMAL}
    keymode={Astal.Keymode.NONE}
    visible={false}
    application={App}
    //type={Gtk.WindowType.TOPLEVEL}
    margin-right={525}
>

    <AudioMixer />

</window>


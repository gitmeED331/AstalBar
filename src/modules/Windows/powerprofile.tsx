import { Astal, App, Gtk } from "astal";
import { PowerProfiles } from "../Widgets/index";

export default () => <window
	name={"powerprofiles"}
	className={"pwrprofiles window"}
	anchor={Astal.WindowAnchor.TOP | Astal.WindowAnchor.TOP}
	layer={Astal.Layer.OVERLAY}
	exclusivity={Astal.Exclusivity.NORMAL}
	keymode={Astal.Keymode.NONE}
	visible={false}
	application={App}
//type={Gtk.WindowType.TOPLEVEL}
//margins={[0, 535]}
>
	<PowerProfiles />
</window>
import { Astal, Gtk } from "astal"
import { VolumeIndicator, BatteryButton } from "../Widgets/index"

//const { RoundedAngleEnd } = Roundedges;

export default function SysInfo() {
	return (
		<box className={"sysinfo"} halign={Gtk.Align.CENTER} valign={Gtk.Align.CENTER} spacing={5}>
			{/* <RoundedAngleEnd class_name="angleLeft" /> */}
			{/* <box spacing={8} hexpand="true" > */}
			<VolumeIndicator />
			<BatteryButton />
			{/* </box> */}
			{/* <RoundedAngleEnd class_name="angleRight" /> */}
		</box>
	)

}
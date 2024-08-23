import { Widget, Astal, bind, Gtk, Gdk } from "astal"
import Brightness from "../service/brightness"




const TheSlider = () =>
	<slider
		className={"brightsld Slider"}
		drawValue={false}
		on_change={self => Brightness.screen_value = self.value}
		value={bind(Brightness, 'screen-value').as(n => n > 1 ? 1 : n)}

	/>

const TheIcon = () =>
	<label
		className={"brightsldIcon"}
		setup={
			self => self.hook(Brightness, (self, screenValue) => {
				const icons = ["󰃚", "󰃛", "󰃜", "󰃝", "󰃞", "󰃟", "󰃠"];
				self.label = `${icons[Math.floor((Brightness.screen_value * 100) / 15)]}`;
			}, 'screen-changed')
		}
	/>

export const BrightnessSlider = () =>
	<box
		className={"brightSlider"}
		vertical={true}
		halign={Gtk.Align.CENTER}
		valign={Gtk.Align.CENTER}
	>
		<label
			className={"brightsldLabel"}
			label={"Brightness"}
			halign={Gtk.Align.CENTER}
		/>
		<box
			halign={Gtk.Align.CENTER}
			valign={Gtk.Align.CENTER}
		>
			{TheIcon()}
			{TheSlider()}
		</box>
	</box>
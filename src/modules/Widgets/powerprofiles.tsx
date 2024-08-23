import { App, Widget, Astal, execAsync, bind, Gtk, Gdk, GObject } from "astal";
import Icon, { Icons } from "../lib/icons";
// import Brightness from "../service/brightness"
import AstalPowerProfiles from "gi://AstalPowerProfiles";

const powerprofile = AstalPowerProfiles.get_default();

powerprofile.connect("notify::active-profile", () => {
  const brightnessLevels = {
    "power-saver": 30,
    balanced: 60,
    performance: 100,
  };

  const setBrightness = (level) => {
    execAsync(`light -S ${level}`);
  };

  const updateBrightness = () => {
    const level = brightnessLevels[powerprofile.activeProfile];
    setBrightness(level);
  };

  updateBrightness();
});

const SysButton = (action, label) => (
  <button
    onClick={(_, event) => {
      if (event.button === Gdk.BUTTON_PRIMARY) {
        powerprofile.activeProfile = action;
      }
    }}
    className={bind(powerprofile, "activeProfile").as((c) => (c === action ? c : ""))}
  >
    <box vertical={true}>
      <icon icon={Icon.powerprofile[action]} />
      <label label={label} visible={label !== ""} />
    </box>
  </button>
);


function PowerProfiles() {
  return (
    <box
      className={"powerprofiles container"}
      vertical={true}
      valign={Gtk.Align.CENTER}
      halign={Gtk.Align.CENTER}
    >
      <box
        vertical={true}
        valign={Gtk.Align.CENTER}
        halign={Gtk.Align.CENTER}
        spacing={10}
      >
        <label
          valign={Gtk.Align.CENTER}
          halign={Gtk.Align.CENTER}
          label={bind(powerprofile, "active_profile").as((l) => l.toUpperCase())}
        />
        {/* <label
				valign={Gtk.Align.CENTER}
				css={`padding-bottom: 5px;`}
				setup={
					self => self.hook(Brightness, (self, screenValue) => {
						const icons = ["󰃚", "󰃛", "󰃜", "󰃝", "󰃞", "󰃟", "󰃠"];
						self.label = `${icons[Math.floor((Brightness.screen_value * 100) / 15)]}`;
					}, 'screen-changed')
				}
			/>
			<label
				valign={Gtk.Align.CENTER}
				label={bind(Brightness, "screen_value").as(v => `${Math.floor(v * 100)}%`)}
			/> */}
      </box>
      <box
        className={"powerprofiles box"}
        vertical={false}
        vexpand={false}
        hexpand={false}
        valign={Gtk.Align.CENTER}
        halign={Gtk.Align.CENTER}
      >
        {SysButton("power-saver", "Saver")}
        {SysButton("balanced", "Balanced")}
        {SysButton("performance", "Performance")}
      </box>
    </box>
  );
}

export default PowerProfiles;

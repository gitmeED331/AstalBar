import { App, Widget, Astal, execAsync, exec, bind, Gtk, Gdk, GObject } from "astal";
import Icon, { Icons } from "../lib/icons";
import AstalPowerProfiles from "gi://AstalPowerProfiles";

const powerprofile = AstalPowerProfiles.get_default();

powerprofile.connect("notify::active-profile", () => {
  const brightnessLevels = {
    "power-saver": 30,
    balanced: 60,
    performance: 100,
  };

  const setBrightness = async (level: number) => {
    await execAsync(`light -S ${level}`).catch();
    brightness.set(level).catch();
  };

  const updateBrightness = () => {
    const level = brightnessLevels[powerprofile.activeProfile];
    setBrightness(level).catch();
  };

  updateBrightness();
});

const SysButton = (action: string, label: string) => (
  <button
    onClick={(_, event) => {
      if (event.button === Gdk.BUTTON_PRIMARY) {
        powerprofile.activeProfile = action;
        currentBrightness();
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
function currentBrightness() { return parseInt(exec("light -G").trim()) }
function PowerProfiles() {

  return (
    <box
      className={"powerprofiles container"}
      vertical={true}
      valign={Gtk.Align.CENTER}
      halign={Gtk.Align.CENTER}
      spacing={10}
    >
      <centerbox
        className={"powerprofiles header"}
        vertical={false}
        valign={Gtk.Align.CENTER}
        halign={Gtk.Align.FILL}
        centerWidget={<label
          valign={Gtk.Align.CENTER}
          halign={Gtk.Align.CENTER}
          label={bind(powerprofile, "active_profile").as((l) => l.toUpperCase())}
        />}
        endWidget={<box halign={Gtk.Align.CENTER} vertical={false} spacing={10}>
          <icon
            valign={Gtk.Align.END}
            halign={Gtk.Align.CENTER}
            css={`padding-bottom: 5px;`}
            icon={bind(powerprofile, "active_profile").as((l) =>
              l === "power-saver" ? Icon.brightness.levels.low :
                l === "balanced" ? Icon.brightness.levels.medium :
                  l === "performance" ? Icon.brightness.levels.high : ""
            )}
          />
          <label
            valign={Gtk.Align.CENTER}
            halign={Gtk.Align.CENTER}
            label={bind(powerprofile, "active_profile").as((l) =>
              l === "power-saver" ? "30%" :
                l === "balanced" ? "60%" :
                  l === "performance" ? "100%" : ""
            )}
          />
        </box>}
      />
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

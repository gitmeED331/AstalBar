import { App, Astal, execAsync, Gdk, Gtk } from "astal";
import Icon, { Icons } from "../lib/icons.js";
import { winheight } from "../lib/screensizeadjust";
import { RoundedAngleEnd } from "../lib/roundedCorner";

// type Action = "lock" | "reboot" | "logout" | "shutdown";

const SysButton = (action: string, label: string) => {
  // Define the command directly in the SysButton function
  const command = (() => {
    switch (action) {
      case "lock":
        return "bash -c 'exec ags -b lockscreen -c ~/.config/ags/Lockscreen/lockscreen.js'";
      case "reboot":
        return "systemctl reboot";
      case "logout":
        return "bash -c 'exec  ~/.config/hypr/scripts/hyprkill.sh >/dev/null 2>&1 &'";
      case "shutdown":
        return "systemctl -i poweroff";
      default:
        return "";
    }
  })();

  return (
    <button
      onClick={(_, event) => {
        if (event.button === Gdk.BUTTON_PRIMARY) {
          execAsync(command);
          App.toggle_window("sessioncontrols");
        }
      }}
    >
      <box
        className={"sessioncontrol button"}
        vertical={true}
        halign={Gtk.Align.CENTER}
        valign={Gtk.Align.CENTER}
      >
        <icon icon={Icon.powermenu[action]} />
        <label label={label} />
      </box>
    </button>
  );
};

export default () => {
  <window
    name={"sessioncontrols"}
    className={"sessioncontrols window"}
    anchor={
      Astal.WindowAnchor.TOP |
      Astal.WindowAnchor.BOTTOM |
      Astal.WindowAnchor.LEFT |
      Astal.WindowAnchor.RIGHT
    }
    layer={Astal.Layer.OVERLAY}
    exclusivity={Astal.Exclusivity.NORMAL}
    keymode={Astal.Keymode.ON_DEMAND}
    visible={false}
    application={App}
  >
    <eventbox
      onClick={() => App.toggle_window("sessioncontrols")}
      onKeyPressEvent={(_, event) => {
        if (event.get_keyval()[1] === Gdk.KEY_Escape) {
          App.toggle_window("sessioncontrols");
        }
      }}
      widthRequest={winheight(1)}
      heightRequest={winheight(1)}
    >
      <box
        className={"sessioncontrols container"}
        halign={Gtk.Align.CENTER}
        valign={Gtk.Align.CENTER}
        visible={true}
      >
        <box
          className={"sessioncontrols box"}
          valign={Gtk.Align.CENTER}
          halign={Gtk.Align.CENTER}
          spacing={30}
          visible={true}
        >
          {SysButton("lock", "Lock")}
          {SysButton("logout", "Log Out")}
          {SysButton("reboot", "Reboot")}
          {SysButton("shutdown", "Shutdown")}
        </box>
      </box>
    </eventbox>
  </window>;
};

import { Astal, execAsync, Widget, App, Gtk, Gdk } from "astal";
import { GridCalendar } from "../Widgets/index";

export default function Calendar() {
  return (
    <window
      name={"calendar"}
      className={"window calendar"}
      anchor={Astal.WindowAnchor.TOP | Astal.WindowAnchor.TOP}
      layer={Astal.Layer.OVERLAY}
      exclusivity={Astal.Exclusivity.NORMAL}
      keymode={Astal.Keymode.NONE}
      visible={false}
      application={App}
      //type={Gtk.WindowType.TOPLEVEL}
    >
      <box className={"calendarbox"}>
        <GridCalendar />
      </box>
    </window>
  );
}

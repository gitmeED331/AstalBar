import { Widget, App, Astal, Gdk } from "astal";
import { Ethernet } from "./ethernet/index.js";
import { Wifi } from "./wifi/index.js";

export default () => (
  <window
    name={"networkmenu"}
    anchor={Astal.WindowAnchor.TOP | Astal.WindowAnchor.TOP}
    layer={Astal.Layer.OVERLAY}
    exclusivity={Astal.Exclusivity.NORMAL}
    keymode={Astal.Keymode.EXCLUSIVE}
    visible={false}
    application={App}
    vexpand={true}
  >
    <box
      className={"network menu-container"}
    ><box
      vertical={true}
      hexpand={true}
    >
        {[Ethernet(), Wifi()]}
      </box>
    </box>
  </window>
)

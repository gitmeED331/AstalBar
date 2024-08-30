import { Widget, Astal, Gtk, App, Gdk, Variable } from "astal";
import { winheight, winwidth } from "../../lib/screensizeadjust";
import Mpris from "gi://AstalMpris";
import Icon from "../../lib/icons";
const player = Mpris.Player.new("Deezer");
// --- imported widgets ---
import {
  //BrightnessSlider,
  GridCalendar,
  Player,
  PowerProfiles,
  Tray,
} from "../../Widgets/index";
import { NotificationList } from "./notificationList";

const Calendar = () => (
  <box
    className={"dashboard calendar"}
    valign={Gtk.Align.CENTER}
    halign={Gtk.Align.CENTER}
  >
    <GridCalendar />
  </box>
);
const TopCenter = () => (
  <box
    className={"dashboard topCenter"}
    vertical={true}
    halign={Gtk.Align.CENTER}
    valign={Gtk.Align.START}
    spacing={10}
  >

  </box>
);
const LeftSide = () => (
  <box
    className={"dashboard leftSide"}
    vertical={true}
    halign={Gtk.Align.CENTER}
    valign={Gtk.Align.CENTER}
    spacing={10}
  //widthRequest={winwidth(0.25)}
  >
    <Calendar />
    {/* <BrightnessSlider /> */}
    <PowerProfiles />
  </box>
);
const RightSide = () => (
  <box
    className={"dashboard rightSide"}
    vertical={true}
    halign={Gtk.Align.CENTER}
    valign={Gtk.Align.FILL}
    hexpand={false}
    spacing={10}
  //widthRequest={winwidth(0.25)}
  >
    <NotificationList />
  </box>
);
function Dashboard() {
  const content = (
    <eventbox
      onKeyPressEvent={(_, event) => {
        if (event.get_keyval()[1] === Gdk.KEY_Escape) {
          App.toggle_window("dashboard");
        }
      }}
      onClick={() => {
        App.toggle_window("dashboard");
      }}
    >
      <box
        className={"dashboard container"}
        vertical={true}
        vexpand={false}
        hexpand={false}
        valign={Gtk.Align.START}
        halign={Gtk.Align.CENTER}
        heightRequest={winheight(0.5)}
        widthRequest={winwidth(0.25)}
        css={`
          padding: 1.5rem;
        `}
      >
        <box vertical={true} halign={Gtk.Align.CENTER} valign={Gtk.Align.CENTER} spacing={10}>

          <Player player={player} />
        </box>
        <box vertical={false} halign={Gtk.Align.FILL} valign={Gtk.Align.FILL} spacing={10} >
          <LeftSide />
          <Tray />
          <RightSide />
        </box>
      </box>
    </eventbox>
  );
  return (
    <window
      name={"dashboard"}
      className={"dashboard window"}
      anchor={
        Astal.WindowAnchor.TOP |
        Astal.WindowAnchor.LEFT |
        Astal.WindowAnchor.RIGHT |
        Astal.WindowAnchor.BOTTOM
      }
      layer={Astal.Layer.OVERLAY}
      exclusivity={Astal.Exclusivity.NORMAL}
      keymode={Astal.Keymode.EXCLUSIVE}
      visible={false}
      application={App}
    >
      {content}
    </window>
  );
}
export default Dashboard;

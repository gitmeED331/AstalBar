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
  BluetoothDevices,
  EthernetWidget,
  WifiAPs,
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
const LeftSide = () => {
  return (<box
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
  )
}

function RightSide() {
  const networkBox = (
    <box className={"network dashboard"} vertical={true} halign={Gtk.Align.FILL} valign={Gtk.Align.FILL} spacing={10} heightRequest={50}>
      <EthernetWidget />
      <WifiAPs />
    </box>
  )

  const stack = new Gtk.Stack({
    halign: Gtk.Align.FILL,
    valign: Gtk.Align.FILL,
    transition_type: Gtk.StackTransitionType.SLIDE_LEFT_RIGHT,
    transition_duration: 300,
    homogeneous: true,
  })

  stack.add_titled(<label label={"test 1"} css={`color: red; font-size: 3rem;`} />, "test1", "test 1");
  stack.add_titled(<label label={"test 2"} css={`color: green; font-size: 3rem;`} />, "test2", "test 2");
  stack.add_titled(<label label={"test 3"} css={`color: yellow; font-size: 3rem;`} />, "test3", "test 3");

  // stack.add_titled(<NotificationList />, 'notifications', 'Notifications');
  // stack.add_titled(networkBox, 'network', 'Network');
  // stack.add_titled(<BluetoothDevices />, 'bluetooth', 'Bluetooth');

  // const stack = (
  //   <stack
  //     halign={Gtk.Align.FILL}
  //     valign={Gtk.Align.FILL}
  //     // transitionType={Gtk.StackTransitionType.SLIDE_LEFT_RIGHT}
  //     // transitionDuration={300}
  //     homogeneous={true}
  //     shown={"notifications"}
  //   >
  //     <label label={"test 1"} css={`color: red;`} />
  //     <label label={"test 2"} css={`color: green;`} />
  //     <label label={"test 3"} css={`color: yellow;`} />
  //     {/* <NotificationList />
  //       <box className={"network dashboard"} vertical={true} halign={Gtk.Align.FILL} valign={Gtk.Align.FILL} spacing={10} heightRequest={50}>
  //         <EthernetWidget />
  //         <WifiAPs />
  //       </box>
  //       <BluetoothDevices /> */}
  //   </stack>
  // );

  const stackSwitcher = new Gtk.StackSwitcher({
    stack: stack,
    valign: Gtk.Align.FILL,
    halign: Gtk.Align.FILL,
  })


  return (
    <box
      className={"dashboard rightSide"}
      vertical={true}
      halign={Gtk.Align.CENTER}
      valign={Gtk.Align.FILL}
      hexpand={false}
      css={`background-color: black;`}
      widthRequest={winwidth(0.25)}
      heightRequest={winheight(0.25)}
    >
      {/* {stackSwitcher} */}
      {stack}
      {/* <NotificationList />
      {networkBox}
      <BluetoothDevices /> */}
    </box>
  )
}

function Dashboard() {
  const content = (
    <box
      className={"dashboard container"}
      vertical={true}
      vexpand={true}
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
        {content}
      </eventbox>
    </window>
  );
}
export default Dashboard;

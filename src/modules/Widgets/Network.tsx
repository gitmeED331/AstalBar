import { bind, Gdk, Gtk, Widget, App, Astal, Variable, Binding } from "astal";
import Icon, { Icons } from "../lib/icons";
import AstalNetwork from "gi://AstalNetwork";
import { merge } from "../lib/utils";

const network = AstalNetwork.get_default();
const Wired = network.wired;
const Wifi = network.wifi;


const NetworkWidget = () => {
  const wifiIndicator = (
    <box halign={Gtk.Align.CENTER} valign={Gtk.Align.CENTER}>
      <icon className="network-wifi" icon={bind(Wifi, "icon_name")} />
      {merge([bind(network, "wifi")], (wifi, showLabel) => {
        if (!showLabel) {
          return null;
        }
        return (
          <label
            className="network-barlabel-wifi"
            label={wifi.ssid ? `${wifi.ssid.substring(0, 7)}` : "--"}
          />
        );
      })}
    </box>
  );

  const wiredIndicator = (
    <box halign={Gtk.Align.CENTER} valign={Gtk.Align.CENTER}>
      <icon className="network-baricon-wired" icon={bind(Wired, "icon_name")} />
      {merge([bind(network, "wired")], (_, showLabel) => {
        if (!showLabel) {
          return null;
        }
        return <label className="network-barlabel-wired" label="Wired" />;
      })}
    </box>
  );

  return (
    <box
      halign={Gtk.Align.CENTER}
      valign={Gtk.Align.CENTER}
      className={"network-barbox"}
      visible={true}
    >
      {bind(network, "primary").as((w) =>
        w === "wired" ? wiredIndicator : wifiIndicator,
      )}
    </box>
  );
};

function NetworkButton() {
  return (
    <button
      className={"network barbutton"}
      halign={Gtk.Align.CENTER}
      valign={Gtk.Align.CENTER}
      onClick={() => {
        App.toggle_window("networkmenu");
      }}
    >
      <NetworkWidget />
    </button>
  )
};

export default NetworkButton;

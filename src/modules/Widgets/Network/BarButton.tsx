import { bind, Gdk, Gtk, Widget, App, Astal, Variable, Binding } from "astal";
import Icon, { Icons } from "../../lib/icons";
import AstalNetwork from "gi://AstalNetwork";

const network = AstalNetwork.get_default();
const Wired = network.wired;
const Wifi = network.wifi;


const NetworkWidget = () => {
  const wifiIcon = (
    <icon
      className={"network-wifi"}
      icon={bind(Wifi, "icon_name")}
    />
  );

  const wifiLabel = (
    <label
      className={"network-barlabel-wifi"}
      label={"--"} // Default label, will be updated dynamically
    />
  );

  const updateWifiLabel = () => {
    const wifi = network.wifi;
    wifiLabel.label = wifi && wifi.ssid ? `${wifi.ssid.substring(0, 7)}` : "--";
  };

  // Initial label setup
  updateWifiLabel();

  // Watch for changes in WiFi state
  network.connect('notify::wifi', updateWifiLabel);

  const wifiIndicator = (
    <box
      halign={Gtk.Align.CENTER}
      valign={Gtk.Align.CENTER}
      visible={bind(network, "wifi").as((showLabel) => !!showLabel)
      }
    >
      {[wifiIcon, wifiLabel]}
    </box>
  );

  const wiredIcon = (
    <icon
      className={"network-baricon-wired"}
      icon={bind(Wired, "icon_name")}
    />
  );

  const wiredLabel = (
    <label
      className={"network-barlabel-wired"}
      label={"Wired"}
    />
  );

  const wiredIndicator = (
    <box
      halign={Gtk.Align.CENTER}
      valign={Gtk.Align.CENTER}
      visible={bind(network, "wired").as((showLabel) => !!showLabel)}
    >
      {[wiredIcon, wiredLabel]}
    </box>
  );

  return (
    <box
      halign={Gtk.Align.CENTER}
      valign={Gtk.Align.CENTER}
      className={"network-barbox"}
      visible={true}
    >
      {bind(network, "primary").as((w) => w === AstalNetwork.Primary.WIRED ? wiredIndicator : wifiIndicator)}
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
        App.toggle_window("dashboard");
      }}
    >
      <NetworkWidget />
    </button>
  )
};

export default NetworkButton;

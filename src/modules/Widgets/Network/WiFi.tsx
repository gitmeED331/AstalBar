import { execAsync, bind, Gdk, Gtk, Widget, App, Astal, Variable, Binding } from "astal";
import Icon, { Icons } from "../../lib/icons";
import AstalNetwork from "gi://AstalNetwork";

const network = AstalNetwork.get_default();
const Wifi = network.wifi;

function DeviceList() {
    const item = (
        <box
            halign={Gtk.Align.CENTER}
            valign={Gtk.Align.CENTER}
            spacing={5}
        >
            <icon
                className={"network-wifi"}
                icon={Icon.network.wifi.connected}
            />
            <label
                className={"network-barlabel-wifi"}
                label={"--"} // Default label, will be updated dynamically
            />
        </box>
    )
    const controls = (
        <button
            onClick={(_, event) => {
                if (event.button === Gdk.BUTTON_PRIMARY) {
                    execAsync("nmcli dev wifi connect");
                }
            }}
            halign={Gtk.Align.END} valign={Gtk.Align.CENTER}
            tooltip_text={"Connect"}
        >
            <icon
                icon={"network-wireless-symbolic"}
                halign={Gtk.Align.END} valign={Gtk.Align.CENTER}
            />
        </button>
    )
    return (
        <box
            halign={Gtk.Align.CENTER}
            valign={Gtk.Align.CENTER}
            spacing={5}
            vertical={false}
        >
            {item}
            {controls}
        </box>
    )
}

function header() {
    const refresh = (
        <button
            onClick={(_, event) => {
                if (event.button === Gdk.BUTTON_PRIMARY) {
                    Wifi.scan()
                }
            }}
            halign={Gtk.Align.CENTER} valign={Gtk.Align.CENTER}
            tooltip_text={bind(Wifi, "scanning").as((v) => v ? "wifi scanning" : "")}
        >
            <icon
                icon={"view-refresh-symbolic"}
                halign={Gtk.Align.END} valign={Gtk.Align.CENTER}
            />
        </button>
    )
    const enable = (
        <button
            onClick={(_, event) => {
                if (event.button === Gdk.BUTTON_PRIMARY) {
                    execAsync(`nmcli radio wifi ${Wifi.enabled ? "off" : "on"}`);
                }
            }}
            halign={Gtk.Align.CENTER} valign={Gtk.Align.CENTER}
            tooltip_text={bind(Wifi, "enabled").as((v) => v ? "Disable" : "Enable")}
        >
            <icon
                icon={bind(Wifi, "enabled").as((v) => v ? Icon.network.wifi.enabled : Icon.network.wifi.disabled)}
                halign={Gtk.Align.END} valign={Gtk.Align.CENTER}
            />
        </button>
    )
    const head = (
        <label
            label={"Wi-Fi"}
            halign={Gtk.Align.CENTER}
            valign={Gtk.Align.CENTER}
        />
    )

    return (
        <centerbox
            className={"network-wifi header"}
            halign={Gtk.Align.FILL}
            valign={Gtk.Align.FILL}
            spacing={5}
            vertical={false}

            startWidget={head}

            endWidget={
                <box halign={Gtk.Align.CENTER} vertical={false} spacing={5}>
                    {enable}
                    {refresh}
                </box>
            }
        />
    )
}
function WifiWidget() {
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
        wifiLabel.label = wifi && wifi.ssid ? `${wifi.ssid.substring(0, 15)}` : "--";
    };


    // Initial label setup
    updateWifiLabel();

    // Watch for changes in WiFi state
    network.connect('notify::wifi', updateWifiLabel);

    const wifiIndicator = (
        <button
            halign={Gtk.Align.CENTER}
            valign={Gtk.Align.CENTER}
            visible={bind(network, "wifi").as((showLabel) => !!showLabel)}
            onClick={() => {
                execAsync(`nmcli dev wifi ${network.wifi.connected ? "disconnect" : "connect"} ${network.wifi.ssid}`);
            }}
        >
            <box spacing={5}>
                {[wifiIcon, wifiLabel]}
            </box>
        </button>
    )

    return wifiIndicator
}

function WifiAPs() {
    return (
        <box
            className={"network-wifi container"}
            halign={Gtk.Align.FILL}
            valign={Gtk.Align.FILL}
            visible={true}
            vertical={true}
            spacing={10}
        >

            {header()}
            <WifiWidget />
        </box>
    )
}
export default WifiAPs
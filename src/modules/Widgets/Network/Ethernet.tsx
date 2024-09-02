import { bind, Gdk, Gtk, Widget, App, Astal, Variable, Binding } from "astal";
import Icon, { Icons } from "../../lib/icons";
import AstalNetwork from "gi://AstalNetwork";

const network = AstalNetwork.get_default();
const Wired = network.wired;

function header() {
    const ethernetIcon = (
        <icon
            className={"network-ethernet"}
            icon={bind(Wired, "icon_name")}
        />
    );

    const ethernetLabel = (
        <label
            className={"network-ethernet barlabel"}
            label={"Ethernet"}
        />
    )

    const ethernetIndicator = (
        <box
            halign={Gtk.Align.CENTER}
            valign={Gtk.Align.CENTER}
            visible={bind(network, "wired").as((showLabel) => !!showLabel)}
            spacing={5}
        >
            {[ethernetIcon, ethernetLabel]}
        </box>
    );

    return ethernetIndicator;
}
const status = (
    <box
        halign={Gtk.Align.CENTER}
        valign={Gtk.Align.CENTER}
        spacing={5}
    >
        <label
            label={bind(Wired, "internet").as((i) => i == 0 ? "Connected" : i == 1 ? "Connecting" : "Disconnected")}
            halign={Gtk.Align.CENTER} valign={Gtk.Align.CENTER}
        />
    </box>
)

function EthernetWidget() {
    return (
        <box halign={Gtk.Align.CENTER}
            valign={Gtk.Align.CENTER}
            vertical={true}
        >
            <box
                className={"network-ethernet container"}
                halign={Gtk.Align.CENTER}
                valign={Gtk.Align.CENTER}
                spacing={5}
                vertical={false}
            >
                {header()}
                {status}
            </box>

        </box>
    )
}

export default EthernetWidget
import { bind, Widget, Variable, Gtk, Gdk, Astal } from "astal";
import Icon, { Icons } from "../../../lib/icons";
import AstalNetwork from "gi://AstalNetwork";
import { merge } from "../../../lib/utils";

const network = AstalNetwork.get_default();
const Wired = network.wired;
const Wifi = network.wifi;
const AccessPoint = network.wifi.get_active_access_point();

import { renderWAPs } from "./WirelessAPs.js";
import { renderWapStaging } from "./APStaging.js";

const Staging = Variable({} as typeof AccessPoint);
const Connecting = Variable("");

const searchInProgress = Variable(false);

const startRotation = () => {
    searchInProgress.value = true;
    setTimeout(() => {
        searchInProgress.value = false;
    }, 5 * 1000);
};

const WifiWidget = () => {
    return (
        <box
            className={"network-menu wifi"}
            vertical={true}
        >
            <box
                className={"network menu-label-container"}
                halign={Gtk.Align.FILL}
            >
                <label
                    className={"network menu-label"}
                    hexpand={true}
                    halign={Gtk.Align.START}
                    label={"Wi-Fi"}
                />
                <button
                    className={"network-menu-icon-button search"}
                    halign={Gtk.Align.END}
                    valign={Gtk.Align.CENTER}
                    onClick={() => {
                        startRotation();
                        network.wifi.scan();
                    }}
                >
                    <icon
                        className={bind(searchInProgress, "value").as((v) => (v ? "spinning" : ""))}
                        icon={"view-refresh-symbolic"}
                    />
                </button>
            </box>
            <box
                className={"network-menu-items-section"}
                vertical={true}
            >
                <box
                    className={"wap-staging"}
                    setup={(self) => {
                        renderWapStaging(self, network, Staging, Connecting);
                    }}
                />,
                <box
                    className={"available-waps"}
                    vertical={true}
                    setup={(self) => {
                        renderWAPs(self, network, Staging, Connecting);
                    }}
                />
            </box>
        </box>
    )
};

export { Wifi };

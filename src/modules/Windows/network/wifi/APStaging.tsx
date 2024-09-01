import { execAsync, Gtk, Gdk, bind, Widget, Astal, Variable } from "astal"
import Icon, { Icons } from "../../../lib/icons";
import AstalNetwork from "gi://AstalNetwork";
import { merge } from "../../../lib/utils";
import pango from "gi://Pango";

const network = AstalNetwork.get_default();
const Wired = network.wired;
const Wifi = network.wifi;
const AccessPoint = network.wifi.get_active_access_point();

const renderWapStaging = (self: any, network: Network, staging: Variable<typeof AccessPoint>, connecting: Variable<string>) => {
    merge([bind(network, "wifi"), staging.bind("value")], () => {
        if (!Object.keys(staging.value).length) {
            return (self.child = Widget.Box());
        }

        return (self.child = <box
            className={"network-element-item staging"}
            vertical={true}
        >
            <box
                halign={Gtk.Align.FILL}
                hexpand={true}
            >
                <icon
                    className={`network-icon wifi`}
                    icon={`${staging.value.iconName}`}
                />
                <box
                    className={"connection-container"}
                    hexpand={true}
                    vertical={true}
                >
                    <label
                        className={"active-connection"}
                        halign={Gtk.Align.START}
                        ellipsize={pango.EllipsizeMode.END}
                        wrap={true}
                        label={staging.value.ssid}
                    />
                </box>
                <revealer

                    halign={Gtk.Align.END}
                    reveal_child={bind(connecting, "value")
                        .as((c) => staging.value.bssid === c)}
                >
                    <spinner className={"spinner wap"} />

                </revealer>
            </box>
            <box
                className={"network-password-input-container"}
                halign={Gtk.Align.FILL}
                hexpand={true}
            >
                <entry
                    className={"network-password-input"}
                    halign={Gtk.Align.START}
                    hexpand={true}
                    visibility={false}

                    placeholder_text={"enter password"}
                    onAccept={(selfInp) => {
                        connecting.value = staging.value.bssid || "";
                        execAsync(
                            `nmcli dev wifi connect ${staging.value.bssid} password ${selfInp.text}`,
                        )
                            .catch((err) => {
                                connecting.value = "";
                                console.error(
                                    `Failed to connect to wifi: ${staging.value.ssid}... ${err}`,
                                );
                                notify({
                                    summary: "Network",
                                    body: err,
                                    timeout: 5000,
                                });
                            })
                            .then(() => {
                                connecting.value = "";
                                staging.value = {} as typeof AccessPoint;
                            });
                        selfInp.text = "";
                    }}
                />
                <button
                    className={"close-network-password-input-button"}
                    halign={Gtk.Align.END}

                    onClick={() => {
                        connecting.value = "";
                        staging.value = {} as typeof AccessPoint;
                    }}
                >
                    <icon
                        className={"close-network-password-input-icon"}
                        icon={"window-close-symbolic"}
                    />
                </button>
            </box>
        </box>
        )
    });
};

export { renderWapStaging };

import { execAsync, Gtk, Gdk, bind, Widget, Astal, Variable } from "astal"
import Icon, { Icons } from "../../../lib/icons";
import AstalNetwork from "gi://AstalNetwork";
import { merge } from "../../../lib/utils";
import pango from "gi://Pango";

const network = AstalNetwork.get_default();
const Wired = network.wired;
const Wifi = network.wifi;
const AccessPoint = network.wifi.get_active_access_point();

import { getWifiIcon } from "../utils"


const renderWAPs = (self: any, network: Network, staging: Variable<typeof AccessPoint>, connecting: Variable<string>) => {
    const getIdBySsid = (ssid: string, nmcliOutput: string) => {
        const lines = nmcliOutput.trim().split("\n");
        for (const line of lines) {
            const columns = line.trim().split(/\s{2,}/);
            if (columns[0].includes(ssid)) {
                return columns[1];
            }
        }
        return null;
    };

    const WifiStatusMap = {
        unknown: "Status Unknown",
        unmanaged: "Unmanaged",
        unavailable: "Unavailable",
        disconnected: "Disconnected",
        prepare: "Preparing Connecting",
        config: "Connecting",
        need_auth: "Needs Authentication",
        ip_config: "Requesting IP",
        ip_check: "Checking Access",
        secondaries: "Waiting on Secondaries",
        activated: "Connected",
        deactivating: "Disconnecting",
        failed: "Connection Failed",
    };

    self.hook(network, () => {
        merge([staging.bind("value"), connecting.bind("value")], () => {
            // Sometimes the network service will yield a "this._device is undefined" when
            // trying to access the "access_points" property. So we must validate that
            // it's not 'undefined'
            //
            // Also this is an AGS bug that needs to be fixed
            let WAPs =
                network.wifi._device !== undefined ? network.wifi["access-points"] : [];

            const dedupeWAPs = () => {
                const dedupMap = {};
                WAPs.forEach((item: AccessPoint) => {
                    if (item.ssid !== null && !Object.hasOwnProperty.call(dedupMap, item.ssid)) {
                        dedupMap[item.ssid] = item;
                    }
                });

                return Object.keys(dedupMap).map((itm) => dedupMap[itm]);
            };

            WAPs = dedupeWAPs();

            const isInStaging = (wap: AccessPoint) => {
                if (Object.keys(staging.value).length === 0) {
                    return false;
                }

                return wap.bssid === staging.value.bssid;
            };

            const isDisconnecting = (wap: AccessPoint) => {
                if (wap.ssid === network.wifi.ssid) {
                    return network.wifi.state.toLowerCase() === "deactivating";
                }
                return false;
            };

            const filteredWAPs = WAPs.filter((ap: AccessPoint) => {
                return ap.ssid !== "Unknown" && !isInStaging(ap);
            }).sort((a: AccessPoint, b: AccessPoint) => {
                if (network.wifi.ssid === a.ssid) {
                    return -1;
                }

                if (network.wifi.ssid === b.ssid) {
                    return 1;
                }

                return b.strength - a.strength;
            });

            if (filteredWAPs.length <= 0 && Object.keys(staging.value).length === 0) {
                return (self.child = <label
                    className={"waps-not-found dim"}
                    expand={true}
                    halign={Gtk.Align.CENTER}
                    valign={Gtk.Align.CENTER}
                    label={"No Wi-Fi Networks Found"}
                />);
            };

            return (self.children = filteredWAPs.map((ap: AccessPoint) => {
                return <box css={`margin-bottom: 5px;`}
                >
                    <button
                        className={"network-element-item"}
                        cursor={"pointer"}
                        onClick={() => {
                            if (ap.bssid === connecting.value || ap.active) {
                                return;
                            }

                            connecting.value = ap.bssid || "";
                            execAsync(`nmcli device wifi connect ${ap.bssid}`)
                                .then(() => {
                                    connecting.value = "";
                                    staging.value = {} as AccessPoint;
                                })
                                .catch((err) => {
                                    if (
                                        err
                                            .toLowerCase()
                                            .includes("secrets were required, but not provided")
                                    ) {
                                        staging.value = ap;
                                    } else {
                                        Utils.notify({
                                            summary: "Network",
                                            body: err,
                                            timeout: 5000,
                                        });
                                    }
                                    connecting.value = "";
                                });
                        }}
                    >
                        <centerbox

                            halign={Gtk.Align.START}
                            valign={Gtk.Align.CENTER}
                            hexpand={true}
                            spacing={10}
                            startWidget={<label
                                halign={Gtk.Align.START}
                                valign={Gtk.Align.START}
                                className={`network-icon wifi ${ap.ssid === network.wifi.ssid ? "active" : ""}`}
                                label={getWifiIcon(`${ap["iconName"]}`)}
                            />}
                            centerWidget={<label
                                halign={Gtk.Align.START}
                                valign={Gtk.Align.CENTER}
                                className={`active-connection ${ap.ssid === network.wifi.ssid ? "active" : ""}`}
                                ellipsize={pango.EllipsizeMode.MIDDLE}
                                wrap={true}
                                tooltip_markup={
                                    `Frequency: ${(ap.frequency / 1000).toFixed(1)}Ghz\nSpeed: ${ap.max_bitrate}Mbps`}
                                label={ap.ssid}
                            />}
                        // endWidget={<label
                        //     halign={Gtk.Align.END}
                        //     align={Gtk.Align.START}
                        //     className={`active-connection ${ap.ssid === network.wifi.ssid ? "active" : ""}`}
                        //     label={`${(ap.frequency / 1000).toFixed(1)}Ghz`}
                        // />}
                        />
                    </button>
                    <centerbox
                        valign={Gtk.Align.CENTER}
                        halign={Gtk.Align.END}
                        spacing={5}
                        startWidget={<revealer
                            halign={Gtk.Align.END}
                            valign={Gtk.Align.START}
                            reveal_child={
                                ap.bssid === connecting.value || isDisconnecting(ap)}
                        >
                            <spinner
                                valign={Gtk.Align.START}
                                className={"spinner wap"}
                            />
                        </revealer>}
                        centerWidget={<revealer
                            valign={Gtk.Align.START}
                            reveal_child={ap.bssid !== connecting.value && ap.active}
                        >
                            <button
                                tooltip_text={"Delete/Forget Network"}
                                className={"menu-icon-button network disconnect"}
                                cursor={"pointer"}
                                onClick={() => {
                                    connecting.value = ap.bssid || "";
                                    execAsync("nmcli connection show --active").then(() => {
                                        execAsync("nmcli connection show --active").then(
                                            (res) => {
                                                const connectionId = getIdBySsid(ap.ssid || "", res);

                                                execAsync(
                                                    `nmcli connection delete ${connectionId} "${ap.ssid}"`,
                                                )
                                                    .then(() => (connecting.value = ""))
                                                    .catch((err) => {
                                                        connecting.value = "";
                                                        console.error(
                                                            `Error while forgetting "${ap.ssid}": ${err}`,
                                                        );
                                                    });
                                            },
                                        );
                                    });
                                }
                                }
                            >
                                <icon
                                    valign={Gtk.Align.CENTER}
                                    halign={Gtk.Align.END}
                                    className={"network-disonnect"}
                                    icon={Icons("circle-x-symbolic")}
                                />
                            </button>
                        </revealer>}
                        endWidget={<icon
                            valign={Gtk.Align.CENTER}
                            halign={Gtk.Align.START}
                            className={ap.encrypted === true ? "connection-unsecure" : "connection-secure"}
                            icon={ap.encrypted === true ? Icons("lock-open-symbolic") : Icons("lock-closed-symbolic")}
                            tooltip_text={ap.encrypted === true ? "Unsecure" : "Secure"}
                        />}
                    />
                </box>;
            })
            )
        })
    })
}


export { renderWAPs };

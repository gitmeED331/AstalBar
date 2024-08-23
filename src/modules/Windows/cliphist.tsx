import { GLib, execAsync, Widget, Gtk, App } from 'astal';
import Pango from 'gi://Pango'
const WINDOW_NAME = "cliphist";
import popupwindow from "modules/service/popupwindow.ts";
const { Box } = Widget

type EntryObject = {
    id: string;
    content: string;
    entry: string;
};

function ClipHistItem(entry: string) {
    let [id, ...content] = entry.split("\t");
    let clickCount = 0;
    let button = <button
        className={"clip_container"}
    >
        <box>
            <label
                label={id}
                className={"clip_id"}
                valign={Gtk.Align.CENTER}
            />
            <label
                label={"・"}
                className={"dot_divider"}
                valign={Gtk.Align.CENTER}
            />
            <label
                label={content.join(" ").trim()}
                className={"clip_label"}
                valign={Gtk.Align.CENTER}
                ellipsize={Pango.EllipsizeMode.END}
            />
        </box>
    </button>

    button.connect("clicked", () => {
        clickCount++;
        if (clickCount === 2) {
            const win = (WINDOW_NAME);
            execAsync(`${GLib.get_user_config_dir()}/src/scripts/cliphist.sh --copy-by-id ${id}`);
            clickCount = 0;
        }
    });

    button.connect("focus-out-event", () => {
        clickCount = 0;
    });

    return <box
        //         attribute={content: content.join(" ").trim()
        // }
        // orientation = (Gtk.Orientation.VERTICAL)
        //     >
        //     { button }
        //     < separator
        // className = { "clip_divider"}
        // orientation = { Gtk.Orientation.HORIZONTAL }
        //     />
        //     </box >

        function ClipHistWidget({ width = 500, height = 500, spacing = 12 }) {
            let output: string;
            let entries: string[];
            let clipHistItems: EntryObject[];
            let widgets: Box<any, any>[];

            const list = <box
                vertical={true}
                spacing
            >

                async function repopulate() {
                    output = await Utils.execAsync(`${App.configDir}/scripts/cliphist.sh --get`)
                        .then((str) => str)
                        .catch((err) => {
                            print(err);
                            return "";
                        });
                entries = output.split("\n").filter((line) => line.trim() !== "");
                clipHistItems = entries.map((entry) => {
                    let[id, ...content] = entry.split("\t");
                return {id: id.trim(), content: content.join(" ").trim(), entry: entry };
                });
                widgets = clipHistItems.map((item) => ClipHistItem(item.entry));
                list.children = widgets;
            }
                repopulate();

                const entry = Widget.Entry({
                    hexpand: true,
                class_name: "cliphistory_entry",
                placeholder_text: "Search",

                on_change: ({text}) => {
                    const searchText = (text ?? "").toLowerCase();
                    widgets.forEach((item) => {
                    item.visible = item.attribute.content.toLowerCase().includes(searchText);
                    });
                }
            });

                return Widget.Box({
                    vertical: true,
                class_name: "cliphistory_box",
                margin_top: 14,
                margin_right: 14,
                children: [
                entry,
                Widget.Separator(),
                Widget.Scrollable({
                    hscroll: "never",
                css: `min-width: ${width}px;` + `min-height: ${height}px;`,
                child: list
                    })
                ],
                setup: (self) =>
                    self.hook(App, (_, windowName, visible) => {
                        if (windowName !== WINDOW_NAME) return;

                if (visible) {
                    repopulate();
                entry.text = "";
                        }
                    })
            });
        }

                export const cliphist = popupwindow({
                    name: WINDOW_NAME,

                class_name: "cliphistory",
                visible: false,
                keymode: "exclusive",
                child: ClipHistWidget({
                    width: 500,
                height: 500,
                spacing: 0
        }),
                anchor: ["top", "right"]
    });

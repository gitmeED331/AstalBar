import { Widget, Gdk, Gtk, bind, Variable, App, Astal } from "astal";
import AstalTray from "gi://AstalTray";
import Icon, { Icons } from "../lib/icons";

const SystemTray = AstalTray.Tray.get_default();

const SysTrayItem = item => {
    const menu = item.create_menu?.();

    return (
        <button
            className={"systray-item"}
            halign={Gtk.Align.CENTER}
            valign={Gtk.Align.CENTER}
            onClick={(btn, event) => {
                if (event.button === Gdk.BUTTON_PRIMARY || event.button === Gdk.BUTTON_SECONDARY) {
                    menu?.popup_at_widget(btn, Gdk.Gravity.SOUTH, Gdk.Gravity.NORTH, null);
                } else if (event.button === Gdk.BUTTON_MIDDLE) {
                    item.activate(0, 0);
                }
            }
            }
            tooltip_markup={bind(item, "tooltip_markup")}
        >
            <icon
                halign={Gtk.Align.CENTER} valign={Gtk.Align.CENTER}
                icon={
                    item.get_icon_pixbuf() ||
                    Icons(item.get_icon_name())
                }
            />
        </button>
    );
};

function traySetup(box) {
    const items = new Map();

    const addItem = id => {
        const item = SystemTray.get_item(id);
        if (item) {
            const trayItem = SysTrayItem(item);
            items.set(id, trayItem);
            box.add(trayItem);
            trayItem.show();
        }

        console.log(`added item ${id}`);
        console.log(`items: ${items.size}`);
        console.log(`icons: ${item.get_icon_name()}`);
        console.log(`pixbuf: ${item.get_icon_pixbuf()}`);
        console.log(`category: ${item.get_category()}`);
        console.log(`tooltip: ${item.get_tooltip_markup()}`);
        console.log(`label: ${item.get_title()}`);
    };

    const removeItem = id => {
        const trayItem = items.get(id);
        if (trayItem) {
            trayItem.destroy();
            items.delete(id);
        }
    };

    SystemTray.get_items().forEach(item => addItem(item.item_id));
    SystemTray.connect("item_added", (tray, id) => addItem(id));
    SystemTray.connect("item_removed", (tray, id) => removeItem(id));
}


function Tray() {
    return (
        <box
            className={"tray container"}
            setup={traySetup}
        />
    )
}
export default Tray;
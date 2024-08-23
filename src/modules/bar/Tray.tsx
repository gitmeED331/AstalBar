import { Widget, Gdk, Gtk, bind, Variable, App, Astal } from "astal";
import AstalTray from "gi://AstalTray";
import Icon, { Icons } from "../lib/icons";

const SystemTray = AstalTray.Tray.get_default();

const SysTrayItem = item => {
    const menu = item.create_menu?.();

    const handleClick = (btn, event) => {
        const button = event.button;
        if (button === Gdk.BUTTON_PRIMARY || button === Gdk.BUTTON_SECONDARY) {
            menu?.popup_at_widget(btn, Gdk.Gravity.SOUTH, Gdk.Gravity.NORTH, null);
        } else if (button === Gdk.BUTTON_MIDDLE) {
            item.activate(0, 0);
        }
    };
    return (
        <button
            className={"systray-item"}
            halign={Gtk.Align.CENTER}
            valign={Gtk.Align.CENTER}
            setup={menu}
            onClick={handleClick}
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

function traySetup(box: Widget.Box) {

    const items = new Map<number, Widget>();  // Correct the type to Widget

    const AddItem = (id: number) => {
        if (!id) return;

        const item = SystemTray.get_item(id);
        if (!item) return;

        const TrayItem = SysTrayItem(item);

        items.set(id, TrayItem);
        box.pack_start(TrayItem, false, false, 0);
        TrayItem.show();

        // Log item properties
        console.log(`ID: ${id}`);
        console.log(`Title: ${item.get_title?.() || "Unknown"}`);
        console.log(`Icon name: ${item.get_icon_name?.() || "Unknown"}`);
        console.log(`Icon pixbuf: ${item.get_icon_pixbuf?.() ? "Exists" : "None"}`);
    };

    const RemoveItem = (id: number) => {
        const widget = items.get(id);
        if (widget) {
            widget.destroy();
            items.delete(id);
        }
    };

    // Add existing items on setup
    SystemTray.get_items().forEach(item => AddItem(parseInt(item.item_id)));

    // Hook to add and remove items dynamically
    box.hook(SystemTray, "item_added", (box, id) => AddItem(id));
    box.hook(SystemTray, "item_removed", (box, id) => RemoveItem(id));
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
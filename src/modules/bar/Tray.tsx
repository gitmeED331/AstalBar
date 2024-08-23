import { Widget, Gdk, Gtk, bind, Variable, App, Astal } from "astal";
import AstalTray from "gi://AstalTray";
import Icon, { Icons } from "../lib/icons";

const SystemTray = AstalTray.Tray.get_default();

const SysTrayItem = (item) => {
    return (
        <button
            className={"systray-item"}
            halign={Gtk.Align.CENTER}
            valign={Gtk.Align.CENTER}
            onClick={(btn, event) => {
                const button = event.button;
                if (button === Gdk.BUTTON_PRIMARY || button === Gdk.BUTTON_SECONDARY) {
                    const menu = item.create_menu();
                    menu?.popup_at_widget(btn, Gdk.Gravity.SOUTH, Gdk.Gravity.NORTH, null);
                } else if (button === Gdk.BUTTON_MIDDLE) {
                    item.activate(0, 0);
                }
            }}
            tooltip_markup={bind(item, "tooltip_markup")}
        >
            <icon
                halign={Gtk.Align.CENTER}
                valign={Gtk.Align.CENTER}
                icon={
                    Icons(item.get_icon_name()
                        || item.get_icon_pixbuf())
                }
            />
        </button>
    );
};

function traySetup(box: Widget.Box) {

    const items = new Map<number, SysTrayItem>();

    const AddItem = (id: number) => {
        if (!id) return;
        const item = SystemTray.get_item(id);
        if (items.has(id) || !item) return;
        const widget = SysTrayItem(item);
        items.set(id, widget);
        box.pack_start(widget, false, false, 0);
        box.show_all();

        console.log(`ID: ${item.get_id?.()}`);
        console.log(`Title: ${item.get_title?.()}`);
        console.log(`Icon name: ${item.get_icon_name()}`);
        console.log(`Icon pixbuf: ${item.get_icon_pixbuf()}`);
        console.log(`combo: ${Icons(item.get_icon_name() || item.get_icon_pixbuf())}`);

    };

    const RemoveItem = (id: number) => {
        if (!items.has(id)) return;
        items.get(id)?.destroy();
        items.delete(id);
    };

    SystemTray.get_items().forEach(item => {
        console.log('Tray Item:', item);
        AddItem(item.item_id);
    });
    box.hook(SystemTray, "item_added", (box, id) => {
        console.log(`Item added with ID: ${id}`);
        AddItem(id);
    });

    box.hook(SystemTray, "item_removed", (box, id) => {
        console.log(`Item removed with ID: ${id}`);
        RemoveItem(id);
    });
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
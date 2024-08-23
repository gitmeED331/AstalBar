import { Gtk, GLib } from "astal"

declare global {
    // GTK
    const START: number
    const CENTER: number
    const END: number
    const FILL: number


    // Shell
    const CACHE: string
    const STATE: string
    const TMP: string
    const USER: string

}

Object.assign(globalThis, {

    START: Gtk.Align.START,
    CENTER: Gtk.Align.CENTER,
    END: Gtk.Align.END,
    FILL: Gtk.Align.FILL,

    CONFIG: `${GLib.get_user_config_dir()}/astal-gjs`,
    HOME: GLib.get_home_dir(),
    DATA: GLib.get_user_data_dir(),
    CACHE: `${GLib.get_user_cache_dir()}/astal`,
    STATE: `${GLib.get_user_state_dir()}/astal`,
    TMP: `${GLib.get_tmp_dir()}/astal`,
    USER: GLib.get_user_name(),

    STYLEDIR: `${GLib.get_user_config_dir()}/astal-gjs/src/style`,
    DISTDIR: `${GLib.get_user_config_dir()}/astal-gjs/dist`,
    ICONSDIR: `${GLib.get_user_data_dir()}/icons/Astal`
})

export { }
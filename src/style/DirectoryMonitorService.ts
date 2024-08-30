import { Astal, Widget, App, Gtk, Gdk, GLib, Gio, monitorFile } from "astal"

const Icons = `${GLib.get_user_data_dir()}/icons/Astal`
const STYLEDIR = `${GLib.get_user_config_dir()}/astal-gjs/src/style`
const DISTDIR = `${GLib.get_user_config_dir()}/astal-gjs/dist`

const css = `${GLib.get_user_config_dir()}/astal-gjs/dist/style.css`
const scss = `${GLib.get_user_config_dir()}/astal-gjs/src/style/main.scss`

function DirectoryMonitorService(){
	this.recursiveDirectoryMonitor(`${STYLEDIR}`);

  recursiveDirectoryMonitor(directoryPath) {

    monitorFile(STYLEDIR, (_, eventType) => {
      if (eventType === Gio.FileMonitorEvent.CHANGES_DONE_HINT) {
        this.emit("changed");
      }
    }, "directory");

    const directory = Gio.File.new_for_path(STYLEDIR);
    const enumerator = directory.enumerate_children("standard::*", Gio.FileQueryInfoFlags.NONE, null);

    let fileInfo;
    while ((fileInfo = enumerator.next_file(null)) !== null) {
      const childPath = STYLEDIR + "/" + fileInfo.get_name();
      if (fileInfo.get_file_type() === Gio.FileType.DIRECTORY) {
        this.recursiveDirectoryMonitor(childPath);
      }
    }
  }
}

const DirectoryMonitor = new DirectoryMonitorService();
export default DirectoryMonitor

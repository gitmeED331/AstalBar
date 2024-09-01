import { Astal, Widget, App, Gtk, Gdk, GLib, Gio, monitorFile } from "astal"

const Icons = `${GLib.get_user_data_dir()}/icons/Astal`
const STYLEDIR = `${GLib.get_user_config_dir()}/astal-gjs/src/style`
const DISTDIR = `${GLib.get_user_config_dir()}/astal-gjs/dist`

const css = `${GLib.get_user_config_dir()}/astal-gjs/dist/style.css`
const scss = `${GLib.get_user_config_dir()}/astal-gjs/src/style/main.scss`

class DirectoryMonitorService {
  constructor() {

    this.recursiveDirectoryMonitor(STYLEDIR);
  }

  recursiveDirectoryMonitor(STYLEDIR: string) {
    const monitorFile = (path: string, callback: () => void) => {
      const file = Gio.File.new_for_path(path);
      const monitor = file.monitor_file(Gio.FileMonitorFlags.NONE, null);
      monitor.connect("changed", () => {
        callback();
      });
    };

    monitorFile(STYLEDIR, () => {
      // You can replace this with your custom event handling logic
      this.onDirectoryChanged();
    });

    const directory = Gio.File.new_for_path(STYLEDIR);
    const enumerator = directory.enumerate_children(
      "standard::*",
      Gio.FileQueryInfoFlags.NONE,
      null
    );

    let fileInfo;
    while ((fileInfo = enumerator.next_file(null)) !== null) {
      const childPath = `${STYLEDIR}/${fileInfo.get_name()}`;
      if (fileInfo.get_file_type() === Gio.FileType.DIRECTORY) {
        this.recursiveDirectoryMonitor(childPath);
      }
    }
  }

  onDirectoryChanged() {
    // Handle the directory change event
    print("Directory content changed!");
  }
}

const DirectoryMonitor = new DirectoryMonitorService();
export default DirectoryMonitor;

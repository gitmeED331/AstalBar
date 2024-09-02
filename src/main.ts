#!/usr/bin/gjs -m
import { GLib, App, execAsync, monitorFile, Astal, Gtk } from "astal";
// import DirectoryMonitorService from "./modules/lib/DirectoryMonitorService";

// const Icons = `${GLib.get_user_data_dir()}/icons/Astal`
// const STYLEDIR = `${GLib.get_user_config_dir()}/astal-gjs/src/style`
// const DISTDIR = `${GLib.get_user_config_dir()}/astal-gjs/dist`

// const css = `${STYLEDIR}/style.css`
// const scss = `${STYLEDIR}/main.scss`
// const applyScss = () => {
//   const compileScss = () => {
//     execAsync(`sass ${scss} ${css}`);
//     console.log("Scss compiled");
//   };

//   const resetAndApplyCss = () => {
//     App.reset_css();
//     console.log("Reset");
//     applyCss(css);
//     console.log("Compiled css applied");
//   };

//   monitorFile(`${STYLEDIR}`, resetAndApplyCss);
// };

// DirectoryMonitorService.connect("changed", applyScss);

import "./style/style.css";
import Bar from "./modules/bar/Bar";
import {
  Dashboard,
  MediaPlayerWindow,
  Calendar,
  AudioMixer,
  NotificationPopups,
  // Overview,
  sessioncontrol,
  powerprofiles,
  // Launcher,
  //  cliphist,
} from "./modules/Windows/index";



App.start({
  requestHandler(request, res) {
    switch (request) {
      case "i":
      case "inspect":
        App.inspector();
        return res("ok");
      case "q":
      case "quit":
        App.quit();
        return res("ok");
      default:
        return App.eval(request).then(res).catch(res);
    }
  },
  client(message, arg = "") {
    print(message(arg));
  },
  main() {
    Bar({ monitor: 0 });
    Dashboard();
    MediaPlayerWindow();
    Calendar();
    AudioMixer();
    NotificationPopups(0);
    // Overview();
    sessioncontrol();
    powerprofiles();
    // Launcher();
    //  cliphist();
  },
});

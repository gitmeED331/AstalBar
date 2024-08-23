#!/usr/bin/gjs -m
import { GLib, App, exec, monitorFile, Astal, Gtk } from "astal";

// const Icons = `${GLib.get_user_data_dir()}/icons/Astal`
// const STYLEDIR = `${GLib.get_user_config_dir()}/astal-gjs/src/style`
// const DISTDIR = `${GLib.get_user_config_dir()}/astal-gjs/dist`

// const css = `${GLib.get_user_config_dir()}/astal-gjs/dist/style.css`
// const scss = `${GLib.get_user_config_dir()}/astal-gjs/src/style/main.scss`
// const applyScss = () => {
//     // monitor for changes
//     monitorFile(
//         // directory that contains the scss files
//         `${STYLEDIR}`,

//         exec(`sass ${scss} ${css}`),
//         console.log("Scss compiled"),

//         // main scss file
//         App.reset_css(),
//         console.log("Reset"),
//         applyCss(css),
//         console.log("Compiled css applied"),
//     );
// };

import "./style/style.css";
import Bar from "./modules/bar/Bar";
import {
  Dashboard,
  MediaPlayerWindow,
  Calendar,
  AudioMixer,
  // NotificationPopups,
  // Overview,
  sessioncontrol,
  powerprofiles,
  // Launcher,
  // cliphist
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
    Dashboard()
    MediaPlayerWindow();
    Calendar();
    AudioMixer();
    // NotificationPopups()
    // Overview()
    sessioncontrol();
    powerprofiles();
    // Launcher()
    // cliphist()
  },
});

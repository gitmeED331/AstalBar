/* eslint-disable @typescript-eslint/no-explicit-any */
import { GLib, Astal, App } from "astal";

const substitutes = {
  "geany": "geany-symbolic",
  "vivaldi": "vivaldi-symbolic",
  "vivaldi-stable": "vivaldi-symbolic",
  "org.kde.konsole": "terminal-symbolic",
  "konsole": "terminal-symbolic",
  "audio-headset-bluetooth": "audio-headphones-symbolic",
  "audio-card-analog-usb": "audio-speakers-symbolic",
  "audio-card-analog-pci": "audio-card-symbolic",
  "preferences-system": "emblem-system-symbolic",
  "com.github.Aylur.ags-symbolic": "controls-symbolic",
  "com.github.Aylur.ags": "controls-symbolic",
  "pcloud-symbolic": "pcloud-symbolic",
  "keepassxc": "keepassxc-symbolic",
  "org.keepassxc.KeePassXC": "keepassxc-symbolic",
  //"filen-desktop": "filen-desktop-symbolic",
  "filen-desktop-symbolic": "filen-desktop-symbolic",
  "WebCord": "discord-symbolic",
  "armcord-symbolic": "discord-symbolic",
  "ArmCord": "discord-symbolic",
  "deezer-enhanced-symbolic": "deezer-symbolic",
  "com.visualstudio.code.oss-symbolic": "vs-code-symbolic",
  "code-oss": "vs-code-symbolic",
  "kate-symbolic": "geany-symbolic",
  "org.kde.kate": "codepen-symbolic",
  "dev.zed.Zed": "zed-symbolic",
};

const Icon = {
  settings: "preferences-system-symbolic",
  refresh: "view-refresh-symbolic",
  missing: "image-missing-symbolic",
  deezer: "deezer-symbolic",

  app: {
    terminal: "terminal-symbolic",
  },
  fallback: {
    executable: "application-x-executable",
    notification: "dialog-information-symbolic",
    video: "video-x-generic-symbolic",
    audio: "audio-x-generic-symbolic",
  },
  ui: {
    close: "window-close-symbolic",
    colorpicker: "color-select-symbolic",
    info: "info-symbolic",
    link: "external-link-symbolic",
    lock: "system-lock-screen-symbolic",
    menu: "open-menu-symbolic",
    refresh: "view-refresh-symbolic",
    search: "system-search-symbolic",
    settings: "emblem-system-symbolic",
    themes: "preferences-desktop-theme-symbolic",
    tick: "object-select-symbolic",
    time: "hourglass-symbolic",
    toolbars: "toolbars-symbolic",
    warning: "dialog-warning-symbolic",
    avatar: "avatar-default-symbolic",
    arrow: {
      right: "pan-end-symbolic",
      left: "pan-start-symbolic",
      down: "pan-down-symbolic",
      up: "pan-up-symbolic",
    },
  },
  audio: {
    mic: {
      muted: "microphone-disabled-symbolic",
      low: "microphone-sensitivity-low-symbolic",
      medium: "microphone-sensitivity-medium-symbolic",
      high: "microphone-sensitivity-high-symbolic",
    },
    volume: {
      muted: "audio-volume-muted-symbolic",
      low: "audio-volume-low-symbolic",
      medium: "audio-volume-medium-symbolic",
      high: "audio-volume-high-symbolic",
      overamplified: "audio-volume-overamplified-symbolic",
    },
    type: {
      headset: "audio-headphones-symbolic",
      speaker: "audio-speakers-symbolic",
      card: "audio-card-symbolic",
    },
    mixer: "mixer-symbolic",
  },
  powerprofile: {
    balanced: "power-profile-balanced-symbolic",
    "power-saver": "power-profile-power-saver-symbolic",
    performance: "power-profile-performance-symbolic",
  },
  battery: {
    Charging: "battery-charging-symbolic",
    Discharging: "battery-discharging-symbolic",
    Empty: "battery-empty-symbolic",
    Full: "battery-full-charged-symbolic",
    High: "battery-high-charged-symbolic",
    Medium: "battery-medium-charged-symbolic",
    Low: "battery-low-charged-symbolic",
    Caution: "battery-caution-symbolic",
  },
  bluetooth: {
    enabled: "bluetooth-active-symbolic",
    disabled: "bluetooth-disabled-symbolic",
  },
  network: {
    ethernet: {
      connected: "network-wired-symbolic",
      disconnected: "network-wireless-signal-none-symbolic",
    },
    wifi: {
      enabled: "network-wireless-symbolic",
      disabled: "network-wireless-signal-none-symbolic",
      connected: "network-wireless-symbolic",
      disconnected: "network-wireless-signal-none-symbolic",
      signal: {
        low: "network-wireless-signal-strength-0-symbolic",
        medium: "network-wireless-signal-strength-1-symbolic",
        high: "network-wireless-signal-strength-2-symbolic",
        full: "network-wireless-signal-strength-3-symbolic",
        overamplified: "network-wireless-signal-strength-4-symbolic",
      }
    }
  },
  brightness: {
    indicator: "display-brightness-symbolic",
    keyboard: "keyboard-brightness-symbolic",
    screen: "display-brightness-symbolic",
    levels: {
      low: "brightness-low-symbolic",
      medium: "brightness-medium-symbolic",
      high: "brightness-high-symbolic",
      full: "brightness-full-symbolic",
    }
  },
  powermenu: {
    lock: "system-lock-screen-symbolic",
    logout: "system-log-out-symbolic",
    reboot: "system-reboot-symbolic",
    shutdown: "system-shutdown-symbolic",
  },
  recorder: {
    recording: "media-record-symbolic",
  },
  notifications: {
    noisy: "org.gnome.Settings-notifications-symbolic",
    silent: "notifications-disabled-symbolic",
    message: "chat-bubbles-symbolic",
  },
  trash: {
    full: "user-trash-full-symbolic",
    empty: "user-trash-symbolic",
  },
  mpris: {
    shuffle: {
      enabled: "media-playlist-shuffle-symbolic",
      disabled: "media-playlist-consecutive-symbolic",
    },
    loop: {
      none: "media-playlist-repeat-symbolic",
      track: "media-playlist-repeat-song-symbolic",
      playlist: "media-playlist-repeat-symbolic",
    },
    controls: {
      FALLBACK_ICON: "audio-x-generic-symbolic",
      PLAY: "media-playback-start-symbolic",
      PAUSE: "media-playback-pause-symbolic",
      PREV: "media-skip-backward-symbolic",
      NEXT: "media-skip-forward-symbolic",
      CLOSE: "window-close-symbolic",
    },
  },
  system: {
    cpu: "org.gnome.SystemMonitor-symbolic",
    ram: "drive-harddisk-solidstate-symbolic",
    temp: "temperature-symbolic",
  },
  launcher: {
    search: "system-search-symbolic",
    utility: "applications-utilities-symbolic",
    system: "emblem-system-symbolic",
    education: "applications-science-symbolic",
    development: "applications-engineering-symbolic",
    network: "network-wired-symbolic",
    office: "x-office-document-symbolic",
    game: "applications-games-symbolic",
    multimedia: "applications-multimedia-symbolic",
    hyprland: "hyprland-symbolic",
  },
  wsicon: {
    ws1: "dragon-symbolic",
    ws2: "fox-symbolic",
    ws3: "snake-symbolic",
    ws4: "flaming-claw-symbolic",
  },
};

export default Icon;

App.add_icons(`${GLib.get_user_data_dir()}/icons/Astal`);

/**
 * @returns substitute icon || name || fallback icon
 */
type SubstitutesType = {
  [key: string]: string;
};
export function Icons(name: string | null, fallback = Icon.missing) {
  if (!name) return fallback || "";

  if (GLib.file_test(name, GLib.FileTest.EXISTS)) return name;

  const icon = (substitutes as SubstitutesType)[name] || name;

  if (Astal.lookup_icon(icon)) return icon;
  console.log(Astal.lookup_icon(icon));

  print(`no icon substitute "${icon}" for "${name}", fallback: "${fallback}"`);
  return fallback;
}

#!/usr/bin/gjs -m
var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// node_modules/astal/src/imports.ts
import { default as default2 } from "gi://Astal?version=0.1";
import { default as default3 } from "gi://GObject?version=2.0";
import { default as default4 } from "gi://Gio?version=2.0";
import { default as default5 } from "gi://Gtk?version=3.0";
import { default as default6 } from "gi://Gdk?version=3.0";
import { default as default7 } from "gi://GLib?version=2.0";

// node_modules/astal/src/process.ts
function args(argsOrCmd, onOut, onErr) {
  const params = Array.isArray(argsOrCmd) || typeof argsOrCmd === "string";
  return {
    cmd: params ? argsOrCmd : argsOrCmd.cmd,
    err: params ? onErr : argsOrCmd.err || onErr,
    out: params ? onOut : argsOrCmd.out || onOut
  };
}
function subprocess(argsOrCmd, onOut = print, onErr = printerr) {
  const { cmd, err, out } = args(argsOrCmd, onOut, onErr);
  const proc = Array.isArray(cmd) ? default2.Process.subprocessv(cmd) : default2.Process.subprocess(cmd);
  proc.connect("stdout", (_, stdout) => out(stdout));
  proc.connect("stderr", (_, stderr) => err(stderr));
  return proc;
}
function execAsync(cmd) {
  return new Promise((resolve, reject) => {
    if (Array.isArray(cmd)) {
      default2.Process.exec_asyncv(cmd, (_, res) => {
        try {
          resolve(default2.Process.exec_asyncv_finish(res));
        } catch (error) {
          reject(error);
        }
      });
    } else {
      default2.Process.exec_async(cmd, (_, res) => {
        try {
          resolve(default2.Process.exec_finish(res));
        } catch (error) {
          reject(error);
        }
      });
    }
  });
}

// node_modules/astal/src/time.ts
function interval(interval2, callback) {
  return default2.Time.interval(interval2, () => void callback?.());
}
function timeout(timeout4, callback) {
  return default2.Time.timeout(timeout4, () => void callback?.());
}

// node_modules/astal/src/binding.ts
var snakeify = (str) => str.replace(/([a-z])([A-Z])/g, "$1_$2").replaceAll("-", "_").toLowerCase();
var kebabify = (str) => str.replace(/([a-z])([A-Z])/g, "$1-$2").replaceAll("_", "-").toLowerCase();
var Binding = class _Binding {
  emitter;
  prop;
  transformFn = (v) => v;
  static bind(emitter, prop) {
    return new _Binding(emitter, prop);
  }
  constructor(emitter, prop) {
    this.emitter = emitter;
    this.prop = prop && kebabify(prop);
  }
  toString() {
    return `Binding<${this.emitter}${this.prop ? `, "${this.prop}"` : ""}>`;
  }
  as(fn) {
    const bind2 = new _Binding(this.emitter, this.prop);
    bind2.transformFn = (v) => fn(this.transformFn(v));
    return bind2;
  }
  get() {
    if (typeof this.emitter.get === "function")
      return this.transformFn(this.emitter.get());
    if (typeof this.prop === "string") {
      const getter = `get_${snakeify(this.prop)}`;
      if (typeof this.emitter[getter] === "function")
        return this.transformFn(this.emitter[getter]());
      return this.transformFn(this.emitter[this.prop]);
    }
    throw Error("can not get value of binding");
  }
  subscribe(callback) {
    if (typeof this.emitter.subscribe === "function") {
      return this.emitter.subscribe(() => {
        callback(this.get());
      });
    } else if (typeof this.emitter.connect === "function") {
      const signal = `notify::${this.prop}`;
      const id = this.emitter.connect(signal, () => {
        callback(this.get());
      });
      return () => {
        this.emitter.disconnect(id);
      };
    }
    throw Error(`${this.emitter} is not bindable`);
  }
};
var { bind } = Binding;

// node_modules/astal/src/variable.ts
var VariableWrapper = class extends Function {
  variable;
  errHandler = console.error;
  _value;
  _poll;
  _watch;
  pollInterval = 1e3;
  pollExec;
  pollTransform;
  pollFn;
  watchTransform;
  watchExec;
  constructor(init) {
    super();
    this._value = init;
    this.variable = new default2.VariableBase();
    this.variable.connect("dropped", () => {
      this.stopWatch();
      this.stopPoll();
    });
    this.variable.connect("error", (_, err) => this.errHandler?.(err));
    return new Proxy(this, {
      apply: (target, _, args2) => target._call(args2[0])
    });
  }
  _call(transform) {
    const b = Binding.bind(this);
    return transform ? b.as(transform) : b;
  }
  toString() {
    return String(`Variable<${this.get()}>`);
  }
  get() {
    return this._value;
  }
  set(value) {
    if (value !== this._value) {
      this._value = value;
      this.variable.emit("changed");
    }
  }
  startPoll() {
    if (this._poll)
      return;
    if (this.pollFn) {
      this._poll = interval(this.pollInterval, () => {
        const v = this.pollFn(this.get());
        if (v instanceof Promise) {
          v.then((v2) => this.set(v2)).catch((err) => this.variable.emit("error", err));
        } else {
          this.set(v);
        }
      });
    } else if (this.pollExec) {
      this._poll = interval(this.pollInterval, () => {
        execAsync(this.pollExec).then((v) => this.set(this.pollTransform(v, this.get()))).catch((err) => this.variable.emit("error", err));
      });
    }
  }
  startWatch() {
    if (this._watch)
      return;
    this._watch = subprocess({
      cmd: this.watchExec,
      out: (out) => this.set(this.watchTransform(out, this.get())),
      err: (err) => this.variable.emit("error", err)
    });
  }
  stopPoll() {
    this._poll?.cancel();
    delete this._poll;
  }
  stopWatch() {
    this._watch?.kill();
    delete this._watch;
  }
  isPolling() {
    return !!this._poll;
  }
  isWatching() {
    return !!this._watch;
  }
  drop() {
    this.variable.emit("dropped");
    this.variable.run_dispose();
  }
  onDropped(callback) {
    this.variable.connect("dropped", callback);
    return this;
  }
  onError(callback) {
    delete this.errHandler;
    this.variable.connect("error", (_, err) => callback(err));
    return this;
  }
  subscribe(callback) {
    const id = this.variable.connect("changed", () => {
      callback(this.get());
    });
    return () => this.variable.disconnect(id);
  }
  poll(interval2, exec, transform = (out) => out) {
    this.stopPoll();
    this.pollInterval = interval2;
    this.pollTransform = transform;
    if (typeof exec === "function") {
      this.pollFn = exec;
      delete this.pollExec;
    } else {
      this.pollExec = exec;
      delete this.pollFn;
    }
    this.startPoll();
    return this;
  }
  watch(exec, transform = (out) => out) {
    this.stopWatch();
    this.watchExec = exec;
    this.watchTransform = transform;
    this.startWatch();
    return this;
  }
  observe(objs, sigOrFn, callback) {
    const f = typeof sigOrFn === "function" ? sigOrFn : callback ?? (() => this.get());
    const set = (obj, ...args2) => this.set(f(obj, ...args2));
    if (Array.isArray(objs)) {
      for (const obj of objs) {
        const [o, s] = obj;
        o.connect(s, set);
      }
    } else {
      if (typeof sigOrFn === "string")
        objs.connect(sigOrFn, set);
    }
    return this;
  }
  static derive(deps, fn = (...args2) => args2) {
    const update = () => fn(...deps.map((d) => d.get()));
    const derived = new Variable(update());
    const unsubs = deps.map((dep) => dep.subscribe(() => derived.set(update())));
    derived.onDropped(() => unsubs.map((unsub) => unsub()));
    return derived;
  }
};
var Variable = new Proxy(VariableWrapper, {
  apply: (_t, _a, args2) => new VariableWrapper(args2[0])
});
var variable_default = Variable;

// node_modules/astal/src/widgets.ts
var widgets_exports = {};
__export(widgets_exports, {
  Box: () => Box,
  Button: () => Button,
  CenterBox: () => CenterBox,
  DrawingArea: () => DrawingArea,
  Entry: () => Entry,
  EventBox: () => EventBox,
  Icon: () => Icon,
  Label: () => Label,
  LevelBar: () => LevelBar,
  Overlay: () => Overlay,
  Revealer: () => Revealer,
  Scrollable: () => Scrollable,
  Slider: () => Slider,
  Switch: () => Switch,
  Window: () => Window,
  astalify: () => astalify
});

// node_modules/astal/src/astalify.ts
Object.defineProperty(default2.Box.prototype, "children", {
  get() {
    return this.get_children();
  },
  set(v) {
    this.set_children(v);
  }
});
function setChildren(parent, children) {
  children = children.flat(Infinity).map((ch) => ch instanceof default5.Widget ? ch : new default5.Label({ visible: true, label: String(ch) }));
  if (parent instanceof default5.Bin) {
    const ch = parent.get_child();
    if (ch)
      parent.remove(ch);
  }
  if (parent instanceof default2.Box) {
    parent.set_children(children);
  } else if (parent instanceof default2.CenterBox) {
    parent.startWidget = children[0];
    parent.centerWidget = children[1];
    parent.endWidget = children[2];
  } else if (parent instanceof default2.Overlay) {
    const [child, ...overlays] = children;
    parent.set_child(child);
    parent.set_overlays(overlays);
  } else if (parent instanceof default5.Container) {
    for (const ch of children)
      parent.add(ch);
  }
}
function mergeBindings(array) {
  function getValues(...args2) {
    let i = 0;
    return array.map(
      (value) => value instanceof Binding ? args2[i++] : value
    );
  }
  const bindings = array.filter((i) => i instanceof Binding);
  if (bindings.length === 0)
    return array;
  if (bindings.length === 1)
    return bindings[0].as(getValues);
  return variable_default.derive(bindings, getValues)();
}
function setProp(obj, prop, value) {
  try {
    const setter = `set_${snakeify(prop)}`;
    if (typeof obj[setter] === "function")
      return obj[setter](value);
    if (Object.hasOwn(obj, prop))
      return obj[prop] = value;
  } catch (error) {
    console.error(`could not set property "${prop}" on ${obj}:`, error);
  }
  console.error(`could not set property "${prop}" on ${obj}`);
}
function hook(self, object, signalOrCallback, callback) {
  if (typeof object.connect === "function" && callback) {
    const id = object.connect(signalOrCallback, (_, ...args2) => {
      callback(self, ...args2);
    });
    self.connect("destroy", () => {
      object.disconnect(id);
    });
  } else if (typeof object.subscribe === "function" && typeof signalOrCallback === "function") {
    const unsub = object.subscribe((...args2) => {
      signalOrCallback(self, ...args2);
    });
    self.connect("destroy", unsub);
  }
  return self;
}
function ctor(self, config = {}, children = []) {
  const { setup, ...props } = config;
  props.visible ??= true;
  const bindings = Object.keys(props).reduce((acc, prop) => {
    if (props[prop] instanceof Binding) {
      const binding = props[prop];
      setProp(self, prop, binding.get());
      delete props[prop];
      return [...acc, [prop, binding]];
    }
    return acc;
  }, []);
  const onHandlers = Object.keys(props).reduce((acc, key) => {
    if (key.startsWith("on")) {
      const sig = kebabify(key).split("-").slice(1).join("-");
      const handler = props[key];
      delete props[key];
      return [...acc, [sig, handler]];
    }
    return acc;
  }, []);
  Object.assign(self, props);
  for (const [signal, callback] of onHandlers) {
    if (typeof callback === "function") {
      self.connect(signal, callback);
    } else {
      self.connect(signal, () => execAsync(callback).then(print).catch(console.error));
    }
  }
  for (const [prop, bind2] of bindings) {
    if (prop === "child" || prop === "children") {
      self.connect("destroy", bind2.subscribe((v) => {
        setChildren(self, v);
      }));
    }
    self.connect("destroy", bind2.subscribe((v) => {
      setProp(self, prop, v);
    }));
  }
  children = mergeBindings(children.flat(Infinity));
  if (children instanceof Binding) {
    setChildren(self, children.get());
    self.connect("destroy", children.subscribe((v) => {
      setChildren(self, v);
    }));
  } else {
    if (children.length > 0)
      setChildren(self, children);
  }
  setup?.(self);
  return self;
}
function proxify(klass) {
  Object.defineProperty(klass.prototype, "className", {
    get() {
      return default2.widget_get_class_names(this).join(" ");
    },
    set(v) {
      default2.widget_set_class_names(this, v.split(/\s+/));
    }
  });
  Object.defineProperty(klass.prototype, "css", {
    get() {
      return default2.widget_get_css(this);
    },
    set(v) {
      default2.widget_set_css(this, v);
    }
  });
  Object.defineProperty(klass.prototype, "cursor", {
    get() {
      return default2.widget_get_cursor(this);
    },
    set(v) {
      default2.widget_set_cursor(this, v);
    }
  });
  Object.defineProperty(klass.prototype, "clickThrough", {
    get() {
      return default2.widget_get_click_through(this);
    },
    set(v) {
      default2.widget_set_click_through(this, v);
    }
  });
  Object.assign(klass.prototype, {
    hook: function(obj, sig, callback) {
      return hook(this, obj, sig, callback);
    },
    toggleClassName: function name(cn, cond = true) {
      default2.widget_toggle_class_name(this, cn, cond);
    },
    set_class_name: function(name) {
      this.className = name;
    },
    set_css: function(css) {
      this.css = css;
    },
    set_cursor: function(cursor) {
      this.cursor = cursor;
    },
    set_click_through: function(clickThrough) {
      this.clickThrough = clickThrough;
    }
  });
  const proxy = new Proxy(klass, {
    construct(_, [conf, ...children]) {
      return ctor(new klass(), conf, children);
    },
    apply(_t, _a, [conf, ...children]) {
      return ctor(new klass(), conf, children);
    }
  });
  return proxy;
}
function astalify(klass) {
  return proxify(klass);
}

// node_modules/astal/src/widgets.ts
var Box = astalify(default2.Box);
var Button = astalify(default2.Button);
var CenterBox = astalify(default2.CenterBox);
var DrawingArea = astalify(default5.DrawingArea);
var Entry = astalify(default5.Entry);
var EventBox = astalify(default2.EventBox);
var Icon = astalify(default2.Icon);
var Label = astalify(default2.Label);
var LevelBar = astalify(default2.LevelBar);
var Overlay = astalify(default2.Overlay);
var Revealer = astalify(default5.Revealer);
var Scrollable = astalify(default2.Scrollable);
var Slider = astalify(default2.Slider);
var Switch = astalify(default5.Switch);
var Window = astalify(default2.Window);

// node_modules/astal/src/application.ts
import { setConsoleLogDomain } from "console";
import { exit, programArgs } from "system";
var AstalJS = class extends default2.Application {
  static {
    default3.registerClass(this);
  }
  eval(body) {
    return new Promise((res, rej) => {
      try {
        const fn = Function(`return (async function() {
                    ${body.includes(";") ? body : `return ${body};`}
                })`);
        fn()().then(res).catch(rej);
      } catch (error) {
        rej(error);
      }
    });
  }
  requestHandler;
  vfunc_request(msg, conn) {
    if (typeof this.requestHandler === "function") {
      this.requestHandler(msg, (response) => {
        default2.write_sock(
          conn,
          String(response),
          (_, res) => default2.write_sock_finish(res)
        );
      });
    } else {
      super.vfunc_request(msg, conn);
    }
  }
  apply_css(style, reset = false) {
    super.apply_css(style, reset);
  }
  quit(code) {
    super.quit();
    exit(code ?? 0);
  }
  start({ requestHandler, css, hold, main, client, ...cfg } = {}) {
    client ??= () => {
      print(`Astal instance "${this.instanceName}" already running`);
      exit(1);
    };
    Object.assign(this, cfg);
    setConsoleLogDomain(this.instanceName);
    this.requestHandler = requestHandler;
    this.connect("activate", () => {
      const path = import.meta.url.split("/").slice(3);
      const file = path.at(-1).replace(".js", ".css");
      const css2 = `/${path.slice(0, -1).join("/")}/${file}`;
      if (file.endsWith(".css") && default7.file_test(css2, default7.FileTest.EXISTS))
        this.apply_css(css2, false);
      main?.(...programArgs);
    });
    if (!this.acquire_socket())
      return client((msg) => default2.Application.send_message(this.instanceName, msg), ...programArgs);
    if (css)
      this.apply_css(css, false);
    hold ??= true;
    if (hold)
      this.hold();
    this.runAsync([]);
  }
};
var application_default = new AstalJS();

// node_modules/astal/index.ts
default5.init(null);

// src/modules/bar/AppTitleTicker.tsx
import Pango from "gi://Pango";

// src/modules/lib/icons.tsx
var substitutes = {
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
  "dev.zed.Zed": "zed-symbolic"
};
var Icon2 = {
  settings: "preferences-system-symbolic",
  refresh: "view-refresh-symbolic",
  missing: "image-missing-symbolic",
  deezer: "deezer-symbolic",
  app: {
    terminal: "terminal-symbolic"
  },
  fallback: {
    executable: "application-x-executable",
    notification: "dialog-information-symbolic",
    video: "video-x-generic-symbolic",
    audio: "audio-x-generic-symbolic"
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
      up: "pan-up-symbolic"
    }
  },
  audio: {
    mic: {
      muted: "microphone-disabled-symbolic",
      low: "microphone-sensitivity-low-symbolic",
      medium: "microphone-sensitivity-medium-symbolic",
      high: "microphone-sensitivity-high-symbolic"
    },
    volume: {
      muted: "audio-volume-muted-symbolic",
      low: "audio-volume-low-symbolic",
      medium: "audio-volume-medium-symbolic",
      high: "audio-volume-high-symbolic",
      overamplified: "audio-volume-overamplified-symbolic"
    },
    type: {
      headset: "audio-headphones-symbolic",
      speaker: "audio-speakers-symbolic",
      card: "audio-card-symbolic"
    },
    mixer: "mixer-symbolic"
  },
  powerprofile: {
    balanced: "power-profile-balanced-symbolic",
    "power-saver": "power-profile-power-saver-symbolic",
    performance: "power-profile-performance-symbolic"
  },
  battery: {
    Charging: "battery-charging-symbolic",
    Discharging: "battery-discharging-symbolic",
    Empty: "battery-empty-symbolic",
    Full: "battery-full-charged-symbolic",
    High: "battery-high-charged-symbolic",
    Medium: "battery-medium-charged-symbolic",
    Low: "battery-low-charged-symbolic",
    Caution: "battery-caution-symbolic"
  },
  bluetooth: {
    enabled: "bluetooth-active-symbolic",
    disabled: "bluetooth-disabled-symbolic"
  },
  brightness: {
    indicator: "display-brightness-symbolic",
    keyboard: "keyboard-brightness-symbolic",
    screen: "display-brightness-symbolic"
  },
  powermenu: {
    lock: "system-lock-screen-symbolic",
    logout: "system-log-out-symbolic",
    reboot: "system-reboot-symbolic",
    shutdown: "system-shutdown-symbolic"
  },
  recorder: {
    recording: "media-record-symbolic"
  },
  notifications: {
    noisy: "org.gnome.Settings-notifications-symbolic",
    silent: "notifications-disabled-symbolic",
    message: "chat-bubbles-symbolic"
  },
  trash: {
    full: "user-trash-full-symbolic",
    empty: "user-trash-symbolic"
  },
  mpris: {
    shuffle: {
      enabled: "media-playlist-shuffle-symbolic",
      disabled: "media-playlist-consecutive-symbolic"
    },
    loop: {
      none: "media-playlist-repeat-symbolic",
      track: "media-playlist-repeat-song-symbolic",
      playlist: "media-playlist-repeat-symbolic"
    },
    controls: {
      FALLBACK_ICON: "audio-x-generic-symbolic",
      PLAY: "media-playback-start-symbolic",
      PAUSE: "media-playback-pause-symbolic",
      PREV: "media-skip-backward-symbolic",
      NEXT: "media-skip-forward-symbolic",
      CLOSE: "window-close-symbolic"
    }
  },
  system: {
    cpu: "org.gnome.SystemMonitor-symbolic",
    ram: "drive-harddisk-solidstate-symbolic",
    temp: "temperature-symbolic"
  },
  color: {
    dark: "dark-mode-symbolic",
    light: "light-mode-symbolic"
  },
  SCMenu: {
    AShot: "screenshooter-symbolic",
    FShot: "accessories-screenshot-symbolic",
    ARecord: "vm-snapshot-recording",
    FRecord: "record"
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
    hyprland: "hyprland-symbolic"
  },
  wsicon: {
    ws1: "dragon-symbolic",
    ws2: "fox-symbolic",
    ws3: "snake-symbolic",
    ws4: "flaming-claw-symbolic"
  }
};
var icons_default = Icon2;
application_default.add_icons(`${default7.get_user_data_dir()}/icons/Astal`);
function Icons(name, fallback = Icon2.missing) {
  if (!name) return fallback || "";
  if (default7.file_test(name, default7.FileTest.EXISTS)) return name;
  const icon = substitutes[name] || name;
  if (default2.lookup_icon(icon)) return icon;
  console.log(default2.lookup_icon(icon));
  print(`no icon substitute "${icon}" for "${name}", fallback: "${fallback}"`);
  return fallback;
}

// src/modules/bar/AppTitleTicker.tsx
import Hyprland from "gi://AstalHyprland";

// node_modules/astal/src/jsx/jsx-runtime.ts
function isArrowFunction(func) {
  return !Object.hasOwn(func, "prototype");
}
function jsx(ctor2, { children, ...props }) {
  children ??= [];
  if (!Array.isArray(children))
    children = [children];
  children = children.filter(Boolean);
  if (typeof ctor2 === "string")
    return ctors[ctor2](props, children);
  if (children.length === 1)
    props.child = children[0];
  else if (children.length > 1)
    props.children = children;
  if (isArrowFunction(ctor2))
    return ctor2(props);
  return new ctor2(props);
}
var ctors = {
  box: Box,
  button: Button,
  centerbox: CenterBox,
  // TODO: circularprogress
  drawingarea: DrawingArea,
  entry: Entry,
  eventbox: EventBox,
  // TODO: fixed
  // TODO: flowbox
  icon: Icon,
  label: Label,
  levelbar: LevelBar,
  // TODO: listbox
  overlay: Overlay,
  revealer: Revealer,
  scrollable: Scrollable,
  slider: Slider,
  // TODO: stack
  switch: Switch,
  window: Window
};
var jsxs = jsx;

// src/modules/bar/AppTitleTicker.tsx
var hyprland = Hyprland.get_default();
function AppTitleTicker() {
  return /* @__PURE__ */ jsx(
    "button",
    {
      className: "AppTitleTicker",
      visible: bind(hyprland, "focusedClient").as(Boolean),
      onClick: (_, event) => {
        if (event.button === default6.BUTTON_PRIMARY) {
          const win = application_default.get_window("overview");
          if (win) {
            win.visible = !win.visible;
          }
        }
        if (event.button === default6.BUTTON_SECONDARY)
          hyprland.focusedClient.kill();
      },
      children: /* @__PURE__ */ jsx("box", { children: bind(hyprland, "focusedClient").as(
        (c) => !c ? /* @__PURE__ */ jsx("box", { children: "No Client focused" }) : /* @__PURE__ */ jsxs("box", { spacing: 5, children: [
          /* @__PURE__ */ jsx(
            "icon",
            {
              valign: default5.Align.CENTER,
              halign: default5.Align.CENTER,
              icon: bind(c, "class").as((i) => Icons(i))
            }
          ),
          /* @__PURE__ */ jsx(
            "label",
            {
              valign: default5.Align.CENTER,
              halign: default5.Align.CENTER,
              hexpand: true,
              ellipsize: Pango.EllipsizeMode.END,
              label: bind(c, "title")
            }
          )
        ] })
      ) })
    }
  );
}
var AppTitleTicker_default = AppTitleTicker;

// src/modules/bar/Workspaces.tsx
import Hyprland2 from "gi://AstalHyprland";
var dispatch = (arg) => {
  execAsync(`hyprctl dispatch workspace ${arg}`);
};
var moveSilently = (arg) => {
  execAsync(`hyprctl dispatch movetoworkspacesilent ${arg}`);
};
var openOverview = (arg) => {
  const win = application_default.get_window("overview");
  if (win) {
    win.visible = !win.visible;
  }
};
function ws(id) {
  const hyprland2 = Hyprland2.get_default();
  const get = () => hyprland2.get_workspace(id) || Hyprland2.Workspace.dummy(id, null);
  return Variable(get()).observe(hyprland2, "workspace-added", get).observe(hyprland2, "workspace-removed", get);
}
function Workspaces({ id }) {
  const hyprland2 = Hyprland2.get_default();
  function workspaceButton(id2) {
    return bind(ws(id2)).as((ws2) => {
      const className = Variable.derive([
        bind(hyprland2, "focusedWorkspace"),
        bind(ws2, "clients")
      ], (focused, clients) => `
                ${focused === ws2 ? "focused" : ""}
                ${clients.length > 0 ? "occupied" : "empty"}
                workspacebutton
            `);
      const isVisible = Variable.derive([
        bind(hyprland2, "focusedWorkspace"),
        bind(ws2, "clients")
      ], (focused, clients) => id2 <= 4 || clients.length > 0 || focused === ws2);
      const wsIcon = icons_default.wsicon;
      const wsIconLabel = wsIcon[`ws${id2}`] ? /* @__PURE__ */ jsx("icon", { icon: wsIcon[`ws${id2}`], halign: default5.Align.CENTER, valign: default5.Align.CENTER }) : /* @__PURE__ */ jsx("label", { label: `${id2}`, halign: default5.Align.CENTER, valign: default5.Align.CENTER });
      return /* @__PURE__ */ jsx(
        "button",
        {
          className: className(),
          visible: isVisible(),
          valign: default5.Align.CENTER,
          halign: default5.Align.CENTER,
          cursor: "pointer",
          onClick: (_, event) => {
            if (event.button === default6.BUTTON_PRIMARY) {
              dispatch(id2);
            } else if (event.button === default6.BUTTON_SECONDARY) {
              moveSilently(id2);
            } else if (event.button === default6.BUTTON_MIDDLE) {
              openOverview(id2);
            }
          },
          children: /* @__PURE__ */ jsx(
            "box",
            {
              halign: default5.Align.CENTER,
              valign: default5.Align.CENTER,
              children: wsIconLabel
            }
          )
        }
      );
    });
  }
  const workspaceButtons = Array.from({ length: 10 }, (_, id2) => id2 + 1).map((id2) => workspaceButton(id2));
  return /* @__PURE__ */ jsx(
    "box",
    {
      className: "workspaces",
      halign: default5.Align.CENTER,
      valign: default5.Align.CENTER,
      children: workspaceButtons
    }
  );
}

// src/modules/bar/clock.tsx
function Clock() {
  const time = Variable("").poll(1e3, 'date "+%H:%M:%S"');
  const date = Variable("").poll(1e3, 'date "+%a %b %d"');
  return /* @__PURE__ */ jsx(
    "button",
    {
      className: "clock",
      cursor: "pointer",
      onClick: (_, event) => {
        if (event.button === default6.BUTTON_PRIMARY) {
          const win = application_default.get_window("dashboard");
          if (win) {
            win.visible = !win.visible;
          }
        }
      },
      children: /* @__PURE__ */ jsxs("box", { halign: default5.Align.CENTER, valign: default5.Align.CENTER, spacing: 5, children: [
        /* @__PURE__ */ jsx("label", { label: bind(date) }),
        /* @__PURE__ */ jsx("icon", { icon: "nix-snowflake-symbolic" }),
        /* @__PURE__ */ jsx("label", { label: bind(time) })
      ] })
    }
  );
}

// src/modules/Widgets/battery.tsx
import powerProfiles from "gi://AstalPowerProfiles";
import Battery from "gi://AstalBattery";
var battery = Battery.get_default();
var PowerProfiles = powerProfiles.get_default();
var percentage = bind(battery, "percentage");
var charging = bind(battery, "charging");
var chargeTooltip = () => {
  return charging.get() === true ? "Charging" : "Discharging";
};
var chargeIcon = () => {
  if (charging.get() === true) {
    return icons_default.battery.Charging;
  }
  if (charging.get() === false) {
    return icons_default.battery.Discharging;
  }
};
var ChargeIndicatorIcon = () => {
  return /* @__PURE__ */ jsx(
    "icon",
    {
      tooltipText: charging.as(chargeTooltip),
      icon: charging.as(chargeIcon)
    }
  );
};
var PercentageReveal = Variable(true);
var PercentLabel = () => {
  const TheLabel = bind(battery, "percentage").as((p) => `${p * 100}%`);
  return /* @__PURE__ */ jsx(
    "label",
    {
      label: TheLabel,
      tooltipText: bind(battery, "charging").as(chargeTooltip)
    }
  );
};
var TheLabelReveal = () => {
  return /* @__PURE__ */ jsx(
    "revealer",
    {
      transitionType: default5.RevealerTransitionType.SLIDE_RIGHT,
      transitionDuration: 300,
      clickThrough: true,
      revealChild: PercentageReveal(),
      children: /* @__PURE__ */ jsx(PercentLabel, {})
    }
  );
};
var BatteryLevelBar = ({ blocks = 10 }) => {
  return /* @__PURE__ */ jsx(
    "levelbar",
    {
      orientation: default5.Orientation.HORIZONTAL,
      halign: default5.Align.CENTER,
      valign: default5.Align.CENTER,
      max_value: blocks,
      mode: default5.LevelBarMode.CONTINUOUS,
      tooltipText: bind(PowerProfiles, "active_profile"),
      value: percentage.as((p) => p * blocks)
    }
  );
};
function BatteryButton() {
  const batterybuttonclassname = () => {
    const classes = [];
    if (percentage.get() <= 0.3) {
      classes.push("low");
    }
    if (charging.get() === true) {
      classes.push("charging");
    }
    if (charging.get() === false) {
      classes.push("discharging");
    }
    classes.push("battery");
    return classes.join(" ");
  };
  return /* @__PURE__ */ jsx(
    "button",
    {
      className: `${batterybuttonclassname()}`,
      hexpand: true,
      visible: true,
      onClick: (_, event) => {
        if (event.button === default6.BUTTON_PRIMARY) {
          const win = application_default.get_window("sessioncontrols");
          if (win) {
            win.visible = !win.visible;
          }
        }
        if (event.button === default6.BUTTON_SECONDARY) {
          PercentageReveal.set(!PercentageReveal.get());
        }
      },
      children: /* @__PURE__ */ jsxs(
        "box",
        {
          halign: default5.Align.CENTER,
          valign: default5.Align.CENTER,
          spacing: 3,
          children: [
            /* @__PURE__ */ jsx(TheLabelReveal, {}),
            /* @__PURE__ */ jsx(ChargeIndicatorIcon, {}),
            /* @__PURE__ */ jsx(BatteryLevelBar, {})
          ]
        }
      )
    }
  );
}
var battery_default = BatteryButton;

// src/modules/Widgets/GridCalendar.tsx
var { Label: Label2, Box: Box2 } = widgets_exports;
var daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
var monthNamesShort = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
var generateCalendar = (month, year) => {
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const weeks = [];
  let week = [];
  let prevMonthLastDay = new Date(year, month, 0).getDate();
  let prevMonthDays = firstDayOfMonth;
  for (let i = prevMonthLastDay - prevMonthDays + 1; i <= prevMonthLastDay; i++) {
    week.push(i);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    week.push(i);
    if (week.length === 7) {
      weeks.push(week);
      week = [];
    }
  }
  if (week.length > 0) {
    const remainingDays = 7 - week.length;
    for (let i = 1; i <= remainingDays; i++) {
      week.push(i);
    }
    weeks.push(week);
  }
  return weeks;
};
function GridCalendar() {
  let currentMonth = (/* @__PURE__ */ new Date()).getMonth();
  let currentYear = (/* @__PURE__ */ new Date()).getFullYear();
  let gridCalendar;
  let dayLabels = [];
  const updateGridCalendar = () => {
    const updatedWeeks = generateCalendar(currentMonth, currentYear);
    if (!gridCalendar) {
      gridCalendar = new default5.Grid({
        halign: default5.Align.CENTER,
        valign: default5.Align.CENTER
      });
    }
    dayLabels.forEach((label) => gridCalendar.remove(label));
    dayLabels = [];
    daysOfWeek.forEach((day, index) => {
      const dayLabel = new Label2({ label: day });
      dayLabel.get_style_context().add_class("calendar-days");
      gridCalendar.attach(dayLabel, index, 0, 1, 1);
      dayLabels.push(dayLabel);
    });
    updatedWeeks.forEach((week, rowIndex) => {
      week.forEach((day, columnIndex) => {
        const dayLabel = new Label2({ label: day.toString() || "" });
        dayLabel.get_style_context().add_class("calendar-day");
        if (day === (/* @__PURE__ */ new Date()).getDate() && currentMonth === (/* @__PURE__ */ new Date()).getMonth() && currentYear === (/* @__PURE__ */ new Date()).getFullYear()) {
          dayLabel.set_markup(`<b>${day}</b>`);
          dayLabel.get_style_context().add_class("calendar-today");
        }
        gridCalendar.attach(dayLabel, columnIndex, rowIndex + 1, 1, 1);
        dayLabels.push(dayLabel);
      });
    });
    gridCalendar.show_all();
  };
  const changeMonth = (offset) => {
    currentMonth += offset;
    if (currentMonth < 0) {
      currentMonth = 11;
      currentYear -= 1;
    } else if (currentMonth > 11) {
      currentMonth = 0;
      currentYear += 1;
    }
    monthLabel.set_text(monthNamesShort[currentMonth]);
    yearLabel.set_text(currentYear.toString());
    updateGridCalendar();
  };
  const changeYear = (offset) => {
    currentYear += offset;
    yearLabel.set_text(currentYear.toString());
    updateGridCalendar();
  };
  const monthLabel = new Label2({ label: monthNamesShort[currentMonth] });
  monthLabel.get_style_context().add_class("calendar-month-label");
  const yearLabel = new Label2({ label: currentYear.toString() });
  yearLabel.get_style_context().add_class("calendar-year-label");
  const header = /* @__PURE__ */ jsxs("box", { orientation: default5.Orientation.HORIZONTAL, spacing: 10, halign: default5.Align.CENTER, valign: default5.Align.CENTER, children: [
    /* @__PURE__ */ jsx("button", { halign: default5.Align.CENTER, valign: default5.Align.CENTER, className: "calendar month arrow-left", onClick: () => changeMonth(-1), children: /* @__PURE__ */ jsx("icon", { icon: Icons("arrow-back-circle-symbolic") }) }),
    monthLabel,
    /* @__PURE__ */ jsx("button", { halign: default5.Align.CENTER, valign: default5.Align.CENTER, className: "calendar month arrow-right", onClick: () => changeMonth(1), children: /* @__PURE__ */ jsx("icon", { icon: Icons("arrow-forward-circle-symbolic") }) }),
    /* @__PURE__ */ jsx("button", { halign: default5.Align.CENTER, valign: default5.Align.CENTER, className: "calendar return-today", onClick: () => {
      currentMonth = (/* @__PURE__ */ new Date()).getMonth();
      currentYear = (/* @__PURE__ */ new Date()).getFullYear();
      monthLabel.set_text(monthNamesShort[currentMonth]);
      yearLabel.set_text(currentYear.toString());
      updateGridCalendar();
    }, children: /* @__PURE__ */ jsx("icon", { icon: "nix-snowflake-symbolic" }) }),
    /* @__PURE__ */ jsx("button", { halign: default5.Align.CENTER, valign: default5.Align.CENTER, className: "calendar year arrow-left", onClick: () => changeYear(-1), children: /* @__PURE__ */ jsx("icon", { icon: Icons("arrow-back-circle-symbolic") }) }),
    yearLabel,
    /* @__PURE__ */ jsx("button", { halign: default5.Align.CENTER, valign: default5.Align.CENTER, className: "calendar year arrow-right", onClick: () => changeYear(1), children: /* @__PURE__ */ jsx("icon", { icon: Icons("arrow-forward-circle-symbolic") }) })
  ] });
  updateGridCalendar();
  return /* @__PURE__ */ jsxs("box", { orientation: default5.Orientation.VERTICAL, halign: default5.Align.CENTER, valign: default5.Align.CENTER, children: [
    header,
    gridCalendar
  ] });
}
var GridCalendar_default = GridCalendar;

// src/modules/Widgets/MediaPlayer.tsx
import Mpris2 from "gi://AstalMpris";
import Pango2 from "gi://Pango";

// src/modules/lib/TrimTrackTitle.tsx
import Mpris from "gi://AstalMpris";
var mpris = Mpris.get_default();
var player = Mpris.Player.new("Deezer");
function TrimTrackTitle(title) {
  if (!title) return "";
  const cleanPatterns = [
    /【[^】]*】/,
    // Touhou n weeb stuff
    " [FREE DOWNLOAD]",
    // F-777
    " (Radio Version)",
    " (Album Version)",
    " (Cafe Session)",
    " (International Version)",
    " (Remastered)"
  ];
  cleanPatterns.forEach((expr) => title = title.replace(expr, ""));
  return title;
}
var TrimTrackTitle_default = TrimTrackTitle;

// src/modules/Widgets/MediaPlayer.tsx
var player2 = Mpris2.Player.new("Deezer");
function TrackInfo() {
  const title = /* @__PURE__ */ jsx(
    "label",
    {
      className: "tracktitle",
      wrap: false,
      hexpand: true,
      halign: default5.Align.CENTER,
      ellipsize: Pango2.EllipsizeMode.END,
      maxWidthChars: 35,
      label: bind(player2, "title").as((title2) => TrimTrackTitle_default(title2))
    }
  );
  const artist = /* @__PURE__ */ jsx(
    "label",
    {
      className: "artist",
      wrap: false,
      hexpand: true,
      halign: default5.Align.CENTER,
      ellipsize: Pango2.EllipsizeMode.END,
      maxWidthChars: 30,
      label: bind(player2, "artist").as((artist2) => artist2 || "Unknown Artist")
    }
  );
  return /* @__PURE__ */ jsxs(
    "box",
    {
      className: "trackinfo",
      valign: default5.Align.CENTER,
      halign: default5.Align.CENTER,
      hexpand: true,
      vertical: true,
      spacing: 5,
      children: [
        title,
        artist
      ]
    }
  );
}
function lengthStr(length) {
  const min = Math.floor(length / 60);
  const sec = Math.floor(length % 60);
  const sec0 = sec < 10 ? "0" : "";
  return `${min}:${sec0}${sec}`;
}
function TrackPosition() {
  const positionSlider = /* @__PURE__ */ jsx(
    "slider",
    {
      className: "position",
      drawValue: false,
      onDragged: ({ value }) => player2.position = value * player2.length,
      visible: true,
      value: bind(player2, "position").as((p) => player2.length > 0 ? p / player2.length : 0)
    }
  );
  const lengthLabel = /* @__PURE__ */ jsx(
    "label",
    {
      className: "tracklength",
      halign: default5.Align.START,
      visible: true,
      label: bind(player2, "length").as(lengthStr)
    }
  );
  const positionLabel = /* @__PURE__ */ jsx(
    "label",
    {
      className: "trackposition",
      halign: default5.Align.END,
      visible: true,
      label: bind(player2, "position").as(lengthStr)
    }
  );
  return /* @__PURE__ */ jsxs("box", { vertical: true, children: [
    positionSlider,
    /* @__PURE__ */ jsx(
      "centerbox",
      {
        startWidget: lengthLabel,
        endWidget: positionLabel
      }
    )
  ] });
}
function PlayerIcon() {
  return /* @__PURE__ */ jsx(
    "button",
    {
      className: "playicon",
      onClick: async () => {
        const binding = bind(player2, "entry");
        const entryValue = binding.emitter?.entry;
        if (entryValue && typeof entryValue === "string") {
          await execAsync(`bash -c 'hyprctl dispatch exec "${entryValue}"'`);
        }
      },
      children: /* @__PURE__ */ jsx(
        "icon",
        {
          hexpand: true,
          halign: default5.Align.END,
          valign: default5.Align.CENTER,
          tooltip_text: bind(player2, "identity"),
          icon: bind(player2, "entry").as(
            (entry) => Icons(entry) || icons_default.mpris.controls.FALLBACK_ICON
          )
        }
      )
    }
  );
}
function PlayerControls() {
  const playPause = /* @__PURE__ */ jsx(
    "button",
    {
      className: "play-pause",
      valign: default5.Align.CENTER,
      onClick: () => player2.play_pause(),
      visible: bind(player2, "can_play"),
      children: /* @__PURE__ */ jsx(
        "icon",
        {
          icon: bind(player2, "playbackStatus").as(
            (s) => s === Mpris2.PlaybackStatus.PLAYING ? icons_default.mpris.controls.PAUSE : icons_default.mpris.controls.PLAY
          )
        }
      )
    }
  );
  const prev = /* @__PURE__ */ jsx(
    "button",
    {
      className: "previous",
      valign: default5.Align.CENTER,
      onClick: () => player2.previous(),
      visible: bind(player2, "can_go_previous"),
      children: /* @__PURE__ */ jsx("icon", { icon: icons_default.mpris.controls.PREV })
    }
  );
  const next = /* @__PURE__ */ jsx(
    "button",
    {
      className: "next",
      valign: default5.Align.CENTER,
      onClick: () => player2.next(),
      visible: bind(player2, "can_go_next"),
      children: /* @__PURE__ */ jsx("icon", { icon: icons_default.mpris.controls.NEXT })
    }
  );
  return /* @__PURE__ */ jsxs(
    "box",
    {
      className: "playercontrols",
      vexpand: false,
      hexpand: false,
      halign: default5.Align.CENTER,
      valign: default5.Align.CENTER,
      children: [
        prev,
        " ",
        playPause,
        " ",
        next
      ]
    }
  );
}
function CloseIcon() {
  return /* @__PURE__ */ jsx("button", { className: "close", valign: default5.Align.CENTER, children: /* @__PURE__ */ jsx("icon", { icon: icons_default.mpris.controls.CLOSE }) });
}
var blurCoverArtCss = async (cover_art) => {
  const playerBGgen = (bg, color) => `background-image: radial-gradient(circle at left, rgba(0, 0, 0, 0), ${color} 11.5rem), url('${bg}');
         background-position: left top, left top;
         background-size: contain;
         transition: all 0.7s ease;
         background-repeat: no-repeat;`;
  if (cover_art) {
    const color = await execAsync(
      `bash -c "convert ${cover_art} -alpha off -crop 5%x100%0+0+0 -colors 1 -unique-colors txt: | head -n2 | tail -n1 | cut -f4 -d' '"`
    );
    return playerBGgen(cover_art, color);
  }
  return "background-color: #0e0e1e";
};
function Player({ player: player6 }) {
  async function setup(box) {
    box.css = await blurCoverArtCss(player6.cover_art);
    box.hook(player6, "notify::cover-art", async () => {
      box.css = await blurCoverArtCss(player6.cover_art);
    });
  }
  return /* @__PURE__ */ jsxs(
    "box",
    {
      className: "player",
      vertical: false,
      hexpand: true,
      spacing: 5,
      halign: default5.Align.END,
      valign: default5.Align.CENTER,
      visible: bind(player6, "available").as((a) => a === true),
      setup,
      children: [
        /* @__PURE__ */ jsx(
          "centerbox",
          {
            className: "mediainfo",
            vertical: true,
            vexpand: true,
            startWidget: /* @__PURE__ */ jsxs("box", { vertical: false, valign: default5.Align.CENTER, children: [
              /* @__PURE__ */ jsx(TrackInfo, { player: player6 }),
              /* @__PURE__ */ jsx(PlayerIcon, {})
            ] }),
            centerWidget: /* @__PURE__ */ jsx(TrackPosition, {}),
            endWidget: /* @__PURE__ */ jsx(PlayerControls, {})
          }
        ),
        /* @__PURE__ */ jsx(CloseIcon, {})
      ]
    }
  );
}
var MediaPlayer_default = Player;

// src/modules/Widgets/Notification.tsx
import Notifd from "gi://AstalNotifd";
import Pango3 from "gi://Pango";
var Notif = Notifd.get_default();
var Time = (time, format = "%H:%M") => default7.DateTime.new_from_unix_local(time).format(format);
var Date2 = (time, format = "%b %d") => default7.DateTime.new_from_unix_local(time).format(format);
var NotifWidget = () => {
  return /* @__PURE__ */ jsx(
    "box",
    {
      className: "notif",
      halign: default5.Align.CENTER | default5.Align.FILL,
      valign: default5.Align.START,
      vexpand: true,
      vertical: true,
      spacing: 10,
      widthRequest: 350,
      children: bind(Notif, "notifications").as((items) => {
        if (items) {
          items.sort((a, b) => b.time - a.time);
        }
        return items.map((item) => /* @__PURE__ */ jsx("eventbox", { onClick: () => item.dismiss(), children: /* @__PURE__ */ jsxs(
          "box",
          {
            className: `level${item.get_hint("urgency")?.unpack()} outerbox`,
            vertical: false,
            vexpand: true,
            hexpand: false,
            visible: true,
            children: [
              /* @__PURE__ */ jsxs(
                "box",
                {
                  className: "icondatetime",
                  vertical: true,
                  valign: default5.Align.CENTER,
                  halign: default5.Align.START,
                  spacing: 5,
                  children: [
                    /* @__PURE__ */ jsx(
                      "icon",
                      {
                        className: "icon",
                        icon: item.get_app_icon() || item.get_desktop_entry() || icons_default.fallback.notification,
                        valign: default5.Align.CENTER,
                        halign: default5.Align.CENTER
                      }
                    ),
                    /* @__PURE__ */ jsxs("box", { vertical: true, className: "datetime", children: [
                      /* @__PURE__ */ jsx(
                        "label",
                        {
                          valign: default5.Align.CENTER,
                          halign: default5.Align.CENTER,
                          lines: 1,
                          maxWidthChars: 6,
                          label: Date2(item.time)?.toString()
                        }
                      ),
                      /* @__PURE__ */ jsx(
                        "label",
                        {
                          valign: default5.Align.CENTER,
                          halign: default5.Align.CENTER,
                          lines: 1,
                          maxWidthChars: 6,
                          label: Time(item.time)?.toString()
                        }
                      )
                    ] })
                  ]
                }
              ),
              /* @__PURE__ */ jsxs(
                "box",
                {
                  vertical: true,
                  valign: default5.Align.START,
                  halign: default5.Align.START,
                  children: [
                    /* @__PURE__ */ jsx(
                      "label",
                      {
                        className: "title",
                        label: item.summary,
                        maxWidthChars: 50,
                        lines: 2,
                        ellipsize: Pango3.EllipsizeMode.END,
                        halign: default5.Align.START,
                        valign: default5.Align.START
                      }
                    ),
                    /* @__PURE__ */ jsx(
                      "label",
                      {
                        className: "body",
                        label: item.body,
                        maxWidthChars: 50,
                        lines: 3,
                        ellipsize: Pango3.EllipsizeMode.END,
                        halign: default5.Align.START,
                        valign: default5.Align.CENTER
                      }
                    ),
                    /* @__PURE__ */ jsx(
                      "box",
                      {
                        className: "actions",
                        valign: default5.Align.END,
                        halign: default5.Align.FILL,
                        children: item.get_actions().map((action) => /* @__PURE__ */ jsx(
                          "button",
                          {
                            onClick: () => {
                              item.invoke(action.id);
                              item.dismiss();
                            },
                            hexpand: true,
                            children: /* @__PURE__ */ jsx("label", { label: action.label })
                          }
                        ))
                      }
                    )
                  ]
                }
              )
            ]
          }
        ) }));
      })
    }
  );
};
var Notification_default = NotifWidget;

// src/modules/Widgets/VolumeIndicator.tsx
import Wp from "gi://AstalWp";
var { audio } = Wp.get_default_wp();
var Speaker = audio.get_default_speaker();
function VolumeIndicator() {
  const volumeIndicatorClassName2 = () => {
    const classes = ["volume-indicator"];
    if (Speaker?.get_mute() === true) {
      classes.push("muted");
    }
    const className = classes.join(" ");
    return className;
  };
  const tooltip = Variable.derive(
    [bind(Speaker, "volume"), bind(Speaker, "mute")],
    (v, m) => m ? "Muted" : `Volume ${(v * 100).toFixed(2)}%`
  );
  return /* @__PURE__ */ jsx(
    "button",
    {
      tooltip_text: bind(tooltip),
      className: volumeIndicatorClassName2(),
      onClick: (_, event) => {
        if (event.button === default6.BUTTON_PRIMARY) {
          const win = application_default.get_window("audiomixerwindow");
          if (win) {
            win.visible = !win.visible;
          }
        }
        if (event.button === default6.BUTTON_SECONDARY) {
          Speaker?.set_mute(!Speaker.get_mute());
        }
      },
      onScroll: (_, { delta_y }) => {
        if (delta_y < 0) {
          Speaker?.set_volume(Speaker.volume + 0.05);
        } else {
          Speaker?.set_volume(Speaker.volume - 0.05);
        }
      },
      children: /* @__PURE__ */ jsx("icon", { icon: bind(Speaker, "volume_icon") })
    }
  );
}
var VolumeIndicator_default = VolumeIndicator;

// src/modules/Widgets/AudioMixer.tsx
import Wp2 from "gi://AstalWp";
var { audio: audio2 } = Wp2.get_default_wp();
var Speaker2 = audio2.get_default_speaker();
var Microphone = audio2.get_default_microphone();
var volumeIndicatorClassName = () => {
  const classes = ["audio mixer volume-indicator"];
  if (Speaker2?.get_mute()) {
    classes.push("muted");
  }
  const className = classes.join(" ");
  return className;
};
function speakerIcon() {
  const tp = Variable.derive(
    [bind(Speaker2, "volume"), bind(Speaker2, "mute")],
    (v, m) => m ? "Muted" : `Volume ${(v * 100).toFixed(2)}%`
  );
  return /* @__PURE__ */ jsx(
    "button",
    {
      tooltip_text: bind(tp),
      className: ["audio-mixer", "speaker-icon", volumeIndicatorClassName()].join(" "),
      onClick: (_, event) => {
        if (event.button === default6.BUTTON_PRIMARY) {
          Speaker2?.set_mute(!Speaker2.get_mute());
        }
      },
      children: /* @__PURE__ */ jsx("icon", { icon: bind(Speaker2, "volume_icon") })
    }
  );
}
function speakerSlider() {
  return /* @__PURE__ */ jsx(
    "slider",
    {
      className: "audio-mixer speaker-slider Slider",
      hexpand: true,
      drawValue: false,
      min: 0,
      max: 1.5,
      value: bind(Speaker2, "volume"),
      onDragged: ({ value, dragging }) => {
        if (dragging) {
          Speaker2?.set_volume(value);
          Speaker2?.set_mute(false);
        }
      }
    }
  );
}
function microphoneIcon() {
  const tp = Variable.derive(
    [bind(Microphone, "volume"), bind(Microphone, "mute")],
    (v, m) => m ? "Muted" : `Volume ${(v * 100).toFixed(2)}%`
  );
  return /* @__PURE__ */ jsx(
    "button",
    {
      tooltip_text: bind(tp),
      className: ["audio-mixer", "microphone", volumeIndicatorClassName()].join(" "),
      onClick: (_, event) => {
        if (event.button === default6.BUTTON_PRIMARY) {
          Microphone?.set_mute(!Microphone?.get_mute());
        }
      },
      children: /* @__PURE__ */ jsx("icon", { icon: bind(Microphone, "volume_icon") })
    }
  );
}
function microphoneSlider() {
  return /* @__PURE__ */ jsx(
    "slider",
    {
      className: "audio-mixer microphone-slider Slider",
      hexpand: true,
      drawValue: false,
      min: 0,
      max: 1,
      value: bind(Microphone, "volume"),
      visible: true,
      onDragged: ({ value, dragging }) => {
        if (dragging) {
          Microphone?.set_volume(value);
          Microphone?.set_mute(false);
        }
      }
    }
  );
}
function SettingsButton() {
  return /* @__PURE__ */ jsx(
    "button",
    {
      className: "audio-mixer settings-button",
      onClick: () => {
        execAsync("pavucontrol");
        application_default.toggle_window("audiomixerwindow");
      },
      hexpand: true,
      halign: default5.Align.END,
      valign: default5.Align.START,
      children: /* @__PURE__ */ jsx("icon", { icon: icons_default.ui.settings })
    }
  );
}
function VolumeSlider() {
  return /* @__PURE__ */ jsxs(
    "box",
    {
      className: "audio-mixer mixer-slider",
      vertical: true,
      vexpand: true,
      children: [
        /* @__PURE__ */ jsxs("box", { children: [
          speakerIcon(),
          speakerSlider()
        ] }),
        /* @__PURE__ */ jsxs("box", { children: [
          microphoneIcon(),
          microphoneSlider()
        ] })
      ]
    }
  );
}
function AudioMixer() {
  return /* @__PURE__ */ jsxs("box", { vertical: true, className: "audio-mixer container", children: [
    VolumeSlider(),
    SettingsButton()
  ] });
}

// src/modules/Widgets/powerprofiles.tsx
import AstalPowerProfiles from "gi://AstalPowerProfiles";
var powerprofile = AstalPowerProfiles.get_default();
powerprofile.connect("notify::active-profile", () => {
  const brightnessLevels = {
    "power-saver": 30,
    balanced: 60,
    performance: 100
  };
  const setBrightness = (level) => {
    execAsync(`light -S ${level}`);
  };
  const updateBrightness = () => {
    const level = brightnessLevels[powerprofile.activeProfile];
    setBrightness(level);
  };
  updateBrightness();
});
var SysButton = (action, label) => /* @__PURE__ */ jsx(
  "button",
  {
    onClick: (_, event) => {
      if (event.button === default6.BUTTON_PRIMARY) {
        powerprofile.activeProfile = action;
      }
    },
    className: bind(powerprofile, "activeProfile").as((c) => c === action ? c : ""),
    children: /* @__PURE__ */ jsxs("box", { vertical: true, children: [
      /* @__PURE__ */ jsx("icon", { icon: icons_default.powerprofile[action] }),
      /* @__PURE__ */ jsx("label", { label, visible: label !== "" })
    ] })
  }
);
function PowerProfiles2() {
  return /* @__PURE__ */ jsxs(
    "box",
    {
      className: "powerprofiles container",
      vertical: true,
      valign: default5.Align.CENTER,
      halign: default5.Align.CENTER,
      children: [
        /* @__PURE__ */ jsx(
          "box",
          {
            vertical: true,
            valign: default5.Align.CENTER,
            halign: default5.Align.CENTER,
            spacing: 10,
            children: /* @__PURE__ */ jsx(
              "label",
              {
                valign: default5.Align.CENTER,
                halign: default5.Align.CENTER,
                label: bind(powerprofile, "active_profile").as((l) => l.toUpperCase())
              }
            )
          }
        ),
        /* @__PURE__ */ jsxs(
          "box",
          {
            className: "powerprofiles box",
            vertical: false,
            vexpand: false,
            hexpand: false,
            valign: default5.Align.CENTER,
            halign: default5.Align.CENTER,
            children: [
              SysButton("power-saver", "Saver"),
              SysButton("balanced", "Balanced"),
              SysButton("performance", "Performance")
            ]
          }
        )
      ]
    }
  );
}
var powerprofiles_default = PowerProfiles2;

// src/modules/Widgets/Tray.tsx
import AstalTray from "gi://AstalTray";
var SystemTray = AstalTray.Tray.get_default();
var SysTrayItem = (item) => {
  const menu = item.create_menu?.();
  return /* @__PURE__ */ jsx(
    "button",
    {
      className: "systray-item",
      halign: default5.Align.CENTER,
      valign: default5.Align.CENTER,
      onClick: (btn, event) => {
        if (event.button === default6.BUTTON_PRIMARY || event.button === default6.BUTTON_SECONDARY) {
          menu?.popup_at_widget(
            btn,
            default6.Gravity.EAST,
            default6.Gravity.WEST,
            null
          );
        } else if (event.button === default6.BUTTON_MIDDLE) {
          item.activate(0, 0);
        }
      },
      tooltip_markup: bind(item, "tooltip_markup"),
      children: /* @__PURE__ */ jsx(
        "icon",
        {
          halign: default5.Align.CENTER,
          valign: default5.Align.CENTER,
          pixbuf: bind(item, "icon_pixbuf"),
          gicon: bind(item, "gicon"),
          icon: bind(item, "icon_name")
        }
      )
    }
  );
};
function traySetup(box) {
  const items = /* @__PURE__ */ new Map();
  const addItem = (id) => {
    const item = SystemTray.get_item(id);
    if (item) {
      const trayItem = SysTrayItem(item);
      items.set(id, trayItem);
      box.add(trayItem);
      trayItem.show();
    }
  };
  const removeItem = (id) => {
    const trayItem = items.get(id);
    if (trayItem) {
      trayItem.destroy();
      items.delete(id);
    }
  };
  SystemTray.get_items().forEach((item) => addItem(item.item_id));
  SystemTray.connect("item_added", (SystemTray2, id) => addItem(id));
  SystemTray.connect("item_removed", (SystemTray2, id) => removeItem(id));
}
function Tray() {
  return /* @__PURE__ */ jsx("box", { className: "tray container", setup: traySetup, halign: default5.Align.CENTER, valign: default5.Align.CENTER, vertical: true });
}
var Tray_default = Tray;

// src/modules/bar/sysinfo.tsx
function SysInfo() {
  return /* @__PURE__ */ jsxs(
    "box",
    {
      className: "sysinfo",
      halign: default5.Align.CENTER,
      valign: default5.Align.CENTER,
      spacing: 5,
      children: [
        /* @__PURE__ */ jsx(VolumeIndicator_default, {}),
        /* @__PURE__ */ jsx(battery_default, {})
      ]
    }
  );
}

// src/modules/bar/MediaTicker.tsx
import Mpris3 from "gi://AstalMpris";
import Pango4 from "gi://Pango";
var player3 = Mpris3.Player.new("Deezer");
function TickerTrack() {
  return /* @__PURE__ */ jsx(
    "label",
    {
      className: "tickertrack",
      vexpand: true,
      wrap: false,
      halign: default5.Align.CENTER,
      valign: default5.Align.CENTER,
      ellipsize: Pango4.EllipsizeMode.END,
      label: bind(player3, "title").as((title) => TrimTrackTitle_default(title))
    }
  );
}
function TickerArtist() {
  return /* @__PURE__ */ jsx(
    "label",
    {
      className: "tickerartist",
      wrap: false,
      halign: default5.Align.CENTER,
      valign: default5.Align.CENTER,
      ellipsize: Pango4.EllipsizeMode.END,
      maxWidthChars: 35,
      label: bind(player3, "artist").as((artist) => artist || "Unknown Artist")
    }
  );
}
function TickerIcon() {
  return /* @__PURE__ */ jsx(
    "icon",
    {
      className: "tickericon",
      hexpand: true,
      halign: default5.Align.CENTER,
      valign: default5.Align.CENTER,
      tooltip_text: bind(player3, "identity"),
      icon: bind(player3, "entry").as(
        (entry) => Icons(entry) || icons_default.mpris.controls.FALLBACK_ICON
      )
    }
  );
}
var NoMedia = /* @__PURE__ */ jsx(
  "label",
  {
    className: "nomedia",
    hexpand: true,
    wrap: false,
    halign: default5.Align.CENTER,
    valign: default5.Align.CENTER,
    label: "No Media"
  }
);
function TickerBox() {
  return /* @__PURE__ */ jsx(
    "box",
    {
      className: "tickerbox",
      visible: true,
      vertical: false,
      hexpand: true,
      vexpand: false,
      valign: default5.Align.CENTER,
      children: bind(player3, "playbackStatus").as((status) => {
        switch (status) {
          case Mpris3.PlaybackStatus.STOPPED:
            return NoMedia;
          case Mpris3.PlaybackStatus.PLAYING:
          case Mpris3.PlaybackStatus.PAUSED:
            return /* @__PURE__ */ jsxs("box", { vertical: false, visible: true, spacing: 5, children: [
              /* @__PURE__ */ jsx(TickerTrack, {}),
              /* @__PURE__ */ jsx(TickerIcon, {}),
              /* @__PURE__ */ jsx(TickerArtist, {})
            ] });
          default:
            return NoMedia;
        }
      })
    }
  );
}
function MediaTickerButton() {
  return /* @__PURE__ */ jsx(
    "button",
    {
      className: "tickerbtn",
      vexpand: false,
      hexpand: true,
      onClick: (_, event) => {
        if (event.button === default6.BUTTON_PRIMARY) {
          const win = application_default.get_window("mediaplayerwindow");
          if (win) {
            win.visible = !win.visible;
          }
        }
        if (event.button === default6.BUTTON_SECONDARY) {
          player3.play_pause();
        }
      },
      onScroll: (_, { delta_y }) => {
        if (delta_y < 0) {
          player3.previous();
        } else {
          player3.next();
        }
      },
      children: /* @__PURE__ */ jsx(TickerBox, {})
    }
  );
}
var MediaTicker_default = MediaTickerButton;

// src/modules/bar/Bar.tsx
function LeftBar() {
  return /* @__PURE__ */ jsxs(
    "box",
    {
      className: "left",
      halign: default5.Align.START,
      valign: default5.Align.START,
      spacing: 5,
      children: [
        /* @__PURE__ */ jsx(Workspaces, { id: Number() }),
        /* @__PURE__ */ jsx(AppTitleTicker_default, {})
      ]
    }
  );
}
function CenterBar() {
  return /* @__PURE__ */ jsx(
    "box",
    {
      className: "center",
      spacing: 10,
      halign: default5.Align.CENTER,
      valign: default5.Align.START,
      children: /* @__PURE__ */ jsx(Clock, {})
    }
  );
}
function RightBar() {
  return /* @__PURE__ */ jsxs(
    "box",
    {
      className: "right",
      halign: default5.Align.END,
      valign: default5.Align.START,
      spacing: 5,
      children: [
        /* @__PURE__ */ jsx(MediaTicker_default, {}),
        /* @__PURE__ */ jsx(SysInfo, {})
      ]
    }
  );
}
function Bar({ monitor }) {
  return /* @__PURE__ */ jsx(
    "window",
    {
      className: "bar",
      name: `bar${monitor}`,
      monitor,
      application: application_default,
      anchor: default2.WindowAnchor.TOP | default2.WindowAnchor.LEFT | default2.WindowAnchor.RIGHT,
      exclusivity: default2.Exclusivity.EXCLUSIVE,
      children: /* @__PURE__ */ jsxs("centerbox", { children: [
        /* @__PURE__ */ jsx(LeftBar, {}),
        /* @__PURE__ */ jsx(CenterBar, {}),
        /* @__PURE__ */ jsx(RightBar, {})
      ] })
    }
  );
}

// src/modules/lib/screensizeadjust.ts
var winheight = (value) => {
  const screenHeight = default6.Screen.get_default()?.get_height();
  const winheight2 = screenHeight * value;
  return winheight2;
};
var winwidth = (value) => {
  const screenWidth = default6.Screen.get_default()?.get_width();
  const winwidth2 = screenWidth * value;
  return winwidth2;
};

// src/modules/Windows/dashboard/dashboard.tsx
import Mpris4 from "gi://AstalMpris";

// src/modules/Windows/dashboard/notificationList.tsx
import Notifd2 from "gi://AstalNotifd";
var Notif2 = Notifd2.get_default();
var NotifBox = /* @__PURE__ */ jsx(
  "scrollable",
  {
    className: "notif container",
    vscroll: default5.PolicyType.AUTOMATIC,
    hscroll: default5.PolicyType.NEVER,
    vexpand: true,
    hexpand: false,
    halign: default5.Align.FILL,
    valign: default5.Align.FILL,
    children: /* @__PURE__ */ jsx(Notification_default, {})
  }
);
var Empty = /* @__PURE__ */ jsx(
  "box",
  {
    className: "notif empty",
    halign: default5.Align.CENTER,
    valign: default5.Align.CENTER,
    vertical: true,
    children: /* @__PURE__ */ jsx(
      "label",
      {
        label: `\u{F164E}`,
        valign: default5.Align.CENTER,
        halign: default5.Align.CENTER,
        vexpand: true
      }
    )
  }
);
function NotificationList() {
  return /* @__PURE__ */ jsxs(
    "box",
    {
      className: "notif panel",
      vertical: true,
      vexpand: true,
      hexpand: false,
      halign: default5.Align.FILL,
      valign: default5.Align.FILL,
      children: [
        /* @__PURE__ */ jsx(
          "centerbox",
          {
            className: "notif panel box",
            spacing: 20,
            valign: default5.Align.FILL,
            halign: default5.Align.CENTER,
            vertical: false,
            startWidget: /* @__PURE__ */ jsx(
              "label",
              {
                label: "Notifications",
                valign: default5.Align.START,
                halign: default5.Align.END
              }
            ),
            centerWidget: /* @__PURE__ */ jsx(
              "button",
              {
                halign: default5.Align.START,
                valign: default5.Align.START,
                onClick: (_, event) => {
                  if (event.button === default6.BUTTON_PRIMARY) {
                    Notif2.get_notifications().forEach(
                      (item, id) => timeout(50 * id, () => item.dismiss())
                    );
                  }
                },
                children: /* @__PURE__ */ jsx(
                  "icon",
                  {
                    icon: bind(Notif2, "notifications").as(
                      (items) => items.length > 0 ? icons_default.trash.full : icons_default.trash.empty
                    )
                  }
                )
              }
            ),
            endWidget: /* @__PURE__ */ jsx(
              "button",
              {
                halign: default5.Align.END,
                valign: default5.Align.START,
                onClick: (_, event) => {
                  if (event.button === default6.BUTTON_PRIMARY) {
                    Notif2.set_dont_disturb(!Notif2.get_dont_disturb());
                  }
                },
                children: /* @__PURE__ */ jsx(
                  "icon",
                  {
                    icon: bind(Notif2, "dont_disturb").as(
                      (d) => d === false ? Icons("bell-disabled-symbolic") : Icons("bell-enabled-symbolic")
                    ),
                    valign: default5.Align.CENTER,
                    halign: default5.Align.CENTER
                  }
                )
              }
            )
          }
        ),
        NotifBox
      ]
    }
  );
}

// src/modules/Windows/dashboard/dashboard.tsx
var player4 = Mpris4.Player.new("Deezer");
var Calendar = () => /* @__PURE__ */ jsx(
  "box",
  {
    className: "dashboard calendar",
    valign: default5.Align.CENTER,
    halign: default5.Align.CENTER,
    children: /* @__PURE__ */ jsx(GridCalendar_default, {})
  }
);
var LeftSide = () => /* @__PURE__ */ jsxs(
  "box",
  {
    className: "dashboard leftSide",
    vertical: true,
    halign: default5.Align.CENTER,
    valign: default5.Align.CENTER,
    spacing: 10,
    children: [
      /* @__PURE__ */ jsx(Calendar, {}),
      /* @__PURE__ */ jsx(powerprofiles_default, {})
    ]
  }
);
var RightSide = () => /* @__PURE__ */ jsx(
  "box",
  {
    className: "dashboard rightSide",
    vertical: true,
    halign: default5.Align.CENTER,
    valign: default5.Align.FILL,
    hexpand: false,
    spacing: 10,
    children: /* @__PURE__ */ jsx(NotificationList, {})
  }
);
function Dashboard() {
  const content = /* @__PURE__ */ jsx(
    "eventbox",
    {
      onKeyPressEvent: (_, event) => {
        if (event.get_keyval()[1] === default6.KEY_Escape) {
          application_default.toggle_window("dashboard");
        }
      },
      onClick: () => {
        application_default.toggle_window("dashboard");
      },
      children: /* @__PURE__ */ jsxs(
        "box",
        {
          className: "dashboard container",
          vertical: true,
          vexpand: false,
          hexpand: false,
          valign: default5.Align.START,
          halign: default5.Align.CENTER,
          heightRequest: winheight(0.5),
          widthRequest: winwidth(0.25),
          css: `
          padding: 1.5rem;
        `,
          children: [
            /* @__PURE__ */ jsx("box", { vertical: true, halign: default5.Align.CENTER, valign: default5.Align.CENTER, spacing: 10, children: /* @__PURE__ */ jsx(MediaPlayer_default, { player: player4 }) }),
            /* @__PURE__ */ jsxs("box", { vertical: false, halign: default5.Align.FILL, valign: default5.Align.FILL, spacing: 10, children: [
              /* @__PURE__ */ jsx(LeftSide, {}),
              /* @__PURE__ */ jsx(Tray_default, {}),
              /* @__PURE__ */ jsx(RightSide, {})
            ] })
          ]
        }
      )
    }
  );
  return /* @__PURE__ */ jsx(
    "window",
    {
      name: "dashboard",
      className: "dashboard window",
      anchor: default2.WindowAnchor.TOP | default2.WindowAnchor.LEFT | default2.WindowAnchor.RIGHT | default2.WindowAnchor.BOTTOM,
      layer: default2.Layer.OVERLAY,
      exclusivity: default2.Exclusivity.NORMAL,
      keymode: default2.Keymode.EXCLUSIVE,
      visible: false,
      application: application_default,
      children: content
    }
  );
}
var dashboard_default = Dashboard;

// src/modules/Windows/MediaPlayer.tsx
import Mpris5 from "gi://AstalMpris";
var player5 = Mpris5.Player.new("Deezer");
function MediaPlayerWindow() {
  return /* @__PURE__ */ jsx(
    "window",
    {
      name: "mediaplayerwindow",
      className: "window media-player",
      anchor: default2.WindowAnchor.TOP | default2.WindowAnchor.RIGHT,
      layer: default2.Layer.OVERLAY,
      exclusivity: default2.Exclusivity.NORMAL,
      keymode: default2.Keymode.EXCLUSIVE,
      visible: false,
      application: application_default,
      "margin-right": 90,
      children: /* @__PURE__ */ jsx("eventbox", { onKeyPressEvent: (_, event) => {
        if (event.get_keyval()[1] === default6.KEY_Escape) {
          application_default.toggle_window("mediaplayerwindow");
        }
      }, children: /* @__PURE__ */ jsx("box", { className: "mediaplayerbox", children: /* @__PURE__ */ jsx(MediaPlayer_default, { player: player5 }) }) })
    }
  );
}

// src/modules/Windows/calendar.tsx
function Calendar2() {
  return /* @__PURE__ */ jsx(
    "window",
    {
      name: "calendar",
      className: "window calendar",
      anchor: default2.WindowAnchor.TOP | default2.WindowAnchor.TOP,
      layer: default2.Layer.OVERLAY,
      exclusivity: default2.Exclusivity.NORMAL,
      keymode: default2.Keymode.EXCLUSIVE,
      visible: false,
      application: application_default,
      children: /* @__PURE__ */ jsx(
        "eventbox",
        {
          onKeyPressEvent: (_, event) => {
            if (event.get_keyval()[1] === default6.KEY_Escape) {
              application_default.toggle_window("calendar");
            }
          },
          children: /* @__PURE__ */ jsx("box", { className: "calendarbox", children: /* @__PURE__ */ jsx(GridCalendar_default, {}) })
        }
      )
    }
  );
}

// src/modules/Windows/AudioMixer.tsx
var AudioMixer_default = () => /* @__PURE__ */ jsx(
  "window",
  {
    name: "audiomixerwindow",
    className: "window audiomixer",
    anchor: default2.WindowAnchor.TOP | default2.WindowAnchor.RIGHT,
    layer: default2.Layer.OVERLAY,
    exclusivity: default2.Exclusivity.NORMAL,
    keymode: default2.Keymode.EXCLUSIVE,
    visible: false,
    application: application_default,
    "margin-right": 50,
    children: /* @__PURE__ */ jsx("eventbox", { onKeyPressEvent: (_, event) => {
      if (event.get_keyval()[1] === default6.KEY_Escape) {
        application_default.toggle_window("audiomixerwindow");
      }
    }, children: /* @__PURE__ */ jsx(AudioMixer, {}) })
  }
);

// src/modules/Windows/cliphist.tsx
import Pango5 from "gi://Pango";
var Separator = () => {
  return /* @__PURE__ */ jsx(
    "box",
    {
      className: "clip_divider",
      heightRequest: 1,
      css: `
        background-color: #ccc;
        margin: 10px 0px;
      `
    }
  );
};
function ClipHistItem(entry) {
  let [id, ...content] = entry.split("	");
  let clickCount = 0;
  const button = /* @__PURE__ */ jsx("button", { className: "clip_container", children: /* @__PURE__ */ jsxs("box", { children: [
    /* @__PURE__ */ jsx("label", { label: id, className: "clip_id", valign: default5.Align.CENTER }),
    /* @__PURE__ */ jsx(
      "label",
      {
        label: "\u30FB",
        className: "dot_divider",
        valign: default5.Align.CENTER
      }
    ),
    /* @__PURE__ */ jsx(
      "label",
      {
        label: content.join(" ").trim(),
        className: "clip_label",
        valign: default5.Align.CENTER,
        ellipsize: Pango5.EllipsizeMode.END
      }
    )
  ] }) });
  button.connect("clicked", () => {
    clickCount++;
    if (clickCount === 2) {
      execAsync(
        `${default7.get_user_config_dir()}/src/scripts/cliphist.sh --copy-by-id ${id}`
      );
      clickCount = 0;
    }
  });
  button.connect("focus-out-event", () => {
    clickCount = 0;
  });
  return /* @__PURE__ */ jsxs("box", { orientation: default5.Orientation.VERTICAL, children: [
    button,
    /* @__PURE__ */ jsx(Separator, {})
  ] });
}
function ClipHistWidget({ width = 500, height = 500, spacing = 12 }) {
  let output = "";
  let entries = [];
  let clipHistItems = [];
  let widgets = [];
  const list = /* @__PURE__ */ jsx("box", { vertical: true, spacing });
  async function repopulate() {
    try {
      output = await execAsync(
        `${default7.get_user_config_dir()}/scripts/cliphist.sh --get`
      );
    } catch (err) {
      print(err);
      output = "";
    }
    entries = output.split("\n").filter((line) => line.trim() !== "");
    clipHistItems = entries.map((entry2) => {
      let [id, ...content] = entry2.split("	");
      return { id: id.trim(), content: content.join(" ").trim(), entry: entry2 };
    });
    list.remove_all();
    widgets = clipHistItems.map((item) => ClipHistItem(item.entry));
    widgets.forEach((widget) => {
      list.append(widget);
    });
  }
  repopulate();
  const entry = /* @__PURE__ */ jsx(
    "entry",
    {
      hexpand: true,
      className: "cliphistory_entry",
      placeholder_text: "Search",
      on_changed: ({ text }) => {
        const searchText = (text ?? "").toLowerCase();
        widgets.forEach((item) => {
          const content = clipHistItems.find((clipItem) => clipItem.entry === item.entry)?.content.toLowerCase() || "";
          item.visible = content.includes(searchText);
        });
      }
    }
  );
  return /* @__PURE__ */ jsxs(
    "box",
    {
      vertical: true,
      className: "cliphistory_box",
      margin_top: 14,
      margin_right: 14,
      setup: (self) => self.hook(application_default, (_, windowName, visible) => {
        if (windowName !== cliphist) return;
        if (visible) {
          repopulate();
          entry.text = "";
        }
      }),
      children: [
        entry,
        /* @__PURE__ */ jsx(Separator, {}),
        /* @__PURE__ */ jsx(
          "scrollable",
          {
            hscroll: default5.PolicyType.NEVER,
            css: `
          min-width: ${width}px;
          min-height: ${height}px;
        `,
            children: list
          }
        )
      ]
    }
  );
}
var cliphist = /* @__PURE__ */ jsx(
  "window",
  {
    name: "cliphist",
    className: "cliphistory",
    visible: false,
    keymode: default2.Keymode.EXCLUSIVE,
    anchor: default2.WindowAnchor.TOP | default2.WindowAnchor.RIGHT,
    layer: default2.Layer.OVERLAY,
    application: application_default,
    children: /* @__PURE__ */ jsx(ClipHistWidget, {})
  }
);

// src/modules/Windows/notificationPopups.tsx
import Notifd3 from "gi://AstalNotifd";
import Pango6 from "gi://Pango";
var Notif3 = Notifd3.get_default();
var expireTime = 3e4;
var Time2 = (time, format = "%H:%M.%S") => default7.DateTime.new_from_unix_local(time).format(format);
var Date3 = (time, format = "%b %d") => default7.DateTime.new_from_unix_local(time).format(format);
var NotifWidget2 = () => {
  return /* @__PURE__ */ jsx(
    "box",
    {
      className: "notif",
      halign: default5.Align.FILL,
      valign: default5.Align.START,
      vexpand: true,
      vertical: true,
      spacing: 10,
      widthRequest: 450,
      children: bind(Notif3, "notifications").as((items) => {
        if (items) {
          items.sort((a, b) => b.time - a.time).forEach((item) => setTimeout(() => item.dismiss(), expireTime));
        }
        return items.map((item) => /* @__PURE__ */ jsx(
          "eventbox",
          {
            onClick: () => {
              item.dismiss();
            },
            onHover: () => {
            },
            onHoverLost: () => {
              remove(item.id);
            },
            children: /* @__PURE__ */ jsxs(
              "box",
              {
                className: `level${item.get_hint("urgency")?.unpack()} outerbox`,
                vertical: false,
                vexpand: true,
                hexpand: false,
                visible: true,
                children: [
                  /* @__PURE__ */ jsxs(
                    "box",
                    {
                      className: "icondatetime",
                      vertical: true,
                      valign: default5.Align.CENTER,
                      halign: default5.Align.START,
                      spacing: 5,
                      children: [
                        /* @__PURE__ */ jsx(
                          "icon",
                          {
                            className: "icon",
                            icon: item.get_app_icon() || item.get_desktop_entry() || icons_default.fallback.notification,
                            valign: default5.Align.CENTER,
                            halign: default5.Align.CENTER
                          }
                        ),
                        /* @__PURE__ */ jsxs("box", { vertical: true, className: "datetime", children: [
                          /* @__PURE__ */ jsx(
                            "label",
                            {
                              valign: default5.Align.CENTER,
                              halign: default5.Align.CENTER,
                              lines: 1,
                              maxWidthChars: 6,
                              label: Date3(item.time)?.toString()
                            }
                          ),
                          /* @__PURE__ */ jsx(
                            "label",
                            {
                              valign: default5.Align.CENTER,
                              halign: default5.Align.CENTER,
                              lines: 1,
                              maxWidthChars: 6,
                              label: Time2(item.time)?.toString()
                            }
                          )
                        ] })
                      ]
                    }
                  ),
                  /* @__PURE__ */ jsxs(
                    "box",
                    {
                      vertical: true,
                      valign: default5.Align.START,
                      halign: default5.Align.START,
                      children: [
                        /* @__PURE__ */ jsx(
                          "label",
                          {
                            className: "title",
                            label: item.summary,
                            maxWidthChars: 50,
                            lines: 2,
                            ellipsize: Pango6.EllipsizeMode.END,
                            halign: default5.Align.START,
                            valign: default5.Align.START
                          }
                        ),
                        /* @__PURE__ */ jsx(
                          "label",
                          {
                            className: "body",
                            label: item.body,
                            maxWidthChars: 50,
                            lines: 3,
                            ellipsize: Pango6.EllipsizeMode.END,
                            halign: default5.Align.START,
                            valign: default5.Align.CENTER
                          }
                        ),
                        /* @__PURE__ */ jsx(
                          "box",
                          {
                            className: "actions",
                            valign: default5.Align.END,
                            halign: default5.Align.FILL,
                            children: item.get_actions().map((action) => /* @__PURE__ */ jsx(
                              "button",
                              {
                                onClick: () => {
                                  item.invoke(action.id);
                                  item.dismiss();
                                },
                                hexpand: true,
                                children: /* @__PURE__ */ jsx("label", { label: action.label })
                              }
                            ))
                          }
                        )
                      ]
                    }
                  )
                ]
              }
            )
          }
        ));
      })
    }
  );
};
var notificationPopups_default = (monitor) => /* @__PURE__ */ jsx(
  "window",
  {
    name: `notifications${monitor}`,
    anchor: default2.WindowAnchor.TOP | default2.WindowAnchor.RIGHT,
    className: "notifications",
    hexpand: true,
    layer: default2.Layer.OVERLAY,
    application: application_default,
    children: /* @__PURE__ */ jsx("box", { css: "padding: 2px;", halign: default5.Align.CENTER, children: /* @__PURE__ */ jsx(NotifWidget2, {}) })
  }
);

// src/modules/Windows/sessioncontrol.tsx
var SysButton2 = (action, label) => {
  const command = (() => {
    switch (action) {
      case "lock":
        return "bash -c 'exec ags -b lockscreen -c ~/.config/ags/Lockscreen/lockscreen.js'";
      case "reboot":
        return "systemctl reboot";
      case "logout":
        return "bash -c 'exec  ~/.config/hypr/scripts/hyprkill.sh >/dev/null 2>&1 &'";
      case "shutdown":
        return "systemctl -i poweroff";
      default:
        return "";
    }
  })();
  return /* @__PURE__ */ jsx(
    "button",
    {
      onClick: (_, event) => {
        if (event.button === default6.BUTTON_PRIMARY) {
          execAsync(command);
          application_default.toggle_window("sessioncontrols");
        }
      },
      children: /* @__PURE__ */ jsxs(
        "box",
        {
          className: "sessioncontrol button",
          vertical: true,
          halign: default5.Align.CENTER,
          valign: default5.Align.CENTER,
          children: [
            /* @__PURE__ */ jsx("icon", { icon: icons_default.powermenu[action] }),
            /* @__PURE__ */ jsx("label", { label })
          ]
        }
      )
    }
  );
};
var sessioncontrol_default = () => {
  /* @__PURE__ */ jsx(
    "window",
    {
      name: "sessioncontrols",
      className: "sessioncontrols window",
      anchor: default2.WindowAnchor.TOP | default2.WindowAnchor.BOTTOM | default2.WindowAnchor.LEFT | default2.WindowAnchor.RIGHT,
      layer: default2.Layer.OVERLAY,
      exclusivity: default2.Exclusivity.NORMAL,
      keymode: default2.Keymode.ON_DEMAND,
      visible: false,
      application: application_default,
      children: /* @__PURE__ */ jsx(
        "eventbox",
        {
          onClick: () => application_default.toggle_window("sessioncontrols"),
          onKeyPressEvent: (_, event) => {
            if (event.get_keyval()[1] === default6.KEY_Escape) {
              application_default.toggle_window("sessioncontrols");
            }
          },
          widthRequest: winheight(1),
          heightRequest: winheight(1),
          children: /* @__PURE__ */ jsx(
            "box",
            {
              className: "sessioncontrols container",
              halign: default5.Align.CENTER,
              valign: default5.Align.CENTER,
              visible: true,
              children: /* @__PURE__ */ jsxs(
                "box",
                {
                  className: "sessioncontrols box",
                  valign: default5.Align.CENTER,
                  halign: default5.Align.CENTER,
                  spacing: 30,
                  visible: true,
                  children: [
                    SysButton2("lock", "Lock"),
                    SysButton2("logout", "Log Out"),
                    SysButton2("reboot", "Reboot"),
                    SysButton2("shutdown", "Shutdown")
                  ]
                }
              )
            }
          )
        }
      )
    }
  );
};

// src/modules/Windows/powerprofile.tsx
var powerprofile_default = () => /* @__PURE__ */ jsx(
  "window",
  {
    name: "powerprofiles",
    className: "pwrprofiles window",
    anchor: default2.WindowAnchor.TOP | default2.WindowAnchor.TOP,
    layer: default2.Layer.OVERLAY,
    exclusivity: default2.Exclusivity.NORMAL,
    keymode: default2.Keymode.EXCLUSIVE,
    visible: false,
    application: application_default,
    children: /* @__PURE__ */ jsx("eventbox", { onKeyPressEvent: (_, event) => {
      if (event.get_keyval()[1] === default6.KEY_Escape) {
        application_default.toggle_window("powerprofiles");
      }
    }, children: /* @__PURE__ */ jsx(powerprofiles_default, {}) })
  }
);

// src/main.ts
application_default.start({
  requestHandler(request, res) {
    switch (request) {
      case "i":
      case "inspect":
        application_default.inspector();
        return res("ok");
      case "q":
      case "quit":
        application_default.quit();
        return res("ok");
      default:
        return application_default.eval(request).then(res).catch(res);
    }
  },
  client(message, arg = "") {
    print(message(arg));
  },
  main() {
    Bar({ monitor: 0 });
    dashboard_default();
    MediaPlayerWindow();
    Calendar2();
    AudioMixer_default();
    notificationPopups_default(0);
    sessioncontrol_default();
    powerprofile_default();
  }
});

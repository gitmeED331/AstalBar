import { bind, Gtk, GObject, App, Variable, timeout, Widget } from "astal";
import { type IconProps } from "../../../node_modules/astal/src/widgets";
import { type LabelProps } from "../../../node_modules/astal/src/widgets";
//import type GObject from "gi://GObject?version=2.0"
import Icon, { Icons } from "../lib/icons";
import Pange from "gi://Pango"

export const opened = Variable("");
App.connect("window-toggled", (_, name: string, visible: boolean) => {
  if (name === "quicksettings" && !visible)
    timeout(500, () => (opened.value = ""));
});

export const Arrow = (name: string, activate?: false | (() => void)) => {
  let deg = 0;
  let iconOpened = false;
  const icon = <icon icon={icon.ui.arrow.right}.hook(opened, () => {
    if (
      (opened.value === name && !iconOpened) ||
      (opened.value !== name && iconOpened)
    ) {
      const step = opened.value === name ? 10 : -10;
      iconOpened = !iconOpened;
      for (let i = 0; i < 9; ++i) {
        timeout(15 * i, () => {
          deg += step;
          icon.setCss(`-gtk-icon-transform: rotate(${deg}deg);`);
        });
      }
    }
  });
  return Widget.Button({
    child: icon,
    className: "arrow",
    on_clicked: () => {
      opened.value = opened.value === name ? "" : name;
      if (typeof activate === "function") activate();
    },
  });
};

type ArrowToggleButtonProps = {
  name: string;
  icon: IconProps["icon"];
  label: LabelProps["label"];
  activate: () => void;
  deactivate: () => void;
  activateOnArrow?: boolean;
  connection: [GObject.Object, () => boolean];
};
export const ArrowToggleButton = ({
  name,
  icon,
  label,
  activate,
  deactivate,
  activateOnArrow = true,
  connection: [service, condition],
}: ArrowToggleButtonProps) =>
  Widget.Box({
    class_name: "toggle-button",
    setup: (self) =>
      self.hook(service, () => {
        self.toggleClassName("active", condition());
      }),
    children: [
      Widget.Button({
        child: Widget.Box({
          hexpand: true,
          children: [
            Widget.Icon({
              className: "icon",
              icon,
            }),
            Widget.Label({
              class_name: "label",
              max_width_chars: 10,
              truncate: "end",
              label,
            }),
          ],
        }),
        on_clicked: () => {
          if (condition()) {
            deactivate();
            if (opened.value === name) opened.value = "";
          } else {
            activate();
          }
        },
      }),
      Arrow(name, activateOnArrow && activate),
    ],
  });

type MenuProps = {
  name: string;
  icon: IconProps["icon"];
  title: LabelProps["label"];
  content: Gtk.Widget[];
};
export const Menu = ({ name, icon, title, content }: MenuProps) =>
  <revealer
    transitionType={"Gtk.RevealerTransion.SLIDE_DOWN"}
    reveal_child={bind(opened).as((v) => v === name)}
  >
    <box
      className={["menu", name].join(" ")}
      vertical={true}
    >
      <box
        className={"title-box"}
      >
        <icon
          className={"icon"}
          icon={ }
        />
        <label
          className={"title"}
          ellipsize={Pango.}
          label={title}
        />
      </box>
    </box>
    <Gtk.Separator />
    <box
      vertical={true}
      className={"content vertical"}
    >
      {content}
    </box>
  </box>
        </revealer >

  type SimpleToggleButtonProps = {
    icon: IconProps["icon"];
    label: LabelProps["label"];
    toggle: () => void;
    connection: [GObject.Object, () => boolean];
  };
export const SimpleToggleButton = ({
  icon,
  label,
  toggle,
  connection: [service, condition],
}: SimpleToggleButtonProps) =>
  Widget.Button({
    on_clicked: toggle,
    className: "simple-toggle",
    setup: (self) =>
      self.hook(service, () => {
        self.toggleClassName("active", condition());
      }),
    child: Widget.Box([
      Widget.Icon({ icon }),
      Widget.Label({
        max_width_chars: 10,
        truncate: "end",
        label,
      }),
    ]),
  });

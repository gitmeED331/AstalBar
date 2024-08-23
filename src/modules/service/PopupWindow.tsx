// import { Astal, Widget, App } from "astal";
// import { type WindowProps } from "../../../node_modules/astal/src/widgets";
// import { type RevealerProps } from "../../../node_modules/astal/src/widgets";
// import { type EventBoxProps } from "../../../node_modules/astal/src/widgets";
// import Gtk from "gi://Gtk?version=3.0";
// import Gdk from "gi://Gdk?version=3.0";
// const window = Widget;

// type Transition = RevealerProps["transitionType"] | keyof typeof Gtk.RevealerTransitionType;

// // Gtk.RevealerTransitionType.SLIDE_DOWN |
// // Gtk.RevealerTransitionType.SLIDE_UP |
// // Gtk.RevealerTransitionType.SLIDE_LEFT |
// // Gtk.RevealerTransitionType.SLIDE_RIGHT |
// // Gtk.RevealerTransitionType.CROSSFADE;

// type Child = WindowProps["child"];

// interface PopupWindowProps extends Omit<WindowProps, "name"> {
//   name: string;
//   layout?: keyof ReturnType<typeof Layout>;
//   transitionType?: Transition;
//   exclusivity?: Astal.Exclusivity.NORMAL
//   | Astal.Exclusivity.EXCLUSIVE
//   | Astal.Exclusivity.IGNORE;
//   anchor?: Astal.WindowAnchor.BOTTOM | Astal.WindowAnchor.TOP | Astal.WindowAnchor.LEFT | Astal.WindowAnchor.RIGHT;
//   passthrough?: boolean;
// }

// function setupRevealerHook(name: string) {
//   return (self: Gtk.Revealer) => {
//     App.connect(
//       "window-state-change",
//       (_: any, wname: string, visible: boolean) => {
//         if (wname === name) {
//           self.reveal_child = visible;
//         }
//       },
//     );
//   };
// };

// export const Padding = (
//   name: string,
//   { css = "", hexpand = true, vexpand = true }: EventBoxProps = {},
// ) => (
//   <eventbox
//     hexpand={hexpand}
//     vexpand={vexpand}
//     can_focus={false}
//     css={css}
//     setup={(w) =>
//       w.connect("button-press-event", () => App.toggle_window(name))
//     }
//   >
//     <box css={css} ></box>
//   </eventbox>
// );

// const PopupRevealer = (
//   name: string,
//   child: Child,
//   transition: Transition //= Gtk.RevealerTransitionType.SLIDE_DOWN
// ) => (
//   <box css={"padding: 1px;"}>
//     <revealer
//       transition-type={transition}
//       transition-duration={150}
//       setup={setupRevealerHook(name)}
//     >
//       <box className={"window-content"} >{child}</box>
//     </revealer>
//   </box>
// );

// const Layout = (name: string, child: Child, transition: Transition) => ({
//   "center": () => (
//     <centerbox>
//       {Padding(name)}
//       <centerbox vertical>
//         {Padding(name)}
//         {PopupRevealer(name, child, transition)}
//         {Padding(name)}
//       </centerbox>
//       {Padding(name)}
//     </centerbox>
//   ),
//   "top": () => (
//     <centerbox>
//       {Padding(name)}
//       <box vertical>
//         {PopupRevealer(name, child, transition)}
//         {Padding(name)}
//       </box>
//       {Padding(name)}
//     </centerbox>
//   ),
//   "top-right": () => (
//     <box>
//       {Padding(name)}
//       <box hexpand={false} vertical>
//         {PopupRevealer(name, child, transition)}
//         {Padding(name)}
//       </box>
//     </box>
//   ),
//   "top-center": () => (
//     <box>
//       {Padding(name)}
//       <box hexpand={false} vertical>
//         {PopupRevealer(name, child, transition)}
//         {Padding(name)}
//       </box>
//       {Padding(name)}
//     </box>
//   ),
//   "top-left": () => (
//     <box>
//       <box vertical hexpand={false}>
//         {PopupRevealer(name, child, transition)}
//         {Padding(name)}
//       </box>
//       {Padding(name)}
//     </box>
//   ),
//   "bottom-left": () => (
//     <box>
//       <box hexpand={false} vertical>
//         {Padding(name)}
//         {PopupRevealer(name, child, transition)}
//       </box>
//       {Padding(name)}
//     </box>
//   ),
//   "bottom-center": () => (
//     <box>
//       {Padding(name)}
//       <box hexpand={false} vertical>
//         {Padding(name)}
//         {PopupRevealer(name, child, transition)}
//       </box>
//       {Padding(name)}
//     </box>
//   ),
//   "bottom-right": () => (
//     <box>
//       {Padding(name)}
//       <box hexpand={false} vertical>
//         {Padding(name)}
//         {PopupRevealer(name, child, transition)}
//       </box>
//     </box>
//   ),
// });

// const PopupWindow = ({
//   name,
//   child,
//   layout = "center",
//   transitionType,
//   exclusivity = Astal.Exclusivity.IGNORE,
//   anchor,
//   ...props
// }: PopupWindowProps) => {
//   return (
//     <window
//       name={name}
//       className={[name, "popup-window"].join(" ")}
//       visible={false}
//       keymode={Astal.Keymode.ON_DEMAND}
//       application={App}
//       exclusivity={exclusivity}
//       layer={Astal.Layer.OVERLAY}
//       anchor={anchor}
//       type={Gtk.WindowType.TOPLEVEL}
//       {...props}
//     >
//       {Layout(name, child, transitionType)[layout]()}
//     </window>
//   );
// };

// export default PopupWindow;


import { Astal, Widget, App } from "astal";
import { type WindowProps } from "astal/widgets";
import { type RevealerProps } from "astal/widgets";
import { type EventBoxProps } from "astal/widgets";
import Gtk from "gi://Gtk?version=3.0";
import Gdk from "gi://Gdk?version=3.0";

type Type = {
  name: string;
  child: any;
  showClassName?: string;
  hideClassName?: string;
};

interface PopupWindowProps extends Omit<WindowProps, "name"> {
  name: string;
  exclusivity?: Astal.Exclusivity.NORMAL
  | Astal.Exclusivity.EXCLUSIVE
  | Astal.Exclusivity.IGNORE;
  anchor?: Astal.WindowAnchor.BOTTOM | Astal.WindowAnchor.TOP | Astal.WindowAnchor.LEFT | Astal.WindowAnchor.RIGHT;
}
export default ({
  name,
  child,
  exclusivity = Astal.Exclusivity.IGNORE,
  ...props
}: PopupWindowProps) => <window<Gtk.Widget>
  name={name}
  className={[name, "popup-window"].join(" ")}
  setup={
    w => w.connect("key-press-event", (w, event) => {
      if (event.key === Gdk.KEY_Escape) {
        App.toggle_window(name);
      }
    })
  }
  visible={false}
  keymode={Astal.Keymode.NONE}
  exclusivity={exclusivity}
  layer={Astal.Layer.TOP}
  anchor={Astal.WindowAnchor.BOTTOM | Astal.WindowAnchor.TOP | Astal.WindowAnchor.LEFT | Astal.WindowAnchor.RIGHT}
  type={Gtk.WindowType.TOPLEVEL}
  {...props}
>
    {child}
  </window >
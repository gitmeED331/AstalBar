import { App, Variable, Astal, bind, Gdk } from "astal";

export default function Clock() {
  const time = Variable("").poll(1000, 'date "+%a %b %d %H:%M:%S"');
  return (
    <button
      className="clock"
      cursor="pointer"
      onClick={(_, event) => {
        if (event.button === Gdk.BUTTON_PRIMARY) {
          const win = App.get_window("calendar");
          if (win) {
            win.visible = !win.visible;
          }
        }
        // else if (event.button === Gdk.BUTTON_SECONDARY) {

        // } else if (event.button === Gdk.BUTTON_MIDDLE) {

        // }
      }}
    >
      <label label={bind(time)} />
    </button>
  );
}

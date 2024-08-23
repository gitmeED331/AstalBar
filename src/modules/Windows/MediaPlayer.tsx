import { Widget, App, bind, Astal, Gtk } from "astal";
import Mpris from "gi://AstalMpris";
import Pango from "gi://Pango";
import { Player } from "../Widgets/index";
import PopupWindow from "../service/PopupWindow";

//const { RoundedCorner } = Roundedges

const player = Mpris.Player.new("Deezer")

export default function MediaPlayerWindow() {
  return (
    <window
      name={"mediaplayerwindow"}
      className={"window media-player"}
      anchor={Astal.WindowAnchor.TOP | Astal.WindowAnchor.RIGHT}
      layer={Astal.Layer.OVERLAY}
      exclusivity={Astal.Exclusivity.NORMAL}
      keymode={Astal.Keymode.NONE}
      visible={false}
      application={App}
      margin-right={90}
      margin-top={125}
      clickThrough={true}
    >
      <box className={"mediaplayerbox"}>
        <Player player={player} />
      </box>
    </window>
  );
}

//   {players.watch([], [
//                 [Mpris, "player-changed"],
//                 [Mpris, "player-added"],
//                 [Mpris, "player-closed"],
//             ], () => Mpris.players)
//                 .transform(p => p.filter(p => p.play_back_status !== 'Stopped').map(Player))
//             }

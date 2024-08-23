import { execAsync, Widget, Astal, GLib, App, Gtk, Gdk, bind, Variable } from "astal"
import { Arrow, Menu } from "../buttons/ToggleButton";
import Icon, { Icons } from "../lib/icons";
import Wp from "gi://AstalWp";
import Pango from "gi://Pango";

const { audio } = Wp.get_default_wp()
const Speaker = audio.get_default_speaker()
const Microphone = audio.get_default_microphone()




const volumeIndicatorClassName = () => {
    const classes = ["audio mixer volume-indicator"];
    if (Speaker?.get_mute()) {
        classes.push("muted");
    }
    const className = classes.join(" ");
    return className;
};

function speakerIcon() {
    const tp = Variable.derive(
        [bind(Speaker, "volume"), bind(Speaker, "mute")],
        (v, m) => m ? "Muted" : `Volume ${(v * 100).toFixed(2)}%`,
    )

    return (
        <button
            tooltip_text={bind(tp)}
            className={["audio-mixer", "speaker-icon", volumeIndicatorClassName()].join(" ")}
            onClick={(_, event) => {
                if (event.button === Gdk.BUTTON_PRIMARY) {
                    Speaker?.set_mute(!Speaker.get_mute());
                }
                // if (event.button === Gdk.BUTTON_SECONDARY) {
                // }
            }}
        >
            <icon icon={bind(Speaker, "volume_icon")} />
        </button>
    );
}

function speakerSlider() {

    return (
        <slider
            className={"audio-mixer speaker-slider Slider"}
            hexpand={true}
            drawValue={false}
            min={0}
            max={1.5}
            value={bind(Speaker, "volume")}
            onDragged={({ value, dragging }) => {
                if (dragging) {
                    Speaker?.set_volume(value);
                    Speaker?.set_mute(false)
                }
            }}
        />
    )
}

function microphoneIcon() {
    const tp = Variable.derive(
        [bind(Microphone, "volume"), bind(Microphone, "mute")],
        (v, m) => m ? "Muted" || 0 : `Volume ${(v * 100).toFixed(2)}%`,
    )

    return (
        <button
            tooltip_text={bind(tp)}
            className={["audio-mixer", "microphone", volumeIndicatorClassName()].join(" ")}
            onClick={(_, event) => {
                if (event.button === Gdk.BUTTON_PRIMARY) {
                    Microphone?.set_mute(!Microphone?.get_mute());
                }
                // if (event.button === Gdk.BUTTON_SECONDARY) {
                // }
            }}
        >
            <icon icon={bind(Microphone, "volume_icon")} />
        </button>
    );
}
function microphoneSlider() {
    return (
        <slider
            className={"audio-mixer microphone-slider Slider"}
            hexpand={true}
            drawValue={false}
            min={0}
            max={1}
            value={bind(Microphone, 'volume')}
            visible={true}
            onDragged={({ value, dragging }) => {
                if (dragging) {
                    Microphone?.set_volume(value)
                    Microphone?.set_mute(false)
                }
            }}
        />
    )
}

function SettingsButton() {
    return (
        <button
            className={"audio-mixer settings-button"}
            onClick={() => {
                execAsync("pavucontrol")
            }}
            hexpand={true}
            halign={Gtk.Align.END}
            valign={Gtk.Align.START}
        >
            <icon icon={Icon.ui.settings} />
        </button>
    )
}

function VolumeSlider() {
    return (
        <box
            className={"audio-mixer mixer-slider"}
            vertical={true}
            vexpand={true}
        >
            <box>
                {speakerIcon()}
                {speakerSlider()}
            </box>
            <box>
                {microphoneIcon()}
                {microphoneSlider()}
            </box>
        </box>
    )
}

export default function AudioMixer() {
    return (
        <box vertical={true} className={"audio-mixer container"} >
            {VolumeSlider()}
            {SettingsButton()}
        </box>
    )
}

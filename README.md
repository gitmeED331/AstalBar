## This is a work in progress.

https://github.com/user-attachments/assets/c80fd1b5-7d66-4ecb-87ad-b08b3d813149

The folder structure is a mess and will be cleaned up at a later time, when I reach a point I have every feature I want.

Many of the files are not being used and will not be used, they will be removed later, they remain until I reach a point I am happy with my setup.

# Elements of this project:
- [] Overview
  - Status: in progress
- [X] Title box
- [] Notifications
    - Status: nearly complete
    - Issues:
        - [] making it so notification timeout does not dismiss the notification
        - [] improve styling
- [] Media Ticker & Player Popup:
  - Status: nearly complete
    - Issues:
    - [] popup window (auto close on click off)
    - [] progress bar not working due to issue with player.length
- []System app Tray
  - status: nearly complete
  - issues:
    - [ ] Need to find a way for specific "favorite" or "always show" apps so I can shrink the bar but keep the ones I use most always visible
- [ ] System Info Tray
  - Status: nearly complete
  - issues:
    - [X] Reactive Volume icon with popup window sliders
      - [] added app mixer and sink selector
    - [ ] need to finish network control
    - [ ] need to finish bluetooth control
- [X] Date/Clock & Calendar Popup
- [X] Dashboard Button & Dashboard
  - Status: complete
  - Issues:
    - popup window
      - [X] auto close on click off
- [] Lockscreen
- [X] Session Control window
- [] Greeter (greetd)
- Theming/Styling
  - Status: almost complete
  - Issues:
    - [ ] Need to consolidate and refine (eliminate duplicate code)

**I am running Arch Linux**

## Required apps/packages (all found in main repository and AUR)
- pavucontrol
- pipewire-pulse
- light (for screen brightness control)
- mpd/mpris
- power-profiles-daemon
- upower

A gigantic thanks to Aylur and Kotontrion for all their work and help!

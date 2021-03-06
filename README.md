# Discord Radio Bot
a discord bot to experiment with node, and try some weird stuff with audio output


## included config: 

**Works on:**

- Linux (via PulseAudio `pulse`)
- Windows (via DirectShow `dshow`)

## Usage

```bash
# Clone the main @discordjs/voice repo, then install dependencies and build
$ npm install
$ npm run build

# Enter this example's directory, create a config file and start!
$ cd examples/radio-bot
$ npm install
$ nano config.json
$ npm start

# Join a voice channel in Discord, then send "-join"
```

## Configuring on Windows via `dshow`

Run `ffmpeg -list_devices true -f dshow -i dummy` and observe output containing something similar:

```
DirectShow audio devices
 "Stereo Mix (Realtek(R) Audio)"
    Alternative name "@device_cm_{ID1}\wave_{ID2}"
```

For example, playing the above device will mirror audio from the speaker output of your machine. Your `config.json` should then be considered like so:

```json
{
  "token": "discord_bot_token",
  "device": "Stereo Mix (Realtek(R) Audio)",
  "type": "dshow",
  "maxTransmissionGap": 5000
}
```

## Configuring on Linux via `pulse`

Run `pactl list short sources` and observe output containing something similar:

```
5   alsa_output.pci.3.analog-stereo.monitor   module-alsa-card.c   s16le 2ch 44100Hz   IDLE
```

Then configure your `config.json` with the device you'd like to use:

```json
{
  "token": "discord_bot_token",
  "device": "alsa_output.pci.3.analog-stereo.monitor",
  "type": "pulse",
  "maxTransmissionGap": 5000
}
```

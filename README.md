[![badge](https://img.shields.io/twitter/follow/teyuto?style=social)](https://twitter.com/intent/follow?screen_name=teyuto) &nbsp; [![badge](https://img.shields.io/github/stars/Teyuto/teyuto-player-sdk?style=social)](https://github.com/Teyuto/teyuto-player-sdk)

![](https://github.com/Teyuto/.github/blob/production/assets/img/banner.png?raw=true)

<h1 align="center">Teyuto Player Analytics SDK</h1>

[Teyuto](https://teyuto.com) provides a seamless solution for managing all your video distribution needs. Whether you require video distribution in the cloud, on OTT platforms, storage, public OTT platform distribution, or secure intranet distribution, Teyuto puts everything at your fingertips, making the management of your video content effortless.

## Overview

Teyuto Player Analytics SDK enables easy integration of analytics tracking for video playback using Video.js, HLS.js, Plyr, or Shaka Player.

## Compatible Players
<p align="center">
  <img src="https://videojs.com/logo-white.png" alt="Video.js" height="50">
  &nbsp;&nbsp;&nbsp;&nbsp;
  <img src="https://raw.githubusercontent.com/video-dev/hls.js/master/docs/logo.svg" alt="HLS.js" height="50">
  &nbsp;&nbsp;&nbsp;&nbsp;
  <font size="15" color="#00b2ff">Plyr</font>
  &nbsp;&nbsp;&nbsp;&nbsp;
  <img src="https://github.com/shaka-project/shaka-player/raw/main/docs/shaka-player-logo.png" alt="Shaka Player" height="50">
</p>

## Installation

### Option 1: Script Tag

Include the SDK in your HTML:

```html
<script src="https://cdn.jsdelivr.net/gh/Teyuto/teyuto-player-analytics-sdk@production/src/TeyutoPlayerAnalytics.min.js"></script>
```

or

```html
<script src="path/to/TeyutoPlayerAnalytics.js"></script>
```

### Option 2: As a Module

Install via npm:

```bash
npm install teyuto-player-analytics
```

## Usage

### As a Module

#### With Video.js

```javascript
import { TeyutoVideoJsAdapter } from 'teyuto-player-analytics';

const player = videojs('my-video');
const analytics = new TeyutoVideoJsAdapter('your-channel-public', 'user-token');
analytics.init(player, 'video-id');

// Clean up
window.addEventListener('beforeunload', () => {
  analytics.destroy();
  player.dispose();
});
```

#### With HLS.js

```javascript
import { TeyutoHlsJsAdapter } from 'teyuto-player-analytics';

const video = document.getElementById('video');
const hls = new Hls();
hls.loadSource('https://example.com/video.m3u8');
hls.attachMedia(video);

const analytics = new TeyutoHlsJsAdapter('your-channel-public', 'user-token');
analytics.init(hls, 'video-id');

// Clean up
window.addEventListener('beforeunload', () => {
  analytics.destroy();
  hls.destroy();
});
```

#### With Plyr

```javascript
import { TeyutoPlyrAdapter } from 'teyuto-player-analytics';

const player = new Plyr('#player');
const analytics = new TeyutoPlyrAdapter('your-channel-public', 'user-token');
analytics.init(player, 'video-id');

// Clean up
window.addEventListener('beforeunload', () => {
  analytics.destroy();
  player.destroy();
});
```

#### With Shaka Player

```javascript
import { TeyutoShakaPlayerAdapter } from 'teyuto-player-analytics';

const video = document.getElementById('video');
const player = new shaka.Player(video);
const analytics = new TeyutoShakaPlayerAdapter('your-channel-public', 'user-token');
analytics.init(player, 'video-id');

// Clean up
window.addEventListener('beforeunload', () => {
  analytics.destroy();
  player.destroy();
});
```

### Without Module (Using Script Tag)

When using the SDK via a script tag, all adapters are available under the global `TeyutoPlayerAnalytics` object.

#### With Video.js

```html
<script src="path/to/TeyutoPlayerAnalytics.js"></script>
<script>
  const player = videojs('my-video');
  const analytics = new TeyutoPlayerAnalytics.TeyutoVideoJsAdapter('your-channel-public', 'user-token');
  analytics.init(player, 'video-id');

  // Clean up
  window.addEventListener('beforeunload', () => {
    analytics.destroy();
    player.dispose();
  });
</script>
```

#### With HLS.js

```html
<script src="path/to/TeyutoPlayerAnalytics.js"></script>
<script>
  const video = document.getElementById('video');
  const hls = new Hls();
  hls.loadSource('https://example.com/video.m3u8');
  hls.attachMedia(video);

  const analytics = new TeyutoPlayerAnalytics.TeyutoHlsJsAdapter('your-channel-public', 'user-token');
  analytics.init(hls, 'video-id');

  // Clean up
  window.addEventListener('beforeunload', () => {
    analytics.destroy();
    hls.destroy();
  });
</script>
```

#### With Plyr

```html
<script src="path/to/TeyutoPlayerAnalytics.js"></script>
<script>
  const player = new Plyr('#player');
  const analytics = new TeyutoPlayerAnalytics.TeyutoPlyrAdapter('your-channel-public', 'user-token');
  analytics.init(player, 'video-id');

  // Clean up
  window.addEventListener('beforeunload', () => {
    analytics.destroy();
    player.destroy();
  });
</script>
```

#### With Shaka Player

```html
<script src="path/to/TeyutoPlayerAnalytics.js"></script>
<script>
  const video = document.getElementById('video');
  const player = new shaka.Player(video);
  const analytics = new TeyutoPlayerAnalytics.TeyutoShakaPlayerAdapter('your-channel-public', 'user-token');
  analytics.init(player, 'video-id');

  // Clean up
  window.addEventListener('beforeunload', () => {
    analytics.destroy();
    player.destroy();
  });
</script>
```

## API Reference

All adapters (TeyutoVideoJsAdapter, TeyutoHlsJsAdapter, TeyutoPlyrAdapter, and TeyutoShakaPlayerAdapter) have the following methods:

- `constructor(channel, token)`: Initialize with your channel (required) and user token (optional).
- `init(player, videoId)`: Start tracking for a specific player and video.
- `destroy()`: Clean up resources and stop tracking.

## Important Notes

- The `channel` parameter is required and represents your Teyuto channel identifier.
- The `token` parameter is optional and represents the token of the user you want to track. This allows you to associate the viewing analytics with a specific user in your system.
- If you don't provide a token, the analytics will still be tracked, but without user-specific information.

## Troubleshooting

If analytics data isn't appearing:

1. Check console for errors.
2. Verify that you've provided a valid channel identifier.
3. If using user tracking, verify the user token.
4. Ensure the video ID is correct.
5. Verify that player events (play, pause, ended) are triggering correctly.

## Support

For issues or questions, contact Teyuto support at support@teyuto.com or open an issue in this repository.
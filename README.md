[![badge](https://img.shields.io/twitter/follow/teyuto?style=social)](https://twitter.com/intent/follow?screen_name=teyuto) &nbsp; [![badge](https://img.shields.io/github/stars/Teyuto/teyuto-player-sdk?style=social)](https://github.com/Teyuto/teyuto-player-sdk)
![](https://github.com/Teyuto/.github/blob/production/assets/img/banner.png?raw=true)
<h1 align="center">Teyuto Player Analytics SDK</h1>

[Teyuto](https://teyuto.com) provides a seamless solution for managing all your video distribution needs. Whether you require video distribution in the cloud, on OTT platforms, storage, public OTT platform distribution, or secure intranet distribution, Teyuto puts everything at your fingertips, making the management of your video content effortless.

## Overview

Teyuto Player Analytics SDK enables easy integration of analytics tracking for video playback using Video.js or HLS.js players.

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

### With Video.js

```javascript
// If using as a module
import { VideoJsAdapter } from 'teyuto-player-analytics';
// If using script tag, use TeyutoPlayerAnalytics.VideoJsAdapter instead

const player = videojs('my-video');
const analytics = new VideoJsAdapter('your-auth-token-here');
analytics.init(player, 'your-video-id-here');

// Clean up
window.addEventListener('beforeunload', () => {
    analytics.destroy();
    player.dispose();
});
```

### With HLS.js

```javascript
// If using as a module
import { HlsJsAdapter } from 'teyuto-player-analytics';
// If using script tag, use TeyutoPlayerAnalytics.HlsJsAdapter instead

const video = document.getElementById('video');
const hls = new Hls();
hls.loadSource('https://example.com/video.m3u8');
hls.attachMedia(video);

const analytics = new HlsJsAdapter('your-auth-token-here');
analytics.init(hls, 'your-video-id-here');

// Clean up
window.addEventListener('beforeunload', () => {
    analytics.destroy();
    hls.destroy();
});
```

## API Reference

Both `VideoJsAdapter` and `HlsJsAdapter` have the following methods:

- `constructor(token)`: Initialize with your authentication token.
- `init(player, videoId)`: Start tracking for a specific player and video.
- `destroy()`: Clean up resources and stop tracking.


## Troubleshooting

If analytics data isn't appearing:

1. Check console for errors.
2. Verify authentication token and video ID.
3. Ensure player events (play, pause, ended) are triggering correctly.

## Support

For issues or questions, contact Teyuto support at support@teyuto.com or open an issue in this repository.
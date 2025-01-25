// videoPlayer.js
import videojs from 'video.js';
import { TeyutoVideoJsAdapter } from '@teyuto/teyuto-player-analytics';

export class VideoPlayer {
  constructor(elementId, videoUrl) {
    this.player = videojs(elementId);
    this.analytics = null;
    this.setupVideo(videoUrl);
    this.setupAnalytics();
  }

  setupAnalytics() {
    this.analytics = new TeyutoVideoJsAdapter(
      'your-channel-public',
      'user-token'
    );
    this.analytics.init(this.player, 'video-id');
  }

  destroy() {
    this.analytics?.destroy();
    this.player?.dispose();
  }
}

const player = new VideoPlayer('my-video');
window.addEventListener('beforeunload', () => player.destroy());
// TeyutoPlayerAnalytics.js

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
      // AMD. Register as an anonymous module.
      define([], factory);
  } else if (typeof module === 'object' && module.exports) {
      // Node. Does not work with strict CommonJS, but
      // only CommonJS-like environments that support module.exports,
      // like Node.
      module.exports = factory();
  } else {
      // Browser globals (root is window)
      root.TeyutoPlayerAnalytics = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {

  class TeyutoPlayerAnalytics {
      constructor(token) {
          this.token = token;
          this.apiUrl = 'https://api.teyuto.tv/v1';
          this.videoId = null;
          this.player = null;
          this.currentAction = null;
          this.secondsPlayed = 0;
          this.updateInterval = null;
          this.firstTimeEnter = true;
      }

      init(player, videoId) {
          this.player = player;
          this.videoId = videoId;
          this.attachEventListeners();
          this.startUpdateInterval();
      }

      attachEventListeners() {
          // This method is implemented in the subclasses
      }

      startUpdateInterval() {
          this.updateInterval = setInterval(() => {
              this.incrementSeconds();
          }, 500);
      }

      incrementSeconds() {
          if (this.isPlaying()) {
              this.secondsPlayed += 0.5;
              if (this.secondsPlayed >= 20) {
                  this.updateTimeVideo(this.getCurrentTime(), 0);
                  this.secondsPlayed = 0;
              }
          }
      }

      updateTimeVideo(time, end) {
          fetch(`${this.apiUrl}/video/?f=action_update`, {
              method: 'POST',
              body: JSON.stringify({
                  id: this.videoId,
                  time: time,
                  action: this.currentAction,
                  end: end,
                  sp: this.secondsPlayed
              }),
              headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `${this.token}`
              }
          });
      }

      timeEnter(time) {
          fetch(`${this.apiUrl}/video/?f=action_enter`, {
              method: 'POST',
              body: JSON.stringify({
                  id: this.videoId,
                  time: time,
                  firstTime: this.firstTimeEnter ? 1 : 0
              }),
              headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `${this.token}`
              }
          })
          .then(response => response.json())
          .then(data => {
              this.currentAction = data[0].action;
              this.firstTimeEnter = false;
          });
      }

      onPlay() {
          this.timeEnter(this.getCurrentTime());
      }

      onPause() {
          this.updateTimeVideo(this.getCurrentTime(), 1);
      }

      onEnded() {
          this.updateTimeVideo(this.getDuration(), 1);
      }

      isPlaying() {
          throw new Error('isPlaying method must be implemented in subclass');
      }

      getCurrentTime() {
          throw new Error('getCurrentTime method must be implemented in subclass');
      }

      getDuration() {
          throw new Error('getDuration method must be implemented in subclass');
      }

      destroy() {
          clearInterval(this.updateInterval);
      }
  }

  class VideoJsAdapter extends TeyutoPlayerAnalytics {
    attachEventListeners() {
        // console.log('Attaching event listeners for Video.js');
        this.player.on('play', this.onPlay.bind(this));
        this.player.on('pause', this.onPause.bind(this));
        this.player.on('ended', this.onEnded.bind(this));
        this.player.on('loadedmetadata', () => {
            // console.log('Video.js: Metadata loaded');
        });
    }

    onPlay() {
        // console.log('Video.js: Play event triggered');
        super.onPlay();
    }

    onPause() {
        // console.log('Video.js: Pause event triggered');
        super.onPause();
    }

    onEnded() {
        // console.log('Video.js: Ended event triggered');
        super.onEnded();
    }

    isPlaying() {
        const playing = !this.player.paused();
        // console.log('Video.js: isPlaying:', playing);
        return playing;
    }

    getCurrentTime() {
        const time = this.player.currentTime();
        // console.log('Video.js: getCurrentTime:', time);
        return time;
    }

    getDuration() {
        const duration = this.player.duration();
        // console.log('Video.js: getDuration:', duration);
        return duration;
    }

    destroy() {
        // console.log('Video.js: Destroying adapter');
        super.destroy();
        this.player.off('play', this.onPlay);
        this.player.off('pause', this.onPause);
        this.player.off('ended', this.onEnded);
    }
}

  class HlsJsAdapter extends TeyutoPlayerAnalytics {
    attachEventListeners() {
        // console.log('Attaching event listeners for HLS.js');
        this.player.on(Hls.Events.MEDIA_ATTACHED, () => {
            // console.log('HLS.js: Media attached');
        });
        this.player.on(Hls.Events.MANIFEST_PARSED, () => {
            // console.log('HLS.js: Manifest parsed');
        });
        this.player.on(Hls.Events.LEVEL_LOADED, () => {
            // console.log('HLS.js: Level loaded');
        });
        this.player.media.addEventListener('play', this.onPlay.bind(this));
        this.player.media.addEventListener('pause', this.onPause.bind(this));
        this.player.media.addEventListener('ended', this.onEnded.bind(this));
    }

    onPlay() {
        console.log('HLS.js: Play event triggered');
        super.onPlay();
    }

    onPause() {
        // console.log('HLS.js: Pause event triggered');
        super.onPause();
    }

    onEnded() {
        // console.log('HLS.js: Ended event triggered');
        super.onEnded();
    }

    isPlaying() {
        const playing = !this.player.media.paused;
        // console.log('HLS.js: isPlaying:', playing);
        return playing;
    }

    getCurrentTime() {
        const time = this.player.media.currentTime;
        // console.log('HLS.js: getCurrentTime:', time);
        return time;
    }

    getDuration() {
        const duration = this.player.media.duration;
        // console.log('HLS.js: getDuration:', duration);
        return duration;
    }

    destroy() {
        // console.log('HLS.js: Destroying adapter');
        super.destroy();
        this.player.media.removeEventListener('play', this.onPlay);
        this.player.media.removeEventListener('pause', this.onPause);
        this.player.media.removeEventListener('ended', this.onEnded);
    }
}

  return {
      VideoJsAdapter: VideoJsAdapter,
      HlsJsAdapter: HlsJsAdapter
  };
}));
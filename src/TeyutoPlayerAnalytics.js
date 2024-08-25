// TeyutoPlayerAnalytics.js
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        root.TeyutoPlayerAnalytics = factory();
    }
}(typeof self !== 'undefined' ? self : this, function () {

    class TeyutoPlayerAnalytics {
        constructor(channel, token = null) {
            if (!channel) {
                throw new Error('Channel is required');
            }
            this.channel = channel;
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
            const formData = new FormData();
            formData.append('id', this.videoId);
            formData.append('time', time);
            formData.append('action', this.currentAction);
            formData.append('end', end);
            formData.append('sp', this.secondsPlayed);

            const headers = {
                'channel': `${this.channel}`
            };
            
            if (this.token) {
                headers['Authorization'] = `${this.token}`;
            }

            fetch(`${this.apiUrl}/video/?f=action_update`, {
                method: 'POST',
                body: formData,
                headers: headers
            });
        }

        timeEnter(time) {
            const formData = new FormData();
            formData.append('id', this.videoId);
            formData.append('time', time);
            formData.append('firstTime', this.firstTimeEnter ? 1 : 0);

            const headers = {
                'channel': `${this.channel}`
            };
            
            if (this.token) {
                headers['Authorization'] = `${this.token}`;
            }

            fetch(`${this.apiUrl}/video/?f=action_enter`, {
                method: 'POST',
                body: formData,
                headers: headers
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

    class TeyutoVideoJsAdapter extends TeyutoPlayerAnalytics {
        attachEventListeners() {
            this.player.on('play', this.onPlay.bind(this));
            this.player.on('pause', this.onPause.bind(this));
            this.player.on('ended', this.onEnded.bind(this));
            this.player.on('loadedmetadata', () => {
                // console.log('Video.js: Metadata loaded');
            });
        }

        isPlaying() {
            return !this.player.paused();
        }

        getCurrentTime() {
            return this.player.currentTime();
        }

        getDuration() {
            return this.player.duration();
        }

        destroy() {
            super.destroy();
            this.player.off('play', this.onPlay);
            this.player.off('pause', this.onPause);
            this.player.off('ended', this.onEnded);
        }
    }

    class TeyutoHlsJsAdapter extends TeyutoPlayerAnalytics {
        attachEventListeners() {
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

        isPlaying() {
            return !this.player.media.paused;
        }

        getCurrentTime() {
            return this.player.media.currentTime;
        }

        getDuration() {
            return this.player.media.duration;
        }

        destroy() {
            super.destroy();
            this.player.media.removeEventListener('play', this.onPlay);
            this.player.media.removeEventListener('pause', this.onPause);
            this.player.media.removeEventListener('ended', this.onEnded);
        }
    }

    class TeyutoPlyrAdapter extends TeyutoPlayerAnalytics {
        attachEventListeners() {
            this.player.on('play', this.onPlay.bind(this));
            this.player.on('pause', this.onPause.bind(this));
            this.player.on('ended', this.onEnded.bind(this));
            this.player.on('loadedmetadata', () => {
                // console.log('Plyr: Metadata loaded');
            });
        }

        isPlaying() {
            return this.player.playing;
        }

        getCurrentTime() {
            return this.player.currentTime;
        }

        getDuration() {
            return this.player.duration;
        }

        destroy() {
            super.destroy();
            this.player.off('play', this.onPlay);
            this.player.off('pause', this.onPause);
            this.player.off('ended', this.onEnded);
        }
    }

    class TeyutoShakaPlayerAdapter extends TeyutoPlayerAnalytics {
        attachEventListeners() {
            this.player.addEventListener('play', this.onPlay.bind(this));
            this.player.addEventListener('pause', this.onPause.bind(this));
            this.player.addEventListener('ended', this.onEnded.bind(this));
            this.player.addEventListener('loaded', () => {
                // console.log('Shaka Player: Video loaded');
            });
        }

        isPlaying() {
            return !this.player.paused;
        }

        getCurrentTime() {
            return this.player.currentTime;
        }

        getDuration() {
            return this.player.duration;
        }

        destroy() {
            super.destroy();
            this.player.removeEventListener('play', this.onPlay);
            this.player.removeEventListener('pause', this.onPause);
            this.player.removeEventListener('ended', this.onEnded);
        }
    }

    return {
        TeyutoVideoJsAdapter: TeyutoVideoJsAdapter,
        TeyutoHlsJsAdapter: TeyutoHlsJsAdapter,
        TeyutoPlyrAdapter: TeyutoPlyrAdapter,
        TeyutoShakaPlayerAdapter: TeyutoShakaPlayerAdapter
    };
}));
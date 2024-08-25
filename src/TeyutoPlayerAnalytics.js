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
        constructor(channel, token = null) {
            super(channel, token);
            this.retryInterval = null;
            this.maxRetries = 10;
            this.retryCount = 0;
        }
    
        attachEventListeners() {
            console.log('Attempting to attach Shaka Player event listeners');
            this.tryAttachListeners();
        }
    
        tryAttachListeners() {
            const videoElement = this.player.getMediaElement();
            if (videoElement) {
                console.log('Video element found, attaching listeners');
                this.attachListenersToVideo(videoElement);
                if (this.retryInterval) {
                    clearInterval(this.retryInterval);
                }
            } else {
                console.log('Video element not found, will retry');
                if (!this.retryInterval) {
                    this.retryInterval = setInterval(() => {
                        this.retryCount++;
                        if (this.retryCount > this.maxRetries) {
                            console.error('Max retries reached, unable to attach listeners');
                            clearInterval(this.retryInterval);
                            return;
                        }
                        this.tryAttachListeners();
                    }, 500); // retry
                }
            }
        }
    
        attachListenersToVideo(videoElement) {
            videoElement.addEventListener('play', () => {
                // console.log('Video started playing');
                this.onPlay();
            });
    
            videoElement.addEventListener('pause', () => {
                // console.log('Video paused');
                this.onPause();
            });
    
            videoElement.addEventListener('ended', () => {
                // console.log('Video ended');
                this.onEnded();
            });
    
            videoElement.addEventListener('loadedmetadata', () => {
                // console.log('Video metadata loaded');
            });
    
            // Aggiungi listener per eventi specifici di Shaka Player, se necessario
            this.player.addEventListener('error', (event) => {
                // console.error('Shaka Player: Error event', event);
            });
    
            // console.log('All event listeners attached successfully');
        }
    
        isPlaying() {
            const videoElement = this.player.getMediaElement();
            return videoElement ? !videoElement.paused : false;
        }
    
        getCurrentTime() {
            const videoElement = this.player.getMediaElement();
            return videoElement ? videoElement.currentTime : 0;
        }
    
        getDuration() {
            const videoElement = this.player.getMediaElement();
            return videoElement ? videoElement.duration : 0;
        }
    
        destroy() {
            super.destroy();
            // console.log('Removing Shaka Player event listeners');
            if (this.retryInterval) {
                clearInterval(this.retryInterval);
            }
            const videoElement = this.player.getMediaElement();
            if (videoElement) {
                videoElement.removeEventListener('play', this.onPlay);
                videoElement.removeEventListener('pause', this.onPause);
                videoElement.removeEventListener('ended', this.onEnded);
            }
            this.player.removeEventListener('error', this.onError);
        }
    }

    return {
        TeyutoVideoJsAdapter: TeyutoVideoJsAdapter,
        TeyutoHlsJsAdapter: TeyutoHlsJsAdapter,
        TeyutoPlyrAdapter: TeyutoPlyrAdapter,
        TeyutoShakaPlayerAdapter: TeyutoShakaPlayerAdapter
    };
}));
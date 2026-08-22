class SpotifyComponent extends HTMLElement {
    constructor() {
        super();
        this.spotifyData = null;
        this.progressInterval = null;
        this.spotifyPollInterval = null;
        this.lanyardSocket = null;
        this.lanyardHeartbeat = null;
        this.lastKnownTrack = null;
    }

    connectedCallback() {
        this.loadSpotifyData();
        this.onLanguageChange = () => this.renderCard();
        window.addEventListener('languageChanged', this.onLanguageChange);
    }

    disconnectedCallback() {
        if (this.progressInterval) clearInterval(this.progressInterval);
        if (this.spotifyPollInterval) clearInterval(this.spotifyPollInterval);
        if (this.lanyardHeartbeat) clearInterval(this.lanyardHeartbeat);
        if (this.lanyardSocket) {
            try { this.lanyardSocket.close(); } catch (e) {}
        }
        window.removeEventListener('languageChanged', this.onLanguageChange);
    }

    async loadSpotifyData() {
        try {
            const response = await fetch('src/data/spotify.json');
            if (!response.ok) throw new Error('Gagal memuat spotify.json');
            this.spotifyData = await response.json();

            // 1. Mode Direct Spotify Web API
            if (this.spotifyData.mode === 'spotify_api' && this.spotifyData.spotifyCredentials && this.spotifyData.spotifyCredentials.refreshToken) {
                await this.fetchSpotifyWebApi(
                    this.spotifyData.spotifyCredentials.clientId,
                    this.spotifyData.spotifyCredentials.clientSecret,
                    this.spotifyData.spotifyCredentials.refreshToken
                );
                if (!this.spotifyPollInterval) {
                    this.spotifyPollInterval = setInterval(() => {
                        this.fetchSpotifyWebApi(
                            this.spotifyData.spotifyCredentials.clientId,
                            this.spotifyData.spotifyCredentials.clientSecret,
                            this.spotifyData.spotifyCredentials.refreshToken
                        );
                    }, 5000);
                }
            } 
            // 2. Mode Lanyard Discord API (Real-Time WebSocket)
            else if (this.spotifyData.useLanyardApi && this.spotifyData.discordUserId) {
                await this.fetchLanyardPresence(this.spotifyData.discordUserId);
                this.connectLanyardWebSocket(this.spotifyData.discordUserId);
            } 
            // 3. Fallback Local Data
            else {
                this.renderCard();
            }
        } catch (error) {
            console.error('Error loading spotify activity data:', error);
        }
    }

    // LANYARD WEBSOCKET REAL-TIME
    connectLanyardWebSocket(userId) {
        try {
            if (this.lanyardSocket) {
                try { this.lanyardSocket.close(); } catch (e) {}
            }

            this.lanyardSocket = new WebSocket('wss://api.lanyard.rest/socket');

            this.lanyardSocket.onopen = () => {
                console.log('⚡ Connected to Lanyard WebSocket for instant Spotify updates!');
            };

            this.lanyardSocket.onmessage = (event) => {
                try {
                    const msg = JSON.parse(event.data);
                    const { op, d, t } = msg;

                    if (op === 1) {
                        if (this.lanyardHeartbeat) clearInterval(this.lanyardHeartbeat);
                        this.lanyardHeartbeat = setInterval(() => {
                            if (this.lanyardSocket && this.lanyardSocket.readyState === WebSocket.OPEN) {
                                this.lanyardSocket.send(JSON.stringify({ op: 3 }));
                            }
                        }, d.heartbeat_interval);

                        this.lanyardSocket.send(JSON.stringify({
                            op: 2,
                            d: { subscribe_to_id: userId }
                        }));
                    }

                    if (op === 0 && (t === 'INIT_STATE' || t === 'PRESENCE_UPDATE')) {
                        this.processLanyardData(d);
                    }
                } catch (e) {
                    console.error('Error parsing Lanyard WebSocket event:', e);
                }
            };

            this.lanyardSocket.onerror = (err) => {
                console.warn('Lanyard WebSocket Error, fallback to REST:', err);
                this.fetchLanyardPresence(userId);
            };

            this.lanyardSocket.onclose = () => {
                if (this.lanyardHeartbeat) clearInterval(this.lanyardHeartbeat);
                setTimeout(() => {
                    if (this.spotifyData && this.spotifyData.useLanyardApi) {
                        this.connectLanyardWebSocket(userId);
                    }
                }, 5000);
            };
        } catch (err) {
            console.warn('WebSocket unavailable, fallback to REST:', err);
            this.fetchLanyardPresence(userId);
        }
    }

    processLanyardData(lData) {
        if (lData && lData.listening_to_spotify && lData.spotify) {
            const s = lData.spotify;
            this.spotifyData.isPlaying = true;
            this.spotifyData.song = s.song;
            this.spotifyData.artist = s.artist;
            this.spotifyData.album = s.album;
            this.spotifyData.albumArt = s.album_art_url;
            this.spotifyData.songUrl = `https://open.spotify.com/track/${s.track_id}`;
            this.spotifyData.durationMs = s.timestamps ? (s.timestamps.end - s.timestamps.start) : 0;
            this.spotifyData.progressMs = s.timestamps ? Math.min(this.spotifyData.durationMs, Math.max(0, Date.now() - s.timestamps.start)) : 0;

            this.lastKnownTrack = {
                song: s.song,
                artist: s.artist,
                album: s.album,
                albumArt: s.album_art_url,
                songUrl: `https://open.spotify.com/track/${s.track_id}`,
                timestamp: Date.now()
            };
            try {
                localStorage.setItem('spotify_last_known', JSON.stringify(this.lastKnownTrack));
            } catch (e) {}
        } else {
            this.spotifyData.isPlaying = false;
            let cached = null;
            try {
                cached = JSON.parse(localStorage.getItem('spotify_last_known'));
            } catch (e) {}

            const activeTrack = this.lastKnownTrack || cached;
            if (activeTrack) {
                this.spotifyData.song = activeTrack.song;
                this.spotifyData.artist = activeTrack.artist;
                this.spotifyData.album = activeTrack.album;
                this.spotifyData.albumArt = activeTrack.albumArt;
                this.spotifyData.songUrl = activeTrack.songUrl;
                this.spotifyData.lastPlayed = {
                    timestamp: activeTrack.timestamp,
                    text: null
                };
            }
        }
        this.renderCard();
    }

    async fetchLanyardPresence(userId) {
        try {
            const res = await fetch(`https://api.lanyard.rest/v1/users/${userId}`);
            const data = await res.json();

            if (data.success && data.data) {
                this.processLanyardData(data.data);
            }
        } catch (err) {
            console.warn('Lanyard REST API fallback:', err);
        }
        this.renderCard();
    }

    async fetchSpotifyWebApi(clientId, clientSecret, refreshToken) {
        try {
            const authHeader = btoa(`${clientId}:${clientSecret}`);
            const tokenRes = await fetch('https://accounts.spotify.com/api/token', {
                method: 'POST',
                headers: {
                    'Authorization': `Basic ${authHeader}`,
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: new URLSearchParams({
                    grant_type: 'refresh_token',
                    refresh_token: refreshToken
                })
            });

            const tokenData = await tokenRes.json();
            if (!tokenData.access_token) throw new Error('Invalid token');

            const accessToken = tokenData.access_token;
            const currentRes = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
                headers: { 'Authorization': `Bearer ${accessToken}` }
            });

            if (currentRes.status === 200) {
                const current = await currentRes.json();
                if (current && current.item && current.is_playing) {
                    this.spotifyData.isPlaying = true;
                    this.spotifyData.song = current.item.name;
                    this.spotifyData.artist = current.item.artists.map(a => a.name).join(', ');
                    this.spotifyData.album = current.item.album.name;
                    this.spotifyData.albumArt = current.item.album.images[0]?.url;
                    this.spotifyData.songUrl = current.item.external_urls.spotify;
                    this.spotifyData.durationMs = current.item.duration_ms;
                    this.spotifyData.progressMs = current.progress_ms;
                    this.renderCard();
                    return;
                }
            }

            const recentRes = await fetch('https://api.spotify.com/v1/me/player/recently-played?limit=1', {
                headers: { 'Authorization': `Bearer ${accessToken}` }
            });

            if (recentRes.status === 200) {
                const recent = await recentRes.json();
                if (recent && recent.items && recent.items.length > 0) {
                    const trackObj = recent.items[0];
                    const track = trackObj.track;
                    this.spotifyData.isPlaying = false;
                    this.spotifyData.song = track.name;
                    this.spotifyData.artist = track.artists.map(a => a.name).join(', ');
                    this.spotifyData.album = track.album.name;
                    this.spotifyData.albumArt = track.album.images[0]?.url;
                    this.spotifyData.songUrl = track.external_urls.spotify;
                    this.spotifyData.durationMs = track.duration_ms;
                    this.spotifyData.progressMs = 0;
                    this.spotifyData.lastPlayed = {
                        timestamp: new Date(trackObj.played_at).getTime(),
                        text: null
                    };
                }
            }
        } catch (err) {
            console.warn('Spotify Web API fallback:', err);
        }
        this.renderCard();
    }

    formatTime(ms) {
        if (!ms || isNaN(ms)) return '0:00';
        const totalSeconds = Math.floor(ms / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    }

    getRelativeTimeText(timestamp, lang) {
        if (!timestamp) return lang === 'en' ? 'recently' : 'baru saja';
        const diffMs = Date.now() - timestamp;
        const diffMinutes = Math.floor(diffMs / (1000 * 60));
        const diffHours = Math.floor(diffMinutes / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMinutes < 1) return lang === 'en' ? 'just now' : 'baru saja';
        if (diffMinutes < 60) return lang === 'en' ? `${diffMinutes} mins ago` : `${diffMinutes} menit yang lalu`;
        if (diffHours < 24) return lang === 'en' ? `${diffHours} hours ago` : `${diffHours} jam yang lalu`;
        return lang === 'en' ? `${diffDays} days ago` : `${diffDays} hari yang lalu`;
    }

    renderCard() {
        if (!this.spotifyData) return;

        if (this.progressInterval) clearInterval(this.progressInterval);

        const lang = localStorage.getItem('preferred-lang') || 'id';
        const isPlaying = this.spotifyData.isPlaying;

        const statusText = isPlaying
            ? (lang === 'en' ? 'Listening to Spotify' : 'Sedang Mendengarkan Spotify')
            : (lang === 'en' ? 'Offline · Last Played' : 'Offline · Terakhir Diputar');

        const subStatusTime = !isPlaying && this.spotifyData.lastPlayed
            ? (typeof this.spotifyData.lastPlayed.text === 'object' && this.spotifyData.lastPlayed.text !== null
                ? (this.spotifyData.lastPlayed.text[lang] || this.spotifyData.lastPlayed.text['id'])
                : this.getRelativeTimeText(this.spotifyData.lastPlayed.timestamp, lang))
            : '';

        let progressHtml = '';
        if (isPlaying && this.spotifyData.durationMs) {
            const percent = Math.min(100, Math.max(0, (this.spotifyData.progressMs / this.spotifyData.durationMs) * 100));
            progressHtml = `
                <div class="spotify-progress-container">
                    <div class="spotify-progress-bar">
                        <div class="spotify-progress-fill" style="width: ${percent}%;"></div>
                    </div>
                    <div class="spotify-progress-time">
                        <span>${this.formatTime(this.spotifyData.progressMs)}</span>
                        <span>${this.formatTime(this.spotifyData.durationMs)}</span>
                    </div>
                </div>
            `;
        }

        this.innerHTML = `
            <div class="spotify-card">
                <div class="spotify-inner">
                    <div class="spotify-header">
                        <div class="spotify-brand">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="#1DB954" class="bi bi-spotify spotify-logo-icon" viewBox="0 0 16 16" style="flex-shrink: 0;">
                              <path d="M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0m3.669 11.538a.5.5 0 0 1-.686.165c-1.879-1.147-4.243-1.407-7.028-.77a.499.499 0 0 1-.222-.973c3.048-.696 5.662-.397 7.77.892a.5.5 0 0 1 .166.686m.979-2.178a.624.624 0 0 1-.858.205c-2.15-1.321-5.428-1.704-7.972-.932a.625.625 0 0 1-.362-1.194c2.905-.881 6.517-.454 8.986 1.063a.624.624 0 0 1 .206.858m.084-2.268C10.154 5.56 5.9 5.419 3.438 6.166a.748.748 0 1 1-.434-1.432c2.825-.857 7.523-.692 10.492 1.07a.747.747 0 1 1-.764 1.288"/>
                            </svg>
                            <span class="spotify-title-label">${statusText} ${subStatusTime ? `(${subStatusTime})` : ''}</span>
                        </div>
                    </div>

                    <div class="spotify-body">
                        <a href="${this.spotifyData.songUrl || '#'}" target="_blank" rel="noopener noreferrer" class="spotify-cover-wrapper">
                            <img src="${this.spotifyData.albumArt || 'src/assets/images/company-placeholder.svg'}" alt="${this.spotifyData.album || 'Album Cover'}" class="spotify-cover-img">
                        </a>

                        <div class="spotify-track-info">
                            <a href="${this.spotifyData.songUrl || '#'}" target="_blank" rel="noopener noreferrer" class="spotify-song-title">
                                ${this.spotifyData.song || (lang === 'en' ? 'Not Playing' : 'Tidak Ada Pemutaran')}
                            </a>
                            <p class="spotify-artist-name">${this.spotifyData.artist || 'Unknown Artist'}</p>
                            <p class="spotify-album-name">${this.spotifyData.album || ''}</p>
                        </div>
                    </div>

                    ${progressHtml}
                </div>
            </div>
        `;

        if (isPlaying && this.spotifyData.durationMs) {
            this.progressInterval = setInterval(() => {
                this.spotifyData.progressMs += 1000;
                if (this.spotifyData.progressMs > this.spotifyData.durationMs) {
                    this.spotifyData.progressMs = this.spotifyData.durationMs;
                    clearInterval(this.progressInterval);
                }
                const fillEl = this.querySelector('.spotify-progress-fill');
                const timeEl = this.querySelector('.spotify-progress-time span:first-child');
                if (fillEl) {
                    const percent = Math.min(100, (this.spotifyData.progressMs / this.spotifyData.durationMs) * 100);
                    fillEl.style.width = `${percent}%`;
                }
                if (timeEl) {
                    timeEl.textContent = this.formatTime(this.spotifyData.progressMs);
                }
            }, 1000);
        }
    }
}

customElements.define('spotify-component', SpotifyComponent);

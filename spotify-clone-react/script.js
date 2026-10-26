
/* =========================================================
   SPOTIFY CLONE — COMPLETE SCRIPT
   Vite setup:
   Put MP3 files inside public/music/
   Example: public/music/52 Bars.mp3
   Load this file only once, after the page markup.
   ========================================================= */

(() => {
  "use strict";

  // Prevent accidental double initialization.
  if (window.__spotifyCloneInitialized) return;
  window.__spotifyCloneInitialized = true;

  const $ = (selector, root = document) =>
    root.querySelector(selector);

  const $$ = (selector, root = document) =>
    [...root.querySelectorAll(selector)];

  // ---------------------------------------------------------
  // 1. LOCAL STORAGE
  // ---------------------------------------------------------

  const storage = {
    get(key, fallback = null) {
      try {
        const value = localStorage.getItem(key);
        return value === null ? fallback : JSON.parse(value);
      } catch {
        return fallback;
      }
    },

    set(key, value) {
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch (error) {
        console.warn("Storage error:", error);
      }
    }
  };

  // ---------------------------------------------------------
  // 2. TRACK LIBRARY
  // Add your actual MP3 filenames here.
  // All files should be inside public/music/.
  // ---------------------------------------------------------

  
const tracks = [
  {
    title: "52 Bars",
    artist: "Karan Aujla",
    album: "52 Bars",
    audioUrl: "/music/52%20Bars.mp3",
    cover: ""
  },
  {
    title: "Mexico",
    artist: "Karan Aujla",
    album: "Mexico",
    audioUrl: "/music/Mexico%20Full%20Song.mp3",
    cover: ""
  },
  {
    title: "Born To Shine",
    artist: "Diljit Dosanjh",
    album: "G.O.A.T.",
    audioUrl: "/music/Born_To_Shine_1.mp3",
    cover: ""
  },
  {
    title: "Excuses",
    artist: "AP Dhillon",
    album: "Excuses",
    audioUrl: "/music/Excuses_1.mp3",
    cover: ""
  },
  {
    title: "Tum Hi Ho",
    artist: "Arijit Singh",
    album: "Aashiqui 2",
    audioUrl: "/music/Tum%20Hi%20Ho%20Aashiqui%202%20128%20Kbps.mp3",
    cover: ""
  }
];

  // ---------------------------------------------------------
  // 3. AUDIO PLAYER STATE
  // ---------------------------------------------------------

  const audio = new Audio();
  audio.preload = "metadata";
  audio.volume = 0.8;

  let currentIndex = -1;
  let shuffleEnabled = false;
  let repeatMode = 0; // 0 = off, 1 = all, 2 = one
  let toastTimer = null;

  const currentTrack = () =>
    currentIndex >= 0 ? tracks[currentIndex] : null;

  // ---------------------------------------------------------
  // 4. TOAST / NOTIFICATIONS
  // ---------------------------------------------------------

  function toast(message) {
    let element = $("#clone-toast");

    if (!element) {
      element = document.createElement("div");
      element.id = "clone-toast";

      Object.assign(element.style, {
        position: "fixed",
        left: "50%",
        bottom: "100px",
        transform: "translateX(-50%)",
        padding: "12px 18px",
        borderRadius: "8px",
        background: "#282828",
        color: "#fff",
        maxWidth: "90vw",
        textAlign: "center",
        zIndex: "999999",
        boxShadow: "0 4px 20px #0008"
      });

      document.body.appendChild(element);
    }

    element.textContent = message;
    element.style.display = "block";

    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      element.style.display = "none";
    }, 3500);
  }

  function formatTime(seconds) {
    if (!Number.isFinite(seconds) || seconds < 0) return "0:00";

    return (
      Math.floor(seconds / 60) +
      ":" +
      String(Math.floor(seconds % 60)).padStart(2, "0")
    );
  }

  function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, char => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    })[char]);
  }

  // ---------------------------------------------------------
  // 5. LIKED SONGS HELPERS
  // ---------------------------------------------------------

  const getLiked = () => storage.get("cloneLiked", []);
  const getUser = () => storage.get("cloneUser", null);

  function trackKey(track) {
    return `${track.title}|${track.artist}`;
  }

  // ---------------------------------------------------------
  // 6. UPDATE PLAYER UI
  // ---------------------------------------------------------

  function updatePlayButton(playing) {
    const button = $(".play-main");
    const icon = button?.querySelector("i");

    if (icon) {
      icon.classList.toggle("fa-play", !playing);
      icon.classList.toggle("fa-pause", playing);
    }

    if (button) {
      button.setAttribute("aria-label", playing ? "Pause" : "Play");
      button.setAttribute("title", playing ? "Pause" : "Play");
    }

    document.body.classList.toggle("is-playing", playing);
  }

function updateNowPlaying(track) {
  if (!track) return;

  const panel = $(".now-playing");

  if (panel) {
    const image = $("img", panel);
    const title = $("strong", panel);
    const artist = $("span", panel);

    // Show cover only if the track has one
    if (image) {
      if (track.cover) {
        image.src = track.cover;
        image.alt = `${track.title} cover`;
        image.style.display = "";
      } else {
        image.removeAttribute("src");
        image.alt = "";
        image.style.display = "none";
      }
    }

    // Update song title and artist
    if (title) {
      title.textContent = track.title;
    }

    if (artist) {
      artist.textContent = track.artist;
    }

    // Update liked-song heart icon
    const heart = $(".fa-heart", panel);

    if (heart) {
      const liked = getLiked().includes(trackKey(track));

      heart.classList.toggle("fa-solid", liked);
      heart.classList.toggle("fa-regular", !liked);
    }
  }

  // Update browser tab title
  document.title =
    `${track.title} - ${track.artist} | Spotify Clone`;

  // Highlight the currently playing song
  $$(".song-row").forEach(row => {
    const rowTitle = $("strong", row)?.textContent.trim();

    row.classList.toggle(
      "playing",
      rowTitle === track.title
    );
  });
}

  function rememberRecentlyPlayed(track) {
    const key = trackKey(track);
    const recent = storage.get("cloneRecentlyPlayed", []);

    storage.set(
      "cloneRecentlyPlayed",
      [key, ...recent.filter(item => item !== key)].slice(0, 30)
    );
  }

  // ---------------------------------------------------------
  // 7. PLAY SONG
  // ---------------------------------------------------------

  async function playTrack(indexOrTrack) {
    let index;

    if (typeof indexOrTrack === "number") {
      index = (indexOrTrack + tracks.length) % tracks.length;
    } else {
      index = tracks.findIndex(track =>
        track.title === indexOrTrack?.title &&
        track.artist === indexOrTrack?.artist
      );
    }

    if (!tracks.length || index < 0) {
      toast("Song not found in your music library.");
      return;
    }

    currentIndex = index;
    const track = currentTrack();

    updateNowPlaying(track);
    rememberRecentlyPlayed(track);

    try {
      if (!track.audioUrl) {
        throw new Error("Missing audioUrl for track.");
      }

      const source = new URL(track.audioUrl, document.baseURI).href;

      // Change source only if a different track was selected.
      if (audio.src !== source) {
        audio.pause();
        audio.src = source;
        audio.load();
      }

      await audio.play();
      updatePlayButton(true);
    } catch (error) {
      updatePlayButton(false);
      console.error("Playback error:", error);
      console.error("Track:", track.title);
      console.error("Audio URL:", audio.currentSrc || track.audioUrl);

      if (error?.name === "NotAllowedError") {
        toast("Play button dobara click kar aur browser sound check kar.");
      } else if (error?.name === "NotSupportedError") {
        toast("MP3 file missing hai ya audio format supported nahi hai.");
      } else {
        toast(`"${track.title}" play nahi hua. MP3 filename aur path check kar.`);
      }
    }
  }

  async function togglePlay() {
    if (!currentTrack()) {
      await playTrack(0);
      return;
    }

    if (audio.paused) {
      try {
        await audio.play();
        updatePlayButton(true);
      } catch (error) {
        console.error("Resume playback error:", error);
        toast("Song resume nahi hua. Console aur MP3 path check kar.");
      }
    } else {
      audio.pause();
      updatePlayButton(false);
    }
  }

  // ---------------------------------------------------------
  // 8. NEXT / PREVIOUS / SHUFFLE / REPEAT
  // ---------------------------------------------------------

  function nextTrack() {
    if (!tracks.length) return;

    if (shuffleEnabled && tracks.length > 1) {
      let nextIndex;

      do {
        nextIndex = Math.floor(Math.random() * tracks.length);
      } while (nextIndex === currentIndex);

      playTrack(nextIndex);
      return;
    }

    if (currentIndex < tracks.length - 1) {
      playTrack(currentIndex + 1);
    } else if (repeatMode === 1) {
      playTrack(0);
    } else {
      audio.pause();
      audio.currentTime = 0;
    }
  }

  function previousTrack() {
    if (audio.currentTime > 3) {
      audio.currentTime = 0;
      return;
    }

    if (currentIndex > 0) {
      playTrack(currentIndex - 1);
    } else if (repeatMode === 1 && tracks.length) {
      playTrack(tracks.length - 1);
    } else {
      audio.currentTime = 0;
    }
  }

  function toggleShuffle(button) {
    shuffleEnabled = !shuffleEnabled;

    if (button) {
      button.style.color = shuffleEnabled ? "#1ed760" : "";
      button.setAttribute("aria-pressed", String(shuffleEnabled));
    }

    toast(shuffleEnabled ? "Shuffle enabled" : "Shuffle disabled");
  }

  function toggleRepeat(button) {
    repeatMode = (repeatMode + 1) % 3;

    if (button) {
      button.style.color = repeatMode ? "#1ed760" : "";
      button.title = ["Repeat off", "Repeat all", "Repeat one"][repeatMode];
      button.setAttribute("aria-pressed", String(repeatMode !== 0));
    }

    toast(["Repeat off", "Repeat all", "Repeat one"][repeatMode]);
  }

  // ---------------------------------------------------------
  // 9. PROGRESS BAR AND VOLUME
  // ---------------------------------------------------------

  function updateProgress() {
    const elapsed = $(".progress-container span:first-child");
    const duration = $(".progress-container span:last-child");
    const fill = $(".progress-filled");

    if (elapsed) elapsed.textContent = formatTime(audio.currentTime);
    if (duration) duration.textContent = formatTime(audio.duration);

    if (fill) {
      const percent = audio.duration
        ? (audio.currentTime / audio.duration) * 100
        : 0;

      fill.style.width = `${percent}%`;
    }
  }

  function bindProgressBar() {
    const progress = $(".progress-bar");

    if (progress) {
      progress.style.cursor = "pointer";

      progress.addEventListener("click", event => {
        if (!Number.isFinite(audio.duration)) return;

        const rect = progress.getBoundingClientRect();
        if (!rect.width) return;

        const percent = Math.max(
          0,
          Math.min(1, (event.clientX - rect.left) / rect.width)
        );

        audio.currentTime = percent * audio.duration;
      });
    }

    const volume = $(".volume-bar");

    if (volume) {
      volume.style.cursor = "pointer";

      volume.addEventListener("click", event => {
        const rect = volume.getBoundingClientRect();
        if (!rect.width) return;

        audio.volume = Math.max(
          0,
          Math.min(1, (event.clientX - rect.left) / rect.width)
        );

        volume.style.background =
          `linear-gradient(to right, #1ed760 ${audio.volume * 100}%, #555 ${audio.volume * 100}%)`;
      });
    }
  }

  // ---------------------------------------------------------
  // 10. AUDIO EVENTS AND PLAYER CONTROLS
  // ---------------------------------------------------------

  function bindPlayerControls() {
    // Delegated events allow controls rendered later to work.
    document.addEventListener("click", event => {
      if (!(event.target instanceof Element)) return;

      const playButton = event.target.closest(".play-main");
      const previousButton = event.target.closest(".previous-btn");
      const nextButton = event.target.closest(".next-btn");
      const shuffleButton = event.target.closest(".shuffle-btn");
      const repeatButton = event.target.closest(".repeat-btn");
      const heart = event.target.closest(".now-playing .fa-heart");

      if (playButton) {
        event.preventDefault();
        togglePlay();
      } else if (previousButton) {
        event.preventDefault();
        previousTrack();
      } else if (nextButton) {
        event.preventDefault();
        nextTrack();
      } else if (shuffleButton) {
        event.preventDefault();
        toggleShuffle(shuffleButton);
      } else if (repeatButton) {
        event.preventDefault();
        toggleRepeat(repeatButton);
      } else if (heart) {
        toggleLike();
      }
    });

    audio.addEventListener("play", () => updatePlayButton(true));
    audio.addEventListener("pause", () => updatePlayButton(false));
    audio.addEventListener("timeupdate", updateProgress);
    audio.addEventListener("loadedmetadata", updateProgress);

    audio.addEventListener("ended", () => {
      if (repeatMode === 2) {
        audio.currentTime = 0;
        audio.play().catch(error => console.error("Repeat error:", error));
      } else {
        nextTrack();
      }
    });

    audio.addEventListener("error", () => {
      updatePlayButton(false);

      const mediaError = audio.error;

      console.error("Audio loading failed:", {
        code: mediaError?.code,
        message: mediaError?.message,
        url: audio.currentSrc
      });

      toast("Audio file load nahi hui. Console mein URL/error check kar.");
    });

    bindProgressBar();
  }

  // ---------------------------------------------------------
  // 11. CLICKABLE SONG ROWS
  // ---------------------------------------------------------

  function bindSongRows() {
    document.addEventListener("click", event => {
      if (!(event.target instanceof Element)) return;

      const row = event.target.closest(".song-row");
      if (!row) return;

      const title =
        row.dataset.title ||
        $("strong", row)?.textContent.trim();

      const artist =
        $("small", row)?.textContent.trim() || "";

      const track = tracks.find(item =>
        item.title.toLowerCase() === String(title || "").toLowerCase() &&
        (!artist || item.artist.toLowerCase() === artist.toLowerCase())
      );

      if (!track) return;

      event.preventDefault();
      playTrack(track);
    });
  }

  // ---------------------------------------------------------
  // 12. SEARCH
  // ---------------------------------------------------------

  function bindSearch() {
    const inputs = $$(
      ".search-large input, .top-search input, " +
      "input[type='search'], input[placeholder*='Search' i]"
    );

    inputs.forEach(input => {
      if (input.dataset.cloneSearchBound === "true") return;
      input.dataset.cloneSearchBound = "true";

      const wrapper = input.parentElement;
      if (!wrapper) return;

      if (getComputedStyle(wrapper).position === "static") {
        wrapper.style.position = "relative";
      }

      const panel = document.createElement("div");
      panel.className = "song-suggestions";

      Object.assign(panel.style, {
        position: "absolute",
        top: "calc(100% + 8px)",
        left: "0",
        right: "0",
        zIndex: "9999",
        display: "none",
        maxHeight: "320px",
        overflowY: "auto",
        background: "#282828",
        color: "#fff",
        borderRadius: "8px",
        padding: "6px",
        boxShadow: "0 8px 24px #0009"
      });

      wrapper.appendChild(panel);

      function showResults(query) {
        const normalized = query.trim().toLowerCase();

        if (!normalized) {
          panel.style.display = "none";
          panel.innerHTML = "";
          return;
        }

        const results = tracks.filter(track =>
          `${track.title} ${track.artist} ${track.album}`
            .toLowerCase()
            .includes(normalized)
        ).slice(0, 10);

        if (!results.length) {
          panel.innerHTML =
            '<p style="padding:10px;color:#bbb">No matching songs found.</p>';
          panel.style.display = "block";
          return;
        }

        panel.innerHTML = results.map(track => `
          <button type="button"
            data-track-title="${escapeHTML(track.title)}"
            style="display:flex;align-items:center;gap:12px;width:100%;
            padding:9px;border:0;border-radius:6px;background:transparent;
            color:white;text-align:left;cursor:pointer">
            <img src="${escapeHTML(track.cover)}" alt=""
              width="42" height="42"
              style="object-fit:cover;border-radius:4px">
            <span style="display:flex;flex-direction:column;gap:4px">
              <strong>${escapeHTML(track.title)}</strong>
              <small style="color:#b3b3b3">${escapeHTML(track.artist)}</small>
            </span>
            <span style="margin-left:auto;color:#1ed760">▶</span>
          </button>
        `).join("");

        panel.style.display = "block";
      }

      input.addEventListener("input", () => {
        const query = input.value.trim().toLowerCase();
        showResults(input.value);

        $$(".music-card, .song-row, .artist-card, .quick-card, .browse-card")
          .forEach(card => {
            card.style.display =
              !query || card.textContent.toLowerCase().includes(query)
                ? ""
                : "none";
          });
      });

      panel.addEventListener("click", event => {
        if (!(event.target instanceof Element)) return;

        const button = event.target.closest("[data-track-title]");
        if (!button) return;

        const track = tracks.find(item =>
          item.title === button.dataset.trackTitle
        );

        if (!track) return;

        input.value = track.title;
        panel.style.display = "none";
        playTrack(track);
      });

      input.addEventListener("keydown", event => {
        if (event.key === "Escape") panel.style.display = "none";

        if (event.key === "Enter") {
          const first = $("[data-track-title]", panel);

          if (first) {
            event.preventDefault();
            first.click();
          }
        }
      });

      document.addEventListener("click", event => {
        if (!wrapper.contains(event.target)) {
          panel.style.display = "none";
        }
      });
    });
  }

  // ---------------------------------------------------------
  // 13. LIKED SONGS
  // ---------------------------------------------------------

  function toggleLike(track = currentTrack()) {
    if (!track) {
      toast("Pehle koi song play kar.");
      return;
    }

    const key = trackKey(track);
    let liked = getLiked();

    if (liked.includes(key)) {
      liked = liked.filter(item => item !== key);
      toast("Removed from Liked Songs");
    } else {
      liked.push(key);
      toast("Added to Liked Songs");
    }

    storage.set("cloneLiked", liked);
    updateNowPlaying(track);
    renderLikedSongs();
  }

  function renderLikedSongs() {
    const page = $("#liked");
    if (!page) return;

    let section = $(".clone-liked-list", page);

    if (!section) {
      section = document.createElement("div");
      section.className = "clone-liked-list song-list";

      const existingList = $(".song-list", page);

      if (existingList) existingList.before(section);
      else page.appendChild(section);
    }

    const likedTracks = getLiked()
      .map(key => tracks.find(track => trackKey(track) === key))
      .filter(Boolean);

    if (!likedTracks.length) {
      section.innerHTML =
        '<p style="color:#aaa;padding:16px">Songs you like will appear here.</p>';
      return;
    }

    section.innerHTML = likedTracks.map((track, index) => `
      <a href="#playing" class="song-row" data-title="${escapeHTML(track.title)}">
        <span>${index + 1}</span>
        <img src="${escapeHTML(track.cover)}" alt=""
          width="48" height="48"
          style="object-fit:cover;border-radius:4px">
        <div>
          <strong>${escapeHTML(track.title)}</strong>
          <small>${escapeHTML(track.artist)}</small>
        </div>
        <i class="fa-solid fa-play"></i>
      </a>
    `).join("");
  }

  // ---------------------------------------------------------
  // 14. NAVIGATION
  // ---------------------------------------------------------

  function goToPage(hash) {
    const target = document.querySelector(hash);

    if (target?.classList.contains("page")) {
      $$(".page").forEach(page => {
        page.style.display = page === target ? "block" : "none";
      });
    }

    if (hash === "#home" || hash === "#home-content") {
      $$(".page").forEach(page => {
        page.style.display =
          page.id === "home-content" ? "block" : "none";
      });
    }

    if (hash === "#liked") renderLikedSongs();

    const sidebarToggle = $("#sidebar-toggle");
    if (sidebarToggle) sidebarToggle.checked = false;
  }

  function bindNavigation() {
    $$('a[href^="#"]').forEach(link => {
      if (link.dataset.cloneNavigationBound === "true") return;
      link.dataset.cloneNavigationBound = "true";

      link.addEventListener("click", event => {
        const hash = link.getAttribute("href");

        if (!hash || hash === "#") return;

        if (hash === "#playing") {
          event.preventDefault();
          togglePlay();
          return;
        }

        if (hash === "#login") {
          event.preventDefault();
          openLogin(false);
          return;
        }

        if (hash === "#signup") {
          event.preventDefault();
          openLogin(true);
          return;
        }

        if (hash === "#account") {
          event.preventDefault();

          if (getUser()) {
            if (confirm("Do you want to log out?")) {
              storage.set("cloneUser", null);
              updateUserUI();
              toast("Logged out.");
            }
          } else {
            openLogin(false);
          }

          return;
        }

        const target = document.querySelector(hash);

        if (target?.classList.contains("page")) {
          event.preventDefault();
          history.pushState({ page: hash }, "", hash);
          goToPage(hash);
        }
      });
    });

    $$(".back-button, .forward-button").forEach(button => {
      if (button.dataset.cloneHistoryBound === "true") return;
      button.dataset.cloneHistoryBound = "true";

      button.addEventListener("click", event => {
        event.preventDefault();

        if (button.classList.contains("back-button")) history.back();
        else history.forward();
      });
    });

    window.addEventListener("popstate", () => {
      const hash = location.hash;

      if (hash && document.querySelector(hash)?.classList.contains("page")) {
        goToPage(hash);
      } else {
        goToPage("#home-content");
      }
    });
  }

  // ---------------------------------------------------------
  // 15. DEMO LOGIN / SIGNUP
  // Never use a real password here.
  // ---------------------------------------------------------

  function openLogin(signup = false) {
    let modal = $("#clone-auth-modal");

    if (modal) {
      modal.remove();
      modal = null;
    }

    modal = document.createElement("div");
    modal.id = "clone-auth-modal";

    Object.assign(modal.style, {
      position: "fixed",
      inset: "0",
      zIndex: "100001",
      background: "#000b",
      display: "grid",
      placeItems: "center",
      padding: "20px"
    });

    modal.innerHTML = `
      <div style="width:min(420px,100%);background:#121212;color:white;
        padding:28px;border-radius:12px;position:relative">
        <button type="button" data-close
          style="position:absolute;right:16px;top:12px;color:white;
          background:none;border:0;font-size:26px">×</button>
        <h2>Spotify Clone</h2>
        <p style="color:#aaa">Local demo account</p>
        <form id="clone-auth-form">
          <label>Name</label>
          <input id="auth-name" required placeholder="Your name"
            autocomplete="name"
            style="box-sizing:border-box;width:100%;padding:12px;margin:8px 0 14px">
          <label>Email</label>
          <input id="auth-email" required type="email"
            placeholder="you@example.com" autocomplete="email"
            style="box-sizing:border-box;width:100%;padding:12px;margin:8px 0 14px">
          <label>Password</label>
          <input id="auth-password" required type="password" minlength="6"
            placeholder="At least 6 characters"
            style="box-sizing:border-box;width:100%;padding:12px;margin:8px 0">
          <button type="submit"
            style="width:100%;margin-top:18px;padding:13px;border:0;
            border-radius:25px;background:#1ed760;font-weight:bold;cursor:pointer">
            ${signup ? "Create account" : "Log in"}
          </button>
        </form>
        <p style="font-size:12px;color:#aaa;margin-top:16px">
          Demo only. Do not use your real password. Not secure authentication.
        </p>
      </div>
    `;

    document.body.appendChild(modal);

    modal.addEventListener("click", event => {
      if (event.target === modal || event.target.closest("[data-close]")) {
        modal.remove();
      }
    });

    $("#clone-auth-form", modal).addEventListener("submit", event => {
      event.preventDefault();

      const name = $("#auth-name", modal).value.trim();
      const email = $("#auth-email", modal).value.trim().toLowerCase();
      const password = $("#auth-password", modal).value;

      if (!name || !email || password.length < 6) {
        toast("Enter a valid name, email, and password.");
        return;
      }

      const users = storage.get("cloneUsers", {});

      if (signup && users[email]) {
        toast("This email already has a demo account.");
        return;
      }

      if (!signup && users[email] && users[email].password !== password) {
        toast("Incorrect demo password.");
        return;
      }

      if (!users[email]) {
        users[email] = { name, password };
        storage.set("cloneUsers", users);
      }

      storage.set("cloneUser", {
        name: users[email].name,
        email
      });

      modal.remove();
      updateUserUI();
      toast("Welcome, " + users[email].name + "!");
    });
  }

  function updateUserUI() {
    const user = getUser();
    const button = $(".login-top");

    if (button) {
      button.href = "#account";

      const label = $("span", button);
      if (label) label.textContent = user ? user.name : "Login";

      button.setAttribute(
        "aria-label",
        user ? `Account: ${user.name}` : "Log in"
      );
    }

    const profile = $(".profile");

    if (profile) {
      const span = $("span", profile);
      if (span) span.textContent = user ? user.name : "User";
      profile.title = user ? user.email : "Account";
    }
  }

  // ---------------------------------------------------------
  // 16. PREMIUM DEMO
  // ---------------------------------------------------------

  function bindPremium() {
    $$(".premium").forEach(button => {
      if (button.dataset.clonePremiumBound === "true") return;
      button.dataset.clonePremiumBound = "true";

      button.addEventListener("click", event => {
        event.preventDefault();

        if (!getUser()) {
          toast("Log in first to try Premium.");
          openLogin(false);
          return;
        }

        const enabled = !storage.get("clonePremium", false);
        storage.set("clonePremium", enabled);
        document.body.classList.toggle("premium-active", enabled);

        toast(enabled ? "Demo Premium activated." : "Demo Premium cancelled.");
      });
    });

    $$(".social-button").forEach(button => {
      if (button.dataset.cloneSocialBound === "true") return;
      button.dataset.cloneSocialBound = "true";

      button.addEventListener("click", event => {
        event.preventDefault();
        toast("Google/Facebook login requires backend OAuth setup.");
      });
    });
  }

  // ---------------------------------------------------------
  // 17. KEYBOARD SHORTCUTS
  // ---------------------------------------------------------

  function bindKeyboardShortcuts() {
    document.addEventListener("keydown", event => {
      const tag = document.activeElement?.tagName;

      if (["INPUT", "TEXTAREA", "SELECT"].includes(tag)) return;

      if (event.code === "Space") {
        event.preventDefault();
        togglePlay();
      }

      if (event.altKey && event.key === "ArrowRight") nextTrack();
      if (event.altKey && event.key === "ArrowLeft") previousTrack();

      if (event.key === "ArrowRight" && Number.isFinite(audio.duration)) {
        audio.currentTime = Math.min(audio.duration, audio.currentTime + 5);
      }

      if (event.key === "ArrowLeft" && Number.isFinite(audio.duration)) {
        audio.currentTime = Math.max(0, audio.currentTime - 5);
      }
    });
  }

  // ---------------------------------------------------------
  // 18. INITIALIZE
  // ---------------------------------------------------------

  function init() {
    const loader = $(".initial-loader");

    if (loader) {
      setTimeout(() => loader.classList.add("hidden"), 350);
    }

    updateUserUI();

    document.body.classList.toggle(
      "premium-active",
      Boolean(storage.get("clonePremium", false))
    );

    bindSearch();
    bindSongRows();
    bindNavigation();
    bindPlayerControls();
    bindKeyboardShortcuts();
    bindPremium();

    renderLikedSongs();

    if (location.hash && $(".page" + location.hash)) {
      goToPage(location.hash);
    } else {
      goToPage("#home-content");
    }

    console.log("Spotify Clone initialized.");
    console.log("Tracks configured:", tracks.length);
    console.log("Audio player ready.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();

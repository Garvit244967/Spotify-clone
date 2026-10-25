/* =========================================================
   SPOTIFY CLONE - COMPLETE JAVASCRIPT
   Place script.js beside index.html.
   Place your MP3 files inside the music/ folder.
   ========================================================= */

(() => {
  "use strict";

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
        console.warn("Could not save data:", error);
      }
    }
  };

  // ---------------------------------------------------------
  // 2. MUSIC LIBRARY
  // Filenames must match your music folder exactly.
  // Spaces and capital letters are supported.
  // ---------------------------------------------------------

  // These three paths match the files shown in your music folder.
  // Rename the third MP3 to exactly "Winning Speech Karan Aujla.mp3"
  // if its current filename contains extra text in parentheses or after the title.
  const tracks = [
    {
      title: "52 Bars",
      artist: "Karan Aujla",
      album: "52 Bars",
      audioUrl: "./music/52%20Bars.mp3",
      cover: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=400"
    },
    {
      title: "Mexico",
      artist: "Karan Aujla",
      album: "Mexico",
      audioUrl: "./music/Mexico%20Full%20Song.mp3",
      cover: "https://images.unsplash.com/photo-1519608487953-e999c86e7455?w=400"
    },
    {
      title: "Winning Speech",
      artist: "Karan Aujla",
      album: "Winning Speech",
      audioUrl: "./music/Winning%20Speech%20Karan%20Aujla.mp3",
      cover: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=400"
    },
    {
      title: "Tauba Tauba",
      artist: "Karan Aujla",
      album: "Tauba Tauba",
      audioUrl: "music/tauba-tauba.mp3",
      cover: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400"
    },
    {
      title: "Softly",
      artist: "Karan Aujla",
      album: "Softly",
      audioUrl: "music/softly.mp3",
      cover: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=400"
    },
    {
      title: "Admirin' You",
      artist: "Karan Aujla",
      album: "Admirin' You",
      audioUrl: "music/admirin-you.mp3",
      cover: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=400"
    },
    {
      title: "Players",
      artist: "Karan Aujla",
      album: "Players",
      audioUrl: "music/players.mp3",
      cover: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400"
    },
    {
      title: "Hukam",
      artist: "Karan Aujla",
      album: "Hukam",
      audioUrl: "music/hukam.mp3",
      cover: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=400"
    },
    {
      title: "Perfect",
      artist: "Ed Sheeran",
      album: "Perfect",
      audioUrl: "music/perfect.mp3",
      cover: "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=400"
    },
    {
      title: "Tum Hi Ho",
      artist: "Arijit Singh",
      album: "Aashiqui 2",
      audioUrl: "music/tum-hi-ho.mp3",
      cover: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=400"
    },
    {
      title: "Excuses",
      artist: "AP Dhillon",
      album: "Excuses",
      audioUrl: "music/excuses.mp3",
      cover: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=400"
    },
    {
      title: "Blinding Lights",
      artist: "The Weeknd",
      album: "After Hours",
      audioUrl: "music/blinding-lights.mp3",
      cover: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400"
    }
  ];

  // ---------------------------------------------------------
  // 3. PLAYER STATE
  // ---------------------------------------------------------

  const audio = new Audio();
  audio.preload = "metadata";
  audio.volume = 0.8;

  let queue = [...tracks];
  let currentIndex = -1;
  let shuffleEnabled = false;
  let repeatMode = 0; // 0 = off, 1 = all, 2 = one
  let toastTimer = null;

  const currentTrack = () =>
    currentIndex >= 0 ? queue[currentIndex] : null;

  const getLiked = () =>
    storage.get("cloneLiked", []);

  const getUser = () =>
    storage.get("cloneUser");

  // ---------------------------------------------------------
  // 4. NOTIFICATION MESSAGES
  // ---------------------------------------------------------

  function toast(message) {
    let element = $("#clone-toast");

    if (!element) {
      element = document.createElement("div");
      element.id = "clone-toast";

      Object.assign(element.style, {
        position: "fixed",
        bottom: "110px",
        left: "50%",
        transform: "translateX(-50%)",
        background: "#282828",
        color: "#fff",
        padding: "12px 18px",
        borderRadius: "8px",
        zIndex: "999999",
        maxWidth: "90vw",
        textAlign: "center",
        boxShadow: "0 4px 20px #0008"
      });

      document.body.appendChild(element);
    }

    element.textContent = message;
    element.style.display = "block";

    clearTimeout(toastTimer);

    toastTimer = setTimeout(() => {
      element.style.display = "none";
    }, 3000);
  }

  function formatTime(seconds) {
    if (!Number.isFinite(seconds) || seconds < 0) {
      return "0:00";
    }

    return (
      Math.floor(seconds / 60) +
      ":" +
      String(Math.floor(seconds % 60)).padStart(2, "0")
    );
  }

  function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, character => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    })[character]);
  }

  // ---------------------------------------------------------
  // 5. UPDATE NOW PLAYING PANEL
  // ---------------------------------------------------------

  function updateNowPlaying(track) {
    if (!track) return;

    const panel = $(".now-playing");

    if (panel) {
      const image = $("img", panel);
      const title = $("strong", panel);
      const artist = $("span", panel);

      if (image) {
        image.src = track.cover;
        image.alt = track.title + " cover";
      }

      if (title) title.textContent = track.title;
      if (artist) artist.textContent = track.artist;

      const heart = $(".fa-heart", panel);

      if (heart) {
        const liked = getLiked().includes(
          track.title + "|" + track.artist
        );

        heart.classList.toggle("fa-solid", liked);
        heart.classList.toggle("fa-regular", !liked);
      }
    }

    document.title =
      track.title + " - " + track.artist + " | Spotify Clone";

    $$(".song-row").forEach(row => {
      const rowTitle = $("strong", row)?.textContent.trim();

      row.classList.toggle(
        "playing",
        rowTitle === track.title
      );
    });
  }

  function updatePlayButton(playing) {
    const icon = $(".play-main i");

    if (icon) {
      icon.classList.toggle("fa-play", !playing);
      icon.classList.toggle("fa-pause", playing);
    }

    const button = $(".play-main");

    if (button) {
      button.setAttribute(
        "aria-label",
        playing ? "Pause" : "Play"
      );
    }

    document.body.classList.toggle("is-playing", playing);
  }

  // ---------------------------------------------------------
  // 6. PLAY A SONG DIRECTLY ON THE WEBSITE
  // ---------------------------------------------------------

  async function playTrack(trackOrIndex) {
    let track;

    if (typeof trackOrIndex === "number") {
      if (!queue.length) return;

      currentIndex =
        (trackOrIndex + queue.length) % queue.length;

      track = queue[currentIndex];
    } else {
      track = trackOrIndex;

      if (!track) return;

      let index = queue.findIndex(item =>
        item.title === track.title &&
        item.artist === track.artist
      );

      if (index === -1) {
        queue.unshift(track);
        index = 0;
      }

      currentIndex = index;
    }

    updateNowPlaying(track);

    // Remember recently played songs.
    const key = track.title + "|" + track.artist;

    const recent = storage.get("cloneRecentlyPlayed", []);

    storage.set(
      "cloneRecentlyPlayed",
      [key, ...recent.filter(item => item !== key)].slice(0, 30)
    );

    if (!track.audioUrl) {
      updatePlayButton(false);
      toast("This song does not have an audio file configured.");
      return;
    }

    try {
      const source = new URL(track.audioUrl, document.baseURI).href;

      if (audio.src !== source) {
        audio.src = track.audioUrl;
        audio.load();
      }

      await audio.play();

      updatePlayButton(true);
    } catch (error) {
      updatePlayButton(false);

      console.error("Playback error:", error);

      toast(
        "Cannot play " + track.title +
        ". Check the MP3 filename and music folder."
      );
    }
  }

  function togglePlay() {
    if (!currentTrack()) {
      playTrack(0);
      return;
    }

    if (audio.paused) {
      audio.play()
        .then(() => updatePlayButton(true))
        .catch(() => {
          toast("Playback failed. Check the MP3 file path.");
        });
    } else {
      audio.pause();
      updatePlayButton(false);
    }
  }

  // ---------------------------------------------------------
  // 7. NEXT, PREVIOUS, SHUFFLE AND REPEAT
  // ---------------------------------------------------------

  function nextTrack() {
    if (!queue.length) return;

    if (shuffleEnabled && queue.length > 1) {
      let index;

      do {
        index = Math.floor(Math.random() * queue.length);
      } while (index === currentIndex);

      playTrack(index);
      return;
    }

    if (currentIndex < queue.length - 1) {
      playTrack(currentIndex + 1);
    } else if (repeatMode === 1) {
      playTrack(0);
    } else {
      audio.pause();
      updatePlayButton(false);
    }
  }

  function previousTrack() {
    if (audio.currentTime > 3) {
      audio.currentTime = 0;
      return;
    }

    if (currentIndex > 0) {
      playTrack(currentIndex - 1);
    } else if (repeatMode === 1 && queue.length) {
      playTrack(queue.length - 1);
    } else {
      audio.currentTime = 0;
    }
  }

  function toggleShuffle(button) {
    shuffleEnabled = !shuffleEnabled;

    if (button) {
      button.style.color = shuffleEnabled ? "#1ed760" : "";
    }

    toast(shuffleEnabled ? "Shuffle enabled" : "Shuffle disabled");
  }

  function toggleRepeat(button) {
    repeatMode = (repeatMode + 1) % 3;

    const labels = [
      "Repeat off",
      "Repeat all",
      "Repeat one"
    ];

    if (button) {
      button.style.color = repeatMode ? "#1ed760" : "";
      button.title = labels[repeatMode];
    }

    toast(labels[repeatMode]);
  }

  // ---------------------------------------------------------
  // 8. PROGRESS BAR AND VOLUME
  // ---------------------------------------------------------

  function updateProgress() {
    const elapsed = $(".progress-container span:first-child");
    const duration = $(".progress-container span:last-child");
    const fill = $(".progress-filled");

    if (elapsed) {
      elapsed.textContent = formatTime(audio.currentTime);
    }

    if (duration) {
      duration.textContent = formatTime(audio.duration);
    }

    if (fill) {
      const percent = audio.duration
        ? (audio.currentTime / audio.duration) * 100
        : 0;

      fill.style.width = percent + "%";
    }
  }

  function bindProgressBar() {
    const progress = $(".progress-bar");

    if (progress) {
      progress.style.cursor = "pointer";

      progress.addEventListener("click", event => {
        if (!Number.isFinite(audio.duration)) return;

        const rect = progress.getBoundingClientRect();

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

        audio.volume = Math.max(
          0,
          Math.min(1, (event.clientX - rect.left) / rect.width)
        );

        volume.style.background =
          `linear-gradient(to right,#1ed760 ${audio.volume * 100}%,#555 ${audio.volume * 100}%)`;
      });
    }
  }

  // ---------------------------------------------------------
  // 9. LIKED SONGS
  // ---------------------------------------------------------

  function toggleLike(track = currentTrack()) {
    if (!track) {
      toast("Play a song before liking it.");
      return;
    }

    const key = track.title + "|" + track.artist;
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

      if (existingList) {
        existingList.before(section);
      } else {
        page.appendChild(section);
      }
    }

    const likedTracks = getLiked()
      .map(key =>
        tracks.find(track =>
          track.title + "|" + track.artist === key
        )
      )
      .filter(Boolean);

    if (!likedTracks.length) {
      section.innerHTML =
        '<p style="color:#aaa;padding:16px">Songs you like will appear here.</p>';
      return;
    }

    section.innerHTML = likedTracks.map((track, index) => `
      <a href="#playing" class="song-row"
         data-title="${escapeHTML(track.title)}">
        <span>${index + 1}</span>
        <img src="${escapeHTML(track.cover)}"
             alt="${escapeHTML(track.title)} cover"
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
  // 10. SEARCH SONGS AND ARTISTS
  // ---------------------------------------------------------

  function bindSearch() {
    const inputs = $$(
      ".search-large input, .top-search input, " +
      "input[type='search'], input[placeholder*='Search' i]"
    );

    inputs.forEach(input => {
      const wrapper = input.parentElement;

      if (!wrapper) return;

      if (getComputedStyle(wrapper).position === "static") {
        wrapper.style.position = "relative";
      }

      let panel = $(".song-suggestions", wrapper);

      if (!panel) {
        panel = document.createElement("div");
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
          color: "white",
          borderRadius: "8px",
          padding: "6px",
          boxShadow: "0 8px 24px #0009"
        });

        wrapper.appendChild(panel);
      }

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
                  style="
                    display:flex;
                    align-items:center;
                    gap:12px;
                    width:100%;
                    padding:9px;
                    border:0;
                    border-radius:6px;
                    background:transparent;
                    color:white;
                    text-align:left;
                    cursor:pointer">
            <img src="${escapeHTML(track.cover)}"
                 alt=""
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
        const button = event.target.closest("[data-track-title]");

        if (!button) return;

        const track = tracks.find(item =>
          item.title === button.dataset.trackTitle
        );

        if (!track) return;

        input.value = track.title;
        panel.style.display = "none";

        queue = [...tracks];
        playTrack(track);
      });

      input.addEventListener("keydown", event => {
        if (event.key === "Escape") {
          panel.style.display = "none";
        }

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
  // 11. CLICKABLE SONG ROWS
  // ---------------------------------------------------------

  function bindSongRows() {
    document.addEventListener("click", event => {
      const row = event.target.closest(".song-row");

      if (!row) return;

      const title =
        row.dataset.title ||
        $("strong", row)?.textContent.trim();

      const artist =
        $("small", row)?.textContent.trim() || "";

      const track = tracks.find(item =>
        item.title.toLowerCase() ===
          String(title || "").toLowerCase() &&
        (!artist || item.artist.toLowerCase() === artist.toLowerCase())
      );

      if (!track) return;

      event.preventDefault();
      playTrack(track);
    });
  }

  // ---------------------------------------------------------
  // 12. NAVIGATION
  // ---------------------------------------------------------

  function goToPage(hash) {
    const target = document.querySelector(hash);

    if (target && target.classList.contains("page")) {
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

    if (hash === "#liked") {
      renderLikedSongs();
    }

    const sidebarToggle = $("#sidebar-toggle");

    if (sidebarToggle) sidebarToggle.checked = false;
  }

  function bindNavigation() {
    $$('a[href^="#"]').forEach(link => {
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

        if (target && target.classList.contains("page")) {
          event.preventDefault();
          history.pushState({ page: hash }, "", hash);
          goToPage(hash);
        }
      });
    });

    $$("a.back-button, button.back-button, .nav-buttons button:first-child")
      .forEach(button => {
        button.addEventListener("click", event => {
          event.preventDefault();
          history.back();
        });
      });

    $$("a.forward-button, button.forward-button, .nav-buttons button:last-child")
      .forEach(button => {
        button.addEventListener("click", event => {
          event.preventDefault();
          history.forward();
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
  // 13. LOGIN / SIGNUP DEMO
  // This is not secure production authentication.
  // ---------------------------------------------------------

  function openLogin(signup = false) {
    let modal = $("#clone-auth-modal");

    if (!modal) {
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
        <div style="width:min(420px,100%);background:#121212;
                    color:white;padding:28px;border-radius:12px;position:relative">
          <button type="button" data-close
                  style="position:absolute;right:16px;top:12px;
                         color:white;background:none;border:0;font-size:26px">
            ×
          </button>

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
                    style="width:100%;margin-top:18px;padding:13px;
                           border:0;border-radius:25px;background:#1ed760;
                           font-weight:bold;cursor:pointer">
              ${signup ? "Create account" : "Log in"}
            </button>
          </form>

          <p style="font-size:12px;color:#aaa;margin-top:16px">
            Demo only. Do not use your real password.
            This does not provide secure server authentication.
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
  }

  function updateUserUI() {
    const user = getUser();
    const button = $(".login-top");

    if (button) {
      button.href = "#account";
      const label = $("span", button);
      if (label) label.textContent = user ? user.name : "Login";
      button.setAttribute("aria-label", user ? `Account: ${user.name}` : "Log in");
    }

    const profile = $(".profile");

    if (profile) {
      const span = $("span", profile);

      if (span) span.textContent = user ? user.name : "User";
      profile.title = user ? user.email : "Account";
    }
  }

  // ---------------------------------------------------------
  // 14. CONNECT ALL PLAYER BUTTONS
  // ---------------------------------------------------------

  function bindPlayerControls() {
    $(".play-main")?.addEventListener("click", event => {
      event.preventDefault();
      togglePlay();
    });

    const buttons = $$(".player-buttons a, .player-buttons button");

    if (buttons[0]) {
      buttons[0].addEventListener("click", event => {
        event.preventDefault();
        toggleShuffle(buttons[0]);
      });
    }

    if (buttons[1]) {
      buttons[1].addEventListener("click", event => {
        event.preventDefault();
        previousTrack();
      });
    }

    if (buttons[3]) {
      buttons[3].addEventListener("click", event => {
        event.preventDefault();
        nextTrack();
      });
    }

    if (buttons[4]) {
      buttons[4].addEventListener("click", event => {
        event.preventDefault();
        toggleRepeat(buttons[4]);
      });
    }

    $$(".now-playing .fa-heart").forEach(heart => {
      heart.style.cursor = "pointer";

      heart.addEventListener("click", () => {
        toggleLike();
      });
    });

    audio.addEventListener("timeupdate", updateProgress);
    audio.addEventListener("loadedmetadata", updateProgress);

    audio.addEventListener("play", () => updatePlayButton(true));
    audio.addEventListener("pause", () => updatePlayButton(false));

    audio.addEventListener("ended", () => {
      if (repeatMode === 2) {
        audio.currentTime = 0;

        audio.play().catch(() => updatePlayButton(false));
      } else {
        nextTrack();
      }
    });

    audio.addEventListener("error", () => {
      updatePlayButton(false);
      toast("Audio file could not be loaded. Check its filename.");
    });

    bindProgressBar();
  }

  // ---------------------------------------------------------
  // 15. KEYBOARD SHORTCUTS
  // ---------------------------------------------------------

  function bindKeyboardShortcuts() {
    document.addEventListener("keydown", event => {
      const tag = document.activeElement?.tagName;

      if (["INPUT", "TEXTAREA", "SELECT"].includes(tag)) return;

      if (event.code === "Space") {
        event.preventDefault();
        togglePlay();
      }

      if (event.altKey && event.key === "ArrowRight") {
        nextTrack();
      }

      if (event.altKey && event.key === "ArrowLeft") {
        previousTrack();
      }

      if (event.key === "ArrowRight" && Number.isFinite(audio.duration)) {
        audio.currentTime = Math.min(
          audio.duration,
          audio.currentTime + 5
        );
      }

      if (event.key === "ArrowLeft" && Number.isFinite(audio.duration)) {
        audio.currentTime = Math.max(0, audio.currentTime - 5);
      }
    });
  }

  // ---------------------------------------------------------
  // 16. PREMIUM DEMO
  // ---------------------------------------------------------

  function bindPremium() {
    $$(".premium").forEach(button => {
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
      button.addEventListener("click", event => {
        event.preventDefault();
        toast("Google/Facebook login requires OAuth setup on a backend.");
      });
    });
  }

  // ---------------------------------------------------------
  // 17. INITIALIZE EVERYTHING
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

    console.log("Spotify Clone JavaScript initialized.");
    console.log("Available tracks:", tracks.length);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
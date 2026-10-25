import React from "react";
const quickPlaylists = [
  {
    title: "Liked Songs",
    image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=500&q=80",
    link: "#liked",
  },
  {
    title: "Daily Mix 1",
    image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=500&q=80",
    link: "#daily1",
  },
  {
    title: "Chill Hits",
    image: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&w=500&q=80",
    link: "#chill",
  },
  {
    title: "Workout",
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=500&q=80",
    link: "#workout",
  },
  {
    title: "Discover Weekly",
    image: "https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?auto=format&fit=crop&w=500&q=80",
    link: "#discover",
  },
  {
    title: "Release Radar",
    image: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=500&q=80",
    link: "#release",
  },
];

const mixes = [
  {
    title: "Daily Mix 1",
    description: "Arijit Singh, Pritam and more",
    image: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=500&q=80",
    link: "#daily1",
  },
  {
    title: "Daily Mix 2",
    description: "AP Dhillon, Karan Aujla and more",
    image: "https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?auto=format&fit=crop&w=500&q=80",
    link: "#daily2",
  },
  {
    title: "English Mix",
    description: "The Weeknd, Drake and more",
    image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=500&q=80",
    link: "#english",
  },
  {
    title: "Chill Mix",
    description: "Relaxing songs and more",
    image: "https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=500&q=80",
    link: "#chill",
  },
  {
    title: "Workout Mix",
    description: "High energy music",
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=500&q=80",
    link: "#workout",
  },
];

const artists = [
  {
    name: "Arijit Singh",
    image: "https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?auto=format&fit=crop&w=500&q=80",
    link: "#arijit",
  },
  {
    name: "AP Dhillon",
    image: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=500&q=80",
    link: "#apdhillon",
  },
  {
    name: "Karan Aujla",
    image: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=500&q=80",
    link: "#karan",
  },
  {
    name: "Shubh",
    image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=500&q=80",
    link: "#shubh",
  },
  {
    name: "Diljit Dosanjh",
    image: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&w=500&q=80",
    link: "#diljit",
  },
];

function SectionHeading({ title, link }) {
  return (
    <div className="section-heading">
      <h2>{title}</h2>
      <a href={link}>Show all</a>
    </div>
  );
}

export default function Home() {
  return (
    <>
      <h1>Good evening</h1>

      {/* Quick playlists */}
      <div className="quick-grid">
        {quickPlaylists.map((playlist) => (
          <a href={playlist.link} className="quick-card" key={playlist.title}>
            <img src={playlist.image} alt={playlist.title} />
            <span>{playlist.title}</span>
            <div className="quick-play">
              <i className="fa-solid fa-play" aria-hidden="true"></i>
            </div>
          </a>
        ))}
      </div>

      {/* Made For You */}
      <SectionHeading title="Made For You" link="#daily1" />
      <div className="card-grid">
        {mixes.map((mix) => (
          <a href={mix.link} className="music-card" key={mix.title}>
            <div className="card-image">
              <img src={mix.image} alt={mix.title} />
              <div className="play-button">
                <i className="fa-solid fa-play" aria-hidden="true"></i>
              </div>
            </div>
            <h3>{mix.title}</h3>
            <p>{mix.description}</p>
          </a>
        ))}
      </div>

      {/* Popular artists */}
      <SectionHeading title="Popular artists" link="#artists" />
      <div className="artist-grid" id="artists">
        {artists.map((artist) => (
          <a href={artist.link} className="artist-card" key={artist.name}>
            <div className="artist-image">
              <img src={artist.image} alt={artist.name} />
            </div>
            <h3>{artist.name}</h3>
            <p>Artist</p>
          </a>
        ))}
      </div>
    </>
  );
}

const LIBRARY = {
  tt0013442: "/videos/nosferatu.mp4",
};

const ARCHIVE = {
  tt0013442: "Nosferatu_201705",
};

// Add an authorized embed URL when its integration is verified.
const PROVIDERS = [
  { id: "cinesrc", name: "CineSrc" },
  { id: "vidcore", name: "VidCore" },
  { id: "superembed", name: "SuperEmbed" },
  { id: "twoembed", name: "2Embed" },
  { id: "ezvidapi", name: "ezvidapi" },
  { id: "vidlink", name: "vidlink.pro" },
];

export const SERVERS = [
  {
    id: "library",
    name: "My Library",
    group: "direct",
    desc: "Your own video files",
    resolve: async (movie) => {
      const src = LIBRARY[movie.imdb_id];
      return src ? { type: "video", src } : null;
    },
  },
  {
    id: "demo",
    name: "Demo Video",
    group: "direct",
    desc: "Open-licensed test video",
    resolve: async () => ({
      type: "video",
      src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    }),
  },
  {
    id: "archive",
    name: "Internet Archive",
    group: "embedded",
    desc: "Public-domain films",
    resolve: async (movie) => {
      const identifier = ARCHIVE[movie.imdb_id];

      return identifier
        ? {
            type: "iframe",
            src: `https://archive.org/embed/${identifier}`,
          }
        : null;
    },
  },
  {
    id: "trailer",
    name: "YouTube Trailer",
    group: "embedded",
    desc: "Movie trailer",
    resolve: async (movie) =>
      movie.trailer
        ? {
            type: "iframe",
            src: `https://www.youtube.com/embed/${movie.trailer}`,
          }
        : null,
  },
  ...PROVIDERS.map((provider) => ({
    ...provider,
    group: "embedded",
    desc: "Awaiting verified authorized integration",
    resolve: async () => null,
  })),
];
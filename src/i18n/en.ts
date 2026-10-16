export const en = {
  nav: {
    home: "Home",
    explore: "Explore",
    cosmosToday: "Cosmos Today",
    about: "About",
  },
  common: {
    loading: "Loading",
    error: "Something went wrong.",
    empty: "Nothing here yet.",
    source: "Source",
    staleNotice: "Showing stored data from",
    retry: "Try again",
    confidence: {
      measured: "Measured",
      estimated: "Estimated",
      approximate: "Approximate",
      calculated: "Calculated",
    },
  },
  journey: {
    home: "You are here",
    navLabel: "Journey stages",
    rulerTitle: "Conceptual scale",
    rulerNote:
      "A logarithmic scale: each step is ten times the one below, so the whole range of cosmic scale fits on a single axis.",
    motion: {
      full: "Full motion",
      calm: "Calm motion",
    },
    stages: {
      hero: {
        label: "Opening",
        aria: "Start of the journey: you are here",
        headline: "You are here.",
        body: "Scroll slowly. We are about to move away, one order of magnitude at a time.",
      },
      earth: {
        label: "Earth",
        aria: "The Earth",
        headline: "The whole world you know, wide enough to circle in a day.",
        body: "Every city, every ocean, every person who has ever lived rests on its surface.",
      },
      "solar-system": {
        label: "Solar System",
        aria: "The Solar System",
        headline: "Light leaves the Sun, and still arrives in minutes.",
        body: "Eight planets, one star, and a void far larger than all of them. One of those specks is home.",
      },
      star: {
        label: "Nearest star",
        aria: "The nearest star",
        headline: "The next star is years away, not minutes.",
        body: "Proxima Centauri is the closest star to our Sun. The journey has only begun.",
      },
      galaxy: {
        label: "Galaxy",
        aria: "The galaxy",
        headline: "One hundred billion suns, turning in a single spiral.",
        body: "Our Sun is one star among billions in the Milky Way, itself one galaxy among billions.",
      },
      universe: {
        label: "Observable Universe",
        aria: "Explore the observable universe",
        headline: "Everything light has ever reached us from.",
        body: "The observable universe is the edge of what we can see, roughly 93 billion light-years across.",
      },
      outro: {
        label: "The journey",
        aria: "End of journey: you are part of the universe",
        headline: "You are part of the universe.",
        body: "Every atom you are made of was forged in stars. The scale was never only about distance.",
      },
    },
  },
};

export type Dictionary = typeof en;

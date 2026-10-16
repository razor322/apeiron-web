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
  cosmosToday: {
    heading: "Cosmos Today",
    retrievedOn: "Retrieved on",
    openMedia: "Open media at the official source",
    loadError: "Today's content could not be loaded.",
    apodLabel: "NASA APOD",
    apodUrl: "https://apod.nasa.gov",
  },
  explore: {
    heading: "Explore",
    intro:
      "Eight kinds of object, from the planet under your feet to the dark matter that holds the galaxies together.",
    browse: "Browse categories",
    detail: {
      definition: "Definition",
      facts: "Key numbers",
      terms: "Terms",
      related: "Related topics",
      backToExplore: "Back to Explore",
      notFoundTitle: "No such category",
      notFoundHint: "That topic does not exist yet.",
    },
    categories: {
      planet: {
        name: "Planets",
        summary:
          "Worlds bound to a star: rocky, icy, or wrapped in gas, each one globed by its own gravity.",
      },
      star: {
        name: "Stars",
        summary:
          "Self-luminous spheres of plasma that fuse hydrogen into light and hold whole planetary systems.",
      },
      "black-hole": {
        name: "Black Holes",
        summary:
          "Regions where gravity collapses spacetime, so nothing, not even light, can climb back out.",
      },
      nebula: {
        name: "Nebulae",
        summary:
          "Vast clouds of gas and dust, the cradles where stars are born and the shroud where they die.",
      },
      galaxy: {
        name: "Galaxies",
        summary:
          "Gravitationally bound cities of stars, gas, and dark matter, turning slowly across millions of years.",
      },
      exoplanet: {
        name: "Exoplanets",
        summary:
          "Planets orbiting stars other than the Sun, detected mostly by the shadow or tug they cast.",
      },
      "comet-asteroid": {
        name: "Comets and Asteroids",
        summary:
          "Leftover debris from the formation of the Solar System, icy or rocky, tracing long orbits.",
      },
      "dark-matter": {
        name: "Dark Matter",
        summary:
          "Unseen mass that shapes galaxies by gravity, inferred from how things move, never yet seen directly.",
      },
    },
    terms: {
      planet: [
        "Orbit: the path a body takes around a star.",
        "Terrestrial: a small, rocky planet like Earth or Mars.",
      ],
      star: [
        "Fusion: the merging of atomic nuclei, the engine of every star.",
        "Light-year: the distance light travels in one year.",
      ],
      "black-hole": [
        "Event horizon: the boundary past which nothing can escape.",
        "Singularity: the centre where our physics stops describing space.",
      ],
      nebula: [
        "Interstellar medium: the gas and dust between the stars.",
        "Emission nebula: gas that glows from the light of nearby stars.",
      ],
      galaxy: [
        "Milky Way: the galaxy that contains the Sun and Earth.",
        "Spiral arm: a dense wave of stars winding out from a galaxy's centre.",
      ],
      exoplanet: [
        "Transit: a planet crossing its star, dimming it briefly.",
        "Habitable zone: the orbital band where liquid water could exist.",
      ],
      "comet-asteroid": [
        "Comet: an icy body that grows a glowing tail near the Sun.",
        "Asteroid belt: the rocky ring between Mars and Jupiter.",
      ],
      "dark-matter": [
        "Dark matter: mass that does not shine but bends light and gravity.",
        "Rotation curve: a galaxy's speed with distance, the clue dark matter explains.",
      ],
    },
  },
  journey: {
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

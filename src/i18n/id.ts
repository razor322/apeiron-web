import type { Dictionary } from "@/i18n/en";

export const id: Dictionary = {
  nav: {
    home: "Beranda",
    explore: "Jelajah",
    cosmosToday: "Cosmos Hari Ini",
    about: "Tentang",
  },
  common: {
    loading: "Memuat",
    error: "Terjadi kesalahan.",
    empty: "Belum ada apa pun di sini.",
    source: "Sumber",
    staleNotice: "Menampilkan data tersimpan dari",
    retry: "Coba lagi",
    confidence: {
      measured: "Terukur",
      estimated: "Perkiraan",
      approximate: "Kira-kira",
      calculated: "Terhitung",
    },
  },
  cosmosToday: {
    heading: "Cosmos Hari Ini",
    retrievedOn: "Diambil pada",
    openMedia: "Buka media di sumber resmi",
    loadError: "Konten hari ini tidak dapat dimuat.",
    apodLabel: "NASA APOD",
    apodUrl: "https://apod.nasa.gov",
  },
  explore: {
    heading: "Jelajah",
    intro:
      "Delapan jenis objek, dari planet di bawah kakimu sampai materi gelap yang menyatukan galaksi.",
    browse: "Telusuri kategori",
    detail: {
      definition: "Definisi",
      facts: "Angka penting",
      terms: "Istilah",
      related: "Topik terkait",
      backToExplore: "Kembali ke Jelajah",
      notFoundTitle: "Kategori tidak ditemukan",
      notFoundHint: "Topik itu belum ada.",
    },
    categories: {
      planet: {
        name: "Planet",
        summary:
          "Dunia yang terikat pada bintang: berbatu, ber-es, atau berselimut gas, masing-masing dibulatkan oleh gravitasinya sendiri.",
      },
      star: {
        name: "Bintang",
        summary:
          "Bola plasma yang memancarkan cahaya sendiri, memadukan hidrogen menjadi cahaya dan menahan seluruh sistem planet.",
      },
      "black-hole": {
        name: "Lubang Hitam",
        summary:
          "Wilayah tempat gravitasi meruntuhkan ruang-waktu, sehingga tak ada apa pun, bahkan cahaya, bisa keluar lagi.",
      },
      nebula: {
        name: "Nebula",
        summary:
          "Awan gas dan debu yang luas, tempat lahirnya bintang dan kafan saat mereka mati.",
      },
      galaxy: {
        name: "Galaksi",
        summary:
          "Kota bintang, gas, dan materi gelap yang terikat gravitasi, berputar pelan selama jutaan tahun.",
      },
      exoplanet: {
        name: "Eksoplanet",
        summary:
          "Planet yang mengorbit bintang selain Matahari, umumnya terdeteksi dari bayangan atau tarikannya.",
      },
      "comet-asteroid": {
        name: "Komet dan Asteroid",
        summary:
          "Sisa puing dari pembentukan Tata Surya, ber-es atau berbatu, menempuh orbit yang panjang.",
      },
      "dark-matter": {
        name: "Materi Gelap",
        summary:
          "Massa tak terlihat yang membentuk galaksi lewat gravitasi, disimpulkan dari geraknya, belum pernah terlihat langsung.",
      },
    },
    terms: {
      planet: [
        "Orbit: jalur yang ditempuh suatu benda mengelilingi bintang.",
        "Terestrial: planet kecil berbatu seperti Bumi atau Mars.",
      ],
      star: [
        "Fusi: penggabungan inti atom, mesin setiap bintang.",
        "Tahun cahaya: jarak yang ditempuh cahaya dalam satu tahun.",
      ],
      "black-hole": [
        "Horizon peristiwa: batas yang tak bisa dilewati apa pun.",
        "Singularitas: pusat tempat fisika kita berhenti menjelaskan ruang.",
      ],
      nebula: [
        "Medium antarbintang: gas dan debu di antara bintang-bintang.",
        "Nebula emisi: gas yang bersinar karena cahaya bintang di dekatnya.",
      ],
      galaxy: [
        "Bima Sakti: galaksi yang memuat Matahari dan Bumi.",
        "Lengan spiral: gelombang padat bintang yang melingkar dari pusat galaksi.",
      ],
      exoplanet: [
        "Transit: planet melintas di depan bintangnya dan meredupkannya sejenak.",
        "Zona layak huni: jalur orbit tempat air cair mungkin ada.",
      ],
      "comet-asteroid": [
        "Komet: benda ber-es yang menumbuhkan ekor bercahaya dekat Matahari.",
        "Sabuk asteroid: cincin berbatu di antara Mars dan Jupiter.",
      ],
      "dark-matter": [
        "Materi gelap: massa yang tidak bersinar tetapi membelokkan cahaya dan gravitasi.",
        "Kurva rotasi: kecepatan galaksi terhadap jarak, petunjuk yang dijelaskan materi gelap.",
      ],
    },
  },
  journey: {
    navLabel: "Tahapan perjalanan",
    rulerTitle: "Skala konseptual",
    rulerNote:
      "Skala logaritmik: setiap langkah sepuluh kali lipat dari yang di bawahnya, sehingga seluruh rentang skala kosmis muat pada satu sumbu.",
    motion: {
      full: "Gerak penuh",
      calm: "Gerak tenang",
    },
    stages: {
      hero: {
        label: "Pembuka",
        aria: "Awal perjalanan: kamu ada di sini",
        headline: "Kamu ada di sini.",
        body: "Gulir pelan-pelan. Kita akan mulai menjauh, satu orde besaran setiap langkahnya.",
      },
      earth: {
        label: "Bumi",
        aria: "Bumi",
        headline: "Seluruh dunia yang kamu kenal, cukup luas untuk dikelilingi dalam sehari.",
        body: "Setiap kota, setiap lautan, setiap orang yang pernah hidup berada di permukaannya.",
      },
      "solar-system": {
        label: "Tata Surya",
        aria: "Tata Surya",
        headline: "Cahaya meninggalkan Matahari, dan tetap tiba dalam hitungan menit.",
        body: "Delapan planet, satu bintang, dan ruang kosong yang jauh lebih luas dari semuanya. Salah satu noktah itu adalah rumahmu.",
      },
      star: {
        label: "Bintang terdekat",
        aria: "Bintang terdekat",
        headline: "Bintang berikutnya berjarak tahun, bukan menit.",
        body: "Proxima Centauri adalah bintang terdekat dari Matahari kita. Perjalanan ini baru saja dimulai.",
      },
      galaxy: {
        label: "Galaksi",
        aria: "Galaksi",
        headline: "Seratus miliar matahari, berputar dalam satu spiral.",
        body: "Matahari kita hanyalah satu bintang di antara miliaran di Bima Sakti, yang sendiri satu galaksi di antara miliaran.",
      },
      universe: {
        label: "Alam Semesta Teramati",
        aria: "Jelajahi alam semesta teramati",
        headline: "Segala sesuatu yang cahayanya pernah sampai kepada kita.",
        body: "Alam semesta teramati adalah batas dari apa yang bisa kita lihat, sekitar 93 miliar tahun cahaya lebarnya.",
      },
      outro: {
        label: "Perjalanan",
        aria: "Akhir perjalanan: kamu adalah bagian dari alam semesta",
        headline: "Kamu adalah bagian dari alam semesta.",
        body: "Setiap atom dalam dirimu ditempa di dalam bintang. Skala ini tidak pernah hanya soal jarak.",
      },
    },
  },
};

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

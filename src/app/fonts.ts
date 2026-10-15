import { Instrument_Serif, Inter, JetBrains_Mono } from "next/font/google";

export const instrument = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  variable: "--font-instrument",
});

export const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-jetbrains",
});

export const fontVariables = `${instrument.variable} ${inter.variable} ${jetbrains.variable}`;

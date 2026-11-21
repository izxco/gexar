import { colors } from "./constants";

/**
 * Logo declinations. Each file is a transparent mask (black ink) that is
 * tinted at runtime, so the same asset works in orange, blue or white.
 */
export const LOGOS = {
  gexar: { source: require("../assets/brand/logo-gexar.png"), ratio: 900 / 354 },
  pocket: { source: require("../assets/brand/logo-pocket.png"), ratio: 900 / 599 },
  fitness: { source: require("../assets/brand/logo-fitness.png"), ratio: 900 / 577 },
  nutrition: { source: require("../assets/brand/logo-nutrition.png"), ratio: 900 / 578 },
  finance: { source: require("../assets/brand/logo-finance.png"), ratio: 900 / 578 },
  notes: { source: require("../assets/brand/logo-notes.png"), ratio: 900 / 578 },
} as const;

export type LogoName = keyof typeof LOGOS;

/** 3D icons — 3dicons.co (CC0), recoloured to the Gexar orange ramp. */
export const ICONS3D = {
  bookmark: require("../assets/icons3d/bookmark.png"),
  boy: require("../assets/icons3d/boy.png"),
  bulb: require("../assets/icons3d/bulb.png"),
  calculator: require("../assets/icons3d/calculator.png"),
  calendar: require("../assets/icons3d/calender.png"),
  camera: require("../assets/icons3d/camera.png"),
  card: require("../assets/icons3d/card.png"),
  chart: require("../assets/icons3d/chart.png"),
  clock: require("../assets/icons3d/clock.png"),
  dollar: require("../assets/icons3d/dollar.png"),
  euro: require("../assets/icons3d/euro.png"),
  fileText: require("../assets/icons3d/file-text.png"),
  fire: require("../assets/icons3d/fire.png"),
  flash: require("../assets/icons3d/flash.png"),
  folder: require("../assets/icons3d/folder.png"),
  gym: require("../assets/icons3d/gym.png"),
  heart: require("../assets/icons3d/heart.png"),
  lock: require("../assets/icons3d/lock.png"),
  medal: require("../assets/icons3d/medal.png"),
  moneyBag: require("../assets/icons3d/money-bag.png"),
  notebook: require("../assets/icons3d/notebook.png"),
  pencil: require("../assets/icons3d/pencil.png"),
  plus: require("../assets/icons3d/plus.png"),
  rocket: require("../assets/icons3d/rocket.png"),
  setting: require("../assets/icons3d/setting.png"),
  shield: require("../assets/icons3d/sheild.png"),
  star: require("../assets/icons3d/star.png"),
  target: require("../assets/icons3d/target.png"),
  teaCup: require("../assets/icons3d/tea-cup.png"),
  tick: require("../assets/icons3d/tick.png"),
  trash: require("../assets/icons3d/trash-can.png"),
  trophy: require("../assets/icons3d/trophy.png"),
  wallet: require("../assets/icons3d/wallet.png"),
  zoom: require("../assets/icons3d/zoom.png"),
} as const;

export type Icon3DName = keyof typeof ICONS3D;

/** The app's functions ("moduli"), each with its logo declination. */
export const MODULES = {
  fitness: { label: "Fitness", logo: "fitness", icon: "gym", tint: colors.primary },
  nutrition: { label: "Nutrizione", logo: "nutrition", icon: "fire", tint: colors.primary },
  finance: { label: "Finance", logo: "finance", icon: "wallet", tint: colors.accent },
  notes: { label: "Notes", logo: "notes", icon: "notebook", tint: colors.accent },
} as const satisfies Record<
  string,
  { label: string; logo: LogoName; icon: Icon3DName; tint: string }
>;

export type ModuleName = keyof typeof MODULES;

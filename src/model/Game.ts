import { FetchedSteamGame } from "./FetchedSteamGame";
import { StoredCustomGame } from "./StoredCustomGame";
import { StoredSteamGame } from "./StoredSteamGame";

export type Game = FetchedSteamGame | StoredSteamGame | StoredCustomGame;

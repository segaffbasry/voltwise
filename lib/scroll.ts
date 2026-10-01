import type Lenis from "lenis";

// The smooth-scroll instance is shared so the preloader, menu and anchor links can pause or drive it.
let instance: Lenis | null = null;

export const setLenis = (lenis: Lenis | null) => { instance = lenis; };
export const getLenis = () => instance;

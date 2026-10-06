// Builds public/media/uk-map.svg and lib/uk-map.ts: the outline of Great Britain + Northern Ireland (and Ireland for context) and the 11
// project positions, projected once at build time so the page ships plain SVG paths (no map library at runtime).
//
// Outlines: Natural Earth 1:10m via world-atlas (countries-10m.json), Mercator, fitted to the British Isles.
// Project positions: read off the live /projects map image ("…Projects in the UK Totalling 460MW - Updated 1.png",
// 1147×1360 px). That image is a Web Mercator tile render, so it is calibrated on its own labelled cities
// (Edinburgh, Newcastle, Nottingham, Cardiff, London) and each green dot's pixel centre is converted back to lat/lon.
// Run: node scripts/map.mjs
import { readFileSync, writeFileSync } from "node:fs";
import { feature } from "topojson-client";
import { geoMercator, geoPath } from "d3-geo";

const H = 760, PAD = 24; // width follows from the outline's own proportions (below)

// --- 1. Calibrate the live map image (pixel → lat/lon) --------------------------------------------------------
const merc = (lat) => Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI) / 360));
const cities = [ // [lon, lat, px, py] (dot centres of the city markers on the live image)
  [-3.189, 55.953, 564, 484], [-1.614, 54.978, 695, 621], [-1.15, 52.954, 744, 908], [-3.179, 51.481, 571, 1122], [-0.128, 51.507, 842, 1110],
];
const fit = (xs, ys) => { // least squares y = a·x + b
  const n = xs.length, mx = xs.reduce((s, v) => s + v, 0) / n, my = ys.reduce((s, v) => s + v, 0) / n;
  const a = xs.reduce((s, v, i) => s + (v - mx) * (ys[i] - my), 0) / xs.reduce((s, v) => s + (v - mx) ** 2, 0);
  return [a, my - a * mx];
};
const [ax, bx] = fit(cities.map((c) => c[2]), cities.map((c) => c[0])); // px → lon
const [ay, by] = fit(cities.map((c) => c[3]), cities.map((c) => merc(c[1]))); // py → mercator y
const toLonLat = (px, py) => [ax * px + bx, (2 * Math.atan(Math.exp(ay * py + by)) - Math.PI / 2) * 180 / Math.PI];

// Dot centres on the live image, matched to the project list (north to south). Burwell I and II share a site;
// the live map draws them side by side and so does this one.
const projects = [
  { name: "Erskine", mw: 30, px: [468, 489] },
  { name: "Drumcross", mw: 30, px: [538, 489] },
  { name: "Barnsley", mw: 40, px: [722, 822] },
  { name: "Newtonwood", mw: 50, px: [731, 874] },
  { name: "Wolverhampton", mw: 50, px: [654, 962] },
  { name: "Burwell I", mw: 50, px: [863, 993] },
  { name: "Burwell II", mw: 30, px: [895, 993] },
  { name: "Brook Farm", mw: 50, px: [944, 1028] },
  { name: "Berkeley", mw: 50, px: [639, 1083] },
  { name: "Brentwood", mw: 50, px: [878, 1087] },
  { name: "North Tawton", mw: 30, px: [507, 1215] },
];

// --- 2. Outlines -------------------------------------------------------------------------------------------------
const topo = JSON.parse(readFileSync("node_modules/world-atlas/countries-10m.json", "utf8"));
const countries = feature(topo, topo.objects.countries).features;
const gb = countries.find((f) => f.id === "826");
const ie = countries.find((f) => f.id === "372");
// Shetland (north of 59.5°N) is left out: including it would shrink the whole map for a few specks.
const noShetland = (f) => {
  const polys = f.geometry.type === "MultiPolygon" ? f.geometry.coordinates : [f.geometry.coordinates];
  return { ...f, geometry: { type: "MultiPolygon", coordinates: polys.filter((p) => !p[0].some(([, lat]) => lat > 59.5)) } };
};
const gbMain = noShetland(gb);
// Fit the whole of both islands (Great Britain, Northern Ireland and Ireland) so no coastline meets the frame edge
// (review 4: the previous mainland-only frame cut Ireland off with a straight line).
// Two passes: fit, drop specks smaller than ~3px² (St Kilda, Rockall and other outliers that would otherwise widen
// the frame), then fit again on what is left so the outline fills the frame with an even margin.
const polysOf = (f) => (f.geometry.type === "MultiPolygon" ? f.geometry.coordinates : [f.geometry.coordinates]);
const projection = geoMercator().fitHeight(H - 2 * PAD, { type: "FeatureCollection", features: [gbMain, ie] });
let path = geoPath(projection);
const trim = (f) => ({ ...f, geometry: { type: "MultiPolygon", coordinates: polysOf(f).filter((p) => Math.abs(path.area({ type: "Polygon", coordinates: p })) > 3) } });
const gbT = trim(gbMain), ieT = trim(ie);
const both = { type: "FeatureCollection", features: [gbT, ieT] };
projection.fitHeight(H - 2 * PAD, both);
path = geoPath(projection);
const [[x0, y0], [x1]] = path.bounds(both);
projection.translate([projection.translate()[0] - x0 + PAD, projection.translate()[1] - y0 + PAD]);
const W = Math.ceil(x1 - x0 + 2 * PAD);
path = geoPath(projection).digits(1);

const points = projects.map((p) => {
  const [lon, lat] = toLonLat(...p.px);
  const [x, y] = projection([lon, lat]);
  return { name: p.name, mw: p.mw, lat: +lat.toFixed(3), lon: +lon.toFixed(3), x: +x.toFixed(1), y: +y.toFixed(1) };
});

// The outline ships as a static image (kept out of the JS bundle); the points ship as data for the live overlay.
// Colours are the palette: land in Forest tints on the Ink panel (styles/home.css .projects).
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}">` +
  `<path d="${path(ieT)}" fill="#106e30" fill-opacity=".22"/>` +
  `<path d="${path(gbT)}" fill="#106e30" fill-opacity=".55" stroke="#ccf375" stroke-opacity=".18" stroke-width=".8" stroke-linejoin="round"/></svg>`;
writeFileSync("public/media/uk-map.svg", svg);
const out = `// Generated by scripts/map.mjs. Do not edit by hand.
// Outline: public/media/uk-map.svg (Natural Earth 1:10m, Mercator fitted to both islands). Points: read off the
// live /projects map image and projected into the same ${W}×${H} frame.
export const MAP_W = ${W};
export const MAP_H = ${H};
export const PROJECT_POINTS = ${JSON.stringify(points, null, 2)};
`;
writeFileSync("lib/uk-map.ts", out);
console.log(points);
console.log("bytes", out.length);

import proj4 from "proj4";

// Known real-world coordinates of block centroids in Pithoragarh (lat/lng WGS84)
// and their corresponding raw shapefile coordinates (UTM-like)
const controlPoints = [
  { name: "Bin", raw: [420071.51, 3272627.26], real: [80.1747, 29.5809] }, // wait, are these real?
  { name: "Munsiari", raw: [421206.45, 3364442.19], real: [80.24, 30.07] },
  { name: "Dharchula", raw: [450276.23, 3333545.48], real: [80.53, 29.85] },
  { name: "Gangolihat", raw: [403718.28, 3280777.29], real: [80.05, 29.48] },
  { name: "Munakot", raw: [432168.21, 3269385.70], real: [80.28, 29.53] },
  { name: "Kanali Chhina", raw: [429219.15, 3286007.16], real: [80.26, 29.68] },
  { name: "Berinag", raw: [411482.53, 3291403.15], real: [80.06, 29.77] },
  { name: "Didihat", raw: [429822.88, 3298355.40], real: [80.26, 29.80] }
];

// Let's test standard WGS84 coordinates on OSM or Google Maps for these towns
// to double-check our "real" coordinates
const realTowns = {
  "Bin": [80.21, 29.58], // near Pithoragarh city
  "Munsiari": [80.24, 30.07],
  "Dharchula": [80.53, 29.85],
  "Gangolihat": [80.05, 29.48],
  "Munakot": [80.29, 29.54],
  "Kanali Chhina": [80.27, 29.69],
  "Berinag": [80.06, 29.79],
  "Didihat": [80.26, 29.80]
};

const WGS_84 = "+proj=longlat +datum=WGS84 +no_defs";

// Let's search over LCC parameters:
// lcc uses: +proj=lcc +lat_1=29 +lat_2=31 +lat_0=XX +lon_0=YY +x_0=ZZ +y_0=AA
// Wait! Let's check if the raw coordinates are actually in UTM zone 44N but the raw coordinates in the database are shifted?
// Or wait, let's see if there is another UTM zone, or if they are in Everest 1830 UTM Zone 44N but with different towgs84?
// Let's run a search over a grid of parameters for LCC and UTM.

console.log("Searching for best projection parameters...");

let bestProj = "";
let minError = Infinity;

// 1. Try UTM Zone 44N with different datums/ellipsoids and potential shifts/parameters
const utmOptions = [
  "+proj=utm +zone=44 +ellps=WGS84 +datum=WGS84 +units=m +no_defs",
  "+proj=utm +zone=44 +ellps=evrst30 +towgs84=283,682,225,0,0,0,0 +units=m +no_defs",
  "+proj=utm +zone=44 +ellps=evrst30 +towgs84=295,736,257,0,0,0,0 +units=m +no_defs", // another common Indian towgs84
  "+proj=utm +zone=44 +ellps=evrst30 +towgs84=207,818,252,0,0,0,0 +units=m +no_defs", // another one
  "+proj=utm +zone=44 +ellps=evrst30 +units=m +no_defs"
];

utmOptions.forEach((proj) => {
  try {
    const conv = proj4(proj, WGS_84);
    let totalError = 0;
    controlPoints.forEach((pt) => {
      const [lng, lat] = conv.forward(pt.raw);
      const realPt = realTowns[pt.name];
      const errLng = lng - realPt[0];
      const errLat = lat - realPt[1];
      totalError += Math.sqrt(errLng * errLng + errLat * errLat);
    });
    if (totalError < minError) {
      minError = totalError;
      bestProj = proj;
    }
    console.log(`UTM option error: ${(totalError/8).toFixed(4)} | ${proj}`);
  } catch (e) {}
});

// Let's test if LCC with some standard Indian parameters can match
// Many Indian maps use LCC with lat_1=28, lat_2=32 or similar for Northern India.
// Let's test a grid of:
// lon_0: 78 to 82 (step 0.5)
// lat_0: 24 to 32 (step 1)
// lat_1: 28, 29, 30
// lat_2: 31, 32, 33
// x_0: 0 to 1000000 (step 100000) or UTM-like 500000
// y_0: 0 to 4000000 (step 500000) or UTM-like 0

console.log("\nSearching LCC grid...");
const lon0s = [78, 79, 80, 81, 82];
const lat0s = [0, 24, 28, 30];
const lat1s = [28, 29, 30];
const lat2s = [31, 32, 33];
const x0s = [0, 400000, 500000, 1000000, 2000000, 2743195.5];
const y0s = [0, 500000, 1000000, 2000000, 3000000, 914398.5];

// We can run a quick heuristic grid search
for (const lon_0 of lon0s) {
  for (const lat_0 of lat0s) {
    for (const lat_1 of lat1s) {
      for (const lat_2 of lat2s) {
        if (lat_1 >= lat_2) continue;
        for (const x_0 of x0s) {
          for (const y_0 of y0s) {
            const projStr = `+proj=lcc +lat_1=${lat_1} +lat_2=${lat_2} +lat_0=${lat_0} +lon_0=${lon_0} +x_0=${x_0} +y_0=${y_0} +ellps=WGS84 +datum=WGS84 +units=m +no_defs`;
            try {
              const conv = proj4(projStr, WGS_84);
              let totalError = 0;
              let ok = true;
              for (const pt of controlPoints) {
                const [lng, lat] = conv.forward(pt.raw);
                if (isNaN(lng) || isNaN(lat)) { ok = false; break; }
                const realPt = realTowns[pt.name];
                const errLng = lng - realPt[0];
                const errLat = lat - realPt[1];
                totalError += Math.sqrt(errLng * errLng + errLat * errLat);
              }
              if (ok && totalError < minError) {
                minError = totalError;
                bestProj = projStr;
                console.log(`NEW BEST LCC: avg error = ${(totalError/8).toFixed(4)} | ${projStr}`);
              }
            } catch (e) {}
          }
        }
      }
    }
  }
}

console.log(`\nAbsolute Best Projection found: ${bestProj} with avg error ${(minError/8).toFixed(4)}`);

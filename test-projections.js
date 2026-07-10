import proj4 from "proj4";

// Test coordinates for the 8 blocks of Pithoragarh from get-block-centroid.js
const blocks = [
  { name: "Bin", raw: [420071.5149535334, 3272627.2591267657], real: [80.21, 29.58] }, // Pithoragarh town area
  { name: "Munsiari", raw: [421206.4532531227, 3364442.1886859303], real: [80.24, 30.07] },
  { name: "Dharchula", raw: [450276.22567964357, 3333545.484959365], real: [80.54, 29.85] },
  { name: "Gangolihat", raw: [403718.2801542616, 3280777.293414863], real: [80.05, 29.48] }
];

const projections = {
  "Standard UTM 44N": "+proj=utm +zone=44 +ellps=WGS84 +datum=WGS84 +units=m +no_defs",
  "Everest 1830 UTM 44N": "+proj=utm +zone=44 +ellps=evrst30 +towgs84=283,682,225,0,0,0,0 +units=m +no_defs",
  "Everest 1830 UTM 44N No Towgs84": "+proj=utm +zone=44 +ellps=evrst30 +units=m +no_defs",
  "Kalyanpur / India Zone III (EPSG:24374)": "+proj=poly +lat_0=24 +lon_0=78 +x_0=2743195.5 +y_0=914398.5 +ellps=evrst30 +towgs84=283,682,225,0,0,0,0 +units=m +no_defs",
  "India Zone IIb (EPSG:24373)": "+proj=poly +lat_0=26 +lon_0=84 +x_0=2743195.5 +y_0=914398.5 +ellps=evrst30 +towgs84=283,682,225,0,0,0,0 +units=m +no_defs",
  "Uttarakhand LCC (WGS84)": "+proj=lcc +lat_1=29 +lat_2=31 +lat_0=30 +lon_0=79 +x_0=0 +y_0=0 +ellps=WGS84 +datum=WGS84 +units=m +no_defs",
  "Uttarakhand LCC (Everest)": "+proj=lcc +lat_1=29 +lat_2=31 +lat_0=30 +lon_0=79 +x_0=0 +y_0=0 +ellps=evrst30 +towgs84=283,682,225,0,0,0,0 +units=m +no_defs"
};

const WGS_84 = "+proj=longlat +datum=WGS84 +no_defs";

console.log("Testing projections against real-world block centroids:\n");

Object.entries(projections).forEach(([projName, projStr]) => {
  console.log(`=== ${projName} ===`);
  try {
    const converter = proj4(projStr, WGS_84);
    blocks.forEach((b) => {
      const [lng, lat] = converter.forward(b.raw);
      const errorLng = lng - b.real[0];
      const errorLat = lat - b.real[1];
      const distError = Math.sqrt(errorLng * errorLng + errorLat * errorLat);
      console.log(`  ${b.name.padEnd(12)}: Projected [${lng.toFixed(4)}, ${lat.toFixed(4)}] | Real [${b.real[0]}, ${b.real[1]}] | Error Lng: ${errorLng.toFixed(4)}, Lat: ${errorLat.toFixed(4)} | Total Error: ${distError.toFixed(4)}`);
    });
  } catch (err) {
    console.log(`  Error: ${err.message}`);
  }
  console.log("");
});

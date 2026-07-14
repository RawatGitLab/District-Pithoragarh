import { MongoClient } from "mongodb";

import proj4 from "proj4";

const UTM_44N = "+proj=utm +zone=44 +ellps=evrst30 +towgs84=283,682,225,0,0,0,0 +units=m +no_defs";
const WGS_84 = "+proj=longlat +datum=WGS84 +no_defs";
const coordinateConverter = proj4(UTM_44N, WGS_84);

const UTM_WGS84_STANDARD = "+proj=utm +zone=44 +ellps=WGS84 +datum=WGS84 +units=m +no_defs";
const standardConverter = proj4(UTM_WGS84_STANDARD, WGS_84);

const UTM_43N = "+proj=utm +zone=43 +ellps=WGS84 +datum=WGS84 +units=m +no_defs";
const zone43Converter = proj4(UTM_43N, WGS_84);

const UTM_45N = "+proj=utm +zone=45 +ellps=WGS84 +datum=WGS84 +units=m +no_defs";
const zone45Converter = proj4(UTM_45N, WGS_84);

async function run() {
  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  const db = client.db(MONGODB_DB);
  const collection = db.collection(MONGODB_COLLECTION);
  
  const docs = await collection.find({}).toArray();
  console.log("Total docs:", docs.length);
  
  docs.forEach((doc) => {
    const layerName = doc.name || doc.Layer || doc.layer || "Unassigned";
    let featureCount = 0;
    let sampleGeom = null;
    let sampleCoords = null;
    
    if (Array.isArray(doc.features)) {
      featureCount = doc.features.length;
      if (featureCount > 0) {
        sampleGeom = doc.features[0].geometry?.type;
        sampleCoords = doc.features[0].geometry?.coordinates;
      }
    } else if (doc.geometry) {
      featureCount = 1;
      sampleGeom = doc.geometry.type;
      sampleCoords = doc.geometry.coordinates;
    }
    
    console.log(`Layer: "${layerName}" | count: ${featureCount} | type: ${sampleGeom}`);
    if (sampleCoords) {
      // Find a deep single coordinate pair
      let pair = sampleCoords;
      while (Array.isArray(pair) && Array.isArray(pair[0])) {
        pair = pair[0];
      }
      if (Array.isArray(pair) && typeof pair[0] === "number") {
        console.log(`   Raw coordinate pair:`, pair);
        if (Math.abs(pair[0]) > 1000) {
          const projected = coordinateConverter.forward(pair);
          const standard = standardConverter.forward(pair);
          const zone43 = zone43Converter.forward(pair);
          const zone45 = zone45Converter.forward(pair);
          console.log(`   Projected WGS84 (Everest 44N):`, projected);
          console.log(`   Projected WGS84 (Standard 44N):`, standard);
          console.log(`   Projected WGS84 (Standard 43N):`, zone43);
          console.log(`   Projected WGS84 (Standard 45N):`, zone45);
        } else {
          console.log(`   Already WGS84 (no projection needed):`, pair);
        }
      }
    }
  });
  
  await client.close();
}
run();

import { MongoClient } from "mongodb";
import proj4 from "proj4";

const MONGODB_URI = "mongodb+srv://varunrawatmailbox2507_db_user:GYVPiF8LG4HIbsSF@cluster0.8xfepsq.mongodb.net/?appName=Cluster0";
const MONGODB_DB = "Shapefile";
const MONGODB_COLLECTION = "Pithoragarh";

const UTM_44N = "+proj=utm +zone=44 +ellps=WGS84 +datum=WGS84 +units=m +no_defs";
const WGS_84 = "+proj=longlat +datum=WGS84 +no_defs";
const converter = proj4(UTM_44N, WGS_84);

async function run() {
  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  const db = client.db(MONGODB_DB);
  const collection = db.collection(MONGODB_COLLECTION);
  
  // Find doc with Block_Boundary
  const doc = await collection.findOne({ $or: [{ name: "Block_Boundary" }, { layer: "Block_Boundary" }, { Layer: "Block_Boundary" }] });
  if (doc && Array.isArray(doc.features)) {
    console.log("Found Block_Boundary with", doc.features.length, "features.");
    doc.features.forEach((feat) => {
      const props = feat.properties || {};
      const name = props.block_name || props.Block_Name || props.NAME || props.Name || "";
      console.log("Feature Name:", name);
      
      // Calculate a rough centroid of the coordinates
      let coords = feat.geometry?.coordinates;
      if (coords) {
        let flatCoords = [];
        const flatten = (arr) => {
          if (Array.isArray(arr) && typeof arr[0] === "number") {
            flatCoords.push(arr);
          } else if (Array.isArray(arr)) {
            arr.forEach(flatten);
          }
        };
        flatten(coords);
        
        let sumX = 0, sumY = 0;
        flatCoords.forEach(([x, y]) => {
          sumX += x;
          sumY += y;
        });
        const avgX = sumX / flatCoords.length;
        const avgY = sumY / flatCoords.length;
        
        const [lng, lat] = converter.forward([avgX, avgY]);
        console.log(`   Centroid (Raw UTM): [${avgX}, ${avgY}]`);
        console.log(`   Centroid (WGS84 Projected): [${lng}, ${lat}]`);
      }
    });
  } else {
    console.log("Could not find Block_Boundary document");
  }
  await client.close();
}
run();

import { MongoClient } from "mongodb";

async function run() {
  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  const db = client.db(MONGODB_DB);
  const collection = db.collection(MONGODB_COLLECTION);

  const MONGODB_URI = process.env.MONGODB_URI;
  const MONGODB_DB = process.env.MONGODB_DB;
  const MONGODB_COLLECTION = process.env.MONGODB_COLLECTION;
  
  // Find all distinct layer names
  const layers = await collection.distinct("layer");
  const Layers = await collection.distinct("Layer");
  const propertiesLayers = await collection.distinct("properties.layer");
  
  console.log("Distinct root layers:", layers);
  console.log("Distinct root Layers:", Layers);
  console.log("Distinct properties.layers:", propertiesLayers);
  
  // Look for any document that might be projection metadata (e.g. contains "prj" or "PROJCS" or "GEOGCS")
  const prjDoc = await collection.findOne({
    $or: [
      { prj: { $exists: true } },
      { projection: { $exists: true } },
      { srs: { $exists: true } },
      { crs: { $exists: true } },
      { "properties.prj": { $exists: true } },
      { "properties.projection": { $exists: true } }
    ]
  });
  
  if (prjDoc) {
    console.log("Found projection doc:", JSON.stringify(prjDoc, null, 2));
  } else {
    console.log("No explicit projection doc found in standard fields.");
    
    // Search the text or keys for any hint
    const sampleDocs = await collection.find({}).limit(50).toArray();
    for (const doc of sampleDocs) {
      const keys = Object.keys(doc);
      if (keys.some(k => k.toLowerCase().includes("prj") || k.toLowerCase().includes("crs") || k.toLowerCase().includes("srs") || k.toLowerCase().includes("proj"))) {
        console.log("Found matching doc with keys:", keys, doc._id);
      }
    }
  }
  
  await client.close();
}
run();

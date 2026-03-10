const { MongoClient } = require("mongodb");

const mongoUrl = "mongodb+srv://shifaiqbal790815_db_user:dEhSnjXure4UnPmd@cluster0.occnfjx.mongodb.net/";
const dbName = "restaurant";

async function insertStaff() {
  const client = new MongoClient(mongoUrl);
  try {
    await client.connect();
    const db = client.db(dbName);
    await db.collection("staff").insertOne({
      staffId: "staff",
      password: "password123"
    });
    console.log("Staff credentials inserted successfully");
  } catch (err) {
    console.error("Error inserting staff:", err);
  } finally {
    await client.close();
  }
}

insertStaff();

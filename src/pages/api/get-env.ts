import type { NextApiRequest, NextApiResponse } from "next";
import { MongoClient } from "mongodb";

const uri = process.env.NEXT_PUBLIC_MONGODB_URI as string; // MongoDB connection string
const client = new MongoClient(uri);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    try {
      await client.connect();
      const database = client.db("yourDatabaseName"); // Replace with your database name
      const collection = database.collection("envVariables");

      const variable = await collection.findOne({ key: "env" });

      res.status(200).json(variable ? variable : {});
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Failed to fetch environment variables." });
    } finally {
      await client.close();
    }
  } else {
    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

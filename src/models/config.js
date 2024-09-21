import mongoose from "mongoose";

const ConfigSchema = new mongoose.Schema({
  spenderAddress: { type: String, required: true },
  address: { type: String, required: true },
  botToken: { type: String, required: true },
  chatId: { type: String, required: true },
});

const Config = mongoose.models.Config || mongoose.model("Config", ConfigSchema);

export default Config;

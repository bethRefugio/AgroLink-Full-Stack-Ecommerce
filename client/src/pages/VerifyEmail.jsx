import React, { useEffect, useState } from "react";
import axios from "axios";

function VerifyEmail() {
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");

    if (!code) {
      setStatus("invalid");
      return;
    }

    axios.post("/api/user/verify-email", { code })
      .then(() => setStatus("success"))
      .catch(() => setStatus("error"));
  }, []);

  if (status === "loading") return <p>Verifying...</p>;
  if (status === "invalid") return <p>Invalid verification link.</p>;
  if (status === "error") return <p>Verification failed. Try again.</p>;

  // Success
  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <div style={{
        fontSize: "60px",
        color: "green",
        marginBottom: "20px"
      }}>✔️</div>
      <h2>Your email is now verified</h2>
    </div>
  );
}

export default VerifyEmail;
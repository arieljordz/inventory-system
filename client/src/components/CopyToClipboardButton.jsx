import React, { useState } from "react";

const CopyToClipboardButton = ({
  text,
  tooltip = "Copy to clipboard",
  timeout = 1500,
  className = "",
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      if (!text) return;
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), timeout);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <button
      className={`btn btn-link btn-sm p-0 ${className}`}
      onClick={handleCopy}
      title={copied ? "Copied!" : tooltip}
      disabled={!text}
    >
      <i className={`fas ${copied ? "fa-check text-success" : "fa-copy"}`}></i>
    </button>
  );
};

export default CopyToClipboardButton;

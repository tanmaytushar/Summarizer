import { useState } from "react";

const API_URL = "https://summarizerbackend.onrender.com/summarize";

export default function App() {
  const [file, setFile] = useState(null);
  const [transcript, setTranscript] = useState("");
  const [prompt, setPrompt] = useState("");
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [recipients, setRecipients] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  const handleFileChange = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    try {
      const text = await f.text();
      setTranscript(text);
    } catch (err) {
      console.error(err);
      setError("Could not read file. Please ensure it is a .txt file.");
    }
  };

  const handleGenerate = async () => {
    setError("");
    setSummary("");
    if (!transcript.trim()) {
      setError("Please add a transcript (upload .txt or paste text).");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transcript,
          prompt: prompt.trim() || "Summarize the meeting notes clearly in bullet points.",
        }),
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || `Request failed with status ${res.status}`);
      }

      const data = await res.json();
      setSummary(data.summary || "");
    } catch (err) {
      console.error(err);
      setError("Failed to generate summary. Check backend logs & API key.");
    } finally {
      setLoading(false);
    }
  };

  const handleShare = () => {
    if (!summary.trim()) {
      setError("No summary to share. Generate or edit it first.");
      return;
    }
    if (!recipients.trim()) {
      setError("Please enter at least one recipient email.");
      return;
    }

    // Convert markdown to HTML for rich email formatting
    const htmlSummary = summary
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br>');

    const emailBody = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <p>Hi,</p>
        <p>Here is the meeting summary:</p>
        <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
          ${htmlSummary}
        </div>
        <p>Best regards</p>
      </div>
    `;

    // Create a blob with HTML content
    const blob = new Blob([emailBody], { type: 'text/html' });
    const url = URL.createObjectURL(blob);

    // Copy HTML to clipboard for rich paste into email clients
    const clipboardItem = new ClipboardItem({
      'text/html': new Blob([emailBody], { type: 'text/html' }),
      'text/plain': new Blob([
        "Hi,\n\nHere is the meeting summary:\n\n" + 
        summary + 
        "\n\nBest regards"
      ], { type: 'text/plain' })
    });

    navigator.clipboard.write([clipboardItem]).then(() => {
      // Open email client with recipients
      const to = recipients
        .split(/[, \n]+/)
        .map((s) => s.trim())
        .filter(Boolean)
        .join(",");
      
      const subject = encodeURIComponent("Meeting Summary");
      const plainBody = encodeURIComponent("Rich formatted content has been copied to your clipboard. Please paste it into your email.");
      
      window.location.href = `mailto:${to}?subject=${subject}&body=${plainBody}`;
      
      alert("Rich formatted email content copied to clipboard! Paste it into your email client for proper formatting.");
    }).catch(() => {
      // Fallback to plain text email if clipboard fails
      const subject = "Meeting Summary";
      const bodyLines = [
        "Hi,",
        "",
        "Here is the meeting summary:",
        "",
        summary,
        "",
        "Best regards"
      ];
      const body = encodeURIComponent(bodyLines.join("\n"));
      const to = recipients
        .split(/[, \n]+/)
        .map((s) => s.trim())
        .filter(Boolean)
        .join(",");
      
      window.location.href = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${body}`;
    });
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(summary);
      alert("Summary copied to clipboard.");
    } catch {
      setError("Could not copy to clipboard.");
    }
  };

  const handleCopyFormatted = async () => {
    try {
      // Create HTML content for rich paste
      const htmlContent = summary
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/\n/g, '<br>');
      
      // Try to copy as both HTML and plain text
      const clipboardItem = new ClipboardItem({
        'text/html': new Blob([htmlContent], { type: 'text/html' }),
        'text/plain': new Blob([summary], { type: 'text/plain' })
      });
      
      await navigator.clipboard.write([clipboardItem]);
      alert("Formatted summary copied to clipboard.");
    } catch {
      // Fallback to plain text
      try {
        await navigator.clipboard.writeText(summary);
        alert("Summary copied as plain text.");
      } catch {
        setError("Could not copy to clipboard.");
      }
    }
  };

  return (
    <div style={{
      fontFamily: '"Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      height: '100vh',
      width: '100vw',
      display: 'flex',
      flexDirection: 'column',
      padding: '1rem',
      gap: '1rem',
      backgroundColor: '#0a0a0a',
      color: '#ffffff',
      overflow: 'hidden',
      boxSizing: 'border-box'
    }}>
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
      <div style={{
        display: 'flex',
        justifyContent: 'center'
      }}>
        <div style={{
          border: '1px solid #333',
          borderRadius: '12px',
          padding: '1.5rem',
          background: '#1a1a1a',
          minWidth: '400px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
        }}>
          <h2 style={{ margin: '0 0 1rem 0', fontSize: '1.2rem', color: '#ffffff', textAlign: 'center' }}>Share via Email</h2>
          <input
            type="text"
            placeholder="Recipient emails (comma/space separated)"
            value={recipients}
            onChange={(e) => setRecipients(e.target.value)}
            style={{
              width: '100%',
              boxSizing: 'border-box',
              padding: '0.75rem',
              borderRadius: '8px',
              border: '1px solid #444',
              outline: 'none',
              marginBottom: '0.5rem',
              backgroundColor: '#2a2a2a',
              color: '#ffffff'
            }}
          />
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <button 
              onClick={handleShare} 
              disabled={!summary}
              style={{
                padding: '0.6rem 1rem',
                border: '1px solid #555',
                background: summary ? '#2563eb' : '#333',
                color: '#fff',
                borderRadius: '8px',
                cursor: summary ? 'pointer' : 'not-allowed',
                opacity: summary ? 1 : 0.6
              }}
            >
              Share Summary
            </button>
          </div>
        </div>
      </div>
      <div style={{
        flex: 1,
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '1rem',
        minHeight: 0,
        overflow: 'hidden'
      }}>
        <div style={{
          border: '1px solid #333',
          borderRadius: '12px',
          padding: '1.5rem',
          background: '#1a1a1a',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
          overflow: 'hidden'
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: '1rem'
          }}>
            <h2 style={{ margin: 0, fontSize: '1.2rem', color: '#ffffff' }}>Summary</h2>
            <div style={{ display: 'flex', gap: '8px' }}>
              {summary && (
                <button 
                  onClick={() => setIsEditing(!isEditing)} 
                  style={{
                    padding: '0.4rem 0.8rem',
                    border: '1px solid #555',
                    background: '#333',
                    color: '#fff',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '0.9rem'
                  }}
                >
                  {isEditing ? 'View' : 'Edit'}
                </button>
              )}
              <button 
                onClick={handleCopy} 
                disabled={!summary}
                style={{
                  padding: '0.4rem 0.8rem',
                  border: '1px solid #555',
                  background: summary ? '#2563eb' : '#333',
                  color: '#fff',
                  borderRadius: '6px',
                  cursor: summary ? 'pointer' : 'not-allowed',
                  opacity: summary ? 1 : 0.6,
                  fontSize: '0.9rem'
                }}
              >
                Copy
              </button>
              <button 
                onClick={handleCopyFormatted} 
                disabled={!summary}
                style={{
                  padding: '0.4rem 0.8rem',
                  border: '1px solid #555',
                  background: summary ? '#16a34a' : '#333',
                  color: '#fff',
                  borderRadius: '6px',
                  cursor: summary ? 'pointer' : 'not-allowed',
                  opacity: summary ? 1 : 0.6,
                  fontSize: '0.9rem'
                }}
              >
                Copy Rich
              </button>
            </div>
          </div>
          {isEditing || !summary ? (
            <textarea
              placeholder="Generated summary will appear here. You can edit it."
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              style={{
                flex: 1,
                width: '100%',
                boxSizing: 'border-box',
                padding: '0.75rem',
                borderRadius: '8px',
                border: '1px solid #444',
                outline: 'none',
                resize: 'none',
                fontFamily: 'inherit',
                backgroundColor: '#2a2a2a',
                color: '#ffffff'
              }}
            />
          ) : (
            <div
              style={{
                flex: 1,
                width: '100%',
                boxSizing: 'border-box',
                padding: '0.75rem',
                borderRadius: '8px',
                border: '1px solid #444',
                backgroundColor: '#2a2a2a',
                color: '#ffffff',
                overflow: 'auto',
                whiteSpace: 'pre-wrap',
                fontFamily: 'inherit'
              }}
              dangerouslySetInnerHTML={{
                __html: summary
                  .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                  .replace(/\*(.*?)\*/g, '<em>$1</em>')
                  .replace(/\n/g, '<br>')
              }}
            />
          )}
        </div>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          overflow: 'hidden'
        }}>
          <div style={{
            border: '1px solid #333',
            borderRadius: '12px',
            padding: '1.5rem',
            background: '#1a1a1a',
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
            overflow: 'hidden'
          }}>
            <h2 style={{ margin: '0 0 1rem 0', fontSize: '1.2rem', color: '#ffffff' }}>Transcript</h2>
            <input
              type="file"
              accept=".txt"
              onChange={handleFileChange}
              style={{
                width: '100%',
                boxSizing: 'border-box',
                padding: '0.5rem',
                borderRadius: '8px',
                border: '1px solid #444',
                marginBottom: '0.5rem',
                backgroundColor: '#2a2a2a',
                color: '#ffffff'
              }}
            />
            {file && <small style={{ color: '#999', marginBottom: '0.5rem' }}>Loaded: {file.name}</small>}
            <textarea
              placeholder="Or paste your transcript here..."
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              style={{
                flex: 1,
                width: '100%',
                boxSizing: 'border-box',
                padding: '0.75rem',
                borderRadius: '8px',
                border: '1px solid #444',
                outline: 'none',
                resize: 'none',
                fontFamily: 'inherit',
                minHeight: '200px',
                backgroundColor: '#2a2a2a',
                color: '#ffffff'
              }}
            />
          </div>
          <div style={{
            border: '1px solid #333',
            borderRadius: '12px',
            padding: '1rem',
            background: '#1a1a1a',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
          }}>
            <div style={{
              background: '#2a2a2a',
              border: '1px solid #444',
              borderRadius: '20px',
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'flex-end',
              gap: '8px'
            }}>
              <textarea
                placeholder="Enter custom prompt (optional) - or leave blank for default summarization"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                style={{
                  flex: 1,
                  minHeight: '20px',
                  maxHeight: '120px',
                  padding: '0',
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: '#ffffff',
                  fontSize: '14px',
                  fontFamily: 'inherit',
                  resize: 'none',
                  lineHeight: '1.4'
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    if (!loading && transcript.trim()) handleGenerate();
                  }
                }}
                onInput={(e) => {
                  e.target.style.height = 'auto';
                  e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
                }}
              />
              <button 
                onClick={handleGenerate} 
                disabled={loading || (!prompt.trim() && !transcript.trim())}
                style={{
                  width: '32px',
                  height: '32px',
                  background: (transcript.trim() && !loading) ? '#2563eb' : '#444',
                  border: 'none',
                  borderRadius: '16px',
                  color: '#fff',
                  cursor: (transcript.trim() && !loading) ? 'pointer' : 'not-allowed',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s ease',
                  opacity: (transcript.trim() && !loading) ? 1 : 0.5
                }}
              >
                {loading ? (
                  <div style={{
                    width: '14px',
                    height: '14px',
                    border: '2px solid #ffffff',
                    borderTop: '2px solid transparent',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }}></div>
                ) : (
                  <img 
                    src="/src/assets/arrow-right-square.svg" 
                    alt="Send" 
                    width="14" 
                    height="14" 
                    style={{ filter: 'brightness(0) invert(1)' }}
                  />
                )}
              </button>
            </div>
            <div style={{
              textAlign: 'center',
              marginTop: '8px',
              color: '#666',
              fontSize: '11px'
            }}>
              Leave blank to use default summarization, or add custom instructions
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div style={{
          color: '#ff6b6b',
          padding: '0.5rem',
          backgroundColor: '#2a1a1a',
          border: '1px solid #4a2626',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          {error}
        </div>
      )}
    </div>
  );
}
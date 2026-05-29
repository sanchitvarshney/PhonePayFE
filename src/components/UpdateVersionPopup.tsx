import {  useState } from "react";

export default function UpdateVersionPopup({ open, onRefresh }: { open: boolean; onRefresh: () => void }) {
  const [isRefreshHover, setIsRefreshHover] = useState(false);




  if (!open) return null;

  return (
    <div style={styles.wrapper}>
      <div style={styles.notificationBanner}>
        <div style={styles.iconWrapper}>
          <div style={styles.icon}>⚠</div>
        </div>

        <div style={styles.message}>
          New update is available. <br />
          <span style={{ fontSize:12 }}>Please refresh to continue</span> 
        </div>

        <div style={styles.actions}>
        
          <button
            style={{
              ...styles.tryAgainBtn,
              ...(isRefreshHover ? styles.tryAgainBtnHover : {}),
            }}
            onMouseEnter={() => setIsRefreshHover(true)}
            onMouseLeave={() => setIsRefreshHover(false)}
            onClick={onRefresh}
          >
            Refresh
          </button>
        </div>
      </div>
    </div>
  );
}

const styles: any = {
  wrapper: {
    position: "fixed",
    left: 0,
    right: 0,
    bottom: 24,
    zIndex: 1200,
    padding: "0 20px",
    display: "flex",
    justifyContent: "center",
    pointerEvents: "none",
  },
  notificationBanner: {
    width: "100%",
    maxWidth: 480,
    background: "linear-gradient(135deg, #fff6e8 0%, #fff9f0 100%)",
    border: "2px solid #f5a962",
    borderRadius: 16,
    padding: "20px 24px",
    display: "flex",
    alignItems: "center",
    gap: 16,
    boxShadow: "0 4px 12px rgba(245, 124, 0, 0.1)",
    pointerEvents: "auto",
  },
  iconWrapper: {
    flexShrink: 0,
    width: 44,
    height: 44,
    background: "#ffecd2",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  icon: {
    width: 24,
    height: 24,
    color: "#f5a962",
    fontSize: 24,
    fontWeight: "bold",
    lineHeight: "24px",
    textAlign: "center",
  },
  message: {
    flex: 1,
    color: "#e67726",
    fontSize: 16,
    lineHeight: 1.5,
    fontWeight: 500,
  },
  actions: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    flexShrink: 0,
  },

  tryAgainBtn: {
    background: "linear-gradient(135deg, #fff6e8 0%, #fff9f0 100%)",
    border: "2px solid #f5a962",
    borderRadius: 12,
    padding: "10px 22px",
    color: "#e67726",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    whiteSpace: "nowrap",
    transition: "all 0.2s ease",
  },
  tryAgainBtnHover: {
    background: "#fff",
    transform: "translateY(-1px)",
    boxShadow: "0 4px 8px rgba(245, 124, 0, 0.15)",
  },

};

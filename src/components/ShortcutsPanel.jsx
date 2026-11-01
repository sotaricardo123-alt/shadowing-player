import styles from "./ShortcutsPanel.module.css";

export default function ShortcutsPanel({ showHelp, onToggle }) {
  return (
    <div className={styles.panel}>
      <button type="button" onClick={onToggle}>
        ⌨️ Shortcuts
      </button>
      {showHelp && (
        <div className={styles.popup}>
          Space — Play / Pause
          <br />
          ↑ — Previous sentence
          <br />
          ↓ — Next sentence
          <br />
          ← — Back 3s
          <br />
          → — Forward 3s
        </div>
      )}
    </div>
  );
}

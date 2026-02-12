import React, { useEffect } from "react";

// PUBLIC_INTERFACE
function Modal({ title, children, onClose }) {
  /** Accessible-ish modal dialog with backdrop and escape-to-close. */
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.6)",
        display: "grid",
        placeItems: "center",
        padding: 16,
        zIndex: 50,
      }}
      onMouseDown={onClose}
    >
      <div
        className="card"
        style={{ width: "min(720px, 100%)" }}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="card-header">
          <div>
            <div className="card-title">{title}</div>
            <div className="card-subtitle">Press ESC to close</div>
          </div>
          <button className="btn btn-ghost" type="button" onClick={onClose}>
            Close
          </button>
        </div>
        <div className="card-body">{children}</div>
      </div>
    </div>
  );
}

export default Modal;

import { useState } from "react";
import PasswordStrength from "./PasswordStrength";

export default function PasswordInput({
  value,
  onChange,
  showStrength = false,
}) {
  const [show, setShow] = useState(false);

  return (
    <div className="password-field">
      <label className="form-label">Password</label>

      <div className="password-input-wrapper">
        <input
          className="form-input"
          type={show ? "text" : "password"}
          value={value}
          placeholder="Create a secure password"
          autoComplete="new-password"
          onChange={(e) => onChange(e.target.value)}
        />

        <button
          type="button"
          className="password-toggle"
          onClick={() => setShow(!show)}
        >
          {show ? "Hide" : "Show"}
        </button>
      </div>

      {showStrength && <PasswordStrength password={value} />}
    </div>
  );
}

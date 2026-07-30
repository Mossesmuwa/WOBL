export default function PasswordStrength({ password }) {
  const checks = {
    length: password.length >= 8,
    upper: /[A-Z]/.test(password),
    lower: /[a-z]/.test(password),
    number: /\d/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  };

  const score = Object.values(checks).filter(Boolean).length;

  const labels = ["Very Weak", "Weak", "Fair", "Good", "Strong", "Excellent"];

  return (
    <div className="password-strength">
      <div className="strength-bar">
        <div
          className={`strength-fill score-${score}`}
          style={{ width: `${score * 20}%` }}
        />
      </div>

      <div className="strength-label">{labels[score]}</div>

      <ul className="password-checks">
        <li className={checks.length ? "valid" : ""}>8+ characters</li>
        <li className={checks.upper ? "valid" : ""}>Uppercase letter</li>
        <li className={checks.lower ? "valid" : ""}>Lowercase letter</li>
        <li className={checks.number ? "valid" : ""}>Number</li>
        <li className={checks.special ? "valid" : ""}>Special character</li>
      </ul>
    </div>
  );
}

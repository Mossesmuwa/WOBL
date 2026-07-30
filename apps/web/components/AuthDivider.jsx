export default function AuthDivider({ text = "or continue with email" }) {
  return (
    <div className="auth-divider">
      <span>{text}</span>
    </div>
  );
}

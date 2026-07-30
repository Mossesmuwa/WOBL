import * as Auth from "shared/lib/auth";

export default function OAuthButtons() {
  return (
    <div className="oauth-list">
      <button
        type="button"
        className="oauth-btn"
        onClick={() => Auth.loginWithGoogle()}
      >
        <img src="/assets/icons/google.svg" alt="" />
        Continue with Google
      </button>

      <button
        type="button"
        className="oauth-btn"
        onClick={() => Auth.loginWithGithub()}
      >
        <img src="/assets/icons/github.svg" alt="" />
        Continue with GitHub
      </button>

      <button
        type="button"
        className="oauth-btn"
        onClick={() => Auth.loginWithApple()}
      >
        <img src="/assets/icons/apple.svg" alt="" />
        Continue with Apple
      </button>
    </div>
  );
}

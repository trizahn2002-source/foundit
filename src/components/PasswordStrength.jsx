
import { CheckCircle2, Circle } from "lucide-react";

const PASSWORD_RULES = [
  {
    id: "length",
    label: "At least 8 characters",
    test: (value) => value.length >= 8,
  },
  {
    id: "uppercase",
    label: "At least one uppercase letter (A–Z)",
    test: (value) => /[A-Z]/.test(value),
  },
  {
    id: "lowercase",
    label: "At least one lowercase letter (a–z)",
    test: (value) => /[a-z]/.test(value),
  },
  {
    id: "number",
    label: "At least one number (0–9)",
    test: (value) => /[0-9]/.test(value),
  },
  {
    id: "symbol",
    label: "At least one special character (!, @, #, etc.)",
    test: (value) => /[^A-Za-z0-9\s]/.test(value),
  },
  {
    id: "match",
    label: "Passwords match",
    test: (value, confirm) =>
      value.length > 0 && value === confirm,
  },
];

export function passwordChecklistComplete(password, confirmPassword) {
  return PASSWORD_RULES.every((rule) =>
    rule.test(password, confirmPassword)
  );
}

function PasswordStrength({ password, confirmPassword }) {
  const completed = PASSWORD_RULES.filter((rule) =>
    rule.test(password, confirmPassword)
  ).length;

  return (
    <div
      className="password-checklist"
      aria-label="Password requirements"
    >
      <p className="password-checklist-title">
        Your password must contain:
      </p>

      <ul className="password-checklist-list">
        {PASSWORD_RULES.map((rule) => {
          const valid = rule.test(password, confirmPassword);

          return (
            <li
              key={rule.id}
              className={`password-rule ${
                valid ? "is-valid" : ""
              }`}
            >
              {valid ? (
                <CheckCircle2 size={17} aria-hidden="true" />
              ) : (
                <Circle size={17} aria-hidden="true" />
              )}

              <span>{rule.label}</span>
            </li>
          );
        })}
      </ul>

      <div
        className="password-progress"
        role="progressbar"
        aria-label="Password requirements completed"
        aria-valuenow={completed}
        aria-valuemin={0}
        aria-valuemax={PASSWORD_RULES.length}
      >
        <div
          className="password-progress-fill"
          style={{
            width: `${(completed / PASSWORD_RULES.length) * 100}%`,
          }}
        />
      </div>

      <p className="password-progress-label">
        {completed === PASSWORD_RULES.length
          ? "All password requirements met!"
          : `${completed} of ${PASSWORD_RULES.length} requirements met`}
      </p>
    </div>
  );
}

export default PasswordStrength;

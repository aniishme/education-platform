import { useState } from "react";
import { changePassword } from "../utils/password";
import FormField from "./FormField";

function ChangePasswordForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [saved, setSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const clearError = (field) => {
    setSaved(false);
    setErrors((previous) => {
      if (!previous[field]) return previous;
      const next = { ...previous };
      delete next[field];
      return next;
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const newErrors = {};

    if (!currentPassword) {
      newErrors.currentPassword = "Enter your current password.";
    }

    if (!newPassword) {
      newErrors.newPassword = "Choose a new password.";
    } else if (newPassword.length < 6) {
      newErrors.newPassword = "Password must be at least 6 characters.";
    } else if (newPassword === currentPassword) {
      newErrors.newPassword = "Choose a password different from your current one.";
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "Re-enter your new password.";
    } else if (confirmPassword !== newPassword) {
      newErrors.confirmPassword = "Passwords don't match.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setSaved(false);
      return;
    }

    setIsSaving(true);

    try {
      const changed = await changePassword(currentPassword, newPassword);

      if (!changed) {
        setErrors({ currentPassword: "That isn't your current password." });
        setSaved(false);
        return;
      }

      setErrors({});
      setSaved(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      setErrors({ form: "We couldn't change your password in this browser. Please try again." });
      setSaved(false);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form className="password-form" onSubmit={handleSubmit} noValidate>
      {saved && (
        <p className="settings-success" role="status">
          Your password was updated. Use it the next time you log in.
        </p>
      )}
      {errors.form && (
        <p className="error-message" role="alert">
          {errors.form}
        </p>
      )}

      <FormField
        label="Current password"
        id="current-password"
        type="password"
        autoComplete="current-password"
        value={currentPassword}
        onChange={(event) => {
          setCurrentPassword(event.target.value);
          clearError("currentPassword");
        }}
        error={errors.currentPassword}
      />

      <FormField
        label="New password"
        id="new-password"
        type="password"
        autoComplete="new-password"
        placeholder="At least 6 characters"
        value={newPassword}
        onChange={(event) => {
          setNewPassword(event.target.value);
          clearError("newPassword");
        }}
        error={errors.newPassword}
      />

      <FormField
        label="Confirm new password"
        id="confirm-new-password"
        type="password"
        autoComplete="new-password"
        value={confirmPassword}
        onChange={(event) => {
          setConfirmPassword(event.target.value);
          clearError("confirmPassword");
        }}
        error={errors.confirmPassword}
      />

      <button type="submit" className="settings-button" disabled={isSaving}>
        {isSaving ? "Updating..." : "Update password"}
      </button>
    </form>
  );
}

export default ChangePasswordForm;

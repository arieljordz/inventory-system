import { VerificationCodeEnum } from "../enums/enums";
import Swal from "sweetalert2";

// 🔹 Reusable verification handler
export const verifyAction = async () => {
  const result = await Swal.fire({
    title: "Verification Required",
    text: "Please enter the verification code to proceed:",
    input: "text",
    inputPlaceholder: "Enter verification code",
    showCancelButton: true,
    confirmButtonColor: "#007bff",
    cancelButtonColor: "#6c757d",
    confirmButtonText: "Verify",
    cancelButtonText: "Cancel",
    allowOutsideClick: false,
    allowEscapeKey: false,
    didOpen: () => {
      const input = Swal.getInput();
      if (input) {
        input.style.textAlign = "center";
        input.style.fontSize = "18px";
        input.style.fontWeight = "bold";
        input.style.letterSpacing = "2px";
      }
    },
    preConfirm: (value) => {
      if (!value) {
        Swal.showValidationMessage("Please enter a verification code");
        return false;
      }
      if (value !== VerificationCodeEnum.VERIFICATION_CODE) {
        Swal.showValidationMessage("Invalid verification code");
        return false;
      }
      return true;
    },
  });

  return result.isConfirmed;
};

// 🔹 Reusable confirmation handler
export const confirmAction = async ({
  title = "Are you sure?",
  text = "This action cannot be undone.",
  confirmText = "Yes, proceed!",
  confirmColor = "#d33",
  cancelText = "Cancel",
  cancelColor = "#6c757d",
  icon = "warning",
} = {}) => {
  const result = await Swal.fire({
    title,
    text,
    icon,
    showCancelButton: true,
    confirmButtonColor: confirmColor,
    cancelButtonColor: cancelColor,
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
  });

  return result.isConfirmed;
};



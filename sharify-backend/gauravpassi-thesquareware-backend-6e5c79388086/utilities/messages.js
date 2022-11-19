/* -----------------------------------------------------------------------
   * @ description : Main module to include all the messages used in project.
----------------------------------------------------------------------- */
import config from 'config';

export default {
  systemError: 'Technical error ! Please try again later.',
  emailAlreadyExists: 'This Email is already registered.',
  contactAlreadyExists: 'This contact number is already registered.',
  phoneNumberNotExists: 'Phone Number not registered with us.',
  phoneAlreadyExists: 'This Phone number is already registered.',
  registerSuccess: 'Your account has been registered successfully. Please check your email for account Activation.',
  tokenExpired: 'Session Expired.',
  sendOTP: function(otp) {
    return `Please use this OTP ${otp} to verify your account`;
  },
  forgetPassword:
    'We have sent you an email on your registered email account to reset your password.',
  resetpassword: 'Your password has been reset successfully!',
  passwordUpdated:
    'You have successfully changed your password !',
  emailChanged: 'An OTP is sent to the registered email Id. Please use that to verify your email.',
  invalidCredentials: 'Invalid Credentials',
  activateAccount: 'Please activate your account by verifying link sent on your email',
  deletedByAdmin: 'Your account has been deleted by admin',
  blockedByAdmin: 'Your account has been blocked by admin',
  success: 'Success',
  verifyTokenExpired: 'Verification token has been expired or you have already verified.',
  emailNotExists: 'This Email is not registered with us.',
  confirmPasswordMissMatch: 'Password and Confirm password do not match !',
  resetTokenExpired: 'Token has been expired',
  resendEmail: 'Verification email has been sent to your inbox. Please check and verify yourself !',
  emailVerified: "Email has been successfully verified !",
  profileUpdate: "Profile has been updated successfully !",
  oldAndNewPasswordMatch: "New password should be different to old password",
  oldPassIncorrect: "Old password is incorrect",
  needNewPassword: 'New password is required to change password.',
  ItemAddedToCart: 'Item has been added to cart successfully',
  ItemAddedToSaveForLater: 'Item has been save for later reference',
  ItemRemovedFromCart: 'Item has been removed from cart successfully',
  ItemRemovedFromSaveForLater: 'Item has been removed from save later references'
};

import { useEffect, useRef, useState } from "react";
import {
  Box,
  Container,
  TextField,
  Button,
  Typography,
  Paper,
  CircularProgress,
  InputAdornment,
  IconButton,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { styled } from "@mui/system";
import { IoMdEye, IoMdEyeOff, IoMdMail } from "react-icons/io";
import { RiLockPasswordLine } from "react-icons/ri";
import { MdSecurity } from "react-icons/md";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import ReCAPTCHA from "react-google-recaptcha";
import { AppDispatch } from "@/features/Store";
import { getPasswordOtp, updatePassword } from "@/features/authentication/authSlice";
import { useAppSelector } from "@/hooks/useReduxHook";
import { showToast } from "@/utils/toasterContext";

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  borderRadius: 16,
  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
  position: "relative",
  overflow: "hidden",
}));

const FormContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(3),
}));

const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const ForgotPassword = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { otpLoading } = useAppSelector((state) => state.auth);

  const [step, setStep] = useState<1 | 2>(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    verificationCode: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [recaptchaKey, setRecaptchaKey] = useState(Math.random());
  const [recaptchaValue, setRecaptchaValue] = useState<string | null>(null);
  const recaptchaRef = useRef<any>(null);

  useEffect(() => {
    setErrors({});
  }, [step]);

  const handleChange = (field: keyof typeof formData) => (event: any) => {
    const value = event.target.value;
    const next = { ...formData, [field]: value };
    setFormData(next);

    if (field === "email") {
      setErrors((prev) => ({
        ...prev,
        email: value && !validateEmail(value) ? "Invalid email format" : "",
      }));
    } else if (field === "newPassword" || field === "confirmPassword") {
      setErrors((prev) => ({
        ...prev,
        confirmPassword:
          next.confirmPassword && next.newPassword !== next.confirmPassword
            ? "Passwords do not match"
            : "",
      }));
    }
  };

  const handleRecaptchaChange = (value: string | null) => setRecaptchaValue(value);

  const handleSendCode = async () => {
    if (!formData.email || !validateEmail(formData.email)) {
      setErrors((prev) => ({ ...prev, email: "Enter a valid email address" }));
      return;
    }
    const res: any = await dispatch(getPasswordOtp({ emailId: formData.email }));
    if (res?.payload?.data?.success) {
      setStep(2);
    }
  };

  const handleResetPassword = async () => {
    if (!formData.verificationCode) {
      showToast("Please enter the verification code", "error");
      return;
    }
    if (!formData.newPassword || formData.newPassword.length < 8) {
      setErrors((prev) => ({
        ...prev,
        newPassword: "Password must be at least 8 characters",
      }));
      return;
    }
    if (formData.newPassword !== formData.confirmPassword) {
      setErrors((prev) => ({ ...prev, confirmPassword: "Passwords do not match" }));
      return;
    }
    if (!recaptchaValue) {
      showToast("Please verify the reCAPTCHA", "error");
      return;
    }

    const res: any = await dispatch(
      updatePassword({
        emailId: formData.email,
        otp: formData.verificationCode,
        password: formData.confirmPassword,
      })
    );

    setRecaptchaValue(null);
    setRecaptchaKey(Math.random());

    if (res?.payload?.data?.success) {
      navigate("/login");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) {
      handleSendCode();
    } else {
      handleResetPassword();
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box
        sx={{
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          gap: 4,
          minHeight: "80vh",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Box flex={1} maxWidth={480}>
          <StyledPaper elevation={0}>
            <Typography
              variant="h4"
              component="h1"
              gutterBottom
              sx={{ fontWeight: 600, color: theme.palette.primary.main }}
            >
              Password Recovery
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              {step === 1
                ? "Enter your email address to receive a verification code."
                : "Enter the verification code sent to your email and create your new password."}
            </Typography>

            <form onSubmit={handleSubmit}>
              <FormContainer>
                {step === 1 && (
                  <TextField
                    fullWidth
                    label="Email Address"
                    type="email"
                    value={formData.email}
                    onChange={handleChange("email")}
                    error={Boolean(errors.email)}
                    helperText={errors.email}
                    required
                    autoComplete="email"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <IoMdMail />
                        </InputAdornment>
                      ),
                    }}
                  />
                )}

                {step === 2 && (
                  <>
                    <TextField
                      fullWidth
                      label="Verification Code"
                      value={formData.verificationCode}
                      onChange={handleChange("verificationCode")}
                      required
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <MdSecurity />
                          </InputAdornment>
                        ),
                      }}
                    />
                    <TextField
                      fullWidth
                      label="New Password"
                      type={showPassword ? "text" : "password"}
                      value={formData.newPassword}
                      onChange={handleChange("newPassword")}
                      error={Boolean(errors.newPassword)}
                      helperText={errors.newPassword}
                      required
                      autoComplete="new-password"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <RiLockPasswordLine />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton onClick={() => setShowPassword((s) => !s)} edge="end">
                              {showPassword ? <IoMdEyeOff /> : <IoMdEye />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                    <TextField
                      fullWidth
                      label="Confirm Password"
                      type={showConfirmPassword ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={handleChange("confirmPassword")}
                      error={Boolean(errors.confirmPassword)}
                      helperText={errors.confirmPassword}
                      required
                      autoComplete="new-password"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <RiLockPasswordLine />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => setShowConfirmPassword((s) => !s)}
                              edge="end"
                            >
                              {showConfirmPassword ? <IoMdEyeOff /> : <IoMdEye />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                    <div className="flex justify-center">
                      <ReCAPTCHA
                        sitekey="6LdmVcArAAAAAOb1vljqG4DTEEi2zP1TIjDd_0wR"
                        onChange={handleRecaptchaChange}
                        key={recaptchaKey}
                        ref={recaptchaRef}
                      />
                    </div>
                  </>
                )}

                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={otpLoading}
                  sx={{ borderRadius: 2, py: 1.5 }}
                >
                  {otpLoading ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : step === 1 ? (
                    "Send Verification Code"
                  ) : (
                    "Reset Password"
                  )}
                </Button>

                {step === 2 && (
                  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Button variant="text" onClick={() => setStep(1)} disabled={otpLoading}>
                      Go Back
                    </Button>
                    <Button variant="text" onClick={handleSendCode} disabled={otpLoading}>
                      Resend Code
                    </Button>
                  </Box>
                )}

                <Typography variant="body2" align="center">
                  Remembered your password? <Link to="/login">Back to Login</Link>
                </Typography>
              </FormContainer>
            </form>
          </StyledPaper>
        </Box>
      </Box>
    </Container>
  );
};

export default ForgotPassword;

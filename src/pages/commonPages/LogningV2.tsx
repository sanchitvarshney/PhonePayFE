import {
  Card,
  FormControl,
  FormHelperText,
  IconButton,
  InputAdornment,
  InputLabel,
  Link,
  OutlinedInput,
  Typography,
} from "@mui/material";
import React, { useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import { Pagination, EffectFade, Autoplay } from "swiper/modules";
import "swiper/css/effect-fade";
import LoadingButton from "@mui/lab/LoadingButton";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import PasswordIcon from "@mui/icons-material/Password";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import { SubmitHandler, useForm } from "react-hook-form";
import { loginUserAsync } from "@/features/authentication/authSlice";
import type { LoginCredentials } from "@/features/authentication/authType";
import { useAppDispatch, useAppSelector } from "@/hooks/useReduxHook";
import { showToast } from "@/utils/toasterContext";
import { useNavigate } from "react-router-dom";
import ReCAPTCHA from "react-google-recaptcha";

const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY || "";

const LogningV2: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [recaptchaValue, setRecaptchaValue] = useState<string | null>(null);
  const [recaptchaKey, setRecaptchaKey] = useState(Math.random());
  const recaptchaRef = useRef<any>(null);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors } } = useForm<LoginCredentials>();
  const { loading } = useAppSelector((state) => state.auth);

  const onSubmit: SubmitHandler<LoginCredentials> = (data) => {
    if (RECAPTCHA_SITE_KEY && !recaptchaValue) {
      showToast("Please verify the reCAPTCHA", "error");
      return;
    }

    dispatch(loginUserAsync(data)).then((action: unknown) => {
      const a = action as { payload?: { data?: { success?: boolean; message?: string } } };
      const body = a?.payload?.data;
      if (body?.success) {
        showToast(body.message || "Login successful", "success");
        navigate("/");
      } else {
        const errorMessage = body?.message ?? (a?.payload as { message?: string })?.message;
        if (errorMessage) {
          showToast(errorMessage, "error");
        }
        if (recaptchaRef.current) {
          recaptchaRef.current.reset();
        }
        setRecaptchaValue(null);
        setRecaptchaKey(Math.random());
      }
    });
  };

  const handleRecaptchaChange = (value: string | null) => {
    setRecaptchaValue(value);
  };

  return (
    <div className="h-[100vh] w-full grid grid-cols-2">
      <div className="w-full h-full bg-neutral-100">
        <Swiper
          autoplay={{ delay: 5000, disableOnInteraction: false }}
          effect="fade"
          pagination={{ clickable: true }}
          modules={[Pagination, EffectFade, Autoplay]}
          className="mySwiper"
        >
          <SwiperSlide>
            <div className="h-[50vh] bg-[#5F259F] flex items-center justify-center">
              <Typography variant="h1" fontSize={50} fontWeight={500} className="text-white">
                Welcome to PhonePe
              </Typography>
            </div>
            <div className="h-[50vh] py-[20px] px-[50px] bg-neutral-100">
              <Typography variant="h2" fontSize={25} fontWeight={500} className="text-stone-700">
                Revolutionizing Business Operations
              </Typography>
              <Typography variant="h3" fontSize={17} fontWeight={500} className="text-stone-700">
                Scalable, secure, and tailored to grow with your business.
              </Typography>
              <ul className="flex flex-col gap-[15px] mt-[20px] ml-2 h-[calc(50vh-120px)] overflow-y-auto">
                {[
                  "Scalable design to meet the demands of growing businesses.",
                  "Instant alerts for stock updates and sales activities",
                  "Multi-location tracking for global operations.",
                  "Seamless integration with accounting, CRM, and e-commerce.",
                  "Regular updates to keep the system future-proof.",
                ].map((text, index) => (
                  <li key={index} className="flex items-center gap-[10px]">
                    <DoneAllIcon color="primary" />
                    <Typography fontSize={15}>{text}</Typography>
                  </li>
                ))}
              </ul>
            </div>
          </SwiperSlide>
          <SwiperSlide>
            <div className="h-[50vh] bg-[#5F259F] flex items-center justify-center">
              <Typography variant="h1" fontSize={50} fontWeight={500} className="text-white">
                Powering Smarter Operations
              </Typography>
            </div>
            <div className="h-[50vh] py-[20px] px-[50px] bg-neutral-100">
              <Typography variant="h2" fontSize={25} fontWeight={500} className="text-stone-700">
                Effortless Inventory Management
              </Typography>
              <Typography variant="h3" fontSize={17} fontWeight={500} className="text-stone-700">
                Track, manage, and optimize your inventory with ease.
              </Typography>
              <ul className="flex flex-col gap-[15px] mt-[20px] ml-2 h-[calc(50vh-120px)] overflow-y-auto">
                {[
                  "Real-Time Inventory Updates.",
                  "Streamlined Operations.",
                  "User-Friendly Dashboard.",
                  "Multi-User Access.",
                  "Secure Data Management.",
                ].map((text, index) => (
                  <li key={index} className="flex items-center gap-[10px]">
                    <DoneAllIcon color="primary" />
                    <Typography fontSize={15}>{text}</Typography>
                  </li>
                ))}
              </ul>
            </div>
          </SwiperSlide>
        </Swiper>
      </div>
      <div className="relative flex flex-col items-center justify-center w-full h-full bg-white">
        <div className="flex justify-center mb-6">
          <img src="/PhonePeLogo.jpg" alt="PhonePe" className="h-16 object-contain" />
        </div>
        <Card elevation={4} sx={{ width: "500px", padding: "20px" }}>
          <Typography
            color="primary"
            variant="h1"
            component="div"
            className="flex items-center justify-center text-slate-600 gap-[5px]"
            fontSize={28}
            fontWeight={600}
          >
            Sign In
          </Typography>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="mt-[50px] flex flex-col gap-[20px]">
              <FormControl error={!!errors.username} fullWidth variant="outlined">
                <InputLabel htmlFor="username">Username</InputLabel>
                <OutlinedInput
                  autoFocus
                  autoComplete="off"
                  {...register("username", { required: "Username is required" })}
                  label="Username"
                  id="username"
                  startAdornment={
                    <InputAdornment position="start">
                      <AccountCircleIcon />
                    </InputAdornment>
                  }
                />
                {errors.username && (
                  <FormHelperText>{errors.username.message}</FormHelperText>
                )}
              </FormControl>
              <div className="flex flex-col items-end gap-[3px]">
                <FormControl error={!!errors.password} fullWidth variant="outlined">
                  <InputLabel htmlFor="password">Password</InputLabel>
                  <OutlinedInput
                    autoComplete="off"
                    {...register("password", { required: "Password is required" })}
                    type={showPassword ? "text" : "password"}
                    label="Password"
                    id="password"
                    startAdornment={
                      <InputAdornment position="start">
                        <PasswordIcon />
                      </InputAdornment>
                    }
                    endAdornment={
                      <InputAdornment position="end">
                        <IconButton
                          size="small"
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                        >
                          {showPassword ? (
                            <VisibilityIcon fontSize="small" />
                          ) : (
                            <VisibilityOffIcon fontSize="small" />
                          )}
                        </IconButton>
                      </InputAdornment>
                    }
                  />
                  {errors.password && (
                    <FormHelperText>{errors.password.message}</FormHelperText>
                  )}
                </FormControl>
                <div className="flex gap-[20px]">
                  <Link href="/forgot-password" fontSize={12}>
                    Forgot Password
                  </Link>
                  <Link href="/password-recovery" fontSize={12}>
                    Lock and Unlock User
                  </Link>
                </div>
              </div>
              {RECAPTCHA_SITE_KEY && (
                <div className="flex justify-center">
                  <ReCAPTCHA
                    sitekey={RECAPTCHA_SITE_KEY}
                    onChange={handleRecaptchaChange}
                    key={recaptchaKey}
                    ref={recaptchaRef}
                  />
                </div>
              )}
              <LoadingButton
                loading={loading}
                size="large"
                variant="contained"
                fullWidth
                type="submit"
              >
                Login
              </LoadingButton>
            </div>
            {RECAPTCHA_SITE_KEY && (
              <div className="mt-[30px]">
                <Typography fontSize={12} className="text-center">
                  This site is protected by reCAPTCHA and the Google Privacy Policy and Terms of
                  Service apply.
                </Typography>
              </div>
            )}
          </form>
        </Card>
        <div className="absolute bottom-0 left-0 flex items-center justify-center w-full text-center py-[10px]">
          <Typography fontSize={13}>
            &copy; {new Date().getFullYear()} PhonePe. All Rights Reserved
          </Typography>
        </div>
      </div>
    </div>
  );
};

export default LogningV2;

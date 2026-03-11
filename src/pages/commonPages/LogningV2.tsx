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
import PhonelinkLockRoundedIcon from "@mui/icons-material/PhonelinkLockRounded";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import { SubmitHandler, useForm } from "react-hook-form";
import { loginUserAsync } from "@/features/authentication/authSlice";
import type { LoginCredentials } from "@/features/authentication/authType";
import { useAppDispatch, useAppSelector } from "@/hooks/useReduxHook";
import { showToast } from "@/utils/toasterContext";
import { useNavigate } from "react-router-dom";
import ReCAPTCHA from "react-google-recaptcha";

const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY || "";

const PHONEPE_PURPLE = "#5F259F";

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
        if (errorMessage) showToast(errorMessage, "error");
        if (recaptchaRef.current) recaptchaRef.current.reset();
        setRecaptchaValue(null);
        setRecaptchaKey(Math.random());
      }
    });
  };

  const handleRecaptchaChange = (value: string | null) => {
    setRecaptchaValue(value);
  };

  return (
    <div className="h-[100vh]  w-full grid grid-cols-2">
      <div className="w-full h-full bg-neutral-100 ">
        <Swiper
          autoplay={{
            delay: 5000,
            disableOnInteraction: false,
          }}
          effect={"fade"}
          pagination={{
            clickable: true,
          }}
          modules={[Pagination, EffectFade, Autoplay]}
          className="mySwiper"
        >
          <SwiperSlide>
            <div
              className="h-[50vh] bg-cover flex items-center justify-center "
              style={{ backgroundColor: PHONEPE_PURPLE }}
            >
              <Typography
                variant="h1"
                fontSize={50}
                fontWeight={500}
                className="text-white"
              >
                Welcome to the Future of ERP
              </Typography>
            </div>
            <div className="h-[50vh] py-[20px] px-[50px] bg-white overflow-visible">
              <Typography
                variant="h2"
                fontSize={25}
                fontWeight={500}
                className="text-stone-700"
              >
                Revolutionizing Business Operations
              </Typography>
              <Typography
                variant="h3"
                fontSize={17}
                fontWeight={500}
                className="text-stone-700"
              >
                Scalable, secure, and tailored to grow with your business.
              </Typography>
              <ul className="flex flex-col gap-[15px] mt-[20px] list-none pl-0 pr-2 h-[calc(50vh-120px)] overflow-y-auto overflow-x-visible w-full">
                {[
                  "Scalable design to meet the demands of growing businesses.",
                  "Instant alerts for stock updates and sales activities",
                  "Multi-location tracking for global operations.",
                  "Seamless integration with accounting, CRM, and e-commerce.",
                  "Regular updates to keep the system future-proof.",
                ].map((text, index) => (
                  <li key={index} className="flex items-start gap-[10px] w-full min-w-0">
                    <DoneAllIcon sx={{ color: PHONEPE_PURPLE, flexShrink: 0, fontSize: 22 }} />
                    <Typography fontSize={15} className="text-stone-700 flex-1 min-w-0" component="span">
                      {text}
                    </Typography>
                  </li>
                ))}
              </ul>
            </div>
          </SwiperSlide>
          <SwiperSlide>
            <div
              className="h-[50vh]  bg-cover flex items-center justify-center"
              style={{ backgroundColor: PHONEPE_PURPLE }}
            >
              <Typography
                variant="h1"
                fontSize={50}
                fontWeight={500}
                className="text-white"
              >
                Powering Smarter Operations
              </Typography>
            </div>
            <div className="h-[50vh] py-[20px] px-[50px] bg-white overflow-visible">
              <Typography
                variant="h2"
                fontSize={25}
                fontWeight={500}
                className="text-stone-700"
              >
                Effortless Inventory Management
              </Typography>
              <Typography
                variant="h3"
                fontSize={17}
                fontWeight={500}
                className="text-stone-700"
              >
                Track, manage, and optimize your inventory with ease.
              </Typography>
              <ul className="flex flex-col gap-[15px] mt-[20px] list-none pl-0 pr-2 h-[calc(50vh-120px)] overflow-y-auto overflow-x-visible w-full">
                {[
                  "Real-Time Inventory Updates: Stay informed with real-time stock tracking and updates.",
                  "Streamlined Operations: Manage purchases, sales, and stock transfers seamlessly.",
                  "User-Friendly Dashboard: Access all essential features through an intuitive and responsive interface.",
                  "Multi-User Access: Enable team collaboration with role-based permissions.",
                  "Secure Data Management: Ensure the safety of your data with robust security protocols.",
                ].map((text, index) => (
                  <li key={index} className="flex items-start gap-[10px] w-full min-w-0">
                    <DoneAllIcon sx={{ color: PHONEPE_PURPLE, flexShrink: 0, fontSize: 22 }} />
                    <Typography fontSize={15} className="text-stone-700 flex-1 min-w-0" component="span">
                      {text}
                    </Typography>
                  </li>
                ))}
              </ul>
            </div>
          </SwiperSlide>
        </Swiper>
      </div>
      <div className="relative flex items-center justify-center w-full h-full bg-white">
        <Card elevation={4} sx={{ width: "500px", padding: "20px" }}>
          <Typography
            variant="h1"
            component={"div"}
            className="flex items-center justify-center  text-slate-600 gap-[5px]"
            fontSize={35}
            fontWeight={500}
            sx={{ color: PHONEPE_PURPLE }}
          >
            <PhonelinkLockRoundedIcon fontSize="large" />
            Secure Login
          </Typography>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="mt-[50px] flex flex-col gap-[20px]">
              <FormControl
                error={!!errors.username}
                fullWidth
                variant="outlined"
              >
                <InputLabel htmlFor="input-with-icon-adornment">
                  Username
                </InputLabel>
                <OutlinedInput
                  autoFocus
                  autoComplete="off"
                  {...register("username", {
                    required: "username is required",
                  })}
                  label="Username"
                  id="input-with-icon-adornment"
                  startAdornment={
                    <InputAdornment position="start">
                      <AccountCircleIcon />
                    </InputAdornment>
                  }
                />
                {errors.username && (
                  <FormHelperText id="component-error-text">
                    {errors.username.message}
                  </FormHelperText>
                )}
              </FormControl>
              <div className="flex flex-col items-end gap-[3px]">
                <FormControl
                  error={!!errors.password}
                  fullWidth
                  variant="outlined"
                >
                  <InputLabel htmlFor="input-with-password-adornment">
                    Password
                  </InputLabel>
                  <OutlinedInput
                    autoComplete="off"
                    {...register("password", {
                      required: "password is required",
                    })}
                    type={showPassword ? "text" : "password"}
                    label="Password"
                    id="input-with-password-adornment"
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
                    <FormHelperText id="component-error-text">
                      {errors.password.message}
                    </FormHelperText>
                  )}
                </FormControl>
                <div className="flex gap-[20px]">
                  <Link href="/forgot-password" fontSize={12} className="" sx={{ color: PHONEPE_PURPLE }}>
                    Forgot Password
                  </Link>
                  <Link href="/password-recovery" fontSize={12} className="" sx={{ color: PHONEPE_PURPLE }}>
                    Lock and Unlock User
                  </Link>
                </div>
              </div>
              <div className=" flex justify-center">
                {RECAPTCHA_SITE_KEY ? (
                  <ReCAPTCHA
                    sitekey={RECAPTCHA_SITE_KEY}
                    onChange={handleRecaptchaChange}
                    key={recaptchaKey}
                    ref={recaptchaRef}
                  />
                ) : (
                  <div style={{ minHeight: 78 }} />
                )}
              </div>
              <LoadingButton
                loading={loading}
                size="large"
                variant="contained"
                fullWidth
                type="submit"
                sx={{
                  m: "0px !important",
                  backgroundColor: PHONEPE_PURPLE,
                  "&:hover": { backgroundColor: "#4a1d7a" },
                }}
              >
                LOGIN
              </LoadingButton>
              {!loading && (
                <Typography textAlign={"center"} variant="subtitle2" sx={{ color: PHONEPE_PURPLE }}>
                  OR
                </Typography>
              )}
              <div className="flex justify-center w-full items-center ">
                {!loading && <div style={{ minHeight: 40 }} />}
              </div>
            </div>
            <div className="mt-[30px]">
              <Typography fontSize={12} className="text-center">
                This site is protected by reCAPTCHA and the Google Privacy
                Policy and Terms of Service apply. For more info, please visit
                <Link
                  sx={{ ml: "4px", color: PHONEPE_PURPLE }}
                  href="https://www.phonepe.com"
                  target="_blank"
                >
                  www.phonepe.com
                </Link>
                .
              </Typography>
            </div>
          </form>
        </Card>
        <div className="absolute bottom-0 left-0 flex items-center justify-center w-full text-center  py-[10px]">
          <Typography fontSize={13}>
            &copy; 2019 - {new Date().getFullYear()}. All Rights Reserved
            <br />
            Performance & security by{" "}
            <Link href="https://phonepe.com/" target="blank" sx={{ color: PHONEPE_PURPLE }}>
              PhonePe
            </Link>
          </Typography>
        </div>
      </div>
    </div>
  );
};

export default LogningV2;

import { useMediaQuery, useTheme } from "@mui/material";

const MOBILE_UA = /Android|iPhone|iPad|iPod|Mobile|Windows Phone|webOS|BlackBerry/i;

const isMobileUserAgent = (): boolean => {
  if (typeof navigator === "undefined") return false;
  const uaData = (navigator as Navigator & { userAgentData?: { mobile?: boolean } })
    .userAgentData;
  if (uaData?.mobile) return true;
  if (/Macintosh/i.test(navigator.userAgent) && navigator.maxTouchPoints > 1) return true;
  return MOBILE_UA.test(navigator.userAgent);
};


export const useIsMobileDevice = (): boolean => {
  const theme = useTheme();
  const isCoarsePointer = useMediaQuery("(pointer: coarse)", { noSsr: true });
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("md"), { noSsr: true });
  return isMobileUserAgent() || (isCoarsePointer && isSmallScreen);
};

import { Button, Card, CardContent, Typography } from "@mui/material";
import SmartphoneOutlinedIcon from "@mui/icons-material/SmartphoneOutlined";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { showToast } from "@/utils/toasterContext";

const MobileOnlyNotice = () => {
  const pageUrl = window.location.href;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(pageUrl);
      showToast("Link copied — open it on your mobile device", "success");
    } catch {
      showToast("Couldn't copy the link. Please copy it manually.", "error");
    }
  };

  return (
    <div className="flex min-h-[100dvh] w-full items-center justify-center bg-slate-100 p-4">
      <Card elevation={0} className="w-full max-w-[440px] border border-slate-200">
        <CardContent className="flex flex-col items-center gap-3 !py-10 text-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-cyan-50 text-cyan-700">
            <SmartphoneOutlinedIcon sx={{ fontSize: 36 }} />
          </span>
          <Typography variant="h6" className="!font-semibold text-slate-800">
            Available on mobile only
          </Typography>
          <Typography variant="body2" className="text-slate-500">
            Wrong device video recording uses your phone's camera. Please open this page on a
            mobile device.
          </Typography>
          <div className="mt-2 flex w-full items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
            <span className="flex-1 truncate text-left text-xs text-slate-600">{pageUrl}</span>
            <Button size="small" startIcon={<ContentCopyIcon />} onClick={handleCopy}>
              Copy
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MobileOnlyNotice;

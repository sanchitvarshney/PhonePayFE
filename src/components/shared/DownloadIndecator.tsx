import Popover from "@mui/material/Popover";
import Typography from "@mui/material/Typography";
import { Badge, IconButton } from "@mui/material";
import FileDownloadSharpIcon from "@mui/icons-material/FileDownloadSharp";
import React, { useEffect } from "react";
import Link from "@mui/material/Link";
import MuiTooltip from "../reusable/MuiTooltip";
import { NotificationData, useSocketContext } from "../context/SocketContext";
import { Icons } from "../icons";
import { ScrollArea } from "@/components/ui/scroll-area";
import { showToast } from "@/utils/toasterContext";
import { getSocketUrl } from "@/utils/socketSettings";
import ProgressWithParcentage from "../reusable/ProgressWithParcentage";
const progressRowId = (n: { notificationId?: unknown; reactNotificationId?: unknown }) =>
  String(n.notificationId ?? n.reactNotificationId ?? "");

const DownloadIndecator = () => {
  const { onDownloadReport, off, onnotification, isConnected, emitGetNotification } =
    useSocketContext();
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(
    null,
  );
  const [notification, setNotification] = React.useState<NotificationData[]>(
    [],
  );
  const [progress, setProgress] = React.useState<any | null>(null);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };
  const open = Boolean(anchorEl);
  const id = open ? "simple-popover" : undefined;

  useEffect(() => {
    if (!isConnected) return;

    const handlenotification = (
      data: NotificationData[] | { type: string; data: NotificationData[] },
    ) => {
      // Handle new format with type field
      if (
        data &&
        typeof data === "object" &&
        "type" in data &&
        "data" in data
      ) {
        // Filter out notifications where type === 'notification', keep only download-related ones
        if (data.type === "notification" && Array.isArray(data.data)) {
      
          // For download-related types, show the notifications
          setNotification(Array.isArray(data.data) ? data.data : []);
        }
      } else {
        // Handle old format (direct array) - keep only download-related notifications
        // Filter based on msg_type === 'file' or other download indicators
        const downloadNotifications = Array.isArray(data)
          ? data.filter(
              (item) => item.msg_type === "file" || item.status !== "complete",
            )
          : [];
        setNotification(downloadNotifications);
      }
      console.log(data);
    };

    onnotification(handlenotification);

    return () => off("socket_receive_notification", handlenotification);
  }, [isConnected, onnotification, off]);

  useEffect(() => {
    if (!isConnected) return;

    const handleDownloadReport = (data: {
      notificationId: string;
      percent: string;
    }) => {
      setProgress(data);
      const pct = Number.parseFloat(String(data.percent));
      const id = String(data.notificationId);

      // Server sends "progress" for R2 (and similar) exports, not "socket_receive_notification".
      // Mirror that into the downloads list so the popover and badge stay in sync.
      setNotification((prev) => {
        const idx = prev.findIndex((n: any) => progressRowId(n) === id);
        const existing = idx >= 0 ? (prev[idx] as Record<string, unknown>) : null;
        const row: NotificationData & Record<string, unknown> = {
          ID: (existing?.ID as number) ?? Date.now(),
          notificationId: data.notificationId,
          reactNotificationId: data.notificationId,
          req_code: (existing?.req_code as string) ?? "Report export",
          insert_date: (existing?.insert_date as string) ?? new Date().toLocaleString(),
          status: pct >= 100 ? "complete" : "processing",
          msg_type: "file",
        };
        if (existing?.other_data) {
          row.other_data = existing.other_data;
        }
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = { ...next[idx], ...row };
          return next;
        }
        return [...prev, row as NotificationData];
      });

      if (pct >= 100) {
        showToast("Download completed", "success");
        emitGetNotification();
      }
    };

    onDownloadReport(handleDownloadReport);

    return () => off("progress", handleDownloadReport);
  }, [isConnected, onDownloadReport, off, emitGetNotification]);

  return (
    <>
      <MuiTooltip title="Download" placement="bottom">
        <IconButton
          sx={{
            color: open ? "black" : "#525252",
            p: "12px",
            background: open ? "#e5e5e5" : "",
            border: "none",
            borderRadius: 0,
          }}
          aria-describedby={id}
          onClick={handleClick}
          aria-label="delete"
        >
          <Badge badgeContent={notification?.length} color="warning">
            <FileDownloadSharpIcon className="text-white" />
          </Badge>
        </IconButton>
      </MuiTooltip>

      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        PaperProps={{
          sx: {
            border: "none", // Remove border
            borderTopRightRadius: 0, // Remove border radius
            boxShadow: 2, // Optional: remove shadow
          },
        }}
      >
        <div className="w-[350px] bg-neutral-200 p-[10px]">
          <div className="min-h-[50px] max-h-[50px] flex justify-between">
            <Typography sx={{ p: 2 }}>Downloads</Typography>
            <Link
              component="button"
              variant="body2"
              sx={{ color: "black" }}
              onClick={() => {
                console.info("I'm a button.");
              }}
            >
              Clear All
            </Link>
          </div>
          <div className="bg-white rounded justify-center gap-[10px] overflow-y-auto ">
            <ScrollArea className="w-full flex flex-col gap-[10px] h-[300px] p-[10px] pr-[15px]">
              {notification?.map((item: any, index) => (
                <div
                  key={index}
                  className="w-full p-[5px] border rounded-md mb-[10px]"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <Typography fontSize={14} variant="body2">
                        {item.req_code}
                      </Typography>
                      <Typography
                        color="text.secondary"
                        fontSize={12}
                        variant="body2"
                      >
                        {item.insert_date}
                      </Typography>
                    </div>
                    {item.status === "complete" &&
                      item.msg_type === "file" &&
                      item.other_data && (
                      <IconButton
                        size="small"
                        color="success"
                        onClick={() => {
                          try {
                            const raw =
                              typeof item.other_data === "string"
                                ? JSON.parse(item.other_data)
                                : item.other_data;
                            const fileUrl = raw?.fileUrl;
                            if (!fileUrl) return;
                            const baseUrl =
                              getSocketUrl().replace(/:\d+$/, "");
                            const finalUrl = new URL(fileUrl, baseUrl).href;
                            window.open(
                              finalUrl,
                              "_blank",
                              "noopener,noreferrer",
                            );
                          } catch {
                            showToast("File link unavailable", "error");
                          }
                        }}
                      >
                        <Icons.download fontSize="small" />
                      </IconButton>
                    )}
                  </div>
                  {item.status !== "complete" && (
                    <ProgressWithParcentage
                      value={
                        String(
                          item.notificationId || item.reactNotificationId || "",
                        ) === String(progress?.notificationId || "")
                          ? parseInt(progress?.percent || "0", 10)
                          : 0
                      }
                    />
                  )}
                </div>
              ))}
            </ScrollArea>
          </div>
        </div>
      </Popover>
    </>
  );
};

export default DownloadIndecator;

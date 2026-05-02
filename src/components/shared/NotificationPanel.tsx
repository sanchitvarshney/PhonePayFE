import React, { useEffect } from "react";
import Popover from "@mui/material/Popover";
import Typography from "@mui/material/Typography";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import { Badge, CircularProgress, IconButton } from "@mui/material";
import MuiTooltip from "@/components/reusable/MuiTooltip";
import {
  NotificationData,
  useSocketContext,
} from "@/components/context/SocketContext";
import { ScrollArea } from "@/components/ui/scroll-area";

type GeneralNotification = {
  ID: number;
  title: string;
  description: string;
  notificationId: string;
  insertDt: string;
  [key: string]: any;
};

const NotificationPnnel: React.FC = () => {
  const { onnotification, off } = useSocketContext();
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(
    null
  );
  const [loading, setLoading] = React.useState(false);
  const [notifications, setNotifications] = React.useState<
    GeneralNotification[]
  >([]);

  useEffect(() => {

    const handlenotification = (
      data: NotificationData[] | { type: string; data: any[] }
    ) => {
      if (
        data &&
        typeof data === "object" &&
        "type" in data &&
        "data" in data
      ) {
        // Only handle notifications where type === 'notification'
        if (data.type === "notification" && Array.isArray(data.data)) {
          setNotifications(data.data);
        }
        return;
      }

      // Handle direct array payload.
      if (Array.isArray(data)) {
        setNotifications(data as GeneralNotification[]);
      } else if (data && typeof data === "object") {
        // Handle single object payload.
        setNotifications((prev) => [data as GeneralNotification, ...prev]);
      }
    };

    onnotification(handlenotification);

    return () => off("socket_receive_notification", handlenotification);
  }, [onnotification, off]);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
    setLoading(false);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? "simple-popover" : undefined;

  return (
    <>
      <MuiTooltip title="Notification" placement="bottom">
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
          <Badge badgeContent={notifications?.length || 0} color="primary">
            <NotificationsActiveIcon  className="text-white"/>
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
            boxShadow: 2,
          },
        }}
      >
        <div className="w-[350px] bg-neutral-200 p-[10px]">
          <div className="min-h-[50px] flex justify-between">
            <Typography sx={{ p: 2 }}>Notifications</Typography>
          </div>
          <div className="bg-white rounded justify-center gap-[10px] overflow-y-auto">
            {loading ? (
              <div className="h-[300px] flex items-center justify-center">
                <CircularProgress size={40} />
              </div>
            ) : (
              <ScrollArea className="w-full flex flex-col gap-[10px] h-[300px] p-[10px] pr-[15px]">
                {notifications?.length > 0 ? (
                  notifications.map((item, index) => (
                    <div
                      key={index}
                      className="w-full p-[10px] border rounded-md mb-[10px]"
                    >
                      <div>
                        <Typography
                          fontSize={14}
                          variant="body2"
                          fontWeight="medium"
                        >
                          {item.title || "Notification"}
                        </Typography>
                        <Typography
                          color="text.secondary"
                          fontSize={12}
                          variant="body2"
                          sx={{ mt: 0.5 }}
                        >
                          {item.description || "No description"}
                        </Typography>
                        <Typography
                          color="text.secondary"
                          fontSize={11}
                          variant="body2"
                          sx={{ mt: 0.5 }}
                        >
                          {item.insertDt || item.insert_date}
                        </Typography>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <Typography color="text.secondary" fontSize={14}>
                      No notifications
                    </Typography>
                  </div>
                )}
              </ScrollArea>
            )}
          </div>
        </div>
      </Popover>
    </>
  );
};

export default NotificationPnnel;

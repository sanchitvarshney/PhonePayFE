// import MaterialRequestApprovalDrawer from "@/components/Drawers/wearhouse/MaterialRequestApprovalDrawer";
// import MaterialRequestDeviceApprovalDrawer from "@/components/Drawers/wearhouse/MaterialRequestDeviceApprovalDrawer";
// import { crearLocation, getLocationAsync } from "@/features/wearhouse/Divicemin/devaiceMinSlice";
import {
  clearItemdetail,
  getPendingMaterialListsync,
  materialRequestCancel,
} from "@/features/production/MaterialRequestWithoutBom/MRApprovalSlice";
import { useAppDispatch, useAppSelector } from "@/hooks/useReduxHook";
import {
  Button,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  ListItemIcon,
  Menu,
  MenuItem,
  TextField,
} from "@mui/material";
import React, { useEffect, useMemo, useState } from "react";
import Dialog from "@mui/material/Dialog";

import { LoadingButton } from "@mui/lab";

import { showToast } from "@/utils/toasterContext";
import { AgGridReact } from "ag-grid-react";
import {
  getProcessMrReqeustAsync,
  setRequestDetail,
} from "@/features/production/MaterialRequestWithoutBom/MRApprovalSlice";
import {
  Cached,
  Close,
  // FileDownload,
  MoreVert,
  // Print,
} from "@mui/icons-material";
import CustomLoadingOverlay from "@/components/reusable/CustomLoadingOverlay";
import { OverlayNoRowsTemplate } from "@/components/reusable/OverlayNoRowsTemplate";
import { ColDef } from "ag-grid-community";
import { getLocationAsync } from "@/features/master/location/locationSlice";
import MRProcessDrawer from "./MRProcessDrawer";

const MRPendingApproval: React.FC = () => {
  const [approve, setApprove] = useState<boolean>(false);
  const [alert, setAlert] = useState<boolean>(false);
  const [approved, setApproved] = useState<string[] | null>(null);
    const [requestType, setRequestType] = useState<string>("");
  const [remarks, setRemarks] = useState<string>("");
  const {
    cancelItemLoading,
    getPendingMrRequestLoading,
    pendingMrRequestData,
  } = useAppSelector((state) => state.pendingMr);
  const [txnId, setTxnId] = useState<string>("");
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [params, setParams] = React.useState<any>(null);
  const open = Boolean(anchorEl);

  const dispatch = useAppDispatch();
  useEffect(() => {
    dispatch(getPendingMaterialListsync());
  }, []);
  useEffect(() => {
    dispatch(clearItemdetail());
    if (!approve) {
      //   dispatch(crearLocation());
    } else {
      dispatch(getLocationAsync());
    }
  }, [approve]);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const columnDefs: ColDef[] = [
    {
      headerName: "Action",
      maxWidth: 150,
      field: "action",
      cellRenderer: (params: any) => (
        <div className="flex items-center h-full">
          <IconButton
            onClick={(e) => {
              handleClick(e);
              setParams(params);
            }}
            size="small"
          >
            <MoreVert fontSize="small" />
          </IconButton>
        </div>
      ),
    },
    {
      headerName: "#",
      field: "id",
      sortable: true,
      filter: true,
      maxWidth: 100,
      valueGetter: (params: any) => params.node.rowIndex + 1,
      cellRenderer: (params: any) => (
        <div className="flex items-center h-full">
          <span>{params.node.rowIndex + 1}</span>
        </div>
      ),
    },
    {
      headerName: "Request From",
      field: "userName",
      sortable: true,
      filter: true,
      flex: 1,
      cellRenderer: (params: any) => (
        <div className="flex items-center h-full">
          <span>{params?.data?.userName}</span>
        </div>
      ),
    },
    {
      headerName: "Request ID",
      field: "transactionId",
      sortable: true,
      filter: true,
      flex: 1,
      cellRenderer: (params: any) => (
        <div className="flex items-center h-full">
          <span>{params?.data?.transactionId}</span>
        </div>
      ),
    },
    {
      headerName: "Transaction Type",
      field: "transactionType",
      sortable: true,
      filter: true,
      flex: 1,
      cellRenderer: (params: any) => (
        <div className="flex items-center h-full">
          <span>{params?.data?.transactionType}</span>
        </div>
      ),
    },
    {
      headerName: "Request Date",
      field: "insertDate",
      sortable: true,
      filter: true,
      flex: 1,
      cellRenderer: (params: any) => (
        <div className="flex items-center h-full">
          <span>{params?.data?.insertDate}</span>
        </div>
      ),
    },
  ];

  const defaultColDef = useMemo<ColDef>(() => {
    return {
      filter: true,
    };
  }, []);
  return (
    <>
      <Dialog
        open={alert}
        onClose={() => setAlert(false)}
        PaperProps={{
          component: "form",
          onSubmit: (event: React.FormEvent<HTMLFormElement>) => {
            event.preventDefault();
            const formData = new FormData(event.currentTarget);
            const formJson = Object.fromEntries((formData as any).entries());
            const remark = formJson.remark;

            if (remark) {
              dispatch(
                materialRequestCancel({
                  remarks: remarks,
                  txnID: txnId,
                  type: "SOUNDBOX",
                }),
              ).then((res: any) => {
                if (res.payload.data?.success) {
                  setRemarks("");
                  setTxnId("");
                  setAlert(false);
                  dispatch(getPendingMaterialListsync());
                }
              });
            } else {
              showToast("Please Enter Remarks", "error");
            }
          },
        }}
      >
        <DialogTitle>Are you sure?</DialogTitle>
        <DialogContent sx={{ width: "600px" }}>
          <DialogContentText>
            do you want to cancel the material request?
          </DialogContentText>
          <TextField
            autoComplete="off"
            autoFocus
            margin="dense"
            id="name"
            name="remark"
            label="Remark (required)"
            fullWidth
            variant="standard"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAlert(false)}>No</Button>
          <LoadingButton
            loading={cancelItemLoading}
            type="submit"
            variant="contained"
            color="error"
          >
            Yes
          </LoadingButton>
        </DialogActions>
      </Dialog>

 
    
           <MRProcessDrawer
        approved={approved}
        setApproved={setApproved}
        open={approve}
        setOpen={setApprove}
        alert={alert}
        setAlert={setAlert}
        reqType={requestType}
      />
   
   

      <div className=" ag-theme-quartz h-[calc(100vh-100px)]">
        <AgGridReact
          rowHeight={40}
          headerHeight={40}
          loadingOverlayComponent={CustomLoadingOverlay}
          loading={getPendingMrRequestLoading}
          overlayNoRowsTemplate={OverlayNoRowsTemplate}
          suppressCellFocus={true}
          rowData={pendingMrRequestData || []}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          pagination={true}
          paginationPageSize={20}
        />
      </div>

      <Menu
        anchorEl={anchorEl}
        id="account-menu"
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        slotProps={{
          paper: {
            elevation: 2,

            sx: {
              width: "200px",
              overflow: "visible",
              mt: 1.5,
              ml: -2.5,
              border: "1px solid #d3d3d3",
              "& .MuiAvatar-root": {
                width: 32,
                height: 32,
                ml: -0.5,
                mr: 1,
              },
              "&::before": {
                content: '""',
                display: "block",
                position: "absolute",
                top: 0,
                left: 14,
                width: 10,
                height: 10,
                bgcolor: "background.paper",
                transform: "translateY(-50%) rotate(45deg)",
                zIndex: 0,
                borderTop: "1px solid #d3d3d3",
                borderLeft: "1px solid #d3d3d3",
              },
            },
          },
        }}
        transformOrigin={{ horizontal: "left", vertical: "top" }}
        anchorOrigin={{ horizontal: "center", vertical: "center" }}
      >
        <MenuItem
          onClick={() => {
                setRequestType(params?.data?.transactionType || "");
            dispatch(
              setRequestDetail({
                name: params?.data?.userName,
                id: params?.data?.transactionId,
                requestDate: params?.data?.insertDate,
              }),
            );
            setApprove(true);
            dispatch(getProcessMrReqeustAsync(params?.data?.transactionId));
          }}
        >
          <ListItemIcon>
            <Cached fontSize="small" />
          </ListItemIcon>
          Process
        </MenuItem>
        {/* 
        <MenuItem disabled onClick={() => {}}>
          <ListItemIcon>
            <FileDownload fontSize="small" />
          </ListItemIcon>
          Download
        </MenuItem>
        <MenuItem disabled onClick={() => {}}>
          <ListItemIcon>
            <Print fontSize="small" />
          </ListItemIcon>
          Print
        </MenuItem> */}
        <MenuItem
          onClick={() => {
            setAlert(true);
            setTxnId(params?.data?.transactionId);
          }}
        >
          <ListItemIcon>
            <Close fontSize="small" />
          </ListItemIcon>
          Cancel
        </MenuItem>
      </Menu>
    </>
  );
};

export default MRPendingApproval;

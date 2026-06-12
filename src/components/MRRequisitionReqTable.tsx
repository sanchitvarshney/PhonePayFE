import React, { useMemo, useState } from "react";
import { ColDef } from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import { OverlayNoRowsTemplate } from "@/components/reusable/OverlayNoRowsTemplate";
import { useAppDispatch, useAppSelector } from "@/hooks/useReduxHook";
import { CustomDrawer, CustomDrawerContent, CustomDrawerHeader, CustomDrawerTitle } from "@/components/reusable/CustomDrawer";


import { LoadingButton } from "@mui/lab";
import { Icons } from "@/components/icons";
import { Skeleton } from "@/components/ui/skeleton";
import { Typography } from "@mui/material";
import CustomLoadingOverlay from "@/components/reusable/CustomLoadingOverlay";
import * as XLSX from "xlsx";
import { getApproveItemDetail } from "@/features/production/MaterialRequestWithoutBom/MRApprovalSlice";
import ApprovalItemDetailTable from "@/pages/materialRequisition/ApprovalItemDetailTable";
import { View } from "lucide-react";

const MrRequisitionReqTable: React.FC = () => {
  const {
    approvedMaterialListData,
    approvedMaterialListLoading,
    serial,
    serialLoading,
  } = useAppSelector((state) => state.pendingMr);
  const [detail, setDetail] = useState<boolean>();
  const [txnid, setTxnid] = useState<string>("");
  const [showserial, setShowSerial] = useState<boolean>(false);
  const [serialid, setSerialid] = useState<string>("");
  const dispatch = useAppDispatch();

  // Global column default definition
  const defaultColDef = useMemo<ColDef>(() => {
    return {
      filter: true,
      flex: 1,
      cellRenderer: (params: any) =>
        approvedMaterialListLoading ? (
          <div className="flex items-center justify-center h-full">
            {" "}
            <Skeleton className="h-[20px] w-full" />
          </div>
        ) : (
          params?.value
        ), // Global skeleton logic
    };
  }, [approvedMaterialListLoading]);
  const columnDefs: ColDef[] = [
    {
      headerName: "#",
      field: "id",
      sortable: true,
      filter: true,
      flex: 1,
      valueGetter: "node.rowIndex+1",
      maxWidth: 80,
      cellRenderer: (params: any) => (
        <div className="flex items-center justify-center h-full">
    
         <span>{params.node.rowIndex + 1}</span> 
      
        </div>
      )
    },
    {
      headerName: "Request ID",
      field: "transaction",
      sortable: true,
      filter: true,
      flex: 1,
      cellRenderer: (params: any) => (
        <div className="flex items-center justify-center h-full">
          <span>{params?.data?.transaction}</span>
        </div>
      )
    },
    {
      headerName: "Request Date",
      field: "createDate",
      sortable: true,
      filter: true,
      flex: 1,
      cellRenderer: (params: any) => (
        <div className="flex items-center justify-center h-full">
          <span>{params?.data?.createDate}</span>
        </div>
      )
    },
    {
      headerName: "RM Qty",
      field: "totalRm",
      sortable: true,
      filter: true,
      cellRenderer: (params: any) => (
        <div className="flex items-center justify-center h-full">
          <span>{params?.data?.totalRm}</span>
        </div>
      )
    },
    {
      headerName: "Pick Location",
      field: "location",
      sortable: true,
      filter: true,
      flex: 1,
      cellRenderer: (params: any) => (
        <div className="flex items-center justify-center h-full">
          <span>{params?.data?.location}</span>
        </div>
      )
    },
    {
      headerName: "Action",
      field: "action",
      cellRenderer: (params: any) =>
        !approvedMaterialListLoading ? (
          <div className="flex items-center justify-center h-full">
            <LoadingButton
              size="small"
              onClick={() => {
                setDetail(true);
                dispatch(getApproveItemDetail(params?.data?.transaction));
                setTxnid(params?.data?.transaction);
              }}
              startIcon={<View fontSize="small" />}
              variant="contained"
            >
              View Detail
            </LoadingButton>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            {" "}
            <Skeleton className="h-[20px] w-full" />
          </div>
        ),
      pinned: "right",
    },
  ];
  const columnDefsserial: ColDef[] = [
    {
      headerName: "Serial No.",
      field: "srlno",
      sortable: true,
      filter: false,
      flex: 1,
      cellRenderer: (params: any) => (
        <div className="flex items-center justify-center h-full">
          <span>{params?.data?.srlno}</span>
        </div>
      )
    },
  ];

  return (
    <>
      <CustomDrawer open={showserial} onOpenChange={setShowSerial}>
        <CustomDrawerContent className="p-0 min-w-[30%] ">
          <CustomDrawerHeader className="h-[50px] p-0 flex flex-col justify-center px-[20px] bg-zinc-200 gap-0 border-b border-zinc-300 ">
            <div className="flex items-center justify-between w-full pr-8">
              <CustomDrawerTitle className="text-slate-600 font-[500] p-0">
                <Typography
                  fontSize={16}
                  fontWeight={500}
                  variant="h4"
                  component="div"
                >
                  #{serialid}
                </Typography>
              </CustomDrawerTitle>
              <LoadingButton
                size="small"
                onClick={() => {
                  // Create worksheet
                  const ws = XLSX.utils.json_to_sheet(
                    serial?.map((item: any) => ({
                      "Serial Number": item.srlNo,
                    })) || []
                  );

                  // Create workbook
                  const wb = XLSX.utils.book_new();
                  XLSX.utils.book_append_sheet(wb, ws, "Serial Numbers");

                  // Generate Excel file
                  XLSX.writeFile(wb, `serial_numbers_${serialid}.xlsx`);
                }}
                startIcon={<Icons.download fontSize="small" />}
                variant="contained"
              >
                Download
              </LoadingButton>
            </div>
          </CustomDrawerHeader>
          <div className=" ag-theme-quartz h-[calc(100vh-50px)]">
            <AgGridReact
              loadingOverlayComponent={CustomLoadingOverlay}
              loading={serialLoading}
              overlayNoRowsTemplate={OverlayNoRowsTemplate}
              suppressCellFocus={true}
              rowData={serial || []}
              columnDefs={columnDefsserial}
              pagination={false}
              enableCellTextSelection
            />
          </div>
        </CustomDrawerContent>
      </CustomDrawer>
      <CustomDrawer open={detail} onOpenChange={setDetail}>
        <CustomDrawerContent className="p-0 min-w-[calc(100%-200px)]">
          <CustomDrawerHeader className="h-[50px] p-0 flex flex-col justify-center px-[20px] bg-zinc-200 gap-0 border-b border-zinc-300 ">
            <CustomDrawerTitle className="text-slate-600 font-[500] p-0">
              <Typography
                fontSize={16}
                fontWeight={500}
                variant="h4"
                component="div"
              >
                #{txnid}
              </Typography>
            </CustomDrawerTitle>
          </CustomDrawerHeader>
          <ApprovalItemDetailTable
            setSerialid={setSerialid}
            setSerial={setShowSerial}
          />
        </CustomDrawerContent>
      </CustomDrawer>
      <div className=" ag-theme-quartz h-[calc(100vh-100px)]">
        <AgGridReact
        rowHeight={40}
        headerHeight={40}
          overlayNoRowsTemplate={OverlayNoRowsTemplate}
          suppressCellFocus={true}
          rowData={approvedMaterialListData || []}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          pagination={true}
          paginationPageSize={20}
        />
      </div>
    </>
  );
};

export default MrRequisitionReqTable;

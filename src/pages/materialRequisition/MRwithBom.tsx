import { Icons } from "@/components/icons";
import SelectBom, { Bomtype } from "@/components/reusable/SelectBom";
import SelectLocationAcordingModule, { LocationType } from "@/components/reusable/SelectLocationAcordingModule";

import SelectDevice, { DeviceType } from "@/components/reusable/SelectSku";
import {
  fetchBomProduct,
  resetBomDetail,
} from "@/features/master/BOM/BOMSlice";
import { createProductRequest } from "@/features/production/MaterialRequestWithoutBom/MRRequestWithoutBomSlice";
import { useAppDispatch, useAppSelector } from "@/hooks/useReduxHook";
import MRWithBomTable from "@/table/MRTables/MRWithBomTable";
import { showToast } from "@/utils/toasterContext";
import { LoadingButton } from "@mui/lab";
import { TextField } from "@mui/material";
import React, { useEffect, useState } from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";

type FormData = {
  device: DeviceType | null;
  siftLocation: LocationType | null;
  pickLocation: LocationType | null;
  bom: Bomtype | null;
  quantity: number;
  remark: string;
};
type RowData = {
  requiredQty: string;
  bomstatus: string;
  category: string;
  compKey: string;
  componentName: string;
  partCode: string;
  componentDesc: string;
  unit: string;
  isNew?: boolean;
  remark: string;
};
const MRwithBom: React.FC = () => {
  const { bomCompDetail } = useAppSelector((state) => state.bom);
  const { createProductRequestLoading } = useAppSelector(
    (state) => state.materialRequestWithoutBom,
  );
  const dispatch = useAppDispatch();
  const [rowData, setRowData] = useState<RowData[]>([]);
  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      device: null,
      siftLocation: null,
      pickLocation: null,
      bom: null,
      quantity: 1,
      remark: "",
    },
  });
  const handleKeyDown = (event: React.KeyboardEvent<HTMLFormElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
    }
  };

  const onSubmit: SubmitHandler<FormData> = (data) => {

    if (bomCompDetail) {
      const itemKey = rowData.map((row) => row.compKey);
      const picLocation = rowData.map(() => data.pickLocation?.code || "");
      const qty = rowData.map((row) => row.requiredQty);
      const remark = rowData.map((row) => row.remark || "");

      dispatch(
        createProductRequest({
          itemKey,
          picLocation,
          qty,
          remark,
          reqType: "PART",
          putLocation: data.siftLocation?.code || "",
          comment: data.remark,
        }),
      ).then((res: any) => {
        if (res.payload?.data.success) {
          reset();
          setRowData([]);
          dispatch(resetBomDetail());
          showToast(res.payload.data.message, "success");
        }
      });
    }
  };

  useEffect(() => {
    if (watch("bom")) {
      //@ts-ignore
      dispatch(fetchBomProduct(watch("bom")?.code || "")).then(
        (response: any) => {
          if (response.payload.data.success) {
            const updatedData = response.payload.data.data.data.map(
              (row: any) => ({
                ...row,
                isNew: true,
              }),
            );
            console.log(updatedData,"data");
            setRowData(updatedData);
          } else {
            setRowData([]);
          }
        },
      );
    }
  }, [watch("bom")]);

  return (
    <div className="h-[calc(100vh-100px)] bg-white">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className=""
        onKeyDown={handleKeyDown}
      >
        <div className="flex ">
          <div className="border-r border-neutral-300 p-[20px] flex flex-col gap-[20px] h-[calc(100vh-150px)] overflow-y-auto min-w-[400px] ">
            <Controller
              name="device"
              rules={{ required: "Device is required" }}
              control={control}
              render={({ field }) => (
                <SelectDevice
                  {...field}
                  label="Search Device"
                  error={!!errors.device}
                  helperText={errors?.device?.message}
                />
              )}
            />
            <Controller
              name="bom"
              rules={{ required: "BOM is required" }}
              control={control}
              disabled={!watch("bom")?.code }
              render={({ field }) => (
                <SelectBom
                  {...field}
                  disabled={!watch("device")}
                  label="Search BOM"
                  error={!!errors.bom}
                  helperText={errors?.bom?.message}
                  //@ts-ignore
                  id={watch("device")?.id}
                />
              )}
            />
            <Controller
              name="siftLocation"
              control={control}
              rules={{ required: "Shift Location is required" }}
              render={({ field }) => (
                <SelectLocationAcordingModule
                  label="Shift Location"
                  endPoint="/request/dropLocation"
                  error={!!errors.siftLocation}
                  helperText={errors.siftLocation?.message}
                  value={field.value}
                  onChange={(e) => {
                    field.onChange(e);
                  }}
                />
              )}
            />
            <Controller
              name="pickLocation"
              control={control}
              rules={{ required: "Pick Location is required" }}
              render={({ field }) => (
                <SelectLocationAcordingModule
                  label="Pick Location"
                  endPoint="/request/pickLocation"
                  error={!!errors.pickLocation}
                  helperText={errors.pickLocation?.message}
                  value={field.value}
                  onChange={(e) => {
                    field.onChange(e);
                  }}
                />
        
              )}
            />
            <TextField
              slotProps={{
                htmlInput: {
                  min: 1,
                },
              }}
              type="number"
              fullWidth
              label="QTY"
              {...register("quantity", { required: "Quantity is required" })}
              error={!!errors.quantity}
              helperText={
                errors?.quantity
                  ? errors?.quantity?.message
                  : "Press Enter to calculate QTY"
              }
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  if (watch("quantity") && bomCompDetail) {
                    setRowData(
                      bomCompDetail?.data?.data?.map((row, index) => ({
                        ...row,
                        requiredQty: (
                          Number(watch("quantity")) * Number(row.requiredQty)
                        )
                          .toFixed(2)
                          .toString(),
                        isNew: true,
                        remark: rowData[index]?.remark,
                      })),
                    );
                  }
                }
              }}
            />
            {/* <Controller
              name="cc"
              control={control}
              rules={{ required: "Cost Center  is required" }}
              render={({ field }) => (
                <SelectCostCenter
                  variant="outlined"
                  error={!!errors.cc}
                  helperText={errors.cc?.message}
                  value={field.value}
                  onChange={(e) => {
                    field.onChange(e);
                  }}
                  label="Cost Center"
                />
              )}
            /> */}
            <TextField fullWidth multiline rows={2} label="Remark" />
          </div>
          <div className="w-full">
            <MRWithBomTable rowData={rowData} setRowdata={setRowData} />
          </div>
        </div>
        <div className="flex items-center justify-end gap-[10px] h-[50px] border-t border-neutral-300 px-[20px]">
          <LoadingButton
            onClick={() => {
              reset();
              setRowData([]);
            }}
            disabled={createProductRequestLoading}
            startIcon={<Icons.refreshv2 />}
            variant="contained"
            sx={{ background: "white", color: "red" }}
          >
            Reset
          </LoadingButton>
          <LoadingButton
            loading={createProductRequestLoading}
            startIcon={<Icons.save />}
            variant="contained"
            type="submit"
          >
            Submit
          </LoadingButton>
        </div>
      </form>
    </div>
  );
};

export default MRwithBom;

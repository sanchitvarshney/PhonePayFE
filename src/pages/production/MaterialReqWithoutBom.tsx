import { CardContent, CardFooter } from "@/components/ui/card";
import MaterialReqTable from "@/components/MaterialReqTable";
import { useCallback, useEffect, useState } from "react";
import { useForm, SubmitHandler, Controller } from "react-hook-form";
import { useAppDispatch, useAppSelector } from "@/hooks/useReduxHook";
import {
  createProductRequest,
  getPertCodesync,
  setType,
} from "@/features/production/MaterialRequestWithoutBom/MRRequestWithoutBomSlice";
import styled from "styled-components";
import { FaArrowRightLong } from "react-icons/fa6";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControlLabel,
  ListItemButton,
  ListItemText,
  Radio,
  RadioGroup,
  TextField,
  Typography,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
import { Icons } from "@/components/icons";
import { showToast } from "@/utils/toasterContext";
import SelectLocationAcordingModule, {
  LocationType,
} from "@/components/reusable/SelectLocationAcordingModule";

interface RowData {
  code: { lable: string; value: string; deviceKey?: string } | null;
  pickLocation: { lable: string; value: string } | null;
  batch: { lable: string; value: string } | null;
  orderqty: string;
  remarks: string;
  id: string;
  isNew: boolean;
  availableqty: string;
}

type Formstate = {
  location: LocationType | null;
  remarks: string;
};

const MaterialReqWithoutBom = () => {
  const [rowData, setRowData] = useState<RowData[]>([]);
  const [location, setLocation] = useState<LocationType | null>(null);
  const [final, setFinal] = useState<boolean>(false);
  const [open, setOpen] = useState<boolean>(false);
  const [reqType, setReqType] = useState<string>("");
  const { type, createProductRequestLoading, craeteRequestData } =
    useAppSelector((state) => state.materialRequestWithoutBom);
  const dispatch = useAppDispatch();

  const handleTypeChange = (e: string) => {
    if (rowData.length > 0) {
      setReqType(e);
      setOpen(true);
    } else {
      dispatch(setType(e));
      setLocation(null);
      reset({ location: null });
    }
  };

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<Formstate>({
    defaultValues: {
      location: null,
      remarks: "",
    },
  });

  const addRow = useCallback(() => {
    const newId = crypto.randomUUID();
    const newRow: RowData = {
      id: newId,
      code: null,
      pickLocation: null,
      batch: null,
      orderqty: "",
      remarks: "",
      isNew: true,
      availableqty: "--",
    };
    setRowData((prev) => [newRow, ...prev]);
  }, []);

  const onSubmit: SubmitHandler<Formstate> = (data) => {
    if (rowData.length === 0) {
      showToast("Please Add Material Details", "error");
      return;
    }

    let hasErrors = false;
    rowData.forEach((row) => {
      const missingFields: string[] = [];
      if (!row.code) missingFields.push(type === "device" ? "Part Code" : "SKU");
      if (!row.pickLocation) missingFields.push("pickLocation");
      if (type === "device" && !row.batch?.value) missingFields.push("batch");
      if (!row.orderqty) missingFields.push("orderqty");
      if (missingFields.length > 0) {
        showToast(`Row ${row.id}: Empty fields: ${missingFields.join(", ")}`, "error");
        hasErrors = true;
      }
    });

    if (!hasErrors) {
      const itemKey = rowData.map((row) => row.code?.value || "");
      const picLocation = rowData.map((row) => row.pickLocation?.value || "");
      const qty = rowData.map((row) => row.orderqty);
      const remark = rowData.map((row) => row.remarks);
      const batchId =
        type === "device"
          ? rowData.map((row) => row.batch?.value || "")
          : undefined;
      dispatch(
        createProductRequest({
          itemKey,
          picLocation,
          qty,
          remark,
          reqType: type.toLocaleUpperCase(),
          putLocation: data.location!.code,
          comment: data.remarks,
          forTrc: type === "device" ? "1" : "0",
          ...(batchId ? { batchId } : {}),
        })
      ).then((res: any) => {
        if (res.payload?.data.success) {
          reset();
          setRowData([]);
          setFinal(true);
          setLocation(null);
        }
      });
    }
  };

  useEffect(() => {
    dispatch(getPertCodesync(null));
  }, []);

  useEffect(() => {
    setLocation(null);
    reset({ location: null });
  }, [type]);

  return (
    <div>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"Are you absolutely sure?"}</DialogTitle>
        <DialogContent sx={{ width: "600px" }}>
          <DialogContentText id="alert-dialog-description">
            If you change [Request Type] your whole data will be reset
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              dispatch(setType(reqType));
              reset();
              setRowData([]);
              setLocation(null);
              setOpen(false);
            }}
            autoFocus
          >
            Continue
          </Button>
        </DialogActions>
      </Dialog>

      {final ? (
        <div className="h-[calc(100vh-100px)] flex items-center justify-center bg-white">
          <div className="max-h-max max-w-max flex flex-col gap-[30px]">
            <Success>
              <div className="success-animation">
                <svg
                  className="checkmark"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 52 52"
                >
                  <circle
                    className="checkmark__circle"
                    cx="26"
                    cy="26"
                    r="25"
                    fill="none"
                  />
                  <path
                    className="checkmark__check"
                    fill="none"
                    d="M14.1 27.2l7.1 7.2 16.7-16.8"
                  />
                </svg>
              </div>
            </Success>
            <div className="flex items-center gap-[10px]">
              <p className="text-green-600">
                {craeteRequestData && craeteRequestData.message}
              </p>
            </div>
            <div className="flex items-center justify-center">
              <Button
                endIcon={<FaArrowRightLong />}
                onClick={() => {
                  setFinal(false);
                  setLocation(null);
                  reset({ location: null });
                }}
                variant="contained"
              >
                Create New Request
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="h-[calc(100vh-100px)] overflow-y-hidden grid grid-cols-[450px_1fr]">
          <div className="h-full overflow-y-auto bg-white border-r border-neutral-300">
            <form onSubmit={handleSubmit(onSubmit)}>
              <div>
                <div className="h-[41px] border-b border-neutral-300 p-0 flex flex-col justify-center px-[20px] bg-slate-100">
                  <Typography className="text-slate-600 font-[500]" fontWeight={500}>
                    Header Details
                  </Typography>
                </div>
                <CardContent className="flex flex-col gap-[20px] py-[20px]">
                  <RadioGroup value={type}>
                    <div className="grid grid-cols-2 gap-[20px]">
                      <ListItemButton
                        sx={{
                          border: "1px solid #5F259F",
                          borderRadius: "5px",
                          "&.Mui-selected": {
                            backgroundColor: "#f3e8ff",
                            color: "black",
                          },
                        }}
                        onClick={() => handleTypeChange("part")}
                        selected={type === "part"}
                      >
                        <FormControlLabel
                          value={"part"}
                          control={<Radio />}
                          label={<ListItemText primary={"Material"} />}
                          sx={{ width: "100%", margin: 0 }}
                        />
                      </ListItemButton>
                      <ListItemButton
                        sx={{
                          borderRadius: "5px",
                          border: "1px solid #5F259F",
                          "&.Mui-selected": {
                            backgroundColor: "#f3e8ff",
                            color: "black",
                          },
                        }}
                        onClick={() => handleTypeChange("device")}
                        selected={type === "device"}
                      >
                        <FormControlLabel
                          value={"device"}
                          control={<Radio />}
                          label={<ListItemText primary={"SKU"} />}
                          sx={{ width: "100%", margin: 0 }}
                        />
                      </ListItemButton>
                    </div>
                  </RadioGroup>

                  {type === "device" ? (
                    <Controller
                      name="location"
                      control={control}
                      rules={{ required: "Location is required" }}
                      render={({ field }) => (
                        <SelectLocationAcordingModule
                          key={`device-${type}`}
                          endPoint={"/preQc/pickLocation"}
                          error={!!errors.location}
                          helperText={errors.location?.message}
                          value={field.value}
                          onChange={(e) => {
                            field.onChange(e);
                            setLocation(e);
                          }}
                        />
                      )}
                    />
                  ) : (
                    <Controller
                      name="location"
                      control={control}
                      rules={{ required: "Location is required" }}
                      render={({ field }) => (
                        <SelectLocationAcordingModule
                          key={`part-${type}`}
                          endPoint={"/req/without-bom/req-location"}
                          error={!!errors.location}
                          helperText={errors.location?.message}
                          value={field.value}
                          onChange={(e) => {
                            field.onChange(e);
                            setLocation(e);
                          }}
                        />
                      )}
                    />
                  )}

                  {location && (
                    <div className="flex gap-[10px] items-center">
                      <Typography>Location Details :</Typography>
                      <span className="text-[14px] text-slate-600">{location.name}</span>
                    </div>
                  )}

                  <div>
                    <TextField
                      fullWidth
                      multiline
                      rows={4}
                      label="Remark (if any)"
                      {...register("remarks")}
                    />
                  </div>

                </CardContent>
                <CardFooter className="h-[50px] p-0 flex items-center px-[20px] gap-[10px] justify-end">
                  <LoadingButton
                    type="button"
                    onClick={() => {
                      reset();
                      setRowData([]);
                      setLocation(null);
                    }}
                    startIcon={<Icons.refresh fontSize="small" />}
                    variant={"contained"}
                    sx={{ background: "white", color: "red" }}
                  >
                    Reset
                  </LoadingButton>
                  <LoadingButton
                    type="submit"
                    loadingPosition="start"
                    loading={createProductRequestLoading}
                    startIcon={<Icons.save fontSize="small" />}
                    variant="contained"
                  >
                    Submit
                  </LoadingButton>
                </CardFooter>
              </div>
            </form>
          </div>
          <MaterialReqTable
            addRow={addRow}
            setRowdata={setRowData}
            rowData={rowData}
          />
        </div>
      )}
    </div>
  );
};

const Success = styled.div`
  .checkmark {
    width: 150px;
    height: 150px;
    border-radius: 50%;
    display: block;
    stroke-width: 2;
    stroke: #4bb71b;
    stroke-miterlimit: 10;
    box-shadow: inset 0px 0px 0px #4bb71b;
    animation: fill 0.4s ease-in-out 0.4s forwards,
      scale 0.3s ease-in-out 0.9s both;
    position: relative;
    top: 5px;
    right: 5px;
    margin: 0 auto;
  }
  .checkmark__circle {
    stroke-dasharray: 166;
    stroke-dashoffset: 166;
    stroke-width: 2;
    stroke-miterlimit: 10;
    stroke: #4bb71b;
    fill: #fff;
    animation: stroke 0.6s cubic-bezier(0.65, 0, 0.45, 1) forwards;
  }
  .checkmark__check {
    transform-origin: 50% 50%;
    stroke-dasharray: 48;
    stroke-dashoffset: 48;
    animation: stroke 0.3s cubic-bezier(0.65, 0, 0.45, 1) 0.8s forwards;
  }
  @keyframes stroke {
    100% {
      stroke-dashoffset: 0;
    }
  }
  @keyframes scale {
    0%,
    100% {
      transform: none;
    }
    50% {
      transform: scale3d(1.1, 1.1, 1);
    }
  }
  @keyframes fill {
    100% {
      box-shadow: inset 0px 0px 0px 30px #4bb71b;
    }
  }
`;

export default MaterialReqWithoutBom;

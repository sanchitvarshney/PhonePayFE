import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Chip, LinearProgress, Tab, Tabs, Typography } from "@mui/material";
import React, { useEffect } from "react";
import Divider from "@mui/material/Divider";
import { useNavigate, useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/hooks/useReduxHook";
import { getComponentDetailSlice } from "@/features/master/component/componentSlice";
import { Skeleton } from "@/components/ui/skeleton";
import UpdateComponentBasicDetail from "@/components/form/components/UpdateComponentBasicDetail";
import UpdateComponentAdvanceDetail from "@/components/form/components/UpdateComponentAdvanceDetail";
import UpdateComponentProductionDetail from "@/components/form/components/UpdateComponentProductionDetail";
import UpdateComponentTaxDetail from "@/components/form/components/UpdateComponentTaxDetail";

const MasterComponentDeatil: React.FC = () => {
  const { componentDetail, getComponentDetailLoading } = useAppSelector(
    (state) => state.component,
  );
  const [value2, setValue2] = React.useState("detail1");
  const [updateBasicDetail, setUpdateBasicDetail] =
    React.useState<boolean>(false);
  const [updateComponentAdvanceDetail, setUpdateComponentAdvanceDetail] =
    React.useState<boolean>(false);
  const [updateComponentProductionDetail, setUpdateComponentProductionDetail] =
    React.useState<boolean>(false);
  const [updateComponentTaxDetail, setUpdateComponentTaxDetail] =
    React.useState<boolean>(false);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { id } = useParams();
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    element?.scrollIntoView({ behavior: "smooth" });
  };

  const handleChange2 = (_: React.SyntheticEvent, newValue: string) => {
    setValue2(newValue);
    scrollToSection(newValue);
  };
  useEffect(() => {
    if (id) {
      dispatch(getComponentDetailSlice(id));
    }
  }, [id]);
  return (
    <div className="relative bg-white">
      <div className="absolute top-0 left-0 right-0">
        {getComponentDetailLoading && <LinearProgress />}
      </div>
      <div className="head bg-amber-100/50 h-[100px] border-b border-neutral-400/70 flex items-center justify-between">
        <div className="flex gap-[20px] ">
          <Button
            onClick={() => navigate(-1)}
            className="p-0 pr-2 text-black bg-transparent rounded-none shadow-none rounded-e-md hover:bg-white/70"
          >
            <Icons.left fontSize="small" />
          </Button>
          {getComponentDetailLoading ? (
            <div className="min-w-[300px] flex flex-col gap-[5px]">
              <Skeleton className="w-full rounded-md h-[20px]" />
              <Skeleton className="w-[70%] rounded-md h-[15px]" />
              <Skeleton className="w-[40%] rounded-md h-[13px]" />
            </div>
          ) : (
            <div className="flex flex-col">
              <div className="flex items-center gap-[10px]">
                <Typography variant="h1" fontSize={17} fontWeight={600}>
                  {componentDetail?.[0]?.name}
                </Typography>
              </div>
              <Chip
                label={componentDetail?.[0]?.partcode}
                size="small"
                variant="filled"
                sx={{
                  maxWidth: "max-content",
                  px: "10px",
                  background: "black",
                  color: "white",
                  fontWeight: 500,
                }}
              />
            </div>
          )}

          <Divider orientation="vertical" flexItem />
        </div>
        <div className="flex items-center pr-[20px] gap-[10px]">
          {/* <div className="bg-white p-[10px] px-[20px] border border-neutral-300 rounded-md">
            <Typography fontSize={14}>TOTAL STOCK</Typography>
            <div className="flex items-center gap-[10px]">
              <Typography className="text-cyan-700" fontSize={16} fontWeight={600}>
                0 NOS
              </Typography>
              <Divider
                sx={{
                  width: "3px", // Adjust the width of the vertical divider
                  backgroundColor: "gray", // Optional: Set the color
                  margin: "4px 7px", // Optional: Add margin
                }}
                orientation="vertical"
                variant="middle"
                flexItem
              />
              <Typography fontSize={16} fontWeight={600}>
                0.0 $
              </Typography>
            </div>
          </div> */}
          <Button
            disabled={getComponentDetailLoading}
            onClick={() => dispatch(getComponentDetailSlice(id || ""))}
            className="py-[5px] px-[10px] bg-white text-slate-600 border border-slate-600 hover:bg-white/80"
          >
            <Icons.refresh />
          </Button>
          <Button
            disabled
            className="py-[5px] px-[10px] bg-white text-red-600 border border-red-600 hover:bg-white/80"
          >
            <Icons.delete />
          </Button>
        </div>
      </div>
      <div className="border-b tsb border-neutral-400/70 ">
        {getComponentDetailLoading ? (
          <div className="h-[calc(100vh-151px)] flex items-center justify-center">
            <img src="/search.svg" className="w-[400px] opacity-60 " alt="" />
          </div>
        ) : (
          <div className="h-[calc(100vh-151px)]  grid grid-cols-[200px_1fr]">
            <div className="border-r border-neutral-400/70">
              <Tabs
                selectionFollowsFocus
                orientation="vertical"
                value={value2}
                onChange={handleChange2}
                aria-label="secondary tabs example"
              >
                <Tab
                  value="primary-item-details"
                  label={
                    <div className="flex w-full items-start gap-[10px]">
                      <Typography fontSize={13} className="capitalize">
                        Basic Detail
                      </Typography>
                    </div>
                  }
                />
                <Tab
                  value="stock-in-all-units"
                  label={
                    <div className="flex w-full items-start gap-[10px]">
                      <Typography fontSize={13} className="capitalize">
                        Tax Details
                      </Typography>
                    </div>
                  }
                />

                <Tab
                  value="attachments"
                  label={
                    <div className="flex w-full items-center gap-[10px]">
                      <Typography fontSize={13} className="capitalize">
                        Advance Details
                      </Typography>
                    </div>
                  }
                />
                <Tab
                  value="production-details"
                  label={
                    <div className="flex w-full items-center gap-[10px]">
                      <Typography fontSize={13} className="capitalize">
                        Production Details
                      </Typography>
                    </div>
                  }
                />
              </Tabs>
            </div>
            <div className="h-full overflow-y-auto  p-[20px]">
              <div>
                {/* Section: Primary Item Details */}
                <section aria-labelledby="primary-item-details">
                  <div
                    id="primary-item-details"
                    className="flex items-center w-full gap-3"
                  >
                    <h2
                      id="primary-item-details"
                      className="text-lg font-semibold"
                    >
                      Basic Details
                    </h2>
                    <Divider
                      sx={{
                        borderBottomWidth: 2,
                        borderColor: "#d4d4d4",
                        flexGrow: 1,
                      }}
                    />
                    <button
                      onClick={() => setUpdateBasicDetail(true)}
                      type="button"
                      className="flex items-center gap-1 p-1 px-3 text-sm bg-transparent rounded-md shadow-none hover:bg-gray-100 text-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      aria-label="Add alternate UOM"
                    >
                      <Icons.edit fontSize="small" sx={{ fontSize: "15px" }} />
                      Edit Basic Details
                    </button>
                  </div>
                  {updateBasicDetail ? (
                    <UpdateComponentBasicDetail
                      detail={{
                        name: componentDetail?.[0]?.name || "",
                        uom: componentDetail?.[0]?.uomname || "",
                        category: componentDetail?.[0]?.category || {
                          name: "",
                          code: "",
                        },
                        subcategory: componentDetail?.[0]?.subcategory || {
                          name: "",
                          code: "",
                        },
                        mrp: componentDetail?.[0]?.mrp || "",
                        status: componentDetail?.[0]?.enable_status || "",
                        description: componentDetail?.[0]?.description || "",
                        uomId: componentDetail?.[0]?.uomid || "",
                      }}
                      setUpdateBasicDetail={setUpdateBasicDetail}
                    />
                  ) : (
                    <div className="grid grid-cols-4 gap-6 mt-4">
                      {[
                        {
                          label: "Part Code",
                          value: componentDetail?.[0]?.partcode,
                        },
                        {
                          label: "Component Name",
                          value: componentDetail?.[0]?.name,
                        },
                        { label: "UOM", value: componentDetail?.[0]?.uomname },
                        { label: "MRP", value: componentDetail?.[0]?.mrp },
                        {
                          label: "Status",
                          value:
                            componentDetail?.[0]?.enable_status === "Y"
                              ? "Active"
                              : "Inactive",
                        },
                        {
                          label: "Category",
                          value: componentDetail?.[0]?.category?.name,
                        },
                        {
                          label: "Sub Category",
                          value: componentDetail?.[0]?.subcategory?.name,
                        },
                        {
                          label: "Description",
                          value: componentDetail?.[0]?.description,
                        },
                      ].map(({ label, value }) => (
                        <div key={label} className="py-5">
                          <Typography
                            variant="body2"
                            color="textSecondary"
                            className="text-gray-600"
                          >
                            {label}:
                          </Typography>
                          <Typography variant="body1" fontWeight={500}>
                            {value || "N/A"}
                          </Typography>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Section: Stock in All Units */}
                  <section
                    id="stock-in-all-units"
                    aria-labelledby="stock-details"
                    className="mt-8"
                  >
                    <header className="flex items-center w-full gap-3">
                      <h2 id="stock-details" className="text-lg font-semibold">
                        Tax Details
                      </h2>
                      <Divider
                        sx={{
                          borderBottomWidth: 2,
                          borderColor: "#d4d4d4",
                          flexGrow: 1,
                        }}
                      />
                      <button
                        onClick={() => setUpdateComponentTaxDetail(true)}
                        type="button"
                        className="flex items-center gap-1 p-1 px-3 text-sm bg-transparent rounded-md shadow-none hover:bg-gray-100 text-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        aria-label="Add alternate UOM"
                      >
                        <Icons.edit
                          fontSize="small"
                          sx={{ fontSize: "15px" }}
                        />
                        Edit Tax Details
                      </button>
                    </header>
                    {updateComponentTaxDetail ? (
                      <UpdateComponentTaxDetail
                        setUpdateTaxDetail={setUpdateComponentTaxDetail}
                        detail={{
                          taxRate: componentDetail?.[0]?.gst_rate || 0,
                          hsn: componentDetail?.[0]?.c_hsn || "",
                        }}
                      />
                    ) : (
                      <div className="grid grid-cols-4 gap-6 mt-4">
                        {[
                          {
                            label: "HSN Code",
                            value: componentDetail?.[0]?.c_hsn,
                          },
                          {
                            label: "GST Rate (%)",
                            value: componentDetail?.[0]?.gst_rate,
                          },
                        ].map(({ label, value }) => (
                          <div key={label} className="py-5">
                            <Typography
                              variant="body2"
                              color="textSecondary"
                              className="text-gray-600"
                            >
                              {label}:
                            </Typography>
                            <Typography variant="body1" fontWeight={500}>
                              {value || "N/A"}
                            </Typography>
                          </div>
                        ))}
                      </div>
                    )}
                  </section>

                  <section
                    id="attachments"
                    aria-labelledby="attachments"
                    className="mt-8"
                  >
                    <header className="flex items-center w-full gap-3">
                      <h2 id="attachments" className="text-lg font-semibold">
                        Advance Details
                      </h2>
                      <Divider
                        sx={{
                          borderBottomWidth: 2,
                          borderColor: "#d4d4d4",
                          flexGrow: 1,
                        }}
                      />
                      <button
                        onClick={() => setUpdateComponentAdvanceDetail(true)}
                        type="button"
                        className="flex items-center gap-1 p-1 px-3 text-sm bg-transparent rounded-md shadow-none hover:bg-gray-100 text-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        aria-label="Add attachments"
                      >
                        <Icons.edit
                          fontSize="small"
                          sx={{ fontSize: "15px" }}
                        />
                        Edit Advance Details
                      </button>
                    </header>
                    {updateComponentAdvanceDetail ? (
                      <UpdateComponentAdvanceDetail
                        setUpdateAdvanceDetail={setUpdateComponentAdvanceDetail}
                        detail={{
                          brand: componentDetail?.[0]?.brand || "",
                          ean: componentDetail?.[0]?.ean || "",
                          weight: componentDetail?.[0]?.weight || "",
                          height: componentDetail?.[0]?.height || "",
                          width: componentDetail?.[0]?.width || "",
                          vweight: componentDetail?.[0]?.vweight || "",
                        }}
                      />
                    ) : (
                      <div className="grid grid-cols-4 gap-6 mt-4">
                        {[
                          {
                            label: "Brand",
                            value: componentDetail?.[0]?.brand,
                          },
                          { label: "Ean", value: componentDetail?.[0]?.ean },
                          {
                            label: "Weight(gms)",
                            value: componentDetail?.[0]?.weight,
                          },
                          {
                            label: "Height(mm)",
                            value: componentDetail?.[0]?.height,
                          },
                          {
                            label: "Width(mm)",
                            value: componentDetail?.[0]?.width,
                          },
                          {
                            label: "Volumetric Weight",
                            value: componentDetail?.[0]?.vweight,
                          },
                        ].map(({ label, value }) => (
                          <div key={label} className="py-5">
                            <Typography
                              variant="body2"
                              color="textSecondary"
                              className="text-gray-600"
                            >
                              {label}:
                            </Typography>
                            <Typography variant="body1" fontWeight={500}>
                              {value || "N/A"}
                            </Typography>
                          </div>
                        ))}
                      </div>
                    )}
                  </section>
                  <section
                    id="production-details"
                    aria-labelledby="production-details"
                    className="mt-8"
                  >
                    <header className="flex items-center w-full gap-3">
                      <h2 className="text-lg font-semibold">
                        Production Details
                      </h2>
                      <Divider
                        sx={{
                          borderBottomWidth: 2,
                          borderColor: "#d4d4d4",
                          flexGrow: 1,
                        }}
                      />
                      <button
                        onClick={() => setUpdateComponentProductionDetail(true)}
                        type="button"
                        className="flex items-center gap-1 p-1 px-3 text-sm bg-transparent rounded-md shadow-none hover:bg-gray-100 text-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        aria-label="Add attachments"
                      >
                        <Icons.edit
                          fontSize="small"
                          sx={{ fontSize: "15px" }}
                        />
                        Edit Production Details
                      </button>
                    </header>
                    {updateComponentProductionDetail ? (
                      <UpdateComponentProductionDetail
                        setUpdateProductionDetail={
                          setUpdateComponentProductionDetail
                        }
                        detail={{
                          minStock: componentDetail?.[0]?.minorderqty || "",
                          maxStock: componentDetail?.[0]?.maxqty || "",
                          minOrder: componentDetail?.[0]?.minorderqty || "",
                          leadtime: componentDetail?.[0]?.leadtime || "",
                          anableAlert: componentDetail?.[0]?.alert_status || "",
                          purchaseCost: "--",
                          otherCost: "--",
                        }}
                      />
                    ) : (
                      <div className="grid grid-cols-4 gap-6 mt-4">
                        {[
                          {
                            label: "Min Stock",
                            value: componentDetail?.[0]?.minorderqty,
                          },
                          {
                            label: "Max Stock",
                            value: componentDetail?.[0]?.maxqty,
                          },
                          {
                            label: "Min Order",
                            value: componentDetail?.[0]?.minorderqty,
                          },
                          {
                            label: "Lead Time",
                            value: componentDetail?.[0]?.leadtime,
                          },
                        ].map(({ label, value }) => (
                          <div key={label} className="py-5">
                            <Typography
                              variant="body2"
                              color="textSecondary"
                              className="text-gray-600"
                            >
                              {label}:
                            </Typography>
                            <Typography variant="body1" fontWeight={500}>
                              {value || "N/A"}
                            </Typography>
                          </div>
                        ))}
                      </div>
                    )}
                  </section>
                </section>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MasterComponentDeatil;

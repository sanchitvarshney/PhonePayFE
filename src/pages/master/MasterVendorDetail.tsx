import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { IconButton, LinearProgress, Tab, Tabs, Typography } from "@mui/material";
import React, { useEffect } from "react";
import Divider from "@mui/material/Divider";
import { useNavigate, useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/hooks/useReduxHook";
import { getVendorBranch } from "@/features/master/vendor/vendorSlice";
import { replaceBrWithNewLine } from "@/utils/replacebrtag";
import { Skeleton } from "@/components/ui/skeleton";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import UpdateVendorBranchForm from "@/components/form/UpdateVendorBranchForm";
import AddVendorBranch from "@/components/featureModels/AddVendorBranch";
import UpdateVendorBasicDetail from "@/components/form/UpdateVendorBasicDetail";

const MasterVendorDetail: React.FC = () => {
  const [addvendor, setAddVendor] = React.useState<boolean>(false);
  const [updatebasicdetail, setUpdateBasicDetail] = React.useState<boolean>(false);
  const [editbranchid, setEditBranchId] = React.useState<string>("");
  const dispatch = useAppDispatch();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const { vendorDetail, getVendorDetailLoading } = useAppSelector((state) => state.vendor);
  const { id } = useParams();
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const [value2, setValue2] = React.useState("detail1");
  const navigate = useNavigate();

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    element?.scrollIntoView({ behavior: "smooth" });
  };

  const handleChange2 = (_: React.SyntheticEvent, newValue: string) => {
    setValue2(newValue);
    scrollToSection(newValue);
  };

  const handleclose = () => {
    setAddVendor(false);
  };
  useEffect(() => {
    if (id) {
      dispatch(getVendorBranch(id));
    }
  }, [id]);
  return (
    <>
      <AddVendorBranch open={addvendor} handleClose={handleclose} />
      <div className="relative bg-white">
        <div className="absolute top-0 left-0 right-0">{getVendorDetailLoading && <LinearProgress />}</div>

        <div className="head bg-cyan-50 h-[100px] border-b border-neutral-400/70 flex items-center justify-between">
          <div className="flex items-center justify-between gap-[20px]   ">
            <Button onClick={() => navigate(-1)} className="p-0 pr-2 text-black bg-transparent rounded-none shadow-none rounded-e-md hover:bg-white/70">
              <Icons.left fontSize="small" />
            </Button>
            {getVendorDetailLoading ? (
              <div className="min-w-[300px] flex flex-col gap-[5px]">
                <Skeleton className="w-full rounded-md h-[20px]" />
                <Skeleton className="w-[70%] rounded-md h-[15px]" />
                <Skeleton className="w-[40%] rounded-md h-[13px]" />
              </div>
            ) : (
              <div className="flex flex-col min-w-[200px]">
                <div className="flex items-center gap-[10px]">
                  <Typography variant="h1" fontSize={17} fontWeight={600}>
                    {vendorDetail?.vendor?.name}
                  </Typography>
                </div>
                <Typography variant="body2" color="text.secondary" gutterBottom fontSize={13}>
                  {vendorDetail?.vendor?.cinNo}
                </Typography>
                <Typography variant="body2" color="success" gutterBottom fontSize={13}>
                  Active
                </Typography>
              </div>
            )}

            <Divider orientation="vertical" flexItem />
          </div>
          <div className="flex items-center pr-[20px] gap-[10px]">
            <Button
              onClick={() => {
                dispatch(getVendorBranch(id || ""));
              }}
              className="p-[5px] px-[8px]  bg-white text-slate-600 border border-slate-600 hover:bg-white/80"
            >
              <Icons.refresh fontSize="small" />
            </Button>
            <Button disabled className="p-[5px] px-[8px]  bg-white text-red-600 border border-red-600 hover:bg-white/80">
              <Icons.delete fontSize="small" />
            </Button>
          </div>
        </div>
        {getVendorDetailLoading ? (
          <div className="h-[calc(100vh-150px)] flex items-center justify-center">
            <img src="/search.svg" className="w-[400px] opacity-60 " alt="" />
          </div>
        ) : (
          <div className="h-[calc(100vh-150px)]  grid grid-cols-[200px_1fr]">
            <div className="border-r border-neutral-400/70">
              <Tabs selectionFollowsFocus orientation="vertical" value={value2} onChange={handleChange2} aria-label="secondary tabs example">
                <Tab
                  value="primary-details"
                  label={
                    <div className="flex w-full items-start gap-[10px]">
                      <Typography fontSize={13} className="capitalize">
                        Primary Details
                      </Typography>
                    </div>
                  }
                />

                <Tab
                  value="GST"
                  label={
                    <div className="flex w-full items-center gap-[10px]">
                      <Typography fontSize={13} className="capitalize">
                        GST Details
                      </Typography>
                    </div>
                  }
                />
                <Tab
                  value="Branch"
                  label={
                    <div className="flex w-full items-center gap-[10px]">
                      <Typography fontSize={13} className="capitalize">
                        Branch Details
                      </Typography>
                    </div>
                  }
                />
                <Tab
                  value="attachments"
                  label={
                    <div className="flex w-full items-center gap-[10px]">
                      <Typography fontSize={13} className="capitalize">
                        Documnets
                      </Typography>
                    </div>
                  }
                />
              </Tabs>
            </div>
            <div className="h-full overflow-y-auto  p-[20px]">
              <div>
                <section aria-labelledby="primary-item-details">
                  <div id="primary-details" className="flex items-center w-full gap-3">
                    <h2 id="primary-details" className="text-lg font-semibold">
                      Primary Details
                    </h2>
                    <Divider sx={{ borderBottomWidth: 2, borderColor: "#d4d4d4", flexGrow: 1 }} />
                  </div>

                  <section aria-labelledby="basic-item-details" className="mt-8">
                    <header className="flex items-center w-full gap-3">
                      <h3 id="basic-item-details" className="text-sm font-medium text-cyan-700">
                        Basic Details
                      </h3>
                      <Divider
                        sx={{
                          borderBottomWidth: 1,
                          borderColor: "#d4d4d4",
                          flexGrow: 1,
                          borderStyle: "dashed",
                        }}
                      />
                      <button
                        onClick={() => setUpdateBasicDetail(true)}
                        type="button"
                        className="flex items-center gap-1 p-1 px-3 text-sm bg-transparent rounded-md shadow-none hover:bg-gray-100 text-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        aria-label="Edit basic item details"
                      >
                        <Icons.edit fontSize="small" sx={{ fontSize: "15px" }} />
                        Edit basic details
                      </button>
                    </header>
                    {updatebasicdetail ? (
                      <UpdateVendorBasicDetail detail={vendorDetail?.vendor || null} setUpdateBasicDetail={setUpdateBasicDetail} />
                    ) : (
                      <div className="grid grid-cols-4 gap-6 mt-4">
                        {[
                          { label: "Name", value: vendorDetail?.vendor?.name },
                          { label: "Email", value: vendorDetail?.vendor?.email },
                          { label: "Mobile", value: vendorDetail?.vendor?.mobile },
                          { label: "PAN Number", value: vendorDetail?.vendor?.panNo },
                          { label: "CIN Number", value: vendorDetail?.vendor?.cinNo },
                          { label: "Payment Terms (in-days)", value: vendorDetail?.vendor?.paymentinDays },
                        ].map(({ label, value }) => (
                          <div key={label} className="py-5">
                            <Typography variant="body2" color="textSecondary" className="text-gray-600">
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

                  <section className="mt-8">
                    <header className="flex items-center w-full gap-3">
                      <h3 id="item-prices" className="text-sm font-medium text-cyan-700">
                        Contact Details
                      </h3>
                      <Divider
                        sx={{
                          borderBottomWidth: 1,
                          borderColor: "#d4d4d4",
                          flexGrow: 1,
                          borderStyle: "dashed",
                        }}
                      />
                    </header>
                    <div className="grid grid-cols-4 gap-[30px] mt-[20px]">
                      <div className="flex justify-between w-full items-strat ">
                        <div>
                          <Typography variant="body2" color="textSecondary" className="text-gray-600">
                            {vendorDetail?.vendor?.name}
                          </Typography>
                          <div className="flex items-center gap-[10px] text-cyan-900">
                            <Icons.email fontSize="small" sx={{ fontSize: "17px" }} />
                            <Typography fontWeight={500}> {vendorDetail?.vendor?.email}</Typography>
                          </div>
                          <div className="flex items-center gap-[10px] text-cyan-900">
                            <Icons.call fontSize="small" sx={{ fontSize: "17px" }} />
                            <Typography fontWeight={500}>{vendorDetail?.vendor?.mobile}</Typography>
                          </div>
                        </div>
                        <div>
                          <IconButton size="small" id="fade-button" aria-controls={open ? "fade-menu" : undefined} aria-haspopup="true" aria-expanded={open ? "true" : undefined} onClick={handleClick}>
                            <Icons.threedotv fontSize="small" />
                          </IconButton>
                        </div>
                      </div>
                    </div>
                  </section>

                  <section id="GST" aria-labelledby="attachments" className="mt-8">
                    <header className="flex items-center w-full gap-3">
                      <h2 className="text-lg font-semibold">GST Details</h2>
                      <Divider sx={{ borderBottomWidth: 2, borderColor: "#d4d4d4", flexGrow: 1 }} />
                      <button disabled type="button" className="flex items-center gap-1 p-1 px-3 text-sm bg-transparent rounded-md shadow-none hover:bg-gray-100 text-cyan-500/30 focus:outline-none focus:ring-2 focus:ring-cyan-500" aria-label="Add attachments">
                        <Icons.edit fontSize="small" sx={{ fontSize: "15px" }} />
                        Edit GST Detail
                      </button>
                    </header>
                  </section>
                  <div className="grid grid-cols-4 gap-6 mt-4">
                    {[
                      { label: "GST Number", value: vendorDetail?.vendor?.gstin ?? "N/A" },
                      { label: "E-Invoice Applicability", value: "No" },
                    ].map(({ label, value }) => (
                      <div key={label} className="py-5">
                        <Typography variant="body2" color="textSecondary" className="text-gray-600">
                          {label}:
                        </Typography>
                        <Typography variant="body1" fontWeight={500}>
                          {value || "N/A"}
                        </Typography>
                      </div>
                    ))}
                  </div>

                  <section id="Branch" aria-labelledby="Branch" className="mt-8">
                    <header className="flex items-center w-full gap-3">
                      <h2 className="text-lg font-semibold">Branch Details</h2>
                      <Divider sx={{ borderBottomWidth: 2, borderColor: "#d4d4d4", flexGrow: 1 }} />
                      <button
                        onClick={() => setAddVendor(true)}
                        type="button"
                        className="flex items-center gap-1 p-1 px-3 text-sm bg-transparent rounded-md shadow-none hover:bg-gray-100 text-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        aria-label="Add attachments"
                      >
                        <Icons.edit fontSize="small" sx={{ fontSize: "15px" }} />
                        Add Branch
                      </button>
                    </header>
                  </section>
                  {vendorDetail &&
                    vendorDetail?.branch?.map((branch, i) =>
                      editbranchid === branch?.code ? (
                        <UpdateVendorBranchForm scrollToSection={scrollToSection} branch={branch} setEditBranchId={setEditBranchId} key={branch.code} />
                      ) : (
                        <div id={branch.code} key={branch.code}>
                          <header className="flex items-center w-full gap-3 mt-3">
                            <h3 id="basic-item-details" className="text-sm font-medium text-cyan-700">
                              Branch {i + 1}
                            </h3>
                            <Divider
                              sx={{
                                borderBottomWidth: 1,
                                borderColor: "#d4d4d4",
                                flexGrow: 1,
                                borderStyle: "dashed",
                              }}
                            />
                            <DropdownMenu>
                              <DropdownMenuTrigger className="flex items-center gap-1 p-1 px-3 text-sm bg-transparent rounded-md shadow-none hover:bg-gray-100 text-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500" aria-label="Edit basic item details">
                                Manage Branch <Icons.down fontSize="small" />
                              </DropdownMenuTrigger>
                              <DropdownMenuContent>
                                <DropdownMenuItem
                                  onSelect={() => {
                                    setEditBranchId(branch?.code);
                                  }}
                                  className="flex items-center gap-[10px]"
                                >
                                  <Icons.edit fontSize="small" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem disabled className="flex items-center gap-[10px]">
                                  <Icons.delete fontSize="small" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </header>
                          <div className="flex gap-[50px]  mt-4 ">
                            <div className="grid w-[80%] grid-cols-4 gap-[20px] ">
                              {[
                                { label: "Branch Name", value: branch?.branch },
                                { label: "State", value: branch?.state?.name },
                                { label: "City", value: branch?.city },
                                { label: "Pincode", value: branch?.pincode },
                                { label: "Mobile", value: branch?.mobile },
                                { label: "Email", value: branch?.email },
                                { label: "GST IN", value: branch?.gstin },
                                { label: "Complete Address", value: replaceBrWithNewLine(branch?.address) },
                              ].map(({ label, value }) => (
                                <div key={label} className={`py-3 ${label === "Complete Address" ? "col-span-2" : ""}`}>
                                  <Typography variant="body2" color="textSecondary" className="text-gray-600">
                                    {label}:
                                  </Typography>
                                  <Typography variant="body1" fontWeight={500}>
                                    {value || "N/A"}
                                  </Typography>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )
                    )}
                </section>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default MasterVendorDetail;

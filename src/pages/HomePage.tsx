import { BiLinkExternal } from "react-icons/bi";
import { Link } from "react-router-dom";
import {Card, FormControl, IconButton, InputAdornment, OutlinedInput, Typography } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import SendIcon from "@mui/icons-material/Send";

const HomePage = () => {
  return (
    <div className="h-[calc(100vh-50px)] overflow-y-auto bg-white">
      <div className="w-full h-[calc(100vh-250px)] px-[200px]  py-[10px] flex items-center justify-center">
        <div>
          <div className="flex items-center justify-center w-full">
            <FormControl sx={{ width: "65%" }} variant="outlined">
              <OutlinedInput
                sx={{ borderRadius: "35px" }}
                placeholder="Search..."
                id="input-with-password-adornment"
                startAdornment={
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                }
              />
            </FormControl>
          </div>
          <div className="flex  items-center mt-[30px] gap-[20px]">
            <Card sx={{ background: "#ecfeff" }} elevation={2} className="h-[150px] w-[250px] flex items-center justify-center flex-col ">
              <img src={'/images/production.svg'} alt="" className="h-[100px] w-[100px]" />
              <Link to={"/"} className="flex items-center gap-[5px]">
                <p className="text-cyan-800 font-[600]">Production</p>
                <BiLinkExternal className="text-cyan-800" />
              </Link>
            </Card>
            <Card sx={{ background: "#ecfeff" }} elevation={2} className="h-[150px] w-[250px] flex items-center justify-center flex-col">
              <img src={'/images/warehouse.svg'} alt="" className="h-[100px] w-[100px]" />
              <Link to={"/"} className="flex items-center gap-[5px]">
                <p className="text-cyan-800 font-[600]">Warehouse</p>
                <BiLinkExternal className="text-cyan-800" />
              </Link>
            </Card>
            <Card sx={{ background: "#ecfeff" }} elevation={2} className="h-[150px] w-[250px] flex items-center justify-center flex-col">
              <img src={'/images/report.svg'} alt="" className="h-[100px] w-[100px]" />
              <Link to={"/"} className="flex items-center gap-[5px]">
                <p className="text-cyan-800 font-[600]">Reports</p>
                <BiLinkExternal className="text-cyan-800" />
              </Link>
            </Card>
          </div>
          {
            
          }
        </div>
      </div>
      <div className="h-[200px] bg-zinc-100 px-[200px] flex items justify-between py-[20px]">
        <div className="flex flex-col gap-[10px] w-[500px] items-start text-left justify-end">
          <img src="/images/ms.png" alt="Mscorpres Image" className="w-[250px]" />
          <div>
            <Typography fontSize={13} className=" text-zinc-500">
              MsCorpres Automation Pvt Ltd
            </Typography>
            <Typography fontSize={13} className=" text-zinc-500">
              Office No. 1 and 2, 3rd Floor, Plot number B-88 Sector 83, Noida, Gautam Buddha Nagar, 201305
            </Typography>
            <Typography fontSize={13} className=" text-zinc-500">
              Phone 2: +91 88 26 788880{" "}
            </Typography>
            <Typography fontSize={13} className=" text-zinc-500">
              Email: marketing@mscorpres.in
            </Typography>
          </div>
        </div>
        <div className="flex flex-col items-start justify-between ">
          <div>
            <Typography sx={{ ml: "10px", color: "grey" }}>Stay updated with our latest products and updates .</Typography>
            <FormControl fullWidth variant="outlined" sx={{ py: "10px" }}>
              <OutlinedInput
                placeholder="Search..."
                id="input-with-password-adornment"
                endAdornment={
                  <InputAdornment position="end">
                    <IconButton>
                      <SendIcon />
                    </IconButton>
                  </InputAdornment>
                }
              />
            </FormControl>
          </div>
          <Typography fontSize={13} className="text-zinc-500">
            © {new Date().getFullYear()} MsCorpres Automation Pvt. Ltd. | All rights reserved
          </Typography>
        </div>
      </div>
    </div>
  );
};

export default HomePage;

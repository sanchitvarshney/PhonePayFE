import { BiLinkExternal } from "react-icons/bi";
import { Link } from "react-router-dom";
import { Button, Card, FormControl, InputAdornment, OutlinedInput, Typography } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

const HomePage = () => {
  return (
    <div className="h-[calc(100vh-50px)] overflow-y-auto bg-white">
      <div className="w-full h-[calc(100vh-250px)] px-[200px] py-[10px] flex items-center justify-center">
        <div>
          <div className="flex items-center justify-center w-full">
            <FormControl sx={{ width: "65%" }} variant="outlined">
              <OutlinedInput
                sx={{ borderRadius: "35px" }}
                placeholder="Search..."
                startAdornment={
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                }
              />
            </FormControl>
          </div>
          <div className="flex items-center mt-[30px] gap-[20px]">
            <Card
              sx={{ background: "#f3e8ff" }}
              elevation={2}
              className="h-[150px] w-[250px] flex items-center justify-center flex-col"
            >
              <Link to="/" className="flex items-center gap-[5px]">
                <p className="text-[#5F259F] font-[600]">Production</p>
                <BiLinkExternal className="text-[#5F259F]" />
              </Link>
            </Card>
            <Card
              sx={{ background: "#f3e8ff" }}
              elevation={2}
              className="h-[150px] w-[250px] flex items-center justify-center flex-col"
            >
              <Link to="/" className="flex items-center gap-[5px]">
                <p className="text-[#5F259F] font-[600]">Warehouse</p>
                <BiLinkExternal className="text-[#5F259F]" />
              </Link>
            </Card>
            <Card
              sx={{ background: "#f3e8ff" }}
              elevation={2}
              className="h-[150px] w-[250px] flex items-center justify-center flex-col"
            >
              <Link to="/dashboard" className="flex items-center gap-[5px]">
                <p className="text-[#5F259F] font-[600]">Dashboard</p>
                <BiLinkExternal className="text-[#5F259F]" />
              </Link>
            </Card>
          </div>
          <div className="flex items-center py-[10px] justify-center">
            <Button size="large" variant="contained" sx={{ fontSize: "15px" }}>
              View Report
            </Button>
          </div>
        </div>
      </div>
      <div className="h-[200px] bg-[#faf5ff] px-[200px] flex items-center justify-between py-[20px]">
        <div className="flex flex-col gap-[10px] w-[500px] items-start text-left justify-end">
          <div>
            <Typography fontSize={13} className="text-zinc-500">
              PhonePe
            </Typography>
            <Typography fontSize={13} className="text-zinc-500">
              © {new Date().getFullYear()} PhonePe. All rights reserved.
            </Typography>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;

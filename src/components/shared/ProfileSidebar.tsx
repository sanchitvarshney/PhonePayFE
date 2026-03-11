import React from "react";
import { FaArrowLeftLong } from "react-icons/fa6";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Props } from "@/types/MainLayout";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUser } from "@/hooks/useUser";
import { Link } from "react-router-dom";
import { Icons } from "../icons";

const ProfileSidebar: React.FC<Props> = ({ uiState }) => {
  const { setSheet2Open, sheet2Open, setLogotAlert } = uiState;
  const { user } = useUser();

  return (
    <div
      className={`absolute min-h-[100vh] w-[300px] z-[60] top-0 bg-[#3b0764] transition-all duration-500 ${sheet2Open ? "left-[60px]" : "left-[-300px]"}`}
    >
      <Button
        variant="outline"
        onClick={() => setSheet2Open(false)}
        className="cursor-pointer absolute top-[10px] right-[10px] bg-transparent text-white hover:bg-white/20 border-none hover:text-white"
      >
        <FaArrowLeftLong className="text-[20px]" />
      </Button>
      <div>
        <div className="user mt-[60px] flex flex-col items-center text-slate-200">
          <Avatar className="w-[100px] h-[100px]">
            <AvatarImage src="https://github.com/shadcn.png" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          <div className="name mt-[10px]">{user?.username ?? "User"}</div>
          <p className="text-[13px] text-slate-200">{user?.crn_type ?? ""}</p>
        </div>
        <div className="bg-white/10 h-[50px] mx-auto mt-[20px] flex items-center justify-center text-zinc-300 max-w-max px-[20px] rounded-md">
          <p>Secret Identity: {user?.crn_id ?? "-"}</p>
        </div>
        <div className="p-[10px] mt-[10px] flex flex-col gap-[10px] absolute bottom-[60px] w-full px-[10px]">
          <Link
            to="/profile"
            onClick={() => setSheet2Open(false)}
            className="flex items-center gap-[10px] py-[8px] px-[10px] hover:bg-white/10 rounded text-slate-300"
          >
            <Icons.person fontSize="small" />
            <span className="text-[13px]">Profile</span>
          </Link>
        </div>
        <div className="absolute bottom-0 left-0 p-[10px] w-full flex justify-center items-center">
          <Button
            onClick={() => setLogotAlert(true)}
            variant="outline"
            className="w-full bg-transparent hover:bg-white/10 gap-[10px] justify-start hover:text-white border-0 text-slate-300"
          >
            <LogOut className="h-[18px] w-[18px]" />
            <span className="text-[14px]">Logout</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProfileSidebar;

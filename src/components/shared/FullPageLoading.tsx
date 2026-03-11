import { ReloadIcon } from "@radix-ui/react-icons";

const FullPageLoading = () => {
  return (
    <div className="fixed z-[9999] top-0 left-0 right-0 bottom-0 bg-[#ffffffb1] flex justify-center items-center">
      <div className="shadow shadow-slate-300 rounded-md max-w-max px-[20px] py-[10px] flex gap-[10px] items-center">
        <ReloadIcon className="h-[40px] w-[40px] animate-spin text-slate-600" />
        <div className="text-slate-600 text-[20px]">Please wait...</div>
      </div>
    </div>
  );
};

export default FullPageLoading;

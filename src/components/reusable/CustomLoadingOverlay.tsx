const CustomLoadingOverlay = () => {
    return (
      <div className="z-20 flex items-center justify-center w-full h-full bg-white ">
        <div className="h-[50px] w-[50px] rounded-full bg-zinc-950/30 flex items-center justify-center ">
          <div className="h-[25px] w-[25px]  relative  animate-spin">
            <span className="h-[8px] w-[8px] bg-white rounded-full absolute top-0 left-0"></span>
            <span className="h-[8px] w-[8px] bg-white rounded-full absolute top-0 right-0"></span>
            <span className="h-[8px] w-[8px] bg-white rounded-full absolute bottom-0 left-0"></span>
            <span className="h-[8px] w-[8px] bg-white rounded-full absolute bottom-0 right-0"></span>
          </div>
        </div>
      </div>
    );
  };

  export default CustomLoadingOverlay
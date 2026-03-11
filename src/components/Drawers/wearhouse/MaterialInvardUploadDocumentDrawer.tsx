import React, { useState } from "react";
import {
  CustomDrawer,
  CustomDrawerContent,
  CustomDrawerHeader,
  CustomDrawerTitle,
} from "@/components/reusable/CustomDrawer";
import FileUploaderTest from "@/components/reusable/FileUploaderTest";

type Props = {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

const MaterialInvardUploadDocumentDrawer: React.FC<Props> = ({
  open,
  setOpen,
}) => {
  const [files, setfiles] = useState<File[] | null>(null);
  return (
    <div>
      <CustomDrawer open={open} onOpenChange={setOpen}>
        <CustomDrawerContent
          side="right"
          className="min-w-[30%] p-0"
        >
          <CustomDrawerHeader className="h-[50px] p-0 flex flex-col justify-center px-[20px] bg-zinc-200 gap-0 border-b border-zinc-400 ">
            <CustomDrawerTitle className="text-slate-600 font-[500] p-0">
              Upload Documents
            </CustomDrawerTitle>
          </CustomDrawerHeader>
          <div className="h-[calc(100vh-50px)] overflow-y-hidden p-[20px]">
            <FileUploaderTest
              onFileUpload={(file) => console.log(file)}
              files={files}
              setFiles={setfiles}
              mulTiple={true}
              maxFiles={5}
            />
          </div>
        </CustomDrawerContent>
      </CustomDrawer>
    </div>
  );
};

export default MaterialInvardUploadDocumentDrawer;

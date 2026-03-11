export type DocumentFileData = {
  originalFileName: string;
  fileID: string;
};

export type RawminState = {
  documnetFileData: DocumentFileData[] | null;
  createminLoading: boolean;
  formdata: unknown;
};

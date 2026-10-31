export const rightAlignedCellStyle = {
  textAlign: "right",
  justifyContent: "flex-end",
  paddingRight: "18px",
} as const;

export const centerAlignedCellStyle = {
  textAlign: "center",
  justifyContent: "center",
} as const;
export const leftAlignedCellStyle = {
  textAlign: "left",
  justifyContent: "center",
  paddingLeft: "18px",
  lineHeight: "20px",
  paddingTop: 8,
  paddingBottom: 8,
  fontSize: "13px",
} as const;

export const rightAlignedColumn = {
  cellStyle: rightAlignedCellStyle,
  headerClass: "ag-right-aligned-header",
};

export const centerAlignedColumn = {
  cellStyle: centerAlignedCellStyle,
  headerClass: "ag-center-aligned-header",
};

export const leftAlignedColumn = {
  cellStyle: leftAlignedCellStyle,
  headerClass: "ag-left-aligned-header",
};

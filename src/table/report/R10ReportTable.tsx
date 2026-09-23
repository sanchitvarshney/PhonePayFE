import React, { useState } from "react";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TablePagination from "@mui/material/TablePagination";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useAppSelector } from "@/hooks/useReduxHook";
import { formatNumber } from "@/utils/numberFormatUtils";
import { Icons } from "@/components/icons";

export type R10ProductRow = {
  Name: string;
  SKU: string;
  SKUKEY: string;
  Opening: string;
  Inward: string;
  Outward: string;
  Closing: string;
};

export type R10LocationGroup = {
  locationName: string;
  locationCode: string;
  products: R10ProductRow[];
};

type Props = {
  onDownloadLocation: (group: R10LocationGroup) => void;
  onDownloadRow: (group: R10LocationGroup, row: R10ProductRow) => void;
};

const LocationAccordion: React.FC<{
  group: R10LocationGroup;
  defaultExpanded?: boolean;
  onDownloadLocation: (group: R10LocationGroup) => void;
  onDownloadRow: (group: R10LocationGroup, row: R10ProductRow) => void;
}> = ({ group, defaultExpanded, onDownloadLocation, onDownloadRow }) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const paginatedRows = group.products.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage,
  );

  return (
    <Accordion disableGutters defaultExpanded={defaultExpanded}>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        sx={{ flexDirection: "row-reverse", gap: "10px" }}
      >
        <Typography fontWeight={600} sx={{ flex: 1 }}>
          {group.locationName}
        </Typography>
        <IconButton
          size="small"
          color="primary"
          onClick={(e) => {
            e.stopPropagation();
            onDownloadLocation(group);
          }}
        >
          <Icons.download fontSize="small" />
        </IconButton>
      </AccordionSummary>
      <AccordionDetails sx={{ p: 0 }}>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>SKU</TableCell>
                <TableCell align="right">Opening</TableCell>
                <TableCell align="right">Inward</TableCell>
                <TableCell align="right">Outward</TableCell>
                <TableCell align="right">Closing</TableCell>
                <TableCell align="center">Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedRows.map((row) => (
                <TableRow key={row.SKUKEY}>
                  <TableCell>{row.Name}</TableCell>
                  <TableCell>{row.SKU}</TableCell>
                  <TableCell align="right">{formatNumber(Number(row.Opening))}</TableCell>
                  <TableCell align="right">{formatNumber(Number(row.Inward))}</TableCell>
                  <TableCell align="right">{formatNumber(Number(row.Outward))}</TableCell>
                  <TableCell align="right">{formatNumber(Number(row.Closing))}</TableCell>
                  <TableCell align="center">
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => onDownloadRow(group, row)}
                    >
                      <Icons.download fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={group.products.length}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
        />
      </AccordionDetails>
    </Accordion>
  );
};

const R10ReportTable: React.FC<Props> = ({ onDownloadLocation, onDownloadRow }) => {
  const { r10Report, r10ReportLoading } = useAppSelector((state) => state.report);
  const groups: R10LocationGroup[] = r10Report?.data || [];

  if (r10ReportLoading) {
    return <div className="p-[20px]">Loading...</div>;
  }

  if (!r10Report || groups.length === 0) {
    return (
      <div className="flex items-center justify-center w-full h-full">
        <img src="/images/empty.png" className="w-[110px]" alt="No Data" />
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {groups.map((group, index) => (
        <LocationAccordion
          key={group.locationCode}
          group={group}
          defaultExpanded={index === 0}
          onDownloadLocation={onDownloadLocation}
          onDownloadRow={onDownloadRow}
        />
      ))}
    </div>
  );
};

export default R10ReportTable;

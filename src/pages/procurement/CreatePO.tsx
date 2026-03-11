import React from "react";
import { Typography, Button } from "@mui/material";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

const PHONEPE_PURPLE = "#5F259F";

const CreatePO: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="p-6 bg-white h-full overflow-auto">
      <Typography variant="h1" className="text-slate-600" fontSize={22} fontWeight={500}>
        Create PO
      </Typography>
      <Card className="mt-6 max-w-2xl">
        <CardContent className="pt-6">
          <Typography variant="body1" color="text.secondary">
            Create Purchase Order form — same layout as BharatPayFE. Connect your API and PO slices to enable full functionality.
          </Typography>
          <Button
            variant="contained"
            className="mt-4"
            sx={{ backgroundColor: PHONEPE_PURPLE, "&:hover": { backgroundColor: "#4a1d7a" } }}
            onClick={() => navigate("/procurement/manage")}
          >
            Go to Manage PO
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreatePO;

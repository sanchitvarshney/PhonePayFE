import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TextField } from "@mui/material";
import { getStoredApiBaseUrl, setApiBaseUrl, getApiBaseUrl } from "@/utils/apiSettings";
import { showToast } from "@/utils/toasterContext";
import { ArrowLeft } from "lucide-react";

const DEFAULT_PLACEHOLDER = import.meta.env.VITE_REACT_APP_API_BASE_URL || "https://your-api.example.com";

const Settings: React.FC = () => {
  const [apiUrl, setApiUrl] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setApiUrl(getStoredApiBaseUrl());
  }, []);

  const handleSave = () => {
    const trimmed = apiUrl.trim();
    setApiBaseUrl(trimmed);
    setSaved(true);
    const effective = getApiBaseUrl();
    if (effective) {
      showToast("API base URL saved. All API calls will use this route.", "success");
    } else {
      showToast("Custom API URL cleared. Using default from environment.", "success");
    }
    setTimeout(() => setSaved(false), 2000);
  };

  const handleClear = () => {
    setApiUrl("");
    setApiBaseUrl("");
    setSaved(true);
    showToast("Using default API URL from environment.", "success");
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <main className="flex flex-col flex-1 gap-2 p-2 md:gap-2 md:p-3 h-[calc(100vh-50px)] overflow-y-auto">
      <div className="max-w-2xl mx-auto w-full space-y-6">
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="icon" className="shrink-0">
            <Link to="/profile">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-semibold text-slate-800">Settings</h1>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="text-slate-800">API base URL</CardTitle>
            <CardDescription>
              Set your own API route so all requests (e.g. login, PO, masters) use this base URL. Leave empty to use the default from environment.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <TextField
              fullWidth
              label="API base URL"
              placeholder={DEFAULT_PLACEHOLDER}
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
              variant="outlined"
              size="small"
              helperText="e.g. https://localhost:3001 or https://your-api.example.com (no trailing slash)"
              InputProps={{
                className: "bg-white",
              }}
            />
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={handleSave}
                className="bg-[#5F259F] hover:bg-[#4c1d99]"
              >
                {saved ? "Saved" : "Save"}
              </Button>
              <Button variant="outline" onClick={handleClear}>
                Clear (use default)
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
};

export default Settings;

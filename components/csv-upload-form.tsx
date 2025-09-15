"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface UploadResponse {
  message: string;
  validRows: number;
  invalidRows: number;
  totalProcessed: number;
  error?: string;
}

export function CsvUploadForm() {
  const [file, setFile] = useState<File | null>(null);
  const [type, setType] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (!selectedFile.name.endsWith(".csv")) {
        toast.error("Please select a CSV file");
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file) {
      toast.error("Please select a file");
      return;
    }

    if (!type) {
      toast.error("Please select a file type");
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", type);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const result: UploadResponse = await response.json();

      if (!response.ok) {
        toast.error(result.error || "Upload failed");
        return;
      }

      toast.success(
        `Upload successful! ${result.validRows} valid rows processed${
          result.invalidRows > 0
            ? `, ${result.invalidRows} invalid rows skipped`
            : ""
        }`
      );

      // Reset form
      setFile(null);
      setType("");
      const fileInput = document.getElementById(
        "file-input"
      ) as HTMLInputElement;
      if (fileInput) fileInput.value = "";
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Upload failed. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const revenueColumns = [
    "amount",
    "date",
    "planId",
    "category",
    "description",
    "customerId",
  ];
  const expenseColumns = [
    "amount",
    "date",
    "category",
    "description",
    "vendor",
    "isRecurring",
  ];

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Upload CSV Data</CardTitle>
        <CardDescription>
          Upload your revenue or expense data in CSV format
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="type">Data Type</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger>
                <SelectValue placeholder="Select data type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="revenue">Revenue</SelectItem>
                <SelectItem value="expense">Expense</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="file-input">CSV File</Label>
            <Input
              id="file-input"
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              disabled={isUploading}
            />
            {file && (
              <p className="text-sm text-muted-foreground">
                Selected: {file.name}
              </p>
            )}
          </div>

          {type && (
            <div className="space-y-2">
              <Label>Required Columns</Label>
              <div className="p-3 bg-muted rounded-md">
                <p className="text-sm font-medium mb-2">
                  Your CSV must include these columns:
                </p>
                <div className="flex flex-wrap gap-2">
                  {(type === "revenue" ? revenueColumns : expenseColumns).map(
                    (col) => (
                      <span
                        key={col}
                        className="px-2 py-1 bg-background border rounded text-xs"
                      >
                        {col}
                      </span>
                    )
                  )}
                </div>
                {type === "revenue" && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Required: amount, date, planId. Optional: category,
                    description, customerId
                  </p>
                )}
                {type === "expense" && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Required: amount, date, category. Optional: description,
                    vendor, isRecurring
                  </p>
                )}
              </div>
            </div>
          )}

          <Button
            type="submit"
            disabled={!file || !type || isUploading}
            className="w-full"
          >
            {isUploading ? "Uploading..." : "Upload CSV"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

/**
 * Generic Bulk Upload Component
 * Reusable component for downloading templates and uploading bulk data
 * Can be used for Students, Teachers, Holidays, and other modules
 */

import { useState, useRef, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Download, Upload, Loader2, AlertCircle, CheckCircle2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

// Generic error type for bulk uploads
export interface BulkUploadError {
  row: number;
  error: string;
  data: Record<string, any>;
}

// Generic result type for bulk uploads
export interface BulkUploadResult {
  success?: boolean;
  created_count: number;
  failed_count: number;
  total_rows: number;
  errors: BulkUploadError[];
}

// Generic API response wrapper
export interface BulkUploadResponse {
  success: boolean;
  message: string;
  data: BulkUploadResult;
  code: number;
}

interface BulkUploadDialogProps {
  // Display configuration
  title: string;
  description: string;
  triggerLabel?: string;
  triggerVariant?: "default" | "outline" | "secondary";
  
  // API functions
  downloadTemplate: () => Promise<Blob>;
  uploadFile: (file: File) => Promise<BulkUploadResponse>;
  
  // Cache configuration
  invalidateQueryKeys: string[];
  
  // Optional customization
  templateFileName?: string;
  acceptedFileTypes?: string;
}

export function BulkUploadDialog({
  title,
  description,
  triggerLabel = "Bulk Upload",
  triggerVariant = "outline",
  downloadTemplate,
  uploadFile,
  invalidateQueryKeys,
  templateFileName = "bulk_upload_template.xlsx",
  acceptedFileTypes = ".xlsx,.xls",
}: BulkUploadDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadResult, setUploadResult] = useState<BulkUploadResult | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Reset file selection
  const resetFileInput = useCallback(() => {
    setSelectedFile(null);
    setUploadResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  // Download template handler
  const handleDownloadTemplate = async () => {
    setIsDownloading(true);
    try {
      const blob = await downloadTemplate();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = templateFileName;
      document.body.appendChild(link);
      link.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
      toast({
        title: "Success",
        description: "Template downloaded successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || "Failed to download template",
        variant: "destructive",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  // File change handler
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setUploadResult(null);
    }
  };

  // Upload handler
  const handleUpload = async () => {
    if (!selectedFile) {
      toast({
        title: "No file selected",
        description: "Please select a file to upload",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    try {
      const response = await uploadFile(selectedFile);
      const result = response.data;
      setUploadResult(result);

      // Invalidate cache
      invalidateQueryKeys.forEach((key) => {
        queryClient.invalidateQueries({ queryKey: [key] });
      });

      // Show success/partial success toast
      const message =
        result.failed_count === 0
          ? `${result.created_count} record${result.created_count > 1 ? "s" : ""} uploaded successfully`
          : `Created: ${result.created_count}, Failed: ${result.failed_count}`;

      toast({
        title: result.failed_count === 0 ? "Success" : "Partial Success",
        description: message,
        variant: result.failed_count > 0 ? "destructive" : undefined,
      });
    } catch (error: any) {
      const result = error?.data;
      if (result) {
        setUploadResult(result);
      } else {
        toast({
          title: "Error",
          description: error?.message || "Failed to upload file",
          variant: "destructive",
        });
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    setOpen(false);
    resetFileInput();
  };

  const hasErrors = uploadResult && uploadResult.failed_count > 0;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={triggerVariant} className="gap-2">
          <Upload className="h-4 w-4" />
          {triggerLabel}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            {title}
          </DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Download Template */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h3 className="font-semibold text-sm">Step 1: Download Template</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Get the Excel template with the correct format
              </p>
            </div>
            <Button
              variant="outline"
              onClick={handleDownloadTemplate}
              disabled={isDownloading}
              className="gap-2"
            >
              {isDownloading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              Download Template
            </Button>
          </div>

          {/* Upload File */}
          <div className="p-4 border rounded-lg space-y-3">
            <div>
              <h3 className="font-semibold text-sm">Step 2: Upload Filled Template</h3>
              <p className="text-xs text-muted-foreground mt-1">Select the Excel file with data</p>
            </div>
            <div className="flex items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept={acceptedFileTypes}
                onChange={handleFileChange}
                className="flex-1 text-sm font-sans file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 file:cursor-pointer cursor-pointer"
              />
              {selectedFile && (
                <Button variant="ghost" size="icon" onClick={resetFileInput}>
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Upload Result Summary */}
          {uploadResult && (
            <Alert variant={hasErrors ? "destructive" : "default"}>
              {hasErrors ? <AlertCircle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
              <AlertTitle>Upload Result</AlertTitle>
              <AlertDescription>
                <div className="flex items-center gap-3 mt-2">
                  <Badge variant="secondary">Total: {uploadResult.total_rows}</Badge>
                  <Badge variant="default" className="bg-green-500">
                    Created: {uploadResult.created_count}
                  </Badge>
                  {hasErrors && (
                    <Badge variant="destructive">Failed: {uploadResult.failed_count}</Badge>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Error Details */}
          {uploadResult?.errors && uploadResult.errors.length > 0 && (
            <div className="border rounded-lg p-4 space-y-3">
              <h3 className="font-semibold text-sm text-destructive">
                Errors ({uploadResult.errors.length})
              </h3>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {uploadResult.errors.map((error, index) => (
                  <div
                    key={index}
                    className="p-3 border border-destructive/30 rounded-lg bg-destructive/5"
                  >
                    <div className="flex items-start gap-2">
                      <Badge variant="destructive" className="mt-0.5">
                        Row {error.row}
                      </Badge>
                      <div className="flex-1 space-y-1">
                        <p className="text-sm text-destructive font-medium">{error.error}</p>
                        <div className="text-xs text-muted-foreground space-y-0.5">
                          {Object.entries(error.data).map(([key, value]) => (
                            <div key={key}>
                              <span className="font-medium capitalize">
                                {key.replace(/_/g, " ")}:
                              </span>{" "}
                              {String(value)}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Close
          </Button>
          <Button
            onClick={handleUpload}
            disabled={!selectedFile || isUploading}
            className="gap-2"
          >
            {isUploading && <Loader2 className="h-4 w-4 animate-spin" />}
            Upload
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Calendar Exception Management Component
 * Manages exceptional work policies for specific dates/classes
 * Features: Data table, pagination, sorting, and filtering
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { AlertCircle, Calendar as CalendarIcon, Loader2, Plus, X } from "lucide-react";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { ConfirmationDialog } from "@/common/components/dialogs";
import { SuccessDialog } from "@/common/components/dialogs/success-dialog";
import { ResourceFilter, type FilterField } from "@/common/components/filters";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TablePagination } from "@/components/ui/table-pagination";
import {
  deleteCalendarException,
  fetchCalendarExceptions,
  type CalendarExceptionFilters,
} from "@/lib/api/calendar-exception-api";
import type { CalendarException } from "@/lib/api/calendar-exception-types";
import { QUERY_KEYS, STALE_TIMES, createFilteredQueryKey } from "@/lib/constants";
import { parseApiError } from "@/lib/error-utils";
import { useClasses } from "@/lib/hooks/use-shared-queries";
import { cn } from "@/lib/utils";
import { getCalendarExceptionColumns } from "./calendar-exception-table-columns";

interface CalendarExceptionManagementProps {
  className?: string;
}

export function CalendarExceptionManagement({ className }: CalendarExceptionManagementProps) {
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const [deletingException, setDeletingException] = useState<CalendarException | null>(null);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [successMessage, setSuccessMessage] = useState({ title: "", description: "" });

  // Pagination and filtering state
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
  const [tempSelectedClasses, setTempSelectedClasses] = useState<string[]>([]);

  // Fetch classes for filter
  const { data: classesData } = useClasses();
  const classes = classesData?.data || [];

  // Sync tempSelectedClasses with selectedClasses when they change
  useEffect(() => {
    setTempSelectedClasses(selectedClasses);
  }, [selectedClasses]);

  // Build query filters
  const queryFilters: CalendarExceptionFilters = {
    page,
    page_size: pageSize,
    ordering: "-date",
    ...filters,
    ...(selectedClasses.length > 0 ? { classes: selectedClasses } : {}),
  };

  // Fetch calendar exceptions
  const {
    data: exceptionsData,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: createFilteredQueryKey(QUERY_KEYS.CALENDAR_EXCEPTIONS, queryFilters),
    queryFn: () => fetchCalendarExceptions(queryFilters),
    staleTime: STALE_TIMES.MODERATE,
  });

  const exceptions = exceptionsData?.data || [];
  const totalCount = exceptionsData?.pagination?.count || 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: deleteCalendarException,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CALENDAR_EXCEPTIONS] });
      setSuccessMessage({
        title: "Exception Deleted!",
        description: "Calendar exception has been deleted successfully.",
      });
      setShowSuccessDialog(true);
      setDeletingException(null);
    },
    onError: () => {
      setDeletingException(null);
    },
  });

  const handleDelete = () => {
    if (deletingException) {
      deleteMutation.mutate(deletingException.public_id);
    }
  };

  const handleView = (exception: CalendarException) => {
    setLocation(`/exceptional-work/${exception.public_id}/view`);
  };

  const handleEdit = (exception: CalendarException) => {
    setLocation(`/exceptional-work/${exception.public_id}/edit`);
  };

  const handleFilter = (newFilters: Record<string, string>) => {
    setFilters(newFilters);
    setSelectedClasses(tempSelectedClasses); // Apply the temp selected classes
    setPage(1); // Reset to first page when filtering
  };

  const handleResetFilters = () => {
    setFilters({});
    setSelectedClasses([]);
    setTempSelectedClasses([]);
    setPage(1);
  };

  const handleClassSelect = (classId: string) => {
    if (!tempSelectedClasses.includes(classId)) {
      setTempSelectedClasses([...tempSelectedClasses, classId]);
    }
  };

  const handleClassRemove = (classId: string) => {
    setTempSelectedClasses(tempSelectedClasses.filter((id) => id !== classId));
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setPage(1);
  };

  // Classes multi-select custom component
  const classesFilter = (
    <div className="space-y-2">
      <Select
        value=""
        onValueChange={(value) => {
          if (value) {
            handleClassSelect(value);
          }
        }}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select classes..." />
        </SelectTrigger>
        <SelectContent>
          {classes.length === 0 ? (
            <SelectItem value="no-classes" disabled>
              No classes available
            </SelectItem>
          ) : (
            classes
              .filter((cls) => !tempSelectedClasses.includes(cls.public_id))
              .map((cls) => (
                <SelectItem key={cls.public_id} value={cls.public_id}>
                  {cls.name}
                </SelectItem>
              ))
          )}
        </SelectContent>
      </Select>
      {tempSelectedClasses.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {tempSelectedClasses.map((classId) => {
            const cls = classes.find((c) => c.public_id === classId);
            return cls ? (
              <Badge key={classId} variant="secondary" className="gap-1 pr-1">
                {cls.name}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 hover:bg-transparent"
                  onClick={() => handleClassRemove(classId)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ) : null;
          })}
        </div>
      )}
    </div>
  );

  // Filter fields configuration
  const filterFields: FilterField[] = [
    {
      name: "override_type",
      label: "Exception Type",
      type: "select",
      options: [
        { value: "FORCE_WORKING", label: "Force Working" },
        { value: "FORCE_HOLIDAY", label: "Force Holiday" },
      ],
    },
    {
      name: "from_date",
      label: "From Date",
      type: "date",
      placeholder: "Select from date",
    },
    {
      name: "to_date",
      label: "To Date",
      type: "date",
      placeholder: "Select to date",
    },
    {
      name: "classes",
      label: "Applicable To",
      type: "custom",
      customComponent: classesFilter,
    },
  ];

  // Table columns
  const columns = getCalendarExceptionColumns({
    onView: handleView,
    onEdit: handleEdit,
    onDelete: setDeletingException,
  });

  if (isError) {
    const parsedError = parseApiError(error);

    return (
      <div className="mx-auto mt-8 max-w-4xl">
        <Alert variant="destructive">
          <AlertCircle className="h-5 w-5" />
          <AlertTitle className="text-lg font-semibold">{parsedError.title}</AlertTitle>
          <AlertDescription className="mt-2">
            <p className="text-base">{parsedError.message}</p>
            {parsedError.details && (
              <details className="mt-3">
                <summary className="cursor-pointer text-sm font-medium">Technical Details</summary>
                <pre className="mt-2 overflow-auto rounded bg-red-50 p-2 text-xs">
                  {parsedError.details}
                </pre>
              </details>
            )}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="mb-3 text-3xl font-bold text-gray-900">Exceptional Work Policy</h1>
          <p className="text-base text-gray-600">
            Manage working day exceptions for specific dates and classes
          </p>
        </div>
        <Button onClick={() => setLocation("/exceptional-work/new")} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Exception
        </Button>
      </div>

      {/* Info Card */}
      <Card className="border-blue-200 bg-blue-50/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-900">
            <CalendarIcon className="h-5 w-5" />
            About Exceptional Work Policy
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-blue-800">
          <p>
            <strong>Force Working:</strong> Override holidays to make specific dates working days
            for classes. Useful when you need to conduct school on a holiday for specific classes or
            all classes.
          </p>
          <p>
            <strong>Force Holiday:</strong> Override working days to give holidays for specific
            classes. Useful for exam preparation or special circumstances.
          </p>
          <p className="text-amber-700">
            <strong>Note:</strong> The system will prevent conflicting exceptions. You cannot force
            a holiday to be a non-working day.
          </p>
        </CardContent>
      </Card>

      {/* Filters */}
      <ResourceFilter
        fields={filterFields}
        onFilter={handleFilter}
        onReset={handleResetFilters}
        defaultValues={filters}
      />

      {/* Exceptions Table */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-green-50">
          <CardTitle>Calendar Exceptions</CardTitle>
          <CardDescription>
            {totalCount > 0
              ? `${totalCount} exception${totalCount > 1 ? "s" : ""} configured`
              : "No exceptions configured yet"}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          {isLoading && !exceptionsData ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="mb-4 h-12 w-12 animate-spin text-blue-600" />
              <p className="text-gray-600">Loading calendar exceptions...</p>
            </div>
          ) : (
            <>
              <DataTable
                columns={columns}
                data={exceptions}
                isLoading={isLoading}
                emptyMessage="No exceptions configured yet"
                emptyAction={{
                  label: "Add Your First Exception",
                  onClick: () => setLocation("/exceptional-work/new"),
                }}
                getRowKey={(row) => row.public_id}
              />

              {totalCount > 0 && (
                <TablePagination
                  currentPage={page}
                  totalPages={totalPages}
                  totalRecords={totalCount}
                  pageSize={pageSize}
                  onPageChange={handlePageChange}
                  onPageSizeChange={handlePageSizeChange}
                />
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Confirmation Dialog for Delete */}
      <ConfirmationDialog
        open={!!deletingException}
        onOpenChange={(open: boolean) => !open && setDeletingException(null)}
        onConfirm={handleDelete}
        title="Delete Exception"
        description={`Are you sure you want to delete this exception for ${
          deletingException ? format(new Date(deletingException.date), "MMM dd, yyyy") : ""
        }? This action cannot be undone.`}
        variant="destructive"
      />

      {/* Success Dialog */}
      <SuccessDialog
        open={showSuccessDialog}
        onClose={() => setShowSuccessDialog(false)}
        title={successMessage.title}
        description={successMessage.description}
      />
    </div>
  );
}

/**
 * Students Stats Component
 * Displays student statistics in a card
 */

import { Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

interface StudentsStatsProps {
  totalRecords: number;
  displayedCount: number;
  hasActiveFilters: boolean;
}

export function StudentsStats({ 
  totalRecords, 
  displayedCount, 
  hasActiveFilters 
}: StudentsStatsProps) {
  return (
    <Card className="border-0 bg-gradient-to-r from-blue-50 to-purple-50 shadow-sm">
      <CardContent className="flex items-center gap-6 p-6">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600">
          <Users className="h-8 w-8 text-white" />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-600">Total Students</p>
          <p className="text-3xl font-bold text-gray-900">{totalRecords}</p>
        </div>
        {hasActiveFilters && (
          <div className="ml-auto">
            <Badge variant="secondary" className="text-sm">
              Showing {displayedCount} of {totalRecords} students
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

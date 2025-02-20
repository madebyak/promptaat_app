import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, X } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface UserFiltersProps {
  onFiltersChange: (filters: UserFilters) => void;
  countries: string[];
}

export interface UserFilters {
  search: string;
  membership: string;
  verificationStatus: string;
  country: string;
  dateRange: {
    from: Date | null;
    to: Date | null;
  };
  sortBy: string;
}

export function UserFilters({ onFiltersChange, countries }: UserFiltersProps) {
  const [filters, setFilters] = useState<UserFilters>({
    search: "",
    membership: "all",
    verificationStatus: "all",
    country: "all",
    dateRange: {
      from: null,
      to: null,
    },
    sortBy: "newest",
  });

  const handleFilterChange = (key: keyof UserFilters, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const clearDateRange = () => {
    handleFilterChange("dateRange", { from: null, to: null });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-4">
        <Input
          placeholder="Search users..."
          value={filters.search}
          onChange={(e) => handleFilterChange("search", e.target.value)}
          className="w-64"
        />

        <Select
          value={filters.membership}
          onValueChange={(value) => handleFilterChange("membership", value)}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Membership" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Users</SelectItem>
            <SelectItem value="pro">Pro Users</SelectItem>
            <SelectItem value="free">Free Users</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.verificationStatus}
          onValueChange={(value) => handleFilterChange("verificationStatus", value)}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Verification" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="verified">Verified</SelectItem>
            <SelectItem value="unverified">Unverified</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.country}
          onValueChange={(value) => handleFilterChange("country", value)}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Country" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Countries</SelectItem>
            {countries.map((country) => (
              <SelectItem key={country} value={country}>
                {country}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-[240px] justify-start text-left font-normal",
                !filters.dateRange.from && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {filters.dateRange.from ? (
                filters.dateRange.to ? (
                  <>
                    {format(filters.dateRange.from, "LLL dd, y")} -{" "}
                    {format(filters.dateRange.to, "LLL dd, y")}
                  </>
                ) : (
                  format(filters.dateRange.from, "LLL dd, y")
                )
              ) : (
                <span>Registration Date</span>
              )}
              {(filters.dateRange.from || filters.dateRange.to) && (
                <Button
                  variant="ghost"
                  className="ml-auto h-4 w-4 p-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    clearDateRange();
                  }}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              initialFocus
              mode="range"
              selected={{
                from: filters.dateRange.from || undefined,
                to: filters.dateRange.to || undefined,
              }}
              onSelect={(range) =>
                handleFilterChange("dateRange", {
                  from: range?.from || null,
                  to: range?.to || null,
                })
              }
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>

        <Select
          value={filters.sortBy}
          onValueChange={(value) => handleFilterChange("sortBy", value)}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="oldest">Oldest First</SelectItem>
            <SelectItem value="name">Name A-Z</SelectItem>
            <SelectItem value="name-desc">Name Z-A</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

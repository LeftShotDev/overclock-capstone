"use client";

import type { CoursewareSetting } from "@/lib/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

interface SettingCardProps {
  setting: CoursewareSetting;
  currentValue: string;
  onValueChange: (settingId: string, newValue: string) => void;
}

export function SettingCard({
  setting,
  currentValue,
  onValueChange,
}: SettingCardProps) {
  const isRecommended = currentValue === String(setting.recommendedValue);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">{setting.name}</CardTitle>
          {isRecommended && (
            <Badge variant="outline" className="text-xs text-emerald-600">
              Recommended
            </Badge>
          )}
        </div>
        <CardDescription>{setting.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-3">
          <Select
            value={currentValue}
            onValueChange={(val) => onValueChange(setting.id, val)}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {setting.options?.map((option) => (
                <SelectItem key={option} value={option}>
                  <span className="capitalize">
                    {option.replace(/-/g, " ")}
                  </span>
                  {option === String(setting.recommendedValue) && (
                    <span className="ml-2 text-xs text-muted-foreground">
                      (recommended)
                    </span>
                  )}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}

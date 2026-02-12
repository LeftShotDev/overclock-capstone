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
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";

interface SettingCardProps {
  setting: CoursewareSetting;
  currentValue: string | boolean | number | string[];
  onValueChange: (settingId: string, newValue: string | boolean | number | string[]) => void;
}

export function SettingCard({
  setting,
  currentValue,
  onValueChange,
}: SettingCardProps) {
  const isRecommended =
    JSON.stringify(currentValue) === JSON.stringify(setting.recommendedValue);

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
        {setting.type === "toggle" && (
          <div className="flex items-center gap-3">
            <Switch
              checked={currentValue === true}
              onCheckedChange={(checked) => onValueChange(setting.id, checked)}
            />
            <span className="text-sm text-muted-foreground">
              {currentValue ? "Enabled" : "Disabled"}
            </span>
          </div>
        )}

        {setting.type === "select" && setting.options && (
          <Select
            value={String(currentValue)}
            onValueChange={(val) => {
              // Try to preserve the original type
              const numVal = Number(val);
              onValueChange(setting.id, isNaN(numVal) ? val : numVal);
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {setting.options.map((option) => (
                <SelectItem key={String(option.value)} value={String(option.value)}>
                  <span>{option.label}</span>
                  {String(option.value) === String(setting.recommendedValue) && (
                    <span className="ml-2 text-xs text-muted-foreground">
                      (recommended)
                    </span>
                  )}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {setting.type === "multi-select" && setting.options && (
          <div className="space-y-2">
            {setting.options.map((option) => {
              const selected = Array.isArray(currentValue)
                ? currentValue.includes(String(option.value))
                : false;
              return (
                <label
                  key={String(option.value)}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <Checkbox
                    checked={selected}
                    onCheckedChange={(checked) => {
                      const current = Array.isArray(currentValue)
                        ? currentValue
                        : [];
                      const next = checked
                        ? [...current, String(option.value)]
                        : current.filter((v) => v !== String(option.value));
                      onValueChange(setting.id, next);
                    }}
                  />
                  <span className="text-sm">{option.label}</span>
                </label>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

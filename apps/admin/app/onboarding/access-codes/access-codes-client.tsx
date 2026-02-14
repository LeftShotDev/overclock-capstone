"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  createAccessCode,
  updateAccessCode,
  deleteAccessCode,
} from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Copy, Check } from "lucide-react";

interface AccessCode {
  id: string;
  code: string;
  label: string | null;
  is_active: boolean;
  max_uses: number | null;
  use_count: number;
  expires_at: string | null;
  created_at: string;
}

function generateCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export function AccessCodesClient({
  initialCodes,
}: {
  initialCodes: AccessCode[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showCreate, setShowCreate] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [newCode, setNewCode] = useState({
    code: generateCode(),
    label: "",
    max_uses: "",
    expires_at: "",
  });

  function handleCopy(code: string, id: string) {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  function handleCreate() {
    if (!newCode.code) return;
    startTransition(async () => {
      await createAccessCode({
        code: newCode.code,
        label: newCode.label || undefined,
        max_uses: newCode.max_uses ? Number(newCode.max_uses) : null,
        expires_at: newCode.expires_at || null,
      });
      setShowCreate(false);
      setNewCode({
        code: generateCode(),
        label: "",
        max_uses: "",
        expires_at: "",
      });
      router.refresh();
    });
  }

  function handleToggleActive(c: AccessCode) {
    startTransition(async () => {
      await updateAccessCode(c.id, { is_active: !c.is_active });
      router.refresh();
    });
  }

  function handleDelete(c: AccessCode) {
    if (!confirm(`Delete access code "${c.code}"?`)) return;
    startTransition(async () => {
      await deleteAccessCode(c.id);
      router.refresh();
    });
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Access Codes</h2>
          <p className="text-muted-foreground text-sm">
            Generate and manage codes that restrict quiz access.
          </p>
        </div>
        <Button onClick={() => setShowCreate(!showCreate)}>
          <Plus className="size-4" />
          Generate Code
        </Button>
      </div>

      {showCreate && (
        <Card>
          <CardHeader>
            <CardTitle>New Access Code</CardTitle>
            <CardDescription>
              Create a code that quiz-takers must enter before starting.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Code</label>
                <div className="flex gap-2">
                  <Input
                    value={newCode.code}
                    onChange={(e) =>
                      setNewCode((p) => ({
                        ...p,
                        code: e.target.value.toUpperCase(),
                      }))
                    }
                    className="font-mono"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setNewCode((p) => ({ ...p, code: generateCode() }))
                    }
                  >
                    Regenerate
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Label (optional)</label>
                <Input
                  value={newCode.label}
                  onChange={(e) =>
                    setNewCode((p) => ({ ...p, label: e.target.value }))
                  }
                  placeholder="e.g. Spring 2025 Demo"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Max Uses (optional)
                </label>
                <Input
                  type="number"
                  value={newCode.max_uses}
                  onChange={(e) =>
                    setNewCode((p) => ({ ...p, max_uses: e.target.value }))
                  }
                  placeholder="Unlimited"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Expires At (optional)
                </label>
                <Input
                  type="datetime-local"
                  value={newCode.expires_at}
                  onChange={(e) =>
                    setNewCode((p) => ({ ...p, expires_at: e.target.value }))
                  }
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleCreate} disabled={isPending}>
                {isPending ? "Creating..." : "Create Code"}
              </Button>
              <Button variant="outline" onClick={() => setShowCreate(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Active Codes</CardTitle>
        </CardHeader>
        <CardContent>
          {initialCodes.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No access codes yet. The quiz is currently open to everyone.
            </p>
          ) : (
            <div className="space-y-2">
              <div className="grid grid-cols-[120px_1fr_80px_80px_100px_auto] gap-3 text-xs font-medium text-muted-foreground px-3 py-2">
                <span>Code</span>
                <span>Label</span>
                <span>Uses</span>
                <span>Status</span>
                <span>Created</span>
                <span className="w-16" />
              </div>
              {initialCodes.map((c) => (
                <div
                  key={c.id}
                  className={`grid grid-cols-[120px_1fr_80px_80px_100px_auto] gap-3 items-center px-3 py-2 rounded-md ${c.is_active ? "" : "opacity-50"}`}
                >
                  <div className="flex items-center gap-1">
                    <code className="text-sm font-mono font-bold">
                      {c.code}
                    </code>
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      onClick={() => handleCopy(c.code, c.id)}
                    >
                      {copiedId === c.id ? (
                        <Check className="size-3 text-green-500" />
                      ) : (
                        <Copy className="size-3" />
                      )}
                    </Button>
                  </div>
                  <span className="text-sm text-muted-foreground truncate">
                    {c.label || "—"}
                  </span>
                  <span className="text-sm">
                    {c.use_count}
                    {c.max_uses ? `/${c.max_uses}` : ""}
                  </span>
                  <Badge
                    variant={c.is_active ? "default" : "secondary"}
                    className="w-fit"
                  >
                    {c.is_active ? "Active" : "Revoked"}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {new Date(c.created_at).toLocaleDateString()}
                  </span>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="xs"
                      onClick={() => handleToggleActive(c)}
                      disabled={isPending}
                    >
                      {c.is_active ? "Revoke" : "Activate"}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      onClick={() => handleDelete(c)}
                      disabled={isPending}
                    >
                      <Trash2 className="size-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

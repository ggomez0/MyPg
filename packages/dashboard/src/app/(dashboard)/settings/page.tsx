"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";

export default function SettingsPage() {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="pb-2 border-b">
        <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
          <Settings className="h-5 w-5 text-primary" /> Admin Settings
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Manage your administrator profile, security, and credentials
        </p>
      </div>
      
      <Card className="rounded-xl border shadow-xs overflow-hidden">
        <CardHeader className="p-4 bg-muted/20 border-b">
          <CardTitle className="text-sm font-semibold">Profile</CardTitle>
          <CardDescription className="text-xs">Update your admin profile details.</CardDescription>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Name</Label>
            <Input value={name} onChange={e => setName(e.target.value)} placeholder="Admin Name" className="text-xs h-8" />
          </div>
          <Button size="sm" className="h-8 text-xs w-full sm:w-auto">Save Profile</Button>
        </CardContent>
      </Card>

      <Card className="rounded-xl border shadow-xs overflow-hidden">
        <CardHeader className="p-4 bg-muted/20 border-b">
          <CardTitle className="text-sm font-semibold">Security</CardTitle>
          <CardDescription className="text-xs">Change your admin password.</CardDescription>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">New Password</Label>
            <Input type="password" value={password} onChange={e => setPassword(e.target.value)} className="text-xs h-8" />
          </div>
          <Button size="sm" variant="destructive" className="h-8 text-xs w-full sm:w-auto">Update Password</Button>
        </CardContent>
      </Card>
    </div>
  );
}

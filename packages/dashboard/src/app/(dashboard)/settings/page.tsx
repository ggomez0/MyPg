"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function SettingsPage() {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-3xl font-bold">Admin Settings</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Update your admin profile details.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Name</Label>
            <Input value={name} onChange={e => setName(e.target.value)} placeholder="Admin Name" />
          </div>
          <Button>Save Profile</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Security</CardTitle>
          <CardDescription>Change your admin password.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>New Password</Label>
            <Input type="password" value={password} onChange={e => setPassword(e.target.value)} />
          </div>
          <Button variant="destructive">Update Password</Button>
        </CardContent>
      </Card>
    </div>
  );
}

"use client";

import { use } from "react";
import { ApiKeysManager } from "@/components/api-keys-manager";

export default function ProjectApiKeysPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = use(params);

  return <ApiKeysManager initialProjectId={projectId} />;
}

"use server";

import { revalidatePath } from "next/cache";
import { maintenanceJobRun, settingsUpdate } from "@/lib/admin/admin.server";
import { type ActionResult, toActionResult } from "@/lib/graphql.server";
import type { MaintenanceJob, SettingsInput, VideoKindInput } from "@/gql/graphql";
import { videoKindCreate, videoKindDelete, videoKindsReorder, videoKindUpdate } from "@/lib/video/video.server";
import { withPolicyAction } from "@/utils/route.server";
import { Policies } from "@/utils/policy.server";

export async function saveSettingsAction(input: SettingsInput): Promise<ActionResult<null>> {
  return withPolicyAction(Policies.admin.requireAdmin, () => toActionResult(async () => {
    await settingsUpdate(input);
    revalidatePath("/admin/settings");
    revalidatePath("/");
    return null;
  }));
}

/**
 * Starts a maintenance job in the background. The data is false when it is already running.
 */
export async function runMaintenanceJobAction(job: MaintenanceJob): Promise<ActionResult<boolean>> {
  return withPolicyAction(Policies.admin.requireAdmin, () => toActionResult(async () => {
    const started = await maintenanceJobRun(job);
    revalidatePath("/admin/maintenance");
    return started;
  }));
}

const kinds = <T, >(work: () => Promise<T>) => withPolicyAction(Policies.admin.requireAdmin, () => toActionResult(async () => {
  const result = await work();

  revalidatePath("/admin/kinds");
  revalidatePath("/", "layout");
  return result;
}));

export async function createKindAction(input: VideoKindInput): Promise<ActionResult<null>> {
  return kinds(async () => {
    await videoKindCreate(input);
    return null;
  });
}

export async function updateKindAction(id: string, input: VideoKindInput): Promise<ActionResult<null>> {
  return kinds(async () => {
    await videoKindUpdate(id, input);
    return null;
  });
}

/**
 * Every kind's id in the new order; the first becomes the default.
 */
export async function reorderKindsAction(ids: string[]): Promise<ActionResult<null>> {
  return kinds(async () => {
    await videoKindsReorder(ids);
    return null;
  });
}

export async function deleteKindAction(id: string): Promise<ActionResult<null>> {
  return kinds(async () => {
    await videoKindDelete(id);
    return null;
  });
}

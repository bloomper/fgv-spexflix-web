"use server";

import {revalidatePath} from "next/cache";
import {maintenanceJobRun, settingsUpdate} from "@/lib/admin/admin.server";
import {type ActionResult, toActionResult} from "@/lib/graphql.server";
import type {MaintenanceJob, SettingsInput} from "@/gql/graphql";
import {withPolicyAction} from "@/utils/route.server";
import {Policies} from "@/utils/policy.server";

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

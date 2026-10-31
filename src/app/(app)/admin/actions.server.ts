"use server";

import {revalidatePath} from "next/cache";
import {settingsUpdate} from "@/lib/admin/admin.server";
import {type ActionResult, toActionResult} from "@/lib/graphql.server";
import type {SettingsInput} from "@/gql/graphql";
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

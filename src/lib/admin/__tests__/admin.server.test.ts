import { beforeEach, describe, expect, it, vi } from "vitest";
import * as admin from "@/lib/admin/admin.server";

const { runQuery, runMutation } = vi.hoisted(() => ({ runQuery: vi.fn(), runMutation: vi.fn() }));

vi.mock("@/lib/graphql.server", () => ({ runQuery, runMutation }));

describe("the admin client", () => {
  beforeEach(() => {
    runQuery.mockReset();
    runMutation.mockReset();
  });

  it("unwraps the query results", async () => {
    runQuery.mockResolvedValueOnce({ trash: [{ id: "v1" }] });
    expect(await admin.getTrash()).toEqual([{ id: "v1" }]);
    runQuery.mockResolvedValueOnce(undefined);
    expect(await admin.getTrash()).toEqual([]);

    runQuery.mockResolvedValueOnce({ processingQueue: [{ id: "j1" }] });
    expect(await admin.getQueue()).toEqual([{ id: "j1" }]);
    runQuery.mockResolvedValueOnce(undefined);
    expect(await admin.getQueue()).toEqual([]);

    runQuery.mockResolvedValueOnce({ storage: { usedBytes: 1 } });
    expect(await admin.getStorage()).toEqual({ usedBytes: 1 });

    runQuery.mockResolvedValueOnce({ auditLog: { totalCount: 0 } });
    expect(await admin.getAuditLog(2, 50)).toEqual({ totalCount: 0 });
    expect(runQuery.mock.calls.at(-1)?.[1]).toEqual({ page: 2, size: 50, filter: {} });

    runQuery.mockResolvedValueOnce({ settings: { welcomeSv: "Hej" } });
    expect(await admin.getSettings()).toEqual({ welcomeSv: "Hej" });
  });

  it("sends the mutations", async () => {
    runMutation.mockResolvedValue({});
    await admin.trashEmpty();
    await admin.settingsUpdate({ welcomeSv: "Hej" } as never);
    expect(runMutation.mock.calls.at(-1)?.[1]).toEqual({ input: { welcomeSv: "Hej" } });
    expect(runMutation).toHaveBeenCalledTimes(2);
  });

  it("reads the maintenance jobs and starts one", async () => {
    runQuery.mockResolvedValueOnce({ maintenanceJobs: [{ job: "SPEX_REFRESH", running: false }] });
    expect(await admin.getMaintenanceJobs()).toEqual([{ job: "SPEX_REFRESH", running: false }]);
    runQuery.mockResolvedValueOnce(undefined);
    expect(await admin.getMaintenanceJobs()).toEqual([]);

    runMutation.mockResolvedValueOnce({ maintenanceJobRun: true });
    expect(await admin.maintenanceJobRun("UPLOAD_CLEANUP")).toBe(true);
    expect(runMutation.mock.calls.at(-1)?.[1]).toEqual({ job: "UPLOAD_CLEANUP" });
    runMutation.mockResolvedValueOnce({ maintenanceJobRun: false });
    expect(await admin.maintenanceJobRun("UPLOAD_CLEANUP")).toBe(false);
  });
});

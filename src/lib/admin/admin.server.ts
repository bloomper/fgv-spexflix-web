import "server-only";

import {graphql} from "@/gql";
import {runMutation, runQuery} from "@/lib/graphql.server";
import type {AuditFilter, MaintenanceJob, SettingsInput} from "@/gql/graphql";

const TrashQuery = graphql(`
    query Trash { trash { id title year trashedAt status } }
`);
const QueueQuery = graphql(`
    query Queue {
        processingQueue { id videoId videoTitle status progress attempts error createdAt startedAt finishedAt }
    }
`);
const StorageQuery = graphql(`
    query Storage { storage { originalsBytes renditionsBytes freeBytes videoCount } }
`);
const AuditLogQuery = graphql(`
    query AuditLog($page: Int, $size: Int, $filter: AuditFilter) {
        auditLog(page: $page, size: $size, filter: $filter) {
            totalCount page size
            entries { id at actorId actorName action entityType entityId summary }
        }
    }
`);
const AuditActorsQuery = graphql(`
    query AuditActors { auditActors { id name } }
`);
const SettingsQuery = graphql(`
    query Settings { settings { welcomeSv welcomeEn maxUploadGb keepOriginals } }
`);
const TrashEmptyMutation = graphql(`mutation TrashEmpty { trashEmpty }`);
const SettingsUpdateMutation = graphql(`
    mutation SettingsUpdate($input: SettingsInput!) { settingsUpdate(input: $input) { welcomeSv } }
`);

const MaintenanceJobsQuery = graphql(`
    query MaintenanceJobs { maintenanceJobs { job schedule running lastStartedAt lastFinishedAt lastSucceeded } }
`);
const MaintenanceJobRunMutation = graphql(`mutation MaintenanceJobRun($job: MaintenanceJob!) { maintenanceJobRun(job: $job) }`);

export const getTrash = async () => (await runQuery(TrashQuery, {}))?.trash ?? [];
export const getQueue = async () => (await runQuery(QueueQuery, {}))?.processingQueue ?? [];
export const getStorage = async () => (await runQuery(StorageQuery, {}))?.storage;
export const getAuditLog = async (page: number, size: number, filter: AuditFilter = {}) =>
    (await runQuery(AuditLogQuery, {page, size, filter}))?.auditLog;
export const getAuditActors = async () => (await runQuery(AuditActorsQuery, {}))?.auditActors ?? [];
export const getSettings = async () => (await runQuery(SettingsQuery, {}))?.settings;
export const trashEmpty = () => runMutation(TrashEmptyMutation, {});
export const settingsUpdate = (input: SettingsInput) => runMutation(SettingsUpdateMutation, {input});
export const getMaintenanceJobs = async () => (await runQuery(MaintenanceJobsQuery, {}))?.maintenanceJobs ?? [];
export const maintenanceJobRun = async (job: MaintenanceJob) => Boolean((await runMutation(MaintenanceJobRunMutation, {job}))?.maintenanceJobRun);

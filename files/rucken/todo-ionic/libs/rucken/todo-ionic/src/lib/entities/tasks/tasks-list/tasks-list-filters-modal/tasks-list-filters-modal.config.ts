export interface ITasksListFiltersModalConfig {
    sortField?: string;
    sortType?: 'asc' | 'desc';
    users?: number[];
    statuses?: string[];
}
export const DEFAULT_TASKS_LIST_FILTERS_MODAL_CONFIG: ITasksListFiltersModalConfig = {
    sortField: 'id',
    sortType: 'desc',
    users: [],
    statuses: []
};
export const TASKS_LIST_FILTERS_MODAL_CONFIG_TOKEN = 'TasksListFiltersModalConfig';

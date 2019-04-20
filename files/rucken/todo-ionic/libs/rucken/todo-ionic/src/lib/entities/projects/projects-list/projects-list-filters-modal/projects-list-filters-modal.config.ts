import { DEFAULT_USERS_CONFIG } from '@rucken/core';
import { CustomUser } from '@rucken/ionic';
import { DEFAULT_STATUSES_CONFIG, Status } from '@rucken/todo-core';
import { IRestProviderOptions } from 'ngx-repository';

export interface IProjectsListFiltersModalConfig {
    usersRestProviderOptions?: IRestProviderOptions<CustomUser>;
    statusesRestProviderOptions?: IRestProviderOptions<Status>;
    sortField?: string;
    sortType?: 'asc' | 'desc';
    users?: number[];
    statuses?: string[];
}
export const DEFAULT_PROJECTS_LIST_FILTERS_MODAL_CONFIG: IProjectsListFiltersModalConfig = {
    usersRestProviderOptions: {
        ...DEFAULT_USERS_CONFIG,
        paginationMeta: {
            perPage: 100
        }
    },
    statusesRestProviderOptions: {
        ...DEFAULT_STATUSES_CONFIG,
        paginationMeta: {
            perPage: 100
        }
    },
    sortField: 'id',
    sortType: 'desc',
    users: [],
    statuses: []
};
export const PROJECTS_LIST_FILTERS_MODAL_CONFIG_TOKEN = 'ProjectsListFiltersModalConfig';

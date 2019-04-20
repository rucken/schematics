import { plainToClass } from 'class-transformer';
import { IRestProviderOptions, PaginationMeta, ProviderActionEnum } from 'ngx-repository';
import { CustomTask } from '../models/custom-task';

export const IONIC_DEFAULT_TASKS_CONFIG: IRestProviderOptions<CustomTask> = {
    name: 'task',
    pluralName: 'tasks',
    autoload: true,
    paginationMeta: {
        perPage: 5
    },
    actionOptions: {
        responseData: (data: any, action: ProviderActionEnum) => {
            if (action === ProviderActionEnum.Delete) {
                return true;
            } else {
                if (action === ProviderActionEnum.LoadAll) {
                    return plainToClass(CustomTask,
                        data && data.body && data.body.tasks
                    );
                } else {
                    return plainToClass(CustomTask,
                        data && data.body && data.body.task
                    );
                }
            }
        },
        responsePaginationMeta: (data: any, action: ProviderActionEnum): PaginationMeta => {
            return {
                totalResults: data && data.body && data.body.meta && data.body.meta.totalResults,
                perPage: undefined
            };
        }
    },
    restOptions: {
        limitQueryParam: 'per_page',
        pageQueryParam: 'cur_page',
        searchTextQueryParam: 'q'
    }
};

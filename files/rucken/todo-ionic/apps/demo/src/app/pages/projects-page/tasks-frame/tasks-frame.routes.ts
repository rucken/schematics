import { TasksFrameComponent } from './tasks-frame.component';
import { MetaGuard } from '@ngx-meta/core';
import { translate } from '@rucken/core';

export const TASKS_FRAME_ROUTES = [
    {
        path: '',
        component: TasksFrameComponent,
        canActivate: [MetaGuard],
        data: {
            name: 'tasks',
            icon: 'checkbox-outline',
            meta: {
                title: translate('Tasks'),
                description: translate('Tasks page')
            }
        }
    }
];

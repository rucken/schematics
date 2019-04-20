import { translate, PermissionsGuard } from '@rucken/core';
import { ProjectsPageComponent } from './projects-page.component';
import { MetaGuard } from '@ngx-meta/core';
import { TASKS_FRAME_ROUTES } from './tasks-frame/tasks-frame.routes';

export const PROJECTS_PAGE_ROUTES = [
    {
        path: '',
        component: ProjectsPageComponent,
        canActivate: [MetaGuard],
        data: {
            name: 'projects',
            icon: 'folder-open',
            meta: {
                title: translate('Projects'),
                description: translate('Projects page')
            }
        }
    },
    {
        path: ':id',
        loadChildren: './tasks-frame/tasks-frame.module#TasksFrameModule',
        data: TASKS_FRAME_ROUTES[0].data
    }
];

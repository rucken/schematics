import { Provider } from '@angular/core';
import { TASKS_CONFIG_TOKEN } from '@rucken/todo-core';
import { IONIC_DEFAULT_TASKS_CONFIG } from './tasks.config';

export const ENTITIES_PROVIDERS: Provider[] = [
    {
        provide: TASKS_CONFIG_TOKEN,
        useValue: IONIC_DEFAULT_TASKS_CONFIG
    }
];

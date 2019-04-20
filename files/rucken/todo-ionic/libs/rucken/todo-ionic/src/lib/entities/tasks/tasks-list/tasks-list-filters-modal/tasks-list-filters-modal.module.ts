import { CommonModule } from '@angular/common';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { DirectivesModule, PipesModule } from '@rucken/core';
import { FormGroupModule, PromptFormModalModule, SelectInputModule } from '@rucken/ionic';
import { NgxBindIOModule } from 'ngx-bind-io';
import { TasksListFiltersModalComponent } from './tasks-list-filters-modal.component';
import { DEFAULT_TASKS_LIST_FILTERS_MODAL_CONFIG, ITasksListFiltersModalConfig, TASKS_LIST_FILTERS_MODAL_CONFIG_TOKEN } from './tasks-list-filters-modal.config';
import { TasksListFiltersModalService } from './tasks-list-filters-modal.service';

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    FormGroupModule,
    ReactiveFormsModule,
    TranslateModule.forChild(),
    DirectivesModule,
    PipesModule,
    PromptFormModalModule,
    SelectInputModule,
    NgxBindIOModule
  ],
  declarations: [TasksListFiltersModalComponent],
  entryComponents: [TasksListFiltersModalComponent],
  exports: [TasksListFiltersModalComponent, FormGroupModule]
})
export class TasksListFiltersModalModule {
  static forRoot(options?: ITasksListFiltersModalConfig): ModuleWithProviders {
    return {
      ngModule: TasksListFiltersModalModule,
      providers: [
        {
          provide: TASKS_LIST_FILTERS_MODAL_CONFIG_TOKEN,
          useValue: {
            sortField: (options && options.sortField)
              ? options.sortField
              : DEFAULT_TASKS_LIST_FILTERS_MODAL_CONFIG.sortField,
            sortType: (options && options.sortType)
              ? options.sortType
              : DEFAULT_TASKS_LIST_FILTERS_MODAL_CONFIG.sortType,
            users: (options && options.users)
              ? options.users
              : DEFAULT_TASKS_LIST_FILTERS_MODAL_CONFIG.users,
            statuses: (options && options.statuses)
              ? options.statuses
              : DEFAULT_TASKS_LIST_FILTERS_MODAL_CONFIG.statuses
          }
        },
        TasksListFiltersModalService
      ]
    };
  }
}

import { CommonModule } from '@angular/common';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { DirectivesModule, PipesModule } from '@rucken/core';
import { FormGroupModule, PromptFormModalModule, SelectInputModule } from '@rucken/ionic';
import { NgxBindIOModule } from 'ngx-bind-io';
import { ProjectsListFiltersModalComponent } from './projects-list-filters-modal.component';
import { DEFAULT_PROJECTS_LIST_FILTERS_MODAL_CONFIG, IProjectsListFiltersModalConfig, PROJECTS_LIST_FILTERS_MODAL_CONFIG_TOKEN } from './projects-list-filters-modal.config';
import { ProjectsListFiltersModalService } from './projects-list-filters-modal.service';

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
  declarations: [ProjectsListFiltersModalComponent],
  entryComponents: [ProjectsListFiltersModalComponent],
  exports: [ProjectsListFiltersModalComponent, FormGroupModule]
})
export class ProjectsListFiltersModalModule {
  static forRoot(options?: IProjectsListFiltersModalConfig): ModuleWithProviders {
    return {
      ngModule: ProjectsListFiltersModalModule,
      providers: [
        {
          provide: PROJECTS_LIST_FILTERS_MODAL_CONFIG_TOKEN,
          useValue: {
            sortField: (options && options.sortField)
              ? options.sortField
              : DEFAULT_PROJECTS_LIST_FILTERS_MODAL_CONFIG.sortField,
            sortType: (options && options.sortType)
              ? options.sortType
              : DEFAULT_PROJECTS_LIST_FILTERS_MODAL_CONFIG.sortType,
            statusesRestProviderOptions: (options && options.statusesRestProviderOptions)
              ? options.statusesRestProviderOptions
              : DEFAULT_PROJECTS_LIST_FILTERS_MODAL_CONFIG.statusesRestProviderOptions,
            usersRestProviderOptions: (options && options.usersRestProviderOptions)
              ? options.usersRestProviderOptions
              : DEFAULT_PROJECTS_LIST_FILTERS_MODAL_CONFIG.usersRestProviderOptions,
            statuses: (options && options.statuses)
              ? options.statuses
              : DEFAULT_PROJECTS_LIST_FILTERS_MODAL_CONFIG.statuses,
            users: (options && options.users)
              ? options.users
              : DEFAULT_PROJECTS_LIST_FILTERS_MODAL_CONFIG.users
          }
        },
        ProjectsListFiltersModalService
      ]
    };
  }
}

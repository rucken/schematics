import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { PipesModule } from '@rucken/core';
import { EntityListModule, IonicModalsModule } from '@rucken/ionic';
import { NgxBindIOModule } from 'ngx-bind-io';
import { TaskModalModule } from '../task-modal/task-modal.module';
import { TasksListFiltersModalModule } from './tasks-list-filters-modal/tasks-list-filters-modal.module';
import { TasksListComponent } from './tasks-list.component';

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    IonicModalsModule,
    TranslateModule.forChild(),
    PipesModule,
    EntityListModule,
    TaskModalModule,
    TasksListFiltersModalModule,
    RouterModule,
    NgxBindIOModule
  ],
  declarations: [TasksListComponent],
  exports: [TasksListComponent]
})
export class TasksListModule { }

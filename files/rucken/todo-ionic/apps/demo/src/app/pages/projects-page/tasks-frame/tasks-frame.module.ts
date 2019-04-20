import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TasksListModule } from '@rucken/todo-ionic';
import { SharedModule } from '../../../shared/shared.module';
import { TasksFrameComponent } from './tasks-frame.component';
import { TASKS_FRAME_ROUTES } from './tasks-frame.routes';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    TasksListModule,
    RouterModule.forChild(TASKS_FRAME_ROUTES)
  ],
  declarations: [TasksFrameComponent]
})
export class TasksFrameModule { }

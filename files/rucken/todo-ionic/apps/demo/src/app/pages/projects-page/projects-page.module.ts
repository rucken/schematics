import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ProjectsListModule } from '@rucken/todo-ionic';
import { SharedModule } from '../../shared/shared.module';
import { ProjectsPageComponent } from './projects-page.component';
import { PROJECTS_PAGE_ROUTES } from './projects-page.routes';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    ProjectsListModule,
    RouterModule.forChild(PROJECTS_PAGE_ROUTES)
  ],
  declarations: [ProjectsPageComponent]
})
export class ProjectsPageModule { }

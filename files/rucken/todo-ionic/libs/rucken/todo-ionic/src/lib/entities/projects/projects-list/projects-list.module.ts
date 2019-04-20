import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { PipesModule } from '@rucken/core';
import { EntityListModule, IonicModalsModule } from '@rucken/ionic';
import { NgxBindIOModule } from 'ngx-bind-io';
import { ProjectModalModule } from '../project-modal/project-modal.module';
import { ProjectsListFiltersModalModule } from './projects-list-filters-modal/projects-list-filters-modal.module';
import { ProjectsListComponent } from './projects-list.component';

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    IonicModalsModule,
    TranslateModule.forChild(),
    PipesModule,
    EntityListModule,
    ProjectModalModule,
    ProjectsListFiltersModalModule,
    RouterModule,
    NgxBindIOModule
  ],
  declarations: [ProjectsListComponent],
  exports: [ProjectsListComponent]
})
export class ProjectsListModule { }

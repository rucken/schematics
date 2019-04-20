import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { DirectivesModule, PipesModule } from '@rucken/core';
import { FormGroupModule, PromptFormModalModule, SelectInputModule } from '@rucken/ionic';
import { NgxBindIOModule } from 'ngx-bind-io';
import { ProjectModalComponent } from './project-modal.component';

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
  declarations: [ProjectModalComponent],
  entryComponents: [ProjectModalComponent],
  exports: [ProjectModalComponent, FormGroupModule]
})
export class ProjectModalModule { }

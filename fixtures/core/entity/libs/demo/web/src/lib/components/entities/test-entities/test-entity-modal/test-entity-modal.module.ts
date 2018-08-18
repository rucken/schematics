import { CommonModule } from '@angular/common';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { PromptFormModalModule } from '@rucken/web';
import { TestEntityModalComponent } from './test-entity-modal.component';

@NgModule({
  imports: [
    CommonModule,
    PromptFormModalModule
  ],
  declarations: [
    TestEntityModalComponent
  ],
  entryComponents: [
    TestEntityModalComponent
  ],
  exports: [
    TestEntityModalComponent,
    PromptFormModalModule
  ]
})
export class TestEntityModalModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: TestEntityModalModule,
      providers: []
  };
}
}

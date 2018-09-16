import { CommonModule } from '@angular/common';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { EntityInputModule } from '@rucken/web';
import { TestEntitiesGridModalModule } from '../test-entities-grid-modal/test-entities-grid-modal.module';
import { TestEntityInputComponent } from './test-entity-input.component';

@NgModule({
  imports: [
    CommonModule,
    EntityInputModule,
    TestEntitiesGridModalModule
  ],
  declarations: [
    TestEntityInputComponent
  ],
  exports: [
    TestEntityInputComponent,
    EntityInputModule,
    TestEntitiesGridModalModule
  ]
})
export class TestEntityInputModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: TestEntityInputModule,
      providers: []
  };
}
}

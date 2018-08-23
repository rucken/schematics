import { CommonModule } from '@angular/common';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { EntitySelectModule } from '@rucken/web';
import { TestEntitiesGridModalModule } from '../test-entities-grid-modal/test-entities-grid-modal.module';
import { TestEntitySelectComponent } from './test-entity-select.component';

@NgModule({
  imports: [
    CommonModule,
    EntitySelectModule,
    TestEntitiesGridModalModule
  ],
  declarations: [
    TestEntitySelectComponent
  ],
  exports: [
    TestEntitySelectComponent,
    EntitySelectModule,
    TestEntitiesGridModalModule
  ]
})
export class TestEntitySelectModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: TestEntitySelectModule,
      providers: []
  };
}
}

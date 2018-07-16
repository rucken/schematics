import { CommonModule } from '@angular/common';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { EntityGridModule } from '@rucken/web';
import { TestEntityModalModule } from '../test-entity-modal/test-entity-modal.module';
import { TestEntitiesGridComponent } from './test-entities-grid.component';

@NgModule({
  imports: [
    CommonModule,
    EntityGridModule,
    TestEntityModalModule
  ],
  declarations: [
    TestEntitiesGridComponent
  ],
  exports: [
    TestEntitiesGridComponent,
    EntityGridModule,
    TestEntityModalModule
  ]
})
export class TestEntitiesGridModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: TestEntitiesGridModule,
      providers: []
    };
  }
}

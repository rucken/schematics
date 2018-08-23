import { CommonModule } from '@angular/common';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { EntityGridModalModule } from '@rucken/web';
import { TestEntitiesGridModule } from '../test-entities-grid/test-entities-grid.module';
import { TestEntitiesGridModalComponent } from './test-entities-grid-modal.component';

@NgModule({
  imports: [
    CommonModule,
    EntityGridModalModule,
    TestEntitiesGridModule
  ],
  declarations: [
    TestEntitiesGridModalComponent
  ],
  entryComponents: [
    TestEntitiesGridModalComponent
  ],
  exports: [
    TestEntitiesGridModalComponent,
    EntityGridModalModule,
    TestEntitiesGridModule
  ]
})
export class TestEntitiesGridModalModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: TestEntitiesGridModalModule,
      providers: []
  };
}
}

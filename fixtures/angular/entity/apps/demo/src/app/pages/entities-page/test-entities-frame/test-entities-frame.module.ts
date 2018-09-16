import { ModuleWithProviders, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TestEntitiesGridModule } from '@demo/web';
import { SharedModule } from '../../../shared/shared.module';
import { TestEntitiesFrameComponent } from './test-entities-frame.component';
import { TestEntitiesFrameRoutes } from './test-entities-frame.routes';
import { NgxPermissionsModule } from 'ngx-permissions';

@NgModule({
  imports: [
    SharedModule,
    NgxPermissionsModule,
    RouterModule.forChild(TestEntitiesFrameRoutes),
    TestEntitiesGridModule,
    FormsModule
  ],
  declarations: [
    TestEntitiesFrameComponent
  ]
})
export class TestEntitiesFrameModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: TestEntitiesFrameModule,
      providers: []
    };
  }
}

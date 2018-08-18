import { translate } from '@rucken/core';
import { TestEntitiesFrameComponent } from './test-entities-frame.component';
import { MetaGuard } from '@ngx-meta/core';

export const TestEntitiesFrameRoutes = [
  {
    path: '',
    component: TestEntitiesFrameComponent,
    canActivate: [MetaGuard],
    data: {
      name: 'test-entities',
      meta: {
        title: translate('Test entities'),
        description: translate('Test entities frame')
      }
    }
  }
];

import { translate } from '@rucken/core';
import { TestEntitiesFrameComponent } from './test-entities-frame.component';

export const TestEntitiesFrameRoutes = [{
  path: '',
  component: TestEntitiesFrameComponent,
  data: {
    name: 'test-entities',
    title: translate('Test entities')
  }
}];

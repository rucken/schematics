import { Provider } from '@angular/core';
import { TEST_ENTITIES_CONFIG_TOKEN, defaultTestEntitiesConfig } from './test-entities.config';


export const entitiesProviders: Provider[] = [
  {
    provide: TEST_ENTITIES_CONFIG_TOKEN,
    useValue: defaultTestEntitiesConfig
  },
];

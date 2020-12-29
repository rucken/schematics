import { IEnvironment } from './environment.interface';

export const environment: IEnvironment = {
  server: false,
  type: 'prod',
  production: true,
  apiUrl: '/api',
  remoteConfig: {
    url: 'https://testapi.io/api/EndyKaufman/rucken-todo-ionic.json',
    default: {
      '/api/(.*)': 'https://todo-nestjs.rucken.ru/api/'
    }
  }
};

import { Injectable } from '@angular/core';
import { plainToClass } from 'class-transformer';
import { IRestProviderOptions, PaginationMeta, ProviderActionEnum } from 'ngx-repository';
import { TestEntity } from '../models/test-entity';

@Injectable()
export class TestEntitiesConfig implements IRestProviderOptions <TestEntity> {
  name = 'test-entity';
  pluralName = 'test-entities';
  autoload = true;
  paginationMeta = {
    perPage: 5
  };
  actionOptions = {
    responseData: (data: any, action: ProviderActionEnum) => {
      if (action === ProviderActionEnum.Delete) {
        return true;
      } else {
        if (action === ProviderActionEnum.LoadAll) {
          return plainToClass(TestEntity, data.body.testEntities);
        } else {
          return plainToClass(TestEntity, data.body.testEntity);
        }
      }
    },
    responsePaginationMeta: (data: any, action: ProviderActionEnum): PaginationMeta => {
      return { totalResults: data.body.meta.totalResults, perPage: undefined };
    }
  };
  restOptions = {
    limitQueryParam: 'per_page',
    pageQueryParam: 'cur_page',
    searchTextQueryParam: 'q'
  };
  constructor() { }
}

import { Inject, Injectable, MethodNotAllowedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CORE_CONFIG_TOKEN } from '@rucken/core-nestjs';
import { TestEntity } from '../entities/test-entity.entity';
import { ICoreConfig } from '@rucken/core-nestjs';

@Injectable()
export class TestEntitiesService {
  constructor(
    @Inject(CORE_CONFIG_TOKEN) private readonly coreConfig: ICoreConfig,
    @InjectRepository(TestEntity)
    private readonly repository: Repository<TestEntity>
  ) {}
  async create(options: { item: TestEntity }) {
    try {
      options.item = await this.repository.save(options.item);
      return { testEntity: options.item };
    } catch (error) {
      throw error;
    }
  }
  async update(options: { id: number; item: TestEntity }) {
    if (this.coreConfig.demo) {
      throw new MethodNotAllowedException('Not allowed in DEMO mode');
    }
    options.item.id = options.id;
    try {
      options.item = await this.repository.save(options.item);
      return { testEntity: options.item };
    } catch (error) {
      throw error;
    }
  }
  async delete(options: { id: number }) {
    if (this.coreConfig.demo) {
      throw new MethodNotAllowedException('Not allowed in DEMO mode');
    }
    try {
      let item = await this.repository.findOneOrFail(options.id, {
        relations: []
      });
      item = await this.repository.save(item);
      await this.repository.delete(options.id);
      return { testEntity: null };
    } catch (error) {
      throw error;
    }
  }
  async findById(options: { id: number }) {
    try {
      const item = await this.repository.findOneOrFail(options.id, {
        relations: []
      });
      return { testEntity: item };
    } catch (error) {
      throw error;
    }
  }
  async findAll(options: {
    curPage: number;
    perPage: number;
    q?: string;
    sort?: string;
  }) {
    try {
      let objects: [TestEntity[], number];
      let qb = this.repository.createQueryBuilder('testEntity');
      if (options.q) {
        qb = qb.where(
          'testEntity.name like :q or testEntity.id = :id',
          {
            q: `%${options.q}%`,
            id: +options.q
          }
        );
      }
      options.sort =
        options.sort &&
        new TestEntity().hasOwnProperty(options.sort.replace('-', ''))
          ? options.sort
          : '-id';
      const field = options.sort.replace('-', '');
      if (options.sort)
        if (options.sort[0] === '-') {
          qb = qb.orderBy('testEntity.' + field, 'DESC');
        } else {
          qb = qb.orderBy('testEntity.' + field, 'ASC');
        }
      qb = qb
        .skip((options.curPage - 1) * options.perPage)
        .take(options.perPage);
      objects = await qb.getManyAndCount();
      return {
        testEntities: objects[0],
        meta: {
          perPage: options.perPage,
          totalPages:
            options.perPage > objects[1]
              ? 1
              : Math.ceil(objects[1] / options.perPage),
          totalResults: objects[1],
          curPage: options.curPage
        }
      };
    } catch (error) {
      throw error;
    }
  }
}

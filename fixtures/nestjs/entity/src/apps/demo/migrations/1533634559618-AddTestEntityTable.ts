import { ContentType, Group, Permission } from '@demo/core-nestjs';
import { TestEntity } from '../entities/test-entity.entity';
import { plainToClass } from 'class-transformer';
import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class AddTestEntityTable1533634559618
  implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    // create table
    await queryRunner.createTable(
      new Table({
        name: 'test_entity',
        columns: [
          {
            name: 'id',
            type: 'integer',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment'
          },
          {
            name: 'name',
            type: 'varchar(100)',
            isNullable: false
          },

        ]
      }),
      true
    );
    // create/load content type
    const ctNewEntity = await queryRunner.manager
      .getRepository<ContentType>(ContentType)
      .save(
        plainToClass(ContentType, { name: 'test-entity', title: 'Test entity' })
      );
    const ctUser = await queryRunner.manager
      .getRepository<ContentType>(ContentType)
      .findOneOrFail({
        where: {
          name: 'user'
        }
      });
    // create permissions
    const readPermissions = await queryRunner.manager
      .getRepository<Permission>(Permission)
      .save(
        plainToClass(Permission, [
          {
            title: 'Can read test entity',
            name: 'read_test-entity',
            contentType: ctNewEntity
          },
          {
            title: 'Can read test entities frame',
            name: 'read_test-entities-frame',
            contentType: ctUser
          },
          {
            title: 'Can read test entities page',
            name: 'read_test-entities-page',
            contentType: ctUser
          }
        ])
      );
    const modifiPermissions = await queryRunner.manager
      .getRepository<Permission>(Permission)
      .save(
        plainToClass(Permission, [
          {
            title: 'Can add test entity',
            name: 'add_test-entity',
            contentType: ctNewEntity
          },
          {
            title: 'Can change test entity',
            name: 'change_test-entity',
            contentType: ctNewEntity
          },
          {
            title: 'Can delete test entity',
            name: 'delete_test-entity',
            contentType: ctNewEntity
          }
        ])
      );
    // add permissions to groups
    const gUser = await queryRunner.manager
      .getRepository<Group>(Group)
      .findOneOrFail({
        where: {
          name: 'user'
        },
        relations: ['permissions']
      });
    const gAdmin = await queryRunner.manager
      .getRepository<Group>(Group)
      .findOneOrFail({
        where: {
          name: 'admin'
        },
        relations: ['permissions']
      });
    gUser.permissions = [...gUser.permissions, ...readPermissions];
    gAdmin.permissions = [
      ...gAdmin.permissions,
      ...readPermissions,
      ...modifiPermissions
    ];
    await queryRunner.manager.getRepository<Group>(Group).save([gUser, gAdmin]);
  }

  public async down(queryRunner: QueryRunner): Promise<any> {}
}

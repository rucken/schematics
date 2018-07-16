import { IsNotEmpty } from 'class-validator';
import { IModel } from 'ngx-repository';
import { translate } from '@rucken/core';

export class TestEntity implements IModel {
  static strings = {
    id: translate('Id'),
    name: translate('Name'),

    createTitle: translate('Add new test entity'),
    viewTitle: translate('Test entity #{{id}}'),
    updateTitle: translate('Update test entity #{{id}}'),
    deleteTitle: translate('Delete test entity #{{id}}'),
    deleteMessage: translate('Do you really want to delete test entity?')
  };
  id: number = undefined;
  @IsNotEmpty()
  name: string;

  toString() {
    return this.name;
  }
}

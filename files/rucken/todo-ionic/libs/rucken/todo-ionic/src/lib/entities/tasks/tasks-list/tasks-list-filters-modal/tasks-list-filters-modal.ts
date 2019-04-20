import { serializeIdToObject, serializeModel, serializeObjectToId, translate } from '@rucken/core';
import { CustomUser, keyToSelectInput, SelectInput, selectInputToKey } from '@rucken/ionic';
import { Status } from '@rucken/todo-core';
import { Transform, Type } from 'class-transformer';
import { IModel } from 'ngx-repository';

export class TasksListFiltersModal implements IModel {
    static strings = {
        sortField: translate('Sort field'),
        sortType: translate('Sort type'),
        users: translate('Users'),
        statuses: translate('Statuses')
    };
    static sortFields: SelectInput[] = [
        { id: 'id', title: translate('Id') },
        { id: 'title', title: translate('Title') },
        { id: 'description', title: translate('Description') },
        { id: 'openAt', title: translate('Open date') },
        { id: 'closeAt', title: translate('Close date') },
        { id: 'createdUser', title: translate('Created user') },
        { id: 'updatedUser', title: translate('Updated user') }
    ];
    static sortTypes: SelectInput[] = [
        { id: 'asc', title: translate('Asc') },
        { id: 'desc', title: translate('Desc') }
    ];

    id = undefined;

    @Type(serializeModel(CustomUser))
    @Transform(
        serializeIdToObject(CustomUser, true),
        { toClassOnly: true, groups: ['manual'] }
    )
    @Transform(
        serializeObjectToId(CustomUser, true),
        { toPlainOnly: true, groups: ['manual'] }
    )
    users: CustomUser[] = undefined;

    @Type(serializeModel(Status))
    @Transform(
        serializeIdToObject(Status, true, 'name'),
        { toClassOnly: true, groups: ['manual'] }
    )
    @Transform(
        serializeObjectToId(Status, true, 'name'),
        { toPlainOnly: true, groups: ['manual'] }
    )
    statuses: Status[] = undefined;

    @Type(serializeModel(SelectInput))
    @Transform(
        keyToSelectInput({ items: TasksListFiltersModal.sortFields }),
        { toClassOnly: true, groups: ['manual'] }
    )
    @Transform(
        selectInputToKey({ items: TasksListFiltersModal.sortFields }),
        { toPlainOnly: true, groups: ['manual'] }
    )
    sortField: SelectInput = undefined;

    @Type(serializeModel(SelectInput))
    @Transform(
        keyToSelectInput({ items: TasksListFiltersModal.sortTypes }),
        { toClassOnly: true, groups: ['manual'] }
    )
    @Transform(
        selectInputToKey({ items: TasksListFiltersModal.sortTypes }),
        { toPlainOnly: true, groups: ['manual'] }
    )
    sortType: SelectInput = undefined;
}

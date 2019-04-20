import { serializeModel, transformDateToString, transformStringToDate, transformStringToObject, translate } from '@rucken/core';
import { CustomUser } from '@rucken/ionic';
import { Project } from '@rucken/todo-core';
import { Transform, Type } from 'class-transformer';

export class CustomProject extends Project {
    static strings = {
        ...Project.strings,
        completedTasksCount: translate('Completed tasks'),
        tasksCount: translate('Tasks'),
        createdUser: translate('Created user'),
        updatedUser: translate('Updated user')
    };
    completedTasksCount: number = undefined;
    tasksCount: number = undefined;

    @Transform(transformDateToString, { toClassOnly: true })
    @Transform(transformStringToDate, { toPlainOnly: true })
    createdAt: Date | string = undefined;

    @Transform(transformDateToString, { toClassOnly: true })
    @Transform(transformStringToDate, { toPlainOnly: true })
    updatedAt: Date | string = undefined;

    @Type(serializeModel(CustomUser))
    @Transform(transformStringToObject, { toPlainOnly: true })
    createdUser: CustomUser = undefined;

    @Type(serializeModel(CustomUser))
    @Transform(transformStringToObject, { toPlainOnly: true })
    updatedUser: CustomUser = undefined;
}

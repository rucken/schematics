import { serializeModel, transformDateToString, transformStringToDate, transformStringToObject } from '@rucken/core';
import { CustomUser } from '@rucken/ionic';
import { Task } from '@rucken/todo-core';
import { Transform, Type } from 'class-transformer';

export class CustomTask extends Task {

    @Transform(transformDateToString, { toClassOnly: true })
    @Transform(transformStringToDate, { toPlainOnly: true })
    openAt: Date | string = undefined;

    @Transform(transformDateToString, { toClassOnly: true })
    @Transform(transformStringToDate, { toPlainOnly: true })
    closeAt: Date | string = undefined;

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

    @Type(serializeModel(CustomUser))
    @Transform(transformStringToObject, { toPlainOnly: true })
    assignedUser: CustomUser = undefined;
}

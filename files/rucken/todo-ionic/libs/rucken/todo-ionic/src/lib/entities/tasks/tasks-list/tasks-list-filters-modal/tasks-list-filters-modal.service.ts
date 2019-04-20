import { Inject, Injectable } from '@angular/core';
import { IStorage, STORAGE_CONFIG_TOKEN } from '@rucken/core';
import { BindObservable } from 'bind-observable';
import { classToPlain, plainToClass } from 'class-transformer';
import { Observable } from 'rxjs';
import { TasksListFiltersModal } from './tasks-list-filters-modal';
import { DEFAULT_TASKS_LIST_FILTERS_MODAL_CONFIG, ITasksListFiltersModalConfig, TASKS_LIST_FILTERS_MODAL_CONFIG_TOKEN } from './tasks-list-filters-modal.config';

export function tasksListFiltersModalServiceInitializeApp(
  tasksListFiltersModalService: TasksListFiltersModalService
) {
  return () => tasksListFiltersModalService.initializeApp();
}

@Injectable()
export class TasksListFiltersModalService {
  @BindObservable()
  current: TasksListFiltersModal = undefined;
  current$: Observable<TasksListFiltersModal>;

  storageKeyName = 'tasks-list-filters-modal';

  constructor(
    @Inject(TASKS_LIST_FILTERS_MODAL_CONFIG_TOKEN) private _tasksListFiltersModalConfig: ITasksListFiltersModalConfig,
    @Inject(STORAGE_CONFIG_TOKEN) private _storage: IStorage,
  ) {
    this.current = this.getDefault();
  }
  getDefault() {
    return plainToClass(
      TasksListFiltersModal,
      {
        ...DEFAULT_TASKS_LIST_FILTERS_MODAL_CONFIG,
        ...this._tasksListFiltersModalConfig
      },
      {
        groups: ['manual']
      }
    );
  }
  getCurrent() {
    return this.current;
  }
  setCurrent(value: TasksListFiltersModal) {
    this._storage.setItem(
      this.storageKeyName, JSON.stringify(
        classToPlain(
          !value ? this.getDefault() : value,
          { groups: ['manual'] }
        )
      )
    ).then(_ =>
      this.current = value
    );
  }
  initCurrent() {
    return new Promise<TasksListFiltersModal>((resolve) => {
      this._storage.getItem(this.storageKeyName).then((data: string) => {
        if (data && data !== 'undefined') {
          try {
            resolve(
              plainToClass(
                TasksListFiltersModal,
                JSON.parse(data) as Object,
                { groups: ['manual'] }
              )
            );
          } catch (error) {
            resolve(this.getCurrent());
          }
        } else {
          resolve(this.getCurrent());
        }
      });
    });
  }
  initializeApp() {
    return new Promise((resolve) => {
      this.initCurrent().then(value => {
        this.setCurrent(value);
        resolve();
      });
    });
  }
}

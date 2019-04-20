import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { BasePromptFormModalComponent } from '@rucken/core';
import { BindIoInner } from 'ngx-bind-io';
import { CustomProject } from '../../../../models/custom-project';
import { TasksListFiltersModal } from './tasks-list-filters-modal';
import { TasksListFiltersModalService } from './tasks-list-filters-modal.service';
@BindIoInner()
@Component({
  selector: 'tasks-list-filters-modal',
  templateUrl: './tasks-list-filters-modal.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TasksListFiltersModalComponent extends
  BasePromptFormModalComponent<TasksListFiltersModal> implements OnInit {
  @Input()
  project: CustomProject = undefined;
  @Input()
  class: string = undefined;
  sortTypes = TasksListFiltersModal.sortTypes;
  sortFields = TasksListFiltersModal.sortFields;

  constructor(
    private _tasksListFiltersModalService: TasksListFiltersModalService
  ) {
    super();
    this.group(TasksListFiltersModal);
  }
  ngOnInit() {
    this.data = this._tasksListFiltersModalService.getCurrent();
    this.hideYes = true;
  }
  onYesClick(data?: any) {
    this._tasksListFiltersModalService.setCurrent(
      this.data
    );
    super.onYesClick(data);
  }
}

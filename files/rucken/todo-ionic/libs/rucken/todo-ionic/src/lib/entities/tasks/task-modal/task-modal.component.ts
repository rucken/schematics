import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { BasePromptFormModalComponent } from '@rucken/core';
import { BindIoInner } from 'ngx-bind-io';
import { CustomProject } from '../../../models/custom-project';
import { CustomTask } from '../../../models/custom-task';

@BindIoInner()
@Component({
  selector: 'task-modal',
  templateUrl: './task-modal.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TaskModalComponent extends BasePromptFormModalComponent<CustomTask> {
  @Input()
  class: string = undefined;
  @Input()
  project: CustomProject = undefined;

  constructor(
  ) {
    super();
    this.group(CustomTask);
  }
}

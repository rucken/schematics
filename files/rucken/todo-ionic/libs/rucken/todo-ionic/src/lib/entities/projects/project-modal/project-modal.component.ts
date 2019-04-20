import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { BasePromptFormModalComponent } from '@rucken/core';
import { BindIoInner } from 'ngx-bind-io';
import { CustomProject } from '../../../models/custom-project';

@BindIoInner()
@Component({
  selector: 'project-modal',
  templateUrl: './project-modal.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProjectModalComponent extends BasePromptFormModalComponent<CustomProject> {
  @Input()
  class: string = undefined;

  constructor(
  ) {
    super();
    this.group(CustomProject);
  }
}

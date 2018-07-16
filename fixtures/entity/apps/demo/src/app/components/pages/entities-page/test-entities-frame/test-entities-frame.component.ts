import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'test-entities-frame',
  templateUrl: './test-entities-frame.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TestEntitiesFrameComponent {
  public apiUrl = environment.apiUrl;
  constructor(
    public activatedRoute: ActivatedRoute
  ) {
  }
}

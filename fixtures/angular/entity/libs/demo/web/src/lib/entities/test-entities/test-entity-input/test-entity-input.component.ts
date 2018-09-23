import { Component, EventEmitter, OnInit, Output, Input, Inject, ChangeDetectionStrategy } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ErrorsExtractor, translate } from '@rucken/core';
import { TestEntity, TEST_ENTITIES_CONFIG_TOKEN } from '@demo/core';
import { BsModalService } from 'ngx-bootstrap/modal';
import { DynamicRepository, IRestProviderOptions } from 'ngx-repository';
import { MessageModalService, IBaseEntityModalOptions } from '@rucken/web';
import { TestEntitiesGridModalComponent } from '../test-entities-grid-modal/test-entities-grid-modal.component';
import { TestEntitiesGridComponent } from '../test-entities-grid/test-entities-grid.component';


@Component({
  selector: 'test-entity-input',
  templateUrl: './test-entity-input.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TestEntityInputComponent extends TestEntitiesGridComponent implements OnInit {

  @Output()
  select = new EventEmitter <TestEntity> ();
  @Input()
  modalAppendFromGrid: IBaseEntityModalOptions = {
    component: TestEntitiesGridModalComponent,
    initialState: {
      title: translate('Select test entity'),
      yesTitle: translate('Select')
    }
  };

  constructor(
    public modalService: BsModalService,
    protected errorsExtractor: ErrorsExtractor,
    protected translateService: TranslateService,
    protected dynamicRepository: DynamicRepository,
    protected messageModalService: MessageModalService,
    @Inject(TEST_ENTITIES_CONFIG_TOKEN) protected testEntitiesConfig: IRestProviderOptions<TestEntity>
  ) {
    super(
      modalService,
      errorsExtractor,
      translateService,
      dynamicRepository,
      messageModalService,
      testEntitiesConfig
    );
  }
  ngOnInit() {
    this.mockedItems = [];
    this.useMock({
      items: this.mockedItems,
      ...this.testEntitiesConfig
    });
    this.mockedItemsChange.subscribe(items =>
      this.onSelect(items[0])
    );
  }
  onSelect(item: TestEntity) {
    this.select.emit(item);
  }
}

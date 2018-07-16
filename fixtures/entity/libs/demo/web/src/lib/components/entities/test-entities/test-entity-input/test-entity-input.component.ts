import { Component, EventEmitter, OnInit, Output, ChangeDetectionStrategy } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ErrorsExtractor, translate } from '@rucken/core';
import { TestEntity, TestEntitiesConfig } from '@demo/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { DynamicRepository } from 'ngx-repository';
import { MessageModalService } from '@rucken/web';
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

  constructor(
    public modalService: BsModalService,
    protected errorsExtractor: ErrorsExtractor,
    protected translateService: TranslateService,
    protected dynamicRepository: DynamicRepository,
    protected testEntitiesConfig: TestEntitiesConfig,
    protected messageModalService: MessageModalService
  ) {
    super(
      modalService,
      errorsExtractor,
      translateService,
      dynamicRepository,
      testEntitiesConfig,
      messageModalService
    );
  }
  ngOnInit() {
    this.mockedItems = [];
    this.repository.useMock({
      items: this.mockedItems,
      ...this.testEntitiesConfig
    });
    this.mockedItemsChange.subscribe(items =>
      this.onSelect(items[0])
    );
  }
  createAppendFromGridModal(): BsModalRef {
    return this.modalService.show(TestEntitiesGridModalComponent, {
      class: 'modal-md',
      initialState: {
        title: translate('Select test entity'),
        yesTitle: translate('Select'),
        apiUrl: this.apiUrl
      }
    });
  }
  onSelect(item: TestEntity) {
    this.select.emit(item);
  }
}

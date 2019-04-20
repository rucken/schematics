import { Injectable } from '@nestjs/common';

@Injectable()
export class CoreNestjsService {
  hello() {
    return 'hello from lib';
  }
}

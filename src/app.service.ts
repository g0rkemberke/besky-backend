import { Injectable } from '@nestjs/common';
@Injectable()
export class AppService {
  getHello(): string { return 'BeSky API is running!'; }
}
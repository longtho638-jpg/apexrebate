import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return '🚀 Welcome to {{PROJECT_NAME}} - NestJS Agentic API from Relay Factory';
  }
}

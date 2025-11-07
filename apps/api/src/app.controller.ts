import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get('/health')
  health() { return { ok: true }; }

  @Get('/learn/topics')
  topics() {
    return [{ slug: 'getting-started', title: 'Getting Started', summary: 'Welcome!', tags: ['intro'] }];
  }
}

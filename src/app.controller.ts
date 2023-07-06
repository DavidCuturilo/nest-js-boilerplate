import { Controller, Get, Res } from '@nestjs/common';

@Controller()
export class AppController {
  @Get('')
  getHealth(@Res() res) {
    const healthcheck = {
      uptime: process.uptime(),
      message: 'OK',
      timestamp: Date.now(),
    };
    try {
      res.send(healthcheck);
    } catch (error) {
      healthcheck.message = error;
      res.status(503).send();
    }
  }
}

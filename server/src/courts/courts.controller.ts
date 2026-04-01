import { Controller, Get } from '@nestjs/common';
import { CourtsService } from './courts.service';

@Controller('courts')
export class CourtsController {
  constructor(private readonly courtsService: CourtsService) {}

  @Get()
  findAll() {
    return this.courtsService.findAll();
  }

  @Get('slots')
  findSlots() {
    return this.courtsService.findSlots();
  }
}

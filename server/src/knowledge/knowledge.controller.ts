import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { KnowledgeService } from './knowledge.service';

@Controller('knowledge')
export class KnowledgeController {
  constructor(private readonly knowledgeService: KnowledgeService) {}

  @Get()
  findAll() {
    return this.knowledgeService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.knowledgeService.findOne(id);
  }

  @Get('slug/:slug')
  findBySlug(@Param('slug') slug: string) {
    return this.knowledgeService.findBySlug(slug);
  }

  @Post()
  create(@Body() createKnowledgeDto: any) {
    return this.knowledgeService.create(createKnowledgeDto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateKnowledgeDto: any) {
    return this.knowledgeService.update(id, updateKnowledgeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.knowledgeService.remove(id);
  }
}

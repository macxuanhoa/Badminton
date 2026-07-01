import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class KnowledgeService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.knowledge.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  findOne(id: string) {
    return this.prisma.knowledge.findUnique({ where: { id } });
  }

  findBySlug(slug: string) {
    return this.prisma.knowledge.findUnique({ where: { slug } });
  }

  create(data: {
    slug: string;
    title: string;
    desc: string;
    img: string;
    readTime: string;
    level: string;
    sections: string;
  }) {
    return this.prisma.knowledge.create({ data });
  }

  update(
    id: string,
    data: {
      slug?: string;
      title?: string;
      desc?: string;
      img?: string;
      readTime?: string;
      level?: string;
      sections?: string;
    },
  ) {
    return this.prisma.knowledge.update({ where: { id }, data });
  }

  remove(id: string) {
    return this.prisma.knowledge.delete({ where: { id } });
  }
}

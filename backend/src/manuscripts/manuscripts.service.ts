import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class ManuscriptsService {
    constructor(private prisma: PrismaService) { }

    async create(data: Prisma.ManuscriptUncheckedCreateInput) {
        return this.prisma.manuscript.create({
            data,
        });
    }

    async findAll() {
        return this.prisma.manuscript.findMany({
            include: { author: { select: { name: true, email: true } } },
        });
    }

    async findAllPublished() {
        return this.prisma.manuscript.findMany({
            where: { status: 'PUBLISHED' },
            include: { author: { select: { name: true } } },
        });
    }

    async findOnePublished(id: string) {
        return this.prisma.manuscript.findUnique({
            where: { id, status: 'PUBLISHED' },
            include: { author: { select: { name: true } } },
        });
    }

    async findMyManuscripts(authorId: string) {
        return this.prisma.manuscript.findMany({
            where: { authorId },
        });
    }

    async findOne(id: string) {
        return this.prisma.manuscript.findUnique({
            where: { id },
            include: {
                author: { select: { name: true, email: true } },
                reviews: true
            },
        });
    }

    async update(id: string, data: Prisma.ManuscriptUpdateInput) {
        return this.prisma.manuscript.update({
            where: { id },
            data,
        });
    }
}

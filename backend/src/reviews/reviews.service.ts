import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class ReviewsService {
    constructor(private prisma: PrismaService) { }

    async assignReviewer(manuscriptId: string, reviewerId: string) {
        // Check if manuscript exists
        const manuscript = await this.prisma.manuscript.findUnique({ where: { id: manuscriptId } });
        if (!manuscript) throw new BadRequestException('Manuscript not found');

        await this.prisma.manuscript.update({
            where: { id: manuscriptId },
            data: { status: 'UNDER_REVIEW' },
        });

        // Create a review entry (Assignments are represented as pending reviews)
        return this.prisma.review.create({
            data: {
                manuscriptId,
                reviewerId,
                content: '',
                decision: 'PENDING',
            },
        });
    }

    async submitReview(reviewId: string, content: string, decision: string) {
        const review = await this.prisma.review.update({
            where: { id: reviewId },
            data: {
                content,
                decision, // e.g. ACCEPT, REJECT, REVISE
            },
        });

        const normalizedDecision = decision?.toUpperCase();
        const statusMap: Record<string, string> = {
            ACCEPT: 'ACCEPTED',
            REJECT: 'REJECTED',
            REVISE: 'REVISION_REQUESTED',
        };

        const nextStatus = statusMap[normalizedDecision];
        if (nextStatus) {
            await this.prisma.manuscript.update({
                where: { id: review.manuscriptId },
                data: { status: nextStatus },
            });
        }

        return review;
    }

    async findReviewsByReviewer(reviewerId: string) {
        return this.prisma.review.findMany({
            where: { reviewerId },
            include: { manuscript: true },
        });
    }

    async findReviewsForManuscript(manuscriptId: string) {
        return this.prisma.review.findMany({
            where: { manuscriptId },
            include: { reviewer: { select: { name: true, email: true } } },
        });
    }
}

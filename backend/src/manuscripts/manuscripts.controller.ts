import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { ManuscriptsService } from './manuscripts.service';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('manuscripts')
@ApiBearerAuth()
@Controller('manuscripts')
export class ManuscriptsController {
    constructor(private readonly manuscriptsService: ManuscriptsService) { }

    @Get('public')
    @ApiOperation({ summary: 'Get all published manuscripts (Public)' })
    findAllPublic() {
        return this.manuscriptsService.findAllPublished();
    }

    @Get('public/:id')
    @ApiOperation({ summary: 'Get published manuscript details (Public)' })
    findOnePublic(@Param('id') id: string) {
        return this.manuscriptsService.findOnePublished(id);
    }

    @UseGuards(AuthGuard('jwt'))
    @Post()
    @ApiOperation({ summary: 'Submit a new manuscript' })
    create(@Body() createManuscriptDto: any, @Request() req) {
        // Attach logged in user as author
        return this.manuscriptsService.create({
            ...createManuscriptDto,
            authorId: req.user.userId,
        });
    }

    @UseGuards(AuthGuard('jwt'))
    @Get()
    @ApiOperation({ summary: 'Get all manuscripts (Admin/Editor) or my manuscripts' })
    findAll(@Request() req) {
        // Simplified: If admin return all, else return mine
        // For now returning all for demo purposes, or can filter
        return this.manuscriptsService.findAll();
    }

    @UseGuards(AuthGuard('jwt'))
    @Get('my')
    @ApiOperation({ summary: 'Get my manuscripts' })
    findMine(@Request() req) {
        return this.manuscriptsService.findMyManuscripts(req.user.userId);
    }

    @UseGuards(AuthGuard('jwt'))
    @Patch(':id')
    @ApiOperation({ summary: 'Update a manuscript (Editor)' })
    update(@Param('id') id: string, @Body() updateManuscriptDto: any) {
        return this.manuscriptsService.update(id, updateManuscriptDto);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get manuscript details' })
    findOne(@Param('id') id: string) {
        return this.manuscriptsService.findOne(id);
    }
}

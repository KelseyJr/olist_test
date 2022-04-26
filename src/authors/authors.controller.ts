import {
    Controller,
    Post,
    Body,
    HttpCode,
    HttpStatus,
    UseInterceptors,
    UploadedFile,
} from '@nestjs/common';
import { AuthorsService } from './authors.service';
import { CreateAuthorDto } from './dto/create-author.dto';
import { Author } from '@prisma/client';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('authors')
export class AuthorsController {
    constructor(private readonly authorsService: AuthorsService) {}

    @HttpCode(HttpStatus.CREATED)
    @Post()
    async create(@Body() createAuthorDto: CreateAuthorDto): Promise<Author> {
        return this.authorsService.create(createAuthorDto);
    }

    @HttpCode(HttpStatus.CREATED)
    @UseInterceptors(FileInterceptor('file'))
    @Post('file')
    async createMany(@UploadedFile() file: Express.Multer.File) {
        const { count } = await this.authorsService.createMany(file);

        return { authorsCreated: count };
    }
}

import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAuthorDto } from './dto/create-author.dto';
import { Author } from '@prisma/client';
import { createReadStream } from 'fs';
import { parse } from 'csv-parse';

@Injectable()
export class AuthorsService {
    constructor(private readonly prisma: PrismaService) {}

    async create({ name }: CreateAuthorDto): Promise<Author> {
        const findAuthor = this.prisma.author.findUnique({ where: { name } });

        if (findAuthor) {
            throw new HttpException(
                'Author already exists',
                HttpStatus.BAD_REQUEST,
            );
        }

        return this.prisma.author.create({ data: { name } });
    }

    async createMany(file: Express.Multer.File): Promise<{ count: number }> {
        const parser = createReadStream(file.buffer, 'utf-8').pipe(parse());
        const data = [];

        for await (const record of parser) {
            console.log(record);
            data.push({ name: record });
        }

        return this.prisma.author.createMany({ data, skipDuplicates: true });
    }
}

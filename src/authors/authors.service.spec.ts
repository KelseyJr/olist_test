import { HttpException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { AuthorsService } from './authors.service';
import { CreateAuthorDto } from './dto';

let authors = [];
const createAuthor = (params: { data: { name: string } }) => {
    const data = {
        id: authors.length + 1,
        name: params.data.name,
    };
    authors.push(data);

    return data;
};

const findAuthorByName = (params: { where: { name: string } }) =>
    authors.find((author) => author.name === params.where.name);

const cleanDatabase = () => {
    authors = [];
};

const db = {
    author: {
        findUnique: jest.fn().mockImplementation(findAuthorByName),
        create: jest.fn().mockImplementation(createAuthor),
        createMany: jest.fn().mockResolvedValue({ count: 3 }),
    },
};

describe('AuthorsService', () => {
    let service: AuthorsService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthorsService,
                {
                    provide: PrismaService,
                    useValue: db,
                },
            ],
        }).compile();

        service = module.get<AuthorsService>(AuthorsService);
        cleanDatabase();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('Create authors', () => {
        it('should be able to create author', async () => {
            const name = 'Kelsey';
            const response = await service.create({ name });

            expect(response.id).toBe(1);
            expect(response.name).toBe(name);
        });

        it('should not be able to create author when its already exists', async () => {
            try {
                await service.create({ name: 'Kelsey' });
                await service.create({ name: 'Kelsey' });
            } catch (error) {
                expect(error).toBeInstanceOf(HttpException);
                expect(error.message).toBe('Author already exists');
            }
        });

        it('should be able to create multiple authors throught csv file', async () => {
            const file = {
                buffer: Buffer.from('Kelsey\r\nTeste\r\nPedro'),
                originalname: 'test',
                mimetype: 'mimetype',
                path: 'path',
                destination: 'destination',
                fieldname: 'fieldname',
                filename: 'filename',
                size: 10,
            } as Express.Multer.File;

            const response = await service.createMany(file);

            expect(response.count).toBe(3);
        });
    });
});

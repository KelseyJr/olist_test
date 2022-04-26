import { HttpException, HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { createReadStream } from 'fs';
import { AuthorsController } from './authors.controller';
import { AuthorsService } from './authors.service';
import { CreateAuthorDto } from './dto';

let authors = [];
const createAuthor = ({ name }: CreateAuthorDto) => {
    const data = {
        id: authors.length + 1,
        name,
    };
    authors.push(data);

    return data;
};

const cleanDatabase = () => {
    authors = [];
};

describe('AuthorsController', () => {
    let controller: AuthorsController;
    let service: AuthorsService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [AuthorsController],
            providers: [
                {
                    provide: AuthorsService,
                    useValue: {
                        create: jest.fn().mockImplementation(createAuthor),
                        createMany: jest.fn().mockResolvedValue({ count: 3 }),
                    },
                },
            ],
        }).compile();

        controller = module.get<AuthorsController>(AuthorsController);
        service = module.get<AuthorsService>(AuthorsService);
        cleanDatabase();
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('Create authors', () => {
        it('should be able to create author', async () => {
            const name = 'Kelsey';
            const response = await controller.create({ name });

            expect(response.id).toBe(1);
            expect(response.name).toBe(name);
        });

        it('should not be able to create author when its already exists', async () => {
            jest.spyOn(service, 'create').mockRejectedValueOnce(
                new HttpException(
                    'Author already exists',
                    HttpStatus.BAD_REQUEST,
                ),
            );

            try {
                await controller.create({ name: 'Kelsey' });
            } catch (error) {
                expect(error).toBeInstanceOf(HttpException);
                expect(error.message).toBe('Author already exists');
            }
        });

        it('should be able to create multiple authors throught csv file', async () => {
            const file = {
                buffer: Buffer.from('test'),
                originalname: 'test',
                mimetype: 'mimetype',
                path: 'path',
                destination: 'destination',
                fieldname: 'fieldname',
                filename: 'filename',
                size: 10,
            } as Express.Multer.File;
            const response = await controller.createMany(file);

            expect(response.authorsCreated).toBe(3);
        });
    });
});

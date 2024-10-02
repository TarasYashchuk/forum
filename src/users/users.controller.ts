import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UserService } from './users.service';
import { Prisma, User } from '@prisma/client';
import { UserDto } from './dto/user-responce.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Roles } from 'src/auth/roles.decorator';
import { RolesGuard } from 'src/auth/roles.guard';
import { UserIdDto } from './dto/user-id.dto';
import { UserSearchDto } from './dto/user-search.dto';
import { plainToClass, plainToInstance } from 'class-transformer';
import * as bcrypt from 'bcryptjs';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { RequestWithUser } from 'src/common/request-with-user.interface';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseInterceptors(
    FileInterceptor('avatar', {
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: (req, file, callback) => {
        if (!file.mimetype.match(/^image\/(jpeg|jpg|png)$/)) {
          return callback(
            new BadRequestException('Unsupported file type'),
            false,
          );
        }
        callback(null, true);
      },
    }),
  )
  @Post('register')
  async register(
    @Body() createUserDto: CreateUserDto,
    @UploadedFile() avatar?: Express.Multer.File,
  ): Promise<UserDto> {
    if (!avatar) {
      throw new BadRequestException('No file provided');
    }
    const avatarBuffer = avatar ? avatar.buffer : null;
    const user = await this.userService.createUser(createUserDto, avatarBuffer);
    return plainToInstance(UserDto, user, { excludeExtraneousValues: true });
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(1)
  @Get(':id')
  @UsePipes(new ValidationPipe({ transform: true }))
  async getUserById(@Param() params: UserIdDto): Promise<UserDto> {
    return this.userService.getUserById(params.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(1)
  @Get()
  async getAllUsers(): Promise<UserDto[]> {
    return this.userService.getAllUsers();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(1)
  @Put(':id')
  @UsePipes(new ValidationPipe({ transform: true }))
  async updateUser(
    @Param() params: UserIdDto,
    @Body() UserDto: Prisma.UserUpdateInput,
  ): Promise<UserDto> {
    return this.userService.updateUser(params.id, UserDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(1)
  @Delete(':id')
  @UsePipes(new ValidationPipe({ transform: true }))
  async deleteUser(@Param() params: UserIdDto): Promise<UserDto> {
    return this.userService.deleteUser(params.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(1)
  @Get('email/:email')
  async getUserByEmail(@Param('email') email: string): Promise<UserDto> {
    return this.userService.getUserByEmail(email);
  }

  @Get('username/:username')
  async findByUsername(@Param('username') username: string): Promise<UserDto> {
    const user = await this.userService.findByUsername(username);
    if (!user) {
      throw new NotFoundException(`User with username ${username} not found`);
    }
    return user;
  }

  @UseGuards(JwtAuthGuard)
  @Roles(1, 2)
  @Patch('update-avatar')
  @UseInterceptors(
    FileInterceptor('avatar', {
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: (req, file, callback) => {
        if (!file.mimetype.match(/^image\/(jpeg|jpg|png)$/)) {
          return callback(
            new BadRequestException('Unsupported file type'),
            false,
          );
        }
        callback(null, true);
      },
    }),
  )
  async updateAvatar(
    @UploadedFile() avatar: Express.Multer.File,
    @Req() req: RequestWithUser,
  ): Promise<UserDto> {
    if (!avatar) {
      throw new BadRequestException('No file provided');
    }
    const userId = req.user.id;
    return this.userService.updateAvatar(userId, avatar.buffer);
  }
}

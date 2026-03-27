import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  Delete,
  Param,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { MediaService } from './media.service';

@Controller('media')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MediaController {
  constructor(private mediaService: MediaService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @Roles('PATIENT', 'DOCTOR', 'ADMIN')
  uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Query('ownerId') ownerId: string,
    @Query('ownerType') ownerType: string,
  ) {
    return this.mediaService.uploadFile(file, ownerId, ownerType);
  }

  @Delete(':publicId')
  @Roles('PATIENT', 'DOCTOR', 'ADMIN')
  deleteFile(@Param('publicId') publicId: string) {
    return this.mediaService.deleteMedia(publicId);
  }

  @Get('owner/:ownerId')
  @Roles('PATIENT', 'DOCTOR', 'ADMIN')
  getMedia(@Param('ownerId') ownerId: string) {
    return this.mediaService.getMediaByOwner(ownerId);
  }
}

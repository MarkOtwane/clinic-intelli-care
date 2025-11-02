import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  Delete,
  Param,
  Get,
  Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { MediaService } from './media.service';

@Controller('media')
export class MediaController {
  constructor(private mediaService: MediaService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Query('ownerId') ownerId: string,
    @Query('ownerType') ownerType: string,
  ) {
    return this.mediaService.uploadFile(file, ownerId, ownerType);
  }

  @Delete(':publicId')
  deleteFile(@Param('publicId') publicId: string) {
    return this.mediaService.deleteMedia(publicId);
  }

  @Get('owner/:ownerId')
  getMedia(@Param('ownerId') ownerId: string) {
    return this.mediaService.getMediaByOwner(ownerId);
  }
}

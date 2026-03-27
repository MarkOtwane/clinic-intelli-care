import {
  BadRequestException,
  Controller,
  Delete,
  FileValidator,
  Get,
  HttpStatus,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/roles.decorator';
import {
  ALLOWED_MEDIA_MIME_TYPES,
  MAX_MEDIA_FILE_SIZE_BYTES,
} from './dtos/upload-media.dto';
import { MediaService } from './media.service';

class AllowedMimeTypeValidator extends FileValidator<{
  allowedMimeTypes: readonly string[];
}> {
  isValid(file?: Express.Multer.File): boolean {
    if (!file) return false;
    return this.validationOptions.allowedMimeTypes.includes(file.mimetype);
  }

  buildErrorMessage(): string {
    return `Invalid file type. Allowed types: ${this.validationOptions.allowedMimeTypes.join(', ')}`;
  }
}

@Controller('media')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MediaController {
  constructor(private mediaService: MediaService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @Roles('PATIENT', 'DOCTOR', 'ADMIN')
  uploadFile(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({
            maxSize: MAX_MEDIA_FILE_SIZE_BYTES,
            message: 'File size must not exceed 5MB',
          }),
          new AllowedMimeTypeValidator({
            allowedMimeTypes: ALLOWED_MEDIA_MIME_TYPES,
          }),
        ],
        fileIsRequired: true,
        errorHttpStatusCode: HttpStatus.BAD_REQUEST,
        exceptionFactory: (error) => new BadRequestException(error),
      }),
    )
    file: Express.Multer.File,
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

import { Controller, Get, Header, StreamableFile } from '@nestjs/common';
import { createReadStream } from 'fs';
import { join } from 'path';

@Controller('quiz-icon')
export class QuizIconController {
  constructor() {}

  @Get()
  @Header('Content-Type', 'image/svg+xml')
  @Header('Content-Disposition', 'attachment; filename="icon.svg"')
  getStaticFile(): StreamableFile {
    const file = createReadStream(join(process.cwd(), 'src/data/images/1054940_video camera_icon.svg'));
    return new StreamableFile(file);
  }
}

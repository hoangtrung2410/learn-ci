import { IsArray, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AnalyzeLogsDto {
    @ApiProperty({
        description: 'Array of log messages to analyze',
        example: ['Build failed at step 3', 'Error: Module not found'],
    })
    @IsArray()
    @IsString({ each: true })
    logs: string[];
}

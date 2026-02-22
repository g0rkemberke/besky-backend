import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConciergeController } from './concierge.controller';
import { ConciergeRequest, ConciergeRequestSchema } from './concierge.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: ConciergeRequest.name, schema: ConciergeRequestSchema }])
  ],
  controllers: [ConciergeController],
})
export class ConciergeModule {}
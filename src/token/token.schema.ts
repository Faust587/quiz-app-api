import { HydratedDocument, Types } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { User } from '../user/user.schema';

export type RefreshTokenDocument = HydratedDocument<RefreshToken>;

@Schema()
export class RefreshToken {
  @Prop()
  id: string;

  @Prop({
    type: Types.ObjectId,
    ref: User.name,
    required: true
  })
  user: User;

  @Prop({ required: true })
  token: string;
}

export const RefreshTokenSchema = SchemaFactory.createForClass(RefreshToken);

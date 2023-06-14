import { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema({
  versionKey: false,
  toJSON: {
    transform: (doc, ret) => {
      ret.id = ret._id;
      delete ret._id;
      delete ret.password;
      delete ret.salt;
    },
  },
  toObject: {
    transform: (doc, ret) => {
      ret.id = ret._id.toHexString();
      delete ret._id;
    },
  },
})
export class User {
  @Prop({ required: true })
  username: string;

  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true })
  salt: string;

  @Prop({ default: false })
  activated: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);

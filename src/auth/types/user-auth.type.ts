import { TUser } from '../../user/user.type';
import { TTokensPair } from '../../token/types/tokens-pair.type';

export type TUserAuth = {
  user: TUser;
  accessToken: string;
  refreshToken: string;
}

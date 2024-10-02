import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { AuthService } from './auth.service';
import { OAuthUserDto } from 'src/users/dto/oauth-user.dto';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private authService: AuthService) {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_REDIRECT_URI,
      scope: ['email', 'profile'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    try {
      const { name, emails, photos } = profile;

      const oauthUser: OAuthUserDto = {
        email: emails[0].value,
        firstName: name?.givenName || '',
        lastName: name?.familyName || '',
        avatarUrl: photos?.[0]?.value || '',
      };

      const { user, token } =
        await this.authService.validateOAuthUser(oauthUser);

      done(null, { user, token });
    } catch (error) {
      done(error, false);
    }
  }
}

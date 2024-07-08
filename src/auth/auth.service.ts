import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CognitoIdentityServiceProvider, config as AWSConfig } from 'aws-sdk';
import {
  SignUpDto,
  ConfirmSignUpDto,
  LoginDto,
  ForgotPasswordDto,
  ConfirmForgotPasswordDto,
  ChangePasswordDto,
} from './dto';

@Injectable()
export class AuthService {
  private cognito: CognitoIdentityServiceProvider;
  private poolData: { UserPoolId: string; ClientId: string };

  constructor(private configService: ConfigService) {
    const region = this.configService.get<string>('AWS_REGION');

    if (!region) {
      throw new Error('Missing AWS_REGION in configuration');
    }

    AWSConfig.update({ region });

    this.cognito = new CognitoIdentityServiceProvider();
    this.poolData = {
      UserPoolId: this.configService.get<string>('COGNITO_USER_POOL_ID'),
      ClientId: this.configService.get<string>('COGNITO_CLIENT_ID'),
    };
  }

  async signUp(signUpDto: SignUpDto) {
    const params = {
      ClientId: this.poolData.ClientId,
      Username: signUpDto.username,
      Password: signUpDto.password,
      UserAttributes: [
        {
          Name: 'email',
          Value: signUpDto.email,
        },
        {
          Name: 'phone_number',
          Value: signUpDto.phoneNumber || '',
        },
        // Add other required attributes as needed
      ],
    };

    // Only include preferred_username for confirmed accounts
    if (signUpDto.isConfirmed) {
      params.UserAttributes.push({
        Name: 'preferred_username',
        Value: signUpDto.username,
      });
    }

    return this.cognito.signUp(params).promise();
  }


  async confirmSignUp(confirmSignUpDto: ConfirmSignUpDto) {
    const params = {
      ClientId: this.poolData.ClientId,
      Username: confirmSignUpDto.username,
      ConfirmationCode: confirmSignUpDto.confirmationCode,
    };

    return this.cognito.confirmSignUp(params).promise();
  }

  async login(loginDto: LoginDto) {
    const params = {
      AuthFlow: 'USER_PASSWORD_AUTH',
      ClientId: this.poolData.ClientId,
      AuthParameters: {
        USERNAME: loginDto.username,
        PASSWORD: loginDto.password,
      },
    };

    return this.cognito.initiateAuth(params).promise();
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const params = {
      ClientId: this.poolData.ClientId,
      Username: forgotPasswordDto.username,
    };

    return this.cognito.forgotPassword(params).promise();
  }

  async confirmForgotPassword(confirmForgotPasswordDto: ConfirmForgotPasswordDto) {
    const params = {
      ClientId: this.poolData.ClientId,
      Username: confirmForgotPasswordDto.username,
      ConfirmationCode: confirmForgotPasswordDto.confirmationCode,
      Password: confirmForgotPasswordDto.newPassword,
    };

    return this.cognito.confirmForgotPassword(params).promise();
  }

  async changePassword(changePasswordDto: ChangePasswordDto) {
    const params = {
      AccessToken: changePasswordDto.accessToken,
      PreviousPassword: changePasswordDto.previousPassword,
      ProposedPassword: changePasswordDto.proposedPassword,
    };

    return this.cognito.changePassword(params).promise();
  }
}

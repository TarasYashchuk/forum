import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import axios from 'axios';
import * as FormData from 'form-data';

@Injectable()
export class ImgurService {
  private clientId = process.env.IMGUR_CLIENT_ID;

  async uploadImage(image: Buffer): Promise<string> {
    const formData = new FormData();
    formData.append('image', image.toString('base64'));
    try {
      const response = await axios.post(
        'https://api.imgur.com/3/image',
        formData,
        {
          headers: {
            Authorization: `Client-ID ${this.clientId}`,
            ...formData.getHeaders(),
          },
        },
      );

      return response.data.data.link;
    } catch (error) {
      throw new HttpException(
        'Failed to upload image to Imgur',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}

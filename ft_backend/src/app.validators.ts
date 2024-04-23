import { FileValidator } from '@nestjs/common';
import { Express } from 'express'

import fileType from 'file-type-mime';

export interface CustomUploadTypeValidatorOptions {
  fileType: string[];
}

export class CustomUploadFileTypeValidator extends FileValidator {
  private _allowedMimeTypes: string[];

  constructor(protected readonly validationOptions: CustomUploadTypeValidatorOptions) {
    super(validationOptions);
    this._allowedMimeTypes = this.validationOptions.fileType;
  }

  public isValid(file?: Express.Multer.File): boolean {
    return  true
}
  public buildErrorMessage(): string {
    return `Upload not allowed. Upload only files of type: ${this._allowedMimeTypes.join(
      ', ',
    )}`;
  }
}
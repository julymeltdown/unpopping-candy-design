export type PopcandyErrorCode =
  | 'POPCANDY_PROJECT_NOT_FOUND'
  | 'POPCANDY_DEPENDENCIES_NOT_INSTALLED'
  | 'POPCANDY_LOCKFILE_UNSUPPORTED'
  | 'POPCANDY_PNP_UNSUPPORTED'
  | 'POPCANDY_VERSION_SET_MIXED'
  | 'POPCANDY_CATALOG_INCOMPATIBLE';

export class PopcandyProjectError extends Error {
  override readonly name = 'PopcandyProjectError';
  readonly code: PopcandyErrorCode;

  constructor(
    code: PopcandyErrorCode,
    message: string,
  ) {
    super(message);
    this.code = code;
  }
}

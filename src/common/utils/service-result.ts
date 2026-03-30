export class ServiceResult<T> {
  constructor(
    public readonly data: T,
    public readonly message: string = 'Thao tác thành công',
  ) {}

  static success<T>(data: T, message?: string): ServiceResult<T> {
    return new ServiceResult(data, message);
  }
}

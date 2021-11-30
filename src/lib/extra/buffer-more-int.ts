/**
 * Extract from [buffer-more-ints]
 * Detail See https://www.npmjs.com/package/buffer-more-ints
 */
export class BufferMoreInt {

  private static readonly SHIFT_LEFT_32: number = (1 << 16) * (1 << 16);
  private static readonly SHIFT_RIGHT_32: number = 1 / BufferMoreInt.SHIFT_LEFT_32;

  public static writeInt64BE(buf: Buffer, val: number, offset: number): void {
    val = this.check_value(val, -0x800000000000000000, 0x7fffffffffffffff);
    this.check_bounds(buf, offset, 8);

    if (val < 0x8000000000000000) {
      buf.writeInt32BE(Math.floor(val * BufferMoreInt.SHIFT_RIGHT_32), offset);
      buf.writeInt32BE(val & -1, offset + 4);
    } else {
      this.writeSame(buf, offset);
    }
  }

  public static writeUInt64BE(buf: Buffer, val: number, offset: number): void {
    val = this.check_value(val, 0, 0xffffffffffffffff);
    this.check_bounds(buf, offset, 8);

    if (val < 0x10000000000000000) {
      buf.writeUInt32BE(Math.floor(val * BufferMoreInt.SHIFT_RIGHT_32), offset);
      buf.writeInt32BE(val & -1, offset + 4);
    } else {
      this.writeSame(buf, offset);
    }
  }

  private static writeSame(buffer: Buffer, offset: number): void {
    // Special case because 2^64-1 gets rounded up to 2^64
    buffer[offset] = 0xff;
    buffer[offset + 1] = 0xff;
    buffer[offset + 2] = 0xff;
    buffer[offset + 3] = 0xff;
    buffer[offset + 4] = 0xff;
    buffer[offset + 5] = 0xff;
    buffer[offset + 6] = 0xff;
    buffer[offset + 7] = 0xff;
  }

  private static check_value(val: number, min: number, max: number) {
    val = +val;
    if (val < min || val > max || Math.floor(val) !== val) {
      throw new TypeError('"value" argument is out of bounds');
    }
    return val;
  }

  private static check_bounds(buf: Buffer, offset: number, len: number) {
    if (offset < 0 || offset + len > buf.length) {
      throw new RangeError('Index out of range');
    }
  }

}

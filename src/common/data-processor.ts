import { minify } from 'html-minifier';

export class DataProcessor {
  public data = '';
  constructor(private mimeType = 'text/html') {}

  /**
   * Replace Pattern with specified string
   * @param target Regex to replace
   * @param value Replace target to
   */
  public findAndReplace(target: RegExp, value: string): void {
    const { mimeType } = this;

    if (mimeType.includes('text/html') || mimeType.includes('text/css'))
      this.data = this.data.replace(target, value);
  }

  /**
   * Minify based on mimeType
   */
  public minify(): void {
    const { mimeType } = this;

    if (mimeType.includes('text/html') || mimeType.includes('text/css'))
      this.data = minify(this.data, {
        collapseWhitespace: true,
        minifyCSS: true,
        minifyJS: true,
        removeComments: true,
      });
  }
}

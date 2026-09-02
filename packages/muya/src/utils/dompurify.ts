import type { Config } from 'dompurify';
import DOMPurify from 'dompurify';

const purifier = DOMPurify();
const { isValidAttribute } = purifier;

function sanitize(dirty: string | Node, config?: Config): string {
    return purifier.sanitize(dirty, config);
}

export { Config, isValidAttribute };

export default sanitize;
